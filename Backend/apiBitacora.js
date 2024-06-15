import express from "express";
import db from "./index.js"; 

const router = express.Router();

router.get("/traerBitacora", (req, res) => {
    let query = `
 SELECT b.*, u.Usuario AS NombreUsuario, pantalla.Objeto
        FROM tbl_ms_bitacora b
        INNER JOIN tbl_ms_usuario u ON b.Id_usuario = u.Id_usuario
        INNER JOIN tbl_ms_objeto pantalla ON b.Id_Objeto=pantalla.Id_objeto
    `;
    const { fecha } = req.query;
    if (fecha) {
        // Si se proporciona una fecha, filtramos por esa fecha
        query += ` WHERE DATE(b.Fecha) = '${fecha}'`;
    }
    db.query(query, (err, data) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
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

        return res.json(data);
    });
});
  

export default router;
