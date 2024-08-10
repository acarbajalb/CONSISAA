import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './recuperacionContraseña.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import VerificarCorreo from './VerificarCorreo'; // Importar el modal

function RecuperacionContraseña() {
  const [userId, setUserId] = useState(null); // Estado para almacenar el ID del usuario
  const [codigoRecuperacion, setCodigoRecuperacion] = useState(''); // Estado para almacenar el código de recuperación
  const [user, setUser] = useState('');
  const [usererror, setUserError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar la visibilidad del modal
  

  const handleSubmitValidacion = async (e) => {
    e.preventDefault();

    if (!user.trim()) {
      setUserError(true);
      return;
    }


    try {
      const response = await fetch(`http://localhost:3001/kevinputa/${encodeURIComponent(user)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Correo enviado',
          text: 'Se ha enviado un correo de recuperación a su dirección de correo electrónico.'
        });
        setIsModalOpen(true); // Mostrar el modal
      } else {
        throw new Error(result.error || 'Error al enviar el correo de recuperación');
      }

      // Almacenar el ID del usuario y el código de recuperación
      setUserId(result.id);
      setCodigoRecuperacion(result.codigoRecuperacion); // Nota: No enviar esto en producción

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message
      });
    }

    setUser('');
    setUserError(false);
  };

  const handleChange = (e) => {
    let value = e.target.value;

    // Eliminar un mismo caracter más de dos veces seguidas
    value = value.replace(/(.)\1{2,}/g, '$1$1');

    // Eliminar todos los espacios
    value = value.replace(/\s/g, '');

    setUser(value);
  };

  const handleCP = (e) => {
    e.preventDefault();
  };
  

  return (
    <div className="formulario">
      <h1>Recuperación de Contraseña</h1>
      <p>Ingrese su usuario para recibir notificación por correo electrónico:</p>
      <form onSubmit={handleSubmitValidacion}>
        <input
          type="text"
          name="user"
          maxLength="50"
          placeholder="Usuario"
          value={user}
          required
          onChange={handleChange}
          onCopy={handleCP}
          onCut={handleCP}
          onPaste={handleCP}
        />
        {usererror && (
          <div className="error-message">
            <FontAwesomeIcon icon={faExclamationTriangle} className="error-icon" />
            <span className="error-text">Por favor, ingrese su usuario.</span>
          </div>
        )}
        <button type="submit" style={{marginTop:"20px"}}>Enviar</button>
      </form>

      <VerificarCorreo
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        codigoRecuperacion={codigoRecuperacion}
        idUsuario={userId} // Pasar el ID de usuario a VerificarCorreo
      />
    </div>
  );
}
export default RecuperacionContraseña;
