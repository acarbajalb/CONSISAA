import express from "express";
import db from "./index.js"; 
import { registrarEnBitacora } from './userSession.js';

const router = express.Router();


// Endpoint para obtener departamentos
router.get("/traerEstado", (req, res) => {
  const query = 'SELECT * FROM tbl_estado';
  db.query(query, (err, data) => {
      if (err) {
          return res.status(500).json({ error: err.message });
      }

      // Registro en la bitácora después de obtener departamentos
      registrarEnBitacora(166, "Entró a estado", "Se mostraron los registros de estado.");

      return res.json(data);
  });
});


// Endpoint para crear un nuevo 
router.post("/creacionEstado", async (req, res) => {
  try {
    // Extraer datos del cuerpo de la solicitud
    const {
        Estado,
    } = req.body;

    // Verificar si el nombre del departamento ya existe
   const existingEstado = await new Promise((resolve, reject) => {
      const query = "SELECT * FROM tbl_estado WHERE Estado = ?";
      db.query(query, [Estado], (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });

    // Si el nombre del departamento ya existe, enviar una respuesta de error
    if (existingEstado.length > 0) {
      return res.status(400).json({ error: "El nombre del registro ya existe" });
    }

    // Crear la consulta SQL para insertar el nuevo departamento
    const insertQuery = `
      INSERT INTO tbl_estado (Estado)
      VALUES (?)
    `;

    // Ejecutar la consulta SQL de inserción
    db.query(
      insertQuery,
      [Estado],
      (err, data) => {
        if (err) {
          console.error("Error al insertar registro:", err);
          return res.status(500).json({ error: "Error al insertar registro en la base de datos" });
        }

        // Registro en la bitácora después de crear el departamento
        registrarEnBitacora(167, "Crear estado", "Se creó un nuevo estado.");

        return res.json({ message: "Registro insertado correctamente" });
      }
    );
  } catch (error) {
    console.error("Error al insertar estado:", error);
    return res.status(500).json({ error: "Error al insertar estado en la base de datos" });
  }
});




//aqui para abajo no he ticado nada


// Endpoint para obtener un género específico por su ID
router.get("/idEstado/:id_estado", async (req, res) => {
  try {
    const IdState = req.params.id_estado;

    // Consulta SQL para seleccionar un 
    const query = 'SELECT * FROM tbl_estado WHERE Id_Estado = ?';

    // Ejecutar la consulta SQL con el ID del usuario como parámetro
    db.query(query, IdState, (err, data) => {
      if (err) {
        // Manejar el error si ocurre durante la ejecución de la consulta
        console.error("Error al obtener estado por ID:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
      }
      if (data.length === 0) {
        // Manejar el caso en que no se encuentre ningún usuario con el ID proporcionado
        return res.status(404).json({ error: "Estado no encontrado" });
      }
      // Devolver el primer usuario encontrado en formato JSON
      return res.json(data[0]);
    });
  } catch (error) {
    // Capturar y manejar cualquier error que ocurra durante el proceso
    console.error("Error al obtener estado por ID:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Endpoint para actualizar un departamento por su ID
router.put("/editarEstado/:id_estado", async (req, res) => {
  try {
    const IdState = req.params.id_estado;
    const { Estado } = req.body;

        // Verificar si el nuevo nombre 
        const existingEstado = await new Promise((resolve, reject) => {
          const query = "SELECT * FROM tbl_estado WHERE Estado = ? AND Id_Estado != ?";
          db.query(query, [Estado, IdState], (err, result) => {
            if (err) reject(err);
            resolve(result);
          });
        });
    
        // Si existe otro departamento con el mismo nombre, enviar una respuesta de error
        if (existingEstado.length > 0) {
          return res.status(400).json({ error: "Ya existe otro estado con el mismo nombre" });
        }

    const query = `
      UPDATE tbl_estado
      SET Estado = ?
      WHERE Id_Estado = ?`;

    const values = [Estado, IdState];

    db.query(query, values, (err, data) => {
      if (err) {
        console.error("Error al actualizar estado:", err);
        return res.status(500).json({ error: "Error al actualizar estado en la base de datos" });
      }

      registrarEnBitacora(168, "Editar estado", `Se editó el estado con ID ${IdState}.`);

      return res.json({ message: "Estado actualizado correctamente" });
    });
  } catch (error) {
    console.error("Error al editar estado:", error);
    return res.status(500).json({ error: "Error al editar estado en la base de datos" });
  }
});









export default router;