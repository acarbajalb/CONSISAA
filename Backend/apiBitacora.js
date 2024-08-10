import express from "express";
import db from "./index.js";
import { registrarEnBitacora } from "./userSession.js";

const router = express.Router();

router.get("/traerBitacora", (req, res) => {
  /*ROW_NUMBER(): Asigna un número de fila a cada registro dentro de particiones de registros que tienen
   la misma fecha (PARTITION BY b.Fecha). Esto permite identificar los duplicados. */
  let query = `
    SELECT * FROM (
        SELECT 
            b.*, 
            u.Usuario AS NombreUsuario, 
            pantalla.Objeto,
            ROW_NUMBER() OVER(PARTITION BY b.Fecha ORDER BY b.Id_bitacora) AS dup
        FROM tbl_ms_bitacora b
        INNER JOIN tbl_ms_usuario u ON b.Id_usuario = u.Id_usuario
        INNER JOIN tbl_ms_objeto pantalla ON b.Id_Objeto = pantalla.Id_objeto
    ) AS subquery
    WHERE dup = 1
  `;

  const { fechaInicio, fechaFinal } = req.query;
  if (fechaInicio && fechaFinal) {
    // Si se proporcionan ambas fechas, filtramos por el rango de fechas
    query += ` AND DATE(Fecha) BETWEEN '${fechaInicio}' AND '${fechaFinal}'`;
  } else if (fechaInicio) {
    // Si solo se proporciona una fecha, filtramos por esa fecha
    query += ` AND DATE(Fecha) = '${fechaInicio}'`;
  }

  db.query(query, (err, data) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    registrarEnBitacora(
      12,
      "Entró a la bitácora",
      "Se mostraron los registros de bitácora."
    );
    return res.json(data);
  });
});


// Nuevo endpoint para obtener registros de mantenimiento usuario la bitácora con ID de objeto 9, 10, 11 y 12
router.get("/traerBitacoraObjetosMantenimientousuario", (req, res) => {
  const query = `
        SELECT b.*, u.Usuario AS NombreUsuario
        FROM tbl_ms_bitacora b
        INNER JOIN tbl_ms_usuario u ON b.Id_usuario = u.Id_usuario
        WHERE b.Id_Objeto IN (9, 10, 11, 12)
    `;
  db.query(query, (err, data) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    registrarEnBitacora(
      173,
      "Generó un reporte.",
      "Se mostró el reporte del apartado de mantenimiento usuario."
    );
    return res.json(data);
  });
});

router.get("/traerBitacoraObjetosMantenimientopermisos", (req, res) => {
  const query = `
        SELECT b.*, u.Usuario AS NombreUsuario
        FROM tbl_ms_bitacora b
        INNER JOIN tbl_ms_usuario u ON b.Id_usuario = u.Id_usuario
        WHERE b.Id_Objeto IN (146, 149, 150)
    `;
  db.query(query, (err, data) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    registrarEnBitacora(
      186,
      "Generó un reporte.",
      "Se mostró el reporte del apartado de mantenimiento acceso al sistema."
    );
    return res.json(data);
  });
});

router.get("/traerBitacoraObjetosMantenimientoparametro", (req, res) => {
  const query = `
        SELECT b.*, u.Usuario AS NombreUsuario
        FROM tbl_ms_bitacora b
        INNER JOIN tbl_ms_usuario u ON b.Id_usuario = u.Id_usuario
        WHERE b.Id_Objeto IN (147)
    `;
  db.query(query, (err, data) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    registrarEnBitacora(
      184,
      "Generó un reporte.",
      "Se mostró el reporte del apartado de mantenimiento parámetro."
    );
    return res.json(data);
  });
});

router.get("/traerBitacoraObjetosMantenimientopuesto", (req, res) => {
  const query = `
        SELECT b.*, u.Usuario AS NombreUsuario
        FROM tbl_ms_bitacora b
        INNER JOIN tbl_ms_usuario u ON b.Id_usuario = u.Id_usuario
        WHERE b.Id_Objeto IN (160, 161, 162)
    `;
  db.query(query, (err, data) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    registrarEnBitacora(
      180,
      "Generó un reporte.",
      "Se mostró el reporte del apartado de mantenimiento puesto."
    );
    return res.json(data);
  });
});

router.get("/traerBitacoraObjetosMantenimientorol", (req, res) => {
  const query = `
        SELECT b.*, u.Usuario AS NombreUsuario
        FROM tbl_ms_bitacora b
        INNER JOIN tbl_ms_usuario u ON b.Id_usuario = u.Id_usuario
        WHERE b.Id_Objeto IN (169, 170, 171)
    `;
  db.query(query, (err, data) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    registrarEnBitacora(
      185,
      "Generó un reporte.",
      "Se mostró el reporte del apartado de mantenimiento rol."
    );
    return res.json(data);
  });
});

// Nuevo endpoint para obtener registros de mantenimiento usuario la bitácora con ID de objeto 9, 10, 11 y 12
router.get("/traerBitacoraObjetosMantenimientoempleado", (req, res) => {
  const query = `
        SELECT b.*, u.Usuario AS NombreUsuario
        FROM tbl_ms_bitacora b
        INNER JOIN tbl_ms_usuario u ON b.Id_usuario = u.Id_usuario
        WHERE b.Id_Objeto IN (5, 6, 7, 8)
    `;
  db.query(query, (err, data) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    registrarEnBitacora(
      174,
      "Generó un reporte.",
      "Se mostró el reporte del apartado de mantenimiento empleado."
    );
    return res.json(data);
  });
});

// Nuevo endpoint para obtener registros de mantenimiento usuario la bitácora con ID de objeto 9, 10, 11 y 12
router.get("/traerBitacoraObjetosMantenimientodepartamento", (req, res) => {
  const query = `
        SELECT b.*, u.Usuario AS NombreUsuario
        FROM tbl_ms_bitacora b
        INNER JOIN tbl_ms_usuario u ON b.Id_usuario = u.Id_usuario
        WHERE b.Id_Objeto IN (17, 18, 142)
    `;
  db.query(query, (err, data) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    registrarEnBitacora(
      176,
      "Generó un reporte.",
      "Se mostró el reporte del apartado de mantenimiento departamento."
    );
    return res.json(data);
  });
});

// Nuevo endpoint para obtener registros de mantenimiento usuario la bitácora con ID de objeto 9, 10, 11 y 12
router.get("/traerBitacoraObjetosMantenimientocontrato", (req, res) => {
  const query = `
        SELECT b.*, u.Usuario AS NombreUsuario
        FROM tbl_ms_bitacora b
        INNER JOIN tbl_ms_usuario u ON b.Id_usuario = u.Id_usuario
        WHERE b.Id_Objeto IN (13, 14, 15, 16)
    `;
  db.query(query, (err, data) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    registrarEnBitacora(
      175,
      "Generó un reporte.",
      "Se mostró el reporte del apartado de mantenimiento contrato."
    );
    return res.json(data);
  });
});

router.get("/traerBitacoraObjetosMantenimientomissolicitudes", (req, res) => {
  const query = `
        SELECT b.*, u.Usuario AS NombreUsuario
        FROM tbl_ms_bitacora b
        INNER JOIN tbl_ms_usuario u ON b.Id_usuario = u.Id_usuario
        WHERE b.Id_Objeto IN (145)
    `;
  db.query(query, (err, data) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    registrarEnBitacora(
      183,
      "Generó un reporte.",
      "Se mostró el reporte del apartado de mantenimiento mis solicitudes."
    );
    return res.json(data);
  });
});

router.get("/traerBitacoraObjetosMantenimientosolocitudesadmin", (req, res) => {
  const query = `
        SELECT b.*, u.Usuario AS NombreUsuario
        FROM tbl_ms_bitacora b
        INNER JOIN tbl_ms_usuario u ON b.Id_usuario = u.Id_usuario
        WHERE b.Id_Objeto IN (144)
    `;
  db.query(query, (err, data) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    registrarEnBitacora(
      187,
      "Generó un reporte.",
      "Se mostró el reporte del apartado de mantenimiento buzón de solicitudes."
    );
    return res.json(data);
  });
});

router.get("/traerBitacoraObjetosMantenimientoArea", (req, res) => {
  const query = `
        SELECT b.*, u.Usuario AS NombreUsuario
        FROM tbl_ms_bitacora b
        INNER JOIN tbl_ms_usuario u ON b.Id_usuario = u.Id_usuario
        WHERE b.Id_Objeto IN (163,164,165)
    `;
  db.query(query, (err, data) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    registrarEnBitacora(
      177,
      "Generó un reporte.",
      "Se mostró el reporte del apartado de mantenimiento  área."
    );
    return res.json(data);
  });
});

router.get("/traerBitacoraObjetosMantenimientoGenero", (req, res) => {
  const query = `
        SELECT b.*, u.Usuario AS NombreUsuario
        FROM tbl_ms_bitacora b
        INNER JOIN tbl_ms_usuario u ON b.Id_usuario = u.Id_usuario
        WHERE b.Id_Objeto IN (151,152,153)
    `;
  db.query(query, (err, data) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    registrarEnBitacora(
      178,
      "Generó un reporte.",
      "Se mostró el reporte del apartado de mantenimiento género."
    );
    return res.json(data);
  });
});

router.get("/traerBitacoraObjetosMantenimientoEstadoCivil", (req, res) => {
  const query = `
        SELECT b.*, u.Usuario AS NombreUsuario
        FROM tbl_ms_bitacora b
        INNER JOIN tbl_ms_usuario u ON b.Id_usuario = u.Id_usuario
        WHERE b.Id_Objeto IN (154,155,156)
    `;
  db.query(query, (err, data) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    registrarEnBitacora(
      179,
      "Generó un reporte.",
      "Se mostró el reporte del apartado de mantenimiento estado civil."
    );
    return res.json(data);
  });
});
router.get("/traerBitacoraObjetosMantenimientoEstado", (req, res) => {
  const query = `
        SELECT b.*, u.Usuario AS NombreUsuario
        FROM tbl_ms_bitacora b
        INNER JOIN tbl_ms_usuario u ON b.Id_usuario = u.Id_usuario
        WHERE b.Id_Objeto IN (166,167,168)
    `;
  db.query(query, (err, data) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    registrarEnBitacora(
      182,
      "Generó un reporte.",
      "Se mostró el reporte del apartado de mantenimiento estado."
    );
    return res.json(data);
  });
});
router.get("/traerBitacoraObjetosMantenimientoTipoTelefono", (req, res) => {
  const query = `
        SELECT b.*, u.Usuario AS NombreUsuario
        FROM tbl_ms_bitacora b
        INNER JOIN tbl_ms_usuario u ON b.Id_usuario = u.Id_usuario
        WHERE b.Id_Objeto IN (157,158,159)
    `;
  db.query(query, (err, data) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    registrarEnBitacora(
      181,
      "Generó un reporte.",
      "Se mostró el reporte del apartado de mantenimiento tipo de teléfono."
    );

    return res.json(data);
  });
});

export default router;
