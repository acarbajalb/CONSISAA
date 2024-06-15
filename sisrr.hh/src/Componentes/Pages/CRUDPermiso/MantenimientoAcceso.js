import React, { useState, useEffect } from "react";
import axios from "axios";
import "./mantenimientoAcceso.css";
import NuevoAcceso from "./NuevoAcceso.js";
import EditarAcceso from "./EditarAcceso.js";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
//Importacion de store.
import useStore from "../store";

const MantenimientoAcceso = () => {
  const [accesoLista, setaccesoLista] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [accesoSeleccionado, setAccesoSeleccionado] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const accesoPorPagina = 5;

  /*Es aqui donde definimos constantes para que se puedan usar con los valores traídos de store.js*/
  const Id_usuario = useStore((state) => state.Id_usuario); //Obtiene el Id del usuario.
  const usuario = useStore((state) => state.usuario); // Obtiene el usuario del store

  const traerPermisos = async () => {
    try {
      setCargando(true);
      const response = await axios.get("http://localhost:3001/traerPermisos");
      setaccesoLista(response.data);
    } catch (error) {
      console.error("Error al obtener la lista de permisos:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al obtener la lista de permisos. Por favor, intenta de nuevo.",
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    traerPermisos();
  }, []);

  //Logica para el filtrado de la lista por estado de solicitud o empleado
  const listaFiltrada = accesoLista.filter((acceso) => {
    return (
      acceso.Rol.toString().toLowerCase().includes(busqueda.toLowerCase()) ||
      acceso.Pantallas.toLowerCase().includes(busqueda.toLowerCase())
    );
  });

  const indiceUltimoAcceso = paginaActual * accesoPorPagina;
  const indicePrimerAcceso = indiceUltimoAcceso - accesoPorPagina;
  const registrossEnPagina = listaFiltrada.slice(
    indicePrimerAcceso,
    indiceUltimoAcceso
  );
  const numeroTotalPaginas = Math.ceil(listaFiltrada.length / accesoPorPagina);

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
  };

  const abrirModal = () => {
    setMostrarModalNuevo(true);
  };

  const cerrarModal = () => {
    setMostrarModalNuevo(false);
  };
  const abrirModalEdicion = (idobjeto, idrol) => {
    setAccesoSeleccionado({ Id_objeto: idobjeto, Id_rol: idrol });
    setMostrarModalEdicion(true);
  };

  const cerrarModalEdicion = () => {
    setMostrarModalEdicion(false);
  };

  return (
    <div
      data-maintenance-acceso="true"
      className="maintenance-container-acceso"
    >
      {cargando ? (
        <div className="loading">Cargando...</div>
      ) : (
        <>
          <section className="formulario">
            <h1 className="mr-5 ml-5 mt-5">ACCESO DEL SISTEMA</h1>
            <p></p>
            <div className="form-buttons">
              <div className="search-container">
                <i className="bx bx-search icon"></i>
                <input
                  type="text"
                  placeholder="Buscar por Rol o Pantalla"
                  className="search-input"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              <button className="submit" onClick={abrirModal}>
                NUEVO
              </button>
              <button className="submit"> Generar Informe</button>
            </div>
            <section className="tabla-acceso">
              <table
                className="table table-hover table-bordered"
                id="tblUsuarios"
              >
                <thead>
                  <tr>
                    <th>Pantalla</th>
                    <th>Roles</th>
                    <th>Permiso de Insercion</th>
                    <th>Permiso de Eliminacion</th>
                    <th>Permiso de Edicion</th>
                    <th>Permiso de Consultar</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {registrossEnPagina.length > 0 ? (
                    registrossEnPagina.map((val, key) => {
                      return (
                        <tr key={key}>
                          <th>{val.Pantallas}</th>
                          <th>{val.Rol}</th>
                          <th>{val.Permiso_insercion}</th>
                          <th>{val.Permiso_eliminacion}</th>
                          <th>{val.Permiso_actualizacion}</th>
                          <th>{val.Permiso_consultar}</th>
                          <td>
                            <div className="button-container">
                              <button
                                className="submit icon-button"
                                onClick={() =>
                                  abrirModalEdicion(val.Id_objeto, val.Id_Rol)
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
                <NuevoAcceso
                  onClose={() => {
                    cerrarModal();
                    traerPermisos();
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
                {/* Aquí pasamos los valores de Id_Rol e Id_objeto por separado */}
                <EditarAcceso
                  onClose={cerrarModalEdicion}
                  Id_rol={accesoSeleccionado.Id_rol}
                  Id_objeto={accesoSeleccionado.Id_objeto}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MantenimientoAcceso;
