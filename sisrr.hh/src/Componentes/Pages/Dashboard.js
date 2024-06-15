import React, { useState, useMemo, useEffect } from "react";
import "./dashboard.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import HomePage from "./Home.js";
import MantenimientoUsuario from "./CRUDUsuario/MantenimientoUsuario.js";
import Bitacora from "./Bitacora.js";
import NuevaPlanilla from "./CRUDPlanilla/NuevaPlanilla.js";
import MantenimientoDeducciones from "./CRUDPlanilla/CRUDDeducciones/MantenimientoDeducciones.js";
import MantenimientoPlanilla from "./CRUDPlanilla/MantenimientoPlanilla.js";
import MantenimientoSolicitud from "./CRUDSolicitud/MantenimientoSolicitud.js";
import MantenimientoSolicitudUsuario from "./CRUDSolicitud/MantenimientoSolicitudUsuario.js";
import { faSquarePollHorizontal } from "@fortawesome/free-solid-svg-icons";
import MantenimientoEmpleado from "./CRUDEmpleado/MantenimientoEmpleado.js";
import MantenimientoParametro from "./CRUDParametros/MantenimientoParametro.js";
import MantenimientoAcceso from "./CRUDPermiso/MantenimientoAcceso.js";
import MantenimientoContrato from "./CRUDContrato/MantenimientoContrato.js";
import MantenimientoDepartamento from './CRUDDepartamento/MantenimientoDepartamento.js';
import MantenimientoGenero from "./CRUDGenero/MantenimientoGenero.js";
import MantenimientoArea from "./CRUDArea/MantenimientoArea.js";
import MantenimientoEstadoCivil from "./CRUDEstadoCivil/MantenimientoEstadoCivil.js";
import MantenimientoTipoTelefono from "./CRUDTipoTelefono/MantenimientoTipoTelefono.js";
import MantenimientoEstado from "./CRUDEstado/MantenimientoEstado.js";
import MantenimientoRol from "./CRUDRol/MantenimientoRol.js";
import MantenimientoPuesto from "./CRUDPuesto/MantenimientoPuesto.js";
import Perfildeusuario from "./CRUDPerfildeusuario/Perfildeusuario.js";
import useStore from './store.js';


const Dashboard = () => {
  const navigate = useNavigate();
  const [isSidebarClosed, setSidebarClosed] = useState(false);
  const [activeComponent, setActiveComponent] = useState(null);
  const rol = useStore((state) => state.rol); // Obtén el rol del usuario
  const Id_usuario = useStore((state) => state.Id_usuario); // Obtén el id de usuario
  
  const [ultimaConexion, setUltimaConexion] = useState(null); // Estado para almacenar la última conexión
  useEffect(() => {
    setActiveComponent("Home");
  }, []);

  const toggleSidebar = () => {
    setSidebarClosed(!isSidebarClosed);
  };

  const openSearch = () => {
    setSidebarClosed(false);
  };

  const handleComponentToggle = (componentName) => {
    if (activeComponent === componentName) {
      setActiveComponent(null);
    } else {
      setActiveComponent(componentName);
    }
  };

  const logout = async () => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Quieres cerrar sesión?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#8250f5",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await actualizarUltimaConexion(Id_usuario);
          // Limpiar las cookies u otras acciones de cierre de sesión
          // Redirigir al usuario a la página de inicio de sesión
          navigate("/");
        } catch (error) {
          console.error("Error al cerrar sesión:", error.message);
          Swal.fire("Error", "Hubo un error al cerrar sesión", "error");
        }
      }
    });
  };
  const actualizarUltimaConexion = async (userId) => {
    try {
      const response = await fetch(`http://localhost:3001/ultimaVezConectado/${userId}`, {
        method: 'PUT', // Suponiendo que la API utiliza el método PUT para actualizar la conexión
        headers: {
          'Content-Type': 'application/json'
        },
        // Puedes enviar cualquier dato adicional necesario para actualizar la conexión
        body: JSON.stringify({}),
      });
      if (response.ok) {
        console.log("Última conexión actualizada correctamente");
      } else {
        console.error("Error al actualizar la última conexión:", response.statusText);
      }
    } catch (error) {
      console.error("Error al actualizar la última conexión:", error.message);
      throw new Error("Error al actualizar la última conexión");
    }
  }

  return (
    <div className="dashboard">
      <nav className={`sidebar ${isSidebarClosed ? "close" : ""}`}>
        <header>
          <div className="image-text">
            <i className="bx bxs-doughnut-chart logo"></i>
            <div className="text logo-text">
              <span className="name">CONSISA</span>
              <span className="profession">
                Tecnología • Innovación • Experiencia
              </span>
            </div>
          </div>
          <i className="bx bx-chevron-right toggle" onClick={toggleSidebar}></i>
        </header>
        <div className="menu-bar">
          <div className="menu">
            <li className="search-box" onClick={openSearch}>
              <i className="bx bx-search icon"></i>
              <input type="text" placeholder="Buscar..." />
            </li>
            <ul className="menu-links">

            {/*Para SuperAdmin*/}
            {rol === "SuperAdmin" && (
            <>
              <li className="nav-link">
                <a href="#">
                  <i className="bx bx-home-alt icon"></i>
                  <span className="text nav-text" onClick={() => handleComponentToggle("Home")}>Inicio</span>
                </a>
              </li>
              <li className="nav-link with-submenu">
                <a href="#">
                  <i className="bx bx-street-view icon"></i>
                  <span className="text nav-text">Panel De Control</span>
                </a>
                {isSidebarClosed ? null : (
                  <ul className="Empleados">
                    <li>
                      <a href="#">
                        <i className="bx bxs-briefcase-alt-2 icon"></i>
                        <span
                          className="text nav-text"
                          onClick={() =>
                            handleComponentToggle("MantenimientoEmpleado")
                          }
                        >
                          {" "}
                          Administrar Empleados
                        </span>{" "}
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="bx bxs-user-rectangle icon"></i>
                        <span
                          className="text nav-text"
                          onClick={() =>
                            handleComponentToggle("MantenimientoUsuario")
                          }
                        >
                          {" "}
                          Administrar Usuarios
                        </span>
                      </a>
                    </li>

                    <li>
                      <a href="#">
                        <i className="bx bxs-file icon"></i>
                        <span className="text nav-text" onClick={() => handleComponentToggle("MantenimientoContrato")}> Contratos</span>
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="bx bxs-business icon"></i>
                        <span className="text nav-text" onClick={() => handleComponentToggle('MantenimientoDepartamento')}>  Departamentos</span>                      
                      </a>
                    </li> 
                    <li>
                    <a href="#">
                        <i className="bx bx-current-location icon"></i>
                        <span className="text nav-text" onClick={() => handleComponentToggle('MantenimientoArea')}>  Areas</span>                      
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="bx bx-male-female icon"></i>
                        <span className="text nav-text" onClick={() => handleComponentToggle('MantenimientoGenero')}>  Generos</span>                      
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="bx bx-id-card icon"></i>
                        <span className="text nav-text" onClick={() => handleComponentToggle('MantenimientoEstadoCivil')}>  Estado Civil</span>                      
                      </a>
                    </li>
                    <li> 
                      <a href="#">
                        <i className="bx bxs-briefcase-alt icon"></i>
                        <span className="text nav-text" onClick={() => handleComponentToggle('MantenimientoPuesto')}>  Puestos</span>                      
                      </a>
                    </li>
                    <li> 
                      <a href="#">
                        <i className="bx bxs-phone-call icon"></i>
                        <span className="text nav-text" onClick={() => handleComponentToggle('MantenimientoTipoTelefono')}>  Tipo Telefono</span>                      
                      </a>
                    </li>
                    <li> 
                      <a href="#">
                        <i className="bx bxs-notepad icon"></i>
                        <span className="text nav-text" onClick={() => handleComponentToggle('MantenimientoEstado')}>  Estado</span>                      
                      </a>
                    </li>
                  </ul>
                )}
              </li>
              
              <li className="nav-link">
                <a href="#">
                  <i className="bx bxs-bell icon"></i>
                  <span
                    className="text nav-text"
                    onClick={() =>
                      handleComponentToggle("MantenimientoSolicitud")
                    }
                  >
                    Buzón de Solicitudes
                  </span>
                </a>
              </li>
              <li className="nav-link">
                <a href="#">
                  <i className="bx bxs-paste icon"></i>
                  <span
                    className="text nav-text"
                    onClick={() =>
                      handleComponentToggle("MantenimientoSolicitudUsuario")
                    }
                  >
                    Mis Solicitudes
                  </span>
                </a>
              </li>

              <li className="nav-link with-submenu">
                <a href="#">
                  <i className="bx bx-shield-quarter icon"></i>
                  <span className="text nav-text">Seguridad</span>
                </a>
                {isSidebarClosed ? null : (
                  <ul className="Seguridad">
                    <li>
                      <a href="#">
                        <i className="bx bx-code-block icon"></i>
                        <span
                          className="text nav-text"
                          onClick={() =>
                            handleComponentToggle("MantenimientoParametro")
                          }
                        >
                          Parámetros del Seguridad
                        </span>
                      </a>
                    </li>  
                    <li>
                      <a href="#">
                      <i className="bx bx-user icon"></i>
                        <span
                          className="text nav-text"
                          onClick={() =>
                            handleComponentToggle("MantenimientoRol")
                          }
                        >
                          Roles
                        </span>
                      </a>
                    </li> 
                    <li>
                      <a href="#">
                        <i className="bx bxs-log-in icon"></i>
                        <span
                          className="text nav-text"
                          onClick={() =>
                            handleComponentToggle("MantenimientoAcceso")
                          }
                        >
                          Acceso al Sistema
                        </span>
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="bx bxs-user-detail icon"></i>
                        <span
                          className="text nav-text"
                          onClick={() => handleComponentToggle("Bitacora")}
                        >
                          Bitacora
                        </span>
                      </a>
                    </li>
                  </ul>
                )}
              </li>
              <li className="nav-link">
                <a href="#">
                  <i className="bx bxs-user-rectangle icon"></i>
                  <span className="text nav-text" onClick={() => handleComponentToggle("Perfildeusuario")}>Perfil de Usuario</span>
                </a>
              </li>
            </>
            )}

            {/*Para RR.HH*/}
            {rol === "RR.HH" && (
            <>
              <li className="nav-link">
                <a href="#">
                  <i className="bx bx-home-alt icon"></i>
                  <span className="text nav-text" onClick={() => handleComponentToggle("Home")}>Inicio</span>
                </a>
              </li>
              <li className="nav-link with-submenu">
                <a href="#">
                  <i className="bx bx-street-view icon"></i>
                  <span className="text nav-text">Empleados</span>
                </a>
                {isSidebarClosed ? null : (
                  <ul className="Empleados">
                    <li>
                      <a href="#">
                        <i className="bx bxs-briefcase-alt-2 icon"></i>
                        <span
                          className="text nav-text"
                          onClick={() =>
                            handleComponentToggle("MantenimientoEmpleado")
                          }
                        >
                          {" "}
                          Administrar Empleados
                        </span>{" "}
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="bx bxs-user-rectangle icon"></i>
                        <span
                          className="text nav-text"
                          onClick={() =>
                            handleComponentToggle("MantenimientoUsuario")
                          }
                        >
                          {" "}
                          Administrar Usuarios
                        </span>
                      </a>
                    </li>

                    <li>
                      <a href="#">
                        <i className="bx bxs-file icon"></i>
                        <span className="text nav-text" onClick={() => handleComponentToggle("MantenimientoContrato")}> Contratos</span>
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="bx bxs-business icon"></i>
                        <span className="text nav-text" onClick={() => handleComponentToggle('MantenimientoDepartamento')}>  Departamentos</span>                      
                      </a>
                    </li> 
                    <li>
                    <a href="#">
                        <i className="bx bx-current-location icon"></i>
                        <span className="text nav-text" onClick={() => handleComponentToggle('MantenimientoArea')}>  Areas</span>                      
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="bx bx-male-female icon"></i>
                        <span className="text nav-text" onClick={() => handleComponentToggle('MantenimientoGenero')}>  Generos</span>                      
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="bx bx-id-card icon"></i>
                        <span className="text nav-text" onClick={() => handleComponentToggle('MantenimientoEstadoCivil')}>  Estado Civil</span>                      
                      </a>
                    </li>
                    <li> 
                      <a href="#">
                        <i className="bx bxs-briefcase-alt icon"></i>
                        <span className="text nav-text" onClick={() => handleComponentToggle('MantenimientoPuesto')}>  Puestos</span>                      
                      </a>
                    </li>
                    <li> 
                      <a href="#">
                        <i className="bx bxs-phone-call icon"></i>
                        <span className="text nav-text" onClick={() => handleComponentToggle('MantenimientoTipoTelefono')}>  Tipo Telefono</span>                      
                      </a>
                    </li>
                    <li> 
                      <a href="#">
                        <i className="bx bxs-notepad icon"></i>
                        <span className="text nav-text" onClick={() => handleComponentToggle('MantenimientoEstado')}>  Estado</span>                      
                      </a>
                    </li>
                  </ul>
                )}
              </li>
              <li className="nav-link">
                <a href="#">
                  <i className="bx bxs-bell icon"></i>
                  <span
                    className="text nav-text"
                    onClick={() =>
                      handleComponentToggle("MantenimientoSolicitud")
                    }
                  >
                    Buzón de Solicitudes
                  </span>
                </a>
              </li>
              <li className="nav-link">
                <a href="#">
                  <i className="bx bxs-paste icon"></i>
                  <span
                    className="text nav-text"
                    onClick={() =>
                      handleComponentToggle("MantenimientoSolicitudUsuario")
                    }
                  >
                    Mis Solicitudes
                  </span>
                </a>
              </li>
              <li className="nav-link">
                <a href="#">
                  <i className="bx bxs-user-rectangle icon"></i>
                  <span className="text nav-text" onClick={() => handleComponentToggle("Perfildeusuario")}>Perfil de Usuario</span>
                </a>
              </li>
            </>
            )}


            {/*Para Gerente*/}
            {rol === "Gerente" && (
            <>
              <li className="nav-link">
                <a href="#">
                  <i className="bx bx-home-alt icon"></i>
                  <span className="text nav-text" onClick={() => handleComponentToggle("Home")}>Inicio</span>
                </a>
              </li>
              <li className="nav-link with-submenu">
                <a href="#">
                  <i className="bx bx-street-view icon"></i>
                  <span className="text nav-text">Empleados</span>
                </a>
                {isSidebarClosed ? null : (
                  <ul className="Empleados">
                    <li>
                      <a href="#">
                        <i className="bx bxs-briefcase-alt-2 icon"></i>
                        <span
                          className="text nav-text"
                          onClick={() =>
                            handleComponentToggle("MantenimientoEmpleado")
                          }
                        >
                          {" "}
                          Administrar Empleados
                        </span>{" "}
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="bx bxs-user-rectangle icon"></i>
                        <span
                          className="text nav-text"
                          onClick={() =>
                            handleComponentToggle("MantenimientoUsuario")
                          }
                        >
                          {" "}
                          Administrar Usuarios
                        </span>
                      </a>
                    </li>

                    <li>
                      <a href="#">
                        <i className="bx bxs-file icon"></i>
                        <span className="text nav-text" onClick={() => handleComponentToggle("MantenimientoContrato")}> Contratos</span>
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="bx bxs-business icon"></i>
                        <span className="text nav-text" onClick={() => handleComponentToggle('MantenimientoDepartamento')}>  Departamentos</span>                      
                      </a>
                    </li> 
                    <li>
                    <a href="#">
                        <i className="bx bx-current-location icon"></i>
                        <span className="text nav-text" onClick={() => handleComponentToggle('MantenimientoArea')}>  Areas</span>                      
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="bx bx-male-female icon"></i>
                        <span className="text nav-text" onClick={() => handleComponentToggle('MantenimientoGenero')}>  Generos</span>                      
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="bx bx-id-card icon"></i>
                        <span className="text nav-text" onClick={() => handleComponentToggle('MantenimientoEstadoCivil')}>  Estado Civil</span>                      
                      </a>
                    </li>
                    <li> 
                      <a href="#">
                        <i className="bx bxs-briefcase-alt icon"></i>
                        <span className="text nav-text" onClick={() => handleComponentToggle('MantenimientoPuesto')}>  Puestos</span>                      
                      </a>
                    </li>
                    <li> 
                      <a href="#">
                        <i className="bx bxs-phone-call icon"></i>
                        <span className="text nav-text" onClick={() => handleComponentToggle('MantenimientoTipoTelefono')}>  Tipo Telefono</span>                      
                      </a>
                    </li>
                    <li> 
                      <a href="#">
                        <i className="bx bxs-notepad icon"></i>
                        <span className="text nav-text" onClick={() => handleComponentToggle('MantenimientoEstado')}>  Estado</span>                      
                      </a>
                    </li>
                  </ul>
                )}
              </li>
              <li className="nav-link">
                <a href="#">
                  <i className="bx bxs-bell icon"></i>
                  <span
                    className="text nav-text"
                    onClick={() =>
                      handleComponentToggle("MantenimientoSolicitud")
                    }
                  >
                    Buzón de Solicitudes
                  </span>
                </a>
              </li>
              <li className="nav-link">
                <a href="#">
                  <i className="bx bxs-paste icon"></i>
                  <span
                    className="text nav-text"
                    onClick={() =>
                      handleComponentToggle("MantenimientoSolicitudUsuario")
                    }
                  >
                    Mis Solicitudes
                  </span>
                </a>
              </li>
              <li className="nav-link">
                <a href="#">
                  <i className="bx bxs-user-rectangle icon"></i>
                  <span className="text nav-text" onClick={() => handleComponentToggle("Perfildeusuario")}>Perfil de Usuario</span>
                </a>
              </li>
            </>
            )}

             {/*Para Supervisor*/}
             {rol === "Supervisor" && (
            <>
              <li className="nav-link">
                <a href="#">
                  <i className="bx bx-home-alt icon"></i>
                  <span className="text nav-text" onClick={() => handleComponentToggle("Home")}>Inicio</span>
                </a>
              </li>
                <li>
                      <a href="#">
                        <i className="bx bxs-user-rectangle icon"></i>
                        <span
                          className="text nav-text"
                          onClick={() =>
                            handleComponentToggle("MantenimientoUsuario")
                          }
                        >
                          {" "}
                          Administrar Usuarios
                        </span>
                      </a>
                    </li>

              <li className="nav-link">
                <a href="#">
                  <i className="bx bxs-bell icon"></i>
                  <span
                    className="text nav-text"
                    onClick={() =>
                      handleComponentToggle("MantenimientoSolicitud")
                    }
                  >
                    Buzón de Solicitudes
                  </span>
                </a>
              </li>
              <li className="nav-link">
                <a href="#">
                  <i className="bx bxs-paste icon"></i>
                  <span
                    className="text nav-text"
                    onClick={() =>
                      handleComponentToggle("MantenimientoSolicitudUsuario")
                    }
                  >
                    Mis Solicitudes
                  </span>
                </a>
              </li>
              <li className="nav-link">
                <a href="#">
                  <i className="bx bxs-user-rectangle icon"></i>
                  <span className="text nav-text" onClick={() => handleComponentToggle("Perfildeusuario")}>Perfil de Usuario</span>
                </a>
              </li>
            </>
            )}
            

            {/*Para Usuario*/}
            {rol === "Usuario" && (
            <>
              <li className="nav-link">
                <a href="#">
                  <i className="bx bx-home-alt icon"></i>
                  <span className="text nav-text" onClick={() => handleComponentToggle("Home")}>Inicio</span>
                </a>
              </li>
              <li className="nav-link">
                <a href="#">
                  <i className="bx bxs-paste icon"></i>
                  <span
                    className="text nav-text"
                    onClick={() =>
                      handleComponentToggle("MantenimientoSolicitudUsuario")
                    }
                  >
                    Mis Solicitudes
                  </span>
                </a>
              </li>
              <li className="nav-link">
                <a href="#">
                  <i className="bx bxs-user-rectangle icon"></i>
                  <span className="text nav-text" onClick={() => handleComponentToggle("Perfildeusuario")}>Perfil de Usuario</span>
                </a>
              </li>
            </>
            )}

            {/*Para Seguridad*/}
            {rol === "Seguridad" && (
            <>
              <li className="nav-link">
                <a href="#">
                  <i className="bx bx-home-alt icon"></i>
                  <span className="text nav-text" onClick={() => handleComponentToggle("Home")}>Inicio</span>
                </a>
              </li>
              <li className="nav-link with-submenu">
                <a href="#">
                  <i className="bx bx-shield-quarter icon"></i>
                  <span className="text nav-text">Seguridad</span>
                </a>
                {isSidebarClosed ? null : (
                  <ul className="Seguridad">
                    <li>
                      <a href="#">
                        <i className="bx bx-code-block icon"></i>
                        <span
                          className="text nav-text"
                          onClick={() =>
                            handleComponentToggle("MantenimientoParametro")
                          }
                        >
                          Parámetros del Seguridad
                        </span>
                      </a>
                    </li>  
                    <li>
                      <a href="#">
                      <i className="bx bx-user icon"></i>
                        <span
                          className="text nav-text"
                          onClick={() =>
                            handleComponentToggle("MantenimientoRol")
                          }
                        >
                          Roles
                        </span>
                      </a>
                    </li> 
                 
                    <li>
                      <a href="#">
                        <i className="bx bxs-log-in icon"></i>
                        <span
                          className="text nav-text"
                          onClick={() =>
                            handleComponentToggle("MantenimientoAcceso")
                          }
                        >
                          Acceso al Sistema
                        </span>
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="bx bxs-user-detail icon"></i>
                        <span
                          className="text nav-text"
                          onClick={() => handleComponentToggle("Bitacora")}
                        >
                          Bitacora
                        </span>
                      </a>
                    </li>
                  </ul>
                )}
              </li>
              <li className="nav-link">
                <a href="#">
                  <i className="bx bxs-user-rectangle icon"></i>
                  <span className="text nav-text" onClick={() => handleComponentToggle("Perfildeusuario")}>Perfil de Usuario</span>
                </a>
              </li>
            </>
            )}

            {/* Para Nuevo Usuario*/}
            {rol === "Nuevo" && (
            <>
              <li className="nav-link">
                <a href="#">
                  <i className="bx bx-home-alt icon"></i>
                  <span className="text nav-text" onClick={() => handleComponentToggle("Home")}>Inicio</span>
                </a>
              </li>
            </>
            )}
            </ul>
          </div>
          <div className="bottom-content">
            <li>
              <a href="#">
                <i className="bx bx-log-out icon"></i>
                <span className="text nav-text" onClick={logout}>
                  Cerrar Sesión
                </span>
              </a>
            </li>
          </div>
        </div>
      </nav>
      <section className="home">
        {activeComponent === "Home" && (
          <div className="text">
            <HomePage onClose={() => setActiveComponent(null)} />
          </div>
        )}
        {activeComponent === "MantenimientoUsuario" && (
          <div className="text">
            <MantenimientoUsuario onClose={() => setActiveComponent(null)} />
          </div>
        )}
        {activeComponent === "Bitacora" && (
          <div className="text">
            <Bitacora onClose={() => setActiveComponent(null)} />
          </div>
        )}
        {activeComponent === "Perfildeusuario" && (
          <div className="text">
            <Perfildeusuario onClose={() => setActiveComponent(null)} />
          </div>
        )}
       
        {activeComponent === "MantenimientoContrato" && (
          <div className="text">
            <MantenimientoContrato onClose={() => setActiveComponent(null)} />
          </div>
        )}
        
        {activeComponent === "MantenimientoSolicitud" && (
          <div className="text">
            <MantenimientoSolicitud onClose={() => setActiveComponent(null)} />
          </div>
        )}
        {activeComponent === "MantenimientoSolicitudUsuario" && (
          <div className="text">
            <MantenimientoSolicitudUsuario
              onClose={() => setActiveComponent(null)}
            />
          </div>
        )}
        {/*Mantenimiento empleado*/}
        {activeComponent === "MantenimientoEmpleado" && (
          <div className="text">
            <MantenimientoEmpleado onClose={() => setActiveComponent(null)} />
          </div>
        )}

                {/*Mantenimiento Rol*/}
                {activeComponent === "MantenimientoRol" && (
          <div className="text">
            <MantenimientoRol onClose={() => setActiveComponent(null)} />
          </div>
        )}

        {activeComponent === "MantenimientoAcceso" && (
          <div className="text">
            <MantenimientoAcceso onClose={() => setActiveComponent(null)} />
          </div>
        )}
        {activeComponent === "MantenimientoParametro" && (
          <div className="text">
            <MantenimientoParametro onClose={() => setActiveComponent(null)} />
          </div>
        )}

          {/*Mantenimiento departamento*/}
          {activeComponent === "MantenimientoDepartamento" && (
          <div className="text">
            <MantenimientoDepartamento onClose={() => setActiveComponent(null)} />
          </div>
        )}

          {/*Mantenimiento genero*/}
          {activeComponent === "MantenimientoGenero" && (
          <div className="text">
            <MantenimientoGenero onClose={() => setActiveComponent(null)} />
          </div>
        )}

        {/*Mantenimiento Area*/}
        {activeComponent === "MantenimientoArea" && (
          <div className="text">
            <MantenimientoArea onClose={() => setActiveComponent(null)} />
          </div>
        )}

        {/*Mantenimiento estado civil*/}
        {activeComponent === "MantenimientoEstadoCivil" && (
          <div className="text">
            <MantenimientoEstadoCivil onClose={() => setActiveComponent(null)} />
          </div>
        )}

        {/*Mantenimiento Puestos*/}
        {activeComponent === "MantenimientoPuesto" && (
          <div className="text">
            <MantenimientoPuesto onClose={() => setActiveComponent(null)} />
          </div>
        )}
        
        {/*Mantenimiento tipo telefono*/}
        {activeComponent === "MantenimientoTipoTelefono" && (
          <div className="text">
            <MantenimientoTipoTelefono onClose={() => setActiveComponent(null)} />
          </div>
        )}

        {/*Mantenimiento tipo telefono*/}
        {activeComponent === "MantenimientoEstado" && (
          <div className="text">
            <MantenimientoEstado onClose={() => setActiveComponent(null)} />
          </div>
        )}



      </section>
    </div>
  );
};

export default Dashboard;

 