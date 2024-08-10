import React, { useState, useEffect } from "react";
import "./nuevoDepartamento.css";
import Swal from "sweetalert2";
import useStore from "../store";

const NuevoDepartamento = ({ onClose }) => {
  //Variable global del usuario loggeado
  const usuario = useStore((state) => state.usuario);
  const [creado_Por, setCreadoPor] = useState(usuario);

  useEffect(() => {
    setCreadoPor(usuario);
  }, [usuario]);

  const [nombredepartamento, setNombreDepartamento] = useState("");
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
  const creacionDepartamento = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:3001/creacionDepartamento",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Nombre_departamento: nombredepartamento,
            Creado_por: creado_Por,
            Modificado_por: creado_Por,
            Fecha_creacion: null,
            Fecha_modificacion: null,
          }),
        }
      );
      //MENSAJE DE RESPUESTA TRAIDO DESDE EL BACKEND
      const result = await response.json();
      if (response.ok) {
        // Cierra el modal
        setModalVisible(false);
        onClose(); // Cierra el modal completamente

        // Muestra la alerta de error con el mensaje del backend de que el depto ha sido creado
        Toast.fire({
          icon: "success",
          title: "Departamento Creado",
          text: result.message || `El Departamento ha sido creado con éxito.`,
        });
      } else {
        // Muestra la alerta de error con el mensaje del backend de que el depto ya existe
        Toast.fire({
          icon: "error",
          title: "Error",
          text: result.error || "Error en la solicitud",
        });
      }
    } catch (error) {
      //mensaje de alerta en la consola
      console.error("Error en la solicitud:", error.message);
      //Mensaje de alerta para el usuario
      Toast.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Error en la solicitud. Intentelo mas tarde.",
      });
    }
  };

  const cancelarCreacion = () => {
    onClose(); // Llama a la función onClose pasada como prop desde MantenimientoUsuario para cerrar el modal
  };

  return (
    <form
      onSubmit={creacionDepartamento}
      className="Crear"
      Crear-Departamento="true"
    >
      <h1 id="Titulo">CREAR DEPARTAMENTO</h1>

      {/* Input para el usuario */}
      <div className="input-container">
        <div className="input-group">
          <input
            onChange={(event) => {
              setNombreDepartamento(event.target.value);
            }}
            name="departamentoNuevo"
            type="text"
            className="textbox custom-input"
            maxLength={30}
            onInput={(e) => {
              // Obtener el valor del input
              let value = e.target.value;

              // Eliminar caracteres especiales y números
              value = value.replace(/[^a-zA-Z ]/g, "");

              // Eliminar un mismo caracter más de dos veces seguidas
              value = value.replace(/([a-zA-Z])\1{2,}/g, "$1$1");

              value = value.replace(/^\s+/, ""); // Eliminar espacios al inicio

              // Limitar a un solo espacio
              value = value.replace(/\s+/g, " ");

              // Convertir a mayúsculas
              value = value.toUpperCase();

              // Asignar el valor modificado al input
              e.target.value = value;
            }}
            required
          />
          <label>Departamento</label>
          {/* Input para el nombre completo */}
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

export default NuevoDepartamento;
