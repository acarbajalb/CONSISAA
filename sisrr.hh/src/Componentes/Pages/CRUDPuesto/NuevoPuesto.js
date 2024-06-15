import React, { useState, useEffect } from "react";
import "./nuevoPuesto.css";
import Swal from "sweetalert2";
import useStore from '../store'; 

const NuevoPuesto = ({ onClose }) => { 
 
//Combo Boxs
  const [departamento, setDepartamento] = useState([]);

  const [nombrePuesto, setNombrePuesto] = useState("");
  const [descripcionPuesto, setDescripcionPuesto] = useState("");

  const [salarioInicial, setSalarioInicial] = useState("");
  const [techoSalario, setTechoSalario] = useState("");

  const [RequisitosPuesto, setRequisitoPuesto] = useState("");

//////////Uso de variable global 
const usuario = useStore((state) => state.usuario);
const [creado_Por, setCreadoPor] = useState(usuario);

  // SELECCION DE DEPARTAMENTO DE USUARIO
  const [selectedDepartamento, setSelectedDepartamento] = useState(""); 
  const [departamentoErrorMessage, setDepartamentoErrorMessage] = useState(""); 


 // SELECCION DE PUESTO DE USUARIO
 const [selectednombreDepto, setSelectedNombreDepto] = useState(""); //Almacena solo para n¿mostrar el nombre de puesto en pantalla
 const [selectedDepto, setSelectedDepto] = useState(""); // Almacena el puesto seleccionado por el usuario.
 const [deptoErrorMessage, setDeptoErrorMessage] = useState(""); //Almacena el mensaje de error si no se ha seleccionado un puesto.

 const [modalVisible, setModalVisible] = useState(true); // Estado para controlar la visibilidad del modal


 const [searchText, setSearchText] = useState(""); // Estado para almacenar el texto de búsqueda
 const [searchResults, setSearchResults] = useState([]); // Estado para almacenar los resultados de la búsqueda

 const [searchResultspu, setSearchResultspu] = useState([]);
 const [selectedPuestoJefe, setSelectedPuestoJefe] = useState("");

 
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
  

  const handleSearch = async (event) => {
    const searchText = event.target.value;
    setSearchText(searchText);

    try {
      const response = await fetch(
        `http://localhost:3001/buscarDeptoPorNombre/${searchText}`
      );
      const data = await response.json();
      if (response.ok) {
        setSelectedDepto(data.idDepto);
        setSelectedNombreDepto(data.nombre);
 
      } else {
        throw new Error(data.error || "Error al buscar puesto");
      }
    } catch (error) { 
      Toast.fire({
        icon: "warning",
        title: "Inconsistencia en la busqueda",
        text: "Departamento no encontrado",
      });
    }
  };
  
//QUE ESTA RUTA OBTENGA LAS AREAS
   /* Obtener roles desde el servidor al cargar el componente
   useEffect(() => {
    const obtenerDepartamento = async () => {
      try {
        const response = await fetch("http://localhost:3001/obtenerDepartamento");
        const data = await response.json();
        setDepartamento(data);
      } catch (error) {
        console.error("Error al obtener los roles:", error.message);
      }
    };

    obtenerDepartamento();
  }, []);
*/
//Necesario para obtener el valor de la variable global.
useEffect(() => {
  setCreadoPor(usuario);
}, [usuario]);

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

  //Inicio de la funcion CREAR
  const creacionPuesto = async (event) => {
    event.preventDefault();
    
    /* Validación de campos antes de enviar la solicitud
    if (!selectedDepartamento) {
      setDepartamentoErrorMessage("Debes seleccionar una opción de departamento");
      return;
    }
*/
    try {
      const response = await fetch("http://localhost:3001/creacionPuesto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          
          //Este id va para la tabla intermedia.
          Id_departamento: selectedDepto,
          Id_area:"1",
          Nombre_puesto: nombrePuesto,
          Descripcion_puesto: descripcionPuesto,
          Salario_inicial: salarioInicial,
          Techo_salario: techoSalario,
          Requisitos_puesto: RequisitosPuesto,
          Id_Jefe: selectedPuestoJefe,

          //Auditoria
          Creado_por:creado_Por,
          Modificado_por: creado_Por,
          Fecha_creacion: null,
          Fecha_modificacion: null,
        }),
      });

      if (response.ok) {
        // Cierra el modal
        setModalVisible(false);
        onClose(); // Cierra el modal completamente

        // Muestra la alerta de éxito después de cerrar el modal
        Toast.fire({
          icon: "success",
          title: "Puesto Creado",
          text: `El puesto ha sido creado con éxito`,
        });
      } else {
        throw new Error("Error en la solicitud");
      }
    } catch (error) {
      console.error("Error en la solicitud:", error.message); 
        // Si el servidor responde con código de estado 409 (conflicto), significa que el usuario ya existe
        await Swal.fire({
          title: "Error",
          text: "Ya existe un registro con ese nombre de usuario.  Por favor, elija otro nombre de usuario.",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
     
    }
  };

/*
  const validarDepartamento = (event) => {
    const selectedOption = event.target.value;
    setDepartamentoErrorMessage(selectedOption ? "" : "Debes seleccionar un Departamento");
    setSelectedDepartamento(selectedOption);
  };


  const obtenerIdDepartamento = (departamentoo) => {
    const departamentoSeleccionado = departamento.find(
      (depa) => depa.Nombre_departamento === departamentoo);
    return departamentoSeleccionado ? departamentoSeleccionado.Id_departamento : null;
  };*/

  const cancelarCreacion = () => {
    onClose(); // Llama a la función onClose pasada como prop desde MantenimientoUsuario para cerrar el modal
  };



  return (
    <form onSubmit={creacionPuesto} className="CrearPuesto" Nuevo-Puesto = "true">
      <h1 id="Titulo">CREAR PUESTO</h1>
      <div className="input-container">
        <div className="input-group">
          <div className="search-container">
            <i className="bx bx-search icon"></i>
            <input
              type="text"
              placeholder="Busque el departamento por su nombre"
              className="search-input"
              value={searchText}
              onChange={handleSearch} // Llamar a la función handleSearch en cada cambio del input
            />
          </div>
        </div> 
      
        <div className="input-group">
        <input
              name="Depto"
              style={{backgroundColor: "#dedede", color: "#808080", borderColor:"#dedede",  marginBottom:"20px"}}
              type="text"
              readOnly
              spellcheck="false"
              className="textbox custom-input"
              value={selectednombreDepto}  
              maxLength={50}
              required
            /> 
        </div>
      </div>
       {/* Input para el usuario */}
      <div className="input-container">

        <div className="input-group">
       
        <input
        onChange={(event) => {setNombrePuesto(event.target.value); }}
        name="NombrePuesto"
        type="text" 
        className="textbox custom-input"
        maxLength={50}
        onInput={(e) => {
          // Obtener el valor del input
          let value = e.target.value;
          
        // Eliminar caracteres especiales
        value = value.replace(/[^a-zA-ZñÑ ]/g, '');
        
        // Eliminar un mismo caracter mas de 2 veces seguidas
        value = value.replace(/([a-zA-Z0-9])\1{2,}/g, '$1$1');
        
        // Convertir a mayúsculas
        value = value.toUpperCase();

        // Eliminar espacios en blanco al inicio
        value = value.replace(/^\s+/, '');
              
        // Limitar a un solo espacio
        value = value.replace(/\s+/g, ' ');
        
        // Asignar el valor modificado al input
        e.target.value = value;
          }}
          required
    />

          <label>Nombre del Puesto</label>
        </div>

              {/* Input para descripción Puesto */}
      <div className="input-group">
          <input
              onChange={(event) => {setDescripcionPuesto(event.target.value);  }}
              name="descripcionPuesto"
              type="text"
              spellcheck="false"
              className="textbox custom-input"
              maxLength={100}
              onInput={(e) => {
                // Obtener el valor del input
                let value = e.target.value;
                
              // Eliminar caracteres especiales
              value = value.replace(/[^a-zA-ZñÑ ]/g, '');
              
              // Eliminar un mismo caracter mas de 2 veces seguidas
              value = value.replace(/([a-zA-Z0-9])\1{2,}/g, '$1$1');

              // Limitar a un solo espacio
              value = value.replace(/\s+/g, ' ');

              // Eliminar espacios en blanco al inicio
              value = value.replace(/^\s+/, '');
                            
              // Convertir a mayúsculas
              value = value.toUpperCase();
              
              // Asignar el valor modificado al input
              e.target.value = value;
                }}
              required
          />
          <label>Descripción Puesto</label>
        </div>


          {/*Input para salario inicial*/}
        <div className="input-group">
          <input
            onChange={(event) => { setSalarioInicial(event.target.value); }}
            name="salarioInicial"
            type="text"
            spellcheck="false"
            className="textbox custom-input"
            maxLength={6}
            onInput={(e) => {
              const regex = /[^\d]/g; // Expresión regular para aceptar solo números
              let inputValue = e.target.value.replace(regex, ""); // Reemplazar cualquier caracter no numérico con una cadena vacía
              if (inputValue.length > 0 && inputValue[0] === "0") {
                // Si el primer dígito es cero, elimínalo
                inputValue = inputValue.slice(1);
              }
              e.target.value = inputValue; // Asignar el valor modificado al campo de entrada
            }}
          required />
          <label>Salario Inicial</label>
        </div>

      </div>


      <div className="input-container">
        {/*Input para techo salario*/}
        <div className="input-group">
          <input
            onChange={(event) => { setTechoSalario(event.target.value); }}
            name="techoSalario"
            type="text"
            spellcheck="false"
            className="textbox custom-input"
            maxLength={6}
            onInput={(e) => {
              const regex = /[^\d]/g; // Expresión regular para aceptar solo números
              let inputValue = e.target.value.replace(regex, ""); // Reemplazar cualquier caracter no numérico con una cadena vacía
              if (inputValue.length > 0 && inputValue[0] === "0") {
                // Si el primer dígito es cero, elimínalo
                inputValue = inputValue.slice(1);
              }
              e.target.value = inputValue; // Asignar el valor modificado al campo de entrada
            }}
              
          required />
          <label>Techo Salario</label>
        </div>
         
      {/* Input para el Requisito Puesto */}
        <div className="input-group">
          <input
              onChange={(event) => {setRequisitoPuesto(event.target.value);  }}
              name="requisitoPuesto"
              type="text"
              spellcheck="false"
              className="textbox custom-input"
              maxLength={100}
              onInput={(e) => {
                // Obtener el valor del input
                let value = e.target.value;

              // Remover caracteres numéricos
              value = value.replace(/[0-9]/g, '');

              value = value.replace(/[^a-zA-ZñÑ ]/g, '');

              // Remover caracteres repetidos más de tres veces consecutivas
              value = value.replace(/(.)\1{2,}/g, (match, group) => group);

              // Convertir a mayúsculas
              value = value.toUpperCase();

              // Eliminar espacios en blanco al inicio
              value = value.replace(/^\s+/, '');

              // Limitar a un solo espacio
              value = value.replace(/\s+/g, ' ');
        
              
              // Asignar el valor modificado al input
              e.target.value = value;
                }}
              required
          />
          <label>Requisitos Puesto</label>
        </div>
      </div>
   

      {/* Otro contenedor de inputs */}
    {/*   <div className="input-container">
        <div className="flex-row">

          Selección de Departamento
          <label className="custom-label">
           Departamento:
            <select
              className="inputDepartamento custom-select"
              onChange={validarDepartamento}
              value={selectedDepartamento}
              type = "form-select"
              required
            >
              <option value="">Selecciona un departamento</option>
              {departamento.map((depaObject, index) => (
                <option key={index} value={depaObject.Nombre_departamento}>
                  {depaObject.Nombre_departamento}
                </option>
              ))}
            </select>
          </label>
        
        </div>
      </div> */}

       <div className="input-container">
        <div className="flex-row">
          <label className="custom-label"> 
            Jefe del Puesto        
            <select
            className="custom-select"
            onChange={(e) => setSelectedPuestoJefe(e.target.value)}
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

      {/*Creación de botones*/}

      <div className="form-buttons-crear">
        <button id="crear" type="submit" onClick={creacionPuesto}>
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

export default NuevoPuesto;
