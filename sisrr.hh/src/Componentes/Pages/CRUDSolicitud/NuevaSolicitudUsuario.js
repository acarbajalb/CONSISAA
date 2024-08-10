import React, { useState, useEffect } from "react";
import "./nuevaSolicitudUsuario.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";
import useStore from "../store";

const NuevaSolicitudUsuario = ({ onClose }) => {

  const [tiempoParcial, setTiempoParcial] = useState("0");

   // SELECCION DE FECHA DE INICIO DE VACACIONES
   const [selectedfecha_inicio_vacaciones, setSeletedFecha_Inicio_Vacaciones] = useState(null); // Almacena la fecha de inicio de vacaciones seleccionada por el usuario.
   const [iniciovacacionesErrorMessage, setInicioVacacionesErrorMessage] = useState(""); // Almacena el mensaje de error si no se ha seleccionado fecha de inicio de vacaciones.
 
   // SELECCION DE FECHA DE FIN DE VACACIONES
   const [selectedfecha_final_vacaciones, setSeletedFecha_Final_Vacaciones] = useState(null); // Almacena la fecha de fin de vacaciones seleccionada por el usuario.
   const [finalvacacionesErrorMessage, setFinalVacacionesErrorMessage] = useState(""); // Almacena el mensaje de error si no se ha fecha de fin de vacaciones.
 
   // SELECCION DE HORA DE INICIO DE VACACIONES
   const [selectedhora_inicio_vacaciones, setSeletedHora_Inicio_Vacaciones] = useState(null); // Almacena la hora de inicio de vacaciones seleccionada por el usuario.
   const [horainiciovacacionesErrorMessage, setHoraInicioVacacionesErrorMessage] = useState(""); // Almacena el mensaje de error si no se ha seleccionado hora de inicio de vacaciones.
 
   // SELECCION DE HORA DE FIN DE VACACIONES
   const [selectedhora_final_vacaciones, setSeletedHora_Final_Vacaciones] = useState(null); // Almacena la hora de fin de vacaciones seleccionada por el usuario.
   const [horafinalvacacionesErrorMessage, setHoraFinalVacacionesErrorMessage] = useState(""); // Almacena el mensaje de error si no se ha hora de fin de vacaciones.
   
   //constante de store
   const Id_Empleado = useStore((state) => state.Id_Empleado);

   const [estadosolicitud, setEstadoSolicitud] = useState(3); //Estado de Solicitud por defecto
   const [fecharetorno, setFechaRetorno] = useState("");
   const [fechasolicitud, setFechaSolicitud] = useState("");
   const [modalVisible, setModalVisible] = useState(true); // Estado para controlar la visibilidad del modal


   //Calculo de Fecha de Retorno
  useEffect(() => {
    if (selectedfecha_final_vacaciones && tiempoParcial !== undefined) {
      const fechaRetorno = new Date(selectedfecha_final_vacaciones);
      if (!tiempoParcial) {
        fechaRetorno.setDate(fechaRetorno.getDate() + 1);
      }
      setFechaRetorno(fechaRetorno);
    }
  }, [selectedfecha_final_vacaciones, tiempoParcial]);


  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  });

  const formatDate = (date) => {
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
  
    if (month < 10) {
      month = `0${month}`;
    }
    if (day < 10) {
      day = `0${day}`;
    }
  
    return `${year}-${month}-${day}`;
  };

  const formatTime = (time) => {
    let hours = time.getHours();
    let minutes = time.getMinutes();
    let seconds = time.getSeconds();

    if (hours < 10) {
      hours = `0${hours}`;
    }
    if (minutes < 10) {
      minutes = `0${minutes}`;
    }
    if (seconds < 10) {
      seconds = `0${seconds}`;
    }

    return `${hours}:${minutes}:${seconds}`;
  };

  const creacionSolicitudVacaciones = async (event) => {
    event.preventDefault();

    const fechaInicioVacacionesFormatted = formatDate(selectedfecha_inicio_vacaciones);
    const fechaFinalVacacionesFormatted = formatDate(selectedfecha_final_vacaciones);
    const horaInicioVacacionesFormatted = formatTime(selectedhora_inicio_vacaciones);
    const horaFinalVacacionesFormatted = formatTime(selectedhora_final_vacaciones);
    
    if (!selectedfecha_inicio_vacaciones) {
      setInicioVacacionesErrorMessage("Debe seleccionar una Fecha de Inicio de Vacaciones");
      return;
    }

    if (!selectedfecha_final_vacaciones) {
      setFinalVacacionesErrorMessage("Debe seleccionar una Fecha de Fin de Vacaciones");
      return;
    }

    if (!selectedhora_inicio_vacaciones) {
      setHoraInicioVacacionesErrorMessage("Debe seleccionar una Hora de Inicio de Vacaciones");
      return;
    }

    if (!selectedhora_final_vacaciones) {
      setHoraFinalVacacionesErrorMessage("Debe seleccionar una Hora de Finalización de Vacaciones");
      return;
    }

    if (typeof tiempoParcial === 'undefined') {
      console.error("tiempoParcial no está definido");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/creacionSolicitud", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Id_Estado_Solicitud: estadosolicitud,
          Id_Empleado: Id_Empleado,
          Id_Tipo_Solicitud: "1",
          Fecha_Inicio_Vacaciones: fechaInicioVacacionesFormatted,
          Fecha_Final_Vacaciones: fechaFinalVacacionesFormatted,
          Hora_Inicio_Vacaciones: horaInicioVacacionesFormatted,
          Hora_Final_Vacaciones: horaFinalVacacionesFormatted,
          Fecha_Retorno_Vacaciones: fecharetorno,
          Tiempo_Parcial: tiempoParcial,//0 si no es tiempo parcial, 1 sisi
          Fecha_solicitud: "2024-03-16",
          Observaciones: "Listo",
          Creado_por: "Marilyn Mejia",
          Modificado_por: "Marilyn Mejia",
          Fecha_creacion: "2024-03-16",
          Fecha_modificacion: "2024-03-16",
        }),
      });

      if (response.ok) {
      // Cierra el modal
      setModalVisible(false);
      onClose(); // Cierra el modal completamente

      // Muestra la alerta de éxito después de cerrar el modal
      Toast.fire({
        icon: "success",
        title: "Solicitud Creada",
        text: `La Solicitud ha sido creada con éxito`,
      });

      } else {
        throw new Error("Error en la solicitud");
      }
    } catch (error) {
      console.error("Error en la solicitud:", error.message);
    }
  };

 
  const mostrarMensajeError = (titulo, mensaje) => {
    Toast.fire({
      title: titulo,
      text: mensaje,
      icon: "warning",
    });
  };

  const validarFechaInicio = (date) => {
    if (!date) {
      mostrarMensajeError("Error", "Debe seleccionar una Fecha de Inicio de Vacaciones");
      return;
    }
    
    if (selectedfecha_final_vacaciones && date >= selectedfecha_final_vacaciones) {
      mostrarMensajeError("Error", "La Fecha de Inicio debe ser anterior a la Fecha de Fin");
      return;
    }

    setSeletedFecha_Inicio_Vacaciones(date);
  };

  const validarFechaFinal = (date) => {
    if (!date) {
      mostrarMensajeError("Error", "Debe seleccionar una Fecha de Fin de Vacaciones");
      return;
    }
    
    if (selectedfecha_inicio_vacaciones && date <= selectedfecha_inicio_vacaciones) {
      mostrarMensajeError("Error", "La Fecha de Fin debe ser posterior a la Fecha de Inicio");
      return;
    }

    setSeletedFecha_Final_Vacaciones(date);
  };

  const validarHoraInicio = (time) => {
    setHoraInicioVacacionesErrorMessage(time ? "" : "Debe seleccionar una Hora de Inicio de Vacaciones");
    setSeletedHora_Inicio_Vacaciones(time);
  };

  const validarHoraFinal = (time) => {
    setHoraFinalVacacionesErrorMessage(time ? "" : "Debe seleccionar una Hora de Finalización de Vacaciones");
    setSeletedHora_Final_Vacaciones(time);
  };


  const submitFormulario = (event) => {
    event.preventDefault();

    if (!selectedfecha_inicio_vacaciones) {
      mostrarMensajeError("Fecha de Inicio", "Debe seleccionar una Fecha de Inicio de Vacaciones");
      return;
    }

    if (!selectedfecha_final_vacaciones) {
      mostrarMensajeError("Fecha de Fin", "Debe seleccionar una Fecha de Fin de Vacaciones");
      return;
    }

    if (!selectedhora_inicio_vacaciones) {
      mostrarMensajeError("Hora de Inicio", "Debe seleccionar una Hora de Inicio de Vacaciones");
      return;
    }

    if (!selectedhora_final_vacaciones) {
      mostrarMensajeError("Hora de Fin", "Debe seleccionar una Hora de Finalización de Vacaciones");
      return;
    }

    Swal.fire({
      title: "Confirmar Solicitud",
      text: "¿Está seguro de que desea enviar la solicitud?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        creacionSolicitudVacaciones(event);
      }
    });
  };

  const cancelarSolicitud = () => {
    onClose();
  };

  return (
    <form onSubmit={submitFormulario} className="CrearSolcitudUsuario"  Crear-SolicitudUsuario="true">
      <h1 id="Titulo">CREAR SOLICITUD</h1>

      <div className="datetime-container">
        <div className="input-container">
        <label>Fecha de Inicio de Vacaciones</label>
          <DatePicker
            selected={selectedfecha_inicio_vacaciones}
            onChange={validarFechaInicio}
            placeholderText="Fecha de Inicio de Vacaciones"
            className="textbox custom-input"
            dateFormat="yyyy-MM-dd"
            minDate={new Date()} // Establece la fecha mínima como la fecha actual
            required
            onKeyDown={(e) => e.preventDefault()} // Evita la entrada de texto
          />
          {iniciovacacionesErrorMessage && <p className="error-message">{iniciovacacionesErrorMessage}</p>}
        </div>
        <div className="input-container">
        <label>Fecha de Fin de Vacaciones</label>
          <DatePicker
            selected={selectedfecha_final_vacaciones}
            onChange={validarFechaFinal}
            placeholderText="Fecha de Fin de Vacaciones"
            className="textbox custom-input"
            dateFormat="yyyy-MM-dd"
            required
            onKeyDown={(e) => e.preventDefault()} // Evita la entrada de texto
            minDate={new Date()} // Establece la fecha mínima como la fecha actual
          />
          {finalvacacionesErrorMessage && <p className="error-message">{finalvacacionesErrorMessage}</p>}
        </div>
      </div>

      <div className="datetime-container">
        <div className="input-container">
        <label>Hora de Inicio de Vacaciones</label>
          <DatePicker
            selected={selectedhora_inicio_vacaciones}
            onChange={validarHoraInicio}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            placeholderText="Hora de Inicio de Vacaciones"
            timeCaption="Hora de Inicio de Vacaciones"
            dateFormat="h:mm aa"
            className="textbox custom-input"
            required
            onKeyDown={(e) => e.preventDefault()} // Evita la entrada de texto
          />
          {horainiciovacacionesErrorMessage && <p className="error-message">{horainiciovacacionesErrorMessage}</p>}
        </div>
        <div className="input-container">
        <label>Hora de Fin de Vacaciones</label>
          <DatePicker
            selected={selectedhora_final_vacaciones}
            onChange={validarHoraFinal}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            placeholderText="Hora de Fin de Vacaciones"
            timeCaption="Hora de Finalización de Vacaciones"
            dateFormat="h:mm aa"
            className="textbox custom-input"
            required
            onKeyDown={(e) => e.preventDefault()} // Evita la entrada de texto
          />
          {horafinalvacacionesErrorMessage && <p className="error-message">{horafinalvacacionesErrorMessage}</p>}
        </div>
      </div>

      <div className="datetime-container">
        <div className="checkbox-container">
          <div className="estado-container">
            <input
             type="checkbox"
             checked={tiempoParcial === "1"}
             onChange={(e) => setTiempoParcial(e.target.checked ? "1" : "0")} // Cambiado a string
            />
          </div>
          <span className="estado-label">Tiempo Parcial</span>
        </div>

        <div className="input-container">
        <label>Fecha de Retorno</label>
          <DatePicker
            selected={fecharetorno}
            placeholderText="Fecha de Retorno"
            dateFormat="yyyy-MM-dd"
            className="textbox custom-input"
            readOnly
            required
          />
        </div>
      </div>

      <div className="form-buttons-crear">
        <button id="crear" type="submit">
          GUARDAR
        </button>
        <span className="button-spacing"></span>
        <button id="cancelar" type="button" onClick={cancelarSolicitud}>
          CANCELAR
        </button>
      </div>
    </form>
  );
};

export default NuevaSolicitudUsuario;
