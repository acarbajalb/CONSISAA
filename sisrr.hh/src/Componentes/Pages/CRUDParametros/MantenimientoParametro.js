//Mantenimiento Parametros
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./mantenimientoParametro.css"; 
import CrearParametro from "./CrearParametro.js";
import EditarParametro from "./EditarParametro.js";
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash,faDownload } from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
// Importacion de store.
import useStore from '../store';

const MantenimientoParametro = () => {
  
  const [parametroLista, setLista] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [indicePrimerParametro, setindicePrimerParametro] = useState("");
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  
  const [parametroSeleccionado, setParametroSeleccionado] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  


  const parametroPorPagina = 5;

  const traerParametros = async () => {
    try {
      setCargando(true);
      const response = await axios.get("http://localhost:3001/traerParametros");
      setLista(response.data);
    } catch (error) {
      console.error("Error al obtener los parametros:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al obtener los parametros. Por favor, intenta de nuevo.",
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    traerParametros();
  }, []);


  const listaFiltrada = parametroLista.filter((parametro) => {
    return (
       parametro.Parametro.toLowerCase().includes(busqueda.toLowerCase())

    );
  });
  
  

  const indiceUltimoParametro = paginaActual * parametroPorPagina;
  const parametroEnPagina = listaFiltrada.slice(indicePrimerParametro, indiceUltimoParametro );
  const numeroTotalPaginas = Math.ceil(listaFiltrada.length / parametroPorPagina);

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
  };

  const abrirModal = () => {
    setMostrarModalNuevo(true);
  };

  const cerrarModal = () => {
    setMostrarModalNuevo(false);
  };

  const abrirModalEdicion = (Id_parametro) => {
    setParametroSeleccionado(Id_parametro);
    setMostrarModalEdicion(true);
  };

  const cerrarModalEdicion = () => {
    setMostrarModalEdicion(false);
  };
 

  return (
    <div data-maintenance-parametro="true" className="maintenance-container">
      {cargando ? (
        <div className="loading">Cargando...</div>
      ) : (
        <>
          <section className="formulario">
            <h1 className="mr-5 ml-5 mt-5">MANTENIMIENTO PARAMETRO</h1>
            <p></p>
            <div className="form-buttons">
              <div className="search-container">
                <i className='bx bx-search icon'></i>
                <input
                  type="text"
                  placeholder="Buscar por nombre de parametro"
                  className="search-input"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              <button className="submit" onClick={abrirModal}>NUEVO</button>
              <button className="submit"> Generar Informe</button>
            </div>
            <section className="tabla-parametro">
              <table className="table table-hover table-bordered" id="tbl_ms_parametro">
                <thead>
                  <tr>
                  <th>Parametro</th>
                  <th>Valor</th>
                  <th>Fecha creacion</th>
                  <th>Creado por</th>
                  <th>Fecha de modificacion</th>
                  <th>Modificado por </th>
                  <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {parametroEnPagina.length > 0 ? (
                    parametroEnPagina.map((val, key) => {
                      return (
                        <tr key={key}>
                        <th>{val.Parametro}</th>
                        <th>{val.Valor}</th>
                   
                        <th>{new Date(val.Fecha_creacion).toLocaleString(
                              "es-ES",
                              {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              }
                            )}</th>
                        <th>{val.Creado_por}</th>
                        <th>{new Date(val.Fecha_modificacion).toLocaleString(
                              "es-ES",
                              {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              }
                            )}</th>
                        <th>{val.Modificado_por}</th>                       
                          <td>
                            <div className="button-container">
                              <button className="submit icon-button" onClick={() => abrirModalEdicion(val.Id_parametro)}>
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
            {/* Paginador */}
            <div className="paginador">
              {Array.from({ length: numeroTotalPaginas }).map((_, index) => (
                <button  key={index} onClick={() => cambiarPagina(index + 1)}>{index + 1}</button>
                ))}
              </div>
              
            </section>
            {/*Abir modal nuevo*/}
            {mostrarModalNuevo && (
              <div className="modal-container">
                <div className="modal-content">
                  <span className="close-button" onClick={cerrarModal}>&times;</span>
                  <CrearParametro onClose={() => { cerrarModal(); traerParametros(); }} />
                </div>
              </div>
            )}
  
  {mostrarModalEdicion && (
              <div className="modal-container">
                <div className="modal-content">
                  <span className="close-button" onClick={cerrarModalEdicion}>&times;</span>
                  <EditarParametro onClose={() => { cerrarModalEdicion(); traerParametros(); }}Id_parametro={parametroSeleccionado}/>

              
                </div>
              </div>
            )}
  

          </>



        )}
      </div>
    );
  };
  
  export default MantenimientoParametro;


