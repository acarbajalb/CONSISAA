import express from "express";
import db from "./index.js";
import bcrypt from "bcrypt";
import { registrarEnBitacora } from './userSession.js';

const router = express.Router();

router.get("/traerUsuario/:idUsuario", (req, res) => {
    const idUsuario = req.params.idUsuario;
    const query = `
      SELECT 
          usuario.*, 
          estado.*, 
          rol.Rol AS Nombre_Rol, 
          puesto.Nombre_puesto AS Nombre_Puesto 
      FROM 
          tbl_ms_usuario usuario 
          INNER JOIN tbl_empleado emp ON usuario.Id_Empleado = emp.Id_Empleado 
          INNER JOIN tbl_estado estado ON emp.Id_Estado = estado.Id_Estado 
          INNER JOIN tbl_ms_rol rol ON usuario.Id_Rol = rol.Id_Rol
          INNER JOIN tbl_puesto puesto ON usuario.Id_Puesto = puesto.Id_Puesto
      WHERE 
          usuario.Id_usuario = ?
      ORDER BY 
          usuario.Fecha_modificacion DESC;
    `;
    db.query(query, [idUsuario], (err, data) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        return res.json(data);
    });
  });

  router.get("/traerDelegado/:idUsuario", (req, res) => {
    const idUsuario = req.params.idUsuario;
    const query = `
      SELECT *
      FROM tbl_ms_usuario
      WHERE Id_usuario = (
          SELECT Id_delegado
          FROM tbl_ms_usuario
          WHERE Id_usuario = ?
      )
    `;
    db.query(query, [idUsuario], (err, data) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        return res.json(data);
    });

   // Endpoint para buscar un usuario por su nombre de usuario
router.get("/buscarUsuarioPorUsuario/:usuario", (req, res) => {
    const usuario = req.params.usuario;
    const query = `
      SELECT Id_usuario FROM tbl_ms_usuario WHERE Usuario = ?;
    `;
    db.query(query, [usuario], (err, data) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.json(data);
    });
  });
  
  // Endpoint para actualizar el usuario
  router.put("/actualizarUsuario", async (req, res) => {
    try {
      const { id_usuario, correo, contraseña, id_delegado } = req.body;
  
      // Verificar si se proporcionaron tanto el correo como la contraseña
      if (!correo && !contraseña && !id_delegado) {
        return res.status(400).json({ error: "Se debe proporcionar al menos el correo, la contraseña o el ID del delegado para actualizar" });
      }
  
      // Construir la consulta SQL para actualizar el usuario
      let query = 'UPDATE tbl_ms_usuario SET ';
      const params = [];
      if (correo) {
        query += 'Correo_electronico = ?, ';
        params.push(correo);
      }
      if (contraseña) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(contraseña, saltRounds);
        query += 'Contraseña = ?, ';
        params.push(hashedPassword);
      }
      if (id_delegado !== null) {
        query += 'Id_delegado = ?, ';
        params.push(id_delegado);
      }
      // Eliminar la última coma y espacio
      query = query.slice(0, -2);
      query += ' WHERE Id_usuario = ?';
      params.push(id_usuario);
  
      // Ejecutar la consulta SQL para actualizar el usuario
      db.query(query, params, (err, result) => {
        if (err) {
          console.error("Error al actualizar usuario:", err);
          return res.status(500).json({ error: "Error interno del servidor" });
        }
        // Verificar si se actualizó algún usuario
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Usuario no encontrado" });
        }
        // Usuario actualizado exitosamente
        return res.json({ message: "Usuario actualizado correctamente" });
      });
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
      
});

export default router;