import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./editarParametro.css";
import useStore from '../store.js';  



const EditarParametro = ({ onClose, Id_parametro }) => {
  const usuario = useStore((state) => state.usuario);
  const [parametroInfo, setParametro] = useState({
   
    Parametro: "",
    Valor:"",

    Modificado_por:"",
    Fecha_modificacion:"",
  });
  const [modalVisible, setModalVisible] = useState(true);


  useEffect(() => {
    const obtenerParametro = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/idparametro/${Id_parametro}`
        );
        const data = await response.json();
        // Actualizar el estado con los datos del usuario obtenidos de la API
        setParametro(data);
        // Obtener el nombre del puesto y del rol para establecerlos como seleccionados

      } catch (error) {
        console.error(
          "Error al obtener la información del empleado:",
          error.message
        );
      }
    };
    obtenerParametro();
  }, [Id_parametro]);

  const EditarParametro = async (event) => {
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
        const response = await fetch(`http://localhost:3001/editarParametro/${Id_parametro}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(parametroInfo),
        });

        if (response.ok) {
          Swal.fire({
            title: "¡Éxito!",
            text: "El parametro ha sido editado exitosamente.",
            icon: "success",
            confirmButtonText: "Aceptar",
          }).then(() => {
            setModalVisible(false);
            onClose();
          });
        } else {
          throw new Error("Error en la solicitud");
        }
      }
    } catch (error) {
      console.error("Error al editar el parametro:", error.message);
      alert("Error al editar el parametro");
    }
  };

  const cancelarEdicion = () => {
    onClose();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setParametro((prevState) => ({
      ...prevState,
      [name]: value,
      Modificado_por: usuario
    }));
  };

  return (
    <form onSubmit={EditarParametro} className="Editar" Editar-Parametro = "true">
      <h1>EDITAR PARAMETRO</h1>
      <div className="input-container">
         
        <div className="input-group">
          <input 
            name="Parametro"
            type="text"             
            onChange={handleChange}
            value={parametroInfo.Parametro} 
            className="textbox custom-input"
            minLength={1}
            maxLength={30}
            onInput={(e) => {
                      // Obtener el valor del input
              let value = e.target.value;

              // Eliminar caracteres especiales
              value = value.replace(/[^a-zA-Z_ ]/g, "");

              // Eliminar un mismo caracter mas de dos veces seguidas
              value = value.replace(/([a-zA-Z_])\1{2,}/g, "$1$1");

              // Limitar a un solo espacio
              value = value.replace(/\s+/g, " ");

              // Convertir a mayúsculas
              value = value.toUpperCase();

              // Asignar el valor modificado al input
              e.target.value = value;
            }}
            required
          />
          <label>Parametro</label>
        </div>
          <div className="input-group">
            <input 
            name="Valor"
            type="text"             
            onChange={handleChange}
            value={parametroInfo.Valor} 
            className="textbox custom-input"
            minLength={1}
            maxLength={100}
            onInput={(e) => {
                      // Obtener el valor del input
              let value = e.target.value;

             // Eliminar caracteres especiales, pero permitir letras y números
              value = value.replace(/[^a-zA-Z0-9 ]/g, "");
              // Limitar a un solo espacio
              value = value.replace(/\s+/g, " ");
 

              // Asignar el valor modificado al input
              e.target.value = value;
            }}
            required
          />
          <label>Valor</label>
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

export default EditarParametro;
