import React, { useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

import "./login.css";

const Registro = () => {
  const [signUpError, setSignUpError] = useState(false);
  const [emptyFieldError, setEmptyFieldError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  
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
  

  const handleSignUp = async (e) => {
    e.preventDefault();
    const user = e.target.querySelector('input[name="user"]').value;
    const fullName = e.target.querySelector('input[name="fullName"]').value;
    const email = e.target.querySelector('input[name="email"]').value;
    const rol= "1";//Valor predefinido para el rol del usuario autoregistrado(luego el administrador correspondiente le dara un rol especifico)
    const password = e.target.querySelector('input[name="password"]').value;
    const confirmPassword = e.target.querySelector(
      'input[name="confirmPassword"]'
    ).value;
const dni=e.target.querySelector('input[name="dni"]').value;
    // Validaciones
    if (!user || !fullName || !email || !password || !confirmPassword || !dni) {
      setEmptyFieldError(true);
      return;
    } else {
      setEmptyFieldError(false);
    }

    // Verificar longitud mínima de la contraseña
    if (password.length < 8) {
      setPasswordError(true);
      return;
    } else {
      setPasswordError(false);
    }

    
    if (password !== confirmPassword) {
      // Mostrar mensaje de inconsistencia con SweetAlert
      Toast.fire({
        icon: "warning",
        title: "Las contraseñas no coinciden",
        text: "Por favor, verifica que las contraseñas sean iguales.",
      });
      setConfirmPasswordError(true);
      return;
    } else {
      setConfirmPasswordError(false);
    }

    // Enviar datos del formulario al servidor para el registro
    try {
      const response = await axios.post(
        "http://localhost:3001/registro/registrarUsuario",
        { 
          // Datos del usuario
          Id_Rol: rol,
          Id_Puesto: "1",
          Usuario: user,
          Nombre_Completo_Usuario: fullName,
          contraseña: password,
          Primer_ingreso: null,
          Fecha_ultima_conexion: "2024-02-12",
          Correo_electronico: email,
          Fecha_vencimiento: "2024-02-12",
          Token: "131",
          Creado_por: user,
          Modificado_por: user,
          Fecha_creacion: null,
          Fecha_modificacion: null,
          Dni: dni, // Enviar el DNI al backend


        }
      );
      console.log("Respuesta del servidor:", response.data);
      await Swal.fire({
        title: "¡Registro exitoso!",
        text: "El usuario ha sido registrado correctamente. Revisa tu Email.",
        icon: "success",
        confirmButtonText: "Aceptar", 
      });
      // Limpiar los campos del formulario después del registro exitoso
      e.target.reset();
      // Si el registro es exitoso, puedes hacer algo aquí, como redirigir al usuario a otra página
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      await Swal.fire({
        title: "Error",
        text: "Hubo un problema al registrar el usuario. Por favor, intenta nuevamente más tarde.",
        icon: "error",
        confirmButtonText: "Entendido",
      });
      setSignUpError(true);
    }
  };

  return (
    <div className="form-container sign-up-container">
      <form onSubmit={handleSignUp}>
        <h1>Registrar</h1>
        <span>Ingrese los siguientes Datos</span>
        <input
          type="text"
          placeholder="USUARIO"
          maxLength="15"
          name="user"
          required
          pattern="[a-zA-Z0-9]+"
          title="El usuario debe ingresarse en mayusculas y solo puede contener letras y números."
          onInput={(e) => {
            // Eliminar espacios en blanco
            e.target.value = e.target.value.replace(/\s/g, '').toUpperCase();
          }}
        />
        <input
          type="text"
          placeholder="Nombre Completo"
          maxLength="40"
          name="fullName"
          required
          onKeyPress={(e) => {
            const regex = /[0-9]/;
            if (regex.test(e.key)) {
              e.preventDefault();
            }
          }}
          style={{ textTransform: "uppercase" }}
        />
          <input
            type="email"
            placeholder="EMAIL"
            maxLength="50"
            name="email"
            required
          />
          <input
            type="text"
            placeholder="DNI"
            maxLength="15"
            name="dni"
            required
          />
          <input
            type="password"
            placeholder="CONTRASEÑA"
            name="password"
            maxLength="15"
            minLength="8"
            required
          />

     
          <input
            type="password"
            placeholder="CONFIRMAR CONTRASEÑA"
            name="confirmPassword"
            maxLength="15"
            minLength="8"
            required
         
          />
    
        <button type="submit" id="Registrar"> Registrar</button>
      </form>
    </div>
  );
};

export default Registro;
