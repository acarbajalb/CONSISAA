import React, { useState, useEffect } from "react";
import "./nuevoRol.css";
import Swal from "sweetalert2";
import useStore from "../store";

const NuevoRol = ({ onClose }) => {
    const [rol, setRol] = useState("");
    const [Descripcion, setDescripcion] = useState("");
    const usuario = useStore((state) => state.usuario);

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
      }
    });
  

  //Inicio de la funcion CREAR
  const creacionRol = async (event) => {
  event.preventDefault();    

    try {
        const response = await fetch("http://localhost:3001/creacionRol", {
         method: "POST",
        headers: {
            "Content-Type": "application/json",
         },
        body: JSON.stringify({
          Rol: rol,
          Descripcion: Descripcion,
          Creado_por: usuario,
          Modificado_por: usuario,
   
        }),
      });

      if (response.ok) {
      // Cierra el modal
      setModalVisible(false);
      onClose(); // Cierra el modal completamente

      // Muestra la alerta de éxito después de cerrar el modal
      Toast.fire({
        icon: "success",
        title: "Rol Creado",
        text: `El Rol ha sido creado con éxito`,
      });

      } else {
        throw new Error("Error en la solicitud");
      }
    } catch (error) {
      console.error("Error en la solicitud:", error.message);
    }
  };


  const cancelarCreacion = () => {
    onClose(); // Llama a la función onClose pasada como prop desde MantenimientoUsuario para cerrar el modal
  };

  return (
    <form onSubmit={creacionRol} className="Crear" Crear-Departamento = "true">
      <h1 id="Titulo">CREAR ROL</h1>

       {/* Input para el usuario */}
      <div className="input-container">
        <div className="input-group">
          <input
            onChange={(event) => {setRol(event.target.value); }}
            name="Rol"
            type="text"
            className="textbox custom-input"
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
       {/* Input para el nombre completo */}
      </div>

      <div className="input-group">
          <input
            onChange={(event) => {setDescripcion(event.target.value); }}
            name="Descripcion"
            type="text"
            className="textbox custom-input"
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
        <label>Descripcion</label>
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

export default NuevoRol;
