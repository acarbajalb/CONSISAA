import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./primerIngreso.css";



const PrimerIngreso = ({ idUsuario, onClose }) => {
  const [contraseña, setContraseña] = useState("");

  const navigate = useNavigate();

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!contraseña || contraseña.length < 8) {
      Toast.fire({
        icon: "warning",
        title: "Contraseña muy corta",
        text: "Las contraseñas deben tener al menos 8 caracteres.",
      });
      return false;
    }

    try {
      console.log("ID de usuario:", idUsuario);
      console.log("Contraseña:", contraseña);
  
      const response = await fetch(`http://localhost:3001/editarUsuarioContra/${idUsuario}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Contraseña: contraseña }),
      });
  
      console.log("Respuesta de la solicitud:", response);
  
      if (response.ok) {
        Toast.fire({
          icon: "success",
          title: "Contraseña actualizada correctamente",
        });
        onClose(); // Cerrar el modal al actualizar la contraseña
        navigate("/Inicio"); // Redirigir al usuario a la página de inicio
      } else {
        throw new Error("Error en la solicitud");
      }
    } catch (error) {
      console.error("Error al editar la contraseña:", error.message);
      Toast.fire({
        icon: "error",
        title: "Error al editar la contraseña",
      });
    }
  };
  
  const handleChange = (event) => {
    setContraseña(event.target.value);
  };

  return (
      <form onSubmit={handleSubmit} className="Primer-Ingreso" Modal-Primer-Ingreso ="true">
        <h1  id="Titulo">¡Bienvenido al Sistema!</h1>
        <h3> A continuación, cambie su contraseña</h3>
        <div className="input-container">
          <div className="input-group">
            <input
              type="password"
              value={contraseña}
              className="textbox custom-input"
              onChange={handleChange}
              maxLength={30}
              minLength={8}
              placeholder="Nueva Contraseña"
              required

            />
          </div>
        </div>
        <div className="form-buttons-guardar-ingreso">
          <button type="submit">Guardar</button>
        </div>
      </form>
  );
};

export default PrimerIngreso;
