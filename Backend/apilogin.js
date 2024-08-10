import express from "express";
import db from "./index.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

import { setUserIdLoggedIn, registrarEnBitacora } from "./userSession.js";

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
// **Inicio de sesión**
router.post("/iniciodesesio/iniciarSesion", async (req, res) => {
  try {
    const { Usuario, Contraseña } = req.body;

    if (!Usuario || !Contraseña) {
      return res.status(400).json({ error: "Nombre de usuario o contraseña vacíos" });
    }

    const query = `
    SELECT 
      tbl_ms_usuario.*, 
      tbl_ms_rol.Rol, 
      tbl_empleado.Id_Estado, 
      tbl_ms_usuario.Primer_ingreso,
      tbl_departamento.Id_departamento,
      tbl_departamento.Nombre_departamento
    FROM 
      tbl_ms_usuario 
      INNER JOIN tbl_ms_rol ON tbl_ms_usuario.Id_Rol = tbl_ms_rol.Id_Rol  
      INNER JOIN tbl_empleado ON tbl_ms_usuario.Id_Empleado = tbl_empleado.Id_Empleado
      INNER JOIN tbl_puesto ON tbl_ms_usuario.Id_Puesto = tbl_puesto.Id_Puesto
      INNER JOIN tbl_puesto_departamento ON tbl_puesto.Id_Puesto = tbl_puesto_departamento.Id_puesto
      INNER JOIN tbl_departamento ON tbl_puesto_departamento.Id_departamento = tbl_departamento.Id_departamento
    WHERE 
      tbl_ms_usuario.Usuario = ?
    `;

    db.query(query, [Usuario], async (err, data) => {
      if (err) {
        console.error("Error al buscar usuario:", err);
        return res.status(500).json({ error: "Error al iniciar sesión" });
      }

      if (data.length === 0) {
        return res.status(401).json({ error: "Usuario no encontrado o inactivo" });
      }

      const usuario = data[0];

      // Verificar el Id_Estado
      
      if (usuario.Id_Estado === 3) {
        return res.status(403).json({ error: "Usuario bloqueado" });
      }
      if (usuario.Id_Estado === 6) {
        return res.status(403).json({ error: "Usuario Pendiente de confirmar" });
      }
      if (usuario.Id_Estado !== 1) {
        return res.status(403).json({ error: "Usuario no autorizado para iniciar sesión" });
      }

      const contraseñaValida = await bcrypt.compare(Contraseña, usuario.Contraseña);

      if (!contraseñaValida) {
        return res.status(401).json({ error: "Contraseña incorrecta" });
      }

      setUserIdLoggedIn(usuario.Id_usuario);

      registrarEnBitacora(2, "Inicio sesión", "El usuario inicio sesión de manera correcta.");
      registrarEnBitacora(1, "Entró a Inicio", "El usuario está en el inicio del sistema.");

      return res.json({
        message: "Inicio de sesión correcto",
        usuario: usuario,
        rol: usuario.Rol,
        Id_Empleado: usuario.Id_Empleado,
        Id_usuario: usuario.Id_usuario,
        Primer_ingreso: usuario.Primer_ingreso
      });
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return res.status(500).json({ error: "Error al iniciar sesión" });
  }
});


router.post("/registro/registrarUsuario", async (req, res) => {
  try {
    // Obtener los datos del usuario del cuerpo de la solicitud
    const {
      Id_Rol,
      Id_Puesto,
      Usuario,
      Nombre_Completo_Usuario,
      contraseña,
      Primer_ingreso,
      Fecha_Ultima_Conexion,
      Correo_electronico,
      Fecha_vencimiento,
      Creado_por,
      Modificado_por,
      Fecha_creacion,
      Fecha_modificacion,
      Dni,
    } = req.body;
      // Encriptar la contraseña
      const Contraseña = await bcrypt.hash(contraseña, saltRounds);
    // Verificar si el empleado existe en la base de datos
    const empleadoQuery = `SELECT Id_Empleado FROM tbl_empleado WHERE Dni = ? AND Id_Estado = 1`;
    db.query(empleadoQuery, [Dni], async (err, empleadoData) => {
      if (err) {
        console.error("Error al verificar empleado:", err);
        return res.status(500).json({ error: "Error al registrar usuario" });
      }

      // Si el empleado no existe, retornar un error
      if (empleadoData.length === 0) {
        return res.status(404).json({ error: "El empleado no existe" });
      }

      const Id_Empleado = empleadoData[0].Id_Empleado;

      
      // Crea la consulta SQL para insertar el nuevo usuario
      const query = `INSERT INTO tbl_ms_usuario (Id_Rol, Id_Puesto, Id_Empleado, Usuario, Nombre_Completo_Usuario, Contraseña, Primer_ingreso, Fecha_Ultima_Conexion, Correo_electronico, Fecha_vencimiento, Creado_por, Modificado_por, Fecha_creacion, Fecha_modificacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;

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
          Primer_ingreso,
          Fecha_Ultima_Conexion,
          Correo_electronico,
          Fecha_vencimiento,
          Creado_por,
          Modificado_por,
          Fecha_creacion,
          Fecha_modificacion,
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
            subject: '¡Bienvenido a nuestra aplicación! ',
            text: `Hola ${Nombre_Completo_Usuario}, su solicitud de autoregistro esta siendo procesada.  Tu usuario es: ${Usuario} y tu contraseña actual es: ${contraseña}. `
          });

          // Registro en la bitácora después de crear el usuario
          registrarEnBitacora(
            3,
            "Autoregistro",
            "El usuario se registró desde autoregistro"
          );

          // Si el usuario se registra correctamente, devolver un mensaje de éxito
          return res.json({ message: "Usuario registrado correctamente" });
        }
      );
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return res.status(500).json({ error: "Error al registrar usuario" });
  }
});

// Endpoint para notificacion codigo de verificacion de correo para editar la contraseña de un usuario

router.post("/kevinputa/:Usuario", async (req, res) => {
  const { Usuario } = req.params;

  console.log("Usuario recibido en el backend:", Usuario);

  if (!Usuario) {
    return res.status(400).json({ error: 'Usuario no proporcionado' });
  }

  try {
    // Verificar si el usuario existe en la base de datos
    const usuarioQuery = 'SELECT Id_usuario, Correo_electronico FROM tbl_ms_usuario WHERE Usuario = ?';
    db.query(usuarioQuery, [Usuario], async (err, data) => {
      if (err) {
        console.error('Error al verificar usuario existente:', err);
        return res.status(500).json({ error: 'Error al recuperar usuario' });
      }

      if (data.length === 0) {
        return res.status(404).json({ error: 'El usuario no existe' });
      }

      const { Id_usuario, Correo_electronico } = data[0];

      // Generar un código de 8 dígitos
      const codigoRecuperacion = (Math.floor(10000000 + Math.random() * 90000000)).toString();

      // Encriptar el código de recuperación usando bcrypt
      const hashedCodigoRecuperacion = await bcrypt.hash(codigoRecuperacion, saltRounds);

      // Envía el correo electrónico al usuario
      await transporter.sendMail({
        from: 'ConsisaH@gmail.com',
        to: Correo_electronico,
        subject: 'Recuperación de Contraseña',
        text: `Hola, tu usuario es: ${Usuario} y tu código de recuperación es: ${codigoRecuperacion}`
      });

      // Devolver el ID del usuario y el código de recuperación en la respuesta
      return res.json({
        message: 'Correo de recuperación enviado correctamente',
        id: Id_usuario,
        codigoRecuperacion: codigoRecuperacion // Solo para fines de prueba; no se debe enviar en producción
      });
    });
  } catch (error) {
    console.error('Error al recuperar usuario:', error);
    return res.status(500).json({ error: 'Error al recuperar usuario' });
  }
});



// Endpoint para actualizar la contraseña de un usuario
router.put("/editarUsuarioContra/:id_usuario", async (req, res) => {
  try {
      const userId = req.params.id_usuario;
      const {Contraseña} = req.body;

      // Verificar que la contraseña no esté vacía
      if (!Contraseña) {
          return res.status(400).json({ error: "La contraseña no puede estar vacía" });
      }

      // Encriptar la contraseña con bcrypt
      const hashedPassword = await bcrypt.hash(Contraseña, 10);

      // Obtener la fecha y hora actual
      const currentDate = new Date();
      
      // Construir la consulta SQL de actualización
      const query = `
          UPDATE tbl_ms_usuario 
          SET  
              Contraseña = ?, 
              Primer_ingreso = ? 
          WHERE Id_usuario = ?`;  

      // Ejecutar la consulta SQL
      db.query(
          query,
          [ 
              hashedPassword, // Contraseña encriptada
              currentDate, // Fecha y hora actual
              userId // Pasar el ID del usuario como parámetro en la consulta
          ],
          (err, data) => {
              if (err) {
                  console.error("Error al actualizar contraseña:", err);
                  return res.status(500).json({ error: "Error al actualizar contraseña en la base de datos" });
              }

              return res.json({ message: "Contraseña actualizada correctamente" });
          }
      );
  } catch (error) {
      console.error("Error al editar contraseña:", error);
      return res.status(500).json({ error: "Error al editar contraseña en la base de datos" });
  }
});
export default router;
