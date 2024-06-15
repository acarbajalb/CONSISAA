import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./editarEmpleado.css";
import useStore from "../store";

const EditarEmpleado = ({ onClose, Id_Empleado }) => {
  // Obtén el valor de usuario del estado global
  const usuario = useStore((state) => state.usuario);

  //Se definio el estado en grupo
  const [EmpleadoInfo, setEmpleado] = useState({
    Id_Estado: "",
    Estado: "",

    Id_EstadoCivil: "",
    Estado_civil: "",

    Id_Genero: "",
    Genero: "",

    Id_tipo_telefono: "",
    Descripcion: "",

    Nombre: "",
    Apellido: "",
    Dni: "",
    Direccion_vivienda: "",
    Salario: "",
    Numero: "",

    Modificado_por: "",
    Fecha_modificacion: "",
  });
  //VARIABLES DE ESTADO Y MANEJO DE MENSAJES DE ERRORRES DE LOS COMBOBOX
  const [EstadoCivil, setEstadoCivil] = useState([]); // Estado para almacenar la lista de Estados civiles.
  const [Genero, setGenero] = useState([]); // Estado para almacenar la lista de generos.
  const [tipotelefono, setTipoTelefono] = useState([]); // Estado para almacenar la lista de Tipo de telefono.
  const [estado, setEstado] = useState([]); // Estado para almacenar la lista de Estado.

  const [selectedEstadoCivil, setSelectedEstadoCivil] = useState(""); // Estado para almacenar el rol seleccionado.
  const [EstadoCivilErrorMessage, setEstadoCivilErrorMessage] = useState("");

  const [selectedGenero, setSelectedGenero] = useState("");
  const [GeneroErrorMessage, setGeneroErrorMessage] = useState("");

  const [selectedTipoTelefono, setSelectedTipoTelefono] = useState("");
  const [TipoTelefonoErrorMessage, setTipoTelefonoErrorMessage] = useState("");

  const [selectedEstado, setSelectedEstado] = useState("");
  const [EstadoErrorMessage, setEstadoErrorMessage] = useState("");

  const [modalVisible, setModalVisible] = useState(true); // Estado para controlar la visibilidad del modal

  //Lógica de despliegue de comboBox

  // Método para obtener el ID del genero seleccionado
  const obtenerIdGenero = (genero) => {
    const generoSeleccionado = Genero.find(
      (generos) => generos.Nombre_Genero === genero
    );
    return generoSeleccionado ? generoSeleccionado.Id_Genero : null;
  };

  const validarGenero = (event) => {
    const selectedOption = event.target.value;
    const errorMessage = selectedOption ? "" : "Debes seleccionar un Genero";
    setGeneroErrorMessage(errorMessage);
    setSelectedGenero(selectedOption);
    setEmpleado((prevEmpleadoInfo) => ({
      ...prevEmpleadoInfo,
      Id_Genero: selectedOption ? obtenerIdGenero(selectedOption) : "",
    }));
  };

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

  // Método para obtener el ID del Estado Civil seleccionado
  const obtenerIdEstadoCivil = (estadoCivil) => {
    const estadoCivilSeleccionado = EstadoCivil.find(
      (estadosCiviles) => estadosCiviles.Estado_civil === estadoCivil
    );
    return estadoCivilSeleccionado
      ? estadoCivilSeleccionado.Id_EstadoCivil
      : null;
  };

  const validarEstadoCivil = (event) => {
    const selectedOption = event.target.value;
    const errorMessage = selectedOption
      ? ""
      : "Debes seleccionar un Estado Civil";
    setEstadoCivilErrorMessage(errorMessage);
    setSelectedEstadoCivil(selectedOption);
    setEmpleado((prevEmpleadoInfo) => ({
      ...prevEmpleadoInfo,
      Id_EstadoCivil: selectedOption
        ? obtenerIdEstadoCivil(selectedOption)
        : "",
    }));
  };

  // Método para obtener el ID del Tipo de Telefono seleccionado
  const obtenerIdTipoTelefono = (tipoTelefono) => {
    const tipotelefonoSeleccionado = tipotelefono.find(
      (tiposTelefonos) => tiposTelefonos.Descripcion === tipoTelefono
    );
    return tipotelefonoSeleccionado
      ? tipotelefonoSeleccionado.Id_tipo_telefono
      : null;
  };

  const validarTipoTelefono = (event) => {
    const selectedOption = event.target.value;
    const errorMessage = selectedOption
      ? ""
      : "Debes seleccionar un Tipo de Telefono";
    setTipoTelefonoErrorMessage(errorMessage);
    setSelectedTipoTelefono(selectedOption);
    setEmpleado((prevEmpleadoInfo) => ({
      ...prevEmpleadoInfo,
      Id_tipo_telefono: selectedOption
        ? obtenerIdTipoTelefono(selectedOption)
        : "",
    }));
  };

  // Método para obtener el ID del Estado del Empleado seleccionado
  const obtenerIdEstado = (estados) => {
    const EstadoSeleccionado = estado.find(
      (estadoos) => estadoos.Estado === estados
    );
    return EstadoSeleccionado ? EstadoSeleccionado.Id_Estado : null;
  };

  const validarEstado = (event) => {
    const selectedOption = event.target.value;
    const errorMessage = selectedOption ? "" : "Debes seleccionar un Estado";
    setEstadoErrorMessage(errorMessage);
    setSelectedEstado(selectedOption);
    setEmpleado((prevEmpleadoInfo) => ({
      ...prevEmpleadoInfo,
      Id_Estado: selectedOption ? obtenerIdEstado(selectedOption) : "",
    }));
  };

  //funcion para obtener la informacion/registros del id enviado como parametro.
  useEffect(() => {
    const obtenerEmpleado = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/Id_Empleado/${Id_Empleado}`
        );
        const data = await response.json();
        // Actualizar el estado con los datos del usuario obtenidos de la API
        setEmpleado(data);
        // Obtener el nombre del puesto y del rol para establecerlos como seleccionados
        const GeneroSeleccionado = Genero.find(
          (Genero) => Genero.Id_Genero === data.Id_Genero
        );

        const EstadoCivilSeleccionado = EstadoCivil.find(
          (Estado_civil) => Estado_civil.Id_EstadoCivil === data.Id_EstadoCivil
        );

        const TipoTelefonoSeleccionado = tipotelefono.find(
          (TipoTelefono) =>
            TipoTelefono.Id_tipo_telefono === data.Id_tipo_telefono
        );

        const EstadoSeleccionado = estado.find(
          (Estado) => Estado.Id_Estado === data.Id_Estado
        );

        if (GeneroSeleccionado) {
          setSelectedGenero(GeneroSeleccionado.Nombre_Genero);
        }
        if (EstadoCivilSeleccionado) {
          setSelectedEstadoCivil(data.Estado_civil);
        }

        if (TipoTelefonoSeleccionado) {
          setSelectedTipoTelefono(TipoTelefonoSeleccionado.Descripcion);
        }

        if (EstadoSeleccionado) {
          setSelectedEstado(EstadoSeleccionado.Estado);
        }
      } catch (error) {
        console.error(
          "Error al obtener la información del empleado:",
          error.message
        );
      }
    };
    obtenerEmpleado();
  }, [Id_Empleado, estado, EstadoCivil, Genero, tipotelefono]);

  //Use effect con la unica funcion de traer genero,tipo de telefono y estadocivil de la db
  useEffect(() => {
    const obtenerEstadoCivil = async () => {
      try {
        const response = await fetch(
          "http://localhost:3001/obtenerEstadoCivil"
        );
        const data = await response.json();
        setEstadoCivil(data);
      } catch (error) {
        console.error("Error al obtener el estado civil:", error.message);
      }
    };

    obtenerEstadoCivil();
  }, []);

  //
  useEffect(() => {
    const obtenerGenero = async () => {
      try {
        const response = await fetch("http://localhost:3001/obtenerGenero");
        const data = await response.json();
        setGenero(data);
      } catch (error) {
        console.error("Error al obtener los generos:", error.message);
      }
    };

    obtenerGenero();
  }, []);

  //
  useEffect(() => {
    const obtenerTipoTelefono = async () => {
      try {
        const response = await fetch(
          "http://localhost:3001/obtenerTipoTelefono"
        );
        const data = await response.json();
        setTipoTelefono(data);
      } catch (error) {
        console.error("Error al obtener los tipo telefonos:", error.message);
      }
    };

    obtenerTipoTelefono();
  }, []);

  //Estado Empleado
  useEffect(() => {
    const obtenerEstado = async () => {
      try {
        const response = await fetch("http://localhost:3001/obtenerEstado");
        const data = await response.json();
        setEstado(data);
      } catch (error) {
        console.error(
          "Error al obtener el estado del empleado:",
          error.message
        );
      }
    };

    obtenerEstado();
  }, []);

  const cancelarEdicion = () => {
    //cierra el formulario-------
    onClose();
  };

  // Función para manejar el envío del formulario de edición
  const editarEmpleado = async (event) => {
    event.preventDefault();
    try {
      // Verificar si algún campo del formulario está vacío
      const camposVacios = Object.values(EmpleadoInfo).some(
        (value) => value === ""
      );
      if (camposVacios) {
        // Mostrar alerta de campos vacíos
        Toast.fire({
          icon: "warning",
          title: "Campos incompletos",
          text: "Por favor, completa todos los campos obligatorios antes de guardar.",
        });
        return; // Salir de la función sin enviar la solicitud
      }

      // Actualizar el estado del empleado con la fecha de modificación actual
      setEmpleado((prevState) => ({
        ...prevState,
        Modificado_por: usuario, // También podrías querer actualizar el usuario que realizó la modificación
      }));

      const confirmacion = await Swal.fire({
        title: "¿Estás seguro?",
        text: "¿Deseas editar el registro?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, editar",
        cancelButtonText: "Cancelar",
      });
      if (confirmacion.isConfirmed) {
        const response = await fetch(
          `http://localhost:3001/editarEmpleado/${Id_Empleado}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ...EmpleadoInfo, Modificado_por: usuario }),
          }
        );
        if (response.ok) {
          // Cierra el modal
          setModalVisible(false);
          onClose(); // Cierra el modal completamente

          // Muestra la alerta de éxito después de cerrar el modal
          Toast.fire({
            icon: "success",
            title: "Empleado Editado",
            text: `El Empleado ha sido editado con éxito`,
          });
        } else {
          throw new Error("Error en la solicitud");
        }
      }
    } catch (error) {
      console.error("Error al editar el empleado:", error.message);
      alert("Error al editar el empleado");
    }
  };

  // Función para manejar el cambio de valor en los inputs.
  const handleChange = (event) => {
    const { name, value } = event.target;

    // Verificar si el nombre del campo es "Dni"
    if (name === "Dni") {
      let inputValue = value.replace(/\D/g, "").substring(0, 14); // Solo números y máximo 14 caracteres

      // Validación para evitar más de 4 dígitos consecutivos iguales
      if (/(.)\1{3,}/.test(inputValue)) {
        // Si hay más de 4 dígitos consecutivos iguales, actualiza el valor del campo sin los dígitos extras
        inputValue = inputValue.replace(/(.)\1{3,}/g, "$1$1$1$1");
      }

      let formattedValue = "";
      for (let i = 0; i < inputValue.length; i++) {
        if (i === 4) {
          formattedValue += "-";
        }
        formattedValue += inputValue[i];
        if (i === 7) {
          formattedValue += "-";
        }
      }
      // Si el valor tiene menos de 15 caracteres, actualízalo directamente
      if (inputValue.length <= 15) {
        setEmpleado((prevState) => ({
          ...prevState,
          [name]: formattedValue,
        }));
      }
    } else {
      // Para otros campos simplemente actualiza el estado con el valor ingresado
      setEmpleado((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  return (
    <form className="EditarEmpleado" Editar-Empleado="true">
      <h1>EDITAR EMPLEADO</h1>
      <div className="input-container">
        <div className="input-group">
          <input
            name="Nombre"
            type="text"
            value={EmpleadoInfo.Nombre} // Asignar el valor del usuario al input
            spellCheck="false"
            className="textbox custom-input"
            onChange={handleChange}
            maxLength={50}
            minLength={2}
            required
            onInput={(e) => {
              // Obtener el valor del input
              let value = e.target.value;

              // Eliminar caracteres especiales
              value = value.replace(/[^a-zA-ZñÑ ]/g, "");

              // Eliminar un mismo caracter mas de dos veces seguidas
              value = value.replace(/([a-zA-Z0-9])\1{2,}/g, "$1$1");

              // Limitar a un solo espacio
              value = value.replace(/\s+/g, " ");

              // Convertir a mayúsculas
              value = value.toUpperCase();

              // Asignar el valor modificado al input
              e.target.value = value;
            }}
          />
          <label>Nombres del Empleado</label>
        </div>

        <div className="input-group">
          <input
            spellCheck="false"
            type="text"
            name="Apellido"
            value={EmpleadoInfo.Apellido} // Asignar el valor del usuario al input
            className="textbox custom-input"
            onChange={handleChange}
            maxLength={50}
            minLength={2}
            required
            onInput={(e) => {
              // Obtener el valor del input
              let value = e.target.value;

              // Eliminar caracteres especiales
              value = value.replace(/[^a-zA-ZñÑ ]/g, "");

              // Eliminar un mismo caracter mas de dos veces seguidas
              value = value.replace(/([a-zA-Z0-9])\1{2,}/g, "$1$1");

              // Limitar a un solo espacio
              value = value.replace(/\s+/g, " ");

              // Convertir a mayúsculas
              value = value.toUpperCase();

              // Asignar el valor modificado al input
              e.target.value = value;
            }}
          />
          <label>Apellidos del Empleado</label>
        </div>

        <div className="input-group">
          <input
            spellCheck="false"
            type="text"
            name="Dni"
            value={EmpleadoInfo.Dni} // Asignar el valor del usuario al input
            className="textbox custom-input"
            onChange={handleChange}
            maxLength={15}
            minLength={14}
            required
          />
          <label>Identidad</label>
        </div>

        <div className="input-group">
          <input
            name="Numero"
            type="text"
            value={EmpleadoInfo.Numero} // Asignar el valor del nombre completo al input
            spellCheck="false"
            className="textbox custom-input"
            onChange={handleChange}
            maxLength={8}
            minLength={7}
            required
            onInput={(e) => {
              const regex = /[^\d]/g; // Expresión regular para aceptar solo números
              e.target.value = e.target.value.replace(regex, ""); // Reemplazar cualquier caracter no numérico con una cadena vacía
            }}
          />
          <label>Num. Telefono</label>
        </div>

        <div className="input-group">
          <input
            type="text"
            value={EmpleadoInfo.Salario} // Asignar el valor del nombre completo al input
            spellCheck="false"
            name="Salario"
            className="textbox custom-input"
            onChange={handleChange}
            maxLength={9}
            required
            onInput={(e) => {
              let inputValue = e.target.value;

              // Eliminar cualquier caracter que no sea un dígito
              const regex = /[^\d]/g;
              inputValue = inputValue.replace(regex, "");

              // Eliminar el primer dígito si es cero
              if (inputValue.length > 0 && inputValue[0] === "0") {
                inputValue = inputValue.slice(1);
              }

              // Asignar el valor modificado al input
              e.target.value = inputValue;
            }}
          />
          <label>Salario</label>
        </div>
      </div>

      {/*Segunda fila*/}

      <div className="input-container">
        {/* Selección de genero */}
        <div className="flex-row">
          <label className="custom-label">
            TipoTelefono:
            <select
              name="TipoTelefono"
              className="inputGenero custom-select"
              value={selectedTipoTelefono}
              type="form-select"
              required
              onChange={validarTipoTelefono}
            >
              <option value="">Selecciona un Tipo telefono</option>
              {tipotelefono.map((tipotelefonoObject, index) => (
                <option key={index} value={tipotelefonoObject.Descripcion}>
                  {tipotelefonoObject.Descripcion}
                </option>
              ))}
            </select>
          </label>

          <label className="custom-label">
            Genero:
            <select
              name="Genero"
              className="inputGenero custom-select"
              value={selectedGenero}
              type="form-select"
              required
              onChange={validarGenero}
            >
              <option value="">Selecciona un genero</option>
              {Genero.map((generoObject, index) => (
                <option key={index} value={generoObject.Nombre_Genero}>
                  {generoObject.Nombre_Genero}
                </option>
              ))}
            </select>
          </label>

          <label className="custom-label">
            Estado:
            <select
              name="Estado"
              className="inputEstado custom-select"
              value={selectedEstado}
              type="form-select"
              required
              onChange={validarEstado}
            >
              <option value="">Selecciona un Estado</option>
              {estado.map((estadoObject, index) => (
                <option key={index} value={estadoObject.Estado}>
                  {estadoObject.Estado}
                </option>
              ))}
            </select>
          </label>

          {/* Selección de ESTADO CIVIL */}
          <label className="custom-label">
            EstadoCivil:
            <select
              name="EstadoCivil"
              className="inputEstadoCivil custom-select"
              value={selectedEstadoCivil}
              type="form-select"
              required
              onChange={validarEstadoCivil}
            >
              <option value="">Selecciona un Estado Civil</option>
              {EstadoCivil.map((estadoCivilObject, index) => (
                <option key={index} value={estadoCivilObject.Estado_civil}>
                  {estadoCivilObject.Estado_civil}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      {/*Tercer fila*/}

      <div className="input-container">
        <div className="input-group">
          <input
            name="Direccion_vivienda"
            spellCheck="false"
            className="textbox custom-input"
            value={EmpleadoInfo.Direccion_vivienda}
            onChange={handleChange}
            style={{  width: "900px", height: "80px" }}
            maxLength={100}
            minLength={8}
            required
            onInput={(e) => {
              // Obtener el valor del input
              let value = e.target.value;

              // Eliminar caracteres especiales excepto comas, almohadillas (#) y números
              value = value.replace(/[^a-zA-Z0-9,# ñÑ]/g, "");

              // Eliminar más de dos espacios consecutivos
              value = value.replace(/\s{3,}/g, "  ");

              // Convertir a mayúsculas
              value = value.toUpperCase();

              // Asignar el valor modificado al input
              e.target.value = value;
            }}
          />
          <label>Dirección de Residencia</label>
        </div>
      </div>

      <div className="form-buttons-editar">
        <button id="editar" type="submit" onClick={editarEmpleado}>
          GUARDAR
        </button>
        <span className="button-spacing"></span>
        <button id="cancelar" type="button" onClick={cancelarEdicion}>
          CANCELAR
        </button>
      </div>
    </form>
  );
};

export default EditarEmpleado;
