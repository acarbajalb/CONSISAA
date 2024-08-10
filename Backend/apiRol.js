
import express from "express";
import db from "./index.js"; 
import { registrarEnBitacora } from './userSession.js';

const router = express.Router();

// Endpoint para crear un nuevo Rol
router.post("/creacionRol", async (req, res) => {
  try {
    // Extraer datos del cuerpo de la solicitud
    const {
      Rol,
      Descripcion,
      Creado_por,
      Modificado_por,
      Fecha_creacion,
      Fecha_modificacion
    } = req.body;

    // Verificar si el nombre del Rol ya existe
    const existingRol = await new Promise((resolve, reject) => {
      const query = "SELECT * FROM tbl_ms_rol WHERE Rol = ?";
      db.query(query, [Rol], (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });

    // Si el nombre del Rol ya existe, enviar una respuesta de error
    if (existingRol.length > 0) {
      return res.status(400).json({ error: "El nombre del Rol ya existe" });
    }

    // Crear la consulta SQL para insertar el nuevo Rol
    const insertQuery = `
      INSERT INTO tbl_ms_rol (Rol, Descripcion,Creado_por, Modificado_por, Fecha_creacion, Fecha_modificacion)
      VALUES (?, ?, ?,?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;

    // Ejecutar la consulta SQL de inserción
    db.query(
      insertQuery,
      [Rol,Descripcion,Creado_por, Modificado_por, Fecha_creacion, Fecha_modificacion],
      (err, data) => {
        if (err) {
          console.error("Error al insertar Rol:", err);
          return res.status(500).json({ error: "Error al insertar Rol en la base de datos" });
        }

        // Registro en la bitácora después de crear el departamento
        registrarEnBitacora(170, "Crear rol", "Se creó un nuevo rol.");

        return res.json({ message: "Rol insertado correctamente" });
      }
    );
  } catch (error) {
    console.error("Error al insertar Rol:", error);
    return res.status(500).json({ error: "Error al insertar Rol en la base de datos" });
  }
});

 
// Endpoint para obtener Roles
router.get("/traerRoles", (req, res) => {
  const query = 'SELECT * FROM tbl_ms_rol';
  db.query(query, (err, data) => {
      if (err) {
          return res.status(500).json({ error: err.message });
      }

      //Registro en la bitácora después de obtener roles.
      registrarEnBitacora(169, "Entró a roles", "Se mostraron los registros de roles.");

      return res.json(data);
  });
});


// Endpoint para obtener un usuario específico por su ID
router.get("/idRol/:Id_Rol", async (req, res) => {
  try {
    const userId = req.params.Id_Rol;

    // Consulta SQL para seleccionar un 
    const query = 'SELECT * FROM tbl_ms_rol WHERE Id_Rol = ?';

    // Ejecutar la consulta SQL con el ID del usuario como parámetro
    db.query(query, userId, (err, data) => {
      if (err) {
        // Manejar el error si ocurre durante la ejecución de la consulta
        console.error("Error al obtener Rol por ID:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
      }
      if (data.length === 0) {
        // Manejar el caso en que no se encuentre ningún usuario con el ID proporcionado
        return res.status(404).json({ error: "Rol no encontrado" });
      }
      // Devolver el primer usuario encontrado en formato JSON
      return res.json(data[0]);
    });
  } catch (error) {
    // Capturar y manejar cualquier error que ocurra durante el proceso
    console.error("Error al obtener Rol por ID:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Endpoint para eliminar un Rol por su ID
router.delete("/eliminarRol/:Id_Rol", async (req, res) => {
    try {
      const IdRol = req.params.Id_Rol;
  
      const query = `
        DELETE FROM tbl_ms_rol
        WHERE Id_Rol = ?`;
  
      db.query(query, IdRol, (err, data) => {
        if (err) {
          console.error("Error al eliminar Rol:", err);
          return res.status(500).json({ error: "Error al eliminar Rol en la base de datos" });
        }
  
        return res.json({ message: "Rol eliminado correctamente" });
      });
    } catch (error) {
      console.error("Error al eliminar Rol:", error);
      return res.status(500).json({ error: "Error al eliminar Rol en la base de datos" });
    }
  });
  

router.put("/editarRol/:Id_Rol", async (req, res) => {
    try {
      const IdRol = req.params.Id_Rol;
      const { Rol, Descripcion, Modificado_por } = req.body;
  
      // Verificar si el nuevo nombre del Rol ya existe en otro departamento
      const existingRol = await new Promise((resolve, reject) => {
        const query = "SELECT * FROM tbl_ms_rol WHERE Rol = ? AND Id_Rol != ?";
        db.query(query, [Rol, IdRol], (err, result) => {
          if (err) reject(err);
          resolve(result);
        });
      });
  
      // Si existe otro Rol con el mismo nombre, enviar una respuesta de error
      if (existingRol.length > 0) {
        return res.status(400).json({ error: "Ya existe otro Rol con el mismo nombre" });
      }
  
      const query = `
        UPDATE tbl_ms_rol
        SET Rol = ?, Descripcion = ?, Modificado_por = ?, Fecha_modificacion = CURRENT_TIMESTAMP
        WHERE Id_Rol = ?`;
  
      const values = [Rol, Descripcion, Modificado_por, IdRol];
  
      db.query(query, values, (err, data) => {
        if (err) {
          console.error("Error al actualizar Rol:", err);
          return res.status(500).json({ error: "Error al actualizar Rol en la base de datos" });
        }
        registrarEnBitacora(171, "Editar rol", `Se editó el rol con ID ${IdRol}.`);
  
        return res.json({ message: "Rol actualizado correctamente" });
      });
    } catch (error) {
      console.error("Error al editar Rol:", error);
      return res.status(500).json({ error: "Error al editar Rol en la base de datos" });
    }
  });
  

export default router;