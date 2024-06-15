import React, { useState, useEffect } from "react";
import "./nuevoContrato.css";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import useStore from "../store";

const NuevoContrato = ({ onClose }) => {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });

  // Estado para controlar la visibilidad del modal
  const [modalVisible, setModalVisible] = useState(true);

  //VARIABLES DE ESTADO PARA LA BARRA DE BUSQUEDA
  const [searchText, setSearchText] = useState(""); // Estado para almacenar el texto de búsqueda
  const [searchResults, setSearchResults] = useState([]); // Estado para almacenar los resultados de la búsqueda

  //Variable global del usuario loggeado
  const usuario = useStore((state) => state.usuario);
  const [creado_Por, setCreadoPor] = useState(usuario);

  useEffect(() => {
    setCreadoPor(usuario);
  }, [usuario]);

  // Estados para almacenar datos del contrato
  const [tiposcontratos, setTiposContratos] = useState([]);
  const [selectedfecha_contratacion, setSeletedFecha_Contratacion] = useState(null); // Almacena la fecha de contratacion.
  const [selectedfecha_fin_contrato, setSeletedFecha_Fin_Contrato] =  useState(null); // Almacena la fecha de fin de contrato.
  const [selectedtipo_contrato, setSeletedTipo_Contrato] = useState(null); // Almacena el tipo de contrato seleccionada por el usuario.
  const [selectednombreempleado, setSelectedNombreEmpleado] = useState(null); // Almacena el empleado seleccionado por el usuario.
  const [selectedempleado, setSelectedEmpleado] = useState(null); // Almacena el empleado por el usuario.
  const [vacaciones_acumuladas, setVacaciones_Acumuladas] = useState("0");//Por defencto son 0
  const [isPermanenteContract, setIsPermanenteContract] = useState(false);  // Estado para controlar si el tipo de contrato seleccionado es "Permanente"


  // Obtiene los  tipos de contratos desde el servidor al cargar el componente
  useEffect(() => {
    const obtenerTiposContratos = async () => {
      try {
        const response = await fetch(
          "http://localhost:3001/obtenerTiposContratos"
        );
        const data = await response.json();
        setTiposContratos(data);
      } catch (error) {
        console.error(
          "Error al obtener los tipos de contratos:",
          error.message
        );
      }
    };

    obtenerTiposContratos();
  }, []);


  // Función para manejar el cambio del DNI del emplead  
  const handleDniChange = async (event) => {
    let inputValue = event.target.value.replace(/\D/g, "").substring(0, 14); // Solo números y máximo 14 caracteres

    // Validación para evitar más de 7 ceros consecutivos
    if (/(0{7,})/.test(inputValue)) {
      // Si hay más de 7 ceros, actualiza el valor del campo sin los ceros extras
      inputValue = inputValue.replace(/(0{7,})/g, "0000000");
    }

    let formattedValue = "";
    for (let i = 0; i < inputValue.length; i++) {
      if (i === 4) {
        formattedValue += "-";
      }
      formattedValue += inputValue[i];
      if (i === 7) {
        formattedValue += "-";
      }
    }
    setSearchText(formattedValue); // Actualiza el estado del texto de búsqueda con el DNI formateado

    // Realiza la búsqueda en la API mientras el usuario sigue ingresando el DNI
    try {
      const response = await fetch(
        `http://localhost:3001/buscarEmpleadoPorDni/${searchText}`
      );
      const data = await response.json();
      if (response.ok) {
        setSelectedEmpleado(data.idEmpleado);
        setSelectedNombreEmpleado(data.nombre);
      } else {
        throw new Error(data.error || "Error al buscar empleado");
      }
    } catch (error) {
      console.error("Error al buscar empleado:", error.message);
      // Manejar el error de búsqueda
    }
  };
  
  // Formatea la fecha en formato YYYY-MM-DD
  const formatDate = (date) => {
    if (!date) {
      return ""; // Si la fecha es null, retorna una cadena vacía
    }

    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();

    if (month < 10) {
      month = `0${month}`;
    }
    if (day < 10) {
      day = `0${day}`;
    }

    return `${year}-${month}-${day}`;
  };

   // Función para la creación del contrato
  const creacionContrato = async (event) => {
    event.preventDefault();

    //Validaciones de las fecha
    const fechaContratacionFormatted = formatDate(selectedfecha_contratacion);
    const fechaFinContratoFormatted = formatDate(selectedfecha_fin_contrato);


    // Verificar si se ha seleccionado un empleado
    if (!selectedempleado) {
       Toast.fire({
        icon: "warning",
        title: "Empleado no seleccionado",
        text: "Debe seleccionar un empleado antes de crear el contrato.",
      });
      return;
    }
    try {
      // Verificar si el empleado tiene un contrato activo
      const response = await fetch(
        `http://localhost:3001/verificarContratoActivo/${selectedempleado}`
      );
      const data = await response.json();
      if (response.ok) {
        if (data.contratoActivo) {
          // Mostrar una alerta al usuario indicando que el empleado ya tiene un contrato activo
          Swal.fire({
            title: "Empleado con contrato activo",
            text: "El empleado seleccionado ya tiene un contrato activo. No se puede crear un nuevo contrato hasta que el contrato actual haya terminado.",
            icon: "warning",
            confirmButtonText: "Aceptar",
          });
          return; // Salir de la función sin crear el nuevo contrato
        }
        // Continuar con la creación del contrato si el empleado no tiene un contrato activo

        // Establecer fecha de fin de contrato como una fecha muy lejana en el futuro para contratos permanentes
        const fechaFinContrato = isPermanenteContract ? "9999-12-31" : fechaFinContratoFormatted;

        const response = await fetch("http://localhost:3001/creacionContrato", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Id_Empleado: selectedempleado,
            Id_Tipo_Contrato: obtenerIdTipoContrato(selectedtipo_contrato),
            Cantidad_Acumulada_Vacaciones: vacaciones_acumuladas,
            Fecha_Contratacion: fechaContratacionFormatted,
            Fecha_Fin_Contrato: fechaFinContrato,
            Creado_por: creado_Por,
            Modificado_por: creado_Por,
            Fecha_creacion: null,
            Fecha_modificacion: null,
          }),
        });

        if (response.ok) {
          Swal.fire({
            title: "Contrato creado",
            text: "El Contrato ha sido creado con éxito.",
            icon: "success",
            confirmButtonText: "Aceptar",
          }).then(() => {
            setModalVisible(false);
            onClose();
          });
        } else {
          throw new Error("Error en la solicitud");
        }
      } else {
        throw new Error(data.error || "Error al verificar contrato activo");
      }
    } catch (error) {
      console.error("Error en la solicitud:", error.message);
    }
  };

  //Validaciones de fecha final de contrato
  const validarFechaFinal = (date) => {
    //Se valida que se ingrese una fecha final para el contrato
    if (!date) {
      Toast.fire({
        icon: "warning",
        title: "Seleccione Fecha Final de Contrato",
        text: "Debe seleccionar una fecha de fin del Contrato",
      });
      return;
    }
    //Se valida que la fecha final sea despues que la fecha inicio de contrato seleccionada
    if (selectedfecha_contratacion && date <= selectedfecha_contratacion) {
      Toast.fire({
        icon: "warning",
        title: "Fecha Incongruente",
        text: "La fecha de finalización debe ser posterior a la fecha de contratación.",
      });
      return;
    }
    setSeletedFecha_Fin_Contrato(date);
  };

  // Método para validar  y tipo de contrato
  const validarTipoContrato = (event) => {
    const selectedOption = event.target.value;   
    setSeletedTipo_Contrato(selectedOption);

    // Busca entre los tipos de contratos para verificar si el seleccionado es "Permanente"
    const selectedContract = tiposcontratos.find(
      (contract) => contract.Nombre_Contrato === selectedOption
    );

    setIsPermanenteContract(
      selectedContract && selectedContract.Nombre_Contrato === "Permanente"
    );

    // Si es "Permanente", establecer fecha de fin como null
    if (selectedOption === "Permanente") {
      setSeletedFecha_Fin_Contrato(null);
    }
  };

  // Método para obtener el ID del empleado y tipo de contrato seleccionado
  const obtenerIdTipoContrato = (nombreContrato) => {
    const contratoSeleccionado = tiposcontratos.find(
      (tipocontrato) => tipocontrato.Nombre_Contrato === nombreContrato
    );
    return contratoSeleccionado ? contratoSeleccionado.Id_Tipo_Contrato : null;
  };

  const cancelarCreacion = () => {
    onClose(); // Llama a la función onClose pasada como prop desde MantenimientoUsuario para cerrar el modal
  };

  
  return (
    <form
      onSubmit={creacionContrato}
      className="CrearContrato"
      crear-contrato="true"
    >
      <h1 id="Titulo">CREAR CONTRATO</h1>

      <div className="input-container">
        <div className="input-group">
          <div className="search-container">
            <i className="bx bx-search icon"></i>
            <input
              type="text"
              placeholder="Busque El Empleado Por Su DNI"
              className="search-input"
              value={searchText}
              onChange={handleDniChange} // Llamar a la función handleSearch en cada cambio del input
            />
          </div>
        </div>

        <div className="input-group">
          <input
            name="Empleado"
            style={{
              backgroundColor: "#dedede",
              color: "#808080",
              borderColor: "#dedede",
              marginBottom: "20px",
            }}
            type="text"
            readOnly
            spellcheck="false"
            className="textbox custom-input"
            value={selectednombreempleado} // muestra el empleado seleccionado
            required
          />
          {/*<label>Empleado</label>*/}
        </div>
      </div>

      {searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((empleado) => (
            <div key={empleado.Nombre} className="search-result-item">
              <button
                type="button"
                onClick={() => {
                  setSelectedEmpleado(empleado.Nombre_Empleado);
                  setSearchText(""); // Limpia el texto de búsqueda al seleccionar un empleado
                  setSearchResults([]); // Limpia los resultados de búsqueda al seleccionar un empleado
                }}
              >
                {empleado.Nombre_Empleado}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="input-container">
        <div className="flex-row">
          <label className="custom-label">
            Tipo de Contrato:
            <select
              className="inputPuesto custom-select"
              onChange={validarTipoContrato}
              value={selectedtipo_contrato}
              type="form-select"
              required
            >
              <option value="">Selecciona el Tipo de Contrato</option>
              {tiposcontratos.map((tiposObject, index) => (
                <option key={index} value={tiposObject.Nombre_Contrato}>
                  {tiposObject.Nombre_Contrato}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="input-container">
        <div className="input-group-fechas">
          <label>Fecha de Contratacion</label>
          <DatePicker
            selected={selectedfecha_contratacion}
            onChange={(date) => setSeletedFecha_Contratacion(date)}
            className="textbox custom-input"
            dateFormat="yyyy-MM-dd"
            placeholderText="Fecha de Contratación"
            required
            onKeyDown={(e) => e.preventDefault()} // Evita la entrada de texto
          />
        </div>
        <div className="input-group-fechas">
          <label>Fecha de Fin de Contrato</label>
          <DatePicker
            selected={selectedfecha_fin_contrato}
            onChange={validarFechaFinal}
            className="textbox custom-input"
            dateFormat="yyyy-MM-dd"
            placeholderText="Fecha de Fin Contrato"
            required={!isPermanenteContract}
            disabled={isPermanenteContract}
            onKeyDown={(e) => e.preventDefault()} // Evita la entrada de texto
          />
        </div>

        {/* Selección de TIPO CONTRATO */}
      </div>

      <div className="form-buttons-crear">
        <button id="crear" type="submit">
          Guardar
        </button>
        <span className="button-spacing"></span> {/* Espacio entre botones */}
        <button id="cancelar" type="button" onClick={cancelarCreacion}>
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default NuevoContrato;
