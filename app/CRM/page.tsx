"use client"

import React, { use, useEffect, useState, useCallback, ChangeEvent, useRef } from 'react';
//stylos
import './style.css'
//librerias
import Image from 'next/image'
import Cookies from 'js-cookie';
import { Menu, MenuItem, IconButton } from '@mui/material';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import EmojiPicker from 'react-input-emoji';
import io from 'socket.io-client';
import { Modal } from 'react-bootstrap';
import 'emojionearea/dist/emojionearea.css';
import Head from 'next/head';
import Recorder from 'recorder-js';
import Form from 'react-bootstrap/Form';
import { FileUploader } from "react-drag-drop-files";
import opusMediaRecorder from 'opus-media-recorder';
import { set } from 'react-hook-form';
import { off } from 'process';
import { useRouter } from 'next/router';
import { url } from 'inspector';


let usuarioId = 1;
let idPlantilla = 0;
let enviandoMensajes = false;
let envioMensajeTexto = true;
let controladorTiempo = "";
let consultado = false;
let tokenLoading3 = 0;
let tokenLoading4 = 0;
let intervaloVentana = null;
let textareaPrueba4 = 0;
let consultandoTickesPrincipal = true;
let banderaConsultandoMessages = false;
let arrAck = [];
let dataFiltros = [];
let urlSelect = '';
let socket = '';
let velocidadTitileo = 0;
let recorder = null;
let idResponderMsg = 0;
let arrcolaEnviandoMessage = [];
let atajosFin = [];
let plantillasFin = [];
let nuevosMensajes = [];
let idRespuesta = 0;
let typeRespuesta = 0;
let multimediaCargada = [];
let idMessage = 0;
let ticketActivo = "";
let offsetMessagesActivos = 0;
let setTicketsConsulta = [];
let setTicketsConsultaGenral2 = [];
let messagesChatFront = [];
let loadingSite = 0;
let mensajesCargadosTicket = [];
let offsetActivo = 0;
let searchBuscador = "";
let textareaPrueba = '';
let menuActivo = 1;
let submenuActivo = 2;
let searchId = [];
let tieneMensajesPendientes = true;
let searchproceso = 1;
let searchmessage = 0;
let searchmessageSinResponder = 0;
let searchfechas = 0;
let filtroFechaLocal = 1;
let setTicketsConsulta2 = [];
let colaMultimedia = [];
let tokenLoading2 = 0;
let terminoDeCargarTickets = true;
let textareaPrueba2 = '';
let idCategoriaMultimediaDetalle = 0;
let itemDetalleMultimedia = 1;

export default function Home() {

    //interfaces
    interface EmojiOneAreaProps {
        onEmojiSelect: (text: string) => void;
    }

    //types
    type formTicket = { id: string; name: string; number: string; image: string; nameLabel: string, unreadMessages: number, timestamp: string, bodyMessage: string, timestampMessage: string, ackMessage: string, ultimoMessageDate: string, ackIcon: string, numberLabel: string, asesor: string, mensajesPendientes: false };
    type formAsesores = { id: string; name: string };
    type formRespuestaRapida = { id: string, text: string };
    type formCategorias = { id: string; name: string };
    type formMultimedia = { id: string; name: string; mediaUrl: string; typeId: string };

    //variables
    const img = process.env.ENDPOINT_API + '/static/fotoUser/avatarWhatsapp.svg';
    const [usuario, setUsuario] = useState({
        nombre: '',
        perfil: '',
        foto: '',
        user: ''
    });
    const [detallePlantilla, setdetallePlantilla] = useState<formMultimedia>()
    const [openMultimedia, setOpenMultimedia] = useState(false);
    const [filtros, setFiltros] = useState(false);
    const [contCreditos, setContCreditos] = useState(0)
    const [resumenCreditos, setResumenCreditos] = useState([])
    const [totalCreditos, setTotalCreditos] = useState(0);
    const [colorMessageVentana, setColorMessageVentana] = useState('rgb(209, 209, 209)');
    const [messageVentana, setMessageVentana] = useState('');
    const messagesRef = useRef(null);
    const [inputName, setinputName] = useState("");
    const [modalEditarInf, setmodalEditarInf] = useState(false);
    const [detallMultimedia, setdetallMultimedia] = useState<formMultimedia>();
    const [modalDetallMultimedia, setmodalDetallMultimedia] = useState(false);
    const [openGaleria, setOpenGaleria] = useState(false);
    const [file, setFile] = useState(null);
    const [flagMasTickets, setFlagMasTickets] = useState(false);
    const [alertFile, setalertFile] = useState(false);
    const [divdetallMultimedia, setdivdetallMultimedia] = useState<formMultimedia>([]);
    const [inputValueAtajo, setInputValueAtajo] = useState('');
    const [inputValuePlantillas, setInputValuePlantillas] = useState('');
    const [recording, setRecording] = useState(false);
    const [divStyleHeight, setdivStyleHeight] = useState('calc(100% - 50px)');
    const [showDropdown, setShowDropdown] = useState(false);
    const [showDropdown2, setShowDropdown2] = useState(false);
    const [banderaConsultandoMultimedia, setBanderaConsultandoMultimedia] = useState(false);
    const [banderaverTodoMultimedia, setbanderaverTodoMultimedia] = useState(false);
    const [categoriasMultimediaDetall, setcategoriasMultimediaDetall] = useState<formCategorias[]>();
    const [categoriasMultimedia, setcategoriasMultimedia] = useState<formCategorias[]>([]);
    const [contenidosMessagesChat, setContenidosMessagesChat] = useState([]);
    const [respuestasRapidas, setrespuestasRapidas] = useState<formRespuestaRapida>();
    const [plantillas, setPlantillas] = useState<formRespuestaRapida>();
    const [modalsubirArchivos, setmodalsubirArchivos] = useState(false);
    const [asesores, setasesores] = useState<formAsesores[]>([]);
    const [ticketAbierto, setticketAbierto] = useState<formTicket>([]);
    const [appMovil, setAppMovil] = useState(false);
    const [consultandoTickets, setConsultandoTickets] = useState(true);
    const [menuSeleccionado, setMenuSeleccionado] = useState(1);
    const [subMenuSelecionado, setsubMenuSelecionado] = useState(2);
    const [heightDiv, setHeightDiv] = useState('calc(100vh - 210px)');
    const [opcionFecha, setOpcionFecha] = useState(true);
    const [selectFiltro, setselectFiltro] = useState(1);
    const [seleFecha, setseleFecha] = useState(1);
    const [anchorEl, setAnchorEl] = useState(null);
    const [chatActivo, setchatActivo] = useState(false);
    const [cargandoMensajes, setCargandoMensajes] = useState(false);
    const [messagesChat, setMessagesChat] = useState([]);

    const [audioChunks, setAudioChunks] = useState([]);
    const [audioURL, setAudioURL] = useState(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioContext, setAudioContext] = useState(null);
    const [analyser, setAnalyser] = useState(null);
    const [canvasContext, setCanvasContext] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const mediaRecorderRef = useRef(null);

    const [multimediaCargada, setMultimediaCargada] = useState([]);

    const [opcionesMenu, setOpcionesMenu] = useState([
        {
            name: 'Inbox',
            id: 1,
            tickets: '',
            icon: 'bx bxs-inbox',
            messages: 0,
            alertMessage: 0,
            conversaciones: 0,
            borderRight: true,
            subMenu: [
                {
                    name: 'Trabajando en',
                    id: 2,
                    subFiltros: [
                        {
                            name: 'Todos',
                            id: 0,
                            borde: '#e1e1e1',
                            contador: 0
                        },
                        {
                            name: 'Interesados',
                            id: 2,
                            borde: '#d1bb6d',
                            contador: 0
                        },
                        {
                            name: 'Pendientes Pagos',
                            id: 3,
                            borde: '#92bf92',
                            contador: 0
                        }
                    ],
                    tickets: 0,
                    messages: 0,
                    conversaciones: 0,
                    alertMessage: 0,
                    orderFecha: false
                },
                {
                    name: 'Cola',
                    id: 1,
                    subFiltros: [],
                    tickets: 0,
                    messages: 0,
                    conversaciones: 0,
                    alertMessage: 0,
                    orderFecha: true
                }
            ],

        },
        {
            name: 'Ps. Pedido',
            id: 2,
            tickets: '',
            icon: 'bx bx-dollar',
            messages: 0,
            alertMessage: 0,
            conversaciones: 0,
            borderRight: true,
            subMenu: [],
            subFiltros: []
        },
        {
            name: 'En Producción',
            id: 3,
            tickets: '',
            icon: 'bx bx-building-house',
            messages: 0,
            alertMessage: 0,
            conversaciones: 0,
            borderRight: true,
            subMenu: [],
            subFiltros: []
        },
        {
            name: 'Despachado',
            id: 4,
            tickets: '',
            icon: 'bx bxs-truck',
            messages: 0,
            alertMessage: 0,
            conversaciones: 0,
            borderRight: true,
            subMenu: [],
            subFiltros: []
        },
        {
            name: 'Clientes',
            id: 5,
            tickets: '',
            icon: 'bx bxs-user-account',
            messages: 0,
            alertMessage: 0,
            conversaciones: 0,
            borderRight: true,
            subMenu: [],
            subFiltros: []
        },
        {
            name: 'No Interesados',
            id: 6,
            tickets: '',
            icon: 'bx bx-pause-circle',
            messages: 0,
            alertMessage: 0,
            conversaciones: 0,
            borderRight: true,
            subMenu: [],
            subFiltros: []
        }
    ])

    // opus-media-recorder options
    const workerOptions = {
        encoderWorkerFactory: function () {
            return new Worker('/js/encoderWorker.umd.js')
        },
        OggOpusEncoderWasmPath: '/js/opus-media-recorder/OggOpusEncoder.wasm',
        WebMOpusEncoderWasmPath: '/js/opus-media-recorder/WebMOpusEncoder.wasm',
    };


    const handleScrollFiltro = (event) => {
        const { scrollTop, clientHeight, scrollHeight } = event.target;
        // Check if user has scrolled to the bottom
        if ((scrollTop + clientHeight + 2) >= scrollHeight) {
            if (consultandoTickesPrincipal == true && terminoDeCargarTickets == true) {
                consultandoTickesPrincipal = false;
                setFlagMasTickets(true);
                if (menuActivo == 1) {
                    if (submenuActivo == 1) {
                        cargarTicketsTrabajando(usuarioId, (offsetActivo + 5), 1)
                    }
                    else if (submenuActivo == 2) {
                        cargarTicketsTrabajando(usuarioId, (offsetActivo + 5), 2)
                    }
                }
                else if (menuActivo == 2) {
                    cargarTicketsTrabajando(usuarioId, (offsetActivo + 5), 3)
                }
                else if (menuActivo == 3) {
                    cargarTicketsTrabajando(usuarioId, (offsetActivo + 5), 4)
                }
                else if (menuActivo == 4) {
                    cargarTicketsTrabajando(usuarioId, (offsetActivo + 5), 5)
                }
                else if (menuActivo == 5) {
                    cargarTicketsTrabajando(usuarioId, (offsetActivo + 5), 5)
                }
                else if (menuActivo == 6) {
                    cargarTicketsTrabajando(usuarioId, (offsetActivo + 5), 7)
                }
            }
        }
    }

    const [ticketsConsulta, setTicketsConsulta] = useState<formTicket>([]);
    const [ticketsConsultaGeneral, setTicketsConsultaGeneral] = useState<formTicket>([]);


    useEffect(() => {
        if (loadingSite == 0) {
            loadingSite = 1;
            const mediaQuery = window.matchMedia('(max-width: 768px)');
            if (mediaQuery.matches) {
                setAppMovil(true);
            };

            const token = Cookies.get('tokenLogin');
            if (token != undefined) {
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
                    nombre: primerNombre + ' ' + primerApellido,
                    perfil: decodedToken.payload.perfil,
                    foto: process.env.ENDPOINT_API + "/static/" + decodedToken.payload.foto,
                    user: decodedToken.payload.user
                });

                $(".navbar").hide();
                $('.content-wrapper').css({ 'max-height': '100vh', 'height': '100vh', 'position': 'absolute', 'overflow': 'hidden' });
                $('.container-p-y').attr('style', 'padding: 0px !important');


                usuarioId = decodedToken.payload.user;

                //cargar los asesores disponibles
                cargarAsesores(usuarioId)

                //cargar los ack de los mensajes
                cargarAckMessages();

                //cargar contadores generales
                cargarContadoresProcesos(decodedToken.payload.user);

                //cargar los tickets que se estan tabajando en
                cargarTicketsTrabajando(decodedToken.payload.user, 0, 2);

                //cargar las respuestas rapidas o atajos
                cargarAtajos(usuarioId);

                //cargar las categorias de la multimedia
                cargarMultimediaCategoria()

                //conectar por socket
                conectarSocket();

                socket = io(process.env.ENDPOINT_SOCKET, {
                    transports: ['websocket']
                });

                socket.on('connect', () => {
                    console.log('Conexión establecida con el servidor');
                });

                //notificacion de que el mensaje salio
                socket.on('messageEnviado', (data) => {

                    let banderaPendientes = false;
                    if (data.messagesPendientes > 0) {
                        banderaPendientes = true;
                    }

                    // Crear una copia del arreglo ticketPendientesFin
                    var updatedTicket = setTicketsConsulta2.map(ticketLocal => {
                        // Verificar si el ID del ticket no es igual a 1 y retornarlo
                        if (ticketLocal.id == data.ticket) {
                            return {
                                ...ticketLocal,
                                unreadMessages: data.unreadMessages,
                                mensajesPendientes: banderaPendientes,
                                bodyMessage: data.body
                            };
                        } else {
                            return ticketLocal;
                        }
                    });

                    //esta en el filtro mensajes sin responder
                    if (searchmessage == 1 && data.unreadMessages == 0) {
                        searchId = [];
                        if (menuActivo == 1) {
                            cargarTicketsTrabajando(usuarioId, 0, 2)
                        } else if (menuActivo == 2) {
                            cargarTicketsPagos(usuarioId, 0, 3)
                        }
                        else if (menuActivo == 3) {
                            cargarTicketsPagos(usuarioId, 0, 4)
                        }
                        else if (menuActivo == 4) {
                            cargarTicketsPagos(usuarioId, 0, 5)
                        }
                        else if (menuActivo == 5) {
                            cargarTicketsPagos(usuarioId, 0, 6)
                        }
                        else if (menuActivo == 6) {
                            cargarTicketsPagos(usuarioId, 0, 7)
                        }
                    }

                    // Actualizar el estado de ticketTrabajando con el array actualizado
                    setTicketsConsulta(updatedTicket);
                    setTicketsConsulta2 = updatedTicket;

                    if (usuarioId == data.usuario) {
                        //cargar contadores generales
                        cargarContadoresProcesos(usuarioId);
                    }


                    // Obtener el elemento div que tiene el ack
                    var div = document.getElementById(data.idInterno);

                    if (div !== null) {
                        let ackIcon = '';
                        for (var e = arrAck.length - 1; e >= 0; e--) {
                            if (arrAck[e].banderaAck == data.ackMessages) {
                                ackIcon = arrAck[e].icon
                            }
                        }

                        // Cambiar la clase del div
                        div.className = ackIcon;
                        div.style.color = "#6a7b8e"
                        div.id = data.message
                    }

                })


                socket.on('nuevoMessage', (data) => {
                    if (data.asesor == usuarioId) {
                        // Crear una copia del arreglo ticketPendientesFin
                        var updatedTicket = setTicketsConsulta2.map(ticketLocal => {
                            // Verificar si el ID del ticket no es igual a 1 y retornarlo
                            if (ticketLocal.id == data.ticket.id) {
                                return {
                                    ...ticketLocal,
                                    unreadMessages: data.ticket.unreadMessages,
                                    mensajesPendientes: false,
                                    bodyMessage: data.ticket.bodyMessage
                                };
                            } else {
                                return ticketLocal;
                            }
                        });

                        if (ticketActivo != "" && data.ticket.id == ticketActivo.id) {
                            mensajesCargadosTicket = [];
                            banderaConsultandoMessages = true;
                            setCargandoMensajes(true);
                            cargarMessagesTicket(ticketActivo.id, 0);
                            banderaConsultandoMessages = true;
                        }

                        //esta en el filtro mensajes sin responder
                        if (searchmessage == 1 && data.ticket.unreadMessages > 0) {
                            searchId = [];
                            if (menuActivo == 1 && data.ticket.idStatus == 2) {
                                cargarTicketsTrabajando(usuarioId, 0, 2)
                            } else if (menuActivo == 2 && data.ticket.idStatus == 3) {
                                cargarTicketsPagos(usuarioId, 0, 3)
                            }
                            else if (menuActivo == 3 && data.ticket.idStatus == 4) {
                                cargarTicketsPagos(usuarioId, 0, 4)
                            }
                            else if (menuActivo == 4 && data.ticket.idStatus == 5) {
                                cargarTicketsPagos(usuarioId, 0, 5)
                            }
                            else if (menuActivo == 5 && data.ticket.idStatus == 6) {
                                cargarTicketsPagos(usuarioId, 0, 6)
                            }
                            else if (menuActivo == 6 && data.ticket.idStatus == 7) {
                                cargarTicketsPagos(usuarioId, 0, 7)
                            }
                        }


                        // Actualizar el estado de ticketTrabajando con el array actualizado
                        setTicketsConsulta(updatedTicket);
                        setTicketsConsulta2 = updatedTicket;

                        //cargar contadores generales
                        cargarContadoresProcesos(usuarioId);
                    }
                })

                socket.on('updatedTicket', (data) => {
                    if (data.asesor == usuarioId) {
                        // Crear una copia del arreglo ticketPendientesFin
                        var updatedTicket = setTicketsConsulta2.map(ticketLocal => {
                            // Verificar si el ID del ticket no es igual a 1 y retornarlo
                            if (ticketLocal.id == data.ticket.id) {
                                return {
                                    ...ticketLocal,
                                    unreadMessages: data.ticket.unreadMessages,
                                    mensajesPendientes: false,
                                    bodyMessage: data.ticket.bodyMessage
                                };
                            } else {
                                return ticketLocal;
                            }
                        });

                        if (ticketActivo != "" && data.ticket.id == ticketActivo.id) {
                            //console.log(data);
                            //mensajesCargadosTicket = [];
                            //banderaConsultandoMessages = true;
                            //setCargandoMensajes(true);
                            //cargarMessagesTicket(ticketActivo.id,0);
                            //banderaConsultandoMessages = true;
                        }

                        //esta en el filtro mensajes sin responder
                        if (searchmessage == 1 && data.ticket.unreadMessages > 0) {
                            searchId = [];
                            if (menuActivo == 1 && data.ticket.idStatus == 2) {
                                cargarTicketsPagos(usuarioId, 0, 2)
                            } else if (menuActivo == 2 && data.ticket.idStatus == 3) {
                                cargarTicketsPagos(usuarioId, 0, 3)
                            }
                            else if (menuActivo == 3 && data.ticket.idStatus == 4) {
                                cargarTicketsPagos(usuarioId, 0, 4)
                            }
                            else if (menuActivo == 4 && data.ticket.idStatus == 5) {
                                cargarTicketsPagos(usuarioId, 0, 5)
                            }
                            else if (menuActivo == 5 && data.ticket.idStatus == 6) {
                                cargarTicketsPagos(usuarioId, 0, 6)
                            }
                            else if (menuActivo == 6 && data.ticket.idStatus == 7) {
                                cargarTicketsPagos(usuarioId, 0, 7)
                            }
                        }


                        // Actualizar el estado de ticketTrabajando con el array actualizado
                        setTicketsConsulta(updatedTicket);
                        setTicketsConsulta2 = updatedTicket;

                        //cargar contadores generales
                        cargarContadoresProcesos(usuarioId);
                    }
                });

                //notifica eu el ack cambio
                socket.on('ackMessageActualizado', (data) => {

                    // Obtener el elemento div que tiene el ack
                    var div = document.getElementById(data.message);

                    if (div !== null) {
                        let ackIcon = '';
                        for (var e = arrAck.length - 1; e >= 0; e--) {
                            if (arrAck[e].banderaAck == data.ackMessages) {
                                ackIcon = arrAck[e].icon
                            }
                        }

                        // Cambiar la clase del div
                        div.className = ackIcon;
                    }
                })

                socket.on("connect_error", (err) => {
                    const swalWithReact = withReactContent(Swal);
                    // Manejar el error aquí
                    withReactContent(Swal).fire({
                        title: "Error",
                        text: "Conexion perdida (verifica tu internet)",
                        icon: "error"
                    })
                })
            }


        }

        /*// Encuentra el menu seleccionado
        const menu = opcionesMenu.find(menu => menu.id === menuSeleccionado);
        // Actualiza heightDiv si el menu tiene submenu
        if (menu && menu.subMenu.length > 0) {
            if(menu.subMenu.length > 0){
                setOpcionFecha(true);
                setHeightDiv('62%');
                for (var i = menu.subMenu.length - 1; i >= 0; i--) {
                    if(menu.subMenu[i].id == submenuActivo){
                        if(menu.subMenu[i].orderFecha){
                            
                        }
                    }
                }
            }else{
                setHeightDiv('90%');
            }
        } else {
            setHeightDiv('100%');
        }*/
    }, [menuSeleccionado, opcionesMenu])

    const EmojiOneArea: React.FC<EmojiOneAreaProps> = ({ onEmojiSelect }) => {

        const textareaRef = useRef<HTMLTextAreaElement>(null);

        useEffect(() => {
            if (tokenLoading2 == 0) {

                try {

                    const $ = require('jquery');
                    const EmojiOneArea = require('emojionearea');
                    const jequeyText = require('jquery-textcomplete');

                    // Initialize EmojiOneArea
                    textareaPrueba = $(textareaRef.current).emojioneArea({
                        events: {
                            ready: function () {
                                tokenLoading2 = 1;
                            },
                            keyup: function (editor, event) {
                                // catches everything but enter
                                if (event.which == 13 && !event.shiftKey && appMovil == false) {
                                    enviarMensajeTexto(textareaPrueba.data("emojioneArea").getText())
                                }
                            }
                        }
                    });

                } catch (error) {
                    // Manejar el error, si es necesario
                    console.error('Error initializing EmojiOneArea:', error);
                }
            }
        }, [tokenLoading2]);

        return <textarea ref={textareaRef} />;

    };

    const EmojiOneArea2: React.FC<EmojiOneAreaProps> = ({ onEmojiSelect }) => {


        const textareaRef2 = useRef<HTMLTextAreaElement>(null);

        useEffect(() => {
            if (tokenLoading3 == 0) {

                try {


                    const $ = require('jquery');
                    const EmojiOneArea = require('emojionearea');
                    const jequeyText = require('jquery-textcomplete');

                    // Initialize EmojiOneArea
                    textareaPrueba2 = $(textareaRef2.current).emojioneArea({
                        events: {
                            ready: function () {
                                tokenLoading3 = 1;
                            },
                            keyup: function (editor, event) {
                                // catches everything but enter
                                if (event.which == 13 && !event.shiftKey) {
                                    enviarMensajeTexto(textareaPrueba2.data("emojioneArea").getText())
                                }
                            }
                        }
                    });

                } catch (error) {
                    // Manejar el error, si es necesario
                    console.error('Error initializing EmojiOneArea:', error);
                }
            }

        }, [tokenLoading2]);


        return <textarea ref={textareaRef2} />;

    };

    const EmojiOneArea3: React.FC<EmojiOneAreaProps> = ({ onEmojiSelect }) => {


        const textareaRef3 = useRef<HTMLTextAreaElement>(null);

        useEffect(() => {
            if (tokenLoading4 == 0) {

                try {


                    const $ = require('jquery');
                    const EmojiOneArea = require('emojionearea');
                    const jequeyText = require('jquery-textcomplete');

                    // Initialize EmojiOneArea
                    textareaPrueba4 = $(textareaRef3.current).emojioneArea({
                        events: {
                            ready: function () {
                                tokenLoading4 = 1;
                            }
                        }
                    });

                } catch (error) {
                    // Manejar el error, si es necesario
                    console.error('Error initializing EmojiOneArea:', error);
                }
            }

        }, [tokenLoading4]);


        return <textarea ref={textareaRef3} />;

    };


    const TimerComponent = ({ startTime }) => {
        const [elapsedTime, setElapsedTime] = useState('0:00');

        // Actualizar el tiempo transcurrido cada segundo
        setInterval(() => {
            const now = new Date();
            const elapsedSeconds = Math.floor((now - startTime) / 1000); // Tiempo transcurrido en segundos
            const minutes = Math.floor(elapsedSeconds / 60);
            const seconds = elapsedSeconds % 60;
            const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds; // Convertir a segundos

            setElapsedTime(`${minutes}:${formattedSeconds}`);
        }, 1000);

        return <span style={{ width: '40px', textAlign: 'center', marginLeft: '5px', marginTop: '3px' }}>{elapsedTime}</span>;
    };



    async function conectarSocket() {
        let socket2 = io(process.env.ENDPOINT_SOCKET2, {
            transports: ['websocket']
        });

        socket2.on('connect', () => {
            //cambio el preload de un ticket
            socket2.on('ticket:upload', (data) => {

                var updatedTicket = setTicketsConsulta2.map(ticketLocal => {
                    // Verificar si el ID del ticket no es igual a 1 y retornarlo
                    if (ticketLocal.id == data.ticket) {
                        let icon = "";
                        for (var e = arrAck.length - 1; e >= 0; e--) {
                            if (arrAck[e].banderaAck == data.ack) {
                                icon = arrAck[e].icon
                            }
                        }
                        return {
                            ...ticketLocal,
                            unreadMessages: data.cont,
                            ackIcon: icon,
                            bodyMessage: data.body,
                            ultimoMessageDate: convertirFecha(data.time)
                        };
                    } else {
                        // Retornar null para tickets que coinciden con el id a excluir
                        return ticketLocal;
                    }
                })

                // Actualizar el estado de ticketTrabajando con el array actualizado
                setTicketsConsulta(updatedTicket);
                setTicketsConsulta2 = updatedTicket;
            })

            // cambio la ventana
            socket2.on('ticket:updateVentana', (data) => {
                if (ticketActivo != "" && ticketActivo.id == data.ticket) {
                    ticketActivo.ventana = data.ventana
                    ticketActivo.aperturaVentana = data.aperturaVentana
                    //es un chat de cloud
                    setticketAbierto(prevState => ({
                        ...prevState,  // Copiar el estado anterior
                        ventana: data.ventana,
                        aperturaVentana: data.aperturaVentana
                    }));
                    if (data.ventana > 0) {
                        //se abrio la ventana
                        setdivStyleHeight('calc(100% - 200px)')
                        $(".emojionearea").show();
                        $(".limitesCloud").show();
                    }
                    if (intervaloVentana) {
                        clearInterval(intervaloVentana);
                    }
                    actualizarDiferencia(); // Llamado inmediato
                    intervaloVentana = setInterval(actualizarDiferencia, 60 * 1000);
                }
            })

            // se asigno un nuevo ticket
            socket2.on('ticket:new', (data) => {
                if (usuarioId == data.usuario) {
                    //cargar contadores generales
                    cargarContadoresProcesos(usuarioId);

                    if (menuActivo == 1 && submenuActivo == 1) {
                        cargarTicketsTrabajando(usuarioId, 0, 1);
                    }
                }
            })

            //el mensaje ya lo tiene cloud
            socket2.on('mensaje:Cloud', (data) => {
                var div = document.getElementById("message-" + data.id)
                //tengo el mensaje visualmente
                if (div) {
                    var divAck = document.getElementById("ack-" + data.id);
                    if (divAck) {
                        let icon = "";
                        for (var e = arrAck.length - 1; e >= 0; e--) {
                            if (arrAck[e].banderaAck == data.ack) {
                                icon = arrAck[e].icon
                            }
                        }
                        divAck.className = icon;
                    }
                }
            })

            //un cambio en el ack de un mensaje
            socket2.on('mensaje:Ack', (data) => {
                var div = document.getElementById("ack-" + data.message);
                if (div) {
                    div.className = data.ack;
                }
            })

            //llego un nuevo mensaje
            socket2.on('mensaje:New', (data) => {

                if (usuarioId == data.message.asesor) {
                    if (ticketActivo != "" && ticketActivo.id == data.message.ticket) {
                        var div = document.getElementById("message-" + data.message.id)
                        //no tengo el mensaje visualmente
                        if (!div) {
                            $(".no-messages").hide();
                            nuevosMensajes = [renderMessageCloud(data.message, [])]
                            setContenidosMessagesChat(prevMessages => [...prevMessages, ...nuevosMensajes]);
                            //baja el scroll
                            setTimeout(() => {
                                messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
                            }, 100);
                        }
                    }
                    //cargar contadores generales
                    cargarContadoresProcesos(usuarioId);
                }
            })
            console.log('Conexión establecida con el servidor');
        });

        socket2.on("connect_error", (err) => {
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Conexion perdida (verifica tu internet)",
                icon: "error"
            })
        })
    }

    async function marcarComoLeido() {

        const swalWithReact = withReactContent(Swal);
        swalWithReact.fire({
            title: "Confirmación",
            html: "¿Marcar chat como leido?",
            showCancelButton: true,
            confirmButtonText: "Si", // Texto personalizado para el botón de confirmación
            cancelButtonText: "No", // Texto personalizado para el botón de cancelación
            allowOutsideClick: false
        }).then(async (result) => {
            // Aquí puedes continuar con el flujo normal si el usuario seleccionó una opción válida
            if (result.isConfirmed) {



                swalWithReact.fire({
                    title: "Guardando cambios",
                    text: "Por favor, espera un momento...",
                    icon: "info",
                    showConfirmButton: false, // Ocultar el botón de confirmación
                    allowOutsideClick: false // Evitar cerrar el SweetAlert haciendo clic fuera de él
                });

                //acepta el ticket
                await axios.post(process.env.ENDPOINT_API + '/whatsapp2/marcharChatLeido',
                    {
                        ticket: ticketActivo.id,
                        usuario: usuario.user
                    }
                ).then(response => {

                    setticketAbierto(prevState => ({
                        ...prevState,  // Copiar el estado anterior
                        unreadMessages: 0
                    }));

                    var updatedTicket = setTicketsConsulta2.map(ticketLocal => {
                        // Verificar si el ID del ticket no es igual a 1 y retornarlo
                        if (ticketLocal.id == ticketActivo.id) {
                            return {
                                ...ticketLocal,
                                unreadMessages: 0
                            };
                        } else {
                            // Retornar null para tickets que coinciden con el id a excluir
                            return ticketLocal;
                        }
                    })

                    setTicketsConsulta(updatedTicket);
                    setTicketsConsulta2 = updatedTicket;

                    cargarContadoresProcesos(usuarioId)

                    swalWithReact.fire({
                        title: "Actualizado",
                        text: "El ticket se marco como leido.",
                        icon: "success",
                        showConfirmButton: false, // Ocultar el botón de confirmación
                        timer: 2000 // Cerrar automáticamente después de 2 segundos
                    });
                })
            }
        })
    }


    /*
       creador: jorge luis castrillon
       fecha: 25 de marzo 2024
       objetivo: cargar las categorias de la multimedia
   */
    async function cargarMultimediaCategoria() {
        await axios.post(process.env.ENDPOINT_API + '/whatsapp2/cargarCategoriaMultimedia').then(data => {
            setcategoriasMultimedia(data.data.categorias);
        }).catch(error => {
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (cargar multimedia)",
                icon: "error"
            })
        });;

    }

    async function detallModalPlantillas(datos) {
        console.log(datos);
        setTimeout(() => {
            $("#bodyTemplate").val(datos.body)
        }, 100);

        setdetallePlantilla(datos);
        setmodalDetallMultimedia(true);
    }

    //caraga el detalle de la multimedia
    async function detallModalMultimedia(id) {
        tokenLoading3 = 0;
        idRespuesta = id;
        typeRespuesta = 2;
        //acepta el ticket
        await axios.post(process.env.ENDPOINT_API + '/whatsapp2/cargarInfMultimedia', {
            id: id
        }).then(response => {
            setTimeout(() => {
                if (response.data.multimedia.message.length > 0) {
                    let textoMessage = response.data.multimedia.message;

                    // cambia el nombre por el asesor
                    textoMessage = textoMessage.replace(/-AS-/g, usuario.nombre);

                    textareaPrueba2.data("emojioneArea").setText(textoMessage);
                } else {
                    textareaPrueba2.data("emojioneArea").setText('');
                }
            }, 100);

            setdetallMultimedia(response.data.multimedia)
            setmodalDetallMultimedia(true);
        }).catch(error => {
            console.log(error);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error al cargar el multimedia",
                text: "Comunica con soporte",
                icon: "error"
            })
        });
    }

    function handlePrevClick(id) {
        const element = document.getElementById("multimedia-" + id);
        if (element) {
            element.scrollLeft -= 100;
        }
    };

    function handleNextClick(id) {
        const element = document.getElementById("multimedia-" + id);
        if (element) {
            element.scrollLeft += 100;
        }
    };

    function verTodoMultimedia(datos) {
        itemDetalleMultimedia = 1;
        idCategoriaMultimediaDetalle = datos.id;
        setdivdetallMultimedia([]);
        setcategoriasMultimediaDetall(datos);
        setbanderaverTodoMultimedia(true);
        cargarTodoMultimediaDetalle();
    }

    const handleMouseOverAudio = (id) => {
        const audioElement = document.getElementById('audio-' + id);
        if (audioElement) {
            audioElement.play();
        }
    }

    const onMouseOutAudio = (id) => {
        const audioElement = document.getElementById('audio-' + id);
        if (audioElement) {
            audioElement.pause();
            audioElement.currentTime = 0; // Reiniciar el audio para que comience desde el principio la próxima vez
        }
    }

    const handleMouseOver = (id) => {
        const video = document.getElementById('video-' + id);
        if (video) {
            video.play();
            setTimeout(() => {
                video.pause();
                video.currentTime = 0;
            }, 10000);
        }
    };

    const onMouseOut = (id) => {
        const video = document.getElementById('video-' + id);
        if (video) {
            video.pause();
            video.currentTime = 0;
        }
    };

    function closeDetalleMultimedia() {
        setbanderaverTodoMultimedia(false);
    }

    async function cargarTodoMultimediaDetalle() {
        if (categoriasMultimediaDetall != undefined) {
            idCategoriaMultimediaDetalle = categoriasMultimediaDetall.id;
        }
        //acepta el ticket
        await axios.post(process.env.ENDPOINT_API + '/whatsapp2/cargarMultimediaMessageDetall', {
            id: idCategoriaMultimediaDetalle,
            tipo: itemDetalleMultimedia
        }).then(response => {
            setdivdetallMultimedia(response.data.multimedia);
        }).catch(error => {
            console.log(error);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error al cargar el multimedia",
                text: "Comunica con soporte",
                icon: "error"
            })
        });
    }

    //envia el audio grabado
    async function enviarAudio() {
        setRecording(false);
        mediaRecorderRef.current.stop();
    }

    //evento que se dispara al parar el audio para enviarlo
    async function descargarAudio(event) {
        if (event.data.size > 0) {
            blobToBase64(event.data)
        }
    }

    function cambiarTipoDetallMultimedia(tipo) {
        itemDetalleMultimedia = tipo;
        setdivdetallMultimedia([]);
        cargarTodoMultimediaDetalle()
    }

    //pasa el audio a base64 y lo envia
    async function blobToBase64(blob) {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = async () => {
            const base64String = reader.result.split(',')[1];
            let clase = 'right';
            //let fotomessage = data.message.imageChat;
            let fecha = new Date();
            let hora = fecha.getTime() / 1000;
            let idMensaje = 0;
            if (ticketActivo.type == 1) {

                let fechaMessage = convertirFecha(hora);
                let ackIcon = '';
                for (var e = arrAck.length - 1; e >= 0; e--) {
                    if (arrAck[e].banderaAck == 4) {
                        ackIcon = arrAck[e].icon
                    }
                }
                arrcolaEnviandoMessage.push({ id: usuario.user + '-' + hora })

                // Crear un nuevo elemento span
                const nuevoMensaje = (
                    <li className={`message ${clase}`}>
                        <img title={usuario.nombre} className={`logo logo${clase}`} src={usuario.foto} alt="" />
                        <audio controls style={{ maxWidth: '100%', marginTop: '10px' }}><source src={`data:audio/ogg;codecs=opus;base64,${base64String}`} type="audio/ogg"></source></audio>
                        <span>
                            <i id={usuario.user + '-' + hora} style={{ marginTop: '-3px' }} className={ackIcon}></i>
                            {fechaMessage}
                            <b style={{ marginLeft: '5px' }}>({usuario.nombre})</b>
                        </span>
                    </li>
                );

                arrcolaEnviandoMessage.push({
                    id: usuario.user + '-' + hora,
                    ticket: ticketActivo.id,
                    hora: fecha.getTime() / 1000,
                    tipo: 4,
                    status: 0,
                    agregado: false,
                    usuario: usuario.nombre,
                    usuarioFoto: usuario.foto,
                    audio: base64String
                })

                // Agregar el nuevo span a la lista de contenidosSpans
                setContenidosMessagesChat((prevMessages => [...prevMessages, nuevoMensaje]));


                //baja el scroll
                setTimeout(() => {
                    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
                }, 100);

                if (ticketActivo.idStatus == 1) {
                    //acepta el ticket
                    await axios.post(process.env.ENDPOINT_API + '/whatsapp2/aceptarTicket', {
                        ticket: ticketActivo.id,
                        usuario: usuarioId
                    }).then(response => {
                        ticketActivo.idStatus = 2;
                        // Crear una copia del arreglo ticketPendientesFin
                        var updatedTicket = setTicketsConsulta2.map(ticketLocal => {
                            // Verificar si el ID del ticket no es igual a 1 y retornarlo
                            if (ticketLocal.id !== ticketActivo.id) {
                                return ticketLocal;
                            }
                            // Retornar null para tickets que coinciden con el id a excluir
                            return null;
                        }).filter(ticket => ticket !== null);

                        // Actualizar el estado de ticketTrabajando con el array actualizado
                        setTicketsConsulta(updatedTicket);
                        setTicketsConsulta2 = updatedTicket;

                        cargarContadoresProcesos(usuarioId)

                        setticketAbierto(prevState => ({
                            ...prevState,  // Copiar el estado anterior
                            processesid: 1, // actualiza el proceso actual del ticket abierto
                            idStatus: 2
                        }));
                    })
                }
            } else {

                let fechaMessage = convertirFecha(hora);
                let ackIcon = '';
                let idAck = 0;
                for (var e = arrAck.length - 1; e >= 0; e--) {
                    if (arrAck[e].banderaAck == 5) {
                        idAck = arrAck[e].banderaAck;
                        ackIcon = arrAck[e].icon
                    }
                }
                let id = usuario.user + '-' + hora;
                idMensaje = id;
                // Crear un nuevo elemento span
                const nuevoMensaje = (
                    <li id={`message-${id}`} className={`message ${clase}`}>
                        <img title={usuario.nombre} className={`logo logo${clase}`} src={usuario.foto} alt="" />
                        <audio controls style={{ maxWidth: '100%', marginTop: '10px' }}><source src={`data:audio/ogg;codecs=opus;base64,${base64String}`} type="audio/ogg"></source></audio>
                        <span>
                            <i id={`ack-${id}`} style={{ marginTop: '-3px' }} className={ackIcon}></i>
                            {fechaMessage}
                            <b style={{ marginLeft: '5px' }}>({usuario.nombre})</b>
                        </span>
                    </li>
                );
                // Agregar el nuevo span a la lista de contenidosSpans
                setContenidosMessagesChat((prevMessages => [...prevMessages, nuevoMensaje]));

                //baja el scroll
                setTimeout(() => {
                    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
                }, 100);
            }
            // Llamar a la función para enviar el audio en fragmentos
            await enviarAudioEnFragmentos(ticketActivo.id, base64String, usuario, hora, idMensaje);

        };
        reader.onerror = error => {
            console.error('Error al convertir Blob a base64:', error);
        };
    }

    // Función para enviar el audio al servidor en fragmentos
    async function enviarAudioEnFragmentos(ticketId, base64String, usuario, hora, idMensaje) {
        const chunkSize = 1024 * 512; // Tamaño de cada fragmento en bytes (por ejemplo, 512KB)

        // Dividir la cadena base64 en fragmentos
        for (let i = 0; i < base64String.length; i += chunkSize) {
            const chunk = base64String.slice(i, i + chunkSize);

            if (ticketActivo.type == 1) {
                // Enviar el fragmento al servidor
                await axios.post(process.env.ENDPOINT_API + '/whatsapp2/enviarAudioFragmento', {
                    ticket: ticketId,
                    audioChunk: chunk,
                    usuario: usuario.user,
                    idLocal: usuario.user + '-' + hora,
                    totalChunks: Math.ceil(base64String.length / chunkSize), // Total de fragmentos
                    currentChunk: Math.floor(i / chunkSize) + 1 // Número de fragmento actual
                }).then(response => {

                    // Crear una copia del arreglo ticketPendientesFin
                    var updatedTicket = setTicketsConsulta2.map(ticketLocal => {
                        // Verificar si el ID del ticket no es igual a 1 y retornarlo
                        if (ticketLocal.id == response.data.ticket) {
                            return {
                                ...ticketLocal,
                                mensajesPendientes: true
                            };
                        } else {
                            // Si el ID no coincide, simplemente devolver el ticket sin cambios
                            return ticketLocal;
                        }
                    });

                    // Actualizar el estado de ticketTrabajando con el array actualizado
                    setTicketsConsulta(updatedTicket);
                    setTicketsConsulta2 = updatedTicket;


                    var div = document.getElementById(response.data.idLocal);
                    let ackIcon = '';
                    for (var e = arrAck.length - 1; e >= 0; e--) {
                        if (arrAck[e].banderaAck == 5) {
                            ackIcon = arrAck[e].icon
                        }
                    }
                    // Cambiar la clase del div
                    div.className = ackIcon;
                    div.style.color = "#4ccf2b"
                    idRespuesta = 0;
                    typeRespuesta = 0;

                    for (var e = arrcolaEnviandoMessage.length - 1; e >= 0; e--) {
                        if (arrcolaEnviandoMessage[e].id == response.data.idLocal) {
                            arrcolaEnviandoMessage.splice(e, 1);
                        }
                    }
                }).catch(error => {
                    // Manejar el error si es necesario
                });
            } else {
                // Enviar el fragmento al servidor
                await axios.post(process.env.ENDPOINT_API2 + '/api/ticket/audioFragmentado', {
                    audioChunk: chunk,
                    ticket: ticketId,
                    id: idMensaje,
                    usuario: usuario.user,
                    totalChunks: Math.ceil(base64String.length / chunkSize), // Total de fragmentos
                    currentChunk: Math.floor(i / chunkSize) + 1 // Número de fragmento actual
                }).then(data => {
                    //el mensaje ya lo tiene el servidor
                    var div = document.getElementById("message-" + data.data.data.front)
                    //tengo el mensaje visualmente
                    if (div) {
                        var divAck = document.getElementById("ack-" + data.data.data.front);
                        if (divAck) {
                            let icon = "";
                            for (var e = arrAck.length - 1; e >= 0; e--) {
                                if (arrAck[e].banderaAck == 0) {
                                    icon = arrAck[e].icon
                                }
                            }
                            divAck.className = icon;
                            divAck.id = "ack-" + data.data.data.server
                        }
                        div.id = "message-" + data.data.data.server;

                    }
                }).catch(error => {
                    console.log(error);
                    // Manejar el error si es necesario
                    const swalWithReact = withReactContent(Swal);
                    // Manejar el error aquí
                    withReactContent(Swal).fire({
                        title: "Error",
                        text: "Conexion perdida (algunos mensajes no se lograron enviar)",
                        icon: "error"
                    })
                });
            }
        }
    }

    async function trabajandoTicket(id) {
        if (ticketActivo.type == 1) {
            //acepta el ticket
            await axios.post(process.env.ENDPOINT_API + '/whatsapp2/aceptarTicket', {
                ticket: ticketActivo.id,
                usuario: usuarioId
            }).then(response => {
                ticketActivo.idStatus = 2;
                // Crear una copia del arreglo ticketPendientesFin
                var updatedTicket = setTicketsConsulta2.map(ticketLocal => {
                    // Verificar si el ID del ticket no es igual a 1 y retornarlo
                    if (ticketLocal.id !== ticketActivo.id) {
                        return ticketLocal;
                    }
                    // Retornar null para tickets que coinciden con el id a excluir
                    return null;
                }).filter(ticket => ticket !== null);

                // Actualizar el estado de ticketTrabajando con el array actualizado
                setTicketsConsulta(updatedTicket);
                setTicketsConsulta2 = updatedTicket;

                cargarContadoresProcesos(usuarioId)

                setticketAbierto(prevState => ({
                    ...prevState,  // Copiar el estado anterior
                    processesid: 1, // actualiza el proceso actual del ticket abierto
                    idStatus: 2
                }));
            })
        } else {
            //reporta como pago el ticket
            await axios.post(`${process.env.ENDPOINT_API2}/api/ticket/cambioStatus`, {
                ticket: id,
                usuario: usuarioId,
                status: 2
            }).then(response => {
                // Crear una copia del arreglo ticketPendientesFin
                var updatedTicket = setTicketsConsulta2.map(ticketLocal => {
                    // Verificar si el ID del ticket no es igual a 1 y retornarlo
                    if (ticketLocal.id !== id) {
                        return ticketLocal;
                    }
                    // Retornar null para tickets que coinciden con el id a excluir
                    return null;
                }).filter(ticket => ticket !== null);

                // Actualizar el estado de ticketTrabajando con el array actualizado
                setTicketsConsulta(updatedTicket);
                setTicketsConsulta2 = updatedTicket;

                cargarContadoresProcesos(usuarioId)

                setticketAbierto(prevTicket => ({
                    ...prevTicket,
                    idStatus: 2
                }));
            }).catch(error => {
                const swalWithReact = withReactContent(Swal);
                // Manejar el error aquí
                withReactContent(Swal).fire({
                    title: "Error",
                    text: "Comunica con soporte (pago ticket)",
                    icon: "error"
                })
            });
        }
    }
    /*
        creador: jorge luis castrillon
        fecha: 20 de marzo 2024
        objetivo: enviar un mensaje de texto al chat activo
    */
    async function enviarMensajeTexto() {

        if (envioMensajeTexto) {
            envioMensajeTexto = false;
            let mensaje = textareaPrueba.data("emojioneArea").getText();
            if (ticketActivo.type == 1) {
                if (ticketActivo.idStatus == 1) {
                    //acepta el ticket
                    await axios.post(process.env.ENDPOINT_API + '/whatsapp2/aceptarTicket', {
                        ticket: ticketActivo.id,
                        usuario: usuarioId
                    }).then(response => {
                        ticketActivo.idStatus = 2;
                        // Crear una copia del arreglo ticketPendientesFin
                        var updatedTicket = setTicketsConsulta2.map(ticketLocal => {
                            // Verificar si el ID del ticket no es igual a 1 y retornarlo
                            if (ticketLocal.id !== ticketActivo.id) {
                                return ticketLocal;
                            }
                            // Retornar null para tickets que coinciden con el id a excluir
                            return null;
                        }).filter(ticket => ticket !== null);

                        // Actualizar el estado de ticketTrabajando con el array actualizado
                        setTicketsConsulta(updatedTicket);
                        setTicketsConsulta2 = updatedTicket;

                        cargarContadoresProcesos(usuarioId)

                        setticketAbierto(prevState => ({
                            ...prevState,  // Copiar el estado anterior
                            processesid: 1, // actualiza el proceso actual del ticket abierto
                            idStatus: 2
                        }));
                    })
                }
                if (mensaje.length > 0 && mensaje != "") {
                    textareaPrueba.data("emojioneArea").setText('')

                    let clase = 'right';
                    //let fotomessage = data.message.imageChat;
                    let fecha = new Date();
                    let hora = fecha.getTime() / 1000;
                    let fechaMessage = convertirFecha(hora);
                    let ackIcon = '';
                    for (var e = arrAck.length - 1; e >= 0; e--) {
                        if (arrAck[e].banderaAck == 4) {
                            ackIcon = arrAck[e].icon
                        }
                    }

                    var nuevaCadena = mensaje.replace(/\n/g, "\n").trim();

                    arrcolaEnviandoMessage.push({
                        id: usuario.user + '-' + hora,
                        ticket: ticketActivo.id,
                        hora: fecha.getTime() / 1000,
                        tipo: 1,
                        status: 0,
                        agregado: false,
                        usuario: usuario.nombre,
                        usuarioFoto: usuario.foto,
                        text: nuevaCadena
                    })


                    // Crear un nuevo elemento span
                    const nuevoMensaje = (
                        <li className={`message ${clase}`}>
                            <img title={usuario.nombre} className={`logo logo${clase}`} src={usuario.foto} alt="" />
                            <p>{nuevaCadena}</p>
                            <span>
                                <i id={usuario.user + '-' + hora} style={{ marginTop: '-3px' }} className={ackIcon}></i>
                                {fechaMessage}
                                <b style={{ marginLeft: '5px' }}>({usuario.nombre})</b>
                            </span>
                        </li>
                    );
                    // Agregar el nuevo span a la lista de contenidosSpans
                    setContenidosMessagesChat((prevMessages => [...prevMessages, nuevoMensaje]));



                    await axios.post(process.env.ENDPOINT_API + '/whatsapp2/enviarMessageTicket',
                        {
                            ticket: ticketActivo.id,
                            idRespuesta: idRespuesta,
                            idResponderMsg: idResponderMsg,
                            typeRespuesta: typeRespuesta,
                            message: mensaje,
                            usuario: usuario.user,
                            idLocal: usuario.user + '-' + hora
                        }
                    ).then(response => {


                        // Crear una copia del arreglo ticketPendientesFin
                        var updatedTicket = setTicketsConsulta2.map(ticketLocal => {
                            // Verificar si el ID del ticket no es igual a 1 y retornarlo
                            if (ticketLocal.id == response.data.ticket) {
                                return {
                                    ...ticketLocal,
                                    mensajesPendientes: true
                                };
                            } else {
                                // Si el ID no coincide, simplemente devolver el ticket sin cambios
                                return ticketLocal;
                            }
                        });

                        // Actualizar el estado de ticketTrabajando con el array actualizado
                        setTicketsConsulta(updatedTicket);
                        setTicketsConsulta2 = updatedTicket;


                        var div = document.getElementById(response.data.idLocal);
                        let ackIcon = '';
                        for (var e = arrAck.length - 1; e >= 0; e--) {
                            if (arrAck[e].banderaAck == 5) {
                                ackIcon = arrAck[e].icon
                            }
                        }
                        // Cambiar la clase del div
                        div.className = ackIcon;
                        div.style.color = "#4ccf2b"
                        idRespuesta = 0;
                        typeRespuesta = 0;

                        for (var e = arrcolaEnviandoMessage.length - 1; e >= 0; e--) {
                            if (arrcolaEnviandoMessage[e].id == response.data.idLocal) {
                                arrcolaEnviandoMessage.splice(e, 1);
                            }
                        }
                    })
                        .catch(error => {

                            const swalWithReact = withReactContent(Swal);
                            // Manejar el error aquí
                            withReactContent(Swal).fire({
                                title: "Error",
                                text: "Comunica con soporte (envio mensaje)",
                                icon: "error"
                            })
                        });

                    envioMensajeTexto = true;

                    //baja el scroll
                    setTimeout(() => {
                        messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
                    }, 100);

                }
            } else {
                if (mensaje.length > 0 && mensaje != "") {

                    if (ticketActivo.idStatus == 1) {
                        //acepta el ticket
                        await axios.post(`${process.env.ENDPOINT_API2}/api/ticket/cambioStatus`, {
                            ticket: ticketActivo.id,
                            usuario: usuarioId,
                            status: 2
                        }).then(response => {
                            ticketActivo.idStatus = 2;
                            // Crear una copia del arreglo ticketPendientesFin
                            var updatedTicket = setTicketsConsulta2.map(ticketLocal => {
                                // Verificar si el ID del ticket no es igual a 1 y retornarlo
                                if (ticketLocal.id !== ticketActivo.id) {
                                    return ticketLocal;
                                }
                                // Retornar null para tickets que coinciden con el id a excluir
                                return null;
                            }).filter(ticket => ticket !== null);

                            // Actualizar el estado de ticketTrabajando con el array actualizado
                            setTicketsConsulta(updatedTicket);
                            setTicketsConsulta2 = updatedTicket;

                            cargarContadoresProcesos(usuarioId)

                            setticketAbierto(prevState => ({
                                ...prevState,  // Copiar el estado anterior
                                processesid: 1, // actualiza el proceso actual del ticket abierto
                                idStatus: 2
                            }));
                        })
                    }

                    textareaPrueba.data("emojioneArea").setText('')

                    let clase = 'right';
                    //let fotomessage = data.message.imageChat;
                    let fecha = new Date();
                    let hora = fecha.getTime() / 1000;
                    let fechaMessage = convertirFecha(hora);
                    let ackIcon = '';
                    let idAck = 0;
                    for (var e = arrAck.length - 1; e >= 0; e--) {
                        if (arrAck[e].banderaAck == 4) {
                            idAck = arrAck[e].banderaAck;
                            ackIcon = arrAck[e].icon
                        }
                    }

                    var nuevaCadena = mensaje.replace(/\n/g, "\n").trim();
                    let id = usuario.user + '-' + hora;
                    arrcolaEnviandoMessage.push({
                        id: usuario.user + '-' + hora,
                        ticket: ticketActivo.id,
                        tipo: 1,
                        status: 0,
                        text: nuevaCadena,
                        intentos: 0,
                        ack: idAck,
                        usuario: usuarioId
                    })




                    // Crear un nuevo elemento span
                    const nuevoMensaje = (
                        <li id={`message-${id}`} className={`message ${clase}`}>
                            <img title={usuario.nombre} className={`logo logo${clase}`} src={usuario.foto} alt="" />
                            <p>{nuevaCadena}</p>
                            <span>
                                <i id={`ack-${id}`} style={{ marginTop: '-3px' }} className={ackIcon}></i>
                                {fechaMessage}
                                <b style={{ marginLeft: '5px' }}>({usuario.nombre})</b>
                            </span>
                        </li>
                    );
                    // Agregar el nuevo span a la lista de contenidosSpans
                    setContenidosMessagesChat((prevMessages => [...prevMessages, nuevoMensaje]));
                    if (enviandoMensajes == false) {
                        enviandoMensajes = true;
                        enviarMensajeServer();
                    }
                    envioMensajeTexto = true;

                    //baja el scroll
                    setTimeout(() => {
                        messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
                    }, 100);
                }
            }

        }
    }

    async function enviarMensajeServer() {
        if (arrcolaEnviandoMessage.length == 0) {
            enviandoMensajes = false;
            return false;
        } else {
            if (arrcolaEnviandoMessage[0].intentos > 3) {

                var div = document.getElementById("message-" + arrcolaEnviandoMessage[0].id)
                var divAck = document.getElementById("ack-" + arrcolaEnviandoMessage[0].id);
                if (divAck) {
                    let icon = "";
                    for (var e = arrAck.length - 1; e >= 0; e--) {
                        if (arrAck[e].banderaAck == 6) {
                            icon = arrAck[e].icon
                        }
                    }
                    divAck.className = icon;
                    div.style.backgroundColor = "#ff9c9c";
                    div.style.border = "1px solid red";
                }

                arrcolaEnviandoMessage.shift();
                enviandoMensajes = false;

                const swalWithReact = withReactContent(Swal);
                // Manejar el error aquí
                withReactContent(Swal).fire({
                    title: "Error",
                    text: "Conexion perdida (algunos mensajes no se lograron enviar)",
                    icon: "error"
                })
            } else {

                let dataPeticion = {}
                let header = {}
                //es un mensaje plano
                if (arrcolaEnviandoMessage[0].tipo == 1 || arrcolaEnviandoMessage[0].tipo == 3) {
                    dataPeticion = { mensaje: arrcolaEnviandoMessage[0] }
                }
                //es un arhcivo o varios
                if (arrcolaEnviandoMessage[0].tipo == 2) {
                    dataPeticion = new FormData();
                    if (arrcolaEnviandoMessage[0].file.length > 0) {
                        for (let i = 0; i < arrcolaEnviandoMessage[0].file.length; i++) {
                            dataPeticion.append("file", arrcolaEnviandoMessage[0].file[i]);
                        }

                    }
                    dataPeticion.append("mensaje", JSON.stringify(arrcolaEnviandoMessage[0]));
                    let fecha = new Date();
                    let hora = fecha.getTime() / 1000;
                    header = {
                        headers: {
                            "apoyo": usuario.user + '-' + hora
                        }
                    }
                }
                await axios.post(process.env.ENDPOINT_API2 + '/api/ticket/enviarMensaje', dataPeticion, header).then(async (data) => {
                    //el mensaje ya lo tiene el servidor
                    var div = document.getElementById("message-" + data.data.data.front)
                    //tengo el mensaje visualmente
                    if (div) {
                        var divAck = document.getElementById("ack-" + data.data.data.front);
                        if (divAck) {
                            let icon = "";
                            for (var e = arrAck.length - 1; e >= 0; e--) {
                                if (arrAck[e].banderaAck == 0) {
                                    icon = arrAck[e].icon
                                }
                            }
                            divAck.className = icon;
                            divAck.id = "ack-" + data.data.data.server
                        }
                        div.id = "message-" + data.data.data.server;
                        //es un arhcivo o varios
                        if (arrcolaEnviandoMessage[0].tipo == 2) {
                            //para que respete el orden de los mensajes porque sino cloud envia primero otros mensajes
                            setTimeout(() => {
                                enviarMensajeServer()
                            }, 2000);
                        } else {
                            setTimeout(() => {
                                enviarMensajeServer()
                            }, 1000);
                        }
                        arrcolaEnviandoMessage.shift();

                    }
                }).catch(error => {
                    console.log(error);
                    if (arrcolaEnviandoMessage[0].intentos == undefined) {
                        arrcolaEnviandoMessage[0].intentos = 1;
                    }
                    arrcolaEnviandoMessage[0].intentos = arrcolaEnviandoMessage[0].intentos + 1;
                    setTimeout(() => {
                        enviarMensajeServer()
                    }, 1000);
                })
            }

        }
    }

    const handleScroll = (event) => {
        const div = event.target;
        if (div.scrollTop === 0) {
            if (banderaConsultandoMessages == false && tieneMensajesPendientes == true) {
                banderaConsultandoMessages = true;
                let idMessage = null;
                const chatContainer = document.querySelector('.chat-container');
                const firstChild = chatContainer.firstElementChild;
                if (firstChild) {
                    idMessage = firstChild.id;
                }

                setTimeout(() => {
                    if (idMessage) {
                        const messageDiv = document.getElementById(idMessage);
                        if (messageDiv) {
                            chatContainer.scrollTop = messageDiv.offsetTop;
                        }
                    }
                }, 100);
                cargarMessagesTicket(ticketActivo.id, (offsetMessagesActivos + 20))

            }
        }
    };

    function abrirAtajos() {
        setrespuestasRapidas(atajosFin)
        setShowDropdown(true);
    }

    function abrirPlantillas() {
        setPlantillas(plantillasFin)
        setOpenMultimedia(true);
    }

    function cerrarAtajos() {
        setOpenMultimedia(false);
    }

    function cerrarPlantillas() {
        setShowDropdown2(false);
    }

    function filtroSinResponder(select, bandera) {
        if (bandera == 1) {
            if (select) {
                searchmessageSinResponder = 1;
                if (searchmessage == 1) {
                    var checkbox = document.getElementById("checkboxfiltro-1");
                    checkbox.checked = false;
                    searchmessage = 0;
                }
            } else {
                searchmessageSinResponder = 0;
            }
        }

        searchId = [];
        terminoDeCargarTickets = true;
        setTicketsConsulta([])
        setConsultandoTickets(true);

        clearTimeout(controladorTiempo);
        controladorTiempo = setTimeout(() => cambioMenuPrincipal2(), 100);

        /*
        if(menuActivo == 1){
            cargarTicketsTrabajando(usuarioId,0)
        }else if(menuActivo == 2){
            cargarTicketsPagos(usuarioId,0)
        }
        else if(menuActivo == 3){
            cargarTicketsProduccion(usuarioId,0)
        }
        else if(menuActivo == 4){
            cargarTicketsDespachados(usuarioId,0)
        }
        else if(menuActivo == 5){
            cargarTicketsClientes(usuarioId,0)
        }
        else if(menuActivo == 6){
            cargarTicketsNoInteresados(usuarioId,0)
        }*/
    }

    function filtroSinLeer(select, bandera) {
        if (select) {
            searchmessage = 1;
            if (searchmessageSinResponder == 1) {
                var checkbox = document.getElementById("checkboxfiltro-2");
                checkbox.checked = false;
                searchmessageSinResponder = 0;
            }
        } else {
            searchmessage = 0;
        }

        searchId = [];
        terminoDeCargarTickets = true;
        setTicketsConsulta([])
        setConsultandoTickets(true);

        clearTimeout(controladorTiempo);
        controladorTiempo = setTimeout(() => cambioMenuPrincipal2(), 100);

        /*
        if(menuActivo == 1){
            cargarTicketsTrabajando(usuarioId,0)
        }else if(menuActivo == 2){
            cargarTicketsPagos(usuarioId,0)
        }
        else if(menuActivo == 3){
            cargarTicketsProduccion(usuarioId,0)
        }
        else if(menuActivo == 4){
            cargarTicketsDespachados(usuarioId,0)
        }
        else if(menuActivo == 5){
            cargarTicketsClientes(usuarioId,0)
        }
        else if(menuActivo == 6){
            cargarTicketsNoInteresados(usuarioId,0)
        }*/

        /*if(bandera == 1){
            if(select){
                messageInbox = 1;
                if(messageInbox2 == 1){
                    var checkbox = document.getElementById("checkboxfiltro-2");
                    checkbox.checked = false;
                    messageInbox2 = 0;
                }
            }else{
                messageInbox = 0;
            }
            offsetActivo = 0;
            setticketPendientesId = [];
            setbanderaConsultandoTicketTrabajando(true)
            setbanderaConsultandoTicketTrabajando2(false);
            cargarTicketsTrabajando(usuario.user,0)
        }
        if(bandera == 2){
            if(select){
                messageInbox = 1;
                if(messageInbox2 == 1){
                    var checkbox = document.getElementById("checkboxfiltro-4");
                    checkbox.checked = false;
                    messageInbox2 = 0;
                }
            }else{
                messageInbox = 0;
            }
            offsetActivo = 0;
            setticketPendientesId = [];
            setbanderaConsultandoTicketPagos(true)
            setbanderaConsultandoTicketPagos2(false);
            cargarTicketsPagos(usuario.user,0)
        }*/

    }

    function cambioMenuPrincipal(menu) {
        menuActivo = menu;
        $(".buscador").val("");
        searchId = [];
        searchBuscador = "";

        //mensajes sin leer
        var checkbox = document.getElementById("checkboxfiltro-1");
        if (checkbox) {
            checkbox.checked = false;
        }

        searchmessage = 0;

        //mensajes sin responder
        var checkbox = document.getElementById("checkboxfiltro-2");
        if (checkbox) {
            checkbox.checked = false;
        }
        searchmessageSinResponder = 0;

        //sele fechas
        setOpcionFecha(true);
        searchfechas = 0;
        setseleFecha(1);
        terminoDeCargarTickets = true;
        setTicketsConsulta([])
        setConsultandoTickets(true);
        setMenuSeleccionado(menu);

        clearTimeout(controladorTiempo);
        controladorTiempo = setTimeout(() => cambioMenuPrincipal2(), 100);
    };

    async function cambioMenuPrincipal2() {
        if (menuActivo == 1) {

            if (submenuActivo == 1) {
                setOpcionFecha(false);
                if (appMovil) {
                    setHeightDiv('calc(100vh - 210px)');
                } else {
                    setHeightDiv('calc(100vh - 210px)');
                }

                cargarTicketsTrabajando(usuarioId, 0, 1)
            }
            if (submenuActivo == 2) {
                if (appMovil) {
                    setHeightDiv('calc(100vh - 120px)');
                } else {
                    setHeightDiv('calc(100vh - 120px)');
                }
                cargarTicketsTrabajando(usuarioId, 0, 2)
            }
        }
        else if (menuActivo == 2) {
            if (appMovil) {
                setHeightDiv('80%');
            } else {
                setHeightDiv('calc(100vh - 120px)');
            }

            cargarTicketsTrabajando(usuarioId, 0, 3)
        }
        else if (menuActivo == 3) {
            if (appMovil) {
                setHeightDiv('80%');
            } else {
                setHeightDiv('calc(100vh - 120px)');
            }

            cargarTicketsTrabajando(usuarioId, 0, 4)
        }
        else if (menuActivo == 4) {
            if (appMovil) {
                setHeightDiv('80%');
            } else {
                setHeightDiv('calc(100vh - 120px)');
            }

            cargarTicketsTrabajando(usuarioId, 0, 5)
        }
        else if (menuActivo == 5) {
            if (appMovil) {
                setHeightDiv('80%');
            } else {
                setHeightDiv('calc(100vh - 120px)');
            }

            cargarTicketsTrabajando(usuarioId, 0, 6)
        }
        else if (menuActivo == 6) {
            if (appMovil) {
                setHeightDiv('80%');
            } else {
                setHeightDiv('calc(100vh - 120px)');
            }

            cargarTicketsTrabajando(usuarioId, 0, 7)
        }
        else if (menuActivo == 7) {
            if (appMovil) {
                setHeightDiv('80%');
            } else {
                setHeightDiv('calc(100vh - 120px)');
            }

            cargarTicketsTrabajando(usuarioId, 0, 8)
        }
    }

    function cambioMenuSecundario(menu) {
        setsubMenuSelecionado(menu)
        setTicketsConsulta([]);
        $(".buscador").val("");
        terminoDeCargarTickets = true;
        setTicketsConsulta2 = []
        searchId = [];
        searchBuscador = "";
        setConsultandoTickets(true);
        submenuActivo = menu;
        if (menu == 2) {
            setOpcionFecha(true);
            if (appMovil) {
                setHeightDiv('calc(100vh - 210px)');
            } else {
                setHeightDiv('calc(100vh - 210px)');
            }
            cargarTicketsTrabajando(usuarioId, 0, 2)
        }
        if (menu == 1) {
            setOpcionFecha(false);
            setHeightDiv('calc(100vh - 120px)');
            cargarTicketsTrabajando(usuarioId, 0, 1)
        }
    }

    function filtroTrabajando(menu) {
        setselectFiltro(menu);
        if (menu == 0) {
            menu = 1;
        }
        searchproceso = menu;
        searchId = [];

        terminoDeCargarTickets = true;
        setTicketsConsulta([])
        setConsultandoTickets(true);

        clearTimeout(controladorTiempo);
        controladorTiempo = setTimeout(() => cargarTicketsTrabajando(usuarioId, 0, 2), 100);
    }

    function filtroFecha() {
        if (filtroFechaLocal == 1) {
            filtroFechaLocal = 2;
            searchfechas = 1;
        } else {
            searchfechas = 0;
            filtroFechaLocal = 1;
        }

        setseleFecha(filtroFechaLocal)

        terminoDeCargarTickets = true;
        setTicketsConsulta([])
        setConsultandoTickets(true);
        searchId = [];

        clearTimeout(controladorTiempo);
        controladorTiempo = setTimeout(() => cambioMenuPrincipal2(), 100);
        //hace la consulta
        /*
        if(menuActivo == 1){
            cargarTicketsTrabajando(usuarioId,0)
        }else if(menuActivo == 2){
            cargarTicketsPagos(usuarioId,0)
        }
        else if(menuActivo == 3){
            cargarTicketsProduccion(usuarioId,0)
        }
        else if(menuActivo == 4){
            cargarTicketsDespachados(usuarioId,0)
        }
        else if(menuActivo == 5){
            cargarTicketsClientes(usuarioId,0)
        }
        else if(menuActivo == 6){
            cargarTicketsNoInteresados(usuarioId,0)
        }*/

    }

    function convertirFecha(fechaStr) {
        const fecha = new Date(parseInt(fechaStr) * 1000);
        const ahora = new Date();

        const options = {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        };

        if (fecha.toDateString() !== ahora.toDateString()) {
            const optionsFullDate = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
            };

            let fullDateString = fecha.toLocaleString('es-ES', optionsFullDate);
            // Verificar si es 12 PM y establecerlo explícitamente como "12"
            if (fecha.getHours() === 12) {
                fullDateString = fullDateString.replace('0:', '12:');
            }
            return fullDateString;

        } else {
            // Verificar si es 12 PM y establecerlo explícitamente como "12"
            if (fecha.getHours() === 12) {
                return `12:${fecha.getMinutes().toString().padStart(2, '0')} PM`;
            } else {
                return fecha.toLocaleString('es-ES', options);
            }
        }
    }

    function abrirTicket(datos) {
        ticketActivo = datos;
        idMessage = 0;
        if (ticketActivo.cloud == 1) {
            cargarPlantillas(ticketActivo.lineaId)
        }
        setdivStyleHeight('calc(100% - 200px)')
        setticketAbierto(datos);
        mensajesCargadosTicket = [];
        banderaConsultandoMessages = true;
        setCargandoMensajes(true);

        cargarMessagesTicket(datos.id, 0);
        setMessagesChat([]);
        setContenidosMessagesChat([]);
        setMultimediaCargada([]);
        colaMultimedia = [];
        nuevosMensajes = [];
        setchatActivo(true);
        banderaConsultandoMessages = true;
        if (appMovil) {
            setdivStyleHeight('calc(100% - 250px)')
            $("#divChat").css("display", "block");
            $(".card-body").css({ "height": "110%", "background": "white", "paddingTop": "0px" });
            $(".divChat2").css("display", "none");
            $("nav").css("display", "none");
        }
    }


    function volverTicket() {
        $("#divChat").css("display", "none");
        $(".divChat2").css("display", "block");
        $("nav").css("display", "flex");
    }

    async function cargarAtajos(id) {
        await axios.post(process.env.ENDPOINT_API + '/whatsapp2/respuestasRapidas', { asesor: id }).then(dataRespuestasRapidas => {
            atajosFin = dataRespuestasRapidas.data.respuestas;
            setrespuestasRapidas(dataRespuestasRapidas.data.respuestas);
        }).catch(error => {
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (cargar atajos)",
                icon: "error"
            })
        });

        //carga los creditos del usuario
        await axios.post(process.env.ENDPOINT_API2 + '/api/user/getCreditos', {
            usuario: usuarioId
        }).then(async (data) => {
            if (data.data.data.flag) {
                setContCreditos(data.data.data.creditos.disponibles)
                setTotalCreditos(data.data.data.creditos.total)
                setResumenCreditos(data.data.data.resumen7dias);
            }
        }).catch(error => {
            console.log(error);
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Conexion perdida (cargar creditos)",
                icon: "error"
            })
        })
    }

    function personalizarPlantilla(datos) {
        let message = datos.body;
        datos.body = message.replace('{nameUsuario}', usuario.nombre);
        return datos;
    }

    async function cargarPlantillas(phone) {
        await axios.post(process.env.ENDPOINT_API2 + '/api/plantillas/phone', {
            phone: phone
        }).then(async (data) => {
            plantillasFin = data.data.data;
            for (let i = 0; i < plantillasFin.length; i++) {
                plantillasFin[i] = personalizarPlantilla(plantillasFin[i]);
            }
            console.log(plantillasFin);
            setPlantillas(plantillasFin);
        }).catch(error => {
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Conexion perdida (cargar plantillas)",
                icon: "error"
            })
        })
    }

    async function utilizarPlantilla() {
        let mensaje = detallePlantilla.body;
        let ackIcon = '';
        let idAck = 0;
        for (var e = arrAck.length - 1; e >= 0; e--) {
            if (arrAck[e].banderaAck == 4) {
                idAck = arrAck[e].banderaAck;
                ackIcon = arrAck[e].icon
            }
        }

        await axios.post(process.env.ENDPOINT_API2 + '/api/plantillas/sendMessage', {
            plantilla: detallePlantilla.id,
            ticket: ticketActivo.id,
            usuario: usuarioId,
            mensaje: mensaje,
            ack: idAck
        }).then(async (data) => {
            setmodalDetallMultimedia(false);
            cerrarAtajos()
            setContCreditos(prevCount => prevCount - 1)
            let clase = 'right';
            //let fotomessage = data.message.imageChat;
            let fecha = new Date();
            let hora = fecha.getTime() / 1000;
            let fechaMessage = convertirFecha(hora);


            var nuevaCadena = mensaje.replace(/\n/g, "\n").trim();


            // Crear un nuevo elemento span
            const nuevoMensaje = (
                <li id={`message-${data.data.data}`} className={`message ${clase}`}>
                    <img title={usuario.nombre} className={`logo logo${clase}`} src={usuario.foto} alt="" />
                    {detallePlantilla.imagen != "" && (
                        <img style={{ height: '45vh', background: 'none', width: 'auto', paddingRight: '10px', paddingTop: '10px' }} src={detallePlantilla.imagen} alt="" />
                    )}
                    <p>{nuevaCadena}</p>
                    <span>
                        <i id={`ack-${data.data.data}`} style={{ marginTop: '-3px' }} className={ackIcon}></i>
                        {fechaMessage}
                        <b style={{ marginLeft: '5px' }}>({usuario.nombre})</b>
                    </span>
                </li>
            );
            // Agregar el nuevo span a la lista de contenidosSpans
            setContenidosMessagesChat((prevMessages => [...prevMessages, nuevoMensaje]));
            $(".no-messages").hide();

            $("#texarePlantilla").val("")
            //baja el scroll
            setTimeout(() => {
                messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
            }, 100);

        }).catch(error => {
            console.log(error);
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Conexion perdida (cargar plantillas)",
                icon: "error"
            })
        })

        //cerrarAtajos();
        //setmodalDetallMultimedia(false);

        //$("#texarePlantilla").val(datos.body)
        //idPlantilla = datos.id;
        //cerrarPlantillas();
    }

    async function enviarMensajePlantilla() {
        if (idPlantilla != 0) {
            let mensaje = $("#texarePlantilla").val();
            let ackIcon = '';
            let idAck = 0;
            for (var e = arrAck.length - 1; e >= 0; e--) {
                if (arrAck[e].banderaAck == 4) {
                    idAck = arrAck[e].banderaAck;
                    ackIcon = arrAck[e].icon
                }
            }
            await axios.post(process.env.ENDPOINT_API2 + '/api/plantillas/sendMessage', {
                plantilla: idPlantilla,
                ticket: ticketActivo.id,
                usuario: usuarioId,
                mensaje: mensaje,
                ack: idAck
            }).then(async (data) => {
                setContCreditos(prevCount => prevCount - 1)
                let clase = 'right';
                //let fotomessage = data.message.imageChat;
                let fecha = new Date();
                let hora = fecha.getTime() / 1000;
                let fechaMessage = convertirFecha(hora);


                var nuevaCadena = mensaje.replace(/\n/g, "\n").trim();


                // Crear un nuevo elemento span
                const nuevoMensaje = (
                    <li id={`message-${data.data.data}`} className={`message ${clase}`}>
                        <img title={usuario.nombre} className={`logo logo${clase}`} src={usuario.foto} alt="" />
                        <p>{nuevaCadena}</p>
                        <span>
                            <i id={`ack-${data.data.data}`} style={{ marginTop: '-3px' }} className={ackIcon}></i>
                            {fechaMessage}
                            <b style={{ marginLeft: '5px' }}>({usuario.nombre})</b>
                        </span>
                    </li>
                );
                // Agregar el nuevo span a la lista de contenidosSpans
                setContenidosMessagesChat((prevMessages => [...prevMessages, nuevoMensaje]));
                $(".no-messages").hide();

                $("#texarePlantilla").val("")
                //baja el scroll
                setTimeout(() => {
                    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
                }, 100);

            }).catch(error => {
                console.log(error);
                const swalWithReact = withReactContent(Swal);
                // Manejar el error aquí
                withReactContent(Swal).fire({
                    title: "Error",
                    text: "Conexion perdida (cargar plantillas)",
                    icon: "error"
                })
            })
        }
    }

    async function editarInfContacto() {
        if (ticketActivo.type == 1) {
            await axios.post(process.env.ENDPOINT_API + '/whatsapp2/editInfContacto', {
                ticket: ticketActivo.id,
                name: inputName
            }).then(response => {
                setticketAbierto(prevState => ({
                    ...prevState,  // Copiar el estado anterior
                    nameLabel: inputName,
                    name: inputName
                }));
                ticketActivo.name = inputName;
                setmodalEditarInf(false);

                // Crear una copia del arreglo ticketPendientesFin
                var updatedTicket = setTicketsConsulta2.map(ticketLocal => {
                    // Verificar si el ID del ticket no es igual a 1 y retornarlo
                    if (ticketLocal.id == ticketActivo.id) {
                        return {
                            ...ticketLocal,
                            nameLabel: inputName,
                            name: inputName
                        };
                    } else {
                        return ticketLocal;
                    }
                });

                // Actualizar el estado de ticketTrabajando con el array actualizado
                setTicketsConsulta(updatedTicket);
                setTicketsConsulta2 = updatedTicket;


                // cambio Guardado
                withReactContent(Swal).fire({
                    title: "success",
                    text: "contacto actualizado",
                    icon: "success"
                })
            }).catch(error => {
                console.log(error);
                // Manejar el error aquí
                withReactContent(Swal).fire({
                    title: "Error",
                    text: "Comunica con soporte",
                    icon: "error"
                })
            });
        } else {
            //reporta como pago el ticket
            await axios.post(`${process.env.ENDPOINT_API2}/api/ticket/editInf`, {
                ticket: ticketActivo.id,
                name: inputName
            }).then(response => {
                setticketAbierto(prevState => ({
                    ...prevState,  // Copiar el estado anterior
                    nameLabel: inputName,
                    name: inputName
                }));
                ticketActivo.name = inputName;
                setmodalEditarInf(false);

                // Crear una copia del arreglo ticketPendientesFin
                var updatedTicket = setTicketsConsulta2.map(ticketLocal => {
                    // Verificar si el ID del ticket no es igual a 1 y retornarlo
                    if (ticketLocal.id == ticketActivo.id) {
                        return {
                            ...ticketLocal,
                            nameLabel: inputName,
                            name: inputName
                        };
                    } else {
                        return ticketLocal;
                    }
                });

                // Actualizar el estado de ticketTrabajando con el array actualizado
                setTicketsConsulta(updatedTicket);
                setTicketsConsulta2 = updatedTicket;


                // cambio Guardado
                withReactContent(Swal).fire({
                    title: "success",
                    text: "contacto actualizado",
                    icon: "success"
                })

            }).catch(error => {
                console.log(error);
                // Manejar el error aquí
                withReactContent(Swal).fire({
                    title: "Error",
                    text: "Comunica con soporte",
                    icon: "error"
                })
            });
        }
    }

    function editarInfoContacto() {
        if (ticketActivo.name == 'undefined') {
            setinputName("");
        } else {
            setinputName(ticketActivo.name);
        }
        setmodalEditarInf(true);
    }

    const handleInputChange = (event) => {
        setinputName(event.target.value); // Actualiza el estado con el valor del input
    };


    async function banderaTicket(ticket, valor) {

        let banderaReiniciar = false;
        var banderaAgregar = true;

        var updatedTicket = setTicketsConsulta2.map(ticketLocal => {
            // Verificar si el ID del ticket es igual a 1
            if (ticketLocal.id === ticket.id) {
                let background = "#adadad4d";
                let background2 = "#d3d3d3";
                let border = "#b7b7b7";
                if (ticketLocal.processesid == valor) {
                    valor = 1;
                }
                banderaAgregar = false;



                //Interesado
                if (valor == 2) {
                    background = "#c97f304d";
                    background2 = "#ebc399";
                    border = "#806400";
                }
                //pendiente pago
                if (valor == 3) {
                    background = "#0080004d";
                    background2 = "#92bf92";
                    border = "green";
                }

                // Si el ID coincide, clonar el objeto y actualizar la propiedad estado
                return {
                    ...ticketLocal,
                    background: background,
                    background2: background2,
                    border: border,
                    processesid: valor,
                };
            } else {
                // Si el ID no coincide, simplemente devolver el ticket sin cambios
                return ticketLocal;
            }
        });



        // Actualizar el estado de ticketTrabajando con el array actualizado
        setTicketsConsulta(updatedTicket);
        setTicketsConsulta2 = updatedTicket;

        setticketAbierto(prevTicket => ({
            ...prevTicket,
            processesid: valor
        }));

        if (ticketActivo.type == 1) {
            await axios.post(process.env.ENDPOINT_API + '/whatsapp2/processeTicket', {
                ticket: ticket.id,
                proceso: valor
            }).then(response => {
                cargarContadoresProcesos(usuarioId)
            }).catch(error => {
                const swalWithReact = withReactContent(Swal);
                // Manejar el error aquí
                withReactContent(Swal).fire({
                    title: "Error",
                    text: "Comunica con soporte (Interesado - pendiente pago)",
                    icon: "error"
                })
            });
        } else {
            await axios.post(`${process.env.ENDPOINT_API2}/api/ticket/cambioProceso`, {
                ticket: ticket.id,
                proceso: valor
            }).then(response => {
                cargarContadoresProcesos(usuarioId)
            }).catch(error => {
                const swalWithReact = withReactContent(Swal);
                // Manejar el error aquí
                withReactContent(Swal).fire({
                    title: "Error",
                    text: "Comunica con soporte (Interesado - pendiente pago)",
                    icon: "error"
                })
            });
        }
    }

    /*
        creador: jorge luis castrillon
        fecha: 16 de marzo 2024
        objetivo: cargar los asesores disponbiles
    */
    async function cargarAsesores(id) {
        await axios.post(process.env.ENDPOINT_API + '/whatsapp2/cargarAsesores', { asesor: id }).then(data => {
            setasesores(data.data.asesores);
        }).catch(error => {
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (cargar asesores)",
                icon: "error"
            })
        });

    }

    //envia el mensaje de la multimedia
    async function enviarMensajeMultimedia() {

        if (ticketActivo.type == 1) {
            if (ticketActivo.idStatus == 1) {
                //acepta el ticket
                await axios.post(process.env.ENDPOINT_API + '/whatsapp2/aceptarTicket', {
                    ticket: ticketActivo.id,
                    usuario: usuarioId
                }).then(response => {
                    ticketActivo.idStatus = 2;
                    // Crear una copia del arreglo ticketPendientesFin
                    var updatedTicket = setTicketsConsulta2.map(ticketLocal => {
                        // Verificar si el ID del ticket no es igual a 1 y retornarlo
                        if (ticketLocal.id !== ticketActivo.id) {
                            return ticketLocal;
                        }
                        // Retornar null para tickets que coinciden con el id a excluir
                        return null;
                    }).filter(ticket => ticket !== null);

                    // Actualizar el estado de ticketTrabajando con el array actualizado
                    setTicketsConsulta(updatedTicket);
                    setTicketsConsulta2 = updatedTicket;

                    cargarContadoresProcesos(usuarioId)

                    setticketAbierto(prevState => ({
                        ...prevState,  // Copiar el estado anterior
                        processesid: 1, // actualiza el proceso actual del ticket abierto
                        idStatus: 2
                    }));
                })
            }

            let mensaje = textareaPrueba2.data("emojioneArea").getText()

            let clase = 'right';
            //let fotomessage = data.message.imageChat;
            let fecha = new Date();
            let hora = fecha.getTime() / 1000;
            let fechaMessage = convertirFecha(hora);
            let ackIcon = '';
            for (var e = arrAck.length - 1; e >= 0; e--) {
                if (arrAck[e].banderaAck == 4) {
                    ackIcon = arrAck[e].icon
                }
            }

            var nuevaCadena = mensaje.replace(/\n/g, "\n").trim();

            detallMultimedia.message = nuevaCadena;
            arrcolaEnviandoMessage.push({
                id: usuario.user + '-' + hora,
                ticket: ticketActivo.id,
                hora: fecha.getTime() / 1000,
                multimedia: detallMultimedia,
                tipo: 3,
                status: 0,
                agregado: false,
                usuario: usuario.nombre,
                usuarioFoto: usuario.foto,
                text: nuevaCadena
            })

            let nuevoMensaje;
            if (detallMultimedia.typeId === 3) {
                nuevoMensaje = (
                    <>
                        <li className={`message ${clase}`}>
                            <img title={usuario.nombre} className={`logo logo${clase}`} src={usuario.foto} alt="" />
                            <div>
                                <audio controls style={{ maxWidth: '100%', marginTop: '10px' }}>
                                    <source src={process.env.ENDPOINT_API + '/static/' + detallMultimedia.mediaUrl} type="audio/ogg"></source>
                                </audio>
                            </div>
                            <span>
                                <i id={'1-' + usuario.user + '-' + hora} style={{ marginTop: '-3px' }} className={ackIcon}></i>
                                {fechaMessage}
                                <b style={{ marginLeft: '5px' }}>({usuario.nombre})</b>
                            </span>
                        </li>
                        {nuevaCadena.length > 0 ? (
                            <li className={`message ${clase}`}>
                                <img title={usuario.nombre} className={`logo logo${clase}`} src={usuario.foto} alt="" />
                                <p>{nuevaCadena}</p>
                                <span>
                                    <i id={'2-' + usuario.user + '-' + hora} style={{ marginTop: '-3px' }} className={ackIcon}></i>
                                    {fechaMessage}
                                    <b style={{ marginLeft: '5px' }}>({usuario.nombre})</b>
                                </span>
                            </li>
                        ) : (
                            <></>
                        )}

                    </>
                );
            } else {
                nuevoMensaje = (
                    <li className={`message ${clase}`}>
                        <img title={usuario.nombre} className={`logo logo${clase}`} src={usuario.foto} alt="" />
                        {detallMultimedia.typeId === 1 ? (
                            <img style={{ height: '45vh', background: 'none', width: 'auto', paddingRight: '10px', paddingTop: '10px' }} src={process.env.ENDPOINT_API + '/static/' + detallMultimedia.mediaUrl} alt="" />
                        ) : detallMultimedia.typeId === 2 ? (
                            <video
                                src={process.env.ENDPOINT_API + '/static/' + detallMultimedia.mediaUrl}
                                style={{ height: '45vh', background: 'none', width: 'auto', paddingRight: '10px', paddingTop: '10px', margin: 'auto' }}
                                controls='true'
                            ></video>
                        ) : detallMultimedia.typeId === 4 ? (
                            <iframe
                                src={process.env.ENDPOINT_API + '/static/' + detallMultimedia.mediaUrl}
                                style={{ height: '500px', width: '100%' }}
                            ></iframe>
                        ) : null}
                        <p>{nuevaCadena}</p>
                        <span>
                            <i id={usuario.user + '-' + hora} style={{ marginTop: '-3px' }} className={ackIcon}></i>
                            {fechaMessage}
                            <b style={{ marginLeft: '5px' }}>({usuario.nombre})</b>
                        </span>
                    </li>
                );
            }

            // Agregar el nuevo span a la lista de contenidosSpans
            setContenidosMessagesChat((prevMessages => [...prevMessages, nuevoMensaje]));


            //baja el scroll
            setTimeout(() => {
                messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
            }, 100);
            cerrarModal()
            galeriaClose();

            await axios.post(process.env.ENDPOINT_API + '/whatsapp2/enviarMensajeMultimedia', {
                ticket: ticketActivo.id,
                message: mensaje,
                idRespuesta: idRespuesta,
                typeRespuesta: typeRespuesta,
                multimedia: detallMultimedia.id,
                usuario: usuario.user,
                idLocal: usuario.user + '-' + hora
            }).then(response => {

                // Crear una copia del arreglo ticketPendientesFin
                var updatedTicket = setTicketsConsulta2.map(ticketLocal => {
                    // Verificar si el ID del ticket no es igual a 1 y retornarlo
                    if (ticketLocal.id == response.data.ticket) {
                        return {
                            ...ticketLocal,
                            mensajesPendientes: true
                        };
                    } else {
                        // Si el ID no coincide, simplemente devolver el ticket sin cambios
                        return ticketLocal;
                    }
                });

                // Actualizar el estado de ticketTrabajando con el array actualizado
                setTicketsConsulta(updatedTicket);
                setTicketsConsulta2 = updatedTicket;


                var div = document.getElementById(response.data.idLocal);

                if (div) {
                    let ackIcon = '';
                    for (var e = arrAck.length - 1; e >= 0; e--) {
                        if (arrAck[e].banderaAck == 5) {
                            ackIcon = arrAck[e].icon
                        }
                    }
                    // Cambiar la clase del div
                    div.className = ackIcon;
                    div.style.color = "#4ccf2b"
                    idRespuesta = 0;
                    typeRespuesta = 0;

                    for (var e = arrcolaEnviandoMessage.length - 1; e >= 0; e--) {
                        if (arrcolaEnviandoMessage[e].id == response.data.idLocal) {
                            arrcolaEnviandoMessage.splice(e, 1);
                        }
                    }
                }
            })
        } else {
            const extension = detallMultimedia?.mediaUrl.split('.').pop().toLowerCase();
            //es una audio
            if (extension === "mp3" || extension === "ogg" || extension === "wav") {
                let clase = 'right';
                let fecha = new Date();
                let hora = fecha.getTime() / 1000;
                let fechaMessage = convertirFecha(hora);
                let ackIcon = '';
                let idAck = 0;
                let urlObjeto = process.env.ENDPOINT_API + "/static/" + detallMultimedia?.mediaUrl
                for (var e = arrAck.length - 1; e >= 0; e--) {
                    if (arrAck[e].banderaAck == 4) {
                        idAck = arrAck[e].banderaAck;
                        ackIcon = arrAck[e].icon
                    }
                }
                var nuevaCadena = textareaPrueba2.data("emojioneArea").getText().replace(/\n/g, "\n").trim();
                if (nuevaCadena.length > 0) {
                    nuevaCadena = "";
                }
                arrcolaEnviandoMessage.push({
                    id: usuario.user + '-' + hora,
                    ticket: ticketActivo.id,
                    tipo: 3,
                    status: 0,
                    text: nuevaCadena,
                    intentos: 0,
                    ack: idAck,
                    ruta: detallMultimedia?.mediaUrl,
                    multimedia: detallMultimedia?.id,
                    usuario: usuarioId
                })

                let id = usuario.user + '-' + hora;

                const nuevoMensaje = (
                    <li id={`message-${id}`} className={`message ${clase}`}>
                        <img title={usuario.nombre} className={`logo logo${clase}`} src={usuario.foto} alt="" />
                        {extension === "jpg" || extension === "jpeg" || extension === "png" || extension === "gif" ? (
                            <img style={{ height: '45vh', background: 'none', width: 'auto', paddingRight: '10px', paddingTop: '10px' }} src={urlObjeto} alt="" />
                        ) : extension === "mp3" || extension === "ogg" || extension === "wav" ? (
                            <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>
                                <audio controls style={{ maxWidth: '100%', marginTop: '10px' }}>
                                    <source src={urlObjeto} type="audio/ogg"></source>
                                </audio>
                            </div>
                        ) : extension === "mp4" || extension === "webm" || extension === "mov" ? (
                            <video
                                src={urlObjeto}
                                style={{ height: '45vh', background: 'none', width: 'auto', paddingRight: '10px', paddingTop: '10px', margin: 'auto' }}
                                controls='true'
                            ></video>
                        ) :
                            <iframe
                                src={urlObjeto}
                                style={{ height: '500px', width: '100%' }}
                            ></iframe>
                        }
                        <p>{nuevaCadena}</p>
                        <span>
                            <i id={`ack-${id}`} style={{ marginTop: '-3px' }} className={ackIcon}></i>
                            {fechaMessage}
                            <b style={{ marginLeft: '5px' }}>({usuario.nombre})</b>
                        </span>
                    </li>
                );
                // Agregar el nuevo span a la lista de contenidosSpans
                setContenidosMessagesChat((prevMessages => [...prevMessages, nuevoMensaje]));

                nuevaCadena = textareaPrueba2.data("emojioneArea").getText().replace(/\n/g, "\n").trim();

                if (nuevaCadena.length > 0) {

                    clase = 'right';
                    fecha = new Date();
                    hora = fecha.getTime() / 1000;
                    fechaMessage = convertirFecha(hora);
                    ackIcon = '';
                    idAck = 0;
                    urlObjeto = process.env.ENDPOINT_API + "/static/" + detallMultimedia?.mediaUrl
                    for (var e = arrAck.length - 1; e >= 0; e--) {
                        if (arrAck[e].banderaAck == 4) {
                            idAck = arrAck[e].banderaAck;
                            ackIcon = arrAck[e].icon
                        }
                    }
                    nuevaCadena = textareaPrueba2.data("emojioneArea").getText().replace(/\n/g, "\n").trim();

                    arrcolaEnviandoMessage.push({
                        id: usuario.user + '-' + hora + "-1",
                        ticket: ticketActivo.id,
                        tipo: 1,
                        status: 0,
                        text: nuevaCadena,
                        intentos: 0,
                        ack: idAck,
                        usuario: usuarioId
                    })

                    let id = usuario.user + '-' + hora + "-1";

                    const nuevoMensaje = (
                        <li id={`message-${id}`} className={`message ${clase}`}>
                            <img title={usuario.nombre} className={`logo logo${clase}`} src={usuario.foto} alt="" />
                            <p>{nuevaCadena}</p>
                            <span>
                                <i id={`ack-${id}`} style={{ marginTop: '-3px' }} className={ackIcon}></i>
                                {fechaMessage}
                                <b style={{ marginLeft: '5px' }}>({usuario.nombre})</b>
                            </span>
                        </li>
                    );
                    // Agregar el nuevo span a la lista de contenidosSpans
                    setContenidosMessagesChat((prevMessages => [...prevMessages, nuevoMensaje]));
                }

            } else {
                let clase = 'right';
                let fecha = new Date();
                let hora = fecha.getTime() / 1000;
                let fechaMessage = convertirFecha(hora);
                let ackIcon = '';
                let idAck = 0;
                let urlObjeto = process.env.ENDPOINT_API + "/static/" + detallMultimedia?.mediaUrl

                for (var e = arrAck.length - 1; e >= 0; e--) {
                    if (arrAck[e].banderaAck == 4) {
                        idAck = arrAck[e].banderaAck;
                        ackIcon = arrAck[e].icon
                    }
                }
                var nuevaCadena = textareaPrueba2.data("emojioneArea").getText().replace(/\n/g, "\n").trim();

                arrcolaEnviandoMessage.push({
                    id: usuario.user + '-' + hora,
                    ticket: ticketActivo.id,
                    tipo: 3,
                    status: 0,
                    text: nuevaCadena,
                    intentos: 0,
                    ack: idAck,
                    ruta: detallMultimedia?.mediaUrl,
                    multimedia: detallMultimedia?.id,
                    usuario: usuarioId
                })

                let id = usuario.user + '-' + hora;

                const nuevoMensaje = (
                    <li id={`message-${id}`} className={`message ${clase}`}>
                        <img title={usuario.nombre} className={`logo logo${clase}`} src={usuario.foto} alt="" />
                        {extension === "jpg" || extension === "jpeg" || extension === "png" || extension === "gif" ? (
                            <img style={{ height: '45vh', background: 'none', width: 'auto', paddingRight: '10px', paddingTop: '10px' }} src={urlObjeto} alt="" />
                        ) : extension === "mp3" || extension === "ogg" || extension === "wav" ? (
                            <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>
                                <audio controls style={{ maxWidth: '100%', marginTop: '10px' }}>
                                    <source src={urlObjeto} type="audio/ogg"></source>
                                </audio>
                            </div>
                        ) : extension === "mp4" || extension === "webm" || extension === "mov" ? (
                            <video
                                src={urlObjeto}
                                style={{ height: '45vh', background: 'none', width: 'auto', paddingRight: '10px', paddingTop: '10px', margin: 'auto' }}
                                controls='true'
                            ></video>
                        ) :
                            <iframe
                                src={urlObjeto}
                                style={{ height: '500px', width: '100%' }}
                            ></iframe>
                        }
                        <p>{nuevaCadena}</p>
                        <span>
                            <i id={`ack-${id}`} style={{ marginTop: '-3px' }} className={ackIcon}></i>
                            {fechaMessage}
                            <b style={{ marginLeft: '5px' }}>({usuario.nombre})</b>
                        </span>
                    </li>
                );
                // Agregar el nuevo span a la lista de contenidosSpans
                setContenidosMessagesChat((prevMessages => [...prevMessages, nuevoMensaje]));
            }

            //baja el scroll
            setTimeout(() => {
                messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
            }, 100);
            cerrarModal()
            galeriaClose();

            if (enviandoMensajes == false) {
                enviandoMensajes = true;
                enviarMensajeServer();
            }

        }

        /*

        let clase = 'right';
        //let fotomessage = data.message.imageChat;
        let fecha = new Date();
        let hora = fecha.getTime()/1000;
        let fechaMessage = convertirFecha(hora);
        let ackIcon = '';
        for (var e = arrAck.length - 1; e >= 0; e--) {
            if(arrAck[e].banderaAck == 4){
                ackIcon = arrAck[e].icon
            }
        }
        arrcolaEnviandoMessage.push({id:usuario.user+'-'+hora})
        var nuevaCadena = mensaje.replace(/\n/g, "\n").trim();
        let nuevoSpan;

        if (detallMultimedia.typeId === 3) {
            nuevoSpan = (
                <>
                <li className={`message ${clase}`}>
                    <img title={usuario.nombre} className={`logo logo${clase}`} src={usuario.foto} alt="" />
                    <div>
                        <audio controls style={{maxWidth:'100%',marginTop:'10px'}}>
                            <source src={process.env.ENDPOINT_API+'/static/'+detallMultimedia.mediaUrl} type="audio/ogg"></source>
                        </audio>
                    </div>
                    <span>
                        <i id={'1-'+usuario.user+'-'+hora} style={{marginTop:'-3px'}} className={ackIcon}></i>
                        {fechaMessage} 
                        <b style={{marginLeft:'5px'}}>({usuario.nombre})</b>
                    </span>
                </li>
                {nuevaCadena.length > 0 ? (
                    <li className={`message ${clase}`}>
                        <img title={usuario.nombre} className={`logo logo${clase}`} src={usuario.foto} alt="" />
                        <p>{nuevaCadena}</p>
                        <span>
                            <i id={'2-'+usuario.user+'-'+hora} style={{marginTop:'-3px'}} className={ackIcon}></i>
                            {fechaMessage} 
                            <b style={{marginLeft:'5px'}}>({usuario.nombre})</b>
                        </span>
                    </li>
                ):(
                    <></>
                )}
                
                </>
            );
        } else {
            nuevoSpan = (
                <li className={`message ${clase}`}>
                <img title={usuario.nombre} className={`logo logo${clase}`} src={usuario.foto} alt="" />
                {detallMultimedia.typeId === 1 ? (
                    <img style={{height: '45vh',background:'none',width: 'auto',paddingRight: '10px',paddingTop: '10px'}} src={process.env.ENDPOINT_API+'/static/'+detallMultimedia.mediaUrl} alt="" />
                ) : detallMultimedia.typeId === 2 ? (
                    <video
                    src={process.env.ENDPOINT_API+'/static/'+detallMultimedia.mediaUrl}
                    style={{height: '45vh',background:'none',width: 'auto',paddingRight: '10px',paddingTop: '10px',margin:'auto'}}
                    controls='true'
                    ></video>
                ): detallMultimedia.typeId === 4 ? (
                    <iframe
                    src={process.env.ENDPOINT_API+'/static/'+detallMultimedia.mediaUrl}
                    style={{height: '500px',width: '100%'}}
                    ></iframe>
                ) : null}
                <p>{nuevaCadena}</p>
                <span>
                    <i id={usuario.user+'-'+hora} style={{marginTop:'-3px'}} className={ackIcon}></i>
                    {fechaMessage} 
                    <b style={{marginLeft:'5px'}}>({usuario.nombre})</b>
                </span>
                </li>
            );
        }

        
        //actualiza los mensajes sin leer
        for (var e = chatConMensajes.length - 1; e >= 0; e--) {
            if(chatConMensajes[e].id == ticketAbierto2.id){
                chatConMensajes.splice(e, 1);
                break;
            }
        }

        var chatsSinLeer1 = [];
        var messagesChat = 0;
        for (var e = chatConMensajes.length - 1; e >= 0; e--) {
            if(chatConMensajes[e].idStatus == 1 || chatConMensajes[e].idStatus == 2){
                chatsSinLeer1.push(chatConMensajes[e])
                messagesChat += chatConMensajes[e].unreadMessages;
            }
        }
        if(ticketAbierto2.idStatus == 1 || ticketAbierto2.idStatus == 2){
            setmessagesInbox({alert:1, messages: messagesChat, conversaciones: chatsSinLeer1.length})
            setTimeout(() => {
                setmessagesInbox(prevState => ({ ...prevState, alert: 0 }));
            }, 2000);
        }else{
            setmessagesInbox({alert:0, messages: messagesChat, conversaciones: chatsSinLeer1.length})
        }
        

        var chatsSinLeer2 = [];
        var messagesChat = 0;
        for (var e = chatConMensajes.length - 1; e >= 0; e--) {
            if(chatConMensajes[e].idStatus == 3){
                chatsSinLeer2.push(chatConMensajes[e])
                messagesChat += chatConMensajes[e].unreadMessages;
            }
        }
        
        if(ticketAbierto2.idStatus == 3){
            setmessagesPagos({alert:1, messages: messagesChat, conversaciones: chatsSinLeer2.length})
            setTimeout(() => {
                setmessagesPagos(prevState => ({ ...prevState, alert: 0 }));
            }, 2000);
        }else{
            setmessagesPagos({alert:0, messages: messagesChat, conversaciones: chatsSinLeer2.length})
        }
        
        var chatsSinLeer3 = [];
        var messagesChat = 0;
        for (var e = chatConMensajes.length - 1; e >= 0; e--) {
            if(chatConMensajes[e].idStatus == 4){
                chatsSinLeer3.push(chatConMensajes[e])
                messagesChat += chatConMensajes[e].unreadMessages;
            }
        }
        if(ticketAbierto2.idStatus == 4){
            setmessagesProduccion({alert:1, messages: messagesChat, conversaciones: chatsSinLeer3.length})
            setTimeout(() => {
                setmessagesProduccion(prevState => ({ ...prevState, alert: 0 }));
            }, 2000);
        }else{
            setmessagesProduccion({alert:0, messages: messagesChat, conversaciones: chatsSinLeer3.length})
        }
        

        var chatsSinLeer4 = [];
        var messagesChat = 0;
        for (var e = chatConMensajes.length - 1; e >= 0; e--) {
            if(chatConMensajes[e].idStatus == 5){
                chatsSinLeer4.push(chatConMensajes[e])
                messagesChat += chatConMensajes[e].unreadMessages;
            }
        }
        if(ticketAbierto2.idStatus == 5){
            setmessagesDespacho({alert:1, messages: messagesChat, conversaciones: chatsSinLeer4.length})
            setTimeout(() => {
                setmessagesDespacho(prevState => ({ ...prevState, alert: 0 }));
            }, 2000);
        }else{
            setmessagesDespacho({alert:0, messages: messagesChat, conversaciones: chatsSinLeer4.length})
        }
        
        var chatsSinLeer5 = [];
        var messagesChat = 0;
        for (var e = chatConMensajes.length - 1; e >= 0; e--) {
            if(chatConMensajes[e].idStatus == 6){
                chatsSinLeer5.push(chatConMensajes[e])
                messagesChat += chatConMensajes[e].unreadMessages;
            }
        }
        if(ticketAbierto2.idStatus == 6){
            setmessagesClientes({alert:1, messages: messagesChat, conversaciones: chatsSinLeer5.length})
            setTimeout(() => {
                setmessagesClientes(prevState => ({ ...prevState, alert: 0 }));
            }, 2000);
        }else{
            setmessagesClientes({alert:0, messages: messagesChat, conversaciones: chatsSinLeer5.length})
        }
        

        var chatsSinLeer6 = [];
        var messagesChat = 0;
        for (var e = chatConMensajes.length - 1; e >= 0; e--) {
            if(chatConMensajes[e].idStatus == 7){
                chatsSinLeer6.push(chatConMensajes[e])
                messagesChat += chatConMensajes[e].unreadMessages;
            }
        }
        if(ticketAbierto2.idStatus == 7){
            setmessagesNoInteresados({alert:1, messages: messagesChat, conversaciones: chatsSinLeer6.length})
            setTimeout(() => {
                setmessagesNoInteresados(prevState => ({ ...prevState, alert: 0 }));
            }, 2000);
        }else{
            setmessagesNoInteresados({alert:0, messages: messagesChat, conversaciones: chatsSinLeer6.length})
        }
        
        //ciera la modal
        setmodalDetallMultimedia(false);
        galeriaClose()

        // Agregar el nuevo span a la lista de contenidosSpans
        setcontenidosMessagesChat([...messagesChatFront, nuevoSpan]);
        //messagesChat.push(data.message)
        messagesChatFront.push(nuevoSpan);

        setTimeout(() => {
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }, 100);

        //acepta el ticket
        await axios.post(process.env.ENDPOINT_API+'/whatsapp2/enviarMensajeMultimedia',{ 
            ticket      : ticketAbierto2.id,
            message     : mensaje,
            idRespuesta : idRespuesta,
            typeRespuesta : typeRespuesta,
            multimedia  : detallMultimedia.id,
            usuario     : usuario.user,
            idLocal     : usuario.user+'-'+hora
        }).then(response => {

            var div = document.getElementById(response.data.idLocal);
            let ackIcon = '';
            for (var e = arrAck.length - 1; e >= 0; e--) {
                if(arrAck[e].banderaAck == 5){
                    ackIcon = arrAck[e].icon
                }
            }
            // Cambiar la clase del div
            div.className = ackIcon;
            div.style.color = "#4ccf2b"

            idRespuesta = 0;
            typeRespuesta = 0;
        })*/
    }

    /*
        creador: jorge luis castrillon
        fecha: 17 de marzo 2024
        objetivo: cargar los contadores generales de cada proceso
    */
    async function cargarContadoresProcesos(id) {
        await axios.post(process.env.ENDPOINT_API2 + '/api/ticket/contadorProcesos',
            { usuario: id }
        ).then(data => {
            if (usuarioId == data.data.data.usuario) {
                var opcionesMenuCopi = opcionesMenu.map(menu => {
                    //reinicia los contadores
                    var conversacionesConMsg = 0;
                    var messagesSinLeer = 0;
                    var subMenu = menu.subMenu;
                    for (var e = subMenu.length - 1; e >= 0; e--) {
                        subMenu[e].tickets = 0;
                        subMenu[e].messages = 0;
                        subMenu[e].conversaciones = 0;
                        if (subMenu[e].subFiltros.length > 0) {
                            for (var h = subMenu[e].subFiltros.length - 1; h >= 0; h--) {
                                subMenu[e].subFiltros[h].contador = 0;
                            }
                        }
                    }
                    let contTickets = 0;
                    for (var i = data.data.data.procesos.length - 1; i >= 0; i--) {
                        if (data.data.data.procesos[i].idFront == menu.id) {
                            if (data.data.data.procesos[i].idFront == 1) {


                            }
                            contTickets += data.data.data.procesos[i].result.length
                            let filtrosMensajes = data.data.data.procesos[i].result.filter(conversacion => conversacion.unreadMessages > 0);
                            conversacionesConMsg += filtrosMensajes.length;
                            messagesSinLeer += filtrosMensajes.reduce((total, conversacion) => total + parseInt(conversacion.unreadMessages), 0);
                        }
                    }
                    for (var i = subMenu.length - 1; i >= 0; i--) {
                        for (var h = data.data.data.procesos.length - 1; h >= 0; h--) {
                            if (subMenu[i].id == data.data.data.procesos[h].idSubMenu) {
                                subMenu[i].tickets = data.data.data.procesos[h].result.length
                                let filtrosMensajes = data.data.data.procesos[h].result.filter(conversacion => conversacion.unreadMessages > 0);
                                subMenu[i].messages = filtrosMensajes.reduce((total, conversacion) => total + parseInt(conversacion.unreadMessages), 0);
                                subMenu[i].conversaciones = filtrosMensajes.length;
                                let ticketsFiltro = data.data.data.procesos[h].result;
                                if (subMenu[i].subFiltros.length > 0) {
                                    for (var g = subMenu[i].subFiltros.length - 1; g >= 0; g--) {
                                        if (subMenu[i].subFiltros[g].id == 0) {
                                            subMenu[i].subFiltros[g].contador = ticketsFiltro.length
                                        } else {
                                            subMenu[i].subFiltros[g].contador = ticketsFiltro.filter(conversacion => conversacion.processesid == subMenu[i].subFiltros[g].id).length;
                                        }
                                    }
                                }
                            }
                        }
                    }

                    return {
                        ...menu,
                        tickets: contTickets,
                        conversaciones: conversacionesConMsg,
                        messages: messagesSinLeer,
                        subMenu: subMenu
                    };
                    return menu;
                })
                //actualiza las opciones del menu
                setOpcionesMenu(opcionesMenuCopi);
            }
        }).catch(error => {
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (contadores Procesos)",
                icon: "error"
            })
        });
    }

    const handleClick2 = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose2 = () => {
        setAnchorEl(null);
    };

    /*
        creador: jorge luis castrillon
        fecha: 17 de marzo 2024
        objetivo: cargar los ack que maneja whatsapp
    */
    async function cargarAckMessages() {
        await axios.post(process.env.ENDPOINT_API + '/whatsapp2/ackMessages').then((dataAck) => {
            arrAck = dataAck.data.ackMessages
        }).catch(error => {
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (ack mensajes)",
                icon: "error"
            })
        });

    }

    function actualizarDiferencia() {
        const ahora = Date.now();
        console.log(ticketActivo.finVentana);
        const finVentanaMs = ticketActivo.finVentana * 1000; // El timestamp que recibes ahora
        let diferenciaMs = finVentanaMs - ahora;
        const esFuturo = diferenciaMs >= 0;
        diferenciaMs = Math.abs(diferenciaMs);

        const horas = Math.floor(diferenciaMs / (1000 * 60 * 60));
        const minutos = Math.floor((diferenciaMs % (1000 * 60 * 60)) / (1000 * 60));
        console.log(horas);
        if (esFuturo) {
            setColorMessageVentana('rgb(209, 209, 209)')
            velocidadTitileo = 0;
            if (horas < 3 && horas > 1) {
                velocidadTitileo = 3;
                setColorMessageVentana('orange');
            }
            if (horas < 2) {
                velocidadTitileo = 2;
                setColorMessageVentana('red');
                if (minutos < 30) {
                    velocidadTitileo = 1;
                }
            }

            setMessageVentana(`${horas} hora${horas !== 1 ? 's' : ''} y ${minutos} minuto${minutos !== 1 ? 's' : ''}`);
        }
    }

    const cargarMessagesTicket = async (ticket, offset) => {
        setCargandoMensajes(true);
        if (offset == 0) {
            $(".emojionearea").show();
            $(".limitesCloud").show();
            ticketActivo.ventana = 0;
            setticketAbierto(prevState => ({
                ...prevState,
                ventana: 0,
            }));
        }

        try {
            let response = "";
            if (ticketActivo.type == 1) {
                response = await axios.post(`${process.env.ENDPOINT_API}/whatsapp2/cargarMessagesTicket`, {
                    ticket: ticket,
                    offset: offset
                });

                if (ticket === response.data.ticket) {
                    banderaConsultandoMessages = false;
                    offsetMessagesActivos = offset;
                    if (offset === 0) {
                        tieneMensajesPendientes = true;
                        for (var i = arrcolaEnviandoMessage.length - 1; i >= 0; i--) {
                            arrcolaEnviandoMessage[i].agregado = false;
                        }
                        setMessagesChat([]);
                        setContenidosMessagesChat([]);
                        setMultimediaCargada([]);
                        colaMultimedia = [];
                    }

                    if (response.data.messages.length === 0 && offset === 0) {
                        setContenidosMessagesChat([
                            <div key="no-messages" className='no-messages' style={{ width: '100%', textAlign: 'center' }}>
                                No se encontraron mensajes <b>VERIFICA EN EL MOVIL</b>
                            </div>
                        ]);
                        return;
                    }

                    let nuevosMensajes = [];

                    if (offset === 0) {
                        response.data.messages.reverse().forEach(message => {
                            let multimedia = multimediaCargada.find(media => media.id === message.mediaKey);
                            if (message.mediaKey && message.mediaKey !== '0' && message.mediaKey !== 'undefined') {
                                if (colaMultimedia.length == 0) {
                                    colaMultimedia.push(message)
                                } else {
                                    colaMultimedia.unshift(message);
                                }
                            }
                            nuevosMensajes.push(renderMessage(message, multimedia));
                        });
                    } else {
                        response.data.messages.forEach(message => {
                            let multimedia = multimediaCargada.find(media => media.id === message.mediaKey);
                            if (message.mediaKey && message.mediaKey !== '0' && message.mediaKey !== 'undefined') {
                                if (colaMultimedia.length == 0) {
                                    colaMultimedia.push(message)
                                } else {
                                    colaMultimedia.unshift(message);
                                }
                            }
                            nuevosMensajes.push(renderMessage(message, multimedia));
                        });
                    }

                    // Valida Mensajes Pendientes por enviar a servidor
                    for (var i = 0; i < arrcolaEnviandoMessage.length; i++) {
                        if (arrcolaEnviandoMessage[i].ticket === ticket && arrcolaEnviandoMessage[i].agregado === false) {
                            // nuevosMensajes.push(renderMessagePendientes(arrcolaEnviandoMessage[i]));
                        }
                    }

                    // Mensajes pendientes en el servidor
                    response.data.mensajesPendientes.forEach(message => {
                        nuevosMensajes.push(renderMessagePendientesServer(message));
                    });

                    response.data.messages.forEach(message => {
                        mensajesCargadosTicket.push(message);
                    });

                    if (offset === 0) {
                        setMessagesChat(response.data.messages);
                        setContenidosMessagesChat(nuevosMensajes);
                    } else {
                        setMessagesChat(prevMessages => [...prevMessages, ...response.data.messages]);
                        setContenidosMessagesChat(prevMessages => [...nuevosMensajes, ...prevMessages]);
                    }

                    if (response.data.messages.length < 20) {
                        tieneMensajesPendientes = false;
                    }

                    if (colaMultimedia.length > 0) {
                        setTimeout(() => {
                            cargarMultimedia();
                        }, 300);
                    }

                    if (offset === 0) {
                        setTimeout(() => {
                            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
                        }, 100);
                    }

                    if (idMessage !== 0) {
                        const messageDiv = document.getElementById('message-' + idMessage);
                        if (messageDiv) {
                            const chatContainer = document.querySelector('.chat-container');
                            chatContainer.scrollTop = messageDiv.offsetTop;
                        }
                    }

                    banderaConsultandoMessages = false;
                }

            } else {
                response = await axios.post(`${process.env.ENDPOINT_API2}/api/ticket/cargarMessages`, {
                    ticket: ticket,
                    offset: offset
                });

                banderaConsultandoMessages = false;
                if (offset == 0 && ticketActivo.cloud == 1) {
                    tieneMensajesPendientes = true;
                    ticketActivo.ventana = response.data.data.ventana
                    ticketActivo.finVentana = response.data.data.finVentana
                    //es un chat de cloud
                    setticketAbierto(prevState => ({
                        ...prevState,  // Copiar el estado anterior
                        ventana: response.data.data.ventana,
                        finVentana: response.data.data.finVentana
                    }));


                    if (response.data.data.ventana != 0) {
                        if (intervaloVentana) {
                            clearInterval(intervaloVentana);
                        }
                        actualizarDiferencia(); // Llamado inmediato
                        intervaloVentana = setInterval(actualizarDiferencia, 60 * 1000);
                    } else {
                        setdivStyleHeight('calc(100% - 185px)')
                        $(".emojionearea").hide();
                        $(".limitesCloud").hide();
                    }
                }
                if (response.data.data.messages.length < 20) {
                    tieneMensajesPendientes = false;
                }
                if (response.data.data.messages.length == 0 && offset == 0) {
                    setContenidosMessagesChat([
                        <div key="no-messages" className='no-messages' style={{ width: '100%', textAlign: 'center' }}>
                            No se encontraron mensajes
                        </div>
                    ]);
                } else {
                    let nuevosMensajes = [];

                    if (offset === 0) {
                        response.data.data.messages.reverse().forEach(message => {
                            let multimedia = multimediaCargada.find(media => media.id === message.mediaKey);
                            if (message.mediaKey && message.mediaKey !== '0' && message.mediaKey !== 'undefined') {
                                if (colaMultimedia.length == 0) {
                                    colaMultimedia.push(message)
                                } else {
                                    colaMultimedia.unshift(message);
                                }
                            }
                            nuevosMensajes.push(renderMessageCloud(message, multimedia));
                        });
                    } else {
                        response.data.data.messages.reverse().forEach(message => {
                            let multimedia = multimediaCargada.find(media => media.id === message.mediaKey);
                            if (message.mediaKey && message.mediaKey !== '0' && message.mediaKey !== 'undefined') {
                                if (colaMultimedia.length == 0) {
                                    colaMultimedia.push(message)
                                } else {
                                    colaMultimedia.unshift(message);
                                }
                            }
                            nuevosMensajes.push(renderMessageCloud(message, multimedia));
                        });
                    }

                    if (offset === 0) {
                        setContenidosMessagesChat(nuevosMensajes);
                        //baja el scroll
                        setTimeout(() => {
                            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
                        }, 100);
                    } else {
                        setContenidosMessagesChat(prevMessages => [...nuevosMensajes, ...prevMessages]);
                    }
                }
            }



        } catch (error) {
            console.log(error);
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (Cargar mensajes)",
                icon: "error"
            });
        } finally {
            setCargandoMensajes(false);
        }
    };

    const renderMessagePendientesServer = (message) => {
        let clase = 'right';
        //let fotomessage = data.message.imageChat;
        let fecha = new Date();
        let hora = message.hora;
        let fechaMessage = convertirFecha(hora);
        let ackIcon = '';
        for (var e = arrAck.length - 1; e >= 0; e--) {
            if (arrAck[e].banderaAck == 5) {
                ackIcon = arrAck[e].icon
            }
        }

        return (
            <li className={`message ${clase}`}>
                <img title={message.titleAsesor} className={`logo logo${clase}`} src={message.imageChat} alt="" />
                <p>{message.message}</p>
                <span>
                    <i id={message.id} style={{ color: '#4ccf2b', marginTop: '-3px' }} className={ackIcon}></i>
                    {fechaMessage}
                    <b style={{ marginLeft: '5px' }}>({message.titleAsesor})</b>
                </span>
            </li>
        );
    }

    const renderMessagePendientes = (message) => {
        let clase = 'right';
        //let fotomessage = data.message.imageChat;
        let fecha = new Date();
        let hora = message.hora;
        let fechaMessage = convertirFecha(hora);
        let ackIcon = '';
        for (var e = arrAck.length - 1; e >= 0; e--) {
            if (arrAck[e].banderaAck == 4) {
                ackIcon = arrAck[e].icon
            }
        }
        let color = "#647486"
        if (message.status == 1) {
            ackIcon = "bx bxs-info-circle"
            color = "red"
        }

        if (message.tipo == 1) {
            return (
                <li className={`message ${clase}`}>
                    <img title={message.usuario} className={`logo logo${clase}`} src={message.usuarioFoto} alt="" />
                    <p>{message.text}</p>
                    <span>
                        <i id={message.id} style={{ marginTop: '-3px', color: color }} className={ackIcon}></i>
                        {fechaMessage}
                        <b style={{ marginLeft: '5px' }}>({message.usuario})</b>
                    </span>
                </li>
            );
        }
        if (message.tipo == 2) {
            return (
                <li className={`message ${clase}`}>
                    <img title={message.usuario} className={`logo logo${clase}`} src={message.usuarioFoto} alt="" />
                    {file.type.includes("image") ? (
                        <img style={{ height: '45vh', background: 'none', width: 'auto', paddingRight: '10px', paddingTop: '10px' }} src={message.urlSelect} alt="" />
                    ) : file.type.includes("audio") ? (
                        <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>
                            <audio controls style={{ maxWidth: '100%', marginTop: '10px' }}>
                                <source src={message.urlSelect} type="audio/ogg"></source>
                            </audio>
                        </div>
                    ) : file.type.includes("video") ? (
                        <video
                            src={message.urlSelect}
                            style={{ height: '45vh', background: 'none', width: 'auto', paddingRight: '10px', paddingTop: '10px', margin: 'auto' }}
                            controls='true'
                        ></video>
                    ) :
                        <iframe
                            src={message.urlSelect}
                            style={{ height: '500px', width: '100%' }}
                        ></iframe>
                    }
                    <p>{message.text}</p>
                    <span>
                        <i id={message.id} style={{ marginTop: '-3px', color: color }} className={ackIcon}></i>
                        {fechaMessage}
                        <b style={{ marginLeft: '5px' }}>({message.usuario})</b>
                    </span>
                </li>
            );
        }
        if (message.tipo == 3) {
            if (message.multimedia.typeId === 3) {
                return (
                    <>
                        <li className={`message ${clase}`}>
                            <img title={message.usuario} className={`logo logo${clase}`} src={message.usuarioFoto} alt="" />
                            <div>
                                <audio controls style={{ maxWidth: '100%', marginTop: '10px' }}>
                                    <source src={process.env.ENDPOINT_API + '/static/' + message.multimedia.mediaUrl} type="audio/ogg"></source>
                                </audio>
                            </div>
                            <span>
                                <i id={'1-' + message.id} style={{ marginTop: '-3px' }} className={ackIcon}></i>
                                {fechaMessage}
                                <b style={{ marginLeft: '5px' }}>({message.usuario})</b>
                            </span>
                        </li>
                        {message.multimedia.message.length > 0 ? (
                            <li className={`message ${clase}`}>
                                <img title={message.usuario} className={`logo logo${clase}`} src={message.usuarioFoto} alt="" />
                                <p>{message.multimedia.message}</p>
                                <span>
                                    <i id={'2-' + message.id} style={{ marginTop: '-3px' }} className={ackIcon}></i>
                                    {fechaMessage}
                                    <b style={{ marginLeft: '5px' }}>({message.usuario})</b>
                                </span>
                            </li>
                        ) : (
                            <></>
                        )}

                    </>
                );
            } else {
                return (
                    <li className={`message ${clase}`}>
                        <img title={message.usuario} className={`logo logo${clase}`} src={usuario.foto} alt="" />
                        {message.multimedia.typeId === 1 ? (
                            <img style={{ margin: 'auto', maxHeight: '45vh', background: 'none', width: 'auto', paddingRight: '10px', paddingTop: '10px' }} src={process.env.ENDPOINT_API + '/static/' + message.multimedia.mediaUrl} alt="" />
                        ) : message.multimedia.typeId === 2 ? (
                            <video
                                src={process.env.ENDPOINT_API + '/static/' + message.multimedia.mediaUrl}
                                style={{ maxHeight: '45vh', background: 'none', width: 'auto', paddingRight: '10px', paddingTop: '10px', margin: 'auto' }}
                                controls='true'
                            ></video>
                        ) : message.multimedia.typeId === 4 ? (
                            <iframe
                                src={process.env.ENDPOINT_API + '/static/' + message.multimedia.mediaUrl}
                                style={{ maxHeight: '500px', width: '100%' }}
                            ></iframe>
                        ) : null}
                        <p>{message.multimedia.message}</p>
                        <span>
                            <i id={message.id} style={{ marginTop: '-3px' }} className={ackIcon}></i>
                            {fechaMessage}
                            <b style={{ marginLeft: '5px' }}>({message.usuario})</b>
                        </span>
                    </li>
                );
            }
        }
        if (message.tipo == 4) {
            return (
                <li className={`message ${clase}`}>
                    <img title={message.usuario} className={`logo logo${clase}`} src={message.usuarioFoto} alt="" />
                    <audio controls style={{ maxWidth: '100%', marginTop: '10px' }}><source src={`data:audio/ogg;codecs=opus;base64,${message.audio}`} type="audio/ogg"></source></audio>
                    <span>
                        <i id={message.id} style={{ marginTop: '-3px', color: color }} className={ackIcon}></i>
                        {fechaMessage}
                        <b style={{ marginLeft: '5px' }}>({message.usuario})</b>
                    </span>
                </li>
            );
        }

    }

    const renderMessage = (message, multimedia) => {
        const clase = message.fromMe === 0 ? 'left' : 'right';
        const fotomessage = message.imageChat;
        const fechaMessage = convertirFecha(message.created);
        let ackIcon = "";
        for (var e = arrAck.length - 1; e >= 0; e--) {
            if (arrAck[e].banderaAck == message.ack) {
                ackIcon = arrAck[e].icon;
            }
        }
        let srcMultimedia = "";
        let cargoMultimedia = false;
        let opcionesMultimedia = [];

        if (multimedia) {
            //cargoMultimedia = true;
            if (multimedia.data.message.body.includes("/static/") || multimedia.data.message.body.includes("/upload/") || multimedia.data.message.body.includes("/multimedia/")) {
                srcMultimedia = `${process.env.ENDPOINT_API}/static/${multimedia.data.message.body}`;
            } else {
                srcMultimedia = `data:${multimedia.data.message.mimeType};base64,${multimedia.data.message.body}`;
            }
            opcionesMultimedia = multimedia.data;
        }

        return (
            <li className={`message ${clase}`} key={message.id} id={`message-${message.id}`}>
                <img title={message.titleAsesor} className={`logo logo${clase}`} src={fotomessage} alt="" />
                {message.idAnuncio > 0 && message.anuncio.length > 0 && (
                    <div className={`mencionado-${clase}`}>
                        {message.anuncio[0].title}:
                        <img style={{ maxHeight: '100px', margin: 'auto', marginTop: '2px' }} src={`${process.env.ENDPOINT_IMG}${message.anuncio[0].image}`} alt="anuncio" />
                        <div style={{ textAlign: 'right', borderTop: '1px solid' }}>
                            <a target="_blank" href={message.anuncio[0].url} rel="noopener noreferrer">
                                <i className='bx bx-link' style={{ marginRight: '-6px' }}></i> Anuncio
                            </a>
                        </div>
                    </div>
                )}
                {message.quotedMsg !== 0 && message.mencionado && (
                    <div className={`mencionado-${clase}`}>
                        {message.mencionado.mediaKey && message.mencionado.mediaKey !== '0' && message.mencionado.mediaKey !== 'undefined' ? (
                            <div className={`multimedia-${message.mencionado.mediaKey}`}>
                                <p>
                                    <i style={{ marginTop: '-3px' }} className='bx bx-loader bx-spin'></i>
                                    Cargando Multimedia
                                </p>
                            </div>
                        ) : (
                            <p style={{ textAlign: 'left' }}>{message.mencionado.body}</p>
                        )}
                    </div>
                )}
                {message.mediaKey && message.mediaKey !== '0' && message.mediaKey !== 'undefined' ? (
                    <>
                        {message.typeMultimedia === 3 ? (
                            <>
                                <div className={`multimedia-${message.mediaKey}`}>
                                    {cargoMultimedia ? (
                                        <audio style={{ maxWidth: '100%', marginTop: '10px' }} controls>
                                            <source src={srcMultimedia} type={opcionesMultimedia.message.mimeType}></source>
                                        </audio>
                                    ) : (
                                        <p>
                                            <i style={{ marginTop: '-3px' }} className='bx bx-loader bx-spin'></i>
                                            Cargando Multimedia
                                        </p>
                                    )}
                                </div>
                                <p style={{ textAlign: 'left' }}>{message.body}</p>
                            </>
                        ) : (
                            <>
                                <div style={{ maxHeight: '35vh' }} className={`multimedia-${message.mediaKey}`}>
                                    {cargoMultimedia ? (
                                        opcionesMultimedia.message.mimeType.includes("image") ? (
                                            <img
                                                style={{ maxHeight: '35vh', width: 'auto', margin: 'auto', paddingRight: '10px', paddingTop: '10px' }}
                                                src={srcMultimedia}
                                                alt="multimedia content"
                                            />
                                        ) : opcionesMultimedia.message.mimeType.includes("audio") ? (
                                            <audio style={{ maxWidth: '100%', marginTop: '10px' }} controls>
                                                <source src={srcMultimedia} type={opcionesMultimedia.message.mimeType}></source>
                                            </audio>
                                        ) : message.typeMultimedia === 4 ? (
                                            <iframe style={{ maxHeight: '40%', maxWidth: '100%' }} src={srcMultimedia} title="multimedia content"></iframe>
                                        ) : message.typeMultimedia === 5 ? (
                                            <video style={{ marginTop: '10px', maxHeight: '40vh' }} controls>
                                                <source src={srcMultimedia} type={opcionesMultimedia.message.mimeType}></source>
                                            </video>
                                        ) : (
                                            <></>
                                        )
                                    ) : (
                                        <p>
                                            <i style={{ marginTop: '-3px' }} className='bx bx-loader bx-spin'></i>
                                            Cargando Multimedia
                                        </p>
                                    )}
                                </div>
                                <p style={{ textAlign: 'left' }}>{message.body}</p>
                            </>
                        )}
                    </>
                ) : (
                    <p style={{ textAlign: 'left' }}>{message.body}</p>
                )}
                <span>
                    <i style={{ marginTop: '-3px' }} className={ackIcon}></i>
                    {fechaMessage}
                    {message.titleAsesor && (
                        <b style={{ marginLeft: '5px' }}>({message.titleAsesor})</b>
                    )}
                </span>
            </li>
        );
    };

    const renderMessageCloud = (message, multimedia) => {
        const clase = message.fromMe === 0 ? 'left' : 'right';
        const fotomessage = message.imageChat;
        const fechaMessage = convertirFecha(message.created);
        let ackIcon = "";
        for (var e = arrAck.length - 1; e >= 0; e--) {
            if (arrAck[e].banderaAck == message.ack) {
                ackIcon = arrAck[e].icon;
            }
        }
        let srcMultimedia = "";
        let cargoMultimedia = false;
        let opcionesMultimedia = [];
        let extension = message.assetMultimedia?.split('.').pop().toLowerCase();
        let urlSelect = process.env.ASSETS_API2 + message.assetMultimedia
        return (
            <li className={`message ${clase}`} key={message.id} id={`message-${message.id}`}>
                <img title={message.titleAsesor} className={`logo logo${clase}`} src={fotomessage} alt="" />
                {message.assetMultimedia !== '0' && message.assetMultimedia !== undefined && (
                    extension === 'jpg' || extension === 'jpeg' || extension === 'png' || extension === 'gif' ? (
                        <img
                            style={{ height: '45vh', background: 'none', width: 'auto', paddingRight: '10px', paddingTop: '10px' }}
                            src={urlSelect}
                            alt=""
                        />
                    ) : extension === 'mp3' || extension === 'ogg' || extension === 'wav' ? (
                        <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>
                            <audio controls style={{ maxWidth: '100%', marginTop: '10px' }}>
                                <source src={urlSelect} type={`audio/${extension}`} />
                            </audio>
                        </div>
                    ) : extension === 'mp4' || extension === 'webm' || extension === 'mov' ? (
                        <video
                            src={urlSelect}
                            style={{ height: '45vh', background: 'none', width: 'auto', paddingRight: '10px', paddingTop: '10px', margin: 'auto' }}
                            controls
                        ></video>
                    ) : (
                        <iframe
                            src={urlSelect}
                            style={{ height: '500px', width: '100%' }}
                            title="preview"
                        ></iframe>
                    )
                )}
                <p style={{ textAlign: 'left' }}>{message.body}</p>
                <span>
                    <i style={{ marginTop: '-3px' }} id={`ack-${message.id}`} className={ackIcon}></i>
                    {fechaMessage}
                    {message.titleAsesor && (
                        <b style={{ marginLeft: '5px' }}>({message.titleAsesor})</b>
                    )}
                </span>
            </li>
        );
    };

    const cargarMultimedia = async () => {
        if (colaMultimedia.length > 0) {
            let banderaCargoMultimedia = true;
            let dataMultimedia = "";
            /*for (let i = multimediaCargada.length - 1; i >= 0; i--) {
                if (multimediaCargada[i].id === colaMultimedia[0].mediaKey) {
                    banderaCargoMultimedia = false;
                    dataMultimedia = multimediaCargada[i].data;
                }
            }*/
            if (banderaCargoMultimedia) {
                try {
                    await axios.post(`${process.env.ENDPOINT_API}/whatsapp2/cargarMultimediaMessage`, {
                        id: colaMultimedia[0].id
                    }).then(async (response) => {
                        if (response.data.message !== undefined) {

                            if (response.data.message.body.includes("audio_") == true && response.data.message.body.includes("upload") == false) {
                                response.data.message.body = "/upload/" + response.data.message.body
                            }

                            setMultimediaCargada(prevState => [
                                ...prevState,
                                {
                                    id: response.data.message.mediaKey,
                                    data: response.data
                                }
                            ]);



                            // Encuentra el elemento multimedia en el DOM usando el mediaKey
                            const multimediaElements = document.getElementsByClassName(`multimedia-${response.data.message.mediaKey}`);

                            if (multimediaElements.length > 0) {
                                Array.from(multimediaElements).forEach(multimediaElement => {
                                    if (response.data.message.mimeType.includes("image")) {
                                        const imagenElement = document.createElement('img');
                                        imagenElement.src = response.data.message.body.includes("/static/") || response.data.message.body.includes("/upload/") || response.data.message.body.includes("/multimedia/")
                                            ? `${process.env.ENDPOINT_API}/static/${response.data.message.body}`
                                            : `data:${response.data.message.mimeType};base64,${response.data.message.body}`;
                                        imagenElement.alt = 'Multimedia';
                                        imagenElement.style.height = '35vh';
                                        imagenElement.style.width = 'auto';
                                        imagenElement.style.margin = 'auto';
                                        imagenElement.style.paddingRight = '10px';
                                        imagenElement.style.paddingTop = '10px';
                                        multimediaElement.innerHTML = '';
                                        multimediaElement.appendChild(imagenElement);
                                    } else if (response.data.message.mimeType.includes("audio")) {
                                        const audio = document.createElement('audio');
                                        audio.src = response.data.message.body.includes("/static/") || response.data.message.body.includes("/upload/") || response.data.message.body.includes("/multimedia/")
                                            ? `${process.env.ENDPOINT_API}/static/${response.data.message.body}`
                                            : `data:audio/ogg;codecs=opus;base64,${response.data.message.body}`;
                                        audio.style.marginTop = '10px';
                                        audio.controls = true;
                                        multimediaElement.innerHTML = '';
                                        multimediaElement.appendChild(audio);
                                    } else if (response.data.message.typeWhatsapp === 4) {
                                        if (response.data.message.mimeType.startsWith('application/pdf')) {
                                            const iframeElement = document.createElement('iframe');
                                            iframeElement.src = response.data.message.body.includes("/static/") || response.data.message.body.includes("/upload/") || response.data.message.body.includes("/multimedia/")
                                                ? `${process.env.ENDPOINT_API}/static/${response.data.message.body}`
                                                : `data:${response.data.message.mimeType};base64,${response.data.message.body}`;
                                            iframeElement.style.height = '40vh';
                                            iframeElement.style.width = '100%';
                                            multimediaElement.innerHTML = '';
                                            multimediaElement.appendChild(iframeElement);
                                        } else {
                                            multimediaElement.innerHTML = 'Documento pendiente descarga';
                                        }
                                    } else if (response.data.message.typeWhatsapp === 5) {
                                        const video = document.createElement('video');
                                        video.src = response.data.message.body.includes("/static/") || response.data.message.body.includes("/upload/") || response.data.message.body.includes("/multimedia/")
                                            ? `${process.env.ENDPOINT_API}/static/${response.data.message.body}`
                                            : `data:${response.data.message.mimeType};base64,${response.data.message.body}`;
                                        video.style.marginTop = '10px';
                                        video.style.maxHeight = '40vh';
                                        video.style.margin = 'auto';
                                        video.controls = true;
                                        multimediaElement.innerHTML = '';
                                        multimediaElement.appendChild(video);
                                    }
                                });
                            }
                            colaMultimedia.shift();
                            if (colaMultimedia.length > 0) {
                                setTimeout(() => cargarMultimedia(), 100);
                            }
                        } else {
                            handleErrorMultimedia();
                        }
                    });
                } catch (error) {
                    console.error("Error al cargar multimedia:", error);
                    handleErrorMultimedia();
                }
            } else {
                setTimeout(() => renderExistingMultimedia(dataMultimedia), 100);
            }
        }
    };

    const handleErrorMultimedia = () => {
        const multimediaElements = document.getElementsByClassName(`multimedia-${colaMultimedia[0].mediaKey}`);
        if (multimediaElements.length > 0) {
            Array.from(multimediaElements).forEach(multimediaElement => {
                multimediaElement.innerHTML = `<span style="color:red">No se encontró la multimedia<br>Comunícate con soporte<br>Error: "${colaMultimedia[0].id}"</span>`;
            });
        }
        colaMultimedia.shift();
        if (colaMultimedia.length > 1) {
            setTimeout(() => cargarMultimedia(), 100);
        }
    };

    const renderExistingMultimedia = (dataMultimedia) => {
        const multimediaElements = document.getElementsByClassName(`multimedia-${colaMultimedia[0].mediaKey}`);
        if (multimediaElements.length > 0) {
            Array.from(multimediaElements).forEach(multimediaElement => {
                if (dataMultimedia.message.mimeType.includes("image")) {
                    const imagenElement = document.createElement('img');
                    imagenElement.src = dataMultimedia.message.body.includes("/static/") || dataMultimedia.message.body.includes("/upload/") || dataMultimedia.message.body.includes("/multimedia/")
                        ? `${process.env.ENDPOINT_API}/static/${dataMultimedia.message.body}`
                        : `data:${dataMultimedia.message.mimeType};base64,${dataMultimedia.message.body}`;
                    imagenElement.alt = 'Multimedia';
                    imagenElement.style.height = '35vh';
                    imagenElement.style.width = 'auto';
                    imagenElement.style.margin = 'auto';
                    imagenElement.style.paddingRight = '10px';
                    imagenElement.style.paddingTop = '10px';
                    multimediaElement.innerHTML = '';
                    multimediaElement.appendChild(imagenElement);
                } else if (dataMultimedia.message.mimeType.includes("audio")) {
                    const audio = document.createElement('audio');
                    audio.src = dataMultimedia.message.body.includes("/static/") || dataMultimedia.message.body.includes("/upload/") || dataMultimedia.message.body.includes("/multimedia/")
                        ? `${process.env.ENDPOINT_API}/static/${dataMultimedia.message.body}`
                        : `data:audio/ogg;codecs=opus;base64,${dataMultimedia.message.body}`;
                    audio.style.marginTop = '10px';
                    audio.controls = true;
                    multimediaElement.innerHTML = '';
                    multimediaElement.appendChild(audio);
                } else if (dataMultimedia.message.typeWhatsapp === 4) {
                    if (dataMultimedia.message.mimeType.startsWith('application/pdf')) {
                        const iframeElement = document.createElement('iframe');
                        iframeElement.src = dataMultimedia.message.body.includes("/static/") || dataMultimedia.message.body.includes("/upload/") || dataMultimedia.message.body.includes("/multimedia/")
                            ? `${process.env.ENDPOINT_API}/static/${dataMultimedia.message.body}`
                            : `data:${dataMultimedia.message.mimeType};base64,${dataMultimedia.message.body}`;
                        iframeElement.style.height = '40vh';
                        iframeElement.style.width = '100%';
                        multimediaElement.innerHTML = '';
                        multimediaElement.appendChild(iframeElement);
                    } else {
                        multimediaElement.innerHTML = 'Documento pendiente descarga';
                    }
                } else if (dataMultimedia.message.typeWhatsapp === 5) {
                    const video = document.createElement('video');
                    video.src = dataMultimedia.message.body.includes("/static/") || dataMultimedia.message.body.includes("/upload/") || dataMultimedia.message.body.includes("/multimedia/")
                        ? `${process.env.ENDPOINT_API}/static/${dataMultimedia.message.body}`
                        : `data:${dataMultimedia.message.mimeType};base64,${dataMultimedia.message.body}`;
                    video.style.marginTop = '10px';
                    video.style.maxHeight = '40vh';
                    video.style.margin = 'auto';
                    video.controls = true;
                    multimediaElement.innerHTML = '';
                    multimediaElement.appendChild(video);
                }
            });
        }
        setColaMultimedia(prevState => prevState.slice(1));
        if (colaMultimedia.length > 1) {
            setTimeout(() => cargarMultimedia(), 100);
        }
    };

    /*
        creador: jorge luis castrillon
        fecha: 2 de abril 2024
        objetivo: cargar los tickets trbajando en de un asesor
    */
    async function cargarTicketsTrabajando(id, offset, estado) {
        offsetActivo = offset;
        await axios.post(process.env.ENDPOINT_API2 + '/api/ticket/allProceso', {
            usuario: id,
            estado: estado,
            offset: offset,
            filtro: dataFiltros,
            limit: 5,
            fecha: searchfechas,
            search: searchBuscador,
            proceso: searchproceso,
            cloud: $("#checkCloud").is(':checked'),
            sinresponder: searchmessageSinResponder,
            message: searchmessage
        }).then(async (data) => {
            const ticket = data.data.data;
            setFlagMasTickets(false);
            consultandoTickesPrincipal = true;

            const miDiv = document.getElementById('rowConsulta');
            if (miDiv) {
                if ((miDiv.scrollHeight > miDiv.clientHeight) == false) {
                    if (ticket.length == 5) {
                        cargarTicketsTrabajando(id, offset + 5, estado)
                    }
                }
            }


            /*if (ticket.length == 0 || ticket.length < 10) {
                terminoDeCargarTickets = false
            };*/

            for (var i = ticket.length - 1; i >= 0; i--) {
                searchId.push(ticket[i].id);
                ticket[i].mensajesPendientes = false;
                //if (ticket[i].messagesPendientes.length > 0) {
                //    ticket[i].mensajesPendientes = true;
                //}
                ticket[i].imageWhatsapp = ticket[i].image;
                ticket[i].background = "#adadad4d";
                ticket[i].background2 = "#d3d3d3";
                ticket[i].border = "#b7b7b7";

                //Interesado
                if (ticket[i].processesid == 2) {
                    ticket[i].background = "#c97f304d";
                    ticket[i].background2 = "#ebc399";
                    ticket[i].border = "#806400";
                }
                //pendiente pago
                if (ticket[i].processesid == 3) {
                    ticket[i].background = "#0080004d";
                    ticket[i].background2 = "#92bf92";
                    ticket[i].border = "green";
                }


                ticket[i].image = img;

                ticket[i].ackIcon = '';
                for (var e = arrAck.length - 1; e >= 0; e--) {
                    if (arrAck[e].banderaAck == ticket[i].ackMessage) {
                        ticket[i].ackIcon = arrAck[e].icon
                    }
                }
                ticket[i].ultimoMessageDate = convertirFecha(ticket[i].timestampMessage);

                const cleanedPhoneNumber = ticket[i].phone.replace(/\D/g, '');
                const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                ticket[i].numberLabel = formattedPhoneNumber;

                if (ticket[i].name == 'undefined' || ticket[i].name.length == 0) {

                    const cleanedPhoneNumber = ticket[i].phone.replace(/\D/g, '');
                    const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                    ticket[i].nameLabel = formattedPhoneNumber;

                } else {
                    ticket[i].nameLabel = ticket[i].name;
                }
            }

            if (offset == 0) {
                setTicketsConsulta(ticket);
                setTicketsConsulta2 = ticket
            } else {
                if (ticket.length > 0) {
                    setTicketsConsulta([...setTicketsConsulta2, ...ticket]);
                }
                setTicketsConsulta2 = setTicketsConsulta2.concat(ticket)
            }

            setConsultandoTickets(false)

        }).catch(error => {
            console.log(error);
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (tickets Trabajando)",
                icon: "error"
            })
        });
    }

    /*
        creador: jorge luis castrillon
        fecha: 2 de abril 2024
        objetivo: cargar los tickets que estan en pagos
    */
    async function cargarTicketsPagos(id, offset) {
        offsetActivo = offset;
        await axios.post(process.env.ENDPOINT_API + '/whatsapp2/ticketPagos', {
            asesor: id,
            offset: offset,
            search: searchBuscador,
            id: searchId,
            proceso: searchproceso,
            message: searchmessage,
            sinresponder: searchmessageSinResponder,
            fecha: searchfechas
        }).then(async (data) => {
            if (menuActivo == 2) {
                const ticket = data.data.tickets;
                consultandoTickesPrincipal = true;
                setFlagMasTickets(false);

                if (ticket.length == 0 || ticket.length < 10) {
                    terminoDeCargarTickets = false
                };

                for (var i = ticket.length - 1; i >= 0; i--) {
                    ticket[i].imageWhatsapp = ticket[i].image;
                    ticket[i].mensajesPendientes = false
                    if (ticket[i].messagesPendientes.length > 0) {
                        ticket[i].mensajesPendientes = true;
                    }
                    ticket[i].background = "#adadad4d";
                    ticket[i].background2 = "#d3d3d3";
                    ticket[i].border = "#b7b7b7";


                    if (ticket[i].image == 'undefined') {
                        ticket[i].image = img;
                    }

                    ticket[i].ackIcon = '';
                    for (var e = arrAck.length - 1; e >= 0; e--) {
                        if (arrAck[e].banderaAck == ticket[i].ackMessage) {
                            ticket[i].ackIcon = arrAck[e].icon
                        }
                    }
                    ticket[i].ultimoMessageDate = convertirFecha(ticket[i].timestampMessage);

                    const cleanedPhoneNumber = ticket[i].number.replace(/\D/g, '');
                    const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                    ticket[i].numberLabel = formattedPhoneNumber;

                    if (ticket[i].name == 'undefined') {

                        const cleanedPhoneNumber = ticket[i].number.replace(/\D/g, '');
                        const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                        ticket[i].nameLabel = formattedPhoneNumber;

                    } else {
                        ticket[i].nameLabel = ticket[i].name;
                    }
                }

                if (searchBuscador.length == 0) {
                    setTicketsConsultaGeneral([])
                }

                if (offset == 0) {
                    setTicketsConsulta(ticket);
                    setTicketsConsulta2 = ticket

                } else {
                    if (ticket.length > 0) {
                        setTicketsConsulta([...setTicketsConsulta2, ...ticket]);
                    }
                    setTicketsConsulta2 = setTicketsConsulta2.concat(ticket)
                }

                setConsultandoTickets(false)
            }

        }).catch(error => {
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (tickets Trabajando)",
                icon: "error"
            })
        });
    }


    async function cargarTicketsGeneral() {
        await axios.post(process.env.ENDPOINT_API + '/whatsapp2/ticketGeneral', {
            search: searchBuscador
        }).then(async (data) => {
            if (data.data.search == searchBuscador) {
                if (data.data.ticketGeneral.length > 0) {
                    const ticket2 = data.data.ticketGeneral;
                    for (var i = ticket2.length - 1; i >= 0; i--) {
                        ticket2[i].imageWhatsapp = ticket2[i].image;
                        ticket2[i].background = "#b5e4ff";
                        ticket2[i].background2 = "#94c9e9";
                        ticket2[i].border = "#73a4c1";

                        ticket2[i].status = "Cola";
                        if (ticket2[i].idStatus == 2) {
                            ticket2[i].status = "Trabajando en";
                        }
                        if (ticket2[i].idStatus == 3) {
                            ticket2[i].status = "Pagos";
                        }
                        if (ticket2[i].idStatus == 4) {
                            ticket2[i].status = "En producción";
                        }
                        if (ticket2[i].idStatus == 5) {
                            ticket2[i].status = "Despachado";
                        }
                        if (ticket2[i].idStatus == 6) {
                            ticket2[i].status = "Clientes";
                        }
                        if (ticket2[i].idStatus == 7) {
                            ticket2[i].status = "No Interesados";
                        }

                        if (ticket2[i].image == 'undefined') {
                            ticket2[i].image = img;
                        }

                        ticket2[i].ackIcon = '';
                        for (var e = arrAck.length - 1; e >= 0; e--) {
                            if (arrAck[e].banderaAck == ticket2[i].ackMessage) {
                                ticket2[i].ackIcon = arrAck[e].icon
                            }
                        }
                        ticket2[i].ultimoMessageDate = convertirFecha(ticket2[i].timestampMessage);

                        const cleanedPhoneNumber = ticket2[i].number.replace(/\D/g, '');
                        const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                        ticket2[i].numberLabel = formattedPhoneNumber;

                        if (ticket2[i].name == 'undefined') {

                            const cleanedPhoneNumber = ticket2[i].number.replace(/\D/g, '');
                            const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                            ticket2[i].nameLabel = formattedPhoneNumber;

                        } else {
                            ticket2[i].nameLabel = ticket2[i].name;
                        }
                    }
                    setTicketsConsultaGeneral(ticket2)
                } else {
                    setTicketsConsultaGeneral([])
                }
            } else {
                setTicketsConsultaGeneral([])
            }
        })
    }
    /*
        creador: jorge luis castrillon
        fecha: 2 de abril 2024
        objetivo: cargar los tickets que estan en produccion
    */
    async function cargarTicketsProduccion(id, offset) {
        offsetActivo = offset;
        await axios.post(process.env.ENDPOINT_API + '/whatsapp2/ticketProduccion', {
            asesor: id,
            offset: offset,
            search: searchBuscador,
            id: searchId,
            proceso: searchproceso,
            message: searchmessage,
            sinresponder: searchmessageSinResponder,
            fecha: searchfechas
        }).then(async (data) => {
            if (menuActivo == 3) {
                const ticket = data.data.tickets;
                consultandoTickesPrincipal = true;
                setFlagMasTickets(false);

                if (ticket.length == 0 || ticket.length < 10) {
                    terminoDeCargarTickets = false
                };

                for (var i = ticket.length - 1; i >= 0; i--) {
                    ticket[i].imageWhatsapp = ticket[i].image;
                    ticket[i].mensajesPendientes = false
                    if (ticket[i].messagesPendientes.length > 0) {
                        ticket[i].mensajesPendientes = true;
                    }
                    ticket[i].background = "#adadad4d";
                    ticket[i].background2 = "#d3d3d3";
                    ticket[i].border = "#b7b7b7";


                    if (ticket[i].image == 'undefined') {
                        ticket[i].image = img;
                    }

                    ticket[i].ackIcon = '';
                    for (var e = arrAck.length - 1; e >= 0; e--) {
                        if (arrAck[e].banderaAck == ticket[i].ackMessage) {
                            ticket[i].ackIcon = arrAck[e].icon
                        }
                    }
                    ticket[i].ultimoMessageDate = convertirFecha(ticket[i].timestampMessage);

                    const cleanedPhoneNumber = ticket[i].number.replace(/\D/g, '');
                    const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                    ticket[i].numberLabel = formattedPhoneNumber;

                    if (ticket[i].name == 'undefined') {

                        const cleanedPhoneNumber = ticket[i].number.replace(/\D/g, '');
                        const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;
                        ticket[i].nameLabel = formattedPhoneNumber;

                    } else {
                        ticket[i].nameLabel = ticket[i].name;
                    }
                }

                if (searchBuscador.length == 0) {
                    setTicketsConsultaGeneral([])
                }


                if (offset == 0) {
                    setTicketsConsulta(ticket);
                    setTicketsConsulta2 = ticket

                } else {
                    if (ticket.length > 0) {
                        setTicketsConsulta([...setTicketsConsulta2, ...ticket]);
                    }
                    setTicketsConsulta2 = setTicketsConsulta2.concat(ticket)
                }

                setConsultandoTickets(false)
            }

        }).catch(error => {
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (tickets Pagos)",
                icon: "error"
            })
        });
    }

    function noInteresadoTicket(datos) {

        const swalWithReact = withReactContent(Swal);
        swalWithReact.fire({
            title: "Confirmación",
            html: "¿Esta segur@ que la persona no esta interesada?",
            showCancelButton: true,
            confirmButtonText: "Si", // Texto personalizado para el botón de confirmación
            cancelButtonText: "No", // Texto personalizado para el botón de cancelación
            allowOutsideClick: false
        }).then(async (result) => {
            // Aquí puedes continuar con el flujo normal si el usuario seleccionó una opción válida
            if (result.isConfirmed) {

                swalWithReact.fire({
                    title: "Guardando cambios",
                    text: "Por favor, espera un momento...",
                    icon: "info",
                    showConfirmButton: false, // Ocultar el botón de confirmación
                    allowOutsideClick: false // Evitar cerrar el SweetAlert haciendo clic fuera de él
                });

                if (ticketActivo.type == 1) {
                    //acepta el ticket
                    await axios.post(process.env.ENDPOINT_API + '/whatsapp2/noInteresadoTicket',
                        {
                            ticket: datos.id,
                            usuario: usuarioId
                        }
                    ).then(response => {
                        // Crear una copia del arreglo ticketPendientesFin
                        var updatedTicket = setTicketsConsulta2.map(ticketLocal => {
                            // Verificar si el ID del ticket no es igual a 1 y retornarlo
                            if (ticketLocal.id !== datos.id) {
                                return ticketLocal;
                            }
                            // Retornar null para tickets que coinciden con el id a excluir
                            return null;
                        }).filter(ticket => ticket !== null);

                        // Actualizar el estado de ticketTrabajando con el array actualizado
                        setTicketsConsulta(updatedTicket);
                        setTicketsConsulta2 = updatedTicket;

                        cargarContadoresProcesos(usuarioId)

                        swalWithReact.fire({
                            title: "Ticket",
                            text: "El ticket paso a no interesados.",
                            icon: "success",
                            showConfirmButton: false, // Ocultar el botón de confirmación
                            timer: 2000 // Cerrar automáticamente después de 2 segundos
                        });
                        setticketAbierto(false);
                        ticketActivo = [];
                    }).catch(error => {
                        const swalWithReact = withReactContent(Swal);
                        // Manejar el error aquí
                        withReactContent(Swal).fire({
                            title: "Error",
                            text: "Comunica con soporte (no interesado)",
                            icon: "error"
                        })
                    });
                } else {
                    //reporta como pago el ticket
                    await axios.post(`${process.env.ENDPOINT_API2}/api/ticket/cambioStatus`, {
                        ticket: id,
                        usuario: usuarioId,
                        status: 7
                    }).then(response => {
                        // Crear una copia del arreglo ticketPendientesFin
                        var updatedTicket = setTicketsConsulta2.map(ticketLocal => {
                            // Verificar si el ID del ticket no es igual a 1 y retornarlo
                            if (ticketLocal.id !== id) {
                                return ticketLocal;
                            }
                            // Retornar null para tickets que coinciden con el id a excluir
                            return null;
                        }).filter(ticket => ticket !== null);

                        // Actualizar el estado de ticketTrabajando con el array actualizado
                        setTicketsConsulta(updatedTicket);
                        setTicketsConsulta2 = updatedTicket;

                        cargarContadoresProcesos(usuarioId)

                        setticketAbierto(prevTicket => ({
                            ...prevTicket,
                            idStatus: 7
                        }));
                    }).catch(error => {
                        const swalWithReact = withReactContent(Swal);
                        // Manejar el error aquí
                        withReactContent(Swal).fire({
                            title: "Error",
                            text: "Comunica con soporte (pago ticket)",
                            icon: "error"
                        })
                    });
                }
            }
        })
    }

    //pago de ticket 
    async function pagoTicket(id) {

        if (ticketActivo.type == 1) {
            //acepta el ticket
            await axios.post(process.env.ENDPOINT_API + '/whatsapp2/pagoTicket',
                {
                    ticket: id,
                    usuario: usuarioId
                }
            ).then(response => {
                // Crear una copia del arreglo ticketPendientesFin
                var updatedTicket = setTicketsConsulta2.map(ticketLocal => {
                    // Verificar si el ID del ticket no es igual a 1 y retornarlo
                    if (ticketLocal.id !== id) {
                        return ticketLocal;
                    }
                    // Retornar null para tickets que coinciden con el id a excluir
                    return null;
                }).filter(ticket => ticket !== null);

                // Actualizar el estado de ticketTrabajando con el array actualizado
                setTicketsConsulta(updatedTicket);
                setTicketsConsulta2 = updatedTicket;

                cargarContadoresProcesos(usuarioId)

                setticketAbierto(prevTicket => ({
                    ...prevTicket,
                    idStatus: 3
                }));
            }).catch(error => {
                const swalWithReact = withReactContent(Swal);
                // Manejar el error aquí
                withReactContent(Swal).fire({
                    title: "Error",
                    text: "Comunica con soporte (pago ticket)",
                    icon: "error"
                })
            });
        } else {
            //reporta como pago el ticket
            await axios.post(`${process.env.ENDPOINT_API2}/api/ticket/cambioStatus`, {
                ticket: id,
                usuario: usuarioId,
                status: 3
            }).then(response => {
                // Crear una copia del arreglo ticketPendientesFin
                var updatedTicket = setTicketsConsulta2.map(ticketLocal => {
                    // Verificar si el ID del ticket no es igual a 1 y retornarlo
                    if (ticketLocal.id !== id) {
                        return ticketLocal;
                    }
                    // Retornar null para tickets que coinciden con el id a excluir
                    return null;
                }).filter(ticket => ticket !== null);

                // Actualizar el estado de ticketTrabajando con el array actualizado
                setTicketsConsulta(updatedTicket);
                setTicketsConsulta2 = updatedTicket;

                cargarContadoresProcesos(usuarioId)

                setticketAbierto(prevTicket => ({
                    ...prevTicket,
                    idStatus: 3
                }));
            }).catch(error => {
                const swalWithReact = withReactContent(Swal);
                // Manejar el error aquí
                withReactContent(Swal).fire({
                    title: "Error",
                    text: "Comunica con soporte (pago ticket)",
                    icon: "error"
                })
            });
        }
    }

    //pago de ticket 
    async function pedidoSubido(id) {

        //acepta el ticket
        await axios.post(process.env.ENDPOINT_API + '/whatsapp2/pedidoSubido',
            {
                ticket: id,
                usuario: usuarioId
            }
        ).then(response => {
            // Crear una copia del arreglo ticketPendientesFin
            var updatedTicket = setTicketsConsulta2.map(ticketLocal => {
                // Verificar si el ID del ticket no es igual a 1 y retornarlo
                if (ticketLocal.id !== id) {
                    return ticketLocal;
                }
                // Retornar null para tickets que coinciden con el id a excluir
                return null;
            }).filter(ticket => ticket !== null);

            // Actualizar el estado de ticketTrabajando con el array actualizado
            setTicketsConsulta(updatedTicket);
            setTicketsConsulta2 = updatedTicket;

            cargarContadoresProcesos(usuarioId)

            setticketAbierto(prevTicket => ({
                ...prevTicket,
                idStatus: 4
            }));
        })
            .catch(error => {
                const swalWithReact = withReactContent(Swal);
                // Manejar el error aquí
                withReactContent(Swal).fire({
                    title: "Error",
                    text: "Comunica con soporte (subio Pedido)",
                    icon: "error"
                })
            });
    }

    //pago de ticket 
    async function pedidoDespachado(id) {

        //acepta el ticket
        await axios.post(process.env.ENDPOINT_API + '/whatsapp2/pedidoDespachado',
            {
                ticket: id,
                usuario: usuarioId
            }
        ).then(response => {
            // Crear una copia del arreglo ticketPendientesFin
            var updatedTicket = setTicketsConsulta2.map(ticketLocal => {
                // Verificar si el ID del ticket no es igual a 1 y retornarlo
                if (ticketLocal.id !== id) {
                    return ticketLocal;
                }
                // Retornar null para tickets que coinciden con el id a excluir
                return null;
            }).filter(ticket => ticket !== null);

            // Actualizar el estado de ticketTrabajando con el array actualizado
            setTicketsConsulta(updatedTicket);
            setTicketsConsulta2 = updatedTicket;

            cargarContadoresProcesos(usuarioId)

            setticketAbierto(prevTicket => ({
                ...prevTicket,
                idStatus: 5
            }));
        })
            .catch(error => {
                const swalWithReact = withReactContent(Swal);
                // Manejar el error aquí
                withReactContent(Swal).fire({
                    title: "Error",
                    text: "Comunica con soporte (subio Pedido)",
                    icon: "error"
                })
            });
    }

    //pago de ticket 
    async function pedidoEntregado(id) {

        //acepta el ticket
        await axios.post(process.env.ENDPOINT_API + '/whatsapp2/pedidoEntregado',
            {
                ticket: id,
                usuario: usuarioId
            }
        ).then(response => {
            // Crear una copia del arreglo ticketPendientesFin
            var updatedTicket = setTicketsConsulta2.map(ticketLocal => {
                // Verificar si el ID del ticket no es igual a 1 y retornarlo
                if (ticketLocal.id !== id) {
                    return ticketLocal;
                }
                // Retornar null para tickets que coinciden con el id a excluir
                return null;
            }).filter(ticket => ticket !== null);

            // Actualizar el estado de ticketTrabajando con el array actualizado
            setTicketsConsulta(updatedTicket);
            setTicketsConsulta2 = updatedTicket;

            cargarContadoresProcesos(usuarioId)

            setticketAbierto(prevTicket => ({
                ...prevTicket,
                idStatus: 6
            }));
        })
            .catch(error => {
                const swalWithReact = withReactContent(Swal);
                // Manejar el error aquí
                withReactContent(Swal).fire({
                    title: "Error",
                    text: "Comunica con soporte (pedido entregado)",
                    icon: "error"
                })
            });
    }

    /*
        creador: jorge luis castrillon
        fecha: 2 de abril 2024
        objetivo: cargar los tickets que estan en despacho
    */
    async function cargarTicketsDespachados(id, offset) {
        offsetActivo = offset;
        await axios.post(process.env.ENDPOINT_API + '/whatsapp2/ticketDespachados', {
            asesor: id,
            offset: offset,
            search: searchBuscador,
            id: searchId,
            proceso: searchproceso,
            message: searchmessage,
            sinresponder: searchmessageSinResponder,
            fecha: searchfechas
        }).then(async (data) => {
            if (menuActivo == 4) {

                const ticket = data.data.tickets;

                consultandoTickesPrincipal = true;
                setFlagMasTickets(false);

                if (ticket.length == 0 || ticket.length < 10) {
                    terminoDeCargarTickets = false
                };

                for (var i = ticket.length - 1; i >= 0; i--) {
                    ticket[i].imageWhatsapp = ticket[i].image;
                    ticket[i].mensajesPendientes = false
                    if (ticket[i].messagesPendientes.length > 0) {
                        ticket[i].mensajesPendientes = true;
                    }
                    ticket[i].background = "#adadad4d";
                    ticket[i].background2 = "#d3d3d3";
                    ticket[i].border = "#b7b7b7";


                    if (ticket[i].image == 'undefined') {
                        ticket[i].image = img;
                    }

                    ticket[i].ackIcon = '';
                    for (var e = arrAck.length - 1; e >= 0; e--) {
                        if (arrAck[e].banderaAck == ticket[i].ackMessage) {
                            ticket[i].ackIcon = arrAck[e].icon
                        }
                    }
                    ticket[i].ultimoMessageDate = convertirFecha(ticket[i].timestampMessage);

                    const cleanedPhoneNumber = ticket[i].number.replace(/\D/g, '');
                    const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                    ticket[i].numberLabel = formattedPhoneNumber;

                    if (ticket[i].name == 'undefined') {

                        const cleanedPhoneNumber = ticket[i].number.replace(/\D/g, '');
                        const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;
                        ticket[i].nameLabel = formattedPhoneNumber;

                    } else {
                        ticket[i].nameLabel = ticket[i].name;
                    }
                }

                if (searchBuscador.length == 0) {
                    setTicketsConsultaGeneral([])
                }

                if (offset == 0) {
                    setTicketsConsulta(ticket);
                    setTicketsConsulta2 = ticket

                } else {
                    if (ticket.length > 0) {
                        setTicketsConsulta([...setTicketsConsulta2, ...ticket]);
                    }
                    setTicketsConsulta2 = setTicketsConsulta2.concat(ticket)
                }

                setConsultandoTickets(false)
            }

        }).catch(error => {
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (tickets Pagos)",
                icon: "error"
            })
        });
    }

    /*
        creador: jorge luis castrillon
        fecha: 2 de abril 2024
        objetivo: cargar los tickets que estan en clientes
    */
    async function cargarTicketsClientes(id, offset) {
        offsetActivo = offset;
        await axios.post(process.env.ENDPOINT_API + '/whatsapp2/ticketClientes', {
            asesor: id,
            offset: offset,
            search: searchBuscador,
            id: searchId,
            proceso: searchproceso,
            message: searchmessage,
            sinresponder: searchmessageSinResponder,
            fecha: searchfechas
        }).then(async (data) => {

            if (menuActivo == 5) {

                const ticket = data.data.tickets;
                consultandoTickesPrincipal = true;
                setFlagMasTickets(false);

                if (ticket.length == 0 || ticket.length < 10) {
                    terminoDeCargarTickets = false
                };

                for (var i = ticket.length - 1; i >= 0; i--) {
                    ticket[i].imageWhatsapp = ticket[i].image;

                    ticket[i].mensajesPendientes = false
                    if (ticket[i].messagesPendientes.length > 0) {
                        ticket[i].mensajesPendientes = true;
                    }

                    ticket[i].background = "#adadad4d";
                    ticket[i].background2 = "#d3d3d3";
                    ticket[i].border = "#b7b7b7";


                    if (ticket[i].image == 'undefined') {
                        ticket[i].image = img;
                    }

                    ticket[i].ackIcon = '';
                    for (var e = arrAck.length - 1; e >= 0; e--) {
                        if (arrAck[e].banderaAck == ticket[i].ackMessage) {
                            ticket[i].ackIcon = arrAck[e].icon
                        }
                    }
                    ticket[i].ultimoMessageDate = convertirFecha(ticket[i].timestampMessage);

                    const cleanedPhoneNumber = ticket[i].number.replace(/\D/g, '');
                    const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                    ticket[i].numberLabel = formattedPhoneNumber;

                    if (ticket[i].name == 'undefined') {

                        const cleanedPhoneNumber = ticket[i].number.replace(/\D/g, '');
                        const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;
                        ticket[i].nameLabel = formattedPhoneNumber;

                    } else {
                        ticket[i].nameLabel = ticket[i].name;
                    }
                }

                if (searchBuscador.length == 0) {
                    setTicketsConsultaGeneral([])
                }

                if (offset == 0) {
                    setTicketsConsulta(ticket);
                    setTicketsConsulta2 = ticket

                } else {
                    if (ticket.length > 0) {
                        setTicketsConsulta([...setTicketsConsulta2, ...ticket]);
                    }
                    setTicketsConsulta2 = setTicketsConsulta2.concat(ticket)
                }

                setConsultandoTickets(false)

            }

        }).catch(error => {
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (tickets Pagos)",
                icon: "error"
            })
        });
    }

    async function cargarTicketsVendedores(id, offset) {
        offsetActivo = offset;
        await axios.post(process.env.ENDPOINT_API + '/whatsapp2/ticketVendedores', {
            asesor: id,
            offset: offset,
            search: searchBuscador,
            id: searchId,
            proceso: searchproceso,
            message: searchmessage,
            sinresponder: searchmessageSinResponder,
            fecha: searchfechas
        }).then(async (data) => {

            if (menuActivo == 7) {

                const ticket = data.data.tickets;
                consultandoTickesPrincipal = true;
                setFlagMasTickets(false);

                if (ticket.length == 0 || ticket.length < 10) {
                    terminoDeCargarTickets = false
                };

                for (var i = ticket.length - 1; i >= 0; i--) {
                    ticket[i].imageWhatsapp = ticket[i].image;

                    ticket[i].mensajesPendientes = false
                    if (ticket[i].messagesPendientes.length > 0) {
                        ticket[i].mensajesPendientes = true;
                    }

                    ticket[i].background = "#adadad4d";
                    ticket[i].background2 = "#d3d3d3";
                    ticket[i].border = "#b7b7b7";


                    if (ticket[i].image == 'undefined') {
                        ticket[i].image = img;
                    }

                    ticket[i].ackIcon = '';
                    for (var e = arrAck.length - 1; e >= 0; e--) {
                        if (arrAck[e].banderaAck == ticket[i].ackMessage) {
                            ticket[i].ackIcon = arrAck[e].icon
                        }
                    }
                    ticket[i].ultimoMessageDate = convertirFecha(ticket[i].timestampMessage);

                    const cleanedPhoneNumber = ticket[i].number.replace(/\D/g, '');
                    const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                    ticket[i].numberLabel = formattedPhoneNumber;

                    if (ticket[i].name == 'undefined') {

                        const cleanedPhoneNumber = ticket[i].number.replace(/\D/g, '');
                        const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;
                        ticket[i].nameLabel = formattedPhoneNumber;

                    } else {
                        ticket[i].nameLabel = ticket[i].name;
                    }
                }

                if (searchBuscador.length == 0) {
                    setTicketsConsultaGeneral([])
                }

                if (offset == 0) {
                    setTicketsConsulta(ticket);
                    setTicketsConsulta2 = ticket

                } else {
                    if (ticket.length > 0) {
                        setTicketsConsulta([...setTicketsConsulta2, ...ticket]);
                    }
                    setTicketsConsulta2 = setTicketsConsulta2.concat(ticket)
                }

                setConsultandoTickets(false)

            }

        }).catch(error => {
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (tickets Vendedores)",
                icon: "error"
            })
        });
    }
    /*
        creador: jorge luis castrillon
        fecha: 2 de abril 2024
        objetivo: cargar los tickets que estan en clientes
    */
    async function cargarTicketsNoInteresados(id, offset) {
        offsetActivo = offset;
        await axios.post(process.env.ENDPOINT_API + '/whatsapp2/ticketNoInteresados', {
            asesor: id,
            offset: offset,
            search: searchBuscador,
            id: searchId,
            proceso: searchproceso,
            message: searchmessage,
            sinresponder: searchmessageSinResponder,
            fecha: searchfechas
        }).then(async (data) => {

            if (menuActivo == 6) {

                const ticket = data.data.tickets;
                consultandoTickesPrincipal = true;
                setFlagMasTickets(false);

                if (ticket.length == 0 || ticket.length < 10) {
                    terminoDeCargarTickets = false
                };

                for (var i = ticket.length - 1; i >= 0; i--) {
                    ticket[i].imageWhatsapp = ticket[i].image;

                    ticket[i].mensajesPendientes = false
                    if (ticket[i].messagesPendientes.length > 0) {
                        ticket[i].mensajesPendientes = true;
                    }

                    ticket[i].background = "#adadad4d";
                    ticket[i].background2 = "#d3d3d3";
                    ticket[i].border = "#b7b7b7";


                    if (ticket[i].image == 'undefined') {
                        ticket[i].image = img;
                    }

                    ticket[i].ackIcon = '';
                    for (var e = arrAck.length - 1; e >= 0; e--) {
                        if (arrAck[e].banderaAck == ticket[i].ackMessage) {
                            ticket[i].ackIcon = arrAck[e].icon
                        }
                    }
                    ticket[i].ultimoMessageDate = convertirFecha(ticket[i].timestampMessage);

                    const cleanedPhoneNumber = ticket[i].number.replace(/\D/g, '');
                    const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                    ticket[i].numberLabel = formattedPhoneNumber;

                    if (ticket[i].name == 'undefined') {

                        const cleanedPhoneNumber = ticket[i].number.replace(/\D/g, '');
                        const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;
                        ticket[i].nameLabel = formattedPhoneNumber;

                    } else {
                        ticket[i].nameLabel = ticket[i].name;
                    }
                }

                if (searchBuscador.length == 0) {
                    setTicketsConsultaGeneral([])
                }

                if (offset == 0) {
                    setTicketsConsulta(ticket);
                    setTicketsConsulta2 = ticket

                } else {
                    if (ticket.length > 0) {
                        setTicketsConsulta([...setTicketsConsulta2, ...ticket]);
                    }
                    setTicketsConsulta2 = setTicketsConsulta2.concat(ticket)
                }

                setConsultandoTickets(false)

            }

        }).catch(error => {
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (tickets Pagos)",
                icon: "error"
            })
        });
    }


    /*
        creador: jorge luis castrillon
        fecha: 14 de marzo 2024
        objetivo: cargar los tickets pendientes por aceptar de un asesor
    */
    async function cargarTicketsPendientes(id, offset) {
        offsetActivo = offset;
        await axios.post(process.env.ENDPOINT_API + '/whatsapp2/ticketPendientes', {
            asesor: id,
            offset: offset,
            search: searchBuscador,
            id: searchId,
        }).then(async (data) => {
            if (menuActivo == 1 && submenuActivo == 1) {
                setFlagMasTickets(false);
                consultandoTickesPrincipal = true;
                let ticketTra = data.data.tickets;

                if (ticketTra.length == 0 || ticketTra.length < 10) {
                    terminoDeCargarTickets = false
                };

                for (var i = ticketTra.length - 1; i >= 0; i--) {
                    searchId.push(ticketTra[i].id);
                    ticketTra[i].mensajesPendientes = false;
                    ticketTra[i].background = "#adadad4d";
                    ticketTra[i].background2 = "#d3d3d3";
                    ticketTra[i].border = "#b7b7b7";
                    ticketTra[i].imageWhatsapp = ticketTra[i].image;
                    if (ticketTra[i].image == 'undefined') {
                        ticketTra[i].image = img;
                    }

                    ticketTra[i].ackIcon = '';
                    for (var e = arrAck.length - 1; e >= 0; e--) {
                        if (arrAck[e].banderaAck == ticketTra[i].ackMessage) {
                            ticketTra[i].ackIcon = arrAck[e].icon
                        }
                    }
                    ticketTra[i].ultimoMessageDate = convertirFecha(ticketTra[i].timestampMessage);

                    const cleanedPhoneNumber = ticketTra[i].number.replace(/\D/g, '');
                    const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                    ticketTra[i].numberLabel = formattedPhoneNumber;

                    if (ticketTra[i].name == 'undefined') {

                        const cleanedPhoneNumber = ticketTra[i].number.replace(/\D/g, '');
                        const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                        ticketTra[i].nameLabel = formattedPhoneNumber;

                    } else {
                        ticketTra[i].nameLabel = ticketTra[i].name;
                    }
                }

                if (searchBuscador.length == 0) {
                    setTicketsConsultaGeneral([])
                }

                if (offset == 0) {
                    setTicketsConsulta(ticketTra);
                    setTicketsConsulta2 = ticketTra

                } else {
                    if (ticketTra.length > 0) {
                        setTicketsConsulta([...setTicketsConsulta2, ...ticketTra]);
                    }
                    setTicketsConsulta2 = setTicketsConsulta2.concat(ticketTra)
                }

                setConsultandoTickets(false)
            }

        }).catch(error => {
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (tickets pendientes)",
                icon: "error"
            })
        });
    }

    /*
        creador: jorge luis castrillon
        fecha: 14 de marzo 2024
        objetivo: reasignar ticket
    */
    function reasignarTicket(datos) {

        const swalWithReact = withReactContent(Swal);

        // Crear un elemento de selección
        const selectElement = document.createElement('select');
        selectElement.className = 'form-select';
        selectElement.innerHTML = `
            <option value="">Selecciona un asesor</option>
        `;
        for (var i = asesores.length - 1; i >= 0; i--) {
            selectElement.innerHTML += '<option value="' + asesores[i].id + '">' + asesores[i].name + '</option>'
        }


        // Agregar el elemento de selección a SweetAlert
        swalWithReact.fire({
            title: "Asesores",
            html: selectElement,
            showCancelButton: true,
            confirmButtonText: "Aceptar",
            allowOutsideClick: false, // Evitar cerrar el SweetAlert haciendo clic fuera de él
            preConfirm: () => {
                const selectedOption = selectElement.value;
                if (selectedOption === "") {
                    // Si no se seleccionó ninguna opción, mostrar el mensaje de campo obligatorio
                    swalWithReact.update({
                        title: "Campo obligatorio",
                        text: "Debes seleccionar una opción",
                        icon: "warning",
                        confirmButtonText: "Aceptar"
                    });
                    // Retornar false para evitar que SweetAlert se cierre
                    return false;
                } else {
                    // Si se seleccionó una opción válida, continuar con la confirmación
                    return true;
                }
            }
        }).then(async (result) => {
            // Aquí puedes continuar con el flujo normal si el usuario seleccionó una opción válida
            if (result.isConfirmed) {
                const selectedOption = selectElement.value;

                swalWithReact.fire({
                    title: "Guardando cambios",
                    text: "Por favor, espera un momento...",
                    icon: "info",
                    showConfirmButton: false, // Ocultar el botón de confirmación
                    allowOutsideClick: false // Evitar cerrar el SweetAlert haciendo clic fuera de él
                });

                if (ticketActivo.type == 1) {

                    //acepta el ticket
                    await axios.post(process.env.ENDPOINT_API + '/whatsapp2/reasignarTicket',
                        {
                            asesor: selectedOption,
                            ticket: datos.id,
                            usuario: usuario.user
                        }
                    ).then(response => {


                        var updatedTicket = setTicketsConsulta2;

                        setTicketsConsulta2 = updatedTicket.filter(ticketLocal => ticketLocal.id !== datos.id);
                        setTicketsConsulta(setTicketsConsulta2);

                        if (ticketActivo.id == datos.id) {
                            ticketActivo = [];
                            setticketAbierto(false);
                        }

                        cargarContadoresProcesos(usuarioId)
                        swalWithReact.fire({
                            title: "Ticket reasignado",
                            text: "El ticket ha sido reasignado exitosamente.",
                            icon: "success",
                            showConfirmButton: false, // Ocultar el botón de confirmación
                            timer: 2000 // Cerrar automáticamente después de 2 segundos
                        });

                    }).catch(error => {
                        // Manejar el error aquí
                        withReactContent(Swal).fire({
                            title: "Error",
                            text: "Comunica con soporte",
                            icon: "error"
                        })
                    });
                } else {
                    //reporta como pago el ticket
                    await axios.post(`${process.env.ENDPOINT_API2}/api/ticket/reasignar`, {
                        asesor: selectedOption,
                        ticket: datos.id,
                        usuario: usuario.user
                    }).then(response => {

                        var updatedTicket = setTicketsConsulta2;

                        setTicketsConsulta2 = updatedTicket.filter(ticketLocal => ticketLocal.id !== datos.id);
                        setTicketsConsulta(setTicketsConsulta2);

                        if (ticketActivo.id == datos.id) {
                            ticketActivo = [];
                            setticketAbierto(false);
                        }
                        cargarContadoresProcesos(usuarioId)

                        swalWithReact.fire({
                            title: "Ticket reasignado",
                            text: "El ticket ha sido reasignado exitosamente.",
                            icon: "success",
                            showConfirmButton: false, // Ocultar el botón de confirmación
                            timer: 2000 // Cerrar automáticamente después de 2 segundos
                        });
                    }).catch(error => {
                        const swalWithReact = withReactContent(Swal);
                        // Manejar el error aquí
                        withReactContent(Swal).fire({
                            title: "Error",
                            text: "Comunica con soporte (pago ticket)",
                            icon: "error"
                        })
                    });
                }
            }
        });
    }

    function handleSearch2(search) {
        searchBuscador = search;
        if (menuActivo == 1) {
            if (submenuActivo == 1) {
                cargarTicketsTrabajando(usuarioId, 0, 1)
            }
            if (submenuActivo == 2) {
                cargarTicketsTrabajando(usuarioId, 0, 2)
            }
        }
        else if (menuActivo == 2) {
            cargarTicketsTrabajando(usuarioId, 0, 3)
        }
        else if (menuActivo == 3) {
            cargarTicketsTrabajando(usuarioId, 0, 4)
        }
        else if (menuActivo == 4) {
            cargarTicketsTrabajando(usuarioId, 0, 5)
        }
        else if (menuActivo == 5) {
            cargarTicketsTrabajando(usuarioId, 0, 6)
        }
        else if (menuActivo == 6) {
            cargarTicketsTrabajando(usuarioId, 0, 7)
        }

        if (searchBuscador.length > 0) {
            //cargarTicketsGeneral()
        }
    }

    function handleSearch(search) {
        setTicketsConsulta([]);
        setTicketsConsulta2 = [];
        searchId = [];
        setConsultandoTickets(true);
        clearTimeout(controladorTiempo);
        controladorTiempo = setTimeout(() => handleSearch2(search), 100);
    }

    function handleChangePlantillas(event) {
        setInputValuePlantillas(event.target.value);
        if (event.target.value.length > 0) {
            let atajosFil = [];
            for (var i = plantillasFin.length - 1; i >= 0; i--) {
                //busca por el nombre
                if (plantillasFin[i].title.toLowerCase().includes(event.target.value.toLowerCase())) {
                    atajosFil.push(plantillasFin[i])
                }
            }
            setPlantillas(atajosFil)

            setShowDropdown2(true);
        } else {
            setShowDropdown2(false);
        }
    }
    function handleChangeAtajos(event) {
        setInputValueAtajo(event.target.value);
        if (event.target.value.length > 0) {

            let atajosFil = [];
            for (var i = atajosFin.length - 1; i >= 0; i--) {
                //busca por el nombre
                if (atajosFin[i].title.toLowerCase().includes(event.target.value.toLowerCase())) {
                    atajosFil.push(atajosFin[i])
                }
                //busca por el nombre
                /*else if(atajosFin[i].text.toLowerCase().includes(event.target.value.toLowerCase())){
                    atajosFil.push(atajosFin[i])
                }*/
            }
            setrespuestasRapidas(atajosFil)

            setShowDropdown(true);
        } else {
            setShowDropdown(false);
        }
    }

    function enviarArchivoOpen() {
        tokenLoading4 = 0;
        setTimeout(() => {
            if (textareaPrueba4 != 0) {
                textareaPrueba4.data("emojioneArea").setText('');
            }
        }, 100);
        setmodalsubirArchivos(true);
        setFile(null);
        setalertFile(false);
    }

    //cierra la modal
    function cerrarModal() {
        setmodalDetallMultimedia(false);
        setmodalsubirArchivos(false);
        setmodalEditarInf(false);
    }

    const handleChangeFile = (file) => {
        if (file.length > 0) {
            const arrayFile = [];
            for (var i = 0; i < file.length; i++) {
                arrayFile.push(file[i]);
            }
            setFile(arrayFile);
        } else {
            setFile(file);
        }


        urlSelect = URL.createObjectURL(file[0]);
    }

    const wait2 = (ms) => new Promise(resolve => setTimeout(resolve, ms));


    async function enviarMensajeArchivo() {
        if (file == null) {
            setalertFile(true);
        } else {
            if (ticketActivo.type == 1) {

                if (ticketActivo.idStatus == 1) {
                    //acepta el ticket
                    await axios.post(process.env.ENDPOINT_API + '/whatsapp2/aceptarTicket', {
                        ticket: ticketActivo.id,
                        usuario: usuarioId
                    }).then(response => {
                        ticketActivo.idStatus = 2;
                        // Crear una copia del arreglo ticketPendientesFin
                        var updatedTicket = setTicketsConsulta2.map(ticketLocal => {
                            // Verificar si el ID del ticket no es igual a 1 y retornarlo
                            if (ticketLocal.id !== ticketActivo.id) {
                                return ticketLocal;
                            }
                            // Retornar null para tickets que coinciden con el id a excluir
                            return null;
                        }).filter(ticket => ticket !== null);

                        // Actualizar el estado de ticketTrabajando con el array actualizado
                        setTicketsConsulta(updatedTicket);
                        setTicketsConsulta2 = updatedTicket;

                        cargarContadoresProcesos(usuarioId)

                        setticketAbierto(prevState => ({
                            ...prevState,  // Copiar el estado anterior
                            processesid: 1, // actualiza el proceso actual del ticket abierto
                            idStatus: 2
                        }));
                    })
                }


                let clase = 'right';
                let fecha = new Date();
                let hora = fecha.getTime() / 1000;
                let fechaMessage = convertirFecha(hora);
                let ackIcon = '';
                for (var e = arrAck.length - 1; e >= 0; e--) {
                    if (arrAck[e].banderaAck == 4) {
                        ackIcon = arrAck[e].icon
                    }
                }
                arrcolaEnviandoMessage.push({ id: usuario.user + '-' + hora })
                var nuevaCadena = textareaPrueba4.data("emojioneArea").getText().replace(/\n/g, "\n").trim();


                arrcolaEnviandoMessage.push({
                    id: usuario.user + '-' + hora,
                    ticket: ticketActivo.id,
                    hora: fecha.getTime() / 1000,
                    tipo: 2,
                    file: file,
                    urlSelect: urlSelect,
                    agregado: false,
                    usuario: usuario.nombre,
                    usuarioFoto: usuario.foto,
                    text: nuevaCadena,
                    status: 0,
                })


                if (file.length == 0) {
                    let nuevoMensaje = (
                        <li className={`message ${clase}`}>
                            <img title={usuario.nombre} className={`logo logo${clase}`} src={usuario.foto} alt="" />
                            {file.type.includes("image") ? (
                                <img style={{ height: '45vh', background: 'none', width: 'auto', paddingRight: '10px', paddingTop: '10px' }} src={urlSelect} alt="" />
                            ) : file.type.includes("audio") ? (
                                <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>
                                    <audio controls style={{ maxWidth: '100%', marginTop: '10px' }}>
                                        <source src={urlSelect} type="audio/ogg"></source>
                                    </audio>
                                </div>
                            ) : file.type.includes("video") ? (
                                <video
                                    src={urlSelect}
                                    style={{ height: '45vh', background: 'none', width: 'auto', paddingRight: '10px', paddingTop: '10px', margin: 'auto' }}
                                    controls='true'
                                ></video>
                            ) :
                                <iframe
                                    src={urlSelect}
                                    style={{ height: '500px', width: '100%' }}
                                ></iframe>
                            }
                            <p>{nuevaCadena}</p>
                            <span>
                                <i id={usuario.user + '-' + hora} style={{ marginTop: '-3px' }} className={ackIcon}></i>
                                {fechaMessage}
                                <b style={{ marginLeft: '5px' }}>({usuario.nombre})</b>
                            </span>
                        </li>
                    );

                    // Agregar el nuevo span a la lista de contenidosSpans
                    setContenidosMessagesChat((prevMessages => [...prevMessages, nuevoMensaje]));

                } else {
                    for (var i = 0; i < file.length; i++) {
                        urlSelect = URL.createObjectURL(file[i]);
                        let nuevoMensaje = (
                            <li className={`message ${clase}`}>
                                <img title={usuario.nombre} className={`logo logo${clase}`} src={usuario.foto} alt="" />
                                {file[i].type.includes("image") ? (
                                    <img style={{ height: '45vh', background: 'none', width: 'auto', paddingRight: '10px', paddingTop: '10px' }} src={urlSelect} alt="" />
                                ) : file[i].type.includes("audio") ? (
                                    <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>
                                        <audio controls style={{ maxWidth: '100%', marginTop: '10px' }}>
                                            <source src={urlSelect} type="audio/ogg"></source>
                                        </audio>
                                    </div>
                                ) : file[i].type.includes("video") ? (
                                    <video
                                        src={urlSelect}
                                        style={{ height: '45vh', background: 'none', width: 'auto', paddingRight: '10px', paddingTop: '10px', margin: 'auto' }}
                                        controls='true'
                                    ></video>
                                ) :
                                    <iframe
                                        src={urlSelect}
                                        style={{ height: '500px', width: '100%' }}
                                    ></iframe>
                                }
                                <p>{nuevaCadena}</p>
                                <span>
                                    <i id={usuario.user + '-' + hora + '-' + i} style={{ marginTop: '-3px' }} className={ackIcon}></i>
                                    {fechaMessage}
                                    <b style={{ marginLeft: '5px' }}>({usuario.nombre})</b>
                                </span>
                            </li>
                        );
                        if (nuevaCadena.length > 0 && i == 0) {
                            nuevaCadena = "";
                        }

                        // Agregar el nuevo span a la lista de contenidosSpans
                        setContenidosMessagesChat((prevMessages => [...prevMessages, nuevoMensaje]));
                    }
                }



                //cierra la modal
                setmodalsubirArchivos(false);

                //baja el scroll
                setTimeout(() => {
                    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
                }, 100);

                if (file.length > 0) {
                    for (var i = 0; i < file.length; i++) {
                        const formData = new FormData();
                        formData.append("file", file[i]);
                        formData.append("ticket", ticketActivo.id);
                        formData.append('message', textareaPrueba4.data("emojioneArea").getText());
                        formData.append("usuario", usuario.user);
                        formData.append("archivo", file[i].name);
                        formData.append("idLocal", usuario.user + '-' + hora + '-' + i)

                        formVariosArchivos(formData, usuario, hora)
                        await wait2(2000);

                    }
                } else {
                    formData.append("file", file);
                    formData.append("ticket", ticketActivo.id);
                    formData.append('message', textareaPrueba4.data("emojioneArea").getText());
                    formData.append("usuario", usuario.user);
                    formData.append("idLocal", usuario.user + '-' + hora)


                    await axios.post(process.env.ENDPOINT_API + '/whatsapp2/upload', formData, {
                        headers: {
                            "Content-Type": "multipart/form-data",
                            "apoyo": usuario.user + '-' + hora
                        },
                    }).then(response => {

                        // Crear una copia del arreglo ticketPendientesFin
                        var updatedTicket = setTicketsConsulta2.map(ticketLocal => {
                            // Verificar si el ID del ticket no es igual a 1 y retornarlo
                            if (ticketLocal.id == response.data.ticket) {
                                return {
                                    ...ticketLocal,
                                    mensajesPendientes: true
                                };
                            } else {
                                // Si el ID no coincide, simplemente devolver el ticket sin cambios
                                return ticketLocal;
                            }
                        });

                        // Actualizar el estado de ticketTrabajando con el array actualizado
                        setTicketsConsulta(updatedTicket);
                        setTicketsConsulta2 = updatedTicket;


                        var div = document.getElementById(response.data.idLocal);
                        let ackIcon = '';
                        for (var e = arrAck.length - 1; e >= 0; e--) {
                            if (arrAck[e].banderaAck == 5) {
                                ackIcon = arrAck[e].icon
                            }
                        }
                        // Cambiar la clase del div
                        div.className = ackIcon;
                        div.style.color = "#4ccf2b"
                        idRespuesta = 0;
                        typeRespuesta = 0;

                        for (var e = arrcolaEnviandoMessage.length - 1; e >= 0; e--) {
                            if (arrcolaEnviandoMessage[e].id == response.data.idLocal) {
                                arrcolaEnviandoMessage.splice(e, 1);
                            }
                        }
                    })
                        .catch(error => {
                            console.log(error);
                            for (var e = arrcolaEnviandoMessage.length - 1; e >= 0; e--) {
                                if (arrcolaEnviandoMessage[e].id == error.config['headers'].apoyo) {
                                    arrcolaEnviandoMessage[e].status = 1;
                                }
                            }

                            for (var e = arrcolaEnviandoMessage.length - 1; e >= 0; e--) {
                                if (arrcolaEnviandoMessage[e].id == error.config['headers'].apoyo) {
                                    arrcolaEnviandoMessage[e].status = 1;
                                }
                            }
                            var div = document.getElementById(error.config['headers'].apoyo);
                            if (div) {
                                // Cambiar la clase del div
                                div.className = 'bx bxs-info-circle';
                                div.style.color = "red"
                            }

                            const swalWithReact = withReactContent(Swal);
                            // Manejar el error aquí
                            withReactContent(Swal).fire({
                                title: "Error",
                                text: "Comunica con soporte",
                                icon: "error"
                            })
                        });
                }
            } else {

                //es un solo archivo
                if (file.length == 1) {
                    //es una audio
                    if (file[0].type.includes("audio")) {
                        let clase = 'right';
                        let fecha = new Date();
                        let hora = fecha.getTime() / 1000;
                        let fechaMessage = convertirFecha(hora);
                        let ackIcon = '';
                        let idAck = 0;
                        for (var e = arrAck.length - 1; e >= 0; e--) {
                            if (arrAck[e].banderaAck == 4) {
                                idAck = arrAck[e].banderaAck;
                                ackIcon = arrAck[e].icon
                            }
                        }
                        var nuevaCadena = textareaPrueba4.data("emojioneArea").getText().replace(/\n/g, "\n").trim();

                        arrcolaEnviandoMessage.push({
                            id: usuario.user + '-' + hora,
                            ticket: ticketActivo.id,
                            tipo: 2,
                            file: [file[0]],
                            status: 0,
                            text: "",
                            intentos: 0,
                            ack: idAck,
                            usuario: usuarioId
                        })

                        let id = usuario.user + '-' + hora;

                        const nuevoMensaje = (
                            <li id={`message-${id}`} className={`message ${clase}`}>
                                <img title={usuario.nombre} className={`logo logo${clase}`} src={usuario.foto} alt="" />
                                <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>
                                    <audio controls style={{ maxWidth: '100%', marginTop: '10px' }}>
                                        <source src={urlSelect} type="audio/ogg"></source>
                                    </audio>
                                </div>
                                <span>
                                    <i id={`ack-${id}`} style={{ marginTop: '-3px' }} className={ackIcon}></i>
                                    {fechaMessage}
                                    <b style={{ marginLeft: '5px' }}>({usuario.nombre})</b>
                                </span>
                            </li>
                        );
                        // Agregar el nuevo span a la lista de contenidosSpans
                        setContenidosMessagesChat((prevMessages => [...prevMessages, nuevoMensaje]));

                        if (nuevaCadena.length > 0) {

                            clase = 'right';
                            fecha = new Date();
                            hora = fecha.getTime() / 1000;
                            fechaMessage = convertirFecha(hora);
                            ackIcon = '';
                            idAck = 0;
                            for (var e = arrAck.length - 1; e >= 0; e--) {
                                if (arrAck[e].banderaAck == 4) {
                                    idAck = arrAck[e].banderaAck;
                                    ackIcon = arrAck[e].icon
                                }
                            }
                            nuevaCadena = textareaPrueba4.data("emojioneArea").getText().replace(/\n/g, "\n").trim();

                            arrcolaEnviandoMessage.push({
                                id: usuario.user + '-' + hora + "-1",
                                ticket: ticketActivo.id,
                                tipo: 1,
                                status: 0,
                                text: nuevaCadena,
                                intentos: 0,
                                ack: idAck,
                                usuario: usuarioId
                            })

                            let id = usuario.user + '-' + hora + "-1";

                            const nuevoMensaje = (
                                <li id={`message-${id}`} className={`message ${clase}`}>
                                    <img title={usuario.nombre} className={`logo logo${clase}`} src={usuario.foto} alt="" />

                                    <p>{nuevaCadena}</p>
                                    <span>
                                        <i id={`ack-${id}`} style={{ marginTop: '-3px' }} className={ackIcon}></i>
                                        {fechaMessage}
                                        <b style={{ marginLeft: '5px' }}>({usuario.nombre})</b>
                                    </span>
                                </li>
                            );
                            // Agregar el nuevo span a la lista de contenidosSpans
                            setContenidosMessagesChat((prevMessages => [...prevMessages, nuevoMensaje]));
                        }
                    } else {
                        let clase = 'right';
                        let fecha = new Date();
                        let hora = fecha.getTime() / 1000;
                        let fechaMessage = convertirFecha(hora);
                        let ackIcon = '';
                        let idAck = 0;
                        for (var e = arrAck.length - 1; e >= 0; e--) {
                            if (arrAck[e].banderaAck == 4) {
                                idAck = arrAck[e].banderaAck;
                                ackIcon = arrAck[e].icon
                            }
                        }
                        var nuevaCadena = textareaPrueba4.data("emojioneArea").getText().replace(/\n/g, "\n").trim();

                        arrcolaEnviandoMessage.push({
                            id: usuario.user + '-' + hora,
                            ticket: ticketActivo.id,
                            tipo: 2,
                            file: [file[0]],
                            status: 0,
                            text: nuevaCadena,
                            intentos: 0,
                            ack: idAck,
                            usuario: usuarioId
                        })

                        let id = usuario.user + '-' + hora;

                        const nuevoMensaje = (
                            <li id={`message-${id}`} className={`message ${clase}`}>
                                <img title={usuario.nombre} className={`logo logo${clase}`} src={usuario.foto} alt="" />
                                {file[0].type.includes("image") ? (
                                    <img style={{ height: '45vh', background: 'none', width: 'auto', paddingRight: '10px', paddingTop: '10px' }} src={urlSelect} alt="" />
                                ) : file[0].type.includes("audio") ? (
                                    <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>
                                        <audio controls style={{ maxWidth: '100%', marginTop: '10px' }}>
                                            <source src={urlSelect} type="audio/ogg"></source>
                                        </audio>
                                    </div>
                                ) : file[0].type.includes("video") ? (
                                    <video
                                        src={urlSelect}
                                        style={{ height: '45vh', background: 'none', width: 'auto', paddingRight: '10px', paddingTop: '10px', margin: 'auto' }}
                                        controls='true'
                                    ></video>
                                ) :
                                    <iframe
                                        src={urlSelect}
                                        style={{ height: '500px', width: '100%' }}
                                    ></iframe>
                                }
                                <p>{nuevaCadena}</p>
                                <span>
                                    <i id={`ack-${id}`} style={{ marginTop: '-3px' }} className={ackIcon}></i>
                                    {fechaMessage}
                                    <b style={{ marginLeft: '5px' }}>({usuario.nombre})</b>
                                </span>
                            </li>
                        );
                        // Agregar el nuevo span a la lista de contenidosSpans
                        setContenidosMessagesChat((prevMessages => [...prevMessages, nuevoMensaje]));
                    }
                } else {
                    for (var i = 0; i < file.length; i++) {
                        //es una audio
                        if (file[i].type.includes("audio")) {

                            let clase = 'right';
                            let fecha = new Date();
                            let hora = fecha.getTime() / 1000;
                            let fechaMessage = convertirFecha(hora);
                            let ackIcon = '';
                            let idAck = 0;
                            urlSelect = URL.createObjectURL(file[i]);
                            for (var e = arrAck.length - 1; e >= 0; e--) {
                                if (arrAck[e].banderaAck == 4) {
                                    idAck = arrAck[e].banderaAck;
                                    ackIcon = arrAck[e].icon
                                }
                            }
                            var nuevaCadena = textareaPrueba4.data("emojioneArea").getText().replace(/\n/g, "\n").trim();
                            if (i > 0) {
                                //envia solo los mensajes con el primer archivo
                                nuevaCadena = "";
                            } else {
                                nuevaCadena = ""
                            }
                            arrcolaEnviandoMessage.push({
                                id: usuario.user + '-' + hora + '-' + i,
                                ticket: ticketActivo.id,
                                tipo: 2,
                                file: [file[i]],
                                status: 0,
                                text: nuevaCadena,
                                intentos: 0,
                                ack: idAck,
                                usuario: usuarioId
                            })

                            let id = usuario.user + '-' + hora + '-' + i;

                            const nuevoMensaje = (
                                <li id={`message-${id}`} className={`message ${clase}`}>
                                    <img title={usuario.nombre} className={`logo logo${clase}`} src={usuario.foto} alt="" />
                                    {file[i].type.includes("image") ? (
                                        <img style={{ height: '45vh', background: 'none', width: 'auto', paddingRight: '10px', paddingTop: '10px' }} src={urlSelect} alt="" />
                                    ) : file[i].type.includes("audio") ? (
                                        <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>
                                            <audio controls style={{ maxWidth: '100%', marginTop: '10px' }}>
                                                <source src={urlSelect} type="audio/ogg"></source>
                                            </audio>
                                        </div>
                                    ) : file[i].type.includes("video") ? (
                                        <video
                                            src={urlSelect}
                                            style={{ height: '45vh', background: 'none', width: 'auto', paddingRight: '10px', paddingTop: '10px', margin: 'auto' }}
                                            controls='true'
                                        ></video>
                                    ) :
                                        <iframe
                                            src={urlSelect}
                                            style={{ height: '500px', width: '100%' }}
                                        ></iframe>
                                    }
                                    <p>{nuevaCadena}</p>
                                    <span>
                                        <i id={`ack-${id}`} style={{ marginTop: '-3px' }} className={ackIcon}></i>
                                        {fechaMessage}
                                        <b style={{ marginLeft: '5px' }}>({usuario.nombre})</b>
                                    </span>
                                </li>
                            );
                            // Agregar el nuevo span a la lista de contenidosSpans
                            setContenidosMessagesChat((prevMessages => [...prevMessages, nuevoMensaje]));
                            if (i == 0) {
                                nuevaCadena = textareaPrueba4.data("emojioneArea").getText().replace(/\n/g, "\n").trim();
                            }

                            if (nuevaCadena.length > 0) {
                                clase = 'right';
                                fecha = new Date();
                                hora = fecha.getTime() / 1000;
                                fechaMessage = convertirFecha(hora);
                                ackIcon = '';
                                idAck = 0;
                                urlSelect = URL.createObjectURL(file[i]);
                                for (var e = arrAck.length - 1; e >= 0; e--) {
                                    if (arrAck[e].banderaAck == 4) {
                                        idAck = arrAck[e].banderaAck;
                                        ackIcon = arrAck[e].icon
                                    }
                                }
                                nuevaCadena = textareaPrueba4.data("emojioneArea").getText().replace(/\n/g, "\n").trim();
                                if (i > 0) {
                                    //envia solo los mensajes con el primer archivo
                                    nuevaCadena = "";
                                }
                                arrcolaEnviandoMessage.push({
                                    id: usuario.user + '-' + hora + '-' + i + "-1",
                                    ticket: ticketActivo.id,
                                    tipo: 1,
                                    status: 0,
                                    text: nuevaCadena,
                                    intentos: 0,
                                    ack: idAck,
                                    usuario: usuarioId
                                })

                                let id = usuario.user + '-' + hora + '-' + i + "-1";

                                const nuevoMensaje = (
                                    <li id={`message-${id}`} className={`message ${clase}`}>
                                        <img title={usuario.nombre} className={`logo logo${clase}`} src={usuario.foto} alt="" />
                                        <p>{nuevaCadena}</p>
                                        <span>
                                            <i id={`ack-${id}`} style={{ marginTop: '-3px' }} className={ackIcon}></i>
                                            {fechaMessage}
                                            <b style={{ marginLeft: '5px' }}>({usuario.nombre})</b>
                                        </span>
                                    </li>
                                );
                                // Agregar el nuevo span a la lista de contenidosSpans
                                setContenidosMessagesChat((prevMessages => [...prevMessages, nuevoMensaje]));

                            }
                        } else {
                            let clase = 'right';
                            let fecha = new Date();
                            let hora = fecha.getTime() / 1000;
                            let fechaMessage = convertirFecha(hora);
                            let ackIcon = '';
                            let idAck = 0;
                            urlSelect = URL.createObjectURL(file[i]);
                            for (var e = arrAck.length - 1; e >= 0; e--) {
                                if (arrAck[e].banderaAck == 4) {
                                    idAck = arrAck[e].banderaAck;
                                    ackIcon = arrAck[e].icon
                                }
                            }
                            var nuevaCadena = textareaPrueba4.data("emojioneArea").getText().replace(/\n/g, "\n").trim();
                            if (i > 0) {
                                //envia solo los mensajes con el primer archivo
                                nuevaCadena = "";
                            }
                            arrcolaEnviandoMessage.push({
                                id: usuario.user + '-' + hora + '-' + i,
                                ticket: ticketActivo.id,
                                tipo: 2,
                                file: [file[i]],
                                status: 0,
                                text: nuevaCadena,
                                intentos: 0,
                                ack: idAck,
                                usuario: usuarioId
                            })

                            let id = usuario.user + '-' + hora + '-' + i;

                            const nuevoMensaje = (
                                <li id={`message-${id}`} className={`message ${clase}`}>
                                    <img title={usuario.nombre} className={`logo logo${clase}`} src={usuario.foto} alt="" />
                                    {file[i].type.includes("image") ? (
                                        <img style={{ height: '45vh', background: 'none', width: 'auto', paddingRight: '10px', paddingTop: '10px' }} src={urlSelect} alt="" />
                                    ) : file[i].type.includes("audio") ? (
                                        <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>
                                            <audio controls style={{ maxWidth: '100%', marginTop: '10px' }}>
                                                <source src={urlSelect} type="audio/ogg"></source>
                                            </audio>
                                        </div>
                                    ) : file[i].type.includes("video") ? (
                                        <video
                                            src={urlSelect}
                                            style={{ height: '45vh', background: 'none', width: 'auto', paddingRight: '10px', paddingTop: '10px', margin: 'auto' }}
                                            controls='true'
                                        ></video>
                                    ) :
                                        <iframe
                                            src={urlSelect}
                                            style={{ height: '500px', width: '100%' }}
                                        ></iframe>
                                    }
                                    <p>{nuevaCadena}</p>
                                    <span>
                                        <i id={`ack-${id}`} style={{ marginTop: '-3px' }} className={ackIcon}></i>
                                        {fechaMessage}
                                        <b style={{ marginLeft: '5px' }}>({usuario.nombre})</b>
                                    </span>
                                </li>
                            );
                            // Agregar el nuevo span a la lista de contenidosSpans
                            setContenidosMessagesChat((prevMessages => [...prevMessages, nuevoMensaje]));
                        }
                    }
                }


                if (enviandoMensajes == false) {
                    enviandoMensajes = true;
                    enviarMensajeServer();
                }

                //baja el scroll
                setTimeout(() => {
                    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
                }, 100);

                //cierra la modal
                setmodalsubirArchivos(false);
            }


        }
    }

    //function enviar varios archivos
    async function formVariosArchivos(formData, usuario, hora) {
        await axios.post(process.env.ENDPOINT_API + '/whatsapp2/upload', formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                "apoyo": usuario.user + '-' + hora
            },
        }).then(response => {

            // Crear una copia del arreglo ticketPendientesFin
            var updatedTicket = setTicketsConsulta2.map(ticketLocal => {
                // Verificar si el ID del ticket no es igual a 1 y retornarlo
                if (ticketLocal.id == response.data.ticket) {
                    return {
                        ...ticketLocal,
                        mensajesPendientes: true
                    };
                } else {
                    // Si el ID no coincide, simplemente devolver el ticket sin cambios
                    return ticketLocal;
                }
            });

            // Actualizar el estado de ticketTrabajando con el array actualizado
            setTicketsConsulta(updatedTicket);
            setTicketsConsulta2 = updatedTicket;


            var div = document.getElementById(response.data.idLocal);
            let ackIcon = '';
            for (var e = arrAck.length - 1; e >= 0; e--) {
                if (arrAck[e].banderaAck == 5) {
                    ackIcon = arrAck[e].icon
                }
            }
            // Cambiar la clase del div
            div.className = ackIcon;
            div.style.color = "#4ccf2b"
            idRespuesta = 0;
            typeRespuesta = 0;

            for (var e = arrcolaEnviandoMessage.length - 1; e >= 0; e--) {
                if (arrcolaEnviandoMessage[e].id == response.data.idLocal) {
                    arrcolaEnviandoMessage.splice(e, 1);
                }
            }
        }).catch(error => {
            console.log(error);
            for (var e = arrcolaEnviandoMessage.length - 1; e >= 0; e--) {
                if (arrcolaEnviandoMessage[e].id == error.config['headers'].apoyo) {
                    arrcolaEnviandoMessage[e].status = 1;
                }
            }

            for (var e = arrcolaEnviandoMessage.length - 1; e >= 0; e--) {
                if (arrcolaEnviandoMessage[e].id == error.config['headers'].apoyo) {
                    arrcolaEnviandoMessage[e].status = 1;
                }
            }
            var div = document.getElementById(error.config['headers'].apoyo);
            if (div) {
                // Cambiar la clase del div
                div.className = 'bx bxs-info-circle';
                div.style.color = "red"
            }

            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte",
                icon: "error"
            })
        });
    }
    //function ver galeria
    async function galeriaOpen() {
        setOpenGaleria(true);
        // Obtener todos los elementos <div> con la clase opacityOpen
        const elements = document.querySelectorAll('.opacityOpen');

        // Iterar sobre cada elemento y aplicar la opacidad
        elements.forEach(element => {
            element.style.opacity = '0.2';
        });
    }

    async function galeriaClose() {
        setOpenGaleria(false);
        // Obtener todos los elementos <div> con la clase opacityOpen
        const elements = document.querySelectorAll('.opacityOpen');

        // Iterar sobre cada elemento y aplicar la opacidad
        elements.forEach(element => {
            element.style.opacity = '1';
        });
    }

    const handleBusquedaMultimedia = async (event) => {
        const valorBusqueda = event.target.value;
        if (valorBusqueda.length > 0) {
            setBanderaConsultandoMultimedia(true)
            try {
                await axios.post(process.env.ENDPOINT_API + '/whatsapp2/cargarMultimediaMessageBusqueda', {
                    name: valorBusqueda
                }).then(response => {
                    setdivdetallMultimedia(response.data.multimedia);
                }).catch(error => {
                    console.log(error);
                    // Manejar el error aquí
                    withReactContent(Swal).fire({
                        title: "Error al cargar el multimedia",
                        text: "Comunica con soporte",
                        icon: "error"
                    })
                });
            } catch (error) {
                withReactContent(Swal).fire({
                    title: "Error al cargar el multimedia",
                    text: "Comunica con soporte",
                    icon: "error"
                })
            }
        } else {
            setBanderaConsultandoMultimedia(false)
        }
    };

    //inici la grabacion del audio
    const startRecording = () => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {

                const options = { mimeType: 'audio/ogg' };
                mediaRecorderRef.current = new opusMediaRecorder(stream, options, workerOptions);
                mediaRecorderRef.current.addEventListener('dataavailable', (e) => {
                    descargarAudio(e);
                });
                mediaRecorderRef.current.start()
                setRecording(true);
                setMediaRecorder(recorder);
                setStartTime(new Date());

                const audioContext = new AudioContext();
                const analyser = audioContext.createAnalyser();
                const source = audioContext.createMediaStreamSource(stream);
                source.connect(analyser);
                setAudioContext(audioContext);
                setAnalyser(analyser);

                // Crear un lienzo para visualizar la frecuencia
                const canvas = document.createElement('canvas');
                const canvasContext = canvas.getContext('2d');
                setCanvasContext(canvasContext);

                const canvasWidth = canvasContext.canvas.width;
                const canvasHeight = canvasContext.canvas.height;

                setTimeout(() => {
                    const container = document.getElementById('canvas-container');
                    container.innerHTML = ''
                    container.appendChild(canvas);
                    // Configurar el analizador de frecuencia
                    analyser.fftSize = 2048;
                    const bufferLength = analyser.frequencyBinCount;
                    const dataArray = new Uint8Array(bufferLength);

                    // Dibujar el espectro de frecuencia
                    function draw() {
                        requestAnimationFrame(draw);

                        analyser.getByteFrequencyData(dataArray);

                        canvasContext.fillStyle = '#f1f1f1';
                        canvasContext.fillRect(0, 0, canvas.width, canvas.height);

                        const barWidth = (canvas.width / bufferLength) * 2.5;
                        let x = 0;

                        const maxBarHeight = canvasHeight * 0.9;

                        for (let i = 0; i < bufferLength; i++) {
                            const barHeight = dataArray[i] / 255 * maxBarHeight;

                            canvasContext.fillStyle = '#93c18c';

                            canvasContext.fillRect(x, canvasHeight - barHeight, barWidth, barHeight);

                            x += barWidth + 1;
                        }
                    }
                    draw();
                }, 100);



            })
            .catch(error => {
                console.error('Error accessing microphone:', error);
            });
    };

    //cancelar la grabacion del auido
    function cancelarAudio() {
        mediaRecorderRef.current.pause();
        setRecording(false);
    }

    function atajoClick(datos) {
        idRespuesta = datos.id;
        typeRespuesta = 1;
        textareaPrueba.data("emojioneArea").setText(datos.text);
        setShowDropdown(false);
        setInputValueAtajo('');
    }


    function FormatearFecha(fechaStr) {
        const [dia, mes, año] = fechaStr.split('/');
        const dateObj = new Date(`${año}-${mes}-${dia}`);

        return dateObj.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
        });
    }

    function aplicarFiltroVentana() {
        dataFiltros = [];
        for (let i = 1; i < 7; i++) {
            if ($("#checkbox-" + i).prop('checked')) {
                dataFiltros.push({ tipo: i })
            }
        }

        if (menuActivo == 1) {
            if (submenuActivo == 1) {
                cargarTicketsTrabajando(usuarioId, 0, 1)
            }
            if (submenuActivo == 2) {
                cargarTicketsTrabajando(usuarioId, 0, 2)
            }
        }
        else if (menuActivo == 2) {
            cargarTicketsTrabajando(usuarioId, 0, 3)
        }
        else if (menuActivo == 3) {
            cargarTicketsTrabajando(usuarioId, 0, 4)
        }
        else if (menuActivo == 4) {
            cargarTicketsTrabajando(usuarioId, 0, 5)
        }
        else if (menuActivo == 5) {
            cargarTicketsTrabajando(usuarioId, 0, 6)
        }
        else if (menuActivo == 6) {
            cargarTicketsTrabajando(usuarioId, 0, 7)
        }
        document.getElementById('sidebarMetas')?.classList.toggle('active');
    }

    return (
        <>
            <Modal show={modalEditarInf} className="modal-lg" onHide={cerrarModal}>
                <Modal.Header style={{ borderBottom: '2px solid #ababab' }} closeButton>
                    <Modal.Title>Contacto</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ paddingTop: '30px' }}>
                    <div className="col-md-12">
                        <label className="form-label">Nombre</label>
                        <input className="form-control" type="text" onChange={handleInputChange} value={inputName} />
                    </div>
                    <div className='col-12'>
                        <button onClick={editarInfContacto} className="btn btn-primary" style={{ marginTop: '10px', width: '100%', background: '#222d32', color: 'white' }}>Actualizar</button>
                    </div>
                </Modal.Body>
            </Modal>

            <Modal show={modalsubirArchivos} className="modal-lg" onHide={cerrarModal}>
                <Modal.Header style={{ borderBottom: '2px solid #ababab' }} closeButton>
                    <Modal.Title>Subir Archivo</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ paddingTop: '0px' }}>
                    <div className='row'>
                        {alertFile ? (
                            <div style={{ color: 'red', marginTop: '10px' }} className="alert alert-danger">
                                Debes elegir un archivo
                            </div>
                        ) : (null)}
                        <div style={{ width: 'auto', margin: 'auto', marginTop: '20px' }}>
                            <FileUploader
                                multiple={true}
                                handleChange={handleChangeFile}
                                name="file"
                            />
                            <p>
                                <>
                                    {file ? (
                                        file.length > 0 ? (
                                            <>
                                                Archivos: ({file.map((item, index) => item.name).join(", ")})
                                            </>
                                        ) : (
                                            `Nombre del archivo: ${file[0].name}`
                                        )
                                    ) : (
                                        "Aún no se han subido archivos"
                                    )}
                                </>
                            </p>
                        </div>
                        <EmojiOneArea3
                            onEmojiSelect={function (text: string): void {
                                throw new Error('Function not implemented.');
                            }}
                            changeTextareaValueRef={function (text: string): void {
                                console.log("hola llego a escribir")
                            }}
                        />
                        <div className='col-12'>
                            <button onClick={enviarMensajeArchivo} className="btn btn-primary" style={{ marginTop: '10px', width: '100%', background: '#222d32', color: 'white' }}>Enviar Mensaje</button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>

            <Modal show={modalDetallMultimedia} className="modal-lg" onHide={cerrarModal}>
                <Modal.Header style={{ borderBottom: '2px solid #ababab' }} closeButton>
                    <Modal.Title>Detalle</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ paddingTop: '0px' }}>
                    <div className='row'>
                        {detallMultimedia && (
                            <>
                                <div className='col-12' style={{ textAlign: 'center' }}>
                                    {detallMultimedia.typeId == 1 ? (
                                        <>
                                            <img
                                                src={process.env.ENDPOINT_API + '/static/' + detallMultimedia.mediaUrl}
                                                style={{ padding: '10px', maxHeight: '67vh', margin: 'auto' }}
                                            >
                                            </img>
                                        </>
                                    ) : detallMultimedia.typeId == 2 ? (
                                        <>
                                            <video
                                                src={process.env.ENDPOINT_API + '/static/' + detallMultimedia.mediaUrl}
                                                style={{ padding: '10px', maxHeight: '67vh', margin: 'auto' }}
                                                controls='true'
                                            ></video>
                                        </>
                                    ) : detallMultimedia.typeId == 3 ? (
                                        <>
                                            <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>
                                                <audio style={{ maxWidth: '100%', height: '45px', margin: 'auto', width: '80%' }} controls src={process.env.ENDPOINT_API + '/static/' + detallMultimedia.mediaUrl}></audio>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <iframe
                                                style={{ width: '80%', margin: 'auto', height: '60vh', maxHeight: '60vh', marginTop: '10px', marginBottom: '10px' }}
                                                src={process.env.ENDPOINT_API + '/static/' + detallMultimedia.mediaUrl}>
                                            </iframe>
                                        </>
                                    )}
                                </div>
                                <div className='col-6' style={{ display: 'none', borderRight: '2px solid #222d32' }}>
                                    <p>
                                        {detallMultimedia.description}
                                    </p>
                                </div>
                                <div className='col-12'>
                                    <EmojiOneArea2
                                        onEmojiSelect={function (text: string): void {
                                            throw new Error('Function not implemented.');
                                        }}
                                        changeTextareaValueRef={function (text: string): void {
                                            console.log("hola llego a escribir")
                                        }}
                                    />
                                </div>
                                <div className='col-12'>
                                    <button onClick={enviarMensajeMultimedia} className="btn btn-primary" style={{ marginTop: '10px', width: '100%', background: '#222d32', color: 'white' }}>Enviar Mensaje</button>
                                </div>
                            </>
                        )}

                        {detallePlantilla && (
                            <>
                                <div className='col-12' style={{ textAlign: 'center' }}>
                                    {detallePlantilla.imagen != "" && (
                                        <>
                                            <img
                                                src={detallePlantilla.imagen}
                                                style={{ padding: '10px', maxHeight: '67vh', margin: 'auto' }}
                                            >
                                            </img>
                                        </>
                                    )}
                                </div>
                                <div className='col-6' style={{ display: 'none', borderRight: '2px solid #222d32' }}>
                                    <p>

                                    </p>
                                </div>
                                <div className='col-12'>
                                    <textarea className='form-control' rows={5} disabled id='bodyTemplate'>

                                    </textarea>
                                </div>
                                <div className='col-12'>
                                    <button onClick={utilizarPlantilla} className="btn btn-primary" style={{ marginTop: '10px', width: '100%', background: '#222d32', color: 'white' }}>Enviar Mensaje</button>
                                </div>
                            </>
                        )}


                    </div>
                </Modal.Body>
            </Modal>

            <div className="row g-0" style={{ height: '100vh' }}>
                {/* Sidebar de íconos */}
                <div
                    className="col-4 col-sm-2 col-md-1 d-flex flex-column justify-content-between align-items-center py-3"
                    style={{
                        borderRight: '1px solid #ccc',
                        position: 'relative',
                        zIndex: 10,
                        padding: 0,
                        backgroundColor: '#f9f9f9'
                    }}
                >
                    {/* Encabezado */}
                    <div className="mb-2 text-center w-100 py-2 border-bottom" onClick={() => {
                        setFiltros(false);
                        document.getElementById('sidebarMetas')?.classList.toggle('active');
                    }}>
                        {(() => {
                            const porcentaje = Math.round((parseInt(contCreditos) / totalCreditos) * 100);

                            // Color según porcentaje
                            let color = '#28a745'; // verde por defecto
                            if (porcentaje < 10) color = '#ff0000'; // rojo
                            else if (porcentaje < 50) color = '#ffc107'; // amarillo

                            const radius = 20;
                            const circumference = 2 * Math.PI * radius;
                            const offset = circumference - (porcentaje / 100) * circumference;

                            return (
                                <svg width="50" style={{ margin: 'auto' }} height="50" viewBox="0 0 50 50">
                                    <circle
                                        cx="25"
                                        cy="25"
                                        r={radius}
                                        fill="none"
                                        stroke="#e6e6e6"
                                        strokeWidth="4"
                                    />
                                    <circle
                                        cx="25"
                                        cy="25"
                                        r={radius}
                                        fill="none"
                                        stroke={color}
                                        strokeWidth="4"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={offset}
                                        strokeLinecap="round"
                                        style={{ transition: 'stroke-dashoffset 0.5s' }}
                                    />
                                    <text
                                        x="25"
                                        y="30"
                                        textAnchor="middle"
                                        fontSize="12"
                                        fill={color}
                                        fontWeight="bold"
                                    >
                                        {porcentaje}%
                                    </text>
                                </svg>
                            );
                        })()}
                        <small className="mt-2 d-block">
                            Disponibles: {parseInt(contCreditos)}
                        </small>

                    </div>

                    <div className="mb-2 text-center w-100 py-2 border-bottom">
                        <input
                            className="form-check-input"
                            style={{ cursor: 'pointer', marginRight: '10px' }}
                            onChange={cambioMenuPrincipal2}
                            type="checkbox"
                            id="checkCloud"
                        />
                        <label className="form-check-label" htmlFor="flexSwitchCheckDefault">Cloud</label>
                    </div>

                    {/* Menú scrollable */}
                    <div
                        className="d-flex flex-column align-items-center w-100"
                        style={{
                            overflowY: 'auto',
                            flexGrow: 1,
                            padding: '5px 0'
                        }}
                    >
                        {opcionesMenu.map((menu) => (
                            <div
                                key={menu.id}
                                className={`w-100 divMenuLat text-center px-2 ${menuSeleccionado === menu.id ? 'menu-activo' : ''}`}
                                onClick={() => cambioMenuPrincipal(menu.id)}
                                style={{
                                    cursor: 'pointer',
                                    backgroundColor: menuSeleccionado === menu.id ? '#e9f3ff' : 'transparent',
                                    borderLeft: menuSeleccionado === menu.id ? '4px solid #b7b7b7' : '4px solid transparent',
                                    transition: 'all 0.3s ease',
                                    borderBottom: '1px solid #d3d3d3',
                                    marginBottom: '5px'
                                }}
                            >
                                <div className='row g-0 align-items-center'>
                                    <div className='col-3 text-center'>
                                        <i className={`menu-icon tf-icons ${menu.icon}`} style={{ fontSize: '18px', color: '#555' }}></i>
                                    </div>
                                    <div className='col-9 text-start ps-1'>
                                        <div style={{ fontSize: '11px', color: '#333' }}>{menu.name}</div>
                                    </div>
                                    <div className='col-12 text-center'>
                                        <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#585858' }}>{menu.tickets}</span><br />
                                        {menu.conversaciones > 0 && (
                                            <span
                                                style={{
                                                    background: menu.alertMessage === 1 ? '#279b0a' : '#ff0000',
                                                    color: 'white',
                                                    borderRadius: '20px',
                                                    padding: '2px 6px',
                                                    fontSize: '9px',
                                                    marginTop: '3px',
                                                    display: 'inline-block'
                                                }}
                                            >
                                                {menu.messages} Msg - {menu.conversaciones} Conv.
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Usuario */}
                    <div className="d-flex flex-column align-items-center gap-2 mt-2 pb-2">
                        <img
                            src="https://www.crmtsu.com:444/static/fotoUser/perfil.jpg"
                            alt="Usuario"
                            className="rounded-circle border"
                            width="40"
                            height="40"
                        />
                        <small>{usuario.nombre}</small>
                    </div>
                </div>



                {/* Panel lateral de metas */}
                <div
                    id="sidebarMetas"
                    className="sidebar-metas bg-light p-3"
                >
                    <div className="container-fluid" style={{ padding: '0px' }}>
                        <div className="row align-items-center" style={{ width: '100%', margin: 'auto' }}>
                            <div className="col-10">
                                {filtros ? (
                                    <strong>Filtros</strong>
                                ) : (
                                    <strong>Mis Creditos</strong>
                                )}

                            </div>
                            <div className="col-1">
                                <i
                                    className="bx bx-x"
                                    style={{ cursor: 'pointer', fontSize: '20px' }}
                                    onClick={() => {
                                        document.getElementById('sidebarMetas')?.classList.toggle('active');
                                    }}
                                ></i>
                            </div>
                            <div style={{ height: '2px', background: '#8b8b8b', width: '80%', margin: 'auto', marginTop: '10px', marginBottom: '10px' }}></div>
                            <div className='col-12'>
                                {filtros ? (
                                    <div className="row">
                                        <div className="col-12">
                                            <label>
                                                <input type="radio" name="ventanaFiltro" id='checkbox-1' className="me-1" />
                                                Ventanas abiertas
                                            </label>
                                        </div>
                                        <div className="col-12">
                                            <label>
                                                <input type="radio" name="ventanaFiltro" id='checkbox-2' className="me-1" />
                                                Ventanas cerradas
                                            </label>
                                        </div>
                                        <div className="col-12">
                                            <label>
                                                <input type="radio" name="ventanaFiltro" id='checkbox-3' className="me-1" />
                                                Tienen menos de 1 h.
                                            </label>
                                        </div>
                                        <div className="col-12">
                                            <label>
                                                <input type="radio" name="ventanaFiltro" id='checkbox-4' className="me-1" />
                                                Tienen menos de 3 h.
                                            </label>
                                        </div>
                                        <div className="col-12">
                                            <label>
                                                <input type="radio" name="ventanaFiltro" id='checkbox-5' className="me-1" />
                                                Tienen menos de 6 h.
                                            </label>
                                        </div>
                                        <div className="col-12">
                                            <label>
                                                <input type="radio" name="ventanaFiltro" id='checkbox-6' className="me-1" />
                                                Tienen menos de 12 h.
                                            </label>
                                        </div>
                                        <div className='col-12' style={{ marginTop: '10px' }}>
                                            <button onClick={aplicarFiltroVentana} className='btn btn-primary btn-sm' style={{ width: '100%' }}>Aplicar</button>
                                        </div>
                                    </div>

                                ) : (
                                    <div className="row">
                                        {(() => {
                                            const maxCreditos = totalCreditos;
                                            return resumenCreditos.map((dia, index) => {
                                                const porcentaje = maxCreditos > 0 ? (dia.creditos / maxCreditos) * 100 : 0;
                                                return (
                                                    <div key={index} className="mb-2 p-2 rounded shadow-sm bg-white">
                                                        <div className="d-flex justify-content-between mb-1">
                                                            <strong>{FormatearFecha(new Date(dia.fecha).toLocaleDateString())}</strong>
                                                            <span style={{ fontWeight: 'bold' }}>{dia.creditos}</span>
                                                        </div>
                                                        <div className="bar-container">
                                                            <div
                                                                className="bar"
                                                                style={{
                                                                    width: `${porcentaje}%`,
                                                                    backgroundColor: '#0d6efd',
                                                                    height: '8px',
                                                                    borderRadius: '4px',
                                                                    transition: 'width 0.3s ease'
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-8 col-sm-10 col-md-11" style={{ background: 'white' }}>
                    <div className='row' style={{ height: '100vh', border: '1px solid #e7e7e7', padding: '5px', width: '100%', margin: 'auto' }}>
                        {!(ticketAbierto && appMovil) && (
                            <div className='col-md-4 col-12' style={{ height: '100%', borderRight: '1px solid rgb(204, 204, 204)', display: 'flex', flexDirection: 'column' }}>
                                {opcionesMenu.map((menu) => (
                                    menuSeleccionado === menu.id && menu.subMenu.length > 0 && (
                                        <div className='row' style={{ display: 'flex' }}>
                                            {menu.subMenu.map((submenu) => (
                                                <div onClick={() => cambioMenuSecundario(submenu.id)} className={`col-6 col-sm-6 ${subMenuSelecionado === submenu.id ? 'div1-Activo' : ''}`} style={{ background: 'white', padding: '5px', textAlign: 'center', cursor: 'pointer' }}>
                                                    {submenu.name}:{submenu.tickets}
                                                    {submenu.conversaciones > 0 ? (
                                                        <>
                                                            <br></br>
                                                            <span
                                                                style={{
                                                                    background: submenu.alertMessage === 1 ? '#279b0a' : 'red',
                                                                    color: 'white',
                                                                    borderRadius: '20px',
                                                                    padding: '3px 10px',
                                                                    fontSize: 'x-small'
                                                                }}
                                                            >
                                                                {submenu.messages} Mess. - {submenu.conversaciones} Conv.
                                                            </span>
                                                        </>
                                                    ) : null}
                                                </div>
                                            ))}
                                        </div>
                                    )
                                ))}
                                <div className='row'>
                                    <div className='col-9'>
                                        <input type="text" className="form-control buscador" style={{ marginTop: '10px' }} onChange={(event) => handleSearch(event.target.value)} placeholder="Buscar" aria-label="Username" aria-describedby="basic-addon1" />
                                    </div>
                                    <div className='col-3' style={{ padding: '0px', paddingRight: '10px' }}>
                                        <button onClick={() => {
                                            if (!$("#checkCloud").is(':checked')) {
                                                const swalWithReact = withReactContent(Swal);
                                                // Manejar el error aquí
                                                withReactContent(Swal).fire({
                                                    title: "Error",
                                                    text: "Debes tener la opcion cloud marcada",
                                                    icon: "error"
                                                })
                                            } else {
                                                document.getElementById('sidebarMetas')?.classList.toggle('active');
                                                setFiltros(true);
                                            }

                                        }} style={{ width: '100%', marginTop: '11px', height: '38px' }} className='btn btn-sm btn-primary'>Filtros</button>
                                    </div>
                                </div>

                                {opcionesMenu.map((menu) => (
                                    menuSeleccionado === menu.id && (
                                        menu.subMenu.map((menuitem) => (
                                            menuitem.id == subMenuSelecionado && menuitem.subFiltros.length > 0 && (
                                                <div className='col-12' style={{ marginTop: '5px' }}>
                                                    <div className='row flex-nowrap overflow-auto justify-content-center' style={{ paddingLeft: appMovil ? '45px' : '0px', margin: 'auto', width: '100%' }}>
                                                        {menuitem.subFiltros.map((submenu) => (
                                                            <span onClick={(event) => filtroTrabajando(submenu.id)} style={{ cursor: 'pointer', margin: '0px 5px', background: selectFiltro == submenu.id ? '#e1e1e1' : 'white', color: '#333', border: `2px solid ${submenu.borde}`, borderRadius: '20px', padding: '3px 10px', fontSize: '12px', width: 'auto' }}>{submenu.name}:{submenu.contador}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        ))
                                    )
                                ))}
                                {opcionFecha == true && (
                                    <>
                                        <div className='row'>
                                            <div className={`col-${appMovil ? '9' : '8'}`} style={{ marginTop: '5px', paddingRight: '0px' }}>
                                                <div className="form-check" style={{ width: 'fit-content' }}>
                                                    <input className="form-check-input" onChange={(event) => filtroSinLeer(event.target.checked, 1)} type="checkbox" value="" id="checkboxfiltro-1"></input>
                                                    <label className="form-check-label">
                                                        {appMovil == true ? (
                                                            <>Sin Leer</>
                                                        ) : (
                                                            <>Mensajes sin Leer</>
                                                        )}

                                                    </label>
                                                </div>
                                                <div className="form-check" style={{ width: 'fit-content' }}>
                                                    <input className="form-check-input" onChange={(event) => filtroSinResponder(event.target.checked, 1)} type="checkbox" value="" id="checkboxfiltro-2"></input>
                                                    <label className="form-check-label" style={{ textAlign: 'left' }}>
                                                        {appMovil == true ? (
                                                            <>Sin Respuesta</>
                                                        ) : (
                                                            <>Mensajes sin Respuesta</>
                                                        )}

                                                    </label>
                                                </div>
                                            </div>
                                            <div className={`col-${appMovil ? '3' : '4'}`} style={{ marginTop: '5px', textAlign: 'right', paddingTop: '12px', paddingLeft: '0px' }}>
                                                <span style={{ cursor: 'pointer' }} onClick={(event) => filtroFecha()}>
                                                    {seleFecha == 1 ? (
                                                        <>
                                                            <span style={{ marginLeft: '4px' }}>
                                                                {appMovil == true ? (
                                                                    <>Asc.</>
                                                                ) : (
                                                                    <>Ascendente</>
                                                                )}
                                                            </span>
                                                            <i style={{ marginTop: '-4px', color: 'red', transform: 'rotate(90deg)' }} className='bx bx-transfer-alt'></i>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span style={{ marginLeft: '4px' }}>
                                                                {appMovil == true ? (
                                                                    <>Des.</>
                                                                ) : (
                                                                    <>Descendente</>
                                                                )}
                                                            </span>
                                                            <i style={{ marginTop: '-4px', color: '#4eadff', transform: 'rotate(90deg)' }} className='bx bx-transfer-alt'></i>
                                                        </>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                )}
                                <div className="row consulta" id="rowConsulta" style={{
                                    display: 'block', overflow: 'auto', flexGrow: 1,
                                    overflow: 'auto',
                                    paddingTop: '5px',
                                    marginTop: '5px', paddingTop: '5px', marginTop: '5px'
                                }} onScroll={handleScrollFiltro}>
                                    {consultandoTickets ? (
                                        <p style={{ textAlign: 'center', marginTop: '20px' }}><i className='bx bx-loader-circle bx-spin'></i> Consultando...</p>
                                    ) : (
                                        ticketsConsulta.length === 0 ? (
                                            // no hay tickets en cola para el asesor
                                            <p style={{ textAlign: 'center', marginTop: '20px' }}> <i className='bx bx-error'></i> No se encontraron tickets</p>
                                        ) : (
                                            <>
                                                {ticketsConsulta.map((ticket) => (
                                                    ticket != undefined && (
                                                        <div className='col-12' style={{ padding: '0px' }}>
                                                            <div className='row' key={'ticketPendiente-' + ticket.id} onClick={(event) => abrirTicket(ticket)} style={{ cursor: 'pointer', width: '98%', margin: 'auto auto 10px', borderLeft: `2px solid ${ticket.border}`, background: ticket.background, padding: '5px', paddingBottom: '0px' }} key={ticket.id}>
                                                                <div className='col-12' style={{ padding: '0px', borderBottom: `1px solid ${ticket.border}` }}>
                                                                    {ticket.linea}
                                                                </div>
                                                                <div className='col-2' style={{ padding: '0px' }}>
                                                                    <Image
                                                                        src={ticket.image}
                                                                        alt="Logo"
                                                                        className='w-px-40 rounded-circle'
                                                                        width={50}
                                                                        height={50}
                                                                        style={{ marginTop: '9px' }}
                                                                        priority
                                                                    />
                                                                </div>
                                                                <div className='col-10' style={{ padding: '0px' }}>
                                                                    <h6 style={{ marginBottom: '0px', marginTop: '5px' }}>
                                                                        {ticket.nameLabel}
                                                                        {ticket.unreadMessages && ticket.unreadMessages > 0 ? (
                                                                            ticket.mensajesPendientes ? (
                                                                                <span style={{ display: 'inline-block', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#cf8d2b', color: '#282828', textAlign: 'center', lineHeight: '20px', fontSize: '14px', marginLeft: '10px' }}>{ticket.unreadMessages}</span>
                                                                            ) : (
                                                                                <span style={{ display: 'inline-block', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#4ccf2b', color: '#282828', textAlign: 'center', lineHeight: '20px', fontSize: '14px', marginLeft: '10px' }}>{ticket.unreadMessages}</span>
                                                                            )
                                                                        ) : null}
                                                                    </h6>
                                                                    <p style={{ marginBottom: '0px', background: ticket.background2, padding: '0px 10px', fontSize: '14px', marginTop: '4px' }}>
                                                                        <i className={ticket.ackIcon}></i>
                                                                        {ticket.bodyMessage}
                                                                    </p>
                                                                    <span style={{ fontSize: '12px', textAlign: 'right', width: '100%', display: 'block' }}>{ticket.ultimoMessageDate}</span>
                                                                </div>

                                                                <div className={`col-${appMovil ? '12' : '4'}`} style={{ fontSize: 'small', textAlign: 'left', borderTop: `1px solid ${ticket.border}`, padding: '5px 0px' }}>
                                                                    {ticket.marcas > 1 && (
                                                                        <span style={{ height: 'fit-content', background: '#cfc22b', color: '#000', border: '2px solid #cfc22b', borderRadius: '20px', padding: '3px 5px 3px 3px', fontSize: '12px', cursor: 'pointer', marginRight: '5px' }}>
                                                                            <i style={{ marginTop: '-3px' }} className='bx bxs-message-rounded-error'></i>
                                                                            {ticket.marcas} Marcas
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className={`col-${appMovil ? '12' : '8'}`} id={`optionTicketCola-${ticket.id}`} style={{ textAlign: 'right', borderTop: `1px solid ${ticket.border}`, padding: '5px 0px' }}>

                                                                    {ticket.idStatus == 1 ? (
                                                                        <>
                                                                            <span style={{ height: 'fit-content', background: '#4ccf2b', color: '#000', border: '2px solid #4ccf2b', borderRadius: '20px', padding: '3px 5px 3px 3px', fontSize: '12px', cursor: 'pointer', marginRight: '5px' }}>
                                                                                <i style={{ marginTop: '-3px' }} className='bx bx-check-circle'></i>
                                                                                Acceptar
                                                                            </span>
                                                                            <span onClick={(event) => reasignarTicket(ticketAbierto)} style={{ height: 'fit-content', background: '#4eadff', color: '#000', border: '2px solid #4eadff', borderRadius: '20px', padding: '3px 5px 3px 3px', fontSize: '12px', cursor: 'pointer' }}>
                                                                                <i style={{ marginTop: '-3px' }} className='bx bx-transfer'></i>
                                                                                Reasignar
                                                                            </span>
                                                                        </>
                                                                    ) : (
                                                                        <span onClick={(event) => reasignarTicket(ticket)} style={{ background: '#4eadff', color: '#000', border: '2px solid #4eadff', borderRadius: '20px', padding: '3px 5px 3px 3px', fontSize: '12px', cursor: 'pointer' }}>
                                                                            <i style={{ marginTop: '-3px' }} className='bx bx-transfer'></i>
                                                                            Reasignar
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                ))}

                                                {flagMasTickets && (
                                                    <p style={{ textAlign: 'center', marginTop: '-10px' }}><i className='bx bx-loader-circle bx-spin'></i> Cargando más...</p>
                                                )}
                                            </>
                                        )
                                    )}
                                    {ticketsConsultaGeneral.length > 0 && (
                                        ticketsConsultaGeneral.map((ticket) => (
                                            <div className='row' key={'ticketPendiente-' + ticket.id} onClick={(event) => abrirTicket(ticket)} style={{ cursor: 'pointer', width: '98%', margin: 'auto auto 10px', borderLeft: `2px solid ${ticket.border}`, background: ticket.background, padding: '5px', paddingBottom: '0px' }} key={ticket.id}>
                                                <div className='col-12' style={{ padding: '0px', borderBottom: '1px solid #b7b7b7' }}>
                                                    {ticket.linea}
                                                </div>
                                                <div className='col-2' style={{ padding: '0px' }}>
                                                    <Image
                                                        src={ticket.image}
                                                        alt="Logo"
                                                        className='w-px-40 rounded-circle'
                                                        width={50}
                                                        height={50}
                                                        style={{ marginTop: '9px' }}
                                                        priority
                                                    />
                                                </div>
                                                <div className='col-10' style={{ padding: '0px' }}>
                                                    <h6 style={{ marginBottom: '0px', marginTop: '2px' }}>
                                                        {ticket.nameLabel}
                                                        {ticket.unreadMessages && ticket.unreadMessages > 0 ? (
                                                            ticket.mensajesPendientes ? (
                                                                <span style={{ display: 'inline-block', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#cf8d2b', color: '#282828', textAlign: 'center', lineHeight: '20px', fontSize: '14px', marginLeft: '10px' }}>{ticket.unreadMessages}</span>
                                                            ) : (
                                                                <span style={{ display: 'inline-block', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#4ccf2b', color: '#282828', textAlign: 'center', lineHeight: '20px', fontSize: '14px', marginLeft: '10px' }}>{ticket.unreadMessages}</span>
                                                            )
                                                        ) : null}
                                                    </h6>
                                                    <p style={{ marginBottom: '0px', background: ticket.background2, padding: '0px 10px', fontSize: '14px', marginTop: '4px' }}>
                                                        <i className={ticket.ackIcon}></i>
                                                        {ticket.bodyMessage}
                                                    </p>
                                                    <span style={{ fontSize: '12px', textAlign: 'right', width: '100%', display: 'block' }}>{ticket.ultimoMessageDate}</span>
                                                </div>

                                                <div className="col-12" style={{ display: appMovil ? 'none' : 'block', fontSize: 'small', textAlign: 'left', borderTop: `1px solid ${ticket.border}`, padding: '5px 0px' }}>
                                                    ({ticket.status}) Ase: {ticket.asesor}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                        <div className='col-md-8 col-12' style={{ height: '100%', padding: '0px' }}>
                            {ticketAbierto ? (
                                <>
                                    <div style={{ background: 'white', width: '100%', height: '50px', borderBottom: '2px solid #b7b7b7' }}>
                                        <div className='row' style={{ height: '100%', overflow: 'auto', width: '100%', margin: 'auto' }}>
                                            {appMovil && (
                                                <div className='col-1' style={{ padding: '0px', paddingTop: '5px', textAlign: 'right' }}>
                                                    <i className='bx bx-chevron-left' onClick={volverTicket} style={{ fontSize: '40px' }}></i>
                                                </div>
                                            )}

                                            <div className='col-10 col-sm-4' style={{ display: 'flex' }}>
                                                <Image
                                                    src={ticketAbierto.image}
                                                    alt="Logo"
                                                    className='w-px-40 rounded-circle'
                                                    width={50}
                                                    height={50}
                                                    style={{ marginTop: '5px', border: '2px solid #4eadff', background: '#d2d9dc' }}
                                                    priority
                                                />
                                                <span onClick={editarInfoContacto} style={{ cursor: 'pointer', background: '#4eadff', position: 'absolute', fontSize: '8px', padding: '2px 1px', borderRadius: '50%', height: '20px', width: '20px', marginLeft: '-5px', color: '#5a5a5a' }}><i style={{ fontSize: '15px' }} className='bx bxs-pencil'></i></span>
                                                <h7 style={{ marginBottom: '0px', marginLeft: '7px', paddingTop: '6px', height: '47px', overflow: 'auto', lineHeight: '15px', paddingTop: '10px' }}>
                                                    <b>{ticketAbierto.nameLabel}</b>
                                                    <span style={{ fontSize: '12px', width: '100%', display: 'block' }}>{ticketAbierto.numberLabel} <b>({ticketAbierto.linea})</b></span>
                                                </h7>
                                            </div>
                                            <div className='col-1 col-sm-8' style={{ textAlign: 'right', padding: '0px', paddingTop: '10px' }}>
                                                {appMovil ? (
                                                    <>
                                                        <i className='bx bx-dots-vertical-rounded' onClick={handleClick2}>

                                                        </i>
                                                        <Menu
                                                            anchorEl={anchorEl}
                                                            open={Boolean(anchorEl)}
                                                            onClose={handleClose2}
                                                        >
                                                            {ticketAbierto.idStatus == 1 && (
                                                                <>
                                                                    <MenuItem onClick={() => { aceptarTicket(ticketAbierto.id); handleClose(); }}>
                                                                        <i className='bx bx-check-circle' style={{ marginRight: '5px' }}></i>
                                                                        Aceptar
                                                                    </MenuItem>
                                                                    <MenuItem onClick={() => { reasignarTicket(ticketAbierto); handleClose(); }}>
                                                                        <i className='bx bx-transfer' style={{ marginRight: '5px' }}></i>
                                                                        Reasignar
                                                                    </MenuItem>
                                                                    <MenuItem onClick={() => { noInteresadoTicket(ticketAbierto); handleClose(); }}>
                                                                        <i className='bx bx-block' style={{ marginRight: '5px' }}></i>
                                                                        No Interesado
                                                                    </MenuItem>
                                                                </>
                                                            )}
                                                            {ticketAbierto.idStatus == 2 && (
                                                                <>
                                                                    <MenuItem>
                                                                        <div className="form-check form-switch">
                                                                            <input
                                                                                className="form-check-input"
                                                                                onChange={(event) => { banderaTicket(ticketAbierto, 2); handleClose(); }}
                                                                                checked={ticketAbierto.processesid === 2}
                                                                                style={{ cursor: 'pointer' }}
                                                                                type="checkbox"
                                                                                id="flexSwitchCheckDefault"
                                                                            />
                                                                            <label className="form-check-label" htmlFor="flexSwitchCheckDefault">Interesado</label>
                                                                        </div>
                                                                    </MenuItem>
                                                                    <MenuItem>
                                                                        <div className="form-check form-switch">
                                                                            <input
                                                                                className="form-check-input"
                                                                                onChange={(event) => { banderaTicket(ticketAbierto, 3); handleClose(); }}
                                                                                checked={ticketAbierto.processesid === 3}
                                                                                style={{ cursor: 'pointer' }}
                                                                                type="checkbox"
                                                                                id="flexSwitchCheckDefault"
                                                                            />
                                                                            <label className="form-check-label" htmlFor="flexSwitchCheckDefault">Pendiente pago</label>
                                                                        </div>
                                                                    </MenuItem>
                                                                    <MenuItem onClick={() => { pagoTicket(ticketAbierto.id); handleClose(); }}>
                                                                        <i className='bx bx-dollar' style={{ marginRight: '5px' }}></i>
                                                                        Pago
                                                                    </MenuItem>
                                                                    <MenuItem onClick={() => { reasignarTicket(ticketAbierto); handleClose(); }}>
                                                                        <i className='bx bx-transfer' style={{ marginRight: '5px' }}></i>
                                                                        Reasignar
                                                                    </MenuItem>
                                                                    <MenuItem onClick={() => { noInteresadoTicket(ticketAbierto); handleClose(); }}>
                                                                        <i className='bx bx-block' style={{ marginRight: '5px' }}></i>
                                                                        No Interesado
                                                                    </MenuItem>
                                                                </>
                                                            )}
                                                            {ticketAbierto.idStatus == 3 && (
                                                                <>
                                                                    <MenuItem onClick={() => { pedidoSubido(ticketAbierto.id); handleClose(); }}>
                                                                        <i className='bx bx-cart' style={{ marginRight: '5px' }}></i>
                                                                        Pedido Subido
                                                                    </MenuItem>
                                                                    <MenuItem onClick={() => { reasignarTicket(ticketAbierto); handleClose(); }}>
                                                                        <i className='bx bx-transfer' style={{ marginRight: '5px' }}></i>
                                                                        Reasignar
                                                                    </MenuItem>
                                                                </>
                                                            )}
                                                            {ticketAbierto.idStatus == 4 && (
                                                                <>
                                                                    <MenuItem onClick={() => { pedidoDespachado(ticketAbierto.id); handleClose(); }}>
                                                                        <i className='bx bx-cart' style={{ marginRight: '5px' }}></i>
                                                                        Pedido Despachado
                                                                    </MenuItem>
                                                                    <MenuItem onClick={() => { reasignarTicket(ticketAbierto); handleClose(); }}>
                                                                        <i className='bx bx-transfer' style={{ marginRight: '5px' }}></i>
                                                                        Reasignar
                                                                    </MenuItem>
                                                                </>
                                                            )}
                                                            {ticketAbierto.idStatus == 5 && (
                                                                <>
                                                                    <MenuItem onClick={() => { pedidoEntregado(ticketAbierto.id); handleClose(); }}>
                                                                        <i className='bx bx-home-smile' style={{ marginRight: '5px' }}></i>
                                                                        Pedido Entregado
                                                                    </MenuItem>
                                                                    <MenuItem onClick={() => { reasignarTicket(ticketAbierto); handleClose(); }}>
                                                                        <i className='bx bx-transfer' style={{ marginRight: '5px' }}></i>
                                                                        Reasignar
                                                                    </MenuItem>
                                                                </>
                                                            )}
                                                            {ticketAbierto.idStatus == 6 && (
                                                                <>
                                                                    <MenuItem onClick={() => { pagoTicket2(ticketAbierto.id); handleClose(); }}>
                                                                        <i className='bx bx-dollar' style={{ marginRight: '5px' }}></i>
                                                                        Pago Nuevo Pedido
                                                                    </MenuItem>
                                                                    <MenuItem onClick={() => { reasignarTicket(ticketAbierto); handleClose(); }}>
                                                                        <i className='bx bx-transfer' style={{ marginRight: '5px' }}></i>
                                                                        Reasignar
                                                                    </MenuItem>
                                                                </>
                                                            )}
                                                            {ticketAbierto.idStatus == 7 && (
                                                                <>
                                                                    <MenuItem onClick={() => { pagoTicket3(ticketAbierto.id); handleClose(); }}>
                                                                        Enviar a cola
                                                                    </MenuItem>
                                                                    <MenuItem onClick={() => { reasignarTicket(ticketAbierto); handleClose(); }}>
                                                                        <i className='bx bx-transfer' style={{ marginRight: '5px' }}></i>
                                                                        Reasignar
                                                                    </MenuItem>
                                                                </>
                                                            )}
                                                        </Menu>
                                                    </>
                                                ) : (
                                                    ticketAbierto.idStatus == 1 ? (
                                                        <>
                                                            <span onClick={(event) => trabajandoTicket(ticketAbierto.id)} style={{ height: 'fit-content', background: '#cf7e2b', color: '#000', border: '2px solid #cf7e2b', borderRadius: '20px', padding: '3px 5px 3px 3px', fontSize: '12px', cursor: 'pointer', marginRight: '5px' }}>
                                                                Trabajando
                                                            </span>
                                                            <span onClick={(event) => aceptarTicket(ticketAbierto.id)} style={{ height: 'fit-content', background: '#4ccf2b', color: '#000', border: '2px solid #4ccf2b', borderRadius: '20px', padding: '3px 5px 3px 3px', fontSize: '12px', cursor: 'pointer', marginRight: '5px' }}>
                                                                <i style={{ marginTop: '-3px' }} className='bx bx-check-circle'></i>
                                                                Acceptar
                                                            </span>
                                                            <span onClick={(event) => reasignarTicket(ticketAbierto)} style={{ height: 'fit-content', background: '#4eadff', color: '#000', border: '2px solid #4eadff', borderRadius: '20px', padding: '3px 5px 3px 3px', fontSize: '12px', cursor: 'pointer' }}>
                                                                <i style={{ marginTop: '-3px' }} className='bx bx-transfer'></i>
                                                                Reasignar
                                                            </span>
                                                        </>
                                                    ) : ticketAbierto.idStatus == 2 ? (
                                                        <>
                                                            <div style={{ display: 'inline-flex' }}>
                                                                <div className="form-check form-switch">
                                                                    <input className="form-check-input" onChange={(event) => banderaTicket(ticketAbierto, 2)} checked={ticketAbierto.processesid === 2} style={{ cursor: 'pointer' }} type="checkbox" id="flexSwitchCheckDefault"></input>
                                                                    <label className="form-check-label" for="flexSwitchCheckDefault">Interesado</label>
                                                                </div>
                                                                <div className="form-check form-switch" style={{ marginLeft: '10PX' }}>
                                                                    <input className="form-check-input" onChange={(event) => banderaTicket(ticketAbierto, 3)} checked={ticketAbierto.processesid === 3} style={{ cursor: 'pointer' }} type="checkbox" id="flexSwitchCheckDefault"></input>
                                                                    <label className="form-check-label" for="flexSwitchCheckDefault" style={{ fontSize: 'small' }}>Pendiente pago</label>
                                                                </div>
                                                                <span onClick={(event) => pagoTicket(ticketAbierto.id)} style={{ height: 'fit-content', background: '#4ccf2b', color: '#000', border: '2px solid #4ccf2b', borderRadius: '20px', padding: '3px 5px 3px 3px', fontSize: '12px', cursor: 'pointer', marginRight: '5px', marginLeft: '5px' }}>
                                                                    <i style={{ marginTop: '-1px' }} className='bx bx-dollar'></i>
                                                                    Pago
                                                                </span>
                                                                <span onClick={(event) => reasignarTicket(ticketAbierto)} style={{ height: 'fit-content', background: '#4eadff', color: '#000', border: '2px solid #4eadff', borderRadius: '20px', padding: '3px 5px 3px 3px', fontSize: '12px', cursor: 'pointer', marginRight: '5px', marginLeft: '5px' }}>
                                                                    <i style={{ marginTop: '-1px' }} className='bx bx-transfer'></i>
                                                                    Reasignar
                                                                </span>
                                                                <span onClick={(event) => noInteresadoTicket(ticketAbierto)} style={{ height: 'fit-content', background: '#ff4e4e', color: '#000', border: '2px solid #ff4e4e', borderRadius: '20px', padding: '3px 5px 3px 3px', fontSize: '12px', cursor: 'pointer' }}>
                                                                    <i style={{ marginTop: '-1px' }} className='bx bx-block'></i>
                                                                    No Interesado
                                                                </span>
                                                            </div>
                                                        </>
                                                    ) : ticketAbierto.idStatus == 3 ? (
                                                        <>
                                                            <span onClick={(event) => trabajandoTicket(ticketAbierto.id)} style={{ height: 'fit-content', background: '#cf7e2b', color: '#000', border: '2px solid #cf7e2b', borderRadius: '20px', padding: '3px 5px 3px 3px', fontSize: '12px', cursor: 'pointer', marginRight: '5px' }}>
                                                                Trabajando
                                                            </span>
                                                            <div style={{ display: 'inline-flex' }}>
                                                                <span onClick={(event) => pedidoSubido(ticketAbierto.id)} style={{ height: 'fit-content', background: '#4ccf2b', color: '#000', border: '2px solid #4ccf2b', borderRadius: '20px', padding: '3px 5px 3px 3px', fontSize: '12px', cursor: 'pointer', marginRight: '5px', marginLeft: '5px' }}>
                                                                    <i style={{ marginTop: '-1px' }} className='bx bx-cart'></i>
                                                                    Pedido Subido
                                                                </span>
                                                                <span onClick={(event) => reasignarTicket(ticketAbierto)} style={{ height: 'fit-content', background: '#4eadff', color: '#000', border: '2px solid #4eadff', borderRadius: '20px', padding: '3px 5px 3px 3px', fontSize: '12px', cursor: 'pointer', marginRight: '5px', marginLeft: '5px' }}>
                                                                    <i style={{ marginTop: '-1px' }} className='bx bx-transfer'></i>
                                                                    Reasignar
                                                                </span>
                                                            </div>
                                                        </>
                                                    ) : ticketAbierto.idStatus == 4 ? (
                                                        <>
                                                            <div style={{ display: 'inline-flex' }}>
                                                                <span onClick={(event) => pedidoDespachado(ticketAbierto.id)} style={{ height: 'fit-content', background: '#4ccf2b', color: '#000', border: '2px solid #4ccf2b', borderRadius: '20px', padding: '3px 5px 3px 3px', fontSize: '12px', cursor: 'pointer', marginRight: '5px', marginLeft: '5px' }}>
                                                                    <i style={{ marginTop: '-1px' }} className='bx bx-cart'></i>
                                                                    Pedido Despachado
                                                                </span>
                                                                <span onClick={(event) => reasignarTicket(ticketAbierto)} style={{ height: 'fit-content', background: '#4eadff', color: '#000', border: '2px solid #4eadff', borderRadius: '20px', padding: '3px 5px 3px 3px', fontSize: '12px', cursor: 'pointer', marginRight: '5px', marginLeft: '5px' }}>
                                                                    <i style={{ marginTop: '-1px' }} className='bx bx-transfer'></i>
                                                                    Reasignar
                                                                </span>
                                                            </div>
                                                        </>
                                                    ) : ticketAbierto.idStatus == 5 ? (
                                                        <>
                                                            <div style={{ display: 'inline-flex' }}>
                                                                <span onClick={(event) => pedidoEntregado(ticketAbierto.id)} style={{ height: 'fit-content', background: '#4ccf2b', color: '#000', border: '2px solid #4ccf2b', borderRadius: '20px', padding: '3px 5px 3px 3px', fontSize: '12px', cursor: 'pointer', marginRight: '5px', marginLeft: '5px' }}>
                                                                    <i style={{ marginTop: '-1px' }} className='bx bx-home-smile'></i>
                                                                    Pedido Entregado
                                                                </span>
                                                                <span onClick={(event) => reasignarTicket(ticketAbierto)} style={{ height: 'fit-content', background: '#4eadff', color: '#000', border: '2px solid #4eadff', borderRadius: '20px', padding: '3px 5px 3px 3px', fontSize: '12px', cursor: 'pointer', marginRight: '5px', marginLeft: '5px' }}>
                                                                    <i style={{ marginTop: '-1px' }} className='bx bx-transfer'></i>
                                                                    Reasignar
                                                                </span>
                                                            </div>
                                                        </>
                                                    ) : ticketAbierto.idStatus == 6 ? (
                                                        <>
                                                            <div style={{ display: 'inline-flex' }}>
                                                                <span onClick={(event) => pagoTicket(ticketAbierto.id)} style={{ height: 'fit-content', background: '#4ccf2b', color: '#000', border: '2px solid #4ccf2b', borderRadius: '20px', padding: '3px 5px 3px 3px', fontSize: '12px', cursor: 'pointer', marginRight: '5px', marginLeft: '5px' }}>
                                                                    <i style={{ marginTop: '-1px' }} className='bx bx-dollar'></i>
                                                                    Pago Nuevo Pedido
                                                                </span>
                                                                <span onClick={(event) => reasignarTicket(ticketAbierto)} style={{ height: 'fit-content', background: '#4eadff', color: '#000', border: '2px solid #4eadff', borderRadius: '20px', padding: '3px 5px 3px 3px', fontSize: '12px', cursor: 'pointer', marginRight: '5px', marginLeft: '5px' }}>
                                                                    <i style={{ marginTop: '-1px' }} className='bx bx-transfer'></i>
                                                                    Reasignar
                                                                </span>
                                                            </div>
                                                        </>
                                                    ) : ticketAbierto.idStatus == 7 ? (
                                                        <>
                                                            <div style={{ display: 'inline-flex' }}>
                                                                <span onClick={(event) => trabajandoTicket(ticketAbierto.id)} style={{ height: 'fit-content', background: '#cf7e2b', color: '#000', border: '2px solid #cf7e2b', borderRadius: '20px', padding: '3px 5px 3px 3px', fontSize: '12px', cursor: 'pointer', marginRight: '5px' }}>
                                                                    Trabajando
                                                                </span>
                                                                <span onClick={(event) => reasignarTicket(ticketAbierto)} style={{ height: 'fit-content', background: '#4eadff', color: '#000', border: '2px solid #4eadff', borderRadius: '20px', padding: '3px 5px 3px 3px', fontSize: '12px', cursor: 'pointer', marginRight: '5px', marginLeft: '5px' }}>
                                                                    <i style={{ marginTop: '-1px' }} className='bx bx-transfer'></i>
                                                                    Reasignar
                                                                </span>
                                                            </div>
                                                        </>
                                                    ) : (null)
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ height: divStyleHeight }}>
                                        {cargandoMensajes && (
                                            <p style={{ textAlign: 'center', marginTop: '20px' }}><i className='bx bx-loader-circle bx-spin'></i> Cargando Mensajes...</p>
                                        )}
                                        <div ref={messagesRef} onScroll={handleScroll} style={{ minHeight: '100%' }} className="chat-container">
                                            <ul className="chat" >
                                                {contenidosMessagesChat}
                                            </ul>
                                        </div>
                                        <div className='row' style={{ display: chatActivo ? 'contents' : 'none', position: 'relative', background: '#e6e6e6', width: '100%', margin: 'auto', height: '150px', overflowY: 'auto', overflowX: 'hidden' }}>
                                            {ticketAbierto && ticketAbierto.unreadMessages > 0 && (
                                                <>
                                                    <span onClick={marcarComoLeido} className='spanMarcadoSinLeer' style={{
                                                        marginTop: '-30px',
                                                        position: 'absolute',
                                                        background: '#e6e6e600',
                                                        width: 'auto',
                                                        marginLeft: '5px',
                                                        border: '1px solid',
                                                        cursor: 'pointer',
                                                        zIndex: 10
                                                    }}>
                                                        Marcar como Leído
                                                    </span>
                                                </>
                                            )}

                                            <div className='col-12' style={{ paddingTop: '3px', paddingRight: '3px', paddingLeft: '3px', background: '#e6e6e6' }}>
                                                <div style={{ textAlign: 'left', marginTop: '0px', background: '#d3d3d3', height: '113px', position: 'absolute', width: '100%', overflow: 'hidden', zIndex: '10', padding: '10px 5px', display: showDropdown ? 'block' : 'none' }}>
                                                    <div style={{ borderBottom: '1px solid #a7a7a7' }}><span onClick={cerrarAtajos} style={{ fontWeight: 'bold', background: '#a7a7a7', padding: '3px 10px', cursor: 'pointer' }}>Cerrar</span></div>
                                                    <ul className="list-group" style={{ height: '69px', overflow: 'auto' }}>
                                                        {respuestasRapidas && respuestasRapidas.map((dato2) => (
                                                            <li onClick={() => atajoClick(dato2)} style={{ borderBottom: '1px solid #a9a9a9', cursor: 'pointer', padding: '7px 0px' }}>
                                                                <span style={{ color: 'black', fontWeight: 'bold' }}>{dato2.title}:</span>
                                                                <span style={{ marginLeft: '5px' }}>{dato2.text}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                {appMovil ? (
                                                    <div className='row'>
                                                        <div className='col-11'>
                                                            <EmojiOneArea onEmojiSelect={function (text: string): void {
                                                                throw new Error('Function not implemented.');
                                                            }} />
                                                        </div>
                                                        <div className='col-1' style={{ padding: '0px', textAlign: 'center' }} onClick={enviarMensajeTexto}>
                                                            <i
                                                                style={{ fontSize: '22px', marginTop: '45px', color: '#222d32', marginLeft: '-20px' }}
                                                                className='bx bx-send' // Detener grabación al hacer clic en el icono de eliminar

                                                            ></i>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {ticketAbierto.cloud == 1 && ticketAbierto.ventana == 0 && (
                                                            <>
                                                                <div className='row'>
                                                                    <div className='col-12' style={{ textAlign: 'center' }}>
                                                                        <textarea className='form-control' id="texarePlantilla" rows={3} disabled style={{ background: 'white', width: '100%' }}></textarea>
                                                                    </div>

                                                                    <div style={{ textAlign: 'left', marginTop: '-12px', background: '#d3d3d3', height: '100px', position: 'absolute', width: '100%', overflow: 'hidden', zIndex: '10', padding: '10px 15px', marginLeft: '0%', display: showDropdown2 ? 'block' : 'none' }}>
                                                                        <div style={{ borderBottom: '1px solid #a7a7a7' }}><span onClick={cerrarPlantillas} style={{ fontWeight: 'bold', background: '#a7a7a7', padding: '3px 10px', cursor: 'pointer' }}>Cerrar</span></div>
                                                                        <ul className="list-group" style={{ height: '69px', overflow: 'auto' }}>

                                                                        </ul>
                                                                    </div>
                                                                    <div className='col-11' style={{ textAlign: 'center', marginTop: '0px', marginTop: '7px' }}>
                                                                        <i onClick={abrirPlantillas} className='bx bxs-zap'></i> <input style={{ width: '94%', background: 'white', paddingLeft: '10px' }} className='inputSolo' onChange={handleChangePlantillas} value={inputValuePlantillas} placeholder='Plantillas...'></input>

                                                                    </div>
                                                                    <div className='col-1' style={{ padding: '0px', textAlign: 'center', borderLeft: '1px solid', marginTop: '2px', cursor: 'pointer' }} onClick={enviarMensajePlantilla}>
                                                                        <i
                                                                            style={{ fontSize: '22px', marginTop: '4px', color: '#222d32', marginLeft: '-20px' }}
                                                                            className='bx bx-send' // Detener grabación al hacer clic en el icono de eliminar

                                                                        ></i>
                                                                    </div>
                                                                    <div className='col-12'>
                                                                        <p style={{ textAlign: 'center', fontSize: 'x-small', marginBottom: '0px', fontWeight: 'bold', marginTop: '7px' }}>
                                                                            Para enviarle un mensaje a este contacto debe ser por una plantilla. una vez el contacto responsa podras enviar todo tipo de mensajes con normalidad
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                        <EmojiOneArea onEmojiSelect={function (text: string): void {
                                                            throw new Error('Function not implemented.');
                                                        }} />
                                                    </>
                                                )}

                                                <div className='limitesCloud' style={{ textAlign: 'right', marginTop: '3px' }}>
                                                    <div className='row'>
                                                        {(recording || audioChunks.length > 0) && (
                                                            <div className='col-12 col-sm-2' style={{ display: 'flex' }}>
                                                                {recording && (
                                                                    <>
                                                                        <i
                                                                            style={{ marginRight: '2px', fontSize: '22px', marginTop: '3px', color: 'red', borderRight: '4px solid #dddddd', marginBottom: '6px' }}
                                                                            className='bx bxs-trash' // Detener grabación al hacer clic en el icono de eliminar
                                                                            onClick={cancelarAudio}
                                                                        ></i>
                                                                    </>
                                                                )}

                                                                <div id="canvas-container" style={{ display: recording ? 'block' : 'none', width: '50%', maxWidth: '50%', height: '20px' }}></div>

                                                                {recording && (
                                                                    <>
                                                                        {startTime && <TimerComponent startTime={startTime} />} {/* Mostrar TimerComponent solo si startTime está definido */}
                                                                        <i
                                                                            onClick={enviarAudio}
                                                                            style={{ marginLeft: '2px', fontSize: '22px', marginTop: '3px', color: '#4eadff', marginBottom: '6px' }}
                                                                            className='bx bxs-send'
                                                                        ></i>
                                                                    </>
                                                                )}
                                                                {audioChunks.length > 0 && (
                                                                    <>
                                                                        {audioURL && <audio style={{ maxWidth: '100%', height: '25px', marginTop: '2px' }} controls src={audioURL}></audio>}
                                                                        <i
                                                                            onClick={enviarAudio}
                                                                            style={{ marginLeft: '2px', fontSize: '22px', marginTop: '2px', color: '#a5acb4', marginBottom: '6px', height: '19px', borderLeft: '3px solid #a5acb4' }}
                                                                            className='bx bxs-send'
                                                                        ></i>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                        <div className='col'>
                                                            {!recording && (

                                                                appMovil ? (
                                                                    <>
                                                                        <span style={{ cursor: 'pointer', background: 'rgb(209, 209, 209)', padding: '1px 1px 1px 2px', marginTop: '0px', marginBottom: '4px', display: 'inline-block', width: 'fit-content' }}>
                                                                            <i onClick={abrirAtajos} className='bx bxs-zap'></i> <input style={{ width: '100px', background: 'white', paddingLeft: '10px' }} className='inputSolo' onChange={handleChangeAtajos} value={inputValueAtajo} placeholder='Atajo...'></input>
                                                                        </span>
                                                                        <span onClick={enviarArchivoOpen} style={{ cursor: 'pointer', background: 'rgb(209, 209, 209)', padding: '1px 10px', marginTop: '0px', marginBottom: '4px', display: 'inline-block', width: 'fit-content', marginLeft: '4px' }}>
                                                                            <i style={{ transform: 'rotate(120deg)' }} className='bx bx-paperclip'></i>
                                                                        </span>
                                                                        <span onClick={galeriaOpen} style={{ cursor: 'pointer', background: 'rgb(209, 209, 209)', padding: '1px 10px', marginTop: '0px', marginBottom: '4px', display: 'inline-block', width: 'fit-content', marginLeft: '4px' }}>
                                                                            <i className='bx bx-images'></i>
                                                                        </span>
                                                                        <span onClick={startRecording} style={{ cursor: 'pointer', background: 'rgb(209, 209, 209)', padding: '1px 10px', marginTop: '0px', marginBottom: '4px', display: 'inline-block', width: 'fit-content', marginLeft: '4px' }}>
                                                                            <i className='bx bx-microphone'></i>
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <span style={{ background: colorMessageVentana, padding: '1px 5px 1px 5px', marginTop: '0px', marginBottom: '4px', display: 'inline-block', width: 'fit-content', animation: `titilar ${velocidadTitileo}s infinite`, borderRadius: '20px' }}>
                                                                            <i className='bx bx-time' style={{ marginRight: '-2px', marginBottom: '3px' }}></i> {messageVentana}
                                                                        </span>
                                                                        <span style={{ cursor: 'pointer', background: 'rgb(209, 209, 209)', padding: '1px 1px 1px 2px', marginTop: '0px', marginBottom: '4px', display: 'inline-block', width: 'fit-content', marginLeft: '4px' }}>
                                                                            <i onClick={abrirAtajos} className='bx bxs-zap'></i> <input style={{ width: '200px', background: 'white', paddingLeft: '10px' }} className='inputSolo' onChange={handleChangeAtajos} value={inputValueAtajo} placeholder='Atajo...'></input>
                                                                        </span>
                                                                        <span onClick={enviarArchivoOpen} style={{ cursor: 'pointer', background: 'rgb(209, 209, 209)', padding: '1px 10px', marginTop: '0px', marginBottom: '4px', display: 'inline-block', width: 'fit-content', marginLeft: '4px' }}>
                                                                            <i style={{ transform: 'rotate(120deg)' }} className='bx bx-paperclip'></i> Archivos
                                                                        </span>
                                                                        <span onClick={galeriaOpen} style={{ cursor: 'pointer', background: 'rgb(209, 209, 209)', padding: '1px 10px', marginTop: '0px', marginBottom: '4px', display: 'inline-block', width: 'fit-content', marginLeft: '4px' }}>
                                                                            <i className='bx bx-images'></i> Galeria
                                                                        </span>
                                                                        <span onClick={startRecording} style={{ cursor: 'pointer', background: 'rgb(209, 209, 209)', padding: '1px 10px', marginTop: '0px', marginBottom: '4px', display: 'inline-block', width: 'fit-content', marginLeft: '4px' }}>
                                                                            <i className='bx bx-microphone'></i> Audio
                                                                        </span>
                                                                        <span onClick={enviarMensajeTexto} style={{ cursor: 'pointer', background: 'rgb(209, 209, 209)', padding: '1px 10px', marginTop: '0px', marginBottom: '4px', display: 'inline-block', width: 'fit-content', marginLeft: '4px' }}>
                                                                            <i

                                                                                className='bx bx-send' // Detener grabación al hacer clic en el icono de eliminar

                                                                            ></i> Enviar
                                                                        </span>
                                                                    </>
                                                                )

                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <span></span>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            <div style={{ display: openMultimedia ? 'flex' : 'none', background: 'white', position: 'absolute', left: appMovil ? '20px' : 'calc(100% - 400px)', top: '0px', zIndex: '10000', height: '100%', width: appMovil ? 'calc(100vw - 20px)' : '400px', boxShadow: '0 0 0.375rem 0.25rem rgba(161, 172, 184, 0.15)' }}>
                <a onClick={cerrarAtajos} style={{ zIndex: '10', cursor: 'pointer', background: '#222d32', width: '46px', height: '46px', marginLeft: '-20px', marginTop: '25px', color: 'white', borderRadius: '50%', border: '8px solid white' }}>
                    <i style={{ fontSize: '31px', marginLeft: '-1px' }} className="bx bx-chevron-right"></i>
                </a>
                <div style={{ width: '100%', zIndex: '9', position: 'absolute', height: '100%', overflowY: 'auto', overflowX: 'hidden', paddingTop: '10px' }}>
                    <div className='row' style={{ width: '100%', margin: 'auto' }}>
                        {plantillas && plantillas.map((dato2) => (
                            <div className="col-6 divMultimedia" id={dato2.title} style={{ paddingTop: '10px', marginBottom: '10px', height: 'fit-content' }}>
                                <div style={{ height: '80%', width: '80%', margin: 'auto', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                    <div className="card card-block card-1" >
                                        {dato2.imagen != "" ? (
                                            <>
                                                <img
                                                    src={dato2.imagen}
                                                    style={{ maxHeight: '122px', margin: 'auto', borderRadius: '8px', maxWidth: '100%' }}
                                                >
                                                </img>
                                            </>
                                        ) : (
                                            <div>Sin Imagen</div>
                                        )}
                                    </div>
                                </div>
                                <div className="row" style={{ width: '100%', margin: 'auto', marginTop: '4px' }}>
                                    <div className="col-sm-12" style={{ color: '#222d32', textAlign: 'center', padding: '0px', cursor: 'pointer' }} onClick={() => detallModalPlantillas(dato2)}>
                                        {dato2.title} <i style={{ marginTop: '-2px', cursor: 'pointer', borderLeft: '2px solid #222d32', marginLeft: '4px', paddingLeft: '5px' }} className='bx bx-search-alt'></i>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div style={{ display: openGaleria ? 'flex' : 'none', background: 'white', position: 'absolute', left: appMovil ? '20px' : 'calc(100% - 400px)', top: '0px', zIndex: '10000', height: '100%', width: appMovil ? 'calc(100vw - 20px)' : '400px', boxShadow: '0 0 0.375rem 0.25rem rgba(161, 172, 184, 0.15)' }}>
                <a onClick={galeriaClose} style={{ zIndex: '10', cursor: 'pointer', background: '#222d32', width: '46px', height: '46px', marginLeft: '-20px', marginTop: '25px', color: 'white', borderRadius: '50%', border: '8px solid white' }}>
                    <i style={{ fontSize: '31px', marginLeft: '-1px' }} className="bx bx-chevron-right"></i>
                </a>
                <div style={{ width: '100%', zIndex: '9', position: 'absolute', height: '100%', overflowY: 'auto', overflowX: 'hidden', paddingTop: '10px' }}>
                    <div className='row' style={{ width: '100%', margin: 'auto' }}>
                        <div className='col-12' style={{ marginBottom: '25px' }}>
                            <input onChange={handleBusquedaMultimedia} style={{ width: '90%', margin: 'auto' }} className="form-control" placeholder="Buscar" aria-label="Username" aria-describedby="basic-addon1" type="text">
                            </input>
                        </div>
                        <div className="col-12">
                            {banderaConsultandoMultimedia ? (
                                <div className='row' style={{ marginTop: '20px', maxHeight: '79vh', overflow: 'auto' }}>
                                    {divdetallMultimedia.length == 0 ? (
                                        <div style={{ textAlign: 'center' }}>No se encontraron registros.</div>
                                    ) : (
                                        <>
                                            {divdetallMultimedia.map((dato3) => (
                                                <div className="col-6 divMultimedia" id={dato3.title} style={{ paddingTop: '10px', marginBottom: '10px' }}>
                                                    <div style={{ height: '80%', width: '80%', margin: 'auto', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                                        <div className="card card-block card-1" >
                                                            {dato3.typeId == 1 ? (
                                                                <>
                                                                    <img
                                                                        src={process.env.ENDPOINT_API + '/static/' + dato3.mediaUrl}
                                                                        style={{ maxHeight: '122px', margin: 'auto', borderRadius: '8px', maxWidth: '100%' }}
                                                                    >
                                                                    </img>
                                                                </>
                                                            ) : dato3.typeId == 2 ? (
                                                                <>
                                                                    <video
                                                                        id={`video-${dato3.id}`}
                                                                        onMouseOver={() => handleMouseOver(dato3.id)}
                                                                        onMouseOut={() => onMouseOut(dato3.id)}
                                                                        style={{ maxHeight: '122px', margin: 'auto', borderRadius: '8px', maxWidth: '100%' }}
                                                                    >
                                                                        <source src={process.env.ENDPOINT_API + '/static/' + dato3.mediaUrl} type="video/mp4" />
                                                                    </video>
                                                                </>
                                                            ) : dato3.typeId == 3 ? (
                                                                <>
                                                                    <img style={{ borderRadius: '8px' }} onMouseOver={() => handleMouseOverAudio(dato3.id)} onMouseOut={() => onMouseOutAudio(dato3.id)} src={process.env.ENDPOINT_API + '/static/multimedia/gifAudio.gif'} alt="Imagen" />
                                                                    <audio id={`audio-${dato3.id}`} style={{ maxWidth: '100%', display: 'none', height: '25px', marginTop: '2px' }} controls src={process.env.ENDPOINT_API + '/static/' + dato3.mediaUrl}></audio>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <img style={{ maxHeight: '122px', margin: 'auto', borderRadius: '8px', maxWidth: '100%', background: 'white', padding: '10px' }} src={process.env.ENDPOINT_API + '/static/multimedia/gifDocumento.gif'} alt="Imagen" />
                                                                </>
                                                            )}

                                                        </div>
                                                    </div>
                                                    <div className="row" style={{ width: '100%', margin: 'auto', marginTop: '4px' }}>
                                                        <div className="col-sm-12" style={{ color: '#222d32', textAlign: 'center', padding: '0px', cursor: 'pointer' }} onClick={() => detallModalMultimedia(dato3.id)}>
                                                            {dato3.title} <i style={{ marginTop: '-2px', cursor: 'pointer', borderLeft: '2px solid #222d32', marginLeft: '4px', paddingLeft: '5px' }} className='bx bx-search-alt'></i>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {banderaverTodoMultimedia ? (
                                        <>
                                            <div className='row'>
                                                <div className='col-12'>
                                                    <p style={{ color: '#222d32', fontWeight: '800', textAlign: 'center' }}>{categoriasMultimediaDetall.name}</p>
                                                </div>
                                                <div className='col-12' style={{ marginTop: '-45px', textAlign: 'right' }}>
                                                    <i className="bx bx-x-circle" onClick={closeDetalleMultimedia} style={{ cursor: 'pointer' }} ></i>
                                                </div>
                                                <div className='col-3' style={{ paddingRight: '0px' }}>
                                                    <span onClick={() => cambiarTipoDetallMultimedia(1)} style={{ fontSize: 'small', width: '100%', display: 'ruby-text', background: '#f1f1f1', padding: '5px 7px', paddingBottom: '3px', borderRadius: '4px', cursor: 'pointer' }}>Imagenes</span>
                                                </div>
                                                <div className='col-3' style={{ paddingRight: '0px' }}>
                                                    <span onClick={() => cambiarTipoDetallMultimedia(2)} style={{ fontSize: 'small', width: '100%', display: 'ruby-text', background: '#f1f1f1', padding: '5px 7px', paddingBottom: '3px', borderRadius: '4px', cursor: 'pointer' }}>Videos</span>
                                                </div>
                                                <div className='col-3' style={{ paddingRight: '0px' }}>
                                                    <span onClick={() => cambiarTipoDetallMultimedia(3)} style={{ fontSize: 'small', width: '100%', display: 'ruby-text', background: '#f1f1f1', padding: '5px 7px', paddingBottom: '3px', borderRadius: '4px', cursor: 'pointer' }}>Audios</span>
                                                </div>
                                                <div className='col-3'>
                                                    <span onClick={() => cambiarTipoDetallMultimedia(4)} style={{ fontSize: 'small', width: '100%', display: 'ruby-text', background: '#f1f1f1', padding: '5px 7px', paddingBottom: '3px', borderRadius: '4px', cursor: 'pointer' }}>Archivos</span>
                                                </div>
                                                <div className='row' style={{ marginTop: '20px', maxHeight: '79vh', overflow: 'auto' }}>
                                                    {divdetallMultimedia.map((dato3) => (
                                                        <div className="col-6 divMultimedia" id={dato3.title} style={{ paddingTop: '10px', marginBottom: '10px' }}>
                                                            <div style={{ height: '80%', width: '80%', margin: 'auto', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                                                <div className="card card-block card-1" >
                                                                    {dato3.typeId == 1 ? (
                                                                        <>
                                                                            <img
                                                                                src={process.env.ENDPOINT_API + '/static/' + dato3.mediaUrl}
                                                                                style={{ maxHeight: '122px', margin: 'auto', borderRadius: '8px', maxWidth: '100%' }}
                                                                            >
                                                                            </img>
                                                                        </>
                                                                    ) : dato3.typeId == 2 ? (
                                                                        <>
                                                                            <video
                                                                                id={`video-${dato3.id}`}
                                                                                onMouseOver={() => handleMouseOver(dato3.id)}
                                                                                onMouseOut={() => onMouseOut(dato3.id)}
                                                                                style={{ maxHeight: '122px', margin: 'auto', borderRadius: '8px', maxWidth: '100%' }}
                                                                            >
                                                                                <source src={process.env.ENDPOINT_API + '/static/' + dato3.mediaUrl} type="video/mp4" />
                                                                            </video>
                                                                        </>
                                                                    ) : dato3.typeId == 3 ? (
                                                                        <>
                                                                            <img style={{ borderRadius: '8px' }} onMouseOver={() => handleMouseOverAudio(dato3.id)} onMouseOut={() => onMouseOutAudio(dato3.id)} src={process.env.ENDPOINT_API + '/static/multimedia/gifAudio.gif'} alt="Imagen" />
                                                                            <audio id={`audio-${dato3.id}`} style={{ maxWidth: '100%', display: 'none', height: '25px', marginTop: '2px' }} controls src={process.env.ENDPOINT_API + '/static/' + dato3.mediaUrl}></audio>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <img style={{ maxHeight: '122px', margin: 'auto', borderRadius: '8px', maxWidth: '100%', background: 'white', padding: '10px' }} src={process.env.ENDPOINT_API + '/static/multimedia/gifDocumento.gif'} alt="Imagen" />
                                                                        </>
                                                                    )}

                                                                </div>
                                                            </div>
                                                            <div className="row" style={{ width: '100%', margin: 'auto', marginTop: '4px' }}>
                                                                <div className="col-sm-12" style={{ color: '#222d32', textAlign: 'center', padding: '0px', cursor: 'pointer' }} onClick={() => detallModalMultimedia(dato3.id)}>
                                                                    {dato3.title} <i style={{ marginTop: '-2px', cursor: 'pointer', borderLeft: '2px solid #222d32', marginLeft: '4px', paddingLeft: '5px' }} className='bx bx-search-alt'></i>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {categoriasMultimedia && categoriasMultimedia.length > 0 ? (
                                                categoriasMultimedia.map((dato2) => (
                                                    <>
                                                        <div className='row' key={'categoria' + dato2.id}>
                                                            {dato2.multimediaCont.length > 6 ? (
                                                                <>
                                                                    <div className='col-6 col-sm-9'>
                                                                        <p style={{ color: '#222d32', fontWeight: '800' }}>{dato2.name}:</p>
                                                                    </div>
                                                                    <div className='col-6 col-sm-3' style={{ paddingLeft: '0px', textAlign: 'right' }}>
                                                                        <span onClick={() => verTodoMultimedia(dato2)} style={{ background: '#f1f1f1', padding: '3px 7px', borderRadius: '4px', cursor: 'pointer' }}>Ver todo</span>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <div className='col-12'>
                                                                        <p style={{ color: '#222d32', fontWeight: '800' }}>{dato2.name}:</p>
                                                                    </div>
                                                                </>
                                                            )}

                                                        </div>
                                                        <div className='row'>
                                                            {dato2.multimedia.length > 0 ? (
                                                                <React.Fragment>
                                                                    {dato2.multimedia.length > 2 ? (
                                                                        <>
                                                                            <div className='col-1' style={{ padding: '0px', textAlign: 'right' }}>
                                                                                <button style={{ height: '130px', zIndex: '1' }} onClick={() => handlePrevClick(dato2.id)}>
                                                                                    <span style={{ background: '#ffffff70', border: '2px solid', height: '20px', width: '20px', display: 'block', borderRadius: '50%', marginLeft: '-10px' }}>
                                                                                        <i style={{ marginTop: '-6px' }} className='bx bx-chevron-left'></i>
                                                                                    </span>
                                                                                </button>
                                                                            </div>
                                                                            <div className='col-10' style={{ padding: '0px', marginTop: '-15px' }}>
                                                                                <div id={`multimedia-${dato2.id}`} className="scrolling-wrapper row flex-row flex-nowrap">
                                                                                    {dato2.multimedia.map((dato3) => (
                                                                                        <div className="col-5 priDiv" key={'categori3a' + dato3.id} style={{ paddingTop: '10px' }}>
                                                                                            <div style={{ height: '80%', width: '80%', margin: 'auto', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                                                                                <div className="card card-block card-1" >
                                                                                                    {dato3.typeId == 1 ? (
                                                                                                        <>
                                                                                                            <img
                                                                                                                src={process.env.ENDPOINT_API + '/static/' + dato3.mediaUrl}
                                                                                                                style={{ maxHeight: '122px', margin: 'auto', borderRadius: '8px', maxWidth: '100%' }}
                                                                                                            >
                                                                                                            </img>
                                                                                                        </>
                                                                                                    ) : dato3.typeId == 2 ? (
                                                                                                        <>
                                                                                                            <video
                                                                                                                id={`video-${dato3.id}`}
                                                                                                                onMouseOver={() => handleMouseOver(dato3.id)}
                                                                                                                onMouseOut={() => onMouseOut(dato3.id)}
                                                                                                                style={{ maxHeight: '122px', margin: 'auto', borderRadius: '8px', maxWidth: '100%' }}
                                                                                                            >
                                                                                                                <source src={process.env.ENDPOINT_API + '/static/' + dato3.mediaUrl} type="video/mp4" />
                                                                                                            </video>
                                                                                                        </>
                                                                                                    ) : dato3.typeId == 3 ? (
                                                                                                        <>
                                                                                                            <img style={{ borderRadius: '8px' }} onMouseOver={() => handleMouseOverAudio(dato3.id)} onMouseOut={() => onMouseOutAudio(dato3.id)} src={process.env.ENDPOINT_API + '/static/multimedia/gifAudio.gif'} alt="Imagen" />
                                                                                                            <audio id={`audio-${dato3.id}`} style={{ maxWidth: '100%', display: 'none', height: '25px', marginTop: '2px' }} controls src={process.env.ENDPOINT_API + '/static/' + dato3.mediaUrl}></audio>
                                                                                                        </>
                                                                                                    ) : (
                                                                                                        <>
                                                                                                            <img style={{ maxHeight: '122px', margin: 'auto', borderRadius: '8px', maxWidth: '100%', background: 'white', padding: '10px' }} src={process.env.ENDPOINT_API + '/static/multimedia/gifDocumento.gif'} alt="Imagen" />
                                                                                                        </>
                                                                                                    )}

                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="row" style={{ width: '100%', margin: 'auto', marginTop: '4px' }}>
                                                                                                <div className="col-sm-12" style={{ cursor: 'pointer', color: '#222d32', textAlign: 'center', padding: '0px' }} onClick={() => detallModalMultimedia(dato3.id)}>
                                                                                                    {dato3.title} <i style={{ marginTop: '-2px', cursor: 'pointer', borderLeft: '2px solid #222d32', marginLeft: '4px', paddingLeft: '5px' }} className='bx bx-search-alt'></i>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                            <div className='col-1' style={{ padding: '0px', textAlign: 'left', paddingLeft: '10px' }}>
                                                                                <button style={{ height: '130px', zIndex: '1' }} onClick={() => handleNextClick(dato2.id)}>
                                                                                    <span style={{ background: '#ffffff70', border: '2px solid', height: '20px', width: '20px', display: 'block', borderRadius: '50%', marginLeft: '-10px' }}>
                                                                                        <i style={{ marginTop: '-6px' }} className='bx bx-chevron-right'></i>
                                                                                    </span>
                                                                                </button>
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <div className='col-12' style={{ padding: '0px', marginTop: '-15px' }}>
                                                                                <div id={`multimedia-${dato2.id}`} class="scrolling-wrapper row flex-row flex-nowrap">
                                                                                    {dato2.multimedia.map((dato3) => (
                                                                                        <div className="col-5 priDiv" key={'categoria2' + dato3.id} style={{ paddingTop: '10px' }}>
                                                                                            <div style={{ height: '80%', width: '80%', margin: 'auto', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                                                                                <div className="card card-block card-1" >
                                                                                                    {dato3.typeId == 1 ? (
                                                                                                        <>
                                                                                                            <img
                                                                                                                src={process.env.ENDPOINT_API + '/static/' + dato3.mediaUrl}
                                                                                                                style={{ maxHeight: '122px', margin: 'auto', borderRadius: '8px', maxWidth: '100%' }}
                                                                                                            >
                                                                                                            </img>
                                                                                                        </>
                                                                                                    ) : dato3.typeId == 2 ? (
                                                                                                        <>
                                                                                                            <video
                                                                                                                id={`video-${dato3.id}`}
                                                                                                                onMouseOver={() => handleMouseOver(dato3.id)}
                                                                                                                onMouseOut={() => onMouseOut(dato3.id)}
                                                                                                                style={{ maxHeight: '122px', margin: 'auto', borderRadius: '8px', maxWidth: '100%' }}
                                                                                                            >
                                                                                                                <source src={process.env.ENDPOINT_API + '/static/' + dato3.mediaUrl} type="video/mp4" />
                                                                                                            </video>
                                                                                                        </>
                                                                                                    ) : dato3.typeId == 3 ? (
                                                                                                        <>
                                                                                                            <img style={{ borderRadius: '8px' }} onMouseOver={() => handleMouseOverAudio(dato3.id)} onMouseOut={() => onMouseOutAudio(dato3.id)} src={process.env.ENDPOINT_API + '/static/multimedia/gifAudio.gif'} alt="Imagen" />
                                                                                                            <audio id={`audio-${dato3.id}`} style={{ maxWidth: '100%', display: 'none', height: '25px', marginTop: '2px' }} controls src={process.env.ENDPOINT_API + '/static/' + dato3.mediaUrl}></audio>
                                                                                                        </>
                                                                                                    ) : (
                                                                                                        <>
                                                                                                            <img style={{ maxHeight: '122px', margin: 'auto', borderRadius: '8px', maxWidth: '100%', background: 'white', padding: '10px' }} src={process.env.ENDPOINT_API + '/static/multimedia/gifDocumento.gif'} alt="Imagen" />
                                                                                                        </>
                                                                                                    )}

                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="row" style={{ width: '100%', margin: 'auto', marginTop: '4px' }}>
                                                                                                <div className="col-sm-12" style={{ color: '#222d32', textAlign: 'center', padding: '0px', cursor: 'pointer' }} onClick={() => detallModalMultimedia(dato3.id)}>
                                                                                                    {dato3.title} <i style={{ marginTop: '-2px', cursor: 'pointer', borderLeft: '2px solid #222d32', marginLeft: '4px', paddingLeft: '5px' }} className='bx bx-search-alt'></i>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                </React.Fragment>
                                                            ) : (
                                                                <div style={{ textAlign: 'center' }}>No tiene contenido multimedia.</div>
                                                            )}
                                                        </div>
                                                        <div style={{ background: '#c5c5c5', width: '80%', height: '1px', margin: 'auto', marginTop: '15px', marginBottom: '15px' }}></div>
                                                    </>
                                                ))
                                            ) : (
                                                <div style={{ textAlign: 'center' }}>No se han encontrado registros.</div>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </div>

                    </div>
                </div>
            </div>

        </>
    )
}
