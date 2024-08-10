import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./editarDepartamento.css";
import useStore from "../store";

const EditarDepartamento = ({ onClose, Id_departamento }) => {
  const usuario = useStore((state) => state.usuario);

  const [departamentoInfo, setDepartamento] = useState({
    Nombre_departamento: "",
    Modificado_por: "",
    Fecha_modificacion: "",
  });
  const [modalVisible, setModalVisible] = useState(true);

  useEffect(() => {
    const obtenerDepartamento = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/idDepartamento/${Id_departamento}`
        );
        const data = await response.json();
        setDepartamento(data);
      } catch (error) {
        console.error(
          "Error al obtener la información del departamento:",
          error.message
        );
      }
    };
    obtenerDepartamento();
  }, [Id_departamento]);

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

  const editarDepartamento = async (event) => {
    event.preventDefault();
    try {
      const confirmacion = await Swal.fire({
        title: "¿Estás seguro?",
        text: "¿Deseas editar el registro?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, editar",
        cancelButtonText: "Cancelar",
      });

      if (confirmacion.isConfirmed) {
        const response = await fetch(
          `http://localhost:3001/editarDepartamento/${Id_departamento}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...departamentoInfo,
              Modificado_por: usuario,
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
            title: "Departamento Editado",
            text: result.message || "El Departamento ha sido editado con éxito",
          });
          // Muestra la alerta de error con el mensaje del backend de que el depto ya existe u otro error pues en el backend se controlan varias posiblidades con el "error"
        } else {
          Toast.fire({
            icon: "error",
            title: "Error",
            text: result.error || "Error en la solicitud",
          });
        }
      }
    } catch (error) {
      console.error("Error al editar el departamento:", error.message);
      Toast.fire({
        icon: "error",
        title: "Error",
        text: "Error en la solicitud",
      });
    }
  };

  const cancelarEdicion = () => {
    onClose();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setDepartamento((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <form
      onSubmit={editarDepartamento}
      className="Editar"
      Editar-Departamento="true"
    >
      <h1>EDITAR DEPARTAMENTO</h1>
      <div className="input-container">
        <div className="input-group">
          <input
            name="Nombre_departamento"
            type="text"
            value={departamentoInfo.Nombre_departamento}
            className="textbox custom-input"
            onChange={handleChange}
            maxLength={15}
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
        </div>
      </div>
      <div className="input-container"></div>
      <div className="form-buttons-editar">
        <button id="editar" type="submit">
          GUARDAR
        </button>
        <span className="button-spacing"></span>
        <button id="cancelar" type="button" onClick={cancelarEdicion}>
          CANCELAR
        </button>
      </div>
    </form>
  );
};

export default EditarDepartamento;
