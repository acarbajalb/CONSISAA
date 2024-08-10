import React, { useState, useEffect } from "react";
import "./nuevoUsuario.css";
import Swal from "sweetalert2";
import useStore from "../store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const NuevoUsuario = ({ onClose }) => {
  //Textbox
  const [roles, setRoles] = useState([]);
  const [usuario, setUsuario] = useState("");
  const [nombreCompletoUsuario, setNombreCompletoUsuario] = useState("");
  const [Dni, setDni] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [confirmarContraseña, setConfirmarContraseña] = useState("");
  const [correo_Electronico, setCorreo_Electronico] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  //COMBOBOX
  const [idRol, setIdRol] = useState(""); //Almacena el ID del rol seleccionado.
  const [selectedRol, setSelectedRol] = useState(""); // Almacena el rol seleccionado por el usuario.
  const [rolErrorMessage, setRolErrorMessage] = useState(""); // Almacena el mensaje de error si no se ha seleccionado un rol.

  // SELECCION DE PUESTO DE USUARIO
  const [selectednombrePuesto, setSelectedNombrePuesto] = useState(""); //Almacena solo para n¿mostrar el nombre de puesto en pantalla
  const [selectedPuesto, setSelectedPuesto] = useState(""); // Almacena el puesto seleccionado por el usuario.
  const [puestoErrorMessage, setPuestoErrorMessage] = useState(""); //Almacena el mensaje de error si no se ha seleccionado un puesto.

  //////////Uso de variable global
  const user = useStore((state) => state.usuario);
  const [creado_Por, setCreadoPor] = useState(user);
  //Necesario para obtener el valor de la variable global.
  useEffect(() => {
    setCreadoPor(user);
  }, [user]);

  const [modalVisible, setModalVisible] = useState(true); // Estado para controlar la visibilidad del modal
  const [searchText, setSearchText] = useState(""); // Estado para almacenar el texto de búsqueda
  const [searchResults, setSearchResults] = useState([]); // Estado para almacenar los resultados de la búsqueda

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

  // Función para obtener el nombre del puesto por su nombre
  const handleSearch = async (event) => {
    const searchText = event.target.value;
    setSearchText(searchText);

    try {
      const response = await fetch(
        `http://localhost:3001/buscarPuestoPorNombre/${searchText}`
      );
      const data = await response.json();
      if (response.ok) {
        setSelectedPuesto(data.idPuesto);
        setSelectedNombrePuesto(data.nombre);
      } else {
        throw new Error(data.error || "Error al buscar puesto");
      }
    } catch (error) {
      Toast.fire({
        icon: "warning",
        title: "Inconsistencia en la busqueda",
        text: "Puesto no encontrado",
      });
    }
  };

  // Obtener roles desde el servidor al cargar el componente
  useEffect(() => {
    const obtenerRoles = async () => {
      try {
        const response = await fetch("http://localhost:3001/obtenerRoles");
        const data = await response.json();
        setRoles(data);
      } catch (error) {
        console.error("Error al obtener los roles:", error.message);
      }
    };

    obtenerRoles();
  }, []);

  // Función para obtener el nombre y apellido del empleado por su DNI
  async function obtenerNombreApellido(Dni) {
    try {
      const response = await fetch(
        `http://localhost:3001/obtenerNombreApellido/${Dni}`
      );
      if (!response.ok) {
        Toast.fire({
          icon: "warning",
          title: "Inconsistencias en la busqueda",
          text: "Empleado no encontrado",
        });
        return; // Se termina la ejecución de la función si hay un error
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al obtener nombre y apellido:", error.message);
      Toast.fire({
        icon: "warning",
        title: "Inconsistencias en la busqueda",
        text: "Empleado no encontrado",
      });
    }
  }
  //validacion de copiado y pegado
  const handleCP = (e) => {
    e.preventDefault();
  };

  // Función para validar el formulario antes de enviarlo
  const validarFormulario = () => {
    if (
      !Dni ||
      !nombreCompletoUsuario ||
      !usuario ||
      !contraseña ||
      !confirmarContraseña ||
      !correo_Electronico ||
      !selectedPuesto ||
      !selectedRol
    ) {
      Toast.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor, completa todos los campos obligatorios.",
      });
      return false; // Detiene el envío del formulario
    }
    return true; // Permite el envío del formulario
  };

  // Agregar el evento de cambio al campo DNI dentro del efecto de carga del componente
  useEffect(() => {
    const handleDNICambio = async () => {
      const DniInput = document.getElementById("Dni");
      const nombreCompletoInput = document.getElementById(
        "nombreCompletoUsuario"
      );

      try {
        const nombreCompleto = await obtenerNombreApellido(DniInput.value);
        nombreCompletoInput.value = nombreCompleto;
      } catch (error) {
        alert(error.message);
        nombreCompletoInput.value = ""; // Limpiar el campo de nombre completo si hay un error
      }
    };

    const DniInput = document.getElementById("Dni");
    if (DniInput) {
      DniInput.addEventListener("change", handleDNICambio);
    }

    return () => {
      const DniInput = document.getElementById("Dni");
      if (DniInput) {
        DniInput.removeEventListener("change", handleDNICambio);
      }
    };
  }, []);

  // Función para validar la seguridad de la contraseña
  const validarSeguridadContraseña = (password) => {
    // Expresiones regulares para verificar la seguridad de la contraseña
    const regexMayuscula = /[A-Z]/;
    const regexMinuscula = /[a-z]/;
    const regexNumero = /[0-9]/;
    const regexCaracterEspecial = /[$&+,:;=?@#|'<>.^*()%!-]/;

    // Verificar si la contraseña cumple con los requisitos
    const tieneMayuscula = regexMayuscula.test(password);
    const tieneMinuscula = regexMinuscula.test(password);
    const tieneNumero = regexNumero.test(password);
    const tieneCaracterEspecial = regexCaracterEspecial.test(password);

    // Retornar true si cumple con todos los requisitos, de lo contrario false
    return (
      tieneMayuscula && tieneMinuscula && tieneNumero && tieneCaracterEspecial
    );
  };

  //Inicio de la funcion CREAR
  const creacionUsuario = async (event) => {
    event.preventDefault();

    // Validar el formulario antes de enviarlo
    if (!validarFormulario()) {
      return; // Detiene la ejecución si el formulario no es válido
    }

    if (!contraseña || contraseña.length < 8) {
      Toast.fire({
        icon: "warning",
        title: "Contraseña muy corta",
        text: "Las contraseñas deben tener al menos 8 caracteres.",
      });
      return false;
    }

    if (contraseña !== confirmarContraseña) {
      Toast.fire({
        icon: "warning",
        title: "Las contraseñas no coinciden",
        text: "Por favor, verifica que las contraseñas sean iguales.",
      });
      return;
    }

    // Validar seguridad de la contraseña
    if (!validarSeguridadContraseña(contraseña)) {
      Toast.fire({
        icon: "warning",
        title: "Contraseña no segura",
        text: "La contraseña debe contener al menos 1 letra mayúscula, 1 minúscula, 1 número y 1s carácter especial.",
      });
      return;
    }

    // Validacion del correo electrónico
    const correoRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!correoRegex.test(correo_Electronico)) {
      Toast.fire({
        icon: "warning",
        title: "Correo electrónico no válido.",
        text: "Ingrese dato de manera correcta",
      });
      return;
    }

    // Validación de campos antes de enviar la solicitud
    if (!selectedRol) {
      setRolErrorMessage("Debes seleccionar una opción de Rol");
      return;
    }

    if (!selectedPuesto) {
      setPuestoErrorMessage("Debes seleccionar una opción de Puesto");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/creacionUsuario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Id_Rol: obtenerIdRol(selectedRol),
          Id_Puesto: selectedPuesto,
          Id_Empleado: null,
          Usuario: usuario,
          Nombre_Completo_Usuario: nombreCompletoUsuario,
          contraseña: contraseña,
          Primer_ingreso: null,
          Fecha_ultima_conexion: null,
          Correo_electronico: correo_Electronico,
          Fecha_vencimiento: "2024-02-12",
          Token: "131",
          Creado_por: creado_Por,
          Modificado_por: creado_Por,
          Fecha_creacion: null,
          Fecha_modificacion: null,
          Dni: Dni,
        }),
      });

      if (response.ok) {
        // Cierra el modal
        setModalVisible(false);
        onClose(); // Cierra el modal completamente

        // Muestra la alerta de éxito después de cerrar el modal
        Toast.fire({
          icon: "success",
          title: "Usuario Creado",
          text: `El Usuario ha sido creado con éxito`,
        });
      } else {
        throw new Error("Error en la solicitud");
      }
    } catch (error) {
      console.error("Error en la solicitud:", error.message);
      // Si el servidor responde con código de estado 409 (conflicto), significa que el usuario ya existe
       
      Toast.fire({
        title: "El nombre de usuario ya existe",
        text: "Ya existe un registro con ese nombre de usuario. Elija otro nombre de usuario.",
        icon: "error",
      });
    }
  };

  const validarRol = (event) => {
    const selectedOption = event.target.value;
    setRolErrorMessage(selectedOption ? "" : "Debes seleccionar un Rol");
    setSelectedRol(selectedOption);
  };

  const obtenerIdRol = (nombreRol) => {
    const rolSeleccionado = roles.find((rol) => rol.Rol === nombreRol);
    return rolSeleccionado ? rolSeleccionado.Id_Rol : null;
  };

  const cancelarCreacion = () => {
    onClose(); // Llama a la función onClose pasada como prop desde MantenimientoUsuario para cerrar el modal
  };

  const handleDniChange = async (event) => {
    // Obtener el valor del campo de entrada y limitarlo a solo números y máximo 14 caracteres
    let inputValue = event.target.value.replace(/\D/g, "").substring(0, 14); // Solo números y máximo 14 caracteres

    // Validación para evitar más de 4 dígitos consecutivos iguales
    if (/(.)\1{3,}/.test(inputValue)) {
      // Si hay más de 4 dígitos consecutivos iguales, actualiza el valor del campo sin los dígitos extras
      inputValue = inputValue.replace(/(.)\1{3,}/g, "$1$1$1$1");
    }

    // Inicializar la variable para almacenar el valor formateado del DNI
    let formattedValue = "";

    // Recorrer los caracteres del valor de entrada
    for (let i = 0; i < inputValue.length; i++) {
      // Insertar guiones en las posiciones 5 y 8
      if (i === 4) {
        formattedValue += "-";
      }
      formattedValue += inputValue[i];
      if (i === 7) {
        formattedValue += "-";
      }
    }

    // Actualizar el estado con el valor formateado del DNI
    setDni(formattedValue);

    try {
      // Obtener el nombre completo del empleado por su DNI
      const nombreCompleto = await obtenerNombreApellido(formattedValue);
      // Actualizar el estado con el nombre completo del usuario
      setNombreCompletoUsuario(nombreCompleto);
    } catch (error) {
      console.error("Error al obtener nombre completo:", error.message);
      // Limpiar el campo de nombre completo si hay un error
      setNombreCompletoUsuario("");
    }
  };

  return (
    <form
      onSubmit={creacionUsuario}
      className="CrearUsuario"
      Crear-Usuario="true"
    >
      <h1 id="Titulo">CREAR USUARIO</h1>

      <div className="input-container">
        <div className="input-group">
          <div className="search-container">
            <i className="bx bx-search icon"></i>
            <input
              type="text"
              placeholder="Busque el puesto por su nombre"
              className="search-input"
              value={searchText}
              onChange={handleSearch} // Llamar a la función handleSearch en cada cambio del input
            />
          </div>
        </div>

        <div className="input-group">
          <input
            name="Puesto"
            style={{
              backgroundColor: "#dedede",
              color: "#808080",
              borderColor: "#dedede",
              marginBottom: "20px",
            }}
            type="text"
            readOnly
            spellcheck="false"
            className="textbox custom-input"
            value={selectednombrePuesto}
            maxLength={15}
            required
            onCopy={handleCP}
            onCut={handleCP}
            onPaste={handleCP}
          />
        </div>
      </div>

      {/* Input para el usuario */}
      <div className="input-container">
        {/* Input para el Dni para hacer saber si el empleado esta creado y esta activo*/}
        <div className="input-group">
          <input
            onChange={(event) => handleDniChange(event)}
            name="Dni"
            id="Dni"
            type="text"
            value={Dni}
            spellcheck="false"
            className="textbox custom-input"
            maxLength={15}
            minLength={15}
            required
            onCopy={handleCP}
            onCut={handleCP}
            onPaste={handleCP}
          />
          <label>Identidad</label>
        </div>

        {/* Input para el nombre completo */}
        <div className="input-group">
          <input
            onChange={(event) => {
              setNombreCompletoUsuario(event.target.value);
            }}
            name="nombreCompletoUsuario"
            style={{
              backgroundColor: "#dedede",
              color: "#808080",
            }}
            id="nombreCompletoUsuario"
            type="text"
            className="textbox custom-input"
            maxLength={40} //Numero Maximo de Caracteres del Input 
            required //Campo Requerido
            onKeyDown={(e) => e.preventDefault()} // Evita la entrada de texto
            OnCopy={handleCP}
            onCut={handleCP}
            onPaste={handleCP}
          />
          <label>Nombre Completo del Usuario</label>
        </div>

        <div className="input-group">
          <input
            onChange={(event) => {
              setUsuario(event.target.value);
            }}
            name="usuarioNuevo"
            type="text"
            className="textbox custom-input"
            maxLength={15}
            onInput={(e) => {
              // Obtener el valor del input
              let value = e.target.value;

              // Eliminar caracteres especiales
              value = value.replace(/[^a-zA-Z ]/g, "");

              // Eliminar un mismo caracter mas de dos veces seguidas
              value = value.replace(/([a-zA-Z0-9])\1{2,}/g, "$1$1");

              // Eliminar espacios
              value = value.replace(/\s/g, "");

              // Convertir a mayúsculas
              value = value.toUpperCase();

              // Asignar el valor modificado al input
              e.target.value = value;
            }}
            required
          />
          <label>Nombre de Usuario</label>
        </div>
      </div>

      {/* Input para la contraseña */}
      <div className="input-container">
        <div className="input-group" style={{ width: "100%" }}>
          <input
            onChange={(event) => {
              setContraseña(event.target.value);
            }}
            name="contraseña"
            type={showPassword ? "text" : "password"}
            className="textbox custom-input"
            maxLength={30}
            minLength={8}
            required
            onCopy={handleCP}
            onCut={handleCP}
            onPaste={handleCP}
          />
          <label>Contraseña</label>

          <FontAwesomeIcon
            icon={showPassword ? faEye : faEyeSlash}
            onClick={() => setShowPassword(!showPassword)}
            className="eye-icon"
            style={{
              color: "#7f24f5",
              position: "absolute",
              top: "50%",
              transform: "translateY(-26%)",
              marginLeft: "40px",
              right: "15px",
              fontSize: "0.5em", // Ajusta el tamaño del icono de ojo aquí
            }}
          />
        </div>

        <div className="input-group" style={{ width: "100%" }}>
          <input
            onChange={(event) => {
              setConfirmarContraseña(event.target.value);
            }}
            name="confirmarContraseña"
            type={showPassword ? "text" : "password"}
            className="textbox custom-input"
            maxLength={30}
            minLength={8}
            required
            onCopy={handleCP}
            onCut={handleCP}
            onPaste={handleCP}
          />
          <label>Confirmar Contraseña</label>

          <FontAwesomeIcon
            icon={showPassword ? faEye : faEyeSlash}
            onClick={() => setShowPassword(!showPassword)}
            className="eye-icon"
            style={{
              color: "#7f24f5",
              position: "absolute",
              top: "50%",
              transform: "translateY(-26%)",
              marginLeft: "40px",
              right: "15px",
              fontSize: "0.5em", // Ajusta el tamaño del icono de ojo aquí
            }}
          />
        </div>

        {/* Input para el correo electrónico */}
        <div className="input-group">
          <input
            onChange={(event) => {
              setCorreo_Electronico(event.target.value);
            }}
            name="correo_Electronico"
            type="email"
            className="textbox custom-input"
            maxLength={50}
            required
            onCopy={handleCP}
            onCut={handleCP}
            onPaste={handleCP}
          />
          <label>Correo Electronico</label>
          {/*correoError && (
              <span className="error-message">{correoError}</span>
            )}{" "*/}
          {/* Muestra el mensaje de error si existe */}
        </div>
      </div>

      {/* Otro contenedor de inputs */}
      <div className="input-container">
        {/* Selección de ROL */}
        <label className="custom-label">
          Rol:
          <select
            className="inputRol custom-select"
            onChange={validarRol}
            value={selectedRol}
            type="form-select"
            required
          >
            <option value="">Selecciona un rol</option>
            {roles.map((rolObject, index) => (
              <option key={index} value={rolObject.Rol}>
                {rolObject.Rol}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/*Creación de botones*/}

      <div className="form-buttons-crear">
        <button id="crear" type="submit" onClick={creacionUsuario}>
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

export default NuevoUsuario;
