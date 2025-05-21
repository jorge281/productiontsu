"use client";

import React, { useEffect,useState } from 'react';

import Image from 'next/image'
import Cookies from 'js-cookie';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { useForm, Controller } from 'react-hook-form';
import Alert from 'react-bootstrap/Alert';

export default function Home() {

    const { handleSubmit, control , setValue , formState: { errors } } = useForm();

    const formatoMoneda = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0, // Puedes ajustar la cantidad de decimales según tus necesidades
    });

    const [mostrarMeta, setMostrarMeta] = useState(false);
    const [meta, setMeta] = useState('0');
    const [ventas, setVentas] = useState('0');
    const [cumplimientoMeta, setcumplimientoMeta] = useState('0');

    const [mostrarAlerta, setMostrarAlerta] = useState(false),
	//mensaje de la alerta
	[mensajeAlerta, setMensajeAlerta] = useState('Validando credenciales...'),
	//border de la alerta
	[colorBorde, setColorBorde] = useState('#51a9d3'),
	//fondo de la alerta
    [colorFondo, setColorFondo] = useState('#bdeaff'),
    //disabled del input
    [inputDeshabilitado, setInputDeshabilitado] = useState(false);
    
    const [usuario, setUsuario] = useState({ 
		nombre : '',
        perfil : '',
        foto   : '',
        user   : ''
	});

    const [dataForm, setDataForm] = useState({
        documento : '',
        nombre    : '',
        email     : '',
        telefono  : ''
    })

    const onSubmit = async (data: any) => {

        setInputDeshabilitado(true);
		setMostrarAlerta(true);

		setColorBorde('#51a9d3');
		setColorFondo('#bdeaff');
		setMensajeAlerta('Guardando cambios...');

        const datosDeLogin = {
            telefono : data.telefono,
            usuario  : usuario.user,
            nombre   : data.nombre,
            email    : data.email
        };

        await axios.post(process.env.ENDPOINT_API+'/user/editInf',{params: datosDeLogin}).then(response => {

            
	    	setInputDeshabilitado(false);
			setColorBorde(response.data.bordercolor);
			setColorFondo(response.data.background);
			setMensajeAlerta(response.data.message);

            // Espera 5 segundos
			setTimeout(()=>{
				// cierra la alerta
				setMostrarAlerta(false);
			}, 3000);
		});
    }

    useEffect(() => {

        const fetchData = async (usuarioId) => {
            const datosDeLogin = {
				usuario: usuarioId,
			};
            const responseServer = await axios.post(process.env.ENDPOINT_API+'/user/inf',{params: datosDeLogin});
            setDataForm({
                documento : responseServer['data']['data']['document'],
                nombre    : responseServer['data']['data']['name'],
                email     : responseServer['data']['data']['email'],
                telefono  : responseServer['data']['data']['phone']
            });
            setValue('nombre', responseServer['data']['data']['name']);
            setValue('email', responseServer['data']['data']['email']);
            setValue('telefono', responseServer['data']['data']['phone']);

            //validar si es una asesor
            const validateAdviser =  await axios.post(process.env.ENDPOINT_API+'/adviser/validate',{usuario: usuarioId});
            if(validateAdviser.data.flash){
                const fechaActual = new Date();
                const numeroDeMes = fechaActual.getMonth() + 1;
                const anoActual = fechaActual.getFullYear();
                await axios.post(process.env.ENDPOINT_API+'/adviser/meta',{
                    usuario : usuarioId,
                    type    : 1,
                    month   : numeroDeMes,
                    year    : anoActual
                }).then(response => {
                    setMeta(formatoMoneda.format(response.data.meta))
                    setVentas(formatoMoneda.format(response.data.cumplimiento))
                    let porcentaje = (response.data.cumplimiento*100)/response.data.meta;
                    setcumplimientoMeta(porcentaje.toFixed(2));
                    setMostrarMeta(true);
                })
            };
        }

        // Obtener el valor de una cookie
        const token = Cookies.get('tokenLogin');
        if(token != undefined){
            const jwt = token.split('=')[1];
    
            const [headerBase64, payloadBase64, signature] = jwt.split('.');
    
            // Decodificar las partes Base64
            const header = JSON.parse(Buffer.from(headerBase64, 'base64').toString('utf-8'));
            const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf-8'));
    
            // Crear un objeto JSON con la información decodificada
            const decodedToken = {
                header,
                payload,
                signature
            };
    
            const palabras = decodedToken.payload.nombre.split(' ');
            const primerNombre = palabras[0];
            const primerApellido = palabras.length > 1 ? palabras[1] : '';
            
            setUsuario({
                nombre : primerNombre+' '+primerApellido,
                perfil : decodedToken.payload.perfil,
                foto   : process.env.ENDPOINT_API+'/static/fotoUser/perfil.jpg',
                user   : decodedToken.payload.user
            });
            fetchData(decodedToken.payload.user);
        }

        
        
        
    },[])
  
    return (
        <div className="container-xxl flex-grow-1 container-p-y">
            <div className="row">
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="d-flex align-items-start align-items-sm-center gap-4">
                            <Image
                                src={usuario.foto}
                                alt="Logo"
                                className='d-block rounded'
                                id="uploadedAvatar"
                                width={100}
                                height={100}
                                priority
                            />
                            {mostrarMeta ? (
                                <div className="button-wrapper">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <span className="badge bg-label-primary">Tu Meta</span>
                                            <div className="d-flex justify-content-center">
                                                <h1 className="display-5 mb-0 text-primary" style={{marginLeft: '15px'}}>{meta}</h1>
                                                <sub className="fs-6 pricing-duration mt-auto mb-3">/Febrero</sub>
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mb-1" style={{marginTop: "16px"}}>
                                            <span>Seguimiento</span>
                                            <span>{cumplimientoMeta}% Completada</span>
                                        </div>
                                        <div className="progress mb-1">
                                            <div
                                                className="progress-bar"
                                                role="progressbar"
                                                aria-valuenow={cumplimientoMeta}
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                                style={{ width: `${cumplimientoMeta}%` }}
                                            ></div>
                                        </div>
                                        {ventas}
                                    </div>
                                </div>
                            ): null}
                        </div>
                    </div>
                    <hr className="my-0" />
                    <div className="card-body">
                        <form id="formAccountSettings" onSubmit={handleSubmit(onSubmit)}>
                            <div className="row">
                                <div className="col-12">
                                    <Alert
                                        variant="success"
                                        show={mostrarAlerta}
                                        style={{
                                            border: `2px solid ${colorBorde}`,
                                            backgroundColor: colorFondo,
                                            color: '#222d32',
                                            width: '80%',
                                            margin: 'auto',
                                            marginTop: '10px',
                                            textAlign: 'center'
                                        }}
                                        onClose={() => setMostrarAlerta(false)}
                                        dismissible
                                    >
                                        {mensajeAlerta}
                                    </Alert>
				        		</div>
                                <div className="mb-12 col-md-12">
                                    <label  className="form-label">Documento</label>
                                    <input className="form-control" type="text" name="lastName" id="lastName" value={dataForm.documento} disabled />
                                </div>
                                <div className="mb-3 col-md-6">
                                    <label htmlFor="email" className="form-label">Nombre</label>
                                    <Controller
                                        name="nombre"
                                        control={control}
                                        disabled={inputDeshabilitado}
                                        defaultValue={dataForm.nombre}
                                        rules={{ required: 'Campo obligatorio' }}
                                        render={({ field }) => <input  type="text" disabled={inputDeshabilitado} style={{ borderColor: errors.nombre ? 'red' : '',marginBottom: '3px'}} placeholder="Ingresa tu nombre" className="form-control" {...field} />}
                                    />
                                    {errors && errors.nombre && typeof errors.nombre.message === 'string' && (
                                        <p style={{marginBottom:'0px',textAlign: 'right',padding: '0px'}} className="errorAlert">
                                            <span style={{background: '#ffc0c0',padding: '1px 10px',border: '1px solid red'}}>
                                                {errors.nombre.message}
                                            </span>
                                        </p>
                                    )}
                                </div>
                          
                                <div className="mb-3 col-md-6">
                                    <label htmlFor="email" className="form-label">Email</label>
                                    <Controller
                                        name="email"
                                        control={control}
                                        disabled={inputDeshabilitado}
                                        rules={{ 
                                            required: 'Campo obligatorio',
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                                                message: 'Ingrese un E-mail válido',
                                            },
                                            maxLength: {
                                                value: 100,
                                                message: 'Máximo 100 dígitos permitidos',
                                            } 
                                        }}
                                        render={({ field }) => <input disabled={inputDeshabilitado} type="text" style={{ borderColor: errors.email ? 'red' : '',marginBottom: '3px'}} placeholder="Ingresa tu correo" className="form-control" {...field} />}
                                    />
                                    {errors && errors.email && typeof errors.email.message === 'string' && (
                                        <p style={{marginBottom:'0px',textAlign: 'right',padding: '0px'}} className="errorAlert">
                                            <span style={{background: '#ffc0c0',padding: '1px 10px',border: '1px solid red'}}>
                                                {errors.email.message}
                                            </span>
                                        </p>
                                    )}
                                </div>
                                <div className="mb-12 col-md-12">
                                    <label htmlFor="email" className="form-label">Telefono</label>
                                    <Controller
                                        name="telefono"
                                        control={control}
                                        disabled={inputDeshabilitado}
                                        rules={{ 
                                            required: 'Campo obligatorio',
                                            pattern: {
                                                value: /^[0-9]*$/,
                                                message: 'Ingrese solo números',
                                            },
                                            maxLength: {
                                                   value: 20,
                                                   message: 'Máximo 20 dígitos permitidos',
                                            } 
                                        }}
                                        render={({ field }) => <input type="text" disabled={inputDeshabilitado} style={{ borderColor: errors.telefono ? 'red' : '',marginBottom: '3px'}} placeholder="Ingresa tu telefono" className="form-control" {...field} />}
                                    />
                                    {errors && errors.telefono && typeof errors.telefono.message === 'string' && (
                                        <p style={{marginBottom:'0px',textAlign: 'right',padding: '0px'}} className="errorAlert">
                                            <span style={{background: '#ffc0c0',padding: '1px 10px',border: '1px solid red'}}>
                                                {errors.telefono.message}
                                            </span>
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="mt-2">
                                <button type="submit" className="btn btn-primary me-2">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}