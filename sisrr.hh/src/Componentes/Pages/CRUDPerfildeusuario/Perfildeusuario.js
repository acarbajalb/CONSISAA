import React, { useState, useEffect } from "react";
import axios from "axios";
import "./perfildeusuario.css";
import Editarperfildeusuario from "./Editarperfildeusuario.js";
import Swal from "sweetalert2";
import useStore from "../store.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Import for FontAwesome icons
import { faUserCircle } from "@fortawesome/free-solid-svg-icons"; // Import the faUserCircle icon

const Perfildeusuario = () => {
  const idUsuario = useStore((state) => state.Id_usuario);
  const [usuario, setUsuario] = useState(null);
  const [delegado, setDelegado] = useState(null);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);

  useEffect(() => {
    // Llamada a la API para obtener los datos del usuario
    axios
      .get(`http://localhost:3001/traerUsuario/${idUsuario}`)
      .then((response) => {
        setUsuario(response.data[0]); // Suponiendo que la API devuelve un solo usuario
      })
      .catch((error) => {
        console.error("Error al obtener los datos del usuario:", error);
      });

    axios
      .get(`http://localhost:3001/traerDelegado/${idUsuario}`)
      .then((response) => {
        setDelegado(response.data[0]); // Suponiendo que la API devuelve un solo usuario
      })
      .catch((error) => {
        console.error("Error al obtener los datos del delegado:", error);
      });
  }, [idUsuario]);

  const abrirModalEdicion = () => {
    setMostrarModalEdicion(true);
  };

  const cerrarModalEdicion = () => {
    setMostrarModalEdicion(false);
  };

  const renderUsuario = () => {
    if (!usuario) {
      return <div>Cargando...</div>;
    }
    return (
      <div className="perfil-usuario" perfil-usuario="true">
        <div className="user-info">
          <h1 className="Title-Perfil">PERFIL DE USUARIO</h1>
          <FontAwesomeIcon icon={faUserCircle} size="5x" className="profile-icon" style={{color: "#5300c0"}}/>
          <div className="user-detail">
            <span className="label">ID de Usuario:</span>
            <span className="value">{usuario.Id_usuario}</span>
          </div>
          <div className="user-detail">
            <span className="label">Nombre de Usuario:</span>
            <span className="value">{usuario.Usuario}</span>
          </div>
          <div className="user-detail">
            <span className="label">Nombre Completo:</span>
            <span className="value">{usuario.Nombre_Completo_Usuario}</span>
          </div>
          <div className="user-detail">
            <span className="label">Rol:</span>
            <span className="value">{usuario.Nombre_Rol}</span>
          </div>
          <div className="user-detail">
            <span className="label">Puesto:</span>
            <span className="value">{usuario.Nombre_Puesto}</span>
          </div>
          <div className="user-detail">
            <span className="label">Correo Electrónico:</span>
            <span className="value">{usuario.Correo_electronico}</span>
          </div>
          {delegado && (
            <div className="user-detail">
              <span className="label">Delegado:</span>
              <span className="value">{delegado.Nombre_Completo_Usuario}</span>
            </div>
          )}
        </div>
        <button onClick={abrirModalEdicion} className="edit-button">
          Editar Perfil
        </button>
      </div>
    );
  };

  return (
    <div>
      {renderUsuario()}
      {mostrarModalEdicion && (
        <div className="modal-container">
          <div className="modal-content">
            <span className="close-button" onClick={cerrarModalEdicion}>
              &times;
            </span>
            <Editarperfildeusuario idUsuario={idUsuario} onClose={cerrarModalEdicion} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Perfildeusuario;
