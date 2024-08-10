

import express from "express";
import db from "./index.js";
import { registrarEnBitacora } from './userSession.js';

const router = express.Router();
router.get("/traerSolicitudPorUsuarioLogueado/:id_usuario", (req, res) => {
  const id_usuario = req.params.id_usuario;

  // Consulta para obtener el puesto del usuario logueado
  const puestoQuery = `
    SELECT Id_Puesto FROM tbl_ms_usuario WHERE Id_Usuario = ?
  `;

  db.query(puestoQuery, [id_usuario], (err, puestoData) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (puestoData.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const id_puesto = puestoData[0].Id_Puesto;

    // Consulta para obtener las solicitudes asociadas al puesto y su jefe
    const query = `
      SELECT tbl_solicitud.*, 
             concat(tbl_empleado.Nombre, ' ', tbl_empleado.Apellido) AS NombreCompleto, 
             tbl_estado_de_solicitud.* 
      FROM tbl_solicitud 
      INNER JOIN tbl_empleado ON tbl_solicitud.Id_Empleado = tbl_empleado.Id_Empleado 
      INNER JOIN tbl_estado_de_solicitud ON tbl_solicitud.Id_Estado_Solicitud = tbl_estado_de_solicitud.Id_Estado_Solicitud  
      INNER JOIN tbl_ms_usuario ON tbl_empleado.Id_Empleado = tbl_ms_usuario.Id_Empleado
      INNER JOIN tbl_puesto ON tbl_ms_usuario.Id_Puesto = tbl_puesto.Id_Puesto
      WHERE (tbl_puesto.Id_Jefe = ? OR tbl_ms_usuario.Id_delegado = ?) AND (tbl_empleado.Id_Estado = 1 OR tbl_empleado.Id_Estado = 2) AND tbl_solicitud.Id_Estado_Solicitud = 3
    `;

    db.query(query, [id_puesto, id_puesto], (err, data) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Si el jefe está en estado de vacaciones (Id_Estado = 2), buscar su delegado
      if (data.length === 0) {
        const delegadoQuery = `
          SELECT tbl_solicitud.*, 
                 concat(tbl_empleado.Nombre, ' ', tbl_empleado.Apellido) AS NombreCompleto, 
                 tbl_estado_de_solicitud.* 
          FROM tbl_solicitud 
          INNER JOIN tbl_empleado ON tbl_solicitud.Id_Empleado = tbl_empleado.Id_Empleado 
          INNER JOIN tbl_estado_de_solicitud ON tbl_solicitud.Id_Estado_Solicitud = tbl_estado_de_solicitud.Id_Estado_Solicitud  
          INNER JOIN tbl_ms_usuario ON tbl_empleado.Id_Empleado = tbl_ms_usuario.Id_Empleado
          INNER JOIN tbl_puesto ON tbl_ms_usuario.Id_Puesto = tbl_puesto.Id_Puesto
          WHERE tbl_ms_usuario.Id_delegado = ? AND tbl_empleado.Id_Estado = 1 AND tbl_solicitud.Id_Estado_Solicitud = 3
        `;
        
        db.query(delegadoQuery, [id_puesto], (err, delegadoData) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          return res.json(delegadoData);
        });
      } else {
        return res.json(data);
      }
    });
  });
});







// Endpoint para DENEGAR un regsitro de solcitud por su ID VISTA ADMINISTRADOR
router.put("/DenegarSolicitud/:Id_Solicitud", async (req, res) => {
  try {
    const solcitudId = req.params.Id_Solicitud; // Obtiene el ID del usuario de los parámetros de la solicitud.

    // Consulta SQL para deshabilitar un usuario por su ID
    const query = `
        UPDATE tbl_solicitud 
        SET Id_Estado_Solicitud = 1
        WHERE Id_Solicitud = ?`; // Usar el ID del usuario en la cláusula WHERE

    // Ejecutar la consulta SQL
    db.query(
      query,
      [solcitudId], // Pasar el ID del usuario como parámetro en la consulta
      (err, result) => {
        if (err) {
          console.error("Error al denegar la solicitud:", err);
          return res.status(500).json({
            error: "Error al denegar la solicitud en la base de datos",
          });
        }
        if (result.affectedRows === 0) {
          // Manejar el caso en que no se encuentre ningún usuario con el ID proporcionado
          return res
            .status(404)
            .json({ error: "Registro de solicitud no encontrado" });
        }
        registrarEnBitacora( 144, "Denegar solicitud", "Se denegó la solicitud de usuario.");

        // Devolver un mensaje de éxito si se deshabilita el usuario correctamente
        return res.json({
          message: "Registro de solicitud denegada correctamente",
        });
      }
    );
  } catch (error) {
    console.error("Error al denegar solicitud:", error);
    return res
      .status(500)
      .json({ error: "Error al denegar solicitud en la base de datos" });
  }
});

// Endpoint para APROBAR un regsitro de solcitud por su ID VISTA ADMINISTRADOR
router.put("/AprobarSolicitud/:Id_Solicitud", async (req, res) => {
  try {
    const solcitudId = req.params.Id_Solicitud; // Obtiene el ID del usuario de los parámetros de la solicitud.

    // Consulta SQL para deshabilitar un usuario por su ID
    const query = `
        UPDATE tbl_solicitud 
        SET Id_Estado_Solicitud = 2
        WHERE Id_Solicitud = ?`; // Usar el ID del usuario en la cláusula WHERE

    // Ejecutar la consulta SQL
    db.query(
      query,
      [solcitudId], // Pasar el ID del usuario como parámetro en la consulta
      (err, result) => {
        if (err) {
          console.error("Error al aprobar la solicitud:", err);
          return res.status(500).json({
            error: "Error al aprobar la solicitud en la base de datos",
          });
        }
        if (result.affectedRows === 0) {
          // Manejar el caso en que no se encuentre ningún usuario con el ID proporcionado
          return res
            .status(404)
            .json({ error: "Registro de solicitud no encontrado" });
        }
        registrarEnBitacora( 144, "Aprobar solicitud", "Se aprobó la solicitud de usuario.");

        // Devolver un mensaje de éxito si se deshabilita el usuario correctamente
        return res.json({
          message: "Registro de solicitud aprobar correctamente",
        });
      }
    );
  } catch (error) {
    console.error("Error al aprobar solicitud:", error);
    return res
      .status(500)
      .json({ error: "Error al aprobar solicitud en la base de datos" });
  }
});






/*VISTA USUARIO*/
// Endpoint para obtener las oslicitudes de el usuario correspondiente
router.get("/traerSolicitudes/:Id_Empleado", (req, res) => {
  const Id_Empleado = req.params.Id_Empleado;
const query = 'SELECT  tbl_solicitud.*, estado.Estado_Solicitud, concat(emp.Nombre, emp.Apellido) AS NombreCompleto    FROM  tbl_solicitud  INNER JOIN tbl_estado_de_solicitud AS estado  ON tbl_solicitud.Id_Estado_Solicitud=estado.Id_Estado_Solicitud   INNER JOIN tbl_empleado AS emp ON emp.Id_Empleado=tbl_solicitud.Id_Empleado WHERE tbl_solicitud.Id_Empleado =?';
  db.query(query, Id_Empleado, (err, data) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    registrarEnBitacora(145, "Entró a solicitudes", "Se mostraron los registros de solicitudes de usuario.");

    return res.json(data);
  });
});


// Endpoint para la creación de solicitudes de vacaciones
router.post("/creacionSolicitud", async (req, res) => {
  try {
    // Extracción de datos de la solicitud recibida
    const {
      Id_Estado_Solicitud,
      Id_Empleado,
      Id_Tipo_Solicitud,
      Fecha_Inicio_Vacaciones,
      Fecha_Final_Vacaciones,
      Hora_Inicio_Vacaciones,
      Hora_Final_Vacaciones,
      Fecha_Retorno_Vacaciones = fecharetorno,
      Tiempo_Parcial,
      Fecha_solicitud,
      Observaciones,
      Creado_por,
      Modificado_por,
      Fecha_creacion,
      Fecha_modificacion,
    } = req.body;

    // Consulta para obtener el contrato del empleado
    const query = `
      SELECT Id_Tipo_Contrato, Cantidad_Acumulada_Vacaciones
      FROM tbl_contrato
      WHERE Id_Empleado = ?`;

    // Ejecución de la consulta SQL
    db.query(query, [Id_Empleado], (err, contratoData) => {
      // Manejo de errores de la consulta
      if (err) {
        console.error("Error al obtener el contrato:", err);
        return res
          .status(500)
          .json({ error: "Error al obtener el contrato del empleado" });
      }

      // Verificar si hay algún resultado en contratoData
      if (!contratoData || contratoData.length === 0) {
        console.error("No se encontraron datos de contrato para el empleado");
        return res
          .status(404)
          .json({
            error: "No se encontraron datos de contrato para el empleado",
          });
      }

      // Procesamiento de datos del contrato
      const tipoContrato = contratoData[0].Id_Tipo_Contrato;
      const cantidadAcumuladaVacaciones =
        contratoData[0].Cantidad_Acumulada_Vacaciones;

      // Determinar la cantidad de días de vacaciones según el tipo de contrato
      let cantidadVacacionesAnuales = 0;
      if (tipoContrato === 1) {
        cantidadVacacionesAnuales = 10; // Máximo 10 días de vacaciones al año
      } else if (tipoContrato === 2) {
        cantidadVacacionesAnuales = 20; // Máximo 20 días de vacaciones al año
      }

      // Calcular la fecha de retorno
      let Fecha_Retorno_Vacaciones = new Date(Fecha_Final_Vacaciones);
      if (Tiempo_Parcial) {
        // Si es vacación parcial, la fecha de retorno es la misma que la fecha final de vacaciones
        Fecha_Retorno_Vacaciones = new Date(Fecha_Final_Vacaciones);
      } else {
        // Si es vacación completa, la fecha de retorno es el día siguiente a la fecha final de vacaciones
        Fecha_Retorno_Vacaciones.setDate(
          Fecha_Retorno_Vacaciones.getDate() + 1
        );
      }

      // Inserción de la solicitud en la base de datos
      const insertQuery = `
        INSERT INTO tbl_solicitud (
          Id_Estado_Solicitud,
          Id_Empleado,
          Id_Tipo_Solicitud,
          Fecha_Inicio_Vacaciones,
          Fecha_Final_Vacaciones,
          Hora_Inicio_Vacaciones,
          Hora_Final_Vacaciones,
          Fecha_Retorno_Vacaciones,
          Tiempo_Parcial,
          Fecha_solicitud,
          Observaciones,
          Creado_por,
          Modificado_por,
          Fecha_creacion,
          Fecha_modificacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      // Ejecución de la consulta de inserción
      db.query(
        insertQuery,
        [
          Id_Estado_Solicitud,
          Id_Empleado,
          Id_Tipo_Solicitud,
          Fecha_Inicio_Vacaciones,
          Fecha_Final_Vacaciones,
          Hora_Inicio_Vacaciones,
          Hora_Final_Vacaciones,
          Fecha_Retorno_Vacaciones,
          Tiempo_Parcial,
          Fecha_solicitud,
          Observaciones,
          Creado_por,
          Modificado_por,
          Fecha_creacion,
          Fecha_modificacion,
        ],
        (insertErr, insertResult) => {
          // Manejo de errores de la inserción
          if (insertErr) {
            console.error("Error al insertar solicitud:", insertErr);
            return res
              .status(500)
              .json({
                error: "Error al insertar la solicitud en la base de datos",
              });
          }
          registrarEnBitacora( 148, "Crear solicitud", "Se creó la solicitud del usuario.");

          // Respuesta exitosa
          return res.json({ message: "Solicitud insertada correctamente" });
        }
      );
    });
  } catch (error) {
    // Manejo de errores generales
    console.error("Error al crear solicitud:", error);
    return res
      .status(500)
      .json({ error: "Error al crear la solicitud en el servidor" });
  }
});

router.get("/traerVacacionesAcumuladas/:Id_Empleado", (req, res) => {
  const Id_Empleado = req.params.Id_Empleado;
  const query = 'SELECT Id_Contrato, Id_Empleado, Cantidad_Acumulada_Vacaciones FROM tbl_contrato WHERE Id_Empleado = ?';
  
  db.query(query, Id_Empleado, (err, data) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Aquí podrías realizar algún registro en la bitácora si lo necesitas
    
    return res.json(data);
  });
});


export default router;