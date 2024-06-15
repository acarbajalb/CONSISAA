import React, { useRef, useEffect, useState } from 'react';
import Dashboard from './Dashboard.js'; // Asegúrate de tener la ruta correcta al componente

const Inicio = () => {
  return (
    <div>
      <h1>¡Bienvenido Administrador!</h1>
      <Dashboard/>
      {/* Otro contenido de tu página de inicio */}
    </div>
  );
}

export default Inicio;