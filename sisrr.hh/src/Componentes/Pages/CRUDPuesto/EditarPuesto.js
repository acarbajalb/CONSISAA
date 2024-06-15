import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./editarPuesto.css";
import useStore from '../store'; 

const EditarPuesto = ({ onClose, Id_Puesto }) => {
  // Se define el estado en grupo
  const usuario = useStore((state) => state.usuario);
  const [PuestoInfo, setPuesto] = useState({
    Id_departamento: "",
    Nombre_puesto: "",
    Descripcion_puesto: "",
    Salario_inicial: "",
    Techo_salario: "",
    Requisitos_puesto: "",
    Modificado_por: "", // Asigna directamente el valor de usuario
    Fecha_modificacion: "",
  });
  //VARIABLES DE ESTADO Y MANEJO DE MENSAJES DE ERRORRES DE LOS COMBOBOX

  const [searchResultspu, setSearchResultspu] = useState([]);
  const [selectedPuestoJefe, setSelectedPuestoJefe] = useState("");
  const [searchText, setSearchText] = useState("");

  const [departamento, setDepartamento] = useState([]);


  const [selectedDepartamento, setSelectedDepartamento] = useState("");
  const [departamentoErrorMessage, setDepartamentoErrorMessage] = useState("");


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

  useEffect(() => {
    const fetchPuestos = async () => {
      try {
        const response = await fetch("http://localhost:3001/traerPuestos");
        if (response.ok) {
          const data = await response.json();
          setSearchResultspu(data); // Almacena los puestos disponibles para mostrar al usuario
        } else {
          throw new Error("Error al obtener los puestos");
        }
      } catch (error) {
        console.error("Error al obtener los puestos:", error.message);
      }
    };
  
    fetchPuestos();
  }, []);

  useEffect(() => {
    console.log("Nuevo ID del jefe del puesto seleccionado:", selectedPuestoJefe);
    // Encontrar el objeto puesto correspondiente al ID seleccionado
    const selectedPuesto = searchResultspu.find(puesto => puesto.Id_Puesto === selectedPuestoJefe);
    // Verificar si se encontró el puesto
    if (selectedPuesto) {
      // Asignar el ID del jefe del puesto seleccionado al estado PuestoInfo
      setPuesto((prevPuestoInfo) => ({
        ...prevPuestoInfo,
        Id_Jefe: selectedPuestoJefe
      }));
    }
  }, [selectedPuestoJefe, searchResultspu]);

  useEffect(() => {
    console.log("Nuevo ID del jefe del puesto seleccionado:", selectedPuestoJefe);
    // Actualizar el estado PuestoInfo con el nuevo ID del jefe del puesto seleccionado
    setPuesto((prevPuestoInfo) => ({
      ...prevPuestoInfo,
      Id_Jefe: selectedPuestoJefe
    }));
  }, [selectedPuestoJefe]);


  // Método para obtener el ID del puesto seleccionado
  const obtenerIdDepartamento = (nombreDepartamento) => {
    const departamentoSeleccionado = departamento.find(
      (depar) => depar.Nombre_departamento === nombreDepartamento
    );
    return departamentoSeleccionado ? departamentoSeleccionado.Id_departamento : null;
  };

  //VALIDACIONES DE SELECCION DE COMBOBOX
  const validarDepartamento = (event) => {
    const selectedOption = event.target.value;
    const errorMessage = selectedOption ? "" : "Debes seleccionar un Departamento";
    setDepartamentoErrorMessage(errorMessage);
    setSelectedDepartamento(selectedOption);
  
    // Actualiza el Id_departamento en el estado de PuestoInfo
    setPuesto((prevPuestoInfo) => ({
      ...prevPuestoInfo,
      Id_departamento: selectedOption ? obtenerIdDepartamento(selectedOption) : "",
    }));
  };
  
 
  //funcion para obtener la informacion/registros del id enviado como parametro.
  useEffect(() => {
    const obtenerPuesto = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/idPuesto/${Id_Puesto}`
        );
        const data = await response.json();
        // Actualizar el estado con los datos del usuario obtenidos de la API
        setPuesto(data);

        const departamentoSeleccionado = departamento.find(
          
          (depa) => depa.Id_departamento === data.Id_departamento);

        if (departamentoSeleccionado) {
          setSelectedDepartamento(departamentoSeleccionado.Nombre_departamento);
        }

        console.log("ID del jefe del puesto obtenido de la API:", data.Id_Jefe);

      } catch (error) {
        console.error(
          "Error al obtener la información del departamento:",
          error.message
        );
      }
    };
    obtenerPuesto();
  }, [Id_Puesto, departamento]);

  const editarPuestos = async (event) => {
    event.preventDefault();
    try {
      console.log("ID del jefe del puesto:", PuestoInfo.Id_Jefe);
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
        const idJefe = selectedPuestoJefe || null; // Asignamos el ID del jefe seleccionado o null si no hay uno seleccionado
        const response = await fetch(
          `http://localhost:3001/editarPuesto/${Id_Puesto}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ...PuestoInfo, Modificado_por: usuario, Id_Jefe: idJefe }), // Incluimos el ID del jefe en el cuerpo de la solicitud
          }
        );
  
        if (response.ok) {
          // Cierra el modal
          setModalVisible(false);
          onClose(); // Cierra el modal completamente
  
          // Muestra la alerta de éxito después de cerrar el modal
          Toast.fire({
            icon: "success",
            title: "Puesto Editado",
            text: `El Puesto ha sido editado con éxito`,
          });
        } else {
          throw new Error("Error en la solicitud");
        }
      }
    } catch (error) {
      console.error("Error al editar el puesto:", error.message);
      alert("Error al editar el puesto");
    }
  };

  //Use effect con la unica funcion de traer los puestos y roles de la BD
  useEffect(() => {
    const obtenerDepartamento = async () => {
      try {
        const response = await fetch("http://localhost:3001/obtenerDepartamento");
        const data = await response.json();
        setDepartamento(data);
      } catch (error) {
        console.error("Error al obtener los departamento:", error.message);
      }
    };

    obtenerDepartamento();
  }, []);

  //Hasta el momento se mantiene el boton de cancelar solo unicamente para cerrar la pantalla de Editar Usuario
  const cancelarEdicion = () => {
    //cierra el formulario-------
    onClose();
  };

  //funcion creada para manejar el cambio de valor en los inputs.
  const handleChange = (event) => {
    const { name, value } = event.target;
    console.log("Nuevo valor de", name, ":", value);
    setPuesto((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <form onSubmit={editarPuestos} className="Editar-Puesto" Editar-Puesto = "true" >
      <h1>EDITAR PUESTO</h1>
      <div className="input-container">
          <div className="input-group">
            <input
              name="Nombre_puesto"
              type="text"
              value={PuestoInfo.Nombre_puesto} // Asignar el valor del Nombre puesto al input
              spellCheck="false"
              className="textbox custom-input"
              onChange={handleChange}
              maxLength={50}
              onInput={(e) => {
                // Obtener el valor del input
                let value = e.target.value;
                
              // Eliminar caracteres especiales
              value = value.replace(/[^a-zA-ZñÑ ]/g, '');
              
              // Eliminar un mismo caracter mas de 2 veces seguidas
              value = value.replace(/([a-zA-Z0-9])\1{2,}/g, '$1$1');

              // Eliminar espacios en blanco al inicio
              value = value.replace(/^\s+/, '');

              // Limitar a un solo espacio
              value = value.replace(/\s+/g, ' ');
        
              // Convertir a mayúsculas
              value = value.toUpperCase();
              
              // Asignar el valor modificado al input
              e.target.value = value;
                }}
              required
            />
             <label>Nombre de Puesto</label>
          </div>
        
          <div className="input-group">
          <input
            name="Requisitos_puesto"
            type="text"
            value={PuestoInfo.Requisitos_puesto} // Asignar el valor del nombre completo al input
            spellCheck="false"
            className="textbox custom-input"
            onChange={handleChange}
            maxLength={100}
            required
            onKeyPress={(e) => {
              const regex = /[0-9]/;
              if (regex.test(e.key)) {
                e.preventDefault();
              }
            }}
            onInput={(e) => {
              // Obtener el valor del input
              let value = e.target.value;
              
            // Eliminar caracteres especiales
            value = value.replace(/[^a-zA-ZñÑ ]/g, '');

            // Limitar a un solo espacio
            value = value.replace(/\s+/g, ' ');

            // Eliminar espacios en blanco al inicio
            value = value.replace(/^\s+/, '');
        
            // Eliminar un mismo caracter mas de 2 veces seguidas
            value = value.replace(/([a-zA-Z0-9])\1{2,}/g, '$1$1');
            
            // Convertir a mayúsculas
            value = value.toUpperCase();
            
            // Asignar el valor modificado al input
            e.target.value = value;
              }}
            
          />
          <label>Requisitos Puesto</label>
        </div>
      </div>

      <div className="input-container">
        <div className="input-group">
          <input
            name="Salario_inicial"
            type="text"
            spellCheck="false"
            className="textbox custom-input"
            value={PuestoInfo.Salario_inicial}
            onChange={handleChange}
            maxLength={6}
            required
            onInput={(e) => {
              const regex = /[^\d]/g; // Expresión regular para aceptar solo números
              let inputValue = e.target.value.replace(regex, ""); // Reemplazar cualquier caracter no numérico con una cadena vacía
              if (inputValue.length > 0 && inputValue[0] === "0") {
                // Si el primer dígito es cero, elimínalo
                inputValue = inputValue.slice(1);
              }
              e.target.value = inputValue; // Asignar el valor modificado al campo de entrada
            }}
          />
          <label>Salario Inicial</label>
        </div>

        <div className="input-group">
          <input
            name="Techo_salario"
            type="text"
            spellCheck="false"
            className="textbox custom-input"
            value={PuestoInfo.Techo_salario}
            onChange={handleChange}
            maxLength={6}
            required
            onInput={(e) => {
              const regex = /[^\d]/g; // Expresión regular para aceptar solo números
              let inputValue = e.target.value.replace(regex, ""); // Reemplazar cualquier caracter no numérico con una cadena vacía
              if (inputValue.length > 0 && inputValue[0] === "0") {
                // Si el primer dígito es cero, elimínalo
                inputValue = inputValue.slice(1);
              }
              e.target.value = inputValue; // Asignar el valor modificado al campo de entrada
            }}
          />
          <label>Techo Salario</label>
        </div>


        <div className="input-group">
          <input
            name="Descripcion_puesto"
            type="text"
            spellCheck="false"
            className="textbox custom-input"
            value={PuestoInfo.Descripcion_puesto}
            onChange={handleChange}
            maxLength={100}
            onInput={(e) => {
              // Obtener el valor del input
              let value = e.target.value;
              
            // Eliminar caracteres especiales
            value = value.replace(/[^a-zA-ZñÑ ]/g, '');

            // Limitar a un solo espacio
            value = value.replace(/\s+/g, ' ');
        
            // Eliminar espacios en blanco al inicio
            value = value.replace(/^\s+/, '');
                          
            // Eliminar un mismo caracter mas de tres veces seguidas
            value = value.replace(/([a-zA-Z0-9])\1{2,}/g, '$1$1');
            
            // Convertir a mayúsculas
            value = value.toUpperCase();
            
            // Asignar el valor modificado al input
            e.target.value = value;
              }}
            required
          />
          <label>Descripcion Puesto</label>
        </div>

      </div>

      <div className="input-container">
        {/* Selección de Departamento */}
        <div className="flex-row">
          <label className="custom-label">
            Departamento:
            <select
              name="Puesto"
              className="inputPuesto custom-select"
              onChange={validarDepartamento}
              value={selectedDepartamento}
              type = "form-select"
              required
            >
              <option value="">Selecciona un Departamento</option>
              {departamento.map((depObject, index) => (
                <option key={index} value={depObject.Nombre_departamento}>
                  {depObject.Nombre_departamento}
                </option>
              ))}
            </select>
          </label>

        </div>
    
        <div className="flex-row">
        <label className="custom-label">
          Jefe del puesto
        <select 
            className="custom-select"
            onChange={(e) => {
              setSelectedPuestoJefe(e.target.value); // Utiliza e.target.value para obtener el nuevo valor seleccionado
              // No necesitas buscar el objeto seleccionado aquí, ya que eso se hace en el useEffect
            }}
            value={selectedPuestoJefe}
            required
          >
            <option value="">Selecciona un puesto jefe</option>
            {searchResultspu.map((puesto) => (
              <option key={puesto.Id_Puesto} value={puesto.Id_Puesto}>
                {puesto.Nombre_puesto}
              </option>
            ))}
          </select>
          </label>
        </div>
       </div>

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

export default EditarPuesto;
