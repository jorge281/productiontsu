"use client";

import React, { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Barcode from 'react-barcode';
import withReactContent from 'sweetalert2-react-content';
import { FileUploader } from "react-drag-drop-files";
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Cookies from 'js-cookie';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './style.css';
const $ = require('jquery');


const styles = {
    noResults: {
        fontSize: '10px',
        marginBottom: '0px',
        background: '#e9e9e9',
        color: '#a5acb4',
        padding: '5px 10px',
        marginTop: '5px',
        textAlign: 'center'
    },
    result: {
        fontSize: '10px',
        marginBottom: '0px',
        background: '#e9e9e9',
        color: '#a5acb4',
        padding: '5px 10px',
        marginTop: '5px',
        cursor: 'pointer'
    }
};



let imprimirOrden = 0;
let fechaSubida2 = new Date();
let totalComision2 = 0;
let departamentosArray = [];
let arrayFile = [];
let fechaDespacho2 = "";
let descuentoTotal2 = 0;
let idCupoPedido = 0;
let idClienteCRM = 0;
let typeClienteCRM = 1;
let controladorTiempo = "";
let tipoDePedido = 1;
let cargoSite = 0;
let usuarioProducto = 1;
let offsetProducto = 0;
let idFacturacion = 0;
let transportadoraPedido = 1;
let pesoPedido = 500;
let ciudadPedido = 0;
let fletePedido = 0;
let fleteCobrado2 = 0
let valorProductos2 = 0;
let valorTotal = valorProductos2 + fleteCobrado2;
let abonoTotal2 = 0;
let referenciaPedido2 = 0;
let saldoTotal2 = valorTotal;
let productosFin = [];
let transportadorasData = [];
let cantidadProductos2 = 0;
let usuarioId = 0;

export default function Home() {

    const [usuario, setUsuario] = useState({
        nombre: '',
        perfil: '',
        foto: '',
        user: ''
    });
    const [pedido, setpedido] = useState("");
    const [pedidoConfirmado, setPedidoConfirmado] = useState(true);
    const [entidades, setEntidades] = useState([]);
    const [labelTransportadora, setLabelTransportadora] = useState("");
    const [tiposPedidos, setTiposPedidos] = useState([]);
    const [tipoPedido, setTipoPedido] = useState(1);
    const [referenciaPedido, setReferenciaPedido] = useState("");
    const [transportadora, setTransportadora] = useState(1);
    const [cantidadProductos, setCantidadProductos] = useState(0);
    const [tipoEnvio, setTipoEnvio] = useState(2);
    const [flete, setFlete] = useState(0);
    const [ciudadSinCobertura, setCiudadSinCobertura] = useState(false);
    const [linkQR, setLinkQR] = useState('');
    const [fechaDespacho, setFechaDespacho] = useState("");
    const [fechaSubida, setFechaSubida] = useState("");
    const [banderaDescuento500, setBanderaDescuento500] = useState(false);
    const [fleteCobrado, setFleteCobrado] = useState(0);
    const [totalPedido, setTotalPedido] = useState(valorTotal);
    const [valorProductos, setValorProductos] = useState(valorProductos2);
    const [departamentos, setDepartamento] = useState([]);
    const [ciudades, setCiudades] = useState([]);
    const [ciudades2, setCiudades2] = useState([]);
    const [abonoTotal, setAbonoTotal] = useState(abonoTotal2);
    const [saldoTotal, setSaldoTotal] = useState(saldoTotal2);
    const [file, setFile] = useState([]);
    const [productos, setProductos] = useState([]);
    const [searchResultsTercero, setSearchResultsTercero] = useState([]);
    const [descuentoTotal, setDescuentoTotal] = useState(0);
    const [searchResultsCRM, setSearchResultsCRM] = useState([]);
    const [totalComision, setTotalComision] = useState([]);


    const formatFecha = (fechaISO) => {
        const date = parseISO(fechaISO);
        if (date != "Invalid Date") {
            return format(date, "d 'de' MMMM 'del' yyyy", { locale: es });
        }
        return "";
    };

    function printDocument() {
        const input = document.getElementById('divToPrint');
        let divTransportadora = $("#resultDireccion").html();
        divTransportadora += "<br>";
        let envioTexto = "";
        let transportadoraTexto = "TCC";

        if (transportadora == 1) {
            transportadoraTexto = "TCC";
            divTransportadora += "TCC";
        }
        if (transportadora == 2) {
            transportadoraTexto = "ENVIA";
            divTransportadora += "ENVIA";
        }
        if (transportadora == 3) {
            transportadoraTexto = "INTER RAPIDISIMO";
            divTransportadora += "INTER RAPIDISIMO";
        }
        if (transportadora == 4) {
            transportadoraTexto = "MENSAJERO";
            divTransportadora += "MENSAJERO";
        }
        if (transportadora == 6) {
            transportadoraTexto = "OTRA TRANSPORTADORA";
            divTransportadora += "OTRA TRANSPORTADORA";
        }
        divTransportadora += " - ";
        if (tipoEnvio == 1) {
            envioTexto = "INCLUIDO EN LA FACTURA";
            divTransportadora += "INCLUIDO EN LA FACTURA";
        }
        if (tipoEnvio == 2) {
            envioTexto = "CONTRA ENTREGA";
            divTransportadora += "CONTRA ENTREGA";
        }
        if (tipoEnvio == 3) {
            envioTexto = "RECAUDO";
            divTransportadora += "RECAUDO";
        }
        $("#resultDireccion2").html(divTransportadora);
        $("#resultFacturacion2").html($("#resultFacturacion").html());

        $("#resultDireccion3").html(divTransportadora);
        $("#resultFacturacion3").html($("#resultFacturacion").html());

        // Agregar cajones con texto "Guía" y "Despachado" después del despachoTexto
        const checkboxSize = 10; // Tamaño de los cuadros
        const checkboxMargin = 20; // Espacio entre los cuadros


        // Obtener el contenido de #resultCRM
        const result = $("#resultCRM").html();

        // Eliminar el <br> y dividir la cadena en líneas
        const parts = result.split('<br>');

        // Limpiar y asignar las partes
        const nombreCRM = parts[0]; // Primer elemento es el nombre
        const telefonoCRM = parts[1];

        input.classList.remove('hidden');

        html2canvas(input, { scale: 2 }).then((canvas) => {
            const pdf = new jsPDF('p', 'pt', [396, 612]); // Media carta en puntos (5.5 x 8.5 pulgadas)
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const footerHeight = 80; // Altura fija para el footer
            const pageHeight = pdfHeight - footerHeight;

            let position = 0;

            while (position < canvas.height) {
                const canvasSlice = document.createElement('canvas');
                canvasSlice.width = canvas.width;
                canvasSlice.height = pageHeight / pdfWidth * canvas.width;

                const context = canvasSlice.getContext('2d');
                context.drawImage(
                    canvas,
                    0, position, canvas.width, canvasSlice.height,
                    0, 0, canvasSlice.width, canvasSlice.height
                );

                const imgData = canvasSlice.toDataURL('image/png');
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pageHeight);

                // Dibujar línea superior del footer (línea punteada)
                const footerTop = pdfHeight - footerHeight;
                pdf.setLineWidth(0.5);
                pdf.setDrawColor(100); // Color gris
                pdf.setLineDash([4, 4]); // Patrón de línea punteada: 4 puntos de línea, 4 de espacio
                pdf.line(10, footerTop, pdfWidth - 10, footerTop); // Línea horizontal

                // Dibujar footer
                const footerY = footerTop + 10; // Posición vertical del footer
                pdf.setFontSize(10);
                pdf.setTextColor(100);

                // Alinear texto a la izquierda
                const asesorTexto = "Ase. " + capitalizeSyllables(usuario.nombre);
                const fechaTexto = $("#fechaSubida2").html();
                pdf.setFontSize(12);
                pdf.setFont("helvetica", "bold");
                pdf.text(10, footerY + 5, $("#referenciaPedido").html());
                pdf.setFontSize(10);
                pdf.setFont("helvetica", "normal");
                pdf.text(10, footerY + 15, asesorTexto);
                pdf.text(10, footerY + 25, fechaTexto);
                pdf.text(10, footerY + 35, telefonoCRM + " (" + nombreCRM + ")");

                // Alinear texto al centro

                const despachoTexto = fechaDespacho
                pdf.setFontSize(12);
                pdf.setFont("helvetica", "bold");
                pdf.text(pdfWidth - 10, footerY + 5, transportadoraTexto, { align: "right" });
                pdf.setFontSize(10);
                pdf.setFont("helvetica", "normal");
                pdf.text(pdfWidth - 10, footerY + 15, envioTexto, { align: "right" });
                pdf.text(pdfWidth - 10, footerY + 25, despachoTexto, { align: "right" });

                pdf.setLineDash([]);//linea continea
                pdf.rect(pdfWidth - 180, footerY + 27, checkboxSize, checkboxSize); // Dibujar cuadrado
                pdf.text(pdfWidth - 168, footerY + 35, "Evidencia", { align: "left" }); // Texto al lado del cuadro

                pdf.rect(pdfWidth - 120, footerY + 27, checkboxSize, checkboxSize); // Dibujar cuadrado
                pdf.text(pdfWidth - 108, footerY + 35, "Guia", { align: "left" }); // Texto al lado del cuadro

                pdf.rect(pdfWidth - 80, footerY + 27, checkboxSize, checkboxSize); // Dibujar cuadrado
                pdf.text(pdfWidth - 68, footerY + 35, "Despachado", { align: "left" }); // Texto al lado del cuadro

                pdf.line(50, footerY + 44, pdfWidth - 50, footerY + 44);

                position += canvasSlice.height;

                if (position < canvas.height) {
                    pdf.addPage();
                }
            }

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
    }



    /*function printDocument(){
        const input = document.getElementById('divToPrint');
        let divTransportadora = $("#resultDireccion").html();
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
            divTransportadora += "RECAUDO"
        }
        $("#resultDireccion2").html(divTransportadora);
        $("#resultFacturacion2").html($("#resultFacturacion").html());

        $("#resultDireccion3").html(divTransportadora);
        $("#resultFacturacion3").html($("#resultFacturacion").html());

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
    };*/

    const handleFleteCobrado = (event) => {
        let value = event.target.value.replace(/\./g, ''); // Eliminar puntos existentes
        fleteCobrado2 = value;
        const formattedValue = formatNumberWithThousandSeparator(value);
        setFleteCobrado(formattedValue);
        let total = parseInt(fleteCobrado2) + parseInt(valorProductos2)
        setTotalPedido(total);
        setSaldoTotal(total - abonoTotal2)
        valorTotal = parseInt(valorProductos2) + parseInt(fleteCobrado2);
    }

    const handleTransportadora = (event) => {


        if (event.target.value == 4) {
            $("#preguntaIncluir").prop({ 'disabled': false });
        }

        setDepartamento(departamentosArray);
        setCiudadSinCobertura(false);

        $(".datEnvio2").show();
        $(".fleteCotizado").hide();
        if ($("#preguntaIncluir").prop('checked')) {
            console.log("entro a estos ladscsd");
            $(".fleteCotizado").show();
        }


        $("#telefonoDireccion").removeClass("col-12").addClass("col-6");
        $("#ciudadDestinatario").val(0)
        $("#departamentoDestinatario").val(0)
        setFlete(0);
        setFleteCobrado(0);
        fleteCobrado2 = 0;
        let total = parseInt(fleteCobrado2) + parseInt(valorProductos2)
        setTotalPedido(total);
        setSaldoTotal(total - abonoTotal2)
        valorTotal = parseInt(valorProductos2) + parseInt(fleteCobrado2);

        $("#divpreguntaIncluir").show()
        $("#divPreguntaOficina").hide();
        $("#preguntaOficina").prop({ 'checked': false });

        transportadorasData.map((transportadora, i) => {
            if (transportadora.id == event.target.value) {
                setLabelTransportadora(transportadora.nombre)
                if (transportadora.ciudades == 0) {
                    $("#telefonoDireccion").removeClass("col-6").addClass("col-12");
                    $(".fleteCotizado").hide();
                    $(".datEnvio2").hide();
                }
                if (transportadora.incluirFlete == 0) {
                    $("#divpreguntaIncluir").hide()
                    $("#preguntaIncluir").prop({ 'checked': false });
                }
                if (transportadora.coberturaTotal == 0) {
                    let departamentosCubiertos = [];
                    for (var e = departamentosArray.length - 1; e >= 0; e--) {
                        for (var i = transportadora.ciudadesCobertura.length - 1; i >= 0; i--) {
                            if (transportadora.ciudadesCobertura[i].tipo == 1 && departamentosArray[e].id == transportadora.ciudadesCobertura[i].departamento) {
                                departamentosCubiertos.push(departamentosArray[e]);
                            }
                        }
                    }
                    setDepartamento(departamentosCubiertos);

                    $(".divpreguntaIncluir").hide()
                }
                if (transportadora.oficina == 1) {
                    $("#divPreguntaOficina").show();
                }
            }
        })
        transportadoraPedido = event.target.value;
        setTransportadora(event.target.value);
    }

    const formatNumberWithThousandSeparator = (number) => {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const handleRadioTipoPedido = (event) => {
        tipoDePedido = parseInt(event.target.value);
        setFleteCobrado(0);
        fleteCobrado2 = 0;
        setFlete(0);
        $("#comprobantesDiv").hide();
        $(".fleteCotizado").show();
        $(".datEnvio2").show();
        $('#selectTransportadora').html('')
        $(".selectTransportadora").show();
        $("#telefonoDireccion").removeClass("col-12").addClass("col-6");
        setTransportadora(0);
        setLabelTransportadora("");
        setTipoEnvio(2);
        transportadoraPedido = 0;
        if ($("#preguntaIncluir").prop('checked')) {
            setTipoEnvio(1);
        }
        $("#preguntaIncluir").prop({ 'disabled': false });
        tiposPedidos.map((tipo, i) => {
            if (tipo.id == tipoDePedido) {
                //necesita comprobantes
                if (tipo.comprobantes == 1) {
                    $("#comprobantesDiv").show();
                }

                //tiene que llevar el flete
                if (tipo.fleteIncluido == 1) {
                    setTipoEnvio(3);
                    $("#preguntaIncluir").prop({ 'disabled': true, 'checked': true });
                }

                //no necesita ciudad para el destinatario
                if (tipo.ciudadDestinatario == 0) {
                    $("#telefonoDireccion").removeClass("col-6").addClass("col-12");
                    $(".fleteCotizado").hide();
                    $(".selectTransportadora").hide();
                    $(".datEnvio2").hide();
                }

                //define las transportadoras disponibles
                $('#selectTransportadora').append('<option selected value="0">--- Selecciona ---</option>')
                for (var i = 0; i < tipo.transportadoras.length; i++) {
                    $('#selectTransportadora').append('<option value="' + tipo.transportadoras[i].id + '">' + tipo.transportadoras[i].nombre + '</option>')
                }
            }
        })
        if ($('#ciudadDestinatario').find(':selected').val() != 0) {
            cotizarEnvio();
        }
        setTipoPedido(parseInt(event.target.value));
    };

    useEffect(() => {

        // Este useEffect se ejecutará cada vez que linkQR cambie
        if (linkQR) {
            if (imprimirOrden == 0) {
                //mandamos a imprimir la orden
                printDocument()
                imprimirOrden = 1;
            }
        }

        if (cargoSite == 0) {
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

                usuarioId = decodedToken.payload.user;
                usuarioProducto = decodedToken.payload.userWeb;


                $(".navbar").hide();
                cargarModalidadPedido();
                cargarCiudades();
                cargarProductos();
                calcularFechaDespacho();

                fechaSubida2 = new Date();
                setFechaSubida(formatSpanishDate2(fechaSubida2));
                handleBuscadorCRM2("");

                cargoSite = 1;

                import('jquery-validation').then(() => {
                    $('#formRegistroTercero').validate({
                        rules: {
                            documento: {
                                required: true,
                                number: true
                            },
                            digitoDocumento: {
                                required: true,
                                number: true
                            },
                            nombre: {
                                required: true
                            },
                            nombreComercial: {
                                required: true
                            },
                            nombreContacto: {
                                required: true
                            },
                            telefonoContacto: {
                                required: true,
                                number: true
                            },
                            priNombre: {
                                required: true
                            },
                            priApellido: {
                                required: true
                            },
                            direccion: {
                                required: true
                            },
                            departamento: {
                                required: true
                            },
                            ciudad: {
                                required: true
                            },
                            celular: {
                                required: true,
                                number: true
                            },
                            correo: {
                                required: true,
                                email: true,
                            }
                        },
                        messages: {
                            documento: {
                                required: "Campo Obligatorio",
                                number: "Solo Numeros"
                            },
                            digitoDocumento: {
                                required: "Campo Obligatorio",
                                number: "Solo Numeros"
                            },
                            nombre: {
                                required: "Campo Obligatorio",
                            },
                            nombreComercial: {
                                required: "Campo Obligatorio",
                            },
                            nombreContacto: {
                                required: "Campo Obligatorio",
                            },
                            telefonoContacto: {
                                required: "Campo Obligatorio",
                                number: "Solo Numeros"
                            },
                            priNombre: {
                                required: "Campo Obligatorio",
                            },
                            priApellido: {
                                required: "Campo Obligatorio",
                            },
                            direccion: {
                                required: "Campo Obligatorio",
                            },
                            departamento: {
                                required: "Campo Obligatorio",
                            },
                            ciudad: {
                                required: "Campo Obligatorio",
                            },
                            celular: {
                                required: "Campo Obligatorio",
                                number: "Solo Numeros"
                            },
                            correo: {
                                required: "Campo Obligatorio",
                                email: "Formato no valido"
                            }
                        },
                        submitHandler: async (form, event) => {

                            event.preventDefault();

                            // Acción cuando el formulario es válido
                            const swalWithReact = withReactContent(Swal);
                            swalWithReact.fire({
                                title: "Registrando",
                                text: "Por favor, espera un momento...",
                                icon: "info",
                                showConfirmButton: true, // Ocultar el botón de confirmación
                                allowOutsideClick: false // Evitar cerrar el SweetAlert haciendo clic fuera de él
                            });

                            await axios.post(process.env.ENDPOINT_API + '/apoyoTSU/registroTercero', {

                                data: $("#formRegistroTercero").serialize()

                            }).then(response => {

                                if (response.data.bandera == 0) {

                                    $("#formRegistroTercero")[0].reset();
                                    $("#accordion2").click();
                                    withReactContent(Swal).fire({
                                        title: "Registrado",
                                        text: "Cliente registrado",
                                        icon: "success",
                                        showConfirmButton: false, // Ocultar el botón de confirmación
                                        timer: 2000 // Cerrar automáticamente después de 2 segundos
                                    });
                                    cargarTercero(response.data.id)

                                } else {

                                    // Manejar el error aquí
                                    withReactContent(Swal).fire({
                                        title: "Error",
                                        text: "Comunica con soporte (registro de tercero)",
                                        icon: "error"
                                    })
                                }
                            }).catch(error => {

                                // Manejar el error aquí
                                withReactContent(Swal).fire({
                                    title: "Error",
                                    text: "Comunica con soporte (registro de tercero)",
                                    icon: "error"
                                })

                            });
                        }
                    })
                })
            }

        }
    })

    //calcula la posible fecha de despacho
    async function calcularFechaDespacho() {

        await axios.post(process.env.ENDPOINT_API + '/apoyoTSU/calcularFechaDeDespacho').then(response => {
            fechaDespacho2 = new Date(response.data.fecha);
            setFechaDespacho(formatSpanishDate(fechaDespacho2));
        }).catch(error => {
            console.log(error);
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (validar fecha de despacho)",
                icon: "error"
            })
        });
    }

    const formatSpanishDate = (date) => {
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

    //carga las modalidades de pedido
    async function cargarModalidadPedido() {

        await axios.post(process.env.ENDPOINT_API + '/pedidos/modalidades').then(response => {

            for (var i = response.data.campana.length - 1; i >= 0; i--) {
                $("#selectCampana").append("<option value=" + response.data.campana[i].id + ">" + response.data.campana[i].name + "</option>")
            }

            for (var e = response.data.tipos.length - 1; e >= 0; e--) {
                if (response.data.tipos[e].default == 1) {
                    setTipoPedido(response.data.tipos[e].id)
                    if (response.data.tipos[e].comprobantes == 0) {
                        $("#comprobantesDiv").hide();
                    }
                    if (response.data.tipos[e].fleteIncluido == 1) {
                        $("#preguntaIncluir").prop({ 'disabled': true, 'checked': true });
                    }
                    $('#selectTransportadora').html("");
                    //define las transportadoras disponibles
                    $('#selectTransportadora').append('<option selected value="0">--- Selecciona ---</option>')
                    for (var i = 0; i < response.data.tipos[e].transportadoras.length; i++) {
                        $('#selectTransportadora').append('<option value="' + response.data.tipos[e].transportadoras[i].id + '">' + response.data.tipos[e].transportadoras[i].nombre + '</option>')
                    }
                }
            }
            transportadorasData = response.data.transportadoras;
            setEntidades(response.data.entidades);
            setTiposPedidos(response.data.tipos);

        }).catch(error => {
            console.log(error);
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (cargar modalidad pedido)",
                icon: "error"
            })
        });
    }
    //cargar las ciudades
    async function cargarCiudades() {
        await axios.post(process.env.ENDPOINT_API + '/apoyoTSU/ciudades').then(response => {

            departamentosArray = response.data.ciudades
            setDepartamento(departamentosArray);

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

    //carga los productos de carrito
    async function cargarProductos() {
        await axios.post(process.env.ENDPOINT_API + '/apoyoTSU/productosCarrito', {
            usuario: usuarioProducto,
            offset: offsetProducto
        }).then(response => {


            if (response.data.data.length > 0) {
                let producto = response.data.data[0];
                producto.cupon = 0;
                producto.comisionOriginal = producto.comision;
                producto.tamanoLabel = producto.dataSiigo['labelPagina'];

                producto.precioPublico = parseInt(producto.dataValidaciones['precioPublico']);


                if (producto.cantidadSeparadores > 0) {
                    producto.precioPublico += parseInt(producto.valorSeparadores)
                }

                if (producto.precioContra > 0) {
                    producto.precioPublico += 5000;
                }

                //CALCULA EL PRECIO MINIMO ACEPTABLE
                producto.precioMinimo = parseInt(producto.dataValidaciones['precioPublico']) - (parseInt(producto.dataValidaciones['precioPublico']) * parseInt(producto.dataValidaciones['precioMinimo']) / 100);


                producto.precioCobrado = producto.precioPublico;
                producto.precioComision = (producto.precioPublico * (producto.comision / 100))

                if (producto.precioComision > 0) {
                    totalComision2 += producto.precioComision * producto.cantidad;
                    setTotalComision(totalComision2);
                }


                setProductos(prevFiles => [...prevFiles, producto]);
                productosFin.push(producto);

                valorProductos2 += parseInt(producto.precioPublico) * parseInt(producto.cantidad);
                valorTotal = valorProductos2 + parseInt(fleteCobrado2);
                saldoTotal2 = valorTotal - parseInt(abonoTotal2) - descuentoTotal2;
                setBanderaDescuento500(false);
                if (descuentoTotal2 > 0 && idCupoPedido == 0) {
                    descuentoTotal2 = 0;
                    setDescuentoTotal(0);
                }
                if (saldoTotal2 <= 500 && saldoTotal2 > 0 && idCupoPedido == 0) {
                    setBanderaDescuento500(true);
                }
                setTotalPedido(valorTotal);
                setSaldoTotal(saldoTotal2);
                setValorProductos(valorProductos2);
                cargarImagenesProducto(producto.id, 1)

                cantidadProductos2 += producto.cantidad;
                setCantidadProductos(cantidadProductos2);
                offsetProducto += 1;
                cargarProductos()
            }




        }).catch(error => {
            console.log(error);
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (cargar productos)",
                icon: "error"
            })
        });
    }

    async function convertImageToBase64(url, producto) {
        const parts = url.split('/'); // Divide la URL en partes
        if (parts[0] == "https:") {
            let stringImg = "";
            for (var i = 3; i < parts.length; i++) {
                stringImg += parts[i];
                if (i < parts.length - 1) {
                    if (isNaN(parts[i + 1]) == false) {
                        stringImg += "-"
                    }
                }
            }
            const fileName = parts[parts.length - 1];

            const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
            const targetUrl = 'https://tressonunobeta.com/codificarImgBase64/disenos-biblias-pastafina-463.jpg';


            await axios.get(targetUrl).then(response => {

                $("#imagenesProducto-" + producto).append("<div class='col-2'><img src='" + response.data + "'></img></div>");
                $("#imagenesProducto2-" + producto).append("<div class='col-3'><img src='" + response.data + "'></img></div>");
                $("#imagenesProducto3-" + producto).append("<div class='col-3'><img src='" + response.data + "'></img></div>");

            })
        } else {
            $("#imagenesProducto-" + producto).append("<div class='col-2'><img src='" + url + "'></img></div>");
            $("#imagenesProducto2-" + producto).append("<div class='col-3'><img src='" + url + "'></img></div>");
            $("#imagenesProducto3-" + producto).append("<div class='col-3'><img src='" + url + "'></img></div>");
        }
    }

    //cargar las imagenes del producto
    async function cargarImagenesProducto(producto, lado) {

        await axios.post(process.env.ENDPOINT_API + '/apoyoTSU/imagenProducto', {
            producto: producto,
            lado: lado
        }).then(response => {

            $("#imagenesProducto-" + response.data.producto).append("<div class='col-2'><img src='" + response.data.imagen + "'></img></div>");
            if (response.data.productoTienda == 17) {
                $("#imagenesProducto2-" + response.data.producto).append("<div class='col-4'><img src='" + response.data.imagen + "'></img></div>");
            } else {
                $("#imagenesProducto2-" + response.data.producto).append("<div class='col-4'><img src='" + response.data.imagen + "'></img></div>");
            }

            $("#imagenesProducto3-" + response.data.producto).append("<div class='col-3'><img src='" + response.data.imagen + "'></img></div>");
            if (response.data.nexLado != 0) {
                cargarImagenesProducto(response.data.producto, response.data.nexLado)
            }
        }).catch(error => {
            console.log(error);
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (cargar imagenes productos)",
                icon: "error"
            })
        });
    }

    //cotizar envio
    async function cotizarEnvio() {

        let consultaApi = false;
        transportadorasData.map((transportadora, i) => {
            if (transportadora.id == transportadoraPedido) {
                if (transportadora.api == 1) {
                    consultaApi = true;
                } else {
                    for (var i = transportadora.ciudadesCobertura.length - 1; i >= 0; i--) {
                        if (transportadora.ciudadesCobertura[i].tipo == 2 && ciudadPedido == transportadora.ciudadesCobertura[i].ciudadDane) {
                            let valor = transportadora.ciudadesCobertura[i].flete;
                            fletePedido = valor;
                            fleteCobrado2 = valor;
                            setFlete(valor);
                            const formattedValue = formatNumberWithThousandSeparator(valor);
                            setFleteCobrado(formattedValue);
                            let total = parseInt(fleteCobrado2) + parseInt(valorProductos2)
                            setTotalPedido(total);
                            valorTotal = valorProductos2 + parseInt(fleteCobrado2);
                            saldoTotal2 = total - abonoTotal2 - descuentoTotal2
                            setSaldoTotal(saldoTotal2);
                        }
                    }
                }

            }
        })

        if (consultaApi) {

            await axios.post(process.env.ENDPOINT_API + '/apoyoTSU/cotizarFlete', {
                transportadora: transportadoraPedido,
                peso: pesoPedido,
                ciudad: ciudadPedido
            }).then(response => {

                var porcentaImpuesto = 0;
                if (response.data.impuestos.length > 0) {
                    porcentaImpuesto = response.data.impuestos[0].valor;
                }
                if (response.data.transportadora == 1) {
                    var tcc = JSON.parse(response.data.data);
                    if (tcc[0]['consultarliquidacionResult']['idliquidacion'] == undefined) {
                        setCiudadSinCobertura(true);

                        setFlete(0);
                        setFleteCobrado(0);
                        fleteCobrado2 = 0;
                        fletePedido = 0;
                        let total = parseInt(fleteCobrado2) + parseInt(valorProductos2)
                        //saldo pedido
                        saldoTotal2 = total - abonoTotal2 - descuentoTotal2
                        valorTotal = valorProductos2 + parseInt(fleteCobrado2);
                        setTotalPedido(total);
                        setSaldoTotal(saldoTotal2);
                    } else {
                        setCiudadSinCobertura(false);
                        let valor = parseInt(tcc[0]['consultarliquidacionResult']['total']['totaldespacho'])

                        //le sumamos el impuesto
                        if (porcentaImpuesto > 0) {
                            valor += (valor * (porcentaImpuesto / 100))
                        }
                        valor = Math.floor(valor);
                        fletePedido = valor;
                        fleteCobrado2 = valor;
                        setFlete(valor);
                        const formattedValue = formatNumberWithThousandSeparator(valor);
                        setFleteCobrado(formattedValue);
                        let total = parseInt(fleteCobrado2) + parseInt(valorProductos2)
                        setTotalPedido(total);
                        valorTotal = valorProductos2 + parseInt(fleteCobrado2);
                        saldoTotal2 = total - abonoTotal2 - descuentoTotal2
                        setSaldoTotal(saldoTotal2);
                    }
                }


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
        //mensajero
        /*if(transportadoraPedido == 4){
            
            let valor = 10000;
            fletePedido = valor;
            fleteCobrado2 = valor;
            setFlete(valor);
            const formattedValue = formatNumberWithThousandSeparator(valor);
            setFleteCobrado(formattedValue);
            let total = parseInt(fleteCobrado2)+parseInt(valorProductos2)
            setTotalPedido(total);
            valorTotal = valorProductos2+parseInt(fleteCobrado2);
            saldoTotal2 = total - abonoTotal2 - descuentoTotal2
            setSaldoTotal(saldoTotal2);
        
        }else{

            await axios.post(process.env.ENDPOINT_API+'/apoyoTSU/cotizarFlete',{ 
                transportadora: transportadoraPedido,
                peso: pesoPedido,
                ciudad: ciudadPedido 
            }).then(response => {

                var porcentaImpuesto = 0;
                if(response.data.impuestos.length > 0){
                    porcentaImpuesto = response.data.impuestos[0].valor;
                } 
                if(response.data.transportadora == 1){
                    var tcc = JSON.parse(response.data.data);
                    if(tcc[0]['consultarliquidacionResult']['idliquidacion'] == undefined){
                        setFlete(0);
                        setFleteCobrado(0);
                        fleteCobrado2 = 0;
                        fletePedido = 0;
                        let total = parseInt(fleteCobrado2)+parseInt(valorProductos2)
                        //saldo pedido
                        saldoTotal2 = total - abonoTotal2 - descuentoTotal2
                        valorTotal = valorProductos2+parseInt(fleteCobrado2);
                        setTotalPedido(total);
                        setSaldoTotal(saldoTotal2);
                    }else{
                        let valor = parseInt(tcc[0]['consultarliquidacionResult']['total']['totaldespacho'])
                        
                        //le sumamos el impuesto
                        if(porcentaImpuesto > 0){
                            valor += (valor*(porcentaImpuesto/100))
                        }
                        valor = Math.floor(valor);
                        fletePedido = valor;
                        fleteCobrado2 = valor;
                        setFlete(valor);
                        const formattedValue = formatNumberWithThousandSeparator(valor);
                        setFleteCobrado(formattedValue);
                        let total = parseInt(fleteCobrado2)+parseInt(valorProductos2)
                        setTotalPedido(total);
                        valorTotal = valorProductos2+parseInt(fleteCobrado2);
                        saldoTotal2 = total - abonoTotal2 - descuentoTotal2
                        setSaldoTotal(saldoTotal2);
                    }
                }
            

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
        
        }*/
    }

    //cambio de direccion
    const handleDatosEnvio = () => {
        var result = $("#nombreDestinatario").val();
        if ($("#nombreDestinatario").val().length > 0 && $("#documentoDestinatario").val().length > 0) {
            result += " - " + formatearNumeroConPuntos($("#documentoDestinatario").val())
        }
        if ($("#telefonoDestinatario").val().length > 0) {
            result += " (" + formatearNumeroCelular($("#telefonoDestinatario").val()) + ") ";
        }
        result += "<br>";
        result += $("#direccionEnvio").val();
        if ($("#observacionEnvio").val().length > 0) {
            result += ' "' + $("#observacionEnvio").val() + '" ';
        }
        if ($('#ciudadDestinatario').find(':selected').val() != 0) {
            ciudadPedido = $('#ciudadDestinatario').val();
            setFlete(0);
            setFleteCobrado(0);
            fleteCobrado2 = 0;
            let total = parseInt(fleteCobrado2) + parseInt(valorProductos2)
            setTotalPedido(total);
            setSaldoTotal(total - abonoTotal2)
            setCiudadSinCobertura(false);
            cotizarEnvio();
            result += "<br>" + $('#ciudadDestinatario').find(':selected').html() + " - " + $('#departamentoDestinatario').find(':selected').html()
        }

        if (result.length > 0) {
            $("#resultDireccion").show();
        } else {
            $("#resultDireccion").hide();
        }

        $("#resultDireccion").html(result);
    }

    function formatearNumeroConPuntos(numero) {
        return numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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

    //cambio de tipo de documento
    const handleChangeTypoDocumento = (event) => {
        if (event.target.value == 2) {
            //numero de documento
            $(".digNit3").removeClass('col-md-6').addClass('col-md-4');
            $(".digNit").show();
            //genero y fecha de nacimiento
            $(".nitDatos").hide();
            $(".digNit2").removeClass('col-md-3').addClass('col-md-6');
            //nombres
            $(".nombres2").show();
            $(".nombres").hide();
        } else {
            //numero de documento
            $(".digNit3").removeClass('col-md-4').addClass('col-md-6');
            $(".digNit").hide();
            //genero y fecha de nacimiento
            $(".nitDatos").show();
            $(".digNit2").removeClass('col-md-6').addClass('col-md-3');
            //nombres
            $(".nombres2").hide();
            $(".nombres").show();
        }
    }

    // cambio de ciudad del tercero
    const handleChangeDepartamento2 = (event) => {
        $("#ciudadTercero").val("")
        setCiudades2([]);
        var arrayCiudades = [];
        for (var e = departamentosArray.length - 1; e >= 0; e--) {
            if (departamentosArray[e].id == event.target.value) {
                departamentosArray[e].ciudades2.split(",").forEach(function (element) {
                    arrayCiudades.push({ id: element.split(":")[0], nombre: element.split(":")[1] })
                })
            }
        }
        setCiudades2(arrayCiudades);
    }

    // cambio de ciudad
    const handleChangeDepartamento = (event) => {
        $("#ciudadDestinatario").val(0)
        setFlete(0);
        setFleteCobrado(0);
        fleteCobrado2 = 0;
        setCiudades([]);
        let ciudadesConCovertura = [];
        let cubrimientoTotal = true

        transportadorasData.map((transportadora, i) => {
            if (transportadora.id == transportadoraPedido) {
                if (transportadora.coberturaTotal == 0) {
                    cubrimientoTotal = false;
                    let departamentosCubiertos = [];
                    for (var e = departamentosArray.length - 1; e >= 0; e--) {
                        if (departamentosArray[e].id == event.target.value) {
                            //extrae las ciudades del departamento
                            for (var i = transportadora.ciudadesCobertura.length - 1; i >= 0; i--) {
                                if (transportadora.ciudadesCobertura[i].tipo == 2 && departamentosArray[e].id == transportadora.ciudadesCobertura[i].departamento) {
                                    ciudadesConCovertura.push(transportadora.ciudadesCobertura[i].ciudad);
                                }
                            }
                        }
                    }
                }
            }
        })

        var arrayCiudades = [];
        for (var e = departamentosArray.length - 1; e >= 0; e--) {
            if (departamentosArray[e].id == event.target.value) {
                departamentosArray[e].ciudades2.split(",").forEach(function (element) {
                    if (cubrimientoTotal == false) {
                        if (ciudadesConCovertura.includes(element.split(":")[1])) {
                            arrayCiudades.push({ id: element.split(":")[0], nombre: element.split(":")[1] })
                        }
                    } else {
                        arrayCiudades.push({ id: element.split(":")[0], nombre: element.split(":")[1] })
                    }
                })
            }
        }
        setCiudadSinCobertura(false);
        setCiudades(arrayCiudades);
        handleDatosEnvio();
    }

    //buscador de datos de facturacion
    const handleBuscadorFacturacion = (event) => {
        clearTimeout(controladorTiempo);
        controladorTiempo = setTimeout(() => handleBuscadorFacturacion2(event.target.value), 100);
    }

    //buscador de contactos de CRM
    const handleBuscadorCRM = (event) => {
        clearTimeout(controladorTiempo);
        controladorTiempo = setTimeout(() => handleBuscadorCRM2(event.target.value), 100);
    }

    //cargando los datos del cliente de CRM
    async function cargarClienteCRM(data) {

        data.number = data.number.replace(/\D/g, '');
        data.name = data.name;
        if (data.name == 'undefined') {
            data.name = data.pushName;
        }
        if(data.type == 2){
            data.name += '(Whatsapp cloud)'
        }

        $("#resultCRM").show();
        $("#resultCRM").html(data.name + "<br>+" + formatearNumeroCelular2(data.number))
        $("#collapse5").removeClass("show");
        $("#buscadorClienteCRM").val("");
        idClienteCRM = data.id;
        typeClienteCRM = data.type;
        handleBuscadorCRM2("");

        /*const swalWithReact = withReactContent(Swal);
        swalWithReact.fire({
            title: "Consultando",
            text: "Por favor, espera un momento...",
            icon: "info",
            showConfirmButton: false, // Ocultar el botón de confirmación
            allowOutsideClick: false // Evitar cerrar el SweetAlert haciendo clic fuera de él
        });

        await axios.post(process.env.ENDPOINT_API + '/apoyoTSU/cargarClienteCRM', {
            id: id
        }).then(response => {

            if (response.data.data.length == 0) {

                // Manejar el error aquí
                withReactContent(Swal).fire({
                    title: "Error",
                    text: "Comunica con soporte (cargar informacion clientes - 2)",
                    icon: "error"
                })

            } else {

                idCupoPedido = 0;
                descuentoTotal2 = 0;
                valorTotal = valorProductos2 + parseInt(fleteCobrado2);
                saldoTotal2 = valorTotal - parseInt(abonoTotal2) - descuentoTotal2;
                setSaldoTotal(saldoTotal2);
                setDescuentoTotal(descuentoTotal2);
                if (response.data.cupon.length > 0) {
                    idCupoPedido = response.data.cupon[0].id;
                    //porcentaje de descuento
                    if (response.data.cupon[0].typeCalculo == 1) {
                        descuentoTotal2 = parseInt(valorProductos2) * parseInt(response.data.cupon[0].valor) / 100;
                    }
                    //valor fijo
                    if (response.data.cupon[0].typeCalculo == 2) {
                        descuentoTotal2 = parseInt(response.data.cupon[0].valor);
                    }
                    saldoTotal2 -= descuentoTotal2;
                    setSaldoTotal(saldoTotal2);
                    setDescuentoTotal(descuentoTotal2);
                }

                response.data.data[0].number = response.data.data[0].number.replace(/\D/g, '');
                response.data.data[0].name = response.data.data[0].name;
                if (response.data.data[0].name == 'undefined') {
                    response.data.data[0].name = response.data.data[0].pushName;
                }

                $("#resultCRM").show();
                $("#resultCRM").html(response.data.data[0].name + "<br>+" + formatearNumeroCelular2(response.data.data[0].number))
                $("#collapse5").removeClass("show");
                $("#buscadorClienteCRM").val("");
                idClienteCRM = id;
                handleBuscadorCRM2("");
                Swal.close();

            }

        }).catch(error => {
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (cargar informacion cliente CRM)",
                icon: "error"
            })
        });*/

    }

    //cargar los datos de un tercero
    async function cargarTercero(id) {

        const swalWithReact = withReactContent(Swal);
        swalWithReact.fire({
            title: "Consultando",
            text: "Por favor, espera un momento...",
            icon: "info",
            showConfirmButton: false, // Ocultar el botón de confirmación
            allowOutsideClick: false // Evitar cerrar el SweetAlert haciendo clic fuera de él
        });

        await axios.post(process.env.ENDPOINT_API + '/apoyoTSU/cargarTercero', {
            id: id
        }).then(response => {

            if (response.data.data.length == 0) {

                // Manejar el error aquí
                withReactContent(Swal).fire({
                    title: "Error",
                    text: "Comunica con soporte (cargar informacion tercero - 2)",
                    icon: "error"
                })

            } else {

                idFacturacion = id;
                $("#searchFacturacion").val("");
                $("#resultFacturacion").show();
                $("#collapse2").removeClass("show");
                $("#resultFacturacion").html(formatearNumeroConPuntos(response.data.data[0].noDoc) + "<br>" + response.data.data[0].priNombre + " " + response.data.data[0].segNombre + " " + response.data.data[0].priApellido + " " + response.data.data[0].segApellido + "<br>" + response.data.data[0].correo)
                Swal.close();
                setSearchResultsTercero([]);

            }

        }).catch(error => {
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (cargar informacion tercero)",
                icon: "error"
            })
        });
    }

    async function handleBuscadorCRM2(val) {
        await axios.post(process.env.ENDPOINT_API2 + '/api/ticket/ticketsPago', {
            search: val,
            usuario: usuarioId
        }).then(response => {

            for (var e = response.data.data.length - 1; e >= 0; e--) {
                response.data.data[e].number = response.data.data[e].number.replace(/\D/g, '');
                response.data.data[e].name = response.data.data[e].name;
                if (response.data.data[e].name == 'undefined') {
                    response.data.data[e].name = response.data.data[e].pushName;
                }
            }
            setSearchResultsCRM(response.data.data);

        }).catch(error => {
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (consultar tercero)",
                icon: "error"
            })
        });
    }

    async function handleBuscadorFacturacion2(val) {

        await axios.post(process.env.ENDPOINT_API + '/apoyoTSU/buscarTercero', {
            search: val
        }).then(response => {
            if (response.data.data.length === 0) {
                setSearchResultsTercero([{ message: 'NO SE ENCONTRARON REGISTROS.' }]);
            } else {
                for (var e = response.data.data.length - 1; e >= 0; e--) {
                    response.data.data[e].noDoc = formatearNumeroConPuntos(response.data.data[e].noDoc);
                }

                setSearchResultsTercero(response.data.data);
            }
        }).catch(error => {
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (consultar tercero)",
                icon: "error"
            })
        });
    }

    const formattedPrice = (value) => {
        if (typeof value !== 'number') {
            value = Number(value);
        }
        return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    const handleCheckboxTipoEnvio = (event) => {

        if (event.target.checked) {
            setTipoEnvio(1);
            if (ciudadPedido != 0) {
                cotizarEnvio();
            }
            $(".fleteCotizado").show();
        } else {
            setFleteCobrado(0);
            fleteCobrado2 = 0;
            setFlete(0);
            $(".fleteCotizado").hide();
            //total pedido
            let total = parseInt(fleteCobrado2) + parseInt(valorProductos2)
            setTotalPedido(total);
            //saldo pedido
            saldoTotal2 = total - abonoTotal2 - descuentoTotal2

            setBanderaDescuento500(false);
            if (descuentoTotal2 > 0 && idCupoPedido == 0) {
                descuentoTotal2 = 0;
                setDescuentoTotal(0);
            }
            if (saldoTotal2 <= 500 && saldoTotal2 > 0 && idCupoPedido == 0) {
                setBanderaDescuento500(true);
            }

            setSaldoTotal(saldoTotal2);
            setTipoEnvio(2);
        }
    }

    const handleChangeFile = (file) => {
        file.rutaPreview = URL.createObjectURL(file);
        file.entidad = "1";
        file.fecha = "";
        file.valor = "0";
        arrayFile.push(file);
        setFile(prevFiles => [...prevFiles, file]);
    }

    const handleChangeEntidad = (index, event) => {
        let div = "";
        arrayFile.map((file, i) => {
            if (i === index) {
                arrayFile[i].entidad = event.target.value;
            }
            div += (i + 1) + ". ";
            if (arrayFile[i].entidad == 1) {
                div += "Bancolombia";
            }
            if (arrayFile[i].entidad == 2) {
                div += "Davivienda";
            }
            if (arrayFile[i].entidad == 3) {
                div += "Epayco";
            }
            if (arrayFile[i].entidad == 4) {
                div += "Efectivo";
            }
            div += " (" + formatFecha(arrayFile[i].fecha) + ") " + formattedPrice(arrayFile[i].valor)
        });
        $("#resultComprobantes").show().html(div);

    }

    const handleChangeFecha = (index, event) => {
        let div = "";
        arrayFile.map((file, i) => {
            if (i === index) {
                arrayFile[i].fecha = event.target.value;
            }
            div += (i + 1) + ". ";
            if (arrayFile[i].entidad == 1) {
                div += "Bancolombia";
            }
            if (arrayFile[i].entidad == 2) {
                div += "Davivienda";
            }
            if (arrayFile[i].entidad == 3) {
                div += "Epayco";
            }
            if (arrayFile[i].entidad == 4) {
                div += "Efectivo";
            }
            div += " (" + formatFecha(arrayFile[i].fecha) + ") " + formattedPrice(arrayFile[i].valor)
        });
        $("#resultComprobantes").show().html(div);
    }

    const handleChangeValor = (index, event) => {
        let value = event.target.value.replace(/\./g, '');
        abonoTotal2 = 0;
        let div = "";
        arrayFile.map((file, i) => {
            if (i === index) {
                arrayFile[i].valor = value;
            }
            div += (i + 1) + ". ";
            if (arrayFile[i].entidad == 1) {
                div += "Bancolombia";
            }
            if (arrayFile[i].entidad == 2) {
                div += "Davivienda";
            }
            if (arrayFile[i].entidad == 3) {
                div += "Epayco";
            }
            if (arrayFile[i].entidad == 4) {
                div += "Efectivo";
            }
            div += " (" + formatFecha(arrayFile[i].fecha) + ") " + formattedPrice(arrayFile[i].valor)
            abonoTotal2 += parseInt(arrayFile[i].valor);
        });
        $("#resultComprobantes").show().html(div);
        setAbonoTotal(abonoTotal2);
        saldoTotal2 = valorTotal - abonoTotal2 - descuentoTotal2;
        setBanderaDescuento500(false);
        if (descuentoTotal2 > 0 && idCupoPedido == 0) {
            descuentoTotal2 = 0;
            setDescuentoTotal(0);
        }
        if (saldoTotal2 <= 500 && saldoTotal2 > 0 && idCupoPedido == 0) {
            setBanderaDescuento500(true);
        }
        setSaldoTotal(saldoTotal2);
        event.target.value = formatNumberWithThousandSeparator(value);
    }

    const handleCobroProducto = (index, event) => {
        let value = event.target.value.replace(/\./g, '');
        let comision = 0;
        let banderaCupon = 0;
        valorProductos2 = 0;
        totalComision2 = 0;
        productosFin.map((producto, i) => {
            if (i === index) {
                productosFin[i].precioCobrado = value;
                if (productosFin[i].cupon == 1) {
                    productosFin[i].cupon = 0;
                    productosFin[i].dataCupon = 0;
                    productosFin[i].comision = productosFin[i].comisionOriginal;
                }
                comision = productosFin[i].comision;
                if (productosFin[i].precioCobrado < producto.precioPublico) {
                    $("#cobroProducto-" + productosFin[i].id).css({ "background-color": "#ffafaf", "border-color": "red" });
                } else {
                    $("#cobroProducto-" + productosFin[i].id).css({ "background-color": "white", "border-color": "#d9dee3" });
                }
            }
            valorProductos2 += parseInt(productosFin[i].precioCobrado) * parseInt(productosFin[i].cantidad);
            if (comision > 0) {
                totalComision2 += (parseInt(productosFin[i].precioCobrado) * (comision / 100)) * productosFin[i].cantidad;
            }
        })




        valorTotal = valorProductos2 + parseInt(fleteCobrado2);
        saldoTotal2 = valorTotal - abonoTotal2 - descuentoTotal2;
        setBanderaDescuento500(false);
        if (descuentoTotal2 > 0 && idCupoPedido == 0) {
            descuentoTotal2 = 0;
            setDescuentoTotal(0);
        }
        if (saldoTotal2 <= 500 && saldoTotal2 > 0 && idCupoPedido == 0) {
            setBanderaDescuento500(true);
        }
        setTotalPedido(valorTotal);
        setSaldoTotal(saldoTotal2);
        setValorProductos(valorProductos2);
        setTotalComision(totalComision2);


        const newProductos = [...productos];
        newProductos[index].precioCobrado = value;
        if (Math.trunc(value * (comision / 100)) > 1) {
            newProductos[index].precioComision = Math.trunc(value * (comision / 100));
        } else {
            newProductos[index].precioComision = 0;
        }
        newProductos[index].cupon = 0;
        newProductos[index].codigoCupon = 0;
        newProductos[index].comision = comision;
        setProductos(newProductos);
    }

    const handleChangeProducto = (index, event) => {

        cantidadProductos2 = 0;
        valorProductos2 = 0;
        totalComision2 = 0;
        productosFin.map((producto, i) => {
            if (i === index) {
                productosFin[i].cantidad = parseInt(event.target.value);
            }
            if (productosFin[i].cantidad > 0) {
                cantidadProductos2 += parseInt(productosFin[i].cantidad);
                valorProductos2 += parseInt(productosFin[i].precioCobrado) * parseInt(productosFin[i].cantidad);
            }
            if (productosFin[i].precioComision > 0) {
                totalComision2 += productosFin[i].precioComision * productosFin[i].cantidad;
            }
        })
        setTotalComision(totalComision2);
        setCantidadProductos(cantidadProductos2);

        const newProductos = [...productos];
        newProductos[index].cantidad = event.target.value;
        setProductos(newProductos);

        valorTotal = valorProductos2 + parseInt(fleteCobrado2);
        saldoTotal2 = valorTotal - abonoTotal2 - descuentoTotal2;
        setBanderaDescuento500(false);
        if (descuentoTotal2 > 0 && idCupoPedido == 0) {
            descuentoTotal2 = 0;
            setDescuentoTotal(0);
        }
        if (saldoTotal2 <= 500 && saldoTotal2 > 0 && idCupoPedido == 0) {
            setBanderaDescuento500(true);
        }
        setTotalPedido(valorTotal);
        setSaldoTotal(saldoTotal2);
        setValorProductos(valorProductos2);
    }

    const handleEliminarComprobante = (index, event) => {
        const swalWithReact = withReactContent(Swal);
        swalWithReact.fire({
            title: "Confirmación",
            html: "¿Esta segur@ de eliminar el comprobante?",
            showCancelButton: true,
            confirmButtonText: "Si", // Texto personalizado para el botón de confirmación
            cancelButtonText: "No", // Texto personalizado para el botón de cancelación
            allowOutsideClick: false
        }).then(async (result) => {
            // Aquí puedes continuar con el flujo normal si el usuario seleccionó una opción válida
            if (result.isConfirmed) {
                setFile(prevFiles => prevFiles.filter((_, i) => i !== index));
                arrayFile = arrayFile.filter((_, i) => i !== index)

                let div = "";
                abonoTotal2 = 0;
                arrayFile.map((file, i) => {
                    div += (i + 1) + ". ";
                    if (arrayFile[i].entidad == 1) {
                        div += "Bancolombia";
                    }
                    if (arrayFile[i].entidad == 2) {
                        div += "Davivienda";
                    }
                    if (arrayFile[i].entidad == 3) {
                        div += "Epayco";
                    }
                    if (arrayFile[i].entidad == 4) {
                        div += "Efectivo";
                    }
                    div += " (" + formatFecha(arrayFile[i].fecha) + ") " + formattedPrice(arrayFile[i].valor)
                    abonoTotal2 += parseInt(arrayFile[i].valor);
                });

                $("#resultComprobantes").show().html(div);

                if (arrayFile.length == 0) {
                    $("#resultComprobantes").hide();
                }

                setAbonoTotal(abonoTotal2);
                saldoTotal2 = valorTotal - abonoTotal2 - descuentoTotal2;
                setBanderaDescuento500(false);
                if (descuentoTotal2 > 0 && idCupoPedido == 0) {
                    descuentoTotal2 = 0;
                    setDescuentoTotal(0);
                }
                if (saldoTotal2 <= 500 && saldoTotal2 > 0 && idCupoPedido == 0) {
                    setBanderaDescuento500(true);
                }
                setSaldoTotal(saldoTotal2);

            }
        })
    }

    async function pasarPedido() {


        if (productosFin.length == 0) {
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Debes tener por lo menos 1 producto",
                icon: "error"
            })
            return 1;
        }

        //validacion de direccion
        let banderaDireccion = true;
        tiposPedidos.map((tipo, i) => {
            if (tipo.id == tipoDePedido) {
                if (transportadoraPedido == 6) {
                    if ($("#nombreDestinatario").val().length == 0 || $("#telefonoDestinatario").val().length == 0) {
                        banderaDireccion = false;
                    }
                }
                else if (tipo.ciudadDestinatario == 0) {
                    if ($("#nombreDestinatario").val().length == 0 || $("#telefonoDestinatario").val().length == 0) {
                        banderaDireccion = false;
                    }
                } else {
                    if ($("#tipoEntrega").val() == 0 && $("#divPreguntaOficina").is(":visible")) {
                        banderaDireccion = false
                    }
                    if ($("#nombreDestinatario").val().length == 0 || $("#documentoDestinatario").val().length == 0) {
                        banderaDireccion = false
                    }
                    if ($("#telefonoDestinatario").val().length == 0) {
                        banderaDireccion = false
                    }
                    if ($('#ciudadDestinatario').find(':selected').val() == 0) {
                        banderaDireccion = false
                    }
                }
            }
        })

        if (!banderaDireccion) {
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Datos de envio (campos incompletos)",
                icon: "error"
            })
            return 1;
        }

        //valida los datos de facturacion
        if (idFacturacion == 0) {
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Datos de facturacion (campos incompletos)",
                icon: "error"
            })
            return 1;
        }

        let banderaProducto = true;
        for (let i = 0; i < productosFin.length; i++) {
            if ($("#cobroProducto-" + productosFin[i].id).css("border-color") == "red" || $("#cobroProducto-" + productosFin[i].id).css("border-color") == "rgb(250, 1, 1)" || $("#cobroProducto-" + productosFin[i].id).css("background-color") == "rgb(255, 175, 175)") {
                banderaProducto = false;
                break;
            }
        }

        if (!banderaProducto) {
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Productos (parametros no validos)",
                icon: "error"
            })
            return 1;
        }

        for (var e = tiposPedidos.length - 1; e >= 0; e--) {
            if (tiposPedidos[e].id == tipoDePedido) {
                if (tiposPedidos[e].comprobantes == 1) {
                    if (arrayFile.length == 0) {
                        const swalWithReact = withReactContent(Swal);
                        // Manejar el error aquí
                        withReactContent(Swal).fire({
                            title: "Error",
                            text: "Comprobantes (debes subir una evidencia de pago)",
                            icon: "error"
                        })
                        return 1;
                    } else if (tiposPedidos[e].pagoTotal == 1 && saldoTotal2 > 0) {
                        const swalWithReact = withReactContent(Swal);
                        // Manejar el error aquí
                        withReactContent(Swal).fire({
                            title: "Error",
                            text: "El pago debe estar en su totalidad",
                            icon: "error"
                        })
                        return 1;
                    } else {
                        let banderaParametros = true;
                        arrayFile.map((file, i) => {
                            if (file.fecha == "") {
                                banderaParametros = false;
                            }
                            if (file.valor == "0") {
                                banderaParametros = false;
                            }
                        })
                        if (banderaParametros == false) {
                            const swalWithReact = withReactContent(Swal);
                            // Manejar el error aquí
                            withReactContent(Swal).fire({
                                title: "Error",
                                text: "Comprobantes (Algunos campos son incorrectos)",
                                icon: "error"
                            })
                            return 1;
                        }
                    }
                }
            }
        }


        if (idClienteCRM == 0) {
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Cliente CRM (parametros no validos)",
                icon: "error"
            })
            return 1;
        }

        const swalWithReact = withReactContent(Swal);
        swalWithReact.fire({
            title: "Guardando",
            text: "Por favor, espera un momento...",
            icon: "info",
            showConfirmButton: false, // Ocultar el botón de confirmación
            allowOutsideClick: false // Evitar cerrar el SweetAlert haciendo clic fuera de él
        });

        $(".swal2-container").css({ 'background': '#cfcfcfde' })
        let productosData = [];
        for (var e = productosFin.length - 1; e >= 0; e--) {
            productosData.push({
                id: productosFin[e].id,
                producto: productosFin[e].producto,
                tamano: productosFin[e].tamano,
                valor: productosFin[e].precioPublico,
                cobrado: productosFin[e].precioCobrado,
                comision: productosFin[e].precioComision,
                descuento: 0,
                bono: productosFin[e].cupon,
                cantidad: productosFin[e].cantidad,
                linea: productosFin[e].dataSiigo['lineaSiigo'],
                grupo: productosFin[e].dataSiigo['grupoSiigo'],
                codigo: productosFin[e].dataSiigo['codigoSiigo'],
                auxiliar: productosFin[e].dataSiigo['auxiliarSiigo'],
                nombre: productosFin[e].nombre
            })
        }




        await axios.post(process.env.ENDPOINT_API + '/pedidos/subirPedido', {
            usuario: usuarioId,
            tipoEnvio: tipoEnvio,
            flete: fleteCobrado2,
            fleteTransportadora: flete,
            campana: $("#selectCampana").val(),
            transportadora: transportadoraPedido,
            tipoPedido: tipoDePedido,
            valor: valorProductos2,
            fechaDespacho: fechaDespacho2,
            idFacturacion: idFacturacion,
            idClienteCRM: idClienteCRM,
            typeCliente: typeClienteCRM,
            cupon: idCupoPedido,
            descuento: descuentoTotal,
            saldo: saldoTotal,
        }).then(async (response) => {
            if (response.data.bandera == 1) {

                $(".confirmacionPedido2").hide();
                $(".confirmacionPedido").show();
                setReferenciaPedido(response.data.pedido.referencia);
                //pasa los productos del pedido
                await axios.post(process.env.ENDPOINT_API + '/pedidos/productosPedido', {
                    pedido: response.data.pedido.referencia,
                    productos: productosData
                }).then(async (response) => {

                    if (response.data.bandera == 0) {
                        // Manejar el error aquí
                        withReactContent(Swal).fire({
                            title: "Error",
                            text: "Comunica con soporte (guardando productos)",
                            icon: "error"
                        })
                    }

                }).catch(error => {
                    console.log(error);
                    // Manejar el error aquí
                    withReactContent(Swal).fire({
                        title: "Error",
                        text: "Comunica con soporte (guardando productos)",
                        icon: "error"
                    })

                });

                //guarda los comprobantes si tiene el pedido
                if (arrayFile.length > 0) {
                    const formData = new FormData();
                    formData.append(`referenciaPedido`, response.data.pedido.referencia);
                    arrayFile.forEach((file, index) => {
                        formData.append(`file${index}`, file); // Agrega el archivo
                        formData.append(`rutaPreview${index}`, file.rutaPreview);
                        formData.append(`entidad${index}`, file.entidad);
                        formData.append(`fecha${index}`, file.fecha);
                        formData.append(`valor${index}`, file.valor);

                    });
                    await axios.post(process.env.ENDPOINT_API + '/pedidos/comprobantes', formData)
                        .then(async (response) => {
                            if (response.data.bandera == 0) {
                                // Manejar el error aquí
                                withReactContent(Swal).fire({
                                    title: "Error",
                                    text: "Comunica con soporte (subir Comprobantes)",
                                    icon: "error"
                                })
                            }
                        }).catch(error => {
                            console.log(error);
                            // Manejar el error aquí
                            withReactContent(Swal).fire({
                                title: "Error",
                                text: "Comunica con soporte (subir Comprobantes)",
                                icon: "error"
                            })

                        });
                }

                let oficina = false;

                if ($("#tipoEntrega").val() == 2) {
                    oficina = true;
                }

                //guardar los datos de envio del pedido
                await axios.post(process.env.ENDPOINT_API + '/pedidos/datosdeenvio', {
                    pedido: response.data.pedido.referencia,
                    nombre: $("#nombreDestinatario").val(),
                    documento: $("#documentoDestinatario").val(),
                    telefono: $("#telefonoDestinatario").val(),
                    direccion: $("#direccionEnvio").val(),
                    observacion: $("#observacionEnvio").val(),
                    departamento: $("#departamentoDestinatario").val(),
                    ciudad: $("#ciudadDestinatario").val(),
                    oficina: oficina,
                    insert: 1
                }).then(response => {

                }).catch(error => {
                    console.log(error);
                    // Manejar el error aquí
                    withReactContent(Swal).fire({
                        title: "Error",
                        text: "Comunica con soporte (guardar datos de envio)",
                        icon: "error"
                    })

                });


                $("#referenciaPedido").html(response.data.pedido.referencia);
                $("#referenciaPedido2").html(response.data.pedido.referencia);
                let link = "http://207.246.82.178:4000/pedidos/imprimir/" + response.data.pedido.referencia;
                setLinkQR(link);

                //formateamos la fecha de subida del pedido
                const fechaHora = response.data.pedido.subido;
                const [fecha, hora] = fechaHora.split(' ');

                const [año, mes, dia] = fecha.split('-');

                const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
                const nombreMes = meses[parseInt(mes, 10) - 1];

                let [horas, minutos] = hora.split(':');
                const periodo = horas >= 12 ? 'PM' : 'AM';
                horas = horas % 12 || 12; // Convierte a formato 12 horas

                const fechaFormateada = `${parseInt(dia, 10)} de ${nombreMes} ${año} a las ${horas}:${minutos} ${periodo}`;


                $("#fechaSubida").html(fechaFormateada)
                $("#fechaSubida2").html(fechaFormateada)


            } else {
                const swalWithReact = withReactContent(Swal);
                // Manejar el error aquí
                withReactContent(Swal).fire({
                    title: "Error",
                    text: "Comunica con soporte (subir pedido)",
                    icon: "error"
                })
            }
        }).catch(error => {
            console.log(error);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (subir pedido)",
                icon: "error"
            })

        });
    }

    function restarProducto(id) {
        let cantida = 1;
        valorProductos2 = 0;
        cantidadProductos2 = 0;
        totalComision2 = 0;
        productosFin.map((producto, i) => {
            if (productosFin[i].id === id) {
                if (productosFin[i].cantidad > 1) {
                    productosFin[i].cantidad = productosFin[i].cantidad - 1;
                    cantida = productosFin[i].cantidad;
                }
            }
            cantidadProductos2 += productosFin[i].cantidad;
            valorProductos2 += parseInt(productosFin[i].precioCobrado) * parseInt(productosFin[i].cantidad);
            if (productosFin[i].precioComision > 0) {
                totalComision2 += productosFin[i].precioComision * productosFin[i].cantidad;
            }
        })
        setTotalComision(totalComision2);

        setCantidadProductos(cantidadProductos2);

        const newProductos = productos.map(producto => {
            if (producto.id === id) {
                return { ...producto, cantidad: cantida };
            }
            return producto;
        });
        setProductos(newProductos);

        valorTotal = valorProductos2 + parseInt(fleteCobrado2);
        saldoTotal2 = valorTotal - abonoTotal2 - descuentoTotal2;
        setBanderaDescuento500(false);
        if (descuentoTotal2 > 0 && idCupoPedido == 0) {
            descuentoTotal2 = 0;
            setDescuentoTotal(0);
        }
        if (saldoTotal2 <= 500 && saldoTotal2 > 0 && idCupoPedido == 0) {
            setBanderaDescuento500(true);
        }
        setTotalPedido(valorTotal);
        setSaldoTotal(saldoTotal2);
        setValorProductos(valorProductos2);
    }

    function aplicarDescuento500() {
        setBanderaDescuento500(false);
        setDescuentoTotal(saldoTotal2);
        descuentoTotal2 = saldoTotal2;
        saldoTotal2 -= descuentoTotal2;
        setSaldoTotal(saldoTotal2);
    }

    function sumarProducto(id) {
        let cantida = 0;
        valorProductos2 = 0;
        cantidadProductos2 = 0;
        totalComision2 = 0;
        productosFin.map((producto, i) => {
            if (productosFin[i].id == id) {
                productosFin[i].cantidad = productosFin[i].cantidad + 1;
                cantida = productosFin[i].cantidad;
            }
            cantidadProductos2 += productosFin[i].cantidad;
            valorProductos2 += parseInt(productosFin[i].precioCobrado) * parseInt(productosFin[i].cantidad);
            if (productosFin[i].precioComision > 0) {
                totalComision2 += productosFin[i].precioComision * productosFin[i].cantidad;
            }
        })

        setTotalComision(totalComision2);
        setCantidadProductos(cantidadProductos2);

        valorTotal = valorProductos2 + parseInt(fleteCobrado2);
        saldoTotal2 = valorTotal - abonoTotal2 - descuentoTotal2;
        setBanderaDescuento500(false);
        if (descuentoTotal2 > 0 && idCupoPedido == 0) {
            descuentoTotal2 = 0;
            setDescuentoTotal(0);
        }
        if (saldoTotal2 <= 500 && saldoTotal2 > 0 && idCupoPedido == 0) {
            setBanderaDescuento500(true);
        }
        setTotalPedido(valorTotal);
        setSaldoTotal(saldoTotal2);
        setValorProductos(valorProductos2);

        const newProductos = productos.map(producto => {
            if (producto.id === id) {
                return { ...producto, cantidad: cantida };
            }
            return producto;
        });
        setProductos(newProductos);
    }

    function cuponProducto(id) {
        const swalWithReact = withReactContent(Swal);
        swalWithReact.fire({
            title: 'Cupón de descuento',
            input: 'text',
            confirmButtonText: "Validar",
            inputValidator: (value) => {
                if (!value) {
                    return '¡El campo no puede estar vacío!';
                }
            },
            preConfirm: async () => {
                const inputValue = Swal.getInput()?.value || '';

                swalWithReact.fire({
                    title: "Validando",
                    text: "Por favor, espera un momento...",
                    icon: "info",
                    showConfirmButton: false, // Ocultar el botón de confirmación
                    allowOutsideClick: false // Evitar cerrar el SweetAlert haciendo clic fuera de él
                });

                let linea = 0;
                let grupo = 0;
                let codigo = 0;
                let auxiliar = 0;
                productosFin.map((producto, i) => {
                    if (productosFin[i].id == id) {
                        linea = productosFin[i].dataSiigo['lineaSiigo'];
                        grupo = productosFin[i].dataSiigo['grupoSiigo'];
                        codigo = productosFin[i].dataSiigo['codigoSiigo'];
                        auxiliar = productosFin[i].dataSiigo['auxiliarSiigo'];
                    }
                })

                //verificar el codigo
                await axios.post(process.env.ENDPOINT_API + '/apoyoTSU/validarCodigoProducto', {
                    codigoCupon: inputValue,
                    linea: linea,
                    grupo: grupo,
                    codigo: codigo,
                    auxiliar: auxiliar,
                    idProducto: id
                }).then(response => {
                    if (response.data.bandera == 0) {
                        swalWithReact.fire({
                            title: "Error",
                            text: "Cupon no valido",
                            icon: "error"
                        })
                    } else {

                        let costoProducto = 0;
                        let comision = 0;
                        let precioComision = 0;
                        valorProductos2 = 0;
                        totalComision2 = 0;
                        productosFin.map((producto, i) => {
                            if (productosFin[i].id == response.data.idProducto) {
                                productosFin[i].cupon = 1;
                                productosFin[i].dataCupon = response.data.cupon;
                                comision = productosFin[i].dataCupon.comision;

                                //valor fijo
                                if (productosFin[i].dataCupon.typeCalculo == 2) {
                                    costoProducto = productosFin[i].dataCupon.valorCalculo;
                                    if (comision == 0) {
                                        productosFin[i].precioComision = 0;
                                    } else {
                                        precioComision = (costoProducto * (comision / 100));
                                        productosFin[i].precioComision = (costoProducto * (comision / 100))
                                    }

                                    productosFin[i].precioCobrado = productosFin[i].dataCupon.valorCalculo;
                                }

                                //% de calculo
                                if (productosFin[i].dataCupon.typeCalculo == 1) {
                                    costoProducto = Math.trunc(productosFin[i].precioCobrado - (productosFin[i].precioCobrado * (productosFin[i].dataCupon.valorCalculo / 100)));
                                    if (comision == 0) {
                                        productosFin[i].precioComision = 0;
                                    } else {
                                        precioComision = (costoProducto * (comision / 100));
                                        productosFin[i].precioComision = (costoProducto * (comision / 100))
                                    }

                                    productosFin[i].precioCobrado = costoProducto;
                                }
                                productosFin[i].comision = comision;
                            }
                            valorProductos2 += parseInt(productosFin[i].precioCobrado) * parseInt(productosFin[i].cantidad);
                            if (productosFin[i].precioComision > 0) {
                                totalComision2 += productosFin[i].precioComision * productosFin[i].cantidad;
                            }
                        })

                        setTotalComision(totalComision2);
                        $("#cobroProducto-" + response.data.idProducto).css({ "background-color": "white", "border-color": "#d9dee3" });

                        const newProductos = productos.map(producto => {
                            if (producto.id === response.data.idProducto) {
                                let precioComision = 0;
                                if (Math.trunc(costoProducto * (comision / 100)) > 1) {
                                    precioComision = Math.trunc(costoProducto * (comision / 100));
                                }
                                return { ...producto, cupon: 1, codigoCupon: response.data.cupon.code, precioComision: precioComision, comision: comision, precioCobrado: costoProducto, precioComision: precioComision };
                            }
                            return producto;
                        });
                        setProductos(newProductos);

                        valorTotal = valorProductos2 + parseInt(fleteCobrado2);
                        saldoTotal2 = valorTotal - abonoTotal2 - descuentoTotal2;
                        setBanderaDescuento500(false);
                        if (descuentoTotal2 > 0 && idCupoPedido == 0) {
                            descuentoTotal2 = 0;
                            setDescuentoTotal(0);
                        }
                        if (saldoTotal2 <= 500 && saldoTotal2 > 0 && idCupoPedido == 0) {
                            setBanderaDescuento500(true);
                        }
                        setTotalPedido(valorTotal);
                        setSaldoTotal(saldoTotal2);
                        setValorProductos(valorProductos2);

                        swalWithReact.fire({
                            title: "Aplicado",
                            text: "Cupon valido",
                            icon: "success",
                            showConfirmButton: false, // Ocultar el botón de confirmación
                            timer: 2000 // Cerrar automáticamente después de 2 segundos
                        });
                    }

                }).catch(error => {
                    console.log(error);
                    const swalWithReact = withReactContent(Swal);
                    // Manejar el error aquí
                    withReactContent(Swal).fire({
                        title: "Error",
                        text: "Comunica con soporte (validar cupon)",
                        icon: "error"
                    })
                });
                //setInputValue(inputValue);
            }
        })
    }

    function eliminarCupon(id) {
        const swalWithReact = withReactContent(Swal);
        swalWithReact.fire({
            title: "Confirmación",
            html: "¿Esta segur@ de quitar el cupón de descuento?",
            showCancelButton: true,
            confirmButtonText: "Si", // Texto personalizado para el botón de confirmación
            cancelButtonText: "No", // Texto personalizado para el botón de cancelación
            allowOutsideClick: false
        }).then(async (result) => {
            // Aquí puedes continuar con el flujo normal si el usuario seleccionó una opción válida
            if (result.isConfirmed) {

                let costoProducto = 0;
                let comision = 0;
                let precioComision = 0;
                valorProductos2 = 0;
                totalComision2 = 0;
                productosFin.map((producto, i) => {
                    if (productosFin[i].id == id) {
                        productosFin[i].cupon = 0;
                        productosFin[i].dataCupon = 0;
                        comision = productosFin[i].comisionOriginal;

                        costoProducto = productosFin[i].precioPublico;
                        if (comision == 0) {
                            productosFin[i].precioComision = 0;
                        } else {
                            precioComision = (costoProducto * (comision / 100));
                            productosFin[i].precioComision = (costoProducto * (comision / 100))
                        }

                        productosFin[i].precioCobrado = productosFin[i].precioPublico;
                    }

                    if (productosFin[i].precioComision > 0) {
                        totalComision2 += productosFin[i].precioComision * productosFin[i].cantidad;
                    }

                    valorProductos2 += parseInt(productosFin[i].precioCobrado) * parseInt(productosFin[i].cantidad);
                })

                setTotalComision(totalComision2);

                const newProductos = productos.map(producto => {
                    if (producto.id === id) {
                        let precioComision = 0;
                        if (Math.trunc(costoProducto * (comision / 100)) > 1) {
                            precioComision = Math.trunc(costoProducto * (comision / 100));
                        }
                        return { ...producto, cupon: 0, codigoCupon: 0, precioComision: precioComision, comision: comision, precioCobrado: costoProducto, precioComision: precioComision };
                    }
                    return producto;
                });
                setProductos(newProductos);

                valorTotal = valorProductos2 + parseInt(fleteCobrado2);
                saldoTotal2 = valorTotal - abonoTotal2 - descuentoTotal2;
                setBanderaDescuento500(false);
                if (descuentoTotal2 > 0 && idCupoPedido == 0) {
                    descuentoTotal2 = 0;
                    setDescuentoTotal(0);
                }
                if (saldoTotal2 <= 500 && saldoTotal2 > 0 && idCupoPedido == 0) {
                    setBanderaDescuento500(true);
                }
                setTotalPedido(valorTotal);
                setSaldoTotal(saldoTotal2);
                setValorProductos(valorProductos2);


                swalWithReact.fire({
                    title: "Aplicado",
                    text: "Cupon eliminado",
                    icon: "success",
                    showConfirmButton: false, // Ocultar el botón de confirmación
                    timer: 2000 // Cerrar automáticamente después de 2 segundos
                });

            }
        })
    }

    // Función para capitalizar la primera letra de cada sílaba
    const capitalizeSyllables = (text) => {
        return text.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    const eliminarProducto = (id) => {

        const swalWithReact = withReactContent(Swal);
        swalWithReact.fire({
            title: "Confirmación",
            html: "¿Esta segur@ de eliminar el producto?",
            showCancelButton: true,
            confirmButtonText: "Si", // Texto personalizado para el botón de confirmación
            cancelButtonText: "No", // Texto personalizado para el botón de cancelación
            allowOutsideClick: false
        }).then(async (result) => {
            if (result.isConfirmed) {

                await axios.post(process.env.ENDPOINT_API + '/pedidos/eliminarProducto', {
                    producto: id
                }).then(response => {

                    productosFin.map((producto, i) => {
                        if (productosFin[i].id == id) {
                            productosFin.splice(i, 1);
                        }
                    })


                    const newProductos = productos.filter(producto => producto.id !== id);
                    setProductos(newProductos);

                    let comision = 0;
                    let banderaCupon = 0;
                    valorProductos2 = 0;
                    totalComision2 = 0;
                    productosFin.map((producto, i) => {
                        valorProductos2 += parseInt(productosFin[i].precioCobrado) * parseInt(productosFin[i].cantidad);
                        if (productosFin[i].precioComision > 0) {
                            totalComision2 += productosFin[i].precioComision * productosFin[i].cantidad;
                        }
                    })




                    valorTotal = valorProductos2 + parseInt(fleteCobrado2);
                    saldoTotal2 = valorTotal - abonoTotal2 - descuentoTotal2;
                    setBanderaDescuento500(false);
                    if (descuentoTotal2 > 0 && idCupoPedido == 0) {
                        descuentoTotal2 = 0;
                        setDescuentoTotal(0);
                    }
                    if (saldoTotal2 <= 500 && saldoTotal2 > 0 && idCupoPedido == 0) {
                        setBanderaDescuento500(true);
                    }
                    setTotalPedido(valorTotal);
                    setSaldoTotal(saldoTotal2);
                    setValorProductos(valorProductos2);
                    setTotalComision(totalComision2);
                }).catch(error => {
                    // Manejar el error aquí
                    withReactContent(Swal).fire({
                        title: "Error",
                        text: "Comunica con soporte (eliminar producto)",
                        icon: "error"
                    })
                })
            }
        })
    }

    return (
        <>
            <div id="divToPrint" className="hidden" style={{ padding: '50px' }}>
                <div className='row' style={{ height: '110px', marginTop: '20px' }}>
                    <div className='col-2' style={{ borderRight: "2px solid", textAlign: 'right' }}>
                        <QRCodeCanvas id='linkQR' value={linkQR} style={{ maxWidth: '100%', margin: 'auto' }} />
                    </div>
                    <div className="col-5">
                        <h1 id='referenciaPedido' style={{ marginBottom: "0px", color: "#333", fontWeight: 'bold' }}>

                        </h1>
                        <p style={{ color: "#7e7e7e", fontSize: '23px' }}>
                            Ase. {usuario.nombre}
                            <br></br>
                            <span id="fechaSubida">{fechaSubida}</span>

                        </p>
                    </div>
                    <div className="col-5" style={{ textAlign: "center" }}>
                        <h1 style={{ fontWeight: 'bold' }}>
                            {transportadora == 1 && 'TCC'}
                            {transportadora == 2 && 'ENVIA'}
                            {transportadora == 3 && 'INTER RAPIDISIMO'}
                            {transportadora == 4 && 'MENSAJERO'}
                            {transportadora == 5 && 'PAGO EN TIENDA'}
                        </h1>
                        <h3>
                            {transportadora != 5 && tipoEnvio === 1 && 'INCLUIDO EN LA FACTURA'}
                            {transportadora != 5 && tipoEnvio === 2 && 'CONTRA ENTREGA'}
                            {transportadora != 5 && tipoEnvio === 3 && 'RECAUDO'}
                            <br></br>
                            Despacho: <span>{fechaDespacho}</span>
                        </h3>
                    </div>
                    <div className='col-12' style={{ marginTop: '20px', height: '120px', textAlign: 'center' }}>
                        <Barcode value={referenciaPedido} height={100} displayValue={false} />
                    </div>
                </div>
                <div className="row" style={{ marginTop: "60px" }}>
                    <div className="col-12">
                        {productos.map((producto, index) => {
                            return (<>
                                <div className='row' style={{ marginTop: '10px' }}>
                                    <div className='col-1' style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                                            <div>
                                                <h1 style={{ color: "#333", fontWeight: 'bold' }}>
                                                    {index + 1}
                                                </h1>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='col-4' style={{ borderRight: '2px solid #e9e9e9' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                                            <div>
                                                <p style={{ marginBottom: '0px', lineHeight: '30px', fontSize: '20px' }}>
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
                                                    - Cantidad: {producto.cantidad}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='col-7'>
                                        <div className='row justify-content-md-center' id={`imagenesProducto2-${producto.id}`} style={{ marginTop: '20px' }} >
                                        </div>
                                    </div>
                                    <div className='col-12' style={{ marginBottom: '10px', marginTop: '20px' }}>
                                        <div style={{ width: '80%', height: '2px', background: "#e9e9e9", margin: "auto", marginTop: "10px", marginBottom: "10px" }}>
                                        </div>
                                    </div>
                                </div>
                            </>)
                        })}
                    </div>
                    <div className="col-12">
                        <div style={{ textAlign: "right", height: "3px", background: "#dedede", width: "100%", marginBottom: "0px", marginTop: "20px" }}>
                            <span style={{ background: "#dedede", fontSize: "13px", padding: "2px 10px", paddingBottom: "20px" }}>
                                DATOS DE FACTURACION
                            </span>
                        </div>
                        <div style={{ border: "1px solid #dedede", textAlign: "initial", padding: "10px" }}>
                            <p style={{ color: "#7e7e7e", fontSize: '20px' }} id="resultFacturacion2">
                            </p>
                        </div>
                    </div>
                    <div className="col-12">
                        <div style={{ textAlign: "right", height: "3px", background: "#dedede", width: "100%", marginBottom: "0px", marginTop: "20px" }}>
                            <span style={{ background: "#dedede", fontSize: "13px", padding: "2px 10px", paddingBottom: "20px" }}>
                                DATOS DE ENVIO
                            </span>
                        </div>
                        <div style={{ border: "1px solid #dedede", textAlign: "initial", padding: "10px" }}>
                            <p style={{ color: "#7e7e7e", fontSize: '20px' }} id="resultDireccion2">
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container-xxl flex-grow-1 containerP" style={{ background: '#eeeeee', height: '100%', width: '100%', position: 'relative', left: '0px', top: '0px', overflow: 'hidden' }}>
                <div className='row' style={{ height: '100%', width: '85%', margin: 'auto' }}>
                    <div className='col-8' style={{ maxHeight: '100%', overflow: 'auto', padding: '40px', paddingLeft: '0px', fontSize: '12px' }}>
                        <div className='confirmacionPedido2' style={{ background: 'white', padding: '20px', marginBottom: '10px' }}>
                            <label>TIPO DE PEDIDO</label>
                            <div style={{ marginLeft: '20px', marginTop: '10px', marginBottom: '10px' }}>
                                {tiposPedidos.map((tipo, index) => {
                                    return (
                                        <div key={index} className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                style={{ cursor: 'pointer' }}
                                                name="flexRadioDefault"
                                                id={`flexRadioDefault${index}`}
                                                value={tipo.id}
                                                checked={tipoPedido === tipo.id}
                                                onChange={handleRadioTipoPedido}
                                            />
                                            <label className="form-check-label" htmlFor={`flexRadioDefault${index}`}>
                                                {tipo.nombre}
                                                {tipo.detalle && tipo.detalle.length > 0 && (
                                                    <span style={{ marginLeft: '3px' }}>( {tipo.detalle} )</span>
                                                )}
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="accordion confirmacionPedido2" id="accordionExample" style={{ marginBottom: '20px' }}>
                            <div className="accordion-item" style={{ borderRadius: '0px' }}>
                                <h2 className="accordion-header" id="accordion1" style={{ color: '#a5acb4', borderRadius: '0px', padding: '10px 5px' }} >
                                    <label className="accordion-button accordion-button2" style={{ padding: '0px 20px', fontSize: '12px' }} type="button" data-bs-toggle="collapse" data-bs-target="#collapse1" aria-expanded="true" aria-controls="collapse1">
                                        <span style={{ marginTop: '3px' }}>DATOS DE ENVIO (
                                            {labelTransportadora.toUpperCase()}

                                            {tipoEnvio === 1 && '- INCLUIDO EN LA FACTURA'}
                                            {tipoEnvio === 2 && '- CONTRA ENTREGA'}
                                            {tipoEnvio === 3 && '- RECAUDO'}
                                            )
                                        </span>
                                    </label>
                                    <p style={{ fontSize: '10px', marginBottom: '0px', background: '#e9e9e9', color: '#a5acb4', padding: '5px 10px', display: "none", width: '93.9%', margin: 'auto', marginTop: '5px' }} id="resultDireccion">

                                    </p>
                                </h2>
                                <div id="collapse1" className="accordion-collapse collapse" aria-labelledby="accordion1" data-bs-parent="#accordionExample">
                                    <div className="accordion-body">
                                        <div className='row'>
                                            <div className='col-12'>
                                                <div style={{ width: '80%', height: '2px', background: "#e9e9e9", margin: "auto", marginTop: "10px", marginBottom: "10px" }}>

                                                </div>
                                            </div>
                                            <div className="form-group col-12 selectTransportadora" style={{ marginTop: '10px' }}>
                                                <label>Transportadora</label>
                                                <select id="selectTransportadora" onChange={handleTransportadora} className="form-control">
                                                    <option selected value="0">--- Selecciona ---</option>
                                                </select>
                                            </div>
                                            <div className="form-group col-12 datEnvio2" style={{ marginTop: '10px' }}>
                                                <div className="form-check" id="divpreguntaIncluir">
                                                    <input id="preguntaIncluir" className="form-check-input" type="checkbox" onClick={handleCheckboxTipoEnvio} value=""></input>
                                                    <label className="form-check-label">
                                                        Incluir flete en la factura ( El cliente pago el flete )
                                                    </label>
                                                </div>

                                            </div>
                                            <div className="form-group col-12 datEnvio" id="divPreguntaOficina" style={{ display: 'none' }}>
                                                <label>Tipo de entrega</label>
                                                <select className="form-control" id="tipoEntrega">
                                                    <option value="0">Sin Definir</option>
                                                    <option value="2">En Direccion</option>
                                                    <option value="1">Oficina transportadora</option>
                                                </select>
                                            </div>

                                            <div className="form-group col-12 datEnvio" style={{ marginTop: '10px' }}>
                                                <label>Nombre</label>
                                                <input type="text" onChange={handleDatosEnvio} className="form-control" id="nombreDestinatario"></input>
                                            </div>
                                            <div className="form-group col-6 datEnvio2" style={{ marginTop: '10px' }}>
                                                <label>Documento</label>
                                                <input type="text" onChange={handleDatosEnvio} className="form-control" id="documentoDestinatario"></input>
                                            </div>
                                            <div className="form-group col-6 datEnvio" id="telefonoDireccion" style={{ marginTop: '10px' }}>
                                                <label>Telefono</label>
                                                <input type="text" onChange={handleDatosEnvio} className="form-control" id="telefonoDestinatario"></input>
                                            </div>
                                            <div className="form-group col-6 datEnvio2" style={{ marginTop: '10px' }}>
                                                <label>Direccion</label>
                                                <textarea onChange={handleDatosEnvio} className="form-control" id="direccionEnvio"></textarea>
                                            </div>
                                            <div className="form-group col-6 datEnvio2" style={{ marginTop: '10px' }}>
                                                <label>Observaciones</label>
                                                <textarea onChange={handleDatosEnvio} className="form-control" id="observacionEnvio"></textarea>
                                            </div>
                                            <div className="form-group col-6 datEnvio2" style={{ marginTop: '10px' }}>
                                                <label>Departamento</label>
                                                <select className="form-control" onChange={handleChangeDepartamento} id="departamentoDestinatario">
                                                    <option value="0">--- Selecciona ---</option>
                                                    {departamentos.map((dato2, index) => (
                                                        <option key={index} value={dato2.id}>{dato2.nombre}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="form-group col-6 datEnvio2" style={{ marginTop: '10px' }}>
                                                <label>Ciudad</label>
                                                <select className="form-control" onChange={handleDatosEnvio} id="ciudadDestinatario">
                                                    <option value="0">--- Selecciona ---</option>
                                                    {ciudades.map((dato2, index) => (
                                                        <option key={index} value={dato2.id}>{dato2.nombre}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className='col-12 fleteCotizado' style={{ display: 'none' }}>
                                                <div style={{ width: '80%', height: '2px', background: "#e9e9e9", margin: "auto", marginTop: "10px", marginBottom: "10px" }}></div>
                                            </div>
                                            {ciudadSinCobertura && (
                                                <div className="alert alert-danger" style={{ width: '90%', margin: '10px auto', textAlign: 'center', border: '1px solid red', color: 'red' }} role="alert">
                                                    CIUDAD SIN CUBRIMIENTO
                                                </div>
                                            )}
                                            <div className="form-group col-6 fleteCotizado" style={{ display: 'none' }}></div>
                                            <div className="form-group col-6 datEnvio2 fleteCotizado" style={{ display: 'none', marginTop: '10px', display: 'none' }}>
                                                <div className='row'>

                                                    <div className='col-6' style={{ textAlign: 'right' }}>
                                                        Cotizado
                                                        <br></br>
                                                        <span style={{ marginTop: '6px', display: 'block' }}>Cobro</span>
                                                    </div>
                                                    <div className='col-6' style={{ textAlign: 'center' }}>
                                                        {formattedPrice(flete)}
                                                        <br></br>
                                                        <input placeholder={formattedPrice(flete)} style={{ textAlign: 'center' }} className='form-control' onChange={handleFleteCobrado} value={fleteCobrado}></input>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="accordion-item" style={{ borderRadius: '0px', marginTop: '10px' }}>
                                <h2 className="accordion-header" id="accordion2" style={{ color: '#a5acb4', borderRadius: '0px', padding: '10px 5px' }} >
                                    <label className="accordion-button accordion-button2" style={{ padding: '0px 20px', fontSize: '12px' }} type="button" data-bs-toggle="collapse" data-bs-target="#collapse2" aria-expanded="true" aria-controls="collapse2">
                                        <span style={{ marginTop: '3px' }}>
                                            DATOS DE FACTURACION
                                        </span>
                                    </label>
                                    <p style={{ fontSize: '10px', marginBottom: '0px', background: '#e9e9e9', color: '#a5acb4', padding: '5px 10px', display: "none", width: '93.9%', margin: 'auto', marginTop: '5px' }} id="resultFacturacion">

                                    </p>
                                </h2>
                                <div id="collapse2" className="accordion-collapse collapse" aria-labelledby="accordion1" data-bs-parent="#accordionExample">
                                    <div className="accordion-body">
                                        <div className='row' style={{ width: '100%', margin: 'auto', marginTop: '10px' }}>
                                            <div className='col-12'>
                                                <div style={{ width: '80%', height: '2px', background: "#e9e9e9", margin: "auto", marginTop: "10px", marginBottom: "10px" }}>

                                                </div>
                                            </div>
                                            <div className="form-group col-12" >
                                                <input type="text" id='searchFacturacion' placeholder='Documento, Nombre o E-mail' onChange={handleBuscadorFacturacion} className="form-control"></input>
                                            </div>
                                            <div className="form-group col-12" id='resultTerceros' style={{ maxHeight: '100px', overflow: 'auto', marginTop: '10px' }}>
                                                {searchResultsTercero.map((result, index) => (
                                                    result.message ? (
                                                        <p key={index} style={styles.noResults}>{result.message}</p>
                                                    ) : (
                                                        <p
                                                            key={result.id}
                                                            onClick={() => cargarTercero(result.id)}
                                                            style={styles.result}
                                                        >
                                                            {result.noDoc}
                                                            <br />
                                                            {result.priNombre} {result.segNombre} {result.priApellido} {result.segApellido}
                                                            <br />
                                                            {result.correo}
                                                        </p>
                                                    )
                                                ))}
                                            </div>
                                        </div>
                                        <form id="formRegistroTercero">
                                            <div className='row' style={{ width: '100%', margin: 'auto', marginTop: '10px' }}>
                                                <label style={{ borderBottom: "2px solid #e9e9e9", padding: "0px", marginTop: "10px", marginBottom: "20px" }}>
                                                    <span style={{ background: "#e9e9e9", padding: "3px 10px" }}>REGISTRO</span>
                                                </label>
                                                <div className="form-group col-6 digNit3" style={{ marginTop: '10px' }}>
                                                    <label>Tipo de Documento</label>
                                                    <select className="form-control" onChange={handleChangeTypoDocumento} name="tipoDoc" id="tipoDocFacturacion">
                                                        <option value="1" selected>Cedula Ciudadania</option>
                                                        <option value="2">NIT</option>
                                                        <option value="4">Cedula de extranjeria</option>
                                                        <option value="5">Tarjeta de identidad</option>
                                                    </select>
                                                </div>
                                                <div className="form-group col-6 digNit3" style={{ marginTop: '10px' }}>
                                                    <label>Documento</label>
                                                    <input type="text" className="form-control" name='documento'></input>
                                                </div>
                                                <div className="form-group col-6 digNit3 digNit" style={{ marginTop: '10px', display: 'none' }}>
                                                    <label>Digito de verificación</label>
                                                    <input type="text" className="form-control" name="digitoDocumento"></input>
                                                </div>
                                                <div className="form-group col-md-3 digNit2 nitDatos2" style={{ marginTop: '10px' }}>
                                                    <label>Tipo persona</label>
                                                    <select id="tipoPersona" name="tipoPersona" className="form-control">
                                                        <option value="1" selected>Natural</option>
                                                        <option value="2">Juridica</option>
                                                    </select>
                                                </div>
                                                <div className="form-group col-md-3" style={{ display: "none", marginTop: '10px' }}>
                                                    <label>Razón social</label>
                                                    <select id="razonSocial" name="razonSocial" className="form-control">
                                                        <option value="1">Si</option>
                                                        <option value="0" selected>No</option>
                                                    </select>
                                                </div>
                                                <div className="form-group col-md-3 nitDatos" style={{ marginTop: '10px' }}>
                                                    <label>Genero</label>
                                                    <select id="sexo" className="form-control" name="sexo" >
                                                        <option value="1">Femenino</option>
                                                        <option value="2">Masculino</option>
                                                    </select>
                                                </div>
                                                <div className="form-group col-md-3 nitDatos" style={{ marginTop: '10px' }}>
                                                    <label>Fecha de Nacimiento</label>
                                                    <input type="date" className="form-control" name="fechaNac" id="fechaNac"></input>
                                                </div>
                                                <div className="form-group col-md-3 digNit2 nitDatos2" style={{ marginTop: '10px' }}>
                                                    <label>Tipo de contribuyente</label>
                                                    <select id="tipoContribuyente" name="tipoContribuyente" className="form-control">
                                                        <option value="5">Responsable de IVA</option>
                                                        <option value="4" selected>No Responsable de IVA</option>
                                                    </select>
                                                </div>
                                                <div className="form-group col-md-6 nombres2" style={{ display: 'none', marginTop: '10px' }}>
                                                    <label>Nombre</label>
                                                    <input type="text" className="form-control" name="nombre"></input>
                                                </div>
                                                <div className="form-group col-md-6 nombres2" style={{ display: 'none', marginTop: '10px' }}>
                                                    <label>Nombre Comercial</label>
                                                    <input type="text" className="form-control" name="nombreComercial"></input>
                                                </div>
                                                <div className="form-group col-md-6 nombres2" style={{ display: 'none', marginTop: '10px' }}>
                                                    <label>Nombre Contacto</label>
                                                    <input type="text" className="form-control" name="nombreContacto"></input>
                                                </div>
                                                <div className="form-group col-md-6 nombres2" style={{ display: 'none', marginTop: '10px' }}>
                                                    <label>Telefono Contacto</label>
                                                    <input type="text" className="form-control" name="telefonoContacto"></input>
                                                </div>
                                                <div className="form-group col-md-6 nombres" style={{ marginTop: '10px' }}>
                                                    <label>Primer Nombre</label>
                                                    <input type="text" className="form-control" name="priNombre"></input>
                                                </div>
                                                <div className="form-group col-md-6 nombres" style={{ marginTop: '10px' }}>
                                                    <label>Segundo Nombre</label>
                                                    <input type="text" className="form-control" name="segNombre"></input>
                                                </div>
                                                <div className="form-group col-md-6 nombres" style={{ marginTop: '10px' }}>
                                                    <label>Primer Apellido</label>
                                                    <input type="text" className="form-control" name="priApellido"></input>
                                                </div>
                                                <div className="form-group col-md-6 nombres" style={{ marginTop: '10px' }}>
                                                    <label>Segundo Apellido</label>
                                                    <input type="text" className="form-control" name="segApellido"></input>
                                                </div>
                                                <div className="form-group col-md-12" style={{ marginTop: '10px' }}>
                                                    <label>Dirección</label>
                                                    <textarea type="text" rows="3" name="direccion" className="form-control datos"></textarea>
                                                </div>
                                                <div className="form-group col-6 datEnvio2" style={{ marginTop: '10px' }}>
                                                    <label>Departamento</label>
                                                    <select className="form-control" onChange={handleChangeDepartamento2} name='departamento' id="departamentoTercero">
                                                        <option value="">--- Selecciona ---</option>
                                                        {departamentos.map((dato2, index) => (
                                                            <option key={index} value={dato2.id}>{dato2.nombre}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="form-group col-6 datEnvio2" style={{ marginTop: '10px' }}>
                                                    <label>Ciudad</label>
                                                    <select className="form-control" name='ciudad' id="ciudadTercero">
                                                        <option value="">--- Selecciona ---</option>
                                                        {ciudades2.map((dato2, index) => (
                                                            <option key={index} value={dato2.id}>{dato2.nombre}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="form-group col-md-4" style={{ marginTop: '10px' }}>
                                                    <label>Telefono</label>
                                                    <input type="text" className="form-control" name="telefono"></input>
                                                </div>
                                                <div className="form-group col-md-4" style={{ marginTop: '10px' }}>
                                                    <label>Celular</label>
                                                    <input type="text" className="form-control" name="celular"></input>
                                                </div>
                                                <div className="form-group col-md-4" style={{ marginTop: '10px' }}>
                                                    <label>Tel. secundario</label>
                                                    <input type="text" className="form-control" name="telefonoSec"></input>
                                                </div>
                                                <div className="form-group col-md-12" style={{ marginTop: '10px' }}>
                                                    <label>Correo Electronico</label>
                                                    <input type="email" className="form-control" name="correo"></input>
                                                </div>
                                                <div className="form-group col-md-12" style={{ marginTop: '10px' }}>
                                                    <button type="submit" className="btn btn-primary btn-block" id="buttonForm" style={{ background: '#222d32', borderColor: '#222d32', width: "100%" }}>REGISTRAR</button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                            <div className="accordion-item" style={{ borderRadius: '0px', marginTop: '10px' }}>
                                <h2 className="accordion-header" id="accordion3" style={{ color: '#a5acb4', borderRadius: '0px', padding: '10px 5px' }} >
                                    <label className="accordion-button" style={{ padding: '0px 20px', fontSize: '12px' }} type="button" data-bs-toggle="collapse" data-bs-target="#collapse3" aria-expanded="true" aria-controls="collapse3">
                                        <span style={{ marginTop: '3px' }}>
                                            PRODUCTOS
                                        </span>
                                    </label>
                                    <p style={{ fontSize: '10px', marginBottom: '0px', background: '#e9e9e9', color: '#a5acb4', padding: '5px 10px', marginTop: '5px', display: 'none' }} id="resultProductos">

                                    </p>
                                </h2>
                                <div id="collapse3" className="accordion-collapse collapse" aria-labelledby="accordion3" data-bs-parent="#accordionExample">
                                    <div className="accordion-body" >
                                        <div className='row'>
                                            <div className='col-12' style={{ marginBottom: '10px' }}>
                                                <div style={{ width: '80%', height: '2px', background: "#e9e9e9", margin: "auto", marginTop: "10px", marginBottom: "10px" }}>
                                                </div>
                                            </div>
                                        </div>
                                        {productos.map((producto, index) => {
                                            return (<>
                                                <div className='row'>
                                                    <div className='col-6'>
                                                        {producto.cupon > 0 && (
                                                            <span onClick={() => eliminarCupon(producto.id)} style={{ border: '1px solid silver', background: '#e9e9e9', padding: '5px' }}>Cupón: {producto.codigoCupon} <i className='bx bxs-x-circle' style={{ marginTop: '-4px', cursor: 'pointer' }}></i></span>
                                                        )}
                                                    </div>
                                                    <div className='col-6' style={{ textAlign: 'right' }}>
                                                        <i
                                                            className='bx bx-x-circle'
                                                            style={{ color: '#c0c0c0', cursor: 'pointer', marginTop: '-8px' }}
                                                            onClick={() => eliminarProducto(producto.id)}
                                                        >
                                                        </i>
                                                        {producto.precioComision > 0 && (
                                                            <>
                                                                <span style={{ color: 'green', fontWeight: 'bold' }}>
                                                                    <i
                                                                        style={{ marginLeft: '2px', fontSize: '20px', marginTop: '1px', marginBottom: '6px', height: '22px' }}
                                                                        className='bx bx-money-withdraw'
                                                                    ></i>
                                                                    ${formatNumberWithThousandSeparator(producto.precioComision * producto.cantidad)} <span style={{ fontSize: '11px', color: '#35b14c', display: 'none' }}>/ ${formatNumberWithThousandSeparator(producto.cantidad * producto.precioComision)} </span>
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className='row justify-content-md-center' id={`imagenesProducto-${producto.id}`} style={{ marginTop: '20px' }} >

                                                </div>
                                                <div className='row' style={{ marginTop: '10px' }}>
                                                    <div className='col-6' style={{ borderRight: '2px solid #e9e9e9' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                                                            <div>
                                                                <p style={{ marginBottom: '0px', lineHeight: '20px' }}>
                                                                    - {producto.tamanoLabel} ({producto.tipoHojaLabel})
                                                                    <br></br>
                                                                    {producto.numeroHojas > 0 && (
                                                                        <>
                                                                            - {producto.numeroHojas} Hojas
                                                                            <br></br>
                                                                            - {producto.nombre} ({producto.nombreHoja})
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
                                                    <div className='col-6'>
                                                        <div className="form-group row">
                                                            <label className="col-sm-5 col-form-label" style={{ textAlign: 'right', fontSize: '11px' }}></label>
                                                            <div className="col-sm-5" style={{ textAlign: 'center' }}>
                                                                <label style={{ fontSize: '12px', marginTop: '7px' }}>${formatearNumeroConPuntos(producto.precioPublico)} <span style={{ fontSize: '11px', color: '#a1a1a1', display: 'none' }}>/ ${formatearNumeroConPuntos(producto.precioCobrado * producto.cantidad)}</span></label>
                                                            </div>
                                                        </div>
                                                        <div className="form-group row" style={{ marginTop: '10px' }}>
                                                            <label className="col-sm-5 col-form-label" style={{ textAlign: 'right', fontSize: '11px' }}></label>
                                                            <div className="col-sm-5" >
                                                                <div className="input-group" style={{ width: 'fit-content' }}>
                                                                    <div className="input-group-prepend">
                                                                        <button style={{ height: '30px', padding: '4px' }} className="btn btn-outline-secondary" type="button" onClick={() => restarProducto(producto.id)}>-</button>
                                                                    </div>
                                                                    <input type="number" style={{ height: '30px', textAlign: 'center' }} className="form-control form-control-sm" id={`cantidad-${producto.id}`} onChange={(e) => handleChangeProducto(index, e)} value={producto.cantidad}></input>
                                                                    <div className="input-group-append">
                                                                        <button style={{ height: '30px', padding: '4px' }} className="btn btn-outline-secondary" type="button" onClick={() => sumarProducto(producto.id)}>+</button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="form-group row" style={{ marginTop: '10px' }}>
                                                            <label className="col-sm-5 col-form-label" style={{ textAlign: 'right', fontSize: '11px' }}></label>
                                                            <div className="col-sm-5">
                                                                <input type="text" style={{ textAlign: 'center' }} className="form-control" id={`cobroProducto-${producto.id}`} value={formatNumberWithThousandSeparator(producto.precioCobrado)} onChange={(e) => handleCobroProducto(index, e)} placeholder="Valor"></input>
                                                                <div style={{ display: 'grid' }}>
                                                                    <i onClick={() => cuponProducto(producto.id)} style={{ cursor: 'pointer', gridColumn: 1, color: producto.cupon > 0 ? 'green' : '#697a8d' }} className='bx bxs-discount'></i>
                                                                    <span style={{ color: 'red', fontWeight: 'bold', gridColumn: 2, textAlign: 'right' }}>
                                                                        ${formatNumberWithThousandSeparator(producto.precioCobrado * producto.cantidad)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className='col-12' style={{ marginBottom: '10px' }}>
                                                        <div style={{ width: '80%', height: '2px', background: "#e9e9e9", margin: "auto", marginTop: "10px", marginBottom: "10px" }}>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>)
                                        })}

                                    </div>
                                </div>
                            </div>
                            <div className="accordion-item" id='comprobantesDiv' style={{ borderRadius: '0px', marginTop: '10px' }}>
                                <h2 className="accordion-header" id="accordion4" style={{ color: '#a5acb4', borderRadius: '0px', padding: '10px 5px' }} >
                                    <label className="accordion-button" style={{ padding: '0px 20px', fontSize: '12px' }} type="button" data-bs-toggle="collapse" data-bs-target="#collapse4" aria-expanded="true" aria-controls="collapse4">
                                        <span style={{ marginTop: '3px' }}>
                                            COMPROBANTES
                                        </span>
                                    </label>
                                    <p style={{ fontSize: '10px', marginBottom: '0px', background: '#e9e9e9', color: '#a5acb4', padding: '5px 10px', display: "none", width: '93.9%', margin: 'auto', marginTop: '5px' }} id="resultComprobantes">

                                    </p>
                                </h2>
                                <div id="collapse4" className="accordion-collapse collapse" aria-labelledby="accordion4" data-bs-parent="#accordionExample">
                                    <div className="accordion-body">
                                        <div className='row'>
                                            <div className='col-12'>
                                                <div style={{ width: '80%', height: '2px', background: "#e9e9e9", margin: "auto", marginTop: "10px", marginBottom: "10px" }}>

                                                </div>
                                            </div>
                                            <div className='col-12 fileCompro' style={{ marginTop: '10px' }}>
                                                <FileUploader
                                                    multiple={false}
                                                    handleChange={handleChangeFile}
                                                    name="file"
                                                    label="Comprobante"
                                                    hoverTitle="Suelta aquí"
                                                />
                                            </div>
                                        </div>
                                        <div className='row' style={{ marginTop: '20px' }}>
                                            <table className="table table-striped">
                                                <thead>
                                                    <tr style={{ background: "#e9e9e9" }}>
                                                        <th scope="col"></th>
                                                        <th scope="col" style={{ textAlign: 'center' }}>Comprobante</th>
                                                        <th scope="col" style={{ textAlign: 'center' }}>Opciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {file.map((archivo, index) => {
                                                        const isImage = /\.(jpg|jpeg|png|gif)$/.test(archivo.name.toLowerCase());
                                                        return (
                                                            <tr key={archivo.id}>
                                                                <td>{index + 1}</td>
                                                                <td>
                                                                    {isImage ? (
                                                                        <img
                                                                            src={archivo.rutaPreview}
                                                                            alt="preview"
                                                                            style={{ maxHeight: '300px', width: 'auto', margin: 'auto' }}
                                                                        />
                                                                    ) : (
                                                                        <iframe
                                                                            src={archivo.rutaPreview}
                                                                            style={{ height: '300px', width: 'auto', margin: 'auto' }}
                                                                        ></iframe>
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    <div style={{ textAlign: 'right', marginBottom: '10px' }}>
                                                                        <i className="bx bxs-trash" onClick={(e) => handleEliminarComprobante(index, e)} style={{ color: 'red', cursor: 'pointer' }}></i>
                                                                    </div>
                                                                    <div className='row'>
                                                                        <div className='col-4' style={{ textAlign: 'right' }}>
                                                                            <span style={{ marginTop: '10px', display: 'block', width: '100%' }}>Entidad:</span>
                                                                            <span style={{ marginTop: '22px', display: 'block', width: '100%' }}>Fecha:</span>
                                                                            <span style={{ marginTop: '26px', display: 'block', width: '100%' }}>Valor:</span>
                                                                        </div>
                                                                        <div className='col-8'>
                                                                            <select onChange={(e) => handleChangeEntidad(index, e)} className='form-control'>
                                                                                {entidades.map((entidad, index) => (
                                                                                    <option key={entidad.id} value={entidad.id}>
                                                                                        {entidad.entidad}
                                                                                    </option>
                                                                                ))}
                                                                            </select>
                                                                            <input onChange={(e) => handleChangeFecha(index, e)} style={{ marginTop: '10px' }} type='Date' className='form-control'></input>
                                                                            <input onChange={(e) => handleChangeValor(index, e)} style={{ marginTop: '10px' }} type='text' className='form-control'></input>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="accordion-item" id='crmDiv' style={{ borderRadius: '0px', marginTop: '10px' }}>
                                <h2 className="accordion-header" style={{ color: '#a5acb4', borderRadius: '0px', padding: '10px 5px' }} >
                                    <label className="accordion-button accordion-button2" style={{ padding: '0px 20px', fontSize: '12px' }} type="button" data-bs-toggle="collapse" data-bs-target="#collapse5" aria-expanded="true" aria-controls="collapse5">
                                        <span style={{ marginTop: '3px' }}>
                                            CRM
                                        </span>
                                    </label>
                                    <p style={{ fontSize: '10px', marginBottom: '0px', background: '#e9e9e9', color: '#a5acb4', padding: '5px 10px', display: "none", width: '93.9%', margin: 'auto', marginTop: '5px' }} id="resultCRM">

                                    </p>
                                </h2>

                                <div id="collapse5" className="accordion-collapse collapse" aria-labelledby="accordion5" data-bs-parent="#accordionExample">
                                    <div className="accordion-body">
                                        <div className='row'>
                                            <div className='col-12'>
                                                <div style={{ width: '80%', height: '2px', background: "#e9e9e9", margin: "auto", marginTop: "10px", marginBottom: "10px" }}>
                                                </div>
                                            </div>
                                            <div className="form-group col-12" >
                                                <div className="form-group row">
                                                    <label className="col-sm-8 col-form-label" style={{ textAlign: 'right' }}>Campaña:</label>
                                                    <div className="col-sm-4">
                                                        <select id='selectCampana' className='form-control'>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='col-12'>
                                                <div style={{ width: '80%', height: '2px', background: "#e9e9e9", margin: "auto", marginTop: "10px", marginBottom: "10px" }}>
                                                </div>
                                            </div>
                                            <div className="form-group col-12" >
                                                <input type="text" id="buscadorClienteCRM" placeholder='Nombre o Telefono' onChange={handleBuscadorCRM} className="form-control"></input>
                                            </div>
                                            <div className="form-group col-12" style={{ maxHeight: '100px', overflow: 'auto', marginTop: '10px' }}>
                                                <React.Fragment>
                                                    {searchResultsCRM.length > 0 ? (
                                                        searchResultsCRM.map((result, index) => (
                                                            <>
                                                                <p
                                                                    key={result.id}
                                                                    onClick={() => cargarClienteCRM(result)}
                                                                    style={styles.result}
                                                                >
                                                                    {result.name}
                                                                    <br />
                                                                    +{formatearNumeroCelular2(result.number)}
                                                                </p>
                                                            </>
                                                        ))
                                                    ) : (
                                                        <>
                                                            <p style={{ textAlign: 'center', marginTop: '20px' }}> <i style={{ marginTop: '-4px' }} className='bx bx-error'></i> No se encontraron registros</p>
                                                        </>
                                                    )}
                                                </React.Fragment>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='confirmacionPedido' style={{ display: 'none', background: 'white', padding: '20px', marginBottom: '10px' }}>
                            <div className='row' style={{ height: '110px', marginTop: '20px' }}>
                                <div className='col-2' style={{ borderRight: "2px solid", textAlign: 'right' }}>
                                    <QRCodeCanvas id='linkQR' value={linkQR} style={{ maxWidth: '100%', height: 'auto', margin: 'auto' }} />
                                </div>
                                <div className="col-7">
                                    <h1 id='referenciaPedido2' style={{ marginBottom: "0px", color: "#333", fontWeight: 'bold' }}>

                                    </h1>
                                    <p style={{ color: "#7e7e7e" }}>
                                        Ase. {usuario.nombre}
                                        <br></br>
                                        <span id="fechaSubida2">{fechaSubida}</span>

                                    </p>
                                </div>
                                <div className="col-3" style={{ textAlign: "center" }}>
                                    <h3>
                                        {transportadora == 1 && 'TCC'}
                                        {transportadora == 2 && 'ENVIA'}
                                        {transportadora == 3 && 'INTER RAPIDISIMO'}
                                        {transportadora == 4 && 'MENSAJERO'}
                                        {transportadora == 5 && 'PAGO EN TIENDA'}
                                    </h3>
                                    <p>
                                        {tipoEnvio === 1 && 'INCLUIDO EN LA FACTURA'}
                                        {tipoEnvio === 2 && 'CONTRA ENTREGA'}
                                        {tipoEnvio === 3 && 'RECAUDO'}
                                    </p>
                                </div>
                            </div>
                            <div className="row" style={{ marginTop: "60px" }}>
                                <div className="col-12">
                                    {productos.map((producto, index) => {
                                        return (<>
                                            <div className='row' style={{ marginTop: '10px' }}>
                                                <div className='col-1' style={{ textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                                                        <div>
                                                            <h1 style={{ color: "#333", fontWeight: 'bold' }}>
                                                                {index + 1}
                                                            </h1>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='col-5' style={{ borderRight: '2px solid #e9e9e9' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                                                        <div>
                                                            <p style={{ marginBottom: '0px', lineHeight: '30px' }}>
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
                                                <div className='col-6'>
                                                    <div className='row justify-content-md-center' id={`imagenesProducto3-${producto.id}`} style={{ marginTop: '20px' }} >
                                                    </div>
                                                </div>
                                                <div className='col-12' style={{ marginBottom: '10px', marginTop: '20px' }}>
                                                    <div style={{ width: '80%', height: '2px', background: "#e9e9e9", margin: "auto", marginTop: "10px", marginBottom: "10px" }}>
                                                    </div>
                                                </div>
                                            </div>
                                        </>)
                                    })}
                                </div>
                                <div className="col-12">
                                    <div style={{ textAlign: "right", height: "3px", background: "#dedede", width: "100%", marginBottom: "0px", marginTop: "20px" }}>
                                        <span style={{ background: "#dedede", fontSize: "13px", padding: "2px 10px", paddingBottom: "20px" }}>
                                            DATOS DE FACTURACION
                                        </span>
                                    </div>
                                    <div style={{ border: "1px solid #dedede", textAlign: "initial", padding: "10px" }}>
                                        <p style={{ color: "#7e7e7e" }} id="resultFacturacion3">
                                        </p>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div style={{ textAlign: "right", height: "3px", background: "#dedede", width: "100%", marginBottom: "0px", marginTop: "20px" }}>
                                        <span style={{ background: "#dedede", fontSize: "13px", padding: "2px 10px", paddingBottom: "20px" }}>
                                            DATOS DE ENVIO
                                        </span>
                                    </div>
                                    <div style={{ border: "1px solid #dedede", textAlign: "initial", padding: "10px" }}>
                                        <p style={{ color: "#7e7e7e" }} id="resultDireccion3">
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className='col-4' style={{ background: '#f5f5f5', paddingTop: '40px', boxShadow: '0px 0px 18px 0px #bdbdbdbf' }}>

                        <label style={{ background: '#e9e9e9', width: '90%', padding: '10px', textAlign: 'center', marginLeft: '5%' }}>RESUMEN DE COMPRA</label>
                        <div className='row' style={{ width: '90%', border: '2px solid #e9e9e9', padding: '10px', marginLeft: '5%', fontSize: '12px' }}>
                            <div className='col-6'>
                                Productos ({cantidadProductos})
                                <br></br>
                                Envío
                            </div>
                            <div className='col-6' style={{ textAlign: 'right' }}>
                                {formattedPrice(valorProductos)}
                                <br></br>
                                {ciudadSinCobertura && (
                                    <i style={{ fontSize: '12px', color: 'red', marginRight: '2px', marginTop: '-4px' }} className='bx bxs-error-circle'></i>
                                )}$ {fleteCobrado}
                            </div>
                            <div className='col-12'>
                                <div style={{ width: '80%', height: '2px', background: "#e9e9e9", margin: "auto", marginTop: "10px", marginBottom: "10px" }}></div>
                            </div>
                            <div className='col-6'>
                                Total
                                <br></br>
                                Abono
                                <br></br>
                                Descuento
                                <br></br>
                                Saldo
                            </div>
                            <div className='col-6' style={{ textAlign: 'right' }}>
                                {formattedPrice(totalPedido)}
                                <br></br>
                                {formattedPrice(abonoTotal)}
                                <br></br>
                                <span style={{ color: descuentoTotal > 0 ? 'green' : '#768894' }}>
                                    {formattedPrice(descuentoTotal)}
                                </span>

                                <br></br>
                                <span style={{ color: saldoTotal > 0 ? 'red' : 'green', fontWeight: 'bold' }}>
                                    {saldoTotal < 0 ? `+${formattedPrice(Math.abs(saldoTotal))}` : formattedPrice(saldoTotal)}
                                    {
                                        banderaDescuento500 &&
                                        <i style={{ cursor: 'pointer', color: '#a5a5a5' }} onClick={aplicarDescuento500} className='bx bx-repost'></i>
                                    }
                                </span>
                            </div>
                        </div>
                        <p style={{ width: '90%', margin: 'auto', fontSize: '12px', marginTop: '10px', background: '#e9e9e9', padding: '6px 25px', lineHeight: '25px' }}>
                            <i className='bx bx-user'></i> Ase. {capitalizeSyllables(usuario.nombre)}
                            <br></br>
                            <i className='bx bx-money-withdraw'></i> <span>Com.: <span style={{ color: 'green', fontWeight: 'bold' }}>{formattedPrice(totalComision)} (Pendiente)</span> </span>
                            <br></br>
                            <i className='bx bx-timer'></i> {fechaDespacho} (4 dias habiles)
                        </p>
                        <div style={{ margin: 'auto', width: '90%', marginTop: '10px' }}>
                            <button style={{ width: '100%' }} onClick={pasarPedido} className='btn btn-primary confirmacionPedido2'>Pasar Pedido</button>
                            <button style={{ width: '100%', display: 'none' }} onClick={printDocument} className='btn btn-primary confirmacionPedido'>Imprimir Orden</button>
                        </div>


                    </div>
                </div>
            </div>
        </>
    )
}