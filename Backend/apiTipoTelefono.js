
import express from "express";
import db from "./index.js"; 
import { registrarEnBitacora } from './userSession.js';

const router = express.Router();

// Endpoint para crear un nuevo departamento
router.post("/creacionTipoTelefono", async (req, res) => {
  try {
    // Extraer datos del cuerpo de la solicitud
    const {
        Descripcion,
    } = req.body;

    // Verificar si el nombre del departamento ya existe
   const existingTipoTelefono = await new Promise((resolve, reject) => {
      const query = "SELECT * FROM tbl_tipo_telefono WHERE Descripcion = ?";
      db.query(query, [Descripcion], (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });

    // Si el nombre del tipo telefono ya existe, enviar una respuesta de error
    if (existingTipoTelefono.length > 0) {
      return res.status(400).json({ error: "El nombre del registro ya existe" });
    }

    // Crear la consulta SQL para insertar el nuevo departamento
    const insertQuery = `
      INSERT INTO tbl_tipo_telefono (Descripcion)
      VALUES (?)
    `;

    // Ejecutar la consulta SQL de inserción
    db.query(
      insertQuery,
      [Descripcion],
      (err, data) => {
        if (err) {
          console.error("Error al insertar registro:", err);
          return res.status(500).json({ error: "Error al insertar registro en la base de datos" });
        }

        // Registro en la bitácora después de crear el departamento
        registrarEnBitacora(158, "Crear Telefono", "Se creó un nuevo tipo telefono");

        return res.json({ message: "Registro insertado correctamente" });
      }
    );
  } catch (error) {
    console.error("Error al insertar registro:", error);
    return res.status(500).json({ error: "Error al insertar registro en la base de datos" });
  }
});


// Endpoint para obtener departamentos
router.get("/traerTipoTelefono", (req, res) => {
  const query = 'SELECT * FROM tbl_tipo_telefono';
  db.query(query, (err, data) => {
      if (err) {
          return res.status(500).json({ error: err.message });
      }

      // Registro en la bitácora después de obtener 
      registrarEnBitacora(157, "Obtener telefono", "Se obtuvieron los tipo telefono");

      return res.json(data);
  });
});


//aqui para abajo no he ticado nada


// Endpoint para obtener un generoespecífico por su ID
router.get("/idTipoTelefono/:id_tipotelefono", async (req, res) => {
  try {
    const IdTipoTelf = req.params.id_tipotelefono;

    // Consulta SQL para seleccionar un 
    const query = 'SELECT * FROM tbl_tipo_telefono WHERE Id_tipo_telefono = ?';

    // Ejecutar la consulta SQL con el ID del usuario como parámetro
    db.query(query, IdTipoTelf, (err, data) => {
      if (err) {
        // Manejar el error si ocurre durante la ejecución de la consulta
        console.error("Error al obtener tipo telefono por ID:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
      }
      if (data.length === 0) {
        // Manejar el caso en que no se encuentre ningún usuario con el ID proporcionado
        return res.status(404).json({ error: "tipo telefono no encontrado" });
      }
      // Devolver el primer usuario encontrado en formato JSON
      return res.json(data[0]);
    });
  } catch (error) {
    // Capturar y manejar cualquier error que ocurra durante el proceso
    console.error("Error al obtener tipo telefono por ID:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Endpoint para actualizar un departamento por su ID
router.put("/editarTipoTelefono/:id_tipotelefono", async (req, res) => {
  try {
    const IdTipoTelf = req.params.id_tipotelefono;
    const { Descripcion } = req.body;

        // Verificar si el nuevo nombre del departamento ya existe en otro departamento
        const existingTipoTelefono = await new Promise((resolve, reject) => {
          const query = "SELECT * FROM tbl_tipo_telefono WHERE Descripcion = ? AND Id_tipo_telefono != ?";
          db.query(query, [Descripcion, IdTipoTelf], (err, result) => {
            if (err) reject(err);
            resolve(result);
          });
        });
    
        // Si existe otro departamento con el mismo nombre, enviar una respuesta de error
        if (existingTipoTelefono.length > 0) {
          return res.status(400).json({ error: "Ya existe otro registro con el mismo nombre" });
        }

    const query = `
      UPDATE tbl_tipo_telefono
      SET Descripcion = ?
      WHERE Id_tipo_telefono = ?`;

    const values = [Descripcion, IdTipoTelf];

    db.query(query, values, (err, data) => {
      if (err) {
        console.error("Error al actualizar tipo telefono:", err);
        return res.status(500).json({ error: "Error al actualizar registro en la base de datos" });
      }

      registrarEnBitacora(159, "Editar telefono", `Se editó el tipo telefono con ID ${IdTipoTelf}`);

      return res.json({ message: "Registro actualizado correctamente" });
    });
  } catch (error) {
    console.error("Error al editar registro:", error);
    return res.status(500).json({ error: "Error al editar registro en la base de datos" });
  }
});









export default router;