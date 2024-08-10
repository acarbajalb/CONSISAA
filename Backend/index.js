
//si tienen problemas de authentication con la base de datos, usen el codigo de abajo en su linea de comandos
//ALTER USER "root"@"localhost" IDENTIFIED WITH mysql_native_password BY "1234proyecto_";

import mysql from "mysql2";
import express from "express";
import cors from 'cors';
import apiRoutes from "./apiRoutes.js";
import apilogin from "./apilogin.js";
import apiDeducciones from "./apiDeducciones.js"
import apiSolicitudes from "./apiSolicitudes.js"
import apiPlanilla from "./apiPlanilla.js"
import apiEmpleado from "./apiEmpleado.js"
import apiParametro from "./apiParametro.js"
import apiBitacora from "./apiBitacora.js"
import apiPermisos from "./apiPermisos.js"
import apiContrato from "./apiContrato.js"
import apiDepartamento from "./apiDepartamento.js"
import apiArea from "./apiArea.js"
import apiGenero from "./apiGenero.js"
import apiEstadoCivil from "./apiEstadoCivil.js"
import apiTipoTelefono from "./apiTipoTelefono.js"
import apiEstado from "./apiEstado.js"
import apiPuesto from './apiPuesto.js'
import apiPerfildeusuario from './apiPerfildeusuario.js'
import apiRol from './apiRol.js'
import apiBackupRestore from './apiBackupRestore.js'

// Conexión a la base de datos
const db = mysql.createConnection({
  host: "localhost",
  user: "root",  
  password: "", 
  database: "consisa",
});

// Manejo de eventos de conexión a la base de datos
db.connect((err) => {
  if (err) {
    console.error("Error al conectar a la base de datos:", err.message);
    return;
  }
  console.log("Conexión exitosa a la base de datos");
});

// Manejo de errores en la conexión
db.on("error", (err) => {
  console.error("Error en la conexión a la base de datos:", err.message);
});


const app = express();

app.use(express.json());
app.use(cors());

// Usa las rutas definidas en apiRoutes.
app.use(apiRoutes,
  apilogin,
  apiDeducciones,
  apiSolicitudes, 
  apiEmpleado, 
  apiParametro, 
  apiPlanilla, 
  apiBitacora, 
  apiPermisos, 
  apiContrato, 
  apiDepartamento,
  apiGenero,
  apiArea,
  apiEstadoCivil,
  apiTipoTelefono,
  apiEstado,
  apiPerfildeusuario,
  apiPuesto,
  apiRol,
  apiBackupRestore
);

const port = 3001;

app.listen(port, () => {
  console.log(`Servidor backend conectado en el puerto ${port}`);
});


export default db;