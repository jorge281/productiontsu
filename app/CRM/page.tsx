"use client"

import React, { use, useEffect, useState,useCallback, ChangeEvent,useRef } from 'react';
import Image from 'next/image'
import Cookies from 'js-cookie';
import axios from 'axios';
import EmojiPicker from 'react-input-emoji';
import 'emojionearea/dist/emojionearea.css';
import './style.css'

export default function Home() {

    const img = process.env.ENDPOINT_API+'/static/fotoUser/perfil.jpg';
    type formTicket = {id: string; name: string;number: string, image: string};
    const img2 = process.env.ENDPOINT_API+'/static/multimedia/fondo.svg';
    const [menuSeleccionado, setMenuSeleccionado] = useState(1);
    const divStyle = {
        backgroundImage: `url(${img2})`,
        backgroundSize: 'cover', // Ajusta el tamaño de la imagen para cubrir el div
        backgroundPosition: 'center', // Centra la imagen en el div
        width: '100%',
        height: 'calc(100% - 10em)',
        borderBottom: '1px solid #b7b7b7', // Ajusta la altura según tus necesidades
        // Otros estilos según tus necesidades
    };

    const [usuario, setUsuario] = useState({ 
		nombre : '',
        perfil : '',
        foto   : '',
        user   : ''
	});

    const [ticketPendientes,setticketPendientes] = useState<formTicket[]>([]);

    
    interface EmojiOneAreaProps {
        onEmojiSelect: (text: string) => void;
    }
    
    let tokenLoading = 0;
    let tokenLoading2 = 0;
    const EmojiOneArea: React.FC<EmojiOneAreaProps> = ({ onEmojiSelect }) => {
        const textareaRef = useRef<HTMLTextAreaElement>(null);
    
        useEffect(() => {
            try {
                if(tokenLoading2 == 0){
                    tokenLoading2 = 1;
                    const $ = require('jquery');
                    const EmojiOneArea = require('emojionearea');
                    const jequeyText = require('jquery-textcomplete');
        
                    // Initialize EmojiOneArea
                    $(textareaRef.current).emojioneArea({
                        // Configuración adicional según sea necesario
                    });
                }
            } catch (error) {
                // Manejar el error, si es necesario
                console.error('Error initializing EmojiOneArea:', error);
            }
        }, [tokenLoading2]);
    
        return <textarea ref={textareaRef} />;
    };
    

    useEffect(() => {

        if(tokenLoading == 0){
            tokenLoading = 1;
            const fetchData = async (usuarioId) => {

                //cargar los tickets pendientes por aceptar
                cargarTicketsPendientes(usuarioId)
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
        }
    },[tokenLoading])

    /*
        creador: jorge luis castrillon
        fecha: 14 de marzo 2024
        objetivo: cargar los tickets pendientes por aceptar de un asesor
    */
    async function cargarTicketsPendientes(id){
        const data =  await axios.post(process.env.ENDPOINT_API+'/whatsapp/ticketPendientes',{asesor: id});
        const ticket = data.data.tickets;
        for (var i = ticket.length - 1; i >= 0; i--) {
            if(ticket[i].image == 'undefined'){
                ticket[i].image = img;
            }
        }
        setticketPendientes(ticket);
    }

    const cambioMenuPrincipal = (menu) => {
        setMenuSeleccionado(menu);
        // Puedes realizar otras acciones relacionadas con el cambio de menú aquí
    };

    return (
        <>
        <div className="container-xxl flex-grow-1 container-p-y">
            <div className="row">
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-12">
                                <div className="row">
                                    <div className={`col ${menuSeleccionado === 1 ? 'menu-activo' : ''}`} onClick={() => cambioMenuPrincipal(1)} style={{textAlign:'center',borderRight: '3px solid #b7b7b7',padding:'5px',cursor:'pointer'}}>
                                        <span style={{textAlign:'left',width: '100%',display: 'block',fontSize:'12px'}}>Inbox:</span>
                                        <i className="menu-icon tf-icons bx bxs-inbox"></i>
                                        <br></br>
                                        <span style={{background: 'red',color: 'white',borderRadius: '20px',padding: '3px 10px',fontSize: '12px'}}>20 Mess. - 2 Conv.</span>
                                    </div>
                                    <div className={`col ${menuSeleccionado === 2 ? 'menu-activo' : ''}`} onClick={() => cambioMenuPrincipal(2)} style={{textAlign:'center',borderRight: '3px solid #b7b7b7',cursor:'pointer'}}>
                                        <span style={{textAlign:'left',width: '100%',display: 'block',fontSize:'12px'}}>Pagos:</span>
                                        <i className="menu-icon tf-icons bx bx-dollar"></i>
                                        <br></br>
                                    </div>
                                    <div className={`col ${menuSeleccionado === 3 ? 'menu-activo' : ''}`} onClick={() => cambioMenuPrincipal(3)} style={{textAlign:'center',borderRight: '3px solid #b7b7b7',cursor:'pointer'}}>
                                        <span style={{textAlign:'left',width: '100%',display: 'block',fontSize:'12px'}}>En Producción:</span>
                                        <i className="menu-icon tf-icons bx bx-building-house"></i>
                                        <br></br>
                                        <span style={{background: 'red',color: 'white',borderRadius: '20px',padding: '3px 10px',fontSize: '12px'}}>20 Mess. - 2 Conv.</span>
                                    </div>
                                    <div className={`col ${menuSeleccionado === 4 ? 'menu-activo' : ''}`} onClick={() => cambioMenuPrincipal(4)} style={{textAlign:'center',borderRight: '3px solid #b7b7b7',cursor:'pointer'}}>
                                        <span style={{textAlign:'left',width: '100%',display: 'block',fontSize:'12px'}}>Clientes:</span>
                                        <i className="menu-icon tf-icons bx bxs-user-account"></i>
                                        <br></br>
                                    </div>
                                    <div className={`col ${menuSeleccionado === 5 ? 'menu-activo' : ''}`} onClick={() => cambioMenuPrincipal(5)} style={{textAlign:'center',cursor:'pointer'}}>
                                        <span style={{textAlign:'left',width: '100%',display: 'block',fontSize:'12px'}}>No Interesados:</span>
                                        <i className="menu-icon tf-icons bx bx-pause-circle"></i>
                                        <br></br>
                                    </div>
                                </div>
                            </div>
                            <div className="col-4" style={{border: '1px solid #b7b7b7',height: '100vh',maxHeight: '100vh',marginTop: '10px'}}>
                                <div className={`${menuSeleccionado === 1 ? 'div-activo' : ''}`} style={{display:'none'}}>
                                    <div className="row">
                                        <div className="col" style={{padding: '5px',textAlign: 'center'}}>
                                            Trabajando en
                                        </div>
                                        <div className="col" style={{background: '#b7b7b7',color: '#333',padding: '5px',textAlign: 'center'}}>
                                            Cola
                                        </div>
                                    </div>
                                    <div className="row" style={{maxHeight: '93%'}}>
                                        <div className='col-6' style={{textAlign:'center',marginTop:'10px',marginBottom:'10px'}}>
                                            <span style={{background: '#0080004d',color: '#333',border:'2px solid green',borderRadius: '20px',padding: '3px 10px',fontSize: '12px'}}>Pendiente pago</span>
                                        </div>
                                        <div className='col-6' style={{textAlign:'center',marginTop:'10px',marginBottom:'10px'}}>
                                            <span style={{background: '#806a004d',color: '#333',border:'2px solid #806400',borderRadius: '20px',padding: '3px 10px',fontSize: '12px'}}>Interesados</span>
                                        </div>
                                        <div className='col-12' style={{maxHeight: '67vh',overflow:'auto',padding:'0px 7px'}}>
                                        {ticketPendientes && ticketPendientes.length > 0 ? (
                                            ticketPendientes.map((dato2) => (
                                                <div className='row' style={{width:'100%',borderLeft: '2px solid green',background: '#0080004d',margin: '5px 0px',padding: '5px'}}>
                                                
                                                    <div className='col-2' style={{padding:'0px'}}>
                                                        <Image
                                                            src={dato2.image}
                                                            alt="Logo"
                                                            className='w-px-40 rounded-circle'
                                                            width={50}
                                                            height={50}
                                                            style={{marginTop:'9px'}}
                                                            priority
                                                        />
                                                    </div>
                                                    <div className='col-10' style={{padding:'0px'}}>
                                                        <h6 style={{marginBottom:'0px'}}>{dato2.name}</h6>
                                                        <p style={{marginBottom: '0px',background: '#92bf92',padding: '0px 10px',fontSize: '14px',marginTop: '4px'}}><i className='bx bx-check-double'></i> Hola. Te tengo una bue...</p>
                                                        <span style={{fontSize: '12px',textAlign: 'right',width: '100%',display: 'block'}}>3:00 Pm</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            // Aquí puedes poner el contenido que deseas mostrar si no hay tickets pendientes
                                            <p>No hay tickets pendientes</p>
                                        )}
                                            <div className='row' style={{width:'100%',borderLeft: '2px solid green',background: '#0080004d',margin: '5px 0px',padding: '5px'}}>
                                                
                                                <div className='col-2' style={{padding:'0px'}}>
                                                    <Image
                                                        src={img}
                                                        alt="Logo"
                                                        className='w-px-40 rounded-circle'
                                                        width={50}
                                                        height={50}
                                                        style={{marginTop:'9px'}}
                                                        priority
                                                    />
                                                </div>
                                                <div className='col-10' style={{padding:'0px'}}>
                                                    <h6 style={{marginBottom:'0px'}}>314 855 2277</h6>
                                                    <p style={{marginBottom: '0px',background: '#92bf92',padding: '0px 10px',fontSize: '14px',marginTop: '4px'}}><i className='bx bx-check-double'></i> Hola. Te tengo una bue...</p>
                                                    <span style={{fontSize: '12px',textAlign: 'right',width: '100%',display: 'block'}}>3:00 Pm</span>
                                                </div>
                                            </div>
                                            <div className='row' style={{width:'100%',borderLeft: '2px solid green',background: '#0080004d',margin: '5px 0px',padding: '5px'}}>
                                                <div className='col-2' style={{padding:'0px'}}>
                                                    <Image
                                                        src={img}
                                                        alt="Logo"
                                                        className='w-px-40 rounded-circle'
                                                        width={50}
                                                        height={50}
                                                        style={{marginTop:'9px'}}
                                                        priority
                                                    />
                                                </div>
                                                <div className='col-10' style={{padding:'0px'}}>
                                                    <h6 style={{marginBottom:'0px'}}>314 855 2277</h6>
                                                    <p style={{marginBottom: '0px',background: '#92bf92',padding: '0px 10px',fontSize: '14px',marginTop: '4px'}}><i className='bx bx-check-double'></i> Hola. Te tengo una bue...</p>
                                                    <span style={{fontSize: '12px',textAlign: 'right',width: '100%',display: 'block'}}>3:00 Pm</span>
                                                </div>
                                            </div>
                                            <div className='row' style={{width:'100%',borderLeft: '2px solid #806400',background: '#806a004d',margin: '5px 0px',padding: '5px'}}>
                                                <div className='col-2' style={{padding:'0px'}}>
                                                    <Image
                                                        src={img}
                                                        alt="Logo"
                                                        className='w-px-40 rounded-circle'
                                                        width={50}
                                                        height={50}
                                                        style={{marginTop:'9px'}}
                                                        priority
                                                    />
                                                </div>
                                                <div className='col-10' style={{padding:'0px'}}>
                                                    <h6 style={{marginBottom:'0px'}}>314 855 2277</h6>
                                                    <p style={{marginBottom: '0px',background: '#d1bb6d',padding: '0px 10px',fontSize: '14px',marginTop: '4px'}}><i className='bx bx-check-double'></i> Hola. Te tengo una bue...</p>
                                                    <span style={{fontSize: '12px',textAlign: 'right',width: '100%',display: 'block'}}>3:00 Pm</span>
                                                </div>
                                            </div>
                                            <div className='row' style={{width:'100%',borderLeft: '2px solid #b7b7b7',background: '#adadad4d',margin: '5px 0px',padding: '5px'}}>
                                                <div className='col-2' style={{padding:'0px'}}>
                                                    <Image
                                                        src={img}
                                                        alt="Logo"
                                                        className='w-px-40 rounded-circle'
                                                        width={50}
                                                        height={50}
                                                        style={{marginTop:'9px'}}
                                                        priority
                                                    />
                                                </div>
                                                <div className='col-10' style={{padding:'0px'}}>
                                                    <h6 style={{marginBottom:'0px'}}>314 855 2277</h6>
                                                    <p style={{marginBottom: '0px',background: '#d3d3d3',padding: '0px 10px',fontSize: '14px',marginTop: '4px'}}><i className='bx bx-check-double'></i> Hola. Te tengo una bue...</p>
                                                    <span style={{fontSize: '12px',textAlign: 'right',width: '100%',display: 'block'}}>3:00 Pm</span>
                                                </div>
                                            </div>
                                            
                                        </div>
                                    </div>
                                </div>
                                <div className={`${menuSeleccionado !== 1 ? 'div-activo' : ''}`} style={{display:'none'}}>
                                    <div className="row" style={{maxHeight: '93%'}}>
                                        <div className='col-12' style={{maxHeight: '67vh',overflow:'auto',padding:'0px 7px'}}>
                                            <div className='row' style={{width:'100%',borderLeft: '2px solid green',background: '#0080004d',margin: '5px 0px',padding: '5px'}}>
                                                <div className='col-2' style={{padding:'0px'}}>
                                                    <Image
                                                        src={img}
                                                        alt="Logo"
                                                        className='w-px-40 rounded-circle'
                                                        width={50}
                                                        height={50}
                                                        style={{marginTop:'9px'}}
                                                        priority
                                                    />
                                                </div>
                                                <div className='col-10' style={{padding:'0px'}}>
                                                    <h6 style={{marginBottom:'0px'}}>314 855 2277</h6>
                                                    <p style={{marginBottom: '0px',background: '#92bf92',padding: '0px 10px',fontSize: '14px',marginTop: '4px'}}><i className='bx bx-check-double'></i> Hola. Te tengo una bue...</p>
                                                    <span style={{fontSize: '12px',textAlign: 'right',width: '100%',display: 'block'}}>3:00 Pm</span>
                                                </div>
                                            </div>
                                            <div className='row' style={{width:'100%',borderLeft: '2px solid green',background: '#0080004d',margin: '5px 0px',padding: '5px'}}>
                                                <div className='col-2' style={{padding:'0px'}}>
                                                    <Image
                                                        src={img}
                                                        alt="Logo"
                                                        className='w-px-40 rounded-circle'
                                                        width={50}
                                                        height={50}
                                                        style={{marginTop:'9px'}}
                                                        priority
                                                    />
                                                </div>
                                                <div className='col-10' style={{padding:'0px'}}>
                                                    <h6 style={{marginBottom:'0px'}}>314 855 2277</h6>
                                                    <p style={{marginBottom: '0px',background: '#92bf92',padding: '0px 10px',fontSize: '14px',marginTop: '4px'}}><i className='bx bx-check-double'></i> Hola. Te tengo una bue...</p>
                                                    <span style={{fontSize: '12px',textAlign: 'right',width: '100%',display: 'block'}}>3:00 Pm</span>
                                                </div>
                                            </div>
                                            <div className='row' style={{width:'100%',borderLeft: '2px solid #806400',background: '#806a004d',margin: '5px 0px',padding: '5px'}}>
                                                <div className='col-2' style={{padding:'0px'}}>
                                                    <Image
                                                        src={img}
                                                        alt="Logo"
                                                        className='w-px-40 rounded-circle'
                                                        width={50}
                                                        height={50}
                                                        style={{marginTop:'9px'}}
                                                        priority
                                                    />
                                                </div>
                                                <div className='col-10' style={{padding:'0px'}}>
                                                    <h6 style={{marginBottom:'0px'}}>314 855 2277</h6>
                                                    <p style={{marginBottom: '0px',background: '#d1bb6d',padding: '0px 10px',fontSize: '14px',marginTop: '4px'}}><i className='bx bx-check-double'></i> Hola. Te tengo una bue...</p>
                                                    <span style={{fontSize: '12px',textAlign: 'right',width: '100%',display: 'block'}}>3:00 Pm</span>
                                                </div>
                                            </div>
                                            <div className='row' style={{width:'100%',borderLeft: '2px solid #b7b7b7',background: '#adadad4d',margin: '5px 0px',padding: '5px'}}>
                                                <div className='col-2' style={{padding:'0px'}}>
                                                    <Image
                                                        src={img}
                                                        alt="Logo"
                                                        className='w-px-40 rounded-circle'
                                                        width={50}
                                                        height={50}
                                                        style={{marginTop:'9px'}}
                                                        priority
                                                    />
                                                </div>
                                                <div className='col-10' style={{padding:'0px'}}>
                                                    <h6 style={{marginBottom:'0px'}}>314 855 2277</h6>
                                                    <p style={{marginBottom: '0px',background: '#d3d3d3',padding: '0px 10px',fontSize: '14px',marginTop: '4px'}}><i className='bx bx-check-double'></i> Hola. Te tengo una bue...</p>
                                                    <span style={{fontSize: '12px',textAlign: 'right',width: '100%',display: 'block'}}>3:00 Pm</span>
                                                </div>
                                            </div>
                                            
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-8" style={{padding:'0px',border: '1px solid #b7b7b7',height: '100vh',maxHeight: '100vh',marginTop: '10px'}}>
                                <div style={divStyle}>
                                    
                                </div>
                                <div className='row'>
                                    <div className='col-12' style={{paddingTop:'3px',paddingRight:'17px',paddingLeft:'17px'}}>
                                        <EmojiOneArea onEmojiSelect={function (text: string): void {
                                            throw new Error('Function not implemented.');
                                        }}/>
                                        <div style={{textAlign: 'right',marginTop: '3px'}}>
                                            <span style={{background: 'rgb(209, 209, 209)',border: '1px solid rgb(147, 147, 147)',padding: '1px 10px',marginTop: '0px',marginBottom: '4px',display: 'inline-block',width: 'fit-content'}}>
                                                <i style={{transform: 'rotate(120deg)'}} className='bx bx-paperclip'></i> Archivos
                                            </span>
                                            <span style={{background: 'rgb(209, 209, 209)',border: '1px solid rgb(147, 147, 147)',padding: '1px 10px',marginTop: '0px',marginBottom: '4px',display: 'inline-block',width: 'fit-content',marginLeft:'4px'}}>
                                                <i className='bx bx-microphone'></i> Audio
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}