import React, { useState, useEffect } from "react";
import 'jspdf-autotable';
import axios from "axios";
import "./CRUDUsuario/mantenimientoUsuario.css";
import Swal from 'sweetalert2';
import "./bitacora.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';

const Bitacora = () => {
  const [bitacoraLista, setBitacoraLista] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [fechaEspecifica, setFechaEspecifica] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 10;

  useEffect(() => {
    const traerBitacora = async () => {
      try {
        setCargando(true);
        const url = fechaEspecifica ? `http://localhost:3001/traerBitacora?fecha=${fechaEspecifica}` : "http://localhost:3001/traerBitacora";
        const response = await axios.get(url);
        const bitacoraOrdenada = response.data.reverse();
        setBitacoraLista(bitacoraOrdenada);
      } catch (error) {
        console.error("Error al obtener la bitácora:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un error al obtener la bitácora. Por favor, intenta de nuevo.',
        });
      } finally {
        setCargando(false);
      }
    };
    traerBitacora();
  }, [fechaEspecifica]);

  const handlePaginaAnterior = () => {
    if (paginaActual > 1) {
      setPaginaActual(paginaActual - 1);
    }
  };

  const handlePaginaSiguiente = () => {
    const numeroTotalPaginas = Math.ceil(bitacoraLista.length / registrosPorPagina);
    if (paginaActual < numeroTotalPaginas) {
      setPaginaActual(paginaActual + 1);
    }
  };

  const descargarInformePDF = async () => {
    const doc = new jsPDF();
    const empresa = "Listado de Actividades de Bitacora del: "; // Reemplaza con el nombre de tu empresa
    const fechaActual = new Date().toLocaleDateString(); // Obtener la fecha actual en formato dd/mm/yyyy
    
    const header = "GRUPO CONSISA HN";
    const headerFontSize = 18;
    const headerTextWidth = doc.getStringUnitWidth(header) * headerFontSize / doc.internal.scaleFactor;
    const empresaFontSize = 12;
    const empresaTextWidth = doc.getStringUnitWidth(empresa) * empresaFontSize / doc.internal.scaleFactor;

    // Agregar logo en la esquina superior izquierda de la primera página
    const logoImg = new Image();
    logoImg.src = '../Images/Logo.png'; // Ruta a tu imagen de logo
    logoImg.onload = function() {
    doc.addImage(logoImg, 'PNG', 10, 10, 50, 50); // Ajusta las coordenadas y el tamaño según tu preferencia
    doc.save("bitacora.pdf"); // Guarda el documento PDF
    };
    
    // Centrar el texto "Informe de Bitácora"
    const marginLeft = (doc.internal.pageSize.width - headerTextWidth) / 2;
    doc.setFontSize(headerFontSize);
    doc.setTextColor(40);
    doc.text(header, marginLeft, 20);
    
    // Agregar el nombre de la empresa debajo del título
    const empresaMarginLeft = (doc.internal.pageSize.width - empresaTextWidth) / 2;
    doc.setFontSize(empresaFontSize);
    doc.text(empresa, empresaMarginLeft, 30);
    
    // Mostrar la fecha actual y la hora alineadas en la misma fila
    const fechaY = 30; // Posición Y para la fecha y hora
    const fechaHoraMarginLeft = empresaMarginLeft + empresaTextWidth + 3; // Ajuste de posición para la fecha y hora
    doc.setFontSize(10);
    doc.text(`${fechaActual} ${new Date().toLocaleTimeString()}`, fechaHoraMarginLeft, fechaY);
    
    // Obtener los datos de la tabla
    const url = fechaEspecifica ? `http://localhost:3001/traerBitacora?fecha=${fechaEspecifica}` : "http://localhost:3001/traerBitacora";
    try {
      const response = await axios.get(url);
      const bitacoraOrdenada = response.data.reverse();
      let rows = bitacoraOrdenada.map(item => [item.Id_bitacora, item.NombreUsuario, item.Id_Objeto, item.Fecha, item.Accion, item.Descripcion]);
      
      // Filtrar los datos si hay una fecha especificada
      if (fechaEspecifica) {
        const fechaEspecificaFormato = new Date(fechaEspecifica).toISOString().slice(0, 10);
        rows = rows.filter(item => {
          const itemFechaFormato = new Date(item[3]).toISOString().slice(0, 10);
          return itemFechaFormato === fechaEspecificaFormato;
        });
        if (rows.length === 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'No hay registros en la fecha especificada.',
          });
          return;
        }
      }
      
      // Generar la tabla
      doc.autoTable({
        startY: 40, // Posición Y después del título y el nombre de la empresa
        head: [["ID Bitácora", "Nombre de Usuario", "ID Objeto", "Fecha", "Acción", "Descripción"]],
        body: rows,
        theme: 'striped',
        styles: {
          fontSize: 10,
          cellPadding: 2,
        },
        didDrawPage: function (data) {
          // Establecer el número de página al pie de la página
          const pageNumber = data.pageNumber;
          doc.setFontSize(10);
          doc.text('Página ' + pageNumber, data.settings.margin.left, doc.internal.pageSize.height - 10);
        }
      });
      
      // Obtener la representación de la URL del documento PDF
      const pdfURL = doc.output('bloburl');

      doc.addPage(); // Agregar una nueva página al documento

      // Obtener el número total de páginas después de agregar la página
      const totalPagesExp = doc.internal.getNumberOfPages();
      doc.deletePage(totalPagesExp); // Eliminar la página agregada temporalmente

      // Agregar el número total de páginas al pie de cada página
      doc.autoTable({
        didDrawPage: function (data) {
          const pageNumber = data.pageNumber;
          doc.setFontSize(10);
          doc.text('Página ' + pageNumber + ' de ' + totalPagesExp, data.settings.margin.left, doc.internal.pageSize.height - 10);
        }
      });
      
      // Abrir la URL del documento PDF en una nueva pestaña del navegador
      window.open(pdfURL, '_blank');
    } catch (error) {
      console.error("Error al obtener la bitácora:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error al obtener la bitácora. Por favor, intenta de nuevo.',
      });
    }
  };
  
   

  return (
    <div data-maintenance-bitacora="true" className="maintenance-container-bitacora">
      {cargando ? (
        <div className="loading">Cargando...</div>
      ) : (
        <>
          <section className="formulario">
            <h1 className="mr-5 ml-5 mt-5">BITÁCORA</h1>
            <p></p>
            <div className="form-buttons">
              <label className="custom-label">Fecha:</label>
              <input
                type="date"
                id="fechaEspecifica"
                name="fechaEspecifica"
                value={fechaEspecifica}
                onChange={(e) => setFechaEspecifica(e.target.value)}
              />

              <button className="submit icon-button" onClick={descargarInformePDF}>
                <FontAwesomeIcon icon={faDownload} /> DESCARGAR INFORME DE BITACORA
              </button>
            </div>
            <section className="tabla-bitacora">
              <table className="table table-hover table-bordered" id="tblBitacora">
                <thead>
                  <tr>
                    <th># Bitácora</th>
                    <th>Nombre de Usuario</th>
                    <th>Pantalla</th>
                    <th>Fecha</th>
                    <th>Acción</th>
                    <th>Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {bitacoraLista.length > 0 ? (
                    bitacoraLista.slice((paginaActual - 1) * registrosPorPagina, paginaActual * registrosPorPagina).map((item) => (
                      <tr key={item.Id_bitacora}>
                        <td>{item.Id_bitacora}</td>
                        <td>{item.NombreUsuario}</td>
                        <td>{item.Objeto}</td>
                        <td> 
                        {new Date(item.Fecha).toLocaleString(
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
                        <td>{item.Accion}</td>
                        <td>{item.Descripcion}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center">No hay registros</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
            {/* Paginación */}
            <div className="pagination">
              <button onClick={handlePaginaAnterior} style={{marginRight: "20px"}}>
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <span>Página {paginaActual}</span>
              <button onClick={handlePaginaSiguiente} style={{marginLeft: "20px"}}>
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Bitacora;
