import React, { useState, useEffect } from "react";
import "./editarContrato.css";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import useStore from "../store";

const EditarContrato = ({ onClose, Id_Contrato }) => {

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });

  // Estado para controlar la visibilidad del modal
  const [modalVisible, setModalVisible] = useState(true);
  // Obtén el valor de usuario del estado global
  const usuario = useStore((state) => state.usuario);

  //Se definio el estado en grupo
  const [contratoInfo, setContratoInfo] = useState({
    Id_Tipo_Contrato: "",
    Cantidad_Acumulada_Vacaciones: "",
    Fecha_Contratacion: "",
    Fecha_Fin_Contrato: "",

    Nombre: "",

    Modificado_por: "",
    Fecha_modificacion: "",
  });


  
  // Estados para almacenar datos del contrato
  const [tiposcontratos, setTiposContratos] = useState([]);
  const [selectedfecha_contratacion, setSeletedFecha_Contratacion] = useState(null); // Almacena la fecha de contratacion.
  const [selectedfecha_fin_contrato, setSeletedFecha_Fin_Contrato] =  useState(null); // Almacena la fecha de fin de contrato.
  const [selectedtipo_contrato, setSeletedTipo_Contrato] = useState(null); // Almacena el tipo de contrato seleccionada por el usuario.
 
  
  const [idTipoContrato, setIdTipoContrato] = useState("");

  // Obtener Tipos de Contratos desde el servidor al cargar el componente
  useEffect(() => {
    const obtenerTiposContratos = async () => {
      try {
        const response = await fetch(
          "http://localhost:3001/obtenerTiposContratos"
        );
        const data = await response.json();
        setTiposContratos(data);
      } catch (error) {
        console.error(
          "Error al obtener los tipos de contratos:",
          error.message
        );
      }
    };

    obtenerTiposContratos();
  }, []);

  // Método para obtener el ID del puesto seleccionado
  const obtenerTipoContrato = (nombreContrato) => {
    const contratoSeleccionado = tiposcontratos.find(
      (contrato) => contrato.Nombre_Contrato === nombreContrato
    );
    return contratoSeleccionado ? contratoSeleccionado.Id_Tipo_Contrato : null;
  };

  //VALIDACIONES DE SELECCION DE COMBOBOX
  const validarTipoContrato = (event) => {
    const selectedOption = event.target.value;
    
     setSeletedTipo_Contrato(selectedOption);
    setContratoInfo((prevContratoInfo) => ({
      ...prevContratoInfo,
      Id_Tipo_Contrato: selectedOption
        ? obtenerTipoContrato(selectedOption)
        : "",
    }));
  };

  //funcion para obtener la informacion/registros del id enviado como parametro.
  useEffect(() => {
    const obtenerContrato = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/idContrato/${Id_Contrato}`
        );
        const data = await response.json();
        // Actualizar el estado con los datos del usuario obtenidos de la API
        setContratoInfo(data);
        //Conversion y adquisicion de los datos del combobox a string para insertarlos en los combobox correspondiente
        setIdTipoContrato(data.Id_Tipo_Contrato.toString());

        // Establecer las fechas seleccionadas para los DatePickers
        setSeletedFecha_Contratacion(new Date(data.Fecha_Contratacion));
        setSeletedFecha_Fin_Contrato(new Date(data.Fecha_Fin_Contrato));

        const TipoContratoSeleccionado = tiposcontratos.find(
          (contrato) => contrato.Id_Tipo_Contrato === data.Id_Tipo_Contrato
        );

        if (TipoContratoSeleccionado) {
          setSeletedTipo_Contrato(TipoContratoSeleccionado.Nombre_Contrato);
        }
      } catch (error) {
        console.error(
          "Error al obtener la información del usuario:",
          error.message
        );
      }
    };
    obtenerContrato();
  }, [Id_Contrato, tiposcontratos]);
 

  const validarFechaFinal = (date) => {
    if (selectedfecha_fin_contrato && date <= selectedfecha_fin_contrato) {
       Toast.fire({
        icon: "warning",
        title: "Fecha Incongruente",
        text: "La fecha de finalización debe ser posterior a la fecha de contratación.",
      });
      return;
    }
     setSeletedFecha_Fin_Contrato(date);
  };
// Método para formatear la fecha en el formato 'yyyy-MM-dd'
const formatDate = (date) => {
  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();

  if (month < 10) {
    month = `0${month}`;
  }
  if (day < 10) {
    day = `0${day}`;
  }
  if (hours < 10) {
    hours = `0${hours}`;
  }
  if (minutes < 10) {
    minutes = `0${minutes}`;
  }
  if (seconds < 10) {
    seconds = `0${seconds}`;
  }

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const editarContrato = async (event) => {
  event.preventDefault();

  try {
    // Alerta de confirmación antes de la edición
    const confirmacion = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Deseas editar el registro?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, editar",
      cancelButtonText: "Cancelar",
    });

    if (confirmacion.isConfirmed) {
      // Formatear la fecha de fin de contrato
      const fechaFinContratoFormatted = formatDate(selectedfecha_fin_contrato);

      // Convertir la fecha formateada a un string en formato ISO 8601
      const fechaFinContratoString = new Date(fechaFinContratoFormatted).toISOString();

      // Actualizar el estado del contrato con la fecha de modificación actual y la fecha de fin del contrato formateada
      setContratoInfo((prevState) => ({
        ...prevState,
        //Id_Tipo_Contrato: idTipoContrato,
        Modificado_por: usuario, // También podrías querer actualizar el usuario que realizó la modificación
        Fecha_Fin_Contrato: fechaFinContratoString, // Usar el string en lugar de la fecha formateada
      }));


      // Realizar la solicitud PUT para editar el contrato
      const response = await fetch(
        `http://localhost:3001/editarContrato/${Id_Contrato}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(contratoInfo),
        }
      );

      if (response.ok) {
        // Alerta de éxito después de la edición
        Swal.fire({
          title: "¡Éxito!",
          text: "El contrato ha sido editado exitosamente.",
          icon: "success",
          confirmButtonText: "Aceptar",
        }).then(() => {
          // Cierra el modal después de mostrar la alerta de éxito
          setModalVisible(false);
          onClose(); // Cierra el modal completamente
        });
      } else {
        Toast.fire({
          icon: "error",
          title: "Error",
          text: "Error al editar el contrato. Intentelo mas tarde" ,
        });        }
    }
  } catch (error) {
    
    console.error("Error al editar el contrato:", error.message); 
  }
};

  //Hasta el momento se mantiene el boton de cancelar solo unicamente para cerrar la pantalla de Editar Usuario
  const cancelarEdicion = () => {
    //cierra el formulario-------
    onClose();
  };

  //funcion creada para manejar el cambio de valor en los inputs.
  const handleChange = (event) => {
    const { name, value } = event.target;
    setContratoInfo((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <form onSubmit={editarContrato} className="EditarContrato">
      <h1 id="Titulo">EDITAR CONTRATO</h1>

      <div className="input-container">
      <div className="input-group">
          <input
            name="Empleado"
            type="text"
            readOnly
            value={contratoInfo.Nombre}
            onChange={handleChange}
            spellcheck="false"
            className="textbox custom-input"
            maxLength={15}
            required
            style={{backgroundColor: "#dedede", color: "#808080"}}
          />
      </div>

      <div className="flex-row">
      <label className="custom-label">
          Tipo de Contrato:
          <select
            className="inputPuesto custom-select-editar-contrato"
            onChange={validarTipoContrato}
            value={selectedtipo_contrato}
            type="form-select"
            required
          >
            <option value="">Selecciona un tipo de contrato</option>
            {tiposcontratos.map((tiposObject, index) => (
              <option key={index} value={tiposObject.Nombre_Contrato}>
                {tiposObject.Nombre_Contrato}
              </option>
            ))}
          </select>
        </label>
        </div>
    </div>

    <div className="input-container">
      <div className="input-group-fechas">
        <label>Fecha de Contratacion</label>
          <DatePicker
            readOnly
            selected={selectedfecha_contratacion}
            placeholderText="Fecha de Contratación"
            className="textbox custom-input"
            dateFormat="yyyy-MM-dd"
            required
            onKeyDown={(e) => e.preventDefault()} // Evita la entrada de texto
          />
         </div>
        <div className="input-group-fechas">
        <label>Fecha de Fin de Contrato</label>
          <DatePicker
            selected={selectedfecha_fin_contrato}
            onChange={validarFechaFinal}
            placeholderText="Fecha de Fin de Vacaciones"
            className="textbox custom-input"
            dateFormat="yyyy-MM-dd hh:mm:ss"
            required 
          />
         </div>
      </div>




      <div className="form-buttons-editar">
        <button id="crear" type="submit">
          Guardar
        </button>
        <span className="button-spacing"></span> {/* Espacio entre botones */}
        <button id="cancelar" type="button" onClick={cancelarEdicion}>
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default EditarContrato;