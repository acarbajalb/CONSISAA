
import express from "express";
import db from "./index.js"; 
import { registrarEnBitacora } from './userSession.js';

const router = express.Router();

// Endpoint para crear un nuevo departamento
router.post("/creacionGenero", async (req, res) => {
  try {
    // Extraer datos del cuerpo de la solicitud
    const {
      Nombre_Genero,
    } = req.body;

    // Verificar si el nombre del departamento ya existe
   const existingGenero = await new Promise((resolve, reject) => {
      const query = "SELECT * FROM tbl_genero WHERE Nombre_Genero = ?";
      db.query(query, [Nombre_Genero], (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });

    // Si el nombre del departamento ya existe, enviar una respuesta de error
    if (existingGenero.length > 0) {
      return res.status(400).json({ error: "Ya existe otro género con el mismo nombre" });
    }

    // Crear la consulta SQL para insertar el nuevo departamento
    const insertQuery = `
      INSERT INTO tbl_genero (Nombre_Genero)
      VALUES (?)
    `;

    // Ejecutar la consulta SQL de inserción
    db.query(
      insertQuery,
      [Nombre_Genero],
      (err, data) => {
        if (err) {
          console.error("Error al insertar género:", err);
          return res.status(500).json({ error: "Error al insertar departamento en la base de datos" });
        }

        // Registro en la bitácora después de crear el departamento
        registrarEnBitacora(152, "Crear Género", "Se creó un nuevo Género");

        return res.json({ message: "Género insertado correctamente" });
      }
    );
  } catch (error) {
    console.error("Error al insertar género:", error);
    return res.status(500).json({ error: "Error al insertar género en la base de datos" });
  }
});


// Endpoint para obtener departamentos
router.get("/traerGenero", (req, res) => {
  const query = 'SELECT * FROM tbl_genero';
  db.query(query, (err, data) => {
      if (err) {
          return res.status(500).json({ error: err.message });
      }

      // Registro en la bitácora después de obtener departamentos
      registrarEnBitacora(151, "Obtener género", "Se obtuvieron los géneros");

      return res.json(data);
  });
});


//aqui para abajo no he ticado nada


// Endpoint para obtener un generoespecífico por su ID
router.get("/idGenero/:id_genero", async (req, res) => {
  try {
    const IdGen = req.params.id_genero;

    // Consulta SQL para seleccionar un 
    const query = 'SELECT * FROM tbl_genero WHERE Id_Genero = ?';

    // Ejecutar la consulta SQL con el ID del usuario como parámetro
    db.query(query, IdGen, (err, data) => {
      if (err) {
        // Manejar el error si ocurre durante la ejecución de la consulta
        console.error("Error al obtener departamento por ID:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
      }
      if (data.length === 0) {
        // Manejar el caso en que no se encuentre ningún usuario con el ID proporcionado
        return res.status(404).json({ error: "Género no encontrado" });
      }
      // Devolver el primer usuario encontrado en formato JSON
      return res.json(data[0]);
    });
  } catch (error) {
    // Capturar y manejar cualquier error que ocurra durante el proceso
    console.error("Error al obtener genero por ID:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Endpoint para actualizar un departamento por su ID
router.put("/editarGenero/:id_genero", async (req, res) => {
  try {
    const IdGen = req.params.id_genero;
    const { Nombre_Genero } = req.body;

        // Verificar si el nuevo nombre del departamento ya existe en otro departamento
        const existingGenero = await new Promise((resolve, reject) => {
          const query = "SELECT * FROM tbl_genero WHERE Nombre_Genero = ? AND Id_Genero != ?";
          db.query(query, [Nombre_Genero, IdGen], (err, result) => {
            if (err) reject(err);
            resolve(result);
          });
        });
    
        // Si existe otro departamento con el mismo nombre, enviar una respuesta de error
        if (existingGenero.length > 0) {
          return res.status(400).json({ error: "Ya existe otro género con el mismo nombre" });
        }

    const query = `
      UPDATE tbl_genero
      SET Nombre_Genero = ?
      WHERE Id_Genero = ?`;

    const values = [Nombre_Genero, IdGen];

    db.query(query, values, (err, data) => {
      if (err) {
        console.error("Error al actualizar genero:", err);
        return res.status(500).json({ error: "Error al actualizar genero en la base de datos" });
      }

      registrarEnBitacora(153, "Editar genero", `Se editó el genero con ID ${IdGen}`);

      return res.json({ message: "género actualizado correctamente" });
    });
  } catch (error) {
    console.error("Error al editar género:", error);
    return res.status(500).json({ error: "Error al editar género en la base de datos" });
  }
});









export default router;