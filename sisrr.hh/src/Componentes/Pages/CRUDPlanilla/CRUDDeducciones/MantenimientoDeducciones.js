import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
//import "./mantenimientoDeducciones.css";
import NuevaDeduccion from "./NuevaDeduccion.js";
import EditarDeduccion from "./EditarDeduccion.js";
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const MantenimientoDeducciones = () => {
    const [cargando, setCargando] = useState(false); 
    const [busqueda, setBusqueda] = useState("");

    const [deduccionesLista, setLista] = useState([]);

    const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false); // Estado para controlar la visibilidad del modal
    const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false); // Estado para controlar la visibilidad del modal de edición
  
    //Constante para capturar el id de usuario seleccionado en la tabla.
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null); // Estado para almacenar la deducción seleccionada seleccionado

//Constantes para paginacion de tabla.
    const [paginaActual, setPaginaActual] = useState(1);
    const usuariosPorPagina = 5;


    useEffect(() => {
      const traerDeducciones = async () => {
        try {
          setCargando(true);
          const response = await axios.get("http://localhost:3001/traerDeducciones");
          setLista(response.data);
        } catch (error) {
          console.error("Error al obtener las deducciones:", error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un error al obtener las deducciones. Por favor, intenta de nuevo.',
          });
        } finally {
          setCargando(false);
        }
      };
      traerDeducciones();
    }, []);

    //LOGICA DE TRAER LAS DEDUCCIONES Y MOSTRAR EN TABLA
    const listaFiltrada = deduccionesLista.filter((deduccion) => {
      return (
          deduccion.Id_Deduccion.toString().toLowerCase().includes(busqueda.toLowerCase()) || 
          deduccion.Nombre_Deduccion.toLowerCase().includes(busqueda.toLowerCase())
      );
  });

  const indiceUltimoUsuario = paginaActual * usuariosPorPagina;
  const indicePrimerUsuario = indiceUltimoUsuario - usuariosPorPagina;
  const usuariosEnPagina = listaFiltrada.slice(indicePrimerUsuario, indiceUltimoUsuario);
  const numeroTotalPaginas = Math.ceil(listaFiltrada.length / usuariosPorPagina);



  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
  };



    const abrirModalNuevo = () => {
        setMostrarModalNuevo(true);
      };
    
      const cerrarModalNuevo = () => {
        setMostrarModalNuevo(false);
      };
    
      const abrirModalEdicion = (userId) => {
      setUsuarioSeleccionado(userId); // Almacenar el ID del usuario seleccionado
        setMostrarModalEdicion(true);
      };
    
      const cerrarModalEdicion = () => {
        setMostrarModalEdicion(false);
      };


      //Lógica deshabilitar Usuario.
  const eliminarUsuario = async (Id_Deduccion) => {
    try {
      const confirmacion = await Swal.fire({
        title: "¿Estás seguro?",
        text: "¿Deseas eliminar/deshabilitar el deducción?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar/deshabilitar",
        cancelButtonText: "Cancelar",
        allowOutsideClick: false
      });

      if (confirmacion.isConfirmed) {
        const response = await fetch(`http://localhost:3001/deshabilitarDeduccion/${Id_Deduccion}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const updatedList = deduccionesLista.filter(deduccion => deduccion.Id_Deduccion !== Id_Deduccion);
          setLista(updatedList);

          Swal.fire({
            title: "¡Éxito!",
            text: "La deducción ha sido eliminado/deshabilitado correctamente.",
            icon: "success",
            confirmButtonText: "Aceptar",
          });
        } else {
          throw new Error("Error en la solicitud");
        }
      }
    } catch (error) {
      console.error("Error al eliminar/deshabilitar la deducción:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error al eliminar/deshabilitar la deducción. Por favor, intenta de nuevo.',
      });
    }
  };


  return  (
    <div data-maintenance-usuario="true" className="maintenance-container">
      {cargando ? (
        <div className="loading">Cargando...</div>
      ) : (
        <>
          <section className="formulario">
            <h1 className="mr-5 ml-5 mt-5">MANTENIMIENTO DEDUCCIONES</h1>
            <p></p>
            <div className="form-buttons">
              <div className="search-container">
                <i className='bx bx-search icon'></i>
                <input
                  type="text"
                  placeholder="Buscar por Motivo de Deducción"
                  className="search-input"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              <button className="submit" onClick={abrirModalNuevo}>NUEVA DEDUCCIÓN</button>
              <button className="submit"> Generar Informe</button>
            </div>

            {/*Tabla de las deducciones creadas en la bd */}
            <section className="tabla-usuarios">
              <table className="table table-hover table-bordered" id="tblUsuarios">
                <thead>
                  <tr>
                    <th>Motivo de Deducción</th>
                    <th>Porcentaje de Reducir (%)</th>
                    <th>Descripción</th>
                    <th>Estado Deduccion</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {usuariosEnPagina.length > 0 ? (
                    usuariosEnPagina.map((val, key) => {
                      return (
                        <tr key={key}>
                          <th>{val.Nombre_Deduccion}</th>
                          <th>{parseFloat(val.Porcentaje_Monto).toFixed(2)}</th>
                          <th>{val.Descripcion}</th>
                          <th>{val.Estado_Deduccion}</th>
                          <td> 
                            <div className="button-container">
                            <button className="submit icon-button" onClick={() => abrirModalEdicion(val.Id_Deduccion)}>
                                <FontAwesomeIcon icon={faEdit} /> {/* Icono de editar */}
                              </button>
                              <button className="submit icon-button"  onClick={() => eliminarUsuario(val.Id_Deduccion)}>
                                <FontAwesomeIcon icon={faTrash} /> {/* Icono de eliminar */}
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
          {/* Modal para el formulario de Nueva Deducción */}
          {mostrarModalNuevo && (
            <div className="modal-container">
              <div className="modal-content">
                <span className="close-button" onClick={cerrarModalNuevo}>&times;</span>
             <NuevaDeduccion onClose={cerrarModalNuevo} />
              </div>
            </div>
          )}
          {/* Modal para el formulario de Editar Deduccion */}
          {mostrarModalEdicion && (
            <div className="modal-container">
              <div className="modal-content">
                <span className="close-button" onClick={cerrarModalEdicion}>&times;</span>
                {/* Pasar el ID del usuario al componente EditarUsuario */}
           <EditarDeduccion onClose={cerrarModalEdicion} Id_Deduccion={usuarioSeleccionado} />  
          </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MantenimientoDeducciones;

