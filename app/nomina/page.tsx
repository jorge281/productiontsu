"use client";

import React, { useEffect,useState,useRef } from 'react';
import { format, parseISO }          from 'date-fns';
import withReactContent              from 'sweetalert2-react-content';
import html2canvas                   from 'html2canvas';
import { Modal }                     from 'react-bootstrap';
import Cookies                       from 'js-cookie';
import axios                         from 'axios';
import Swal                          from 'sweetalert2';
import { es }                        from 'date-fns/locale';
import jsPDF                         from 'jspdf';

import '../comprobantes/style.css';

const $ = require('jquery');
let usuarioId = 1;
let cargoSite = 0;
let pagoNominaData = [];


export default function Home() {

    const [usuario, setUsuario] = useState({ 
        nombre: '',
        perfil: '',
        foto: '',
        user: ''
    });

    const divRefs = useRef([]);
    const [data,setData] = useState([])
    const [colaborador,setColaborador] = useState({
        id: "",
        name: "",
        document: "",
        cargo: "",
        area: ""
    })

    const [contadorPagoNomina,setContadorPagoNomina] = useState(1);
    const [dataColaboradores, setDataColaboradores] = useState([])
    const [tiposBonos,setTiposBonos] = useState([]);
    const [resumenNomina, setResumenNomina] = useState([])
    const [consultando,setConsultando] = useState(true);
    const [consultandoBono,setConsultandoBono] = useState(true);
    const [reportarBono,setReportarBono] = useState(true);
    const [resultBonos,setResultBonos] = useState([]);
    const [modalPago,setModalPago] = useState(false);
    const [modalBono,setModalBono] = useState(false);
    const [modalCrearBono,setModalCrearBono] = useState(false);

    useEffect(() => {

        if(cargoSite == 0){
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

                $(".navbar").hide();
                usuarioId = decodedToken.payload.user; 
                cargarColaboradores()
                cargarTipoBonos();

                cargoSite = 1;
            }
            
        }

    })

    async function cargarTipoBonos(){
        await axios.post(process.env.ENDPOINT_API+'/user/tipoBonos').then(response => { 
            setTiposBonos(response.data.bonos)
            setContadorPagoNomina(response.data.secuencia)
        }).catch(error => {
            console.log(error);
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (cargar tipo de bonos)",
                icon: "error"
            })
        });

             
    }

    async function cargarColaboradores(){
        await axios.post(process.env.ENDPOINT_API+'/user/nomina').then(response => { 
            setConsultando(false);
            setDataColaboradores(response.data.colaboradores)
        }).catch(error => {
            console.log(error);
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (cargar resumen)",
                icon: "error"
            })
        });
    }

    function formatearNumeroConPuntos(numero) {
        return numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    const formattedPrice = (value) => {
        if (typeof value !== 'number') {
            value = Number(value);
        }
        return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    async function selecionarTodo(){
        if($("#seleTodo").prop('checked')){
            $(".selePedido").prop({'checked':true});
            pagoNominaData = [];
            for (var i = 0; i <  dataColaboradores.length; i++) {
                pagoNominaData.push(dataColaboradores[i].id)
            }
        }else{
            pagoNominaData = [];
            $(".selePedido").prop({'checked':false});
        }
    }

    function selecionarPersonal(id){
        if($("#selectPersonal-"+id).prop('checked')){
            let banderaAgregar = true;
            for (var i = 0; i <  pagoNominaData.length; i++) {
                if(parseInt(pagoNominaData[i]) == parseInt(id)){
                    banderaAgregar = false;
                }
            }
            if(banderaAgregar){
                pagoNominaData.push(id)
            }
        }else{
            for (var i = 0; i <  pagoNominaData.length; i++) {
                if(pagoNominaData[i] == id){
                    pagoNominaData.splice(i, 1);
                }
            }
        }
    }

    const formatSpanishDate2 = (date) => {
        const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
    
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
    
        return `${day} de ${month} del ${year}`;
    };


    const formatSpanishDate3 = (date) => {
    
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
    
        return `${hours}:${minutes} ${ampm}`;
    };

    function liquidar(){
        if(pagoNominaData.length == 0){
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                type: "info",
                title: 'Alerta',
                text: "Elige una o varias personas",
            });
        }else{
            let dataResumen = [];
            let fechaSubida = new Date();
            let contador = contadorPagoNomina;
            for (var i = 0; i <  pagoNominaData.length; i++) {
                for (var e = 0; e <  dataColaboradores.length; e++) {
                    if(dataColaboradores[e].id == pagoNominaData[i]){
                        dataResumen.push({
                            contador: contador,
                            soporte: 'TSU-SP '+contador,
                            imagen:dataColaboradores[e].banco['imagen'],
                            cuenta:dataColaboradores[e].banco['cuenta'],
                            idBanco: dataColaboradores[e].banco['id'],
                            celular: dataColaboradores[e].phone,
                            titular:dataColaboradores[e].banco['titular'],
                            document: dataColaboradores[e].document,
                            documentoTitular:dataColaboradores[e].banco['documentoTitular'],
                            banco:dataColaboradores[e].banco['nombre'], 
                            nombre: dataColaboradores[e].name,
                            pago: dataColaboradores[e].pago,
                            id:dataColaboradores[e].id,
                            area:dataColaboradores[e].area,
                            cargo:dataColaboradores[e].cargo,
                            correo:dataColaboradores[e].email,
                            generado:formatSpanishDate2(fechaSubida),
                            hora:formatSpanishDate3(fechaSubida),
                            status: 0,
                            visible: 0,
                            sueldoBase: formattedPrice(dataColaboradores[e].baseSueldo),
                            comisiones: formattedPrice(dataColaboradores[e].comision),
                            bonos: formattedPrice(dataColaboradores[e].bono),
                            subTotal:formattedPrice(parseInt(dataColaboradores[e].baseSueldo)+parseInt(dataColaboradores[e].comision)+parseInt(dataColaboradores[e].bono)),
                            deducciones: formattedPrice(dataColaboradores[e].deducciones),
                            total:formattedPrice((parseInt(dataColaboradores[e].baseSueldo)+parseInt(dataColaboradores[e].comision)+parseInt(dataColaboradores[e].bono))-(parseInt(dataColaboradores[e].deducciones)-parseInt(dataColaboradores[e].compensado))),
                            compensado: formattedPrice(dataColaboradores[e].compensado)
                        })
                        contador += 1;
                    }
                }
            }
            setData(dataResumen);
            setResumenNomina(dataResumen)
            setModalPago(true);
        }
    }

    function cerrarModal(){
        setModalPago(false);
        setModalBono(false);
        setModalCrearBono(false);
    }

    function reportarBonoFunction(){
        setReportarBono(true);
    }

    function cancelarBono(){
        setReportarBono(false);
    }

    function bonoPersonal(datos){
        setModalBono(true);
        setColaborador(datos);
        setConsultandoBono(true);
        setReportarBono(false);
        setTimeout(function(){
            $("#estadoBonos").val(1);
            bonosColaborador(datos.id);
        }, 100);
    }

    function handleEstadoBonos(){
        setConsultandoBono(true);
        setResultBonos([])
        bonosColaborador(colaborador.id);
        if($("#estadoBonos").val() == 1){
            $("#thBonosOpciones").html('Opciones')
        }
        if($("#estadoBonos").val() == 2){
            $("#thBonosOpciones").html('Pago')
        }
        if($("#estadoBonos").val() == 0){
            $("#thBonosOpciones").html('Eliminado')
        }
        
    }

    async function bonosColaborador(id){
        await axios.post(process.env.ENDPOINT_API+'/user/bonos',{ 
            colaborador: id,
            estado: $("#estadoBonos").val()
        }).then(response => {
            setConsultandoBono(false);
            setResultBonos(response.data.bonos)
        }).catch(error => {
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (cargar bonos)",
                icon: "error"
            })
        }); 
    }

    const formatFecha = (fechaISO) => {
        if (!fechaISO) {
            // Maneja el caso donde fechaISO es undefined, null o vacío
            return "";
        }
        const date = parseISO(fechaISO);
        if(date != "Invalid Date"){
            // Formatea el día y el mes abreviado con punto al final
            const formattedDate = format(date, "d 'de' MMM. ", { locale: es });
            // Formatea la hora con AM/PM
            const formattedTime = format(date, "hh:mm a");

            return `${formattedDate}`;
        }
        return "";
    };

    const formatHora = (fechaISO) => {
        if (!fechaISO) {
            // Maneja el caso donde fechaISO es undefined, null o vacío
            return "";
        }
        const date = parseISO(fechaISO);
        if(date != "Invalid Date"){
            // Formatea el día y el mes abreviado con punto al final
            const formattedDate = format(date, "d 'de' MMM. ", { locale: es });
            // Formatea la hora con AM/PM
            const formattedTime = format(date, "hh:mm a");

            return `${formattedTime}`;
        }
        return "";
    };

    async function agregarBono(){
        let idBono = $("#selectBono").val()
        setModalBono(false);
        let valorBono = 0;
        for (var i = 0; i < tiposBonos.length; i++) {
            if(tiposBonos[i].id == idBono){
                valorBono = tiposBonos[i].valor;
            }
        }
        
        const swalWithReact = withReactContent(Swal);
        swalWithReact.fire({
            title: "Confirmación",
            html: "¿Esta segur@ de reportar el bono por "+formattedPrice(valorBono)+" a "+colaborador.name+"?",
            showCancelButton: true,
            confirmButtonText: "Si", // Texto personalizado para el botón de confirmación
            cancelButtonText: "No", // Texto personalizado para el botón de cancelación
            allowOutsideClick: false
        }).then(async(result) => {
            if (result.isConfirmed) {
                const swalWithReact = withReactContent(Swal);
                swalWithReact.fire({
                    title: "Aprobando",
                    text: "Por favor, espera un momento...",
                    icon: "info",
                    showConfirmButton: false, // Ocultar el botón de confirmación
                    allowOutsideClick: false // Evitar cerrar el SweetAlert haciendo clic fuera de él
                });
                await axios.post(process.env.ENDPOINT_API+'/user/reportarBono',{ 
                    usuario: usuarioId,
                    colaborador: colaborador.id,
                    bono: idBono
                }).then(response => { 
                    swalWithReact.close();
                    cancelarBono();
                    setModalBono(true);
                    setConsultandoBono(true);
                    setResultBonos([])
                    setTimeout(function(){
                        bonosColaborador(colaborador.id);
                    }, 100);
                    cargarColaboradores()
                }).catch(error => {
                    console.log(error);
                    const swalWithReact = withReactContent(Swal);
                    // Manejar el error aquí
                    withReactContent(Swal).fire({
                        title: "Error",
                        text: "Comunica con soporte (reportar bono)",
                        icon: "error"
                    })
                });
            }else{
                setModalBono(true);
            }
        })
    }

    function eliminarBono(bono){
        setModalBono(false);
        const swalWithReact = withReactContent(Swal);
        swalWithReact.fire({
            title: "Confirmación",
            html: '¿Esta segur@ de eliminar el bono "'+bono.detalle+'" por un valor de '+formattedPrice(bono.valor)+' del colaborador "'+colaborador.name+'" asignado el '+formatFecha(bono.fecha)+' a las '+formatHora(bono.fecha)+' por '+bono.name+'?',
            showCancelButton: true,
            confirmButtonText: "Si", // Texto personalizado para el botón de confirmación
            cancelButtonText: "No", // Texto personalizado para el botón de cancelación
            allowOutsideClick: false
        }).then(async(result) => {
            if (result.isConfirmed) {
                const swalWithReact = withReactContent(Swal);
                swalWithReact.fire({
                    title: "Aprobando",
                    text: "Por favor, espera un momento...",
                    icon: "info",
                    showConfirmButton: false, // Ocultar el botón de confirmación
                    allowOutsideClick: false // Evitar cerrar el SweetAlert haciendo clic fuera de él
                });
                await axios.post(process.env.ENDPOINT_API+'/user/eliminarBono',{ 
                    usuario: usuarioId,
                    bono: bono.id
                }).then(response => { 
                
                    swalWithReact.close();
                    setModalBono(true);
                    setConsultandoBono(true);
                    setResultBonos([])
                    setTimeout(function(){
                        bonosColaborador(colaborador.id);
                    }, 100);
                    cargarColaboradores()
                
                }).catch(error => {
                    console.log(error);
                    const swalWithReact = withReactContent(Swal);
                    // Manejar el error aquí
                    withReactContent(Swal).fire({
                        title: "Error",
                        text: "Comunica con soporte (eliminar bono)",
                        icon: "error"
                    })
                });
            }else{
                setModalBono(true);
            }
        })
    }

    async function imprimirConstanciasPago(){
        setModalPago(false);
        const swalWithReact = withReactContent(Swal);
        swalWithReact.fire({
            title: "Generando",
            text: "Por favor, espera un momento...",
            icon: "info",
            showConfirmButton: false, // Ocultar el botón de confirmación
            allowOutsideClick: false // Evitar cerrar el SweetAlert haciendo clic fuera de él
        });
        const input = document.getElementById('divToPrint');
        input.classList.remove('hidden');

        setTimeout(function(){

            const pdf = new jsPDF('landscape', 'mm', [140, 213]);

            // Iterar sobre los divs y generar una página por cada uno
            divRefs.current.forEach((div, index) => {
                html2canvas(div).then((canvas) => {
                    const imgData = canvas.toDataURL('image/png');
                    const imgWidth = 213;
                    const imgHeight = (canvas.height * imgWidth) / canvas.width;

                    if (index > 0) {
                        pdf.addPage(); // Añadir una nueva página después de la primera
                    }

                    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

                    // Guardar el PDF en la última iteración
                    if (index === divRefs.current.length - 1) {
                        input.classList.add('hidden');
                        pdf.save('multipage.pdf');
                        swalWithReact.close();
                        setModalPago(true);
                    }
                });
            });

        }, 100);
    }

    // Función para formatear como número de celular
    function formatearNumeroCelular(numero) {
        // Eliminar todos los caracteres no numéricos
        var numeroSoloDigitos = numero.replace(/\D/g, '');

        // Aplicar formato específico para número de celular
        var longitud = numeroSoloDigitos.length;
        var resultado = '';
        
        if (longitud > 0) {
            // Formato: (XXX) XXX-XXXX o XXX-XXX-XXXX
            if (longitud >= 10) {
                resultado = numeroSoloDigitos.substring(0, 3) + ' ';
                resultado += numeroSoloDigitos.substring(3, longitud);
            } else if (longitud >= 7) {
                resultado = numeroSoloDigitos.substring(0, 3) + ' ';
                resultado += numeroSoloDigitos.substring(3, 7);
            } else {
                resultado = numeroSoloDigitos;
            }
        }
        
        return resultado;
    }

    function formatearCuenta(text){
        const maskedNumber = text.toString().slice(-4);
        const maskedString = '*'.repeat(text.toString().length - 4) + maskedNumber; 

        return maskedString 
    }

    function reportarPago(datos){
        setModalPago(false);
        const swalWithReact = withReactContent(Swal);
        swalWithReact.fire({
            title: "Confirmación",
            html: "¿Esta segur@ de reportar el pago "+datos.soporte+" al colaborador "+datos.nombre+" por un valor de "+datos.total+"?",
            showCancelButton: true,
            confirmButtonText: "Si", // Texto personalizado para el botón de confirmación
            cancelButtonText: "No", // Texto personalizado para el botón de cancelación
            allowOutsideClick: false
        }).then(async(result) => {
            if (result.isConfirmed) {
                const swalWithReact = withReactContent(Swal);
                swalWithReact.fire({
                    title: "Reportando",
                    text: "Por favor, espera un momento...",
                    icon: "info",
                    showConfirmButton: false, // Ocultar el botón de confirmación
                    allowOutsideClick: false // Evitar cerrar el SweetAlert haciendo clic fuera de él
                });

                await axios.post(process.env.ENDPOINT_API+'/user/reportarPago',{ 
                    usuario: usuarioId,
                    colaborador: datos.id,
                    contador:datos.contador,
                    soporte: datos.soporte,
                    pago: datos.pago,
                    banco: datos.idBanco
                }).then(response => { 

                    const swalWithReact = withReactContent(Swal);
                    // Manejar el error aquí
                    withReactContent(Swal).fire({
                        title: "Reportado",
                        text: "Pago reportado con exito",
                        icon: "success"
                    })

                    setTimeout(function(){

                        const nuevosDatos = resumenNomina.map(item => {
                            if (item.id === datos.id) {
                                return { ...item, status: 1 };
                            }
                            return item;
                        });
                        swalWithReact.close();
                        setResumenNomina(nuevosDatos);
                        setModalPago(true);
                        cargarColaboradores()
                    }, 1000);

                }).catch(error => {
                    const swalWithReact = withReactContent(Swal);
                    // Manejar el error aquí
                    withReactContent(Swal).fire({
                        title: "Error",
                        text: "Comunica con soporte (reportar pago)",
                        icon: "error"
                    })
                    setTimeout(function(){
                        swalWithReact.close();
                        setModalPago(true);
                    }, 1000);
                })
            }else{
                setModalPago(true);
            }
        })
        console.log(datos);
    }

    function cancelarPago(datos){
        setModalPago(false);
        const swalWithReact = withReactContent(Swal);
        swalWithReact.fire({
            title: "Confirmación",
            html: "¿Esta segur@ de eliminar el pago "+datos.soporte+"?",
            showCancelButton: true,
            confirmButtonText: "Si", // Texto personalizado para el botón de confirmación
            cancelButtonText: "No", // Texto personalizado para el botón de cancelación
            allowOutsideClick: false
        }).then(async(result) => {
            if (result.isConfirmed) {
                setResumenNomina(prevState => prevState.filter(item => item.id !== datos.id));
                setModalPago(true);
            }else{
                setModalPago(true);
            }
        })
    }

    const habilitarPago = (colaborador) => {
        // Actualiza el campo visible a 1
        const nuevosDatos = resumenNomina.map(item => {
            if (item === colaborador) {
                return { ...item, visible: 1 };
            }
            return item;
        });
        setResumenNomina(nuevosDatos);
    };

    const inabilitarPago = (colaborador) => {
        // Actualiza el campo visible a 1
        const nuevosDatos = resumenNomina.map(item => {
            if (item === colaborador) {
                return { ...item, visible: 0 };
            }
            return item;
        });
        setResumenNomina(nuevosDatos);
    };

    function crearBono(){
        setModalCrearBono(true);
        setTimeout(function(){
            $("#idBono").val(0)
            $("#alertBono").hide();
        },1000)
        
    }

    async function registrarNuevoBono(){
        if($("#nombreBono").val().length == 0){
            $("#alertBono").show().html("Nombre Obligatorio");
        }else if($("#valorBono").val().length == 0 || !/^\d+$/.test($("#valorBono").val())){
            $("#alertBono").show().html("Valor obligatorio y solo numeros");
        }else{
            $("#alertBono").hide();
            setModalCrearBono(false);
            const swalWithReact = withReactContent(Swal);
            swalWithReact.fire({
                title: "Registrando",
                text: "Por favor, espera un momento...",
                icon: "info",
                showConfirmButton: false, // Ocultar el botón de confirmación
                allowOutsideClick: false // Evitar cerrar el SweetAlert haciendo clic fuera de él
            });
            await axios.post(process.env.ENDPOINT_API+'/user/RegistrarBonoPrincipal',{ 
                id: $("#idBono").val(),
                nombre: $("#nombreBono").val(),
                valor: $("#valorBono").val()
            }).then(response => { 
                $("#idBono").val("0")
                $("#nombreBono").val("")
                $("#valorBono").val("")

                const swalWithReact = withReactContent(Swal);
                // Manejar el error aquí
                withReactContent(Swal).fire({
                    title: "Registrado",
                    text: "Bono registrado con exito",
                    icon: "success"
                })

                setTimeout(function(){
                    cargarTipoBonos();
                    swalWithReact.close();
                    setModalCrearBono(true);
                },1000)

            }).catch(error => {
                console.log(error);
                const swalWithReact = withReactContent(Swal);
                // Manejar el error aquí
                withReactContent(Swal).fire({
                    title: "Error",
                    text: "Comunica con soporte (registro y modificar bono principal)",
                    icon: "error"
                })
            });
        }
    }

    function editarBono(bono){
        $("#idBono").val(bono.id);
        $("#nombreBono").val(bono.name);
        $("#valorBono").val(bono.valor)
    }

    function eliminarBono2(bono){
        setModalCrearBono(false);
        const swalWithReact = withReactContent(Swal);
        swalWithReact.fire({
            title: "Confirmación",
            html: '¿Esta segur@ de eliminar el bono "'+bono.name+'" ?',
            showCancelButton: true,
            confirmButtonText: "Si", // Texto personalizado para el botón de confirmación
            cancelButtonText: "No", // Texto personalizado para el botón de cancelación
            allowOutsideClick: false
        }).then(async(result) => {
            if (result.isConfirmed) {
                const swalWithReact = withReactContent(Swal);
                swalWithReact.fire({
                    title: "Aprobando",
                    text: "Por favor, espera un momento...",
                    icon: "info",
                    showConfirmButton: false, // Ocultar el botón de confirmación
                    allowOutsideClick: false // Evitar cerrar el SweetAlert haciendo clic fuera de él
                });
                await axios.post(process.env.ENDPOINT_API+'/user/eliminarBonoPrincipal',{ 
                    id: bono.id
                }).then(response => { 
                    const swalWithReact = withReactContent(Swal);
                    // Manejar el error aquí
                    withReactContent(Swal).fire({
                        title: "Reportado",
                        text: "Bono eliminado con exito",
                        icon: "success"
                    })

                    setTimeout(function(){
                        cargarTipoBonos();
                        swalWithReact.close();
                        setModalCrearBono(true);
                    },1000)

                }).catch(error => {
                    console.log(error);
                    const swalWithReact = withReactContent(Swal);
                    // Manejar el error aquí
                    withReactContent(Swal).fire({
                        title: "Error",
                        text: "Comunica con soporte (eliminar bono principal)",
                        icon: "error"
                    })
                });
            }else{
                setModalCrearBono(true);
            }
        })
    }

    function condonarDeuda(datos){
        let swalWithReactFactura = withReactContent(Swal);

        swalWithReactFactura.fire({
            title: "Confirmacion",
            html: (
                <div>
                    <p>
                        El colaborador "{datos.name}" tiene unas deducciones de {formattedPrice(datos.deducciones)} 
                        <div style={{marginTop:'10px'}}>¿cuanto deseas compensarle?</div>
                    </p>
                    <div style={{marginTop:'10px'}}>
                        <input className="form-control" id="consecutivoFactura"></input>
                    </div>
                </div>
            ),
            showCancelButton: true,
            confirmButtonText: "Reportar",
            cancelButtonText: "Cancelar",
            allowOutsideClick: false,
            preConfirm: (input) => {
                if ($("#consecutivoFactura").val() == "") {
                    Swal.showValidationMessage('Debe ingresar un valor');
                    return false;
                }
                else if (!/^\d+$/.test($("#consecutivoFactura").val())) {
                    Swal.showValidationMessage('Solo Numeros');
                    return false;
                }
                else if (parseInt($("#consecutivoFactura").val()) > parseInt(datos.deducciones)) {
                    Swal.showValidationMessage('No puede ser mayor a '+formattedPrice(datos.deducciones));
                    return false;
                }
                return true;
            }
        }).then(async (result) => {
            let valorCompensado = $("#consecutivoFactura").val();
            const swalWithReact = withReactContent(Swal);
            swalWithReact.fire({
                title: "Aprobando",
                text: "Por favor, espera un momento...",
                icon: "info",
                showConfirmButton: false, // Ocultar el botón de confirmación
                allowOutsideClick: false // Evitar cerrar el SweetAlert haciendo clic fuera de él
            });
            await axios.post(process.env.ENDPOINT_API+'/user/compensarDeuda',{ 
                id: datos.id,
                valor: valorCompensado,
                usuario: usuarioId
            }).then(response => { 
                const swalWithReact = withReactContent(Swal);
                // Manejar el error aquí
                withReactContent(Swal).fire({
                    title: "Reportado",
                    text: "Saldo compensado con exito",
                    icon: "success"
                })

                setTimeout(function(){
                    cargarColaboradores()
                    swalWithReact.close();
                },1000)

            }).catch(error => {
                console.log(error);
                const swalWithReact = withReactContent(Swal);
                // Manejar el error aquí
                withReactContent(Swal).fire({
                    title: "Error",
                    text: "Comunica con soporte (compensar deducciones)",
                    icon: "error"
                })
            });

            console.log(result)
                
        })

        console.log(datos);
    }

    return <> 

        <div id="divToPrint" className="hidden" >
            {data.map((item, index) => (
                <div
                key={index}
                ref={(el) => (divRefs.current[index] = el)} // Guardar referencia de cada div
                id="divToPrint"
                style={{ padding: '50px', pageBreakAfter: 'always' }} // pageBreakAfter para asegurar la separación
                >
                <div className="row">
                    <div className="col-12" style={{ textAlign: 'center', marginBottom: '10px' }}>
                    <p>
                        <b style={{ fontSize: '20px' }}>TRES SON UNO S.A.S</b>
                        <br />
                        NIT: 901.449.779 - 5
                        <br />
                        CARRERA 7 # 5 - 58
                        <br />
                        YUMBO - COLOMBIA
                    </p>
                    </div>
                    <div className="col-8">
                    <div className="row" style={{ border: '1px solid #e9e9e9', width: '100%', margin: 'auto' }}>
                        <div className="col-2" style={{ background: '#e9e9e9' }}>
                        <p style={{ lineHeight: '30px', marginBottom: '0px' }}>
                            NOMBRE
                            <br />
                            CEDULA
                            <br />
                            CELULAR
                        </p>
                        </div>
                        <div className="col-10">
                        <p style={{ lineHeight: '30px', marginBottom: '0px' }}>
                            {item.nombre.toUpperCase()}
                            <br />
                            {formatearNumeroConPuntos(item.document)}
                            <br />
                            {formatearNumeroCelular(item.celular)}
                        </p>
                        </div>
                        <div className="col-2" style={{ background: '#e9e9e9' }}>
                        <p style={{ lineHeight: '30px' }}>
                            CORREO
                            <br />
                            AREA
                            <br />
                            CARGO
                        </p>
                        </div>
                        <div className="col-4">
                        <p style={{ lineHeight: '30px' }}>
                            {item.correo}
                            <br />
                            {item.area.toUpperCase()}
                            <br />
                            {item.cargo.toUpperCase()}
                        </p>
                        </div>
                        <div className="col-2" style={{ background: '#e9e9e9' }}>
                        <p style={{ lineHeight: '30px', marginBottom: '0px' }}>
                            BANCO
                            <br />
                            CUENTA
                            <br />
                            TITULAR
                        </p>
                        </div>
                        <div className="col-4">
                        <p style={{ lineHeight: '30px', marginBottom: '0px' }}>
                            {item.banco}
                            <br />
                            {formatearCuenta(item.cuenta)}
                            <br />
                            {item.titular}
                        </p>
                        </div>
                    </div>
                    </div>
                    <div className="col-4">
                    <div className="row" style={{ border: '1px solid #e9e9e9', width: '100%', margin: 'auto', height: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', height: '100%', width: '100%' }}>
                        <div style={{ width: '100%' }}>
                            <div style={{ textAlign: 'center' }}>
                            <h2>{item.soporte}</h2>
                            Soporte de pago
                            </div>
                            <span>
                            <b>Generado:</b>
                            <div style={{ marginLeft: '10px' }}>
                                {item.generado}
                                <br />
                                {item.hora}
                            </div>
                            </span>
                        </div>
                        </div>
                    </div>
                    </div>
                    <div className="col-12" style={{ marginTop: '20px' }}>
                    <div className="row">
                        <div className="col-9" style={{ background: '#e9e9e9' }}>
                        <p style={{ lineHeight: '30px' }}>DESCRIPCIÓN</p>
                        </div>
                        <div className="col-3" style={{ background: '#e9e9e9' }}>
                        <p style={{ lineHeight: '30px', textAlign: 'center' }}>VALOR</p>
                        </div>
                        <div className="col-9" style={{ border: '1px solid #e9e9e9' }}>
                        <p style={{ lineHeight: '30px' }}>
                            <span>SERVICIO</span>
                            <br />
                            <span>COMISIONES</span>
                            <br />
                            <span>BONOS</span>
                        </p>
                        </div>
                        <div className="col-3" style={{ border: '1px solid #e9e9e9' }}>
                        <p style={{ lineHeight: '30px', textAlign: 'center' }}>
                            {item.sueldoBase}
                            <br />
                            {item.comisiones}
                            <br />
                            {item.bonos}
                        </p>
                        </div>
                    </div>
                    <div className="row" style={{ marginTop: '30px' }}>
                        <div className="col-7"></div>
                        <div className="col-2" style={{ background: '#e9e9e9', textAlign: 'right' }}>
                        <p style={{ lineHeight: '30px' }}>SUB-TOTAL</p>
                        </div>
                        <div className="col-3" style={{ border: '1px solid #e9e9e9' }}>
                        <p style={{ lineHeight: '30px', textAlign: 'center' }}>{item.subTotal}</p>
                        </div>
                        <div className="col-7"></div>
                        <div className="col-2" style={{ background: '#e9e9e9', textAlign: 'right' }}>
                        <p style={{ lineHeight: '30px' }}>DEDUCCIONES</p>
                        </div>
                        <div className="col-3" style={{ border: '1px solid #e9e9e9' }}>
                        <p style={{ lineHeight: '30px', textAlign: 'center' }}>{item.deducciones}</p>
                        </div>
                        <div className="col-7"></div>
                        <div className="col-2" style={{ background: '#e9e9e9', textAlign: 'right' }}>
                        <p style={{ lineHeight: '30px' }}>COMPENSADO</p>
                        </div>
                        <div className="col-3" style={{ border: '1px solid #e9e9e9' }}>
                        <p style={{ lineHeight: '30px', textAlign: 'center' }}>{item.compensado}</p>
                        </div>
                        <div className="col-7"></div>
                        <div className="col-2" style={{ background: '#e9e9e9', textAlign: 'right' }}>
                        <p style={{ lineHeight: '30px' }}>TOTAL</p>
                        </div>
                        <div className="col-3" style={{ border: '1px solid #e9e9e9' }}>
                        <p style={{ lineHeight: '30px', textAlign: 'center' }}>{item.total}</p>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col-2' style={{background:'#e9e9e9',textAlign:'right',marginTop:'70px'}}>
                            <p style={{lineHeight:'30px'}}>
                                FIRMA RECIBIDO:
                            </p>
                        </div>
                        <div className='col-5' style={{borderBottom:'1px solid #e9e9e9',marginTop:'70px'}}>
                        </div>  
                    </div> 
                    </div>
                </div>
                </div>
            ))}
        </div>
        
        <Modal show={modalCrearBono} className="modal-lg" onHide={cerrarModal}>
            <Modal.Header closeButton>
            </Modal.Header>
            <Modal.Body style={{marginTop:'-40px'}}>
                <div className='row'>
                    <div className="alert alert-danger" style={{textAlign:'center',color:'red',display:'none'}} id="alertBono" role="alert">
                        Nombre y valor son obligatorios
                    </div>
                    <input className='form-control' id="idBono" style={{display:'none'}}></input>
                    <div className='col-6'>
                        <label>Nombre:</label>
                        <input className='form-control' id="nombreBono"></input>
                    </div>
                    <div className='col-6'>
                        <label>Valor:</label>
                        <input className='form-control' id="valorBono"></input>
                    </div>
                    <div className="col-12" style={{marginTop:'10px'}}>
                        <button className='btn btn-primary' onClick={() => registrarNuevoBono()} style={{width:'100%'}}>REPORTAR</button>
                    </div>

                    <div className='col-12' style={{marginTop:'10px'}}>
                        <table className="table">
                            <thead>
                                <tr style={{background:"#e9e9e9"}}>
                                    <th scope="col" style={{textAlign:'center'}}>
                                        nombre
                                    </th>
                                    <th scope="col" style={{textAlign:'center'}}>
                                        Valor
                                    </th>
                                    <th scope="col" style={{textAlign:'center'}}>
                                        Opciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {tiposBonos.map((bono, index) => {
                                    return (
                                        <React.Fragment key={index}>
                                            <tr>
                                                <td style={{ textAlign: 'center' }}>{bono.name}</td>
                                                <td style={{ textAlign: 'center' }}>{formattedPrice(bono.valor)}</td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <i onClick={() => editarBono(bono)} style={{cursor:'pointer'}} className='bx bxs-pencil'></i>
                                                    <i onClick={() => eliminarBono2(bono)} style={{cursor:'pointer'}} className='bx bx-trash'></i>
                                                </td>                            
                                            </tr>
                                        </React.Fragment>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Modal.Body>
        </Modal>

        <Modal show={modalBono} className="modal-lg" onHide={cerrarModal}>
            <Modal.Header closeButton>
            </Modal.Header>
            <Modal.Body style={{marginTop:'-40px'}}>
                <div className='row'>
                    <div>
                        <p style={{borderLeft:'2px solid #96a1ad',padding:'10px',background:'#f5f5f5'}}>
                            <b>-Nombre:</b> {colaborador.name}
                            <br></br>
                            <b>-Documento:</b> {formatearNumeroConPuntos(colaborador.document)}
                            <br></br>
                            <b>-Cargo:</b> {colaborador.cargo}-{colaborador.area}
                        </p>
                    </div>
                    {reportarBono ? (
                        <>  
                            <div className='col-12' style={{border:'1px solid #d9d9d9',background:'#f5f5f5',padding:'10px'}}>
                                <div className='row'>
                                    <div className='col-12'>
                                        <label>Bono:</label>
                                        <select className='form-control' id="selectBono">
                                            {tiposBonos.map((bono, index) => {
                                                return (
                                                    <React.Fragment key={index}>
                                                        <option value={bono.id}>{formattedPrice(bono.valor)} - "{bono.name}"</option>
                                                    </React.Fragment>
                                                )
                                            })}
                                            
                                        </select>
                                    </div>
                                    <div className='col-12' style={{textAlign:'right',marginTop:'10px'}}>
                                        <button onClick={() => cancelarBono()} className='btn btn-secondary' style={{borderRadius: '0px',marginRight:'10px'}}>CANCELAR</button>
                                        <button onClick={() => agregarBono()} className='btn btn-primary' style={{borderRadius: '0px'}}>REPORTAR</button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ):(
                        <>
                            <div className='col-12' style={{textAlign:'right'}}>
                                <button onClick={() => reportarBonoFunction()} className='btn btn-primary' style={{borderRadius: '0px'}}>AGREGAR</button>
                            </div>
                        </>
                    )}
                    
                    <div className='col-6'>
                        <select id="estadoBonos" onChange={(e) => handleEstadoBonos(e)} style={{marginTop:'18px'}} className='form-control'>
                            <option value="1">Pendientes</option>
                            <option value="2">Pagas</option>
                            <option value="0">Eliminados</option>
                        </select>
                    </div>
                    <div className='col-6' style={{textAlign:'right',paddingTop:'10px'}}>
                        <h2 style={{marginTop:'10px'}}>{formattedPrice(resultBonos.reduce((total, bono) => total + bono.valor, 0))}</h2>
                    </div>
                    <div className='col-12'>
                        <table className="table">
                            <thead>
                                <tr style={{background:"#e9e9e9"}}>
                                    <th scope="col" style={{textAlign:'center'}}>
                                        Fecha
                                    </th>
                                    <th scope="col" style={{textAlign:'center'}}>
                                        Valor
                                    </th>
                                    <th scope="col" style={{textAlign:'center'}}>
                                        Detalle
                                    </th>
                                    <th scope="col" style={{textAlign:'center'}}>
                                        Creador
                                    </th>
                                    <th scope="col" id='thBonosOpciones' style={{textAlign:'center'}}>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>

                                {
                                    consultandoBono ? (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center' }}>Consultando...</td>
                                        </tr>
                                    ) : (
                                        resultBonos.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" style={{ textAlign: 'center' }}>No se encontraron registros.</td>
                                            </tr>
                                        ) : (
                                            <>
                                                {resultBonos.map((bono, index) => {
                                                    return (
                                                        <React.Fragment key={index}>
                                                            <tr>
                                                                <td style={{ textAlign: 'center' }}>{formatFecha(bono.fecha)}<br></br>{formatHora(bono.fecha)}</td>
                                                                <td style={{ textAlign: 'center' }}>{formattedPrice(bono.valor)}</td>
                                                                <td>{bono.detalle}</td>
                                                                <td style={{ textAlign: 'center' }}>
                                                                    {bono.name}
                                                                    
                                                                </td>
                                                                {bono.status == 1 ? (
                                                                    <td style={{ textAlign: 'center' }}><i onClick={() => eliminarBono(bono)} style={{cursor:'pointer'}} className='bx bx-trash'></i></td>
                                                                ):(
                                                                    <>
                                                                        {bono.status == 0 && (
                                                                            <>  
                                                                                <td style={{ textAlign: 'center' }}>
                                                                                    {bono.userDelet}
                                                                                    <br></br>
                                                                                    {formatFecha(bono.fechaDelete)}<br></br>{formatHora(bono.fechaDelete)}
                                                                                </td>
                                                                            </>
                                                                        )}
                                                                    </>
                                                                )}
                                                                
                                                            </tr>
                                                        </React.Fragment>
                                                    )
                                                })}
                                            </>
                                        )
                                    )
                                }

                            </tbody>
                        </table>
                    </div>
                </div>
            </Modal.Body>
        </Modal>

        <Modal show={modalPago} className="modal-lg" onHide={cerrarModal}>
            <Modal.Header closeButton>
            </Modal.Header>
            <Modal.Body style={{marginTop:'-40px'}}>
                <div className='row'>
                    <div className='col-4'>
                        <button onClick={() => imprimirConstanciasPago()} style={{marginTop:'20px'}} className='btn btn-primary'>Imprimir soportes</button>       
                    </div>
                    <div className='col-8' style={{textAlign:'right',paddingTop:'10px'}}>
                        <h2 style={{marginTop:'10px'}}>TOTAL: {formattedPrice(resumenNomina.reduce((total, colaborador) => total + colaborador.pago, 0))}</h2>
                    </div>
                    <div className='col-12' style={{borderTop:'2px solid #e9e9e9',marginTop:'10px',paddingTop:'30px'}}>
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr style={{background:"#e9e9e9"}}>
                                        <th scope="col" style={{textAlign:'center'}}>
                                            
                                        </th>
                                        <th scope="col" style={{textAlign:'center'}}>
                                            
                                        </th>
                                        <th scope="col" style={{textAlign:'center'}}>
                                            Banco
                                        </th>
                                        <th scope="col" style={{textAlign:'center'}}>
                                            Titular
                                        </th>
                                        <th scope="col" style={{textAlign:'center'}}>
                                            Colaborador
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resumenNomina.map((colaborador, index) => {
                                        let color = '#ffa3a3'
                                        if(colaborador.status == 1){
                                            color = '#a9ffa3'
                                        }
                                        return (
                                            <>
                                                <tr style={{background:color}}>
                                                    <td style={{textAlign:'center'}}>
                                                        {colaborador.soporte}
                                                        {colaborador.visible == 0 && (
                                                            <>
                                                                <br></br>
                                                                <i style={{cursor:'pointer'}} onClick={() => habilitarPago(colaborador)} className='bx bxs-show'></i> 
                                                            </>
                                                        )}
                                                        
                                                        {colaborador.visible == 1 && colaborador.status == 0 && (
                                                            <>  
                                                                <i style={{cursor:'pointer',marginLeft:'5px'}} onClick={() => inabilitarPago(colaborador)} className='bx bx-hide'></i>
                                                                <button onClick={() => reportarPago(colaborador)} className='btn btn-primary'>Realizado</button>
                                                                <button style={{marginTop:'10px'}} onClick={() => cancelarPago(colaborador)} className='btn btn-secondary'>Cancelado</button>
                                                            </>
                                                        )}
                                                        
                                                    </td>
                                                    <td style={{textAlign:'center'}}>
                                                        <img
                                                            src={'https://www.crmtsu.com:444/static/bancosNomina/'+colaborador.imagen}
                                                            alt="preview"
                                                            style={{maxWidth: '200px', height: 'auto',maxHeight:'200px',margin:'auto',opacity: colaborador.visible === 1 ? '1' : '0.05'}}
                                                        />
                                                        <br></br>
                                                        <b>{formattedPrice(colaborador.pago)}</b>
                                                    </td>
                                                    <td style={{textAlign:'center'}}>
                                                        {colaborador.banco}
                                                        <br></br>
                                                        {colaborador.cuenta}
                                                    </td>
                                                    <td style={{textAlign:'center'}}>
                                                        {colaborador.titular}
                                                        <br></br>
                                                        {formatearNumeroConPuntos(colaborador.documentoTitular)}
                                                    </td>
                                                    <td style={{textAlign:'center'}}>
                                                        {colaborador.nombre}
                                                        <br></br>
                                                        {formatearNumeroConPuntos(colaborador.document)}
                                                    </td>
                                                </tr>
                                            </>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    
                </div>
            </Modal.Body>
        </Modal>

        <div className="container-xxl flex-grow-1 containerP" style={{background:'#eeeeee',height: '100%',width: '100%',position: 'relative',left: '0px',top: '0px',overflow: 'hidden'}}>
            <div className='row' style={{height:'100%',width:'98%',margin:'auto'}}>
                <div className='col-12' style={{maxHeight:'100%',padding:'40px 20px 40px 0px',paddingLeft:'0px',fontSize:'12px'}}>
                    <div className="card" style={{padding:'0px'}}>
                        <div className="card-body" style={{width:'100%',height:'93vh',overflow:'auto',paddingBottom:'50px'}}>
                            <div className="d-flex align-items-start align-items-sm-center">
                                <div className='row' style={{width:'100%'}}>
                                    <div className='col-6' style={{textAlign:'left',marginBottom:'20px'}}>
                                        <button onClick={() => crearBono()} className='btn btn-primary' style={{borderRadius: '0px'}}>BONOS</button>
                                    </div>
                                    <div className='col-6' style={{textAlign:'right',marginBottom:'20px'}}>
                                        <button onClick={() => liquidar()} className='btn btn-primary' style={{borderRadius: '0px'}}>LIQUIDAR</button>
                                    </div>
                                    <div className='col-12'>
                                        <table className="table">
                                            <thead>
                                                <tr style={{background:"#e9e9e9"}}>
                                                    <th scope="col" style={{textAlign:'center'}}>
                                                        <input style={{position: 'inherit',margin: 'auto'}} className='form-check-input selePedido' id="seleTodo" onClick={() => selecionarTodo()} type='checkbox'></input>
                                                    </th>
                                                    <th scope="col" style={{textAlign:'center'}}>
                                                        Documento
                                                    </th>
                                                    <th scope="col" style={{textAlign:'center'}}>
                                                        Nombre
                                                    </th>
                                                    <th scope="col" style={{textAlign:'center',borderRight:'1px solid'}}>
                                                        CARGO
                                                    </th>
                                                    <th scope="col" style={{textAlign:'center'}}>
                                                        Sueldo <br></br> Base
                                                    </th>
                                                    <th scope="col" style={{textAlign:'center'}}>
                                                        bonos
                                                    </th>
                                                    <th scope="col" style={{textAlign:'center'}}>
                                                        comisiones
                                                    </th>
                                                    <th scope="col" style={{textAlign:'center','--bs-table-bg-type':'#c3f7d3'}}>
                                                        SUB-TOTAL
                                                    </th>
                                                    <th scope="col" style={{textAlign:'center','--bs-table-bg-type':'#f7c3d1'}}>
                                                        DEDUCCIONES
                                                    </th>
                                                    <th scope="col" style={{textAlign:'center','--bs-table-bg-type':'#c3ddf7'}}>
                                                        COMPENSADO
                                                    </th>
                                                    <th scope="col" style={{textAlign:'center','--bs-table-bg-type':'#e9e9e9'}}>
                                                        TOTAL
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    consultando ? (
                                                        <tr>
                                                            <td colSpan="9" style={{ textAlign: 'center' }}>Consultando...</td>
                                                        </tr>
                                                    ) : (
                                                        dataColaboradores.length === 0 ? (
                                                            <tr>
                                                                <td colSpan="9" style={{ textAlign: 'center' }}>No se encontraron registros.</td>
                                                            </tr>
                                                        ) : (
                                                            <>
                                                                {dataColaboradores.map((colaborador, index) => {
                                                                    return (
                                                                        <React.Fragment key={index}>
                                                                            <tr>
                                                                                <td style={{ textAlign: 'center',background:'#e9e9e9' }}>
                                                                                    <input style={{position: 'inherit',margin: 'auto'}} className='form-check-input selePedido' id={`selectPersonal-${colaborador.id}`} onClick={() => selecionarPersonal(colaborador.id)} type='checkbox'></input>
                                                                                </td>
                                                                                <td style={{ textAlign: 'center',background:'#e9e9e9' }}>{formatearNumeroConPuntos(colaborador.document)}</td>
                                                                                <td style={{ textAlign: 'center',background:'#e9e9e9' }}>{colaborador.name}</td>
                                                                                <td style={{ textAlign: 'center',borderRight:'1px solid',background:'#e9e9e9' }}>{colaborador.cargo}<br></br>{colaborador.area}</td>
                                                                                <td style={{ textAlign: 'center' }}>{formattedPrice(colaborador.baseSueldo)}</td>
                                                                                <td style={{ textAlign: 'center',cursor:'pointer' }} onClick={() => bonoPersonal(colaborador)}>{formattedPrice(colaborador.bono)}</td>
                                                                                <td style={{ textAlign: 'center' }}>{formattedPrice(colaborador.comision)}</td>
                                                                                <td style={{ textAlign: 'center','--bs-table-bg-type':'#c3f7d3',color:'green' }}>{formattedPrice(parseInt(colaborador.comision)+parseInt(colaborador.baseSueldo)+parseInt(colaborador.bono))}</td>
                                                                                <td style={{ textAlign: 'center','--bs-table-bg-type':'#f7c3d1',color:'red' }}>
                                                                                    {formattedPrice(colaborador.deducciones)}
                                                                                    
                                                                                    {colaborador.deducciones > 0 && (
                                                                                        <>
                                                                                            <br></br>
                                                                                            <i onClick={() => condonarDeuda(colaborador)} style={{cursor:'pointer'}} className='bx bxs-donate-heart'></i>
                                                                                        </>
                                                                                    )}
                                                                                </td>
                                                                                <td style={{ textAlign: 'center','--bs-table-bg-type':'#c3ddf7'}}>
                                                                                    {formattedPrice(colaborador.compensado)}
                                                                                </td>
                                                                                <td style={{ textAlign: 'center','--bs-table-bg-type':'#e9e9e9' }}>{formattedPrice(colaborador.pago)}</td>
                                                                            </tr>
                                                                        </React.Fragment>
                                                                    )
                                                                })}

                                                                {/* Totales */}
                                                                <tr style={{ backgroundColor: "#f2f2f2", fontWeight: "bold" }}>
                                                                <td style={{ textAlign: 'right',borderRight:'1px solid' }} colSpan="4">TOTALES:</td>
                                                                <td style={{ textAlign: 'center' }}>
                                                                    {formattedPrice(dataColaboradores.reduce((total, colaborador) => total + colaborador.baseSueldo, 0))}
                                                                </td>
                                                                <td style={{ textAlign: 'center' }}>
                                                                    {formattedPrice(dataColaboradores.reduce((total, colaborador) => total + colaborador.bono, 0))}
                                                                </td>
                                                                <td style={{ textAlign: 'center' }}>
                                                                    {formattedPrice(dataColaboradores.reduce((total, colaborador) => total + colaborador.comision, 0))}
                                                                </td>
                                                                <td style={{ textAlign: 'center','--bs-table-bg-type':'#c3f7d3' }}>
                                                                    {formattedPrice(dataColaboradores.reduce((total, colaborador) => total + colaborador.bono + colaborador.comision + colaborador.baseSueldo, 0))}
                                                                </td>
                                                                <td style={{ textAlign: 'center','--bs-table-bg-type':'#f7c3d1' }}>
                                                                    {formattedPrice(dataColaboradores.reduce((total, colaborador) => total + colaborador.deducciones, 0))}
                                                                </td>
                                                                <td style={{ textAlign: 'center','--bs-table-bg-type':'#c3ddf7' }}>
                                                                    {formattedPrice(dataColaboradores.reduce((total, colaborador) => total + colaborador.compensado, 0))}
                                                                </td>
                                                                <td style={{ textAlign: 'center','--bs-table-bg-type':'#e9e9e9' }}>
                                                                    {formattedPrice(dataColaboradores.reduce((total, colaborador) => total + colaborador.pago, 0))}
                                                                </td>
                                                            </tr>
                                                        </>
                                                        )
                                                        
                                                    )
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
}