import express from "express";
import db from "./index.js"; 
import bcrypt from "bcrypt";
import { registrarEnBitacora } from './userSession.js';


const router = express.Router();


// Endpoint para crear un nuevo puesto
router.post("/creacionPuesto", async (req, res) => {
  try {
    // Obtener datos del cuerpo de la solicitud
    const { 
      Id_area,
      Id_departamento,
      Nombre_puesto,
      Descripcion_puesto,
      Salario_inicial,
      Techo_salario,
      Requisitos_puesto,
      Creado_por,
      Modificado_por,
      Id_Jefe // Agregamos el Id_Jefe al cuerpo de la solicitud
    } = req.body;

    // Validar que se haya proporcionado el Id_Jefe
    if (!Id_Jefe) {
      return res.status(400).json({ error: "Se requiere asignar un puesto jefe" });
    }

    // Crear la consulta SQL para insertar los datos en la tabla tbl_puesto
    const puestoQuery = `INSERT INTO tbl_puesto (
      Nombre_puesto,
      Descripcion_puesto,
      Salario_inicial,
      Techo_salario,
      Requisitos_puesto,
      Creado_por,
      Modificado_por,
      Id_Jefe,
      Fecha_creacion,
      Fecha_modificacion
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;

    // Ejecutar la consulta para insertar los datos del puesto
    db.query(
      puestoQuery,
      [
        Nombre_puesto,
        Descripcion_puesto,
        Salario_inicial,
        Techo_salario,
        Requisitos_puesto,
        Creado_por,
        Modificado_por,
        Id_Jefe
      ],
      async (err, result) => {
        if (err) {
          console.error("Error al registrar nuevo puesto:", err);
          return res.status(500).json({ error: "Error al registrar puesto" });
        }

        // Obtener el Id_puesto recién creado
        const Id_puesto = result.insertId;

        // Crear la consulta SQL para insertar los datos en la tabla tbl_puesto_departamento
        const puestoDepartamentoQuery = `INSERT INTO tbl_puesto_departamento (
          Id_puesto,
          Id_departamento,
          Id_area,
          Creado_por,
          Modificado_por,
          Fecha_creacion,
          Fecha_modificacion
        ) VALUES (?, ?, ?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`;

        // Ejecutar la consulta para insertar los datos en la tabla tbl_puesto_departamento
        db.query(
          puestoDepartamentoQuery,
          [Id_puesto, Id_departamento, Id_area, Creado_por, Modificado_por],
          async (err, result) => {
            if (err) {
              console.error("Error al asociar puesto con departamento:", err);
              return res.status(500).json({ error: "Error al asociar puesto con departamento" });
            }

            // Si todo se ejecuta correctamente, devolver un mensaje de éxito
            return res.json({ message: "Puesto creado correctamente" });
          }
        );
      }
    );
  } catch (error) {
    console.error("Error al crear puesto:", error);
    return res.status(500).json({ error: "Error al crear puesto" });
  }
});



// Endpoint para obtener Puestos y presentarlos en la tabla de mantenimiento Puestos.
router.get("/traerPuestos", (req, res) => {
  const query = `
    SELECT 
      p.*, 
      j.Nombre_Completo_Usuario AS Nombre_Jefe
    FROM 
      tbl_puesto p
    LEFT JOIN 
      tbl_ms_usuario j ON p.Id_Jefe = j.Id_Puesto
    ORDER BY 
      Fecha_modificacion DESC
  `;
  db.query(query, (err, data) => {
      if (err) {
          console.error("Error al obtener los puestos:", err);
          return res.status(500).json({ error: err.message });
      }
      return res.json(data);
  });
});

// Endpoint para actualizar un usuario
async function actualizarPuestoYDepartamento(Id_Puesto, Id_departamento, Nombre_puesto, Descripcion_puesto, Salario_inicial, Techo_salario, Requisitos_puesto, Modificado_por,Id_Jefe) {
  
  return new Promise((resolve, reject) => {
    db.beginTransaction(async (err) => {
      if (err) {
        return reject(err);
      }

      try {
        // Actualizar en tbl_puesto
        
        const puestoQuery = `
        
          UPDATE tbl_puesto
          SET  
            Nombre_puesto = ?,
            Descripcion_puesto = ?,
            Salario_inicial = ?,
            Techo_salario = ?,
            Requisitos_puesto = ?,
            Modificado_por = ?,
            Fecha_modificacion = CURRENT_TIMESTAMP,
            Id_Jefe = ?
          WHERE Id_Puesto = ?`;

        await executeQuery(puestoQuery, [Nombre_puesto, Descripcion_puesto, Salario_inicial, Techo_salario, Requisitos_puesto, Modificado_por, Id_Jefe, Id_Puesto]);

        // Actualizar en tbl_puesto_departamento
        const departamentoQuery = `
          UPDATE tbl_puesto_departamento
          SET Id_departamento = ?,
          Modificado_por = ?,
          Fecha_modificacion = CURRENT_TIMESTAMP
          WHERE Id_puesto = ?`;

        await executeQuery(departamentoQuery, [Id_departamento,Modificado_por, Id_Puesto]);

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

router.put("/editarPuesto/:Id_Puesto", async (req, res) => {
  try {
    const Id_Puesto = req.params.Id_Puesto;
    const { 
      Id_departamento,
      Nombre_puesto,
      Descripcion_puesto,
      Salario_inicial,
      Techo_salario,
      Requisitos_puesto,
      Modificado_por,
      Id_Jefe
    } = req.body;

    await actualizarPuestoYDepartamento(Id_Puesto, Id_departamento, Nombre_puesto, Descripcion_puesto, Salario_inicial, Techo_salario, Requisitos_puesto, Modificado_por, Id_Jefe);

    // registrarEnBitacora(11, "Editar Puesto", `Se editó al puesto con ID ${Id_Puesto}`);
      
    return res.json({ message: "Puesto actualizado correctamente" });
  } catch (error) {
    console.error("Error al editar puesto:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});



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


// Endpoint para obtener un usuario específico por su ID
router.get("/idPuesto/:Id_Puesto", async (req, res) => {
  try {
    const puestoId = req.params.Id_Puesto;

    // Consulta SQL para seleccionar un usuario por su ID
    const query = 'SELECT p.*, d.* FROM tbl_puesto AS p   INNER JOIN tbl_puesto_departamento AS pd ON p.Id_Puesto = pd.Id_Puesto   INNER JOIN tbl_departamento AS d ON pd.Id_Departamento = d.Id_Departamento WHERE p.Id_Puesto = ?';

    // Ejecutar la consulta SQL con el ID del usuario como parámetro
    db.query(query, puestoId, (err, data) => {
      if (err) {
        // Manejar el error si ocurre durante la ejecución de la consulta
        console.error("Error al obtener usuario por ID:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
      }
      if (data.length === 0) {
        // Manejar el caso en que no se encuentre ningún usuario con el ID proporcionado
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      // Devolver el primer usuario encontrado en formato JSON
      return res.json(data[0]);
    });
  } catch (error) {
    // Capturar y manejar cualquier error que ocurra durante el proceso
    console.error("Error al obtener usuario por ID:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});


// Endpoint para obtener Departamento
router.get("/obtenerDepartamento", (req, res) => {
  const query = 'SELECT * FROM tbl_departamento';
  db.query(query, (err, data) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json(data);
  });}); 


  router.get("/buscarDeptoPorNombre/:nombre", (req, res) => {
    try {
      const nombre = req.params.nombre;
   
      const empleadoQuery = `SELECT Id_departamento, Nombre_departamento FROM tbl_departamento WHERE Nombre_departamento = ?`;
      db.query(empleadoQuery, [nombre], (err, deptoData) => {
        if (err) {
          console.error("Error al buscar puesto por nombre:", err);
          return res.status(500).json({ error: "Error interno del servidor" });
        }
  
        if (deptoData.length === 0) {
          return res.status(404).json({ error: "No se encontró ningún puesto con ese nombre" });
        }
  
        const idDepto = deptoData[0].Id_departamento;
        const nombre= deptoData[0].Nombre_departamento;
        return res.json({ idDepto, nombre});
      });
    } catch (error) {
      console.error("Error al buscar puesto por nombre:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  });
export default router;



