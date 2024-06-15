import React, { useState, useEffect } from "react";
import axios from "axios";
import "./mantenimientoContrato.css";
import NuevoContrato from "./NuevoContrato.js";
import EditarContrato from "./EditarContrato.js";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faDownload } from "@fortawesome/free-solid-svg-icons";
import jsPDF from "jspdf";
import "jspdf-autotable";
// Importacion de store.
import useStore from "../store";

const MantenimientoContrato = () => {
  const [contratoLista, setLista] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [contratoSeleccionado, setContratoSeleccionado] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const contratoPorPagina = 5;


  const [mostrarInforme, setMostrarInforme] = useState(false);
  const [informeData, setInformeData] = useState([]);

  // Es aqui donde definimos constantes para que se puedan usar con los valores traídos de store.js
  const Id_usuario = useStore((state) => state.Id_usuario); // Obtiene el Id del usuario.
  const usuario = useStore((state) => state.usuario); // Obtiene el usuario del store


  //VARIABLES QUE SE PASAN AL VERIFICAR PERMISO FALTA
  const id_Objeto="9";
  const id_Rol = useStore((state) => state.Id_rol); // Obtiene el Id del usuario.
 
  
  //Informe del mantenimiento
  const generarInforme = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/traerBitacoraObjetosMantenimientocontrato"
      );
      const bitacoraOrdenada = response.data.reverse();
      const dataConNombreUsuario = bitacoraOrdenada.map((item) => ({
        ...item,
        NombreUsuario: item.NombreUsuario, // Esto asume que el nombre de usuario ya se está incluyendo correctamente en los datos recibidos del backend
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
    const header = "Reporte de Contrato";
    const columns = [ 
      "Nombre de Usuario", 
      "Fecha",
      "Descripción",
    ];
    const rows = informeData.map((item) => {
      // Damos formato a la fecha
      const formattedDate = new Date(item.Fecha).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
  
      return [item.NombreUsuario, formattedDate, item.Descripcion];
  }); // Cambiado item.Id_usuario a item.NombreUsuario

    doc.setFontSize(18);
    doc.setTextColor(60);
    doc.text(header, 10, 10);

    doc.autoTable({
      startY: 20,
      head: [columns],
      body: rows,
      theme: "striped",
      styles: {
        fontSize: 10,
        cellPadding: 2,
      },
    });

    doc.save("ReporteContratos.pdf");
  };

  
  //RUTAS DEL MANTENIMIENTO PROPIO

  const traerContratos = async () => {
    try {
      setCargando(true);
      const response = await axios.get("http://localhost:3001/traerContratos");
      setLista(response.data);
    } catch (error) {
      console.error("Error al obtener los registros:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al obtener los registros. Por favor, intenta de nuevo.",
      });
    } finally {
      setCargando(false);
    }
  };
  
  useEffect(() => {
    traerContratos();
  }, []);

 
//Funcion de barra de busqeuda para filtrar los contratos por fecha, nombre de empleado y tipo de contrato
  const listaFiltrada = contratoLista.filter((contrato) => {
    //Convierte a minusculas lo ingresado en la barra de busqueda
    const busquedaLower = busqueda.toLowerCase();
    //Convierte el valor ingresado en la barra de busqueda en un objeto DATE y luego a cadena ISO 8601 y esta se dividde usando el caracter T
    const fechaContratacion = new Date(contrato.Fecha_Contratacion).toISOString().split("T")[0];
    const fechaFinContrato = new Date(contrato.Fecha_Fin_Contrato).toISOString().split("T")[0];
    
    return (
      contrato.Nombre.toLowerCase().includes(busquedaLower) ||
      contrato.Nombre_Contrato.toLowerCase().includes(busquedaLower) ||
      fechaContratacion.includes(busqueda) ||
      fechaFinContrato.includes(busqueda)
    );
  });

  
  const indiceUltimo = paginaActual * contratoPorPagina;
  const indicePrimer = indiceUltimo- contratoPorPagina;
  const registrosEnPagina = listaFiltrada.slice(
    indicePrimer,
    indiceUltimo
  );
  const numeroTotalPaginas = Math.ceil(
    listaFiltrada.length / contratoPorPagina
  );

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
  };

  const abrirModal = () => {
    setMostrarModalNuevo(true);
  };

  const cerrarModal = () => {
    setMostrarModalNuevo(false);
  };

  const abrirModalEdicion = (contratoid) => {
    setContratoSeleccionado (contratoid);
    setMostrarModalEdicion(true);
  };

  const cerrarModalEdicion = () => {
    setMostrarModalEdicion(false);
  };

  //Informe de Mantenimiento Usuario (Abrir y Cerrar)
  const cerrarInforme = () => {
    setMostrarInforme(false);
    setInformeData([]);
  };



 
  return (
    <div
      data-maintenance-contrato="true"
      className="maintenance-container-contrato"
    >
      {cargando ? (
        <div className="loading">Cargando...</div>
      ) : (
        <>
          <section className="formulario">
            <h1 className="mr-5 ml-5 mt-5">MANTENIMIENTO DE CONTRATOS</h1>
            <p></p>
            <div className="form-buttons">
              <div className="search-container">
                <i className="bx bx-search icon"></i>
                <input
                  type="text"
                  placeholder="Buscar Contrato"
                  className="search-input"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              <button className="submit" onClick={abrirModal}>
                nuevo
              </button>
              <button className="submit" onClick={generarInforme}>
                Generar Informe
              </button>
            </div>
            <section className="tabla-contratos">
              <table
                className="table table-hover table-bordered"
                id="tblContratos"
              >
                <thead>
                  <tr>
                    <th>Nombre de Contrato</th>
                    <th>Nombre de Empleado</th> 
                    <th>Fecha de Contratación</th>
                    <th>Fecha de Fin de Contrato</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {registrosEnPagina.length > 0 ? (
                    registrosEnPagina.map((val, key) => {
                      return (
                        <tr key={key}>
                          <td>{val.Nombre_Contrato}</td>
                          <td>{val.Nombre}</td> 
                          <td>
                            {new Date(val.Fecha_Contratacion).toLocaleString(
                              "es-ES",
                              {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              }
                            )}
                          </td>
                          <td>
                            {new Date(val.Fecha_Fin_Contrato).toLocaleString(
                              "es-ES",
                              {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              }
                            )}
                          </td>
                          <td>
                            <div className="button-container">
                              <button
                                className="submit icon-button"
                                onClick={() =>
                                  abrirModalEdicion(val.Id_Contrato)
                                }
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr key="no-results">
                      <td colSpan="6">
                        <p className="text-center">
                          No se encontraron resultados
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
            {/* Paginador */}
            <div className="paginador">
              {Array.from({ length: numeroTotalPaginas }).map((_, index) => (
                <button key={index} onClick={() => cambiarPagina(index + 1)}>
                  {index + 1}
                </button>
              ))}
            </div>
          </section>
          {/* Modal para el formulario de NuevoContrato */}
          {mostrarModalNuevo && (
            <div className="modal-container">
              <div className="modal-content">
                <span className="close-button" onClick={cerrarModal}>
                  &times;
                </span>
                <NuevoContrato onClose={cerrarModal} />
              </div>
            </div>
          )}
          {/* Modal para el formulario de EditarContrato */}
          {mostrarModalEdicion && (
            <div className="modal-container">
              <div className="modal-content">
                <span className="close-button" onClick={cerrarModalEdicion}>
                  &times;
                </span>
                <EditarContrato
                  onClose={cerrarModalEdicion}
                  Id_Contrato={contratoSeleccionado}
                />
              </div>
            </div>
          )}
          {/* Modal para mostrar el informe */}
          {mostrarInforme && (
            <section className="formulario">
              <div className="modal-container">
                <div className="modal-content">
                  <span className="close-button" onClick={cerrarInforme}>
                    &times;
                  </span>
                  <h1 className="mr-5 ml-5 mt-5">
                  REPORTE DE MANTENIMIENTO  DE CONTRATO
                  </h1>
                  <p></p>
                  <section className="tabla-contratos">
                    <table
                      className="table table-hover table-bordered"
                      id="tblContratos"
                    >
                      <thead> 
                        <th>Usuario</th> 
                          <th>Fecha</th>
                          <th>Acción</th>
                      </thead>
                      <tbody>
                        {informeData.map((item, index) => (
                           <tr key={index}> 
                           <td>{item.NombreUsuario}</td> 
                           <td>{new Date(item.Fecha).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' })} </td>
                           <td>{item.Descripcion}</td>
                         </tr>
                        ))}
                      </tbody>
                    </table>
                  </section>
                  <button
                    className="submit icon-button"
                    onClick={cerrarInforme}
                  >
                    Cerrar
                  </button>
                  <button
                    className="submit icon-button"
                    onClick={descargarInformePDF}
                  >
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
export default MantenimientoContrato;