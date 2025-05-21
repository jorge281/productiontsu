"use client"

import React, { use, useEffect, useState,useCallback, ChangeEvent,useRef } from 'react';
import { Menu, MenuItem, IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Image from 'next/image'
import Cookies from 'js-cookie';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import EmojiPicker from 'react-input-emoji';
import io from 'socket.io-client';
import { Modal } from 'react-bootstrap';
import 'emojionearea/dist/emojionearea.css';
import './style.css'
import Head from 'next/head';
import Recorder from 'recorder-js';
import Form from 'react-bootstrap/Form';
import { FileUploader } from "react-drag-drop-files";
import opusMediaRecorder from 'opus-media-recorder';
import { set } from 'react-hook-form';
import { off } from 'process';
//import ReactQuill from 'react-quill';
//import 'react-quill/dist/quill.snow.css'; 

let usuarioId2 = 0;
let tokenLoading = 0;
let idResponderMsg = 0;
let offsetActivo = 0;
let tokenLoading2 = 0;
let ticketAceptado = true;
let urlSelect = '';
let idRespuesta = 0;
let typeRespuesta = 0;
let procesosInbox = 1;
let fechaInbox = 0;
let messageInbox = 0;
let messageInbox2 = 0;
let searBuscador1 = '';
let consultando1 = true;
let tieneMensajesPendientes = true;
let tokenLoading3 = 0;
let tokenLoading4 = 0;
let ticketActivo = "";
let mensajesCargadosTicket = [];
let menuSeleccionado2 = 1;
let menuSeleccionadoPrincipal = 1;
let offsetMessagesActivos = 0;
let textareaPrueba4 = 0;
let contTicketFiltro1Local = 0;
let contTicketFiltro2Local = 0;
let contTicketFiltro3Local = 0;
let contTicketFiltro4Local = 0;
let contTicketFiltro5Local = 0;
let contTicketFiltro6Local = 0;
let arrAck = [];
let idMessage = 0;
let atajosFin = [];
let banderaConsultandoMessages = false;
let chatConMensajes = [];
let arrcolaEnviandoMessage = [];
let textareaPrueba = '';
let textareaPrueba2 = '';
let setticketPendientesFin2 = [];
let setticketPendientesId = [];
let setticketTrabajandoFin2 = [];
let setticketPagosFin2 = [];
let setticketPagoFin2 = [];
let setticketProduccionFin2 = [];
let setticketDespachadosFin2 = [];
let setticketClientesFin2 = [];
let setticketNoInteresadosFin2 = [];
let colaMultimedia = [];
let messagesChat = [];
let messagesChatFront = []; 
let ticketAbierto2 = [];
let disabledTexarea = true;
let audioGrabando = [];
let socket = '';
let base64Audio = '';
let recorder = null;
let idCategoriaMultimediaDetalle = 0;
let itemDetalleMultimedia = 1;


export default function Home() {

    const fileTypes = ["*"];
    const img = process.env.ENDPOINT_API+'/static/fotoUser/avatarWhatsapp.svg';
    type formTicket = {id: string; name: string;number: string; image: string;nameLabel: string,unreadMessages: number,timestamp:string,bodyMessage:string,timestampMessage:string,ackMessage:string,ultimoMessageDate: string,ackIcon:string,numberLabel:string,asesor:string};
    type formAsesores = {id: string; name: string};
    type formCategorias = {id: string; name: string};
    type formMultimedia = {id: string; name: string;mediaUrl: string;typeId:string};
    type formAck = {banderaAck: string; icon: string};
    type formMessageAlert = {messages: string, conversaciones: string};
    type formRespuestaRapida = {id: string, text: string};
    const img2 = process.env.ENDPOINT_API+'/static/multimedia/fondo.svg';
    const [file, setFile] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [contTicketFiltro1, setcontTicketFiltro1] = useState(0);
    const [contTicketFiltro2, setcontTicketFiltro2] = useState(0);
    const [contTicketFiltro3, setcontTicketFiltro3] = useState(0);
    const [contTicketFiltro4, setcontTicketFiltro4] = useState(0);
    const [contTicketFiltro5, setcontTicketFiltro5] = useState(0);
    const [contTicketFiltro6, setcontTicketFiltro6] = useState(0);
    const [responseDiv,setresponseDiv] = useState(null);
    const messagesRef = useRef(null);
    const [inputName, setinputName] = useState("");
    const [selectFiltro,setselectFiltro] = useState(1);
    const [seleFecha1,setseleFecha1] = useState(true);
    const [seleFecha2,setseleFecha2] = useState(true);
    const [seleFecha3,setseleFecha3] = useState(true);
    const [seleFecha4,setseleFecha4] = useState(true);
    const [seleFecha5,setseleFecha5] = useState(true);
    const [seleFecha6,setseleFecha6] = useState(true);
    const [chatConMensajes2,setchatConMensajes2] = useState([]);
    const [inputValueAtajo, setInputValueAtajo] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [respuestasRapidas,setrespuestasRapidas] = useState<formRespuestaRapida>();
    const [ticketAbierto,setticketAbierto] = useState<formTicket>();
    const [ticketAbierto3,setticketAbierto3] = useState(false);
    const [contenidosMessagesChat,setcontenidosMessagesChat] = useState([]);
    const [menuSeleccionado, setMenuSeleccionado] = useState(1);
    const [conTodosFiltro, setconTodosFiltro] = useState(0);
    const [conInteresadosFiltro, setconInteresadosFiltro] = useState(0);
    const [conPendientesPagoFiltro, setconPendientesPagoFiltro] = useState(0);
    const [chatActivo, setchatActivo] = useState(false);
    const [banderaverTodoMultimedia,setbanderaverTodoMultimedia] = useState(false);
    const [banderaConsultandoMultimedia,setBanderaConsultandoMultimedia] = useState(false);
    const [openGaleria,setOpenGaleria] = useState(false);
    const [detallMultimedia,setdetallMultimedia] = useState<formMultimedia>();
    const [divdetallMultimedia,setdivdetallMultimedia] = useState<formMultimedia>([]);
    const [modalDetallMultimedia, setmodalDetallMultimedia] = useState(false);
    const [modalsubirArchivos, setmodalsubirArchivos] = useState(false);
    const [modalEditarInf, setmodalEditarInf] = useState(false);
    const [menuSeleccionado1, setMenuSeleccionado1] = useState(1);
    const [banderaConsultandoTicketPendiente,setbanderaConsultandoTicketPendiente] = useState(true);
    const [banderaConsultandoTicketPendiente2,setbanderaConsultandoTicketPendiente2] = useState(true);
    const [banderaConsultandoTicketTrabajando2,setbanderaConsultandoTicketTrabajando2] = useState(true);
    const [banderaConsultandoTicketPagos2,setbanderaConsultandoTicketPagos2] = useState(true);
    const [banderaConsultandoTicketProduccion2,setbanderaConsultandoTicketProduccion2] = useState(true);
    const [banderaConsultandoTicketDespachados2,setbanderaConsultandoTicketDespachados2] = useState(true);
    const [banderaConsultandoTicketClientes2,setbanderaConsultandoTicketClientes2] = useState(true);
    const [banderaConsultandoTicketNoInteresados2,setbanderaConsultandoTicketNoInteresados2] = useState(true);
    

    const divStyle = {
        backgroundImage: `url(${img2})`,
        backgroundSize: 'cover', // Ajusta el tamaño de la imagen para cubrir el div
        backgroundPosition: 'center', // Centra la imagen en el div
        width: '100%',
        height: chatActivo ? 'calc(100% - 13.2em)' : ticketAbierto ? 'calc(100% - 0px)' : '100%',
        borderBottom: '1px solid #b7b7b7', // Ajusta la altura según tus necesidades
        // Otros estilos según tus necesidades
    };
    
    const handleClick2 = (event) => {
        setAnchorEl(event.currentTarget);
    };
    
    const handleClose2 = () => {
        setAnchorEl(null);
    };

    const [usuario, setUsuario] = useState({ 
		nombre : '',
        perfil : '',
        foto   : '',
        user   : ''
	});

    //alert de conversaciones sin leer
    const [messagesInbox,setmessagesInbox] = useState(<formMessageAlert></formMessageAlert>);
    const [messagesPagos,setmessagesPagos] = useState(<formMessageAlert></formMessageAlert>);
    const [messagesProduccion,setmessagesProduccion] = useState(<formMessageAlert></formMessageAlert>);
    const [messagesDespacho,setmessagesDespacho] = useState(<formMessageAlert></formMessageAlert>);
    const [messagesClientes,setmessagesClientes] = useState(<formMessageAlert></formMessageAlert>);
    const [messagesNoInteresados,setmessagesNoInteresados] = useState(<formMessageAlert></formMessageAlert>);

    //habilitar caja de reacion
    const [reaccionMessage,setreaccionMessage] = useState(false);
    const [reaccionMessageDiv,setreaccionMessageDiv] = useState("");

    const [ticketPendientes,setticketPendientes] = useState<formTicket[]>([]);
    const [ticketPendientesFin,setticketPendientesFin] = useState(0);
    //tickets trabajando en
    const [ticketTrabajando,setticketTrabajando] = useState<formTicket[]>([]);
    const [ticketTrabajandoFin,setticketTrabajandoFin] = useState(0);
    const [banderaConsultandoTicketTrabajando,setbanderaConsultandoTicketTrabajando] = useState(true);
    //tickets pagos en
    const [ticketPagos,setticketPagos] = useState<formTicket[]>([]);
    const [ticketPagosFin,setticketPagosFin] = useState<formTicket[]>([]);
    const [banderaConsultandoTicketPagos,setbanderaConsultandoTicketPagos] = useState(true);
    //tickets en produccion
    const [ticketProduccion,setticketProduccion] = useState<formTicket[]>([]);
    const [ticketProduccionFin,setticketProduccionFin] = useState<formTicket[]>([]);
    const [banderaConsultandoTicketProduccion,setbanderaConsultandoTicketProduccion] = useState(true);
    //tickets despachados
    const [ticketDespachados,setticketDespachados] = useState<formTicket[]>([]);
    const [ticketDespachadosFin,setticketDespachadosFin] = useState<formTicket[]>([]);
    const [banderaConsultandoTicketDespachados,setbanderaConsultandoTicketDespachados] = useState(true);
    //tickets de clientes
    const [ticketClientes,setticketClientes] = useState<formTicket[]>([]);
    const [ticketClientesFin,setticketClientesFin] = useState<formTicket[]>([]);
    const [banderaConsultandoTicketClientes,setbanderaConsultandoTicketClientes] = useState(true);
    //tickets de no interesados
    const [ticketNoInteresados,setticketNoInteresados] = useState<formTicket[]>([]);
    const [ticketNoInteresadosFin,setticketNoInteresadosFin] = useState<formTicket[]>([]);
    const [banderaConsultandoTicketNoInteresados,setbanderaConsultandoTicketNoInteresados] = useState(true);
    //ticket consulta general
    const [ticketconsultaGeneral, setticketconsultaGeneral] = useState<formTicket[]>([]);

    const [asesores,setasesores] = useState<formAsesores[]>([]);
    const [categoriasMultimediaDetall,setcategoriasMultimediaDetall] = useState<formCategorias[]>();
    const [categoriasMultimedia,setcategoriasMultimedia] = useState<formCategorias[]>([]);

    interface EmojiOneAreaProps {
        onEmojiSelect: (text: string) => void;
    }

    const [audioChunks, setAudioChunks] = useState([]);
    const [audioURL, setAudioURL] = useState(null); 
    const [alertFile, setalertFile] = useState(false); 
    const [recording, setRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioContext, setAudioContext] = useState(null);
    const [analyser, setAnalyser] = useState(null);
    const [canvasContext, setCanvasContext] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const mediaRecorderRef = useRef(null);


    const scrollableDivRef = useRef(null);

    function handlePrevClick(id){
        const element = document.getElementById("multimedia-"+id);
        if (element) {
            element.scrollLeft -= 100;
        }

        /*if (scrollableDivRef.current) {
            scrollableDivRef.current.scrollLeft -= 100; // Ajusta este valor según tu necesidad
        }*/
    };

    function handleNextClick(id){
        console.log(id);
        const element = document.getElementById("multimedia-"+id);
        if (element) {
            element.scrollLeft += 100;
        }
        /*if (scrollableDivRef.current) {
            scrollableDivRef.current.scrollLeft += 100; // Ajusta este valor según tu necesidad
        }*/
    };
    
    // opus-media-recorder options
    const workerOptions = {
        encoderWorkerFactory: function () {
            return new Worker('/js/encoderWorker.umd.js')
        },
        OggOpusEncoderWasmPath: '/js/opus-media-recorder/OggOpusEncoder.wasm',
        WebMOpusEncoderWasmPath: '/js/opus-media-recorder/WebMOpusEncoder.wasm',
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
      
        return <span style={{width:'40px',textAlign:'center',marginLeft: '5px',marginTop: '3px'}}>{elapsedTime}</span>;
    };

    

      
    //inici la grabacion del audio
    const startRecording = () => {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {

            const options = { mimeType: 'audio/ogg' };
            mediaRecorderRef.current = new opusMediaRecorder(stream, options,workerOptions);
            mediaRecorderRef.current.addEventListener('dataavailable', (e) => {
                console.log('Recording stopped, data available');
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

        })
        .catch(error => {
           console.error('Error accessing microphone:', error);
        });
    };

    //cancelar la grabacion del auido
    function cancelarAudio(){
        mediaRecorderRef.current.pause();
        setRecording(false);
    }
    
    //evento que se dispara al parar el audio para enviarlo
    async function descargarAudio(event){
        if (event.data.size > 0) {
          blobToBase64(event.data)
        }
    }
    
    //pasa el audio a base64 y lo envia
    async function blobToBase64(blob) {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = async () => {
            const base64String = reader.result.split(',')[1];
            let fecha = new Date();
            let hora = Math.trunc(fecha.getTime()/1000);
            let clase = 'right';

            let fechaMessage = convertirFecha(hora);
            let ackIcon = '';
            for (var e = arrAck.length - 1; e >= 0; e--) {
                if(arrAck[e].banderaAck == 4){
                    ackIcon = arrAck[e].icon
                }
            }
            arrcolaEnviandoMessage.push({id:usuario.user+'-'+hora})

            // Crear un nuevo elemento span
            const nuevoSpan = (
                <li className={`message ${clase}`}>
                    <img title={usuario.nombre} className={`logo logo${clase}`} src={usuario.foto} alt="" />
                    <audio controls style={{marginTop:'10px'}}><source src={`data:audio/ogg;codecs=opus;base64,${base64String}`} type="audio/ogg"></source></audio>
                    <span>
                        <i id={usuario.user+'-'+hora} style={{marginTop:'-3px'}} className={ackIcon}></i>
                        {fechaMessage} 
                        <b style={{marginLeft:'5px'}}>({usuario.nombre})</b>
                    </span>
                </li>
            );

            // Agregar el nuevo span a la lista de contenidosSpans
            setcontenidosMessagesChat([...messagesChatFront, nuevoSpan]);
            //messagesChat.push(data.message)
            messagesChatFront.push(nuevoSpan);

            setTimeout(() => {
                messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
            }, 100);

            if(ticketAceptado == false){
                ticketAceptado = true
                //acepta el ticket
                await axios.post(process.env.ENDPOINT_API+'/whatsapp/aceptarTicket',{ 
                    ticket: ticketAbierto2.id,
                    usuario: usuario.user
                }).then(response => {
                    setticketAbierto(prevState => ({
                        ...prevState,  // Copiar el estado anterior
                        processesid: 1, // actualiza el proceso actual del ticket abierto
                        idStatus: 2 
                    }));
                    var updatedTicketTrabajando = setticketPendientesFin2;
                    updatedTicketTrabajando = updatedTicketTrabajando.filter(ticketLocal => ticketLocal.id !== ticketAbierto2.id);
                    //actualiza el arreglo de los tickets Pendientes
                    setticketPendientesFin2 = updatedTicketTrabajando
                    setticketPendientes(updatedTicketTrabajando);
                    //aumenta los contadores
                    setticketPendientesFin(prevCount => prevCount - 1);
                    setticketTrabajandoFin(prevCount => prevCount + 1);
                })
            }

            console.log("hola llego a estos lados");
            // Llamar a la función para enviar el audio en fragmentos
            await enviarAudioEnFragmentos(ticketAbierto2.id, base64String, usuario, hora);
            
            //envia el mensaje en base64 al backend para que lo envie
            /*await axios.post(process.env.ENDPOINT_API+'/whatsapp/enviarAudio',
            { 
                ticket  : ticketAbierto2.id,
                audio   : base64String,
                usuario : usuario.user,
                idLocal : usuario.user+'-'+hora
            }
            ).then(response => {})*/
        };
        reader.onerror = error => {
          console.error('Error al convertir Blob a base64:', error);
        };
    }
    
    // Función para enviar el audio al servidor en fragmentos
    async function enviarAudioEnFragmentos(ticketId, base64String, usuario, hora) {
        const chunkSize = 1024 * 512; // Tamaño de cada fragmento en bytes (por ejemplo, 512KB)

        // Dividir la cadena base64 en fragmentos
        for (let i = 0; i < base64String.length; i += chunkSize) {
            const chunk = base64String.slice(i, i + chunkSize);

            // Enviar el fragmento al servidor
            await axios.post(process.env.ENDPOINT_API+'/whatsapp/enviarAudioFragmento', {
                ticket: ticketId,
                audioChunk: chunk,
                usuario: usuario.user,
                idLocal: usuario.user + '-' + hora,
                totalChunks: Math.ceil(base64String.length / chunkSize), // Total de fragmentos
                currentChunk: Math.floor(i / chunkSize) + 1 // Número de fragmento actual
            }).then(response => {
                if(response.data.idLocal){
                    var div = document.getElementById(response.data.idLocal);
                    let ackIcon = '';
                    for (var e = arrAck.length - 1; e >= 0; e--) {
                        if(arrAck[e].banderaAck == 5){
                            ackIcon = arrAck[e].icon
                        }
                    }
                    if(div){
                        // Cambiar la clase del div
                        div.className = ackIcon;
                        div.style.color = "#4ccf2b"
                    }
                }
                // Manejar la respuesta si es necesario
            }).catch(error => {
                // Manejar el error si es necesario
            });
        }
    }
    //envia el audio grabado
    async function enviarAudio() {
        setRecording(false);
        mediaRecorderRef.current.stop();
    }

    const EmojiOneArea: React.FC<EmojiOneAreaProps> = ({ onEmojiSelect }) => {
        
        const textareaRef = useRef<HTMLTextAreaElement>(null);
        
        useEffect(() => {
            if(tokenLoading2 == 0){

                try {
                        
                    const $ = require('jquery');
                    const EmojiOneArea = require('emojionearea');
                    const jequeyText = require('jquery-textcomplete');
            
                    // Initialize EmojiOneArea
                    textareaPrueba = $(textareaRef.current).emojioneArea({
                        events: {
                            ready: function(){
                                tokenLoading2 = 1;
                            },
                            keyup: function(editor, event) {
                                // catches everything but enter
                                //if (event.which == 13 && !event.shiftKey) {
                                    //enviarMensajeTexto(textareaPrueba.data("emojioneArea").getText())
                                //}
                            }
                        }
                    });
                    
                } catch (error) {
                    // Manejar el error, si es necesario
                    console.error('Error initializing EmojiOneArea:', error);
                }
            }
        }, [tokenLoading2]);
        
        return <textarea class="texareaMovil" ref={textareaRef} />;
        
    };

    

    const EmojiOneArea2: React.FC<EmojiOneAreaProps> = ({ onEmojiSelect }) => {
        
        
        const textareaRef2 = useRef<HTMLTextAreaElement>(null);   

        useEffect(() => {
            if(tokenLoading3 == 0){

                try {
                        
                    
                    const $ = require('jquery');
                    const EmojiOneArea = require('emojionearea');
                    const jequeyText = require('jquery-textcomplete');
            
                    // Initialize EmojiOneArea
                    textareaPrueba2 = $(textareaRef2.current).emojioneArea({
                        events: {
                            ready: function(){
                                tokenLoading3 = 1;
                            },
                            keyup: function(editor, event) {
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
            if(tokenLoading4 == 0){

                try {
                        
                    
                    const $ = require('jquery');
                    const EmojiOneArea = require('emojionearea');
                    const jequeyText = require('jquery-textcomplete');
            
                    // Initialize EmojiOneArea
                    textareaPrueba4 = $(textareaRef3.current).emojioneArea({
                        events: {
                            ready: function(){
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
    

    

    useEffect(() => {

        const mediaQuery = window.matchMedia('(max-width: 768px)');
        console.log(mediaQuery.matches);

        if(tokenLoading == 0){

            

            tokenLoading = 1;
            
            const fetchData = async (usuarioId) => {

                usuarioId2 = usuarioId;
                //cargar los ack que se manejan
                cargarAckMessages()

                //carga todos los contadores de los tickes
                cargarContadoresProcesos(usuarioId)
                
                
                //cargar los tickets pendientes por aceptar
                //cargarTicketsPendientes(usuarioId,0)

                //cargar los tickets que se estan tabajando en
                cargarTicketsTrabajando(usuarioId,0)

                //cargar los tickets que estan en pago
                //cargarTicketsPagos(usuarioId,0)

                //cargar los ticket que estan en produccion
                //cargarTicketsProduccion(usuarioId,0)

                //cargar los ticket que estan en despacho
                //cargarTicketsDespacho(usuarioId,0)

                //cargar los ticket que son clientes
                //cargarTicketsClientes(usuarioId,0)

                //cargar los ticket que son de no interesados
                //cargarTicketsNoInteresados(usuarioId,0)

                //cargar los asesores disponibles
                cargarAsesores(usuarioId)

                //cargar las categorias de la multimedia
                cargarMultimediaCategoria()

                //cargar las respuestas rapidas o atajos
                cargarAtajos(usuarioId);

                socket = io(process.env.ENDPOINT_SOCKET,{
                    transports: ['websocket']
                });
    
                socket.on('connect', () => {
                    console.log('Conexión establecida con el servidor');
                });
    
                socket.on('nuevoTicket', (data) => {
                    if(data.asesor == usuarioId2){
                        const nuevosTicketsPendientesFinSocket = [...setticketPendientesFin2];

                        data.ticket.imageWhatsapp = data.ticket.image;
                        if(data.ticket.image == 'undefined'){
                            data.ticket.image = img;
                        }
                
                        data.ticket.ackIcon = '';
                        for (var e = arrAck.length - 1; e >= 0; e--) {
                            if(arrAck[e].banderaAck == data.ticket.ackMessage){
                                data.ticket.ackIcon = arrAck[e].icon
                            }
                        }

                        if(data.ticket.unreadMessages > 0){
                            
                            chatConMensajes.push(data.ticket);
                            
                            var chatsSinLeer1 = [];
                            var messagesChat = 0;
                            for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                                if(chatConMensajes[e].idStatus == 1 || chatConMensajes[e].idStatus == 2){
                                    chatsSinLeer1.push(chatConMensajes[e])
                                    messagesChat += chatConMensajes[e].unreadMessages;
                                }
                            }
                            if(chatsSinLeer1.length > 0){
                                setmessagesInbox({alert:1, messages: messagesChat, conversaciones: chatsSinLeer1.length})
                                setTimeout(() => {
                                    setmessagesInbox(prevState => ({ ...prevState, alert: 0 }));
                                }, 2000);
                            }
                        }
                        
                        data.ticket.ultimoMessageDate = convertirFecha(data.ticket.timestampMessage);
                
                        if(data.ticket.name == 'undefined'){
                                
                            const cleanedPhoneNumber = data.ticket.number.replace(/\D/g, '');
                            const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;
                
                            data.ticket.nameLabel = formattedPhoneNumber;
                                
                        }else{
                            data.ticket.nameLabel = data.ticket.name;
                        }
                        cargarContadoresProcesos(usuarioId2)
                        if(menuSeleccionado == 1){
                            if(menuSeleccionado2 == 2){
                                offsetActivo = 0;
                                setticketPendientesId = [];
                                setbanderaConsultandoTicketPendiente(true)
                                setbanderaConsultandoTicketPendiente2(false);
                                cargarTicketsPendientes(usuarioId2,0)
                            }
                        }
                    }
                });

                //recibe que llego un nuevo mensaje
                socket.on('nuevoMessage',(data)=>{
                    try{
                        if(data.ticket.id == ticketAbierto2.id){
                            
                            let clase = data.message.fromMe === 0 ? 'left' : 'right';
                            let fotomessage = data.message.imageChat;
                            let fechaMessage = convertirFecha(data.message.created);
                            let ackIcon = '';
                            for (var e = arrAck.length - 1; e >= 0; e--) {
                                if(arrAck[e].banderaAck == data.message.ack){
                                    ackIcon = arrAck[e].icon
                                }
                            }
                            if(data.message.multimedia === 1){
                                let banderaAgrgearMultimedia = true;
                                for (var e = colaMultimedia.length - 1; e >= 0; e--) {
                                    if(colaMultimedia[e].mediaKey == data.message.mediaKey){
                                        banderaAgrgearMultimedia = false;
                                    }
                                }
                                if(banderaAgrgearMultimedia){
                                    colaMultimedia.unshift(data.message);
                                }
                            }

                            // Crear un nuevo elemento span
                            const nuevoSpan = (
                                <li className={`message ${clase}`} id={`message-${data.message.id}`}>
                                    <img title={data.message.titleAsesor} className={`logo logo${clase}`} src={fotomessage} alt="" />
                                        {data.message.multimedia === 1 ? (
                                            <>
                                            {data.message.typeMultimedia == 3 ? ( 
                                                <>
                                                <div className={`multimedia-${data.message.mediaKey}`}>
                                                    <p>
                                                        <i style={{marginTop:'-3px'}} className='bx bx-loader bx-spin'></i>
                                                        Cargando Multimedia
                                                    </p>
                                                </div>
                                                <p style={{textAlign:'left'}}>{data.message.body}</p>
                                                </>
                                            ):(
                                                <>
                                                    <div style={{height:'35vh'}} className={`multimedia-${data.message.mediaKey}`}>
                                                        <p>
                                                            <i style={{marginTop:'-3px'}} className='bx bx-loader bx-spin'></i>
                                                            Cargando Multimedia
                                                        </p>
                                                    </div>
                                                    <p style={{textAlign:'left'}}>{data.message.body}</p>
                                                </>
                                            )} 
                                            </>
                                        ):(
                                            <p style={{textAlign:'left'}}>{data.message.body}</p>
                                        )}
                                    <span>
                                        <i style={{marginTop:'-3px'}} className={ackIcon}></i>
                                        {fechaMessage} 
                                        {data.message.titleAsesor.length > 0 ? (
                                            <b style={{marginLeft:'5px'}}>({data.message.titleAsesor})</b>
                                        ):null}
                                    </span>
                                </li>
                            );
                            

                            // Crear un nuevo elemento span
                            /*const nuevoSpan = (
                                <li className={`message ${clase}`}>
                                    <img title={data.message.titleAsesor} className={`logo logo${clase}`} src={fotomessage} alt="" />
                                    <p>{data.message.body}</p>
                                    <span>
                                        <i style={{marginTop:'-3px'}} className={ackIcon}></i>
                                        {fechaMessage} 
                                        {data.message.titleAsesor.length > 0 ? (
                                            <b style={{marginLeft:'5px'}}>({data.message.titleAsesor})</b>
                                        ):null}
                                    </span>
                                </li>
                            );*/
                            // Agregar el nuevo span a la lista de contenidosSpans
                            setcontenidosMessagesChat(prevState => [...prevState, nuevoSpan]);
                            messagesChatFront.push(nuevoSpan);

                            setTimeout(() => {
                                messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
                                if(colaMultimedia.length > 0){
                                    cargarMultimedia()
                                }
                            }, 100);
                        }
                        if(data.ticket.idUser == usuarioId){
                            var updatedTicketTrabajando = setticketTrabajandoFin2;
                            if(menuSeleccionado == 1){
                                if(menuSeleccionado2 == 2){
                                    updatedTicketTrabajando = setticketPendientesFin2;
                                }
                            }
                            if(menuSeleccionado == 2){
                                updatedTicketTrabajando = setticketPagosFin2;
                            }
                            if(menuSeleccionado == 3){
                                updatedTicketTrabajando = setticketProduccionFin2;
                            }
                            if(menuSeleccionado == 4){
                                updatedTicketTrabajando = setticketDespachadosFin2;
                            }
                            if(menuSeleccionado == 5){
                                updatedTicketTrabajando = setticketClientesFin2;
                            }
                            if(menuSeleccionado == 6){
                                updatedTicketTrabajando = setticketNoInteresadosFin2;
                            }
                            var updatedTicketTrabajando2 = updatedTicketTrabajando.map(ticketLocal => {
                                // Verificar si el ID del ticket es igual a 1
                                if (ticketLocal.id === data.ticket.id) {
                                    let ackIcon = '';
                                    for (var e = arrAck.length - 1; e >= 0; e--) {
                                        if(arrAck[e].banderaAck == data.message.ack){
                                            ackIcon = arrAck[e].icon
                                        }
                                    }

                                    return {
                                        ...ticketLocal,
                                        ultimoMessageDate: convertirFecha(data.message.created),
                                        ackIcon: ackIcon,
                                        unreadMessages: data.ticket.unreadMessages+1,
                                        bodyMessage: data.message.body
                                    };
                                }else{
                                    return ticketLocal;
                                }
                            })

                            setticketTrabajando(updatedTicketTrabajando2);
                            setticketTrabajandoFin2 = updatedTicketTrabajando2;
                            if(menuSeleccionado == 1){
                                if(menuSeleccionado2 == 2){
                                    setticketPendientesFin2 = updatedTicketTrabajando;
                                    setticketPendientes(updatedTicketTrabajando2);
                                }
                            }
                            if(menuSeleccionado == 2){
                                setticketPagosFin2 = updatedTicketTrabajando2;
                                setticketPagos(updatedTicketTrabajando2);
                            }
                            if(menuSeleccionado == 3){
                                setticketProduccionFin2 = updatedTicketTrabajando2;
                                setticketProduccion(updatedTicketTrabajando2);
                            }
                            if(menuSeleccionado == 4){
                                setticketDespachadosFin2 = updatedTicketTrabajando2;
                                setticketDespachados(updatedTicketTrabajando2);
                            }
                            if(menuSeleccionado == 5){
                                setticketClientesFin2 = updatedTicketTrabajando2;
                                setticketClientes(updatedTicketTrabajando2);
                            }
                            if(menuSeleccionado == 6){
                                setticketNoInteresadosFin2 = updatedTicketTrabajando2;
                                setticketNoInteresados(updatedTicketTrabajando2);
                            }

                           
                            var banderaChat = true;
                            for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                                if(chatConMensajes[e].id == data.ticket.id){
                                    banderaChat = false;
                                    chatConMensajes[e].unreadMessages = data.ticket.unreadMessages+1;
                                }
                            }
                            if(banderaChat){
                                chatConMensajes.push(data.ticket);
                            }

                            var chatsSinLeer1 = [];
                            var messagesChat = 0;
                            for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                                if(chatConMensajes[e].idStatus == 1 || chatConMensajes[e].idStatus == 2){
                                    chatsSinLeer1.push(chatConMensajes[e])
                                    messagesChat += chatConMensajes[e].unreadMessages;
                                }
                            }
                            if(chatsSinLeer1.length > 0){
                                if(data.ticket.idStatus == 1 || data.ticket.idStatus == 2){
                                    setmessagesInbox({alert:1, messages: messagesChat, conversaciones: chatsSinLeer1.length})
                                    setTimeout(() => {
                                        setmessagesInbox(prevState => ({ ...prevState, alert: 0 }));
                                    }, 2000);
                                }else{
                                    setmessagesInbox({alert:0, messages: messagesChat, conversaciones: chatsSinLeer1.length})
                                }
                            }

                            var chatsSinLeer2 = [];
                            var messagesChat = 0;
                            for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                                if(chatConMensajes[e].idStatus == 3){
                                    chatsSinLeer2.push(chatConMensajes[e])
                                    messagesChat += chatConMensajes[e].unreadMessages;
                                }
                            }
                            if(chatsSinLeer2.length > 0){
                                if(data.ticket.idStatus == 3){
                                    setmessagesPagos({alert:1, messages: messagesChat, conversaciones: chatsSinLeer2.length})
                                    setTimeout(() => {
                                        setmessagesPagos(prevState => ({ ...prevState, alert: 0 }));
                                    }, 2000);
                                }else{
                                    setmessagesPagos({alert:0, messages: messagesChat, conversaciones: chatsSinLeer2.length})
                                }
                            }

                            var chatsSinLeer3 = [];
                            var messagesChat = 0;
                            for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                                if(chatConMensajes[e].idStatus == 4){
                                    chatsSinLeer3.push(chatConMensajes[e])
                                    messagesChat += chatConMensajes[e].unreadMessages;
                                }
                            }
                            if(chatsSinLeer3.length > 0){
                                if(data.ticket.idStatus == 4){
                                    setmessagesProduccion({alert:1, messages: messagesChat, conversaciones: chatsSinLeer3.length})
                                    setTimeout(() => {
                                        setmessagesProduccion(prevState => ({ ...prevState, alert: 0 }));
                                    }, 2000);
                                }else{
                                    setmessagesProduccion({alert:0, messages: messagesChat, conversaciones: chatsSinLeer3.length})
                                }
                            }

                            var chatsSinLeer4 = [];
                            var messagesChat = 0;
                            for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                                if(chatConMensajes[e].idStatus == 5){
                                    chatsSinLeer4.push(chatConMensajes[e])
                                    messagesChat += chatConMensajes[e].unreadMessages;
                                }
                            }
                            if(chatsSinLeer4.length > 0){
                                if(data.ticket.idStatus == 5){
                                    setmessagesDespacho({alert:1, messages: messagesChat, conversaciones: chatsSinLeer4.length})
                                    setTimeout(() => {
                                        setmessagesDespacho(prevState => ({ ...prevState, alert: 0 }));
                                    }, 2000);
                                }else{
                                    setmessagesDespacho({alert:0, messages: messagesChat, conversaciones: chatsSinLeer4.length})
                                }
                            }

                            var chatsSinLeer5 = [];
                            var messagesChat = 0;
                            for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                                if(chatConMensajes[e].idStatus == 6){
                                    chatsSinLeer5.push(chatConMensajes[e])
                                    messagesChat += chatConMensajes[e].unreadMessages;
                                }
                            }
                            if(chatsSinLeer5.length > 0){
                                if(data.ticket.idStatus == 6){
                                    setmessagesClientes({alert:1, messages: messagesChat, conversaciones: chatsSinLeer5.length})
                                    setTimeout(() => {
                                        setmessagesClientes(prevState => ({ ...prevState, alert: 0 }));
                                    }, 2000);
                                }else{
                                    setmessagesClientes({alert:0, messages: messagesChat, conversaciones: chatsSinLeer5.length})
                                }
                            }

                            var chatsSinLeer6 = [];
                            var messagesChat = 0;
                            for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                                if(chatConMensajes[e].idStatus == 7){
                                    chatsSinLeer6.push(chatConMensajes[e])
                                    messagesChat += chatConMensajes[e].unreadMessages;
                                }
                            }
                            if(chatsSinLeer6.length > 0){
                                if(data.ticket.idStatus == 7){
                                    setmessagesNoInteresados({alert:1, messages: messagesChat, conversaciones: chatsSinLeer6.length})
                                    setTimeout(() => {
                                        setmessagesNoInteresados(prevState => ({ ...prevState, alert: 0 }));
                                    }, 2000);
                                }else{
                                    setmessagesNoInteresados({alert:0, messages: messagesChat, conversaciones: chatsSinLeer6.length})
                                }
                            }
                        } 

                    }catch(error){
                        console.log(error);
                    }
                })

                socket.on('updatedTicket', (data) => {
                    if(data.asesor == usuarioId){

                        if(data.ticket.ackMessage < 3){

                        
                            var updatedTicketTrabajando = setticketTrabajandoFin2;
                            if(menuSeleccionadoPrincipal == 1){
                                if(menuSeleccionado2 == 2){
                                    updatedTicketTrabajando = setticketPendientesFin2;
                                }
                            }
                            if(menuSeleccionadoPrincipal == 2){
                                updatedTicketTrabajando = setticketPagosFin2;
                            }
                            if(menuSeleccionadoPrincipal == 3){
                                updatedTicketTrabajando = setticketProduccionFin2;
                            }
                            if(menuSeleccionadoPrincipal == 4){
                                updatedTicketTrabajando = setticketDespachadosFin2;
                            }
                            if(menuSeleccionadoPrincipal == 5){
                                updatedTicketTrabajando = setticketClientesFin2;
                            }
                            if(menuSeleccionadoPrincipal == 6){
                                updatedTicketTrabajando = setticketNoInteresadosFin2;
                            }

                            var ackIcon2 = '';
                            for (var o = arrAck.length - 1; o >= 0; o--) {
                                if(arrAck[o].banderaAck == data.ticket.ackMessage){
                                    ackIcon2 = arrAck[o].icon
                                }
                            }
                            
                            var select = "";
                            var updatedTicketTrabajando2 = updatedTicketTrabajando.map(ticketLocal => {
                                // Verificar si el ID del ticket es igual a 1
                                if (ticketLocal.id === data.ticket.id) {
                                    ticketLocal['ultimoMessageDate'] = convertirFecha(data.ticket.timestampMessage);
                                    ticketLocal['backMessage'] = ackIcon2;
                                    ticketLocal['bodyMessage'] = data.ticket.bodyMessage;
                                    ticketLocal['unreadMessages'] = data.ticket.unreadMessages;
                                    select = ticketLocal;
                                    return ticketLocal;
                                } else {
                                    // Si el ID no coincide, simplemente devolver el ticket sin cambios
                                    return ticketLocal;
                                }
                            });

                            console.log("cambio aca")
                            if(menuSeleccionadoPrincipal == 1 && data.ticket.idStatus == 1 && data.ticket.idStatus == 2){
                                if(menuSeleccionado2 == 2){
                                    if(select != ""){
                                        var updatedTicketTrabajando3 = updatedTicketTrabajando2.filter(ticketLocal => ticketLocal.id !== data.ticket.id);
            
                                        updatedTicketTrabajando3.push(select)
                                        setticketPendientesFin2 = updatedTicketTrabajando3;
                                        setticketPendientes(updatedTicketTrabajando3);
                                    }
                                }else{
                                    if(fechaInbox == 1){
                                        if(select == ""){
                                            var ticket = data.ticket;
                                            ticket.imageWhatsapp = ticket.image;
                                            //sin definir 
                                            if(ticket.processesid == 1){
                                                //setconTodosFiltro(prevCount => prevCount + 1);
                                                ticket.background = "#adadad4d";
                                                ticket.background2 = "#d3d3d3";
                                                ticket.border = "#b7b7b7";
                                            }
                                            //Interesado
                                            if(ticket.processesid == 2){
                                                //setconInteresadosFiltro(prevCount => prevCount + 1);
                                                ticket.background = "#c97f304d";
                                                ticket.background2 = "#ebc399";
                                                ticket.border = "#806400";
                                            }
                                            //pendiente pago
                                            if(ticket.processesid == 3){
                                                //setconPendientesPagoFiltro(prevCount => prevCount + 1);
                                                ticket.background = "#0080004d";
                                                ticket.background2 = "#92bf92";
                                                ticket.border = "green";
                                            }
                                            

                                            if(ticket.image == 'undefined'){
                                                ticket.image = img;
                                            }

                                            ticket.ackIcon = '';
                                            for (var e = arrAck.length - 1; e >= 0; e--) {
                                                if(arrAck[e].banderaAck == ticket.ackMessage){
                                                    ticket.ackIcon = arrAck[e].icon
                                                }
                                            }
                                            ticket.ultimoMessageDate = convertirFecha(ticket.timestampMessage);

                                            const cleanedPhoneNumber = ticket.number.replace(/\D/g, '');
                                            const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                                            ticket.numberLabel = formattedPhoneNumber;

                                            if(ticket.name == 'undefined'){
                                                
                                                const cleanedPhoneNumber = ticket.number.replace(/\D/g, '');
                                                const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                                                ticket.nameLabel = formattedPhoneNumber;
                                                
                                            }else{
                                                ticket.nameLabel = ticket.name;
                                            }
                                            var updatedTicketTrabajando3 = updatedTicketTrabajando2;
            
                                            updatedTicketTrabajando3.unshift(ticket)
                                            setticketTrabajandoFin2 = updatedTicketTrabajando3;
                                            setticketTrabajando(updatedTicketTrabajando3); 

                                        }else{
                                            var updatedTicketTrabajando3 = updatedTicketTrabajando2.filter(ticketLocal => ticketLocal.id !== data.ticket.id);
            
                                            updatedTicketTrabajando3.unshift(select)
                                            setticketTrabajandoFin2 = updatedTicketTrabajando3;
                                            setticketTrabajando(updatedTicketTrabajando3); 
                                        }
                                    }else{
                                        if(select != ""){
                                            var updatedTicketTrabajando3 = updatedTicketTrabajando2.filter(ticketLocal => ticketLocal.id !== data.ticket.id);
            
                                            updatedTicketTrabajando3.push(select)
                                            setticketTrabajandoFin2 = updatedTicketTrabajando3;
                                            setticketTrabajando(updatedTicketTrabajando3); 
                                        }
                                    }
                                }
                            }
                            if(menuSeleccionadoPrincipal == 2 && data.ticket.idStatus == 3){
                                if(select == ""){
                                    if(fechaInbox == 1){
                                        var ticket = data.ticket;
                                        setticketPendientesId.push(ticket.id)
                                        
                                        ticket.imageWhatsapp = ticket.image;
                                        //sin definir 
                                        ticket.background = "#adadad4d";
                                        ticket.background2 = "#d3d3d3";
                                        ticket.border = "#b7b7b7";
                                        if(ticket.image == 'undefined'){
                                            ticket.image = img;
                                        }

                                        ticket.ackIcon = '';
                                        for (var e = arrAck.length - 1; e >= 0; e--) {
                                            if(arrAck[e].banderaAck == ticket.ackMessage){
                                                ticket.ackIcon = arrAck[e].icon
                                            }
                                        }
                                        ticket.ultimoMessageDate = convertirFecha(ticket.timestampMessage);

                                        const cleanedPhoneNumber = ticket.number.replace(/\D/g, '');
                                        const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                                        ticket.numberLabel = formattedPhoneNumber;

                                        if(ticket.name == 'undefined'){
                                                    
                                            const cleanedPhoneNumber = ticket.number.replace(/\D/g, '');
                                            const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                                            ticket.nameLabel = formattedPhoneNumber;
                                                    
                                        }else{
                                            ticket.nameLabel = ticket.name;
                                        }
                                        var updatedTicketTrabajando3 = updatedTicketTrabajando2;
                                        
                                        updatedTicketTrabajando3.unshift(ticket)
                                        setticketPagoFin2 = updatedTicketTrabajando3;
                                        setticketPagos(updatedTicketTrabajando3);
                                    }

                                }else{
                                    var updatedTicketTrabajando3 = updatedTicketTrabajando2.filter(ticketLocal => ticketLocal.id !== data.ticket.id);
                                    if(fechaInbox == 0){
                                        updatedTicketTrabajando3.push(select)
                                        setticketPagoFin2 = updatedTicketTrabajando3;
                                        setticketPagos(updatedTicketTrabajando3); 
                                    }else{
                                        updatedTicketTrabajando3.unshift(select)
                                        setticketPagoFin2 = updatedTicketTrabajando3;
                                        setticketPagos(updatedTicketTrabajando3); 
                                    }
                                }
                            }
                            if(menuSeleccionadoPrincipal == 3 && data.ticket.idStatus == 4){
                                if(select == ""){
                                    if(fechaInbox == 1){
                                        var ticket = data.ticket;
                                        setticketPendientesId.push(ticket.id)
                                        
                                        ticket.imageWhatsapp = ticket.image;
                                        //sin definir 
                                        ticket.background = "#adadad4d";
                                        ticket.background2 = "#d3d3d3";
                                        ticket.border = "#b7b7b7";
                                        if(ticket.image == 'undefined'){
                                            ticket.image = img;
                                        }

                                        ticket.ackIcon = '';
                                        for (var e = arrAck.length - 1; e >= 0; e--) {
                                            if(arrAck[e].banderaAck == ticket.ackMessage){
                                                ticket.ackIcon = arrAck[e].icon
                                            }
                                        }
                                        ticket.ultimoMessageDate = convertirFecha(ticket.timestampMessage);

                                        const cleanedPhoneNumber = ticket.number.replace(/\D/g, '');
                                        const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                                        ticket.numberLabel = formattedPhoneNumber;

                                        if(ticket.name == 'undefined'){
                                                    
                                            const cleanedPhoneNumber = ticket.number.replace(/\D/g, '');
                                            const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                                            ticket.nameLabel = formattedPhoneNumber;
                                                    
                                        }else{
                                            ticket.nameLabel = ticket.name;
                                        }
                                        var updatedTicketTrabajando3 = updatedTicketTrabajando2;
                                        
                                        updatedTicketTrabajando3.unshift(ticket)
                                        setticketTrabajandoFin2 = updatedTicketTrabajando3;
                                        setticketTrabajando(updatedTicketTrabajando3);
                                    }

                                }else{
                                    var updatedTicketTrabajando3 = updatedTicketTrabajando2.filter(ticketLocal => ticketLocal.id !== data.ticket.id);
                                    if(fechaInbox == 0){
                                        updatedTicketTrabajando3.push(select)
                                        setticketTrabajandoFin2 = updatedTicketTrabajando3;
                                        setticketTrabajando(updatedTicketTrabajando3); 
                                    }else{
                                        updatedTicketTrabajando3.unshift(select)
                                        setticketTrabajandoFin2 = updatedTicketTrabajando3;
                                        setticketTrabajando(updatedTicketTrabajando3); 
                                    }
                                }
                            }
                            if(menuSeleccionadoPrincipal == 4 && data.ticket.idStatus == 5){
                                if(select == ""){
                                    if(fechaInbox == 1){
                                        var ticket = data.ticket;
                                        setticketPendientesId.push(ticket.id)
                                        
                                        ticket.imageWhatsapp = ticket.image;
                                        //sin definir 
                                        ticket.background = "#adadad4d";
                                        ticket.background2 = "#d3d3d3";
                                        ticket.border = "#b7b7b7";
                                        if(ticket.image == 'undefined'){
                                            ticket.image = img;
                                        }

                                        ticket.ackIcon = '';
                                        for (var e = arrAck.length - 1; e >= 0; e--) {
                                            if(arrAck[e].banderaAck == ticket.ackMessage){
                                                ticket.ackIcon = arrAck[e].icon
                                            }
                                        }
                                        ticket.ultimoMessageDate = convertirFecha(ticket.timestampMessage);

                                        const cleanedPhoneNumber = ticket.number.replace(/\D/g, '');
                                        const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                                        ticket.numberLabel = formattedPhoneNumber;

                                        if(ticket.name == 'undefined'){
                                                    
                                            const cleanedPhoneNumber = ticket.number.replace(/\D/g, '');
                                            const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                                            ticket.nameLabel = formattedPhoneNumber;
                                                    
                                        }else{
                                            ticket.nameLabel = ticket.name;
                                        }
                                        var updatedTicketTrabajando3 = updatedTicketTrabajando2;
                                        
                                        updatedTicketTrabajando3.unshift(ticket)
                                        setticketDespachadosFin2 = updatedTicketTrabajando3;
                                        setticketDespachados(updatedTicketTrabajando3);
                                    }

                                }else{
                                    var updatedTicketTrabajando3 = updatedTicketTrabajando2.filter(ticketLocal => ticketLocal.id !== data.ticket.id);
                                    if(fechaInbox == 0){
                                        updatedTicketTrabajando3.push(select)
                                        setticketDespachadosFin2 = updatedTicketTrabajando3;
                                        setticketDespachados(updatedTicketTrabajando3); 
                                    }else{
                                        updatedTicketTrabajando3.unshift(select)
                                        setticketDespachadosFin2 = updatedTicketTrabajando3;
                                        setticketDespachados(updatedTicketTrabajando3); 
                                    }
                                }
                            }
                            if(menuSeleccionadoPrincipal == 5 && data.ticket.idStatus == 6){
                                if(select == ""){
                                    if(fechaInbox == 1){
                                        var ticket = data.ticket;
                                        setticketPendientesId.push(ticket.id)
                                        
                                        ticket.imageWhatsapp = ticket.image;
                                        //sin definir 
                                        ticket.background = "#adadad4d";
                                        ticket.background2 = "#d3d3d3";
                                        ticket.border = "#b7b7b7";
                                        if(ticket.image == 'undefined'){
                                            ticket.image = img;
                                        }

                                        ticket.ackIcon = '';
                                        for (var e = arrAck.length - 1; e >= 0; e--) {
                                            if(arrAck[e].banderaAck == ticket.ackMessage){
                                                ticket.ackIcon = arrAck[e].icon
                                            }
                                        }
                                        ticket.ultimoMessageDate = convertirFecha(ticket.timestampMessage);

                                        const cleanedPhoneNumber = ticket.number.replace(/\D/g, '');
                                        const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                                        ticket.numberLabel = formattedPhoneNumber;

                                        if(ticket.name == 'undefined'){
                                                    
                                            const cleanedPhoneNumber = ticket.number.replace(/\D/g, '');
                                            const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                                            ticket.nameLabel = formattedPhoneNumber;
                                                    
                                        }else{
                                            ticket.nameLabel = ticket.name;
                                        }
                                        var updatedTicketTrabajando3 = updatedTicketTrabajando2;
                                        
                                        updatedTicketTrabajando3.unshift(ticket)
                                        setticketClientesFin2 = updatedTicketTrabajando3;
                                        setticketClientes(updatedTicketTrabajando3);
                                    }

                                }else{
                                    var updatedTicketTrabajando3 = updatedTicketTrabajando2.filter(ticketLocal => ticketLocal.id !== data.ticket.id);
                                    if(fechaInbox == 0){
                                        updatedTicketTrabajando3.push(select)
                                        setticketClientesFin2 = updatedTicketTrabajando3;
                                        setticketClientes(updatedTicketTrabajando3); 
                                    }else{
                                        updatedTicketTrabajando3.unshift(select)
                                        setticketClientesFin2 = updatedTicketTrabajando3;
                                        setticketClientes(updatedTicketTrabajando3); 
                                    }
                                }
                            }
                            if(menuSeleccionadoPrincipal == 6 && data.ticket.idStatus == 7){
                                if(select == ""){
                                    if(fechaInbox == 1){
                                        var ticket = data.ticket;
                                        setticketPendientesId.push(ticket.id)
                                        
                                        ticket.imageWhatsapp = ticket.image;
                                        //sin definir 
                                        ticket.background = "#adadad4d";
                                        ticket.background2 = "#d3d3d3";
                                        ticket.border = "#b7b7b7";
                                        if(ticket.image == 'undefined'){
                                            ticket.image = img;
                                        }

                                        ticket.ackIcon = '';
                                        for (var e = arrAck.length - 1; e >= 0; e--) {
                                            if(arrAck[e].banderaAck == ticket.ackMessage){
                                                ticket.ackIcon = arrAck[e].icon
                                            }
                                        }
                                        ticket.ultimoMessageDate = convertirFecha(ticket.timestampMessage);

                                        const cleanedPhoneNumber = ticket.number.replace(/\D/g, '');
                                        const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                                        ticket.numberLabel = formattedPhoneNumber;

                                        if(ticket.name == 'undefined'){
                                                    
                                            const cleanedPhoneNumber = ticket.number.replace(/\D/g, '');
                                            const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                                            ticket.nameLabel = formattedPhoneNumber;
                                                    
                                        }else{
                                            ticket.nameLabel = ticket.name;
                                        }
                                        var updatedTicketTrabajando3 = updatedTicketTrabajando2;
                                        
                                        updatedTicketTrabajando3.unshift(ticket)
                                        setticketNoInteresadosFin2 = updatedTicketTrabajando3;
                                        setticketNoInteresados(updatedTicketTrabajando3);
                                    }

                                }else{
                                    var updatedTicketTrabajando3 = updatedTicketTrabajando2.filter(ticketLocal => ticketLocal.id !== data.ticket.id);
                                    if(fechaInbox == 0){
                                        updatedTicketTrabajando3.push(select)
                                        setticketNoInteresadosFin2 = updatedTicketTrabajando3;
                                        setticketNoInteresados(updatedTicketTrabajando3); 
                                    }else{
                                        updatedTicketTrabajando3.unshift(select)
                                        setticketNoInteresadosFin2 = updatedTicketTrabajando3;
                                        setticketNoInteresados(updatedTicketTrabajando3); 
                                    }
                                }
                            }

                            
                        
                            var banderaChat = true;
                                
                            for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                                if(chatConMensajes[e].id == data.ticket.id){
                                    banderaChat = false;
                                    chatConMensajes[e].unreadMessages = data.ticket.unreadMessages;
                                }
                            }
                            if(banderaChat){
                                chatConMensajes.push(data.ticket);
                            }
        
                            var chatsSinLeer1 = [];
                            var messagesChat = 0;
                            for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                                if(chatConMensajes[e].idStatus == 1 || chatConMensajes[e].idStatus == 2){
                                    chatsSinLeer1.push(chatConMensajes[e])
                                    messagesChat += chatConMensajes[e].unreadMessages;
                                }
                            }
                                
                            if(chatsSinLeer1.length > 0){
                                if(data.ticket.idStatus == 1 || data.ticket.idStatus == 2){
                                    setmessagesInbox({alert:1, messages: messagesChat, conversaciones: chatsSinLeer1.length})
                                    setTimeout(() => {
                                        setmessagesInbox(prevState => ({ ...prevState, alert: 0 }));
                                    }, 2000);
                                }else{
                                   setmessagesInbox({alert:0, messages: messagesChat, conversaciones: chatsSinLeer1.length})
                                }
                            }
        
                            var chatsSinLeer2 = [];
                            var messagesChat = 0;
                            for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                                if(chatConMensajes[e].idStatus == 3){
                                    chatsSinLeer2.push(chatConMensajes[e])
                                    messagesChat += chatConMensajes[e].unreadMessages;
                                }
                            }
                                
                            if(chatsSinLeer2.length > 0){
                               if(data.ticket.idStatus == 3){
                                    setmessagesPagos({alert:1, messages: messagesChat, conversaciones: chatsSinLeer2.length})
                                    setTimeout(() => {
                                       setmessagesPagos(prevState => ({ ...prevState, alert: 0 }));
                                    }, 2000);
                                }else{
                                    setmessagesPagos({alert:0, messages: messagesChat, conversaciones: chatsSinLeer2.length})
                                }
                            }
        
                            var chatsSinLeer3 = [];
                            var messagesChat = 0;
                            for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                                if(chatConMensajes[e].idStatus == 4){
                                    chatsSinLeer3.push(chatConMensajes[e])
                                    messagesChat += chatConMensajes[e].unreadMessages;
                                }
                            }
                            if(chatsSinLeer3.length > 0){
                                if(data.ticket.idStatus == 4){
                                    setmessagesProduccion({alert:1, messages: messagesChat, conversaciones: chatsSinLeer3.length})
                                    setTimeout(() => {
                                        setmessagesProduccion(prevState => ({ ...prevState, alert: 0 }));
                                    }, 2000);
                                }else{
                                    setmessagesProduccion({alert:0, messages: messagesChat, conversaciones: chatsSinLeer3.length})
                                }
                            }
        
                            var chatsSinLeer4 = [];
                            var messagesChat = 0;
                            for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                                if(chatConMensajes[e].idStatus == 5){
                                    chatsSinLeer4.push(chatConMensajes[e])
                                    messagesChat += chatConMensajes[e].unreadMessages;
                                }
                            }
                            if(chatsSinLeer4.length > 0){
                                if(data.ticket.idStatus == 5){
                                    setmessagesDespacho({alert:1, messages: messagesChat, conversaciones: chatsSinLeer4.length})
                                    setTimeout(() => {
                                        setmessagesDespacho(prevState => ({ ...prevState, alert: 0 }));
                                    }, 2000);
                                }else{
                                    setmessagesDespacho({alert:0, messages: messagesChat, conversaciones: chatsSinLeer4.length})
                                }
                            }
        
                            var chatsSinLeer5 = [];
                            var messagesChat = 0;
                            for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                                if(chatConMensajes[e].idStatus == 6){
                                    chatsSinLeer5.push(chatConMensajes[e])
                                    messagesChat += chatConMensajes[e].unreadMessages;
                                }
                            }
                            if(chatsSinLeer5.length > 0){
                                if(data.ticket.idStatus == 6){
                                    setmessagesClientes({alert:1, messages: messagesChat, conversaciones: chatsSinLeer5.length})
                                    setTimeout(() => {
                                        setmessagesClientes(prevState => ({ ...prevState, alert: 0 }));
                                    }, 2000);
                                }else{
                                    setmessagesClientes({alert:0, messages: messagesChat, conversaciones: chatsSinLeer5.length})
                                }
                            }
        
                            var chatsSinLeer6 = [];
                            var messagesChat = 0;
                            for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                                if(chatConMensajes[e].idStatus == 7){
                                    chatsSinLeer6.push(chatConMensajes[e])
                                    messagesChat += chatConMensajes[e].unreadMessages;
                                }
                            }
                            if(chatsSinLeer6.length > 0){
                                if(data.ticket.idStatus == 7){
                                    setmessagesNoInteresados({alert:1, messages: messagesChat, conversaciones: chatsSinLeer6.length})
                                    setTimeout(() => {
                                        setmessagesNoInteresados(prevState => ({ ...prevState, alert: 0 }));
                                    }, 2000);
                                }else{
                                    setmessagesNoInteresados({alert:0, messages: messagesChat, conversaciones: chatsSinLeer6.length})
                                }
                            }
                        }
                    }
                });
                
                //notifica eu el ack cambio
                socket.on('ackMessageActualizado', (data)=>{
                    // Obtener el elemento div que tiene el ack
                    var div = document.getElementById(data.message);

                    if (div !== null) {
                        let ackIcon = '';
                        for (var e = arrAck.length - 1; e >= 0; e--) {
                            if(arrAck[e].banderaAck == data.ackMessages){
                                ackIcon = arrAck[e].icon
                            }
                        }

                        // Cambiar la clase del div
                        div.className = ackIcon;
                    }

                    var updatedTicketTrabajando = setticketTrabajandoFin2;
                    if(menuSeleccionado == 1){
                        if(menuSeleccionado2 == 2){
                            updatedTicketTrabajando = setticketPendientesFin2;
                        }
                    }
                    if(menuSeleccionado == 2){
                        updatedTicketTrabajando = setticketPagosFin2;
                    }
                    if(menuSeleccionado == 3){
                        updatedTicketTrabajando = setticketProduccionFin2;
                    }
                    if(menuSeleccionado == 4){
                        updatedTicketTrabajando = setticketDespachadosFin2;
                    }
                    if(menuSeleccionado == 5){
                        updatedTicketTrabajando = setticketClientesFin2;
                    }
                    if(menuSeleccionado == 6){
                        updatedTicketTrabajando = setticketNoInteresadosFin2;
                    }

                    

                    var updatedTicketTrabajando2 = updatedTicketTrabajando.map(ticketLocal => {
                        // Verificar si el ID del ticket es igual a 1
                        if (ticketLocal.id === data.valida.id) {
                            let ackIcon = '';
                            for (var e = arrAck.length - 1; e >= 0; e--) {
                                if(arrAck[e].banderaAck == data.valida.ackMessage){
                                    ackIcon = arrAck[e].icon
                                }
                            }
                            return {
                                ...ticketLocal,
                                unreadMessages: data.valida.unreadMessages,
                                ackIcon: ackIcon
                            };
                        }else{
                            return ticketLocal;
                        }
                    })
                    
                    if(data.valida.idUser == usuarioId){
                        
                        var banderaChat = true;
                        
                        for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                            console.log(chatConMensajes[e]);
                            if(chatConMensajes[e].id == data.valida.id){
                                banderaChat = false;
                                chatConMensajes[e].unreadMessages = data.valida.unreadMessages;
                            }
                        }
                        if(banderaChat){
                            chatConMensajes.push(data.valida);
                        }

                        var chatsSinLeer1 = [];
                        var messagesChat = 0;
                        for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                            if(chatConMensajes[e].idStatus == 1 || chatConMensajes[e].idStatus == 2){
                                chatsSinLeer1.push(chatConMensajes[e])
                                messagesChat += chatConMensajes[e].unreadMessages;
                            }
                        }
                        
                        if(chatsSinLeer1.length > 0){
                            if(data.valida.idStatus == 1 || data.valida.idStatus == 2){
                                setmessagesInbox({alert:1, messages: messagesChat, conversaciones: chatsSinLeer1.length})
                                setTimeout(() => {
                                    setmessagesInbox(prevState => ({ ...prevState, alert: 0 }));
                                }, 2000);
                            }else{
                                setmessagesInbox({alert:0, messages: messagesChat, conversaciones: chatsSinLeer1.length})
                            }
                        }

                        var chatsSinLeer2 = [];
                        var messagesChat = 0;
                        for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                            if(chatConMensajes[e].idStatus == 3){
                                chatsSinLeer2.push(chatConMensajes[e])
                                messagesChat += chatConMensajes[e].unreadMessages;
                            }
                        }
                        
                        if(chatsSinLeer2.length > 0){
                            if(data.valida.idStatus == 3){
                                setmessagesPagos({alert:1, messages: messagesChat, conversaciones: chatsSinLeer2.length})
                                setTimeout(() => {
                                    setmessagesPagos(prevState => ({ ...prevState, alert: 0 }));
                                }, 2000);
                            }else{
                                setmessagesPagos({alert:0, messages: messagesChat, conversaciones: chatsSinLeer2.length})
                            }
                        }

                        var chatsSinLeer3 = [];
                        var messagesChat = 0;
                        for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                            if(chatConMensajes[e].idStatus == 4){
                                chatsSinLeer3.push(chatConMensajes[e])
                                messagesChat += chatConMensajes[e].unreadMessages;
                            }
                        }
                        if(chatsSinLeer3.length > 0){
                            if(data.valida.idStatus == 4){
                                setmessagesProduccion({alert:1, messages: messagesChat, conversaciones: chatsSinLeer3.length})
                                setTimeout(() => {
                                    setmessagesProduccion(prevState => ({ ...prevState, alert: 0 }));
                                }, 2000);
                            }else{
                                setmessagesProduccion({alert:0, messages: messagesChat, conversaciones: chatsSinLeer3.length})
                            }
                        }

                        var chatsSinLeer4 = [];
                        var messagesChat = 0;
                        for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                            if(chatConMensajes[e].idStatus == 5){
                                chatsSinLeer4.push(chatConMensajes[e])
                                messagesChat += chatConMensajes[e].unreadMessages;
                            }
                        }
                        if(chatsSinLeer4.length > 0){
                            if(data.valida.idStatus == 5){
                                setmessagesDespacho({alert:1, messages: messagesChat, conversaciones: chatsSinLeer4.length})
                                setTimeout(() => {
                                    setmessagesDespacho(prevState => ({ ...prevState, alert: 0 }));
                                }, 2000);
                            }else{
                                setmessagesDespacho({alert:0, messages: messagesChat, conversaciones: chatsSinLeer4.length})
                            }
                        }

                        var chatsSinLeer5 = [];
                        var messagesChat = 0;
                        for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                            if(chatConMensajes[e].idStatus == 6){
                                chatsSinLeer5.push(chatConMensajes[e])
                                messagesChat += chatConMensajes[e].unreadMessages;
                            }
                        }
                        if(chatsSinLeer5.length > 0){
                            if(data.valida.idStatus == 6){
                                setmessagesClientes({alert:1, messages: messagesChat, conversaciones: chatsSinLeer5.length})
                                setTimeout(() => {
                                    setmessagesClientes(prevState => ({ ...prevState, alert: 0 }));
                                }, 2000);
                            }else{
                                setmessagesClientes({alert:0, messages: messagesChat, conversaciones: chatsSinLeer5.length})
                            }
                        }

                        var chatsSinLeer6 = [];
                        var messagesChat = 0;
                        for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                            if(chatConMensajes[e].idStatus == 7){
                                chatsSinLeer6.push(chatConMensajes[e])
                                messagesChat += chatConMensajes[e].unreadMessages;
                            }
                        }
                        if(chatsSinLeer6.length > 0){
                            if(data.valida.idStatus == 7){
                                setmessagesNoInteresados({alert:1, messages: messagesChat, conversaciones: chatsSinLeer6.length})
                                setTimeout(() => {
                                    setmessagesNoInteresados(prevState => ({ ...prevState, alert: 0 }));
                                }, 2000);
                            }else{
                                setmessagesNoInteresados({alert:0, messages: messagesChat, conversaciones: chatsSinLeer6.length})
                            }
                        }
                    }

                    setticketTrabajando(updatedTicketTrabajando2);
                    setticketTrabajandoFin2 = updatedTicketTrabajando2;
                    if(menuSeleccionado == 1){
                        if(menuSeleccionado2 == 2){
                            setticketPendientesFin2 = updatedTicketTrabajando;
                            setticketPendientes(updatedTicketTrabajando2);
                        }
                    }
                    if(menuSeleccionado == 2){
                        setticketPagosFin2 = updatedTicketTrabajando2;
                        setticketPagos(updatedTicketTrabajando2);
                    }
                    if(menuSeleccionado == 3){
                        setticketProduccionFin2 = updatedTicketTrabajando2;
                        setticketProduccion(updatedTicketTrabajando2);
                    }
                    if(menuSeleccionado == 4){
                        setticketDespachadosFin2 = updatedTicketTrabajando2;
                        setticketDespachados(updatedTicketTrabajando2);
                    }
                    if(menuSeleccionado == 5){
                        setticketClientesFin2 = updatedTicketTrabajando2;
                        setticketClientes(updatedTicketTrabajando2);
                    }
                    if(menuSeleccionado == 6){
                        setticketNoInteresadosFin2 = updatedTicketTrabajando2;
                        setticketNoInteresados(updatedTicketTrabajando2);
                    }

                })

                //notificacion de que el mensaje salio
                socket.on('messageEnviado', (data)=>{
                    
                    
                    // Obtener el elemento div que tiene el ack
                    var div = document.getElementById(data.idInterno);

                    if (div !== null) {
                        let ackIcon = '';
                        for (var e = arrAck.length - 1; e >= 0; e--) {
                            if(arrAck[e].banderaAck == data.ackMessages){
                                ackIcon = arrAck[e].icon
                            }
                        }

                        // Cambiar la clase del div
                        div.className = ackIcon;
                        div.id = data.message
                    }
                    
                })

                socket.on("connect_error", (err) => {
                    // the reason of the error, for example "xhr poll error"
                    //console.log(err.message);

                    // some additional description, for example the status code of the initial HTTP response
                    //console.log(err.description);

                    // some additional context, for example the XMLHttpRequest object
                    //console.log(err.context);
                })
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
                    foto   : process.env.ENDPOINT_API+"/static/"+decodedToken.payload.foto,
                    user   : decodedToken.payload.user
                });
                fetchData(decodedToken.payload.user);
            }
        }
    },[tokenLoading])

    /*
        creador: jorge luis castrillon
        fecha: 20 de marzo 2024
        objetivo: enviar un mensaje de texto al chat activo
    */
    async function enviarMensajeTexto(){
        
        let mensaje = textareaPrueba.data("emojioneArea").getText();
        if(ticketAceptado == false && mensaje.length > 0 && mensaje != ""){
            ticketAceptado = true
            //acepta el ticket
            await axios.post(process.env.ENDPOINT_API+'/whatsapp/aceptarTicket',{ 
                ticket: ticketAbierto2.id,
                usuario: usuario.user
            }).then(response => {
                setticketAbierto(prevState => ({
                    ...prevState,  // Copiar el estado anterior
                    processesid: 1, // actualiza el proceso actual del ticket abierto
                    idStatus: 2 
                }));
                var updatedTicketTrabajando = setticketPendientesFin2;

                 //actualiza los mensajes sin leer
                for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                    if(chatConMensajes[e].id == ticketAbierto2.id){
                        chatConMensajes.splice(e, 1);
                        break;
                    }
                }

                updatedTicketTrabajando = updatedTicketTrabajando.filter(ticketLocal => ticketLocal.id !== ticketAbierto2.id);
                //actualiza el arreglo de los tickets Pendientes
                setticketPendientesFin2 = updatedTicketTrabajando
                setticketPendientes(updatedTicketTrabajando);
                //aumenta los contadores
                setticketPendientesFin(prevCount => prevCount - 1);
                setticketTrabajandoFin(prevCount => prevCount + 1);
            })
        }

        if(mensaje.length > 0 && mensaje != ""){

        

            textareaPrueba.data("emojioneArea").setText('')

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
            // Crear un nuevo elemento span
            const nuevoSpan = (
                <li className={`message ${clase}`}>
                    <img title={usuario.nombre} className={`logo logo${clase}`} src={usuario.foto} alt="" />
                    <p>{nuevaCadena}</p>
                    <span>
                        <i id={usuario.user+'-'+hora} style={{marginTop:'-3px'}} className={ackIcon}></i>
                        {fechaMessage} 
                        <b style={{marginLeft:'5px'}}>({usuario.nombre})</b>
                    </span>
                </li>
            );
            // Agregar el nuevo span a la lista de contenidosSpans
            setcontenidosMessagesChat([...messagesChatFront, nuevoSpan]);
            //messagesChat.push(data.message)
            messagesChatFront.push(nuevoSpan);
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
            
            setTimeout(() => {
                messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
            }, 100);

            var updatedTicketTrabajando = setticketTrabajandoFin2;
            if(menuSeleccionado == 1){
                if(menuSeleccionado2 == 2){
                    updatedTicketTrabajando = setticketPendientesFin2;
                }
            }
            if(menuSeleccionado == 2){
                updatedTicketTrabajando = setticketPagosFin2;
            }
            if(menuSeleccionado == 3){
                updatedTicketTrabajando = setticketProduccionFin2;
            }
            if(menuSeleccionado == 4){
                updatedTicketTrabajando = setticketDespachadosFin2;
            }
            if(menuSeleccionado == 5){
                updatedTicketTrabajando = setticketClientesFin2;
            }
            if(menuSeleccionado == 6){
                updatedTicketTrabajando = setticketNoInteresadosFin2;
            }

            var updatedTicketTrabajando2 = updatedTicketTrabajando.map(ticketLocal => {
                // Verificar si el ID del ticket es igual a 1
                if (ticketLocal.id === ticketAbierto2.id) {
                    

                    return {
                        ...ticketLocal,
                        ultimoMessageDate: fechaMessage,
                        ackIcon: ackIcon,
                        unreadMessages: 0,
                        bodyMessage: nuevaCadena.substring(0, 10)
                    };
                }else{
                    return ticketLocal;
                }
            })

            setticketTrabajando(updatedTicketTrabajando2);
            setticketTrabajandoFin2 = updatedTicketTrabajando2;
            if(menuSeleccionado == 1){
                if(menuSeleccionado2 == 2){
                    setticketPendientesFin2 = updatedTicketTrabajando;
                    setticketPendientes(updatedTicketTrabajando2);
                }
            }
            if(menuSeleccionado == 2){
                setticketPagosFin2 = updatedTicketTrabajando2;
                setticketPagos(updatedTicketTrabajando2);
            }
            if(menuSeleccionado == 3){
                setticketProduccionFin2 = updatedTicketTrabajando2;
                setticketProduccion(updatedTicketTrabajando2);
            }
            if(menuSeleccionado == 4){
                setticketDespachadosFin2 = updatedTicketTrabajando2;
                setticketDespachados(updatedTicketTrabajando2);
            }
            if(menuSeleccionado == 5){
                setticketClientesFin2 = updatedTicketTrabajando2;
                setticketClientes(updatedTicketTrabajando2);
            }
            if(menuSeleccionado == 6){
                setticketNoInteresadosFin2 = updatedTicketTrabajando2;
                setticketNoInteresados(updatedTicketTrabajando2);
            }

            await axios.post(process.env.ENDPOINT_API+'/whatsapp/enviarMessageTicket',
                { 
                    ticket  : ticketAbierto2.id,
                    idRespuesta : idRespuesta,
                    idResponderMsg: idResponderMsg,
                    typeRespuesta : typeRespuesta,
                    message : mensaje,
                    usuario : usuario.user,
                    idLocal : usuario.user+'-'+hora
                }
            ).then(response => {
                var div = document.getElementById(response.data.idLocal);
                let ackIcon = '';
                for (var e = arrAck.length - 1; e >= 0; e--) {
                    if(arrAck[e].banderaAck == 5){
                        ackIcon = arrAck[e].icon
                    }
                }
                if(div){
                    // Cambiar la clase del div
                    div.className = ackIcon;
                    div.style.color = "#4ccf2b"
                }

                idRespuesta = 0;
                typeRespuesta = 0;
            })
            .catch(error => {
                const swalWithReact = withReactContent(Swal);
                // Manejar el error aquí
                withReactContent(Swal).fire({
                    title: "Error",
                    text: "Comunica con soporte",
                    icon: "error"
                })
            });
        }
    }


    async function cargarAtajos(id){
        const dataRespuestasRapidas =  await axios.post(process.env.ENDPOINT_API+'/whatsapp/respuestasRapidas',{asesor: id});
        
        atajosFin = dataRespuestasRapidas.data.respuestas;
        setrespuestasRapidas(dataRespuestasRapidas.data.respuestas);
    }

    /*
        creador: jorge luis castrillon
        fecha: 17 de marzo 2024
        objetivo: cargar los ack que maneja whatsapp
    */
    async function cargarAckMessages(){
        const dataAck =  await axios.post(process.env.ENDPOINT_API+'/whatsapp/ackMessages');
        arrAck = dataAck.data.ackMessages
    }

    async function cargarTicketsNoInteresados(id,offset){
        offsetActivo = offset;
        const data =  await axios.post(process.env.ENDPOINT_API+'/whatsapp/ticketNoInteresados',{
            asesor: id,
            offset:offset,
            search:searBuscador1,
            id:setticketPendientesId,
            proceso:procesosInbox,
            message: messageInbox,
            sinresponder: messageInbox2,
            fecha: fechaInbox
        });
        
        const ticket = data.data.tickets;

        for (var i = ticket.length - 1; i >= 0; i--) {
            ticket[i].imageWhatsapp = ticket[i].image;
            
            ticket[i].background = "#adadad4d";
            ticket[i].background2 = "#d3d3d3";
            ticket[i].border = "#b7b7b7";
            
            

            if(ticket[i].image == 'undefined'){
                ticket[i].image = img;
            }

            ticket[i].ackIcon = '';
            for (var e = arrAck.length - 1; e >= 0; e--) {
                if(arrAck[e].banderaAck == ticket[i].ackMessage){
                    ticket[i].ackIcon = arrAck[e].icon
                }
            }
            ticket[i].ultimoMessageDate = convertirFecha(ticket[i].timestampMessage);

            const cleanedPhoneNumber = ticket[i].number.replace(/\D/g, '');
            const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

            ticket[i].numberLabel = formattedPhoneNumber;

            if(ticket[i].name == 'undefined'){
                
                const cleanedPhoneNumber = ticket[i].number.replace(/\D/g, '');
                const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                ticket[i].nameLabel = formattedPhoneNumber;
                
            }else{
                ticket[i].nameLabel = ticket[i].name;
            }
        }

        if(searBuscador1.length > 0 && data.data.ticketGeneral.length > 0){
            const ticket2 = data.data.ticketGeneral;

            for (var i = ticket2.length - 1; i >= 0; i--) {
                ticket2[i].imageWhatsapp = ticket2[i].image;
                
                ticket2[i].background = "#adadad4d";
                ticket2[i].background2 = "#d3d3d3";
                ticket2[i].border = "#b7b7b7";
                ticket2[i].status = "Cola";
                if(ticket2[i].idStatus == 2){
                    ticket2[i].status = "Trabajando en";
                }
                if(ticket2[i].idStatus == 3){
                    ticket2[i].status = "Pagos";
                }
                if(ticket2[i].idStatus == 4){
                    ticket2[i].status = "En producción";
                }
                if(ticket2[i].idStatus == 5){
                    ticket2[i].status = "Despachado";
                }
                if(ticket2[i].idStatus == 6){
                    ticket2[i].status = "Clientes";
                }
                if(ticket2[i].idStatus == 7){
                    ticket2[i].status = "No Interesados";
                }

                if(ticket2[i].image == 'undefined'){
                    ticket2[i].image = img;
                }

                ticket2[i].ackIcon = '';
                for (var e = arrAck.length - 1; e >= 0; e--) {
                    if(arrAck[e].banderaAck == ticket2[i].ackMessage){
                        ticket2[i].ackIcon = arrAck[e].icon
                    }
                }
                ticket2[i].ultimoMessageDate = convertirFecha(ticket2[i].timestampMessage);

                const cleanedPhoneNumber = ticket2[i].number.replace(/\D/g, '');
                const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                ticket2[i].numberLabel = formattedPhoneNumber;

                if(ticket2[i].name == 'undefined'){
                    
                    const cleanedPhoneNumber = ticket2[i].number.replace(/\D/g, '');
                    const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                    ticket2[i].nameLabel = formattedPhoneNumber;
                    
                }else{
                    ticket2[i].nameLabel = ticket2[i].name;
                }
            }
            setticketconsultaGeneral(ticket2)
        }else{
            setticketconsultaGeneral([]);
        }

        setbanderaConsultandoTicketNoInteresados(false);
        
        if(offset == 0){
            setticketNoInteresados(ticket);
            setticketNoInteresadosFin2 = ticket;
        }else{
            if(ticket.length > 0){
               setticketNoInteresados([...setticketNoInteresadosFin2, ...ticket]);
            }
            //setticketTrabajandoFin(data.data.totalTickets.length);
            setticketNoInteresadosFin2 = setticketNoInteresadosFin2.concat(ticket)
        }

        if(setticketNoInteresadosFin2.length < data.data.totalFiltro.length){
            setbanderaConsultandoTicketNoInteresados2(true);
        }else{
            setbanderaConsultandoTicketNoInteresados2(false);
        }
        
        consultando1 = false;
    }

    async function cargarTicketsClientes(id,offset){
        offsetActivo = offset;
        const data =  await axios.post(process.env.ENDPOINT_API+'/whatsapp/ticketClientes',{
            asesor: id,
            offset:offset,
            search:searBuscador1,
            id:setticketPendientesId,
            proceso:procesosInbox,
            message: messageInbox,
            sinresponder: messageInbox2,
            fecha: fechaInbox
        });
        const ticket = data.data.tickets;

        for (var i = ticket.length - 1; i >= 0; i--) {
            ticket[i].imageWhatsapp = ticket[i].image;
            
            ticket[i].background = "#adadad4d";
            ticket[i].background2 = "#d3d3d3";
            ticket[i].border = "#b7b7b7";
            
            

            if(ticket[i].image == 'undefined'){
                ticket[i].image = img;
            }

            ticket[i].ackIcon = '';
            for (var e = arrAck.length - 1; e >= 0; e--) {
                if(arrAck[e].banderaAck == ticket[i].ackMessage){
                    ticket[i].ackIcon = arrAck[e].icon
                }
            }
            ticket[i].ultimoMessageDate = convertirFecha(ticket[i].timestampMessage);

            const cleanedPhoneNumber = ticket[i].number.replace(/\D/g, '');
            const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

            ticket[i].numberLabel = formattedPhoneNumber;

            if(ticket[i].name == 'undefined'){
                
                const cleanedPhoneNumber = ticket[i].number.replace(/\D/g, '');
                const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                ticket[i].nameLabel = formattedPhoneNumber;
                
            }else{
                ticket[i].nameLabel = ticket[i].name;
            }
            
        }

        if(searBuscador1.length > 0 && data.data.ticketGeneral.length > 0){
            const ticket2 = data.data.ticketGeneral;

            for (var i = ticket2.length - 1; i >= 0; i--) {
                ticket2[i].imageWhatsapp = ticket2[i].image;
                
                ticket2[i].background = "#adadad4d";
                ticket2[i].background2 = "#d3d3d3";
                ticket2[i].border = "#b7b7b7";
                ticket2[i].status = "Cola";
                if(ticket2[i].idStatus == 2){
                    ticket2[i].status = "Trabajando en";
                }
                if(ticket2[i].idStatus == 3){
                    ticket2[i].status = "Pagos";
                }
                if(ticket2[i].idStatus == 4){
                    ticket2[i].status = "En producción";
                }
                if(ticket2[i].idStatus == 5){
                    ticket2[i].status = "Despachado";
                }
                if(ticket2[i].idStatus == 6){
                    ticket2[i].status = "Clientes";
                }
                if(ticket2[i].idStatus == 7){
                    ticket2[i].status = "No Interesados";
                }

                if(ticket2[i].image == 'undefined'){
                    ticket2[i].image = img;
                }

                ticket2[i].ackIcon = '';
                for (var e = arrAck.length - 1; e >= 0; e--) {
                    if(arrAck[e].banderaAck == ticket2[i].ackMessage){
                        ticket2[i].ackIcon = arrAck[e].icon
                    }
                }
                ticket2[i].ultimoMessageDate = convertirFecha(ticket2[i].timestampMessage);

                const cleanedPhoneNumber = ticket2[i].number.replace(/\D/g, '');
                const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                ticket2[i].numberLabel = formattedPhoneNumber;

                if(ticket2[i].name == 'undefined'){
                    
                    const cleanedPhoneNumber = ticket2[i].number.replace(/\D/g, '');
                    const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                    ticket2[i].nameLabel = formattedPhoneNumber;
                    
                }else{
                    ticket2[i].nameLabel = ticket2[i].name;
                }
            }
            setticketconsultaGeneral(ticket2)
        }else{
            setticketconsultaGeneral([]);
        }
        
        setbanderaConsultandoTicketClientes(false);
        
        if(offset == 0){
            setticketClientes(ticket);
            setticketClientesFin2 = ticket;
        }else{
            if(ticket.length > 0){
               setticketClientes([...setticketClientesFin2, ...ticket]);
            }
            //setticketTrabajandoFin(data.data.totalTickets.length);
            setticketClientesFin2 = setticketClientesFin2.concat(ticket)
        }

        if(setticketClientesFin2.length < data.data.totalFiltro.length){
            setbanderaConsultandoTicketClientes2(true);
        }else{
            setbanderaConsultandoTicketClientes2(false);
        }
        
        consultando1 = false;
    }

    async function cargarTicketsDespacho(id,offset){
        offsetActivo = offset;
        const data =  await axios.post(process.env.ENDPOINT_API+'/whatsapp/ticketDespachados',{
            asesor: id,
            offset:offset,
            search:searBuscador1,
            id:setticketPendientesId,
            proceso:procesosInbox,
            message: messageInbox,
            sinresponder: messageInbox2,
            fecha: fechaInbox
        });
        const ticket = data.data.tickets;

        for (var i = ticket.length - 1; i >= 0; i--) {
            ticket[i].imageWhatsapp = ticket[i].image;
            
            ticket[i].background = "#adadad4d";
            ticket[i].background2 = "#d3d3d3";
            ticket[i].border = "#b7b7b7";
            
            

            if(ticket[i].image == 'undefined'){
                ticket[i].image = img;
            }

            ticket[i].ackIcon = '';
            for (var e = arrAck.length - 1; e >= 0; e--) {
                if(arrAck[e].banderaAck == ticket[i].ackMessage){
                    ticket[i].ackIcon = arrAck[e].icon
                }
            }
            ticket[i].ultimoMessageDate = convertirFecha(ticket[i].timestampMessage);

            const cleanedPhoneNumber = ticket[i].number.replace(/\D/g, '');
            const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

            ticket[i].numberLabel = formattedPhoneNumber;

            if(ticket[i].name == 'undefined'){
                
                const cleanedPhoneNumber = ticket[i].number.replace(/\D/g, '');
                const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                ticket[i].nameLabel = formattedPhoneNumber;
                
            }else{
                ticket[i].nameLabel = ticket[i].name;
            }
        }

        if(searBuscador1.length > 0 && data.data.ticketGeneral.length > 0){
            const ticket2 = data.data.ticketGeneral;

            for (var i = ticket2.length - 1; i >= 0; i--) {
                ticket2[i].imageWhatsapp = ticket2[i].image;
                
                ticket2[i].background = "#adadad4d";
                ticket2[i].background2 = "#d3d3d3";
                ticket2[i].border = "#b7b7b7";
                ticket2[i].status = "Cola";
                if(ticket2[i].idStatus == 2){
                    ticket2[i].status = "Trabajando en";
                }
                if(ticket2[i].idStatus == 3){
                    ticket2[i].status = "Pagos";
                }
                if(ticket2[i].idStatus == 4){
                    ticket2[i].status = "En producción";
                }
                if(ticket2[i].idStatus == 5){
                    ticket2[i].status = "Despachado";
                }
                if(ticket2[i].idStatus == 6){
                    ticket2[i].status = "Clientes";
                }
                if(ticket2[i].idStatus == 7){
                    ticket2[i].status = "No Interesados";
                }

                if(ticket2[i].image == 'undefined'){
                    ticket2[i].image = img;
                }

                ticket2[i].ackIcon = '';
                for (var e = arrAck.length - 1; e >= 0; e--) {
                    if(arrAck[e].banderaAck == ticket2[i].ackMessage){
                        ticket2[i].ackIcon = arrAck[e].icon
                    }
                }
                ticket2[i].ultimoMessageDate = convertirFecha(ticket2[i].timestampMessage);

                const cleanedPhoneNumber = ticket2[i].number.replace(/\D/g, '');
                const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                ticket2[i].numberLabel = formattedPhoneNumber;

                if(ticket2[i].name == 'undefined'){
                    
                    const cleanedPhoneNumber = ticket2[i].number.replace(/\D/g, '');
                    const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                    ticket2[i].nameLabel = formattedPhoneNumber;
                    
                }else{
                    ticket2[i].nameLabel = ticket2[i].name;
                }
            }
            setticketconsultaGeneral(ticket2)
        }else{
            setticketconsultaGeneral([]);
        }

        setbanderaConsultandoTicketDespachados(false);
        
        if(offset == 0){
            setticketDespachados(ticket);
            setticketDespachadosFin2 = ticket;
        }else{
            if(ticket.length > 0){
               setticketDespachados([...setticketDespachadosFin2, ...ticket]);
            }
            //setticketTrabajandoFin(data.data.totalTickets.length);
            setticketDespachadosFin2 = setticketDespachadosFin2.concat(ticket)
        }

        if(setticketDespachadosFin2.length < data.data.totalFiltro.length){
            setbanderaConsultandoTicketDespachados2(true);
        }else{
            setbanderaConsultandoTicketDespachados2(false);
        }
        
        consultando1 = false;
    }
    /*
        creador: jorge luis castrillon
        fecha: 2 de abril 2024
        objetivo: cargar los tickets que estan en pagos
    */
    async function cargarTicketsPagos(id,offset){
        offsetActivo = offset;
        const data =  await axios.post(process.env.ENDPOINT_API+'/whatsapp/ticketPagos',{
            asesor: id,
            offset:offset,
            search:searBuscador1,
            id:setticketPendientesId,
            proceso:procesosInbox,
            message: messageInbox,
            sinresponder: messageInbox2,
            fecha: fechaInbox
        });
        const ticket = data.data.tickets;
        

        //const data =  await axios.post(process.env.ENDPOINT_API+'/whatsapp/ticketPagos',{asesor: id});
        //const ticket = data.data.tickets;

        for (var i = ticket.length - 1; i >= 0; i--) {
            ticket[i].imageWhatsapp = ticket[i].image;
            
            ticket[i].background = "#adadad4d";
            ticket[i].background2 = "#d3d3d3";
            ticket[i].border = "#b7b7b7";
        

            if(ticket[i].image == 'undefined'){
                ticket[i].image = img;
            }

            ticket[i].ackIcon = '';
            for (var e = arrAck.length - 1; e >= 0; e--) {
                if(arrAck[e].banderaAck == ticket[i].ackMessage){
                    ticket[i].ackIcon = arrAck[e].icon
                }
            }
            ticket[i].ultimoMessageDate = convertirFecha(ticket[i].timestampMessage);

            const cleanedPhoneNumber = ticket[i].number.replace(/\D/g, '');
            const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

            ticket[i].numberLabel = formattedPhoneNumber;

            if(ticket[i].name == 'undefined'){
                
                const cleanedPhoneNumber = ticket[i].number.replace(/\D/g, '');
                const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                ticket[i].nameLabel = formattedPhoneNumber;
                
            }else{
                ticket[i].nameLabel = ticket[i].name;
            }
        }

        if(searBuscador1.length > 0 && data.data.ticketGeneral.length > 0){
            const ticket2 = data.data.ticketGeneral;

            for (var i = ticket2.length - 1; i >= 0; i--) {
                ticket2[i].imageWhatsapp = ticket2[i].image;
                
                ticket2[i].background = "#adadad4d";
                ticket2[i].background2 = "#d3d3d3";
                ticket2[i].border = "#b7b7b7";
                ticket2[i].status = "Cola";
                if(ticket2[i].idStatus == 2){
                    ticket2[i].status = "Trabajando en";
                }
                if(ticket2[i].idStatus == 3){
                    ticket2[i].status = "Pagos";
                }
                if(ticket2[i].idStatus == 4){
                    ticket2[i].status = "En producción";
                }
                if(ticket2[i].idStatus == 5){
                    ticket2[i].status = "Despachado";
                }
                if(ticket2[i].idStatus == 6){
                    ticket2[i].status = "Clientes";
                }
                if(ticket2[i].idStatus == 7){
                    ticket2[i].status = "No Interesados";
                }

                if(ticket2[i].image == 'undefined'){
                    ticket2[i].image = img;
                }

                ticket2[i].ackIcon = '';
                for (var e = arrAck.length - 1; e >= 0; e--) {
                    if(arrAck[e].banderaAck == ticket2[i].ackMessage){
                        ticket2[i].ackIcon = arrAck[e].icon
                    }
                }
                ticket2[i].ultimoMessageDate = convertirFecha(ticket2[i].timestampMessage);

                const cleanedPhoneNumber = ticket2[i].number.replace(/\D/g, '');
                const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                ticket2[i].numberLabel = formattedPhoneNumber;

                if(ticket2[i].name == 'undefined'){
                    
                    const cleanedPhoneNumber = ticket2[i].number.replace(/\D/g, '');
                    const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                    ticket2[i].nameLabel = formattedPhoneNumber;
                    
                }else{
                    ticket2[i].nameLabel = ticket2[i].name;
                }
            }
            setticketconsultaGeneral(ticket2)
        }else{
            setticketconsultaGeneral([]);
        }

        setbanderaConsultandoTicketPagos(false);
        
        if(offset == 0){
            setticketPagos(ticket);
            setticketPagosFin2 = ticket;
        }else{
            if(ticket.length > 0){
               setticketPagos([...setticketPagosFin2, ...ticket]);
            }
            //setticketTrabajandoFin(data.data.totalTickets.length);
            setticketPagosFin2 = setticketPagosFin2.concat(ticket)
        }

        if(setticketPagosFin2.length < data.data.totalFiltro.length){
            setbanderaConsultandoTicketPagos2(true);
        }else{
            setbanderaConsultandoTicketPagos2(false);
        }
        
        consultando1 = false;
        /*

        setticketPagosFin(ticket);
        setticketPagos(ticket);
        setticketPagoFin2 = ticket
        setbanderaConsultandoTicketPagos(false);

        setcontTicketFiltro2(contTicketFiltro2Local+ticket.length)
        contTicketFiltro2Local += ticket.length */
    }

    /*
        creador: jorge luis castrillon
        fecha: 2 de abril 2024
        objetivo: cargar los tickets que estan en produccion
    */
    async function cargarTicketsProduccion(id,offset){
        offsetActivo = offset;
        const data =  await axios.post(process.env.ENDPOINT_API+'/whatsapp/ticketProduccion',{
            asesor: id,
            offset:offset,
            search:searBuscador1,
            id:setticketPendientesId,
            proceso:procesosInbox,
            message: messageInbox,
            sinresponder: messageInbox2,
            fecha: fechaInbox
        });
        const ticket = data.data.tickets;
    
        for (var i = ticket.length - 1; i >= 0; i--) {
            ticket[i].imageWhatsapp = ticket[i].image;
               
            ticket[i].background = "#adadad4d";
            ticket[i].background2 = "#d3d3d3";
            ticket[i].border = "#b7b7b7";
                
                
    
            if(ticket[i].image == 'undefined'){
                ticket[i].image = img;
            }
    
            ticket[i].ackIcon = '';
            for (var e = arrAck.length - 1; e >= 0; e--) {
                if(arrAck[e].banderaAck == ticket[i].ackMessage){
                    ticket[i].ackIcon = arrAck[e].icon
                }
            }
            ticket[i].ultimoMessageDate = convertirFecha(ticket[i].timestampMessage);
    
            const cleanedPhoneNumber = ticket[i].number.replace(/\D/g, '');
            const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;
    
            ticket[i].numberLabel = formattedPhoneNumber;
    
            if(ticket[i].name == 'undefined'){
                    
                const cleanedPhoneNumber = ticket[i].number.replace(/\D/g, '');
                const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;
    
                ticket[i].nameLabel = formattedPhoneNumber;
                   
            }else{
                ticket[i].nameLabel = ticket[i].name;
            }

            if(ticket[i].unreadMessages > 0){
                var banderaChat = true;
                for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                    if(chatConMensajes[e].id == ticket[i].id){
                        banderaChat = false;
                        chatConMensajes[e].unreadMessages = ticket[i].unreadMessages
                    }
                }
                if(banderaChat){
                    chatConMensajes.push(ticket[i]);
                }
                var chatsSinLeer3 = [];
                var messagesChat = 0;
                for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                    if(chatConMensajes[e].idStatus == 4){
                        chatsSinLeer3.push(chatConMensajes[e])
                        messagesChat += chatConMensajes[e].unreadMessages;
                    }
                }
                if(chatsSinLeer3.length > 0){
                    setmessagesProduccion({alert:0, messages: messagesChat, conversaciones: chatsSinLeer3.length})
                    
                }
            }

        }

        if(searBuscador1.length > 0 && data.data.ticketGeneral.length > 0){
            const ticket2 = data.data.ticketGeneral;

            for (var i = ticket2.length - 1; i >= 0; i--) {
                ticket2[i].imageWhatsapp = ticket2[i].image;
                
                ticket2[i].background = "#adadad4d";
                ticket2[i].background2 = "#d3d3d3";
                ticket2[i].border = "#b7b7b7";
                ticket2[i].status = "Cola";
                if(ticket2[i].idStatus == 2){
                    ticket2[i].status = "Trabajando en";
                }
                if(ticket2[i].idStatus == 3){
                    ticket2[i].status = "Pagos";
                }
                if(ticket2[i].idStatus == 4){
                    ticket2[i].status = "En producción";
                }
                if(ticket2[i].idStatus == 5){
                    ticket2[i].status = "Despachado";
                }
                if(ticket2[i].idStatus == 6){
                    ticket2[i].status = "Clientes";
                }
                if(ticket2[i].idStatus == 7){
                    ticket2[i].status = "No Interesados";
                }

                if(ticket2[i].image == 'undefined'){
                    ticket2[i].image = img;
                }

                ticket2[i].ackIcon = '';
                for (var e = arrAck.length - 1; e >= 0; e--) {
                    if(arrAck[e].banderaAck == ticket2[i].ackMessage){
                        ticket2[i].ackIcon = arrAck[e].icon
                    }
                }
                ticket2[i].ultimoMessageDate = convertirFecha(ticket2[i].timestampMessage);

                const cleanedPhoneNumber = ticket2[i].number.replace(/\D/g, '');
                const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                ticket2[i].numberLabel = formattedPhoneNumber;

                if(ticket2[i].name == 'undefined'){
                    
                    const cleanedPhoneNumber = ticket2[i].number.replace(/\D/g, '');
                    const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                    ticket2[i].nameLabel = formattedPhoneNumber;
                    
                }else{
                    ticket2[i].nameLabel = ticket2[i].name;
                }
            }
            setticketconsultaGeneral(ticket2)
        }else{
            setticketconsultaGeneral([]);
        }

        setbanderaConsultandoTicketProduccion(false);
        
        if(offset == 0){
            setticketProduccion(ticket);
            setticketProduccionFin2 = ticket;
        }else{
            if(ticket.length > 0){
               setticketProduccion([...setticketProduccionFin2, ...ticket]);
            }
            //setticketTrabajandoFin(data.data.totalTickets.length);
            setticketProduccionFin2 = setticketProduccionFin2.concat(ticket)
        }

        if(setticketProduccionFin2.length < data.data.totalFiltro.length){
            setbanderaConsultandoTicketProduccion2(true);
        }else{
            setbanderaConsultandoTicketProduccion2(false);
        }
        
        consultando1 = false;
    }

    async function cargarContadoresProcesos(id){
        const data =  await axios.post(process.env.ENDPOINT_API+'/whatsapp/ticketContadorProce',{asesor: id});

        console.log(data);
        if(usuarioId2 == data.data.asesor){
            //inbox
            setcontTicketFiltro1(data.data.inbox.length)
            var trabajando = 0;
            var cola = 0;
            var todos1 = 0;
            var interesados1 = 0;
            var pendientes1 = 0;
            for (var i = data.data.inbox.length - 1; i >= 0; i--) {
                if(data.data.inbox[i].idStatus == 1){
                    cola += 1;
                }else{
                    trabajando += 1;
                    todos1 += 1;
                    if(data.data.inbox[i].processesid == 2){
                        interesados1 += 1;
                    }
                    if(data.data.inbox[i].processesid == 3){
                        pendientes1 += 1;
                    }
                }

                if(data.data.inbox[i].unreadMessages > 0){
                    var banderaChat = true;
                    for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                        if(chatConMensajes[e].id == data.data.inbox[i].id){
                            banderaChat = false;
                            chatConMensajes[e].unreadMessages = data.data.inbox[i].unreadMessages
                        }
                    }
                    if(banderaChat){
                        chatConMensajes.push(data.data.inbox[i]);
                    }
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
            if(chatsSinLeer1.length > 0){
                setmessagesInbox({alert:0, messages: messagesChat, conversaciones: chatsSinLeer1.length})
            }
            setticketPendientesFin(cola);
            setticketTrabajandoFin(trabajando);
            setconTodosFiltro(todos1);
            setconInteresadosFiltro(interesados1);
            setconPendientesPagoFiltro(pendientes1);

            //pagos
            setcontTicketFiltro2(data.data.pago.length)
            for (var i = data.data.pago.length - 1; i >= 0; i--) {
                
                if(data.data.pago[i].unreadMessages > 0){
                    var banderaChat = true;
                    for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                        if(chatConMensajes[e].id == data.data.pago[i].id){
                            banderaChat = false;
                            chatConMensajes[e].unreadMessages = data.data.pago[i].unreadMessages
                        }
                    }
                    if(banderaChat){
                        chatConMensajes.push(data.data.pago[i]);
                    }
                }

            }
            var chatsSinLeer2 = [];
            var messagesChat = 0;
            for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                if(chatConMensajes[e].idStatus == 3){
                    chatsSinLeer2.push(chatConMensajes[e])
                    messagesChat += chatConMensajes[e].unreadMessages;
                }
            }
            if(chatsSinLeer2.length > 0){
                setmessagesPagos({alert:0, messages: messagesChat, conversaciones: chatsSinLeer2.length})
            }

            //En Produccion
            setcontTicketFiltro3(data.data.produccion.length)
            for (var i = data.data.produccion.length - 1; i >= 0; i--) {
                
                if(data.data.produccion[i].unreadMessages > 0){
                    var banderaChat = true;
                    for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                        if(chatConMensajes[e].id == data.data.produccion[i].id){
                            banderaChat = false;
                            chatConMensajes[e].unreadMessages = data.data.produccion[i].unreadMessages
                        }
                    }
                    if(banderaChat){
                        chatConMensajes.push(data.data.produccion[i]);
                    }
                }

            }
            var chatsSinLeer3 = [];
            var messagesChat = 0;
            for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                if(chatConMensajes[e].idStatus == 4){
                    chatsSinLeer3.push(chatConMensajes[e])
                    messagesChat += chatConMensajes[e].unreadMessages;
                }
            }
            if(chatsSinLeer3.length > 0){
                setmessagesProduccion({alert:0, messages: messagesChat, conversaciones: chatsSinLeer3.length})
            }

            //Despachados
            setcontTicketFiltro4(data.data.despachados.length)
            for (var i = data.data.despachados.length - 1; i >= 0; i--) {
                
                if(data.data.despachados[i].unreadMessages > 0){
                    var banderaChat = true;
                    for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                        if(chatConMensajes[e].id == data.data.despachados[i].id){
                            banderaChat = false;
                            chatConMensajes[e].unreadMessages = data.data.despachados[i].unreadMessages
                        }
                    }
                    if(banderaChat){
                        chatConMensajes.push(data.data.despachados[i]);
                    }
                }

            }
            var chatsSinLeer3 = [];
            var messagesChat = 0;
            for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                if(chatConMensajes[e].idStatus == 5){
                    chatsSinLeer3.push(chatConMensajes[e])
                    messagesChat += chatConMensajes[e].unreadMessages;
                }
            }
            if(chatsSinLeer3.length > 0){
                setmessagesDespacho({alert:0, messages: messagesChat, conversaciones: chatsSinLeer3.length})
            }

            //Clientes
            setcontTicketFiltro5(data.data.clientes.length)
            for (var i = data.data.clientes.length - 1; i >= 0; i--) {
                
                if(data.data.clientes[i].unreadMessages > 0){
                    var banderaChat = true;
                    for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                        if(chatConMensajes[e].id == data.data.clientes[i].id){
                            banderaChat = false;
                            chatConMensajes[e].unreadMessages = data.data.clientes[i].unreadMessages
                        }
                    }
                    if(banderaChat){
                        chatConMensajes.push(data.data.clientes[i]);
                    }
                }

            }
            var chatsSinLeer3 = [];
            var messagesChat = 0;
            for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                if(chatConMensajes[e].idStatus == 6){
                    chatsSinLeer3.push(chatConMensajes[e])
                    messagesChat += chatConMensajes[e].unreadMessages;
                }
            }
            if(chatsSinLeer3.length > 0){
                setmessagesClientes({alert:0, messages: messagesChat, conversaciones: chatsSinLeer3.length})
            }


            //No interesados
            setcontTicketFiltro6(data.data.noInteresados.length)
            for (var i = data.data.noInteresados.length - 1; i >= 0; i--) {
                
                if(data.data.noInteresados[i].unreadMessages > 0){
                    var banderaChat = true;
                    for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                        if(chatConMensajes[e].id == data.data.noInteresados[i].id){
                            banderaChat = false;
                            chatConMensajes[e].unreadMessages = data.data.noInteresados[i].unreadMessages
                        }
                    }
                    if(banderaChat){
                        chatConMensajes.push(data.data.noInteresados[i]);
                    }
                }

            }
            var chatsSinLeer3 = [];
            var messagesChat = 0;
            for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                if(chatConMensajes[e].idStatus == 7){
                    chatsSinLeer3.push(chatConMensajes[e])
                    messagesChat += chatConMensajes[e].unreadMessages;
                }
            }
            if(chatsSinLeer3.length > 0){
                setmessagesNoInteresados({alert:0, messages: messagesChat, conversaciones: chatsSinLeer3.length})
            }
            setchatConMensajes2(chatConMensajes);
        }
    }

    /*
        creador: jorge luis castrillon
        fecha: 2 de abril 2024
        objetivo: cargar los tickets trbajando en de un asesor
    */
    async function cargarTicketsTrabajando(id,offset){
        offsetActivo = offset;
        const data =  await axios.post(process.env.ENDPOINT_API+'/whatsapp/ticketTrabajando',{
            asesor: id,
            offset:offset,
            search:searBuscador1,
            id:setticketPendientesId,
            proceso:procesosInbox,
            message: messageInbox,
            sinresponder: messageInbox2,
            fecha: fechaInbox
        });
        const ticket = data.data.tickets;
        
        for (var i = ticket.length - 1; i >= 0; i--) {
            ticket[i].imageWhatsapp = ticket[i].image;
            //sin definir 
            if(ticket[i].processesid == 1){
                //setconTodosFiltro(prevCount => prevCount + 1);
                ticket[i].background = "#adadad4d";
                ticket[i].background2 = "#d3d3d3";
                ticket[i].border = "#b7b7b7";
            }
            //Interesado
            if(ticket[i].processesid == 2){
                //setconInteresadosFiltro(prevCount => prevCount + 1);
                ticket[i].background = "#c97f304d";
                ticket[i].background2 = "#ebc399";
                ticket[i].border = "#806400";
            }
            //pendiente pago
            if(ticket[i].processesid == 3){
                //setconPendientesPagoFiltro(prevCount => prevCount + 1);
                ticket[i].background = "#0080004d";
                ticket[i].background2 = "#92bf92";
                ticket[i].border = "green";
            }
            

            if(ticket[i].image == 'undefined'){
                ticket[i].image = img;
            }

            ticket[i].ackIcon = '';
            for (var e = arrAck.length - 1; e >= 0; e--) {
                if(arrAck[e].banderaAck == ticket[i].ackMessage){
                    ticket[i].ackIcon = arrAck[e].icon
                }
            }
            ticket[i].ultimoMessageDate = convertirFecha(ticket[i].timestampMessage);

            const cleanedPhoneNumber = ticket[i].number.replace(/\D/g, '');
            const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

            ticket[i].numberLabel = formattedPhoneNumber;

            if(ticket[i].name == 'undefined'){
                
                const cleanedPhoneNumber = ticket[i].number.replace(/\D/g, '');
                const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                ticket[i].nameLabel = formattedPhoneNumber;
                
            }else{
                ticket[i].nameLabel = ticket[i].name;
            }
        }

        if(searBuscador1.length > 0 && data.data.ticketGeneral.length > 0){
            const ticket2 = data.data.ticketGeneral;

            for (var i = ticket2.length - 1; i >= 0; i--) {
                ticket2[i].imageWhatsapp = ticket2[i].image;
                
                ticket2[i].background = "#adadad4d";
                ticket2[i].background2 = "#d3d3d3";
                ticket2[i].border = "#b7b7b7";
                ticket2[i].status = "Cola";
                if(ticket2[i].idStatus == 2){
                    ticket2[i].status = "Trabajando en";
                }
                if(ticket2[i].idStatus == 3){
                    ticket2[i].status = "Pagos";
                }
                if(ticket2[i].idStatus == 4){
                    ticket2[i].status = "En producción";
                }
                if(ticket2[i].idStatus == 5){
                    ticket2[i].status = "Despachado";
                }
                if(ticket2[i].idStatus == 6){
                    ticket2[i].status = "Clientes";
                }
                if(ticket2[i].idStatus == 7){
                    ticket2[i].status = "No Interesados";
                }

                if(ticket2[i].image == 'undefined'){
                    ticket2[i].image = img;
                }

                ticket2[i].ackIcon = '';
                for (var e = arrAck.length - 1; e >= 0; e--) {
                    if(arrAck[e].banderaAck == ticket2[i].ackMessage){
                        ticket2[i].ackIcon = arrAck[e].icon
                    }
                }
                ticket2[i].ultimoMessageDate = convertirFecha(ticket2[i].timestampMessage);

                const cleanedPhoneNumber = ticket2[i].number.replace(/\D/g, '');
                const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                ticket2[i].numberLabel = formattedPhoneNumber;

                if(ticket2[i].name == 'undefined'){
                    
                    const cleanedPhoneNumber = ticket2[i].number.replace(/\D/g, '');
                    const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                    ticket2[i].nameLabel = formattedPhoneNumber;
                    
                }else{
                    ticket2[i].nameLabel = ticket2[i].name;
                }
            }
            setticketconsultaGeneral(ticket2)
        }else{
            setticketconsultaGeneral([]);
        }

        setbanderaConsultandoTicketTrabajando(false);
        
        if(offset == 0){
            setticketTrabajando(ticket);
            setticketTrabajandoFin2 = ticket
            
        }else{
            if(ticket.length > 0){
               setticketTrabajando([...setticketTrabajandoFin2, ...ticket]);
            }
            setticketTrabajandoFin2 = setticketTrabajandoFin2.concat(ticket)
        }

        if(setticketTrabajandoFin2.length < data.data.totalFiltro.length){
            setbanderaConsultandoTicketTrabajando2(true);
        }else{
            setbanderaConsultandoTicketTrabajando2(false);
        }
        
        consultando1 = false;

        /*
        setcontTicketFiltro1(contTicketFiltro1Local+ticket.length)
        contTicketFiltro1Local += ticket.length 
        if(offset == 0){
            setticketTrabajandoFin(ticket);
            setticketTrabajando(ticket);
            setticketTrabajandoFin2 = ticket;
            setbanderaConsultandoTicketTrabajando(false);
        }else{
            if(ticket.length > 0){
                setticketTrabajandoFin([...setticketTrabajandoFin2, ...ticket]);
                setticketTrabajando([...setticketTrabajandoFin2, ...ticket]);
                setticketTrabajandoFin2.concat(ticket);
            }
            
            setbanderaConsultandoTicketTrabajando(false);
        }

        if(ticket.length > 0){
            //carga otro bloque de la paginacion
            cargarTicketsTrabajando(id,(offset+100))
        }*/

    }

    /*
        creador: jorge luis castrillon
        fecha: 14 de marzo 2024
        objetivo: cargar los tickets pendientes por aceptar de un asesor
    */
    async function cargarTicketsPendientes(id,offset){
        offsetActivo = offset;
        const data =  await axios.post(process.env.ENDPOINT_API+'/whatsapp/ticketPendientes',{asesor: id,offset:offset,search:searBuscador1,id:setticketPendientesId});
        let ticketTra = data.data.tickets;
        for (var i = ticketTra.length - 1; i >= 0; i--) {
            setticketPendientesId.push(ticketTra[i].id);
            ticketTra[i].imageWhatsapp = ticketTra[i].image;
            if(ticketTra[i].image == 'undefined'){
                ticketTra[i].image = img;
            }

            ticketTra[i].ackIcon = '';
            for (var e = arrAck.length - 1; e >= 0; e--) {
                if(arrAck[e].banderaAck == ticketTra[i].ackMessage){
                    ticketTra[i].ackIcon = arrAck[e].icon
                }
            }
            ticketTra[i].ultimoMessageDate = convertirFecha(ticketTra[i].timestampMessage);

            const cleanedPhoneNumber = ticketTra[i].number.replace(/\D/g, '');
            const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

            ticketTra[i].numberLabel = formattedPhoneNumber;

            if(ticketTra[i].name == 'undefined'){
                
                const cleanedPhoneNumber = ticketTra[i].number.replace(/\D/g, '');
                const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                ticketTra[i].nameLabel = formattedPhoneNumber;
                
            }else{
                ticketTra[i].nameLabel = ticketTra[i].name;
            }
        }

        if(searBuscador1.length > 0 && data.data.ticketGeneral.length > 0){
            const ticket2 = data.data.ticketGeneral;

            for (var i = ticket2.length - 1; i >= 0; i--) {
                ticket2[i].imageWhatsapp = ticket2[i].image;
                
                ticket2[i].background = "#adadad4d";
                ticket2[i].background2 = "#d3d3d3";
                ticket2[i].border = "#b7b7b7";
                ticket2[i].status = "Cola";
                if(ticket2[i].idStatus == 2){
                    ticket2[i].status = "Trabajando en";
                }
                if(ticket2[i].idStatus == 3){
                    ticket2[i].status = "Pagos";
                }
                if(ticket2[i].idStatus == 4){
                    ticket2[i].status = "En producción";
                }
                if(ticket2[i].idStatus == 5){
                    ticket2[i].status = "Despachado";
                }
                if(ticket2[i].idStatus == 6){
                    ticket2[i].status = "Clientes";
                }
                if(ticket2[i].idStatus == 7){
                    ticket2[i].status = "No Interesados";
                }

                if(ticket2[i].image == 'undefined'){
                    ticket2[i].image = img;
                }

                ticket2[i].ackIcon = '';
                for (var e = arrAck.length - 1; e >= 0; e--) {
                    if(arrAck[e].banderaAck == ticket2[i].ackMessage){
                        ticket2[i].ackIcon = arrAck[e].icon
                    }
                }
                ticket2[i].ultimoMessageDate = convertirFecha(ticket2[i].timestampMessage);

                const cleanedPhoneNumber = ticket2[i].number.replace(/\D/g, '');
                const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                ticket2[i].numberLabel = formattedPhoneNumber;

                if(ticket2[i].name == 'undefined'){
                    
                    const cleanedPhoneNumber = ticket2[i].number.replace(/\D/g, '');
                    const formattedPhoneNumber = `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;

                    ticket2[i].nameLabel = formattedPhoneNumber;
                    
                }else{
                    ticket2[i].nameLabel = ticket2[i].name;
                }
            }
            setticketconsultaGeneral(ticket2)
        }else{
            setticketconsultaGeneral([]);
        }

        setbanderaConsultandoTicketPendiente(false);
        
        if(offset == 0){
            //setticketPendientesFin(data.data.totalTickets.length);
            setticketPendientes(ticketTra);
            setticketPendientesFin2 = ticketTra
            /*setcontTicketFiltro1(contTicketFiltro1Local+data.data.totalTickets.length)
            contTicketFiltro1Local += data.data.totalTickets.length */
            
        }else{
            if(ticketTra.length > 0){
               setticketPendientes([...setticketPendientesFin2, ...ticketTra]);
            }
            //setticketPendientesFin(data.data.totalTickets.length);
            setticketPendientesFin2 = setticketPendientesFin2.concat(ticketTra)
        }

        if(setticketPendientesFin2.length < data.data.totalFiltro.length){
            setbanderaConsultandoTicketPendiente2(true);
        }else{
            setbanderaConsultandoTicketPendiente2(false);
        }
        
        consultando1 = false;
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
                fullDateString = fullDateString.replace('0:','12:');
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


    /*
        creador: jorge luis castrillon
        fecha: 25 de marzo 2024
        objetivo: cargar las categorias de la multimedia
    */
    async function cargarMultimediaCategoria(){
        const data =  await axios.post(process.env.ENDPOINT_API+'/whatsapp/cargarCategoriaMultimedia');
        setcategoriasMultimedia(data.data.categorias);
    }

    /*
        creador: jorge luis castrillon
        fecha: 16 de marzo 2024
        objetivo: cargar los asesores disponbiles
    */
    async function cargarAsesores(id){
        const data =  await axios.post(process.env.ENDPOINT_API+'/whatsapp/cargarAsesores',{asesor: id});
        setasesores(data.data.asesores);
    }

    const cambioMenuPrincipal = (menu) => {
        menuSeleccionadoPrincipal = menu;
        searBuscador1 = "";
        setticketPendientesId = [];
        procesosInbox = 1;
        messageInbox = 0;
        messageInbox2 = 0;
        fechaInbox = 0;
        // Obtener todos los elementos div con la clase "buscador"
        var elementosBuscador = document.querySelectorAll('.buscador');

        // Recorrer todos los elementos y establecer su atributo "value" en una cadena vacía
        elementosBuscador.forEach(function(elemento) {
            elemento.value = '';
        });
        fechaInbox = 0;
        setticketTrabajando([]);
        setticketPendientes([]);
        setMenuSeleccionado(menu);
        if(menu == 1){
            if(menuSeleccionado1 == 1){
                offsetActivo = 0;
                setticketPendientesId = [];
                setbanderaConsultandoTicketTrabajando(true)
                setbanderaConsultandoTicketTrabajando2(false);
                cargarTicketsTrabajando(usuario.user,0)
            }else{
                offsetActivo = 0;
                setticketPendientesId = [];
                setbanderaConsultandoTicketPendiente(true)
                setbanderaConsultandoTicketPendiente2(false);
                cargarTicketsPendientes(usuario.user,0)
            }
        }
        if(menu == 2){
            offsetActivo = 0;
            setticketPendientesId = [];
            setbanderaConsultandoTicketPagos(true)
            setbanderaConsultandoTicketPagos2(false);
            cargarTicketsPagos(usuario.user,0)
        }
        if(menu == 3){
            offsetActivo = 0;
            setticketPendientesId = [];
            setbanderaConsultandoTicketProduccion(true)
            setbanderaConsultandoTicketProduccion2(false);
            cargarTicketsProduccion(usuario.user,0)
        }
        if(menu == 4){
            offsetActivo = 0;
            setticketPendientesId = [];
            setbanderaConsultandoTicketDespachados(true)
            setbanderaConsultandoTicketDespachados2(false);
            cargarTicketsDespacho(usuario.user,0)
        }
        if(menu == 5){
            offsetActivo = 0;
            setticketPendientesId = [];
            setbanderaConsultandoTicketClientes(true)
            setbanderaConsultandoTicketClientes2(false);
            cargarTicketsClientes(usuario.user,0)
        }
        if(menu == 6){
            offsetActivo = 0;
            setticketPendientesId = [];
            setbanderaConsultandoTicketNoInteresados(true)
            setbanderaConsultandoTicketNoInteresados2(false);
            cargarTicketsNoInteresados(usuario.user,0)
        }
    };

    function cargarTicketPrueba(contador){
        /*setticketPendientesFin(prevState => [...prevState, setticketPendientesFin2[contador]]);
        setticketPendientes(prevState => [...prevState, setticketPendientesFin2[contador]]);
        setTimeout(() => {
            if(contador < setticketPendientesFin2.length){
                cargarTicketPrueba(contador+1) 
            }
        }, 100);*/
    }

    const cambioMenuSecundario = (item) => {
        
        searBuscador1 = "";
        // Obtener todos los elementos div con la clase "buscador"
        var elementosBuscador = document.querySelectorAll('.buscador');

        // Recorrer todos los elementos y establecer su atributo "value" en una cadena vacía
        elementosBuscador.forEach(function(elemento) {
            elemento.value = '';
        });

        if(menuSeleccionado2 != item){
            menuSeleccionado2 = item;
            setMenuSeleccionado1(item);
            offsetActivo = 0;
            if(item == 2){
                setticketPendientesId = [];
                setbanderaConsultandoTicketPendiente2(false);
                setbanderaConsultandoTicketPendiente(true)
                cargarTicketsPendientes(usuario.user,0)
            }
            if(item == 1){
                setticketPendientesId = [];
                setbanderaConsultandoTicketTrabajando2(false);
                setbanderaConsultandoTicketTrabajando(true)
                cargarTicketsTrabajando(usuario.user,0)
            }
        }
    }

    function filtroFecha(bandera){
        if(bandera == 1){
            if(seleFecha1){
                setseleFecha1(false);
                fechaInbox = 1;
            }else{
                setseleFecha1(true);
                fechaInbox = 0;
            }
            offsetActivo = 0;
            setticketPendientesId = [];
            setbanderaConsultandoTicketTrabajando(true)
            setbanderaConsultandoTicketTrabajando2(false);
            cargarTicketsTrabajando(usuario.user,0)
        }
        if(bandera == 2){
            if(seleFecha2){
                setseleFecha2(false);
                fechaInbox = 1;
            }else{
                setseleFecha2(true);
                fechaInbox = 0;
            }
            offsetActivo = 0;
            consultando1 = true;
            setticketPendientesId = []
            setbanderaConsultandoTicketPagos2(false);
            cargarTicketsPagos(usuario.user,0)
        }
        if(bandera == 3){
            if(seleFecha3){
                setseleFecha3(false);
                fechaInbox = 1;
            }else{
                setseleFecha3(true);
                fechaInbox = 0;
            }
            offsetActivo = 0;
            consultando1 = true;
            setticketPendientesId = []
            setbanderaConsultandoTicketProduccion2(false);
            cargarTicketsProduccion(usuario.user,0)
        }
        if(bandera == 4){
            if(seleFecha4){
                setseleFecha4(false);
                fechaInbox = 1;
            }else{
                setseleFecha4(true);
                fechaInbox = 0;
            }
            offsetActivo = 0;
            consultando1 = true;
            setticketPendientesId = []
            setbanderaConsultandoTicketDespachados2(false);
            cargarTicketsDespacho(usuario.user,0)
        }
        if(bandera == 5){
            if(seleFecha5){
                setseleFecha5(false);
                fechaInbox = 1;
            }else{
                setseleFecha5(true);
                fechaInbox = 0;
            }
            offsetActivo = 0;
            consultando1 = true;
            setticketPendientesId = []
            setbanderaConsultandoTicketClientes2(false);
            cargarTicketsClientes(usuario.user,0)
        }
        if(bandera == 6){
            if(seleFecha6){
                setseleFecha6(false);
                fechaInbox = 1;
            }else{
                setseleFecha6(true);
                fechaInbox = 0;
            }
            offsetActivo = 0;
            consultando1 = true;
            setticketPendientesId = []
            setbanderaConsultandoTicketNoInteresados2(false);
            cargarTicketsNoInteresados(usuario.user,0)
        }
    }

    function filtroSinResponder(select,bandera){
        if(bandera == 1){
            if(select){
                messageInbox2 = 1;
                if(messageInbox == 1){
                    var checkbox = document.getElementById("checkboxfiltro-1");
                    checkbox.checked = false;
                    messageInbox = 0;
                }
            }else{
                messageInbox2 = 0;
            }
            offsetActivo = 0;
            setticketPendientesId = [];
            setbanderaConsultandoTicketTrabajando(true)
            setbanderaConsultandoTicketTrabajando2(false);
            cargarTicketsTrabajando(usuario.user,0)
        }
        if(bandera == 2){
            if(select){
                messageInbox2 = 1;
                if(messageInbox == 1){
                    var checkbox = document.getElementById("checkboxfiltro-3");
                    checkbox.checked = false;
                    messageInbox = 0;
                }
            }else{
                messageInbox2 = 0;
            }
            offsetActivo = 0;
            setticketPendientesId = [];
            setbanderaConsultandoTicketPagos(true)
            setbanderaConsultandoTicketPagos2(false);
            cargarTicketsPagos(usuario.user,0)
        }
        if(bandera == 3){
            if(select){
                messageInbox2 = 1;
                if(messageInbox == 1){
                    var checkbox = document.getElementById("checkboxfiltro-5");
                    checkbox.checked = false;
                    messageInbox = 0;
                }
            }else{
                messageInbox2 = 0;
            }
            offsetActivo = 0;
            setticketPendientesId = [];
            setbanderaConsultandoTicketProduccion(true)
            setbanderaConsultandoTicketProduccion2(false);
            cargarTicketsProduccion(usuario.user,0)
        }
        if(bandera == 4){
            if(select){
                messageInbox2 = 1;
                if(messageInbox == 1){
                    var checkbox = document.getElementById("checkboxfiltro-7");
                    checkbox.checked = false;
                    messageInbox = 0;
                }
            }else{
                messageInbox2 = 0;
            }
            offsetActivo = 0;
            setticketPendientesId = [];
            setbanderaConsultandoTicketDespachados(true)
            setbanderaConsultandoTicketDespachados2(false);
            cargarTicketsDespacho(usuario.user,0)
        }
        if(bandera == 5){
            if(select){
                messageInbox2 = 1;
                if(messageInbox == 1){
                    var checkbox = document.getElementById("checkboxfiltro-9");
                    checkbox.checked = false;
                    messageInbox = 0;
                }
            }else{
                messageInbox2 = 0;
            }
            offsetActivo = 0;
            setticketPendientesId = [];
            setbanderaConsultandoTicketClientes(true)
            setbanderaConsultandoTicketClientes2(false);
            cargarTicketsClientes(usuario.user,0)
        }
        if(bandera == 6){
            if(select){
                messageInbox2 = 1;
                if(messageInbox == 1){
                    var checkbox = document.getElementById("checkboxfiltro-11");
                    checkbox.checked = false;
                    messageInbox = 0;
                }
            }else{
                messageInbox2 = 0;
            }
            offsetActivo = 0;
            setticketPendientesId = [];
            setbanderaConsultandoTicketNoInteresados(true)
            setbanderaConsultandoTicketNoInteresados2(false);
            cargarTicketsNoInteresados(usuario.user,0)
        }
    }

    function filtroSinLeer(select,bandera){
        if(bandera == 1){
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
        }
        if(bandera == 3){
            if(select){
                messageInbox = 1;
                if(messageInbox2 == 1){
                    var checkbox = document.getElementById("checkboxfiltro-6");
                    checkbox.checked = false;
                    messageInbox2 = 0;
                }
            }else{
                messageInbox = 0;
            }
            offsetActivo = 0;
            setticketPendientesId = [];
            setbanderaConsultandoTicketProduccion(true)
            setbanderaConsultandoTicketProduccion2(false);
            cargarTicketsProduccion(usuario.user,0)
        }
        if(bandera == 4){
            if(select){
                messageInbox = 1;
                if(messageInbox2 == 1){
                    var checkbox = document.getElementById("checkboxfiltro-8");
                    checkbox.checked = false;
                    messageInbox2 = 0;
                }
            }else{
                messageInbox = 0;
            }
            offsetActivo = 0;
            setticketPendientesId = [];
            setbanderaConsultandoTicketDespachados(true)
            setbanderaConsultandoTicketDespachados2(false);
            cargarTicketsDespacho(usuario.user,0)
        }
        if(bandera == 5){
            if(select){
                messageInbox = 1;
                if(messageInbox2 == 1){
                    var checkbox = document.getElementById("checkboxfiltro-10");
                    checkbox.checked = false;
                    messageInbox2 = 0;
                }
            }else{
                messageInbox = 0;
            }
            offsetActivo = 0;
            setticketPendientesId = [];
            setbanderaConsultandoTicketClientes(true)
            setbanderaConsultandoTicketClientes2(false);
            cargarTicketsClientes(usuario.user,0)
        }

        if(bandera == 6){
            if(select){
                messageInbox = 1;
                if(messageInbox2 == 1){
                    var checkbox = document.getElementById("checkboxfiltro-12");
                    checkbox.checked = false;
                    messageInbox2 = 0;
                }
            }else{
                messageInbox = 0;
            }
            offsetActivo = 0;
            setticketPendientesId = [];
            setbanderaConsultandoTicketNoInteresados(true)
            setbanderaConsultandoTicketNoInteresados2(false);
            cargarTicketsNoInteresados(usuario.user,0)
        }
        
    }

    function filtroTrabajando(bandera){
        setselectFiltro(bandera);
        procesosInbox = bandera;
        offsetActivo = 0;
        setticketPendientesId = [];
        setbanderaConsultandoTicketTrabajando(true)
        setbanderaConsultandoTicketTrabajando2(false);
        cargarTicketsTrabajando(usuario.user,0)
    }

    async function banderaTicket(ticket,valor){
        
        let banderaReiniciar = false;
        var banderaAgregar = true;
        
        var updatedTicketTrabajando = ticketTrabajando.map(ticketLocal => {
            // Verificar si el ID del ticket es igual a 1
            if (ticketLocal.id === ticket.id) {
                let background = "#adadad4d";
                let background2 = "#d3d3d3";
                let border = "#b7b7b7";
                if(ticketLocal.processesid == valor){
                    valor = 1;
                }
                banderaAgregar = false;
                if(ticketLocal.processesid == 2){
                    setconInteresadosFiltro(prevCount => prevCount - 1);
                }
                if(ticketLocal.processesid == 3){
                    setconPendientesPagoFiltro(prevCount => prevCount - 1);
                }
                
                
                //Interesado
                if(valor == 2){
                    setconInteresadosFiltro(prevCount => prevCount + 1);
                    background = "#c97f304d";
                    background2 = "#ebc399";
                    border = "#806400";
                }
                //pendiente pago
                if(valor == 3){
                    setconPendientesPagoFiltro(prevCount => prevCount + 1);
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

        if(banderaAgregar){
            //Interesado
            if(valor == 2){
                setconInteresadosFiltro(prevCount => prevCount + 1);
            }
            //pendiente pago
            if(valor == 3){
                setconPendientesPagoFiltro(prevCount => prevCount + 1);
            }

        }else{
            if(procesosInbox != 1){
                updatedTicketTrabajando = updatedTicketTrabajando.filter(ticketLocal => ticketLocal.id !== ticket.id);
            }
        }
        
        // Actualizar el estado de ticketTrabajando con el array actualizado
        setticketTrabajando(updatedTicketTrabajando);
        setticketTrabajandoFin2 = updatedTicketTrabajando;
        
        setticketAbierto(prevTicket => ({
            ...prevTicket,
            processesid: valor 
        }));

        await axios.post(process.env.ENDPOINT_API+'/whatsapp/processeTicket',
            { 
                ticket  : ticket.id,
                proceso : valor
            }
        ).then(response => {
            if(banderaAgregar){
                offsetActivo = 0;
                setticketPendientesId = [];
                setbanderaConsultandoTicketTrabajando(true)
                setbanderaConsultandoTicketTrabajando2(false);
                cargarTicketsTrabajando(usuario.user,0)
            }
        })
        .catch(error => {
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte",
                icon: "error"
            })
        });
    }

    function handleSearch(bandera,valor){
        //esta en el primer filtro
        if(bandera == 1){
            if(menuSeleccionado1 == 1){
                if(valor.length > 0){
                    searBuscador1 = valor;
                }else{
                    searBuscador1 = '';
                }
                if(consultando1 == false){
                    consultando1 = true;
                    setticketPendientesId = []
                    setbanderaConsultandoTicketTrabajando2(false);
                    cargarTicketsTrabajando(usuario.user,0)
                }
            }else{
                if(valor.length > 0){
                    searBuscador1 = valor;
                }else{
                    searBuscador1 = '';
                }
                if(consultando1 == false){
                    consultando1 = true;
                    setticketPendientesId = []
                    setbanderaConsultandoTicketPendiente2(false);
                    cargarTicketsPendientes(usuario.user,0)
                    
                }
            }
        }
        //esta en el segundo filtro
        if(bandera == 2){
            if(valor.length > 0){
                searBuscador1 = valor;
            }else{
                searBuscador1 = '';
            }
            if(consultando1 == false){
                consultando1 = true;
                setticketPendientesId = []
                setbanderaConsultandoTicketPagos2(false);
                cargarTicketsPagos(usuario.user,0)
                
            }
        }
        //esta en el segundo filtro
        if(bandera == 3){
            if(valor.length > 0){
                searBuscador1 = valor;
            }else{
                searBuscador1 = '';
            }
            if(consultando1 == false){
                consultando1 = true;
                setticketPendientesId = []
                setbanderaConsultandoTicketPagos2(false);
                cargarTicketsProduccion(usuario.user,0)
                
            }
        }
        //esta en el segundo filtro
        if(bandera == 4){
            if(valor.length > 0){
                searBuscador1 = valor;
            }else{
                searBuscador1 = '';
            }
            if(consultando1 == false){
                consultando1 = true;
                setticketPendientesId = []
                setbanderaConsultandoTicketPagos2(false);
                cargarTicketsDespacho(usuario.user,0)
                
            }
        }
        //esta en el segundo filtro
        if(bandera == 5){
            if(valor.length > 0){
                searBuscador1 = valor;
            }else{
                searBuscador1 = '';
            }
            if(consultando1 == false){
                consultando1 = true;
                setticketPendientesId = []
                setbanderaConsultandoTicketClientes2(false);
                cargarTicketsClientes(usuario.user,0)
                
            }
        }
        //esta en el segundo filtro
        if(bandera == 6){
            if(valor.length > 0){
                searBuscador1 = valor;
            }else{
                searBuscador1 = '';
            }
            if(consultando1 == false){
                consultando1 = true;
                setticketPendientesId = []
                setbanderaConsultandoTicketNoInteresados2(false);
                cargarTicketsNoInteresados(usuario.user,0)
            }
        }
    }

    async function pedidoEntregado(id){
        //acepta el ticket
        await axios.post(process.env.ENDPOINT_API+'/whatsapp/pedidoEntregado',
            { 
                ticket: id,
                usuario: usuario.user
            }
        ).then(response => {
            // Crear una copia del arreglo ticketPendientesFin
            var updatedTicketTrabajando = setticketDespachadosFin2;

            var updatedTicketTrabajando3 = updatedTicketTrabajando.filter(ticketLocal => ticketLocal.id !== id);
            setticketDespachadosFin2 = updatedTicketTrabajando3;
            setticketDespachados(updatedTicketTrabajando3);

            // Actualizar los estados ticketPendientes y ticketPendientesFin con los nuevos arreglos
            setcontTicketFiltro4(prevCount => prevCount - 1)

            for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                if(chatConMensajes[e].id == id){
                    chatConMensajes[e].idStatus = 6;
                }
            }

            var chatsSinLeer1 = [];
            var messagesChat = 0;
            for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                if(chatConMensajes[e].idStatus == 5){
                    chatsSinLeer1.push(chatConMensajes[e])
                    messagesChat += chatConMensajes[e].unreadMessages;
                }
            }
            if(ticketActivo.unreadMessages > 0){
                setmessagesDespacho({alert:1, messages: messagesChat, conversaciones: chatsSinLeer1.length})
                setTimeout(() => {
                    setmessagesDespacho(prevState => ({ ...prevState, alert: 0 }));
                }, 2000);
            }else{
                setmessagesDespacho({alert:0, messages: messagesChat, conversaciones: chatsSinLeer1.length})
            }
            
            setcontTicketFiltro5(prevCount => prevCount + 1)

            if(ticketActivo.unreadMessages > 0){
                var chatsSinLeer2 = [];
                var messagesChat = 0;
                for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                    if(chatConMensajes[e].idStatus == 6){
                        chatsSinLeer2.push(chatConMensajes[e])
                        messagesChat += chatConMensajes[e].unreadMessages;
                    }
                }
                if(chatsSinLeer2.length > 0){
                    setmessagesClientes({alert:1, messages: messagesChat, conversaciones: chatsSinLeer2.length})
                    setTimeout(() => {
                        setmessagesClientes(prevState => ({ ...prevState, alert: 0 }));
                    }, 2000);
                }
            }

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
                text: "Comunica con soporte",
                icon: "error"
            })
        });
    }

    //se despacho el pedido
    async function pedidoDespachado(id){
        //acepta el ticket
        await axios.post(process.env.ENDPOINT_API+'/whatsapp/pedidoDespachado',
            { 
                ticket: id,
                usuario: usuario.user
            }
        ).then(response => {
            // Crear una copia del arreglo ticketPendientesFin
            var updatedTicketTrabajando = setticketProduccionFin2;

            var updatedTicketTrabajando3 = updatedTicketTrabajando.filter(ticketLocal => ticketLocal.id !== id);
            setticketTrabajandoFin2 = updatedTicketTrabajando3;
            setticketProduccion(updatedTicketTrabajando3);

            // Actualizar los estados ticketPendientes y ticketPendientesFin con los nuevos arreglos
            setcontTicketFiltro3(prevCount => prevCount - 1)

            for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                if(chatConMensajes[e].id == id){
                    chatConMensajes[e].idStatus = 5;
                }
            }

            var chatsSinLeer1 = [];
            var messagesChat = 0;
            for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                if(chatConMensajes[e].idStatus == 4){
                    chatsSinLeer1.push(chatConMensajes[e])
                    messagesChat += chatConMensajes[e].unreadMessages;
                }
            }
            if(ticketActivo.unreadMessages > 0){
                setmessagesProduccion({alert:1, messages: messagesChat, conversaciones: chatsSinLeer1.length})
                setTimeout(() => {
                    setmessagesProduccion(prevState => ({ ...prevState, alert: 0 }));
                }, 2000);
            }else{
                setmessagesProduccion({alert:0, messages: messagesChat, conversaciones: chatsSinLeer1.length})
            }
            
            setcontTicketFiltro4(prevCount => prevCount + 1)

            if(ticketActivo.unreadMessages > 0){
                var chatsSinLeer2 = [];
                var messagesChat = 0;
                for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                    if(chatConMensajes[e].idStatus == 5){
                        chatsSinLeer2.push(chatConMensajes[e])
                        messagesChat += chatConMensajes[e].unreadMessages;
                    }
                }
                if(chatsSinLeer2.length > 0){
                    setmessagesDespacho({alert:1, messages: messagesChat, conversaciones: chatsSinLeer2.length})
                    setTimeout(() => {
                        setmessagesDespacho(prevState => ({ ...prevState, alert: 0 }));
                    }, 2000);
                }
            }


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
                text: "Comunica con soporte",
                icon: "error"
            })
        });
    }

    //paso el pedido a produccion
    async function pedidoSubido(id){
        //acepta el ticket
        await axios.post(process.env.ENDPOINT_API+'/whatsapp/pedidoSubido',
            { 
                ticket: id,
                usuario: usuario.user
            }
        ).then(response => {
            // Crear una copia del arreglo ticketPendientesFin
            var updatedTicketTrabajando = setticketPagosFin2;

            var updatedTicketTrabajando3 = updatedTicketTrabajando.filter(ticketLocal => ticketLocal.id !== id);
            setticketTrabajandoFin2 = updatedTicketTrabajando3;
            setticketTrabajando(updatedTicketTrabajando3);

            // Actualizar los estados ticketPendientes y ticketPendientesFin con los nuevos arreglos
            setcontTicketFiltro2(prevCount => prevCount - 1)

            for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                if(chatConMensajes[e].id == id){
                    chatConMensajes[e].idStatus = 4;
                }
            }

            var chatsSinLeer1 = [];
            var messagesChat = 0;
            for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                if(chatConMensajes[e].idStatus == 3){
                    chatsSinLeer1.push(chatConMensajes[e])
                    messagesChat += chatConMensajes[e].unreadMessages;
                }
            }
            if(chatsSinLeer1.length > 0){
                if(ticketActivo.unreadMessages > 0){
                    setmessagesPagos({alert:1, messages: messagesChat, conversaciones: chatsSinLeer1.length})
                    setTimeout(() => {
                        setmessagesPagos(prevState => ({ ...prevState, alert: 0 }));
                    }, 2000);
                }else{
                    setmessagesPagos({alert:0, messages: messagesChat, conversaciones: chatsSinLeer1.length})
                }
                
            }

            setcontTicketFiltro3(prevCount => prevCount + 1)

            if(ticketActivo.unreadMessages > 0){
                var chatsSinLeer2 = [];
                var messagesChat = 0;
                for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                    if(chatConMensajes[e].idStatus == 4){
                        chatsSinLeer2.push(chatConMensajes[e])
                        messagesChat += chatConMensajes[e].unreadMessages;
                    }
                }
                if(chatsSinLeer2.length > 0){
                    setmessagesProduccion({alert:1, messages: messagesChat, conversaciones: chatsSinLeer2.length})
                    setTimeout(() => {
                        setmessagesProduccion(prevState => ({ ...prevState, alert: 0 }));
                    }, 2000);
                }
            }


            setticketAbierto(prevTicket => ({
                ...prevTicket,
                idStatus: 4 
            }));
        })
        .catch(error => {
            console.log(error);
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte",
                icon: "error"
            })
        });
    }
    //pago de ticket 
    async function pagoTicket(id){
        
        //acepta el ticket
        await axios.post(process.env.ENDPOINT_API+'/whatsapp/pagoTicket',
            { 
                ticket: id,
                usuario: usuario.user
            }
        ).then(response => {
            // Crear una copia del arreglo ticketPendientesFin
            let nuevosTicketsPendientesFin = [...ticketTrabajando];
            var ticketSelect = 0;
            // Buscar el ticket con el ID dado
            for (var i = nuevosTicketsPendientesFin.length - 1; i >= 0; i--) {
                if (nuevosTicketsPendientesFin[i].id === id) {
                    ticketSelect = nuevosTicketsPendientesFin[i];
                    ticketSelect.idStatus = 3;
                    ticketSelect.background = "#adadad4d";
                    ticketSelect.background2 = "#d3d3d3";
                    ticketSelect.border = "#b7b7b7";
                    // Eliminar el ticket del arreglo
                    nuevosTicketsPendientesFin.splice(i, 1);
                    break;
                }
            }
            // Actualizar los estados ticketPendientes y ticketPendientesFin con los nuevos arreglos
            setticketTrabajandoFin(prevCount => prevCount - 1);
            
            var updatedTicketTrabajando = ticketTrabajando
            updatedTicketTrabajando = updatedTicketTrabajando.filter(ticketLocal => ticketLocal.id !== id);
            
            setticketTrabajando(updatedTicketTrabajando);


            //sin definir 
            if(ticketSelect.processesid == 1){
                setconTodosFiltro(prevCount => prevCount - 1);
            }
            //Interesado
            if(ticketSelect.processesid == 2){
                setconInteresadosFiltro(prevCount => prevCount - 1);
            }
            //pendiente pago
            if(ticketSelect.processesid == 3){
                setconPendientesPagoFiltro(prevCount => prevCount - 1);
            }


            setcontTicketFiltro1(prevCount => prevCount - 1)

            for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                if(chatConMensajes[e].id == id){
                    chatConMensajes[e].idStatus = 3;
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
            if(chatsSinLeer1.length > 0){
                if(ticketSelect.unreadMessages > 0){
                    setmessagesInbox({alert:1, messages: messagesChat, conversaciones: chatsSinLeer1.length})
                    setTimeout(() => {
                        setmessagesInbox(prevState => ({ ...prevState, alert: 0 }));
                    }, 2000);
                }else{
                    setmessagesInbox({alert:0, messages: messagesChat, conversaciones: chatsSinLeer1.length})
                }
                
            }

            setcontTicketFiltro2(prevCount => prevCount + 1)

            if(ticketSelect.unreadMessages > 0){
                var chatsSinLeer2 = [];
                var messagesChat = 0;
                for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                    if(chatConMensajes[e].idStatus == 3){
                        chatsSinLeer2.push(chatConMensajes[e])
                        messagesChat += chatConMensajes[e].unreadMessages;
                    }
                }
                if(chatsSinLeer2.length > 0){
                    setmessagesPagos({alert:1, messages: messagesChat, conversaciones: chatsSinLeer2.length})
                    setTimeout(() => {
                        setmessagesPagos(prevState => ({ ...prevState, alert: 0 }));
                    }, 2000);
                }
            }

            setticketAbierto(prevTicket => ({
                ...prevTicket,
                idStatus: 3 
            }));
        })
        .catch(error => {
            console.log(error);
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte",
                icon: "error"
            })
        });
    }

    //botom temporal para enviar un ticket a cola 
    async function pagoTicket3(id){
        
        //acepta el ticket
        await axios.post(process.env.ENDPOINT_API+'/whatsapp/colaTemporal',
            { 
                ticket: id,
                usuario: usuario.user
            }
        ).then(response => {
            
            // Actualizar los estados ticketPendientes y ticketPendientesFin con los nuevos arreglos
            setcontTicketFiltro6(prevCount => prevCount - 1);
            
            
            var updatedTicketTrabajando = setticketNoInteresadosFin2
            updatedTicketTrabajando = updatedTicketTrabajando.filter(ticketLocal => ticketLocal.id !== id);
            
            setticketNoInteresados(updatedTicketTrabajando);
            setticketNoInteresadosFin2 = updatedTicketTrabajando

            setcontTicketFiltro1(prevCount => prevCount + 1);
            setticketPendientesFin(prevCount => prevCount + 1)

            for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                if(chatConMensajes[e].id == id){
                    chatConMensajes[e].idStatus = 1;
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
            if(chatsSinLeer1.length > 0){
                setmessagesInbox({alert:0, messages: messagesChat, conversaciones: chatsSinLeer1.length})
            }

            //descuenta de los no interesados

            var chatsSinLeer3 = [];
            var messagesChat = 0;
            for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                if(chatConMensajes[e].idStatus == 7){
                    chatsSinLeer3.push(chatConMensajes[e])
                    messagesChat += chatConMensajes[e].unreadMessages;
                }
            }
            if(chatsSinLeer3.length > 0){
                setmessagesNoInteresados({alert:0, messages: messagesChat, conversaciones: chatsSinLeer3.length})
            }

            setticketAbierto(prevTicket => ({
                ...prevTicket,
                idStatus: 1,
                processesid: 1 
            }));
        })
    }
    //pago de un nuevo pedido ticket 
    async function pagoTicket2(id){
        
        //acepta el ticket
        await axios.post(process.env.ENDPOINT_API+'/whatsapp/pagoTicket',
            { 
                ticket: id,
                usuario: usuario.user
            }
        ).then(response => {
            // Crear una copia del arreglo ticketPendientesFin
            let nuevosTicketsPendientesFin = [...ticketClientesFin];
            var ticketSelect = 0;
            var bandera = 0;
            // Buscar el ticket con el ID dado
            for (var i = nuevosTicketsPendientesFin.length - 1; i >= 0; i--) {
                if (nuevosTicketsPendientesFin[i].id === id) {
                    bandera = 1;
                    ticketSelect = nuevosTicketsPendientesFin[i];
                    ticketSelect.idStatus = 3;
                    ticketSelect.background = "#adadad4d";
                    ticketSelect.background2 = "#d3d3d3";
                    ticketSelect.border = "#b7b7b7";
                    // Eliminar el ticket del arreglo
                    nuevosTicketsPendientesFin.splice(i, 1);
                    break;
                }
            }

            if(bandera == 0){
                // Crear una copia del arreglo ticketPendientesFin
                let nuevosTicketsPendientesFin = [...ticketNoInteresadosFin];
                var ticketSelect = 0;
                // Buscar el ticket con el ID dado
                for (var i = nuevosTicketsPendientesFin.length - 1; i >= 0; i--) {
                    if (nuevosTicketsPendientesFin[i].id === id) {
                        bandera = 2;
                        ticketSelect = nuevosTicketsPendientesFin[i];
                        ticketSelect.idStatus = 3;
                        ticketSelect.background = "#adadad4d";
                        ticketSelect.background2 = "#d3d3d3";
                        ticketSelect.border = "#b7b7b7";
                        // Eliminar el ticket del arreglo
                        nuevosTicketsPendientesFin.splice(i, 1);
                        break;
                    }
                }
            }

            for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                if(chatConMensajes[e].id == id){
                    chatConMensajes[e].idStatus = 3;
                }
            }


            if(bandera == 1){
                // Crear una copia del arreglo ticketPendientesFin
                let nuevosTicketsPendientesFin = [...ticketNoInteresados];
                var ticketSelect = 0;
                var bandera = 0;
                // Buscar el ticket con el ID dado
                for (var i = nuevosTicketsPendientesFin.length - 1; i >= 0; i--) {
                    if (nuevosTicketsPendientesFin[i].id === id) {
                        bandera = 1;
                        ticketSelect = nuevosTicketsPendientesFin[i];
                        ticketSelect.idStatus = 3;
                        ticketSelect.background = "#adadad4d";
                        ticketSelect.background2 = "#d3d3d3";
                        ticketSelect.border = "#b7b7b7";
                        // Eliminar el ticket del arreglo
                        nuevosTicketsPendientesFin.splice(i, 1);
                        break;
                    }
                }

                // Actualizar los estados ticketPendientes y ticketPendientesFin con los nuevos arreglos
                setticketNoInteresados(nuevosTicketsPendientesFin);
                setticketNoInteresadosFin(nuevosTicketsPendientesFin);

                var chatsSinLeer5 = [];
                var messagesChat = 0;
                for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                    if(chatConMensajes[e].idStatus == 6){
                        chatsSinLeer5.push(chatConMensajes[e])
                        messagesChat += chatConMensajes[e].unreadMessages;
                    }
                }
                if(ticketSelect.unreadMessages > 0){
                    setmessagesClientes({alert:1, messages: messagesChat, conversaciones: chatsSinLeer5.length})
                    setTimeout(() => {
                        setmessagesClientes(prevState => ({ ...prevState, alert: 0 }));
                    }, 2000);
                }else{
                    setmessagesClientes({alert:0, messages: messagesChat, conversaciones: chatsSinLeer5.length})
                }
                

                
                setticketClientesFin2 = nuevosTicketsPendientesFin;

                setticketPagosFin([...ticketPagosFin,ticketSelect]);
                setticketPagos([...ticketPagos,ticketSelect]);
                setticketPagoFin2.push(ticketSelect)


                setcontTicketFiltro5(contTicketFiltro5Local-1)
                contTicketFiltro5Local -= 1 

                for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                    if(chatConMensajes[e].id == id){
                        chatConMensajes[e].idStatus = 3;
                    }
                }

                

                setcontTicketFiltro2(contTicketFiltro2Local+1)
                contTicketFiltro2Local += 1 

                if(ticketSelect.unreadMessages > 0){
                    var chatsSinLeer2 = [];
                    var messagesChat = 0;
                    for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                        if(chatConMensajes[e].idStatus == 3){
                            chatsSinLeer2.push(chatConMensajes[e])
                            messagesChat += chatConMensajes[e].unreadMessages;
                        }
                    }
                    if(chatsSinLeer2.length > 0){
                        setmessagesPagos({alert:1, messages: messagesChat, conversaciones: chatsSinLeer2.length})
                        setTimeout(() => {
                            setmessagesPagos(prevState => ({ ...prevState, alert: 0 }));
                        }, 2000);
                    }
                }

            }else{

                var chatsSinLeer5 = [];
                var messagesChat = 0;
                for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                    if(chatConMensajes[e].idStatus == 7){
                        chatsSinLeer5.push(chatConMensajes[e])
                        messagesChat += chatConMensajes[e].unreadMessages;
                    }
                }
                if(ticketSelect.unreadMessages > 0){
                    setmessagesNoInteresados({alert:1, messages: messagesChat, conversaciones: chatsSinLeer5.length})
                    setTimeout(() => {
                        setmessagesNoInteresados(prevState => ({ ...prevState, alert: 0 }));
                    }, 2000);
                }else{
                    setmessagesNoInteresados({alert:0, messages: messagesChat, conversaciones: chatsSinLeer5.length})
                }
                

                
                setticketNoInteresadosFin2 = nuevosTicketsPendientesFin;

                setticketPagosFin([...ticketPagosFin,ticketSelect]);
                setticketPagos([...ticketPagos,ticketSelect]);
                setticketPagoFin2.push(ticketSelect)


                setcontTicketFiltro6(contTicketFiltro6Local-1)
                contTicketFiltro6Local -= 1 

                for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                    if(chatConMensajes[e].id == id){
                        chatConMensajes[e].idStatus = 3;
                    }
                }

                

                setcontTicketFiltro2(contTicketFiltro2Local+1)
                contTicketFiltro2Local += 1 

                if(ticketSelect.unreadMessages > 0){
                    var chatsSinLeer2 = [];
                    var messagesChat = 0;
                    for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                        if(chatConMensajes[e].idStatus == 3){
                            chatsSinLeer2.push(chatConMensajes[e])
                            messagesChat += chatConMensajes[e].unreadMessages;
                        }
                    }
                    if(chatsSinLeer2.length > 0){
                        setmessagesPagos({alert:1, messages: messagesChat, conversaciones: chatsSinLeer2.length})
                        setTimeout(() => {
                            setmessagesPagos(prevState => ({ ...prevState, alert: 0 }));
                        }, 2000);
                    }
                }
                // Actualizar los estados ticketPendientes y ticketPendientesFin con los nuevos arreglos
                setticketNoInteresados(nuevosTicketsPendientesFin);
                setticketNoInteresadosFin(nuevosTicketsPendientesFin);
            }
        
            

            setticketAbierto(prevTicket => ({
                ...prevTicket,
                idStatus: 3 
            }));
        })
        .catch(error => {
            console.log(error);
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte",
                icon: "error"
            })
        });
    }

    //aceptar un ticket 
    async function aceptarTicket(id){

        const div = document.getElementById(`optionTicketCola-${id}`);
        if (div) {
            //div.innerHTML = "<i class='bx bx-radio-circle bx-burst' style='margin-top:-5px'></i> Cargando..."; // Aquí defines el nuevo contenido del div
        }

        let nuevosTicketsPendientesFin = [...ticketPendientes];
        let ticketSelect = "";
        for (var i = nuevosTicketsPendientesFin.length - 1; i >= 0; i--) {
            if (nuevosTicketsPendientesFin[i].id === id) {
                ticketSelect = nuevosTicketsPendientesFin[i];
                break;
            }
        }

        setticketAbierto(ticketSelect);
        messagesChat = [];
        messagesChatFront = [];
        colaMultimedia = [];
        tieneMensajesPendientes = true;
        setcontenidosMessagesChat([]);
        cargarMessagesTicket(id,0);
        setticketAbierto(ticketSelect);
        setchatActivo(true);
        ticketAbierto2 = ticketSelect;
        ticketAceptado = false;
        setticketAbierto3(true);
        $("nav").css("display", "none");
    }   

    function noInteresadoTicket(datos){

        const swalWithReact = withReactContent(Swal);
        swalWithReact.fire({
            title: "Confirmación",
            html: "¿Esta segur@ que la persona no esta interesada?",
            showCancelButton: true,
            confirmButtonText: "Si", // Texto personalizado para el botón de confirmación
            cancelButtonText: "No", // Texto personalizado para el botón de cancelación
            allowOutsideClick: false
        }).then(async(result) => {
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
                await axios.post(process.env.ENDPOINT_API+'/whatsapp/noInteresadoTicket',
                    { 
                        ticket: datos.id,
                        usuario: usuario.user
                    }
                ).then(response => {
                    if(ticketAbierto2.idStatus == 1){
                        // Crear una copia del arreglo ticketPendientesFin
                        const nuevosTicketsPendientesFin = [...setticketPendientesFin2];
                        // Buscar el ticket con el ID dado
                        for (var i = nuevosTicketsPendientesFin.length - 1; i >= 0; i--) {
                            if (nuevosTicketsPendientesFin[i].id === datos.id) {
                                // Eliminar el ticket del arreglo
                                nuevosTicketsPendientesFin.splice(i, 1);
                                break;
                            }
                        }
                        // Actualizar los estados ticketPendientes y ticketPendientesFin con los nuevos arreglos
                        setticketPendientes(nuevosTicketsPendientesFin);
                        //setticketPendientesFin(nuevosTicketsPendientesFin);
                        setticketPendientesFin2 = nuevosTicketsPendientesFin;
                    }
                    if(ticketAbierto2.idStatus == 2){
                        setcontTicketFiltro1(contTicketFiltro1Local-1)
                        contTicketFiltro1Local -= 1 

                        //sin definir 
                        if(ticketAbierto2.processesid == 1){
                            setconTodosFiltro(prevCount => prevCount - 1);
                        }
                        //Interesado
                        if(ticketAbierto2.processesid == 2){
                            setconInteresadosFiltro(prevCount => prevCount - 1);
                        }
                        //pendiente pago
                        if(ticketAbierto2.processesid == 3){
                            setconPendientesPagoFiltro(prevCount => prevCount - 1);
                        }

                        for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                            if(chatConMensajes[e].id == ticketAbierto2.id){
                                chatConMensajes.splice(e, 1);
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
                        if(chatsSinLeer1.length > 0){
                            if(ticketAbierto2.unreadMessages > 0){
                                setmessagesInbox({alert:1, messages: messagesChat, conversaciones: chatsSinLeer1.length})
                                setTimeout(() => {
                                    setmessagesInbox(prevState => ({ ...prevState, alert: 0 }));
                                }, 2000);
                            }else{
                                setmessagesInbox({alert:0, messages: messagesChat, conversaciones: chatsSinLeer1.length})
                            }
                        }

                        // Crear una copia del arreglo ticketPendientesFin
                        const nuevosTicketsPendientesFin = [...setticketTrabajandoFin2];
                        // Buscar el ticket con el ID dado
                        for (var i = nuevosTicketsPendientesFin.length - 1; i >= 0; i--) {
                            if (nuevosTicketsPendientesFin[i].id === datos.id) {
                                // Eliminar el ticket del arreglo
                                nuevosTicketsPendientesFin.splice(i, 1);
                                break;
                            }
                        }
                        // Actualizar los estados ticketPendientes y ticketPendientesFin con los nuevos arreglos
                        setticketTrabajando(nuevosTicketsPendientesFin);
                        setticketTrabajandoFin(nuevosTicketsPendientesFin);
                        setticketTrabajandoFin2 = nuevosTicketsPendientesFin;
                    }

                    /*setticketNoInteresadosFin([...ticketNoInteresadosFin,ticketAbierto2]);
                    setticketNoInteresados([...ticketNoInteresadosFin,ticketAbierto2]);
                    setticketNoInteresadosFin2.push(ticketAbierto2)*/

                    swalWithReact.fire({
                        title: "Ticket",
                        text: "El ticket paso a no interesados.",
                        icon: "success",
                        showConfirmButton: false, // Ocultar el botón de confirmación
                        timer: 2000 // Cerrar automáticamente después de 2 segundos
                    });

                    if(ticketAbierto2.id == datos.id){
                        //ticketAbierto2 = [];
                        //setcontenidosMessagesChat([]);
                        //setticketAbierto(false);
                    }
                    
                })
                .catch(error => {
                    console.log(error);
                    // Manejar el error aquí
                    withReactContent(Swal).fire({
                        title: "Error",
                        text: "Comunica con soporte",
                        icon: "error"
                    })
                });
            }
        })
    }

    function reasignarTicket(datos){

        const swalWithReact = withReactContent(Swal);

        // Crear un elemento de selección
        const selectElement = document.createElement('select');
        selectElement.className = 'form-select';
        selectElement.innerHTML = `
            <option value="">Selecciona un asesor</option>
        `;
        for (var i = asesores.length - 1; i >= 0; i--) {
            selectElement.innerHTML += '<option value="'+asesores[i].id+'">'+asesores[i].name+'</option>'
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
        }).then(async(result) => {
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

                //acepta el ticket
                await axios.post(process.env.ENDPOINT_API+'/whatsapp/reasignarTicket',
                    { 
                        asesor: selectedOption,
                        ticket: datos.id,
                        usuario: usuario.user
                    }
                ).then(response => {
                    

                    var updatedTicketTrabajando = ticketTrabajando;
                    if(menuSeleccionado == 1){
                        if(menuSeleccionado2 == 2){
                            updatedTicketTrabajando = ticketPendientes;
                        }
                    }
                    if(menuSeleccionado == 2){
                        updatedTicketTrabajando = ticketPagos;
                    }
                    if(menuSeleccionado == 3){
                        updatedTicketTrabajando = ticketProduccion;
                    }
                    if(menuSeleccionado == 4){
                        updatedTicketTrabajando = ticketDespachados;
                    }
                    if(menuSeleccionado == 5){
                        updatedTicketTrabajando = ticketClientes;
                    }
                    if(menuSeleccionado == 6){
                        updatedTicketTrabajando = ticketNoInteresados;
                    }
                    
                    updatedTicketTrabajando = updatedTicketTrabajando.filter(ticketLocal => ticketLocal.id !== datos.id);

                    if(menuSeleccionado == 1){
                        
                        if(menuSeleccionado2 == 2){
                            setticketPendientes(updatedTicketTrabajando);
                            setticketPendientesFin2 = updatedTicketTrabajando;
                        }else{
                            setticketTrabajando(updatedTicketTrabajando);
                            setticketTrabajandoFin2 = updatedTicketTrabajando;
                        }
                        setcontTicketFiltro1(prevCount => prevCount - 1)
                    }
                    if(menuSeleccionado == 2){
                        setticketPagosFin2 = updatedTicketTrabajando;
                        setticketPagos(updatedTicketTrabajando);
                    }
                    if(menuSeleccionado == 3){
                        setticketProduccionFin2 = updatedTicketTrabajando;
                        setticketProduccion(updatedTicketTrabajando);
                    }
                    if(menuSeleccionado == 4){
                        setticketDespachadosFin2 = updatedTicketTrabajando;
                        setticketDespachados(updatedTicketTrabajando);
                    }
                    if(menuSeleccionado == 5){
                        setticketClientesFin2 = updatedTicketTrabajando;
                        setticketClientes(updatedTicketTrabajando);
                    }
                    if(menuSeleccionado == 6){
                        setticketNoInteresadosFin2 = updatedTicketTrabajando;
                        setticketNoInteresados(updatedTicketTrabajando);
                    }
                    cargarContadoresProcesos(usuarioId2)
                    swalWithReact.fire({
                        title: "Ticket reasignado",
                        text: "El ticket ha sido reasignado exitosamente.",
                        icon: "success",
                        showConfirmButton: false, // Ocultar el botón de confirmación
                        timer: 2000 // Cerrar automáticamente después de 2 segundos
                    });

                    if(ticketAbierto2.id == datos.id){
                        ticketAbierto2 = [];
                        setcontenidosMessagesChat([]);
                        setticketAbierto(false);
                    }
                    
                })
                .catch(error => {
                    console.log(error);
                    // Manejar el error aquí
                    withReactContent(Swal).fire({
                        title: "Error",
                        text: "Comunica con soporte",
                        icon: "error"
                    })
                });
            }
        });
    }

    function espiarChat(datos){
        idResponderMsg = 0;
        setreaccionMessage(false);
        messagesChat = [];
        messagesChatFront = [];
        colaMultimedia = [];
        tieneMensajesPendientes = true;
        setcontenidosMessagesChat([]);
        cargarMessagesTicket(datos.id,0);
        setticketAbierto(datos);
        setchatActivo(false);
        ticketAbierto2 = datos;
        setticketAbierto3(true);
        $("nav").css("display", "none");
    }

    function abrirTicket(datos){
        idResponderMsg = 0;
        setticketAbierto3(true);
        setreaccionMessage(false);
        ticketActivo = datos;
        messagesChat = [];
        colaMultimedia = [];
        tieneMensajesPendientes = true;
        messagesChatFront = [];
        setcontenidosMessagesChat([]);
        cargarMessagesTicket(datos.id,0);
        setticketAbierto(datos);
        setchatActivo(true);
        $("nav").css("display", "none");
        ticketAbierto2 = datos;
    }

    function volverTicket(){
        setticketAbierto3(false);
        $("nav").css("display", "flex");
    }

    async function cargarMessagesTicket(ticket,offset){
        
        //acepta el ticket
        await axios.post(process.env.ENDPOINT_API+'/whatsapp/cargarMessagesTicket',
            { 
                ticket: ticket,
                offset: offset
            }
        ).then(response => {
            
            offsetMessagesActivos = offset;

            if(offset == 0){
                mensajesCargadosTicket = [];
            }

            if(ticket == response.data.ticket && ticketAbierto2.id == response.data.ticket){
                if(offset == 0 && response.data.messages.length == 0){
                    const nuevoSpan = (<div style={{width:'100%',textAlign:'center'}}>No encontraron mensajes<b>VERIFICA EN EL MOVIL</b></div>)
                    setcontenidosMessagesChat([nuevoSpan])
                }else{
                    console.log(response.data.messages);
                    for (var i = response.data.messages.length - 1; i >= 0; i--) {
                        mensajesCargadosTicket.push(response.data.messages[i]);
                        let clase = response.data.messages[i].fromMe === 0 ? 'left' : 'right';
                        let fotomessage = response.data.messages[i].imageChat;
                        let fechaMessage = convertirFecha(response.data.messages[i].created);
                        let ackIcon = '';
                        for (var e = arrAck.length - 1; e >= 0; e--) {
                            if(arrAck[e].banderaAck == response.data.messages[i].ack){
                                ackIcon = arrAck[e].icon
                            }
                        }
                        if(response.data.messages[i].mediaKey != null && (response.data.messages[i].mediaKey != '0' && response.data.messages[i].mediaKey != 'undefined')){
                            let banderaAgrgearMultimedia = true;
                            for (var e = colaMultimedia.length - 1; e >= 0; e--) {
                                if(colaMultimedia[e].mediaKey == response.data.messages[i].mediaKey){
                                    banderaAgrgearMultimedia = false;
                                }
                            }
                            if(banderaAgrgearMultimedia){
                                colaMultimedia.unshift(response.data.messages[i]);
                            }
                        }
                        // Crear un nuevo elemento span
                        const nuevoSpan = (
                            <li className={`message ${clase}`} id={`message-${response.data.messages[i].id}`}>
                                <img title={response.data.messages[i].titleAsesor} className={`logo logo${clase}`} src={fotomessage} alt="" />
                                    {response.data.messages[i].idAnuncio > 0 && response.data.messages[i].anuncio.length > 0 ? (
                                        <div className={`mencionado-${clase}`}>
                                            {response.data.messages[i].anuncio[0].title}:
                                            <img style={{maxHeight:'100px',margin:'auto',marginTop:'2px'}} src={process.env.ENDPOINT_IMG+response.data.messages[i].anuncio[0].image}></img>
                                            <div style={{textAlign:'right',borderTop:'1px solid'}}>
                                                <a target="_blank" href={response.data.messages[i].anuncio[0].url}> <i className='bx bx-link' style={{marginRight:'-6px'}}></i> Anuncio</a>
                                            </div>
                                        </div>
                                    ):(null)}
                                    {response.data.messages[i].quotedMsg != 0 && response.data.messages[i].quotedMsg ? (
                                        response.data.messages[i].mencionado.length > 0 ? (
                                            response.data.messages[i].mencionado[0].mediaKey != null && (response.data.messages[i].mencionado[0].mediaKey != '0' && response.data.messages[i].mencionado[0].mediaKey != 'undefined')  ?  (
                                                <div className={`mencionado-${clase}`}>
                                                    <div className={`multimedia-${response.data.messages[i].mencionado[0].mediaKey}`}>
                                                        <p>
                                                            <i style={{marginTop:'-3px'}} className='bx bx-loader bx-spin'></i>
                                                            Cargando Multimedia
                                                        </p>
                                                    </div>
                                                    <p style={{textAlign:'left'}}>{response.data.messages[i].mencionado[0].body}</p>
                                                </div>
                                            ):(
                                                <div className={`mencionado-${clase}`}>{response.data.messages[i].mencionado[0].body}</div>
                                            )
                                        ):(<></>)
                                    ):(null)}
                                    {response.data.messages[i].mediaKey != null && (response.data.messages[i].mediaKey != '0' && response.data.messages[i].mediaKey != 'undefined') ? (
                                        <>
                                        {response.data.messages[i].typeMultimedia == 3 ? ( 
                                            <>
                                            <div className={`multimedia-${response.data.messages[i].mediaKey}`}>
                                                <p>
                                                    <i style={{marginTop:'-3px'}} className='bx bx-loader bx-spin'></i>
                                                    Cargando Multimedia
                                                </p>
                                            </div>
                                            <p style={{textAlign:'left'}}>{response.data.messages[i].body}</p>
                                            </>
                                        ):(
                                            <>
                                                <div style={{maxHeight:'35vh'}} className={`multimedia-${response.data.messages[i].mediaKey}`}>
                                                    <p>
                                                        <i style={{marginTop:'-3px'}} className='bx bx-loader bx-spin'></i>
                                                        Cargando Multimedia
                                                    </p>
                                                </div>
                                                <p style={{textAlign:'left'}}>{response.data.messages[i].body}</p>
                                            </>
                                        )} 
                                        </>
                                    ):(
                                        <p style={{textAlign:'left'}}>{response.data.messages[i].body}</p>
                                    )}
                                <span>
                                    
                                    <i style={{marginTop:'-3px'}} className={ackIcon}></i>
                                    {fechaMessage} 
                                    {response.data.messages[i].titleAsesor.length > 0 ? (
                                        <b style={{marginLeft:'5px'}}>({response.data.messages[i].titleAsesor})</b>
                                    ):null}
                                    <i id={response.data.messages[i].id} onClick={(event) => responderMessage(event.target.id)} style={{marginTop:'-3px',cursor:'pointer'}} className="bx bx-share"></i>
                                </span>
                            </li>
                        );

                        if(offset == 0){
                            setcontenidosMessagesChat([...messagesChatFront,nuevoSpan]);
                            messagesChat.push(response.data.messages[i])
                            messagesChatFront.push(nuevoSpan);
                        }else{
                            // Agregar el nuevo span a la lista de contenidosSpans
                            setcontenidosMessagesChat([nuevoSpan,...messagesChatFront]);
                            messagesChat.push(response.data.messages[i])
                            messagesChatFront.unshift(nuevoSpan);
                        }
                        
                        
                    }   

                    if(response.data.mensagesNext.length == 0){
                        tieneMensajesPendientes = false;
                    }
                    
                    if(offset == 0){
                        setTimeout(() => {
                            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
                        }, 100);
                    }
                    
                    
                    if(colaMultimedia.length > 0){
                        setTimeout(() => {
                            cargarMultimedia()
                        }, 100);
                    }
                }
                
            }
            
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

    function cancelaresponderMessage(){
        idResponderMsg = 0;
        setreaccionMessage(false);
    }

    const responderMessage = (id) => {

        idResponderMsg = id;
        let nuevoSpan; // Declarar nuevoSpan fuera del bloque condicional

        for (var i = mensajesCargadosTicket.length - 1; i >= 0; i--) {
            if (mensajesCargadosTicket[i].id == id) {
                let clase = mensajesCargadosTicket[i].fromMe === 0 ? 'left' : 'right';
                let color = "#4eadff";
                let fechaMessage = convertirFecha(mensajesCargadosTicket[i].created);
                let ackIcon = '';
                let persona = mensajesCargadosTicket[i].titleAsesor;
                if(mensajesCargadosTicket[i].fromMe == 0){
                    persona = ticketAbierto2.name
                }
                for (var e = arrAck.length - 1; e >= 0; e--) {
                    if (arrAck[e].banderaAck == mensajesCargadosTicket[i].ack) {
                        ackIcon = arrAck[e].icon;
                    }
                }

                if (mensajesCargadosTicket[i].multimedia === 1) {
                    nuevoSpan = (
                        <div style={{background: '#d1d1d1',height:'100%',borderLeft:`4px solid ${color}`}}>
                            <div>
                                <div className='row' style={{width:'100%',margin:'auto'}}>
                                    <div className='col-10' style={{color:`${color}`,padding:'0px 5px'}}>
                                        {persona}
                                    </div>
                                    <div className='col-2' onClick={(event) => cancelaresponderMessage()} style={{textAlign:'right',cursor:'pointer'}}>
                                        Cancelar
                                    </div>
                                </div>
                            </div>
                            <div style={{height: '83%',overflow: 'auto'}}>
                                <div> <i className='bx bx-loader bx-spin'></i> Contenido multimedia</div>
                                <p>{mensajesCargadosTicket[i].body}</p>
                            </div>
                        </div>
                    );
                } else {
                    nuevoSpan = (
                        <div style={{background: '#d1d1d1',height:'100%',borderLeft:`4px solid ${color}`}}>
                            <div>
                                <div className='row' style={{width:'100%',margin:'auto'}}>
                                    <div className='col-10' style={{color:`${color}`,padding:'0px 5px'}}>
                                        {persona}
                                    </div>
                                    <div className='col-2' onClick={(event) => cancelaresponderMessage()} style={{textAlign:'right',cursor:'pointer'}}>
                                        Cancelar
                                    </div>
                                </div>
                            </div>
                            <div style={{height: '83%',overflow: 'auto'}}>
                                <p>{mensajesCargadosTicket[i].body}</p>
                            </div>
                        </div>
                    );
                }

                setresponseDiv(nuevoSpan);
            }
        }   

        setreaccionMessage(true);
    }

    const handleScrollFiltro = (bandera) => (event) => {
        const { scrollTop, clientHeight, scrollHeight } = event.target;
        // Check if user has scrolled to the bottom
        if ((scrollTop + clientHeight + 2) >= scrollHeight) {
            if(bandera == 1){
                if(consultando1 == false){
                    consultando1 = true;
                    if(menuSeleccionado1 == 1){
                        cargarTicketsTrabajando(usuario.user,(offsetActivo+50))
                    }else{
                        cargarTicketsPendientes(usuario.user,(offsetActivo+50))
                    }
                }
            }
            if(bandera == 2){
                if(consultando1 == false){
                    consultando1 = true;
                    cargarTicketsPagos(usuario.user,(offsetActivo+50))
                }
            }
            if(bandera == 6){
                if(consultando1 == false){
                    consultando1 = true;
                    cargarTicketsNoInteresados(usuario.user,(offsetActivo+50))
                }
            }
        }
    }

    const handleScroll = (event) => {
        const div = event.target;
        if (div.scrollTop === 0) {
            if(banderaConsultandoMessages == false && tieneMensajesPendientes == true && messagesChat.length > 0 && ticketAbierto == true){
                const chatContainer = document.querySelector('.chat-container');
                idMessage = messagesChat[0].id;
                banderaConsultandoMessages = true;
                
                cargarMessagesTicket(ticketAbierto2.id,(offsetMessagesActivos+100))
                setTimeout(() => {
                    const messageDiv = document.getElementById('message-'+idMessage);
                    chatContainer.scrollTop = messageDiv.offsetTop;
                    banderaConsultandoMessages = false;
                }, 100);
            }
        }
    };

    async function cargarMultimedia(){
        if(colaMultimedia.length > 0){
            //acepta el ticket
            await axios.post(process.env.ENDPOINT_API+'/whatsapp/cargarMultimediaMessage',{ 
                id: colaMultimedia[0].id
            }).then(response => {
                if(response.data.message != undefined){
                    
                    // Encuentra el elemento multimedia en el DOM usando el mediaKey
                    const multimediaElements = document.getElementsByClassName(`multimedia-${response.data.message.mediaKey}`);

                    // Si se encontraron elementos multimedia
                    if (multimediaElements.length > 0) {
                        console.log(response.data.message);
                        //es una imagen o un sticker
                        if(response.data.message.mimeType.includes("image")){
                            // Itera sobre todos los elementos multimedia encontrados
                            Array.from(multimediaElements).forEach(multimediaElement => {
                                // Crea un nuevo elemento <img> con la URL de la imagen multimedia
                                const imagenElement = document.createElement('img');
                                if (response.data.message.body.includes("/static/") || response.data.message.body.includes("/upload/") || response.data.message.body.includes("/multimedia/")) {
                                    imagenElement.src = process.env.ENDPOINT_API+'/static/'+response.data.message.body;
                                    imagenElement.alt = 'Multimedia';
                                }else{
                                    imagenElement.src = 'data:'+response.data.message.mimeType+';base64,'+response.data.message.body;
                                    imagenElement.alt = 'Multimedia';
                                }
                                

                                //aplicar css
                                imagenElement.style.height = '35vh';
                                imagenElement.style.width = 'auto';
                                imagenElement.style.margin = 'auto';
                                imagenElement.style.paddingRight = '10px';
                                imagenElement.style.paddingTop = '10px';

                                // Elimina cualquier contenido existente del elemento multimedia
                                multimediaElement.innerHTML = '';

                                // Agrega el nuevo elemento <img> al elemento multimedia
                                multimediaElement.appendChild(imagenElement);
                            });
                        }

                        //es una nota de voz
                        if(response.data.message.mimeType.includes("audio")){
                            // Itera sobre todos los elementos multimedia encontrados
                            Array.from(multimediaElements).forEach(multimediaElement => {
                                // Crear un elemento de audio
                                var audio = document.createElement('audio');

                                if (response.data.message.body.includes("/static/") || response.data.message.body.includes("/upload/") || response.data.message.body.includes("/multimedia/")) {
                                    // Establecer el atributo src con los datos de la nota de voz en base64
                                    audio.src = process.env.ENDPOINT_API+'/static/'+response.data.message.body;

                                }
                                else if (response.data.message.body.includes("audio_")){
                                    // Establecer el atributo src con los datos de la nota de voz en base64
                                    audio.src = process.env.ENDPOINT_API+'/static/upload/'+response.data.message.body;
                                }else{
                                    // Establecer el atributo src con los datos de la nota de voz en base64
                                    audio.src = "data:audio/ogg;codecs=opus;base64,"+response.data.message.body;
                                }
                                
                                audio.style.marginTop = '10px';
                                audio.style.maxWidth = '100%'
                                // Agregar controles de reproducción
                                audio.controls = true;
                                
                                multimediaElement.innerHTML = '';
                                // Agregar el elemento de audio al cuerpo del documento
                                multimediaElement.appendChild(audio);
                            })
                        }

                        //es un documento
                        if(response.data.message.typeWhatsapp == 4){
                            // Itera sobre todos los elementos multimedia encontrados
                            Array.from(multimediaElements).forEach(multimediaElement => {
                                //es una imagen como documento
                                if (response.data.message.mimeType.startsWith('application/pdf')) {
                                    /// Crea un nuevo elemento <iframe>
                                    const iframeElement = document.createElement('iframe');

                                    if (response.data.message.body.includes("/static/") || response.data.message.body.includes("/upload/") || response.data.message.body.includes("/multimedia/")) {
                                        iframeElement.src = process.env.ENDPOINT_API+'/static/'+response.data.message.body;
                                    }else{
                                        // Establece el contenido del iframe con la URL del documento Base64
                                        iframeElement.src = 'data:'+response.data.message.mimeType+';base64,'+response.data.message.body;
                                    }
                                    

                                    // Aplica estilos CSS
                                    iframeElement.style.height = '40vh'; // ajusta la altura según sea necesario
                                    iframeElement.style.width = '100%'; // ajusta el ancho según sea necesario

                                    // Elimina cualquier contenido existente del elemento multimedia
                                    multimediaElement.innerHTML = '';

                                    // Agrega el nuevo elemento <iframe> al elemento multimedia
                                    multimediaElement.appendChild(iframeElement);
                                }else{
                                    multimediaElement.innerHTML = 'Documento pendiente descarga'
                                }
                            })
                        }

                        //es un video
                        if(response.data.message.typeWhatsapp == 5){
                            // Itera sobre todos los elementos multimedia encontrados
                            Array.from(multimediaElements).forEach(multimediaElement => {
                                // Crear un elemento de video
                                var video = document.createElement('video');

                                if (response.data.message.body.includes("/static/") || response.data.message.body.includes("/upload/") || response.data.message.body.includes("/multimedia/")) {
                                    video.src = process.env.ENDPOINT_API+'/static/'+response.data.message.body;
                                }else{
                                    // Establecer el atributo src con los datos del video en base64
                                    video.src = "data:"+response.data.message.mimeType+";base64," + response.data.message.body;
                                }

                                video.style.marginTop = '10px';
                                video.style.maxHeight = '40vh';
                                video.style.margin = 'auto';

                                // Agregar controles de reproducción
                                video.controls = true;

                                // Limpiar el contenido existente del elemento multimedia
                                multimediaElement.innerHTML = '';

                                // Agregar el elemento de video al contenedor multimedia
                                multimediaElement.appendChild(video);
                            })
                        }

                        colaMultimedia.shift();
                        if(colaMultimedia.length > 0){
                            cargarMultimedia()
                        }
                    }
                }else{
                    colaMultimedia.shift();
                    cargarMultimedia();
                }
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
    }

    //function ver galeria
    async function galeriaOpen(){
        setOpenGaleria(true);
        // Obtener todos los elementos <div> con la clase opacityOpen
        const elements = document.querySelectorAll('.opacityOpen');

        // Iterar sobre cada elemento y aplicar la opacidad
        elements.forEach(element => {
            element.style.opacity = '0.2';
        });
    }

    async function galeriaClose(){
        setOpenGaleria(false);
        // Obtener todos los elementos <div> con la clase opacityOpen
        const elements = document.querySelectorAll('.opacityOpen');

        // Iterar sobre cada elemento y aplicar la opacidad
        elements.forEach(element => {
            element.style.opacity = '1';
        });
    }

    

    //caraga el detalle de la multimedia
    async function detallModalMultimedia(id){
        tokenLoading3 = 0;
        idRespuesta = id;
        typeRespuesta = 2;
        //acepta el ticket
        await axios.post(process.env.ENDPOINT_API+'/whatsapp/cargarInfMultimedia',{ 
            id: id
        }).then(response => {
            setTimeout(()=>{
                if(response.data.multimedia.message.length > 0){
                    let textoMessage = response.data.multimedia.message;

                    // cambia el nombre por el asesor
                    textoMessage = textoMessage.replace(/-AS-/g, usuario.nombre);

                    textareaPrueba2.data("emojioneArea").setText(textoMessage);
                }else{
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

    function editarInfoContacto(){
        if(ticketAbierto2.name == 'undefined'){
            setinputName("");
        }else{
            setinputName(ticketAbierto2.name);
        }
        setmodalEditarInf(true);
    }

    const handleInputChange = (event) => {
        setinputName(event.target.value); // Actualiza el estado con el valor del input
    };

    //cierra la modal
    function cerrarModal(){
        setmodalDetallMultimedia(false);
        setmodalsubirArchivos(false);
        setmodalEditarInf(false);
    }

    //envia el mensaje de la multimedia
    async function enviarMensajeMultimedia(){
        let mensaje = textareaPrueba2.data("emojioneArea").getText()

        if(ticketAceptado == false){
            ticketAceptado = true
            //acepta el ticket
            await axios.post(process.env.ENDPOINT_API+'/whatsapp/aceptarTicket',{ 
                ticket: ticketAbierto2.id,
                usuario: usuario.user,
                
            }).then(response => {
                
                setticketAbierto(prevState => ({
                    ...prevState,  // Copiar el estado anterior
                    processesid: 1, // actualiza el proceso actual del ticket abierto
                    idStatus: 2 
                }));
                var updatedTicketTrabajando = setticketPendientesFin2;
                updatedTicketTrabajando = updatedTicketTrabajando.filter(ticketLocal => ticketLocal.id !== ticketAbierto2.id);
                //actualiza el arreglo de los tickets Pendientes
                setticketPendientesFin2 = updatedTicketTrabajando
                setticketPendientes(updatedTicketTrabajando);
                //aumenta los contadores
                setticketPendientesFin(prevCount => prevCount - 1);
                setticketTrabajandoFin(prevCount => prevCount + 1);
            })
        }

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
                        <audio controls style={{marginTop:'10px'}}>
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
        await axios.post(process.env.ENDPOINT_API+'/whatsapp/enviarMensajeMultimedia',{ 
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
            if(div){
                // Cambiar la clase del div
                div.className = ackIcon;
                div.style.color = "#4ccf2b"
            }

            idRespuesta = 0;
            typeRespuesta = 0;
        })
    }

    const handleMouseOver = (id) => {
        const video = document.getElementById('video-'+id);
        if (video) {
          video.play();
          setTimeout(() => {
            video.pause();
            video.currentTime = 0;
          }, 10000);
        }
    };
    
    const onMouseOut = (id) => {
        const video = document.getElementById('video-'+id);
        if (video) {
          video.pause();
          video.currentTime = 0;
        }
    };

    const handleMouseOverAudio = (id)=>{
        const audioElement = document.getElementById('audio-'+id);
        if (audioElement) {
        audioElement.play();
        }
    }

    const onMouseOutAudio = (id) => {
        const audioElement = document.getElementById('audio-'+id);
        if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0; // Reiniciar el audio para que comience desde el principio la próxima vez
        }
    }

    function verTodoMultimedia(datos){
        itemDetalleMultimedia = 1;
        idCategoriaMultimediaDetalle = datos.id;
        setdivdetallMultimedia([]);
        setcategoriasMultimediaDetall(datos);
        setbanderaverTodoMultimedia(true);
        cargarTodoMultimediaDetalle();
    }

    async function cargarTodoMultimediaDetalle(){
        if(categoriasMultimediaDetall != undefined){
            idCategoriaMultimediaDetalle = categoriasMultimediaDetall.id;
        }
        //acepta el ticket
        await axios.post(process.env.ENDPOINT_API+'/whatsapp/cargarMultimediaMessageDetall',{ 
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

    function cambiarTipoDetallMultimedia(tipo){
        itemDetalleMultimedia = tipo;
        setdivdetallMultimedia([]);
        cargarTodoMultimediaDetalle()
    }

    function closeDetalleMultimedia(){
        setbanderaverTodoMultimedia(false);
    }

    const handleBusquedaMultimedia = async (event) => {
        const valorBusqueda = event.target.value;
        if(valorBusqueda.length > 0 ){
            setBanderaConsultandoMultimedia(true)
            try {
                await axios.post(process.env.ENDPOINT_API+'/whatsapp/cargarMultimediaMessageBusqueda',{ 
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
        }else{
            setBanderaConsultandoMultimedia(false)
        }
      };

    function enviarArchivoOpen(){
        tokenLoading4 = 0;
        setTimeout(()=>{
            if(textareaPrueba4 != 0){
                textareaPrueba4.data("emojioneArea").setText('');
            }
        }, 100);
        setmodalsubirArchivos(true);
        setFile(null);
        setalertFile(false);
    }

    const handleChangeFile = (file) => {
        setFile(file[0]);

        urlSelect = URL.createObjectURL(file[0]);
    }

    async function enviarMensajeArchivo(){
        if(file == null){
            setalertFile(true);
        }else{
            const formData = new FormData();

            if(ticketAceptado == false){
                ticketAceptado = true
                //acepta el ticket
                await axios.post(process.env.ENDPOINT_API+'/whatsapp/aceptarTicket',{ 
                    ticket: ticketAbierto2.id,
                    usuario: usuario.user
                }).then(response => {
                    setticketAbierto(prevState => ({
                        ...prevState,  // Copiar el estado anterior
                        processesid: 1, // actualiza el proceso actual del ticket abierto
                        idStatus: 2 
                    }));
                    var updatedTicketTrabajando = setticketPendientesFin2;
                    updatedTicketTrabajando = updatedTicketTrabajando.filter(ticketLocal => ticketLocal.id !== ticketAbierto2.id);
                    //actualiza el arreglo de los tickets Pendientes
                    setticketPendientesFin2 = updatedTicketTrabajando
                    setticketPendientes(updatedTicketTrabajando);
                    //aumenta los contadores
                    setticketPendientesFin(prevCount => prevCount - 1);
                    setticketTrabajandoFin(prevCount => prevCount + 1);
                })
            }

            let clase = 'right';
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
            var nuevaCadena = textareaPrueba4.data("emojioneArea").getText().replace(/\n/g, "\n").trim();
            let nuevoSpan;

            nuevoSpan = (
                <li className={`message ${clase}`}>
                <img title={usuario.nombre} className={`logo logo${clase}`} src={usuario.foto} alt="" />
                {file.type.includes("image") ? (
                    <img style={{height: '45vh',background:'none',width: 'auto',paddingRight: '10px',paddingTop: '10px'}} src={urlSelect} alt="" />
                ) : file.type.includes("audio") ? (
                    <div style={{textAlign: 'center',marginTop: '20px',marginBottom: '20px'}}>
                        <audio controls style={{marginTop:'10px'}}>
                            <source src={urlSelect} type="audio/ogg"></source>
                        </audio>
                    </div>
                ): file.type.includes("video") ? (
                    <video
                    src={urlSelect}
                    style={{height: '45vh',background:'none',width: 'auto',paddingRight: '10px',paddingTop: '10px',margin:'auto'}}
                    controls='true'
                    ></video>
                ):
                    <iframe
                    src={urlSelect}
                    style={{height: '500px',width: '100%'}}
                    ></iframe>
                }
                <p>{nuevaCadena}</p>
                <span>
                    <i id={usuario.user+'-'+hora} style={{marginTop:'-3px'}} className={ackIcon}></i>
                    {fechaMessage} 
                    <b style={{marginLeft:'5px'}}>({usuario.nombre})</b>
                </span>
                </li>
            );

            // Agregar el nuevo span a la lista de contenidosSpans
            setcontenidosMessagesChat([...messagesChatFront, nuevoSpan]);

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

            //messagesChat.push(data.message)
            messagesChatFront.push(nuevoSpan);

            setTimeout(() => {
                messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
            }, 100);


            formData.append("file", file);
            formData.append("ticket", ticketAbierto2.id);
            formData.append('message',textareaPrueba4.data("emojioneArea").getText());
            formData.append("usuario",usuario.user);
            formData.append("idLocal",usuario.user+'-'+hora)


            await axios.post(process.env.ENDPOINT_API+'/whatsapp/upload', formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }).then(response => {
                var div = document.getElementById(response.data.idLocal);
                let ackIcon = '';
                for (var e = arrAck.length - 1; e >= 0; e--) {
                    if(arrAck[e].banderaAck == 5){
                        ackIcon = arrAck[e].icon
                    }
                }
                if(div){
                    // Cambiar la clase del div
                    div.className = ackIcon;
                    div.style.color = "#4ccf2b"
                }
                idRespuesta = 0;
                typeRespuesta = 0;
            })
            .catch(error => {
                const swalWithReact = withReactContent(Swal);
                // Manejar el error aquí
                withReactContent(Swal).fire({
                    title: "Error",
                    text: "Comunica con soporte",
                    icon: "error"
                })
            });

            setmodalsubirArchivos(false);
        }
    }

    function abrirAtajos(){
        setrespuestasRapidas(atajosFin)
        setShowDropdown(true);
    }

    function cerrarAtajos(){
        setShowDropdown(false);
    }

    function handleChangeAtajos(event){
        setInputValueAtajo(event.target.value);
        if(event.target.value.length > 0){

            let atajosFil = [];
            for (var i = atajosFin.length - 1; i >= 0; i--) {
                //busca por el nombre
                if(atajosFin[i].title.toLowerCase().includes(event.target.value.toLowerCase())){
                    atajosFil.push(atajosFin[i])
                }
                //busca por el nombre
                else if(atajosFin[i].text.toLowerCase().includes(event.target.value.toLowerCase())){
                    atajosFil.push(atajosFin[i])
                }
            }
            setrespuestasRapidas(atajosFil)
                    
            setShowDropdown(true);
        }else{
            setShowDropdown(false);
        }
    }

    function atajoClick(datos){
        idRespuesta = datos.id;
        typeRespuesta = 1;
        textareaPrueba.data("emojioneArea").setText(datos.text);
        setShowDropdown(false);
        setInputValueAtajo('');
    }

    async function editarInfContacto(){
        //acepta el ticket
        await axios.post(process.env.ENDPOINT_API+'/whatsapp/editInfContacto',{ 
            ticket: ticketAbierto2.id,
            name: inputName
        }).then(response => {
            setticketAbierto(prevState => ({
                ...prevState,  // Copiar el estado anterior
                nameLabel: inputName,
                name: inputName
            }));
            ticketAbierto2.name = inputName;
            setmodalEditarInf(false);

            var updatedTicketTrabajando = setticketTrabajandoFin2;
            if(menuSeleccionadoPrincipal == 1){
                if(menuSeleccionado2 == 2){
                    updatedTicketTrabajando = setticketPendientesFin2;
                }
            }
            if(menuSeleccionadoPrincipal == 2){
                updatedTicketTrabajando = setticketPagosFin2;
            }
            if(menuSeleccionadoPrincipal == 3){
                updatedTicketTrabajando = setticketProduccionFin2;
            }
            if(menuSeleccionadoPrincipal == 4){
                updatedTicketTrabajando = setticketDespachadosFin2;
            }
            if(menuSeleccionadoPrincipal == 5){
                updatedTicketTrabajando = setticketClientesFin2;
            }
            if(menuSeleccionadoPrincipal == 6){
                updatedTicketTrabajando = setticketNoInteresadosFin2;
            }
                            
            var select = "";
            var updatedTicketTrabajando2 = updatedTicketTrabajando.map(ticketLocal => {
                // Verificar si el ID del ticket es igual a 1
                if (ticketLocal.id === ticketAbierto2.id) {
                    ticketLocal['nameLabel'] = inputName;
                    select = ticketLocal;
                    return ticketLocal;
                } else {
                    // Si el ID no coincide, simplemente devolver el ticket sin cambios
                    return ticketLocal;
                }
            });

            if(select != ""){

                if(menuSeleccionadoPrincipal == 1){
                    if(menuSeleccionado2 == 2){
                        setticketPendientesFin2 = updatedTicketTrabajando2;
                        setticketPendientes(updatedTicketTrabajando2);
                    }else{
                        setticketTrabajandoFin2 = updatedTicketTrabajando2;
                        setticketTrabajando(updatedTicketTrabajando2); 
                    }
                }

                if(menuSeleccionadoPrincipal == 2){
                    setticketPagoFin2 = updatedTicketTrabajando2;
                    setticketPago(updatedTicketTrabajando2); 
                }

                if(menuSeleccionadoPrincipal == 3){
                    setticketProduccionFin2 = updatedTicketTrabajando2;
                    setticketProduccion(updatedTicketTrabajando2); 
                }

                if(menuSeleccionadoPrincipal == 4){
                    setticketDespachadosFin2 = updatedTicketTrabajando2;
                    setticketDespachados(updatedTicketTrabajando2); 
                }

                if(menuSeleccionadoPrincipal == 5){
                    setticketClientesFin2 = updatedTicketTrabajando2;
                    setticketClientes(updatedTicketTrabajando2); 
                }

                if(menuSeleccionadoPrincipal == 6){
                    setticketNoInteresadosFin2 = updatedTicketTrabajando2;
                    setticketNoInteresados(updatedTicketTrabajando2); 
                }
            }
                           

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

    async function marcarComoLeido(){
        setticketAbierto(prevState => ({
            ...prevState,  // Copiar el estado anterior
            unreadMessages: 0
        }));
        
        const swalWithReact = withReactContent(Swal);
        swalWithReact.fire({
            title: "Confirmación",
            html: "¿Marcar chat como leido?",
            showCancelButton: true,
            confirmButtonText: "Si", // Texto personalizado para el botón de confirmación
            cancelButtonText: "No", // Texto personalizado para el botón de cancelación
            allowOutsideClick: false
        }).then(async(result) => {
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
                await axios.post(process.env.ENDPOINT_API+'/whatsapp/marcharChatLeido',
                    { 
                        ticket: ticketAbierto2.id,
                        usuario: usuario.user
                    }
                ).then(response => {

                    var updatedTicketTrabajando = setticketTrabajandoFin2;
                    if(menuSeleccionado == 1){
                        if(menuSeleccionado2 == 2){
                            updatedTicketTrabajando = setticketPendientesFin2;
                        }
                    }
                    if(menuSeleccionado == 2){
                        updatedTicketTrabajando = setticketPagosFin2;
                    }
                    if(menuSeleccionado == 3){
                        updatedTicketTrabajando = setticketProduccionFin2;
                    }
                    if(menuSeleccionado == 4){
                        updatedTicketTrabajando = setticketDespachadosFin2;
                    }
                    if(menuSeleccionado == 5){
                        updatedTicketTrabajando = setticketClientesFin2;
                    }
                    if(menuSeleccionado == 6){
                        updatedTicketTrabajando = setticketNoInteresadosFin2;
                    }
                    var updatedTicketTrabajando2 = updatedTicketTrabajando.map(ticketLocal => {
                        // Verificar si el ID del ticket es igual a 1
                        if (ticketAbierto2.id === ticketLocal.id) {
                            return {
                                ...ticketLocal,
                                unreadMessages: 0
                            };
                        }else{
                            return ticketLocal;
                        }
                    })

                    setticketTrabajando(updatedTicketTrabajando2);
                    setticketTrabajandoFin2 = updatedTicketTrabajando2;
                    if(menuSeleccionado == 1){
                        if(menuSeleccionado2 == 2){
                            setticketPendientesFin2 = updatedTicketTrabajando;
                            setticketPendientes(updatedTicketTrabajando2);
                        }
                    }
                    if(menuSeleccionado == 2){
                        setticketPagosFin2 = updatedTicketTrabajando2;
                        setticketPagos(updatedTicketTrabajando2);
                    }
                    if(menuSeleccionado == 3){
                        setticketProduccionFin2 = updatedTicketTrabajando2;
                        setticketProduccion(updatedTicketTrabajando2);
                    }
                    if(menuSeleccionado == 4){
                        setticketDespachadosFin2 = updatedTicketTrabajando2;
                        setticketDespachados(updatedTicketTrabajando2);
                    }
                    if(menuSeleccionado == 5){
                        setticketClientesFin2 = updatedTicketTrabajando2;
                        setticketClientes(updatedTicketTrabajando2);
                    }
                    if(menuSeleccionado == 6){
                        setticketNoInteresadosFin2 = updatedTicketTrabajando2;
                        setticketNoInteresados(updatedTicketTrabajando2);
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
                    setmessagesInbox({alert:0, messages: messagesChat, conversaciones: chatsSinLeer1.length})
                    
                    

                    var chatsSinLeer2 = [];
                    var messagesChat = 0;
                    for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                        if(chatConMensajes[e].idStatus == 3){
                            chatsSinLeer2.push(chatConMensajes[e])
                            messagesChat += chatConMensajes[e].unreadMessages;
                        }
                    }
                    
                    setmessagesPagos({alert:0, messages: messagesChat, conversaciones: chatsSinLeer2.length})
                    
                    
                    var chatsSinLeer3 = [];
                    var messagesChat = 0;
                    for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                        if(chatConMensajes[e].idStatus == 4){
                            chatsSinLeer3.push(chatConMensajes[e])
                            messagesChat += chatConMensajes[e].unreadMessages;
                        }
                    }
                    setmessagesProduccion({alert:0, messages: messagesChat, conversaciones: chatsSinLeer3.length})
                    

                    var chatsSinLeer4 = [];
                    var messagesChat = 0;
                    for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                        if(chatConMensajes[e].idStatus == 5){
                            chatsSinLeer4.push(chatConMensajes[e])
                            messagesChat += chatConMensajes[e].unreadMessages;
                        }
                    }
                    setmessagesDespacho({alert:0, messages: messagesChat, conversaciones: chatsSinLeer4.length})
                    
                    var chatsSinLeer5 = [];
                    var messagesChat = 0;
                    for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                        if(chatConMensajes[e].idStatus == 6){
                            chatsSinLeer5.push(chatConMensajes[e])
                            messagesChat += chatConMensajes[e].unreadMessages;
                        }
                    }
                    setmessagesClientes({alert:0, messages: messagesChat, conversaciones: chatsSinLeer5.length})
                    
                    

                    var chatsSinLeer6 = [];
                    var messagesChat = 0;
                    for (var e = chatConMensajes.length - 1; e >= 0; e--) {
                        if(chatConMensajes[e].idStatus == 7){
                            chatsSinLeer6.push(chatConMensajes[e])
                            messagesChat += chatConMensajes[e].unreadMessages;
                        }
                    }
                    setmessagesNoInteresados({alert:0, messages: messagesChat, conversaciones: chatsSinLeer6.length})
                    

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

    return (
        <>

            <Modal show={modalEditarInf} className="modal-lg" onHide={cerrarModal}>
                <Modal.Header style={{borderBottom: '2px solid #ababab'}} closeButton>
                    <Modal.Title>Contacto</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{paddingTop:'30px'}}>
                        <div className="col-md-12">
                            <label  className="form-label">Nombre</label>
                            <input className="form-control" type="text" onChange={handleInputChange} value={inputName} />
                        </div>
                        <div className='col-12'>
                            <button onClick={editarInfContacto} className="btn btn-primary" style={{marginTop:'10px',width:'100%',background:'#222d32',color:'white'}}>Actualizar</button>
                        </div>
                </Modal.Body>
            </Modal>

            <Modal show={modalsubirArchivos} className="modal-lg" onHide={cerrarModal}>
                <Modal.Header style={{borderBottom: '2px solid #ababab'}} closeButton>
                    <Modal.Title>Subir Archivo</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{paddingTop:'0px'}}>
                    <div className='row'>
                        {alertFile ? (
                            <div style={{color:'red',marginTop:'10px'}} className="alert alert-danger">
                                Debes elegir un archivo
                            </div>
                        ):(null)}
                        <div style={{width:'auto',margin:'auto',marginTop:'20px'}} id='divFile'>
                            <FileUploader
                                multiple={true}
                                handleChange={handleChangeFile}
                                name="file"
                            />
                            <p>{file ? `Nombre del archivo: ${file.name}` : "Aún no se han subido archivos"}</p>
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
                            <button onClick={enviarMensajeArchivo} className="btn btn-primary" style={{marginTop:'10px',width:'100%',background:'#222d32',color:'white'}}>Enviar Mensaje</button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>

            <Modal show={modalDetallMultimedia} className="modal-lg" onHide={cerrarModal}>
                <Modal.Header style={{borderBottom: '2px solid #ababab'}} closeButton>
                    <Modal.Title>Detalle</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{paddingTop:'0px'}}>
                    <div className='row'>
                        {detallMultimedia && (
                            <>
                                <div className='col-12' style={{textAlign:'center'}}>
                                    {detallMultimedia.typeId == 1 ? (
                                        <>
                                        <img 
                                            src={process.env.ENDPOINT_API+'/static/'+detallMultimedia.mediaUrl}
                                            style={{padding:'10px',maxHeight:'67vh',margin:'auto'}}
                                        >
                                        </img>
                                        </>
                                    ):detallMultimedia.typeId == 2 ? (
                                        <>
                                            <video
                                                src={process.env.ENDPOINT_API+'/static/'+detallMultimedia.mediaUrl}
                                                style={{padding:'10px',maxHeight:'67vh',margin:'auto'}}
                                                controls='true'
                                            ></video>
                                        </>
                                    ):detallMultimedia.typeId == 3 ? (
                                        <>
                                            <div style={{textAlign: 'center',marginTop: '20px',marginBottom: '20px'}}>
                                                <audio style={{height:'45px',margin:'auto',width:'80%'}} controls src={process.env.ENDPOINT_API+'/static/'+detallMultimedia.mediaUrl}></audio>
                                            </div>
                                        </>
                                    ):(
                                        <>
                                            <iframe
                                                style={{width: '80%',margin: 'auto',height: '60vh',maxHeight: '60vh',marginTop: '10px',marginBottom: '10px'}} 
                                                src={process.env.ENDPOINT_API+'/static/'+detallMultimedia.mediaUrl}>
                                            </iframe>
                                        </>
                                    )}
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
                                    <button onClick={enviarMensajeMultimedia} className="btn btn-primary" style={{marginTop:'10px',width:'100%',background:'#222d32',color:'white'}}>Enviar Mensaje</button>
                                </div>
                            </>
                        )}
                        
                        
                    </div>
                </Modal.Body>
            </Modal>

            <div className="opacityOpen" style={ticketAbierto3 ? { display:'none' } : { display: 'block' }}>
                <div className="row">
                    <div className="card mb-4" >
                        <div className="card-body">
                            <div className="row">
                                <div className="col-12" style={ticketAbierto3 ? { display:'none' } : { display: 'block' }}>
                                    <div style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
                                        <div className={` ${menuSeleccionado === 1 ? 'menu-activo' : ''}`} onClick={() => cambioMenuPrincipal(1)} style={{ display: 'inline-block', textAlign:'center',borderRight: '3px solid #b7b7b7',padding:'2px 5px',cursor:'pointer',height:'68px'}}>
                                            <span style={{textAlign:'left',width: '100%',display: 'block',fontSize:'12px'}}>Inbox: {contTicketFiltro1} Conv.</span>
                                            <i className="menu-icon tf-icons bx bxs-inbox"></i>
                                            <br/>
                                            {messagesInbox.messages > 0 ? (
                                                <span style={{display:'table',background: messagesInbox.alert === 1 ? '#279b0a' : 'red',color: 'white',borderRadius: '20px',padding: '3px 10px',fontSize: '12px'}}>{messagesInbox.messages} Mess. - {messagesInbox.conversaciones} Conv.</span>
                                            ) : null}
                                        </div>
                                        <div className={` ${menuSeleccionado === 2 ? 'menu-activo' : ''}`} onClick={() => cambioMenuPrincipal(2)} style={{ display: 'inline-block', textAlign:'center',borderRight: '3px solid #b7b7b7',cursor:'pointer',padding:'2px 5px',height:'68px'}}>
                                            <span style={{textAlign:'left',width: '100%',display: 'block',fontSize:'12px'}}>Pagos: {contTicketFiltro2} Conv.</span>
                                            <i className="menu-icon tf-icons bx bx-dollar"></i>
                                            <br/>
                                            {messagesPagos.messages > 0 ? (
                                                <span style={{display:'table',background: messagesPagos.alert === 1 ? '#279b0a' : 'red',color: 'white',borderRadius: '20px',padding: '3px 10px',fontSize: '12px'}}>{messagesPagos.messages} Mess. - {messagesPagos.conversaciones} Conv.</span>
                                            ) : null}
                                        </div>
                                        <div className={` ${menuSeleccionado === 3 ? 'menu-activo' : ''}`} onClick={() => cambioMenuPrincipal(3)} style={{ display: 'inline-block', textAlign:'center',borderRight: '3px solid #b7b7b7',cursor:'pointer',padding:'2px 5px',height:'68px'}}>
                                            <span style={{textAlign:'left',width: '100%',display: 'block',fontSize:'12px'}}>En Producción: {contTicketFiltro3} Conv.</span>
                                            <i className="menu-icon tf-icons bx bx-building-house"></i>
                                            <br/>
                                            {messagesProduccion.messages > 0 ? (
                                            <span style={{display:'table',background: messagesProduccion.alert === 1 ? '#279b0a' : 'red',color: 'white',borderRadius: '20px',padding: '3px 10px',fontSize: '12px'}}>{messagesProduccion.messages} Mess. - {messagesProduccion.conversaciones} Conv.</span>
                                            ) : null}
                                        </div>
                                        <div className={` ${menuSeleccionado === 4 ? 'menu-activo' : ''}`} onClick={() => cambioMenuPrincipal(4)} style={{ display: 'inline-block', textAlign:'center',borderRight: '3px solid #b7b7b7',cursor:'pointer',padding:'2px 5px',height:'68px'}}>
                                            <span style={{textAlign:'left',width: '100%',display: 'block',fontSize:'12px'}}>Despachado: {contTicketFiltro4} Conv.</span>
                                            <i className="menu-icon tf-icons bx bxs-truck"></i>
                                            <br/>
                                            {messagesDespacho.messages > 0 ? (
                                            <span style={{display:'table',background: messagesDespacho.alert === 1 ? '#279b0a' : 'red',color: 'white',borderRadius: '20px',padding: '3px 10px',fontSize: '12px'}}>{messagesDespacho.messages} Mess. - {messagesDespacho.conversaciones} Conv.</span>
                                            ) : null}
                                        </div>
                                        <div className={` ${menuSeleccionado === 5 ? 'menu-activo' : ''}`} onClick={() => cambioMenuPrincipal(5)} style={{ display: 'inline-block', textAlign:'center',borderRight: '3px solid #b7b7b7',cursor:'pointer',padding:'2px 5px',height:'68px'}}>
                                            <span style={{textAlign:'left',width: '100%',display: 'block',fontSize:'12px'}}>Clientes: {contTicketFiltro5} Conv.</span>
                                            <i className="menu-icon tf-icons bx bxs-user-account"></i>
                                            <br/>
                                            {messagesClientes.messages > 0 ? (
                                            <span style={{display:'table',background: messagesClientes.alert === 1 ? '#279b0a' : 'red',color: 'white',borderRadius: '20px',padding: '3px 10px',fontSize: '12px'}}>{messagesClientes.messages} Mess. - {messagesClientes.conversaciones} Conv.</span>
                                            ) : null}
                                        </div>
                                        <div className={` ${menuSeleccionado === 6 ? 'menu-activo' : ''}`} onClick={() => cambioMenuPrincipal(6)} style={{ display: 'inline-block', textAlign:'center',cursor:'pointer',padding:'2px 5px',height:'68px'}}>
                                            <span style={{textAlign:'left',width: '100%',display: 'block',fontSize:'12px'}}>No Interesados: {contTicketFiltro6} Conv.</span>
                                            <i className="menu-icon tf-icons bx bx-pause-circle"></i>
                                            <br/>
                                            {messagesNoInteresados.messages > 0 ? (
                                            <span style={{display:'table',background: messagesNoInteresados.alert === 1 ? '#279b0a' : 'red',color: 'white',borderRadius: '20px',padding: '3px 10px',fontSize: '12px'}}>{messagesNoInteresados.messages} Mess. - {messagesNoInteresados.conversaciones} Conv.</span>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-12" style={{ display: ticketAbierto3 ? 'none':'block',border: '1px solid #b7b7b7',height: 'calc(100vh - 202px)',maxHeight: 'calc(100vh - 202px)',marginTop: '10px'}}>
                                    <div className={`${menuSeleccionado === 1 ? 'div-activo' : ''}`} style={{display:'none'}}>
                                        <div className="row">
                                            <div onClick={() => cambioMenuSecundario(1)} className={`col ${menuSeleccionado1 === 1 ? 'div1-Activo' : ''}`} style={{background:'white',padding: '5px',textAlign: 'center',cursor:'pointer'}}>
                                                Trabajando en
                                                {ticketTrabajandoFin ? (
                                                    <>:{ticketTrabajandoFin}</>
                                                ) : null}
                                                <br></br>
                                                {chatConMensajes2.reduce((total, message) => {
                                                    if (message.idStatus == 2 && message.unreadMessages > 0) {
                                                        return total + message.unreadMessages;
                                                    } else {
                                                        return total;
                                                    }
                                                }, 0) > 0 && (
                                                    <span style={{background: '#4ccf2b',color: 'black',padding: '0px 5px',borderRadius: '20px',marginLeft: '5px'}}>
                                                        {chatConMensajes2.reduce((total, message) => {
                                                            if (message.idStatus == 2 && message.unreadMessages > 0) {
                                                                return total + message.unreadMessages;
                                                            } else {
                                                                return total;
                                                            }
                                                        }, 0)} Msc
                                                    </span>
                                                )}
                                                 
                                            </div>
                                            <div onClick={() => cambioMenuSecundario(2)} className={`col ${menuSeleccionado1 === 2 ? 'div1-Activo' : ''}`} style={{background:'white',padding: '5px',textAlign: 'center',cursor:'pointer'}}>
                                                Cola
                                                {ticketPendientesFin ? (
                                                    <>:{ticketPendientesFin}</>
                                                ) : null}
                                                <br></br>
                                                {chatConMensajes2.reduce((total, message) => {
                                                    if (message.idStatus == 1 && message.unreadMessages > 0) {
                                                        return total + message.unreadMessages;
                                                    } else {
                                                        return total;
                                                    }
                                                }, 0) > 0 && (
                                                    <span style={{background: '#4ccf2b',color: 'black',padding: '0px 5px',borderRadius: '20px',marginLeft: '5px'}}>
                                                        {chatConMensajes2.reduce((total, message) => {
                                                            if (message.idStatus == 1 && message.unreadMessages > 0) {
                                                                return total + message.unreadMessages;
                                                            } else {
                                                                return total;
                                                            }
                                                        }, 0)} Msc
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="row" style={{maxHeight: '93%'}}>
                                            <div className='col-12' style={{marginTop:'20px'}}>
                                                <input type="text" onChange={(event) => handleSearch(1, event.target.value)} className="form-control buscador" placeholder="Buscar" aria-label="Username" aria-describedby="basic-addon1"/>
                                            </div>
                                            <div className={`col ${menuSeleccionado1 === 1 ? 'div-activoOpciones' : ''}`} style={{textAlign:'center',marginTop:'10px',marginBottom:'10px',display:'none'}}>
                                                <div style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
                                                    <span onClick={(event) => filtroTrabajando(1)} style={{ cursor: 'pointer', margin: '0px 5px', background: selectFiltro == 1 ? '#e1e1e1' : 'white', color: '#333', border: '2px solid #e1e1e1', borderRadius: '20px', padding: '3px 10px', fontSize: '12px', display: 'inline-block' }}>
                                                        Todos: {conTodosFiltro}
                                                    </span>
                                                    <span onClick={(event) => filtroTrabajando(2)} style={{ cursor: 'pointer', margin: '0px 5px', background: selectFiltro == 2 ? '#e1e1e1' : 'white', color: '#333', border: '2px solid #d1bb6d', borderRadius: '20px', padding: '3px 10px', fontSize: '12px', display: 'inline-block' }}>
                                                        Interesados: {conInteresadosFiltro}
                                                    </span>
                                                    <span onClick={(event) => filtroTrabajando(3)} style={{ cursor: 'pointer', margin: '0px 5px', background: selectFiltro == 3 ? '#e1e1e1' : 'white', color: '#333', border: '2px solid #92bf92', borderRadius: '20px', padding: '3px 10px', fontSize: '12px', display: 'inline-block' }}>
                                                        Pendiente pago: {conPendientesPagoFiltro}
                                                    </span>
                                                </div>
                                                <div className='row' style={{marginTop:'10px'}}>
                                                    <div className='col-6'>
                                                        <div className="form-check" style={{width:'fit-content'}}>
                                                            <input className="form-check-input" onChange={(event) => filtroSinLeer(event.target.checked,1)} type="checkbox" value="" id="checkboxfiltro-1"></input>
                                                            <label className="form-check-label">
                                                                sin Leer
                                                            </label>
                                                        </div>
                                                        <div className="form-check" style={{width:'fit-content'}}>
                                                            <input className="form-check-input" onChange={(event) => filtroSinResponder(event.target.checked,1)} type="checkbox" value="" id="checkboxfiltro-2"></input>
                                                            <label className="form-check-label" style={{textAlign:'left'}}>
                                                                sin Respuesta
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className='col-6' style={{textAlign:'right',paddingTop:'15px'}}>
                                                        <span style={{cursor:'pointer'}} onClick={(event) => filtroFecha(1)}>
                                                            {seleFecha1 ? (
                                                                <>
                                                                    <span style={{marginLeft:'4px'}}>Asc.</span> 
                                                                    <i style={{marginTop:'-4px',color:'red',transform:'rotate(90deg)'}} className='bx bx-transfer-alt'></i>
                                                                </>
                                                            ):(
                                                                <>
                                                                    <span style={{marginLeft:'4px'}}>Des.</span>
                                                                    <i style={{marginTop:'-4px',color:'#4eadff',transform:'rotate(90deg)'}} className='bx bx-transfer-alt'></i>
                                                                </>
                                                            )}
                                                            
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='col-12' style={{padding:'0px',marginTop:'8px'}}>
                                                <div className={`${menuSeleccionado1 === 1 ? 'div-activoOpciones2' : ''}`} onScroll={handleScrollFiltro(1)} style={{display:'none',height: '36vh',maxHeight: '36vh',overflow:'auto'}}>
                                                    {banderaConsultandoTicketTrabajando ? (
                                                        <p style={{textAlign: 'center', marginTop: '20px'}}>Consultando...</p>
                                                    ) : (
                                                        <React.Fragment>
                                                            {ticketTrabajando && ticketTrabajando.length > 0 ? (
                                                                ticketTrabajando.map((dato2) => (
                                                                    <div className='row' key={'ticketPendiente-'+dato2.id} onClick={(event) => abrirTicket(dato2)} style={{cursor:'pointer',width:'98%',margin:'auto auto 10px',borderLeft: `2px solid ${dato2.border}`,background: dato2.background,padding: '5px',paddingBottom:'0px'}} key={dato2.id}>
                                                                        <div className='col-12' style={{padding:'0px'}}>
                                                                            {dato2.linea}
                                                                        </div>
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
                                                                            <h6 style={{marginBottom:'0px'}}>
                                                                                {dato2.nameLabel}
                                                                                {dato2.unreadMessages && dato2.unreadMessages > 0 ?(
                                                                                    <span style={{display: 'inline-block',width:'20px',height:'20px',borderRadius:'50%',backgroundColor:'#4ccf2b',color:'#282828',textAlign:'center',lineHeight:'20px',fontSize:'14px',marginLeft:'10px'}}>{dato2.unreadMessages}</span>
                                                                                ):null}
                                                                            </h6>
                                                                            <p style={{marginBottom: '0px',background: dato2.background2,padding: '0px 10px',fontSize: '14px',marginTop: '4px'}}>
                                                                                <i className={dato2.ackIcon}></i>
                                                                                {dato2.bodyMessage}
                                                                            </p>
                                                                            <span style={{fontSize: '12px',textAlign: 'right',width: '100%',display: 'block'}}>{dato2.ultimoMessageDate}</span>
                                                                        </div>
                                                                        <div className='col-4' style={{fontSize:'small',textAlign:'left',borderTop:'1px solid #b7b7b7',padding:'5px 0px'}}>
                                                                            "{dato2.pushname}"
                                                                        </div>
                                                                        <div className='col-8' id={`optionTicketCola-${dato2.id}`} style={{textAlign:'right',borderTop:`1px solid ${dato2.border}`,padding:'5px 0px'}}>
                                                                            <span onClick={(event) => reasignarTicket(dato2)} style={{background: '#4eadff',color: '#000',border: '2px solid #4eadff',borderRadius: '20px',padding: '3px 5px 3px 3px',fontSize: '12px',cursor:'pointer'}}>
                                                                                <i style={{marginTop:'-3px'}} className='bx bx-transfer'></i>
                                                                                Reasignar
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                // no hay tickets en cola para el asesor
                                                                <p style={{textAlign: 'center', marginTop: '20px'}}>No hay tickets</p>
                                                            )}
                                                            {ticketconsultaGeneral && ticketconsultaGeneral.length > 0 ? (
                                                                ticketconsultaGeneral.map((dato2) => (
                                                                    <div className='row' style={{cursor:'pointer',width:'100%',borderLeft: `2px solid #73a4c1`,background: '#b5e4ff',margin: '5px 0px',padding: '5px',paddingBottom:'0px'}} key={dato2.id}>
                                                                       
                                                                        {usuario.user == 4 ? (
                                                                            <>
                                                                                <div className='col-6' style={{padding:'0px'}}>
                                                                                    {dato2.linea}
                                                                                </div>
                                                                                <div className='col-6' style={{padding:'0px',textAlign:'right'}}>
                                                                                    <span onClick={(event) => espiarChat(dato2)} style={{background: '#ffb93a',color: '#000',border: '2px solid #ffb93a',borderRadius: '20px',padding: '3px 5px 3px 3px',fontSize: '12px',cursor:'pointer',marginRight:'5px'}}>
                                                                                        <i style={{marginTop:'-3px'}} className='bx bxs-binoculars'></i>
                                                                                        Espiar
                                                                                    </span>
                                                                                </div>
                                                                            </>
                                                                        ):(
                                                                            <div className='col-12' style={{padding:'0px'}}>
                                                                                {dato2.linea}
                                                                            </div>
                                                                        )}
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
                                                                            <h6 style={{marginBottom:'0px'}}>
                                                                                {dato2.nameLabel}
                                                                                {dato2.unreadMessages && dato2.unreadMessages > 0 ?(
                                                                                    <span style={{display: 'inline-block',width:'20px',height:'20px',borderRadius:'50%',backgroundColor:'#4ccf2b',color:'#282828',textAlign:'center',lineHeight:'20px',fontSize:'14px',marginLeft:'10px'}}>{dato2.unreadMessages}</span>
                                                                                ):null}
                                                                            </h6>
                                                                            <p style={{marginBottom: '0px',background: '#94c9e9',padding: '0px 10px',fontSize: '14px',marginTop: '4px'}}>
                                                                                <i className={dato2.ackIcon}></i>
                                                                                {dato2.bodyMessage}
                                                                            </p>
                                                                            <span style={{fontSize: '12px',textAlign: 'right',width: '100%',display: 'block'}}>{dato2.ultimoMessageDate}</span>
                                                                        </div>
                                                                        <div className='col-4' id={`optionTicketCola-${dato2.id}`} style={{textAlign:'right',borderTop:`1px solid #94c9e9`,padding:'5px 0px'}}>
                                                                            {dato2.status}
                                                                        </div>
                                                                        <div className='col-8' id={`optionTicketCola-${dato2.id}`} style={{textAlign:'right',borderTop:`1px solid #94c9e9`,padding:'5px 0px'}}>
                                                                            Ase: {dato2.asesor}
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (null)}
                                                        </React.Fragment>
                                                    )}
                                                    {banderaConsultandoTicketTrabajando2 ? (
                                                        <div style={{width:'100%',textAlign:'center'}}><i className='bx bx-loader-circle bx-spin'></i> Consultando...</div>
                                                    ) : (null)}
                                                
                                                </div>
                                                <div className={`${menuSeleccionado1 === 2 ? 'div-activoOpciones2' : ''}`} onScroll={handleScrollFiltro(1)} style={{display:'none',height: '51vh',maxHeight: '51vh',overflow:'auto'}}>
                                                    {banderaConsultandoTicketPendiente ? (
                                                        <p style={{textAlign: 'center', marginTop: '20px'}}>Consultando...</p>
                                                    ) : (
                                                        <React.Fragment>
                                                            {ticketPendientes && ticketPendientes.length > 0 ? (
                                                                ticketPendientes.map((dato2) => (
                                                                    <div className='row' style={{width:'98%',borderLeft: '2px solid #b7b7b7',background: '#adadad4d',margin: 'auto',marginBottom:'10px',padding: '5px',paddingBottom:'0px'}} key={dato2.id}>
                                                                        <div className='col-12' style={{padding:'0px'}}>
                                                                            {dato2.linea}
                                                                        </div>
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
                                                                            <h6 style={{marginBottom:'0px'}}>
                                                                                {dato2.nameLabel}
                                                                                {dato2.unreadMessages && dato2.unreadMessages > 0 ?(
                                                                                    <span style={{display: 'inline-block',width:'20px',height:'20px',borderRadius:'50%',backgroundColor:'#4ccf2b',color:'#282828',textAlign:'center',lineHeight:'20px',fontSize:'14px',marginLeft:'10px'}}>{dato2.unreadMessages}</span>
                                                                                ):null}
                                                                            </h6>
                                                                            <p style={{marginBottom: '0px',background: '#d3d3d3',padding: '0px 10px',fontSize: '14px',marginTop: '4px'}}>
                                                                                <i className={dato2.ackIcon}></i>
                                                                                {dato2.bodyMessage}
                                                                            </p>
                                                                            <span style={{fontSize: '12px',textAlign: 'right',width: '100%',display: 'block'}}>{dato2.ultimoMessageDate}</span>
                                                                        </div>
                                                                        <div className='col-12' id={`optionTicketCola-${dato2.id}`} style={{textAlign:'right',borderTop:'1px solid #b7b7b7',padding:'5px 0px'}}>
                                                                            <span onClick={(event) => aceptarTicket(dato2.id)} style={{background: '#4ccf2b',color: '#000',border: '2px solid #4ccf2b',borderRadius: '20px',padding: '3px 5px 3px 3px',fontSize: '12px',cursor:'pointer',marginRight:'5px'}}>
                                                                                <i style={{marginTop:'-3px'}} className='bx bx-check-circle'></i>
                                                                                Acceptar
                                                                            </span>
                                                                            <span onClick={(event) => espiarChat(dato2)} style={{background: '#ffb93a',color: '#000',border: '2px solid #ffb93a',borderRadius: '20px',padding: '3px 5px 3px 3px',fontSize: '12px',cursor:'pointer',marginRight:'5px'}}>
                                                                                <i style={{marginTop:'-3px'}} className='bx bxs-binoculars'></i>
                                                                                Espiar
                                                                            </span>
                                                                            <span onClick={(event) => reasignarTicket(dato2)} style={{background: '#4eadff',color: '#000',border: '2px solid #4eadff',borderRadius: '20px',padding: '3px 5px 3px 3px',fontSize: '12px',cursor:'pointer'}}>
                                                                                <i style={{marginTop:'-3px'}} className='bx bx-transfer'></i>
                                                                                Reasignar
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                // no hay tickets en cola para el asesor
                                                                <p style={{textAlign: 'center', marginTop: '20px'}}>No se encontraron tickets</p>
                                                            )}
                                                            {ticketconsultaGeneral && ticketconsultaGeneral.length > 0 ? (
                                                                ticketconsultaGeneral.map((dato2) => (
                                                                    <div className='row' style={{cursor:'pointer',width:'100%',borderLeft: `2px solid #73a4c1`,background: '#b5e4ff',margin: '5px 0px',padding: '5px',paddingBottom:'0px'}} key={dato2.id}>
                                                                        <div className='col-12' style={{padding:'0px'}}>
                                                                            {dato2.linea}
                                                                        </div>
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
                                                                            <h6 style={{marginBottom:'0px'}}>
                                                                                {dato2.nameLabel}
                                                                                {dato2.unreadMessages && dato2.unreadMessages > 0 ?(
                                                                                    <span style={{display: 'inline-block',width:'20px',height:'20px',borderRadius:'50%',backgroundColor:'#4ccf2b',color:'#282828',textAlign:'center',lineHeight:'20px',fontSize:'14px',marginLeft:'10px'}}>{dato2.unreadMessages}</span>
                                                                                ):null}
                                                                            </h6>
                                                                            <p style={{marginBottom: '0px',background: '#94c9e9',padding: '0px 10px',fontSize: '14px',marginTop: '4px'}}>
                                                                                <i className={dato2.ackIcon}></i>
                                                                                {dato2.bodyMessage}
                                                                            </p>
                                                                            <span style={{fontSize: '12px',textAlign: 'right',width: '100%',display: 'block'}}>{dato2.ultimoMessageDate}</span>
                                                                        </div>
                                                                        <div className='col-4' id={`optionTicketCola-${dato2.id}`} style={{textAlign:'right',borderTop:`1px solid #94c9e9`,padding:'5px 0px'}}>
                                                                            {dato2.status}
                                                                        </div>
                                                                        <div className='col-8' id={`optionTicketCola-${dato2.id}`} style={{textAlign:'right',borderTop:`1px solid #94c9e9`,padding:'5px 0px'}}>
                                                                            Ase: {dato2.asesor}
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (null)}
                                                        </React.Fragment>
                                                    )}
                                                    {banderaConsultandoTicketPendiente2 ? (
                                                        <div style={{width:'100%',textAlign:'center'}}><i className='bx bx-loader-circle bx-spin'></i> Consultando...</div>
                                                    ) : (null)}
                                                    
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`${menuSeleccionado === 2 ? 'div-activo' : ''}`} style={{display:'none'}}>
                                        
                                        <div className="row" style={{maxHeight: '93%'}}>
                                            <div className='col-12' style={{marginTop:'20px'}}>
                                                <input type="text" onChange={(event) => handleSearch(2, event.target.value)} className="form-control buscador" placeholder="Buscar" aria-label="Username" aria-describedby="basic-addon1"/>
                                            </div>
                                            <div className='col-6'>
                                                <div className="form-check" style={{width:'fit-content'}}>
                                                    <input className="form-check-input" onChange={(event) => filtroSinLeer(event.target.checked,2)} type="checkbox" value="" id="checkboxfiltro-3"></input>
                                                    <label className="form-check-label">
                                                        sin Leer
                                                    </label>
                                                </div>
                                                <div className="form-check" style={{width:'fit-content'}}>
                                                    <input className="form-check-input" onChange={(event) => filtroSinResponder(event.target.checked,2)} type="checkbox" value="" id="checkboxfiltro-4"></input>
                                                    <label className="form-check-label" style={{textAlign:'left'}}>
                                                        sin Respuesta
                                                    </label>
                                                </div>
                                            </div>
                                            <div className='col-6' style={{textAlign:'right',paddingTop:'15px'}}>
                                                <span style={{cursor:'pointer'}} onClick={(event) => filtroFecha(2)}>
                                                    {seleFecha2 ? (
                                                        <>
                                                            <span style={{marginLeft:'4px'}}>Asc.</span> 
                                                            <i style={{marginTop:'-4px',color:'red',transform:'rotate(90deg)'}} className='bx bx-transfer-alt'></i>
                                                        </>
                                                    ):(
                                                        <>
                                                            <span style={{marginLeft:'4px'}}>Des.</span>
                                                            <i style={{marginTop:'-4px',color:'#4eadff',transform:'rotate(90deg)'}} className='bx bx-transfer-alt'></i>
                                                        </>
                                                    )}
                                                        
                                                </span>
                                            </div>

                                            <div className='col-12' onScroll={handleScrollFiltro(2)} style={{maXheight: '52vh',overflow:'auto',padding:'0px 7px'}}>
                                                {banderaConsultandoTicketPagos ? (
                                                    <p style={{textAlign: 'center', marginTop: '20px'}}>Consultando...</p>
                                                ) : (
                                                    <React.Fragment>
                                                        {ticketPagos && ticketPagos.length > 0 ? (
                                                            ticketPagos.map((dato2) => (
                                                                <div className='row' onClick={(event) => abrirTicket(dato2)} style={{cursor:'pointer',width:'100%',borderLeft: `2px solid ${dato2.border}`,background: dato2.background,margin: '5px 0px',padding: '5px',paddingBottom:'0px'}} key={dato2.id}>
                                                                    <div className='col-12' style={{padding:'0px'}}>
                                                                        {dato2.linea}
                                                                    </div>
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
                                                                        <h6 style={{marginBottom:'0px'}}>
                                                                            {dato2.nameLabel}
                                                                            {dato2.unreadMessages && dato2.unreadMessages > 0 ?(
                                                                                <span style={{display: 'inline-block',width:'20px',height:'20px',borderRadius:'50%',backgroundColor:'#4ccf2b',color:'#282828',textAlign:'center',lineHeight:'20px',fontSize:'14px',marginLeft:'10px'}}>{dato2.unreadMessages}</span>
                                                                            ):null}
                                                                        </h6>
                                                                        <p style={{marginBottom: '0px',background: dato2.background2,padding: '0px 10px',fontSize: '14px',marginTop: '4px'}}>
                                                                            <i className={dato2.ackIcon}></i>
                                                                            {dato2.bodyMessage}
                                                                        </p>
                                                                        <span style={{fontSize: '12px',textAlign: 'right',width: '100%',display: 'block'}}>{dato2.ultimoMessageDate}</span>
                                                                    </div>
                                                                    <div className='col-12' id={`optionTicketCola-${dato2.id}`} style={{textAlign:'right',borderTop:`1px solid ${dato2.border}`,padding:'5px 0px'}}>
                                                                        <span onClick={(event) => reasignarTicket(dato2)} style={{background: '#4eadff',color: '#000',border: '2px solid #4eadff',borderRadius: '20px',padding: '3px 5px 3px 3px',fontSize: '12px',cursor:'pointer'}}>
                                                                            <i style={{marginTop:'-3px'}} className='bx bx-transfer'></i>
                                                                            Reasignar
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            // no hay tickets en cola para el asesor
                                                            <p style={{textAlign: 'center', marginTop: '20px'}}>No hay tickets</p>
                                                        )}

                                                        {ticketconsultaGeneral && ticketconsultaGeneral.length > 0 ? (
                                                                ticketconsultaGeneral.map((dato2) => (
                                                                    <div className='row' style={{cursor:'pointer',width:'100%',borderLeft: `2px solid #73a4c1`,background: '#b5e4ff',margin: '5px 0px',padding: '5px',paddingBottom:'0px'}} key={dato2.id}>
                                                                        <div className='col-12' style={{padding:'0px'}}>
                                                                            {dato2.linea}
                                                                        </div>
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
                                                                            <h6 style={{marginBottom:'0px'}}>
                                                                                {dato2.nameLabel}
                                                                                {dato2.unreadMessages && dato2.unreadMessages > 0 ?(
                                                                                    <span style={{display: 'inline-block',width:'20px',height:'20px',borderRadius:'50%',backgroundColor:'#4ccf2b',color:'#282828',textAlign:'center',lineHeight:'20px',fontSize:'14px',marginLeft:'10px'}}>{dato2.unreadMessages}</span>
                                                                                ):null}
                                                                            </h6>
                                                                            <p style={{marginBottom: '0px',background: '#94c9e9',padding: '0px 10px',fontSize: '14px',marginTop: '4px'}}>
                                                                                <i className={dato2.ackIcon}></i>
                                                                                {dato2.bodyMessage}
                                                                            </p>
                                                                            <span style={{fontSize: '12px',textAlign: 'right',width: '100%',display: 'block'}}>{dato2.ultimoMessageDate}</span>
                                                                        </div>
                                                                        <div className='col-4' id={`optionTicketCola-${dato2.id}`} style={{textAlign:'right',borderTop:`1px solid #94c9e9`,padding:'5px 0px'}}>
                                                                            {dato2.status}
                                                                        </div>
                                                                        <div className='col-8' id={`optionTicketCola-${dato2.id}`} style={{textAlign:'right',borderTop:`1px solid #94c9e9`,padding:'5px 0px'}}>
                                                                            Ase: {dato2.asesor}
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (null)}
                                                    </React.Fragment>
                                                )}
                                                {banderaConsultandoTicketPagos2 ? (
                                                    <div style={{width:'100%',textAlign:'center'}}><i className='bx bx-loader-circle bx-spin'></i> Consultando...</div>
                                                ) : (null)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`${menuSeleccionado === 3 ? 'div-activo' : ''}`} style={{display:'none'}}>
                                        <div className="row" style={{maxHeight: '93%'}}>
                                            <div className='col-12' style={{marginTop:'20px'}}>
                                                <input type="text" onChange={(event) => handleSearch(3, event.target.value)} className="form-control buscador" placeholder="Buscar" aria-label="Username" aria-describedby="basic-addon1"/>
                                            </div>
                                            <div className='col-6'>
                                                <div className="form-check" style={{width:'fit-content'}}>
                                                    <input className="form-check-input" onChange={(event) => filtroSinLeer(event.target.checked,3)} type="checkbox" value="" id="checkboxfiltro-5"></input>
                                                    <label className="form-check-label">
                                                        sin Leer
                                                    </label>
                                                </div>
                                                <div className="form-check" style={{width:'fit-content'}}>
                                                    <input className="form-check-input" onChange={(event) => filtroSinResponder(event.target.checked,3)} type="checkbox" value="" id="checkboxfiltro-6"></input>
                                                    <label className="form-check-label" style={{textAlign:'left'}}>
                                                        sin Respuesta
                                                    </label>
                                                </div>
                                            </div>
                                            <div className='col-6' style={{textAlign:'right',paddingTop:'15px'}}>
                                                <span style={{cursor:'pointer'}} onClick={(event) => filtroFecha(3)}>
                                                    {seleFecha3 ? (
                                                        <>
                                                            <span style={{marginLeft:'4px'}}>Asc.</span> 
                                                            <i style={{marginTop:'-4px',color:'red',transform:'rotate(90deg)'}} className='bx bx-transfer-alt'></i>
                                                        </>
                                                    ):(
                                                        <>
                                                            <span style={{marginLeft:'4px'}}>Des.</span>
                                                            <i style={{marginTop:'-4px',color:'#4eadff',transform:'rotate(90deg)'}} className='bx bx-transfer-alt'></i>
                                                        </>
                                                    )}
                                                        
                                                </span>
                                            </div>
                                            <div className='col-12' style={{maxHeight: '52vh',overflow:'auto',padding:'0px 7px'}}>
                                                {banderaConsultandoTicketProduccion ? (
                                                    <p style={{textAlign: 'center', marginTop: '20px'}}>Consultando...</p>
                                                ) : (
                                                    <React.Fragment>
                                                        {ticketProduccion && ticketProduccion.length > 0 ? (
                                                            ticketProduccion.map((dato2) => (
                                                                <div className='row' onClick={(event) => abrirTicket(dato2)} style={{cursor:'pointer',width:'100%',borderLeft: `2px solid ${dato2.border}`,background: dato2.background,margin: '5px 0px',padding: '5px',paddingBottom:'0px'}} key={dato2.id}>
                                                                    <div className='col-12' style={{padding:'0px'}}>
                                                                        {dato2.linea}
                                                                    </div>
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
                                                                        <h6 style={{marginBottom:'0px'}}>
                                                                            {dato2.nameLabel}
                                                                            {dato2.unreadMessages && dato2.unreadMessages > 0 ?(
                                                                                <span style={{display: 'inline-block',width:'20px',height:'20px',borderRadius:'50%',backgroundColor:'#4ccf2b',color:'#282828',textAlign:'center',lineHeight:'20px',fontSize:'14px',marginLeft:'10px'}}>{dato2.unreadMessages}</span>
                                                                            ):null}
                                                                        </h6>
                                                                        <p style={{marginBottom: '0px',background: dato2.background2,padding: '0px 10px',fontSize: '14px',marginTop: '4px'}}>
                                                                            <i className={dato2.ackIcon}></i>
                                                                            {dato2.bodyMessage}
                                                                        </p>
                                                                        <span style={{fontSize: '12px',textAlign: 'right',width: '100%',display: 'block'}}>{dato2.ultimoMessageDate}</span>
                                                                    </div>
                                                                    <div className='col-12' id={`optionTicketCola-${dato2.id}`} style={{textAlign:'right',borderTop:`1px solid ${dato2.border}`,padding:'5px 0px'}}>
                                                                        <span onClick={(event) => reasignarTicket(dato2)} style={{background: '#4eadff',color: '#000',border: '2px solid #4eadff',borderRadius: '20px',padding: '3px 5px 3px 3px',fontSize: '12px',cursor:'pointer'}}>
                                                                            <i style={{marginTop:'-3px'}} className='bx bx-transfer'></i>
                                                                            Reasignar
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            // no hay tickets en cola para el asesor
                                                            <p style={{textAlign: 'center', marginTop: '20px'}}>No hay tickets</p>
                                                        )}

                                                            {ticketconsultaGeneral && ticketconsultaGeneral.length > 0 ? (
                                                                ticketconsultaGeneral.map((dato2) => (
                                                                    <div className='row' style={{cursor:'pointer',width:'100%',borderLeft: `2px solid #73a4c1`,background: '#b5e4ff',margin: '5px 0px',padding: '5px',paddingBottom:'0px'}} key={dato2.id}>
                                                                        <div className='col-12' style={{padding:'0px'}}>
                                                                            {dato2.linea}
                                                                        </div>
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
                                                                            <h6 style={{marginBottom:'0px'}}>
                                                                                {dato2.nameLabel}
                                                                                {dato2.unreadMessages && dato2.unreadMessages > 0 ?(
                                                                                    <span style={{display: 'inline-block',width:'20px',height:'20px',borderRadius:'50%',backgroundColor:'#4ccf2b',color:'#282828',textAlign:'center',lineHeight:'20px',fontSize:'14px',marginLeft:'10px'}}>{dato2.unreadMessages}</span>
                                                                                ):null}
                                                                            </h6>
                                                                            <p style={{marginBottom: '0px',background: '#94c9e9',padding: '0px 10px',fontSize: '14px',marginTop: '4px'}}>
                                                                                <i className={dato2.ackIcon}></i>
                                                                                {dato2.bodyMessage}
                                                                            </p>
                                                                            <span style={{fontSize: '12px',textAlign: 'right',width: '100%',display: 'block'}}>{dato2.ultimoMessageDate}</span>
                                                                        </div>
                                                                        <div className='col-4' id={`optionTicketCola-${dato2.id}`} style={{textAlign:'right',borderTop:`1px solid #94c9e9`,padding:'5px 0px'}}>
                                                                            {dato2.status}
                                                                        </div>
                                                                        <div className='col-8' id={`optionTicketCola-${dato2.id}`} style={{textAlign:'right',borderTop:`1px solid #94c9e9`,padding:'5px 0px'}}>
                                                                            Ase: {dato2.asesor}
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (null)}
                                                    </React.Fragment>
                                                )}
                                                {banderaConsultandoTicketProduccion2 ? (
                                                    <div style={{width:'100%',textAlign:'center'}}><i className='bx bx-loader-circle bx-spin'></i> Consultando...</div>
                                                ) : (null)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`${menuSeleccionado === 4 ? 'div-activo' : ''}`} style={{display:'none'}}>
                                        <div className="row" style={{maxHeight: '93%'}}>
                                            <div className='col-12' style={{marginTop:'20px'}}>
                                                <input type="text" onChange={(event) => handleSearch(4, event.target.value)} className="form-control buscador" placeholder="Buscar" aria-label="Username" aria-describedby="basic-addon1"/>
                                            </div>
                                            <div className='col-6'>
                                                <div className="form-check" style={{width:'fit-content'}}>
                                                    <input className="form-check-input" onChange={(event) => filtroSinLeer(event.target.checked,4)} type="checkbox" value="" id="checkboxfiltro-7"></input>
                                                    <label className="form-check-label">
                                                        sin Leer
                                                    </label>
                                                </div>
                                                <div className="form-check" style={{width:'fit-content'}}>
                                                    <input className="form-check-input" onChange={(event) => filtroSinResponder(event.target.checked,4)} type="checkbox" value="" id="checkboxfiltro-8"></input>
                                                    <label className="form-check-label" style={{textAlign:'left'}}>
                                                        sin Respuesta
                                                    </label>
                                                </div>
                                            </div>
                                            <div className='col-6' style={{textAlign:'right',paddingTop:'15px'}}>
                                                <span style={{cursor:'pointer'}} onClick={(event) => filtroFecha(4)}>
                                                    {seleFecha4 ? (
                                                        <>
                                                            <span style={{marginLeft:'4px'}}>Asc.</span> 
                                                            <i style={{marginTop:'-4px',color:'red',transform:'rotate(90deg)'}} className='bx bx-transfer-alt'></i>
                                                        </>
                                                    ):(
                                                        <>
                                                            <span style={{marginLeft:'4px'}}>Des.</span>
                                                            <i style={{marginTop:'-4px',color:'#4eadff',transform:'rotate(90deg)'}} className='bx bx-transfer-alt'></i>
                                                        </>
                                                    )}
                                                        
                                                </span>
                                            </div>
                                            <div className='col-12' style={{maxHeight: '52vh',overflow:'auto',padding:'0px 7px'}}>
                                                {banderaConsultandoTicketDespachados ? (
                                                    <p style={{textAlign: 'center', marginTop: '20px'}}>Consultando...</p>
                                                ) : (
                                                    <React.Fragment>
                                                        {ticketDespachados && ticketDespachados.length > 0 ? (
                                                            ticketDespachados.map((dato2) => (
                                                                <div className='row' onClick={(event) => abrirTicket(dato2)} style={{cursor:'pointer',width:'100%',borderLeft: `2px solid ${dato2.border}`,background: dato2.background,margin: '5px 0px',padding: '5px',paddingBottom:'0px'}} key={dato2.id}>
                                                                    <div className='col-12' style={{padding:'0px'}}>
                                                                        {dato2.linea}
                                                                    </div>
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
                                                                        <h6 style={{marginBottom:'0px'}}>
                                                                            {dato2.nameLabel}
                                                                            {dato2.unreadMessages && dato2.unreadMessages > 0 ?(
                                                                                <span style={{display: 'inline-block',width:'20px',height:'20px',borderRadius:'50%',backgroundColor:'#4ccf2b',color:'#282828',textAlign:'center',lineHeight:'20px',fontSize:'14px',marginLeft:'10px'}}>{dato2.unreadMessages}</span>
                                                                            ):null}
                                                                        </h6>
                                                                        <p style={{marginBottom: '0px',background: dato2.background2,padding: '0px 10px',fontSize: '14px',marginTop: '4px'}}>
                                                                            <i className={dato2.ackIcon}></i>
                                                                            {dato2.bodyMessage}
                                                                        </p>
                                                                        <span style={{fontSize: '12px',textAlign: 'right',width: '100%',display: 'block'}}>{dato2.ultimoMessageDate}</span>
                                                                    </div>
                                                                    <div className='col-12' id={`optionTicketCola-${dato2.id}`} style={{textAlign:'right',borderTop:`1px solid ${dato2.border}`,padding:'5px 0px'}}>
                                                                        <span onClick={(event) => reasignarTicket(dato2)} style={{background: '#4eadff',color: '#000',border: '2px solid #4eadff',borderRadius: '20px',padding: '3px 5px 3px 3px',fontSize: '12px',cursor:'pointer'}}>
                                                                            <i style={{marginTop:'-3px'}} className='bx bx-transfer'></i>
                                                                            Reasignar
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            // no hay tickets en cola para el asesor
                                                            <p style={{textAlign: 'center', marginTop: '20px'}}>No hay tickets</p>
                                                        )}
                                                        {ticketconsultaGeneral && ticketconsultaGeneral.length > 0 ? (
                                                                ticketconsultaGeneral.map((dato2) => (
                                                                    <div className='row' style={{cursor:'pointer',width:'100%',borderLeft: `2px solid #73a4c1`,background: '#b5e4ff',margin: '5px 0px',padding: '5px',paddingBottom:'0px'}} key={dato2.id}>
                                                                        <div className='col-12' style={{padding:'0px'}}>
                                                                            {dato2.linea}
                                                                        </div>
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
                                                                            <h6 style={{marginBottom:'0px'}}>
                                                                                {dato2.nameLabel}
                                                                                {dato2.unreadMessages && dato2.unreadMessages > 0 ?(
                                                                                    <span style={{display: 'inline-block',width:'20px',height:'20px',borderRadius:'50%',backgroundColor:'#4ccf2b',color:'#282828',textAlign:'center',lineHeight:'20px',fontSize:'14px',marginLeft:'10px'}}>{dato2.unreadMessages}</span>
                                                                                ):null}
                                                                            </h6>
                                                                            <p style={{marginBottom: '0px',background: '#94c9e9',padding: '0px 10px',fontSize: '14px',marginTop: '4px'}}>
                                                                                <i className={dato2.ackIcon}></i>
                                                                                {dato2.bodyMessage}
                                                                            </p>
                                                                            <span style={{fontSize: '12px',textAlign: 'right',width: '100%',display: 'block'}}>{dato2.ultimoMessageDate}</span>
                                                                        </div>
                                                                        <div className='col-4' id={`optionTicketCola-${dato2.id}`} style={{textAlign:'right',borderTop:`1px solid #94c9e9`,padding:'5px 0px'}}>
                                                                            {dato2.status}
                                                                        </div>
                                                                        <div className='col-8' id={`optionTicketCola-${dato2.id}`} style={{textAlign:'right',borderTop:`1px solid #94c9e9`,padding:'5px 0px'}}>
                                                                            Ase: {dato2.asesor}
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (null)}
                                                    </React.Fragment>
                                                )}
                                                {banderaConsultandoTicketDespachados2 ? (
                                                    <div style={{width:'100%',textAlign:'center'}}><i className='bx bx-loader-circle bx-spin'></i> Consultando...</div>
                                                ) : (null)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`${menuSeleccionado === 5 ? 'div-activo' : ''}`} style={{display:'none'}}>
                                        <div className="row" style={{maxHeight: '93%'}}>
                                            <div className='col-12' style={{marginTop:'20px'}}>
                                                <input type="text" onChange={(event) => handleSearch(5, event.target.value)} className="form-control buscador" placeholder="Buscar" aria-label="Username" aria-describedby="basic-addon1"/>
                                            </div>
                                            <div className='col-6'>
                                                <div className="form-check" style={{width:'fit-content'}}>
                                                    <input className="form-check-input" onChange={(event) => filtroSinLeer(event.target.checked,5)} type="checkbox" value="" id="checkboxfiltro-9"></input>
                                                    <label className="form-check-label">
                                                        sin Leer
                                                    </label>
                                                </div>
                                                <div className="form-check" style={{width:'fit-content'}}>
                                                    <input className="form-check-input" onChange={(event) => filtroSinResponder(event.target.checked,5)} type="checkbox" value="" id="checkboxfiltro-10"></input>
                                                    <label className="form-check-label" style={{textAlign:'left'}}>
                                                        sin Respuesta
                                                    </label>
                                                </div>
                                            </div>
                                            <div className='col-6' style={{textAlign:'right',paddingTop:'15px'}}>
                                                <span style={{cursor:'pointer'}} onClick={(event) => filtroFecha(5)}>
                                                    {seleFecha5 ? (
                                                        <>
                                                            <span style={{marginLeft:'4px'}}>Asc.</span> 
                                                            <i style={{marginTop:'-4px',color:'red',transform:'rotate(90deg)'}} className='bx bx-transfer-alt'></i>
                                                        </>
                                                    ):(
                                                        <>
                                                            <span style={{marginLeft:'4px'}}>Des.</span>
                                                            <i style={{marginTop:'-4px',color:'#4eadff',transform:'rotate(90deg)'}} className='bx bx-transfer-alt'></i>
                                                        </>
                                                    )}
                                                        
                                                </span>
                                            </div>
                                            <div className='col-12' style={{maxHeight: '52vh',overflow:'auto',padding:'0px 7px'}}>
                                                {banderaConsultandoTicketClientes ? (
                                                    <p style={{textAlign: 'center', marginTop: '20px'}}>Consultando...</p>
                                                ) : (
                                                    <React.Fragment>
                                                        {ticketClientes && ticketClientes.length > 0 ? (
                                                            ticketClientes.map((dato2) => (
                                                                <div className='row' onClick={(event) => abrirTicket(dato2)} style={{cursor:'pointer',width:'100%',borderLeft: `2px solid ${dato2.border}`,background: dato2.background,margin: '5px 0px',padding: '5px',paddingBottom:'0px'}} key={dato2.id}>
                                                                    <div className='col-12' style={{padding:'0px'}}>
                                                                        {dato2.linea}
                                                                    </div>
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
                                                                        <h6 style={{marginBottom:'0px'}}>
                                                                            {dato2.nameLabel}
                                                                            {dato2.unreadMessages && dato2.unreadMessages > 0 ?(
                                                                                <span style={{display: 'inline-block',width:'20px',height:'20px',borderRadius:'50%',backgroundColor:'#4ccf2b',color:'#282828',textAlign:'center',lineHeight:'20px',fontSize:'14px',marginLeft:'10px'}}>{dato2.unreadMessages}</span>
                                                                            ):null}
                                                                        </h6>
                                                                        <p style={{marginBottom: '0px',background: dato2.background2,padding: '0px 10px',fontSize: '14px',marginTop: '4px'}}>
                                                                            <i className={dato2.ackIcon}></i>
                                                                            {dato2.bodyMessage}
                                                                        </p>
                                                                        <span style={{fontSize: '12px',textAlign: 'right',width: '100%',display: 'block'}}>{dato2.ultimoMessageDate}</span>
                                                                    </div>
                                                                    <div className='col-12' id={`optionTicketCola-${dato2.id}`} style={{textAlign:'right',borderTop:`1px solid ${dato2.border}`,padding:'5px 0px'}}>
                                                                        <span onClick={(event) => reasignarTicket(dato2)} style={{background: '#4eadff',color: '#000',border: '2px solid #4eadff',borderRadius: '20px',padding: '3px 5px 3px 3px',fontSize: '12px',cursor:'pointer'}}>
                                                                            <i style={{marginTop:'-3px'}} className='bx bx-transfer'></i>
                                                                            Reasignar
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            // no hay tickets en cola para el asesor
                                                            <p style={{textAlign: 'center', marginTop: '20px'}}>No hay tickets</p>
                                                        )}

                                                            {ticketconsultaGeneral && ticketconsultaGeneral.length > 0 ? (
                                                                ticketconsultaGeneral.map((dato2) => (
                                                                    <div className='row' style={{cursor:'pointer',width:'100%',borderLeft: `2px solid #73a4c1`,background: '#b5e4ff',margin: '5px 0px',padding: '5px',paddingBottom:'0px'}} key={dato2.id}>
                                                                        <div className='col-12' style={{padding:'0px'}}>
                                                                            {dato2.linea}
                                                                        </div>
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
                                                                            <h6 style={{marginBottom:'0px'}}>
                                                                                {dato2.nameLabel}
                                                                                {dato2.unreadMessages && dato2.unreadMessages > 0 ?(
                                                                                    <span style={{display: 'inline-block',width:'20px',height:'20px',borderRadius:'50%',backgroundColor:'#4ccf2b',color:'#282828',textAlign:'center',lineHeight:'20px',fontSize:'14px',marginLeft:'10px'}}>{dato2.unreadMessages}</span>
                                                                                ):null}
                                                                            </h6>
                                                                            <p style={{marginBottom: '0px',background: '#94c9e9',padding: '0px 10px',fontSize: '14px',marginTop: '4px'}}>
                                                                                <i className={dato2.ackIcon}></i>
                                                                                {dato2.bodyMessage}
                                                                            </p>
                                                                            <span style={{fontSize: '12px',textAlign: 'right',width: '100%',display: 'block'}}>{dato2.ultimoMessageDate}</span>
                                                                        </div>
                                                                        <div className='col-4' id={`optionTicketCola-${dato2.id}`} style={{textAlign:'right',borderTop:`1px solid #94c9e9`,padding:'5px 0px'}}>
                                                                            {dato2.status}
                                                                        </div>
                                                                        <div className='col-8' id={`optionTicketCola-${dato2.id}`} style={{textAlign:'right',borderTop:`1px solid #94c9e9`,padding:'5px 0px'}}>
                                                                            Ase: {dato2.asesor}
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (null)}
                                                    </React.Fragment>
                                                )}
                                                {banderaConsultandoTicketClientes2 ? (
                                                    <div style={{width:'100%',textAlign:'center'}}><i className='bx bx-loader-circle bx-spin'></i> Consultando...</div>
                                                ) : (null)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`${menuSeleccionado === 6 ? 'div-activo' : ''}`} style={{display:'none'}}>
                                        <div className="row" style={{maxHeight: '93%'}}>
                                            <div className='col-12' style={{marginTop:'20px'}}>
                                                <input type="text" onChange={(event) => handleSearch(6, event.target.value)} className="form-control buscador" placeholder="Buscar" aria-label="Username" aria-describedby="basic-addon1"/>
                                            </div>
                                            <div className='col-6'>
                                                <div className="form-check" style={{width:'fit-content'}}>
                                                    <input className="form-check-input" onChange={(event) => filtroSinLeer(event.target.checked,6)} type="checkbox" value="" id="checkboxfiltro-11"></input>
                                                    <label className="form-check-label">
                                                        sin Leer
                                                    </label>
                                                </div>
                                                <div className="form-check" style={{width:'fit-content'}}>
                                                    <input className="form-check-input" onChange={(event) => filtroSinResponder(event.target.checked,6)} type="checkbox" value="" id="checkboxfiltro-12"></input>
                                                    <label className="form-check-label" style={{textAlign:'left'}}>
                                                        sin Respuesta
                                                    </label>
                                                </div>
                                            </div>
                                            <div className='col-6' style={{textAlign:'right',paddingTop:'15px'}}>
                                                <span style={{cursor:'pointer'}} onClick={(event) => filtroFecha(6)}>
                                                    {seleFecha6 ? (
                                                        <>
                                                            <span style={{marginLeft:'4px'}}>Asc.</span> 
                                                            <i style={{marginTop:'-4px',color:'red',transform:'rotate(90deg)'}} className='bx bx-transfer-alt'></i>
                                                        </>
                                                    ):(
                                                        <>
                                                            <span style={{marginLeft:'4px'}}>Des.</span>
                                                            <i style={{marginTop:'-4px',color:'#4eadff',transform:'rotate(90deg)'}} className='bx bx-transfer-alt'></i>
                                                        </>
                                                    )}
                                                        
                                                </span>
                                            </div>
                                            <div className='col-12' onScroll={handleScrollFiltro(6)} style={{maxHeight: '52vh',overflow:'auto',padding:'0px 7px'}}>
                                                {banderaConsultandoTicketNoInteresados ? (
                                                    <p style={{textAlign: 'center', marginTop: '20px'}}>Consultando...</p>
                                                ) : (
                                                    <React.Fragment>
                                                        {ticketNoInteresados && ticketNoInteresados.length > 0 ? (
                                                            ticketNoInteresados.map((dato2) => (
                                                                <div className='row' onClick={(event) => abrirTicket(dato2)} style={{cursor:'pointer',width:'100%',borderLeft: `2px solid ${dato2.border}`,background: dato2.background,margin: '5px 0px',padding: '5px',paddingBottom:'0px'}} key={dato2.id}>
                                                                    <div className='col-12' style={{padding:'0px'}}>
                                                                        {dato2.linea}
                                                                    </div>
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
                                                                        <h6 style={{marginBottom:'0px'}}>
                                                                            {dato2.nameLabel}
                                                                            {dato2.unreadMessages && dato2.unreadMessages > 0 ?(
                                                                                <span style={{display: 'inline-block',width:'20px',height:'20px',borderRadius:'50%',backgroundColor:'#4ccf2b',color:'#282828',textAlign:'center',lineHeight:'20px',fontSize:'14px',marginLeft:'10px'}}>{dato2.unreadMessages}</span>
                                                                            ):null}
                                                                        </h6>
                                                                        <p style={{marginBottom: '0px',background: dato2.background2,padding: '0px 10px',fontSize: '14px',marginTop: '4px'}}>
                                                                            <i className={dato2.ackIcon}></i>
                                                                            {dato2.bodyMessage}
                                                                        </p>
                                                                        <span style={{fontSize: '12px',textAlign: 'right',width: '100%',display: 'block'}}>{dato2.ultimoMessageDate}</span>
                                                                    </div>
                                                                    <div className='col-12' id={`optionTicketCola-${dato2.id}`} style={{textAlign:'right',borderTop:`1px solid ${dato2.border}`,padding:'5px 0px'}}>
                                                                        <span onClick={(event) => reasignarTicket(dato2)} style={{background: '#4eadff',color: '#000',border: '2px solid #4eadff',borderRadius: '20px',padding: '3px 5px 3px 3px',fontSize: '12px',cursor:'pointer'}}>
                                                                            <i style={{marginTop:'-3px'}} className='bx bx-transfer'></i>
                                                                            Reasignar
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            // no hay tickets en cola para el asesor
                                                            <p style={{textAlign: 'center', marginTop: '20px'}}>No hay tickets</p>
                                                        )}

                                                        {ticketconsultaGeneral && ticketconsultaGeneral.length > 0 ? (
                                                            ticketconsultaGeneral.map((dato2) => (
                                                                <div className='row' style={{cursor:'pointer',width:'100%',borderLeft: `2px solid #73a4c1`,background: '#b5e4ff',margin: '5px 0px',padding: '5px',paddingBottom:'0px'}} key={dato2.id}>
                                                                    <div className='col-12' style={{padding:'0px'}}>
                                                                        {dato2.linea}
                                                                    </div>
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
                                                                        <h6 style={{marginBottom:'0px'}}>
                                                                            {dato2.nameLabel}
                                                                            {dato2.unreadMessages && dato2.unreadMessages > 0 ?(
                                                                                <span style={{display: 'inline-block',width:'20px',height:'20px',borderRadius:'50%',backgroundColor:'#4ccf2b',color:'#282828',textAlign:'center',lineHeight:'20px',fontSize:'14px',marginLeft:'10px'}}>{dato2.unreadMessages}</span>
                                                                            ):null}
                                                                        </h6>
                                                                        <p style={{marginBottom: '0px',background: '#94c9e9',padding: '0px 10px',fontSize: '14px',marginTop: '4px'}}>
                                                                            <i className={dato2.ackIcon}></i>
                                                                            {dato2.bodyMessage}
                                                                        </p>
                                                                        <span style={{fontSize: '12px',textAlign: 'right',width: '100%',display: 'block'}}>{dato2.ultimoMessageDate}</span>
                                                                    </div>
                                                                    <div className='col-4' id={`optionTicketCola-${dato2.id}`} style={{textAlign:'right',borderTop:`1px solid #94c9e9`,padding:'5px 0px'}}>
                                                                        {dato2.status}
                                                                    </div>
                                                                    <div className='col-8' id={`optionTicketCola-${dato2.id}`} style={{textAlign:'right',borderTop:`1px solid #94c9e9`,padding:'5px 0px'}}>
                                                                        Ase: {dato2.asesor}
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (null)}
                                                    </React.Fragment>
                                                )}
                                                {banderaConsultandoTicketNoInteresados2 ? (
                                                    <div style={{width:'100%',textAlign:'center'}}><i className='bx bx-loader-circle bx-spin'></i> Consultando...</div>
                                                ) : (null)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
            
            <div className="col-12" style={{display: ticketAbierto3 ? 'block':'none',padding:'0px',border: '1px solid #b7b7b7',height: '90vh',maxHeight: '90vh',marginTop: '-20px'}}>
                                    {ticketAbierto ? (
                                        <div style={{background: 'white',width: '100%',height:'50px',borderBottom:'2px solid #b7b7b7'}}>
                                            <div className='row' style={{width:'100%',margin:'auto'}}>
                                                <div className='col-1' style={{padding:'0px',paddingTop:'5px',textAlign:'right'}}>
                                                    <i class='bx bx-chevron-left' onClick={volverTicket} style={{fontSize:'40px'}}></i>
                                                </div>
                                                <div className='col-10' style={{display:'flex'}}>
                                                    <Image
                                                        src={ticketAbierto.image}
                                                        alt="Logo"
                                                        className='w-px-40 rounded-circle'
                                                        width={50}
                                                        height={50}
                                                        style={{marginTop:'5px',border:'2px solid #4eadff',background:'#d2d9dc'}}
                                                        priority
                                                    />
                                                    <span onClick={editarInfoContacto} style={{cursor:'pointer',background:'#4eadff',position: 'absolute',fontSize: '8px',padding: '2px 1px',borderRadius: '50%',height: '20px',width: '20px',marginLeft: '-5px',color: '#5a5a5a'}}><i style={{fontSize:'15px'}} className='bx bxs-pencil'></i></span>
                                                    <h7 style={{marginBottom:'0px',marginLeft:'7px',paddingTop:'6px',height:'47px',overflow:'auto',lineHeight:'15px',paddingTop:'10px'}}>
                                                        <b>{ticketAbierto.nameLabel}</b>
                                                        <span style={{fontSize:'12px',width:'100%',display:'block'}}>{ticketAbierto.numberLabel} <b>({ticketAbierto.linea})</b></span>
                                                    </h7>
                                                </div>
                                                <div className='col-1' style={{padding:'0px',paddingTop:'10px',textAlign:'right'}}>
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
                                                </div>
                                            </div>
                                        </div>
                                    ):(null)}
                                    <div style={divStyle}>
                                        <div ref={messagesRef}  onScroll={handleScroll} className="chat-container">
                                            <ul className="chat" >
                                                {contenidosMessagesChat}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className='row' style={{ display: chatActivo ? 'block' : 'none',position:'relative',background:'#e6e6e6',width:'100%',margin:'auto' }}>
                                        <div style={{position: 'absolute',display: reaccionMessage ? 'block' : 'none',marginTop: '-80px',marginRight: '0px',background: '#e6e6e6',height: '80px',zIndex: 20,padding:'4px'}}>
                                            {responseDiv}
                                        </div>
                                        {ticketAbierto && ticketAbierto.unreadMessages > 0 ? (
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
                                        ) : null}

                                        <div className='col-12' style={{paddingTop:'3px',paddingRight:'3px',paddingLeft:'3px'}}>
                                            <div style={{textAlign:'left',marginTop: '0px',background: '#d3d3d3',height: '113px',position: 'absolute',width: '98.1%',overflow: 'auto',zIndex: '10',padding: '10px 5px',display:showDropdown ? 'block' : 'none'}}>
                                                <div style={{borderBottom:'1px solid #a7a7a7'}}><span onClick={cerrarAtajos} style={{fontWeight: 'bold',background: '#a7a7a7',padding: '3px 10px',cursor:'pointer'}}>Cerrar</span></div>
                                                <ul className="list-group" style={{height:'69px',overflow:'auto'}}>
                                                    {respuestasRapidas &&  respuestasRapidas.map((dato2) => (
                                                        <li onClick={() => atajoClick(dato2)} style={{borderBottom:'1px solid #a9a9a9',cursor:'pointer',padding:'7px 0px'}}>
                                                            <span style={{color:'black',fontWeight:'bold'}}>{dato2.title}:</span>
                                                            <span style={{marginLeft:'5px'}}>{dato2.text}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className='row'>
                                                <div className='col-11'>
                                                    <EmojiOneArea onEmojiSelect={function (text: string): void {
                                                        throw new Error('Function not implemented.');
                                                    }}/>
                                                </div>
                                                <div className='col-1' style={{padding:'0px',textAlign:'center'}} onClick={enviarMensajeTexto}>
                                                    <i
                                                        style={{ fontSize: '22px', marginTop: '45px', color: '#222d32',marginLeft:'-20px'}}
                                                        className='bx bx-send' // Detener grabación al hacer clic en el icono de eliminar
                                                        
                                                    ></i>
                                                </div>
                                            </div>
                                            
                                            <div style={{textAlign: 'right',marginTop: '3px'}}>
                                                <div className='row'>
                                                    <div className='col-4' style={{display:'flex'}}>
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
                                                            {audioURL && <audio style={{height:'25px',marginTop:'2px'}} controls src={audioURL}></audio>}
                                                            <i
                                                                onClick={enviarAudio}
                                                                style={{ marginLeft: '2px', fontSize: '22px', marginTop: '2px', color: '#a5acb4', marginBottom: '6px',height:'19px',borderLeft:'3px solid #a5acb4'}}
                                                                className='bx bxs-send'
                                                            ></i>
                                                        </>
                                                    )}
                                                    </div>
                                                    <div className='col-12'>
                                                        {!recording && (
                                                            <>
                                                                <span style={{cursor:'pointer',background: 'rgb(209, 209, 209)',padding: '1px 1px 1px 2px',marginTop: '0px',marginBottom: '4px',display: 'inline-block',width: 'fit-content'}}>
                                                                    <i onClick={abrirAtajos} className='bx bxs-zap'></i> <input style={{width:'120px',background:'white',paddingLeft:'10px'}} className='inputSolo' onChange={handleChangeAtajos} value={inputValueAtajo} placeholder='Atajo...'></input>
                                                                </span>
                                                                <span onClick={enviarArchivoOpen} style={{cursor:'pointer',background: 'rgb(209, 209, 209)',padding: '1px 10px',marginTop: '0px',marginBottom: '4px',display: 'inline-block',width: 'fit-content',marginLeft:'4px'}}>
                                                                    <i style={{transform: 'rotate(120deg)'}} className='bx bx-paperclip'></i>
                                                                </span>
                                                                <span onClick={galeriaOpen} style={{cursor:'pointer',background: 'rgb(209, 209, 209)',padding: '1px 10px',marginTop: '0px',marginBottom: '4px',display: 'inline-block',width: 'fit-content',marginLeft:'4px'}}>
                                                                    <i className='bx bx-images'></i> 
                                                                </span>
                                                                <span onClick={startRecording} style={{cursor:'pointer',background: 'rgb(209, 209, 209)',padding: '1px 10px',marginTop: '0px',marginBottom: '4px',display: 'inline-block',width: 'fit-content',marginLeft:'4px'}}>
                                                                    <i className='bx bx-microphone'></i> 
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                        </div>
                    </div>

            <div style={{display: openGaleria ? 'flex' : 'none',background: 'white',position: 'absolute',left: '30px',top: '0px',zIndex: '10000',height: '100vh',width: '400px',maxWidth:'calc(100vw - 30px)',boxShadow:'0 0 0.375rem 0.25rem rgba(161, 172, 184, 0.15)'}}>
                <a onClick={galeriaClose} style={{zIndex:'10',cursor:'pointer',background: '#222d32',width: '46px',height: '46px',marginLeft: '-20px',marginTop: '25px',color: 'white',borderRadius: '50%',border: '8px solid white'}}>
                    <i style={{fontSize: '31px',marginLeft: '-1px'}} className="bx bx-chevron-right"></i>
                </a>
                <div style={{width:'100%',zIndex:'9',position: 'absolute',height: '100%',overflowY: 'auto',overflowX: 'hidden',paddingTop:'10px'}}>
                    <div className='row' style={{width:'100%',margin:'auto'}}>
                        <div className='col-12' style={{marginBottom:'25px'}}>
                            <input onChange={handleBusquedaMultimedia} style={{width:'90%',margin:'auto'}} className="form-control" placeholder="Buscar" aria-label="Username" aria-describedby="basic-addon1" type="text">
                            </input>                                    
                        </div>
                        <div className="col-12">
                            {banderaConsultandoMultimedia ? (
                                <div className='row' style={{marginTop:'20px',maxHeight:'79vh',overflow:'auto'}}>
                                    {divdetallMultimedia.length == 0 ? (
                                        <div style={{textAlign:'center'}}>No se encontraron registros.</div>
                                    ):(
                                        <>
                                        {divdetallMultimedia.map((dato3) => (
                                            <div className="col-6 divMultimedia" id={dato3.title}  style={{paddingTop:'10px',marginBottom:'10px'}}>
                                                <div style={{height:'80%',width:'80%',margin:'auto',display:'flex',alignItems:'center',cursor:'pointer'}}>
                                                    <div className="card card-block card-1" >
                                                    {dato3.typeId == 1 ? (
                                                        <>
                                                        <img 
                                                            src={process.env.ENDPOINT_API+'/static/'+dato3.mediaUrl}
                                                            style={{maxHeight: '122px',margin: 'auto',borderRadius: '8px',maxWidth: '100%'}}
                                                        >
                                                        </img>
                                                        </>
                                                    ):dato3.typeId == 2 ? (
                                                        <>
                                                        <video
                                                            id={`video-${dato3.id}`}
                                                            onMouseOver={() => handleMouseOver(dato3.id)}
                                                            onMouseOut={() => onMouseOut(dato3.id)}
                                                            style={{maxHeight: '122px',margin: 'auto',borderRadius: '8px',maxWidth: '100%'}}
                                                        >
                                                            <source src={process.env.ENDPOINT_API+'/static/'+dato3.mediaUrl} type="video/mp4" />
                                                        </video>
                                                        </>
                                                    ):dato3.typeId == 3 ? (
                                                        <>
                                                            <img style={{borderRadius:'8px'}} onMouseOver={() => handleMouseOverAudio(dato3.id)} onMouseOut={() => onMouseOutAudio(dato3.id)} src={process.env.ENDPOINT_API+'/static/multimedia/gifAudio.gif'} alt="Imagen" />
                                                            <audio id={`audio-${dato3.id}`} style={{display:'none',height:'25px',marginTop:'2px'}} controls src={process.env.ENDPOINT_API+'/static/'+dato3.mediaUrl}></audio>
                                                        </>
                                                    ):(
                                                        <>
                                                            <img style={{maxHeight: '122px',margin: 'auto',borderRadius: '8px',maxWidth: '100%',background:'white',padding:'10px'}} src={process.env.ENDPOINT_API+'/static/multimedia/gifDocumento.gif'} alt="Imagen" />
                                                        </>
                                                    )}
                                                    
                                                    </div>
                                                </div>
                                                <div className="row" style={{width:'100%',margin:'auto',marginTop:'4px'}}>
                                                    <div className="col-sm-12" style={{color:'#222d32',textAlign:'center',padding:'0px',cursor:'pointer'}} onClick={() => detallModalMultimedia(dato3.id)}>
                                                        {dato3.title} <i style={{marginTop:'-2px',cursor:'pointer',borderLeft:'2px solid #222d32',marginLeft: '4px',paddingLeft: '5px'}} className='bx bx-search-alt'></i>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        </>
                                    )}
                                </div>
                            ):(
                                <>
                                {banderaverTodoMultimedia ? (
                                    <>
                                        <div className='row'>
                                            <div className='col-12'>
                                                <p style={{color: '#222d32',fontWeight: '800',textAlign:'center'}}>{categoriasMultimediaDetall.name}</p>
                                            </div>
                                            <div className='col-12' style={{marginTop:'-45px',textAlign:'right'}}>
                                                <i className="bx bx-x-circle" onClick={closeDetalleMultimedia} style={{cursor:'pointer'}} ></i>
                                            </div>
                                            <div className='col-3' style={{paddingRight:'0px'}}>
                                                <span onClick={() => cambiarTipoDetallMultimedia(1)} style={{fontSize:'small',width:'100%',display:'ruby-text',background: '#f1f1f1',padding: '5px 7px',paddingBottom:'3px',borderRadius: '4px',cursor: 'pointer'}}>Imagenes</span>
                                            </div>
                                            <div className='col-3' style={{paddingRight:'0px'}}>
                                                <span onClick={() => cambiarTipoDetallMultimedia(2)} style={{fontSize:'small',width:'100%',display:'ruby-text',background: '#f1f1f1',padding: '5px 7px',paddingBottom:'3px',borderRadius: '4px',cursor: 'pointer'}}>Videos</span>
                                            </div>
                                            <div className='col-3' style={{paddingRight:'0px'}}>
                                                <span onClick={() => cambiarTipoDetallMultimedia(3)} style={{fontSize:'small',width:'100%',display:'ruby-text',background: '#f1f1f1',padding: '5px 7px',paddingBottom:'3px',borderRadius: '4px',cursor: 'pointer'}}>Audios</span>
                                            </div>
                                            <div className='col-3'>
                                                <span onClick={() => cambiarTipoDetallMultimedia(4)} style={{fontSize:'small',width:'100%',display:'ruby-text',background: '#f1f1f1',padding: '5px 7px',paddingBottom:'3px',borderRadius: '4px',cursor: 'pointer'}}>Archivos</span>
                                            </div>
                                            <div className='row' style={{marginTop:'20px',maxHeight:'79vh',overflow:'auto'}}>
                                                {divdetallMultimedia.map((dato3) => (
                                                    <div className="col-6 divMultimedia" id={dato3.title}  style={{paddingTop:'10px',marginBottom:'10px'}}>
                                                        <div style={{height:'80%',width:'80%',margin:'auto',display:'flex',alignItems:'center',cursor:'pointer'}}>
                                                            <div className="card card-block card-1" >
                                                            {dato3.typeId == 1 ? (
                                                                <>
                                                                <img 
                                                                    src={process.env.ENDPOINT_API+'/static/'+dato3.mediaUrl}
                                                                    style={{maxHeight: '122px',margin: 'auto',borderRadius: '8px',maxWidth: '100%'}}
                                                                >
                                                                </img>
                                                                </>
                                                            ):dato3.typeId == 2 ? (
                                                                <>
                                                                <video
                                                                    id={`video-${dato3.id}`}
                                                                    onMouseOver={() => handleMouseOver(dato3.id)}
                                                                    onMouseOut={() => onMouseOut(dato3.id)}
                                                                    style={{maxHeight: '122px',margin: 'auto',borderRadius: '8px',maxWidth: '100%'}}
                                                                >
                                                                    <source src={process.env.ENDPOINT_API+'/static/'+dato3.mediaUrl} type="video/mp4" />
                                                                </video>
                                                                </>
                                                            ):dato3.typeId == 3 ? (
                                                                <>
                                                                    <img style={{borderRadius:'8px'}} onMouseOver={() => handleMouseOverAudio(dato3.id)} onMouseOut={() => onMouseOutAudio(dato3.id)} src={process.env.ENDPOINT_API+'/static/multimedia/gifAudio.gif'} alt="Imagen" />
                                                                    <audio id={`audio-${dato3.id}`} style={{display:'none',height:'25px',marginTop:'2px'}} controls src={process.env.ENDPOINT_API+'/static/'+dato3.mediaUrl}></audio>
                                                                </>
                                                            ):(
                                                                <>
                                                                    <img style={{maxHeight: '122px',margin: 'auto',borderRadius: '8px',maxWidth: '100%',background:'white',padding:'10px'}} src={process.env.ENDPOINT_API+'/static/multimedia/gifDocumento.gif'} alt="Imagen" />
                                                                </>
                                                            )}
                                                            
                                                            </div>
                                                        </div>
                                                        <div className="row" style={{width:'100%',margin:'auto',marginTop:'4px'}}>
                                                            <div className="col-sm-12" style={{color:'#222d32',textAlign:'center',padding:'0px',cursor:'pointer'}} onClick={() => detallModalMultimedia(dato3.id)}>
                                                                {dato3.title} <i style={{marginTop:'-2px',cursor:'pointer',borderLeft:'2px solid #222d32',marginLeft: '4px',paddingLeft: '5px'}} className='bx bx-search-alt'></i>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ):(
                                    <>
                                    {categoriasMultimedia && categoriasMultimedia.length > 0 ? (
                                        categoriasMultimedia.map((dato2) => (
                                            <>
                                            <div className='row' key={'categoria'+dato2.id}>
                                                {dato2.multimediaCont.length > 6 ? (
                                                    <>
                                                        <div className='col-7'>
                                                            <p style={{color: '#222d32',fontWeight: '800'}}>{dato2.name}:</p>
                                                        </div>
                                                        <div className='col-5' style={{paddingLeft:'0px',textAlign:'right'}}>
                                                            <span onClick={() => verTodoMultimedia(dato2)} style={{background: '#f1f1f1',padding: '3px 7px',borderRadius: '4px',cursor: 'pointer'}}>Ver todo</span>
                                                        </div>
                                                    </>
                                                ):(
                                                    <>
                                                        <div className='col-12'>
                                                            <p style={{color: '#222d32',fontWeight: '800'}}>{dato2.name}:</p>
                                                        </div>
                                                    </>
                                                )}
                                                
                                            </div>
                                            <div className='row'>
                                                {dato2.multimedia.length > 0 ? (
                                                    <React.Fragment>
                                                    {dato2.multimedia.length > 2 ? (
                                                        <>
                                                        <div className='col-1' style={{padding:'0px',textAlign:'right'}}>
                                                            <button style={{height:'130px',zIndex:'1'}} onClick={() => handlePrevClick(dato2.id)}>
                                                                <span style={{background: '#ffffff70',border: '2px solid',height: '20px',width: '20px',display: 'block',borderRadius: '50%',marginLeft: '-10px'}}>
                                                                    <i style={{marginTop:'-6px'}} className='bx bx-chevron-left'></i>
                                                                </span>
                                                            </button>
                                                        </div>
                                                        <div className='col-10' style={{padding:'0px',marginTop:'-15px'}}>
                                                            <div id={`multimedia-${dato2.id}`} className="scrolling-wrapper row flex-row flex-nowrap">
                                                                {dato2.multimedia.map((dato3) => (
                                                                    <div className="col-5 priDiv" key={'categori3a'+dato3.id} style={{paddingTop:'10px'}}>
                                                                        <div style={{height:'80%',width:'80%',margin:'auto',display:'flex',alignItems:'center',cursor:'pointer'}}>
                                                                            <div className="card card-block card-1" >
                                                                            {dato3.typeId == 1 ? (
                                                                                <>
                                                                                <img 
                                                                                    src={process.env.ENDPOINT_API+'/static/'+dato3.mediaUrl}
                                                                                    style={{maxHeight: '122px',margin: 'auto',borderRadius: '8px',maxWidth: '100%'}}
                                                                                >
                                                                                </img>
                                                                                </>
                                                                            ):dato3.typeId == 2 ? (
                                                                                <>
                                                                                <video
                                                                                    id={`video-${dato3.id}`}
                                                                                    onMouseOver={() => handleMouseOver(dato3.id)}
                                                                                    onMouseOut={() => onMouseOut(dato3.id)}
                                                                                    style={{maxHeight: '122px',margin: 'auto',borderRadius: '8px',maxWidth: '100%'}}
                                                                                >
                                                                                    <source src={process.env.ENDPOINT_API+'/static/'+dato3.mediaUrl} type="video/mp4" />
                                                                                </video>
                                                                                </>
                                                                            ):dato3.typeId == 3 ? (
                                                                                <>
                                                                                    <img style={{borderRadius:'8px'}} onMouseOver={() => handleMouseOverAudio(dato3.id)} onMouseOut={() => onMouseOutAudio(dato3.id)} src={process.env.ENDPOINT_API+'/static/multimedia/gifAudio.gif'} alt="Imagen" />
                                                                                    <audio id={`audio-${dato3.id}`} style={{display:'none',height:'25px',marginTop:'2px'}} controls src={process.env.ENDPOINT_API+'/static/'+dato3.mediaUrl}></audio>
                                                                                </>
                                                                            ):(
                                                                                <>
                                                                                    <img style={{maxHeight: '122px',margin: 'auto',borderRadius: '8px',maxWidth: '100%',background:'white',padding:'10px'}} src={process.env.ENDPOINT_API+'/static/multimedia/gifDocumento.gif'} alt="Imagen" />
                                                                                </>
                                                                            )}
                                                                            
                                                                            </div>
                                                                        </div>
                                                                        <div className="row" style={{width:'100%',margin:'auto',marginTop:'4px'}}>
                                                                            <div className="col-sm-12" style={{cursor:'pointer',color:'#222d32',textAlign:'center',padding:'0px'}} onClick={() => detallModalMultimedia(dato3.id)}>
                                                                                {dato3.title} <i style={{marginTop:'-2px',cursor:'pointer',borderLeft:'2px solid #222d32',marginLeft: '4px',paddingLeft: '5px'}} className='bx bx-search-alt'></i>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))} 
                                                            </div>
                                                        </div>
                                                        <div className='col-1' style={{padding:'0px',textAlign:'left',paddingLeft:'10px'}}>
                                                            <button style={{height:'130px',zIndex:'1'}} onClick={() => handleNextClick(dato2.id)}>
                                                                <span style={{background: '#ffffff70',border: '2px solid',height: '20px',width: '20px',display: 'block',borderRadius: '50%',marginLeft: '-10px'}}>
                                                                    <i style={{marginTop:'-6px'}} className='bx bx-chevron-right'></i>
                                                                </span>
                                                            </button>
                                                        </div>
                                                        </>
                                                    ):(
                                                        <>
                                                        <div className='col-12' style={{padding:'0px',marginTop:'-15px'}}>
                                                            <div id={`multimedia-${dato2.id}`} class="scrolling-wrapper row flex-row flex-nowrap">
                                                                {dato2.multimedia.map((dato3) => (
                                                                    <div className="col-5 priDiv" key={'categoria2'+dato3.id} style={{paddingTop:'10px'}}>
                                                                        <div style={{height:'80%',width:'80%',margin:'auto',display:'flex',alignItems:'center',cursor:'pointer'}}>
                                                                            <div className="card card-block card-1" >
                                                                            {dato3.typeId == 1 ? (
                                                                                <>
                                                                                <img 
                                                                                    src={process.env.ENDPOINT_API+'/static/'+dato3.mediaUrl}
                                                                                    style={{maxHeight: '122px',margin: 'auto',borderRadius: '8px',maxWidth: '100%'}}
                                                                                >
                                                                                </img>
                                                                                </>
                                                                            ):dato3.typeId == 2 ? (
                                                                                <>
                                                                                <video
                                                                                    id={`video-${dato3.id}`}
                                                                                    onMouseOver={() => handleMouseOver(dato3.id)}
                                                                                    onMouseOut={() => onMouseOut(dato3.id)}
                                                                                    style={{maxHeight: '122px',margin: 'auto',borderRadius: '8px',maxWidth: '100%'}}
                                                                                >
                                                                                    <source src={process.env.ENDPOINT_API+'/static/'+dato3.mediaUrl} type="video/mp4" />
                                                                                </video>
                                                                                </>
                                                                            ):dato3.typeId == 3 ? (
                                                                                <>
                                                                                    <img style={{borderRadius:'8px'}} onMouseOver={() => handleMouseOverAudio(dato3.id)} onMouseOut={() => onMouseOutAudio(dato3.id)} src={process.env.ENDPOINT_API+'/static/multimedia/gifAudio.gif'} alt="Imagen" />
                                                                                    <audio id={`audio-${dato3.id}`} style={{display:'none',height:'25px',marginTop:'2px'}} controls src={process.env.ENDPOINT_API+'/static/'+dato3.mediaUrl}></audio>
                                                                                </>
                                                                            ):(
                                                                                <>
                                                                                    <img style={{maxHeight: '122px',margin: 'auto',borderRadius: '8px',maxWidth: '100%',background:'white',padding:'10px'}} src={process.env.ENDPOINT_API+'/static/multimedia/gifDocumento.gif'} alt="Imagen" />
                                                                                </>
                                                                            )}
                                                                            
                                                                            </div>
                                                                        </div>
                                                                        <div className="row" style={{width:'100%',margin:'auto',marginTop:'4px'}}>
                                                                            <div className="col-sm-12" style={{color:'#222d32',textAlign:'center',padding:'0px',cursor:'pointer'}} onClick={() => detallModalMultimedia(dato3.id)}>
                                                                                {dato3.title} <i style={{marginTop:'-2px',cursor:'pointer',borderLeft:'2px solid #222d32',marginLeft: '4px',paddingLeft: '5px'}} className='bx bx-search-alt'></i>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        </>
                                                    )}
                                                    </React.Fragment>
                                                ):(
                                                    <div style={{textAlign:'center'}}>No tiene contenido multimedia.</div>
                                                )}
                                            </div>
                                            <div style={{background: '#c5c5c5',width: '80%',height: '1px',margin: 'auto',marginTop: '15px',marginBottom: '15px'}}></div>
                                            </>
                                        ))
                                    ):(
                                        <div style={{textAlign:'center'}}>No se han encontrado registros.</div>
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
    );
}