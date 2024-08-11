import express from "express";
import path from "path";
import fs from "fs";
import fileUpload from "express-fileupload";
import mysql from "mysql2/promise"; // Importar mysql2
import { registrarEnBitacora } from "./userSession.js";

const router = express.Router();
router.use(fileUpload());

// Configurar la conexión a la base de datos
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'consisa'
};

// Directorio donde se guardarán los backups
const backupDir = path.join(path.resolve(), 'backups');

// Asegúrate de que el directorio de backups exista
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
}

// Endpoint para realizar el backup
router.get("/backup", async (req, res) => {
    try {
        const userProvidedName = req.query.name || 'backup';
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const backupFile = path.join(backupDir, `${userProvidedName}_${timestamp}.sql`);

        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.query(`SHOW TABLES`);

        const tables = rows.map(row => Object.values(row)[0]);
        const backupData = [];

        for (const table of tables) {
            const [createTable] = await connection.query(`SHOW CREATE TABLE ${table}`);
            backupData.push(`${createTable[0]['Create Table']};\n`);

            const [tableData] = await connection.query(`SELECT * FROM ${table}`);
            if (tableData.length > 0) {
                const columns = Object.keys(tableData[0]).join(', ');
                const values = tableData.map(row => {
                    return `(${Object.values(row).map(value => connection.escape(value)).join(', ')})`;
                }).join(',\n');

                backupData.push(`INSERT INTO ${table} (${columns}) VALUES\n${values};\n`);
            }
        }

        fs.writeFileSync(backupFile, backupData.join('\n'));

        await connection.end();
          
        registrarEnBitacora(189, "Copia de Respaldo", "Se realizo una copia de Respaldo de la base de datos del Sistema.");
        res.json({ message: `Copia de Respaldo realizada exitosamente: ${backupFile}` });
    } catch (error) {
        console.error('Error al crear la Copia de Respaldo:', error.message);
        res.status(500).json({ error: `Error al crear la Copia de Respaldo: ${error.message}` });
    }
});

// Endpoint para restaurar el backup
router.post("/restore", async (req, res) => {
    if (!req.files || !req.files.file) {
        return res.status(400).json({ error: 'No se ha enviado un archivo.' });
    }

    const backupFile = req.files.file;
    const restoreFilePath = path.join(backupDir, backupFile.name);

    try {
        // Guardar el archivo temporalmente
        backupFile.mv(restoreFilePath);

        const connection = await mysql.createConnection(dbConfig);
        let backupData = fs.readFileSync(restoreFilePath, 'utf-8');

        // Filtrar comentarios y comandos problemáticos
        backupData = backupData
            .split('\n')
            .filter(line => !line.startsWith('/*!') && !line.startsWith('--') && !line.startsWith('#'))
            .join('\n')
            .split(';')  // Dividir el archivo en consultas individuales
            .filter(query => query.trim().length > 0); // Eliminar consultas vacías

        // Deshabilitar claves foráneas
        await connection.query('SET FOREIGN_KEY_CHECKS=0;');

        // Obtener el nombre de todas las tablas existentes
        const [rows] = await connection.query(`SHOW TABLES`);
        const tables = rows.map(row => Object.values(row)[0]);

        // Eliminar todas las tablas existentes
        for (const table of tables) {
            await connection.query(`DROP TABLE IF EXISTS ${table}`);
        }

        // Ejecutar cada consulta individualmente
        for (const query of backupData) {
            await connection.query(query);
        }

        // Habilitar claves foráneas nuevamente
        await connection.query('SET FOREIGN_KEY_CHECKS=1;');

        await connection.end();
        await  registrarEnBitacora(190, "Restauró el Sistema", "Se realizo una restauración de la base de datos del Sistema.");
        res.json({ message: `Restauración realizada exitosamente desde: ${backupFile.name}` });
    } catch (error) {
        console.error('Error al restaurar el respaldo:', error.message);
        res.status(500).json({ error: `Error al restaurar el respaldo: ${error.message}` });
    }
});

export default router;
