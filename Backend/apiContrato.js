import express from "express";
import db from "./index.js";
import { registrarEnBitacora } from "./userSession.js";

const router = express.Router();

// Endpoint para obtener contratos
router.get("/traerContratos", (req, res) => {
  const query = "SELECT contrato.*, emp.Nombre, tipo.Nombre_Contrato FROM tbl_contrato contrato INNER JOIN tbl_empleado emp ON contrato.Id_Empleado=emp.Id_Empleado INNER JOIN tbl_tipo_contrato tipo ON contrato.Id_Tipo_Contrato=tipo.Id_Tipo_Contrato ORDER BY contrato.Fecha_modificacion DESC;";
  db.query(query, (err, data) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Registro en la bitácora después de obtener usuarios
    registrarEnBitacora(13, "Entró a contratos", "Se mostraron los registros de contratos.");

    return res.json(data);
  });
});

// Agregar una nueva ruta para verificar si el empleado tiene un contrato activo
router.get("/verificarContratoActivo/:Id_Empleado", async (req, res) => {
  try {
    const Id_Empleado = req.params.Id_Empleado;

    // Consulta SQL para verificar si el empleado tiene un contrato activo
    const query = "SELECT * FROM tbl_contrato WHERE Id_Empleado = ? AND Fecha_Fin_Contrato > CURRENT_DATE";

    // Ejecutar la consulta SQL con el ID del empleado como parámetro
    db.query(query, Id_Empleado, (err, data) => {
      if (err) {
        console.error("Error al verificar contrato activo:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
      }
      // Devolver un indicador de si el empleado tiene un contrato activo
      return res.json({ contratoActivo: data.length > 0 });
    });
  } catch (error) {
    console.error("Error al verificar contrato activo:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Endpoint para crear un nuevo usuario
router.post("/creacionContrato", async (req, res) => {
  try {
    // Extraer datos del cuerpo de la solicitud
    const {
      Id_Empleado,
      Id_Tipo_Contrato,
      Cantidad_Acumulada_Vacaciones,
      Fecha_Contratacion,
      Fecha_Fin_Contrato,
      Creado_por,
      Modificado_por,
      Fecha_creacion,
      Fecha_modificacion,
    } = req.body;

    // Crear la consulta SQL
    const query = `INSERT INTO tbl_contrato (Id_Empleado, Id_Tipo_Contrato, Cantidad_Acumulada_Vacaciones, Fecha_Contratacion, Fecha_Fin_Contrato, Creado_por, Modificado_por, Fecha_creacion, Fecha_modificacion) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;

    // Ejecutar la consulta SQL
    db.query(
      query,
      [
        Id_Empleado,
        Id_Tipo_Contrato,
        Cantidad_Acumulada_Vacaciones,
        Fecha_Contratacion,
        Fecha_Fin_Contrato,
        Creado_por,
        Modificado_por,
        Fecha_creacion,
        Fecha_modificacion,
      ],
      (err, data) => {
        if (err) {
          console.error("Error al insertar contrato:", err);
          return res
            .status(500)
            .json({ error: "Error al insertar contrato en la base de datos" });
        }

        // Registro en la bitácora después de crear el usuario
        registrarEnBitacora(14, "Crear contrato", "Se creó un nuevo contrato.");

        return res.json({ message: "Contrato insertado correctamente" });
      }
    );
  } catch (error) {
    console.error("Error al insertar contrato:", error);
    return res
      .status(500)
      .json({ error: "Error al insertar contrato en la base de datos" });
  }
});

// Endpoint para obtener un contrato específico por su ID
router.get("/idContrato/:id_contrato", async (req, res) => {
  try {
    const contratoId = req.params.id_contrato;

    // Consulta SQL para seleccionar un usuario por su ID
    const query = "SELECT contrato.*, emp.Nombre, tipo.Nombre_Contrato FROM tbl_contrato contrato INNER JOIN tbl_empleado emp ON contrato.Id_Empleado=emp.Id_Empleado INNER JOIN tbl_tipo_contrato tipo ON contrato.Id_Tipo_Contrato=tipo.Id_Tipo_Contrato  WHERE Id_Contrato = ?";

    // Ejecutar la consulta SQL con el ID del usuario como parámetro
    db.query(query, contratoId, (err, data) => {
      if (err) {
        // Manejar el error si ocurre durante la ejecución de la consulta
        console.error("Error al obtener contrato por ID:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
      }
      if (data.length === 0) {
        // Manejar el caso en que no se encuentre ningún usuario con el ID proporcionado
        return res.status(404).json({ error: "Contrato no encontrado" });
      }
      // Devolver el primer usuario encontrado en formato JSON
      return res.json(data[0]);
    });
  } catch (error) {
    // Capturar y manejar cualquier error que ocurra durante el proceso
    console.error("Error al obtener contrato por ID:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Endpoint para actualizar un usuario
router.put("/editarContrato/:Id_Contrato", async (req, res) => {
  try {
    const contratoId = req.params.Id_Contrato;
    const { 
      Id_Tipo_Contrato,  
      Fecha_Fin_Contrato,
      Modificado_por,
    } = req.body;

    // Construir la consulta SQL de actualización
    const query = `
            UPDATE tbl_contrato 
            SET  
                Id_Tipo_Contrato=?,   
                Fecha_Fin_Contrato = ?,
                Modificado_por = ?,
                Fecha_modificacion=CURRENT_TIMESTAMP
                
            WHERE Id_Contrato = ?`; // Usar el ID del contrato en la cláusula WHERE

    // Ejecutar la consulta SQL
    db.query(
      query,
      [ 
        Id_Tipo_Contrato, 
        Fecha_Fin_Contrato,
        Modificado_por,
        contratoId, // Pasar el ID del contrato como parámetro en la consulta
      ],
      (err, data) => {
        if (err) {
          console.error("Error al actualizar contrato:", err);
          return res
            .status(500)
            .json({
              error: "Error al actualizar contrato en la base de datos",
            });
        }

        // Registro en la bitácora después de editar el usuario
        registrarEnBitacora(
          15,
          "Editar contrato",
          `Se editó el contrato con ID ${contratoId}.`
        );

        return res.json({ message: "Contrato actualizado correctamente" });
      }
    );
  } catch (error) {
    console.error("Error al editar contrato:", error);
    return res
      .status(500)
      .json({ error: "Error al editar contrato en la base de datos" });
  }
}); 

//Otros metodos necesarios para el Mantenimiento de Contrato
router.get("/obtenerTiposContratos", (req, res) => {
  const query =
    "SELECT Id_Tipo_Contrato, Nombre_Contrato FROM tbl_tipo_contrato";
  db.query(query, (err, data) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json(data);
  });

  
  router.get("/buscarEmpleadoPorDni/:dni", (req, res) => {
    try {
      const dni = req.params.dni;
  
      // Consulta para buscar el empleado por DNI y devolver su ID y nombre
      const empleadoQuery = `SELECT Id_Empleado, Nombre FROM tbl_empleado WHERE DNI = ?`;
      db.query(empleadoQuery, [dni], (err, empleadoData) => {
        if (err) {
          console.error("Error al buscar empleado por DNI:", err);
          return res.status(500).json({ error: "Error interno del servidor" });
        }
  
        if (empleadoData.length === 0) {
          return res.status(404).json({ error: "No se encontró ningún empleado con ese DNI" });
        }
  
        const idEmpleado = empleadoData[0].Id_Empleado;
        const nombre = empleadoData[0].Nombre;
        return res.json({ idEmpleado, nombre });
      });
    } catch (error) {
      console.error("Error al buscar empleado por DNI:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  });

});  
  
export default router;


