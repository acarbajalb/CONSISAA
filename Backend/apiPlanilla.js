import express from "express";
import db from "./index.js"; 
import { registrarEnBitacora } from './userSession.js';


const router = express.Router();
//endpoint traer planillas
router.get("/traerPlanillas", (req, res) => {
    const query = 'SELECT * FROM tbl_planilla';
    db.query(query, (err, data) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      registrarEnBitacora( 144, "Obtener Planillas", "Se obtuvo el historial de las Planillas");

      return res.json(data);
    });
});

//endpoint Planilla especifica
router.get("/idPlanilla/:id_planilla", async (req, res) => {
    try {
      const planillaId = req.params.id_planilla;
  
      const query = 'SELECT * FROM tbl_planilla WHERE Id_Planilla = ?';
  
      db.query(query, planillaId, (err, data) => {
        if (err) {
          console.error("Error al obtener planilla por ID:", err);
          return res.status(500).json({ error: "Error interno del servidor" });
        }
        if (data.length === 0) {
          return res.status(404).json({ error: "Planilla no encontrada" });
        }
        return res.json(data[0]);
      });
    } catch (error) {
      console.error("Error al obtener planilla por ID:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  //endpoint actualizar planilla
  router.put("/editarPlanilla/:id_planilla", async (req, res) => {
    try {
      const planillaId = req.params.id_planilla;
      const {
        Id_Tipo_De_Planilla,
        Id_Empleado,
        Id_Deducciones,
        Salario
       
      } = req.body;
  
      const query = `
        UPDATE tbl_planilla 
        SET 
            Id_Tipo_De_Planilla=?,
            Id_Empleado=?, 
            Id_Deducciones=?,
            Salario=?
            
        WHERE Id_Planilla = ?`;
  
      db.query(
        query,
        [
          Id_Tipo_De_Planilla,
          Id_Empleado,
          Id_Deducciones,
          Salario,
          
          planillaId
        ],
        (err, data) => {
          if (err) {
            console.error("Error al actualizar planilla:", err);
            return res.status(500).json({ error: "Error al actualizar planilla en la base de datos" });
          }
          registrarEnBitacora( 144, "Editar planilla", "Se edito la planilla");

          return res.json({ message: "Planilla actualizada correctamente" });
        }
      );
    } catch (error) {
      console.error("Error al editar planilla:", error);
      return res.status(500).json({ error: "Error al editar planilla en la base de datos" });
    }
  });
  

export default router;