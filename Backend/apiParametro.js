
import express from "express";
import db from "./index.js";  
import { registrarEnBitacora } from './userSession.js';

const router = express.Router();

router.post("/crearParametro", async (req, res) => {
  try {
    // Extraer datos del cuerpo de la solicitud
    const {
      Parametro,
      User,
      Valor,
      Creado_por, 
      Modificado_por
    } = req.body;

    // Verificar si el Parametro existe en el cuerpo de la solicitud
    if (!Parametro) {
      return res.status(400).json({ error: "El parámetro no está presente en la solicitud" });
    }

    // Crear la consulta SQL para verificar si el Parametro existe en la base de datos.
    const parametroQuery = `SELECT Parametro FROM tbl_ms_parametro WHERE Parametro = ?`;
    db.query(parametroQuery, [Parametro], async (err, parametroData) => {
      if (err) {
        console.error("Error al verificar registro:", err);
        return res.status(500).json({ error: "Error al verificar el parámetro en la base de datos" });
      }

      // Si el parámetro no existe en la base de datos, proceder con la inserción
      if (parametroData.length === 0) {
        // Crear la consulta SQL para insertar el nuevo parámetro
        const insertQuery = `
          INSERT INTO tbl_ms_parametro (Id_usuario, Parametro, Valor, Fecha_creacion, Creado_por, Fecha_modificacion, Modificado_por)
          VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?, CURRENT_TIMESTAMP, ?)
        `;
        
        // Ejecutar la consulta SQL de inserción
        db.query(
          insertQuery,
          [User, Parametro, Valor, Creado_por, Modificado_por],
          (err, data) => {
            if (err) {
              console.error("Error al insertar parámetro:", err);
              return res.status(500).json({ error: "Error al insertar parámetro en la base de datos" });
            }

            // Registro en la bitácora después de crear el parámetro
            registrarEnBitacora(18, "Crear Parámetro", "Se creó un nuevo Parámetro");

            return res.json({ message: "Parámetro insertado correctamente" });
          }
        );
      } else {
        return res.status(409).json({ error: "El parámetro ya existe en la base de datos" });
      }
    });
  } catch (error) {
    console.error("Error al insertar Parámetro:", error);
    return res.status(500).json({ error: "Error al insertar Parámetro en la base de datos" });
  }
});


// Endpoint para obtener parametros
router.get("/traerParametros", (req, res) => {
  const query = 'SELECT * FROM tbl_ms_parametro';
  db.query(query, (err, data) => {
      if (err) {
          return res.status(500).json({ error: err.message });
      }
      // Registro en la bitácora después de obtener parametros
      registrarEnBitacora(17, "Obtener parametro", "Se obtuvieron los parametro");
      return res.json(data);
  });
});

// Endpoint para obtener un usuario específico por su ID
router.get("/idparametro/:Id_parametro", async (req, res) => {
  try {
    const parametroId = req.params.Id_parametro;

    // Consulta SQL para seleccionar un parámetro por su ID
    const query = 'SELECT * FROM tbl_ms_parametro WHERE Id_parametro = ?';

    // Ejecutar la consulta SQL de forma asincrónica
    const data = await new Promise((resolve, reject) => {
      db.query(query, parametroId, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });

    if (data.length === 0) {
      // Si no se encuentra ningún parámetro con el ID proporcionado, devolver un error 404
      return res.status(404).json({ error: "Parámetro no encontrado" });
    }

    // Devolver el primer parámetro encontrado en formato JSON
    return res.json(data[0]);
  } catch (error) {
    // Capturar y manejar cualquier error que ocurra durante el proceso
    console.error("Error al obtener parámetro por ID:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});


// Endpoint para actualizar un departamento por su ID
router.put("/editarParametro/:Id_parametro", async (req, res) => {
  try {
    const parametroId = req.params.Id_parametro;
    const { Valor, Modificado_por } = req.body;

    const query = `
      UPDATE tbl_ms_parametro
      SET 
      Valor=?,
      Modificado_por=?,
      Fecha_modificacion = CURRENT_TIMESTAMP
      WHERE Id_parametro= ?`;

    db.query(
      query,
      [Valor, Modificado_por, parametroId],
      (err, data) => {
        if (err) {
          console.error("Error al actualizar Parámetro:", err);
          return res.status(500).json({ error: "Error al actualizar Parámetro en la base de datos" });
        }

        registrarEnBitacora(142, "Editar Parámetro", `Se editó el Parámetro con ID ${parametroId}`);

        return res.json({ message: "Parámetro actualizado correctamente" });
      }
    );
  } catch (error) {
    console.error("Error al editar Parámetro:", error);
    return res.status(500).json({ error: "Error al editar Parámetro en la base de datos" });
  }
});


export default router;