import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import "./login.css";

// Importación de almacen donde se encuentran las variables
import useStore from "./store";
import PrimerIngreso from "./PrimerIngreso.js";

const InicioSesion = () => {
  // Constantes que pasaran el valor al store.js
  const setUsuarioo = useStore((state) => state.setUsuarioo);
  const setRol = useStore((state) => state.setRol);
  const setIdEmpleado = useStore((state) => state.setIdEmpleado);
  const setIdUsuario = useStore((state) => state.setIdUsuario);
  const setNombreDepartamento = useStore(
    (state) => state.setNombreDepartamento
  );
  const setIdDepartamento = useStore((state) => state.setIdDepartamento);

  const [maxIntentos, setMaxIntentos] = useState(3); // Estado
  const navigate = useNavigate();
  const [idUsuarioo, setIdUsuarioo] = useState(null);
  const [usuario, setUsuario] = useState("");
  const [contraseña, setContraseña] = useState("");

  const [error] = useState(null);
  const [intentosFallidos, setIntentosFallidos] = useState(0); // Nuevo estado para contar los intentos fallidos
  const [mostrarModalPrimerIngreso, setMostrarModalPrimerIngreso] =
    useState(false); // Estado para controlar la visibilidad del modal de primer ingreso

  //METODO DE VALIDACIONES DEL INPUT DE NOMBRE DE USUARIO
  const handleUsuarioChange = (e) => {
    //Pasa a mayuscula las letras del usuario y no permite espacios
    let value = e.target.value.toUpperCase().replace(/[^a-zA-Z0-9]/g, "");

    // Eliminar un mismo caracter más de 2 veces seguidas. (cAMBIARA DEPENDIENDO DE LA CATNIDAD DE VALORES QUE LE DEJEMOS QUE SE REPITAN EN AUTOREGISTRO Y CREAR USUARIO)
    value = value.replace(/([a-zA-Z0-9])\1{3,}/g, "$1$1");

    setUsuario(value);
  };

  //METODO DE VALIDACIONES DEL INPUT DE NOMBRE DE USUARIO
  const handleContraseñaChange = (e) => {
    const { value } = e.target;
    setContraseña(value);
  };

  //EVENTO QUE INHIBE EL COPIADO Y PEGADO
  const handleCP = (e) => {
    e.preventDefault();
  };

  useEffect(() => {
    // Solicitud para obtener el valor del número de intentos permitidos
    const fetchMaxIntentos = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/obtenerValor/1"
        ); // Reemplaza 1 con el Id_parametro necesario
        setMaxIntentos(parseInt(response.data.Valor));
      } catch (error) {
        console.error("Error al obtener el valor de intentos máximos:", error);
      }
    };

    fetchMaxIntentos();
  }, []);

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 8000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log({ usuario: usuario, Contraseña: contraseña });

    try {
      const response = await axios.post(
        "http://localhost:3001/iniciodesesio/iniciarSesion",
        { Usuario: usuario, Contraseña: contraseña }
      );

      console.log(response.data); // Para depurar el contenido de la respuesta

      // Verifica si la respuesta contiene un error de usuario bloqueado
      if (response.data.error && response.data.error === "Usuario bloqueado") {
        await Swal.fire({
          title: "Acceso Denegado",
          text: "Tu cuenta está bloqueada. Contacta al administrador.",
          icon: "error", // El icono de 'error' es adecuado para este caso
          confirmButtonText: "OK",
        });
        return;
      }

      // Verifica si la respuesta contiene un error de usuario pendiente de aprobación
      if (
        response.data.error &&
        response.data.error === "Usuario Pendiente de confirmar"
      ) {
        await Swal.fire({
          title: "Acceso Denegado",
          text: "Tu cuenta está siendo procesada. Contacta al administrador.",
          icon: "warning", // 'warning' es un buen icono para notificaciones de pendiente
          confirmButtonText: "OK",
        });

        return;
      }

      // Muestra un mensaje de éxito con el nombre de usuario, su rol y su ID de usuario
      Toast.fire({
        icon: "success",
        title: "Inicio de Sesión Exitoso",
        text: `¡Bienvenido, ${response.data.usuario.Usuario}!  
        Rol: ${response.data.usuario.Rol}, 
        ID Empleado: ${response.data.usuario.Id_Empleado},
        ID Usuario: ${response.data.usuario.Id_usuario}`,
      });

      // Actualiza el estado con la información del usuario
      setIdUsuarioo(response.data.usuario.Id_usuario);
      setUsuarioo(response.data.usuario.Usuario);
      setRol(response.data.usuario.Rol);
      setIdEmpleado(response.data.usuario.Id_Empleado);
      setIdUsuario(response.data.usuario.Id_usuario);
      setNombreDepartamento(response.data.usuario.Nombre_departamento);
      setIdDepartamento(response.data.usuario.Id_departamento);

      // Verificar si es el primer inicio de sesión
      if (response.data.usuario.Primer_ingreso === null) {
        setMostrarModalPrimerIngreso(true); // Mostrar el modal de primer ingreso si es necesario
      } else {
        navigate("/Inicio");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error); // Para depurar el error

      if (!error.response) {
        // Error de conexión
        await Swal.fire({
          title: "Error",
          text: "Error de conexión. Inténtalo de nuevo más tarde.",
          icon: "error",
          confirmButtonText: "Entendido",
        });
        return;
      }

      // Error con respuesta del servidor
      const statusCode = error.response.status;
      const errorMessage = error.response.data.error || "Error desconocido";

      if (statusCode === 401) {
        setIntentosFallidos(intentosFallidos + 1);

        if (intentosFallidos + 1 >= maxIntentos) {
          // Llamada al endpoint para bloquear el usuario
          try {
            await axios.put(`http://localhost:3001/bloquearUsuario/${usuario}`);
          } catch (blockError) {
            console.error("Error al bloquear el usuario:", blockError);
          }

          await Swal.fire({
            title: "Cuenta Bloqueada",
            text: "Haz alcanzado el máximo número de intentos.",
            icon: "error",
            confirmButtonText: "OK",
          });
          setUsuario("");
          setContraseña("");
          setIntentosFallidos(0);
        } else {
          await Swal.fire({
            title: "Error",
            text: errorMessage,
            icon: "error",
            confirmButtonText: "Entendido",
          });
        }
      } else {
        await Swal.fire({
          title: "Error",
          text: errorMessage,
          icon: "error",
          confirmButtonText: "Entendido",
        });
      }
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <div className="form-container sign-in-container">
        <form onSubmit={handleSubmit}>
          <h1>Inicie Sesión</h1>
          <span>Utilice su Nombre de Usuario</span>
          <input
            type="text"
            placeholder="USUARIO"
            maxLength="15"
            required
            value={usuario}
            onChange={handleUsuarioChange} //LLAMADO DE METODO DE VALIDACIONES DEL INPUT DE NOMBRE DE USUARIO
            //Llaman a la funcion de prohibiion de copiado y pegado
            onCopy={handleCP}
            onPaste={handleCP}
            onCut={handleCP}
          />
          <div style={{ position: "relative", width: "100%" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="CONTRASEÑA"
              maxLength="15"
              required
              style={{ width: "100%" }}
              value={contraseña}
              onChange={handleContraseñaChange} //LLAMADO DE METODO DE VALIDACIONES DEL INPUT DE NOMBRE DE USUARIO
              //Llaman a la funcion de prohibiion de copiado y pegado
              onCopy={handleCP}
              onPaste={handleCP}
              onCut={handleCP}
            />
            <FontAwesomeIcon
              icon={showPassword ? faEye : faEyeSlash}
              onClick={() => setShowPassword(!showPassword)}
              className="eye-icon"
              style={{
                color: "#7f24f5",
                position: "absolute",
                right: "15px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
          </div>
          {error && (
            <div className="error-message">
              <FontAwesomeIcon icon={faExclamationTriangle} /> {error}
            </div>
          )}
          <a href="#" onClick={() => navigate("/RecuperacionContraseña")}>
            ¿Olvidó su contraseña?
          </a>
          <button type="submit">Iniciar sesión</button>
        </form>
      </div>
      {mostrarModalPrimerIngreso && (
        <div className="modal-container-ingreso">
          <div className="modal-content-ingreso">
            <PrimerIngreso
              idUsuario={idUsuarioo}
              onClose={() => setMostrarModalPrimerIngreso(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InicioSesion;
