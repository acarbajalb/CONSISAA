import React, { useState, useEffect } from "react";
import "./crearParametro.css";
import Swal from "sweetalert2";
import useStore from '../store.js';  


const CrearParametro = ({ onClose }) => {
  const [parametro, setParametro] = useState("");
  const [valor, setValor] = useState("");

  const [modalVisible, setModalVisible] = useState(true); // Estado para controlar la visibilidad del modal

  
  
  //////////Uso de variable global
  const usuario = useStore((state) => state.usuario);
  const Id_Usuario= useStore((state)=> state.Id_usuario);
  const [creado_Por, setCreadoPor] = useState(usuario);

  //Necesario para obtener el valor de la variable global.
  useEffect(() => {
    setCreadoPor(usuario);
  }, [usuario]);

  //Inicio de la funcion CREAR
  const creacionParametro = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:3001/crearParametro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          User: Id_Usuario,
          Parametro: parametro,
          Valor: valor,
          Fecha_creacion: null,
          Creado_por: creado_Por,
          Fecha_modificacion: null,//Agarrara los valores directamente en el backend
          Modificado_por: creado_Por,
        }),
      });

     
    if (response.ok) {
      // Muestra la alerta de éxito
      Swal.fire({
        title: "Parámetro creado",
        text: "El parámetro ha sido creado con éxito.",
        icon: "success",
        confirmButtonText: "Aceptar",
      }).then(() => {
        // Cierra el modal después de mostrar la alerta de éxito
        setModalVisible(false);
        onClose(); // Cierra el modal completamente
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
    <form onSubmit={creacionParametro} className="CrearParametro" Nuevo-Parametro = "true" >
      <h1 id="Titulo">CREAR PARAMETRO</h1>

      {/* Input para el usuario */}
      <div className="input-container">

      {/* Se elimino el input de nombre*/}
        <div className="input-group">
          <input
            onChange={(event) => {
              setParametro(event.target.value);
            }}
            name="Crear_Parametro"
            type="text" 
            className="textbox custom-input"
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
            onChange={(event) => {
              setValor(event.target.value);
            }}
            name="ValorParametro"
            type="text" 
            className="textbox custom-input"
            minLength={1}
            maxLength={100}
            onInput={(e) => {
                      // Obtener el valor del input
              let value = e.target.value;

              // Eliminar caracteres especiales
              value = value.replace(/[^0-9 ]/g, "");
 
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

      {/*Creación de botones*/}

      <div className="form-buttons-crear">
        <button id="crear" type="submit" onClick={creacionParametro}>
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

export default CrearParametro;
