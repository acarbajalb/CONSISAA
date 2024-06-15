import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./editarPlanilla.css";

const EditarPlanilla = ({ onClose, Id_Planilla }) => {
  //Se definio el estado en grupo
  const [id_PlanillaInfo, setId_Planilla] = useState({
    Id_Planilla: "",
    Id_Tipo_De_Planilla: "",
    Id_Empleado: "",
    Id_Deducciones: "",
    Salario: "",
    
  });
  
  //funcion para obtener la informacion/registros del id enviado como parametro.
  useEffect(() => {
    const obtenerId_Planilla = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/idPlanilla/${Id_Planilla}`
        );
        const data = await response.json();
        // Actualizar el estado con los datos del usuario obtenidos de la API
        setId_Planilla(data);
        //Conversion y adquisicion de los datos del combobox a string para insertarlos en los combobox correspondiente

        // Obtener el nombre del puesto y del rol para establecerlos como seleccionado
      } catch (error) {
        console.error(
          "Error al obtener la información del usuario:",
          error.message
        );
      }
    };
    obtenerId_Planilla();
  }, [Id_Planilla]);

  const editarPlanilla = async (event) => {
    event.preventDefault();
    try {
      // Alerta de confirmación antes de la edición
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
          `http://localhost:3001/editarPlanilla/${Id_Planilla}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(id_PlanillaInfo),
          }
        );

        if (response.ok) {
          // Alerta de éxito después de la edición
          Swal.fire({
            title: "¡Éxito!",
            text: "La Planilla ha sido editada exitosamente.",
            icon: "success",
            confirmButtonText: "Aceptar",
          });
        } else {
          throw new Error("Error en la solicitud");
        }
      }
    } catch (error) {
      console.error("Error al editar el usuario:", error.message);
      alert("Error al editar el usuario");
    }
  };

  //Hasta el momento se mantiene el boton de cancelar solo unicamente para cerrar la pantalla de Editar Usuario
  const cancelarEdicion = () => {
    //cierra el formulario-------
    onClose();
  };

  //funcion creada para manejar el cambio de valor en los inputs.
  const handleChange = (event) => {
    const { name, value } = event.target;
    setId_Planilla((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <form onSubmit={editarPlanilla} className="Editar">
      <h1>EDITAR Planilla</h1>
      <div className="input-container">
        <div className="input-group">
          <input
            name="Id_Planilla"
            type="text"
            value={id_PlanillaInfo.Id_Planilla}
            placeholder="Id_Planilla"
            className="textbox custom-input"
            onChange={handleChange}
            maxLength={15}
            required
          />
  
          <input
            name="Id_Tipo_De_Planilla"
            type="text"
            value={id_PlanillaInfo.Id_Tipo_De_Planilla}
            placeholder="Id_Tipo_De_Planilla"
            className="textbox custom-input"
            onChange={handleChange}
            maxLength={15}
            required
          />
        </div>
      </div>
      <div className="input-container">
        <div className="flex-row">
          <input
            name="Id_Empleado"
            type="text"
            placeholder="Id_Empleado"
            className="textbox custom-input"
            value={id_PlanillaInfo.Id_Empleado}
            onChange={handleChange}
            maxLength={20}
            required
          />
          <input
            name="Id_Deducciones"
            type="text"
            placeholder="Id_Deducciones"
            className="textbox custom-input"
            value={id_PlanillaInfo.Id_Deducciones}
            onChange={handleChange}
            maxLength={20}
            required
          />
        </div>
      </div>
      <div className="input-container">
        <div className="flex-row">
          <input
            name="Salario"
            type="text"
            placeholder="Salario"
            className="textbox custom-input"
            value={id_PlanillaInfo.Salario}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="form-buttons-editar">
        <button id="editar" type="submit">
          EDITAR
        </button>
        <span className="button-spacing"></span>
        <button id="cancelar" type="button" onClick={cancelarEdicion}>
          CANCELAR
        </button>
      </div>
    </form>
  );
  
};

export default EditarPlanilla;
