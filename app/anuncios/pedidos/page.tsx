"use client";

import React, { useEffect,useState } from 'react';
import { format, parseISO }          from 'date-fns';
import withReactContent              from 'sweetalert2-react-content';
import { QRCodeCanvas }              from 'qrcode.react';
import html2canvas                   from 'html2canvas';
import { saveAs }                    from 'file-saver';
import * as XLSX                     from 'xlsx';
import { Modal }                     from 'react-bootstrap';
import Cookies                       from 'js-cookie';
import axios                         from 'axios';
import Swal                          from 'sweetalert2';
import { es }                        from 'date-fns/locale';
import jsPDF                         from 'jspdf';

import '../comprobantes/style.css';
import { Result } from 'postcss';

const $ = require('jquery');

let fechaActual = new Date();
let usuarioId = 1;
let imprimirOrden = 0;
let usuarioProducto = 2;
let resultCarteraOriginal = [];
let blob = "";
let banderaModalCartera = 0;
let departamentosArray = [];
let tipoPedidosCarteraAnterior = [];
let sumaTotalIngresoMes = 0;
let sumaTotalIngresoMesAnterior = 0;
let blobTerceros = "";
let swalWithReactFactura;
let cargoSite = 0;
let entidadFiltro = 0;
let tipoFiltro = 0;
let estadoFiltro = 1;
let pedidosData = [];
let tercerosData = [];
let productosData2 = [];
let productosSiigoData = [];
let comprobantesData = [];
let consecutivoFactura = "";
let pedidosFacturacionData = [];
let cuentasData = [];
let meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];
let mesesCorto = [
    'Ene.', 'Feb.', 'Mar.', 'Abr.', 'May.', 'Jun.',
    'Jul.', 'Ago.', 'Sep.', 'Oct.', 'Nov.', 'Dic.'
];
let dataResument2 = {
    mesActual: '',
    diasDisponibles: '',
    metaMes: '',
    ventaMes: '',
    porcentaje: 0
}
const semanaActual1 = new Date();
const semanaActual2 = new Date();


export default function Home() {

    const [semanaActual,setSemanaActual] = useState("");
    const [modalBonos,setModalBonos] = useState(false);
    const [resultCarteraAnterior,setResultCarteraAnterior] = useState([]);
    const [banderaCarteraAnterior,setBanderaCarteraAnterior] = useState(true);
    const [modalCarteraMesAnterior,setModalCarteraMesAnterior] = useState(false);
    const [modalCartera,setModalCartera] = useState(false);
    const [usuario, setUsuario] = useState({ 
        nombre: '',
        perfil: '',
        foto: '',
        user: ''
    });
    const [dataResumen,setDataResumen] = useState({
        mesActual: '',
        diasDisponibles: '',
        metaMes: '',
        ventaMes: '',
        porcentaje: 0,
        valorCartera: 0,
        resultCompra: [],
        ingresos: [],
        resumenCartera: [],
        semanaActual: '',
        bonosData: [],
        dataPagos: []
    })
    const [linkQR, setLinkQR] = useState('');
    const [consultando,setConsultado] = useState(true);
    const [pedidos,setPedidos] = useState([]);
    const [productos,setProductos] = useState([]);

    useEffect(() => {
        
        // Este useEffect se ejecutará cada vez que linkQR cambie
        if(linkQR){
            if(imprimirOrden == 0){
                //mandamos a imprimir la orden
                printDocument()
                imprimirOrden = 1;
            }
        }

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

                // Obtener el mes actual y el año
                
                const mesActualEnLetras = meses[fechaActual.getMonth()];

                
                const diaIncial = "";
                if(semanaActual1.getDay() > 1){
                    let lunes = true;
                    while(lunes){
                        semanaActual1.setDate(semanaActual1.getDate()-1)
                        if(semanaActual1.getDay() == 1){
                            lunes = false;
                        }
                    }
                }

                if(semanaActual2.getDay() != 6){
                    let sabado = true;
                    while(sabado){
                        semanaActual2.setDate(semanaActual2.getDate()+1)
                        if(semanaActual2.getDay() == 6){
                            sabado = false;
                        }
                    }
                }

                if(semanaActual2.getMonth() == semanaActual1.getMonth()){
                    dataResument2['semanaActual'] = semanaActual1.getDate()+" - "+semanaActual2.getDate()+" DE "+meses[semanaActual2.getMonth()].toUpperCase()
                }else{
                    dataResument2['semanaActual'] = semanaActual1.getDate()+" "+mesesCorto[semanaActual1.getMonth()].toUpperCase()+" - "+semanaActual2.getDate()+" DE "+meses[semanaActual2.getMonth()].toUpperCase()
                }
                
                dataResument2['mesActual'] = mesActualEnLetras;

                $(".navbar").hide();
                usuarioId = decodedToken.payload.user; 
                

                cargoSite = 1;
                pedidosFacturacion();
                cargarCiudades();
                obtenerMeta()
            }
            
        }
    })  

    function formatearFecha(fecha) {
        const year = fecha.getFullYear();
        const month = (fecha.getMonth() + 1).toString().padStart(2, '0'); // Los meses van de 0 a 11
        const day = fecha.getDate().toString().padStart(2, '0');
      
        return `${year}-${month}-${day}`;
    }

    async function obtenerMeta(){
        await axios.post(process.env.ENDPOINT_API+'/pedidos/dataMes',{ 
            usuario: usuarioId,
            fecha: fechaActual,
            semana: semanaActual1,
            semana1: semanaActual2
        }).then(response => {  
            console.log(response.data);

            //pedidos contados
            const totalCompra = response.data.dataResument
                .filter(result => result.cartera === 0)
                .reduce((acc, result) => acc + result.valor, 0);

            // Sumar valores de ingresos
            const totalIngresos = response.data.ingresosCartera
                .reduce((acc, result) => acc + result.valor, 0);

            const totalCartera = response.data.resumenCartera
            .reduce((acc, result) => acc + result.valor, 0);

            let ingresosMes = response.data.ingresosCartera
            .filter(result => result.mesActual == 1)
            .reduce((total, result) => total + result.valor, 0);

            const ingresosMesAnterior = response.data.ingresosCartera
            .filter(result => result.mesActual == 0)
            .reduce((total, result) => total + result.valor, 0);


            //pedidos de contado
            ingresosMes += response.data.dataResument
            .filter(result => result.cartera == 0)
            .reduce((total, result) => total + result.valor, 0);

            //cartera mes
            let carteraMes = response.data.resumenCartera
            .filter(result => result.mesActual == 1)
            .reduce((acc, result) => acc + result.valor, 0);

            let carteraMesAnterior = response.data.resumenCartera
            .filter(result => result.mesActual == 0)
            .reduce((acc, result) => acc + result.valor, 0);

            //reporte semana
            dataResument2['ventaSemana'] = response.data.ventaSemana;
            dataResument2['ingresoSemana'] = response.data.ingresoSemana;

            //tickets
            dataResument2['ticketsAsignados'] = response.data.ticketsAsignados;
            dataResument2['ticketsAceptados'] = response.data.ticketsAceptados;

            //bonos
            dataResument2['bonosPagos'] = response.data.bonosPagos;
            dataResument2['bonosPendientes'] = response.data.bonosPendientes;
            dataResument2['bonosData'] = response.data.bonosData;

            //sueldo Base
            dataResument2['baseSueldo'] = parseInt(response.data.baseSueldo);
            dataResument2['valorDeduciones'] = parseInt(response.data.valorDeduciones);

            //comisiones
            dataResument2['comisionesPagos'] = response.data.comisionesPagos;
            dataResument2['comisionesPendientes'] = response.data.comisionesPendientes;
            dataResument2['comisionesData'] = response.data.comisionesData;

            //data de pagos
            dataResument2['dataPagos'] = response.data.dataPagos;

            //pedidos y productos
            dataResument2['pedidos'] = response.data.pedidos;
            dataResument2['productos'] = response.data.productos;

            //totalIngresomesActual
            dataResument2['ingresosTotalMes'] = ingresosMes;
            dataResument2['ingresosTotalMesAnterior'] = ingresosMesAnterior;

            //totalCarteramesActual
            dataResument2['carteraTotalMes'] = carteraMes;
            dataResument2['carteraTotalMesAnterior'] = carteraMesAnterior;

            dataResument2['valorCartera'] = totalCartera;
            dataResument2['resumenCartera'] = response.data.resumenCartera;
            dataResument2['carteraMesAnterior'] = response.data.carteraMesAnterior;
            dataResument2['carteraIngresoAnterior'] = response.data.carteraIngresoAnterior;
            dataResument2['ingresosTotal'] = totalIngresos+totalCompra;
            dataResument2['ingresos'] = response.data.ingresosCartera;
            dataResument2['valorDevolucion'] = 0;
            dataResument2['cantidadDevolucion'] = response.data.devoluciones.length; 
            for (let d = 0; d < response.data.devoluciones.length; d++) {
                dataResument2['valorDevolucion'] += parseInt(response.data.devoluciones[d].valor)
            }
            dataResument2['resultCompra'] = response.data.dataResument;
            const fechaActual2 = new Date();
            const ultimoDiaDelMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0);

            const fechaActual3 = new Date();
            fechaActual3.setDate(0);

            let diasdesde = 0;
            for (let d = 0; d < fechaActual.getDate()-1; d++) {
                let banderaFestivo = false;
                for (let e = 0; e < response.data.festivos; e++) {
                    if(response.data.festivos[e].fecha == formatearFecha(fechaActual3)){
                        banderaFestivo = true;
                    }
                }
                 // Si el día no es domingo (0 es domingo)
                 if (fechaActual3.getDay() !== 0 && banderaFestivo  == false) {
                    diasdesde++;
                }
                fechaActual3.setDate(fechaActual3.getDate()+1)
            }

            dataResument2['diasRecorridos'] = diasdesde;

            // Contar los días restantes excluyendo los domingos
            let diasSinDomingo = 0;
            for (let d = fechaActual.getDate(); d <= ultimoDiaDelMes.getDate(); d++) {
                let banderaFestivo = false;
                for (let e = 0; e < response.data.festivos; e++) {
                    if(response.data.festivos[e].fecha == formatearFecha(fechaActual2)){
                        banderaFestivo = true;
                    }
                }
                // Si el día no es domingo (0 es domingo)
                if (fechaActual2.getDay() !== 0 && banderaFestivo  == false) {
                    diasSinDomingo++;
                }
                fechaActual2.setDate(fechaActual2.getDate()+1)
            }

            dataResument2['diasDisponibles'] = diasSinDomingo;
            dataResument2['metaMes'] = response.data.meta;
            dataResument2['ventaMes'] = response.data.ventaMes;
            dataResument2['porcentaje'] = response.data.porcentaje;
            dataResument2['pedidosPendientesMes'] = response.data.pedidosPendientesMes;
            
            setTimeout(() => {
                // Actualizar el estado
                setDataResumen(dataResument2);
            }, 1000); 

            

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

    //cargar las ciudades
    async function cargarCiudades(){
        await axios.post(process.env.ENDPOINT_API+'/apoyoTSU/ciudades').then(response => {

            departamentosArray = response.data.ciudades

        }).catch(error => {
            console.log(error);
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (cargar ciudades)",
                icon: "error"
            })
        });
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

    function formatearNumeroCelular2(numero) {
        return `${numero.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`
    }

    function printDocument(){
        const input = document.getElementById('divToPrint');
        /*let divTransportadora = $("#resultDireccion").html();
        divTransportadora += "<br>";
        if(transportadora == 1){
            divTransportadora += "TCC"
        }
        if(transportadora == 2){
            divTransportadora += "ENVIA"
        }
        if(transportadora == 3){
            divTransportadora += "INTER RAPIDISIMO"
        }
        if(transportadora == 4){
            divTransportadora += "MENSAJERO"
        }
        if(transportadora == 6){
            divTransportadora += "OTRA TRANSPORTADORA"
        }
        divTransportadora += " - "
        if(tipoEnvio == 1){
            divTransportadora += "INCLUIDO EN LA FACTURA"
        }
        if(tipoEnvio == 2){
            divTransportadora += "CONTRA ENTREGA"
        }
        if(tipoEnvio == 3){
            divTransportadora += "REACUDO"
        }
        $("#resultDireccion2").html(divTransportadora);
        $("#resultFacturacion2").html($("#resultFacturacion").html());

        $("#resultDireccion3").html(divTransportadora);
        $("#resultFacturacion3").html($("#resultFacturacion").html());*/

        input.classList.remove('hidden');

        html2canvas(input, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'pt', [396, 612]); // Media carta en puntos (5.5 x 8.5 pulgadas
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const width = imgWidth * ratio;
            const height = imgHeight * ratio;

            pdf.addImage(imgData, 'PNG', 0, 0, width, height);
            pdf.autoPrint();
            window.open(pdf.output('bloburl'), '_blank');
            input.classList.add('hidden');
        });

        withReactContent(Swal).fire({
            title: "Confirmado",
            text: "Pedido Cargado",
            icon: "success",
            showConfirmButton: false, // Ocultar el botón de confirmación
            timer: 2000 // Cerrar automáticamente después de 2 segundos
        });
    };

    const formattedPrice = (value) => {
        if (typeof value !== 'number') {
            value = Number(value);
        }
        return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    function formatearNumeroConPuntos(numero) {
        return numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
    async function pedidosFacturacion(){
        await axios.post(process.env.ENDPOINT_API+'/pedidos/dataAsesor',{ 
            usuario: usuarioId
        }).then(response => {  
            if(response.data.bandera == 0){
                setPedidos([])
                const swalWithReact = withReactContent(Swal);
                // Manejar el error aquí
                withReactContent(Swal).fire({
                    title: "Error",
                    text: "Comunica con soporte (cargar pedidos)",
                    icon: "error"
                })
            }else{

                setPedidos(response.data.pedidos);
            }
            setConsultado(false);
        }).catch(error => {
            console.log(error);
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (cargar pedidos)",
                icon: "error"
            })
        });
    }

    async function imprimirOrden(referencia){
        const swalWithReact = withReactContent(Swal);
        swalWithReact.fire({
            title: "Generando",
            text: "Por favor, espera un momento...",
            icon: "info",
            showConfirmButton: false, // Ocultar el botón de confirmación
            allowOutsideClick: false // Evitar cerrar el SweetAlert haciendo clic fuera de él
        });
        $("#referenciaPedido").html(referencia);
        $(".swal2-container").css({'background':'#cfcfcfde'})

        await axios.post(process.env.ENDPOINT_API+'/pedidos/dataPedido',{ 
            pedido:referencia
        }).then(response => { 
            let fechaSubida = new Date(response.data.pedido.subido);
            $("#asesorPedido").html('Ase: '+response.data.pedido.name+'<span style="width:100%;display:block">'+formatSpanishDate2(fechaSubida)+'<span>')
            $("#transportadoraPedido").html(response.data.pedido.transportadora)
            let stringTipoEnvio = 'INCLUIDO EN LA FACTURA';
            if(response.data.pedido.tipoEnvio == 2){
                stringTipoEnvio = 'CONTRA ENTREGA';
            }
            if(response.data.pedido.tipoEnvio == 3){
                stringTipoEnvio = 'REACUDO';
            }
            
            let fechaDespacho = new Date(response.data.pedido.fechaDespacho);
            
            $("#tipoEnvioPedido").html(stringTipoEnvio+"<span style='width:100%;display:block'>Despacho: "+formatSpanishDate(fechaDespacho)+"</span>")
             
            $("#resultFacturacion2").html(formatearNumeroConPuntos(response.data.tercero.noDoc)+"<br>"+response.data.tercero.priNombre+" "+response.data.tercero.segNombre+" "+response.data.tercero.priApellido+" "+response.data.tercero.segApellido+"<br>"+response.data.tercero.correo)

            var result = response.data.datosdeenvio.nombre;
            if(response.data.datosdeenvio.documento.length > 0 ){
                result += " - "+formatearNumeroConPuntos(response.data.datosdeenvio.documento)
            }
            result += " ("+formatearNumeroCelular(response.data.datosdeenvio.telefono)+") ";
            
            result += "<br>";
            result += response.data.datosdeenvio.direccion;
            if(response.data.datosdeenvio.observacion.length > 0){
                result += ' "'+response.data.datosdeenvio.observacion+'" ';
            }
            if(response.data.datosdeenvio.ciudad > 0){
                let departamento = "";
                response.data.datosdeenvio.destinatario
                for (var e = departamentosArray.length - 1; e >= 0; e--) {
                    if(departamentosArray[e].id == response.data.datosdeenvio.departamento){
                        departamento = departamentosArray[e].nombre;
                        departamentosArray[e].ciudades2.split(",").forEach(function(element) {
                            if(element.split(":")[0] == response.data.datosdeenvio.ciudad){
                                 result += "<br>"+element.split(":")[1];
                            }
                        })
                    }
                }
                result += " - "+departamento
            }

            setProductos(response.data.productos)

            $("#resultDireccion2").html(result);
            printDocument()
        }).catch(error => {
            console.log(error);
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (cargar pedidos)",
                icon: "error"
            })
        }); 
    }


    function formatearNumeroConPuntos(numero) {
        return numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    const formatSpanishDate = (date) => {
        date.setDate(date.getDate()+1);
        const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
    
        return `${day} de ${month} del ${year}`;
    };

    const formatSpanishDate3 = (date) => {
        const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
    
        return `${day} de ${month} del ${year}`;
    };

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
    
        return `${day} de ${month} del ${year} a las ${hours}:${minutes} ${ampm}`;
    };

    function detalleBonos(){
        setModalBonos(true);
    }

    function cerrarModal(){
        setModalBonos(false);
        setModalCarteraMesAnterior(false);
        setModalCartera(false);
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

            return `${formattedDate}`;
        }
        return "";
    };
    
    function carteraMesAnterior(){
        tipoPedidosCarteraAnterior = [];
        dataResumen.resumenCartera.map((result)=>{
            if(result.mesActual == 0){
                tipoPedidosCarteraAnterior.push(result.tipo)
            };
        })
        banderaModalCartera = 1;

        cargarCarteraMesAnterior();
        setBanderaCarteraAnterior(true);
        setModalCarteraMesAnterior(true);
    }
    
    function carteraMes(){
        tipoPedidosCarteraAnterior = [];
        dataResumen.resumenCartera.map((result)=>{
            if(result.mesActual == 1){
                tipoPedidosCarteraAnterior.push(result.tipo)
            };
        })
        banderaModalCartera = 0;

        cargarCarteraMesAnterior();
        setModalCartera(true);
    }
    async function cargarCarteraMesAnterior(){
        await axios.post(process.env.ENDPOINT_API+'/pedidos/dataMesAnterior',{ 
            usuario: usuarioId,
            fecha: fechaActual,
            bandera: banderaModalCartera,
            tipos: tipoPedidosCarteraAnterior,
        }).then(response => { 
            setBanderaCarteraAnterior(false);
            resultCarteraOriginal = response.data.pedidos;
            setResultCarteraAnterior(response.data.pedidos)
            
            if(banderaModalCartera == 0){
                setTimeout(function(){
                    $("#filtroCartera").val(1);
                    $("#orderCartera").val(1);
                }, 1000);
                
            }
            
        }).catch(error => {
            setModalCarteraMesAnterior(false);
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

    function formatearTelefono(numero){
        const cleanedPhoneNumber = numero.replace(/\D/g, '');
        return `+${cleanedPhoneNumber.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`;
    }

    function filtroCarteraVencida(bandera){
        if(bandera == 0){
            tipoPedidosCarteraAnterior = [];
            dataResumen.resumenCartera.map((result)=>{
                if(result.mesActual == 0){
                    tipoPedidosCarteraAnterior.push(result.tipo)
                };
            })
        }else{
            tipoPedidosCarteraAnterior = [bandera]
        }
        
        banderaModalCartera = 1;

        cargarCarteraMesAnterior();
        setBanderaCarteraAnterior(true);
        setModalCarteraMesAnterior(true);
    }

    function filtroCartera(bandera){
        if(bandera == 0){
            tipoPedidosCarteraAnterior = [];
            dataResumen.resumenCartera.map((result)=>{
                if(result.mesActual == 1){
                    tipoPedidosCarteraAnterior.push(result.tipo)
                };
            })
        }else{
            tipoPedidosCarteraAnterior = [bandera]
        }

        banderaModalCartera = 0;
        cargarCarteraMesAnterior();
        setBanderaCarteraAnterior(true);
        setModalCartera(true);
    }

    const orderCartera = (event)=>{
        let sortedAscendente = resultCarteraOriginal;
        
        if(parseInt($("#filtroCartera").val()) == 2){
            sortedAscendente = resultCarteraOriginal.filter(item => item.dias > 0);
        }
        if(parseInt($("#filtroCartera").val()) == 3){
            sortedAscendente = resultCarteraOriginal.filter(item => item.dias < 0);
        }
        if(parseInt($("#filtroCartera").val()) == 4){
            sortedAscendente = resultCarteraOriginal.filter(item => item.dias < 0 && item.dias > -4);
        }
        if(parseInt($("#filtroCartera").val()) == 5){
            sortedAscendente = resultCarteraOriginal.filter(item => item.dias < 0 && item.dias > -7);
        }
        if(parseInt($("#filtroCartera").val()) == 6){
            sortedAscendente = resultCarteraOriginal.filter(item => item.dias < 0 && item.dias < -6);
        }

        if(parseInt($("#orderCartera").val()) == 1){
            sortedAscendente = [...sortedAscendente].sort((a, b) => a.tipo - b.tipo);
        }else if(parseInt($("#orderCartera").val()) == 3){
            sortedAscendente = [...sortedAscendente].sort((a, b) => a.diasCont - b.diasCont);
        }else{
            sortedAscendente = [...sortedAscendente].sort((a, b) => a.factura - b.factura);
        }
        setResultCarteraAnterior(sortedAscendente)
    }

    const filtroCarteraSelect = ()=>{
        let sortedAscendente = resultCarteraOriginal;
        if(parseInt($("#filtroCartera").val()) == 2){
            sortedAscendente = resultCarteraOriginal.filter(item => item.dias > 0);
        }
        if(parseInt($("#filtroCartera").val()) == 3){
            sortedAscendente = resultCarteraOriginal.filter(item => item.dias < 0);
        }
        if(parseInt($("#filtroCartera").val()) == 4){
            sortedAscendente = resultCarteraOriginal.filter(item => item.dias < 0 && item.dias > -4);
        }
        if(parseInt($("#filtroCartera").val()) == 5){
            sortedAscendente = resultCarteraOriginal.filter(item => item.dias < 0 && item.dias > -7);
        }
        if(parseInt($("#filtroCartera").val()) == 6){
            sortedAscendente = resultCarteraOriginal.filter(item => item.dias < 0 && item.dias < -6);
        }

        if(parseInt($("#orderCartera").val()) == 1){
            sortedAscendente = [...sortedAscendente].sort((a, b) => a.tipo - b.tipo);
        }else if(parseInt($("#orderCartera").val()) == 3){
            sortedAscendente = [...sortedAscendente].sort((a, b) => a.diasCont - b.diasCont);
        }else{
            sortedAscendente = [...sortedAscendente].sort((a, b) => a.factura - b.factura);
        }
        setResultCarteraAnterior(sortedAscendente)
    }

    return <>  

        <Modal show={modalCartera} className="modal-lg" onHide={cerrarModal}>
            <Modal.Header closeButton>
            </Modal.Header>
            <Modal.Body style={{marginTop:'-40px'}}>
                <div className='row'>
                    <div className='col-6'>
                        <div className='row'>
                            <div className='col-8'>
                                {dataResumen.resumenCartera.map((result, index) => (
                                    <>
                                        {result.mesActual == 1 && (
                                            <>  
                                                <span style={{cursor:'pointer'}} onClick={() => filtroCartera(result.tipo)}>- {result.nombre} ({result.detall.length})</span>
                                                <br></br>
                                            </>
                                        )}
                                    </>
                                ))}
                            </div>
                            <div className='col-4' style={{textAlign:'right'}}>
                                {dataResumen.resumenCartera.map((result, index) => (
                                    <>  
                                        {result.mesActual == 1 && (
                                            <>  
                                                <span onClick={() => filtroCartera(result.tipo)} style={{color:'red',cursor:'pointer'}}>{formattedPrice(result.valor)}</span>
                                                <br></br>
                                            </>
                                        )}
                                    </>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className='col-6' style={{borderLeft:'2px solid #e1e1e1'}}>
                        <div style={{display: 'flex',alignItems: 'center',height:'100%',width:'100%',textAlign:'center'}}>
                            <div style={{width:'100%'}}>
                                <h3 style={{cursor:'pointer'}} onClick={() => filtroCartera(0)}>{formattedPrice(parseInt(dataResumen.carteraTotalMes))}</h3>
                            </div>
                        </div>
                    </div>
                    <div className='col-12' style={{marginTop:'20px'}}>
                        <div className="form-group row"> 
                            <label style={{textAlign:'right',marginTop:'8px'}} className="col-sm-8">Ordenamiento:</label>
                            <div className="col-sm-4">
                                <select onChange={orderCartera} id="orderCartera" className='form-control'>
                                    <option value="1">Por tipo</option>
                                    <option value="2">Dias Descendientes</option>
                                    <option value="3">Dias Ascendientes</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group row" style={{marginTop:'10px'}}>
                            <label style={{textAlign:'right',marginTop:'8px'}} className="col-sm-8">Dias:</label>
                            <div className="col-sm-4">
                                <select onChange={filtroCarteraSelect} id="filtroCartera" className='form-control'>
                                    <option value="1">TODOS</option>
                                    <option value="2">Vigentes</option>
                                    <option value="3">Vencias</option>
                                    <option value="4">menos de 3 dias Vencias</option>
                                    <option value="5">menos de 7 dias Vencias</option>
                                    <option value="6">mas de 7 dias Vencias</option>
                                </select>
                            </div>
                        </div>
                            
                    </div>
                    <div className='col-12' style={{marginTop:'20px'}}>
                        <div className="table-responsive">
                            <table className="table table-striped">
                                <thead>
                                    <tr style={{background:"#e9e9e9"}}>
                                        <th scope="col" style={{textAlign:'center'}}>Pedido</th>
                                        <th scope="col" style={{textAlign:'center'}}>Valor</th>
                                        <th scope="col" style={{textAlign:'center'}}>Usuario</th>
                                        <th scope="col" style={{textAlign:'center'}}>Cliente</th>
                                        <th scope="col" style={{textAlign:'center'}}>Contacto</th>
                                        <th scope="col" style={{textAlign:'center'}}>Dias</th>
                                        <th scope="col" style={{textAlign:'center'}}>Historial</th>
                                        <th scope="col" style={{textAlign:'center'}}>Despacho</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {banderaCarteraAnterior ? (
                                        <tr>
                                            <td colSpan="9" style={{ textAlign: 'center' }}>Consultando...</td>
                                        </tr>
                                    ) : (

                                        resultCarteraAnterior.length === 0 ? (
                                            <tr>
                                                <td colSpan="9" style={{ textAlign: 'center' }}>No se encontraron registros.</td>
                                            </tr>
                                        ) : (

                                            resultCarteraAnterior.map((pedido, index) => {
                                                return (
                                                    <React.Fragment key={index}>
                                                        <tr>
                                                            <td style={{ textAlign: 'center',whiteSpace:'nowrap' }}>
                                                                {pedido.referencia}
                                                                <br></br>
                                                                <b>F-2 {pedido.factura}</b>
                                                            </td>
                                                            <td style={{ textAlign: 'center' }}>
                                                                {formattedPrice(pedido.valor)}
                                                                <br></br>
                                                                <b>{pedido.nombreTipo}</b>
                                                            </td>
                                                            <td style={{ textAlign: 'center' }}>{pedido.name}</td>
                                                            <td style={{ textAlign: 'center' }}>
                                                                {formatearNumeroConPuntos(pedido.noDoc)}
                                                                <br></br>
                                                                {pedido.cliente}
                                                            </td>
                                                            <td style={{ textAlign: 'center',whiteSpace:'nowrap' }}>
                                                                {formatearTelefono(pedido.number)}
                                                                <br></br>
                                                                {pedido.nameContacto !== 'undefined' ? (
                                                                    <>
                                                                        <b>{pedido.nameContacto}</b>
                                                                    </>
                                                                ):(
                                                                    <>
                                                                        <b>{pedido.pushName}</b>
                                                                    </>
                                                                )}
                                                            </td>
                                                            <td style={{ textAlign: 'center',color:pedido.colorDias }}>
                                                                {pedido.dias}
                                                                <br></br>
                                                                <span>{formatSpanishDate3(new Date(pedido.fechaFactura))}</span>
                                                            </td>
                                                            <td style={{ textAlign: 'center',whiteSpace:'nowrap' }}>
                                                                TOTAL: {formattedPrice(pedido.saldo)}
                                                                <div style={{width:'100%',borderTop:'1px solid',marginTop:'5px'}}>
                                                                    {pedido.recibos.map((recibo, index) => (
                                                                        <div key={index}>
                                                                            R-1 {recibo.recibo}: {formattedPrice(recibo.valor)}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div style={{textAlign:'right',marginTop:'10px',background:'#e9e9e9'}}>
                                                                    SALDO: {formattedPrice(parseInt(pedido.saldo)-parseInt(pedido.abonos))}
                                                                </div>
                                                            </td>
                                                            <td style={{textAlign:'center'}}>
                                                                {pedido.datosEnvio?.nombre !== undefined ? (
                                                                    <>
                                                                        {pedido.datosEnvio.guia}
                                                                        <br></br>
                                                                        {pedido.datosEnvio.nombre}

                                                                        {pedido.datosEnvio?.estadoTransportadora !== "Eperando Recogida" && (
                                                                            <>  
                                                                                <br></br>
                                                                                "{pedido.datosEnvio.estadoTransportadora}"
                                                                                <br></br>
                                                                                <b>{formatSpanishDate2(new Date(pedido.datosEnvio.fechaUltimoMovimiento))}</b>
                                                                            </>
                                                                        )}
                                                                    </>
                                                                ):(
                                                                    <>
                                                                        <b>No tiene despacho</b>
                                                                    </>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    </React.Fragment>        
                                                )
                                            })
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
            </Modal.Body>
        </Modal>

        <Modal show={modalCarteraMesAnterior} className="modal-lg" onHide={cerrarModal}>
            <Modal.Header closeButton>
            </Modal.Header>
            <Modal.Body style={{marginTop:'-40px'}}>
                <div className='row'>
                    <div className='col-6'>
                        <div className='row'>
                            <div className='col-6'>
                                {dataResumen.resumenCartera.map((result, index) => (
                                    <>
                                        {result.mesActual == 0 && (
                                            <>  
                                                <span style={{cursor:'pointer'}} onClick={() => filtroCarteraVencida(result.tipo)}>- {result.nombre} ({result.detall.length})</span>
                                                <br></br>
                                            </>
                                        )}
                                    </>
                                ))}
                            </div>
                            <div className='col-6' style={{textAlign:'right'}}>
                                {dataResumen.resumenCartera.map((result, index) => (
                                    <>  
                                        {result.mesActual == 0 && (
                                            <>  
                                                <span onClick={() => filtroCarteraVencida(result.tipo)} style={{color:'red',cursor:'pointer'}}>{formattedPrice(result.valor)}</span>
                                                <br></br>
                                            </>
                                        )}
                                    </>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className='col-6' style={{borderLeft:'2px solid #e1e1e1'}}>
                        <div style={{display: 'flex',alignItems: 'center',height:'100%',width:'100%',textAlign:'center'}}>
                            <div style={{width:'100%'}}>
                                <h3 style={{cursor:'pointer'}} onClick={() => filtroCarteraVencida(0)}>{formattedPrice(parseInt(dataResumen.carteraTotalMesAnterior))}</h3>
                            </div>
                        </div>
                    </div>
                    <div className='col-12' style={{marginTop:'20px'}}>
                        <div className="table-responsive">
                            <table className="table table-striped">
                                <thead>
                                    <tr style={{background:"#e9e9e9"}}>
                                        <th scope="col" style={{textAlign:'center'}}>Pedido</th>
                                        <th scope="col" style={{textAlign:'center'}}>Valor</th>
                                        <th scope="col" style={{textAlign:'center'}}>Usuario</th>
                                        <th scope="col" style={{textAlign:'center'}}>Cliente</th>
                                        <th scope="col" style={{textAlign:'center'}}>Contacto</th>
                                        <th scope="col" style={{textAlign:'center'}}>Dias</th>
                                        <th scope="col" style={{textAlign:'center'}}>Historial</th>
                                        <th scope="col" style={{textAlign:'center'}}>Despacho</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {banderaCarteraAnterior ? (
                                        <tr>
                                            <td colSpan="9" style={{ textAlign: 'center' }}>Consultando...</td>
                                        </tr>
                                    ) : (

                                        resultCarteraAnterior.length === 0 ? (
                                            <tr>
                                                <td colSpan="9" style={{ textAlign: 'center' }}>No se encontraron registros.</td>
                                            </tr>
                                        ) : (

                                            resultCarteraAnterior.map((pedido, index) => {
                                                return (
                                                    <React.Fragment key={index}>
                                                        <tr>
                                                            <td style={{ textAlign: 'center',whiteSpace:'nowrap' }}>
                                                                {pedido.referencia}
                                                                <br></br>
                                                                <b>F-2 {pedido.factura}</b>
                                                            </td>
                                                            <td style={{ textAlign: 'center' }}>
                                                                {formattedPrice(pedido.valor)}
                                                                <br></br>
                                                                <b>{pedido.nombreTipo}</b>
                                                            </td>
                                                            <td style={{ textAlign: 'center' }}>{pedido.name}</td>
                                                            <td style={{ textAlign: 'center' }}>
                                                                {formatearNumeroConPuntos(pedido.noDoc)}
                                                                <br></br>
                                                                {pedido.cliente}
                                                            </td>
                                                            <td style={{ textAlign: 'center',whiteSpace:'nowrap' }}>
                                                                {formatearTelefono(pedido.number)}
                                                                <br></br>
                                                                {pedido.nameContacto !== 'undefined' ? (
                                                                    <>
                                                                        <b>{pedido.nameContacto}</b>
                                                                    </>
                                                                ):(
                                                                    <>
                                                                        <b>{pedido.pushName}</b>
                                                                    </>
                                                                )}
                                                            </td>
                                                            <td style={{ textAlign: 'center',color:pedido.colorDias }}>
                                                                {pedido.dias}
                                                                <br></br>
                                                                <span>{formatSpanishDate3(new Date(pedido.fechaFactura))}</span>
                                                            </td>
                                                            <td style={{ textAlign: 'center',whiteSpace:'nowrap' }}>
                                                                TOTAL: {formattedPrice(pedido.saldo)}
                                                                <div style={{width:'100%',borderTop:'1px solid',marginTop:'5px'}}>
                                                                    {pedido.recibos.map((recibo, index) => (
                                                                        <div key={index}>
                                                                            R-1 {recibo.recibo}: {formattedPrice(recibo.valor)}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div style={{textAlign:'right',marginTop:'10px',background:'#e9e9e9'}}>
                                                                    SALDO: {formattedPrice(parseInt(pedido.saldo)-parseInt(pedido.abonos))}
                                                                </div>
                                                            </td>
                                                            <td style={{textAlign:'center'}}>
                                                            {pedido.datosEnvio?.nombre !== undefined ? (
                                                                    <>
                                                                        {pedido.datosEnvio.guia}
                                                                        <br></br>
                                                                        {pedido.datosEnvio.nombre}

                                                                        {pedido.datosEnvio?.estadoTransportadora !== "Eperando Recogida" && (
                                                                            <>  
                                                                                <br></br>
                                                                                "{pedido.datosEnvio.estadoTransportadora}"
                                                                                <br></br>
                                                                                <b>{formatSpanishDate2(new Date(pedido.datosEnvio.fechaUltimoMovimiento))}</b>
                                                                            </>
                                                                        )}
                                                                    </>
                                                                ):(
                                                                    <>
                                                                        <b>No tiene despacho</b>
                                                                    </>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    </React.Fragment>        
                                                )
                                            })
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
            </Modal.Body>
        </Modal>

        <Modal show={modalBonos} className="modal-lg" onHide={cerrarModal}>
            <Modal.Header closeButton>
            </Modal.Header>
            <Modal.Body style={{marginTop:'-40px'}}>
                <div className='row'>
                    <h3>MIS BONOS: $80.000</h3>
                    <div className='col-6' style={{borderRight:'3px solid #e9e9e9'}}>
                        <p style={{textAlign:'right'}}>Pagos: $40.000</p>
                    </div>
                    <div className='col-6'>
                        <p style={{textAlign:'right'}}>Pendientes: $40.000</p>
                    </div>
                </div>
            </Modal.Body>
        </Modal>

        <div id="divToPrint" className="hidden" style={{padding:'50px'}}>
            <div className='row' style={{height: '110px',marginTop: '20px'}}>
                <div className='col-2' style={{borderRight:"2px solid",textAlign:'right'}}>
                    <QRCodeCanvas id='linkQR' value={linkQR} style={{maxWidth:'100%',margin:'auto'}} />
                </div>
                <div className="col-5">
                    <h1 id='referenciaPedido' style={{marginBottom: "0px",color:"#333",fontWeight:'bold'}}>
                        
                    </h1>
                    <p id='asesorPedido' style={{color: "#7e7e7e",fontSize:'23px'}}>
                        Ase. {usuario.nombre}
                        <br></br>
                        <span id="fechaSubida"></span>
                        
                    </p>
                </div>
                <div className="col-5" style={{textAlign: "center"}}>
                    <h1 id="transportadoraPedido" style={{fontWeight:'bold'}}>
                        
                    </h1>
                    <h3 id="tipoEnvioPedido">
                        
                    </h3>
                </div>
            </div>
            <div className="row" style={{marginTop: "60px"}}>
                <div className="col-12" id="divProductos">
                    {productos.map((producto,index) => {
                        return (<>
                            <div className='row' style={{marginTop:'10px'}}>  
                                <div className='col-1' style={{textAlign:'center'}}>
                                    <div style={{display: 'flex',alignItems: 'center',height:'100%'}}>
                                        <div>
                                            <h1 style={{color:"#333",fontWeight:'bold'}}>
                                                {index+1}
                                            </h1>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-4' style={{borderRight:'2px solid #e9e9e9'}}>
                                    <div style={{display: 'flex',alignItems: 'center',height:'100%'}}>
                                        <div>
                                            <p style={{marginBottom:'0px',lineHeight:'30px',fontSize:'20px'}}>
                                                - {producto.tamanoLabel} 
                                                {producto.numeroHojas > 0 && (
                                                    <>
                                                        ({producto.tipoHojaLabel})
                                                    </>
                                                )}
                                                <br></br>
                                                {producto.nombre.length > 0 && (
                                                    <>
                                                        - Nombre: {producto.nombre}
                                                        <br></br>
                                                    </>
                                                )}

                                                {producto.numeroHojas > 0 && (
                                                    <>
                                                        - {producto.numeroHojas} Hojas
                                                        <br></br>
                                                        - Hojas: {producto.nombreHoja}
                                                        <br></br>
                                                    </>
                                                )}

                                                
                                                {producto.cantidadSeparadores > 0 && (
                                                    <>
                                                        - {producto.cantidadSeparadores} Insertos (${formatNumberWithThousandSeparator(producto.valorSeparadores)})
                                                        <br></br>
                                                    </>
                                                )}
                                                                
                                                {producto.precioContra > 0 && (
                                                    <>
                                                        - Contracatula ($5.000)
                                                        <br></br>
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-7'>
                                    <div className='row justify-content-md-center' id={`imagenesProducto2-${producto.id}`} style={{marginTop:'20px'}} >
                                        <div class='col-4'><img src={producto.imagen1}></img></div>
                                        <div class='col-4'><img src={producto.imagen2}></img></div>
                                        <div class='col-4'><img src={producto.imagen3}></img></div>
                                    </div>           
                                </div>
                                <div className='col-12' style={{marginBottom:'10px',marginTop:'20px'}}>
                                    <div style={{width:'80%',height:'2px',background:"#e9e9e9",margin:"auto",marginTop:"10px",marginBottom:"10px"}}>
                                    </div>
                                </div>
                            </div>   
                        </>)
                    })}     
                </div>
                <div className="col-12">
                    <div style={{textAlign: "right",height: "3px",background: "#dedede",width: "100%",marginBottom: "0px",marginTop: "20px"}}>
                        <span style={{background: "#dedede",fontSize: "13px",padding: "2px 10px",paddingBottom:"20px"}}>
                            DATOS DE FACTURACION
                        </span>
                    </div>
                    <div style={{border: "1px solid #dedede",textAlign: "initial",padding: "10px"}}>
                        <p style={{color: "#7e7e7e",fontSize:'20px'}} id="resultFacturacion2">
                        </p>
                    </div>
                </div>
                <div className="col-12">
                    <div style={{textAlign: "right",height: "3px",background: "#dedede",width: "100%",marginBottom: "0px",marginTop: "20px"}}>
                        <span style={{background: "#dedede",fontSize: "13px",padding: "2px 10px",paddingBottom:"20px"}}>
                            DATOS DE ENVIO
                        </span>
                    </div>
                    <div style={{border: "1px solid #dedede",textAlign: "initial",padding: "10px"}}>
                        <p style={{color: "#7e7e7e",fontSize:'20px'}} id="resultDireccion2">
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <div className="container-xxl flex-grow-1 containerP" style={{background:'#eeeeee',height: '100%',width: '100%',position: 'relative',left: '0px',top: '0px',overflow: 'hidden'}}>
            <div className='row' style={{height:'100%',width:'98%',margin:'auto'}}>
                <div className='col-9' style={{maxHeight:'100%',padding:'40px 20px 40px 0px',paddingLeft:'0px',fontSize:'12px'}}>
                    <div className="card" style={{padding:'0px'}}>
                        <div className="card-body" style={{width:'100%',height:'93vh',overflow:'auto',paddingBottom:'50px'}}>
                            <div className="d-flex align-items-start align-items-sm-center">
                                <div className='row' >
                                    <div className='col-12'>
                                        <span style={{borderLeft:'3px solid #e1e1e1',paddingLeft:'4px'}}>Pendiente por facturar: <b>{formattedPrice(dataResumen.pedidosPendientesMes)}</b></span>
                                    </div>
                                    <div className='col-12' style={{marginTop:'10px'}}>
                                        <div style={{borderBottom:'2px solid #e1e1e1',width:'90%',margin:'auto',padding:'0px',marginTop:'10px'}}>
                                            <span style={{background:'#e1e1e1',padding:'3px 10px'}}>{dataResumen.semanaActual}</span>
                                        </div>
                                    </div>
                                    <div className='col-3' style={{marginTop:'10px',textAlign:'center',borderRight:'2px solid #e1e1e1'}}>
                                        <h4 style={{marginBottom:'0px'}}>{formattedPrice(dataResumen.ventaSemana)}</h4>
                                        <span>Ventas</span>
                                    </div>
                                    <div className='col-3' style={{marginTop:'10px',textAlign:'center',borderRight:'2px solid #e1e1e1'}}>
                                        <h4 style={{marginBottom:'0px'}}>{formattedPrice(dataResumen.ingresoSemana)}</h4>
                                        <span>Ingresos</span>
                                    </div>
                                    <div className='col-3' style={{marginTop:'10px',textAlign:'center',borderRight:'2px solid #e1e1e1'}}>
                                        <h4 style={{marginBottom:'0px'}}>{dataResumen.ticketsAsignados}</h4>
                                        <span>Asignados</span>
                                    </div>
                                    <div className='col-3' style={{marginTop:'10px',textAlign:'center'}}>
                                        <h4 style={{marginBottom:'0px'}}>{dataResumen.ticketsAceptados}</h4>
                                        <span>Aceptados</span>
                                    </div>
                                    <div className='col-6' style={{fontSize:'12px',lineHeight:'25px',marginTop:'40px',display:'none'}}>
                                        <div style={{display: 'flex',alignItems:'center',height:'100%'}}>
                                            <div>
                                                <span>
                                                    <i style={{color:'#dbca00'}} className='bx bxs-info-circle'></i> 30 de septiembre a las 9:30 am ultimo mensaje
                                                    <br></br>
                                                    <i style={{color:'red'}} className='bx bxs-x-circle'></i> De cada 100 personas 5 te compran 
                                                    <br></br>
                                                    <i style={{color:'red'}} className='bx bxs-x-circle'></i> Tienes 5 pedidos que estan vencidos en Cartera 
                                                    <br></br>
                                                    <i style={{color:'red'}} className='bx bxs-x-circle'></i> Tu porcentaje de aceptados es del 20% 
                                                    <br></br>
                                                    <i style={{color:'green'}} className='bx bxs-check-circle'></i> Tiempo promedio de respuesta 1 minuto 
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='col-12' style={{marginTop:'40px'}}>
                                        <div style={{display: 'flex',alignItems: 'center',width:'100%',height:'100%'}}>
                                            <div style={{width:'100%'}}>
                                                <table className="table" style={{fontSize:'10px',width:'auto',margin:'auto'}}>
                                                    <thead>
                                                        <tr>
                                                            <th scope="col" style={{textAlign:'center',background:"none"}}></th>
                                                            {dataResumen.dataPagos.map((pago, index) => {
                                                                if(pago.tipo == 0){
                                                                    return <td scope="col" style={{textAlign:'center',background:"#e9e9e9",fontSize:'10px'}}>ANTERIOR<br></br>{formatFecha(pago.fecha)}</td>
                                                                }
                                                            })}
                                                            {dataResumen.dataPagos.map((pago, index) => {
                                                                if(pago.tipo == 1){
                                                                    return <td scope="col" style={{textAlign:'center',background:"#e9e9e9",fontSize:'10px'}}>PROXIMO<br></br>{formatFecha(pago.fecha)}</td>
                                                                }
                                                            })}
                                                            <th scope="col" style={{textAlign:'center',background:"#e9e9e9",fontSize:'10px'}}>TOTAL</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td style={{textAlign:'right',background:"#e9e9e9"}}>BASE</td>
                                                            
                                                            {dataResumen.dataPagos.map((pago, index) => {
                                                                if(pago.tipo == 0){
                                                                    return <td style={{textAlign:'center',borderRight:'2px solid #e9e9e9'}}>{formattedPrice(pago.base)}</td>
                                                                }
                                                            })}
                                                            {dataResumen.dataPagos.map((pago, index) => {
                                                                if(pago.tipo == 1){
                                                                    return <td style={{textAlign:'center',borderRight:'2px solid #e9e9e9'}}>{formattedPrice(pago.base)}</td>
                                                                }
                                                            })}
                                                            <td style={{textAlign: 'center', borderRight: '2px solid #e9e9e9'}}>
                                                                {formattedPrice(dataResumen.dataPagos.reduce((total, pago) => total + parseInt(pago.base), 0))}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style={{textAlign:'right',background:"#e9e9e9"}}>BONOS</td>
                                                            {dataResumen.dataPagos.map((pago, index) => {
                                                                if(pago.tipo == 0){
                                                                    return <td style={{textAlign:'center',borderRight:'2px solid #e9e9e9'}}>{formattedPrice(pago.bonos)}</td>
                                                                }
                                                            })}
                                                            {dataResumen.dataPagos.map((pago, index) => {
                                                                if(pago.tipo == 1){
                                                                    return <td style={{textAlign:'center',borderRight:'2px solid #e9e9e9'}}>{formattedPrice(pago.bonos)}</td>
                                                                }
                                                            })}
                                                            <td style={{textAlign: 'center', borderRight: '2px solid #e9e9e9'}}>
                                                                {formattedPrice(dataResumen.dataPagos.reduce((total, pago) => total + parseInt(pago.bonos), 0))}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style={{textAlign:'right',background:"#e9e9e9"}}>COMISION</td>
                                                            {dataResumen.dataPagos.map((pago, index) => {
                                                                if(pago.tipo == 0){
                                                                    return <td style={{textAlign:'center',borderRight:'2px solid #e9e9e9'}}>{formattedPrice(pago.comisiones)}</td>
                                                                }
                                                            })}
                                                            {dataResumen.dataPagos.map((pago, index) => {
                                                                if(pago.tipo == 1){
                                                                    return <td style={{textAlign:'center',borderRight:'2px solid #e9e9e9'}}>{formattedPrice(pago.comisiones)}</td>
                                                                }
                                                            })}
                                                            <td style={{textAlign: 'center', borderRight: '2px solid #e9e9e9'}}>
                                                                {formattedPrice(dataResumen.dataPagos.reduce((total, pago) => total + parseInt(pago.comisiones), 0))}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style={{textAlign:'right',background:"#e9e9e9"}}>DEDUCCIONES</td>
                                                            {dataResumen.dataPagos.map((pago, index) => {
                                                                if(pago.tipo == 0){
                                                                    return <td style={{textAlign:'center',borderRight:'2px solid #e9e9e9'}}>{formattedPrice(pago.deducciones)}</td>
                                                                }
                                                            })}
                                                            {dataResumen.dataPagos.map((pago, index) => {
                                                                if(pago.tipo == 1){
                                                                    return <td style={{textAlign:'center',borderRight:'2px solid #e9e9e9'}}>{formattedPrice(pago.deducciones)}</td>
                                                                }
                                                            })}
                                                            <td style={{textAlign: 'center', borderRight: '2px solid #e9e9e9'}}>
                                                                {formattedPrice(dataResumen.dataPagos.reduce((total, pago) => total + parseInt(pago.deducciones), 0))}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                    <tfoot>
                                                        <tr>
                                                            <td style={{textAlign:'right',background:"none",border:'none'}}></td>
                                                            {dataResumen.dataPagos.map((pago, index) => {
                                                                if(pago.tipo == 0){
                                                                    return <td style={{textAlign:'center',borderLeft:'2px solid #e9e9e9',borderRight:'2px solid #e9e9e9'}}>{formattedPrice(pago.valor)}</td>
                                                                }
                                                            })}
                                                            {dataResumen.dataPagos.map((pago, index) => {
                                                                if(pago.tipo == 1){
                                                                    return <td style={{textAlign:'center',borderRight:'2px solid #e9e9e9'}}>{formattedPrice(pago.valor)}</td>
                                                                }
                                                            })}
                                                            <td style={{textAlign: 'center', borderRight: '2px solid #e9e9e9'}}>
                                                                {formattedPrice(dataResumen.dataPagos.reduce((total, pago) => total + parseInt(pago.valor), 0))}
                                                            </td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='col-12' style={{marginTop:'40px'}}>
                                        <table className="table table-striped">
                                            <thead>
                                                <tr style={{background:"#e9e9e9"}}>
                                                    <th scope="col" style={{textAlign:'center'}}>Pedido</th>
                                                    <th scope="col" style={{textAlign:'center'}}>Valor</th>
                                                    <th scope="col" style={{textAlign:'center'}}>Usuario</th>
                                                    <th scope="col" style={{textAlign:'center'}}>Cliente</th>
                                                    <th scope="col" style={{textAlign:'center'}}>Productos</th>
                                                    <th scope="col" style={{textAlign:'center'}}>Opciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                            {consultando ? (
                                                <tr>
                                                    <td colSpan="6" style={{ textAlign: 'center' }}>Consultando...</td>
                                                </tr>
                                            ) : (
                                                    
                                                pedidos.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="6" style={{ textAlign: 'center' }}>No se encontraron registros.</td>
                                                    </tr>
                                                ) : (
                                                    pedidos.map((pedido, index) => {
                                                        return (
                                                            <React.Fragment key={index}>
                                                                <tr>
                                                                    <td style={{ textAlign: 'center' }}>{pedido.referencia}</td>
                                                                    <td style={{ textAlign: 'center' }}>{formattedPrice(pedido.total)}</td>
                                                                    <td style={{ textAlign: 'center' }}>
                                                                        {pedido.name}
                                                                        <br></br>
                                                                        <b>{formatearNumeroConPuntos(pedido.document)}</b>
                                                                    </td>
                                                                    <td style={{ textAlign: 'center' }}>
                                                                        {pedido.cliente}
                                                                        <br></br>
                                                                        <b>{formatearNumeroConPuntos(pedido.noDoc)}</b>
                                                                    </td>
                                                                    <td style={{ textAlign: 'center' }}>
                                                                        {pedido.productos}
                                                                    </td>
                                                                    <td style={{ textAlign: 'center' }}>
                                                                        <i onClick={() => imprimirOrden(pedido.referencia)} className='bx bx-printer'></i>
                                                                    </td>
                                                                </tr>
                                                            </React.Fragment>
                                                        )
                                                    })

                                                    
                                                )
                                            )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='col-3' style={{maxHeight:'100vh',overflow:'auto',background:'#f5f5f5',paddingTop:'40px',paddingBottom:'40px',boxShadow:'0px 0px 18px 0px #bdbdbdbf'}}>
                    <div style={{textAlign:'center',background:'#e1e1e1',border:'1px solid #c1c1c1',marginBottom:'10px'}}>
                        Promedio de venta diaria: <span style={{color: parseInt(dataResumen.ventaMes/dataResumen.diasRecorridos) < 500000 ? 'red': 'green'}}>{formattedPrice(parseInt(dataResumen.ventaMes/dataResumen.diasRecorridos))}</span>
                    </div>
                    <div className='row' style={{background:'#e1e1e1',padding:'10px 0px 0px 0px'}}>
                        <div className='col-6' style={{textAlign:'left',paddingRight:'0px'}}>
                            <h4 style={{marginBottom:'0px'}}>{dataResumen.mesActual}</h4>
                            <span style={{fontSize:'10px'}}>{dataResumen.diasRecorridos} días, aún te faltan <b>{dataResumen.diasDisponibles}</b></span>
                        </div>
                        <div className='col-6' style={{textAlign:'right',paddingLeft:'0px'}}>
                            <h4 style={{color:dataResumen.porcentaje < 50 ? 'red' : dataResumen.porcentaje < 100 ? '#b9b91a' : 'green',marginBottom:'0px'}}>{formattedPrice(dataResumen.ventaMes)}</h4>
                            <span style={{fontSize:'12px'}}>{formattedPrice(dataResumen.metaMes)}</span>
                        </div>
                        <div style={{height:'2px',width:dataResumen.porcentaje+'%',background: dataResumen.porcentaje < 50 ? 'red' : dataResumen.porcentaje < 100 ? '#cfcf51' : '#65b965',marginTop:'8px',textAlign:'right',paddingRight:'0px'}}>
                            <span style={{fontSize: '10px',background: dataResumen.porcentaje < 50 ? '#f9a3a3' : dataResumen.porcentaje < 100 ? '#c5c539' : '#65b965',borderRadius: '20px',marginTop: '-8px',padding: '2px 4px',textAlign: 'center',color: '#000',display:'ruby-text'}}>{dataResumen.porcentaje}%</span>
                        </div>
                    </div>
                    <label style={{marginTop:'20px',background:'#e9e9e9',width:'94%',padding:'10px',textAlign:'center',marginLeft:'3%'}}>RESUMEN VENTAS</label>
                    <div className='row' style={{width:'94%',border:'2px solid #e9e9e9',padding:'10px 0px',marginLeft:'3%',fontSize:'12px'}}>
                        
                        <div className='col-6' style={{paddingRight:'0px'}}>
                            {dataResumen.resultCompra.map((result, index) => (
                                <>
                                    - {result.nombre}
                                    <br></br>
                                </>
                            ))}
                        </div>
                        <div className='col-2' style={{paddingLeft:'0px',textAlign:'center'}}>
                            {dataResumen.resultCompra.map((result, index) => (
                                <>
                                    ({result.detall.length})
                                    <br></br>
                                </>
                            ))}
                        </div>
                        <div className='col-4' style={{textAlign:'right',paddingLeft:'0px'}}>
                            {dataResumen.resultCompra.map((result, index) => (
                                <>
                                    <span style={{color:'green'}}>{formattedPrice(result.valor)}</span>
                                    <br></br>
                                </>
                            ))}
                        </div>
                        <div className='col-12' style={{textAlign:'right',paddingLeft:'0px',marginTop:'10px',marginBottom:'10px',paddingRight:'10px'}}>
                            <span style={{background:'#e1e1e1',padding:'3px 5px',border:'1px solid #e1e1e1'}}>SUB-TOTAL</span>
                            <span style={{padding:'3px 5px',border:'1px solid #e1e1e1'}}>{formattedPrice(parseInt(dataResumen.ventaMes)+parseInt(dataResumen.valorDevolucion))}</span>
                        </div>
                        <div className='col-6' style={{paddingRight:'0px'}}>
                            <span style={{cursor:'pointer',marginRight:'3px'}}>- Devoluciones</span>
                        </div>
                        <div className='col-2' style={{paddingLeft:'0px',textAlign:'center'}}>
                            ({dataResumen.cantidadDevolucion})
                        </div>
                        <div className='col-4' style={{textAlign:'right',paddingLeft:'0px'}}>
                            <span style={{color:'red'}}>{formattedPrice(dataResumen.valorDevolucion)}</span>
                        </div>
                        <div className='col-12' style={{textAlign:'right',paddingLeft:'0px',marginTop:'10px',marginBottom:'10px',paddingRight:'10px'}}>
                            <span style={{background:'#e1e1e1',padding:'3px 5px',border:'1px solid #e1e1e1'}}>TOTAL</span>
                            <span style={{padding:'3px 5px',border:'1px solid #e1e1e1'}}>{formattedPrice(parseInt(dataResumen.ventaMes))}</span>
                        </div>
                        <div className='col-12' style={{textAlign:'center'}}>
                            <div style={{borderTop:'2px solid #e1e1e1'}}>{dataResumen.pedidos} pedidos - {dataResumen.productos} Productos</div>
                        </div>
                    </div>

                    <label style={{marginTop:'20px',background:'#e9e9e9',width:'94%',padding:'10px',textAlign:'center',marginLeft:'3%'}}>INGRESOS</label>
                    <div className='row' style={{width:'94%',border:'2px solid #e9e9e9',padding:'10px 0px',marginLeft:'3%',fontSize:'12px'}}>
                        
                        <div className='col-6' style={{paddingRight:'0px'}}>
                            {dataResumen.ingresos.map((result, index) => (
                                <>  
                                    {result.mesActual == 1  && (
                                        <>
                                            - {result.nombre}
                                            <br></br>
                                        </>
                                    )}
                                </>
                            ))}
                            {dataResumen.resultCompra.map((result, index) => (
                                <>  
                                    {result.cartera == 0 && (
                                        <>
                                            - {result.nombre}
                                            <br></br>
                                        </>
                                    )}
                                    
                                </>
                            ))}
                        </div>
                        <div className='col-2' style={{paddingLeft:'0px',textAlign:'center'}}>
                            
                            {dataResumen.ingresos.map((result, index) => (
                                <>  
                                    {result.mesActual == 1 && (
                                        <>
                                            ({result.detall.length})
                                            <br></br>
                                        </>
                                    )}
                                </>
                            ))}
                            {dataResumen.resultCompra.map((result, index) => (
                                <>  
                                    {result.cartera == 0 && (
                                        <>
                                            ({result.detall.length})
                                            <br></br>
                                        </>
                                    )}
                                    
                                </>
                            ))}
                        </div>
                        <div className='col-4' style={{textAlign:'right',paddingLeft:'0px'}}>
                            
                            {dataResumen.ingresos.map((result, index) => (
                                <> 
                                    {result.mesActual == 1 && ( 
                                        <>  
                                            <span style={{color:'green'}}>{formattedPrice(result.valor)}</span>
                                            <br></br>
                                        </>
                                    )}
                                </>
                            ))}
                            {dataResumen.resultCompra.map((result, index) => (
                                <>  
                                    {result.cartera == 0 && (
                                        <>
                                            <span style={{color:'green'}}>{formattedPrice(result.valor)}</span>
                                            <br></br>
                                        </>
                                    )}
                                    
                                </>
                            ))}

                            
                            <span style={{borderTop:'1px solid #566a7f',display:'block',width:'100%'}}>
                                {formattedPrice(parseInt(dataResumen.ingresosTotalMes))}
                            </span>
                        </div>
                        {dataResumen.carteraIngresoAnterior && (
                            <>
                            <div className='col-12' style={{textAlign:'center',background:'#e1e1e1',margin:'auto',width:'90%',marginTop:'10px',marginBottom:'10px',padding:'3px 5px'}}>
                                MESES ANTERIORES
                            </div>
                            </>
                        )}
                        <div className='col-6' style={{paddingRight:'0px'}}>
                            {dataResumen.ingresos.map((result, index) => (
                                <>  
                                    {result.mesActual == 0  && (
                                        <>
                                            - {result.nombre}
                                            <br></br>
                                        </>
                                    )}
                                </>
                            ))}
                        </div>
                        <div className='col-2' style={{paddingLeft:'0px',textAlign:'center'}}>
                            {dataResumen.ingresos.map((result, index) => (
                                <>  
                                    {result.mesActual == 0 && (
                                        <>
                                            ({result.detall.length})
                                            <br></br>
                                        </>
                                    )}
                                </>
                            ))}
                        </div>
                        <div className='col-4' style={{textAlign:'right',paddingLeft:'0px'}}>
                            {dataResumen.ingresos.map((result, index) => (
                                <> 
                                    {result.mesActual == 0 && ( 
                                        <>
                                            <span style={{color:'green'}}>{formattedPrice(result.valor)}</span>
                                            <br></br>
                                        </>
                                    )}
                                </>
                            ))}

                            
                            <span style={{borderTop:'1px solid #566a7f',display:'block',width:'100%'}}>
                                {formattedPrice(parseInt(dataResumen.ingresosTotalMesAnterior))}
                            </span>
                        </div>
                        <div className='col-12' style={{textAlign:'right',paddingLeft:'0px',marginTop:'10px'}}>
                            <span style={{background:'#e1e1e1',padding:'3px 5px',border:'1px solid #e1e1e1'}}>TOTAL</span>
                            <span style={{padding:'3px 5px',border:'1px solid #e1e1e1'}}>{formattedPrice(parseInt(dataResumen.ingresosTotalMesAnterior)+parseInt(dataResumen.ingresosTotalMes))}</span>
                        </div>
                    </div>
                    
                    <label onClick={() => carteraMes()} style={{cursor:'pointer',marginTop:'20px',background:'#e9e9e9',width:'94%',padding:'10px',textAlign:'center',marginLeft:'3%'}}>CARTERA</label>
                    <div className='row' style={{width:'94%',border:'2px solid #e9e9e9',padding:'10px 0px',marginLeft:'3%',fontSize:'12px'}}>
                        <div className='col-6' style={{paddingRight:'0px'}}>
                            {dataResumen.resumenCartera.map((result, index) => (
                                <>  
                                    {result.mesActual == 1 && (
                                        <>
                                            <span style={{cursor:'pointer'}} onClick={() => filtroCartera(result.tipo)}>- {result.nombre}</span>
                                            <br></br>

                                        </>
                                    )}
                                </>
                            ))}
                        </div>
                        <div className='col-2' style={{paddingLeft:'0px',textAlign:'center'}}>
                            {dataResumen.resumenCartera.map((result, index) => (
                                <>
                                    {result.mesActual == 1 && (
                                        <>  
                                            <span style={{cursor:'pointer'}} onClick={() => filtroCartera(result.tipo)}>({result.detall.length})</span>
                                            <br></br>
                                        </>
                                    )}
                                </>
                            ))}
                        </div>
                        <div className='col-4' style={{textAlign:'right',paddingLeft:'0px'}}>
                            {dataResumen.resumenCartera.map((result, index) => (
                                <>  
                                    {result.mesActual == 1 && (
                                        <>  
                                            <span onClick={() => filtroCartera(result.tipo)} style={{cursor:'pointer',color:'red'}}>{formattedPrice(result.valor)}</span>
                                            <br></br>
                                        </>
                                    )}
                                </>
                            ))}
                            <span onClick={() => carteraMes()} style={{cursor:'pointer',borderTop:'1px solid #566a7f',display:'block',width:'100%'}}>
                                {formattedPrice(parseInt(dataResumen.carteraTotalMes))}
                            </span>
                        </div>
                        
                        {dataResumen.carteraMesAnterior && (
                            <>
                            <div className='col-12' onClick={() => carteraMesAnterior()} style={{cursor:'pointer',textAlign:'center',background:'#e1e1e1',margin:'auto',width:'90%',marginTop:'10px',marginBottom:'10px'}}>
                                MESES ANTERIORES
                            </div>
                            </>
                        )}
                        <div className='col-6' style={{paddingRight:'0px'}}>
                            {dataResumen.resumenCartera.map((result, index) => (
                                <>  
                                    {result.mesActual == 0 && (
                                        <>
                                            <span style={{cursor:'pointer'}} onClick={() => filtroCarteraVencida(result.tipo)}>- {result.nombre}</span>
                                            <br></br>
                                        </>
                                    )}
                                </>
                            ))}
                        </div>
                        <div className='col-2' style={{paddingLeft:'0px',textAlign:'center'}}>
                            {dataResumen.resumenCartera.map((result, index) => (
                                <>
                                    {result.mesActual == 0 && (
                                        <>  
                                            <span style={{cursor:'pointer'}} onClick={() => filtroCarteraVencida(result.tipo)}>({result.detall.length})</span>
                                            <br></br>
                                        </>
                                    )}
                                </>
                            ))}
                        </div>
                        <div className='col-4' style={{textAlign:'right',paddingLeft:'0px'}}>
                            {dataResumen.resumenCartera.map((result, index) => (
                                <>  
                                    {result.mesActual == 0 && (
                                        <>  
                                            <span onClick={() => filtroCarteraVencida(result.tipo)} style={{color:'red',cursor:'pointer'}}>{formattedPrice(result.valor)}</span>
                                            <br></br>
                                        </>
                                    )}
                                </>
                            ))}
                            <span onClick={() => filtroCarteraVencida(0)} style={{borderTop:'1px solid #566a7f',display:'block',width:'100%',cursor:'pointer'}}>
                                {formattedPrice(parseInt(dataResumen.carteraTotalMesAnterior))}
                            </span>
                            
                        </div>

                        <div className='col-12' style={{textAlign:'right',paddingLeft:'0px',marginTop:'10px'}}>
                            <span style={{background:'#e1e1e1',padding:'3px 5px',border:'1px solid #e1e1e1'}}>TOTAL</span>
                            <span style={{padding:'3px 5px',border:'1px solid #e1e1e1'}}>{formattedPrice(parseInt(dataResumen.carteraTotalMesAnterior)+parseInt(dataResumen.carteraTotalMes))}</span>
                        </div>

                    </div>

                </div>
            </div>
        </div>

    </>
    
}