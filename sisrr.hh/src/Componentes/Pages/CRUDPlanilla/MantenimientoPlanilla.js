import React, { useState, useEffect } from "react";
import axios from "axios";
import "./mantenimientoPlanilla.css";
import EditarPlanilla from "./EditarPlanilla.js";
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

const MantenimientoPlanilla = () => {
  const [planillas, setPlanillas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPlanilla, setSelectedPlanilla] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const planillasPerPage = 5;

  useEffect(() => {
    const fetchPlanillas = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:3001/traerPlanillas");
        setPlanillas(response.data);
      } catch (error) {
        console.error("Error al obtener las planillas:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un error al obtener las planillas. Por favor, intenta de nuevo.',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPlanillas();
  }, []);

  const filteredPlanillas = planillas.filter((planilla) => {
    return (
      (planilla.Id_Planilla && planilla.Id_Planilla.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
      (planilla.Id_Empleado && planilla.Id_Empleado.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
      (planilla.Mes && planilla.Mes.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
      (planilla.año && planilla.año.toString().toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const indexOfLastPlanilla = currentPage * planillasPerPage;
  const indexOfFirstPlanilla = indexOfLastPlanilla - planillasPerPage;
  const currentPlanillas = filteredPlanillas.slice(indexOfFirstPlanilla, indexOfLastPlanilla);
  const totalPages = Math.ceil(filteredPlanillas.length / planillasPerPage);

  const changePage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const openEditModal = (planillaId) => {
    setSelectedPlanilla(planillaId);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
  };

  return (
    <div data-maintenance-planilla="true" className="maintenance-container-planilla">
      {loading ? (
        <div className="loading">Cargando...</div>
      ) : (
        <>
          <section className="formulario">
            <h1 className="mr-5 ml-5 mt-5">HISTORIAL DE PLANILLAS</h1>
            <p></p>
            <div className="form-buttons">
              <div className="search-container">
                <i className='bx bx-search icon'></i>
                <input
                  type="text"
                  placeholder="Buscar por Id de Planilla, Id de Empleado, Mes, Año"
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <section className="tabla-planillas">
              <table className="table table-hover table-bordered" id="tblPlanillas">
                <thead>
                  <tr>
                    <th>Id de Planilla</th>
                    <th>Id de Empleado</th>
                    <th>Mes</th>
                    <th>Año</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPlanillas.length > 0 ? (
                    currentPlanillas.map((planilla, index) => {
                      return (
                        <tr key={index}>
                          <td>{planilla.Id_Planilla}</td>
                          <td>{planilla.Id_Empleado}</td>
                          <td>{planilla.Mes}</td>
                          <td>{planilla.año}</td>
                          <td>
                            <div className="button-container">
                              <button className="submit icon-button" onClick={() => openEditModal(planilla.Id_Planilla)}>
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr key="no-results">
                      <td colSpan="5">
                        <p className="text-center">No se encontraron resultados</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
            <div className="paginador">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button key={index} onClick={() => changePage(index + 1)}>{index + 1}</button>
              ))}
            </div>
          </section>
          {/* Modal para el formulario de EditarPlanilla */}
          {showEditModal && (
            <div className="modal-container">
              <div className="modal-content">
                <span className="close-button" onClick={closeEditModal}>&times;</span>
                <EditarPlanilla onClose={closeEditModal} Id_Planilla={selectedPlanilla} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MantenimientoPlanilla;
