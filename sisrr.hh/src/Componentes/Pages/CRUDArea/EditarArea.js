import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./editarArea.css";
import useStore from "../store";


const EditarArea = ({ onClose, Id_area }) => {
  const usuario = useStore((state) => state.usuario);

  const [areaInfo, setArea] = useState({
    Nombre_area: "",
  });
  const [modalVisible, setModalVisible] = useState(true);

  useEffect(() => {
    const obtenerArea = async () => {
      try {
        const response = await fetch(`http://localhost:3001/idArea/${Id_area}`);
        const data = await response.json();
        setArea(data);
      } catch (error) {
        console.error("Error al obtener la información de Area:", error.message);
      }
    };
    obtenerArea();
  }, [Id_area]);

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

  const editarArea = async (event) => {
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
        const response = await fetch(`http://localhost:3001/editarArea/${Id_area}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({...areaInfo, Modificado_por: usuario,
          }),
        });

         //Guarda el mensaje que recibe desde el back
         const result = await response.json();

         if (response.ok) {
           setModalVisible(false);
           onClose();
 
           Toast.fire({
             icon: "success",
             title: "Área Editado",
             text: result.message || "El Área ha sido editada con éxito",
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
       console.error("Error al editar el Área:", error.message);
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
    setArea((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <form onSubmit={editarArea} className="Editar" Editar-Area = "true">
      <h1>EDITAR AREA</h1>
      <div className="input-container">
        <div className="input-group">
          <input
            name="Nombre_area"
            type="text"
            value={areaInfo.Nombre_area}
            placeholder="Nombre Area"
            className="textbox custom-input"
            onChange={handleChange}
            maxLength={15}
            onInput={(e) => {
              // Obtener el valor del input
              let value = e.target.value;
              
              // Eliminar caracteres especiales
              value = value.replace(/[^a-zA-Z0-9 ]/g, '');
              
              // Eliminar un mismo caracter mas de dos veces seguidas
              value = value.replace(/([a-zA-Z0-9])\1{2,}/g, '$1$1');
              
              // Limitar a un solo espacio
              value = value.replace(/\s+/g, ' ');
              
              // Convertir a mayúsculas
              value = value.toUpperCase();
              
              // Asignar el valor modificado al input
              e.target.value = value;
            }}
            required
          />
          <label>Area</label>
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

export default EditarArea;
