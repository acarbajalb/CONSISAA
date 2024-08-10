import React, { useState, useEffect } from "react";
import axios from "axios";
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Swal from 'sweetalert2';
import {faDownload } from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import useStore from "../store";

import "./mantenimientoSolicitud.css";

const MantenimientoSolicitud = () => {
  const [cargando, setCargando] = useState(false); 
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModalRevision, setMostrarModalRevision] = useState(false);
  const [solicitudesLista, setsolicitudesLista] = useState([]);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);   //Constante para capturar el id del registro seleccionado en la tabla.
 
  const [mostrarInforme, setMostrarInforme] = useState(false);
  const [informeData, setInformeData] = useState([]);

  //Constantes para paginacion de tabla.
  const [paginaActual, setPaginaActual] = useState(1);
  const usuariosPorPagina = 5;

  const idUsuario = useStore((state) => state.Id_usuario); // Obtiene el ID de usuario del store

  useEffect(() => {
    const traerSolicitud = async () => {
      try {
        setCargando(true);
        const response = await axios.get(`http://localhost:3001/traerSolicitudPorUsuarioLogueado/${idUsuario}`);
        setsolicitudesLista(response.data);
      } catch (error) {
        console.error("Error al obtener las solicitudes de vacaciones:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un error al obtener las solicitudes de vacaciones. Por favor, intenta de nuevo.',
        });
      } finally {
        setCargando(false);
      }
    };
    traerSolicitud();
  }, [idUsuario]);
  
  //Logica para el filtrado de la lista por estado de solicitud o empleado
  const listaFiltrada = solicitudesLista.filter((solicitud) => {
    return (
      solicitud.Estado_Solicitud.toString().toLowerCase().includes(busqueda.toLowerCase()) || 
      solicitud.NombreCompleto.toLowerCase().includes(busqueda.toLowerCase())
    );
  });

  const indiceUltimoUsuario = paginaActual * usuariosPorPagina;
  const indicePrimerUsuario = indiceUltimoUsuario - usuariosPorPagina;
  const usuariosEnPagina = listaFiltrada.slice(indicePrimerUsuario, indiceUltimoUsuario);
  const numeroTotalPaginas = Math.ceil(listaFiltrada.length / usuariosPorPagina);

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
  };

  //Apertura de subpatalla de revision pasando el id del registro que se selecciono
  const abrirModalRevision= (Id_Solicitud) => {
    setSolicitudSeleccionada(Id_Solicitud);
    setMostrarModalRevision(true);
  };

  const cerrarModalRevision = () => {
    setMostrarModalRevision(false);
  };

  //Informe de Mantenimiento Usuario (Abrir y Cerrar)
  const cerrarInforme = () => {
    setMostrarInforme(false);
    setInformeData([]);
  };

  //Funcion para DENEGAR la solicitud de vacaciones
  const DenegarSolicitud = async (Id_Solicitud) => {
    try {
      const confirmacion = await Swal.fire({
        title: "¿Estás seguro?",
        text: "¿Deseas denegar esta solicitud de vacaciones?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, denegar",
        cancelButtonText: "Cancelar",
        allowOutsideClick: false
      });

      if (confirmacion.isConfirmed) {
        const response = await fetch(`http://localhost:3001/DenegarSolicitud/${Id_Solicitud}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const updatedList = solicitudesLista.filter(solicitud => solicitud.Id_Solicitud !== Id_Solicitud);
          setsolicitudesLista(updatedList);

          Swal.fire({
            title: "¡Éxito!",
            text: "La solicitud de vacaciones se ha denegado correctamente.",
            icon: "success",
            confirmButtonText: "Aceptar",
          });
        } else {
          throw new Error("Error en la solicitud");
        }
      }
    } catch (error) {
      console.error("Error al denegar solicitud de vacaciones:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error al denegar solicitud de vacaciones. Por favor, intenta de nuevo.',
      });
    }
  };

  //Funcion para APROBAR la solicitud de vacaciones
  const AprobarSolicitud = async (Id_Solicitud) => {
    try {
      const confirmacion = await Swal.fire({
        title: "¿Estás seguro?",
        text: "¿Deseas aprobar esta solicitud ?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, aprobar",
        cancelButtonText: "Cancelar",
        allowOutsideClick: false
      });

      if (confirmacion.isConfirmed) {
        const response = await fetch(`http://localhost:3001/AprobarSolicitud/${Id_Solicitud}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const updatedList = solicitudesLista.filter(solicitud => solicitud.Id_Solicitud !== Id_Solicitud);
          setsolicitudesLista(updatedList);

          Swal.fire({
            title: "¡Éxito!",
            text: "La solicitud de vacaciones se ha aprobado correctamente.",
            icon: "success",
            confirmButtonText: "Aceptar",
          });
        } else {
          throw new Error("Error en la solicitud");
        }
      }
    } catch (error) {
      console.error("Error al aprobar la solicitud de vacaciones:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error al aprobar la solicitud de vacaciones. Por favor, intenta de nuevo.',
      });
    }
  };

  // Función para manejar clics en el botón de aprobar
  const handleClickAprobar = (Id_Solicitud) => {
    console.log("ID de la solicitud aprobada:", Id_Solicitud);
    AprobarSolicitud(Id_Solicitud);
  };

  const generarInforme = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/traerBitacoraObjetosMantenimientosolocitudesadmin"
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
    const header = "Informe de Solicitudes";
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
    <div data-maintenance-solicitud="true" className="maintenance-container">
      {cargando ? (
        <div className="loading">Cargando...</div>
      ) : (
        <>
          <section className="formulario">
            <h1 className="mr-5 ml-5 mt-5">SOLICITUDES</h1>
            <p></p>
            <div className="form-buttons">
              <div className="search-container">
                <i className='bx bx-search icon'></i>
                <input
                  type="text"
                  placeholder="Buscar por Usuario"
                  className="search-input"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              <button className="submit" onClick={generarInforme}>Generar Informe</button>
            </div>
  
            {/*Tabla de las deducciones creadas en la bd */}
            <section className="tabla-solicitudes">
              <table className="table table-hover table-bordered" id="tblSolicitudes">
                <thead>
                  <tr>
                    <th>Estado de solicitud</th>
                    <th>Empleado</th>
                    <th>Fecha Inicio</th>
                    <th>Fecha Final</th>
                    <th>Fecha Retorno</th>
                    <th>Hora Inicio</th>
                    <th>Hora Final</th>
                    <th>Tiempo Parcial</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosEnPagina.length > 0 ? (
                    usuariosEnPagina.map((val, key) => {
                      return (
                        <tr key={key}>
                          <td>{val.Estado_Solicitud}</td>
                          <td>{val.NombreCompleto}</td>
                          <td>{new Date(val.Fecha_Inicio_Vacaciones).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' })} {new Date(val.Fecha_Inicio_Vacaciones).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                          <td>{new Date(val.Fecha_Final_Vacaciones).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' })} {new Date(val.Fecha_Final_Vacaciones).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                          <td>{new Date(val.Fecha_Retorno_Vacaciones).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' })} {new Date(val.Fecha_Retorno_Vacaciones).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                          <td>{val.Hora_Inicio_Vacaciones}</td>
                          <td>{val.Hora_Final_Vacaciones}</td>
                          <td>{val.Tiempo_Parcial}</td>
                          <td>
                            <div className="button-container">
                              <button className="submit icon-button" name="Aprobar" onClick={() => handleClickAprobar(val.Id_Solicitud)}>
                                <FontAwesomeIcon icon={faCheck} />
                              </button>
                              <button className="submit icon-button" name="Denegar" onClick={() => DenegarSolicitud(val.Id_Solicitud)}>
                                <FontAwesomeIcon icon={faTimes} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr key="no-results">
                      <td colSpan="9">
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
            {/* Modal para mostrar el informe */}
            {mostrarInforme && (
              <section className="formulario">
                <div className="modal-container">
                  <div className="modal-content">
                    <span className="close-button" onClick={cerrarInforme}>&times;</span>
                    <h1 className="mr-5 ml-5 mt-5">INFORME DE MANTENIMIENTO DE MIS SOLICITUDES</h1>
                    <p></p>
                    <section className="tabla-solicitudes">
                      <table className="table table-hover table-bordered" id="tblSolicitudes">
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
          </section>
        </>
      )}
    </div>
  );  
};

export default MantenimientoSolicitud;

