
import express from "express";
import db from "./index.js"; 
import { registrarEnBitacora } from './userSession.js';

const router = express.Router();

// Endpoint para crear un nuevo departamento
router.post("/creacionEstadoCivil", async (req, res) => {
  try {
    // Extraer datos del cuerpo de la solicitud
    const {
        Estado_civil,
    } = req.body;

    // Verificar si el nombre del departamento ya existe
   const existingEstadoCivil = await new Promise((resolve, reject) => {
      const query = "SELECT * FROM tbl_estado_civil WHERE Estado_civil = ?";
      db.query(query, [Estado_civil], (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });

    // Si el nombre del departamento ya existe, enviar una respuesta de error
    if (existingEstadoCivil.length > 0) {
      return res.status(400).json({ error: "Ya existe otro registro con el mismo nombre" });
    }

    // Crear la consulta SQL para insertar el nuevo departamento
    const insertQuery = `
      INSERT INTO tbl_estado_civil (Estado_civil)
      VALUES (?)
    `;

    // Ejecutar la consulta SQL de inserción
    db.query(
      insertQuery,
      [Estado_civil],
      (err, data) => {
        if (err) {
          console.error("Error al insertar registro:", err);
          return res.status(500).json({ error: "Error al insertar registro en la base de datos" });
        }

        // Registro en la bitácora después de crear el departamento
        registrarEnBitacora(2, "Crear estado civil", "Se creó un nuevo estado civil");

        return res.json({ message: "Registro insertado correctamente" });
      }
    );
  } catch (error) {
    console.error("Error al insertar registro:", error);
    return res.status(500).json({ error: "Error al insertar registro en la base de datos" });
  }
});


// Endpoint para obtener estado civil
router.get("/traerEstadoCivil", (req, res) => {
  const query = 'SELECT * FROM tbl_estado_civil ORDER BY Id_EstadoCivil DESC';
  db.query(query, (err, data) => {
      if (err) {
          return res.status(500).json({ error: err.message });
      }

      // Registro en la bitácora después de obtener estado civil
      registrarEnBitacora(2, "Obtener estado civil", "Se obtuvo estado civil");

      return res.json(data);
  });
});


//aqui para abajo no he ticado nada


// Endpoint para obtener un generoespecífico por su ID
router.get("/idEstadoCivil/:id_estadocivil", async (req, res) => {
  try {
    const IdEsCi = req.params.id_estadocivil;

    // Consulta SQL para seleccionar un 
    const query = 'SELECT * FROM tbl_estado_civil WHERE Id_EstadoCivil = ?';

    // Ejecutar la consulta SQL con el ID del usuario como parámetro
    db.query(query, IdEsCi, (err, data) => {
      if (err) {
        // Manejar el error si ocurre durante la ejecución de la consulta
        console.error("Error al obtener estado civil por ID:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
      }
      if (data.length === 0) {
        // Manejar el caso en que no se encuentre ningún usuario con el ID proporcionado
        return res.status(404).json({ error: "estado civil no encontrado" });
      }
      // Devolver el primer usuario encontrado en formato JSON
      return res.json(data[0]);
    });
  } catch (error) {
    // Capturar y manejar cualquier error que ocurra durante el proceso
    console.error("Error al obtener estado civil por ID:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Endpoint para actualizar un departamento por su ID
router.put("/editarEstadoCivil/:id_estadocivil", async (req, res) => {
  try {
    const IdEsCi = req.params.id_estadocivil;
    const { Estado_civil } = req.body;

        // Verificar si el nuevo nombre del departamento ya existe en otro departamento
        const existingEstadoCivil = await new Promise((resolve, reject) => {
          const query = "SELECT * FROM tbl_estado_civil WHERE Estado_civil = ? AND Id_EstadoCivil != ?";
          db.query(query, [Estado_civil, IdEsCi], (err, result) => {
            if (err) reject(err);
            resolve(result);
          });
        });
    
        // Si existe otro departamento con el mismo nombre, enviar una respuesta de error
        if (existingEstadoCivil.length > 0) {
          return res.status(400).json({ error: "Ya existe otro registro con el mismo nombre" });
        }

    const query = `
      UPDATE tbl_estado_civil
      SET Estado_civil = ?
      WHERE Id_EstadoCivil = ?`;

    const values = [Estado_civil, IdEsCi];

    db.query(query, values, (err, data) => {
      if (err) {
        console.error("Error al actualizar estado civil:", err);
        return res.status(500).json({ error: "Error al actualizar registro en la base de datos" });
      }

      registrarEnBitacora(2, "Editar estado civil", `Se editó el estado civil con ID ${IdEsCi}`);

      return res.json({ message: "Registro actualizado correctamente" });
    });
  } catch (error) {
    console.error("Error al editar registro:", error);
    return res.status(500).json({ error: "Error al editar registro en la base de datos" });
  }
});









export default router;