import express from "express";
import db from "./index.js"; 
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { registrarEnBitacora } from './userSession.js';

const saltRounds = 10;
const router = express.Router();

// Configuración del transporter para nodemailer
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: 'ConsisaH@gmail.com',
    pass: 'nKDN07wZL3JPM5F9'
  }
});

router.post("/creacionUsuario", async (req, res) => {
  try {
    // Obtener datos del cuerpo de la solicitud
    const { 
      Id_Rol,
      Id_Puesto,
      Usuario,
      Nombre_Completo_Usuario,
      contraseña,
      Correo_electronico,
      Fecha_vencimiento,
      Creado_por,
      Modificado_por,
      Dni
    } = req.body;

    // Encriptar la contraseña
    const Contraseña = await bcrypt.hash(contraseña, saltRounds);

    // Verificar si el usuario ya existe en la base de datos
    const usuarioExistenteQuery = `SELECT * FROM tbl_ms_usuario WHERE Usuario = ? `;
    db.query(usuarioExistenteQuery, [Usuario], async (err, data) => {
      if (err) {
        console.error("Error al verificar usuario existente:", err);
        return res.status(500).json({ error: "Error al registrar usuario" });
      }

      // Si el usuario ya existe, retornar un error
      if (data.length > 0) {
        return res.status(409).json({ error: "El usuario ya existe" });
      }

      // Verificar si el empleado existe en la base de datos y está activo
      const empleadoQuery = `SELECT Id_Empleado FROM tbl_empleado WHERE Dni = ? AND Id_Estado = 1`;
      db.query(empleadoQuery, [Dni], async (err, empleadoData) => {
        if (err) {
          console.error("Error al verificar empleado:", err);
          return res.status(500).json({ error: "Error al registrar usuario" });
        }

        // Si el empleado no existe o no está activo, retornar un error
        if (empleadoData.length === 0) {
          return res.status(404).json({ error: "El empleado no existe o no está activo" });
        }

        const Id_Empleado = empleadoData[0].Id_Empleado;

        // Obtener el nombre del jefe del puesto
        const nombreJefeQuery = `SELECT Nombre_Completo_Usuario FROM tbl_ms_usuario WHERE Id_Puesto = (SELECT Id_Jefe FROM tbl_puesto WHERE Id_Puesto = ?)`;
        db.query(nombreJefeQuery, [Id_Puesto], async (err, jefeData) => {
          if (err) {
            console.error("Error al obtener el nombre del jefe:", err);
            return res.status(500).json({ error: "Error al registrar usuario" });
          }

          const nombreJefe = jefeData.length > 0 ? jefeData[0].Nombre_Completo_Usuario : 'No se encontró un jefe asignado';

          // Crear la consulta SQL para insertar el nuevo usuario
          const query = `INSERT INTO tbl_ms_usuario (Id_Rol, Id_Puesto, Id_Empleado, Usuario, Nombre_Completo_Usuario, Contraseña, Correo_electronico, Fecha_vencimiento, Creado_por, Modificado_por, Fecha_creacion, Fecha_modificacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;

          // Ejecutar la consulta
          db.query(
            query,
            [
              Id_Rol,
              Id_Puesto,
              Id_Empleado,
              Usuario,
              Nombre_Completo_Usuario,
              Contraseña,
              Correo_electronico,
              Fecha_vencimiento,
              Creado_por,
              Modificado_por
            ],
            async (err, result) => {
              if (err) {
                console.error("Error al registrar nuevo usuario:", err);
                return res.status(500).json({ error: "Error al registrar usuario" });
              }

              // Envía el correo electrónico al nuevo usuario
              await transporter.sendMail({
                from: 'ConsisaH@gmail.com',
                to: Correo_electronico,
                subject: 'Bienvenido a la aplicación',
                text: `Hola ${Nombre_Completo_Usuario}, ¡Bienvenido a nuestra aplicación! Tu usuario es: ${Usuario} y tu contraseña es: ${contraseña}. Tu jefe es: ${nombreJefe}`
              });

              // Si el usuario se registra correctamente, devolver un mensaje de éxito
              return res.json({ message: "Usuario registrado correctamente" });
            }
          );
        });
      });
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return res.status(500).json({ error: "Error al registrar usuario" });
  }
});


// Endpoint para obtener usuarios
router.get("/traerUsuarios", (req, res) => {
  const query = 'SELECT usuario.*, estado.*, puesto.Nombre_puesto FROM tbl_ms_usuario usuario INNER JOIN tbl_empleado emp ON usuario.Id_Empleado = emp.Id_Empleado INNER JOIN tbl_estado estado ON emp.Id_Estado = estado.Id_Estado INNER JOIN tbl_puesto puesto ON usuario.Id_Puesto=puesto.Id_Puesto ORDER BY usuario.Fecha_modificacion DESC;';
  db.query(query, (err, data) => {
      if (err) {
          return res.status(500).json({ error: err.message });
      }
      // Registro en la bitácora después de obtener usuarios
      registrarEnBitacora( 9, "Obtener Usuarios", "Se obtuvieron los usuarios");

      return res.json(data);
  }); 
});

router.put("/ultimaVezConectado/:Id_usuario", (req, res) => {
  try {
    const Id_usuario = req.params.Id_usuario;
    const empleadoQuery = `UPDATE tbl_ms_usuario SET Fecha_ultima_conexion = CURRENT_TIMESTAMP WHERE Id_usuario = ?`;
    
    // Ejecutar la consulta SQL para actualizar la fecha de última conexión
    db.query(empleadoQuery, [Id_usuario], (error, result) => {
      if (error) {
        console.error("Error al actualizar la fecha de última conexión:", error);
        res.status(500).send("Error interno del servidor");
      } else {
        //console.log("Fecha de última conexión actualizada correctamente");
        res.status(200).send("Fecha de última conexión actualizada correctamente");
      }
    });
  } catch (error) {
    console.error("Error al actualizar la fecha de última conexión:", error);
    res.status(500).send("Error interno del servidor");
  }
});


// Endpoint para obtener un usuario específico por su ID
router.get("/idUsuario/:id_usuario", async (req, res) => {
  try {
    const userId = req.params.id_usuario;

    // Consulta SQL para seleccionar un usuario por su ID
    const query = ' SELECT   usuario.*, emp.Id_Estado FROM tbl_ms_usuario usuario  INNER JOIN tbl_empleado emp  ON usuario.Id_Empleado = emp.Id_Empleado WHERE usuario.Id_usuario = ?';

    // Ejecutar la consulta SQL con el ID del usuario como parámetro
    db.query(query, userId, (err, data) => {
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

// Endpoint para actualizar un usuario
router.put("/editarUsuario/:id_usuario", async (req, res) => {
  try {
    const userId = req.params.id_usuario;
    const { 
      Id_Rol,
      Id_Puesto,
      Usuario,
      Nombre_Completo_Usuario,
      Contraseña,
      Correo_electronico,
      Modificado_por
    } = req.body;

    // Construir la consulta SQL de actualización
    const query = `
      UPDATE tbl_ms_usuario 
      SET  
          Id_Rol=?, 
          Id_Puesto=?,
          Usuario = ?, 
          Nombre_Completo_Usuario = ?, 
          Contraseña = ?, 
          Correo_electronico = ?,
          Modificado_por=?,
          Fecha_modificacion=CURRENT_TIMESTAMP
      WHERE Id_usuario = ?`; // Usar el ID del usuario en la cláusula WHERE

    // Ejecutar la consulta SQL
    db.query(
      query,
      [ 
        Id_Rol,
        Id_Puesto,
        Usuario,
        Nombre_Completo_Usuario,
        Contraseña,
        Correo_electronico,
        Modificado_por,
        userId // Pasar el ID del usuario como parámetro en la consulta
      ],
      (err, data) => {
        if (err) {
          console.error("Error al actualizar usuario:", err);
          return res.status(500).json({ error: "Error al actualizar usuario en la base de datos" });
        }

        // Registro en la bitácora después de editar el usuario
        registrarEnBitacora(userId, 11, "Editar Usuario", `Se editó al usuario con ID ${userId}`);

        return res.json({ message: "Usuario actualizado correctamente" });
      }
    );
  } catch (error) {
    console.error("Error al editar usuario:", error);
    return res.status(500).json({ error: "Error al editar usuario en la base de datos" });
  }
});



//SELECT A OTROS DATOS DE OTRAS TABLAS NECESARIAS PARA EL CRUD USUARIO

// Endpoint para obtener roles
router.get("/obtenerRoles", (req, res) => {
  const query = 'SELECT Id_Rol, Rol FROM tbl_ms_rol';
  db.query(query, (err, data) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json(data);
  });});


// Endpoint para obtener puestos
router.get("/obtenerPuestos", (req, res) => {
const query = 'SELECT Id_Puesto, Nombre_puesto FROM tbl_puesto'; // Modificado para seleccionar Id_puesto junto con Nombre_puesto
db.query(query, (err, data) => {
  if (err) {
    return res.status(500).json({ error: err.message });
  }
  return res.json(data);
});
});


// Endpoint para obtener el nombre del puesto por su ID
router.get("/obtenerNombrePuesto/:idPuesto", (req, res) => {
  try {
    const idPuesto = req.params.idPuesto;

    // Consulta SQL para obtener el nombre del puesto por su ID
    const query = 'SELECT Nombre_puesto FROM tbl_puesto WHERE Id_Puesto = ?';

    // Ejecutar la consulta SQL con el ID del puesto como parámetro
    db.query(query, idPuesto, (err, data) => {
      if (err) {
        console.error("Error al obtener nombre del puesto:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
      }
      if (data.length === 0) {
        // Si no se encuentra ningún puesto con el ID proporcionado, devolver una respuesta indicando que no se encontró
        return res.status(404).json({ error: "Puesto no encontrado" });
      }
      // Devolver el nombre del puesto en formato JSON
      return res.json(data[0].Nombre_puesto);
    });
  } catch (error) {
    console.error("Error al obtener nombre del puesto:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Endpoint para obtener el nombre y apellido de un empleado por su DNI
router.get("/obtenerNombreApellido/:Dni", (req, res) => {
  try {
    const Dni = req.params.Dni;

    // Consulta SQL para obtener el nombre y apellido del empleado por su DNI
    const query = 'SELECT CONCAT(Nombre, " ", Apellido) AS NombreCompleto FROM tbl_empleado WHERE Dni = ?';

    // Ejecutar la consulta SQL con el DNI del empleado como parámetro
    db.query(query, Dni, (err, data) => {
      if (err) {
        console.error("Error al obtener nombre y apellido:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
      }
      if (data.length === 0) {
        // Si no se encuentra ningún empleado con el DNI proporcionado, devolver una respuesta indicando que no se encontró
        return res.status(404).json({ error: "Empleado no encontrado" });
      }
      // Devolver el nombre completo del empleado en formato JSON
      return res.json(data[0].NombreCompleto);
    });
  } catch (error) {
    console.error("Error al obtener nombre y apellido:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});



router.get("/buscarPuestoPorNombre/:nombre", (req, res) => {
  try {
    const nombre = req.params.nombre;

    const empleadoQuery = `SELECT Id_Puesto, Nombre_puesto FROM tbl_puesto WHERE Nombre_puesto = ?`;
    db.query(empleadoQuery, [nombre], (err, puestoData) => {
      if (err) {
        console.error("Error al buscar puesto por nombre:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
      }

      if (puestoData.length === 0) {
        return res.status(404).json({ error: "No se encontró ningún puesto con ese nombre" });
      }

      const idPuesto = puestoData[0].Id_Puesto;
      const nombre= puestoData[0].Nombre_puesto;
      return res.json({ idPuesto, nombre});
    });
  } catch (error) {
    console.error("Error al buscar puesto por nombre:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;


