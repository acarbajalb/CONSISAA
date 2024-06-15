
import React, { useState} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import "./login.css";

//Importación de almacen donde se encuentran las variables
import useStore from './store';
import PrimerIngreso from "./PrimerIngreso.js";

const InicioSesion = () => {

  //Constantes que pasaran el valor al store.js
  const setUsuarioo = useStore((state) => state.setUsuarioo);
  const setRol = useStore((state) => state.setRol);
  const setIdEmpleado=useStore((state)=> state.setIdEmpleado);
  const setIdUsuario=useStore((state)=> state.setIdUsuario);
  
  const setNombreDepartamento=useStore((state)=> state.setNombreDepartamento);
  const setIdDepartamento=useStore((state)=> state.setIdDepartamento);

  const navigate = useNavigate();
  const [idUsuarioo, setIdUsuarioo] = useState(null);
  const [usuario, setUsuario] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [estado, setEstado] = useState(""); 
  const [error, setError] = useState(null);
  const [intentosFallidos, setIntentosFallidos] = useState(0); // Nuevo estado para contar los intentos fallidos
  const [mostrarModalPrimerIngreso, setMostrarModalPrimerIngreso] = useState(false); // Estado para controlar la visibilidad del modal de primer ingreso

  const handleUsuarioChange = (e) => {
    const { value } = e.target;
    setUsuario(value.toUpperCase().replace(/[^a-zA-Z0-9]/g, ""));
  };

  const handleContraseñaChange = (e) => {
    const { value } = e.target;
    setContraseña(value);
  };

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 8000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log({usuario: usuario, Contraseña:contraseña })

    try {
      const response = await axios.post("http://localhost:3001/iniciodesesio/iniciarSesion", { Usuario: usuario, Contraseña: contraseña });
    
      // Muestra un mensaje de éxito con el nombre de usuario, su rol y su ID de usuario
      Toast.fire({
        icon: "success",
        title: "Inicio de Sesión Exitoso",
        text: `¡Bienvenido, ${response.data.usuario.Usuario}!  
        Rol: ${response.data.usuario.Rol}`,
        
      });
      /*, 
        ID Empleado: ${response.data.usuario.Id_Empleado},
        ID Usuario: ${response.data.usuario.Id_usuario} */
        
      setIdUsuarioo(response.data.usuario.Id_usuario); // Aquí debería ser Id_usuario en lugar de Id_usuarioo

      // Aquí se captura el valor. 
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
      // Si hay un error de red o del servidor, muestra un mensaje genérico
      if (!error.response) {
        await Swal.fire({
          title: 'Error',
          text: 'Error de conexión. Inténtalo de nuevo más tarde.',
          icon: 'error',
          confirmButtonText: 'Entendido'
        });
        return;
      }

      // Si la respuesta del servidor indica un error de usuario/contraseña, aumenta el contador de intentos fallidos
      if (error.response.status === 401) {
        setIntentosFallidos(intentosFallidos + 1);

        // Si se han alcanzado los 3 intentos fallidos, muestra un mensaje y limpia los campos
        if (intentosFallidos >= 3) {
          Swal.fire({
            title: 'Máximo de Intentos Alcanzado',
            text: 'Haz alcanzado el máximo número de intentos. Inténtalo de nuevo más tarde.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
          setUsuario("");
          setContraseña("");
          setIntentosFallidos(0); // Reinicia el contador de intentos fallidos
        } else {
          await Swal.fire({
            title: 'Error',
            text: 'Usuario o Contraseña Inválidos',
            icon: 'error',
            confirmButtonText: 'Entendido'
          });
        }
      } else {
        // Si hay otro tipo de error, muestra un mensaje genérico
        await Swal.fire({
          title: 'Error',
          text: 'Error desconocido. Inténtalo de nuevo más tarde.',
          icon: 'error',
          confirmButtonText: 'Entendido'
        });
      }
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
    <div className="form-container sign-in-container">
      <form onSubmit={handleSubmit}>
        <h1>Iniciar Sesión</h1>
        <span>Utilice su Nombre de Usuario</span>
        <input
          type="text"
          placeholder="USUARIO"
          maxLength="15"
          required
          value={usuario}
          onChange={handleUsuarioChange}
        />
        <div style={{ position: "relative", width: "100%" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="CONTRASEÑA"
            maxLength="15"
            required
            style={{ width: "100%" }}
            value={contraseña}
            onChange={handleContraseñaChange}
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
            <PrimerIngreso idUsuario={idUsuarioo} onClose={() => setMostrarModalPrimerIngreso(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default InicioSesion;