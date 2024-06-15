import express from "express";
import db from "./index.js";
import cors from "cors";

const app = express();
app.use(cors());
// Puerto del servidor
const port = 3001;
// Puerto del servidor
app.listen(port, () => {
    console.log(`Servidor backend conectado en el puerto ${port}`);
});


// Traer datos de la tabla tbl_ms_usuario
app.get("/obtenerPuestos", (req, res) => {
    const query = 'SELECT Nombre_puesto FROM tbl_puesto';
    db.query(query, (err, data) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.json(data);
    });
  });
  