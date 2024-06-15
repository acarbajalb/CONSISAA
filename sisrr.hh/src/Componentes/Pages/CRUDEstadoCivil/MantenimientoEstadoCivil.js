import React, { useState, useEffect } from "react";
import axios from "axios";
import "./mantenimientoEstadoCivil.css";
import NuevoEstadoCivil from "./NuevoEstadoCivil.js";
import EditarEstadoCivil from "./EditarEstadoCivil.js";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faDownload } from "@fortawesome/free-solid-svg-icons";
import jsPDF from "jspdf";
import "jspdf-autotable";
// Importacion de store.
import useStore from "../store";

const MantenimientoEstadoCivil = () => {
  const [estadocivilLista, setLista] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [estadocivilSeleccionado, setEstadoCivilSeleccionado] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const estadocivilPorPagina = 5;

  const [mostrarInforme, setMostrarInforme] = useState(false);
  const [informeData, setInformeData] = useState([]);

  const Id_EstadoCivil = useStore((state) => state.Id_EstadoCivil); // Obtiene el Id del .
  const estadocivil = useStore((state) => state.estadocivil); // Obtiene el  del store

  useEffect(() => {
    const traerEstadoCivil = async () => {
      try {
        setCargando(true);
        const response = await axios.get(
          "http://localhost:3001/traerEstadoCivil"
        );
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
    traerEstadoCivil();
  }, []);

  const listaFiltrada = estadocivilLista.filter((estadocivil) => {
    return (estadocivil?.Estado_civil?.toLowerCase() ?? "").includes(
      busqueda.toLowerCase()
    );
  });

  const indiceUltimoEstadoCivil = paginaActual * estadocivilPorPagina;
  const indicePrimerEstadoCivil =
    indiceUltimoEstadoCivil - estadocivilPorPagina;
  const estadocivilEnPagina = listaFiltrada.slice(
    indicePrimerEstadoCivil,
    indiceUltimoEstadoCivil
  );
  const numeroTotalPaginas = Math.ceil(
    listaFiltrada.length / estadocivilPorPagina
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

  const abrirModalEdicion = (IdEsCi) => {
    setEstadoCivilSeleccionado(IdEsCi);
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
        "http://localhost:3001/traerBitacoraObjetosMantenimientoEstadoCivil"
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
    const header = "Reporte de Estado Civil";
    const columns = ["Nombre de Usuario", "Fecha", "Descripción"];
    const rows = informeData.map((item) => {
      // Damos formato a la fecha
      const formattedDate = new Date(item.Fecha).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      return [item.NombreUsuario, formattedDate, item.Descripcion];
    });

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

    doc.save("Reporte_EstadoCivil.pdf");
  };
  return (
    <div data-maintenance-estadocivil="true" className="maintenance-container">
      {cargando ? (
        <div className="loading">Cargando...</div>
      ) : (
        <>
          <section className="formulario">
            <h1 className="mr-5 ml-5 mt-5">MANTENIMIENTO DE ESTADO CIVIL</h1>
            <p></p>
            <div className="form-buttons">
              <div className="search-container">
                <i className="bx bx-search icon"></i>
                <input
                  type="text"
                  placeholder="Buscar por Nombre "
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
            <section className="tabla-estadocivil">
              <table
                className="table table-hover table-bordered"
                id="tblEstadoCivil"
              >
                <thead>
                  <tr>
                    <th>No. Estado Civil</th>
                    <th>Nombre Estado Civil</th>
                    <th>Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {estadocivilEnPagina.length > 0 ? (
                    estadocivilEnPagina.map((val, key) => {
                      return (
                        <tr key={key}>
                          <th>{val.Id_EstadoCivil}</th>
                          <th>{val.Estado_civil}</th>
                          <td>
                            <div className="button-container">
                              <button
                                className="submit icon-button"
                                onClick={() =>
                                  abrirModalEdicion(val.Id_EstadoCivil)
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

          {/* Modal para el formulario de NuevoUsuario */}
          {mostrarModalNuevo && (
            <div className="modal-container">
              <div className="modal-content">
                <span className="close-button" onClick={cerrarModal}>
                  &times;
                </span>
                <NuevoEstadoCivil onClose={cerrarModal} />
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
                <EditarEstadoCivil
                  onClose={cerrarModalEdicion}
                  Id_EstadoCivil={estadocivilSeleccionado}
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
                    REPORTE DE MANTENIMIENTO DE ESTADO CIVIL
                  </h1>
                  <p></p>
                  <section className="tabla-empleado">
                    <table
                      className="table table-hover table-bordered"
                      id="tblEmpleado"
                    >
                      <thead>
                        <tr>
                          <th>Usuario</th>{" "}
                          {/* Cambiado de "NombreUsuario" a "Usuario" */}
                          <th>Fecha</th>
                          <th>Acción</th>
                        </tr>
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

export default MantenimientoEstadoCivil;
