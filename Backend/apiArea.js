import express from "express";
import db from "./index.js"; 
import { registrarEnBitacora } from './userSession.js';


const router = express.Router();

// Endpoint para crear un nuevo departamento
router.post("/creacionArea", async (req, res) => {
  try {
    // Extraer datos del cuerpo de la solicitud
    const {
      Nombre_area,
      Creado_por,
      Modificado_por
    } = req.body;

    // Verificar si el nombre del area ya existe
    const existingArea = await new Promise((resolve, reject) => {
      const query = "SELECT * FROM tbl_area WHERE Nombre_area = ?";
      db.query(query, [Nombre_area], (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });

    // Si el nombre del area ya existe, enviar una respuesta de error
    if (existingArea.length > 0) {
      return res.status(400).json({ error: "Ya existe otra área con el mismo nombre" });
    }

    // Crear la consulta SQL para insertar el nuevo area
    const insertQuery = `
      INSERT INTO tbl_area (Nombre_area, Creado_por, Modificado_por, Fecha_creacion, Fecha_modificacion)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;

    // Ejecutar la consulta SQL de inserción
    db.query(
      insertQuery,
      [Nombre_area, Creado_por, Modificado_por],
      (err, data) => {
        if (err) {
          console.error("Error al insertar area:", err);
          return res.status(500).json({ error: "Error al insertar área en la base de datos" });
        }

        // Registro en la bitácora después de crear el area
        registrarEnBitacora(147, "Crear area", "Se creó un nueva área");

        return res.json({ message: "Área insertada correctamente" });//Mensaje qeu se manda al frotn
      }
    );
  } catch (error) {
    console.error("Error al insertar área:", error);
    return res.status(500).json({ error: "Error al insertar area en la base de datos" });
  }
});


// Endpoint para obtener area
router.get("/traerArea", (req, res) => {
  const query = 'SELECT * FROM tbl_area';
  db.query(query, (err, data) => {
      if (err) {
          return res.status(500).json({ error: err.message });
      }

      // Registro en la bitácora después de obtener area
      registrarEnBitacora(147, "Obtener area", "Se obtuvieron las areas");

      return res.json(data);
  });
});


// Endpoint para obtener un area específico por su ID
router.get("/idArea/:id_area", async (req, res) => {
  try {
    const areaId = req.params.id_area;

    // Consulta SQL para seleccionar un 
    const query = 'SELECT * FROM tbl_area WHERE Id_area = ?';

    // Ejecutar la consulta SQL con el ID del area como parámetro
    db.query(query, areaId, (err, data) => {
      if (err) {
        // Manejar el error si ocurre durante la ejecución de la consulta
        console.error("Error al obtener area por ID:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
      }
      if (data.length === 0) {
        // Manejar el caso en que no se encuentre ningún area con el ID proporcionado
        return res.status(404).json({ error: "area no encontrada" });
      }
      // Devolver el primer area encontrado en formato JSON
      return res.json(data[0]);
    });
  } catch (error) {
    // Capturar y manejar cualquier error que ocurra durante el proceso
    console.error("Error al obtener area por ID:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Endpoint para actualizar un departamento por su ID
router.put("/editarArea/:id_area", async (req, res) => {
  try {
    const IdArea = req.params.id_area;
    const { Nombre_area, Modificado_por } = req.body;

        // Verificar si el nuevo nombre del area ya existe en otro area
        const existingArea = await new Promise((resolve, reject) => {
          const query = "SELECT * FROM tbl_area WHERE Nombre_area = ? AND Id_area != ?";
          db.query(query, [Nombre_area, IdArea], (err, result) => {
            if (err) reject(err);
            resolve(result);
          });
        });
    
        // Si existe otro area con el mismo nombre, enviar una respuesta de error
        if (existingArea.length > 0) {
          return res.status(400).json({ error: "Ya existe otra área con el mismo nombre" });
        }

    const query = `
      UPDATE tbl_area
      SET 
      Nombre_area = ?,      
      Modificado_por = ?,
      Fecha_modificacion = CURRENT_TIMESTAMP
      WHERE Id_area = ?`;

    const values = [Nombre_area, Modificado_por, IdArea];

    db.query(query, values, (err, data) => {
      if (err) {
        console.error("Error al actualizar area:", err);
        return res.status(500).json({ error: "Error al actualizar área en la base de datos" });
      }

      registrarEnBitacora(147, "Editar area", `Se editó el area con ID ${IdArea}`);

      return res.json({ message: "area actualizada correctamente" });
    });
  } catch (error) {
    console.error("Error al editar area:", error);
    return res.status(500).json({ error: "Error al editar area en la base de datos" });
  }
});









export default router;