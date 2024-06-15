//mantenimientoemp

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./mantenimientoEmpleado.css";
import CrearEmpleado from "./CrearEmpleado.js";
import EditarEmpleado from "./EditarEmpleado.js";
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faDownload } from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import useStore from "../store";

const MantenimientoEmpleado = () => {
  const [empleadoLista, setLista] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const empleadoPorPagina = 5;

  const [mostrarInforme, setMostrarInforme] = useState(false);
  const [informeData, setInformeData] = useState([]);

//VERIFICACION DE PERMISOS
const id_Objeto = "5"; //Id de la pantalla ya definida por la BD
// Obtiene el ID de rol del usuario del store
const id_Rol = useStore((state) => state.Id_rol);

const verificarPermiso = async (id_Objeto, id_Rol) => {
  console.log("Rol:", id_Rol);
  console.log("Objeto:", id_Objeto);
  try {
    const response = await axios.get(
      `http://localhost:3001/verificarPermiso/${id_Objeto}/${id_Rol}`
    );
    const permisos = response.data;

    // Devuelve los permisos
    return permisos;
  } catch (error) {
    console.error("Error al verificar permisos:", error);
    return [];
  }
};

  const traerEmpleados = async () => {
    try {
      setCargando(true);
      const response = await axios.get("http://localhost:3001/traerEmpleados");
      setLista(response.data);
    } catch (error) {
      console.error("Error al obtener los Empleados:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error al obtener los empleados. Por favor, intenta de nuevo.',
      });
    } finally {
      setCargando(false);
    }
  };
  
  useEffect(() => {
    traerEmpleados();
  }, []);

  const listaFiltrada = empleadoLista.filter((empleado) => {
    const empleadoLowerCase = empleado.Apellido.toLowerCase() || '';
    const nombreLowerCase = empleado.Nombre?.toLowerCase() || '';    
    const casaLowerCase = empleado.Direccion_vivienda?.toLowerCase() || '';
    const estadoLowerCase = empleado.Estado?.toLowerCase() || '';

    return (
      empleadoLowerCase.includes(busqueda.toLowerCase()) ||
      nombreLowerCase.includes(busqueda.toLowerCase())||
      casaLowerCase.includes(busqueda.toLowerCase())||
      estadoLowerCase.includes(busqueda.toLowerCase())
      
    );
  });
  

  const indiceUltimoEmpleado = paginaActual * empleadoPorPagina;
  const indicePrimerEmpleado = indiceUltimoEmpleado - empleadoPorPagina;
  const empleadoEnPagina = listaFiltrada.slice(indicePrimerEmpleado, indiceUltimoEmpleado );
  const numeroTotalPaginas = Math.ceil(listaFiltrada.length / empleadoPorPagina);

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
  };

  const abrirModal = async () => {
   
      setMostrarModalNuevo(true);
      };

  const cerrarModal = () => {
    setMostrarModalNuevo(false);
  };

  const abrirModalEdicion = async (empleadoId) => {
    setEmpleadoSeleccionado(empleadoId);
    setMostrarModalEdicion(true);
  };

  const cerrarModalEdicion = () => {
    setMostrarModalEdicion(false);
  };

  const cerrarInforme = () => {
    setMostrarInforme(false);
    setInformeData([]);
  };

  const eliminarEmpleado= async (Id_Empleado) => {
    try {
      const confirmacion = await Swal.fire({
        title: "¿Estás seguro?",
        text: "¿Deseas eliminar/deshabilitar el empleado?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar/deshabilitar",
        cancelButtonText: "Cancelar",
        allowOutsideClick: false
      });

      if (confirmacion.isConfirmed) {
        const response = await fetch(`http://localhost:3001/deshabilitarEmpleado/${Id_Empleado}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          traerEmpleados();
          Swal.fire({
            title: "¡Éxito!",
            text: "El empleado ha sido eliminado/deshabilitado correctamente.",
            icon: "success",
            confirmButtonText: "Aceptar",
          });
        } else {
          throw new Error("Error en la solicitud");
        }
      }
    } catch (error) {
      console.error("Error al eliminar/deshabilitar el empleado:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error al eliminar/deshabilitar el empleado. Por favor, intenta de nuevo.',
      });
    }
  };

  const generarInforme = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/traerBitacoraObjetosMantenimientoempleado"
      );
      const bitacoraOrdenada = response.data.reverse();
      const dataConNombreUsuario = bitacoraOrdenada.map(item => ({
        ...item,
        NombreUsuario: item.NombreUsuario // Esto asume que el nombre de usuario ya se está incluyendo correctamente en los datos recibidos del backend
      }));
      setInformeData(dataConNombreUsuario);

      setMostrarInforme(true);
    } catch (error) {
      console.error("Error al generar el reporte:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al generar el reporte. Por favor, intenta de nuevo.",
      });
    }
  };

  const descargarInformePDF = () => {
    const doc = new jsPDF();
    const header = "Reporte de Empleados";
    const columns = ["Nombre de Usuario", "Fecha", "Descripción"]; 
    const rows = informeData.map(item => {
      // Damos formato a la fecha
      const formattedDate = new Date(item.Fecha).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
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
      theme: 'striped',
      styles: {
        fontSize: 10,
        cellPadding: 2,
      },
    });
  
    doc.save("ReporteEmpleados.pdf");
  };

  return (
    <div data-maintenance-empleado="true" className="maintenance-container">
      {cargando ? (
        <div className="loading">Cargando...</div>
      ) : (
        <>
          <section className="formulario">
            <h1 className="mr-5 ml-5 mt-5">MANTENIMIENTO EMPLEADOS</h1>
            <p></p>
            <div className="form-buttons">
              <div className="search-container">
                <i className='bx bx-search icon'></i>
                <input
                  type="text"
                  placeholder="Buscar por Nombre"
                  className="search-input"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              <button className="submit" onClick={abrirModal}>NUEVO</button>
              <button className="submit" onClick={generarInforme}>Generar Informe</button>
            </div>
            <section className="tabla-empleado">
              <table className="table table-hover table-bordered" id="tblEmpleado">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Direccion</th>
                    <th>Telefono</th>
                    <th>Salario</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {empleadoEnPagina.length > 0 ? (
                    empleadoEnPagina.map((val, key) => {
                      return (
                        <tr key={key}>
                          <th>{val.Nombre}</th>
                          <th>{val.Apellido}</th>
                          <th>{val.Direccion_vivienda}</th>
                          <th>{val.Numero_contacto}</th>
                          <th>{val.Salario}</th>
                          <th>{val.Estado}</th>
                          <td>
                            <div className="button-container">
                              <button className="submit icon-button" onClick={() => abrirModalEdicion(val.Id_Empleado)}>
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button className="submit icon-button" onClick={() => eliminarEmpleado(val.Id_Empleado)}>
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr key="no-results">
                      <td colSpan="7">
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
                <button key={index} onClick={() => cambiarPagina(index + 1)}>{index + 1}</button>
              ))}
            </div>
          </section>
          {/* Modal para el formulario de NuevoEmpleado */}
          {mostrarModalNuevo && (
            <div className="modal-container">
              <div className="modal-content">
                <span className="close-button" onClick={cerrarModal}>&times;</span>
                <CrearEmpleado onClose={() => { cerrarModal(); traerEmpleados(); }} />
              </div>
            </div>
          )}
          {/* Modal para el formulario de EditarEmpleado */}
          {mostrarModalEdicion && (
            <div className="modal-container">
              <div className="modal-content">
                <span className="close-button" onClick={cerrarModalEdicion}>&times;</span>
                <EditarEmpleado onClose={() => { cerrarModalEdicion(); traerEmpleados(); }} Id_Empleado={empleadoSeleccionado} />
              </div>
            </div>
          )}
          {/* Modal para mostrar el informe */}
          {mostrarInforme && (
  <section className="formulario">
    <div className="modal-container">
      <div className="modal-content">
        <span className="close-button" onClick={cerrarInforme}>&times;</span>
        <h1 className="mr-5 ml-5 mt-5">REPORTE DE MANTENIMIENTO DE EMPLEADO</h1>
        <p></p>
        <section className="tabla-empleado">
          <table className="table table-hover table-bordered" id="tblEmpleado">
            <thead>
              <tr> 
                <th>Usuario</th> {/* Cambiado de "NombreUsuario" a "Usuario" */} 
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
  
  export default MantenimientoEmpleado;

