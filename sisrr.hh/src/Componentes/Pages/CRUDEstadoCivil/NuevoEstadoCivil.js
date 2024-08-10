import React, { useState, useEffect } from "react";
import "./nuevoEstadoCivil.css";
import Swal from "sweetalert2";

const NuevoEstadoCivil = ({ onClose }) => {
  const [nombreestadocivil, setNombreEstadoCivil] = useState("");

  const [modalVisible, setModalVisible] = useState(true); // Estado para controlar la visibilidad del modal

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

  //Inicio de la funcion CREAR
  const creacionEstadoCivil = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:3001/creacionEstadoCivil",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Estado_civil: nombreestadocivil,
          }),
        }
      );
      //Guarda el mensaje que recibe desde el back
      const result = await response.json();

      if (response.ok) {
        setModalVisible(false);
        onClose();

        Toast.fire({
          icon: "success",
          title: "Estado Civil Creado",
          text: result.message || "El estado civil ha sido creado con éxito",
        });
        // Muestra la alerta de error con el mensaje del backend de que el depto ya existe u otro error pues en el backend se controlan varias posiblidades con el "error"
      } else {
        Toast.fire({
          icon: "error",
          title: "Error ",
          text: result.error || "Error en la solicitud",
        });
      }
    } catch (error) {
      console.error("Error al crear el estado civil:", error.message);
      Toast.fire({
        icon: "error",
        title: "Error",
        text: "Error en la solicitud",
      });
    }
  };
  
  const cancelarCreacion = () => {
    onClose(); // Llama a la función onClose pasada como prop desde MantenimientoUsuario para cerrar el modal
  };

  return (
    <form onSubmit={creacionEstadoCivil} className="Crear" Nuevo-Civil="true">
      <h1 id="Titulo">CREAR ESTADO CIVIL</h1>

      {/* Input para el usuario */}
      <div className="input-container">
        <div className="input-group">
          <input
            onChange={(event) => {
              setNombreEstadoCivil(event.target.value);
            }}
            name="estadocivilNuevo"
            type="text"
            className="textbox custom-input"
            maxLength={15}
            minLength={1}
            required
            onInput={(e) => {
              // Obtener el valor del input
              let value = e.target.value;

              // Eliminar caracteres especiales
              value = value.replace(/[^a-zA-Z0-9 ]/g, "");
              value = value.replace(/[^a-zA-Z ]/g, "");
              // Eliminar un mismo caracter más de dos veces seguidas
              value = value.replace(/([a-zA-Z0-9])\1{2,}/g, "$1$1");

              // Limitar a un solo espacio al inicio o en medio
              value = value.replace(/^\s+/, ""); // Eliminar espacios al inicio
              value = value.replace(/\s{2,}/g, " "); // Limitar a un solo espacio entre palabras

              // Convertir a mayúsculas
              value = value.toUpperCase();

              // Asignar el valor modificado al input
              e.target.value = value;
            }}
          />
          <label>Estado Civil</label>
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

export default NuevoEstadoCivil;
