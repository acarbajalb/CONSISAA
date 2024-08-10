import React, { useState, useEffect } from "react";
import "./nuevoAcceso.css";
import Swal from "sweetalert2";
//Importacion de store.
import useStore from "../store";
import { User } from "@icon-park/react";

function NuevoAcceso({ onClose }) {
  const [modalVisible, setModalVisible] = useState(true);
  const [roles, setRoles] = useState([]);
  const [objetos, setObjetos] = useState([]);
  const [selectedRol, setSelectedRol] = useState("");
  const [selectedObjeto, setSelectedObjeto] = useState("");

  //FALTA QUE MANDE LA FECHA EN EL FORMATO ACEPTADO y que fecha creacion y creado por solo la guarde una vez
  const [insertar, setInsertar] = useState("0");
  const [eliminar, setEliminar] = useState("0");
  const [actualizar, setActualizar] = useState("0");
  const [consultar, setConsultar] = useState("0");

  /*Es aqui donde definimos constantes para que se puedan usar con los valores traídos de store.js*/
  const usuario = useStore((state) => state.usuario);
  const user = useStore((state) => state.usuario);

  const [creado_Por, setCreadoPor] = useState(usuario || "");
  const [modificadoPor, setModificadoPor] = useState(user || "");

  //Necesario para obtener el valor de la variable global.
  useEffect(() => {
    setCreadoPor(usuario);
    setModificadoPor(user);
  }, [usuario, user]);

  console.log("Creado por:", usuario);
  console.log("Modificado por:", user);

  const cancelarCreacion = () => {
    onClose();
  };

  const handleRolChange = (event) => {
    setSelectedRol(event.target.value);
  };

  const handleObjetoChange = (event) => {
    setSelectedObjeto(event.target.value);
  };
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


  const crearPermiso = async (event) => {
    event.preventDefault();
 
    try {
      const response = await fetch("http://localhost:3001/creacionPermiso", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Id_objeto: parseInt(selectedObjeto),
          Id_Rol: parseInt(selectedRol),
          Permiso_insercion: insertar,
          Permiso_eliminacion: eliminar,
          Permiso_actualizacion: actualizar,
          Permiso_consultar: consultar,
          Creado_por: usuario, //Se le asinga la variable que guarda el usuario global
          Modificado_por: usuario,
          Fecha_creacion: null, //se pasa desde el backend con un metodo
          Fecha_modificacion: null, //se pasa desde el backend con un metodo
        }),
      });

      if (response.ok) {
        // Cierra el modal
        setModalVisible(false);
        onClose(); // Cierra el modal completamente

        // Muestra la alerta de éxito después de cerrar el modal
        Toast.fire({
          icon: "success",
          title: "Registro Creado",
          text: `El registro ha sido creado con éxito`,
        });
      } else {
        throw new Error("Error en el registro");
      }
    } catch (error) {
      console.error("Error en el registro:", error.message);
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

  useEffect(() => {
    const obtenerObjetos = async () => {
      try {
        const response = await fetch("http://localhost:3001/obtenerObjetos");
        const data = await response.json();
        setObjetos(data);
      } catch (error) {
        console.error("Error al obtener los objetos:", error.message);
      }
    };
    obtenerObjetos();
  }, []);

  return (
    <form onSubmit={crearPermiso} className="acceso">
      <h1 id="Titulo">NUEVO ACCESO</h1>
      <div className="input-container">
        <label className="custom-label">
          Rol:
          <select
            className="inputRol custom-select"
            value={selectedRol}
            onChange={handleRolChange}
            required
          >
            <option value="">Selecciona un rol</option>
            {roles.map((rolObject) => (
              <option key={rolObject.Id_Rol} value={rolObject.Id_Rol}>
                {rolObject.Rol}
              </option>
            ))}
          </select>
        </label>
        <label className="custom-label">
          Objeto:
          <select
            className="inputObjeto custom-select"
            value={selectedObjeto}
            onChange={handleObjetoChange}
            required
          >
            <option value="">Selecciona un objeto</option>
            {objetos.map((objeto) => (
              <option key={objeto.Id_objeto} value={objeto.Id_objeto}>
                {objeto.Objeto}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Aquí van los otros campos todos checkbox */}
      <div className="input-container">
        <div className="checkbox-container">
          <div className="estado-container">
            <input
              type="checkbox"
              checked={insertar === "1"}
              onChange={(e) => setInsertar(e.target.checked ? "1" : "0")} // Cambiado a string
            />
          </div>
          <span className="estado-label">Insertar</span>
        </div>
        <div className="checkbox-container">
          <div className="estado-container">
            <input
              type="checkbox"
              checked={eliminar === "1"}
              onChange={(e) => setEliminar(e.target.checked ? "1" : "0")} // Cambiado a string
            />
          </div>
          <span className="estado-label">Eliminar</span>
        </div>
        <div className="checkbox-container">
          <div className="estado-container">
            <input
              type="checkbox"
              checked={actualizar === "1"}
              onChange={(e) => setActualizar(e.target.checked ? "1" : "0")} // Cambiado a string
            />
          </div>
          <span className="estado-label">Actualizar</span>
        </div>
        <div className="checkbox-container">
          <div className="estado-container">
            <input
              type="checkbox"
              checked={consultar === "1"}
              onChange={(e) => setConsultar(e.target.checked ? "1" : "0")} // Cambiado a string
            />
          </div>
          <span className="estado-label">Consultar</span>
        </div>
      </div>

      <div className="form-buttons-crear">
        <button id="crear" type="submit" onClick={crearPermiso}>
          GUARDAR
        </button>
        <span className="button-spacing"></span> {/* Espacio entre botones */}
        <button id="cancelar" type="button" onClick={cancelarCreacion}>
          CANCELAR
        </button>
      </div>
        
    </form>
  );
}

export default NuevoAcceso;
