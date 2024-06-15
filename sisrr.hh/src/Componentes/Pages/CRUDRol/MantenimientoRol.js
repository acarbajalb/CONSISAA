import React, { useState, useEffect } from "react";
import axios from "axios";
import "./mantenimientoRol.css";
import NuevoRol from "./NuevoRol.js";
import EditarRol from "./EditarRol.js";
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash,faDownload } from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
// Importacion de store.
import useStore from '../store.js';


const MantenimientoRol = () => {
  const [departamentoLista, setLista] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [rolSeleccionado, setRolSeleccionado] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const departamentosPorPagina = 5;

  const [mostrarInforme, setMostrarInforme] = useState(false);
  const [informeData, setInformeData] = useState([]);



  const traerRol = async () => {
    try {
      setCargando(true);
      const response = await axios.get("http://localhost:3001/traerRoles");
      setLista(response.data);
    } catch (error) {
      console.error("Error al obtener el registro:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error al obtener los registros. Por favor, intenta de nuevo.',
      });
    } finally {
      setCargando(false);
    }
  };


  useEffect(() => {

    traerRol();
  }, []);

  const listaFiltrada = departamentoLista.filter((departamento) => {
    return (
      (departamento?.Departamento?.toLowerCase() ?? '').includes(busqueda.toLowerCase()) ||
      (departamento?.Nombre_departamento?.toLowerCase() ?? '').includes(busqueda.toLowerCase())
    );
  });
  

  const indiceUltimoDepartamento = paginaActual * departamentosPorPagina;
  const indicePrimerDepartamento = indiceUltimoDepartamento - departamentosPorPagina;
  const departamentosEnPagina = listaFiltrada.slice(indicePrimerDepartamento, indiceUltimoDepartamento);
  const numeroTotalPaginas = Math.ceil(listaFiltrada.length / departamentosPorPagina);

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
  };

  const abrirModal = () => {
    setMostrarModalNuevo(true);
  };

  const cerrarModal = () => {
    setMostrarModalNuevo(false);
  };

  const abrirModalEdicion = (IdRol) => {
    setRolSeleccionado(IdRol);
    setMostrarModalEdicion(true);
  };

  const cerrarModalEdicion = () => {
    setMostrarModalEdicion(false);
  };

  //Informe de Mantenimiento depto (Abrir y Cerrar)
  const cerrarInforme = () => {
    setMostrarInforme(false);
    setInformeData([]);
  };

  const eliminarRol = async (idRol) => {
    try {
      const confirmacion = await Swal.fire({
        title: "¿Estás seguro?",
        text: "¿Deseas eliminar el rol?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
        allowOutsideClick: false
      });

      if (confirmacion.isConfirmed) {
        const response = await fetch(`http://localhost:3001/eliminarRol/${idRol}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const updatedList = departamentoLista.filter(Rol => Rol.Id_Rol !== idRol);
          setLista(updatedList);

          Swal.fire({
            title: "¡Éxito!",
            text: "El Rol ha sido eliminado correctamente.",
            icon: "success",
            confirmButtonText: "Aceptar",
          });
        } else {
          throw new Error("Error en la solicitud");
        }
      }
    } catch (error) {
      console.error("Error al eliminar el rol:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error al eliminar el rol. Por favor, intenta de nuevo.',
      });
    }
  };

  const generarInforme = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/traerBitacoraObjetosMantenimientodepartamento"
      );
      const bitacoraOrdenada = response.data.reverse();
      const dataConNombreUsuario = bitacoraOrdenada.map(item => ({
        ...item,
        NombreUsuario: item.NombreUsuario // Esto asume que el nombre de usuario ya se está incluyendo correctamente en los datos recibidos del backend
      }));
      setInformeData(dataConNombreUsuario);

      setMostrarInforme(true);
    } catch (error) {
      console.error("Error al generar el informe:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al generar el informe. Por favor, intenta de nuevo.",
      });
    }
  };

  const descargarInformePDF = () => {
    const doc = new jsPDF();
    const header = "Informe de Departamento";
    const columns = ["ID Bitácora", "Nombre de Usuario", "ID Objeto", "Fecha", "Acción", "Descripción"]; 
    const rows = informeData.map(item => [item.Id_bitacora, item.NombreUsuario, item.Id_Objeto, item.Fecha, item.Accion, item.Descripcion]); 
  
    doc.setFontSize(18);
    doc.setTextColor(60);
    doc.text(header, 10, 10);
  
    doc.autoTable({
      startY: 20,
      head: [columns],
      body: rows,
      theme: 'striped',
      styles: {
        fontSize: 10,
        cellPadding: 2,
      },
    });
  
    doc.save("Informe_Bitacora.pdf");
  };

  return (
    <div data-maintenance-departamento="true" className="maintenance-container">
      {cargando ? (
        <div className="loading">Cargando...</div>
      ) : (
        <>
          <section className="formulario">
            <h1 className="mr-5 ml-5 mt-5">MANTENIMIENTO ROL</h1>
            <p></p>
            <div className="form-buttons">
              <div className="search-container">
                <i className='bx bx-search icon'></i>
                <input
                  type="text"
                  placeholder="Buscar por Nombre de Rol"
                  className="search-input"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              <button className="submit" onClick={abrirModal}>NUEVO</button>
              <button className="submit" onClick={generarInforme}>Generar Informe</button>
            </div>
            <section className="tabla-departamentos">
              <table className="table table-hover table-bordered" id="tblDepartamentos">
                <thead>
                  <tr>
                    <th>Rol</th>
                    <th>Descripcion</th>
                    <th>Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {departamentosEnPagina.length > 0 ? (
                    departamentosEnPagina.map((val, key) => {
                      return (
                        <tr key={key}>
                          <th>{val.Rol}</th>
                          <th>{val.Descripcion}</th>
                          <td>
                            <div className="button-container">
                              <button className="submit icon-button" onClick={() => abrirModalEdicion(val.Id_Rol)}>
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                           <button
                                className="submit icon-button"
                                onClick={() => eliminarRol(val.Id_Rol)}
                              >
                                <FontAwesomeIcon icon={faTrash} />
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
           {/* Modal para el formulario de NuevoUsuario */}
           {mostrarModalNuevo && (
              <div className="modal-container">
                <div className="modal-content">
                  <span className="close-button" onClick={cerrarModal}>&times;</span>
                  
                  <NuevoRol onClose={() => { cerrarModal(); traerRol(); }} />
                </div>
              </div>
            )}
            {/* Modal para el formulario de EditarUsuario */}
            {mostrarModalEdicion && (
              <div className="modal-container">
                <div className="modal-content">
                  <span className="close-button" onClick={cerrarModalEdicion}>&times;</span>
                  <EditarRol onClose={() => { cerrarModalEdicion(); traerRol(); }} Id_Rol={rolSeleccionado} />
                </div>
              </div>
            )}
            {/* Modal para mostrar el informe */}
            {mostrarInforme && (
              <section className="formulario">
              <div className="modal-container">
                <div className="modal-content">
                  <span className="close-button" onClick={cerrarInforme}>&times;</span>
                  <h1 className="mr-5 ml-5 mt-5">INFORME DE MANTENIMIENTO DE DEPARTAMENTOS</h1>
                  <p></p>
                  <section className="tabla-departamentos">
                  <table className="table table-hover table-bordered" id="tblDepartamentos">
                    <thead>
                      <tr>
                      <th>ID Bitácora</th>
                <th>Usuario</th> {/* Cambiado de "NombreUsuario" a "Usuario" */}
                <th>ID Objeto</th>
                <th>Fecha</th>
                <th>Acción</th>
                <th>Descripción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {informeData.map((item, index) => (
                        <tr key={index}>
                          <td>{item.Id_bitacora}</td>
                  <td>{item.NombreUsuario}</td>
                  <td>{item.Id_Objeto}</td>
                  <td>{item.Fecha}</td>
                  <td>{item.Accion}</td>
                  <td>{item.Descripcion}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </section>
                  <button className="submit icon-button" onClick={cerrarInforme}>Cerrar</button>
                  <button className="submit icon-button" onClick={descargarInformePDF}>
                    <FontAwesomeIcon icon={faDownload} /> DESCARGAR INFORME
              </button>
                </div>
              </div>
              </section>
            )}
          </>
        )}
      </div>
    );
  };
  
  export default MantenimientoRol;