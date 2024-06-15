import React, { useState, useEffect } from "react";
import axios from "axios";
import "./mantenimientoSolicitudUsuario.css";
import NuevaSolicitudUsuario from "./NuevaSolicitudUsuario.js";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Swal from 'sweetalert2';
import {faDownload } from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Importacion de store.
import useStore from '../store';


const MantenimientoUsuario = () => {
  const [usuarioSolicitudLista, setusuarioSolicitudLista] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [vacacionesAcumuladas, setVacacionesAcumuladas] = useState(0);
  const [diasTomados, setDiasTomados] = useState(0);
  const usuariosPorPagina = 5;
  const [vacacionesDisponibles, setVacacionesDisponibles] = useState(0);

  const [mostrarInforme, setMostrarInforme] = useState(false);
  const [informeData, setInformeData] = useState([]);


  // Es aqui donde definimos constantes para que se puedan usar con los valores traídos de store.js
  const Id_usuario = useStore((state)=> state.Id_usuario); // Obtiene el Id del usuario.
  const usuario = useStore((state) => state.usuario); // Obtiene el usuario del store
  const Id_Empleado = useStore((state)=> state.Id_Empleado); // Obtiene el Id del usuario.


  //VERIFICAR LOGICA
// Dentro del useEffect donde traes las solicitudes

const traerSolicitudes = async () => {
  try {
    setCargando(true);
    const response = await axios.get(`http://localhost:3001/traerSolicitudes/${Id_Empleado}`);
    const solicitudes = response.data;
    
    // Filtrar solo las solicitudes con estado de solicitud igual a 2
    const solicitudesFiltradas = solicitudes.filter(solicitud => solicitud.Id_Estado_Solicitud === 2);
    
    // Calcular la duración de cada solicitud y sumarla en el acumulador
    let acumuladorDuracion = 0;
    solicitudesFiltradas.forEach(solicitud => {
      const fechaInicio = new Date(solicitud.Fecha_Inicio_Vacaciones);
      const fechaFin = new Date(solicitud.Fecha_Retorno_Vacaciones);
      // Calcular la duración en días, sumando 1 para incluir el día de inicio y el de retorno
      const duracionSolicitud = Math.ceil((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24)) + 1;
      acumuladorDuracion += duracionSolicitud;
    });
    
    // Actualizar el estado con todas las solicitudes
    setusuarioSolicitudLista(solicitudes);

    // Actualizar el estado con el acumulador de días tomados
    setDiasTomados(acumuladorDuracion);
  } catch (error) {
    console.error("Error al obtener las solicitudes:", error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Hubo un error al obtener las solicitudes. Por favor, intenta de nuevo.',
    });
  } finally {
    setCargando(false);
  }
};

useEffect(() => {


  traerSolicitudes();

}, [Id_Empleado]);





  useEffect(() => {
  const traerVacacionesAcumuladas = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/traerVacacionesAcumuladas/${Id_Empleado}`);
      // Verificar si se recibieron datos y si hay al menos un elemento en el array
      if (response.data && response.data.length > 0) {
        const primeraVacacion = response.data[0]; // Obtener el primer elemento del array
        const acumuladoVacaciones = primeraVacacion.Cantidad_Acumulada_Vacaciones; // Obtener el valor de la cantidad acumulada
        setVacacionesAcumuladas(acumuladoVacaciones); // Actualizar el estado con la cantidad acumulada de vacaciones
      }
    } catch (error) {
      console.error("Error al obtener las vacaciones acumuladas:", error);
    }
  };
  traerVacacionesAcumuladas();
}, [Id_Empleado]);


useEffect(() => {
  // Calculamos las vacaciones disponibles restando las vacaciones tomadas de las acumuladas
  const disponibles = vacacionesAcumuladas - diasTomados;
  setVacacionesDisponibles(disponibles);
}, [vacacionesAcumuladas, diasTomados]);

  

  //SE FILTRARA POR CAMPOS DIFERENTES
  const listaFiltrada = usuarioSolicitudLista.length>0 ? usuarioSolicitudLista.filter((usuarioSolicitud) => {
    return (
      usuarioSolicitud.Id_Estado_Solicitud.toString().toLowerCase().includes(busqueda.toLowerCase())     /*||
      usuarioSolicitud.Nombre_Completo_Usuario.toLowerCase().includes(busqueda.toLowerCase())*/
    );
  }) :[];


  //CAMBIAR VARIABLES
  const indiceUltimoUsuario = paginaActual * usuariosPorPagina;
  const indicePrimerUsuario = indiceUltimoUsuario - usuariosPorPagina;
  const usuariosEnPagina = listaFiltrada.slice(indicePrimerUsuario, indiceUltimoUsuario);
  const numeroTotalPaginas = Math.ceil(listaFiltrada.length / usuariosPorPagina);

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
  };

  const abrirModal = () => {
    setMostrarModalNuevo(true);
  };

  const cerrarModal = () => {
    setMostrarModalNuevo(false);
  };

  //Informe de Mantenimiento Usuario (Abrir y Cerrar)
  const cerrarInforme = () => {
    setMostrarInforme(false);
    setInformeData([]);
  };

  const generarInforme = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/traerBitacoraObjetosMantenimientomissolicitudes"
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
    const header = "Informe de mis solicitudes";
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
    <div data-maintenance-SolicitudUsuario="true" className="maintenance-container">
      {cargando ? (
        <div className="loading">Cargando...</div>
      ) : (
        <>
          <section className="formulario">
            <h1 className="mr-5 ml-5 mt-5">SOLICITE VACACIONES</h1>
            <p></p>
            <div className="form-buttons">
              <div className="search-container">
                <i className='bx bx-search icon'></i>
                <input
                  type="text"
                  placeholder="Buscar por Fecha o Estado"
                  className="search-input"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              <button className="submit" onClick={abrirModal} disabled={vacacionesDisponibles <= 0}>
                  NUEVO
              </button>
              <button className="submit" onClick={generarInforme}>Generar Informe</button>
            </div>
            
            <div className="form-buttons">
            <input
                style={{ marginLeft: "20px", width: "180px", height: "40px" }}
                type="text"
                placeholder="Cantidad de Vacaciones Acumuladas"
                className="vacaciones-input"
                value={`Acumuladas: ${vacacionesAcumuladas}`} // Aquí debería mostrar la cantidad acumulada de vacaciones
                readOnly // Hacer que el input sea de solo lectura para que no se pueda modificar manualmente
              />
              <input
                style={{ marginLeft: "20px", width: "180px", height: "40px" }}
                type="text"
                placeholder="Cantidad de Vacaciones Acumuladas"
                className="vacaciones-input"
                value={`Tomadas: ${diasTomados}`}  // Aquí debería mostrar la cantidad acumulada de vacaciones
                readOnly // Hacer que el input sea de solo lectura para que no se pueda modificar manualmente
              />
              <input
                style={{ marginLeft: "20px", width: "180px", height: "40px" }}
                type="text"
                placeholder="Cantidad de Vacaciones Acumuladas"
                className="vacaciones-input"
                value={`Disponibles: ${vacacionesDisponibles}`}  // Aquí debería mostrar la cantidad acumulada de vacaciones
                readOnly // Hacer que el input sea de solo lectura para que no se pueda modificar manualmente
              />
            </div>
            <section className="tabla-SolicitudUsuario">
              <table className="table table-hover table-bordered" id="tblSolicitudUsuario">
                <thead>
                  <tr>
                   <th>Estado de solcitud</th> 
                    <th>Fecha Inicio </th>
                    <th>Fecha Final </th>
                    <th>Fecha Retorno </th>
                    <th>Hora Inicio</th>
                    <th>Hora Final </th>
                    <th>Tiempo Parcial</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosEnPagina.length > 0 ? (
                    usuariosEnPagina.map((val, key) => {
                      return (
                        <tr key={key}>
                            <th>{val.Estado_Solicitud}</th> 
                            <th>{new Date(val.Fecha_Inicio_Vacaciones).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' })} {new Date(val.Fecha_Inicio_Vacaciones).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</th>
                            <th>{new Date(val.Fecha_Final_Vacaciones).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' })} {new Date(val.Fecha_Final_Vacaciones).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</th>
                            <th>{new Date(val.Fecha_Retorno_Vacaciones).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' })} {new Date(val.Fecha_Retorno_Vacaciones).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</th>
                            <th>{val.Hora_Inicio_Vacaciones}</th>
                            <th>{val.Hora_Final_Vacaciones}</th>
                            <th>{val.Tiempo_Parcial}</th>
                        </tr>
                      );///////////////////////////////////////////
                    })
                  ) : (
                    <tr key="no-results">
                      <td colSpan="8">
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
                {/* Modal para mostrar el informe */}
            {mostrarInforme && (
              <section className="formulario">
                <div className="modal-container">
                  <div className="modal-content">
                    <span className="close-button" onClick={cerrarInforme}>&times;</span>
                    <h1 className="mr-5 ml-5 mt-5">INFORME DE MANTENIMIENTO DE MIS SOLICITUDES</h1>
                    <p></p>
                    <section className="tabla-SolicitudUsuario">
                      <table className="table table-hover table-bordered" id="tblSolicitudUsuario">
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
              </div>
            </section>
            {/* Modal para el formulario de NuevoUsuario */}
            {mostrarModalNuevo && (
              <div className="modal-container">
                <div className="modal-content">
                  <span className="close-button" onClick={cerrarModal}>&times;</span>
                  
                  <NuevaSolicitudUsuario onClose={() => { cerrarModal(); traerSolicitudes(); }} />
                </div>
              </div>
            )}
         </>
        )}
      </div>
    );
  };
  
  export default MantenimientoUsuario;
  
