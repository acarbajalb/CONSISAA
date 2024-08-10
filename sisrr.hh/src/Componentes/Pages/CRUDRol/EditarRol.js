import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./editarRol.css";
import useStore from "../store";

const EditarRol = ({ onClose, Id_Rol }) => {
  const usuario = useStore((state) => state.usuario);
  const [rolInfo, setRol] = useState({
    Rol: "",
    Descripcion:"",
    Modificado_por:usuario,
  });
  const [modalVisible, setModalVisible] = useState(true);

  useEffect(() => {
    const obtenerRol = async () => {
      try {
        const response = await fetch(`http://localhost:3001/idRol/${Id_Rol}`);
        const data = await response.json();
        setRol(data);
      } catch (error) {
        console.error("Error al obtener la información del Rol:", error.message);
      }
    };
    obtenerRol();
  }, [Id_Rol]);

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

  const editarRol = async (event) => {
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
        const response = await fetch(`http://localhost:3001/editarRol/${Id_Rol}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(rolInfo),
        });

        if (response.ok) {
          // Cierra el modal
          setModalVisible(false);
          onClose(); // Cierra el modal completamente

          // Muestra la alerta de éxito después de cerrar el modal
          Toast.fire({
          icon: "success",
          title: "Rol Editado",
          text: `El Rol ha sido Editado con éxito`,
        });
        } else {
          throw new Error("Error en la solicitud");
        }
      }
    } catch (error) {
      console.error("Error al editar el Rol:", error.message);
      alert("Error al editar el Rol");
    }
  };

  const cancelarEdicion = () => {
    onClose();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setRol((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <form onSubmit={editarRol} className="Editar" Editar-Departamento = "true">
      <h1>EDITAR ROL</h1>
      <div className="input-container">
        <div className="input-group">
          <input
            name="Rol"
            type="text"
            value={rolInfo.Rol}
            className="textbox custom-input"
            onChange={handleChange}
            maxLength={30}
            onInput={(e) => {
              // Obtener el valor del input
              let value = e.target.value;
              
              // Eliminar caracteres especiales y números
              value = value.replace(/[^a-zA-Z ]/g, '');
              
              // Eliminar un mismo caracter más de dos veces seguidas
              value = value.replace(/([a-zA-Z])\1{2,}/g, '$1$1');
              
              value = value.replace(/^\s+/, ''); // Eliminar espacios al inicio

              // Limitar a un solo espacio
              value = value.replace(/\s+/g, ' ');
              
              // Convertir a mayúsculas
              value = value.toUpperCase();
              
              // Asignar el valor modificado al input
              e.target.value = value;
            }}
            required
          />
          <label>Rol</label>
        </div>

        <div className="input-group">
          <input
            name="Descripcion"
            type="text"
            value={rolInfo.Descripcion}
            className="textbox custom-input"
            onChange={handleChange}
            maxLength={100}
            onInput={(e) => {
              // Obtener el valor del input
              let value = e.target.value;
              
              // Eliminar caracteres especiales y números
              value = value.replace(/[^a-zA-Z ]/g, '');
              
              // Eliminar un mismo caracter más de dos veces seguidas
              value = value.replace(/([a-zA-Z])\1{2,}/g, '$1$1');
              
              value = value.replace(/^\s+/, ''); // Eliminar espacios al inicio

              // Limitar a un solo espacio
              value = value.replace(/\s+/g, ' ');
              
              // Convertir a mayúsculas
              value = value.toUpperCase();
              
              // Asignar el valor modificado al input
              e.target.value = value;
            }}
            required
          />
          <label>Descripción</label>
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

export default EditarRol;
