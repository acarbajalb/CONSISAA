import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import './recuperacionContraseña.css';

function RecuperacionContraseña() {
  const [correo, setCorreo] = useState('');
  const [correoError, setCorreoError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!correo.trim()) {
      setCorreoError(true);
      return;
    }

    console.log('Correo electrónico:', correo);
    setCorreo('');
    setCorreoError(false);
  };

  return (
    <div className="formulario">
      <h1>Recuperación de Contraseña</h1>
      <p>Ingrese su correo electrónico para recibir notificación:</p>
      <form onSubmit={handleSubmit}>
      <input
          type="email"  // Cambiado a "email" para un campo de correo electrónico
          name="correo"
          placeholder="Correo electrónico"
          value={correo}
          onChange={(e) => {
            setCorreo(e.target.value);
            setCorreoError(false);
          }}
      />

        {correoError && (
          <div className="error-icon">
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <span className="error-message"> Ingrese un correo electrónico válido </span>
          </div>
        )}
        <br />
        <button type="submit" className="btn success">
          Recuperar
        </button>
      </form>
    </div>
  );
}

export default RecuperacionContraseña;
