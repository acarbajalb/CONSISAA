import React, { useState, useEffect } from "react";
import "./nuevaDeduccion.css";
import Swal from 'sweetalert2';

const NuevaDeduccion = ({onClose}) => {

  //estados de constantes
  const [nombre_deduccion, setNombreDeduccion] = useState("");
  const [porcentaje_monto, setPorcentajeMontoDeduccion] = useState("");
  const [descripcion, setDescripcionDeduccion] = useState("");
  const [estadoDeduccion, setEstado] = useState(1); // Estado activo por defecto
  
  const limpiarCampo = (setStateFunction) => {
    setStateFunction(""); // Establece el valor del campo en una cadena vacía
  };
  
 
  const creacionDeduccion = async (event) => {
    event.preventDefault();
  
    
    try {
      const response = await fetch("http://localhost:3001/CrearDeduccion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Nombre_Deduccion: nombre_deduccion,
          Porcentaje_Monto: porcentaje_monto,
          Descripcion: descripcion,
          //Se tiene que crear activo.
          Id_Estado_Deduccion: estadoDeduccion,
          //Asigne directamente temporalmente
          Id_Empleado:"1",
          Id_Tipo_Deduccion:"1",
          Creado_por: "Marilyn Mejia",
          Modificado_por: "Marilyn Mejia",
          Fecha_creacion: "2024-03-16",
          Fecha_modificacion: "2024-03-16",
        }),
      });

      if (response.ok) {
    
        // Muestra la alerta de éxito
        Swal.fire({
          title: 'Deducción creada',
          text: 'La deducción ha sido creada con éxito.',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        })
        .then(() => {
          limpiarCampo(setNombreDeduccion); // Limpia el campo nombre_deduccion después de cerrar la alerta de éxito
          limpiarCampo(setPorcentajeMontoDeduccion); // Limpia el campo porcentaje_monto después de cerrar la alerta de éxito
          limpiarCampo(setDescripcionDeduccion); // Limpia el campo descripcion después de cerrar la alerta de éxito
        });

      } else {
        // Muestra una alerta de error personalizada
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al crear la deducción. Por favor, inténtalo de nuevo más tarde.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    } catch (error) {
      // Muestra una alerta de error personalizada si hay un error en la solicitud
      Swal.fire({
        title: 'Error',
        text: 'Hubo un problema al procesar la solicitud. Por favor, inténtalo de nuevo más tarde.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
      console.error("Error en la solicitud:", error.message);
    }
  };
  
//En dado caso que el usuario cancele la creación.
  const cancelarCreacion = () => {
    onClose(); // Llama a la función onClose pasada como prop desde MantenimientoUsuario para cerrar el modal
  };

  return (
    <form onSubmit={creacionDeduccion} className="Crear">
      <h1 id="Titulo">CREAR DEDUCCIÓN</h1>

      <div className="input-container">
        <div >
          <input
            onChange={(event) => {
          setNombreDeduccion(event.target.value);
            }}
            name="nombreDeduccion"
            type="text"
            placeholder="Motivo de Deducción"
            className="textbox custom-input"
            maxLength={35}
            required
            onKeyPress={(e) => {
              const regex = /[0-9]/;
              if (regex.test(e.key)) {
                e.preventDefault();
              }
            }}
            onInput={(e) => {
              e.target.value = e.target.value.toUpperCase();
            }}
          />
          </div>
      

        {/* Input de Porcentaje monto  */}
        <div>
          <input
            onChange={(event) => {
            setPorcentajeMontoDeduccion(event.target.value);
            }}
            name="porcentajeMonto"
            type="text"
            placeholder="Porcentaje a deducir"
            className="textbox custom-input"
            maxLength={20}// Limita la longitud del input a 40 caracteres
            required 
            onInput={(e) => {
              const regex = /[^\d]/g; // Expresión regular para aceptar solo números
              e.target.value = e.target.value.replace(regex, ""); // Reemplazar cualquier caracter no numérico con una cadena vacía
            }}
            />
          <span style={{ fontSize:'0.5em',fontWeight:'bold'}}>%</span>
      </div>
    </div>


 {/* Descripcion del motivo de la deduccion */}
      <div className="input-container">

        <div className="flex-row">
            {/*Uso de Text area para mayor presentación de espacio para ingresar descripción. */}
        <textarea
          onChange={(event) => {
            setDescripcionDeduccion(event.target.value);
          }}
          name="descripcion"
          placeholder="Descripción"
          className="textbox custom-input"
          maxLength={120} // Limita la longitud del textarea a 100 caracteres
          rows={5} // Número de filas visibles
          cols={60} // Número de columnas visibles
          required
          onKeyPress={(e) => {
            const regex = /[0-9]/;
            if (regex.test(e.key)) {
              e.preventDefault();
            }
          }}
          onInput={(e) => {
            e.target.value = e.target.value.toUpperCase();
          }}
        />
        </div>
      </div>


{/*Creación de botones*/}
          <div className="form-buttons-crear">
            <button id="crear" type="submit" onClick={creacionDeduccion} >CREAR</button>
            <span className="button-spacing"></span> {/* Espacio entre botones */}
            <button id="cancelar" type="button" onClick={cancelarCreacion}>CANCELAR</button>
          </div>  
              
    </form>
  )
}

export default NuevaDeduccion;

