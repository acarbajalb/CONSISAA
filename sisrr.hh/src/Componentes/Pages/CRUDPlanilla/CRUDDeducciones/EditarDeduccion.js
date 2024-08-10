import React, { useState, useEffect } from "react";
import Swal from 'sweetalert2';
import "./editarDeduccion.css";

const EditarDeduccion = ({ onClose, Id_Deduccion }) => {
  const [deduccionInfo, setDeduccionInfo] = useState({
    Nombre_Deduccion: "",
    Porcentaje_Monto: "",
    Descripcion: "",
  });

  useEffect(() => {
    const obtenerDeduccion = async () => {
      try {
        const response = await fetch(`http://localhost:3001/idDeduccion/${Id_Deduccion}`);
        const data = await response.json();
        setDeduccionInfo(data);
      } catch (error) {
        console.error("Error al obtener la información de la deducción:", error.message);
      }
    };
    obtenerDeduccion();
  }, [Id_Deduccion]);

  const editarDeduccion = async (event) => {
    event.preventDefault();
    try {
      const confirmacion = await Swal.fire({
        title: '¿Estás seguro?',
        text: '¿Deseas editar el registro?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, editar',
        cancelButtonText: 'Cancelar'
      });
      
      if (confirmacion.isConfirmed) {
        const response = await fetch(`http://localhost:3001/editarDeducciones/${Id_Deduccion}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(deduccionInfo)
        });
  
        if (response.ok) {
          Swal.fire({
            title: '¡Éxito!',
            text: 'La deducción ha sido editada exitosamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
        } else {
          throw new Error("Error en la solicitud");
        }
      }
    } catch (error) {
      console.error("Error al editar la deducción:", error.message);
      alert("Error al editar la deducción");
    }
  };
  
  const cancelarEdicion = () => {
    onClose();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setDeduccionInfo(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  return (
    <form onSubmit={editarDeduccion} className="Editar">
      <h1>EDITAR DEDUCCIÓN</h1>

      <div className="input-container">
      <div>
          <input
            name="Nombre_Deduccion"
            value={deduccionInfo.Nombre_Deduccion}
            type="text"
            placeholder="Motivo de Deducción"
            className="textbox custom-input"
            onChange={handleChange}
            maxLength={35}
          />
      
      </div>
      
      <div className="input-container">
        
          <div>
            <input
              name="Porcentaje_Monto"
              value={deduccionInfo.Porcentaje_Monto}
              type="text"
              placeholder="Porcentaje a deducir"
              className="textbox custom-input"
              onChange={handleChange}
              maxLength={20}
            />
            <span style={{ fontSize:'0.5em',fontWeight:'bold'}}>%</span>
          </div>
      
      </div>

      </div>

      <div className="input-container">
        <div className="flex-row">
          <textarea
            name="Descripcion"
            value={deduccionInfo.Descripcion}
            placeholder="Descripción"
            className="textbox custom-input"
            onChange={handleChange}
            maxLength={100}
            rows={4}
            cols={50}
          />
        </div>
      </div>
      <div className="form-buttons-editar">
        <button type="submit">EDITAR</button>
        <span className="button-spacing"></span>
        <button type="button" onClick={cancelarEdicion}>CANCELAR</button>
      </div>
    </form>
  );
};

export default EditarDeduccion;
