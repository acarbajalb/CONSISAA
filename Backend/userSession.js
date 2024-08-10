import db from "./index.js";
let userIdLoggedIn = null;

const setUserIdLoggedIn = (userId) => {
  userIdLoggedIn = userId;
};

const getUserIdLoggedIn = () => {
  return userIdLoggedIn;
};

// Función para registrar una acción en la tabla de bitácora
const registrarEnBitacora = (objectId, action, description) => {
    const fecha = new Date().toISOString().slice(0, 19).replace('T', ' '); // Obtener la fecha actual en formato YYYY-MM-DD HH:MM:SS
    const query = "INSERT INTO tbl_ms_bitacora (Id_usuario, Id_Objeto, Fecha, Accion, Descripcion) VALUES (?, ?, ?, ?, ?)";
    db.query(query, [getUserIdLoggedIn(), objectId, fecha, action, description], (err, result) => {
        if (err) {
            console.error("Error al registrar en la bitácora:", err);
        }
    });
  };

  export { setUserIdLoggedIn, getUserIdLoggedIn, registrarEnBitacora };

