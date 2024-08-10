
import express from "express";
import db from "./index.js"; 
import { registrarEnBitacora } from './userSession.js';

const router = express.Router();

// Endpoint para obtener departamentos
router.get("/traerDepartamento", (req, res) => {
  const query = 'SELECT * FROM tbl_departamento ORDER BY Fecha_modificacion DESC;';
  db.query(query, (err, data) => {
      if (err) {
          return res.status(500).json({ error: err.message });
      }

      // Registro en la bitácora después de obtener departamentos
      registrarEnBitacora(17, "Entró a departamento", "Se mostraron los registros de departamentos.");

      return res.json(data);
  });
});

// Endpoint para crear un nuevo departamento
router.post("/creacionDepartamento", async (req, res) => {
  try {
    // Extraer datos del cuerpo de la solicitud
    const {
      Nombre_departamento,
      Creado_por,
      Modificado_por
    } = req.body;

    // Verificar si el nombre del departamento ya existe
    const existingDepartamento = await new Promise((resolve, reject) => {
      const query = "SELECT * FROM tbl_departamento WHERE Nombre_departamento = ?";
      db.query(query, [Nombre_departamento], (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });

    // Si el nombre del departamento ya existe, enviar una respuesta de error
    if (existingDepartamento.length > 0) {
      return res.status(400).json({ error: "El nombre del departamento ya existe. Ingrese otro" });
    }

    // Crear la consulta SQL para insertar el nuevo departamento
    const insertQuery = `
      INSERT INTO tbl_departamento (Nombre_departamento, Creado_por, Modificado_por, Fecha_creacion, Fecha_modificacion)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;

    // Ejecutar la consulta SQL de inserción
    db.query(
      insertQuery,
      [Nombre_departamento, Creado_por, Modificado_por],
      (err, data) => {
        if (err) {
          console.error("Error al insertar departamento:", err);
          return res.status(500).json({ error: "Error al insertar departamento en la base de datos" });
        }

        // Registro en la bitácora después de crear el departamento
        registrarEnBitacora(18, "Crear departamento", "Se creó un nuevo departamento.");

        return res.json({ message: "Departamento insertado correctamente" });
      }
    );
  } catch (error) {
    console.error("Error al insertar departamento:", error);
    return res.status(500).json({ error: "Error al insertar departamento en la base de datos" });
  }
});


// Endpoint para obtener un usuario específico por su ID
router.get("/idDepartamento/:id_departamento", async (req, res) => {
  try {
    const userId = req.params.id_departamento;

    // Consulta SQL para seleccionar un 
    const query = 'SELECT * FROM tbl_departamento WHERE Id_departamento = ?';

    // Ejecutar la consulta SQL con el ID del usuario como parámetro
    db.query(query, userId, (err, data) => {
      if (err) {
        // Manejar el error si ocurre durante la ejecución de la consulta
        console.error("Error al obtener departamento por ID:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
      }
      if (data.length === 0) {
        // Manejar el caso en que no se encuentre ningún usuario con el ID proporcionado
        return res.status(404).json({ error: "Departamento no encontrado" });
      }
      // Devolver el primer usuario encontrado en formato JSON
      return res.json(data[0]);
    });
  } catch (error) {
    // Capturar y manejar cualquier error que ocurra durante el proceso
    console.error("Error al obtener departamento por ID:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});
// Endpoint para actualizar un departamento por su ID
router.put("/editarDepartamento/:id_departamento", async (req, res) => {
  try {
    const IdDepto = req.params.id_departamento;
    const { Nombre_departamento, Modificado_por } = req.body;

    // Verificar si el nuevo nombre del departamento ya existe en otro departamento
    const existingDepartamento = await new Promise((resolve, reject) => {
      const query = "SELECT * FROM tbl_departamento WHERE Nombre_departamento = ? AND Id_departamento != ?";
      db.query(query, [Nombre_departamento, IdDepto], (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });

    if (existingDepartamento.length > 0) {
      return res.status(400).json({ error: "Ya existe otro departamento con el mismo nombre" });//este error se manda para el front
    }

    const query = `
      UPDATE tbl_departamento
      SET 
      Nombre_departamento = ?,
      Modificado_por = ?,
      Fecha_modificacion = CURRENT_TIMESTAMP
      WHERE Id_departamento = ?`;

    const values = [Nombre_departamento, Modificado_por, IdDepto];

    db.query(query, values, (err, data) => {
      if (err) {
        console.error("Error al actualizar departamento:", err);
        return res.status(500).json({ error: "Error al actualizar departamento en la base de datos" });//este error se manda para el front
      }

      registrarEnBitacora(142, "Editar departamento", `Se editó el departamento con ID ${IdDepto}.`);
      return res.json({ message: "Departamento actualizado correctamente" });
    });
  } catch (error) {
    console.error("Error al editar departamento:", error);
    return res.status(500).json({ error: "Error al editar departamento en la base de datos" });
  }
});










export default router;