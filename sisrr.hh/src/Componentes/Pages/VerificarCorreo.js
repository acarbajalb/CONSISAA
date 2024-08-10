import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './verificarCorreo.css';
import CambioContraseña from './CambioContraseña';

const VerificarCorreo = ({ isOpen, onClose, codigoRecuperacion, idUsuario }) => {
  const [codigo, setCodigo] = useState('');
  const [isCambioModalOpen, setIsCambioModalOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (codigo.length === 8) {

      if (codigo === codigoRecuperacion) {
        setIsCambioModalOpen(true);
        onClose(); // Cerrar el modal de verificación
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Código incorrecto',
          text: 'El código ingresado es incorrecto. Por favor, intente nuevamente.'
        });
      }
    } else {
      alert('Por favor, ingrese un código de 8 dígitos.');
    }
  };

  if (!isOpen && !isCambioModalOpen) return null;

  const handleCP = (e) => {
    e.preventDefault();
  };

  return (
    <div data-maintenance-correo="true" className="maintenance-container-correo">
      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Verificación de Correo Electrónico</h2>
            <p>Por favor, ingrese el código de 8 dígitos que recibió en su correo electrónico:</p>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                maxLength="8"
                placeholder="Código de 8 dígitos"
                required
              />
              <div className="form-buttons-Verificar">
                <button id="Verificar" type="submit">
                  Verificar
                </button>
                <span className="button-spacing"></span>
                <button id="cancelar" type="button" onClick={onClose}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCambioModalOpen && (
        <CambioContraseña
          isOpen={isCambioModalOpen}
          onClose={() => setIsCambioModalOpen(false)}
          idUsuario={idUsuario} // Pasar el ID de usuario a CambioContraseña
        />
      )}
    </div>
  );
};

export default VerificarCorreo;
