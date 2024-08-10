import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./editarEstado.css";

const EditarEstado = ({ onClose, Id_Estado }) => {
  const [estadoInfo, setEstado] = useState({
    Estado: "",
  });
  const [modalVisible, setModalVisible] = useState(true);

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

  useEffect(() => {
    const obtenerEstado = async () => {
      try {
        const response = await fetch(`http://localhost:3001/idEstado/${Id_Estado}`);
        const data = await response.json();
        setEstado(data);
      } catch (error) {
        console.error("Error al obtener la información del estado:", error.message);
      }
    };
    obtenerEstado();
  }, [Id_Estado]);

  const editarEstado = async (event) => {
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
        const response = await fetch(`http://localhost:3001/editarEstado/${Id_Estado}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(estadoInfo),
        });

        //Guarda el mensaje que recibe desde el back
        const result = await response.json();

        if (response.ok) {
          setModalVisible(false);
          onClose();

          Toast.fire({
            icon: "success",
            title: "Estado  Editado",
            text: result.message || "El estado  ha sido editado con éxito",
          });
          // Muestra la alerta de error con el mensaje del backend de que el depto ya existe u otro error pues en el backend se controlan varias posiblidades con el "error"
        } else {
          Toast.fire({
            icon: "error",
            title: "Error ",
            text: result.error || "Error en la solicitud",
          });
        }
      }
    } catch (error) {
      console.error("Error al crear el estado :", error.message);
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
    setEstado((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <form onSubmit={editarEstado} className="Editar" Editar-Estado = "true">
      <h1>EDITAR ESTADO</h1>
      <div className="input-container">
        <div className="input-group">
          <input
            name="Estado"
            type="text"
            value={estadoInfo.Estado}
            className="textbox custom-input"
            onChange={handleChange}
            maxLength={15}
            minLength={1}
            required
                        onInput={(e) => {
              // Obtener el valor del input
              let value = e.target.value;
              
              // Eliminar caracteres especiales
              value = value.replace(/[^a-zA-Z0-9 ]/g, '');
              value = value.replace(/[^a-zA-Z ]/g, '');
            
              // Eliminar un mismo caracter más de dos veces seguidas
              value = value.replace(/([a-zA-Z0-9])\1{2,}/g, '$1$1');
            
              // Limitar a un solo espacio al inicio o en medio
              value = value.replace(/^\s+/, ''); // Eliminar espacios al inicio
              value = value.replace(/\s{2,}/g, ' '); // Limitar a un solo espacio entre palabras
            
              // Convertir a mayúsculas
              value = value.toUpperCase();
              
              // Asignar el valor modificado al input
              e.target.value = value;
            }}
            
          />
          <label>Nombre del Estado</label>
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

export default EditarEstado;
