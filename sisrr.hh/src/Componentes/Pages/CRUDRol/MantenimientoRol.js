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
import logo from '../../Images/Consisa.png'; // Ajusta la ruta según la ubicación del archivo



const MantenimientoRol = () => {
  const [rolLista, setLista] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [rolSeleccionado, setRolSeleccionado] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const rolPorPagina = 5;

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

  const listaFiltrada = rolLista.filter((rol) => {
    return (
      (rol?.Rol?.toLowerCase() ?? '').includes(busqueda.toLowerCase()) ||
      (rol?.Rol?.toLowerCase() ?? '').includes(busqueda.toLowerCase())
    );
  });
  

  const indiceUltimoRol = paginaActual * rolPorPagina;
  const indicePrimerRol= indiceUltimoRol - rolPorPagina;
  const rolEnPagina = listaFiltrada.slice(indicePrimerRol, indiceUltimoRol);
  const numeroTotalPaginas = Math.ceil(listaFiltrada.length / rolEnPagina);

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
        text: "¿Deseas deshabilitar el rol?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, deshabilitar ",
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
          const updatedList = rolLista.filter(Rol => Rol.Id_Rol !== idRol);
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
        "http://localhost:3001/traerBitacoraObjetosMantenimientorol"
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
    const header = "Reporte de Roles del Sistema";
    const subtitle = "Listado de Roles del Sistema";
    const empresa = "GRUPO CONSISA HN";
    const fechaActual = new Date().toLocaleDateString(); // Obtener la fecha actual en formato dd/mm/yyyy
    const logoWidth = 35;
    const logoHeight = 5;
  
    const columns = [
      "Nombre de Usuario",
      "Fecha",
      "Descripción"
    ];
  
    const rows = informeData.map((item) => {
      const formattedDate = new Date(item.Fecha).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
  
      return [item.NombreUsuario, formattedDate, item.Descripcion];
    });
  
    // Calcula el número total de páginas
    const registrosPorPagina = 10;
    const numeroTotalPaginas = Math.ceil(rows.length / registrosPorPagina);
  
    // Agregar las páginas con los datos
    for (let i = 1; i <= numeroTotalPaginas; i++) {
      if (i > 1) {
        doc.addPage();
      }
  
      const startY = 40;
  
      // Agregar el logo
      doc.addImage(logo, 'PNG', 10, 10, logoWidth, logoHeight);
  
      // Encabezado
      doc.setFontSize(18);
      doc.setTextColor(40);
      doc.text(header, (doc.internal.pageSize.width - doc.getStringUnitWidth(header) * 18 / doc.internal.scaleFactor) / 2, 20);
  
      // Subtítulo
      doc.setFontSize(14);
      doc.setTextColor(40);
      doc.text(subtitle, (doc.internal.pageSize.width - doc.getStringUnitWidth(subtitle) * 14 / doc.internal.scaleFactor) / 2, 30);
  
      // Tabla
      doc.setFontSize(10);
      doc.autoTable({
        startY: startY,
        head: [columns],
        body: rows.slice((i - 1) * registrosPorPagina, i * registrosPorPagina),
        theme: "striped",
        styles: {
          fontSize: 10,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [91, 25, 224], // Color de fondo del encabezado
          textColor: [255, 255, 255], // Color del texto del encabezado
          fontStyle: 'bold',
        },
        didDrawPage: function (data) {
          doc.setFontSize(10);
          
          // Fecha y hora en la esquina superior derecha
          const fechaYHora = `${fechaActual} ${new Date().toLocaleTimeString()}`;
          const margin = 10;
          doc.text(fechaYHora, doc.internal.pageSize.width - margin, 20, { align: 'right' });

          // Alineación del texto en el pie de página
          const textoPieDePagina = `${empresa} ${fechaActual} ${new Date().toLocaleTimeString()}`;
          doc.text(textoPieDePagina, doc.internal.pageSize.width - 10, doc.internal.pageSize.height - 10, { align: 'right' });
          doc.text(`Página ${i} de ${numeroTotalPaginas}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
        }
      });
    }
  
    // Obtener la representación de la URL del documento PDF
    const pdfURL = doc.output('bloburl');
  
    // Abrir la URL del documento PDF en una nueva pestaña del navegador
    window.open(pdfURL, '_blank');
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
                  {rolEnPagina.length > 0 ? (
                    rolEnPagina.map((val, key) => {
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
                  <h1 className="mr-5 ml-5 mt-5">REPORTE DE MANTENIMIENTO DE ROLES</h1>
                  <p></p>
                  <section className="tabla-departamentos">
                  <table className="table table-hover table-bordered" id="tblDepartamentos">
                    <thead>
                      <tr>
                <th>Usuario</th> {/* Cambiado de "NombreUsuario" a "Usuario" */}
                <th>Fecha</th>
                <th>Acción</th>
                <th>Descripción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {informeData.map((item, index) => (
                        <tr key={index}>
                          <td>{item.NombreUsuario}</td>
                          <td>{new Date(item.Fecha).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' })} </td>
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