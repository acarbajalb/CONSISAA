import React, { useState, useEffect } from "react";
import axios from "axios";
import "./mantenimientoArea.css";
import NuevoArea from "./NuevoArea.js";
import EditarArea from "./EditarArea.js";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faDownload } from "@fortawesome/free-solid-svg-icons";
import jsPDF from "jspdf";
import "jspdf-autotable";


const MantenimientoArea = () => {
  const [areaLista, setLista] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [areaSeleccionado, setAreaSeleccionado] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const areasPorPagina = 5;

  const [mostrarInforme, setMostrarInforme] = useState(false);
  const [informeData, setInformeData] = useState([]);

  useEffect(() => {
    const traerArea = async () => {
      try {
        setCargando(true);
        const response = await axios.get("http://localhost:3001/traerArea");
        setLista(response.data);
      } catch (error) {
        console.error("Error al obtener el registro:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Hubo un error al obtener los registros. Por favor, intenta de nuevo.",
        });
      } finally {
        setCargando(false);
      }
    };
    traerArea();
  }, []);

    //Funcion para filtrar por medio de nombre de departamento y las fechas de creacion y modificiacion.
  const listaFiltrada = areaLista.filter((area) => {
        //Convierte a minusculas lo ingresado en la barra de busqueda
const busquedaLower= busqueda.toLowerCase();
    //Convierte el valor ingresado en la barra de busqueda en un objeto DATE y luego a cadena ISO 8601 y esta se dividde usando el caracter T
    const fechaCreacion = new Date(area.Fecha_creacion).toISOString().split("T")[0];
    const fechaModificacion = new Date(area.Fecha_modificacion).toISOString().split("T")[0];

    return (
      (area?.Nombre_area?.toLowerCase() ?? "").includes(busquedaLower.toLowerCase()) ||
      (area?.Creado_por?.toLowerCase() ?? "").includes(busquedaLower.toLowerCase()) ||
      (area?.Modificado_por?.toLowerCase() ?? "").includes(busquedaLower.toLowerCase()) ||

      fechaCreacion.includes(busqueda) ||
     fechaModificacion.includes(busqueda)
   );
   
  });

  const indiceUltimoArea = paginaActual * areasPorPagina;
  const indicePrimerArea = indiceUltimoArea - areasPorPagina;
  const areasEnPagina = listaFiltrada.slice(indicePrimerArea, indiceUltimoArea);
  const numeroTotalPaginas = Math.ceil(listaFiltrada.length / areasPorPagina);

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
  };

  const abrirModal = () => {
    setMostrarModalNuevo(true);
  };

  const cerrarModal = () => {
    setMostrarModalNuevo(false);
  };

  const abrirModalEdicion = (IdArea) => {
    setAreaSeleccionado(IdArea);
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

  const generarInforme = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/traerBitacoraObjetosMantenimientoArea"
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
    const header = "Reporte de Area";
    const columns = ["Nombre de Usuario", "Fecha", "Descripción"];
    const rows = informeData.map((item) => {
      // Damos formato a la fecha
      const formattedDate = new Date(item.Fecha).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
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

    doc.save("ReporteArea.pdf");
  };

  return (
    <div data-maintenance-area="true" className="maintenance-container-area">
      {cargando ? (
        <div className="loading">Cargando...</div>
      ) : (
        <>
          <section className="formulario">
            <h1 className="mr-5 ml-5 mt-5">MANTENIMIENTO DE AREA</h1>
            <p></p>
            <div className="form-buttons">
              <div className="search-container">
                <i className="bx bx-search icon"></i>
                <input
                  type="text"
                  placeholder="Buscar area"
                  className="search-input"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              <button className="submit" onClick={abrirModal}>
                NUEVO
              </button>
              <button className="submit" onClick={generarInforme}>
                Generar Informe
              </button>
            </div>
            <section className="tabla-areas">
              <table className="table table-hover table-bordered" id="tblAreas">
                <thead>
                  <tr>
                    <th>Nombre Area</th>
                    <th>Creado Por </th>
                    <th>Modificado Por</th>
                    <th>Fecha de Creacion</th>
                    <th>Fecha de Modificacion</th>
                    <th>Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {areasEnPagina.length > 0 ? (
                    areasEnPagina.map((val, key) => {
                      return (
                        <tr key={key}>
                          <th>{val.Nombre_area}</th>
                          <th>{val.Creado_por}</th>
                          <th>{val.Modificado_por}</th>
                          <th>
                            {new Date(val.Fecha_creacion).toLocaleString(
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
                          </th>
                          <th>
                            {new Date(val.Fecha_modificacion).toLocaleString(
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
                          </th>
                          <td>
                            <div className="button-container">
                              <button
                                className="submit icon-button"
                                onClick={() => abrirModalEdicion(val.Id_area)}
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
                      <td colSpan="5">
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
          {/* Modal para el formulario de NuevoArea */}
          {mostrarModalNuevo && (
            <div className="modal-container">
              <div className="modal-content">
                <span className="close-button" onClick={cerrarModal}>
                  &times;
                </span>
                <NuevoArea onClose={cerrarModal} />
              </div>
            </div>
          )}
          {/* Modal para el formulario de EditarUsuario */}
          {mostrarModalEdicion && (
            <div className="modal-container">
              <div className="modal-content">
                <span className="close-button" onClick={cerrarModalEdicion}>
                  &times;
                </span>
                <EditarArea
                  onClose={cerrarModalEdicion}
                  Id_area={areaSeleccionado}
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
                    REPORTE DE MANTENIMIENTO DE AREA
                  </h1>
                  <p></p>
                  <section className="tabla-areas">
                    <table
                      className="table table-hover table-bordered"
                      id="tblAreas"
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
                            <td>
                              {new Date(item.Fecha).toLocaleDateString(
                                "es-ES",
                                {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                }
                              )}{" "}
                            </td>
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
export default MantenimientoArea;
