import React, { useState, useEffect } from "react";
import "jspdf-autotable";
import axios from "axios";
import "./CRUDUsuario/mantenimientoUsuario.css";
import Swal from "sweetalert2";
import "./bitacora.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faArrowLeft,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import jsPDF from "jspdf";
import logo from "../Images/Consisa.png"; // Reemplaza con la ruta a tu imagen de logo

const Bitacora = () => {
  const [bitacoraLista, setBitacoraLista] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 10;

  useEffect(() => {
    const traerBitacora = async () => {
      try {
        setCargando(true);
        let url = "http://localhost:3001/traerBitacora";
        if (fechaInicio && fechaFinal) {
          url += `?fechaInicio=${fechaInicio}&fechaFinal=${fechaFinal}`;
        }
        const response = await axios.get(url);
        const bitacoraOrdenada = response.data.reverse();
        setBitacoraLista(bitacoraOrdenada);
      } catch (error) {
        console.error("Error al obtener la bitácora:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Hubo un error al obtener la bitácora. Por favor, intenta de nuevo.",
        });
      } finally {
        setCargando(false);
      }
    };
    traerBitacora();
  }, [fechaInicio, fechaFinal]);

  const handlePaginaAnterior = () => {
    if (paginaActual > 1) {
      setPaginaActual(paginaActual - 1);
    }
  };

  const handlePaginaSiguiente = () => {
    const numeroTotalPaginas = Math.ceil(
      bitacoraLista.length / registrosPorPagina
    );
    if (paginaActual < numeroTotalPaginas) {
      setPaginaActual(paginaActual + 1);
    }
  };

  const descargarInformePDF = async () => {
    const doc = new jsPDF();
    const empresa = "Listado de Actividades de Bitacora del: "; // Reemplaza con el nombre de tu empresa
    const fechaActual = new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }); // Obtener la fecha actual en formato dd/mm/yyyy
    const header = "GRUPO CONSISA HN";
    const headerFontSize = 18;
    const headerTextWidth =
      (doc.getStringUnitWidth(header) * headerFontSize) /
      doc.internal.scaleFactor;
    const empresaFontSize = 12;
    const empresaTextWidth =
      (doc.getStringUnitWidth(empresa) * empresaFontSize) /
      doc.internal.scaleFactor;

    // Obtener los datos de la tabla
    let url = "http://localhost:3001/traerBitacora";
    if (fechaInicio && fechaFinal) {
      url += `?fechaInicio=${fechaInicio}&fechaFinal=${fechaFinal}`;
    }
    try {
      const response = await axios.get(url);
      const bitacoraOrdenada = response.data.reverse();
      let rows = bitacoraOrdenada.map((item) => [
        item.Id_bitacora,
        item.NombreUsuario,
        item.Id_Objeto,
        new Date(item.Fecha).toLocaleDateString("es-ES", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
        item.Accion,
        item.Descripcion,
      ]);

      // Filtrar los datos si se ha especificado un rango de fechas
      if (fechaInicio && fechaFinal) {
        const fechaInicioFormato = new Date(fechaInicio)
          .toISOString()
          .slice(0, 10);
        const fechaFinalFormato = new Date(fechaFinal)
          .toISOString()
          .slice(0, 10);
        rows = rows.filter((item) => {
          const itemFechaFormato = new Date(item[3]).toISOString().slice(0, 10);
          return (
            itemFechaFormato >= fechaInicioFormato &&
            itemFechaFormato <= fechaFinalFormato
          );
        });
        if (rows.length === 0) {
          Swal.fire({
            icon: "warning",
            title: "Advertencia",
            text: "No hay registros en el rango de fechas especificado.",
          });
          return;
        }
      }

      // Calcular el número total de páginas
      const numeroTotalPaginas = Math.ceil(rows.length / registrosPorPagina);

      // Agregar las páginas con los datos
      for (let i = 1; i <= numeroTotalPaginas; i++) {
        if (i > 1) {
          doc.addPage();
        }

        const startY = 40;

        const logoWidth = 35;
        const logoHeight = 5;
        // Agregar el logo
        doc.addImage(logo, "PNG", 10, 10, logoWidth, logoHeight);

        doc.setFontSize(headerFontSize);
        doc.setTextColor(40);
        doc.text(
          header,
          (doc.internal.pageSize.width - headerTextWidth) / 2,
          20
        );

        // Agregar el subtítulo
        const subtitle = "Listado de Bitácora del Sistema"; // Subtítulo que deseas agregar
        const subtitleFontSize = 14;
        doc.setFontSize(subtitleFontSize);
        doc.setTextColor(40);
        const subtitleTextWidth =
          (doc.getStringUnitWidth(subtitle) * subtitleFontSize) /
          doc.internal.scaleFactor;
        doc.text(
          subtitle,
          (doc.internal.pageSize.width - subtitleTextWidth) / 2,
          30
        ); // Ajustar posición vertical si es necesario

        doc.setFontSize(10);
        doc.autoTable({
          startY: startY,
          head: [
            [
              "ID Bitácora",
              "Nombre de Usuario",
              "ID Objeto",
              "Fecha",
              "Acción",
              "Descripción",
            ],
          ],
          body: rows.slice(
            (i - 1) * registrosPorPagina,
            i * registrosPorPagina
          ),
          theme: "striped",
          styles: {
            fontSize: 10,
            cellPadding: 2,
          },
          headStyles: {
            fillColor: [91, 25, 224], // Color de fondo del encabezado (ej. color azul en formato RGB)
            textColor: [255, 255, 255], // Color del texto del encabezado (ej. color blanco en formato RGB)
            fontStyle: "bold",
          },
          didDrawPage: function (data) {
            doc.setFontSize(10);
          
            // Fecha y hora en la esquina superior derecha
            const fechaYHora = `${fechaActual} ${new Date().toLocaleTimeString()}`;
            const margin = 10;
            doc.text(fechaYHora, doc.internal.pageSize.width - margin, 20, { align: 'right' });
  
            // Alineación del texto en el pie de página
            const textoPieDePagina = `${empresa} ${fechaActual} ${new Date().toLocaleTimeString()}`;
            doc.text(
              textoPieDePagina,
              doc.internal.pageSize.width - 10,
              doc.internal.pageSize.height - 10,
              { align: "right" }
            );
            doc.text(
              `Página ${i} de ${numeroTotalPaginas}`,
              data.settings.margin.left,
              doc.internal.pageSize.height - 10
            );
          },
        });
      }

      // Obtener la representación de la URL del documento PDF
      const pdfURL = doc.output("bloburl");

      // Abrir la URL del documento PDF en una nueva pestaña del navegador
      window.open(pdfURL, "_blank");
    } catch (error) {
      console.error("Error al obtener la bitácora:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al obtener la bitácora. Por favor, intenta de nuevo.",
      });
    }
  };

  // Calcular los registros que se muestran en la página actual
  const indexOfLastRegistro = paginaActual * registrosPorPagina;
  const indexOfFirstRegistro = indexOfLastRegistro - registrosPorPagina;
  const registrosActuales = bitacoraLista.slice(
    indexOfFirstRegistro,
    indexOfLastRegistro
  );

  return (
    <div
      data-maintenance-bitacora="true"
      className="maintenance-container-bitacora"
    >
      {cargando ? (
        <div className="loading">Cargando...</div>
      ) : (
        <>
          <section className="formulario">
            <h1 className="mr-5 ml-5 mt-5">BITÁCORA</h1>
            <p></p>
            <div className="form-buttons" style={{width:"700px"}}>
              <label className="custom-label">Fecha Inicio:</label>
              <input
                type="date"
                id="fechaInicio"
                name="fechaInicio"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />

              <label className="custom-label">Fecha Final:</label>
              <input
                type="date"
                id="fechaFinal"
                name="fechaFinal"
                value={fechaFinal}
                onChange={(e) => setFechaFinal(e.target.value)}
              />

              <button
                className="submit icon-button"
                onClick={descargarInformePDF}
              >
                <FontAwesomeIcon icon={faDownload} /> DESCARGAR INFORME DE
                BITACORA
              </button>
            </div>
            <section className="tabla-bitacora">
              <table
                className="table table-hover table-bordered"
                id="tblBitacora"
              >
                <thead>
                  <tr>
                    <th>No. Bitácora</th>
                    <th>Nombre de Usuario</th>
                    <th>Pantalla</th>
                    <th>Fecha</th>
                    <th>Acción</th>
                    <th>Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {bitacoraLista.length > 0 ? (
                    bitacoraLista
                      .slice(
                        (paginaActual - 1) * registrosPorPagina,
                        paginaActual * registrosPorPagina
                      )
                      .map((item) => (
                        <tr key={item.Id_bitacora}>
                          <td>{item.Id_bitacora}</td>
                          <td>{item.NombreUsuario}</td>
                          <td>{item.Objeto}</td>
                          <td>
                            {new Date(item.Fecha).toLocaleString("es-ES", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </td>
                          <td>{item.Accion}</td>
                          <td>{item.Descripcion}</td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center">
                        No hay registros
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
            {/* Paginación */}
            <div className="pagination">
              <button
                onClick={handlePaginaAnterior}
                style={{ marginRight: "20px" }}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <span>Página {paginaActual}</span>
              <button
                onClick={handlePaginaSiguiente}
                style={{ marginLeft: "20px" }}
              >
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
