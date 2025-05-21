"use client";

import Swal                          from 'sweetalert2';
import axios                         from 'axios';
import Cookies                       from 'js-cookie';
import withReactContent              from 'sweetalert2-react-content';
import React, { useEffect,useState } from 'react';
import { format, parseISO }          from 'date-fns';
import { Modal }                     from 'react-bootstrap';
import { es }                        from 'date-fns/locale';
import * as XLSX                     from 'xlsx';
import { FileUploader }              from "react-drag-drop-files";
import { saveAs }                    from 'file-saver';

import '../comprobantes/style.css';
import '../envios/style.css';

const $ = require('jquery');

let usuarioId = 1;
let usuarioConsulta = 0;
let cargoSite = 0;
let nombreUsuario = "";
let controladorTiempo3 = "";
let controladorTiempo2 = "";
let controladorTiempo = "";
let incioRecaudo = "";
let finRecaudo = "";
let arrayFile = [];
let facturasCompensadas2 = [];
let offsetPagina = 0;
let limitPagina = 10;
let banderaBancoTCC = false;
let banderaRecaudoAnterior = false;
let rastreoGuias = [];
let resultRastreoTCC = [];
let dataResult = {
    contRelacionado: 0,
    contConfirmados: 0,
    contConAnomalias: 0,
    contFacturas: 0,
    valorRelacionado: 0,
    valorConfirmados: 0,
    valorConAnomalias: 0,
    valorFacturas: 0,
    valorConsignado: 0
};
let pedidoEdit = "";
let banderaSemana = false;

export default function Home() {

    const [resultRecaudo,setResultRecaudo] = useState({
        cantidadProduccion:0,
        cantidad: 0,
        cantidadViajando: 0,
        cantidadProcesoEntrega: 0,
        cantidadNovedad: 0,
        cantidadEntregado: 0,
        valor: 0,
        valorViajando: 0,
        valorProduccion: 0,
        valorProcesoEntrega: 0,
        valorNovedad: 0,
        valorEntregado: 0,
        cantidadPreparado: 0,
        valorPreparado: 0,
        bancoTCC: 0,
        ultimaRelacion: "",
        semanaRecaudo:0,
        anteriorRecaudo:0
    })
    const [resumenRelacion,setResumenRelacion] = useState(dataResult)
    const [data, setData] = useState([]);
    const [semanaActual,setSemanaActual] = useState("");
    const [consultando,setConsultado] = useState(true);
    const [modalNovedades,setModalNovedades] = useState(false);
    const [novedadesASesor,setNovedadesAsesor] = useState([]);
    const [modalSeguimiento,setModalSeguimiento] = useState(false);
    const [modalObservacion,setModalObservacion] = useState(false);
    const [modalRelacionPago,setModalRelacionPago] = useState(false);
    const [pedidos,setPedidos] = useState([]);
    const [file,setFile] = useState([]);
    const [entidades,setEntidades] = useState([]);
    const [solucionesNovedades,setSolucionesNovedades] = useState([]);

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

                usuarioId = decodedToken.payload.user;
                nombreUsuario = decodedToken.payload.nombre;

                $(".navbar").hide();

                cargarTransportadoras();
                cargarEntidades()
                getWeekRange();
                cargoSite = 1;
            }
        }
    })

    const handleChangeFile = (file) => {
        file.rutaPreview = URL.createObjectURL(file);
        arrayFile = [file];
        setFile([file]);
    }

    function excelDateToJSDate(excelDate) {
        // Excel dates are 1-based, so subtract 2 to account for the base date and off-by-one error
        const baseDate = new Date(Date.UTC(1899, 11, 30)); // December 30, 1899 is the base date for Excel
        const jsDate = new Date(baseDate.getTime() + (excelDate * 24 * 60 * 60 * 1000));
        
        // Format the date as dd/mm/yyyy
        const day = String(jsDate.getUTCDate()).padStart(2, '0');
        const month = String(jsDate.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-based
        const year = jsDate.getUTCFullYear();
        
        return `${year}-${month}-${day}`;
    }

    const handleFileUpload = (event) => {
        const file = event.target.files[0]; // Obtener el archivo seleccionado
        const reader = new FileReader();
    
        // Leer el archivo como un array buffer
        reader.readAsArrayBuffer(file);
    
        reader.onload = (e) => {
            const bufferArray = e.target.result;
    
            const workbook = XLSX.read(bufferArray, { type: 'buffer' });
    
            const worksheetName = workbook.SheetNames[0]; // Leer la primera hoja de trabajo
            const worksheet = workbook.Sheets[worksheetName];
            const data = XLSX.utils.sheet_to_json(worksheet); // Convertir hoja de Excel a JSON
    
            // Filtrar solo las columnas A, C, y D (por nombre de columna)
            const filteredData = [];
            let valorRelacion = 0;

            data.map((row) => {
                if(row[' Valor '] != undefined){
                    console.log(row);
                    valorRelacion += row[' Valor '];
                    filteredData.push({
                        valor: row[' Valor '], // Celda A
                        remesa: row['Remesa'], // Celda C
                        pedido: 'Validando...',  // Celda D
                        fecha: excelDateToJSDate(row['Fecha Cumplido']),
                        estado: '...',
                        validando: 0,
                        nota: ''
                    });
                }
            })
            console.log(filteredData);

            if(filteredData.length > 0){
                cotejarRelacion(filteredData);
            }

            const worksheetName2 = workbook.SheetNames[1]; // Leer la primera hoja de trabajo
            const worksheet2 = workbook.Sheets[worksheetName2];
            const data2 = XLSX.utils.sheet_to_json(worksheet2); // Convertir hoja de Excel a JSON

            let facturasCompensadas = [];
            let valorFacturas = 0;
            data2.map((row) => {
                if(row['FACTURA'] != undefined){
                    valorFacturas += parseInt(row[' COMPENSADO ']);
                    facturasCompensadas.push({
                        factura: row['FACTURA'],
                        valor: row[' COMPENSADO ']
                    })
                }
            })
            facturasCompensadas2 = facturasCompensadas;
            dataResult['contRelacionado']  = filteredData.length;
            dataResult['valorRelacionado']  = valorRelacion;
            dataResult['contFacturas'] = facturasCompensadas.length;
            dataResult['valorFacturas'] = valorFacturas;
            setResumenRelacion(dataResult);

            setData(filteredData); // Guardar los datos filtrados en el estado
        };
    
        reader.onerror = (error) => {
            console.error("Error al leer el archivo: ", error);
        };
    };

    async function cotejarRelacion(datos){
        await axios.post(process.env.ENDPOINT_API+'/TCC/cotejarRelacion',{ 
            pedidos: datos
        }).then(response => { 
            if(response.data.bandera == 1){
                response.data.pedidos.map((row) => {
                    //no se encontro o el valor no es
                    if(row['validando'] != 2){
                        dataResult['contConAnomalias'] += 1;
                        dataResult['valorConAnomalias'] += parseInt(row.valor);
                    }
                    if(row['validando'] == 2){
                        dataResult['contConfirmados'] += 1;
                        dataResult['valorConfirmados'] += parseInt(row.valor);
                    }
                })
                setResumenRelacion(dataResult);
                setData(response.data.pedidos)
            }else{
                const swalWithReact = withReactContent(Swal);
                // Manejar el error aquí
                withReactContent(Swal).fire({
                    title: "Error",
                    text: "Comunica con soporte (validando relacion TCC)",
                    icon: "error"
                })
            }
        }).catch(error => {
            console.log(error);
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (validando relacion TCC)",
                icon: "error"
            })
        });    
    }


    async function cargarTransportadoras() {
        await axios.get(process.env.ENDPOINT_API+'/despachos/transportadoras').then(response => { 
            if(response.data.bandera == 1){
                setSolucionesNovedades(response.data.solucionNovedades)
                setTimeout(function(){
                    cargarData()
                    cargarResult();
                }, 1000);
            }else{
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
        await axios.post(process.env.ENDPOINT_API+'/TCC/resultdespachos',{ 
            inicioRecaudo: incioRecaudo,
            finRecaudo: finRecaudo
        }).then(response => { 
            if(response.data.bandera == 1){
                setResultRecaudo(response.data.recaudo)
            }else{
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

    const formattedPrice = (value) => {
        if (typeof value !== 'number') {
            value = Number(value);
        }
        return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    //buscador de datos de facturacion
    const handleBuscador = (event) => {
        setConsultado(true);
        clearTimeout(controladorTiempo); 
        controladorTiempo = setTimeout(() => cargarDataFiltro(), 100);
    }

    function filtroBanco(){
        banderaSemana = false;
        banderaRecaudoAnterior = false;
        banderaBancoTCC = true;
        setConsultado(true);
        clearTimeout(controladorTiempo2);
        
        offsetPagina = 0;
        cargarData()
        cargarResult();
    }

    function filtroRecaudoSemana(bandera){
        if(bandera == 2){
            banderaSemana = false;
            banderaRecaudoAnterior = true;
        }else{
            banderaRecaudoAnterior = false;
            banderaSemana = true;
        }
        setConsultado(true);
        clearTimeout(controladorTiempo2);
        
        offsetPagina = 0;
        cargarData()
        cargarResult();
    }

    function filtroResultEstado(bandera){
        banderaSemana = false;
        banderaRecaudoAnterior = false;
        setConsultado(true);
        clearTimeout(controladorTiempo2);
        $("#estadoEnvio").val(bandera);
        $("#tipoEnvio").val(3);
        offsetPagina = 0;
        cargarData()
        cargarResult();
    }

    const getWeekRange = () => {
        const today = new Date();
        const dayOfWeek = today.getDay(); // Domingo es 0, Lunes es 1, ..., Viernes es 5, Jueves es 4
        let viernesAnterios = new Date();
        let juevesFin = new Date();

        //antes de todo martes
        if(dayOfWeek < 2){
            //menor a jueves
            viernesAnterios = new Date()
            let encontro = true;
            let contador = 0;
            while(encontro){
                viernesAnterios.setDate(viernesAnterios.getDate()-1)
                if(viernesAnterios.getDay() == 5){
                    contador += 1;
                    //if(contador == 2){
                        encontro = false;
                    //}
                }
            }
            
            juevesFin = new Date(viernesAnterios);
            let encontro2 = true;
            while(encontro2){
                juevesFin.setDate(juevesFin.getDate()+1)
                if(juevesFin.getDay() == 4){
                    encontro2 = false;
                }
            }
        }else{
            //menor a jueves
            viernesAnterios = new Date()
            let encontro = true;
            let contador = 0;
            while(encontro){
                viernesAnterios.setDate(viernesAnterios.getDate()-1)
                if(viernesAnterios.getDay() == 5){
                    encontro = false;
                }
            }
            
            juevesFin = new Date(viernesAnterios);
            let encontro2 = true;
            while(encontro2){
                juevesFin.setDate(juevesFin.getDate()+1)
                if(juevesFin.getDay() == 4){
                    encontro2 = false;
                }
            }
        }

        incioRecaudo = viernesAnterios.getFullYear()+"-"+String(viernesAnterios.getMonth() + 1).padStart(2, '0')+"-"+String(viernesAnterios.getDate()).padStart(2, '0');
        finRecaudo = juevesFin.getFullYear()+"-"+String(juevesFin.getMonth() + 1).padStart(2, '0')+"-"+String(juevesFin.getDate() + 1).padStart(2, '0');
        
        setSemanaActual(`${formatDate(viernesAnterios)} - ${formatDate(juevesFin)}`);
        cargarAsesores();
        cargarData()
    };

    async function cargarData(){
        await axios.post(process.env.ENDPOINT_API+'/despachos/despachoAsesor',{ 
            transportadora: 1,
            tipoEnvio: $("#tipoEnvio").val(),
            estado: $("#estadoEnvio").val(),
            search: $("#buscadorInput").val(),
            banderaSemana: banderaSemana,
            recaudoAnterior: banderaRecaudoAnterior,
            inicioRecaudo: incioRecaudo,
            finRecaudo: finRecaudo,
            offset: offsetPagina,
            bancoTCC: banderaBancoTCC,
            limit: limitPagina,
            usuario: usuarioConsulta,
            admin: true,
            orderFecha: 'ASC'
        }).then(response => { 
            if(response.data.bandera == 0){
                const swalWithReact = withReactContent(Swal);
                // Manejar el error aquí
                withReactContent(Swal).fire({
                    title: "Error",
                    text: "Comunica con soporte (cargar despachos)",
                    icon: "error"
                })
            }else{
                setConsultado(false);
                let consultarWsTCC = false;
                let dataPedidos = [];
                
                for (var i = 0; i < response.data.pedidos.length; i++) {
                    if(usuarioConsulta == 0){
                        dataPedidos.push(response.data.pedidos[i]);
                    }else{
                        if(response.data.pedidos[i].usuarioId == usuarioConsulta){
                            dataPedidos.push(response.data.pedidos[i]);
                        }
                    }
                }
                
                for (var i = response.data.rastreoTcc.length - 1; i >= 0; i--) {
                    
                    let agregar = true;
                    for (var e = rastreoGuias.length - 1; e >= 0; e--) {
                        if(rastreoGuias[e].guia == response.data.rastreoTcc[i].numeroremesa){
                            agregar = false;
                            consultarWsTCC = true;
                        } 
                    }
                    if(agregar){
                        rastreoGuias.push({
                            guia: response.data.rastreoTcc[i].numeroremesa
                        })
                        consultarWsTCC = true;
                    }
                }
                
                if(offsetPagina == 0){
                    setPedidos(dataPedidos)
                }else{
                    setPedidos((prevPedidos) => [...prevPedidos, ...dataPedidos]);
                }
                
                

                if(consultarWsTCC){
                    clearTimeout(controladorTiempo3);
                    controladorTiempo3 = setTimeout(() => {
                        seguimientoGuiasTCC();
                    })
                }
               
                if(response.data.pedidos.length == limitPagina){
                    clearTimeout(controladorTiempo2);
                    controladorTiempo2 = setTimeout(() => {
                        offsetPagina += limitPagina;
                        cargarData()
                    }, 1000); 
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

    async function cargarAsesores(){
        await axios.post(process.env.ENDPOINT_API+'/despachos/asesores').then(response => { 
            if(response.data.bandera == 1){
                for (var i = response.data.asesores.length - 1; i >= 0; i--) {
                    $("#asesores").append('<option value="'+response.data.asesores[i].id+'">'+response.data.asesores[i].name+'</option>')
                }
                cargarResult();
            }else{
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

    // Formatear fechas (6 - 12 de septiembre, por ejemplo)
    const formatDate = (date) => {
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });
        return `${day} ${month}`;
    };

    async function seguimientoGuiasTCC() {
        await axios.post(process.env.ENDPOINT_API+'/despachos/trasabilidadTCC',{ 
            guias: rastreoGuias,
        }).then(response => { 
            if(response.data.bandera == 1){
                resultRastreoTCC = response.data.resultTCC['remesasrespuesta']['RemesaEstados'];
                for (var i = resultRastreoTCC.length - 1; i >= 0; i--) {
                    let estados = resultRastreoTCC[i]['listaestados']['Estado'];
                    if(estados.length > 0){
                        // Convertir las fechas a formato solo con día, mes y año (sin horas)
                        const fechaUltimoMovimiento = new Date(estados[estados.length-1].fecha);
                        const hoy = new Date();

                        // Normalizar ambas fechas para eliminar horas, minutos y segundos
                        const fechaUltimoMovimientoSoloDia = new Date(fechaUltimoMovimiento.getFullYear(), fechaUltimoMovimiento.getMonth(), fechaUltimoMovimiento.getDate());
                        const hoySoloDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

                        // Calcular la diferencia en días
                        const diferenciaTiempo = hoySoloDia.getTime() - fechaUltimoMovimientoSoloDia.getTime();
                        const diferenciaDias = Math.floor(diferenciaTiempo / (1000 * 3600 * 24)); 

 
                        if(diferenciaDias < 2){
                            $("#guia-"+resultRastreoTCC[i].numeroremesa).css('color','inherit');
                        }

                        $("#guia-"+resultRastreoTCC[i].numeroremesa).html(estados[estados.length-1].descripcion+"<b style='display:block'>"+formatFechaHora(estados[estados.length-1].fecha)+"</b>")
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
        if(date != "Invalid Date"){
            // Formatea el día y el mes abreviado con punto al final
            const formattedDate = format(date, "d 'de' MMM. ", { locale: es });
            // Formatea la hora con AM/PM
            const formattedTime = format(date, "hh:mm a");

            return `${formattedDate} ${formattedTime}`;
        }
        return "";
    };

    function novedadesEnvio(pedido){
        setModalNovedades(true);
        $(".resultPedidoModal").html("")
        $("#novedadesPaqueteAsesor").html("")
        setNovedadesAsesor(pedido.novedades);
        setTimeout(() => {

            $(".resultPedidoModal").html("")

            let div = "<h3 style='margin-bottom:0px;text-align:center;width:100%'>"+pedido.referencia+"</h3>"
            div += "<div style='text-align:center;border-right:3px solid #e9e9e9' class='col-8'>";
            div += "<p style='text-align:left;margin-top:20px;line-height:14px'>"
            div += "<b>Guia:</b> "+pedido.guia
            div += "<br></br><b>Destinatario:</b> "+pedido.destinatario
            div += "<br></br><b>Cedula:</b> "+pedido.documento
            div += "<br></br><b>Ciudad:</b> "+pedido.ciudaName+" - "+pedido.nameDepartamnento
            div += "<br></br><b>Direccion:</b> "+pedido.direccion
            div += "<br></br><b>Telefono:</b> "+pedido.telefono
            div += "</p></div>"

            div += "<div style='text-align:center' class='col-4'>"
            div += "<div style='display: table;height:100%;width:100%'><div style='display: table-cell;vertical-align: middle'>";
            div += "<h2 style='margin-bottom:0px'>"
            if(pedido.tipoEnvio == 1){
                div += "Contado</h2>"
            }
            else if(pedido.tipoEnvio == 2){
                div += "Contra Entrega</h2>"
            }
            else if(pedido.tipoEnvio == 3){
                div += "Recaudo</h2><p>"+formattedPrice(pedido.recaudo)+"</p>"
            }else if(pedido.tipoEnvio == 4){
                div += "Recoge En Tienda</h2>"
            }

            
            div += "</div></div></div>";
            $(".resultPedidoModal").html(div)

        }, 100);
    }

    function trasabilidadEnvio(pedido){
        
        $(".resultPedidoModal").html("")

        setModalSeguimiento(true);
        setTimeout(() => {

            let div = "<h3 style='margin-bottom:0px;text-align:center;width:100%'>"+pedido.referencia+"</h3>"
            div += "<div style='text-align:center;border-right:3px solid #e9e9e9' class='col-8'>";
            div += "<p style='text-align:left;margin-top:20px;line-height:14px'>"
            div += "<b>Guia:</b> "+pedido.guia
            div += "<br></br><b>Destinatario:</b> "+pedido.destinatario
            div += "<br></br><b>Cedula:</b> "+pedido.documento
            div += "<br></br><b>Ciudad:</b> "+pedido.ciudaName+" - "+pedido.nameDepartamnento
            div += "<br></br><b>Direccion:</b> "+pedido.direccion
            div += "<br></br><b>Telefono:</b> "+pedido.telefono
            div += "</p></div>"

            div += "<div style='text-align:center' class='col-4'>"
            div += "<div style='display: table;height:100%;width:100%'><div style='display: table-cell;vertical-align: middle'>";
            div += "<h2 style='margin-bottom:0px'>"
            if(pedido.tipoEnvio == 1){
                div += "Contado</h2>"
            }
            else if(pedido.tipoEnvio == 2){
                div += "Contra Entrega</h2>"
            }
            else if(pedido.tipoEnvio == 3){
                div += "Recaudo</h2><p>"+formattedPrice(pedido.recaudo)+"</p>"
            }else if(pedido.tipoEnvio == 4){
                div += "Recoge En Tienda</h2>"
            }

            
            div += "</div></div></div>";
            $(".resultPedidoModal").html(div)

            $("#historyPaquete").html('<li><a style="font-weight: bold">'+formatFechaHora(pedido.fechaSalida)+'</a><p>Genero rotulo ('+pedido.usuarioDespachoName+')</p></li>');
            $("#novedadesPaquete").html('');

            if(pedido.transportadora != 1){
                $("#historyPaquete").prepend('<li><a style="font-weight: bold">'+formatFechaHora(pedido.fechaRecogida)+'</a><p>Entregado a transportadora</p></li>');
            }else{
                for (var i = resultRastreoTCC.length - 1; i >= 0; i--) {
                    if(resultRastreoTCC[i].numeroremesa == pedido.guia){
                        let estados = resultRastreoTCC[i]['listaestados']['Estado'];
                        if(estados.length > 0){
                            for (var e = 0; e < estados.length; e++) {
                                $("#historyPaquete").prepend('<li><a style="font-weight: bold">'+formatFechaHora(estados[e].fecha)+'</a><p>'+estados[e].descripcion+'</p></li>');
                            }
                        }
                        if (resultRastreoTCC[i].listanovedades !== undefined) {
                            let novedades = resultRastreoTCC[i]['listanovedades']['Novedad'];
                            if(novedades.length > 0){
                                for (var e = 0; e < novedades.length; e++) {
                                    if(novedades[e].estadonovedad == "Informada"){
                                        $("#novedadesPaquete").prepend('<li class="novedadSinSolucion"><a style="font-weight: bold">'+formatFechaHora(novedades[e].fechanovedad)+'</a><p>'+novedades[e].novedad+'</p></li>');
                                    }else{
                                        $("#novedadesPaquete").prepend('<li class="novedadSolucionada"><a style="font-weight: bold">'+formatFechaHora(novedades[e].fechanovedad)+'</a><p>'+novedades[e].novedad+'</p></li>');
                                    }
                                    
                                }
                            }
                        }else{
                            $("#novedadesPaquete").html('<span>Sin novedades</span>')
                        }
                        
                    }
                }
            }
            
        }, 100);
        
    }

    function cerrarModal(){
        setModalSeguimiento(false);
        setModalNovedades(false);
        setModalObservacion(false);
        setModalRelacionPago(false);
    }

    function observacionesGuia(pedido){
        setModalObservacion(true);
        $(".resultPedidoModal").html("")
        pedidoEdit = pedido;
        setTimeout(() => {
            cargarObservacionesPedido(pedidoEdit.referencia)

            $(".resultPedidoModal").html("")

            let div = "<h3 style='margin-bottom:0px;text-align:center;width:100%'>"+pedido.referencia+"</h3>"
            div += "<div style='text-align:center;border-right:3px solid #e9e9e9' class='col-8'>";
            div += "<p style='text-align:left;margin-top:20px;line-height:14px'>"
            div += "<b>Guia:</b> "+pedido.guia
            div += "<br></br><b>Destinatario:</b> "+pedido.destinatario
            div += "<br></br><b>Cedula:</b> "+pedido.documento
            div += "<br></br><b>Ciudad:</b> "+pedido.ciudaName+" - "+pedido.nameDepartamnento
            div += "<br></br><b>Direccion:</b> "+pedido.direccion
            div += "<br></br><b>Telefono:</b> "+pedido.telefono
            div += "</p></div>"

            div += "<div style='text-align:center' class='col-4'>"
            div += "<div style='display: table;height:100%;width:100%'><div style='display: table-cell;vertical-align: middle'>";
            div += "<h2 style='margin-bottom:0px'>"
            if(pedido.tipoEnvio == 1){
                div += "Contado</h2>"
            }
            else if(pedido.tipoEnvio == 2){
                div += "Contra Entrega</h2>"
            }
            else if(pedido.tipoEnvio == 3){
                div += "Recaudo</h2><p>"+formattedPrice(pedido.recaudo)+"</p>"
            }else if(pedido.tipoEnvio == 4){
                div += "Recoge En Tienda</h2>"
            }

            
            div += "</div></div></div>";
            $(".resultPedidoModal").html(div)

        }, 100);
    }

    async function reportarObservacion(){
        $("#alertObservacion").hide().html("Debes ingresar una observacion");
        if($("#observacion").val().length == 0){
            $("#alertObservacion").show();
            return 0
        }else{
            await axios.post(process.env.ENDPOINT_API+'/despachos/reporteObservacion',{ 
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
        await axios.post(process.env.ENDPOINT_API+'/despachos/dataObservaciones',{ 
            pedido: referencia,
        }).then(response => { 
            $("#observacionPaquete").html("")
            if(response.data.observaciones.length > 0){
                for (var i = response.data.observaciones.length - 1; i >= 0; i--) {
                    $("#observacionPaquete").prepend('<li><a style="font-weight: bold">'+formatFechaHora(response.data.observaciones[i].fecha)+" - "+response.data.observaciones[i].name+'</a><p>'+response.data.observaciones[i].observacion+'</p></li>');
                }
            }else{
                $("#observacionPaquete").html("No tiene registros");
            }
        }).catch(error => {
            $("#observacionPaquete").html("ERROR - Comunica con soporte (consultar observaciones)");
        }); 
    }

    function cargarDataFiltro(){
        banderaSemana = false;
        banderaRecaudoAnterior = false;
        clearTimeout(controladorTiempo2);
        offsetPagina = 0;
        cargarData();
    }

    function cambioAsesor(){
        clearTimeout(controladorTiempo2);
        setConsultado(true);
        usuarioConsulta = $("#asesores").val();
        $("#estadoEnvio").val(3);
        $("#tipoEnvio").val(0);
        $("#transportadora").val(0);
        offsetPagina = 0;
        banderaSemana = false;
        banderaRecaudoAnterior = false;
        cargarData()
        cargarResult();
    }

    function abrirRelacionPago(){
        setModalRelacionPago(true);
    }

    function reportarPago(){
        $("#alertRelacion").hide();
        if(dataResult['contRelacionado'] == 0){

            $("#alertRelacion").show().html("Algunos parametros no son validos");

        }else if(dataResult['contRelacionado'] != dataResult['contConfirmados']){

            $("#alertRelacion").show().html("La cantidad de guias confirmadas no es igual a las relacionadas");

        }else{

            $(".divRelacion1").hide();
            $(".divRelacion2").show();
        }
    }

    //carga las entidades bancarias
    async function cargarEntidades() {
        await axios.post(process.env.ENDPOINT_API+'/pedidos/modalidades').then(response => {
            setEntidades(response.data.entidades);
        }).catch(error => {
            console.log(error);
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (cargar entidades bancarias)",
                icon: "error"
            })
        });
    }

    function descargarXLSRelacion(){
        $("#alertRelacion").hide();
        if($("#reciboPago").val().length == 0){
            $("#alertRelacion").show().html("Ingresa el consecutivo de los Recibos de SIIGO");
        }else if(arrayFile.length == 0){
            $("#alertRelacion").show().html("Debes subir una evidencia de pago");
        }else if($("#fechaPago").val().length == 0){
            $("#alertRelacion").show().html("Debes ingresar la fecha del pago");
        }
        prepararExcelRelacion();
    }

    function prepararExcelRelacion(){
        let data = [];
        let consecutivoFactura = $("#reciboPago").val()
        const fecha = new Date($("#fechaPago").val());
        let contadorSecuencia = 1;

        //reporta el ingreso al banco
        data.push({ 
            'TIPO DE COMPROBANTE (OBLIGATORIO)': 'R', 
            'CÓDIGO COMPROBANTE  (OBLIGATORIO)': '1', 
            'NÚMERO DE DOCUMENTO': consecutivoFactura,
            'CUENTA CONTABLE   (OBLIGATORIO)': $('#entidadPago').val(),
            'DÉBITO O CRÉDITO (OBLIGATORIO)': "D",
            'VALOR DE LA SECUENCIA   (OBLIGATORIO)': dataResult['valorRelacionado']-dataResult['valorFacturas'],
            'AÑO DEL DOCUMENTO': fecha.getFullYear(),
            'MES DEL DOCUMENTO': (fecha.getMonth() +1),
            'DÍA DEL DOCUMENTO': fecha.getDate(),
            'CÓDIGO DEL VENDEDOR': "0",
            'CÓDIGO DE LA CIUDAD': "0",
            'CÓDIGO DE LA ZONA': "0",
            'SECUENCIA': contadorSecuencia,
            'CENTRO DE COSTO': "0",
            'SUBCENTRO DE COSTO': "0",
            'NIT': "",
            'SUCURSAL': "0",
            'DESCRIPCIÓN DE LA SECUENCIA': "TRASLADO POR PAGO TCC - "+$('#entidadPago option:selected').html().toUpperCase(),
            'NÚMERO DE CHEQUE': "0",
            'COMPROBANTE ANULADO': "N",
            'CÓDIGO DEL MOTIVO DE DEVOLUCIÓN': "0",
            'FORMA DE PAGO': "7",
            'VALOR DEL CARGO 1 DE LA SECUENCIA': "0",
            'VALOR DEL CARGO 2 DE LA SECUENCIA': "0",
            'VALOR DEL DESCUENTO 1 DE LA SECUENCIA': "0",
            'VALOR DEL DESCUENTO 2 DE LA SECUENCIA': "0",
            'VALOR DEL DESCUENTO 3 DE LA SECUENCIA': "0",
            'FACTURA ELECTRÓNICA A DEBITAR/ACREDITAR': "",
            'NÚMERO DE FACTURA ELECTRÓNICA A DEBITAR/ACREDITAR': "0",
            'PREFIJO DE ORDER REFERENCE': "",
            'CONSECUTIVO DE ORDER REFERENCE': "",
            'PREFIJO ORDEN DE ENTREGA': "",
            'AÑO FECHA DE ORDEN DE ENTREGA': "0",
            'MES FECHA DE ORDEN DE ENTREGA': "0",
            'DÍA FECHA DE ORDEN DE ENTREGA': "0",
            'INGRESOS PARA TERCEROS': "",
            'PORCENTAJE DEL IVA DE LA SECUENCIA': "0",
            'VALOR DE IVA DE LA SECUENCIA': "0",
            'BASE DE RETENCIÓN': "",
            'BASE PARA CUENTAS MARCADAS COMO RETEIVA': "0",
            'SECUENCIA GRAVADA O EXCENTA': "S",
            'PORCENTAJE AIU': "",
            'BASE IVA AIU': "",
            'VALOR TOTAL IMPOCONSUMO DE LA SECUENCIA': "0",
            'LÍNEA PRODUCTO': "0",
            'GRUPO PRODUCTO':"0",
            'CÓDIGO PRODUCTO': "0",
            'CANTIDAD': "0",
            'CANTIDAD DOS': "0",
            'CÓDIGO DE LA BODEGA': "1",
            'CÓDIGO DE LA UBICACIÓN': "0",
            'CANTIDAD DE FACTOR DE CONVERSIÓN': "0",
            'OPERADOR DE FACTOR DE CONVERSIÓN': "0",
            'VALOR DEL FACTOR DE CONVERSIÓN': "0",
            'TIPO DE MONEDA ELABORACIÓN': "0",
            'TIPO Y COMPROBANTE CRUCE': "",
            'NÚMERO DE DOCUMENTO CRUCE': "",
            'NÚMERO DE VENCIMIENTO': "",
            'AÑO VENCIMIENTO DE DOCUMENTO CRUCE': "",
            'MES VENCIMIENTO DE DOCUMENTO CRUCE': "",
            'DÍA VENCIMIENTO DE DOCUMENTO CRUCE': "",
            'DESCRIPCIÓN DE COMENTARIOS': ""
        })
        contadorSecuencia += 1;

        //reporta la salida del TCC
        data.push({ 
            'TIPO DE COMPROBANTE (OBLIGATORIO)': 'R', 
            'CÓDIGO COMPROBANTE  (OBLIGATORIO)': '1', 
            'NÚMERO DE DOCUMENTO': consecutivoFactura,
            'CUENTA CONTABLE   (OBLIGATORIO)': '1120150300',
            'DÉBITO O CRÉDITO (OBLIGATORIO)': "C",
            'VALOR DE LA SECUENCIA   (OBLIGATORIO)': dataResult['valorRelacionado']-dataResult['valorFacturas'],
            'AÑO DEL DOCUMENTO': fecha.getFullYear(),
            'MES DEL DOCUMENTO': (fecha.getMonth() +1),
            'DÍA DEL DOCUMENTO': fecha.getDate(),
            'CÓDIGO DEL VENDEDOR': "0",
            'CÓDIGO DE LA CIUDAD': "0",
            'CÓDIGO DE LA ZONA': "0",
            'SECUENCIA': contadorSecuencia,
            'CENTRO DE COSTO': "0",
            'SUBCENTRO DE COSTO': "0",
            'NIT': "",
            'SUCURSAL': "0",
            'DESCRIPCIÓN DE LA SECUENCIA': "TRASLADO POR PAGO TCC - "+$('#entidadPago option:selected').html().toUpperCase(),
            'NÚMERO DE CHEQUE': "0",
            'COMPROBANTE ANULADO': "N",
            'CÓDIGO DEL MOTIVO DE DEVOLUCIÓN': "0",
            'FORMA DE PAGO': "7",
            'VALOR DEL CARGO 1 DE LA SECUENCIA': "0",
            'VALOR DEL CARGO 2 DE LA SECUENCIA': "0",
            'VALOR DEL DESCUENTO 1 DE LA SECUENCIA': "0",
            'VALOR DEL DESCUENTO 2 DE LA SECUENCIA': "0",
            'VALOR DEL DESCUENTO 3 DE LA SECUENCIA': "0",
            'FACTURA ELECTRÓNICA A DEBITAR/ACREDITAR': "",
            'NÚMERO DE FACTURA ELECTRÓNICA A DEBITAR/ACREDITAR': "0",
            'PREFIJO DE ORDER REFERENCE': "",
            'CONSECUTIVO DE ORDER REFERENCE': "",
            'PREFIJO ORDEN DE ENTREGA': "",
            'AÑO FECHA DE ORDEN DE ENTREGA': "0",
            'MES FECHA DE ORDEN DE ENTREGA': "0",
            'DÍA FECHA DE ORDEN DE ENTREGA': "0",
            'INGRESOS PARA TERCEROS': "",
            'PORCENTAJE DEL IVA DE LA SECUENCIA': "0",
            'VALOR DE IVA DE LA SECUENCIA': "0",
            'BASE DE RETENCIÓN': "",
            'BASE PARA CUENTAS MARCADAS COMO RETEIVA': "0",
            'SECUENCIA GRAVADA O EXCENTA': "S",
            'PORCENTAJE AIU': "",
            'BASE IVA AIU': "",
            'VALOR TOTAL IMPOCONSUMO DE LA SECUENCIA': "0",
            'LÍNEA PRODUCTO': "0",
            'GRUPO PRODUCTO':"0",
            'CÓDIGO PRODUCTO': "0",
            'CANTIDAD': "0",
            'CANTIDAD DOS': "0",
            'CÓDIGO DE LA BODEGA': "1",
            'CÓDIGO DE LA UBICACIÓN': "0",
            'CANTIDAD DE FACTOR DE CONVERSIÓN': "0",
            'OPERADOR DE FACTOR DE CONVERSIÓN': "0",
            'VALOR DEL FACTOR DE CONVERSIÓN': "0",
            'TIPO DE MONEDA ELABORACIÓN': "0",
            'TIPO Y COMPROBANTE CRUCE': "",
            'NÚMERO DE DOCUMENTO CRUCE': "",
            'NÚMERO DE VENCIMIENTO': "",
            'AÑO VENCIMIENTO DE DOCUMENTO CRUCE': "",
            'MES VENCIMIENTO DE DOCUMENTO CRUCE': "",
            'DÍA VENCIMIENTO DE DOCUMENTO CRUCE': "",
            'DESCRIPCIÓN DE COMENTARIOS': ""
        })
        contadorSecuencia += 1;

        // Crear una hoja de trabajo de Excel (worksheet) vacía
        const ws = XLSX.utils.aoa_to_sheet([[]]);

        // Agregar el texto que ocupará dos columnas
        XLSX.utils.sheet_add_aoa(ws, [["TRES SON UNO S.A.S"]], { origin: 'A1' });

        // Fusionar las celdas (A1 y AT1)(A2 y AT2)(A3 y AT3)
        ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 45 } },{ s: { r: 1, c: 0 }, e: { r: 1, c: 45 } },{ s: { r: 2, c: 0 }, e: { r: 2, c: 45 } }];


        // Convertir los datos a la hoja de trabajo, empezando desde la fila 3
        XLSX.utils.sheet_add_json(ws, data, { origin: 'A5', skipHeader: false });


        // Crear un libro de trabajo de Excel (workbook)
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Datos');

        // Generar un archivo Excel
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

        // Guardar el archivo automáticamente
        let blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

        let fecha2 = new Date();
        saveAs(blob, 'RE_SAS_'+fecha2.getDate()+"_"+(fecha2.getMonth() +1)+"_"+fecha2.getFullYear()+"__"+fecha2.getHours()+":"+fecha2.getMinutes()+":"+fecha2.getSeconds()+'.xlsx');
    }

    async function reportarRelacionPago(){
        $("#alertRelacion").hide();
        if($("#reciboPago").val().length == 0){
            $("#alertRelacion").show().html("Ingresa el consecutivo de los Recibos de SIIGO");
        }else if(arrayFile.length == 0){
            $("#alertRelacion").show().html("Debes subir una evidencia de pago");
        }else if($("#fechaPago").val().length == 0){
            $("#alertRelacion").show().html("Debes ingresar la fecha del pago");
        }else{

            let recibo = $("#reciboPago").val()
            let banco = $("#entidadPago").val()
            let fecha =  $("#fechaPago").val()
            setModalRelacionPago(false);
            const swalWithReact = withReactContent(Swal);
            swalWithReact.fire({
                title: "Confirmación",
                html: "¿Esta segur@ de reportar el movimiento?",
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

                    const formData = new FormData();
                    arrayFile.forEach((file, index) => {
                        formData.append(`file${index}`, file); // Agrega el archivo
                        formData.append(`rutaPreview${index}`, file.rutaPreview);
                    });
                    formData.append('facturasCruzadas',JSON.stringify(facturasCompensadas2));
                    formData.append('usuario',usuarioId);
                    formData.append('data',JSON.stringify(data))
                    formData.append('recibo',recibo)
                    formData.append('entidad',banco)
                    formData.append('fecha',fecha)
                    formData.append('total',dataResult['valorRelacionado'])
                    formData.append('facturas',dataResult['valorFacturas'])
                    formData.append('consignado',parseInt(dataResult['valorRelacionado'])-parseInt(dataResult['valorFacturas']))
                    
                    await axios.post(process.env.ENDPOINT_API+'/TCC/reportarPagoTCC',formData).then(response => { 
                        swalWithReact.fire({
                            title: "Aplicado",
                            text: "Movimiento Reportado",
                            icon: "success",
                            showConfirmButton: false, // Ocultar el botón de confirmación
                            timer: 2000 // Cerrar automáticamente después de 2 segundos
                        });
                        cargarData()
                        cargarResult();
                    }).catch(error => {
                        console.log(error);
                        const swalWithReact = withReactContent(Swal);
                        // Manejar el error aquí
                        withReactContent(Swal).fire({
                            title: "Error",
                            text: "Comunica con soporte (reportar Relacion)",
                            icon: "error"
                        })
                    });
                    
                }else{
                    setModalRelacionPago(true);
                }
            })
        
        }
    } 


    return <>
        
        <Modal show={modalRelacionPago} className="modal-lg" onHide={cerrarModal}>
            <Modal.Header closeButton>
            </Modal.Header>
            <Modal.Body style={{marginTop:'-40px'}}>
                <div className='row'>
                    <div className='col-12'>
                        <div className='row' style={{marginBottom:'10px'}}>
                            <label>Relacion TCC:</label>
                            <input type="file" onChange={handleFileUpload} accept=".xlsb, .xlsx, .xls" />
                        </div>
                        <div className="alert alert-danger" id='alertRelacion' style={{display:'none',textAlign:'center'}}  role="alert">
                            Debes ingresar una observacion
                        </div>
                        <div className='row' style={{width:'90%',margin:'auto',background:'#e9e9e9',padding:'10px'}}>
                            <div className='col-6' style={{borderRight:'2px solid #c1c1c1'}}>
                                <div className='row'>
                                    <div className='col-8'>
                                        - Relacion ({resumenRelacion.contRelacionado})
                                        <br></br>
                                        - Confirmadas ({resumenRelacion.contConfirmados})
                                        <br></br>
                                        - Con anomalias ({resumenRelacion.contConAnomalias})
                                    </div>
                                    <div className='col-4'>
                                        {formattedPrice(resumenRelacion.valorRelacionado)}
                                        <br></br>
                                        {formattedPrice(resumenRelacion.valorConfirmados)}
                                        <br></br>
                                        {formattedPrice(resumenRelacion.valorConAnomalias)}
                                    </div>
                                </div>
                            </div>
                            <div className='col-6'>
                                <div className='row'>
                                    <div className='col-8'>
                                        - Remesas ({resumenRelacion.contRelacionado})
                                        <br></br>
                                        - Facturas ({resumenRelacion.contFacturas})
                                        <br></br>
                                        - Consignado
                                    </div>
                                    <div className='col-4' style={{textAlign:'center'}}>
                                        <span style={{color:'green'}}>{formattedPrice(resumenRelacion.valorRelacionado)}</span>
                                        <br></br>
                                        <span style={{color:'red'}}>{formattedPrice(resumenRelacion.valorFacturas)}</span>
                                        <br></br>
                                        <span style={{borderTop:'1px solid #c1c1c1',width:'100%',display:'block'}}>{formattedPrice(resumenRelacion.valorRelacionado-resumenRelacion.valorFacturas)}</span>
                                    </div>
                                </div>
                            </div>  
                        </div>
                        <div className='row divRelacion1' >
                            <div className='col-12' style={{textAlign:'right',marginTop:'10px'}}>
                                <button onClick={() => reportarPago()} className='btn btn-primary'>Reportar</button>
                            </div>
                        </div>
                        <div className="table-responsive table-wrapper divRelacion1" style={{marginTop:'10px'}}>
                            <table className="table">
                                <thead>
                                    <tr style={{background:"#e9e9e9"}}>
                                        <th scope="col" style={{textAlign:'center'}}></th>
                                        <th scope="col" style={{textAlign:'center'}}>Guia</th>
                                        <th scope="col" style={{textAlign:'center'}}>Valor</th>
                                        <th scope="col" style={{textAlign:'center'}}>Pedido</th>
                                        <th scope="col" style={{textAlign:'center'}}>estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {data.map((row, index) => {
                                    let color = 'white'
                                    if(row.validando == 1){
                                        //no lo encontro o el valor no es
                                        color = '#ffa3a3'
                                    }
                                    else if(row.validando == 2){
                                        color = '#a9ffa3'
                                    }
                                    else if(row.validando == 3){
                                        color = '#eddd66'
                                    }
                                    return (
                                        <React.Fragment key={index}>
                                            <tr style={{background:color}} key={index}>
                                                <td style={{textAlign:'center'}}>{index+1}</td>
                                                <td style={{textAlign:'center'}}>{row.remesa}</td>
                                                <td style={{textAlign:'center'}}>{formattedPrice(row.valor)}</td>
                                                <td style={{textAlign:'center'}}>{row.pedido}</td>
                                                <td style={{textAlign:'center'}}>
                                                    {row.nota}
                                                </td>
                                            </tr>
                                        </React.Fragment>
                                    );
                                })}
                                </tbody>
                                <tfoot>
                                    <tr style={{ background: "#f1f1f1" }}>
                                        <td colSpan="2" style={{ textAlign: 'center', fontWeight: 'bold' }}>Total</td>
                                        <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                            {formattedPrice(data.reduce((total, row) => total + parseFloat(row.valor || 0), 0).toFixed(0))}
                                        </td>
                                        <td colSpan="2"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        <div className='row divRelacion2' style={{display:'none',marginTop:'10px'}}>
                            <div className='col-6 fileCompro' style={{marginTop:'10px',borderRight:'1px solid #e9e9e9'}}>
                                <FileUploader
                                    multiple={false}
                                    handleChange={handleChangeFile}
                                    name="file"
                                    label="Comprobante"
                                    hoverTitle="Suelta aquí"
                                />
                        
                                <div className='row' style={{marginTop:'10px'}}>
                                    <div className='col-4' style={{textAlign:'right'}}>
                                        <span style={{marginTop:'10px',display:'block',width:'100%'}}>Recibo:</span>
                                        <span style={{marginTop:'22px',display:'block',width:'100%'}}>Entidad:</span>
                                        <span style={{marginTop:'22px',display:'block',width:'100%'}}>Fecha:</span>
                                    </div>
                                    <div className='col-8'>
                                        <input id="reciboPago" type='text' className='form-control'></input>
                                        <select id="entidadPago" style={{marginTop:'10px'}} className='form-control'>
                                            {entidades.map((entidad, index) => (
                                                <option key={entidad.cuentaSiigo} value={entidad.cuentaSiigo}>
                                                    {entidad.entidad}
                                                </option>
                                            ))}
                                        </select>
                                        <input id="fechaPago" style={{marginTop:'10px'}} type='Date' className='form-control'></input>
                                    </div>
                                </div> 
                            </div>
                            <div className='col-6'>
                                {file.map((archivo,index) => {
                                    const isImage = /\.(jpg|jpeg|png|gif)$/.test(archivo.name.toLowerCase());
                                    return (
                                        <div>
                                        {isImage ? (
                                            <img
                                                src={archivo.rutaPreview}
                                                alt="preview"
                                                style={{maxHeight: '300px', width: 'auto',margin:'auto'}}
                                            />
                                        ) : (
                                            <iframe
                                                src={archivo.rutaPreview}
                                                style={{height: '300px', width: 'auto',margin:'auto'}}
                                            ></iframe>
                                        )}
                                        </div>
                                    )
                                })}
                            </div>
                            <div className='col-6' style={{textAlign:'center'}}>
                                <button className='btn btn-secondary'  onClick={() => descargarXLSRelacion()} style={{width:'100%',borderRadius: '0px',margin:'10px'}}><i style={{marginRight:'5px'}} className='bx bxs-cloud-download'></i> Descargar excel</button>
                            </div>
                            <div className='col-6' style={{textAlign:'center'}}>
                                <button className='btn btn-primary' onClick={() => reportarRelacionPago()} style={{width:'100%',borderRadius: '0px',margin:'10px'}}>Reportar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal.Body>
        </Modal>

        <Modal show={modalObservacion} className="modal-lg" onHide={cerrarModal}>
            <Modal.Header closeButton>
            </Modal.Header>
            <Modal.Body style={{marginTop:'-40px'}}>
                <div className='row'>
                    <div className='col-12'>
                        <div className='row resultPedidoModal'>
                            
                        </div>
                    </div>
                    <div className='col-12' style={{marginTop:'10px'}}>
                        <div className="alert alert-danger" id='alertObservacion' style={{display:'none'}}  role="alert">
                            Debes ingresar una observacion
                        </div>
                        <textarea id='observacion' className="form-control" rows="3"></textarea>
                        <div style={{textAlign:'right',marginTop:'10px'}}>
                            <button onClick={() => reportarObservacion()} className="btn btn-primary">Reportar</button>
                        </div>

                        <p style={{textAlign:'center',background:'#e9e9e9',marginTop:'10px'}}>Observaciones</p>
                        <ul className="timeline" id="observacionPaquete">
                            
                        </ul>
                    </div>
                </div>
            </Modal.Body>
        </Modal>

        <Modal show={modalSeguimiento} className="modal-lg" onHide={cerrarModal}>
            <Modal.Header closeButton>
            </Modal.Header>
            <Modal.Body style={{marginTop:'-40px'}}>
                <div className='row'>
                    <div className='col-12'>
                        <div className='row resultPedidoModal'>
                            
                        </div>
                    </div>
                    <div className='col-6' style={{marginTop:'10px'}}>
                        <p style={{textAlign:'center',background:'#e9e9e9'}}>Historial</p>
                        <ul className="timeline" id="historyPaquete">
                            
                        </ul>
                    </div>
                    <div className='col-6' style={{marginTop:'10px'}}>
                        <p style={{textAlign:'center',background:'#e9e9e9'}}>Novedades</p>
                        <ul className="timeline" id="novedadesPaquete">
                            
                        </ul>
                    </div>
                </div>
            </Modal.Body>
        </Modal>

        <Modal show={modalNovedades} className="modal-lg" onHide={cerrarModal}>
            <Modal.Header closeButton>
            </Modal.Header>
            <Modal.Body style={{marginTop:'-40px'}}>
                <div className='row'>
                    <div className='col-12'>
                        <div className='row resultPedidoModal'>
                            
                        </div>
                    </div>
                    <div className='col-12' style={{marginTop:'10px'}}>
                        <p style={{textAlign:'center',background:'#e9e9e9'}}>Novedades</p>
                        <ul className="timeline" id="novedadesPaqueteAsesor">
                            {novedadesASesor.map((novedad, index) => {
                                return (
                                    
                                    <React.Fragment key={index}>
                                        {novedad.estado == 1 ? (
                                            <li className="novedadSinSolucion">
                                                <a style={{fontWeight: "bold"}}>{formatFechaHora(novedad.fecha)}</a>
                                                <p>{novedad.novedad}</p>
                                                <div>
                                                    <div className="alert alert-danger" id={`alertNovedad-${novedad.id}`} style={{display:'none'}}  role="alert">
                                                        Debes ingresar un comentario
                                                    </div>
                                                    <label>Solución:</label>
                                                    <select id={`opcionNovedad-${novedad.id}`} className="form-control">
                                                        {solucionesNovedades.map((solucion,index)=>{
                                                            return (<option value={solucion.id}>{solucion.nombre}</option>)
                                                        })}
                                                    </select>
                                                    <label>Comentarios:</label>
                                                    <textarea id={`observacion-${novedad.id}`} className="form-control" rows="3"></textarea>
                                                    <div style={{textAlign:'right',marginTop:'10px'}}>
                                                        <button onClick={() => solucionarNovedad(novedad.id)} className="btn btn-primary">Reportar</button>
                                                    </div>
                                                </div>
                                            </li>

                                        ) : novedad.estado == 2 ? (
                                            <li className="novedadPendiente">
                                                <a style={{fontWeight: "bold"}}>{formatFechaHora(novedad.fecha)}</a>
                                                <p>{novedad.novedad}</p>
                                                <div>
                                                    <b>{novedad.solucion}</b>
                                                    <br></br>
                                                    "{novedad.observacionSolucion}"
                                                    <div style={{textAlign:'right',borderTop:'3px solid #e9e9e9'}}>
                                                        Ase. {novedad.asesor} - {formatFechaHora(novedad.fechaSolucion)}
                                                    </div>
                                                </div>
                                            </li>
                                        ) : (
                                            <li className="novedadSolucionada">
                                                <a style={{fontWeight: "bold"}}>{formatFechaHora(novedad.fecha)}</a>
                                                <p>{novedad.novedad}</p>
                                                <div>
                                                    <b>{novedad.solucion}</b>
                                                    <br></br>
                                                    "{novedad.observacionSolucion}"
                                                    <div style={{textAlign:'right',borderTop:'3px solid #e9e9e9'}}>
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

        <div className="container-xxl flex-grow-1 containerP" style={{background:'#eeeeee',height: '100%',width: '100%',position: 'relative',left: '0px',top: '0px',overflow: 'hidden'}}>
            <div className='row' style={{height:'100%',width:'98%',margin:'auto'}}>
                <div className='col-9' style={{maxHeight:'100%',padding:'40px 20px 40px 0px',paddingLeft:'0px',fontSize:'12px'}}>
                    <div className="card" style={{padding:'0px'}}>
                        <div className="card-body" style={{overflow:'auto',height:'93vh'}}>
                            <div className="d-flex align-items-start align-items-sm-center">
                                <div className='row' style={{width:'100%',margin:'auto',marginTop:'20px'}}>
                                    <div className='col-12' style={{marginBottom:'20px',textAlign:'right'}}>
                                        <button onClick={() => abrirRelacionPago()} className='btn btn-primary'>Relacion Pago</button>
                                    </div>
                                    <div className='col-12' style={{marginBottom:'20px'}}>
                                        <input id="buscadorInput" onChange={handleBuscador} type='text' style={{width:'80%',margin:'auto',textAlign:'center'}} className='form-control' placeholder='Buscar'></input>
                                    </div>
                                        
                                    <div style={{marginTop:'10px'}} className='col-12 col-md-4'>
                                        <label>Asesor:</label>
                                        <select id="asesores" onChange={() => cambioAsesor()} className='form-control'>
                                            <option value="0">TODAS</option>
                                        </select>
                                    </div>
                                    <div style={{marginTop:'10px'}} className='col-12 col-md-4'>
                                        <label>Tipo:</label>
                                        <select id="tipoEnvio" onChange={() => cargarDataFiltro()} className='form-control'>
                                            <option value="0">TODOS</option>
                                            <option value="1">Contado</option>
                                            <option value="2">Conta Entrega</option>
                                            <option value="3">Recaudo</option>
                                            <option value="4">Contado - Conta Entrega</option>
                                        </select>
                                    </div>
                                    <div style={{marginTop:'10px'}} className='col-12 col-md-4'>
                                        <label>Estado:</label>
                                        <select id="estadoEnvio" onChange={() => cargarDataFiltro()} className='form-control'>
                                            <option value="3">TODOS</option>
                                            <option value="0">Viajando</option>
                                            <option value="2">En Novedad</option>
                                            <option value="1">Entregado</option>
                                            <option value="4">Devoluciones</option>
                                            <option value="5">Ped. Recogida</option>
                                        </select>
                                    </div>

                                    <div className='col-12' style={{marginTop:'20px',padding:'0px'}}>
                                        <div className="table-responsive table-wrapper">
                                            <table className="table">
                                                <thead>
                                                    <tr style={{background:"#e9e9e9"}}>
                                                        <th scope="col" style={{textAlign:'center'}}>Pedido</th>
                                                        <th scope="col" style={{textAlign:'center'}}>Guia</th>
                                                        <th scope="col" style={{textAlign:'center'}}>Despacho</th>
                                                        <th scope="col" style={{textAlign:'center'}}>Estado</th>
                                                        <th scope="col" style={{textAlign:'center'}}>Tipo</th>
                                                        <th scope="col" style={{textAlign:'center'}}>Destino</th>
                                                        <th scope="col" style={{textAlign:'center'}}>Destinatario</th>
                                                        <th scope="col" style={{textAlign:'center'}}>Opciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {consultando ? (
                                                        <tr>
                                                            <td colSpan="8" style={{ textAlign: 'center' }}>Consultando...</td>
                                                        </tr>
                                                    ) : (
                                                        pedidos.length === 0 ? (
                                                            <tr>
                                                                <td colSpan="8" style={{ textAlign: 'center' }}>No se encontraron registros.</td>
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

                                                                pedido.novedades.map((novedad, index) => {
                                                                    if(novedad.estado == 1){
                                                                        novedadPendiente += 1;
                                                                    }else{
                                                                        novedadSolucionada += 1;
                                                                    }
                                                                })

                                                                let color = 'white'
                                                                if(pedido.estadoDespacho == 0){
                                                                    //esta en novedad y aun no tiene solucion
                                                                    if(pedido.novedad === 1 && novedadPendiente > 0){
                                                                        color = '#ffa3a3'
                                                                    }
                                                                    else if(pedido.novedad === 1 && novedadPendiente == 0){
                                                                        //esta en novedad pero ya llamo
                                                                        color = '#ffce73'
                                                                    }else if(diferenciaDiasSalida > 4 ){
                                                                        //lleva mas de 4 dias viajando
                                                                        color = '#a9ffa3';
                                                                    }
                                                                }
                                                                return (
                                                                    <React.Fragment key={index}>
                                                                        <tr style={{
                                                                            backgroundColor:color
                                                                        }}>
                                                                            <td style={{textAlign:'center'}}>
                                                                                {pedido.referencia}
                                                                            </td>
                                                                            <td style={{textAlign:'center'}}>
                                                                                <b>{pedido.transportadoraName}</b>
                                                                                <br></br>
                                                                                {pedido.transportadora == 1 ? (
                                                                                    <>
                                                                                        <a target="_blank" href={`https://tcc.com.co/courier/mensajeria/rastrear-envio/?tipo=Guia&documento=${pedido.guia}`}>
                                                                                            {pedido.guia}
                                                                                        </a>
                                                                                    </>
                                                                                ):(
                                                                                    <>
                                                                                        {pedido.guia}
                                                                                    </>
                                                                                )}
                                                                                {pedido.novedades.length > 0 && (
                                                                                    <>
                                                                                        
                                                                                        <div onClick={() => novedadesEnvio(pedido)} style={{cursor:'pointer'}}>
                                                                                            Nov. {novedadSolucionada+novedadPendiente}
                                                                                            <br></br>
                                                                                            Ped. {novedadPendiente}
                                                                                        </div>
                                                                                        
                                                                                    </>
                                                                                )}
                                                                            </td>
                                                                            <td style={{textAlign:'center'}}>
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
                                                                            <td id={`guia-${pedido.guia}`} style={{textAlign:'center',color: pedido.estadoDespacho == 0 && diferenciaDias > 2 ? 'red' : 'inherit'}}>
                                                                                {pedido.estadoTransportadora}
                                                                                <br></br>
                                                                                <b>{formatFechaHora(pedido.fechaUltimoMovimiento)}</b>
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
                                                                                        <i onClick={() => trasabilidadEnvio(pedido)} style={{cursor:'pointer'}} className='bx bx-history'></i> 
                                                                                        <i style={{display:'none'}} className='bx bx-conversation'></i>
                                                                                    </>
                                                                                ):( 
                                                                                    <>
                                                                                        {pedido.estadoDespacho == 0 ? (
                                                                                            <i onClick={() => envioEntregado(pedido)}  className='bx bx-donate-heart'></i>   
                                                                                        ):(
                                                                                            <>
                                                                                                Entregado
                                                                                                <br></br>
                                                                                                <b>{formatFechaHora(pedido.fechaEntrega)}</b>
                                                                                            </>
                                                                                        )}
                                                                                        
                                                                                    </>
                                                                                )}
                                                                                <i onClick={() => observacionesGuia(pedido)} style={{cursor:'pointer'}} className='bx bx-file'></i>
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
                <div className='col-3' style={{maxHeight:'100vh',overflow:'auto',background:'#f5f5f5',paddingTop:'40px',paddingBottom:'40px',boxShadow:'0px 0px 18px 0px #bdbdbdbf'}}>
                    <div style={{textAlign:'right',cursor:'pointer'}} onClick={() => filtroBanco()}><i className='bx bxs-bank' style={{marginTop:'-3px'}}></i>{formattedPrice(resultRecaudo.bancoTCC)}</div>
                    <div style={{borderLeft:'3px solid #a3a3a3',background:'#e9e9e9',padding:'10px'}}>
                        <span style={{cursor:'pointer'}} onClick={() => filtroRecaudoSemana(0)} >{semanaActual}: <b>{formattedPrice(resultRecaudo.semanaRecaudo)}</b></span>
                        <br></br>
                        <span style={{cursor:'pointer'}} onClick={() => filtroRecaudoSemana(2)}>Saldo Sem. Anteriores: <b style={{color:resultRecaudo.anteriorRecaudo > 0 ? 'red' : 'none'}}>{formattedPrice(resultRecaudo.anteriorRecaudo)}</b></span>
                        <div style={{borderTop:'1px dotted #c1c1c1',textAlign:'right',marginTop:'10px',fontSize:'12px'}}>Ultimo Reporte: {resultRecaudo.ultimaRelacion}</div>
                    </div>
                    <label style={{marginTop:'10px',background:'#e9e9e9',width:'90%',padding:'10px',textAlign:'center',marginLeft:'5%'}}>RECAUDOS</label>
                    <div className='row' style={{width:'90%',border:'2px solid #e9e9e9',padding:'10px 0px',marginLeft:'5%',fontSize:'12px'}}>
                        
                        <div className='col-7'>
                            <span style={{cursor:'pointer',marginRight:'3px'}}>-En Producción</span>({resultRecaudo.cantidadProduccion})
                            <br></br>
                            
                        </div>
                        <div className='col-4' style={{textAlign:'right',paddingRight:'0px'}}>
                            <span style={{cursor:'pointer'}}>{formattedPrice(resultRecaudo.valorProduccion)}</span>
                            <br></br>
                        </div>
                        <div className='col-12' style={{marginTop:'5px',marginBottom:'5px'}}>
                            <div style={{height:'1px',width:'100%',borderBottom:'1px dotted #c1c1c1'}}></div>
                        </div>

                        <div className='col-7'>
                            <span style={{cursor:'pointer',marginRight:'3px'}}>-Ped. Recogida</span>({resultRecaudo.cantidadPreparado})
                            <br></br>
                        </div>
                        <div className='col-4' style={{textAlign:'right',paddingRight:'0px'}}>
                            <span style={{cursor:'pointer'}}>{formattedPrice(resultRecaudo.valorPreparado)}</span>
                            <br></br>
                        </div>
                        <div className='col-12' style={{marginTop:'5px',marginBottom:'5px'}}>
                            <div style={{height:'1px',width:'100%',borderBottom:'1px dotted #c1c1c1'}}></div>
                        </div>

                        <div className='col-7'>
                            <span style={{cursor:'pointer',marginRight:'3px'}}>-Viajando</span>({resultRecaudo.cantidadViajando})
                            <br></br>
                        </div>
                        <div className='col-4' style={{textAlign:'right',paddingRight:'0px'}}>
                            <span onClick={() => filtroResultEstado(0)} style={{cursor:'pointer'}}>{formattedPrice(resultRecaudo.valorViajando)}</span>
                            <br></br>
                            {resultRecaudo.prioridadViajando > 0 && (
                                <>
                                    <span style={{color:'red',marginLeft:'19px',fontWeight:'500'}}>{resultRecaudo.prioridadViajando} Prioritarios</span>
                                    <br></br>
                                </>
                            )}
                        </div>
                        <div className='col-12' style={{marginTop:'5px',marginBottom:'5px'}}>
                            <div style={{height:'1px',width:'100%',borderBottom:'1px dotted #c1c1c1'}}></div>
                        </div>

                        <div className='col-7'>
                            <span onClick={() => filtroResultEstado(0)} style={{cursor:'pointer',marginRight:'3px'}}>-Proc. de entrega</span>({resultRecaudo.cantidadProcesoEntrega})
                            <br></br>
                            {resultRecaudo.prioridadProcesoEntrega > 0 && (
                                <>
                                    <span style={{color:'red',marginLeft:'19px',fontWeight:'500'}}>{resultRecaudo.prioridadProcesoEntrega} Prioritarios</span>
                                    <br></br>
                                </>
                            )}
                        </div>
                        <div className='col-4' style={{textAlign:'right',paddingRight:'0px'}}>
                            <span onClick={() => filtroResultEstado(0)} style={{cursor:'pointer'}}>{formattedPrice(resultRecaudo.valorProcesoEntrega)}</span>
                            <br></br>
                        </div>
                        <div className='col-12' style={{marginTop:'5px',marginBottom:'5px'}}>
                            <div style={{height:'1px',width:'100%',borderBottom:'1px dotted #c1c1c1'}}></div>
                        </div>


                        <div className='col-7'>
                            <span onClick={() => filtroResultEstado(2)} style={{cursor:'pointer',marginRight:'3px'}}>-En Novedad</span>({resultRecaudo.cantidadNovedad})
                            <br></br>
                            {resultRecaudo.prioridadNovedad > 0 && (
                                <>
                                    <span style={{color:'red',marginLeft:'19px',fontWeight:'500'}}>{resultRecaudo.prioridadNovedad} Prioritarios</span>
                                    <br></br>
                                </>
                            )}
                        </div>
                        <div className='col-4' style={{textAlign:'right',paddingRight:'0px'}}>
                            <span onClick={() => filtroResultEstado(2)} style={{cursor:'pointer'}}>{formattedPrice(resultRecaudo.valorNovedad)}</span>
                            <br></br>
                        </div>
                        <div className='col-12' style={{marginTop:'5px',marginBottom:'5px'}}>
                            <div style={{height:'1px',width:'100%',borderBottom:'1px dotted #c1c1c1'}}></div>
                        </div>


                        <div className='col-7'>
                            <span onClick={() => filtroResultEstado(1)} style={{cursor:'pointer',marginRight:'3px'}}>-Entregado</span>({resultRecaudo.cantidadEntregado})
                            <br></br>
                        </div>
                        <div className='col-4' style={{textAlign:'right',paddingRight:'0px'}}>
                            <span onClick={() => filtroResultEstado(1)} style={{cursor:'pointer'}}>{formattedPrice(resultRecaudo.valorEntregado)}</span>
                            <br></br>
                        </div>
                        <div className='col-12' style={{marginTop:'5px',marginBottom:'5px'}}>
                            <div style={{height:'1px',width:'100%',borderBottom:'1px dotted #c1c1c1'}}></div>
                        </div>

                        <div className='col-7'>
                            <span onClick={() => filtroResultEstado(4)} style={{cursor:'pointer',marginRight:'3px'}}>-Devoluciónes</span>({resultRecaudo.cantidadDevolucion})
                            <br></br>
                        </div>
                        <div className='col-4' style={{textAlign:'right',paddingRight:'0px'}}>
                            <span onClick={() => filtroResultEstado(4)} style={{cursor:'pointer'}}>{formattedPrice(resultRecaudo.valorDevolucion)}</span>
                            <br></br>
                        </div>
                        <div className='col-12' style={{marginTop:'5px',marginBottom:'5px'}}>
                            <div style={{height:'1px',width:'100%',borderBottom:'1px solid #c1c1c1'}}></div>
                        </div>

                        <div className='col-7'>
                            <span onClick={() => filtroResultEstado(3)} style={{cursor:'pointer',color: '#758693',fontWeight:'bold'}}>{resultRecaudo.cantidad} Paquetes</span>
                            <br></br>
                        </div>
                        <div className='col-4' style={{textAlign:'right',paddingRight:'0px'}}>
                            <span onClick={() => filtroResultEstado(3)} style={{cursor:'pointer',color: '#758693',fontWeight:'bold'}}>{formattedPrice(resultRecaudo.valor)}</span>
                            <br></br>
                        </div>

                    </div>
                </div>
            </div>
        </div>
        
    </>
}