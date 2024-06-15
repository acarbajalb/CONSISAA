import React, { useState, useEffect } from "react";
import "./crearEmpleado.css";
import Swal from "sweetalert2";
import useStore from "../store";

const CrearEmpleado = ({ onClose }) => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [Dni, setDni] = useState("");
  const [direccionVivienda, setDireccionVivienda] = useState("");
  const [salario, setSalario] = useState("");
  const [tipotelefono, setTipoTelefono] = useState([]);
  const [estadoCivil, setEstadoCivil] = useState([]);
  const [genero, setGenero] = useState([]);
  const [telefono, setTelefono] = useState("");

  //////////Uso de variable global
  const usuario = useStore((state) => state.usuario);
  const [creado_Por, setCreadoPor] = useState(usuario);

  //Variables de entorno para acciones de combobox
  const [generoSeleccionado, setGeneroSeleccionado] = useState(""); //Almacenara el genero seleccionado por el administrador
  const [generoErrorMensaje, setGeneroErrorMensaje] = useState(""); // Almacena el mensaje de error si no se ha seleccionado un genero

  const [estadoCivilSeleccionado, setEstadoCivilSeleccionado] = useState("");
  const [estadoCivilErrorMensaje, setEstadoCivilErrorMensaje] = useState("");

  //Acción tipo de telefono
  const [tipoTelefonoSeleccionado, setTipoTelefonoSeleccionado] = useState("");
  const [tipoTelefonoErrorMensaje, setTipoTelefonoErrorMensaje] = useState("");

  //Necesario para obtener el valor de la variable global.
  useEffect(() => {
    setCreadoPor(usuario);
  }, [usuario]);

  const [modalVisible, setModalVisible] = useState(true); // Estado para controlar la visibilidad del modal

  // Obtener estado civil desde el servidor al cargar el componente
  useEffect(() => {
    const obtenerEstadoCivil = async () => {
      try {
        const response = await fetch(
          "http://localhost:3001/obtenerEstadoCivil"
        );
        const data = await response.json();
        setEstadoCivil(data);
      } catch (error) {
        console.error("Error al obtener estado civil:", error.message);
      }
    };

    obtenerEstadoCivil();
  }, []);

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

  /* Obtener genero desde el servidor al cargar el componente*/
  useEffect(() => {
    const obtenerGenero = async () => {
      try {
        const response = await fetch("http://localhost:3001/obtenerGenero");
        const data = await response.json();
        setGenero(data);
      } catch (error) {
        console.error("Error al obtener los Generos:", error.message);
      }
    };

    obtenerGenero();
  }, []);

  //use effect para mostrar al cargar el componente los datos en el combo box
  useEffect(() => {
    const obtenerTipoTelefono = async () => {
      try {
        const response = await fetch(
          "http://localhost:3001/obtenerTipoTelefono"
        );
        const data = await response.json();
        setTipoTelefono(data);
      } catch (error) {
        console.error("Error al obtener los Tipo de telefono:", error.message);
      }
    };

    obtenerTipoTelefono();
  }, []);

  /* Obtener tipo telefono desde el servidor al cargar el componente*/
  useEffect(() => {
    const obtenerTipoTelefono = async () => {
      try {
        const response = await fetch(
          "http://localhost:3001/obtenerTipoTelefono"
        );
        const data = await response.json();
        setTipoTelefono(data);
      } catch (error) {
        console.error("Error al obtener los tipos telefonos:", error.message);
      }
    };

    obtenerTipoTelefono();
  }, []);

  //Inicio de la funcion CREAR
  const creacionEmpleado = async (event) => {
    event.preventDefault();

    if (!generoSeleccionado) {
      setGeneroErrorMensaje("Debe seleccionar una opcion en genero");
      return;
    }

    if (!estadoCivilSeleccionado) {
      setEstadoCivilErrorMensaje("Debe seleccionar una opcion en estado civil");
      return;
    }
    if (!tipoTelefonoSeleccionado) {
      setTipoTelefonoErrorMensaje(
        "Debe seleccionar una opcion en tipo de teléfono"
      ); // Aquí debería decir "tipo de teléfono" en lugar de "estado civil"
      return;
    }
    try {
      const response = await fetch("http://localhost:3001/crearEmpleado", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Id_Estado: 1,
          Id_EstadoCivil: obtenerIdCivil(estadoCivilSeleccionado),
          Id_Genero: obtenerIdGenero(generoSeleccionado),
          Nombre: nombre,
          Apellido: apellido,
          Dni: Dni,
          Direccion_vivienda: direccionVivienda,
          Salario: salario,
          Numero: telefono,
          Id_Tipo_Telefono: obtenerIdTipoTelefono(tipoTelefonoSeleccionado),
          Creado_por: creado_Por, // Aquí utilizamos el valor del usuario del estado global
          Modificado_por: creado_Por,
          Fecha_creacion: null,
          Fecha_modificacion: null,
        }),
      });

      if (response.ok) {
        // Cierra el modal
        setModalVisible(false);
        onClose(); // Cierra el modal completamente

        // Muestra la alerta de éxito después de cerrar el modal
        Toast.fire({
          icon: "success",
          title: "Área Empleado",
          text: `El Empleado ha sido creada con éxito`,
        });
      } else {
        throw new Error("Error en la solicitud");
      }
    } catch (error) {
      console.error("Error en la solicitud:", error.message);
    }
  };

  const validarGenero = (event) => {
    const opcionSelecionada = event.target.value;
    setGeneroErrorMensaje(
      opcionSelecionada ? "" : "Debe seleccionar un genero"
    );
    setGeneroSeleccionado(opcionSelecionada);
  };

  const obtenerIdGenero = (nombreGenero) => {
    const generoSeleccionado = genero.find(
      (generoo) => generoo.Nombre_Genero === nombreGenero
    );
    return generoSeleccionado ? generoSeleccionado.Id_Genero : null;
  };

  const validarTipoTelefono = (event) => {
    const opcionSelecionada = event.target.value;
    setTipoTelefonoErrorMensaje(
      opcionSelecionada ? "" : "Debe seleccionar un Tipo de telefono"
    );
    setTipoTelefonoSeleccionado(opcionSelecionada);
  };

  const obtenerIdTipoTelefono = (tipotelefonos) => {
    const TipoTelefonoSeleccionado = tipotelefono.find(
      (tipotelefon) => tipotelefon.Descripcion === tipotelefonos
    );
    return TipoTelefonoSeleccionado
      ? TipoTelefonoSeleccionado.Id_tipo_telefono
      : null;
  };

  const validarCivil = (event) => {
    const opcionSelecionada = event.target.value;
    setEstadoCivilErrorMensaje(
      opcionSelecionada ? "" : "Debe seleccionar un estado civil"
    ); // Aquí se establece el mensaje de error correctamente
    setEstadoCivilSeleccionado(opcionSelecionada);
  };

  const obtenerIdCivil = (nombreCivil) => {
    const estadoCivilSeleccionado = estadoCivil.find(
      (civil) => civil.Estado_civil === nombreCivil
    );
    return estadoCivilSeleccionado
      ? estadoCivilSeleccionado.Id_EstadoCivil
      : null;
  };

  const cancelarCreacion = () => {
    onClose(); // Llama a la función onClose pasada como prop desde MantenimientoEmpleado para cerrar el modal
  };

  const handleDniChange = (event) => {
    let inputValue = event.target.value.replace(/\D/g, "").substring(0, 14); // Solo números y máximo 14 caracteres

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
    setDni(formattedValue);
  };

  return (
    <form
      onSubmit={creacionEmpleado}
      className="Crear-Empleado"
      Crear-Empleado="true"
    >
      <h1 id="Titulo">CREAR EMPLEADO</h1>

      {/* Input para el nombre */}
      <div className="input-container">
        <div className="input-group">
          <input
            onChange={(event) => {
              setNombre(event.target.value);
            }}
            name="Nombre"
            type="text"
            className="textbox custom-input"
            maxLength={50}
            minLength={8}
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
            required
          />
          <label>Nombres del Empleado</label>
        </div>

        {/* Input para el apellido  */}
        <div className="input-group">
          <input
            onChange={(event) => {
              setApellido(event.target.value);
            }}
            name="Apellido"
            type="text"
            className="textbox custom-input"
            maxLength={50}
            minLength={8}
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
            required
          />
          <label>Apellidos del Empleado</label>
        </div>

        {/*Input para DNI*/}
        <div className="input-group">
          <input
            onChange={(event) => handleDniChange(event)} // Integración de la función handleDniChange
            value={Dni}
            name="Dni"
            type="text"
            spellCheck="false"
            className="textbox custom-input"
            maxLength={15}
            minLength={14}
            required
          />
          <label>Identidad</label>
        </div>

        <div className="input-group">
          <input
            onChange={(event) => {
              setSalario(event.target.value);
            }}
            name="Salario"
            type="text"
            spellCheck="false"
            className="textbox custom-input"
            maxLength={8}
            minLength={6}
            required
            onInput={(e) => {
              const regex = /[^\d]/g; // Expresión regular para aceptar solo números
              let inputValue = e.target.value.replace(regex, ""); // Reemplazar cualquier caracter no numérico con una cadena vacía
              if (inputValue.length > 0 && inputValue[0] === "0") {
                // Si el primer dígito es cero, elimínalo
                inputValue = inputValue.slice(1);
              }
              e.target.value = inputValue; // Asignar el valor modificado al campo de entrada
            }}
          />
          <label>Salario</label>
        </div>
      </div>

      <div className="input-container">
        
      <div className="input-group">
          <input
            onChange={(event) => {
              setTelefono(event.target.value);
            }}
            name="telefono"
            type="text"
            spellcheck="false"
            className="textbox custom-input"
            maxLength={8}
            minLength={8}
            required
            onInput={(e) => {
              const regex = /[^\d]/g; // Expresión regular para aceptar solo números
              e.target.value = e.target.value.replace(regex, ""); // Reemplazar cualquier caracter no numérico con una cadena vacía

              let inputValue = e.target.value; // Obtener el valor actual del input

              if (
                inputValue.length > 0 &&
                !["9", "8", "3", "2"].includes(inputValue[0])
              ) {
                // Si el primer dígito no es 9, 8, 3 o 2, eliminarlo
                inputValue = inputValue.slice(1);
              }

              e.target.value = inputValue; // Actualizar el valor del input
            }}
          />
          <label>Num. Telefono</label>
        </div>
        {/* Selección de Tipo de telefono*/}

        <div className="flex-row">
          <label className="custom-label">
            Tipo de telefono:
            <select
              className="input custom-select"
              onChange={validarTipoTelefono}
              value={tipoTelefonoSeleccionado}
              required
            >
              <option value="">Selecciona...</option>
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
              className="input custom-select"
              onChange={validarGenero}
              value={generoSeleccionado}
              required
            >
              <option value="">Selecciona...</option>
              {genero.map((generoObject, index) => (
                <option key={index} value={generoObject.Nombre_Genero}>
                  {generoObject.Nombre_Genero}
                </option>
              ))}
            </select>
          </label>

          <label className="custom-label">
            Estado Civil:
            <select
              className="input custom-select"
              onChange={validarCivil}
              value={estadoCivilSeleccionado}
              required
            >
              <option value="">Selecciona...</option>
              {estadoCivil.map((civilObject, index) => (
                <option key={index} value={civilObject.Estado_civil}>
                  {civilObject.Estado_civil}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
 
      <div className="input-container">
        <div className="input-group">
          <input
            onChange={(event) => {
              setDireccionVivienda(event.target.value);
            }}
            name="Direccion_vivienda"
            Spellcheck="false"
            className="textbox custom-input"
            maxLength={100}
            minLength={8}
            style={{ width: "900px", height: "80px" }}
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

      {/*Creación de botones*/}

      <div className="form-buttons-crear">
        <button id="crear" type="submit">
          GUARDAR
        </button>
        <span className="button-spacing"></span> {/* Espacio entre botones */}
        <button id="cancelar" type="button" onClick={cancelarCreacion}>
          CANCELAR
        </button>
      </div>
    </form>
  );
};

export default CrearEmpleado;
