import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./nuevoAcceso.css";
import useStore from '../store'; 

const EditarAcceso = ({ onClose, Id_rol, Id_objeto }) => {
  const [accesoInfo, setAccesoInfo] = useState({
    Id_objeto: "",
    Id_Rol: "",
    Permiso_insercion: "0" ,
    Permiso_eliminacion: "0" ,
    Permiso_actualizacion: "0",
    Permiso_consultar: "0",
    Modificado_por:"",
    Fecha_modificacion:"",
  });

  const [modalVisible, setModalVisible] = useState(true); 

  const [idRol, setIdRol] = useState("");
  const [idObjeto, setIdObjeto] = useState("");
  const [roles, setRoles] = useState([]);
  const [objetos, setObjetos] = useState([]);
  const [selectedRol, setSelectedRol] = useState("");
  const [selectedObjeto, setSelectedObjeto] = useState("");

  const [rolErrorMessage, setRolErrorMessage] = useState("");
  const [objetoErrorMessage, setObjetoErrorMessage] = useState("");

  const Id_usuario = useStore((state)=> state.Id_usuario);
  const usuario = useStore((state) => state.usuario);

  useEffect(() => {
    const ObtenerRol = async () => {
      try {
        const response = await fetch("http://localhost:3001/obtenerRoles");
        const data = await response.json();
        setRoles(data);
      } catch (error) {
        console.error("Error al obtener el registro:", error.message);
      }
    };

    ObtenerRol();
  }, []);

  useEffect(() => {
    const obtenerPantallas = async () => {
      try {
        const response = await fetch("http://localhost:3001/obtenerObjetos");
        const data = await response.json();
        setObjetos(data);
      } catch (error) {
        console.error("Error al obtener registros:", error.message);
      }
    };

    obtenerPantallas();
  }, []);

  const cancelarCreacion = () => {
    onClose();
  };

  const obtenerIdRol = (NombreRol) => {
    const rolSeleccionado = roles.find((rol) => rol.Rol === NombreRol);
    return rolSeleccionado ? rolSeleccionado.Id_Rol : null;
  };
  
  const obtenerIdObjeto = (NombreObjeto) => {
    const objetoSeleccionado = objetos.find((objeto) => objeto.Objeto === NombreObjeto);
    return objetoSeleccionado ? objetoSeleccionado.Id_objeto : null;
  };

  const validarRol = (event) => {
    const selectedOption = event.target.value;
    const errorMessage = selectedOption ? "" : "Debes seleccionar un rol";
    setRolErrorMessage(errorMessage);
    setSelectedRol(selectedOption);
    setAccesoInfo((prevaccesoInfo) => ({
      ...prevaccesoInfo,
      Id_Rol: selectedOption ? obtenerIdRol(selectedOption) : "",
    }));
  };

  const validarObjeto = (event) => {
    const selectedOption = event.target.value;
    const errorMessage = selectedOption ? "" : "Debes seleccionar una pantalla";
    setObjetoErrorMessage(errorMessage);
    setSelectedObjeto(selectedOption);
    setAccesoInfo((prevaccesoInfo) => ({
      ...prevaccesoInfo,
      Id_objeto: selectedOption ? obtenerIdObjeto(selectedOption) : "",
    }));
  };

  useEffect(() => {
    const obtenerRegistro = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/obtenerRegistro/${Id_objeto}/${Id_rol}`
        );
        if (!response.ok) {
          throw new Error("Error al obtener el registro");
        }
        const data = await response.json();
        setAccesoInfo(data);
        setIdRol(data.Id_Rol.toString());
        setIdObjeto(data.Id_objeto.toString());
        const rolSeleccionado = roles.find((rol) => rol.Id_Rol === data.Id_Rol);
        const objetoSeleccionado = objetos.find((objeto) => objeto.Id_objeto === data.Id_objeto);
        
        if (rolSeleccionado) {
          setSelectedRol(rolSeleccionado.Rol);
        }

        if (objetoSeleccionado) {
          setSelectedObjeto(objetoSeleccionado.Objeto);
        }
      } catch (error) {
        console.error(
          "Error al obtener la información del registro:",
          error.message
        );
      }
    };
    obtenerRegistro();
  }, [Id_objeto, Id_rol, objetos, roles]);

  const editarPermiso = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch( `http://localhost:3001/editarAcceso/${Id_objeto}/${Id_rol}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...accesoInfo,
          Permiso_insercion: accesoInfo.Permiso_insercion,
          Permiso_eliminacion: accesoInfo.Permiso_eliminacion,
          Permiso_actualizacion: accesoInfo.Permiso_actualizacion,
          Permiso_consultar: accesoInfo.Permiso_consultar,
          //Modificado_por: usuario
        }),
      });

      if (response.ok) {
        Swal.fire({
          title: "Permiso editado",
          text: "El acceso ha sido modificado con éxito.",
          icon: "success",
          confirmButtonText: "Aceptar",
        }).then(() => {
          setModalVisible(false);
          onClose();
        });
      } else {
        throw new Error("Error en el registro");
      }
    } catch (error) {
      console.error("Error en el registro:", error.message);
    }
  };

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setAccesoInfo((prev) => ({
      ...prev,
      [name]: checked ? "1" : "0",
    }));
  };

  return (
    <form onSubmit={editarPermiso} className="acceso">
      <h1 id="Titulo">EDITAR ACCESO</h1>
      <div className="input-container">
        <label className="custom-label">
          Rol:
          <select
            className="inputRol custom-select"
            onChange={validarRol}
            value={selectedRol}
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
        <label className="custom-label">
          Objeto:
          <select
            className="inputObjeto custom-select"
            onChange={validarObjeto}
            value={selectedObjeto}
            required
          >
            <option value="">Selecciona un objeto</option>
            {objetos.map((objetoObject, index) => (
              <option key={index} value={objetoObject.Objeto}>
                {objetoObject.Objeto}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Checkboxes de Permiso */}
      <div className="input-container">
        <div className="checkbox-container">
          <div className="estado-container">
            <input
              type="checkbox"
              name="Permiso_insercion"
              checked={accesoInfo.Permiso_insercion === "1"}
              onChange={handleCheckboxChange}
            />
          </div>
          <span className="estado-label">Insertar</span>
        </div>
        <div className="checkbox-container">
          <div className="estado-container">
            <input
              type="checkbox"
              name="Permiso_eliminacion"
              checked={accesoInfo.Permiso_eliminacion === "1"}
              onChange={handleCheckboxChange}
            />
          </div>
          <span className="estado-label">Eliminar</span>
        </div>
        <div className="checkbox-container">
          <div className="estado-container">
            <input
              type="checkbox"
              name="Permiso_actualizacion"
              checked={accesoInfo.Permiso_actualizacion === "1"}
              onChange={handleCheckboxChange}
            />
          </div>
          <span className="estado-label">Actualizar</span>
        </div>
        <div className="checkbox-container">
          <div className="estado-container">
            <input
              type="checkbox"
              name="Permiso_consultar"
              checked={accesoInfo.Permiso_consultar === "1"}
              onChange={handleCheckboxChange}
            />
          </div>
          <span className="estado-label">Consultar</span>
        </div>
      </div>

      {/* Botones de formulario */}
      <div className="form-buttons-crear">
        <button id="crear" type="submit">
          GUARDAR
        </button>
        <span className="button-spacing"></span>
        <button id="cancelar" type="button" onClick={cancelarCreacion}>
          CANCELAR
        </button>
      </div>
    </form>
  );
};

export default EditarAcceso;
