import React from 'react';
import Swal from 'sweetalert2';
import "./backupRestore.css"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faUpload } from "@fortawesome/free-solid-svg-icons";

const BackupRestore = () => {
  const handleBackup = async () => {
    try {
      // Mostrar un cuadro de entrada para el nombre del backup
      const { value: backupName } = await Swal.fire({
        title: 'Ingrese el nombre del respaldo de la base de datos',
        input: 'text',
        inputPlaceholder: 'Nombre del Respaldo',
        showCancelButton: true,
        confirmButtonText: 'Crear Respaldo',
        cancelButtonText: 'Cancelar',
      });

      // Verificar si se ingresó un nombre
      if (backupName) {
        const response = await fetch(`http://localhost:3001/backup?name=${encodeURIComponent(backupName)}`);
        if (!response.ok) {
          throw new Error('No se pudo crear el respaldo');
        }
        const data = await response.json();
        Swal.fire('Éxito', data.message, 'success');
      } else {
        Swal.fire('Cancelado', 'Creación del respaldo de la base de datos cancelada', 'info');
      }
    } catch (error) {
      Swal.fire('Error', `No se pudo crear el respaldo de la base de datos: ${error.message}`, 'error');
    }
  };

  const handleRestore = async (event) => {
    event.preventDefault();
    const fileInput = event.target.elements.file;

    if (!fileInput.files.length) {
      Swal.fire('Error', 'Por favor seleccione el archivo de respaldo a restaurar', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    try {
      const response = await fetch('http://localhost:3001/restore', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('No se pudo restaurar el respaldo');
      }

      const data = await response.json();
      Swal.fire('Éxito', data.message, 'success');
    } catch (error) {
      Swal.fire('Error', `No se pudo restaurar el respaldo de la base de datos: ${error.message}`, 'error');
    }
  };

  return (
    <div data-maintenance-backup="true" className="backup-restore-container">
      <section className="formulario">
      <h1 className="mr-5 ml-5 mt-5">Respaldo y Restauración de Base de Datos</h1>

    

      <button onClick={handleBackup} style={{width:"300px", marginTop:"50px"}}>
          <FontAwesomeIcon icon={faDownload} /> Generar Respaldo de Base de datos
      </button>

      <form className="form-buttons" onSubmit={handleRestore} style={{marginTop:"50px", marginBottom:"50px"}}>
        <input type="file" name="file" 
        style={{
        borderRadius: "20px",
        background: "#999",
        color: "#fff",
        padding: "5px 30px",
        transform: "uppercase",
        margin: "0 10px",
        width:"500px"}} />
        <button type="submit" style={{width:"300px"}}>
        <FontAwesomeIcon icon={faUpload} /> Restaurar Base de Datos
        </button>
      </form>

      </section>
    </div>
  );
};

export default BackupRestore;
