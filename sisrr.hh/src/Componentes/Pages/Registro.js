import React, { useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

import "./login.css";

const Registro = () => {
  const [signUpError, setSignUpError] = useState(false);
  const [emptyFieldError, setEmptyFieldError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const handleSignUp = async (e) => {
    e.preventDefault();
    const user = e.target.querySelector('input[name="user"]').value;
    const fullName = e.target.querySelector('input[name="fullName"]').value;
    const email = e.target.querySelector('input[name="email"]').value;
    const rol = "6"; //Valor predefinido para el rol del usuario autoregistrado(luego el administrador correspondiente le dara un rol especifico)
    const password = e.target.querySelector('input[name="password"]').value;
    const confirmPassword = e.target.querySelector(
      'input[name="confirmPassword"]'
    ).value;
    const dni = e.target.querySelector('input[name="dni"]').value;
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

  // Validacion de copiado y pegado
  const handleCP = (e) => {
    e.preventDefault();
  };

  // Validaciones adicionales para cada campo
  const validateInput = (e) => {
    let value = e.target.value;

    // Eliminar una misma letra o dígito más de dos veces seguidas
    value = value.replace(/(.)\1{2,}/g, '$1$1');

    // Eliminar caracteres especiales y números
    value = value.replace(/[^\w\s]/gi, '').replace(/\d/g, '');

    // Limitar a un solo espacio
    value = value.replace(/\s{2,}/g, ' ');

    e.target.value = value;
  };

  // Validación para el campo de DNI
  const validateDNI = (e) => {
    let value = e.target.value;

    // Eliminar letras y caracteres especiales, permitir solo números
    value = value.replace(/[^\d]/g, '');

    // Verificar que el valor tenga al menos 3 dígitos
    if (value.length < 3) {
      Toast.fire({
        icon: "warning",
        title: "DNI No Válido",
        text: "El DNI debe contener mas de 3 dígitos.",
      });
    }

    e.target.value = value;
  };

  // Validación para el campo de Email
  const validateEmail = (e) => {
    let value = e.target.value;

    // Eliminar una misma letra o dígito más de dos veces seguidas
    value = value.replace(/(.)\1{2,}/g, '$1$1');

    // Limitar a un solo espacio
    value = value.replace(/\s{2,}/g, ' ');

    e.target.value = value;
  };

  // Validación para el campo de Contraseña y Confirmar Contraseña
  const validateContrasena = (e) => {
    let value = e.target.value;

    // Eliminar una misma letra o dígito más de dos veces seguidas
    value = value.replace(/(.)\1{2,}/g, '$1$1');

    // Limitar a un solo espacio
    value = value.replace(/\s{2,}/g, ' ');

    e.target.value = value;
  };

  return (
    <div className="form-container sign-up-container">
      <form onSubmit={handleSignUp}>
        <h1>Registrar</h1>
        <span>Ingrese los siguientes Datos</span>
        <input
          type="text"
          placeholder="USUARIO"
          maxLength={15}
          name="user"
          required
          pattern="[a-zA-Z0-9]+"
          style={{ textTransform: "uppercase" }}
          onInput={validateInput}
          title="El usuario debe ingresarse en mayusculas y solo puede contener letras."
          onCopy={handleCP}
          onCut={handleCP}
          onPaste={handleCP}
        />
        <input
          type="text"
          placeholder="Nombre Completo"
          maxLength={40}
          name="fullName"
          required
          onInput={validateInput}
          onKeyPress={(e) => {
            const regex = /[0-9]/;
            if (regex.test(e.key)) {
              e.preventDefault();
            }
          }}
          style={{ textTransform: "uppercase" }}
          onCopy={handleCP}
          onCut={handleCP}
          onPaste={handleCP}
        />
        <input
          type="email"
          placeholder="EMAIL"
          maxLength="50"
          name="email"
          required
          onCopy={handleCP}
          onCut={handleCP}
          onInput={validateEmail}
          onPaste={handleCP}
        />
        <input
          type="text"
          placeholder="0000-0000-00000"
          maxLength={15}
          minLength={14}
          name="dni"
          required
          onCopy={handleCP}
          onCut={handleCP}
          onInput={validateDNI}
          onPaste={handleCP}
        />
        <div className="password-container">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="CONTRASEÑA"
            name="password"
            maxLength={30}
            minLength={8}
            required
            onInput={validateContrasena}
            onCopy={handleCP}
            onCut={handleCP}
            onPaste={handleCP}
          />
          <FontAwesomeIcon
            icon={showPassword ? faEye : faEyeSlash}
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          />
        </div>

        <div className="password-container">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="CONFIRMAR CONTRASEÑA"
            name="confirmPassword"
            maxLength={30}
            minLength={8}
            required
            onInput={validateContrasena}
            onCopy={handleCP}
            onCut={handleCP}
            onPaste={handleCP}
          />
          <FontAwesomeIcon
            icon={showConfirmPassword ? faEye : faEyeSlash}
            className="toggle-password"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          />
        </div>

        <button type="submit" id="Registrar">
          Registrar
        </button>
      </form>
    </div>
  );
};

export default Registro;
