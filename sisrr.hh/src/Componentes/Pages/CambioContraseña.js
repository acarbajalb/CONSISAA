import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "./cambioContraseña.css";

const CambioContraseña = ({ idUsuario, onClose, isOpen }) => {
  const [contraseña, setContraseña] = useState("");
  const [confirmarContraseña, setConfirmarContraseña] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    if (contraseña !== confirmarContraseña) {
      Toast.fire({
        icon: "warning",
        title: "Contraseñas no coinciden",
        text: "La contraseña y la confirmación no coinciden.",
      });
      return false;
    }

    try {
      const response = await fetch(`http://localhost:3001/editarUsuarioContra/${idUsuario}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Contraseña: contraseña }),
      });

      if (response.ok) {
        Toast.fire({
          icon: "success",
          title: "Contraseña actualizada correctamente",
        });
        onClose(); // Cerrar el modal al actualizar la contraseña
        navigate("/"); // Redirigir al usuario a la página de inicio
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

  const handleChangeContraseña = (event) => {
    setContraseña(event.target.value);
  };

  const handleChangeConfirmarContraseña = (event) => {
    setConfirmarContraseña(event.target.value);
  };

  if (!isOpen) return null;

  return (
    <div data-maintenance-contrasena="true" className="maintenance-container-contrasena">
    <div className="modal-overlay">
      <div className="modal-content">
        <form onSubmit={handleSubmit} className="Primer-Ingreso">
          <h1 id="Titulo">¡Cambia tu contraseña!</h1>
          <h3>A continuación, ingresa una nueva contraseña</h3>
          <div className="input-container">
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                value={contraseña}
                className="textbox custom-input"
                onChange={handleChangeContraseña}
                maxLength={30}
                minLength={8}
                placeholder="Nueva Contraseña"
                required
              />
              <FontAwesomeIcon
                icon={showPassword ? faEye : faEyeSlash}
                onClick={() => setShowPassword(!showPassword)}
                className="eye-icon"
                style={{
                  color: "#7f24f5",
                  position: "absolute",
                  marginTop: "23px",
                  transform: "translateY(-50%)",
                  right: "5px",
                }}
              />
            </div>
          </div>
          <div className="input-container">
            <div className="input-group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmarContraseña}
                className="textbox custom-input"
                onChange={handleChangeConfirmarContraseña}
                maxLength={30}
                minLength={8}
                placeholder="Confirmar Contraseña"
                required
              />
              <FontAwesomeIcon
                icon={showConfirmPassword ? faEye : faEyeSlash}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="eye-icon"
                style={{
                  color: "#7f24f5",
                  position: "absolute",
                  marginTop: "23px",
                  transform: "translateY(-50%)",
                  right: "5px",
                }}
              />
            </div>
          </div>
          <div className="form-buttons-guardar-ingreso">
            <button type="submit">Guardar</button>
          </div>
        </form>
      </div>
    </div>
    </div>
  );
};

export default CambioContraseña;
