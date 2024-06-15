import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./editarUsuario.css";
import useStore from '../store';

const EditarUsuario = ({ onClose, Id_usuario }) => {
      // Obtén el valor de usuario del estado global
      const usuario = useStore((state) => state.usuario);
  //Se definio el estado en grupo
  const [usuarioInfo, setUsuario] = useState({
    Id_Estado: "",
    Id_Rol: "",
    Id_Puesto: "",
    Usuario: "",
    Nombre_Completo_Usuario: "",
    Contraseña: "",
    Correo_electronico: "",
    Modificado_por:"",
    Fecha_modificacion:"",
  });
  //VARIABLES DE ESTADO Y MANEJO DE MENSAJES DE ERRORRES DE LOS COMBOBOX
  const [roles, setRoles] = useState([]);
  const [puestos, setPuestos] = useState([]);

  const [selectedRol, setSelectedRol] = useState("");
  const [rolErrorMessage, setRolErrorMessage] = useState("");
 
 

  // SELECCION DE PUESTO DE USUARIO
  const [selectednombrePuesto, setSelectedNombrePuesto] = useState(""); //Almacena solo para n¿mostrar el nombre de puesto en pantalla
  const [selectedPuesto, setSelectedPuesto] = useState(""); // Almacena el puesto seleccionado por el usuario.
  const [puestoErrorMessage, setPuestoErrorMessage] = useState(""); //Almacena el mensaje de error si no se ha seleccionado un puesto.

  const [modalVisible, setModalVisible] = useState(true); // Estado para controlar la visibilidad del modal


  const [searchText, setSearchText] = useState(""); // Estado para almacenar el texto de búsqueda
  const [searchResults, setSearchResults] = useState([]); // Estado para almacenar los resultados de la búsqueda


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
  
  // Función para obtener el nombre del puesto por su ID
const obtenerNombrePuesto = async (idPuesto) => {
  try {
    const response = await fetch(
      `http://localhost:3001/obtenerNombrePuesto/${idPuesto}`
    );
    const data = await response.json();
    if (response.ok) {
      return data.nombre; // Devuelve el nombre del puesto
    } else {
      throw new Error(data.error || "Error al obtener el nombre del puesto");
    }
  } catch (error) {
    console.error("Error al obtener el nombre del puesto:", error.message);
    return ""; // Devuelve una cadena vacía en caso de error
  }
};

const handleSearch = async (event) => {
  const searchText = event.target.value.trim();
  setSearchText(searchText);

  try {
    const response = await fetch(`http://localhost:3001/buscarPuestoPorNombre/${searchText}`);
    const data = await response.json();
    if (response.ok) {
      setSelectedPuesto(data.idPuesto); // Actualiza el ID del puesto
      setSelectedNombrePuesto(data.nombre); // Actualiza el nombre del puesto
    } else {
      throw new Error(data.error || "Error al buscar puesto");
    }
  } catch (error) {
    console.error("Error al buscar puesto:", error.message);
  }
};

  // Cambia el estado entre activo (1) e inactivo (0)
  const toggleEstado = () => {
    setUsuario((prevUsuarioInfo) => ({
      ...prevUsuarioInfo,
      Id_Estado: prevUsuarioInfo.Id_Estado === "1" ? "0" : "1",
    }));
  };
 
  
  const obtenerIdRol = (nombreRol) => {
    const rolSeleccionado = roles.find(
      (rolees) => rolees.Rol === nombreRol);
    return rolSeleccionado ? rolSeleccionado.Id_Rol : null;
  };
 
  const validarRol = (event) => {
    const selectedOption = event.target.value;
    const errorMessage = selectedOption ? "" : "Debes seleccionar un Rol";
    setRolErrorMessage(errorMessage);
    setSelectedRol(selectedOption);
    setUsuario((prevUsuarioInfo) => ({
      ...prevUsuarioInfo,
      Id_Rol: selectedOption ? obtenerIdRol(selectedOption) : "",
    }));
  };
 
  //funcion para obtener la informacion/registros del id enviado como parametro.
  useEffect(() => {
    const obtenerUsuario = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/idUsuario/${Id_usuario}`
        );
        const data = await response.json();
        // Actualizar el estado con los datos del usuario obtenidos de la API
        setUsuario(data);
        
        const rolSeleccionado = roles.find((rol) => rol.Id_Rol === data.Id_Rol);

       
        if (rolSeleccionado) {
          setSelectedRol(rolSeleccionado.Rol);
        }
      } catch (error) {
        console.error(
          "Error al obtener la información del usuario:",
          error.message
        );
      }
    };
    obtenerUsuario();
  }, [Id_usuario, roles]);


  const editarUsuario = async (event) => {
    event.preventDefault();
    
    // Validar campos requeridos
    if (!usuarioInfo.Usuario || !usuarioInfo.Nombre_Completo_Usuario || !usuarioInfo.Contraseña || !usuarioInfo.Correo_electronico || !selectedRol || !selectedPuesto) {
      Toast.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, completa todos los campos antes de guardar los cambios.',
      });
      return;
    }
  
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
        const response = await fetch(`http://localhost:3001/editarUsuario/${Id_usuario}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...usuarioInfo, Id_Puesto: selectedPuesto, Modificado_por: usuario }),
        });

        if (response.ok) {
        // Cierra el modal
        setModalVisible(false);
        onClose(); // Cierra el modal completamente

        // Muestra la alerta de éxito después de cerrar el modal
        Toast.fire({
          icon: "success",
          title: "Usuario Editado",
          text: `El Usuario ha sido editado con éxito`,
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

 
  useEffect(() => {
    const obtenerRoles = async () => {
      try {
        const response = await fetch("http://localhost:3001/obtenerRoles");
        const data = await response.json();
        setRoles(data);
      } catch (error) {
        console.error("Error al obtener los roles:", error.message);
      }
    };

    obtenerRoles();
  }, []);

  //Hasta el momento se mantiene el boton de cancelar solo unicamente para cerrar la pantalla de Editar Usuario
  const cancelarEdicion = () => {
    //cierra el formulario-------
    onClose();
  };

  //funcion creada para manejar el cambio de valor en los inputs.
  const handleChange = (event) => {
    const { name, value } = event.target;
    setUsuario((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <form onSubmit={editarUsuario} className="Editar-Usuario" Editar-Usuario="true" >
      <h1>EDITAR USUARIO</h1>
      <div className="input-container">
        <div className="input-group">
          <div className="search-container">
            <i className="bx bx-search icon" style={{marginTop: "5px"}}></i>
            <input
              type="text"
              placeholder="Busque el puesto por su nombre"
              className="search-input"
              value={searchText}
              onChange={handleSearch} // Llamar a la función handleSearch en cada cambio del input
            />
          </div>
        </div> 
      
        <div className="input-group">
        <input
              name="Puesto"
              style={{backgroundColor: "#dedede", color: "#808080", borderColor:"#dedede", marginBottom:"20px"}}
              type="text"
              readOnly
              spellcheck="false"
              className="textbox custom-input"
              value={selectednombrePuesto}  
              maxLength={15}
              required
            /> 
        </div>
      </div>
      <div className="input-container">
          <div className="input-group">
            <input
              name="Usuario"
              type="text"
              value={usuarioInfo.Usuario} // Asignar el valor del usuario al input
              spellCheck="false"
              className="textbox custom-input"
              onChange={handleChange}
              maxLength={15}
              onInput={(e) => {
                const regex = /[^a-zA-Z0-9]/g;
                e.target.value = e.target.value.toUpperCase().replace(regex, "");
              }}
              required
              onKeyDown={(e) => e.preventDefault()} // Evita la entrada de texto
            />
             <label>Nombre de Usuario</label>
          </div>
        
          <div className="input-group">
          <input
            name="Nombre_Completo_Usuario"
            type="text"
            value={usuarioInfo.Nombre_Completo_Usuario} // Asignar el valor del nombre completo al input
            spellCheck="false"
            className="textbox custom-input"
            onChange={handleChange}
            maxLength={40}
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
          <label>Nombre Completo del Usuario</label>
        </div>
      </div>

      <div className="input-container">
        <div className="input-group">
          <input
            name="Contraseña"
            type="password"
            spellCheck="false"
            className="textbox custom-input"
            value={usuarioInfo.Contraseña}
            onChange={handleChange}
            maxLength={30}
            minLength={8}
            required
          />
          <label>Contraseña</label>
        </div>
        <div className="input-group">
          <input
            name="Correo_electronico"
            type="email"
            spellCheck="false"
            className="textbox custom-input"
            value={usuarioInfo.Correo_electronico}
            onChange={handleChange}
            maxLength={50}
            required
          />
          <label>Correo Electronico</label>
        </div>
      </div>

      <div className="input-container">
         <div className="flex-row">
           {/* Selección de ROL */}
          <label className="custom-label">
            Rol:
            <select
              name="Rol"
              className="inputRol custom-select"
              value={selectedRol}
              onChange={validarRol}
              type = "form-select"
              required
            >
              <option value="">Selecciona un rol</option>
              {roles.map((rolObject, index) => (
                <option key={index} value={rolObject.Rol}>
                  {rolObject.Rol}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="input-container">
     {/*   <div className="checkbox-container" style={{marginLeft:"20px"}}>
          <div className="estado-container">
            <input
              name="estados"
              type="checkbox"
              id="estado_usuario"
              className="input"
              onClick={toggleEstado}
              checked={usuarioInfo.Id_Estado === "1" ? true : false} // Marcado si Id_Estado es "1"
            />
          </div>
          <span className="estado-label">Activo</span>
        </div> */}
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

export default EditarUsuario;
