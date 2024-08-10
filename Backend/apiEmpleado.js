//apiempleado
import express from "express";
import db from "./index.js";
import { registrarEnBitacora } from "./userSession.js";

const router = express.Router();

// Endpoint para traer empleados de la tabla
router.get("/traerEmpleados", (req, res) => {
  const query = `
    SELECT 
    em.*, 
    tite.Descripcion AS "Tipo_telefono", 
    te.Numero AS "Numero_contacto", 
    ci.Estado_civil AS "Estado_Civil", 
    ge.Nombre_Genero AS "Genero",
    est.Estado  -- Seleccionar todos los campos de tbl_estado
FROM 
    tbl_empleado em
INNER JOIN 
    tbl_estado_civil ci ON em.Id_EstadoCivil = ci.Id_EstadoCivil 
INNER JOIN 
    tbl_genero ge ON em.Id_Genero = ge.Id_Genero
INNER JOIN 
    tbl_telefono_empleado te ON em.Id_Empleado = te.Id_empleado
INNER JOIN 
    tbl_tipo_telefono tite ON te.Id_tipo_telefono = tite.Id_tipo_telefono
INNER JOIN
    tbl_estado est ON em.Id_Estado = est.Id_Estado  -- Suposición de relación entre tbl_empleado y tbl_estado
ORDER BY 
    em.Fecha_creacion DESC; -- Ordena por Fecha_creacion de manera descendente (del más reciente al más antiguo)

`;
  db.query(query, (err, data) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    registrarEnBitacora(
      5,
      "Entró a empleados",
      "Se mostraron los registros de los empleados."
    );
    return res.json(data);
  });
});

// Endpoint para crear un nuevo empleado
async function insertarEmpleadoYTelefono(
  Id_Estado,
  Id_EstadoCivil,
  Id_Genero,
  Nombre,
  Apellido,
  Dni,
  Direccion_vivienda,
  Salario,
  Numero,
  Id_Tipo_Telefono,
  Creado_por,
  Modificado_por,
  Fecha_creacion,
  Fecha_modificacion
) {
  return new Promise((resolve, reject) => {
    db.beginTransaction(async (err) => {
      if (err) {
        return reject(err);
      }

      try {
        // Insertar en tbl_empleado,al final lo que agregue(CURRENT_TIMESTAMP) fue para insertar la hora actual
        const empleadoQuery =
          "INSERT INTO tbl_empleado (Id_Estado,Id_EstadoCivil, Id_Genero, Nombre, Apellido,Dni, Direccion_vivienda, Salario, Creado_por, Modificado_por, Fecha_creacion, Fecha_modificacion) VALUES (?,?,?,?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";
        const empleadoResult = await executeQuery(empleadoQuery, [
          Id_Estado,
          Id_EstadoCivil,
          Id_Genero,
          Nombre,
          Apellido,
          Dni,
          Direccion_vivienda,
          Salario,
          Creado_por,
          Modificado_por,
          Fecha_creacion,
          Fecha_modificacion,
        ]);

        const empleadoId = empleadoResult.insertId;

        // Insertar en tbl_telefono_empleado
        const telefonoQuery =
          "INSERT INTO tbl_telefono_empleado (Id_empleado, Id_tipo_telefono, Numero, Creado_por, Modificado_por, Fecha_creacion, Fecha_modificacion) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";
        await executeQuery(telefonoQuery, [
          empleadoId,
          Id_Tipo_Telefono,
          Numero,
          Creado_por,
          Modificado_por,
          Fecha_creacion,
          Fecha_modificacion,
        ]);

        db.commit((err) => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      } catch (error) {
        /*Se maneja los errores de datos unicos  */
        db.rollback(() => {
          if (error.code === 'ER_DUP_ENTRY') {
            // Manejar el error de duplicado
            return reject({ code: 'DUPLICATE_ENTRY', message: 'DNI ya registrada. Ingresa datos nuevos.' });
          }
          reject(error);
        });
      }
    });
  });
}

async function executeQuery(query, values) {
  return new Promise((resolve, reject) => {
    db.query(query, values, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
}

//Endpoint para crear empleado.
router.post("/crearEmpleado", async (req, res) => {
  try {
    const {
      Id_Estado,
      Id_EstadoCivil,
      Id_Genero,
      Nombre,
      Apellido,
      Dni,
      Direccion_vivienda,
      Salario,
      Numero,
      Id_Tipo_Telefono,
      Creado_por,
      Modificado_por,
      Fecha_creacion,
      Fecha_modificacion,
    } = req.body;

    await insertarEmpleadoYTelefono(
      Id_Estado,
      Id_EstadoCivil,
      Id_Genero,
      Nombre,
      Apellido,
      Dni,
      Direccion_vivienda,
      Salario,
      Numero,
      Id_Tipo_Telefono,
      Creado_por,
      Modificado_por,
      Fecha_creacion,
      Fecha_modificacion
    );

    registrarEnBitacora(6, "Crear empleado", "Se creó un nuevo empleado.");
    return res.json({ message: "Empleado insertado correctamente" });
  } catch (error) {
    console.error("Error al crear empleado:", error);
    if (error.code === 'DUPLICATE_ENTRY') {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Endpoint para obtener un empleado específico por su ID
router.get("/Id_Empleado/:Id_Empleado", async (req, res) => {
  try {
    const empleadoId = req.params.Id_Empleado;
    // Consulta SQL para seleccionar un empleado por su ID
    const query = `
      SELECT tbl_empleado.*, tbl_estado_civil.*, tbl_genero.*, tbl_telefono_empleado.*, tbl_tipo_telefono.*, 
      tbl_tipo_telefono.Descripcion AS Tipo_telefono, 
      tbl_telefono_empleado.Numero AS Numero_contacto, 
      tbl_estado_civil.Estado_civil AS Estado_Civil, 
      tbl_genero.Nombre_Genero AS Genero 
            FROM tbl_empleado 
                INNER JOIN tbl_estado_civil ON tbl_empleado.Id_EstadoCivil = tbl_estado_civil.Id_EstadoCivil 
                INNER JOIN tbl_genero ON tbl_empleado.Id_Genero = tbl_genero.Id_Genero 
                INNER JOIN tbl_telefono_empleado ON tbl_empleado.Id_Empleado = tbl_telefono_empleado.Id_empleado 
                INNER JOIN tbl_tipo_telefono ON tbl_telefono_empleado.Id_tipo_telefono = tbl_tipo_telefono.Id_tipo_telefono 
                WHERE tbl_empleado.Id_Empleado = ?
  `;

    // Ejecutar la consulta SQL con el ID del usuario como parámetro
    db.query(query, empleadoId, (err, data) => {
      if (err) {
        console.error("Error al obtener empleado por ID:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
      }
      if (data.length === 0) {
        // Manejar el caso en que no se encuentre ningún empleado con el ID proporcionado
        return res.status(404).json({ error: "Empleado no encontrado" });
      }
      return res.json(data[0]);
    });
  } catch (error) {
    console.error("Error al obtener empleado por ID:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Endpoint para actualizar un empleado
async function actualizarEmpleadoYTelefono(
  Id_Empleado,
  Id_Estado,
  Id_Genero,
  Id_EstadoCivil,
  Id_tipo_telefono,
  Nombre,
  Apellido,
  Dni,
  Direccion_vivienda,
  Salario,
  Numero,
  Modificado_por
) {
  return new Promise((resolve, reject) => {
    db.beginTransaction(async (err) => {
      if (err) {
        return reject(err);
      }

      try {
        // Actualizar en tbl_empleado
        const empleadoQuery =
          "UPDATE tbl_empleado SET Id_Estado =?,Id_Genero =? ,Id_EstadoCivil= ? ,Nombre = ?, Apellido = ?, Dni = ? ,Direccion_vivienda = ?, Salario = ?, Modificado_por = ?, Fecha_modificacion = CURRENT_TIMESTAMP WHERE Id_empleado = ?";
        await executeQuery(empleadoQuery, [
          Id_Estado,
          Id_Genero,
          Id_EstadoCivil,
          Nombre,
          Apellido,
          Dni,
          Direccion_vivienda,
          Salario,
          Modificado_por,
          Id_Empleado,
        ]);

        // Actualizar en tbl_telefono_empleado
        const telefonoQuery =
          "UPDATE tbl_telefono_empleado SET Id_tipo_telefono= ? , Numero = ?, Modificado_por = ?, Fecha_modificacion = CURRENT_TIMESTAMP WHERE Id_empleado = ?";
        await executeQuery(telefonoQuery, [
          Id_tipo_telefono,
          Numero,
          Modificado_por,
          Id_Empleado,
        ]);

        db.commit((err) => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      } catch (error) {
        db.rollback(() => {
          reject(error);
        });
      }
    });
  });
}

router.put("/editarEmpleado/:Id_Empleado", async (req, res) => {
  try {
    const Id_Empleado = req.params.Id_Empleado;
    const {
      Id_Estado,
      Id_Genero,
      Id_EstadoCivil,
      Id_tipo_telefono,
      Nombre,
      Apellido,
      Dni,
      Direccion_vivienda,
      Salario,
      Numero,
      Modificado_por,
    } = req.body;

    await actualizarEmpleadoYTelefono(
      Id_Empleado,
      Id_Estado,
      Id_Genero,
      Id_EstadoCivil,
      Id_tipo_telefono,
      Nombre,
      Apellido,
      Dni,
      Direccion_vivienda,
      Salario,
      Numero,
      Modificado_por
    );

    registrarEnBitacora(
      7,
      "Editar empleado",
      `Se editó al empleado con ID ${Id_Empleado}.`
    );

    return res.json({ message: "Empleado actualizado correctamente" });
  } catch (error) {
    console.error("Error al editar empleado:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Endpoint para eliminar-deshabilitar un empleado por su ID
router.put("/deshabilitarEmpleado/:Id_Empleado", async (req, res) => {
  try {
    const empleadoId = req.params.Id_Empleado;

    const query = `
        UPDATE tbl_empleado 
        SET Id_Estado = 0
        WHERE Id_Empleado = ?`;

    db.query(query, [empleadoId], (err, result) => {
      if (err) {
        console.error("Error al eliminar empleado:", err);
        return res
          .status(500)
          .json({ error: "Error al eliminar empleado en la base de datos" });
      }
      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ error: "Empleado no encontrado para eliminar" });
      }

      registrarEnBitacora(
        8,
        "Deshabilitar empleado",
        `Se deshabilitó el empleado con ID ${empleadoId}`
      );

      return res.json({ message: "Empleado eliminado correctamente" });
    });
  } catch (error) {
    console.error("Error al eliminar empleado:", error);
    return res
      .status(500)
      .json({ error: "Error al eliminar empleado en la base de datos" });
  }
});

//SELECT A OTROS DATOS DE OTRAS TABLAS NECESARIAS PARA EL CRUD EMPLEADO

// Endpoint para obtener estado civil

router.get("/obtenerEstadoCivil", (req, res) => {
  const query = "SELECT * FROM tbl_estado_civil";
  db.query(query, (err, data) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json(data);
  });
});

// Endpoint para obtener telefono del empleado
router.get("/obtenerTelefono", (req, res) => {
  const query = "SELECT * FROM tbl_telefono_empleado";
  db.query(query, (err, data) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json(data);
  });
});

// Endpoint para obtener Genero del Empleado
router.get("/obtenerGenero", (req, res) => {
  const query = "SELECT * FROM tbl_genero";
  db.query(query, (err, data) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json(data);
  });
});

router.get("/obtenerEstado", (req, res) => {
  const query = "SELECT * FROM tbl_estado";
  db.query(query, (err, data) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json(data);
  });
});

router.get("/obtenerTipoTelefono", (req, res) => {
  const query = "SELECT * FROM tbl_tipo_telefono";
  db.query(query, (err, data) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json(data);
  });
});
export default router;
