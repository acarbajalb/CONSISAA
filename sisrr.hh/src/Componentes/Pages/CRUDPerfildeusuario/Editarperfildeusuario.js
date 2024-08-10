import React, { useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import "./editarperfildeusuario.css";
import useStore from "../store.js";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const EditarPerfilDeUsuario = ({ onClose }) => {
  const idUsuario = useStore((state) => state.Id_usuario);
  const [correoElectronico, setCorreoElectronico] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [usuarioDelegado, setUsuarioDelegado] = useState(""); // Nuevo estado para el nombre de usuario del delegado
  const [usuarios, setUsuarios] = useState([]); // Nuevo estado para almacenar usuarios encontrados

  // Función para buscar un usuario por nombre de usuario
  const buscarUsuario = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/buscarUsuarioPorUsuario/${usuarioDelegado}`);
      if (response.data.length > 0) {
        const idDelegado = response.data[0].Id_usuario;
        setUsuarioDelegado(idDelegado);
      } else {
        Swal.fire({
          icon: "error",
          title: "Usuario no encontrado",
          text: "No se encontró ningún usuario con ese nombre de usuario",
        });
      }
    } catch (error) {
      console.error("Error al buscar usuario:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al buscar usuario",
      });
    }
  };

  const handleActualizarPerfil = async () => {
    try {
      const response = await axios.put("http://localhost:3001/actualizarUsuario", {
        id_usuario: idUsuario,
        correo: correoElectronico,
        contraseña: contraseña,
        id_delegado: usuarioDelegado, // Pasar el ID del delegado en lugar del nombre de usuario
      });

      if (response.data.message) {
        Swal.fire({
          icon: "success",
          title: "Perfil actualizado",
          text: response.data.message,
        });
        onClose(); // Cerrar el modal después de actualizar el perfil
      }
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al actualizar el perfil",
      });
    }
  };

  const handleCancelar = () => {
    onClose(); // Cerrar el modal sin hacer cambios
  };

  return (
    <div className="editar-perfil-container" perfil-usuario-edit="true">
      <h1 className="Title-Edit">EDITAR PERFIL DE USUARIO</h1>
      <div className="input-group">
        <input
          type="email"
          className="textbox custom-input"
          id="correoElectronico"
          value={correoElectronico}
          onChange={(e) => setCorreoElectronico(e.target.value)}
          style={{width: "350px"}}
        />
         <label style={{width: "180px"}}>Correo Electronico</label>
      </div>
      <div className="input-group">
        <input
          type="password"
          className="textbox custom-input"
          id="contraseña"
          value={contraseña}
          onChange={(e) => setContraseña(e.target.value)}
          style={{width: "350px"}}
        />
        <label style={{width: "180px"}}>Contraseña</label>
      </div>
      <div className="input-group">
      <div style={{ position: "relative", width: "350px" }}>
        <input
          type="text"
          className="textbox custom-input"
          id="usuarioDelegado"
          value={usuarioDelegado}
          onChange={(e) => setUsuarioDelegado(e.target.value)}
          style={{width: "100%"}}
        />
          <button className="button-buscar" onClick={buscarUsuario} style={{ position: "absolute", marginLeft:"370px", top: "0", bottom: "0", cursor: "pointer" }}>
            <FontAwesomeIcon icon={faSearch} />
          </button>
      </div>
        <label style={{width: "180px"}}>Usuario Delegado</label>
      </div>
      <div className="button-container">
        <button onClick={handleActualizarPerfil}>Actualizar Perfil</button>
        <button onClick={handleCancelar}>Cancelar</button>
      </div>
    </div>
  );
};

export default EditarPerfilDeUsuario;
