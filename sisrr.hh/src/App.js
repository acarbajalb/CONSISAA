
import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Componentes/Pages/Login.js';
import Inicio from './Componentes/Pages/Inicio.js';
import Bitacora from './Componentes/Pages/Bitacora.js';
import RecuperacionContraseña from "./Componentes/Pages/RecuperacionContraseña.js";
import MantenimientoUsuario from "./Componentes/Pages/CRUDUsuario/MantenimientoUsuario.js";
import PrimerIngreso from "./Componentes/Pages/PrimerIngreso.js";
import NuevoUsuario from "./Componentes/Pages/CRUDUsuario/NuevoUsuario.js";
import EditarUsuario from "./Componentes/Pages/CRUDUsuario/EditarUsuario.js";

/*
import MantenimientoPlanilla from './Componentes/Pages/CRUDPlanilla/MantenimientoPlanilla.js';
import NuevaPlanilla from './Componentes/Pages/CRUDPlanilla/NuevaPlanilla.js';
import EditarPlanilla from "./Componentes/Pages/CRUDPlanilla/EditarPlanilla.js";
*/

/*
import MantenimientoDeducciones from './Componentes/Pages/CRUDPlanilla/CRUDDeducciones/MantenimientoDeducciones.js';
import NuevaDeduccion from './Componentes/Pages/CRUDPlanilla/CRUDDeducciones/NuevaDeduccion.js';
import EditarDeduccion from './Componentes/Pages/CRUDPlanilla/CRUDDeducciones/EditarDeduccion.js';
*/

//
import MantenimientoSolicitud from './Componentes/Pages/CRUDSolicitud/MantenimientoSolicitud.js';
import MantenimientoSolicitudUuario from './Componentes/Pages/CRUDSolicitud/MantenimientoSolicitudUsuario.js';
import NuevaSolicitudUsuario from "./Componentes/Pages/CRUDSolicitud/NuevaSolicitudUsuario.js";
//
import MantenimientoEmpleado from "./Componentes/Pages/CRUDEmpleado/MantenimientoEmpleado.js";
import EditarEmpleado from "./Componentes/Pages/CRUDEmpleado/EditarEmpleado.js";
import CrearEmpleado from "./Componentes/Pages/CRUDEmpleado/CrearEmpleado.js";


import MantenimientoParametro from "./Componentes/Pages/CRUDParametros/MantenimientoParametro.js";
import CrearParametro from "./Componentes/Pages/CRUDParametros/CrearParametro.js";
import EditarParametro from "./Componentes/Pages/CRUDParametros/EditarParametro.js";
//
import MantenimientoRol from "./Componentes/Pages/CRUDRol/MantenimientoRol.js";
import NuevoRol from "./Componentes/Pages/CRUDRol/NuevoRol.js";
import EditarRol from "./Componentes/Pages/CRUDRol/EditarRol.js";
//
import MantenimientoAcceso from "./Componentes/Pages/CRUDPermiso/MantenimientoAcceso.js";
import NuevoAcceso from "./Componentes/Pages/CRUDPermiso/NuevoAcceso.js";
import EditarAcceso from "./Componentes/Pages/CRUDPermiso/EditarAcceso.js";

//
import useStore from './Componentes/Pages/store.js';

//
import MantenimientoContrato from "./Componentes/Pages/CRUDContrato/MantenimientoContrato.js";
import NuevoContrato from "./Componentes/Pages/CRUDContrato/NuevoContrato.js";
import EditarContrato from "./Componentes/Pages/CRUDContrato/EditarContrato.js";


//
import MantenimientoDepartamento from "./Componentes/Pages/CRUDDepartamento/MantenimientoDepartamento.js";
import NuevoDepartamento from "./Componentes/Pages/CRUDDepartamento/NuevoDepartamento.js";
import EditarDepartamento from "./Componentes/Pages/CRUDDepartamento/EditarDepartamento.js";

//
import MantenimientoArea from "./Componentes/Pages/CRUDArea/MantenimientoArea.js";
import NuevoArea from "./Componentes/Pages/CRUDArea/NuevoArea.js";
import EditarArea from "./Componentes/Pages/CRUDArea/EditarArea.js";
//

//
import MantenimientoGenero from "./Componentes/Pages/CRUDGenero/MantenimientoGenero.js";
import NuevoGenero from "./Componentes/Pages/CRUDGenero/NuevoGenero.js";
import EditarGenero from "./Componentes/Pages/CRUDGenero/EditarGenero.js";
//

//
import MantenimientoEstadoCivil from "./Componentes/Pages/CRUDEstadoCivil/MantenimientoEstadoCivil.js";
import NuevoEstadoCivil from "./Componentes/Pages/CRUDEstadoCivil/NuevoEstadoCivil.js";
import EditarEstadoCivil from "./Componentes/Pages/CRUDEstadoCivil/EditarEstadoCivil.js";
//
//
import MantenimientoTipoTelefono from "./Componentes/Pages/CRUDTipoTelefono/MantenimientoTipoTelefono.js";
import NuevoTipoTelefono from "./Componentes/Pages/CRUDTipoTelefono/NuevoTipoTelefono.js";
import EditarTipoTelefono from "./Componentes/Pages/CRUDTipoTelefono/EditarTipoTelefono.js";

import MantenimientoEstado from "./Componentes/Pages/CRUDEstado/MantenimientoEstado.js";
import NuevoEstado from "./Componentes/Pages/CRUDEstado/NuevoEstado.js";
import EditarEstado from "./Componentes/Pages/CRUDEstado/EditarEstado.js";
//
import MantenimientoPuesto from "./Componentes/Pages/CRUDPuesto/MantenimientoPuesto.js";
import NuevoPuesto from "./Componentes/Pages/CRUDPuesto/NuevoPuesto.js";
import EditarPuesto from "./Componentes/Pages/CRUDPuesto/EditarPuesto.js";
//
import Perfildeusuario from "./Componentes/Pages/CRUDPerfildeusuario/Perfildeusuario.js";
import Editarperfildeusuario from "./Componentes/Pages/CRUDPerfildeusuario/Editarperfildeusuario.js";

import HomePage from "./Componentes/Pages/Home.js";

function App() {
  const rol = useStore((state) => state.rol); // Obtén el rol del usuario

  // Función para verificar el acceso basado en el rol
  const verificarAcceso = (rolPermitido) => {
    return rol === rolPermitido;
  };

  return (
    <>
      <BrowserRouter>
        {/* Envuelve toda la aplicación con el Provider de RolContext */}
     
          <Routes>
                {/*Si un usuario ingresa una ruta que no existe o a la que no tiene ACCESO por defecto le dara este mensaje */}
                <Route path="/*" element={<>NOT FOUND</>}/>                
                {/* Rutas Publicas */}
                <Route path="/" element={<Login />} /> 
                <Route path="/RecuperacionContraseña" element={<RecuperacionContraseña />} />


                {/* Rutas protegidas para Usuarios autenticados */}
                {verificarAcceso('Usuario') && (
                <>
                    <Route path="/Inicio" element={<Inicio />} />
                    <Route path="/Home" element={<HomePage />} />

                  {/*Rutas para Mantenimiento Solicitud*/}
                    <Route path="/MantenimientoSolicitudUsuario" element={<MantenimientoSolicitudUuario/>}/>
                    <Route path="/NuevaSolicitudUsuario" element={<NuevaSolicitudUsuario/>}/>
                    
                  {/*Rutas para Perfil de Usuario*/}
                    <Route path="/Perfildeusuario" element={<Perfildeusuario/>}/>
                    <Route path="/Editarperfildeusuario" element={<Editarperfildeusuario/>}/>
                </>
                )}


                {/* Rutas protegidas para Super Administradores autenticados */}
                {verificarAcceso('SuperAdmin') && (
                <>
                    <Route path="/Inicio" element={<Inicio />} />
                    <Route path="/Bitacora" element={<Bitacora />} />
                    <Route path="/MantenimientoUsuario" element={<MantenimientoUsuario />} />
                    <Route path="/NuevoUsuario" element={<NuevoUsuario/>} />
                    <Route path="/EditarUsuario" element={<EditarUsuario/>} />
                    <Route path="/PrimerIngreso" element={<PrimerIngreso />} />
                    <Route path="/Home" element={<HomePage />} />

                
                  {/*Rutas para Mantenimiento Solicitud*/}
                    <Route path="/MantenimientoSolicitud" element={<MantenimientoSolicitud />} />
                    <Route path="/MantenimientoSolicitudUsuario" element={<MantenimientoSolicitudUuario/>}/>
                    <Route path="/NuevaSolicitudUsuario" element={<NuevaSolicitudUsuario/>}/>

                  {/*Rutas para Mantenimiento Empleado*/}
                  <Route path="/MantenimientoEmpleado" element={<MantenimientoEmpleado/>}/>
                  <Route path="/EditarEmpleado" element={<EditarEmpleado/>}/>
                  <Route path="/CrearEmpleado" element={<CrearEmpleado/>}/>


                  {/*Rutas para Mantenimiento Parametro*/}
                  <Route path="/MantemientoParametro" element={<MantenimientoParametro/>}/>
                  <Route path="/EditarParametro" element={<EditarParametro/>}/>
                  <Route path="/CrearParametro" element={<CrearParametro/>}/>

                  {/*Rutas para Mantenimiento Rol*/}
                  <Route path="/MantemientoRol" element={<MantenimientoRol/>}/>
                  <Route path="/EditarRol" element={<EditarRol/>}/>
                  <Route path="/NuevoRol" element={<NuevoRol/>}/>

                  <Route path="/MantenimientoAcceso" element={<MantenimientoAcceso/>}/>                  
                  <Route path="/NuevoAcceso" element={<NuevoAcceso/>}/>
                  <Route path="/EditarAcceso" element={<EditarAcceso/>}/>
                  
                  {/*Rutas para Mantenimiento Puesto*/}
                  <Route path="/MantenimientoPuesto" element={<MantenimientoPuesto/>}/>
                  <Route path="/NuevoPuesto" element={<NuevoPuesto/>}/>
                  <Route path="/EditarPuesto" element={<EditarPuesto/>}/>

                  {/*Rutas para Mantenimiento Parametro*/}
                  <Route path="/MantemientoContrato" element={<MantenimientoContrato/>}/>
                  <Route path="/NuevoContrato" element={<NuevoContrato/>}/>
                  <Route path="/EditarContrato" element={<EditarContrato/>}/>

                  {/*Rutas para Mantenimiento departamento*/}
                  <Route path="/MantemientoDepartamento" element={<MantenimientoDepartamento/>}/>
                  <Route path="/EditarDepartamento" element={<EditarDepartamento/>}/>
                  <Route path="/NuevoDepartamento" element={<NuevoDepartamento/>}/>

                  {/*Rutas para Mantenimiento genero*/}
                  <Route path="/MantemientoGenero" element={<MantenimientoGenero/>}/>
                  <Route path="/NuevoGenero" element={<NuevoGenero/>}/>
                  <Route path="/EditarGenero" element={<EditarGenero/>}/>

                  {/*Rutas para Mantenimiento Area*/}
                  <Route path="/MantemientoArea" element={<MantenimientoArea/>}/>
                  <Route path="/NuevoArea" element={<NuevoArea/>}/>
                  <Route path="/EditarArea" element={<EditarArea/>}/>

                  
                  {/*Rutas para Mantenimiento ESTADOCIVIL*/}
                  <Route path="/MantemientoEstadoCivil" element={<MantenimientoEstadoCivil/>}/>
                  <Route path="/NuevoEstadoCivil" element={<NuevoEstadoCivil/>}/>
                  <Route path="/EditarEstadoCivil" element={<EditarEstadoCivil/>}/>

                 {/*Rutas para Mantenimiento tipotelefonoL*/}
                  <Route path="/MantemientoTipoTelefono" element={<MantenimientoTipoTelefono/>}/>
                  <Route path="/NuevoTipoTelefono" element={<NuevoTipoTelefono/>}/>
                  <Route path="/EditarTipoTelefono" element={<EditarTipoTelefono/>}/>


                {/*Rutas para Mantenimiento tipotelefonoL*/}
                  <Route path="/MantemientoEstado" element={<MantenimientoEstado/>}/>
                  <Route path="/NuevoEstado" element={<NuevoEstado/>}/>
                  <Route path="/EditarEstado" element={<EditarEstado/>}/>
                
                {/*Rutas para Perfil de Usuario*/}
                  <Route path="/Perfildeusuario" element={<Perfildeusuario/>}/>
                  <Route path="/Editarperfildeusuario" element={<Editarperfildeusuario/>}/>
              </>
            )}

            {/* Rutas protegidas para Nuevos usuarios autenticados */}
            {verificarAcceso('RR.HH') && (
                <>
                    <Route path="/Inicio" element={<Inicio />} />
                    <Route path="/MantenimientoUsuario" element={<MantenimientoUsuario />} />
                    <Route path="/NuevoUsuario" element={<NuevoUsuario/>} />
                    <Route path="/EditarUsuario" element={<EditarUsuario/>} />
                    <Route path="/PrimerIngreso" element={<PrimerIngreso />} />
                    <Route path="/Home" element={<HomePage />} />

                  {/*Rutas para Mantenimiento Solicitud*/}
                    <Route path="/MantenimientoSolicitud" element={<MantenimientoSolicitud />} />
                    <Route path="/MantenimientoSolicitudUsuario" element={<MantenimientoSolicitudUuario/>}/>
                    <Route path="/NuevaSolicitudUsuario" element={<NuevaSolicitudUsuario/>}/>

                  {/*Rutas para Mantenimiento Empleado*/}
                  <Route path="/MantenimientoEmpleado" element={<MantenimientoEmpleado/>}/>
                  <Route path="/EditarEmpleado" element={<EditarEmpleado/>}/>
                  <Route path="/CrearEmpleado" element={<CrearEmpleado/>}/>

                  {/*Rutas para Mantenimiento Puesto*/}
                  <Route path="/MantenimientoPuesto" element={<MantenimientoPuesto/>}/>
                  <Route path="/NuevoPuesto" element={<NuevoPuesto/>}/>
                  <Route path="/EditarPuesto" element={<EditarPuesto/>}/>

                  {/*Rutas para Mantenimiento Parametro*/}
                  <Route path="/MantemientoContrato" element={<MantenimientoContrato/>}/>
                  <Route path="/NuevoContrato" element={<NuevoContrato/>}/>
                  <Route path="/EditarContrato" element={<EditarContrato/>}/>

                  {/*Rutas para Mantenimiento departamento*/}
                  <Route path="/MantemientoDepartamento" element={<MantenimientoDepartamento/>}/>
                  <Route path="/EditarDepartamento" element={<EditarDepartamento/>}/>
                  <Route path="/NuevoDepartamento" element={<NuevoDepartamento/>}/>

                  {/*Rutas para Mantenimiento genero*/}
                  <Route path="/MantemientoGenero" element={<MantenimientoGenero/>}/>
                  <Route path="/NuevoGenero" element={<NuevoGenero/>}/>
                  <Route path="/EditarGenero" element={<EditarGenero/>}/>

                  {/*Rutas para Mantenimiento Area*/}
                  <Route path="/MantemientoArea" element={<MantenimientoArea/>}/>
                  <Route path="/NuevoArea" element={<NuevoArea/>}/>
                  <Route path="/EditarArea" element={<EditarArea/>}/>

                  {/*Rutas para Mantenimiento ESTADOCIVIL*/}
                  <Route path="/MantemientoEstadoCivil" element={<MantenimientoEstadoCivil/>}/>
                  <Route path="/NuevoEstadoCivil" element={<NuevoEstadoCivil/>}/>
                  <Route path="/EditarEstadoCivil" element={<EditarEstadoCivil/>}/>

                 {/*Rutas para Mantenimiento tipotelefonoL*/}
                  <Route path="/MantemientoTipoTelefono" element={<MantenimientoTipoTelefono/>}/>
                  <Route path="/NuevoTipoTelefono" element={<NuevoTipoTelefono/>}/>
                  <Route path="/EditarTipoTelefono" element={<EditarTipoTelefono/>}/>

                {/*Rutas para Mantenimiento tipotelefonoL*/}
                  <Route path="/MantemientoEstado" element={<MantenimientoEstado/>}/>
                  <Route path="/NuevoEstado" element={<NuevoEstado/>}/>
                  <Route path="/EditarEstado" element={<EditarEstado/>}/>
                
                {/*Rutas para Perfil de Usuario*/}
                  <Route path="/Perfildeusuario" element={<Perfildeusuario/>}/>
                  <Route path="/Editarperfildeusuario" element={<Editarperfildeusuario/>}/>
              </>
            )}


              {/* Rutas protegidas para Nuevos usuarios autenticados */}
              {verificarAcceso('Gerente') && (
                <>
                    <Route path="/Inicio" element={<Inicio />} />
                    <Route path="/MantenimientoUsuario" element={<MantenimientoUsuario />} />
                    <Route path="/NuevoUsuario" element={<NuevoUsuario/>} />
                    <Route path="/EditarUsuario" element={<EditarUsuario/>} />
                    <Route path="/PrimerIngreso" element={<PrimerIngreso />} />
                    <Route path="/Home" element={<HomePage />} />

                  {/*Rutas para Mantenimiento Solicitud*/}
                    <Route path="/MantenimientoSolicitud" element={<MantenimientoSolicitud />} />
                    <Route path="/MantenimientoSolicitudUsuario" element={<MantenimientoSolicitudUuario/>}/>
                    <Route path="/NuevaSolicitudUsuario" element={<NuevaSolicitudUsuario/>}/>

                  {/*Rutas para Mantenimiento Empleado*/}
                  <Route path="/MantenimientoEmpleado" element={<MantenimientoEmpleado/>}/>
                  <Route path="/EditarEmpleado" element={<EditarEmpleado/>}/>
                  <Route path="/CrearEmpleado" element={<CrearEmpleado/>}/>

                  {/*Rutas para Mantenimiento Puesto*/}
                  <Route path="/MantenimientoPuesto" element={<MantenimientoPuesto/>}/>
                  <Route path="/NuevoPuesto" element={<NuevoPuesto/>}/>
                  <Route path="/EditarPuesto" element={<EditarPuesto/>}/>

                  {/*Rutas para Mantenimiento Parametro*/}
                  <Route path="/MantemientoContrato" element={<MantenimientoContrato/>}/>
                  <Route path="/NuevoContrato" element={<NuevoContrato/>}/>
                  <Route path="/EditarContrato" element={<EditarContrato/>}/>

                  {/*Rutas para Mantenimiento departamento*/}
                  <Route path="/MantemientoDepartamento" element={<MantenimientoDepartamento/>}/>
                  <Route path="/EditarDepartamento" element={<EditarDepartamento/>}/>
                  <Route path="/NuevoDepartamento" element={<NuevoDepartamento/>}/>

                  {/*Rutas para Mantenimiento genero*/}
                  <Route path="/MantemientoGenero" element={<MantenimientoGenero/>}/>
                  <Route path="/NuevoGenero" element={<NuevoGenero/>}/>
                  <Route path="/EditarGenero" element={<EditarGenero/>}/>

                  {/*Rutas para Mantenimiento Area*/}
                  <Route path="/MantemientoArea" element={<MantenimientoArea/>}/>
                  <Route path="/NuevoArea" element={<NuevoArea/>}/>
                  <Route path="/EditarArea" element={<EditarArea/>}/>

                  {/*Rutas para Mantenimiento ESTADOCIVIL*/}
                  <Route path="/MantemientoEstadoCivil" element={<MantenimientoEstadoCivil/>}/>
                  <Route path="/NuevoEstadoCivil" element={<NuevoEstadoCivil/>}/>
                  <Route path="/EditarEstadoCivil" element={<EditarEstadoCivil/>}/>

                 {/*Rutas para Mantenimiento tipotelefonoL*/}
                  <Route path="/MantemientoTipoTelefono" element={<MantenimientoTipoTelefono/>}/>
                  <Route path="/NuevoTipoTelefono" element={<NuevoTipoTelefono/>}/>
                  <Route path="/EditarTipoTelefono" element={<EditarTipoTelefono/>}/>

                {/*Rutas para Mantenimiento tipotelefonoL*/}
                  <Route path="/MantemientoEstado" element={<MantenimientoEstado/>}/>
                  <Route path="/NuevoEstado" element={<NuevoEstado/>}/>
                  <Route path="/EditarEstado" element={<EditarEstado/>}/>
                
                {/*Rutas para Perfil de Usuario*/}
                  <Route path="/Perfildeusuario" element={<Perfildeusuario/>}/>
                  <Route path="/Editarperfildeusuario" element={<Editarperfildeusuario/>}/>
              </>
            )}


            {/* Rutas protegidas para Nuevos usuarios autenticados */}
            {verificarAcceso('Supervisor') && (
                <>
                    <Route path="/Inicio" element={<Inicio />} />
                    <Route path="/PrimerIngreso" element={<PrimerIngreso />} />
                    <Route path="/Home" element={<HomePage />} />

                  {/*Rutas para Mantenimiento Solicitud*/}
                    <Route path="/MantenimientoSolicitud" element={<MantenimientoSolicitud />} />
                    <Route path="/MantenimientoSolicitudUsuario" element={<MantenimientoSolicitudUuario/>}/>
                    <Route path="/NuevaSolicitudUsuario" element={<NuevaSolicitudUsuario/>}/>
                 
                 {/*Rutas para Perfil de Usuario*/}
                  <Route path="/Perfildeusuario" element={<Perfildeusuario/>}/>
                  <Route path="/Editarperfildeusuario" element={<Editarperfildeusuario/>}/>
  
                  <Route path="/MantenimientoUsuario" element={<MantenimientoUsuario />} />
                    <Route path="/NuevoUsuario" element={<NuevoUsuario/>} />
                    <Route path="/EditarUsuario" element={<EditarUsuario/>} />
              </>
            )}


            {/* Rutas protegidas para Nuevos usuarios autenticados */}
            {verificarAcceso('Administrador') && (
                <>
                    <Route path="/Inicio" element={<Inicio />} />
                    <Route path="/MantenimientoUsuario" element={<MantenimientoUsuario />} />
                    <Route path="/NuevoUsuario" element={<NuevoUsuario/>} />
                    <Route path="/EditarUsuario" element={<EditarUsuario/>} />
                    <Route path="/PrimerIngreso" element={<PrimerIngreso />} />
                    <Route path="/Home" element={<HomePage />} />

                  
                  {/* Rutas para Planilla
                    <Route path="/MantenimientoPlanilla" element={<MantenimientoPlanilla />} />
                    <Route path="/EditarPlanilla" element={<EditarPlanilla />} />
                    <Route path="/NuevaPlanilla" element={<NuevaPlanilla />} />
                */}

                  {/* Rutas para Deducciones
                    <Route path="/MantenimientoDeducciones" element={<MantenimientoDeducciones />} />
                    <Route path="/NuevaDeduccion" element={<NuevaDeduccion />} />
                    <Route path="/EditarDeduccion" element={<EditarDeduccion />} /> 
                  */}

                  {/*Rutas para Mantenimiento Solicitud*/}
                    <Route path="/MantenimientoSolicitud" element={<MantenimientoSolicitud />} />
                    <Route path="/MantenimientoSolicitudUsuario" element={<MantenimientoSolicitudUuario/>}/>
                    <Route path="/NuevaSolicitudUsuario" element={<NuevaSolicitudUsuario/>}/>

                  {/*Rutas para Mantenimiento Empleado*/}
                  <Route path="/MantenimientoEmpleado" element={<MantenimientoEmpleado/>}/>
                  <Route path="/EditarEmpleado" element={<EditarEmpleado/>}/>
                  <Route path="/CrearEmpleado" element={<CrearEmpleado/>}/>

                  {/*Rutas para Mantenimiento departamento*/}
                  <Route path="/MantemientoDepartamento" element={<MantenimientoDepartamento/>}/>
                  <Route path="/EditarDepartamento" element={<EditarDepartamento/>}/>
                  <Route path="/NuevoDepartamento" element={<NuevoDepartamento/>}/>

                  {/*Rutas para Mantenimiento area*/}
                  <Route path="/MantemientoArea" element={<MantenimientoArea/>}/>
                  <Route path="/EditarArea" element={<EditarArea/>}/>
                  <Route path="/NuevoArea" element={<NuevoArea/>}/>

                   {/*Rutas para Mantenimiento Puesto*/}
                  <Route path="/MantenimientoPuesto" element={<MantenimientoPuesto/>}/>
                  <Route path="/NuevoPuesto" element={<NuevoPuesto/>}/>
                  <Route path="/EditarPuesto" element={<EditarPuesto/>}/>
                
                {/*Rutas para Perfil de Usuario*/}
                  <Route path="/Perfildeusuario" element={<Perfildeusuario/>}/>
                  <Route path="/Editarperfildeusuario" element={<Editarperfildeusuario/>}/>
              </>
            )}




             {/* Rutas protegidas para Nuevos usuarios autenticados */}
             {verificarAcceso('Nuevo') && (
                <>
                    <Route path="/Inicio" element={<Inicio />} />
                    <Route path="/Home" element={<HomePage />} />
              </>
            )}


            
            {/* Rutas protegidas para Nuevos usuarios autenticados */}
            {verificarAcceso('Seguridad') && (
                <>
                    <Route path="/Inicio" element={<Inicio />} />
                    <Route path="/Bitacora" element={<Bitacora />} />


                  {/*Rutas para Mantenimiento Parametro*/}
                  <Route path="/MantemientoParametro" element={<MantenimientoParametro/>}/>


                  <Route path="/MantenimientoAcceso" element={<MantenimientoAcceso/>}/>
                  <Route path="/NuevoAcceso" element={<NuevoAcceso/>}/>
                  <Route path="/EditarAcceso" element={<EditarAcceso/>}/>

                  {/*Rutas para Mantenimiento Parametro*/}
                  <Route path="/MantemientoContrato" element={<MantenimientoContrato/>}/>
                  <Route path="/NuevoContrato" element={<NuevoContrato/>}/>
                  <Route path="/EditarContrato" element={<EditarContrato/>}/>
                
                {/*Rutas para Perfil de Usuario*/}
                  <Route path="/Perfildeusuario" element={<Perfildeusuario/>}/>
                  <Route path="/Editarperfildeusuario" element={<Editarperfildeusuario/>}/>
              </>
            )}
          </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
