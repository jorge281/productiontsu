
"use client";

import Swal from 'sweetalert2';
import axios from 'axios';
import Cookies from 'js-cookie';
import withReactContent from 'sweetalert2-react-content';
import React, { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Modal } from 'react-bootstrap';
import { es } from 'date-fns/locale';

import '../comprobantes/style.css';
import './style.css';


const $ = require('jquery');

let usuarioId = 1;
let usuarioConsulta = 0;
let cargoSite = 0;
let controladorTiempo2 = "";
let offsetPagina = 0;
let limitPagina = 10;
let controladorTiempo = "";
let nombreUsuario = "";
let rastreoGuias = [];
let pedidosConsultados = [];
let resultRastreoTCC = [];
let consultAdmin2 = false;
let pedidoEdit = "";

export default function Home() {

    const [consultando, setConsultado] = useState(true);
    const [pedidos, setPedidos] = useState([]);
    const [consultAdmin, setConsultAdmin] = useState(false);
    const [asesores, setAsesores] = useState([]);
    const [resultRecaudo, setResultRecaudo] = useState({
        cantidad: 0,
        cantidadViajando: 0,
        cantidadProcesoEntrega: 0,
        cantidadNovedad: 0,
        cantidadEntregado: 0,
        valor: 0,
        valorViajando: 0,
        valorProcesoEntrega: 0,
        valorNovedad: 0,
        valorEntregado: 0,
    })
    const [totalData,setTotalData] = useState(false)
    const [resultOtrosEnvios, setResultOtrosEnvios] = useState([])
    const [transportadoras, setTransportadoras] = useState([]);
    const [modalSeguimiento, setModalSeguimiento] = useState(false);
    const [modalNovedades, setModalNovedades] = useState(false);
    const [modalObservacion, setModalObservacion] = useState(false);
    const [novedadesASesor, setNovedadesAsesor] = useState([]);
    const [solucionesNovedades, setSolucionesNovedades] = useState([]);

    useEffect(() => {
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

                usuarioId = decodedToken.payload.user;
                usuarioConsulta = usuarioId;
                nombreUsuario = decodedToken.payload.nombre;

                if (decodedToken.payload.profile == 2) {
                    usuarioConsulta = 0;
                    setConsultAdmin(true);
                    consultAdmin2 = true;
                }

                $(".navbar").hide();

                cargoSite = 1;
                cargarTransportadoras();
            }
        }
    })

    async function cargarAsesores() {
        await axios.post(process.env.ENDPOINT_API + '/despachos/asesores').then(response => {
            if (response.data.bandera == 1) {
                for (var i = response.data.asesores.length - 1; i >= 0; i--) {
                    $("#asesores").append('<option value="' + response.data.asesores[i].id + '">' + response.data.asesores[i].name + '</option>')
                }
            } else {
                const swalWithReact = withReactContent(Swal);
                // Manejar el error aquí
                withReactContent(Swal).fire({
                    title: "Error",
                    text: "Comunica con soporte (cargar asesores)",
                    icon: "error"
                })
            }
        }).catch(error => {
            console.log(error);
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (cargar asesores)",
                icon: "error"
            })
        });
    }

    async function cargarTransportadoras() {
        await axios.get(process.env.ENDPOINT_API + '/despachos/transportadoras').then(response => {
            if (response.data.bandera == 1) {
                if (consultAdmin2) {
                    cargarAsesores()
                }
                setTransportadoras(response.data.transportadoras)
                setSolucionesNovedades(response.data.solucionNovedades)
                setTimeout(function () {
                    cargarData()
                    cargarResult();
                }, 1000);
            } else {
                const swalWithReact = withReactContent(Swal);
                // Manejar el error aquí
                withReactContent(Swal).fire({
                    title: "Error",
                    text: "Comunica con soporte (cargar transportadoras)",
                    icon: "error"
                })
            }


        }).catch(error => {
            console.log(error);
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (cargar transportadoras)",
                icon: "error"
            })
        });
    }

    async function cargarResult() {
        await axios.post(process.env.ENDPOINT_API + '/despachos/resultdespachoAsesor', {
            usuario: usuarioConsulta,
            admin: consultAdmin2
        }).then(response => {
            if (response.data.bandera == 1) {
                setResultOtrosEnvios(response.data.transportadoras)
                setResultRecaudo(response.data.recaudo)
            } else {
                const swalWithReact = withReactContent(Swal);
                // Manejar el error aquí
                withReactContent(Swal).fire({
                    title: "Error",
                    text: "Comunica con soporte (cargar resumen)",
                    icon: "error"
                })
            }
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

    function cargarDataFiltro() {
        pedidosConsultados = [];
        setPedidos(pedidosConsultados)
        setConsultado(true);
        clearTimeout(controladorTiempo2);
        offsetPagina = 0;
        cargarData();
    }

    async function cargarData() {
        await axios.post(process.env.ENDPOINT_API + '/despachos/despachoAsesor', {
            transportadora: $("#transportadora").val(),
            tipoEnvio: $("#tipoEnvio").val(),
            estado: $("#estadoEnvio").val(),
            search: $("#buscadorInput").val(),
            fechaInicio: $("#fechaInicio").val(),
            fechaFin: $("#fechaFin").val(),
            offset: offsetPagina,
            limit: limitPagina,
            usuario: usuarioConsulta,
            admin: consultAdmin2,
            orderFecha: 'ASC',
            pedidosConsultados: pedidosConsultados
        }).then(response => {
            if (response.data.bandera == 0) {
                const swalWithReact = withReactContent(Swal);
                // Manejar el error aquí
                withReactContent(Swal).fire({
                    title: "Error",
                    text: "Comunica con soporte (cargar despachos)",
                    icon: "error"
                })
            } else {
                if(response.data.estado == $("#estadoEnvio").val()){
                    setConsultado(false);
                    let dataPedidos = [];

                    for (var i = response.data.pedidos.length - 1; i >= 0; i--) {
                        pedidosConsultados.push(response.data.pedidos[i].referencia);
                        if (usuarioConsulta == 0) {
                            dataPedidos.push(response.data.pedidos[i]);
                        } else {
                            if (response.data.pedidos[i].usuarioId == usuarioConsulta) {
                                dataPedidos.push(response.data.pedidos[i]);
                            }
                        }
                    }

                    let consultarWsTCC = false;
                    for (var i = response.data.rastreoTcc.length - 1; i >= 0; i--) {
                        let agregar = true;
                        for (var e = rastreoGuias.length - 1; e >= 0; e--) {
                            if (rastreoGuias[e].guia == response.data.rastreoTcc[i].numeroremesa) {
                                agregar = false;
                                consultarWsTCC = true;
                            }
                        }
                        if (agregar) {
                            rastreoGuias.push({
                                guia: response.data.rastreoTcc[i].numeroremesa
                            })
                            consultarWsTCC = true;
                        }
                    }

                    if (offsetPagina == 0) {
                        setPedidos(dataPedidos)
                    } else {
                        setPedidos((prevPedidos) => [...prevPedidos, ...dataPedidos]);
                    }

                    if (consultarWsTCC) {
                        //seguimientoGuiasTCC();
                    }

                    if (response.data.pedidos.length == limitPagina) {
                        clearTimeout(controladorTiempo2);
                        controladorTiempo2 = setTimeout(() => {
                            offsetPagina += limitPagina;
                            cargarData()
                        }, 3000);
                        setTotalData(false)
                    }else{
                        setTotalData(true);
                    }
                }
            }
        }).catch(error => {
            console.log(error);
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (cargar despachos)",
                icon: "error"
            })
        });
    }

    async function seguimientoGuiasTCC() {
        await axios.post(process.env.ENDPOINT_API + '/despachos/trasabilidadTCC', {
            guias: rastreoGuias,
        }).then(response => {
            if (response.data.bandera == 1) {
                resultRastreoTCC = response.data.resultTCC['remesasrespuesta']['RemesaEstados'];
                for (var i = resultRastreoTCC.length - 1; i >= 0; i--) {
                    let estados = resultRastreoTCC[i]['listaestados']['Estado'];
                    if (estados.length > 0) {
                        // Convertir las fechas a formato solo con día, mes y año (sin horas)
                        const fechaUltimoMovimiento = new Date(estados[estados.length - 1].fecha);
                        const hoy = new Date();

                        // Normalizar ambas fechas para eliminar horas, minutos y segundos
                        const fechaUltimoMovimientoSoloDia = new Date(fechaUltimoMovimiento.getFullYear(), fechaUltimoMovimiento.getMonth(), fechaUltimoMovimiento.getDate());
                        const hoySoloDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

                        // Calcular la diferencia en días
                        const diferenciaTiempo = hoySoloDia.getTime() - fechaUltimoMovimientoSoloDia.getTime();
                        const diferenciaDias = Math.floor(diferenciaTiempo / (1000 * 3600 * 24));


                        if (diferenciaDias < 2) {
                            $("#guia-" + resultRastreoTCC[i].numeroremesa).css('color', 'inherit');
                        }

                        $("#guia-" + resultRastreoTCC[i].numeroremesa).html(estados[estados.length - 1].descripcion + "<b style='display:block'>" + formatFechaHora(estados[estados.length - 1].fecha) + "</b>")
                    }
                }

            }
        }).catch(error => {
            console.log(error);
        });
    }

    const formatFechaHora = (fechaISO) => {
        if (!fechaISO) {
            // Maneja el caso donde fechaISO es undefined, null o vacío
            return "";
        }
        const date = parseISO(fechaISO);
        if (date != "Invalid Date") {
            // Formatea el día y el mes abreviado con punto al final
            const formattedDate = format(date, "d 'de' MMM. ", { locale: es });
            // Formatea la hora con AM/PM
            const formattedTime = format(date, "hh:mm a");

            return `${formattedDate} ${formattedTime}`;
        }
        return "";
    };

    const formatFecha = (fechaISO) => {
        if (!fechaISO) {
            // Maneja el caso donde fechaISO es undefined, null o vacío
            return "";
        }
        const date = parseISO(fechaISO);
        if (date != "Invalid Date") {
            // Formatea el día y el mes abreviado con punto al final
            const formattedDate = format(date, "d 'de' MMM. ", { locale: es });

            return `${formattedDate}`;
        }
        return "";
    };

    const formattedPrice = (value) => {
        if (typeof value !== 'number') {
            value = Number(value);
        }
        return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    function cerrarModal() {
        setModalSeguimiento(false);
        setModalNovedades(false);
        setModalObservacion(false);
    }

    function trasabilidadEnvio(pedido) {

        $(".resultPedidoModal").html("")

        setModalSeguimiento(true);
        setTimeout(() => {

            let div = "<h3 style='margin-bottom:0px;text-align:center;width:100%'>" + pedido.referencia + "</h3>"
            div += "<div style='text-align:center;border-right:3px solid #e9e9e9' class='col-8'>";
            div += "<p style='text-align:left;margin-top:20px;line-height:14px'>"
            div += "<b>Guia:</b> " + pedido.guia
            div += "<br></br><b>Destinatario:</b> " + pedido.destinatario
            div += "<br></br><b>Cedula:</b> " + pedido.documento
            div += "<br></br><b>Ciudad:</b> " + pedido.ciudaName + " - " + pedido.nameDepartamnento
            div += "<br></br><b>Direccion:</b> " + pedido.direccion
            div += "<br></br><b>Telefono:</b> " + pedido.telefono
            div += "</p></div>"

            div += "<div style='text-align:center' class='col-4'>"
            div += "<div style='display: table;height:100%;width:100%'><div style='display: table-cell;vertical-align: middle'>";
            div += "<h2 style='margin-bottom:0px'>"
            if (pedido.tipoEnvio == 1) {
                div += "Contado</h2>"
            }
            else if (pedido.tipoEnvio == 2) {
                div += "Contra Entrega</h2>"
            }
            else if (pedido.tipoEnvio == 3) {
                div += "Recaudo</h2><p>" + formattedPrice(pedido.recaudo) + "</p>"
            } else if (pedido.tipoEnvio == 4) {
                div += "Recoge En Tienda</h2>"
            }


            div += "</div></div></div>";
            $(".resultPedidoModal").html(div)

            $("#historyPaquete").html('<li><a style="font-weight: bold">' + formatFechaHora(pedido.fechaSalida) + '</a><p>Genero rotulo (' + pedido.usuarioDespachoName + ')</p></li>');
            $("#novedadesPaquete").html('');

            if (pedido.transportadora != 1) {
                $("#historyPaquete").prepend('<li><a style="font-weight: bold">' + formatFechaHora(pedido.fechaRecogida) + '</a><p>Entregado a transportadora</p></li>');
            } else {
                for (var i = resultRastreoTCC.length - 1; i >= 0; i--) {
                    if (resultRastreoTCC[i].numeroremesa == pedido.guia) {
                        let estados = resultRastreoTCC[i]['listaestados']['Estado'];
                        if (estados.length > 0) {
                            for (var e = 0; e < estados.length; e++) {
                                $("#historyPaquete").prepend('<li><a style="font-weight: bold">' + formatFechaHora(estados[e].fecha) + '</a><p>' + estados[e].descripcion + '</p></li>');
                            }
                        }
                        if (resultRastreoTCC[i].listanovedades !== undefined) {
                            let novedades = resultRastreoTCC[i]['listanovedades']['Novedad'];
                            if (novedades.length > 0) {
                                for (var e = 0; e < novedades.length; e++) {
                                    if (novedades[e].estadonovedad == "Informada") {
                                        $("#novedadesPaquete").prepend('<li class="novedadSinSolucion"><a style="font-weight: bold">' + formatFechaHora(novedades[e].fechanovedad) + '</a><p>' + novedades[e].novedad + '</p></li>');
                                    } else {
                                        $("#novedadesPaquete").prepend('<li class="novedadSolucionada"><a style="font-weight: bold">' + formatFechaHora(novedades[e].fechanovedad) + '</a><p>' + novedades[e].novedad + '</p></li>');
                                    }

                                }
                            }
                        } else {
                            $("#novedadesPaquete").html('<span>Sin novedades</span>')
                        }

                    }
                }
            }

        }, 100);

    }

    function novedadesEnvio(pedido) {
        setModalNovedades(true);
        $(".resultPedidoModal").html("")
        $("#novedadesPaqueteAsesor").html("")
        setNovedadesAsesor(pedido.novedades);
        let arraySoluciones = pedido.novedades[pedido.novedades.length - 1].posibleSoluccion.split(',');
        $("#divReofrecimiento").hide();
        $("#direccionNueva").hide();
        if (arraySoluciones.length > 0) {
            if (arraySoluciones[0] == 'RE-OFRECIMIENTO') {
                $("#divReofrecimiento").show();
            }
        }

        setTimeout(() => {

            $(".resultPedidoModal").html("")

            let div = "<h3 style='margin-bottom:0px;text-align:center;width:100%'>" + pedido.referencia + "</h3>"
            div += "<div style='text-align:center;border-right:3px solid #e9e9e9' class='col-8'>";
            div += "<p style='text-align:left;margin-top:20px;line-height:14px'>"
            div += "<b>Guia:</b> " + pedido.guia
            div += "<br></br><b>Destinatario:</b> " + pedido.destinatario
            div += "<br></br><b>Cedula:</b> " + pedido.documento
            div += "<br></br><b>Ciudad:</b> " + pedido.ciudaName + " - " + pedido.nameDepartamnento
            div += "<br></br><b>Direccion:</b> " + pedido.direccion
            div += "<br></br><b>Telefono:</b> " + pedido.telefono
            div += "</p></div>"

            div += "<div style='text-align:center' class='col-4'>"
            div += "<div style='display: table;height:100%;width:100%'><div style='display: table-cell;vertical-align: middle'>";
            div += "<h2 style='margin-bottom:0px'>"
            if (pedido.tipoEnvio == 1) {
                div += "Contado</h2>"
            }
            else if (pedido.tipoEnvio == 2) {
                div += "Contra Entrega</h2>"
            }
            else if (pedido.tipoEnvio == 3) {
                div += "Recaudo</h2><p>" + formattedPrice(pedido.recaudo) + "</p>"
            } else if (pedido.tipoEnvio == 4) {
                div += "Recoge En Tienda</h2>"
            }


            div += "</div></div></div>";
            $(".resultPedidoModal").html(div)

        }, 100);

    }

    //buscador de datos de facturacion
    const handleBuscador = (event) => {
        setConsultado(true);
        clearTimeout(controladorTiempo);
        controladorTiempo = setTimeout(() => cargarDataFiltro(), 100);
    }


    async function solucionarNovedad(id) {
        $("#alertNovedad-" + id).hide().html("Debes ingresar un comentario");
        if ($("#observacionNovedad").val().length == 0) {
            $("#alertNovedad-" + id).hide().html("Debes ingresar una observacion");
            $("#alertNovedad-" + id).show();
            return 0
        } else if ($("#fechaReofrecimiento-" + id).val().length == 0) {
            $("#alertNovedad-" + id).hide().html("Debes ingresar la fecha de Re-ofrecimiento");
            $("#alertNovedad-" + id).show();
            return 0
        } else if ($("#direccionNueva").val().length == 0 && $("#otraDireccion").prop('checked') == true) {
            $("#alertNovedad-" + id).hide().html("Debes ingresar la direccion nueva");
            $("#alertNovedad-" + id).show();
            return 0
        } else {
            $("#alertNovedad-" + id).show().html("Procesando informacion");
            await axios.post(process.env.ENDPOINT_API + '/despachos/solucionNovedad', {
                novedad: id,
                observacion: $("#observacionNovedad").val(),
                solucion: $("#opcionNovedad-" + id).val(),
                otraDirecion: $("#otraDireccion").prop('checked'),
                fechaReofrecimiento: $("#fechaReofrecimiento-" + id).val(),
                direccionNueva: $("#direccionNueva").val(),
                usuario: usuarioId
            }).then(response => {
                $("#alertNovedad-" + id).hide()
                const now = new Date();

                //momento de subida
                const ano = now.getFullYear();
                const mes = String(now.getMonth() + 1).padStart(2, '0'); // Los meses en JavaScript son 0-indexed
                const dia = String(now.getDate()).padStart(2, '0');

                const horas = String(now.getHours()).padStart(2, '0');
                const minutos = String(now.getMinutes()).padStart(2, '0');
                const segundos = String(now.getSeconds()).padStart(2, '0');

                const fechaSubida = `${ano}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;

                setNovedadesAsesor(prevNovedadesAsesor =>
                    prevNovedadesAsesor.map(novedad =>
                        // Verificamos si el id es igual a 1
                        novedad.id === id
                            ? { ...novedad, estado: 2, solucion: $("#opcionNovedad-" + id + " option:selected").text(), observacionSolucion: $("#observacionNovedad").val(), asesor: nombreUsuario, fechaSolucion: fechaSubida, reofrecimiento: response.data.reofrecimiento, nuevaDireccion: response.data.nuevaDireccion } // Cambiamos el estado si id es 1
                            : novedad // Si no es el id 1, lo dejamos igual
                    )
                );
                offsetPagina = 0;
                cargarData()
                cargarResult();
            }).catch(error => {
                $("#alertNovedad-" + id).show().html("ERROR - Comunica con soporte (Reportar solucion)");
            });
        }
    }

    async function canceladoEnvio(pedido) {
        const swalWithReact = withReactContent(Swal);
        swalWithReact.fire({
            title: "No Reparto",
            html: "¿Esta segur@ que el pedido " + pedido.referencia + " no salio a reparto?",
            showCancelButton: true,
            confirmButtonText: "Si", // Texto personalizado para el botón de confirmación
            cancelButtonText: "No", // Texto personalizado para el botón de cancelación
            allowOutsideClick: false
        }).then(async (result) => {
            if (result.isConfirmed) {
                const swalWithReact = withReactContent(Swal);
                swalWithReact.fire({
                    title: "Aprobando",
                    text: "Por favor, espera un momento...",
                    icon: "info",
                    showConfirmButton: false, // Ocultar el botón de confirmación
                    allowOutsideClick: false // Evitar cerrar el SweetAlert haciendo clic fuera de él
                });

                await axios.post(process.env.ENDPOINT_API + '/despachos/NoReparto', {
                    guia: pedido.guia,
                    usuario: usuarioId
                }).then(response => {

                    withReactContent(Swal).fire({
                        title: "Registrado",
                        text: "Trasabilidad reportada",
                        icon: "success",
                        showConfirmButton: false, // Ocultar el botón de confirmación
                        timer: 2000 // Cerrar automáticamente después de 2 segundos
                    });
                    offsetPagina = 0;
                    cargarData()
                    cargarResult();

                }).catch(error => {
                    const swalWithReact = withReactContent(Swal);
                    // Manejar el error aquí
                    withReactContent(Swal).fire({
                        title: "Error",
                        text: "Comunica con soporte (reportar entrega)",
                        icon: "error"
                    })
                })
            }
        })
    }

    async function aprobadoEnvio(pedido) {
        const swalWithReact = withReactContent(Swal);
        swalWithReact.fire({
            title: "Confirmación",
            html: "¿Esta segur@ que el pedido " + pedido.referencia + " salio a reparto?",
            showCancelButton: true,
            confirmButtonText: "Si", // Texto personalizado para el botón de confirmación
            cancelButtonText: "No", // Texto personalizado para el botón de cancelación
            allowOutsideClick: false
        }).then(async (result) => {
            if (result.isConfirmed) {
                const swalWithReact = withReactContent(Swal);
                swalWithReact.fire({
                    title: "Aprobando",
                    text: "Por favor, espera un momento...",
                    icon: "info",
                    showConfirmButton: false, // Ocultar el botón de confirmación
                    allowOutsideClick: false // Evitar cerrar el SweetAlert haciendo clic fuera de él
                });

                await axios.post(process.env.ENDPOINT_API + '/despachos/pedidoTrasabilidad', {
                    guia: pedido.guia,
                    usuario: usuarioId,
                    estado: "Viajando a destino",
                    codigo: "500"
                }).then(response => {

                    withReactContent(Swal).fire({
                        title: "Registrado",
                        text: "Trasabilidad reportada",
                        icon: "success",
                        showConfirmButton: false, // Ocultar el botón de confirmación
                        timer: 2000 // Cerrar automáticamente después de 2 segundos
                    });
                    offsetPagina = 0;
                    cargarData()
                    cargarResult();

                }).catch(error => {
                    const swalWithReact = withReactContent(Swal);
                    // Manejar el error aquí
                    withReactContent(Swal).fire({
                        title: "Error",
                        text: "Comunica con soporte (reportar entrega)",
                        icon: "error"
                    })
                })
            }
        })
    }

    async function esOficina(pedido) {
        const swalWithReact = withReactContent(Swal);

        swalWithReact.fire({
            title: "Confirmación",
            html: `
                <p>¿Está segur@ que el pedido <b>${pedido.referencia}</b> es para oficina?</p>
            `,
            showCancelButton: true,
            confirmButtonText: "Si",
            cancelButtonText: "No",
            allowOutsideClick: false
        }).then(async (result) => {
            console.log(result);
            if (result.isConfirmed) {
                const swalWithReact = withReactContent(Swal);
                swalWithReact.fire({
                    title: "Aprobando",
                    text: "Por favor, espera un momento...",
                    icon: "info",
                    showConfirmButton: false, // Ocultar el botón de confirmación
                    allowOutsideClick: false // Evitar cerrar el SweetAlert haciendo clic fuera de él
                });

                await axios.post(process.env.ENDPOINT_API + '/despachos/pedidoTrasabilidad', {
                    guia: pedido.guia,
                    usuario: usuarioId,
                    direccion: result.value,
                    oficina: 1,
                    pedido: pedido.referencia
                }).then(response => {

                    withReactContent(Swal).fire({
                        title: "Registrado",
                        text: "Cambio reportado",
                        icon: "success",
                        showConfirmButton: false, // Ocultar el botón de confirmación
                        timer: 2000 // Cerrar automáticamente después de 2 segundos
                    });
                    offsetPagina = 0;
                    cargarData()
                    cargarResult();

                }).catch(error => {
                    const swalWithReact = withReactContent(Swal);
                    // Manejar el error aquí
                    withReactContent(Swal).fire({
                        title: "Error",
                        text: "Comunica con soporte (reportar entrega)",
                        icon: "error"
                    })
                })
            }
        })
    }
    async function disponibleOficina(pedido) {
        const swalWithReact = withReactContent(Swal);

        swalWithReact.fire({
            title: "Confirmación",
            html: `
                <p>¿Está segur@ que el pedido <b>${pedido.referencia}</b> ya llegó a la oficina?</p>
                <div style="border-top:2px solid #c9c9c9;padding-top:11px;">
                    <label >Direccion de la oficina</label>    
                    <input type="text" id="direccion" class="swal2-input" placeholder="...">
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: "Si",
            cancelButtonText: "No",
            allowOutsideClick: false,
            preConfirm: () => {
                const direccion = document.getElementById("direccion").value.trim();
                if (!direccion) {
                    Swal.showValidationMessage("Debe ingresar la dirección de la oficina");
                    return false; // Detiene el cierre del modal
                }
                return direccion; // Retorna la dirección si es válida
            }
        }).then(async (result) => {
            console.log(result);
            if (result.isConfirmed) {
                const swalWithReact = withReactContent(Swal);
                swalWithReact.fire({
                    title: "Aprobando",
                    text: "Por favor, espera un momento...",
                    icon: "info",
                    showConfirmButton: false, // Ocultar el botón de confirmación
                    allowOutsideClick: false // Evitar cerrar el SweetAlert haciendo clic fuera de él
                });

                await axios.post(process.env.ENDPOINT_API + '/despachos/pedidoTrasabilidad', {
                    guia: pedido.guia,
                    usuario: usuarioId,
                    direccion: result.value,
                    estado: "En oficina",
                    codigo: "5000"
                }).then(response => {

                    withReactContent(Swal).fire({
                        title: "Registrado",
                        text: "Trasabilidad reportada",
                        icon: "success",
                        showConfirmButton: false, // Ocultar el botón de confirmación
                        timer: 2000 // Cerrar automáticamente después de 2 segundos
                    });
                    offsetPagina = 0;
                    cargarData()
                    cargarResult();

                }).catch(error => {
                    const swalWithReact = withReactContent(Swal);
                    // Manejar el error aquí
                    withReactContent(Swal).fire({
                        title: "Error",
                        text: "Comunica con soporte (reportar entrega)",
                        icon: "error"
                    })
                })
            }
        })
    }

    async function devolucionEnvio(pedido) {
        const swalWithReact = withReactContent(Swal);
        swalWithReact.fire({
            title: "Confirmación",
            html: "¿Esta segur@ que el pedido " + pedido.referencia + " es una devolución?",
            showCancelButton: true,
            confirmButtonText: "Si", // Texto personalizado para el botón de confirmación
            cancelButtonText: "No", // Texto personalizado para el botón de cancelación
            allowOutsideClick: false
        }).then(async (result) => {
            if (result.isConfirmed) {
                const swalWithReact = withReactContent(Swal);
                swalWithReact.fire({
                    title: "Aprobando",
                    text: "Por favor, espera un momento...",
                    icon: "info",
                    showConfirmButton: false, // Ocultar el botón de confirmación
                    allowOutsideClick: false // Evitar cerrar el SweetAlert haciendo clic fuera de él
                });

                await axios.post(process.env.ENDPOINT_API + '/despachos/pedidoTrasabilidad', {
                    guia: pedido.guia,
                    usuario: usuarioId,
                    estado: "Devolución",
                    codigo: "1000"
                }).then(response => {

                    withReactContent(Swal).fire({
                        title: "Registrado",
                        text: "Trasabilidad reportada",
                        icon: "success",
                        showConfirmButton: false, // Ocultar el botón de confirmación
                        timer: 2000 // Cerrar automáticamente después de 2 segundos
                    });
                    offsetPagina = 0;
                    cargarData()
                    cargarResult();

                }).catch(error => {
                    const swalWithReact = withReactContent(Swal);
                    // Manejar el error aquí
                    withReactContent(Swal).fire({
                        title: "Error",
                        text: "Comunica con soporte (reportar entrega)",
                        icon: "error"
                    })
                })
            }
        })
    }

    async function entregadoEnvio(pedido) {
        const swalWithReact = withReactContent(Swal);
        swalWithReact.fire({
            title: "Confirmación",
            html: "¿Esta segur@ que el pedido " + pedido.referencia + " fue entregado al destinatario?",
            showCancelButton: true,
            confirmButtonText: "Si", // Texto personalizado para el botón de confirmación
            cancelButtonText: "No", // Texto personalizado para el botón de cancelación
            allowOutsideClick: false
        }).then(async (result) => {
            if (result.isConfirmed) {
                const swalWithReact = withReactContent(Swal);
                swalWithReact.fire({
                    title: "Aprobando",
                    text: "Por favor, espera un momento...",
                    icon: "info",
                    showConfirmButton: false, // Ocultar el botón de confirmación
                    allowOutsideClick: false // Evitar cerrar el SweetAlert haciendo clic fuera de él
                });

                await axios.post(process.env.ENDPOINT_API + '/despachos/pedidoTrasabilidad', {
                    guia: pedido.guia,
                    usuario: usuarioId,
                    estado: "Envío entregado al destinatario",
                    codigo: "3000"
                }).then(response => {

                    withReactContent(Swal).fire({
                        title: "Registrado",
                        text: "Trasabilidad reportada",
                        icon: "success",
                        showConfirmButton: false, // Ocultar el botón de confirmación
                        timer: 2000 // Cerrar automáticamente después de 2 segundos
                    });
                    offsetPagina = 0;
                    cargarData()
                    cargarResult();

                }).catch(error => {
                    const swalWithReact = withReactContent(Swal);
                    // Manejar el error aquí
                    withReactContent(Swal).fire({
                        title: "Error",
                        text: "Comunica con soporte (reportar entrega)",
                        icon: "error"
                    })
                })
            }
        })
    }

    async function envioEntregadoRecibo(pedido) {
        const swalWithReact = withReactContent(Swal);

        swalWithReact.fire({
            title: "Confirmación",
            html: `<p>¿Está segur@ que el pedido <strong>${pedido.referencia}</strong> fue entregado?</p>
                <input id="numeroRecibo" class="swal2-input" placeholder="Número de recibo">`,
            showCancelButton: true,
            confirmButtonText: "Sí",
            cancelButtonText: "No",
            allowOutsideClick: false,
            preConfirm: () => {
                const numeroRecibo = document.getElementById('numeroRecibo').value;
                if (!numeroRecibo) {
                    Swal.showValidationMessage("Debe ingresar un número de recibo");
                }
                return numeroRecibo;
            }
        }).then(async (result) => {
    if (result.isConfirmed && result.value) {
                const swalWithReact = withReactContent(Swal);
                swalWithReact.fire({
                    title: "Aprobando",
                    text: "Por favor, espera un momento...",
                    icon: "info",
                    showConfirmButton: false, // Ocultar el botón de confirmación
                    allowOutsideClick: false // Evitar cerrar el SweetAlert haciendo clic fuera de él
                });

                await axios.post(process.env.ENDPOINT_API + '/despachos/pedidoEntregado', {
                    pedido: pedido.referencia,
                    usuario: usuarioId,
                    recibo: result.value // Usar el número de recibo ingresado
                }).then(response => {

                    withReactContent(Swal).fire({
                        title: "Registrado",
                        text: "Entrega reportada",
                        icon: "success",
                        showConfirmButton: false, // Ocultar el botón de confirmación
                        timer: 2000 // Cerrar automáticamente después de 2 segundos
                    });
                    offsetPagina = 0;
                    cargarData()
                    cargarResult();

                }).catch(error => {
                    const swalWithReact = withReactContent(Swal);
                    // Manejar el error aquí
                    withReactContent(Swal).fire({
                        title: "Error",
                        text: "Comunica con soporte (reportar entrega)",
                        icon: "error"
                    })
                })
            }
        })
    }

    async function envioEntregado(pedido) {
        const swalWithReact = withReactContent(Swal);
        swalWithReact.fire({
            title: "Confirmación",
            html: "¿Esta segur@ que el pedido " + pedido.referencia + " fue entregado?",
            showCancelButton: true,
            confirmButtonText: "Si", // Texto personalizado para el botón de confirmación
            cancelButtonText: "No", // Texto personalizado para el botón de cancelación
            allowOutsideClick: false
        }).then(async (result) => {
            if (result.isConfirmed) {
                const swalWithReact = withReactContent(Swal);
                swalWithReact.fire({
                    title: "Aprobando",
                    text: "Por favor, espera un momento...",
                    icon: "info",
                    showConfirmButton: false, // Ocultar el botón de confirmación
                    allowOutsideClick: false // Evitar cerrar el SweetAlert haciendo clic fuera de él
                });

                await axios.post(process.env.ENDPOINT_API + '/despachos/pedidoEntregado', {
                    pedido: pedido.referencia,
                    usuario: usuarioId
                }).then(response => {

                    withReactContent(Swal).fire({
                        title: "Registrado",
                        text: "Entrega reportada",
                        icon: "success",
                        showConfirmButton: false, // Ocultar el botón de confirmación
                        timer: 2000 // Cerrar automáticamente después de 2 segundos
                    });
                    offsetPagina = 0;
                    cargarData()
                    cargarResult();

                }).catch(error => {
                    const swalWithReact = withReactContent(Swal);
                    // Manejar el error aquí
                    withReactContent(Swal).fire({
                        title: "Error",
                        text: "Comunica con soporte (reportar entrega)",
                        icon: "error"
                    })
                })
            }
        })
    }

    function filtroResultEstado(bandera) {
        setConsultado(true);
        clearTimeout(controladorTiempo2);
        $("#estadoEnvio").val(bandera);
        $("#tipoEnvio").val(3);
        offsetPagina = 0;
        cargarData()
        cargarResult();
    }

    function filtroResultEstado2(bandera, transportadora) {
        setConsultado(true);
        $("#estadoEnvio").val(bandera);
        $("#tipoEnvio").val(0);
        $("#transportadora").val(transportadora);
        offsetPagina = 0;
        clearTimeout(controladorTiempo2);
        cargarData()
        cargarResult();
    }

    function cambioAsesor() {
        clearTimeout(controladorTiempo2);
        setConsultado(true);
        usuarioConsulta = $("#asesores").val();
        $("#estadoEnvio").val(3);
        $("#tipoEnvio").val(0);
        $("#transportadora").val(0);
        offsetPagina = 0;
        cargarData()
        cargarResult();
    }

    function observacionesGuia(pedido) {
        setModalObservacion(true);
        $(".resultPedidoModal").html("")
        pedidoEdit = pedido;
        setTimeout(() => {
            cargarObservacionesPedido(pedidoEdit.referencia)

            $(".resultPedidoModal").html("")

            let div = "<h3 style='margin-bottom:0px;text-align:center;width:100%'>" + pedido.referencia + "</h3>"
            div += "<div style='text-align:center;border-right:3px solid #e9e9e9' class='col-8'>";
            div += "<p style='text-align:left;margin-top:20px;line-height:14px'>"
            div += "<b>Guia:</b> " + pedido.guia
            div += "<br></br><b>Destinatario:</b> " + pedido.destinatario
            div += "<br></br><b>Cedula:</b> " + pedido.documento
            div += "<br></br><b>Ciudad:</b> " + pedido.ciudaName + " - " + pedido.nameDepartamnento
            div += "<br></br><b>Direccion:</b> " + pedido.direccion
            div += "<br></br><b>Telefono:</b> " + pedido.telefono
            div += "</p></div>"

            div += "<div style='text-align:center' class='col-4'>"
            div += "<div style='display: table;height:100%;width:100%'><div style='display: table-cell;vertical-align: middle'>";
            div += "<h2 style='margin-bottom:0px'>"
            if (pedido.tipoEnvio == 1) {
                div += "Contado</h2>"
            }
            else if (pedido.tipoEnvio == 2) {
                div += "Contra Entrega</h2>"
            }
            else if (pedido.tipoEnvio == 3) {
                div += "Recaudo</h2><p>" + formattedPrice(pedido.recaudo) + "</p>"
            } else if (pedido.tipoEnvio == 4) {
                div += "Recoge En Tienda</h2>"
            }


            div += "</div></div></div>";
            $(".resultPedidoModal").html(div)

        }, 100);
    }

    async function reportarObservacion() {
        $("#alertObservacion").hide().html("Debes ingresar una observacion");
        if ($("#observacion").val().length == 0) {
            $("#alertObservacion").show();
            return 0
        } else {
            await axios.post(process.env.ENDPOINT_API + '/despachos/reporteObservacion', {
                pedido: pedidoEdit.referencia,
                observacion: $("#observacion").val(),
                usuario: usuarioId
            }).then(response => {
                cargarObservacionesPedido(pedidoEdit.referencia)
            }).catch(error => {
                $("#alertObservacion").show().html("ERROR - Comunica con soporte (Reportar observacion)");
            });

        }
    }

    async function cargarObservacionesPedido(referencia) {
        $("#observacionPaquete").html("Consultando...")
        await axios.post(process.env.ENDPOINT_API + '/despachos/dataObservaciones', {
            pedido: referencia,
        }).then(response => {
            $("#observacionPaquete").html("")
            if (response.data.observaciones.length > 0) {
                for (var i = response.data.observaciones.length - 1; i >= 0; i--) {
                    $("#observacionPaquete").prepend('<li><a style="font-weight: bold">' + formatFechaHora(response.data.observaciones[i].fecha) + " - " + response.data.observaciones[i].name + '</a><p>' + response.data.observaciones[i].observacion + '</p></li>');
                }
            } else {
                $("#observacionPaquete").html("No tiene registros");
            }
        }).catch(error => {
            $("#observacionPaquete").html("ERROR - Comunica con soporte (consultar observaciones)");
        });
    }

    function handleSolucionNovedad(event) {
        $("#divpreguntaOtraCiudad").hide();
        $("#divReofrecimiento").hide()
        $("#otraDireccion").prop('checked', false)
        if (event.target.value == 'RE-OFRECIMIENTO') {
            $("#divpreguntaOtraCiudad").show(100)
            $("#divReofrecimiento").show()
            $("#direccionNueva").hide();
        }
    }

    function handleCheckboxOtraDireccion() {
        if ($("#otraDireccion").prop('checked')) {
            $("#direccionNueva").show();
        } else {
            $("#direccionNueva").hide();
        }

    }

    function devolucionRecibida(pedido) {
        const swalWithReact = withReactContent(Swal);
        swalWithReact.fire({
            title: "Recibido",
            html: "¿Esta segur@ que el pedido " + pedido.referencia + " con guia " + pedido.guia + " llego a nuestras oficinas?",
            showCancelButton: true,
            confirmButtonText: "Si", // Texto personalizado para el botón de confirmación
            cancelButtonText: "No", // Texto personalizado para el botón de cancelación
            allowOutsideClick: false
        }).then(async (result) => {
            if (result.isConfirmed) {
                const swalWithReact = withReactContent(Swal);
                swalWithReact.fire({
                    title: "Aprobando",
                    text: "Por favor, espera un momento...",
                    icon: "info",
                    showConfirmButton: false, // Ocultar el botón de confirmación
                    allowOutsideClick: false // Evitar cerrar el SweetAlert haciendo clic fuera de él
                });

                await axios.post(process.env.ENDPOINT_API + '/despachos/devolucionRecibida', {
                    guia: pedido.guia,
                    usuario: usuarioId
                }).then(response => {

                    withReactContent(Swal).fire({
                        title: "Registrado",
                        text: "Trasabilidad reportada",
                        icon: "success",
                        showConfirmButton: false, // Ocultar el botón de confirmación
                        timer: 2000 // Cerrar automáticamente después de 2 segundos
                    });
                    offsetPagina = 0;
                    cargarData()
                    cargarResult();

                }).catch(error => {
                    const swalWithReact = withReactContent(Swal);
                    // Manejar el error aquí
                    withReactContent(Swal).fire({
                        title: "Error",
                        text: "Comunica con soporte (reportar entrega)",
                        icon: "error"
                    })
                })
            }
        })
    }

    function devolucionNota(pedido) {
        const swalWithReact = withReactContent(Swal);
        swalWithReact.fire({
            title: "Desarmar",
            html: "¿Esta segur@ de pasar el pedido " + pedido.referencia + " para ser desarmado?",
            showCancelButton: true,
            confirmButtonText: "Si", // Texto personalizado para el botón de confirmación
            cancelButtonText: "No", // Texto personalizado para el botón de cancelación
            allowOutsideClick: false
        }).then(async (result) => {
            if (result.isConfirmed) {
                const swalWithReact = withReactContent(Swal);
                swalWithReact.fire({
                    title: "Aprobando",
                    text: "Por favor, espera un momento...",
                    icon: "info",
                    showConfirmButton: false, // Ocultar el botón de confirmación
                    allowOutsideClick: false // Evitar cerrar el SweetAlert haciendo clic fuera de él
                });

                await axios.post(process.env.ENDPOINT_API + '/despachos/devolucionRecibida', {
                    guia: pedido.guia,
                    usuario: usuarioId,
                    pedido: pedido.referencia,
                    bandera: 1
                }).then(response => {

                    withReactContent(Swal).fire({
                        title: "Registrado",
                        text: "Trasabilidad reportada",
                        icon: "success",
                        showConfirmButton: false, // Ocultar el botón de confirmación
                        timer: 2000 // Cerrar automáticamente después de 2 segundos
                    });
                    offsetPagina = 0;
                    cargarData()
                    cargarResult();

                }).catch(error => {
                    const swalWithReact = withReactContent(Swal);
                    // Manejar el error aquí
                    withReactContent(Swal).fire({
                        title: "Error",
                        text: "Comunica con soporte (reportar entrega)",
                        icon: "error"
                    })
                })
            }
        })
    }

    function devolucionEsperando(pedido) {
        const swalWithReact = withReactContent(Swal);
        swalWithReact.fire({
            title: "Desarmar",
            html: "¿Esta segur@ de pasar el pedido " + pedido.referencia + " a espera?",
            showCancelButton: true,
            confirmButtonText: "Si", // Texto personalizado para el botón de confirmación
            cancelButtonText: "No", // Texto personalizado para el botón de cancelación
            allowOutsideClick: false
        }).then(async (result) => {
            if (result.isConfirmed) {
                const swalWithReact = withReactContent(Swal);
                swalWithReact.fire({
                    title: "Aprobando",
                    text: "Por favor, espera un momento...",
                    icon: "info",
                    showConfirmButton: false, // Ocultar el botón de confirmación
                    allowOutsideClick: false // Evitar cerrar el SweetAlert haciendo clic fuera de él
                });

                await axios.post(process.env.ENDPOINT_API + '/despachos/devolucionRecibida', {
                    guia: pedido.guia,
                    usuario: usuarioId,
                    pedido: pedido.referencia,
                    bandera: 2
                }).then(response => {

                    withReactContent(Swal).fire({
                        title: "Registrado",
                        text: "Trasabilidad reportada",
                        icon: "success",
                        showConfirmButton: false, // Ocultar el botón de confirmación
                        timer: 2000 // Cerrar automáticamente después de 2 segundos
                    });
                    offsetPagina = 0;
                    cargarData()
                    cargarResult();

                }).catch(error => {
                    const swalWithReact = withReactContent(Swal);
                    // Manejar el error aquí
                    withReactContent(Swal).fire({
                        title: "Error",
                        text: "Comunica con soporte (reportar entrega)",
                        icon: "error"
                    })
                })
            }
        })
    }

    function devolucionFalse(pedido) {
        const swalWithReact = withReactContent(Swal);
        swalWithReact.fire({
            title: "Desarmar",
            html: "¿Esta segur@ que es un recibo falso el pedido " + pedido.referencia + "?",
            showCancelButton: true,
            confirmButtonText: "Si", // Texto personalizado para el botón de confirmación
            cancelButtonText: "No", // Texto personalizado para el botón de cancelación
            allowOutsideClick: false
        }).then(async (result) => {
            if (result.isConfirmed) {
                const swalWithReact = withReactContent(Swal);
                swalWithReact.fire({
                    title: "Aprobando",
                    text: "Por favor, espera un momento...",
                    icon: "info",
                    showConfirmButton: false, // Ocultar el botón de confirmación
                    allowOutsideClick: false // Evitar cerrar el SweetAlert haciendo clic fuera de él
                });

                await axios.post(process.env.ENDPOINT_API + '/despachos/devolucionRecibida', {
                    guia: pedido.guia,
                    usuario: usuarioId,
                    pedido: pedido.referencia,
                    bandera: 3
                }).then(response => {

                    withReactContent(Swal).fire({
                        title: "Registrado",
                        text: "Trasabilidad reportada",
                        icon: "success",
                        showConfirmButton: false, // Ocultar el botón de confirmación
                        timer: 2000 // Cerrar automáticamente después de 2 segundos
                    });
                    offsetPagina = 0;
                    cargarData()
                    cargarResult();

                }).catch(error => {
                    const swalWithReact = withReactContent(Swal);
                    // Manejar el error aquí
                    withReactContent(Swal).fire({
                        title: "Error",
                        text: "Comunica con soporte (reportar entrega)",
                        icon: "error"
                    })
                })
            }
        })
    }

    return <>

        <Modal show={modalObservacion} className="modal-lg" onHide={cerrarModal}>
            <Modal.Header closeButton>
            </Modal.Header>
            <Modal.Body style={{ marginTop: '-40px' }}>
                <div className='row'>
                    <div className='col-12'>
                        <div className='row resultPedidoModal'>

                        </div>
                    </div>
                    <div className='col-12' style={{ marginTop: '10px' }}>
                        <div className="alert alert-danger" id='alertObservacion' style={{ display: 'none' }} role="alert">
                            Debes ingresar una observacion
                        </div>
                        <textarea id='observacion' className="form-control" rows="3"></textarea>
                        <div style={{ textAlign: 'right', marginTop: '10px' }}>
                            <button onClick={() => reportarObservacion()} className="btn btn-primary">Reportar</button>
                        </div>

                        <p style={{ textAlign: 'center', background: '#e9e9e9', marginTop: '10px' }}>Observaciones</p>
                        <ul className="timeline" id="observacionPaquete">

                        </ul>
                    </div>
                </div>
            </Modal.Body>
        </Modal>

        <Modal show={modalSeguimiento} className="modal-lg" onHide={cerrarModal}>
            <Modal.Header closeButton>
            </Modal.Header>
            <Modal.Body style={{ marginTop: '-40px' }}>
                <div className='row'>
                    <div className='col-12'>
                        <div className='row resultPedidoModal'>

                        </div>
                    </div>
                    <div className='col-6' style={{ marginTop: '10px' }}>
                        <p style={{ textAlign: 'center', background: '#e9e9e9' }}>Historial</p>
                        <ul className="timeline" id="historyPaquete">

                        </ul>
                    </div>
                    <div className='col-6' style={{ marginTop: '10px' }}>
                        <p style={{ textAlign: 'center', background: '#e9e9e9' }}>Novedades</p>
                        <ul className="timeline" id="novedadesPaquete">

                        </ul>
                    </div>
                </div>
            </Modal.Body>
        </Modal>

        <Modal show={modalNovedades} className="modal-lg" onHide={cerrarModal}>
            <Modal.Header closeButton>
            </Modal.Header>
            <Modal.Body style={{ marginTop: '-40px' }}>
                <div className='row'>
                    <div className='col-12'>
                        <div className='row resultPedidoModal'>

                        </div>
                    </div>
                    <div className='col-12' style={{ marginTop: '10px' }}>
                        <p style={{ textAlign: 'center', background: '#e9e9e9' }}>Novedades</p>
                        <ul className="timeline" id="novedadesPaqueteAsesor">
                            {novedadesASesor.slice().reverse().map((novedad, index) => {
                                return (

                                    <React.Fragment key={index}>
                                        {novedad.estado == 1 ? (
                                            <li className="novedadSinSolucion">
                                                <a style={{ fontWeight: "bold" }}>{formatFechaHora(novedad.fecha)}</a>
                                                <p>{novedad.novedad}</p>
                                                <p style={{ background: '#e9e9e9', padding: '10px', textAlign: 'center' }}>{novedad.comentarioNovedad}</p>
                                                <div>
                                                    <div className="alert alert-danger" id={`alertNovedad-${novedad.id}`} style={{ display: 'none' }} role="alert">
                                                        Debes ingresar un comentario
                                                    </div>
                                                    <label>Solución:</label>
                                                    <select id={`opcionNovedad-${novedad.id}`} onChange={(e) => handleSolucionNovedad(e)} className="form-control">
                                                        {novedad.posibleSoluccion.split(',').map((solucion, index) => {
                                                            return (<option value={solucion}>{solucion}</option>)
                                                        })}
                                                    </select>
                                                    <div className="form-check" id="divpreguntaOtraCiudad" style={{ marginLeft: '10px' }}>
                                                        <input id="otraDireccion" className="form-check-input" type="checkbox" onClick={handleCheckboxOtraDireccion} value=""></input>
                                                        <label className="form-check-label">
                                                            En otra direccion
                                                        </label>
                                                    </div>
                                                    <div style={{ height: '1px', width: '100%', background: '#d4d9df', margin: 'auto', marginTop: '20px' }}>

                                                    </div>
                                                    <div id='divReofrecimiento' >
                                                        <label style={{ marginTop: '10px' }}>Fecha Re-ofrecimiento:</label>
                                                        <input id={`fechaReofrecimiento-${novedad.id}`} type='Date' className="form-control" min={new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]} ></input>

                                                        <div id='direccionNueva' style={{ display: 'none' }}>
                                                            <label style={{ marginTop: '10px' }}>Direccion Nueva:</label>
                                                            <textarea id={`direccionNueva-${novedad.id}`} className="form-control" rows="3"></textarea>
                                                        </div>
                                                    </div>

                                                    <label style={{ marginTop: '10px' }}>Observacion:</label>
                                                    <textarea id={`observacionNovedad`} className="form-control" rows="3"></textarea>
                                                    <div style={{ textAlign: 'right', marginTop: '10px' }}>
                                                        <button onClick={() => solucionarNovedad(novedad.id)} className="btn btn-primary">Reportar</button>
                                                    </div>
                                                </div>
                                            </li>

                                        ) : novedad.estado == 2 ? (
                                            <li className="novedadPendiente">
                                                <a style={{ fontWeight: "bold" }}>{formatFechaHora(novedad.fecha)}</a>
                                                <p>{novedad.novedad}</p>
                                                <div>
                                                    <b>{novedad.solucion} - {formatFecha(novedad.reofrecimientoFecha)}</b>
                                                    {novedad.nuevaDireccion != 'NULL' && (
                                                        <>
                                                            <br></br>
                                                            <div style={{ background: '#e9e9e9', padding: '10px', width: '90%', margin: 'auto' }}>Nueva Dir: {novedad.nuevaDireccion}</div>
                                                        </>
                                                    )}
                                                    <br></br>
                                                    "{novedad.observacionSolucion}"
                                                    <div style={{ textAlign: 'right', borderTop: '3px solid #e9e9e9' }}>
                                                        Ase. {novedad.asesor} - {formatFechaHora(novedad.fechaSolucion)}
                                                    </div>
                                                </div>
                                            </li>
                                        ) : (
                                            <li className="novedadSolucionada">
                                                <a style={{ fontWeight: "bold" }}>{formatFechaHora(novedad.fecha)}</a>
                                                <p>{novedad.novedad}</p>
                                                <div>
                                                    <b>{novedad.solucion} - {formatFecha(novedad.reofrecimientoFecha)}</b>
                                                    {novedad.nuevaDireccion != 'NULL' && (
                                                        <>
                                                            <br></br>
                                                            <div style={{ background: '#e9e9e9', padding: '10px', width: '90%', margin: 'auto' }}>Nueva Dir: {novedad.nuevaDireccion}</div>
                                                        </>
                                                    )}
                                                    <br></br>
                                                    "{novedad.observacionSolucion}"
                                                    <div style={{ textAlign: 'right', borderTop: '3px solid #e9e9e9' }}>
                                                        Ase. {novedad.asesor} - {formatFechaHora(novedad.fechaSolucion)}
                                                    </div>
                                                </div>
                                            </li>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </Modal.Body>
        </Modal>

        <div className="container-xxl flex-grow-1 containerP" style={{ background: '#eeeeee', height: '100%', width: '100%', position: 'relative', left: '0px', top: '0px', overflow: 'hidden' }}>
            <div className='row' style={{ height: '100%', width: '98%', margin: 'auto' }}>
                <div className='col-9' style={{ maxHeight: '100%', padding: '0px', paddingLeft: '10px',paddingRight:'10px',borderRadius:'0px', fontSize: '12px' }}>
                    <div className="card" style={{ padding: '0px 2px',borderRadius:'0px' }}>
                        <div className="card-body">
                            <div className="d-flex align-items-start align-items-sm-center">
                                <div className='row' style={{ width: '100%', margin: 'auto', marginTop: '20px' }}>
                                    <div className='col-12' style={{ marginBottom: '20px' }}>
                                        <input id="buscadorInput" onChange={handleBuscador} type='text' style={{ width: '80%', margin: 'auto', textAlign: 'center' }} className='form-control' placeholder='Buscar'></input>
                                    </div>
                                    {consultAdmin && (
                                        <>
                                            <div className='col-6'></div>
                                            <div className='col-6' style={{ marginBottom: '20px', textAlign: 'right' }}>
                                                <div className="form-group row">
                                                    <label className="col-sm-4 col-form-label">Asesor:</label>
                                                    <div className="col-sm-8">
                                                        <select id="asesores" onChange={() => cambioAsesor()} className='form-control'>
                                                            <option value="0">TODAS</option>
                                                        </select>
                                                    </div>
                                                </div>

                                            </div>
                                        </>
                                    )}
                                    <div style={{ marginTop: '10px' }} className='col-12 col-md-4'>
                                        <label>Transportadora:</label>
                                        <select id="transportadora" onChange={() => cargarDataFiltro()} className='form-control'>
                                            <option value="0">TODAS</option>
                                            {transportadoras.map((transportadora, index) => {
                                                return (
                                                    <>
                                                        <option value={transportadora.id}>{transportadora.nombre}</option>
                                                    </>
                                                )
                                            })}
                                        </select>
                                    </div>
                                    <div style={{ marginTop: '10px' }} className='col-12 col-md-4'>
                                        <label>Tipo:</label>
                                        <select id="tipoEnvio" onChange={() => cargarDataFiltro()} className='form-control'>
                                            <option value="0">TODOS</option>
                                            <option value="1">Contado</option>
                                            <option value="2">Conta Entrega</option>
                                            <option value="3">Recaudo</option>
                                            <option value="4">Contado - Conta Entrega</option>
                                        </select>
                                    </div>
                                    <div style={{ marginTop: '10px' }} className='col-12 col-md-4'>
                                        <label>Estado:</label>
                                        <select id="estadoEnvio" onChange={() => cargarDataFiltro()} className='form-control'>
                                            <option value="3">TODOS</option>
                                            <option value="5">Para Validar</option>
                                            <option value="0">Viajando</option>
                                            <option value="2">En Novedad</option>
                                            <option value="1">Entregado Recaudo</option>
                                            <option value="11">Entregado con recibos</option>
                                            <option value="12">Entregado sin Recaudo</option>
                                            <option value="6">En Oficina</option>
                                            <option value="4">Devoluciones</option>
                                            <option value="7">Devoluciones Recibidas</option>
                                            <option value="10">Esperando clientes</option>
                                            <option value="8">Notas</option>
                                            <option value="9">Devoluciones Re-ofrecidas</option>
                                            <option value="13">Falsas</option>
                                        </select>
                                    </div>
                                    {consultAdmin && (
                                        <>
                                            <div className='col-2'></div>
                                            <div className='col-4'>

                                                <div className="form-group row" style={{ marginTop: '10px' }}>
                                                    <label className="col-sm-12 col-form-label">Desde:</label>
                                                    <div className="col-sm-12">
                                                        <input type="date" id='fechaInicio' className='form-control' />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='col-4 '>
                                                <div className="form-group row" style={{ marginTop: '10px' }}>
                                                    <label className="col-sm-12 col-form-label">Hasta:</label>
                                                    <div className="col-sm-12">
                                                        <input type="date" id='fechaFin' className='form-control' />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <div className='col-12' style={{ marginTop: '20px', padding: '0px' }}>
                                        {!totalData && (
                                            <span>
                                                <i className='bx bx-loader-circle bx-spin' style={{ marginRight: '5px' }}></i>
                                                consultando
                                            </span>
                                        )}
                                        
                                        <div className="table-responsive table-wrapper">
                                            <table className="table">
                                                <thead>
                                                    <tr style={{ background: "#e9e9e9" }}>
                                                        <th scope="col" style={{ textAlign: 'center' }}></th>
                                                        <th scope="col" style={{ textAlign: 'center' }}>Pedido</th>
                                                        <th scope="col" style={{ textAlign: 'center' }}>Guia</th>
                                                        <th scope="col" style={{ textAlign: 'center' }}>Despacho</th>
                                                        <th scope="col" style={{ textAlign: 'center' }}>Estado</th>
                                                        <th scope="col" style={{ textAlign: 'center' }}>Tipo</th>
                                                        <th scope="col" style={{ textAlign: 'center' }}>Destino</th>
                                                        <th scope="col" style={{ textAlign: 'center' }}>Destinatario</th>
                                                        <th scope="col" style={{ textAlign: 'center' }}>Opciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {consultando ? (
                                                        <tr>
                                                            <td colSpan="9" style={{ textAlign: 'center' }}>Consultando...</td>
                                                        </tr>
                                                    ) : (
                                                        pedidos.length === 0 ? (
                                                            <tr>
                                                                <td colSpan="9" style={{ textAlign: 'center' }}>No se encontraron registros.</td>
                                                            </tr>
                                                        ) : (
                                                            pedidos.map((pedido, index) => {

                                                                // Convertir las fechas a formato solo con día, mes y año (sin horas)
                                                                const fechaUltimoMovimiento = new Date(pedido.fechaUltimoMovimiento);
                                                                const hoy = new Date();

                                                                // Normalizar ambas fechas para eliminar horas, minutos y segundos
                                                                const fechaUltimoMovimientoSoloDia = new Date(fechaUltimoMovimiento.getFullYear(), fechaUltimoMovimiento.getMonth(), fechaUltimoMovimiento.getDate());
                                                                const hoySoloDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

                                                                // Calcular la diferencia en días
                                                                const diferenciaTiempo = hoySoloDia.getTime() - fechaUltimoMovimientoSoloDia.getTime();
                                                                const diferenciaDias = Math.floor(diferenciaTiempo / (1000 * 3600 * 24));


                                                                // Convertir las fechas a formato solo con día, mes y año (sin horas)
                                                                const fechaSalida = new Date(pedido.fechaSalida);
                                                                const fechaSalidaSoloDia = new Date(fechaSalida.getFullYear(), fechaSalida.getMonth(), fechaSalida.getDate());

                                                                // Calcular la diferencia en días
                                                                const diferenciaTiempo2 = hoySoloDia.getTime() - fechaSalidaSoloDia.getTime();
                                                                const diferenciaDiasSalida = Math.floor(diferenciaTiempo2 / (1000 * 3600 * 24));

                                                                let novedadSolucionada = 0;
                                                                let novedadPendiente = 0
                                                                let fechaNov = "";

                                                                pedido.novedades.map((novedad, index) => {
                                                                    if (novedad.estado == 1) {
                                                                        novedadPendiente += 1;
                                                                    } else {
                                                                        fechaNov = "Re-ofrecimiento:" + formatFechaHora(novedad.reofrecimientoFecha)
                                                                        novedadSolucionada += 1;
                                                                    }
                                                                })

                                                                if (pedido.novedades.length > 0) {
                                                                    if (pedido.novedades[0].estado == 1) {
                                                                        fechaNov = formatFechaHora(pedido.novedades[0].fecha)
                                                                    } else if (pedido.novedades[0].solucion == "RE-OFRECIMIENTO") {
                                                                        fechaNov = 'Ofrecimiento: ' + formatFecha(pedido.novedades[0].reofrecimientoFecha)
                                                                    } else {
                                                                        fechaNov = formatFechaHora(pedido.novedades[0].fecha)
                                                                    }
                                                                }

                                                                let color = 'white'
                                                                if (pedido.estadoDespacho == 0) {
                                                                    //esta en novedad y aun no tiene solucion
                                                                    if (pedido.novedad === 1 && novedadPendiente > 0) {
                                                                        color = '#ffa3a3'
                                                                    }
                                                                    else if (pedido.novedad === 1 && novedadPendiente == 0) {
                                                                        //esta en novedad pero ya llamo
                                                                        color = '#ffce73'
                                                                    } else if (diferenciaDiasSalida > 4) {
                                                                        //lleva mas de 4 dias viajando
                                                                        color = '#a9ffa3';
                                                                    }
                                                                }

                                                                if (pedido.estadoConsulta) {
                                                                    color = 'white';
                                                                }

                                                                if (parseInt(pedido.nota) > 0) {
                                                                    color = 'white';
                                                                }
                                                                return (
                                                                    <React.Fragment key={index}>
                                                                        <tr style={{
                                                                            backgroundColor: color
                                                                        }}>
                                                                            <td style={{ textAlign: 'center' }}>
                                                                                {index+1}
                                                                            </td>
                                                                            <td style={{ textAlign: 'center' }}>
                                                                                {pedido.referencia}
                                                                            </td>
                                                                            {pedido.guiasAsociadas?.length > 0 ? (
                                                                                <>
                                                                                    <td colSpan={4} style={{ padding: '10px 0px' }}>
                                                                                        <table style={{ width: '100%' }}>
                                                                                            <tbody>
                                                                                                {pedido.guiasAsociadas.sort((a, b) => new Date(b.fechaSalida) - new Date(a.fechaSalida)).map((guia, index) => {
                                                                                                    return (
                                                                                                        <tr key={index} style={{ background: '#e9e9e9', borderBottom: '1px solid' }}>
                                                                                                            <td style={{ textAlign: 'center', padding: '5px 2px' }}>
                                                                                                                <a target="_blank" href={`${guia.linkRastreo + guia.guia}`}>{guia.transportadoraName}</a>
                                                                                                                <br></br>
                                                                                                                <b>{guia.guia}</b>

                                                                                                            </td>

                                                                                                            <td style={{ textAlign: 'center', padding: '5px 2px' }}>
                                                                                                                <b>{formatFechaHora(guia.fechaSalida)}</b>

                                                                                                                {guia.estadoDespacho == 0 && (
                                                                                                                    <>
                                                                                                                        <br></br>
                                                                                                                        Via. {diferenciaDiasSalida}
                                                                                                                        <br></br>
                                                                                                                        Apro. 4
                                                                                                                    </>
                                                                                                                )}
                                                                                                            </td>

                                                                                                            <td id={`guia-${guia.guia}`} style={{ textAlign: 'center', padding: '5px 2px', color: guia.estadoDespacho == 0 && diferenciaDias > 2 ? 'red' : 'inherit' }}>
                                                                                                                <div className='row' style={{ margin: 'auto', width: '100%' }}>
                                                                                                                    <div className='col-12'>
                                                                                                                        {guia.estadoTransportadora}
                                                                                                                        <br></br>
                                                                                                                        <b>{formatFechaHora(guia.fechaUltimoMovimiento)}</b>
                                                                                                                    </div>
                                                                                                                    {guia.transportadora != 1 && (
                                                                                                                        <>
                                                                                                                            <div className='col-12' style={{ padding: '0px' }}>
                                                                                                                                {guia.codigoEstado == 0 &&
                                                                                                                                    <>
                                                                                                                                        <div style={{ borderTop: '1px solid', paddingTop: '5px' }}>
                                                                                                                                            <i title='Despachado' style={{ color: 'green', cursor: 'pointer', background: '#23eb23', padding: '4px', borderRadius: '50%' }} onClick={() => aprobadoEnvio(pedido)} className='bx bxs-truck'></i>
                                                                                                                                            <i title='Cancelado' style={{ color: 'red', cursor: 'pointer', marginLeft: '5px', background: '#ff8484', padding: '4px', borderRadius: '50%' }} onClick={() => canceladoEnvio(pedido)} className='bx bx-window-close'></i>
                                                                                                                                        </div>
                                                                                                                                    </>
                                                                                                                                }
                                                                                                                                {guia.codigoEstado == 500 &&
                                                                                                                                    <>
                                                                                                                                        <div style={{ borderTop: '1px solid', paddingTop: '5px' }}>
                                                                                                                                            <i style={{ color: 'green', cursor: 'pointer', background: '#23eb23', padding: '4px', borderRadius: '50%' }} title='Entregado' onClick={() => entregadoEnvio(pedido)} className='bx bx-donate-heart'></i>
                                                                                                                                            {pedido.oficina == 1 ? (
                                                                                                                                                <>
                                                                                                                                                    <i style={{ color: '#bbbb02', cursor: 'pointer', marginLeft: '5px', background: '#ffe69f', padding: '4px', borderRadius: '50%' }} title='En Oficina' onClick={() => disponibleOficina(pedido)} className='bx bx-store-alt'></i>
                                                                                                                                                </>
                                                                                                                                            ) : (
                                                                                                                                                <>
                                                                                                                                                    <i style={{ color: '#bbbb02', cursor: 'pointer', marginLeft: '5px', background: '#ffe69f', padding: '4px', borderRadius: '50%' }} title='En Oficina' onClick={() => esOficina(pedido)} className='bx bx-home-smile'></i>
                                                                                                                                                </>
                                                                                                                                            )}
                                                                                                                                            <i title='Devolución' style={{ color: 'red', cursor: 'pointer', marginLeft: '5px', background: '#ff8484', padding: '4px', borderRadius: '50%' }} onClick={() => devolucionEnvio(pedido)} className='bx bxs-log-out'></i>
                                                                                                                                        </div>
                                                                                                                                    </>
                                                                                                                                }
                                                                                                                                {guia.codigoEstado == 1000 &&
                                                                                                                                    <>
                                                                                                                                        <div style={{ borderTop: '1px solid', paddingTop: '5px' }}>
                                                                                                                                            <i style={{ color: 'green', cursor: 'pointer', background: '#23eb23', padding: '4px', borderRadius: '50%' }} title='Entregado' onClick={() => entregadoEnvio(pedido)} className='bx bx-donate-heart'></i>
                                                                                                                                            <i title='Devolución' style={{ color: 'red', cursor: 'pointer', marginLeft: '5px', background: '#ff8484', padding: '4px', borderRadius: '50%' }} onClick={() => devolucionEnvio(pedido)} className='bx bxs-log-out'></i>
                                                                                                                                        </div>
                                                                                                                                    </>
                                                                                                                                }
                                                                                                                            </div>
                                                                                                                        </>
                                                                                                                    )}
                                                                                                                </div>
                                                                                                            </td>
                                                                                                            <td style={{ textAlign: 'center', padding: '5px 2px' }}>
                                                                                                                {guia.tipoEnvio == 1 && (
                                                                                                                    <>Contado</>
                                                                                                                )}

                                                                                                                {guia.tipoEnvio == 2 && (
                                                                                                                    <>Contra Entrega</>
                                                                                                                )}

                                                                                                                {guia.tipoEnvio == 3 && (
                                                                                                                    <>
                                                                                                                        Recaudo
                                                                                                                        <br></br>
                                                                                                                        <b>{formattedPrice(guia.recaudo)}</b>
                                                                                                                    </>
                                                                                                                )}

                                                                                                                {guia.tipoEnvio == 4 && (
                                                                                                                    <>Recoge En Tienda</>
                                                                                                                )}
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                    )
                                                                                                })}
                                                                                            </tbody>
                                                                                        </table>
                                                                                    </td>
                                                                                    <td style={{ textAlign: 'center' }}>
                                                                                        {pedido.nameDepartamnento}
                                                                                        <br></br>
                                                                                        <b>{pedido.ciudaName}</b>
                                                                                    </td>
                                                                                    <td style={{ textAlign: 'center' }}>
                                                                                        {pedido.destinatario}
                                                                                        <br></br>
                                                                                        <b>({pedido.usuario})</b>
                                                                                    </td>
                                                                                    <td style={{ textAlign: 'center' }}>
                                                                                        <i onClick={() => observacionesGuia(pedido)} style={{ cursor: 'pointer' }} className='bx bx-file'></i>
                                                                                    </td>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <td style={{ textAlign: 'center' }}>
                                                                                        <a target="_blank" href={`${pedido.linkRastreo + pedido.guia}`}>{pedido.transportadoraName}</a>
                                                                                        <br></br>
                                                                                        <b>
                                                                                            {pedido.guia}
                                                                                        </b>

                                                                                        {pedido.novedades.length > 0 && (
                                                                                            <>

                                                                                                <div onClick={() => novedadesEnvio(pedido)} style={{ cursor: 'pointer' }}>
                                                                                                    Nov. {novedadSolucionada + novedadPendiente}
                                                                                                    <br></br>
                                                                                                    Ped. {novedadPendiente}
                                                                                                    <br></br>
                                                                                                    {fechaNov}
                                                                                                </div>

                                                                                            </>
                                                                                        )}
                                                                                    </td>
                                                                                    <td style={{ textAlign: 'center' }}>
                                                                                        <b>{formatFechaHora(pedido.fechaSalida)}</b>
                                                                                        {pedido.estadoDespacho == 0 && (
                                                                                            <>
                                                                                                <br></br>
                                                                                                Via. {diferenciaDiasSalida}
                                                                                                <br></br>
                                                                                                Apro. 4
                                                                                            </>
                                                                                        )}
                                                                                    </td>
                                                                                    <td id={`guia-${pedido.guia}`} style={{ textAlign: 'center', color: pedido.estadoDespacho == 0 && diferenciaDias > 2 ? 'red' : 'inherit' }}>
                                                                                        <div className='row'>
                                                                                            <div className='col-12'>
                                                                                                {pedido.estadoTransportadora}
                                                                                                <br></br>
                                                                                                <b>{formatFechaHora(pedido.fechaUltimoMovimiento)}</b>
                                                                                            </div>
                                                                                            {pedido.nota == null && (
                                                                                                <>
                                                                                                    <div className='col-12' style={{ padding: '0px' }}>
                                                                                                        {pedido.codigoEstado == 0 ?
                                                                                                            <>
                                                                                                                <div style={{ borderTop: '1px solid', paddingTop: '5px' }}>
                                                                                                                    <i title='Despachado' style={{ color: 'green', cursor: 'pointer', background: '#23eb23', padding: '4px', borderRadius: '50%' }} onClick={() => aprobadoEnvio(pedido)} className='bx bxs-truck'></i>
                                                                                                                    <i title='Cancelado' style={{ color: 'red', cursor: 'pointer', marginLeft: '5px', background: '#ff8484', padding: '4px', borderRadius: '50%' }} onClick={() => canceladoEnvio(pedido)} className='bx bx-window-close'></i>
                                                                                                                    {pedido.oficina == 0 &&       
                                                                                                                        <i style={{ color: '#0210bb', cursor: 'pointer', marginLeft: '5px', background: '#9fa2ff', padding: '4px', borderRadius: '50%' }} title='En Oficina' onClick={() => esOficina(pedido)} className='bx bx-home-smile'></i>
                                                                                                                    }
                                                                                                                </div>
                                                                                                            </>
                                                                                                        : pedido.codigoEstado == 500 ?
                                                                                                            <>
                                                                                                                <div style={{ borderTop: '1px solid', paddingTop: '5px' }}>
                                                                                                                    <i style={{ color: 'green', cursor: 'pointer', background: '#23eb23', padding: '4px', borderRadius: '50%' }} title='Entregado' onClick={() => entregadoEnvio(pedido)} className='bx bx-donate-heart'></i>
                                                                                                                    {pedido.oficina == 1 ? (
                                                                                                                        <>
                                                                                                                            <i style={{ color: '#bbbb02', cursor: 'pointer', marginLeft: '5px', background: '#ffe69f', padding: '4px', borderRadius: '50%' }} title='En Oficina' onClick={() => disponibleOficina(pedido)} className='bx bx-store-alt'></i>
                                                                                                                        </>
                                                                                                                    ) : (
                                                                                                                        <>
                                                                                                                            <i style={{ color: '#0210bb', cursor: 'pointer', marginLeft: '5px', background: '#9fa2ff', padding: '4px', borderRadius: '50%' }} title='En Oficina' onClick={() => esOficina(pedido)} className='bx bx-home-smile'></i>
                                                                                                                        </>
                                                                                                                    )}
                                                                                                                    <i title='Cancelado' style={{ color: 'red', cursor: 'pointer', marginLeft: '5px', background: '#ff8484', padding: '4px', borderRadius: '50%' }} onClick={() => canceladoEnvio(pedido)} className='bx bx-window-close'></i>
                                                                                                                    <i title='Devolución' style={{ color: 'red', cursor: 'pointer', marginLeft: '5px', background: '#ff8484', padding: '4px', borderRadius: '50%' }} onClick={() => devolucionEnvio(pedido)} className='bx bxs-log-out'></i>
                                                                                                                </div>
                                                                                                            </>
                                                                                                        : pedido.codigoEstado == 4300 ?
                                                                                                            <>
                                                                                                                <div style={{ borderTop: '1px solid', paddingTop: '5px' }}>
                                                                                                                    <i title='Cancelado' style={{ color: 'red', cursor: 'pointer', marginLeft: '5px', background: '#ff8484', padding: '4px', borderRadius: '50%' }} onClick={() => canceladoEnvio(pedido)} className='bx bx-window-close'></i>
                                                                                                                </div>
                                                                                                            </> 
                                                                                                        : pedido.codigoEstado == 5000 ?
                                                                                                            <>
                                                                                                                <div style={{ borderTop: '1px solid', paddingTop: '5px' }}>
                                                                                                                    <i style={{ color: 'green', cursor: 'pointer', background: '#23eb23', padding: '4px', borderRadius: '50%' }} title='Entregado' onClick={() => entregadoEnvio(pedido)} className='bx bx-donate-heart'></i>
                                                                                                                    <i title='Cancelado' style={{ color: 'red', cursor: 'pointer', marginLeft: '5px', background: '#ff8484', padding: '4px', borderRadius: '50%' }} onClick={() => canceladoEnvio(pedido)} className='bx bx-window-close'></i>
                                                                                                                    <i title='Devolución' style={{ color: 'red', cursor: 'pointer', marginLeft: '5px', background: '#ff8484', padding: '4px', borderRadius: '50%' }} onClick={() => devolucionEnvio(pedido)} className='bx bxs-log-out'></i>
                                                                                                                </div>
                                                                                                            </>
                                                                                                        : pedido.codigoEstado == 1000 ?
                                                                                                            <>
                                                                                                                <div style={{ borderTop: '1px solid', paddingTop: '5px' }}>
                                                                                                                    <i style={{ color: 'green', cursor: 'pointer', background: '#23eb23', padding: '4px', borderRadius: '50%' }} title='Entregado' onClick={() => entregadoEnvio(pedido)} className='bx bx-donate-heart'></i>
                                                                                                                    <i title='Cancelado' style={{ color: 'red', cursor: 'pointer', marginLeft: '5px', background: '#ff8484', padding: '4px', borderRadius: '50%' }} onClick={() => canceladoEnvio(pedido)} className='bx bx-window-close'></i>
                                                                                                                    <i title='Devolución' style={{ color: 'red', cursor: 'pointer', marginLeft: '5px', background: '#ff8484', padding: '4px', borderRadius: '50%' }} onClick={() => devolucionEnvio(pedido)} className='bx bxs-log-out'></i>
                                                                                                                </div>
                                                                                                            </>
                                                                                                        : pedido.codigoEstado != 3000  ?
                                                                                                            <>
                                                                                                                <div style={{ borderTop: '1px solid', paddingTop: '5px' }}>
                                                                                                                    <i style={{ color: 'green', cursor: 'pointer', background: '#23eb23', padding: '4px', borderRadius: '50%' }} title='Entregado' onClick={() => entregadoEnvio(pedido)} className='bx bx-donate-heart'></i>
                                                                                                                    <i title='Cancelado' style={{ color: 'red', cursor: 'pointer', marginLeft: '5px', background: '#ff8484', padding: '4px', borderRadius: '50%' }} onClick={() => canceladoEnvio(pedido)} className='bx bx-window-close'></i>
                                                                                                                    <i title='Devolución' style={{ color: 'red', cursor: 'pointer', marginLeft: '5px', background: '#ff8484', padding: '4px', borderRadius: '50%' }} onClick={() => devolucionEnvio(pedido)} className='bx bxs-log-out'></i>
                                                                                                                </div>
                                                                                                            </>
                                                                                                        : pedido.codigoEstado == 3000 && pedido.estadoConsulta == 1 ?
                                                                                                            <>
                                                                                                                <div style={{ borderTop: '1px solid', paddingTop: '5px' }}>
                                                                                                                    <i title='Viajando' style={{ color: 'green', cursor: 'pointer', background: '#23eb23', padding: '4px', borderRadius: '50%' }} onClick={() => aprobadoEnvio(pedido)} className='bx bxs-truck'></i>
                                                                                                                    <i title='Cancelado' style={{ color: 'red', cursor: 'pointer', marginLeft: '5px', background: '#ff8484', padding: '4px', borderRadius: '50%' }} onClick={() => canceladoEnvio(pedido)} className='bx bx-window-close'></i>
                                                                                                                    <i title='Devolución' style={{ color: 'red', cursor: 'pointer', marginLeft: '5px', background: '#ff8484', padding: '4px', borderRadius: '50%' }} onClick={() => devolucionEnvio(pedido)} className='bx bxs-log-out'></i>
                                                                                                                </div>
                                                                                                            </>
                                                                                                        :(
                                                                                                            <></>
                                                                                                        )}
                                                                                                    </div>
                                                                                                </>
                                                                                            )}
                                                                                        </div>
                                                                                    </td>
                                                                                    <td style={{ textAlign: 'center' }}>
                                                                                        {pedido.tipoEnvio == 1 && (
                                                                                            <>Contado</>
                                                                                        )}

                                                                                        {pedido.tipoEnvio == 2 && (
                                                                                            <>Contra Entrega</>
                                                                                        )}

                                                                                        {pedido.tipoEnvio == 3 && (
                                                                                            <>
                                                                                                Recaudo
                                                                                                <br></br>
                                                                                                <b>{formattedPrice(pedido.recaudo)}</b>
                                                                                            </>
                                                                                        )}

                                                                                        {pedido.tipoEnvio == 4 && (
                                                                                            <>Recoge En Tienda</>
                                                                                        )}
                                                                                    </td>
                                                                                    <td style={{ textAlign: 'center' }}>
                                                                                        {pedido.nameDepartamnento}
                                                                                        <br></br>
                                                                                        <b>{pedido.ciudaName}</b>
                                                                                    </td>
                                                                                    <td style={{ textAlign: 'center' }}>
                                                                                        {pedido.destinatario}
                                                                                        <br></br>
                                                                                        <b>({pedido.usuario})</b>
                                                                                    </td>
                                                                                    <td style={{ textAlign: 'center' }}>
                                                                                        {pedido.transportadora == 1 ? (
                                                                                            <>
                                                                                                {consultAdmin && (
                                                                                                    <>
                                                                                                        <i onClick={() => envioEntregado(pedido)} className='bx bx-donate-heart'></i>
                                                                                                        <button onClick={() => envioEntregadoRecibo(pedido)} className='btn btn-primary'>Recibo</button>
                                                                                                    </>
                                                                                                )}
                                                                                            
                                                                                                <i onClick={() => trasabilidadEnvio(pedido)} style={{ cursor: 'pointer' }} className='bx bx-history'></i>
                                                                                                <i style={{ display: 'none' }} className='bx bx-conversation'></i>
                                                                                            </>
                                                                                        ) : (
                                                                                            <>
                                                                                                {pedido.estadoDespacho == 0 && consultAdmin ? (
                                                                                                    <>
                                                                                                        <i onClick={() => envioEntregado(pedido)} className='bx bx-donate-heart'></i>
                                                                                                        <button onClick={() => envioEntregadoRecibo(pedido)} className='btn btn-primary'>Recibo</button>
                                                                                                    </>
                                                                                                ) : (
                                                                                                    <>
                                                                                                        Entregado
                                                                                                        <br></br>
                                                                                                        <b>{formatFechaHora(pedido.fechaEntrega)}</b>
                                                                                                    </>
                                                                                                )}

                                                                                            </>
                                                                                        )}

                                                                                        <i onClick={() => observacionesGuia(pedido)} style={{ cursor: 'pointer' }} className='bx bx-file'></i>
                                                                                        {pedido.devolucion == 1 && pedido.recibidaDevolucion == 0 && pedido.nota == null && consultAdmin == true && (
                                                                                            <>
                                                                                                <button onClick={() => devolucionRecibida(pedido)} className='btn btn-primary'>Recibido</button>
                                                                                                <button onClick={() => devolucionFalse(pedido)} className='btn btn-secondary btn-sm' style={{ margin: '10px' }}>Falsa</button>
                                                                                            </>
                                                                                        )}
                                                                                        {pedido.devolucion == 1 && pedido.recibidaDevolucion > 0 && pedido.estadoPedido < 8 && parseInt(pedido.fechaEspera) == 0 && pedido.nota == null && consultAdmin == true && (
                                                                                            <>
                                                                                                <button onClick={() => devolucionNota(pedido)} className='btn btn-primary btn-sm' style={{ margin: '10px' }}>Desarmar</button>
                                                                                                <button onClick={() => devolucionEsperando(pedido)} className='btn btn-secondary btn-sm'>Esperar</button>
                                                                                            </>
                                                                                        )}
                                                                                        {pedido.devolucion == 1 && pedido.recibidaDevolucion > 0 && pedido.estadoPedido == 8 && pedido.nota == null && consultAdmin == true && (
                                                                                            <>
                                                                                                <b>REPORTADO PARA NOTA</b>
                                                                                            </>
                                                                                        )}
                                                                                        {pedido.devolucion == 1 && pedido.recibidaDevolucion > 0 && pedido.estadoPedido < 8 && pedido.nota == null && parseInt(pedido.fechaEspera) != 0 && consultAdmin == true && (
                                                                                            <>
                                                                                                <br></br>
                                                                                                <b>ESPERANDO CLIENTE DESDE {pedido.fechaEspera}</b>
                                                                                                <button onClick={() => devolucionNota(pedido)} className='btn btn-primary btn-sm' style={{ margin: '10px' }}>Desarmar</button>
                                                                                            </>
                                                                                        )}
                                                                                    </td>
                                                                                </>
                                                                            )}

                                                                        </tr>
                                                                        <tr style={{
                                                                            backgroundColor: '#e9e9e9',
                                                                        }}>
                                                                            <td colSpan={9} style={{ textAlign: 'center', width: '100%' }}>
                                                                                <span>Pedido: {pedido.referencia}</span>
                                                                                <span style={{ borderLeft: '1px solid', marginLeft: '10px', paddingLeft: '10px' }}>Factura: F-2 {pedido.factura}</span>
                                                                                <span style={{ borderLeft: '1px solid', marginLeft: '10px', paddingLeft: '10px' }}>Tercero: {Number(pedido.cedula).toLocaleString('es-ES')}</span>

                                                                                {parseInt(pedido.nota) > 0 && (
                                                                                    <>
                                                                                        <span style={{ borderLeft: '1px solid', marginLeft: '10px', paddingLeft: '10px' }}>Nota: J-2 {pedido.nota}</span>
                                                                                    </>
                                                                                )}
                                                                                {parseInt(pedido.reporteSiigo) > 0 && (
                                                                                    <>
                                                                                        <span style={{ borderLeft: '1px solid', marginLeft: '10px', paddingLeft: '10px' }}>Recibo: R-1 {pedido.reporteSiigo}</span>
                                                                                    </>
                                                                                )}
                                                                                <span style={{ borderLeft: '1px solid', marginLeft: '10px', paddingLeft: '10px' }}>CRM: {pedido.number}</span>

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
                </div>
                <div className='col-3' style={{ maxHeight: '100vh', overflow: 'auto', background: '#f5f5f5', paddingTop: '40px', paddingBottom: '40px', boxShadow: '0px 0px 18px 0px #bdbdbdbf' }}>
                    <label style={{ background: '#e9e9e9', width: '90%', padding: '10px', textAlign: 'center', marginLeft: '5%' }}>RECAUDOS</label>
                    <div className='row' style={{ width: '90%', border: '2px solid #e9e9e9', padding: '10px 0px', marginLeft: '5%', fontSize: '12px' }}>
                        <div className='col-7'>
                            <span onClick={() => filtroResultEstado(0)} style={{ cursor: 'pointer', marginRight: '3px' }}>-Viajando</span>({resultRecaudo.cantidadViajando})
                            <br></br>
                            {resultRecaudo.prioridadViajando > 0 && (
                                <>
                                    <span style={{ color: 'red', marginLeft: '19px', fontWeight: '500' }}>{resultRecaudo.prioridadViajando} Prioritarios</span>
                                    <br></br>
                                </>
                            )}
                        </div>
                        <div className='col-4' style={{ textAlign: 'right', paddingRight: '0px' }}>
                            <span onClick={() => filtroResultEstado(0)} style={{ cursor: 'pointer' }}>{formattedPrice(resultRecaudo.valorViajando)}</span>
                            <br></br>
                        </div>
                        <div className='col-12' style={{ marginTop: '5px', marginBottom: '5px' }}>
                            <div style={{ height: '1px', width: '100%', borderBottom: '1px dotted #c1c1c1' }}></div>
                        </div>

                        <div className='col-7'>
                            <span onClick={() => filtroResultEstado(0)} style={{ cursor: 'pointer', marginRight: '3px' }}>-Proc. de entrega</span>({resultRecaudo.cantidadProcesoEntrega})
                            <br></br>
                            {resultRecaudo.prioridadProcesoEntrega > 0 && (
                                <>
                                    <span style={{ color: 'red', marginLeft: '19px', fontWeight: '500' }}>{resultRecaudo.prioridadProcesoEntrega} Prioritarios</span>
                                    <br></br>
                                </>
                            )}
                        </div>
                        <div className='col-4' style={{ textAlign: 'right', paddingRight: '0px' }}>
                            <span onClick={() => filtroResultEstado(0)} style={{ cursor: 'pointer' }}>{formattedPrice(resultRecaudo.valorProcesoEntrega)}</span>
                            <br></br>
                        </div>
                        <div className='col-12' style={{ marginTop: '5px', marginBottom: '5px' }}>
                            <div style={{ height: '1px', width: '100%', borderBottom: '1px dotted #c1c1c1' }}></div>
                        </div>


                        <div className='col-7'>
                            <span onClick={() => filtroResultEstado(2)} style={{ cursor: 'pointer', marginRight: '3px' }}>-En Novedad</span>({resultRecaudo.cantidadNovedad})
                            <br></br>
                            {resultRecaudo.prioridadNovedad > 0 && (
                                <>
                                    <span style={{ color: 'red', marginLeft: '19px', fontWeight: '500' }}>{resultRecaudo.prioridadNovedad} Prioritarios</span>
                                    <br></br>
                                </>
                            )}
                        </div>
                        <div className='col-4' style={{ textAlign: 'right', paddingRight: '0px' }}>
                            <span onClick={() => filtroResultEstado(2)} style={{ cursor: 'pointer' }}>{formattedPrice(resultRecaudo.valorNovedad)}</span>
                            <br></br>
                        </div>
                        <div className='col-12' style={{ marginTop: '5px', marginBottom: '5px' }}>
                            <div style={{ height: '1px', width: '100%', borderBottom: '1px dotted #c1c1c1' }}></div>
                        </div>


                        <div className='col-7'>
                            <span onClick={() => filtroResultEstado(1)} style={{ cursor: 'pointer', marginRight: '3px' }}>-Entregado</span>({resultRecaudo.cantidadEntregado})
                            <br></br>
                        </div>
                        <div className='col-4' style={{ textAlign: 'right', paddingRight: '0px' }}>
                            <span onClick={() => filtroResultEstado(1)} style={{ cursor: 'pointer' }}>{formattedPrice(resultRecaudo.valorEntregado)}</span>
                            <br></br>
                        </div>
                        <div className='col-12' style={{ marginTop: '5px', marginBottom: '5px' }}>
                            <div style={{ height: '1px', width: '100%', borderBottom: '1px dotted #c1c1c1' }}></div>
                        </div>

                        <div className='col-7'>
                            <span onClick={() => filtroResultEstado(4)} style={{ cursor: 'pointer', marginRight: '3px' }}>-Devoluciónes</span>({resultRecaudo.cantidadDevolucion})
                            <br></br>
                        </div>
                        <div className='col-4' style={{ textAlign: 'right', paddingRight: '0px' }}>
                            <span onClick={() => filtroResultEstado(4)} style={{ cursor: 'pointer' }}>{formattedPrice(resultRecaudo.valorDevolucion)}</span>
                            <br></br>
                        </div>
                        <div className='col-12' style={{ marginTop: '5px', marginBottom: '5px' }}>
                            <div style={{ height: '1px', width: '100%', borderBottom: '1px solid #c1c1c1' }}></div>
                        </div>

                        <div className='col-7'>
                            <span onClick={() => filtroResultEstado(7)} style={{ cursor: 'pointer', marginRight: '3px' }}>-Devoluciónes Recibidas</span>({resultRecaudo.cantidadDevolucionRecibidas})
                            <br></br>
                        </div>
                        <div className='col-4' style={{ textAlign: 'right', paddingRight: '0px' }}>
                            <span onClick={() => filtroResultEstado(7)} style={{ cursor: 'pointer' }}>{formattedPrice(resultRecaudo.valorDevolucionRecibidas)}</span>
                            <br></br>
                        </div>
                        <div className='col-12' style={{ marginTop: '5px', marginBottom: '5px' }}>
                            <div style={{ height: '1px', width: '100%', borderBottom: '1px solid #c1c1c1' }}></div>
                        </div>

                        <div className='col-7'>
                            <span onClick={() => filtroResultEstado(8)} style={{ cursor: 'pointer', marginRight: '3px' }}>-Notas</span>({resultRecaudo.cantidadNotas})
                            <br></br>
                        </div>
                        <div className='col-4' style={{ textAlign: 'right', paddingRight: '0px' }}>
                            <span onClick={() => filtroResultEstado(8)} style={{ cursor: 'pointer' }}>{formattedPrice(resultRecaudo.valorNotas)}</span>
                            <br></br>
                        </div>
                        <div className='col-12' style={{ marginTop: '5px', marginBottom: '5px' }}>
                            <div style={{ height: '1px', width: '100%', borderBottom: '1px solid #c1c1c1' }}></div>
                        </div>


                        <div className='col-7'>
                            <span onClick={() => filtroResultEstado(9)} style={{ cursor: 'pointer', marginRight: '3px' }}>-Dev. Re-ofrecidas</span>({resultRecaudo.cantidadReofrecidas})
                            <br></br>
                        </div>
                        <div className='col-4' style={{ textAlign: 'right', paddingRight: '0px' }}>
                            <span onClick={() => filtroResultEstado(9)} style={{ cursor: 'pointer' }}>{formattedPrice(resultRecaudo.valorReofrecidas)}</span>
                            <br></br>
                        </div>
                        <div className='col-12' style={{ marginTop: '5px', marginBottom: '5px' }}>
                            <div style={{ height: '1px', width: '100%', borderBottom: '1px solid #c1c1c1' }}></div>
                        </div>


                        <div className='col-7'>
                            <span onClick={() => filtroResultEstado(3)} style={{ cursor: 'pointer', color: '#758693', fontWeight: 'bold' }}>{resultRecaudo.cantidad} Paquetes</span>
                            <br></br>
                        </div>
                        <div className='col-4' style={{ textAlign: 'right', paddingRight: '0px' }}>
                            <span onClick={() => filtroResultEstado(3)} style={{ cursor: 'pointer', color: '#758693', fontWeight: 'bold' }}>{formattedPrice(resultRecaudo.valor)}</span>
                            <br></br>
                        </div>
                    </div>

                    {resultOtrosEnvios.map((transportadora, index) => {
                        return (
                            <>
                                <div style={{ marginTop: '10px' }}>
                                    <label style={{ background: '#e9e9e9', width: '90%', padding: '10px', textAlign: 'center', marginLeft: '5%' }}>{transportadora.nombre}</label>
                                </div>
                                <div className='row' style={{ width: '90%', border: '2px solid #e9e9e9', padding: '10px 0px', marginLeft: '5%', fontSize: '12px' }}>

                                    <div className='col-7'>
                                        <span onClick={() => filtroResultEstado2(5, transportadora.id)} style={{ cursor: 'pointer', marginRight: '3px' }}>-Para Validar</span>
                                    </div>
                                    <div className='col-4' style={{ textAlign: 'right', paddingRight: '0px' }}>
                                        <span onClick={() => filtroResultEstado2(5, transportadora.id)} >{transportadora.cantidadValidar}</span>
                                    </div>
                                    <div className='col-12' style={{ marginTop: '5px', marginBottom: '5px' }}>
                                        <div style={{ height: '1px', width: '100%', borderBottom: '1px dotted #c1c1c1' }}></div>
                                    </div>
                                    <div className='col-7'>
                                        <span onClick={() => filtroResultEstado2(0, transportadora.id)} style={{ cursor: 'pointer', marginRight: '3px' }}>-Viajando</span>
                                        <br></br>
                                        {transportadora.prioridadViajando > 0 && (
                                            <>
                                                <span style={{ color: 'red', marginLeft: '19px', fontWeight: '500' }}>{transportadora.prioridadViajando} Prioritarios</span>
                                                <br></br>
                                            </>
                                        )}
                                    </div>
                                    <div className='col-4' style={{ textAlign: 'right', paddingRight: '0px' }}>
                                        <span onClick={() => filtroResultEstado2(0, transportadora.id)} >{transportadora.cantidadViajando}</span>
                                    </div>
                                    <div className='col-12' style={{ marginTop: '5px', marginBottom: '5px' }}>
                                        <div style={{ height: '1px', width: '100%', borderBottom: '1px dotted #c1c1c1' }}></div>
                                    </div>
                                    {transportadora.oficina == 1 && (
                                        <>
                                            <div className='col-7'>
                                                <span onClick={() => filtroResultEstado2(6, transportadora.id)} style={{ cursor: 'pointer', marginRight: '3px' }}>-En oficina</span>
                                            </div>
                                            <div className='col-4' style={{ textAlign: 'right', paddingRight: '0px' }}>
                                                <span onClick={() => filtroResultEstado2(6, transportadora.id)}>{transportadora.cantidadOficina}</span>
                                            </div>
                                            <div className='col-12' style={{ marginTop: '5px', marginBottom: '5px' }}>
                                                <div style={{ height: '1px', width: '100%', borderBottom: '1px dotted #c1c1c1' }}></div>
                                            </div>


                                        </>
                                    )}

                                    {transportadora.api == 0 ? (
                                        <>
                                            <div className='col-7'>
                                                <span onClick={() => filtroResultEstado2(1, transportadora.id)} style={{ cursor: 'pointer', marginRight: '3px' }}>-Entregado</span>
                                                <br></br>
                                            </div>
                                            <div className='col-4' style={{ textAlign: 'right', paddingRight: '0px' }}>
                                                <span onClick={() => filtroResultEstado2(1, transportadora.id)}>{transportadora.cantidadEntregado}</span>
                                            </div>
                                            <div className='col-12' style={{ marginTop: '5px', marginBottom: '5px' }}>
                                                <div style={{ height: '1px', width: '100%', borderBottom: '1px solid #c1c1c1' }}></div>
                                            </div>

                                            <div className='col-7'>
                                                <span onClick={() => filtroResultEstado2(4, transportadora.id)} style={{ cursor: 'pointer', marginRight: '3px' }}>-Devoluciones</span>
                                            </div>
                                            <div className='col-4' style={{ textAlign: 'right', paddingRight: '0px' }}>
                                                <span onClick={() => filtroResultEstado2(4, transportadora.id)}>{transportadora.cantidadDevolucion}</span>
                                            </div>
                                            <div className='col-12' style={{ marginTop: '5px', marginBottom: '5px' }}>
                                                <div style={{ height: '1px', width: '100%', borderBottom: '1px dotted #c1c1c1' }}></div>
                                            </div>

                                            <div className='col-7'>
                                                <span onClick={() => filtroResultEstado2(7, transportadora.id)} style={{ cursor: 'pointer', marginRight: '3px' }}>-Devoluciones Recibidas</span>
                                            </div>
                                            <div className='col-4' style={{ textAlign: 'right', paddingRight: '0px' }}>
                                                <span onClick={() => filtroResultEstado2(7, transportadora.id)}>{transportadora.cantidadDevolucionRecibidas}</span>
                                            </div>
                                            <div className='col-12' style={{ marginTop: '5px', marginBottom: '5px' }}>
                                                <div style={{ height: '1px', width: '100%', borderBottom: '1px dotted #c1c1c1' }}></div>
                                            </div>

                                            <div className='col-7'>
                                                <span onClick={() => filtroResultEstado2(8, transportadora.id)} style={{ cursor: 'pointer', marginRight: '3px' }}>-Notas</span>
                                            </div>
                                            <div className='col-4' style={{ textAlign: 'right', paddingRight: '0px' }}>
                                                <span onClick={() => filtroResultEstado2(8, transportadora.id)}>{transportadora.cantidadNotas}</span>
                                            </div>
                                            <div className='col-12' style={{ marginTop: '5px', marginBottom: '5px' }}>
                                                <div style={{ height: '1px', width: '100%', borderBottom: '1px dotted #c1c1c1' }}></div>
                                            </div>

                                            <div className='col-7'>
                                                <span onClick={() => filtroResultEstado2(9, transportadora.id)} style={{ cursor: 'pointer', marginRight: '3px' }}>-Devoluciones Re-ofrecidas</span>
                                            </div>
                                            <div className='col-4' style={{ textAlign: 'right', paddingRight: '0px' }}>
                                                <span onClick={() => filtroResultEstado2(9, transportadora.id)}>{transportadora.cantidadReofrecidas}</span>
                                            </div>
                                            <div className='col-12' style={{ marginTop: '5px', marginBottom: '5px' }}>
                                                <div style={{ height: '1px', width: '100%', borderBottom: '1px dotted #c1c1c1' }}></div>
                                            </div>

                                        </>
                                    ) : (
                                        <>
                                            <div className='col-7'>
                                                <span onClick={() => filtroResultEstado2(0, transportadora.id)} style={{ cursor: 'pointer', marginRight: '3px' }}>-Proc. de entrega</span>
                                                <br></br>
                                                {transportadora.prioridadProcesoEntrega > 0 && (
                                                    <>
                                                        <span style={{ color: 'red', marginLeft: '19px', fontWeight: '500' }}>{transportadora.prioridadProcesoEntrega} Prioritarios</span>
                                                        <br></br>
                                                    </>
                                                )}
                                            </div>
                                            <div className='col-4' style={{ textAlign: 'right', paddingRight: '0px' }}>
                                                <span onClick={() => filtroResultEstado2(0, transportadora.id)}>{transportadora.cantidadProcesoEntrega}</span>
                                            </div>
                                            <div className='col-12' style={{ marginTop: '5px', marginBottom: '5px' }}>
                                                <div style={{ height: '1px', width: '100%', borderBottom: '1px dotted #c1c1c1' }}></div>
                                            </div>


                                            <div className='col-7'>
                                                <span onClick={() => filtroResultEstado2(2, transportadora.id)} style={{ cursor: 'pointer', marginRight: '3px' }}>-En Novedad</span>
                                                <br></br>
                                                {transportadora.prioridadNovedad > 0 && (
                                                    <>
                                                        <span style={{ color: 'red', marginLeft: '19px', fontWeight: '500' }}>{transportadora.prioridadNovedad} Prioritarios</span>
                                                        <br></br>
                                                    </>
                                                )}
                                            </div>
                                            <div className='col-4' style={{ textAlign: 'right', paddingRight: '0px' }}>
                                                <span onClick={() => filtroResultEstado2(2, transportadora.id)}>{transportadora.cantidadNovedad}</span>
                                            </div>
                                            <div className='col-12' style={{ marginTop: '5px', marginBottom: '5px' }}>
                                                <div style={{ height: '1px', width: '100%', borderBottom: '1px dotted #c1c1c1' }}></div>
                                            </div>


                                            <div className='col-7'>
                                                <span onClick={() => filtroResultEstado2(1, transportadora.id)} style={{ cursor: 'pointer', marginRight: '3px' }}>-Entregado</span>
                                                <br></br>
                                            </div>
                                            <div className='col-4' style={{ textAlign: 'right', paddingRight: '0px' }}>
                                                <span onClick={() => filtroResultEstado2(1, transportadora.id)} >{transportadora.cantidadEntregado}</span>
                                            </div>
                                            <div className='col-12' style={{ marginTop: '5px', marginBottom: '5px' }}>
                                                <div style={{ height: '1px', width: '100%', borderBottom: '1px solid #c1c1c1' }}></div>
                                            </div>


                                            <div className='col-7'>
                                                <span onClick={() => filtroResultEstado2(4, transportadora.id)} style={{ cursor: 'pointer', marginRight: '3px' }}>-Devoluciones</span>
                                                <br></br>
                                            </div>
                                            <div className='col-4' style={{ textAlign: 'right', paddingRight: '0px' }}>
                                                <span onClick={() => filtroResultEstado2(4, transportadora.id)} >{transportadora.cantidadDevolucion}</span>
                                            </div>
                                            <div className='col-12' style={{ marginTop: '5px', marginBottom: '5px' }}>
                                                <div style={{ height: '1px', width: '100%', borderBottom: '1px solid #c1c1c1' }}></div>
                                            </div>


                                            <div className='col-7'>
                                                <span onClick={() => filtroResultEstado2(7, transportadora.id)} style={{ cursor: 'pointer', marginRight: '3px' }}>-Devoluciones Recibidas</span>
                                            </div>
                                            <div className='col-4' style={{ textAlign: 'right', paddingRight: '0px' }}>
                                                <span onClick={() => filtroResultEstado2(7, transportadora.id)}>{transportadora.cantidadDevolucionRecibidas}</span>
                                            </div>
                                            <div className='col-12' style={{ marginTop: '5px', marginBottom: '5px' }}>
                                                <div style={{ height: '1px', width: '100%', borderBottom: '1px dotted #c1c1c1' }}></div>
                                            </div>

                                            <div className='col-7'>
                                                <span onClick={() => filtroResultEstado2(8, transportadora.id)} style={{ cursor: 'pointer', marginRight: '3px' }}>-Notas</span>
                                            </div>
                                            <div className='col-4' style={{ textAlign: 'right', paddingRight: '0px' }}>
                                                <span onClick={() => filtroResultEstado2(8, transportadora.id)}>{transportadora.cantidadNotas}</span>
                                            </div>
                                            <div className='col-12' style={{ marginTop: '5px', marginBottom: '5px' }}>
                                                <div style={{ height: '1px', width: '100%', borderBottom: '1px dotted #c1c1c1' }}></div>
                                            </div>

                                            <div className='col-7'>
                                                <span onClick={() => filtroResultEstado2(9, transportadora.id)} style={{ cursor: 'pointer', marginRight: '3px' }}>-Devoluciones Re-ofrecidas</span>
                                            </div>
                                            <div className='col-4' style={{ textAlign: 'right', paddingRight: '0px' }}>
                                                <span onClick={() => filtroResultEstado2(9, transportadora.id)}>{transportadora.cantidadReofrecidas}</span>
                                            </div>
                                            <div className='col-12' style={{ marginTop: '5px', marginBottom: '5px' }}>
                                                <div style={{ height: '1px', width: '100%', borderBottom: '1px dotted #c1c1c1' }}></div>
                                            </div>

                                        </>
                                    )}

                                    <div className='col-12' style={{ textAlign: 'left' }}>
                                        <span onClick={() => filtroResultEstado2(3, transportadora.id)} style={{ cursor: 'pointer', color: '#758693', fontWeight: 'bold' }}>{transportadora.cantidad} Paquetes</span>
                                        <br></br>
                                    </div>
                                </div>
                            </>
                        )
                    })}

                </div>
            </div>
        </div>
    </>
}