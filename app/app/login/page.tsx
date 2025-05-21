"use client"

//librerias
import Image from 'next/image'
import axios from 'axios';
import React, { useState,useEffect } from "react";
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/router';
import { server } from "./server.js";

//css
import Alert from 'react-bootstrap/Alert';

var tokenCargo = 0;

export default function Home() {
  
  const { handleSubmit, control , formState: { errors } } = useForm();

  const [mostrarAlerta, setMostrarAlerta] = useState(false),
	//mensaje de la alerta
	[mensajeAlerta, setMensajeAlerta] = useState('Validando credenciales...'),
	//border de la alerta
	[colorBorde, setColorBorde] = useState('#51a9d3'),
	//fondo de la alerta
  [colorFondo, setColorFondo] = useState('#bdeaff'),
  //disabled del input
  [inputDeshabilitado, setInputDeshabilitado] = useState(false);

  useEffect(() => {

    if(tokenCargo == 0){

      tokenCargo = 1;
      //const router = useRouter();
    }

  })

  const onSubmit = async (data: any) => {
    
    setMostrarAlerta(true);

    // Maneja los datos del formulario aquí
    const datosDeLogin = {
      usuario: data.usuario,
      password: data.password
    };
    
    

    await axios.post(process.env.ENDPOINT_API+'/authentication/login',{params: datosDeLogin}).then(async(responseServer) => {
      if(responseServer.data.flag == 3){
        await server(responseServer.data.token).then(
          setTimeout(() => {
            window.location.href = '/CRM2'
          }, 1000)
        );
      }else{
        setColorBorde(responseServer.data.bordercolor);
        setColorFondo(responseServer.data.background);
        setMensajeAlerta(responseServer.data.message);
      }
    }).catch(error => {
      // Manejar el error aquí
      if (error.response) {
        setColorBorde('#ff6a6a');
        setColorFondo('#ffbdbd');
        setMensajeAlerta('Error de respuesta del servidor');
      } else if (error.request) {
        setColorBorde('#ff6a6a');
        setColorFondo('#ffbdbd');
        setMensajeAlerta('No se recibió respuesta del servidor');
      } else {
        setColorBorde('#ff6a6a');
        setColorFondo('#ffbdbd');
        setMensajeAlerta('Error de conexión');
      }
    });



    /*axios.post('/api/login', datosDeLogin)
      .then(response => {
        //si es un usuario valido
			  if(response.data.flag == 3){

			  	//redirecciona el usuario al panel
			    window.location.href = '/';

			  }else{

			   	setColorBorde(response.data.bordercolor);
			   	setColorFondo(response.data.background);
			   	setMensajeAlerta(response.data.message);
			    
        }
      })
      .catch(error => {
        // Manejar el error aquí
        if (error.response) {
          setColorBorde('#ff6a6a');
          setColorFondo('#ffbdbd');
          setMensajeAlerta('Error de respuesta del servidor');
        } else if (error.request) {
          setColorBorde('#ff6a6a');
          setColorFondo('#ffbdbd');
          setMensajeAlerta('No se recibió respuesta del servidor');
        } else {
          setColorBorde('#ff6a6a');
          setColorFondo('#ffbdbd');
          setMensajeAlerta('Error de conexión');
        }
      });*/

  }

  async function login(){
    const response = await axios.post('/api/login');
  }
  
  return (
    <div className="container-xxl">
      <div className="authentication-wrapper authentication-basic container-p-y">
        <div className="authentication-inner">
          <div className="card">
            <div className="card-body">
              <div className="app-brand justify-content-center">
                <a href="index.html" className="app-brand-link gap-2">
                  <span className="app-brand-logo demo">
                    <Image
                      src="/img/logo.svg"
                      alt="Logo"
                      style={{ width: '60%', height: 'auto', margin:'auto' }}
                      width={100}
                      height={100}
                      priority
                    />
                  </span>
                </a>
              </div>
              <form id="formAuthentication" onSubmit={handleSubmit(onSubmit)} className="mb-3" action="index.html">
                <Alert
							    variant="success"
							    show={mostrarAlerta}
							    style={{
							      border: `2px solid ${colorBorde}`,
							      backgroundColor: colorFondo,
							      color: '#222d32'
							    }}
							    onClose={() => setMostrarAlerta(false)}
							    dismissible
							  >
							    {mensajeAlerta}
							  </Alert>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Usuario</label>
                  <Controller
									  name="usuario"
									  control={control}
									  rules={{ required: 'Campo obligatorio' }}
									  render={({ field }) => <input type="text" style={{ borderColor: errors.usuario ? 'red' : '',marginBottom: '3px'}} placeholder="Ingresa tu usuario" className="form-control" {...field} />}
									/>
									{errors && errors.usuario && typeof errors.usuario.message === 'string' && (
									  <p style={{marginBottom:'0px',textAlign: 'right',padding: '0px'}} className="errorAlert">
									    <span style={{background: '#ffc0c0',padding: '1px 10px',border: '1px solid red'}}>
									      {errors.usuario.message}
									    </span>
									  </p>
									)}
                </div>
                <div className="mb-3 form-password-toggle">
                  <div className="d-flex justify-content-between">
                    <label className="form-label" htmlFor="password">Contraseña</label>
                    <a style={{display:'none'}} href="auth-forgot-password-basic.html">
                      <small>Has olvidado tu contraseña?</small>
                    </a>
                  </div>
                  <div>
                    <Controller
                      name="password"
                      control={control}
                      rules={{ required: 'Campo obligatorio' }}
                      render={({ field }) => <input type="password" style={{ borderColor: errors.password ? 'red' : '',marginBottom: '3px'}} placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;" className="form-control" {...field} />}
                    />
                    {errors && errors.password && typeof errors.password.message === 'string' && (
                      <p style={{marginBottom:'0px',textAlign: 'right',padding: '0px'}} className="errorAlert">
                        <span style={{background: '#ffc0c0',padding: '1px 10px',border: '1px solid red'}}>
                          {errors.password.message}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="mb-3">
                  <button className="btn btn-primary d-grid w-100" type="submit">Ingresar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
