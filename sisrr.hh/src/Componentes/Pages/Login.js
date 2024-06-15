// Login.js
import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import InicioSesion from "./InicioSesion";
import Registro from "./Registro";
import "./login.css";

const Login = () => {
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    const signUpButton = containerRef.current.querySelector("#signUp");
    const signInButton = containerRef.current.querySelector("#signIn");

    signUpButton.addEventListener("click", () => {
      containerRef.current.classList.add("right-panel-active");
      setIsSignUp(true);
    });

    signInButton.addEventListener("click", () => {
      containerRef.current.classList.remove("right-panel-active");
      setIsSignUp(false);
    });
  }, []);

  return (
    <div
      className={`container ${isSignUp ? "right-panel-active" : ""}`}
      id="container"
      ref={containerRef}
    >
      <InicioSesion />
      {isSignUp && <Registro />}
      <div className="overlay-container">
        <div className="overlay">
          <div className="overlay-panel overlay-left">
            <h1>¡Bienvenido Nuevamente a GRUPO CONSISA!</h1>
            <p>Inicie Sesión con su cuenta</p>
            <button className="ghost" id="signIn">
              Inicia sesión
            </button>
          </div>
          <div className="overlay-panel overlay-right">
            <h1>Bienvenido a GRUPO CONSISA</h1>
            <p>¿No tienes cuenta?</p>
            <button className="ghost" id="signUp">
              Registrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
