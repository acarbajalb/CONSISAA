import express from "express";
import db from "./index.js"; 
import { registrarEnBitacora } from './userSession.js';


const router = express.Router();
//Contenido de las solicitudes unicamente para manejo de Deducciones.

// Endpoint para obtener todos las deducciones.

router.get("/traerDeducciones", (req, res) => {
    const query = `
      SELECT d.*, e.Estado_Deduccion
      FROM tbl_deduccion AS d
      INNER JOIN tbl_estado_deduccion AS e ON d.Id_Estado_Deduccion = e.Id_Estado_Deduccion
    `;
        
    db.query(query, (err, data) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      registrarEnBitacora( 144, "Obtener deducciones", "Se obtuvieron las deducciones disponiles");

      return res.json(data);
    });
  });
  
  
  
  //EndPoint Crear Deducciones 
  
  router.post("/CrearDeduccion", async (req, res) => {
    // Extraer datos del cuerpo de la solicitud
    const { 
      Nombre_Deduccion,
      Porcentaje_Monto,
      Descripcion,
      Id_Estado_Deduccion,
      Id_Empleado,
      Id_Tipo_Deduccion,
      Creado_por, 
      Modificado_por, 
      Fecha_creacion, 
      Fecha_modificacion
    } = req.body;
  
    // Crear la consulta SQL
    const query = `
      INSERT INTO tbl_deduccion (Nombre_Deduccion,
        Porcentaje_Monto,
        Descripcion,
        Id_Estado_Deduccion,
        Id_Empleado,
        Id_Tipo_Deduccion,
        Creado_por,
        Modificado_por,
        Fecha_creacion,
        Fecha_modificacion) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)`;
  
    // Ejecutar la consulta
    db.query(query, [
      Nombre_Deduccion,
      Porcentaje_Monto,
      Descripcion,
      Id_Estado_Deduccion,
      Id_Empleado,
      Id_Tipo_Deduccion,
      Creado_por, 
      Modificado_por, 
      Fecha_creacion, 
      Fecha_modificacion
    ], (err, data) => {
      if (err) {
        console.error("Error al insertar deducción:", err);
        return res.status(500).json({ error: "Error al insertar deducción en la base de datos" });
      }
      registrarEnBitacora( 144, "Insertar deduccion", "Se inserto una nueva deduccion");

      // Si la inserción fue exitosa, mostrar mensaje en consola
      console.log("Deducción insertada correctamente");
      // Devolver una respuesta de éxito al cliente
      return res.json({ message: "Deducción insertada correctamente" });
    });
  });
  
  //EDITAR DEDUCCIONES-----------------------------
  //Endpoint para obtener un deducción específico por su ID
  router.get("/idDeduccion/:Id_Deduccion", async (req, res) => {
    try {
      const userId = req.params.Id_Deduccion;
  
      // Consulta SQL para seleccionar un deducción por su ID
      const query = 'SELECT * FROM tbl_deduccion WHERE Id_Deduccion = ?';
  
      // Ejecutar la consulta SQL con el ID del deducción como parámetro
      db.query(query, userId, (err, data) => {
        if (err) {
          // Manejar el error si ocurre durante la ejecución de la consulta
          console.error("Error al obtener deduccion por ID:", err);
          return res.status(500).json({ error: "Error interno del servidor" });
        }
        if (data.length === 0) {
          // Manejar el caso en que no se encuentre ningún deducción con el ID proporcionado
          return res.status(404).json({ error: "Deducción no encontrado" });
        }
        // Devolver el primer deducción encontrado en formato JSON
        return res.json(data[0]);
      });
    } catch (error) {
      // Capturar y manejar cualquier error que ocurra durante el proceso
      console.error("Error al obtener deducción por ID:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  // Endpoint para actualizar un deducción
  router.put("/editarDeducciones/:Id_Deduccion", async (req, res) => {
    try {
      const userId = req.params.Id_Deduccion;
      const {
        Nombre_Deduccion,
        Porcentaje_Monto,
        Descripcion
      
      } = req.body;
  
      // Construir la consulta SQL de actualización
      const query = `
        UPDATE tbl_deduccion 
        SET
        Nombre_Deduccion = ? ,
        Porcentaje_Monto = ? ,
        Descripcion = ? 
          
        WHERE Id_Deduccion = ?`; // Usar el ID del deducción en la cláusula WHERE
  
      // Ejecutar la consulta SQL
      db.query(
        query,
        [
        Nombre_Deduccion,
        Porcentaje_Monto,
        Descripcion,
  
         
          userId // Pasar el ID del deducción como parámetro en la consulta
        ],
        (err, data) => {
          if (err) {
            console.error("Error al actualizar deducción:", err);
            return res.status(500).json({ error: "Error al actualizar deducción en la base de datos" });
          }
          registrarEnBitacora( 144, "Editar deduccion", "Se edito una deduccion");

          return res.json({ message: "Deducción actualizado correctamente" });
        }
      );
    } catch (error) {
      console.error("Error al editar deducción:", error);
      return res.status(500).json({ error: "Error al editar deducción en la base de datos" });
    }
  });



// Endpoint para deshabilitar una deducción por su ID
router.delete("/deshabilitarDeduccion/:Id_Deduccion", async (req, res) => {
    try {
      const userId = req.params.id_usuario;// Obtiene el ID de la deducción de los parámetros de la solicitud.
  
      // Consulta SQL para deshabilitar una deducción por su ID
      const query = `
        UPDATE tbl_deduccion 
        SET Id_Estado_Deduccion = 2
        WHERE Id_Deduccion = ?`; // Usar el ID de la deducción en la cláusula WHERE
  
      // Ejecutar la consulta SQL
      db.query(
        query,
        [userId], // Pasar el ID de la deducción como parámetro en la consulta
        (err, result) => {
          if (err) {
            console.error("Error al deshabilitar deducción:", err);
            return res.status(500).json({ error: "Error al deshabilitar deducción en la base de datos" });
          }
          if (result.affectedRows === 0) {
            // Manejar el caso en que no se encuentre ningúna deducción con el ID proporcionado
            return res.status(404).json({ error: "Deducción no encontrado para deshabilitar" });
          }
          registrarEnBitacora( 144, "Deshabilitar deduccion", "Se deshabilito una deduccion");

          // Devolver un mensaje de éxito si se deshabilita el deducción correctamente
          return res.json({ message: "Deducción deshabilitado correctamente" });
        }
      );
    } catch (error) {
      console.error("Error al deshabilitar deducción:", error);
      return res.status(500).json({ error: "Error al deshabilitar deducción en la base de datos" });
    }
  });
  

  //Colocado aqui momentaneamente,este debe de ir en apiPlanilla

  // Endpoint para obtener Deducciones
router.get("/obtenerDeducciones", (req, res) => {
    const query = 'SELECT Nombre_Deduccion FROM tbl_deduccion';
    db.query(query, (err, data) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      registrarEnBitacora( 144, "Obtener deducciones", "Se obtuvieron las deducciones disponiles");

      return res.json(data);
    });});

export default router;
