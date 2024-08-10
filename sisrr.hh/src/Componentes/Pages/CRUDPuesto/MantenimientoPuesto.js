import React, { useState, useEffect } from "react";
import axios from "axios";
import "./mantenimientoPuesto.css";
import NuevoPuesto from "./NuevoPuesto.js";
import EditarPuesto from "./EditarPuesto.js";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faDownload } from "@fortawesome/free-solid-svg-icons";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import useStore from "../store";
import logo from '../../Images/Consisa.png'; // Ajusta la ruta según la ubicación del archivo


const MantenimientoPuesto = () => {
  const [puestoLista, setLista] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [puestoSeleccionado, setPuestoSeleccionado] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const usuariosPorPagina = 5;

  const [mostrarInforme, setMostrarInforme] = useState(false);
  const [informeData, setInformeData] = useState([]);

 


  

  const traerPuestos = async () => {
    try {
      setCargando(true);
      const response = await axios.get("http://localhost:3001/traerPuestos");
      setLista(response.data);
    } catch (error) {
      console.error("Error al obtener los puestos:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al obtener los puestos. Por favor, intenta de nuevo.",
      });
    } finally {
      setCargando(false);
    }
  };
  useEffect(() => {
    traerPuestos();
  }, []);


  const listaFiltrada = puestoLista.filter((puesto) => {
    return (
      puesto.Nombre_puesto.toLowerCase().includes(busqueda.toLowerCase()) ||
      puesto.Id_Puesto.toString().toLowerCase().includes(
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

  const abrirModalEdicion = async (puestoId) => {
    setPuestoSeleccionado(puestoId);
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
        "http://localhost:3001/traerBitacoraObjetosMantenimientopuesto"
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
    const header = "Reporte de Puestos";
    const subtitle = "Listado de Mantenimiento de Puestos";
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

    doc.save("Reporte de Puestos.pdf");
  };
  


  return (
    <div data-maintenance-puesto="true" className="maintenance-container">
      {cargando ? (
        <div className="loading">Cargando...</div>
      ) : (
        <>
          <section className="formulario">
            <h1 className="mr-5 ml-5 mt-5">MANTENIMIENTO DE PUESTOS</h1>
            <p></p>
            <div className="form-buttons">
              <div className="search-container">
                <i className="bx bx-search icon"></i>
                <input
                  type="text"
                  placeholder="Buscar puesto..."
                  className="search-input"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              <button className="submit" onClick={abrirModal}>
                {/*disabled={permisos.Permiso_insertar !== "1"/*Si no es True el valor, o sea que pueda crear, no aparecera en pantalla */}
                NUEVO
              </button>
              <button className="submit" onClick={generarInforme}>
                Generar Informe
              </button>
            </div>
            <section className="tabla-puesto">
              <table
                className="table table-hover table-bordered"
                id="tblUsuarios"
              >
                <thead>
                  <tr>

                    <th>Nombre Puesto</th>
                    <th>Nombre Jefe</th>
                    <th>Salario Inicial</th>
                    <th>Techo Salario</th>
                    <th>Requisitos </th>
                    <th>Descripcion </th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosEnPagina.length > 0 ? (
                    usuariosEnPagina.map((val, key) => {
                      return (
                        <tr key={key}>
                          <th>{val.Nombre_puesto}</th>
                          <th>{val.Nombre_Jefe}</th>
                          <th>{val.Salario_inicial}</th>
                          <th>{val.Techo_salario}</th>
                          <th>{val.Requisitos_puesto}</th>
                          <th>{val.Descripcion_puesto}</th>
                         
                          <td>
                            <div className="button-container">
                              <button
                                className="submit icon-button"
                                onClick={() =>
                                  abrirModalEdicion(val.Id_Puesto)
                                }
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              {/* <button
                                className="submit icon-button"
                                onClick={() => eliminarUsuario(val.Id_usuario)}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button> */}
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
          {/* Modal para el formulario de NuevoUsuario */}
          {mostrarModalNuevo &&  (
            <div className="modal-container">
              <div className="modal-content">
                <span className="close-button" onClick={cerrarModal}>
                  &times;
                </span>
                <NuevoPuesto onClose={() => { cerrarModal(); traerPuestos();}} />
              </div>
            </div>
          )}
          {/* Modal para el formulario de EditarUsuario */}
          {mostrarModalEdicion &&   (
            <div className="modal-container">
              <div className="modal-content">
                <span className="close-button" onClick={cerrarModalEdicion}>
                  &times;
                </span>
                <EditarPuesto
                  onClose={() => {cerrarModalEdicion();traerPuestos();}}
                  Id_Puesto={puestoSeleccionado}
                />
              </div>
            </div>
          )}
          {/* Modal para mostrar el informe */}
          {mostrarInforme && (
  <section className="formulario">
    <div className="modal-container">
      <div className="modal-content">
        <span className="close-button" onClick={cerrarInforme}>&times;</span>
        <h1 className="mr-5 ml-5 mt-5">INFORME DE MANTENIMIENTO DE PUESTOS</h1>
        <p></p>
        <section className="tabla-puesto">
          <table className="table table-hover table-bordered" id="tblInformeUsuario">
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

export default MantenimientoPuesto;