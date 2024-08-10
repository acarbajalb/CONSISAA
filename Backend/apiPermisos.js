import express from "express";
import db from "./index.js"; 
import { registrarEnBitacora } from './userSession.js';


const router = express.Router();

// Endpoint para obtener usuarios
router.get("/traerPermisos", (req, res) => {
  const query = 
  ' SELECT tbl_ms_permiso.*, tbl_ms_objeto.Id_objeto, tbl_ms_objeto.Objeto AS "Pantallas", tbl_ms_rol.Rol FROM tbl_ms_permiso INNER JOIN  tbl_ms_objeto ON tbl_ms_permiso.Id_objeto= tbl_ms_objeto.Id_objeto INNER JOIN  tbl_ms_rol ON tbl_ms_permiso.Id_Rol= tbl_ms_rol.Id_Rol ORDER BY tbl_ms_permiso.Fecha_modificacion DESC; ';
  db.query(query, (err, data) => {
      if (err) {
          return res.status(500).json({ error: err.message });
      }
      registrarEnBitacora( 146, "Entró a permisos", "Se mostraron los registros de permisos.");
      return res.json(data);
  });
});

// Endpoint para obtener roles
router.get("/obtenerRoles", (req, res) => {
  const query = 'SELECT Id_Rol, Rol FROM tbl_ms_rol';
  db.query(query, (err, data) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json(data);
  });});
// Endpoint para obtener pantallas
router.get("/obtenerObjetos", (req, res) => {
  const query = 'SELECT Id_objeto, Objeto FROM tbl_ms_objeto';
  db.query(query, (err, data) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json(data);
  });});

// Endpoint 
router.post("/creacionPermiso", async (req, res) => {
  const {
    Id_objeto,
    Id_Rol,
    Permiso_insercion,
    Permiso_eliminacion,
    Permiso_actualizacion,
    Permiso_consultar,
    Creado_por,
    Modificado_por,
    Fecha_creacion, 
    Fecha_modificacion
  } = req.body;

  const query = ` 
    INSERT INTO tbl_ms_permiso (
      Id_objeto,
      Id_Rol,
      Permiso_insercion,
      Permiso_eliminacion,
      Permiso_actualizacion,
      Permiso_consultar,
      Creado_por,
      Modificado_por,
      Fecha_creacion,
      Fecha_modificacion
  )
  VALUES (?, ?, ?, ?, ?, ?, ?,?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;

db.query(
  query,
  [
    Id_objeto,
    Id_Rol,
    Permiso_insercion,
    Permiso_eliminacion,
    Permiso_actualizacion,
    Permiso_consultar,
    Creado_por,
    Modificado_por,
    Fecha_creacion, 
    Fecha_modificacion
  ],
  (err, data) => {
    if (err) {
      console.error("Error al insertar usuario:", err);
      return res
        .status(500)
        .json({ error: "Error al insertar usuario en la base de datos" });
    }
   registrarEnBitacora( 149, "Crear permiso", "Se creó un nuevo permiso.");
    return res.json({ message: "Permiso insertado correctamente" });
  }
);

});


// Endpoint para obtener un acceso específico por su ID de rol    ",   
router.get("/obtenerRegistro/:id_Objeto/:id_Rol", async (req, res) => {
  try {
    const { id_Rol, id_Objeto }  = req.params;

    // Consulta SQL para seleccionar un acceso por su ID de rol y objeto
    const query =
      "SELECT * FROM tbl_ms_permiso WHERE   Id_Rol = ? AND Id_objeto = ? ";

    // Ejecutar la consulta SQL con el ID del rol y objeto como parámetros
    db.query(query, [id_Rol, id_Objeto], (err, data) => {
      if (err) {
        // Manejar el error si ocurre durante la ejecución de la consulta
        console.error("Error al obtener el registro por ID de rol y objeto:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
      }
      if (data.length === 0) {
        // Manejar el caso en que no se encuentre ningún acceso con los IDs proporcionados
        return res.status(404).json({ error: "Registro no encontrado" });
      }
      // Devolver el primer acceso encontrado en formato JSON
      return res.json(data[0]);
    });
  } catch (error) {
    // Capturar y manejar cualquier error que ocurra durante el proceso
    console.error("Error al obtener registro por ID de rol y objeto:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});



// Endpoint para actualizar un registro
router.put("/editarAcceso/:id_Objeto/:id_Rol", async (req, res) => {
  try {
    const { id_Rol, id_Objeto }  = req.params;
    const {
      Id_objeto,
      Id_Rol,
      Permiso_insercion,
      Permiso_eliminacion,
      Permiso_actualizacion,
      Permiso_consultar, 
      Modificado_por
    } = req.body;

    const query = `
      UPDATE tbl_ms_permiso
      SET
        Id_objeto=?,
        Id_Rol=?,
        Permiso_insercion=?,
        Permiso_eliminacion=?,
        Permiso_actualizacion=?,
        Permiso_consultar=?, 
        Modificado_por=?,     
        Fecha_modificacion = CURRENT_TIMESTAMP
    WHERE Id_objeto=? AND Id_Rol=?`;  

    db.query(query, [
        Id_objeto,
        Id_Rol,
        Permiso_insercion,
        Permiso_eliminacion,
        Permiso_actualizacion,
        Permiso_consultar, 
        Modificado_por, 
        id_Objeto,
        id_Rol
      ],
      (err, data) => {
        if (err) {
          console.error("Error al actualizar registro:", err);
          return res
            .status(500)
            .json({ error: "Error al actualizar registro en la base de datos" });
        }
       registrarEnBitacora(150, "Editar permiso", `Se editó el permiso.`);

        return res.json({ message: "Registro actualizado correctamente" });
      }
    );
  } catch (error) {
    console.error("Error al editar registro:", error);
    return res.status(500).json({ error: "Error al editar registro en la base de datos" });
  }
});




//Manejo de permisos
 

// Endpoint para obtener los permisos de un rol específico
router.get("/verificarPermiso/:id_Objeto/:id_Rol", async (req, res) => {
  try {
    const { id_Objeto, id_Rol } = req.params;

    // Consulta SQL para obtener los permisos de un rol específico
    const query =
      "SELECT * FROM tbl_ms_permiso WHERE Id_Rol = ? AND Id_objeto = ?";

    // Ejecutar la consulta SQL con el ID del rol como parámetro
    db.query(query, [id_Rol, id_Objeto], (err, data) => {
      if (err) {
        console.error("Error al obtener los permisos por ID de rol:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
      }
      
      // Modificar los valores de las acciones a booleanos (0 -> false, 1 -> true)
      const permisos = data.map(permiso => ({
        ...permiso,
        Permiso_insercion: !!permiso.Permiso_insercion,
        Permiso_eliminacion: !!permiso.Permiso_eliminacion,
        Permiso_actualizacion: !!permiso.Permiso_actualizacion,
        Permiso_consultar: !!permiso.Permiso_consultar
      }));

      // Devolver los permisos encontrados en formato JSON
      res.json(permisos);
    });
  } catch (error) {
    console.error("Error al obtener permisos por ID de rol:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

 

export default router