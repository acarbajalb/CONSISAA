import React, { useState, useEffect } from "react";
import axios from "axios";
import "./mantenimientoUsuario.css";
import NuevoUsuario from "./NuevoUsuario.js";
import EditarUsuario from "./EditarUsuario.js";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faDownload } from "@fortawesome/free-solid-svg-icons";
import jsPDF from "jspdf";
import "jspdf-autotable";
// Importacion de store.
import useStore from "../store";

const MantenimientoUsuario = () => {
  const [usuarioLista, setLista] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const usuariosPorPagina = 5;

  const [mostrarInforme, setMostrarInforme] = useState(false);
  const [informeData, setInformeData] = useState([]);

  // Es aqui donde definimos constantes para que se puedan usar con los valores traídos de store.js
  const Id_usuario = useStore((state) => state.Id_usuario); // Obtiene el Id del usuario.
  const usuario = useStore((state) => state.usuario); // Obtiene el usuario del store


  const traerUsuarios = async () => {
    try {
      setCargando(true);
      const response = await axios.get("http://localhost:3001/traerUsuarios");
      setLista(response.data);
    } catch (error) {
      console.error("Error al obtener los usuarios:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al obtener los usuarios. Por favor, intenta de nuevo.",
      });
    } finally {
      setCargando(false);
    }
  };
  useEffect(() => {
    traerUsuarios();
  }, []);

  const listaFiltrada = usuarioLista.filter((usuario) => {
    return (
      usuario.Usuario.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.Nombre_Completo_Usuario.toLowerCase().includes(
        busqueda.toLowerCase()
      )
    );
  });

  const indiceUltimoUsuario = paginaActual * usuariosPorPagina;
  const indicePrimerUsuario = indiceUltimoUsuario - usuariosPorPagina;
  const usuariosEnPagina = listaFiltrada.slice(
    indicePrimerUsuario,
    indiceUltimoUsuario
  );
  const numeroTotalPaginas = Math.ceil(
    listaFiltrada.length / usuariosPorPagina
  );

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
  };

  const abrirModal = async () => {
      setMostrarModalNuevo(true);
  };

  const cerrarModal = () => {
    setMostrarModalNuevo(false);
  };

  const abrirModalEdicion = async (userId) => {
    setUsuarioSeleccionado(userId);
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

  const generarInforme = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/traerBitacoraObjetosMantenimientousuario"
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
    const header = "Reporte de Usuario";
    const columns = [ 
      "Nombre de Usuario", 
      "Fecha", 
      "Descripción"
    ]; // Cambiado "ID Usuario" a "Nombre de Usuario"
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

    doc.save("ReporteUsuarios.pdf");
  };

  return (
    <div data-maintenance-usuario="true" className="maintenance-container">
      {cargando ? (
        <div className="loading">Cargando...</div>
      ) : (
        <>
          <section className="formulario">
            <h1 className="mr-5 ml-5 mt-5">MANTENIMIENTO DE USUARIOS</h1>
            <p></p>
            <div className="form-buttons">
              <div className="search-container">
                <i className="bx bx-search icon"></i>
                <input
                  type="text"
                  placeholder="Buscar usuario..."
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
            <section className="tabla-usuarios">
              <table
                className="table table-hover table-bordered"
                id="tblUsuarios"
              >
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Nombre Completo de Usuario</th>
                    <th>Puesto</th>
                    <th>Correo Electronico</th>
                    <th>Ultima Conexión</th>
                    <th>Estado del usuario</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosEnPagina.length > 0 ? (
                    usuariosEnPagina.map((val, key) => {
                      return (
                        <tr key={key}>
                          <th>{val.Usuario}</th>
                          <th>{val.Nombre_Completo_Usuario}</th>
                          <th>{val.Nombre_puesto}</th>
                          <th>{val.Correo_electronico}</th>
                          <th>
                            {new Date(val.Fecha_ultima_conexion).toLocaleString(
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
                          <th>{val.Estado}</th>
                          <td>
                            <div className="button-container">
                              <button
                                className="submit icon-button"
                                onClick={() =>
                                  abrirModalEdicion(val.Id_usuario)
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
                <NuevoUsuario
                  onClose={() => {
                    cerrarModal();
                    traerUsuarios();
                  }}
                />
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
                <EditarUsuario
                  onClose={() => {
                    cerrarModalEdicion();
                    traerUsuarios();
                  }}
                  Id_usuario={usuarioSeleccionado}
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
                  <h1 className="mr-5 ml-5 mt-5"> REPORTE DE MANTENIMIENTO DE USUARIO </h1>
                  <p></p>
                  <section className="tabla-usuarios">
                    <table
                      className="table table-hover table-bordered"
                      id="tblInformeUsuario"
                    >
                      <thead>
                        <tr> 
                          <th>Usuario</th> 
                          <th>Fecha</th>
                          <th>Acción</th> 
                        </tr>
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

export default MantenimientoUsuario;
