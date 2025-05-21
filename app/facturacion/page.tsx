"use client";

import React, { useEffect,useState } from 'react';
import { Modal } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import withReactContent from 'sweetalert2-react-content';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
const $ = require('jquery');

let usuarioId = 1;
let blob = "";
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

export default function Home() {

    const [usuario, setUsuario] = useState({ 
        nombre: '',
        perfil: '',
        foto: '',
        user: ''
    });
    const [contTerceros,setContTerceros] = useState(0);
    const [contFacturas,setContFacturas] = useState(0)
    const [consultando,setConsultado] = useState(true);
    const [pedidos,setPedidos] = useState([]);
    const [dataResumen,setDataResumen] = useState([])
    const [dataResumenModalidad,setDataResumenModalidad] = useState([])
    const [totalFacturacion,setTotalFacturacion] = useState(0)
    const [totalAbono,setTotalAbono] = useState(0)
    const [modalResult, setmodalResult] = useState(false);

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

                usuarioId = decodedToken.payload.user;

                cargoSite = 1;
                pedidosFacturacion();
            }
            
        }
    })  

    async function pedidosFacturacion(){
        await axios.post(process.env.ENDPOINT_API+'/pedidos/dataFacturacion').then(response => {  
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
                pedidosData = response.data.pedidos;
                tercerosData = response.data.terceros;
                productosData2 = response.data.productos;
                cuentasData = response.data.cuentasSiigo;
                productosSiigoData = response.data.productosSiigo;
                comprobantesData = response.data.comprobantes;

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

    async function selecionarTodo(){
        if($("#seleTodo").prop('checked')){
            $(".selePedido").prop({'checked':true});
            pedidosFacturacionData = [];
            for (var i = 0; i <  pedidosData.length; i++) {
                pedidosFacturacionData.push(pedidosData[i].referencia)
            }
        }else{
            pedidosFacturacionData = [];
            $(".selePedido").prop({'checked':false});
        }
    }

    function selecionarPedido(referencia){
        if($("#selectPedido-"+referencia).prop('checked')){
            let banderaAgregar = true;
            for (var i = 0; i <  pedidosFacturacionData.length; i++) {
                if(pedidosFacturacionData[i] == referencia){
                    banderaAgregar = false;
                }
            }
            if(banderaAgregar){
                pedidosFacturacionData.push(referencia)
            }
        }else{
            for (var i = 0; i <  pedidosFacturacionData.length; i++) {
                if(pedidosFacturacionData[i] == referencia){
                    pedidosFacturacionData.splice(i, 1);
                }
            }
        }
        
    }

    async function facturar() {
        if(pedidosFacturacionData.length == 0){
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                type: "info",
                title: 'Alerta',
                text: "Elige uno o varios pedidos para facturar",
            });
        }else{
            swalWithReactFactura = withReactContent(Swal);

            swalWithReactFactura.fire({
                title: "Facturar",
                html: (
                    <div>
                        <p>
                            Ingresa el consecutivo de SIIGO (F-2)
                        </p>
                        <div style={{marginTop:'10px'}}>
                            <label style={{width:'100%',textAlign:'left',marginTop:'10px',marginBottom:'2px'}}>Consecutivo:</label>
                            <input className="form-control" id="consecutivoFactura"></input>
                        </div>
                    </div>
                ),
                showCancelButton: true,
                confirmButtonText: "Facturar",
                cancelButtonText: "Cancelar",
                allowOutsideClick: false,
                preConfirm: (input) => {
                    if ($("#consecutivoFactura").val() == "") {
                        Swal.showValidationMessage('Debe ingresar el consecutivo');
                        return false;
                    }
                    return true;
                }
            }).then(async (result) => {
                consecutivoFactura = parseInt($("#consecutivoFactura").val());
                prepararExcelFacturacion();
                prepararExcelTerceros();
                
            })
        }
    }

    function prepararExcelTerceros(){
        const dataTercero = [];
        const fecha = new Date()
        for (var i = 0; i <  tercerosData.length; i++) {
            let ciudadSiigo = "587";
            let tributos = tercerosData[i]['tributos'] === null ? [] : tercerosData[i]['tributos'].split(',');
            dataTercero.push({ 
                'IDENTIFICACIÓN  (OBLIGATORIO)': tercerosData[i]['noDoc'].replace(/[.*+?^${}()|[\]\\]/g,""), 
                'SUCURSAL  (OBLIGATORIO)': '0', 
                'DIGITO DE VERIFICACIÓN': tercerosData[i]['tipoDoc'] === 2 ? tercerosData[i]['digitoverificacion'] : '',
                'NOMBRE': tercerosData[i]['tipoDoc'] === 2 ? tercerosData[i]['nombre'].toUpperCase() : tercerosData[i]['priNombre'].toUpperCase()+" "+tercerosData[i]['segNombre'].toUpperCase()+" "+tercerosData[i]['priApellido'].toUpperCase()+" "+tercerosData[i]['segApellido'].toUpperCase(),
                'RAZÓN SOCIAL': tercerosData[i]['tipoDoc'] === 2 ? 'S' : 'N',
                'PRIMER NOMBRE': tercerosData[i]['priNombre'].toUpperCase(),
                'SEGUNDO NOMBRE': tercerosData[i]['segNombre'].toUpperCase(),
                'PRIMER APELLIDO': tercerosData[i]['priApellido'].toUpperCase(),
                'SEGUNDO APELLIDO': tercerosData[i]['segApellido'].toUpperCase(),
                'NÚMERO DE IDENTIFICACIÓN DEL EXTRANJERO': "",
                'CÓDIGO IDENTIFICACIÓN FISCAL': "",
                'NOMBRE DEL CONTACTO': tercerosData[i]['tipoDoc'] === 2 ? tercerosData[i]['nombre'].toUpperCase() : tercerosData[i]['priNombre'].toUpperCase()+" "+tercerosData[i]['segNombre'].toUpperCase()+" "+tercerosData[i]['priApellido'].toUpperCase()+" "+tercerosData[i]['segApellido'].toUpperCase(),
                'DIRECCIÓN': tercerosData[i]['dirResidencia'].toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\r?\n|\r/g, ""),
                'PAÍS': "1",
                'CIUDAD': tercerosData[i]['ciudad'],
                'ACTIVO': "A",
                'TELÉFONO 1': tercerosData[i]['celular'],
                'TELÉFONO 2': tercerosData[i]['celular'],
                'TELÉFONO 3': "0",
                'TELÉFONO 4': "0",
                'TELÉFONO CELULAR': tercerosData[i]['celular'],
                'FAX': '0',
                'APARTADO AÉREO': "0",
                'SEXO': 
                    tercerosData[i]['tipoDoc'] === 2 ? 'E' : 
                    tercerosData[i]['genero'] === 1 ? 'F' : 'M' ,
                'AÑO DE CUMPLEAÑOS': tercerosData[i]['fechaNaci'].split('-').length > 0 ? tercerosData[i]['fechaNaci'].split('-')[0] : '',
                'MES DE CUMPLEAÑOS': tercerosData[i]['fechaNaci'].split('-').length > 0 ? tercerosData[i]['fechaNaci'].split('-')[1] : '',
                'DÍA DE CUMPLEAÑOS': tercerosData[i]['fechaNaci'].split('-').length > 0 ? tercerosData[i]['fechaNaci'].split('-')[2] : '',
                'TIPO DE PERSONA': tercerosData[i]['tipoPersona'],
                'CORREO ELECTRÓNICO': tercerosData[i]['correo'],
                'CONTACTO DE FACTURACIÓN': tercerosData[i]['tipoDoc'] === 2 ? tercerosData[i]['nombre'].toUpperCase() : tercerosData[i]['priNombre'].toUpperCase()+" "+tercerosData[i]['segNombre'].toUpperCase()+" "+tercerosData[i]['priApellido'].toUpperCase()+" "+tercerosData[i]['segApellido'].toUpperCase(),
                'CORREO ELECT. CONTACTO DE FACTURACIÓN': tercerosData[i]['correo'],
                'TIPO DE IDENTIFICACIÓN': 
                    tercerosData[i]['tipoDoc'] == 1 ?  'C' :
                    tercerosData[i]['tipoDoc'] == 2 ?  'N' :
                    tercerosData[i]['tipoDoc'] == 3 ?  'U' :
                    tercerosData[i]['tipoDoc'] == 4 ?  'E' :
                    tercerosData[i]['tipoDoc'] == 5 ?  'T' : '',
                'CLASIFICACIÓN - CLASE DE TERCERO': "C",
                'DECLARANTE': tributos.includes('1') ? 'S' : 'N',
                'AUTO RETENEDOR': tributos.includes('2') ? 'S' : 'N',
                'AGENTE RETENEDOR': tributos.includes('3') ? 'S' : 'N',
                'BENEFICIO DIAN RETEIVA COMPRAS': "",
                'TARIFA DIFERENCIAL RETE IVA VENTAS': "N",
                'PORCENTAJE DIFERENCIAL RETE IVA VENTAS': "0,00",
                'TARIFA DIFERENCIAL RETE IVA COMPRAS': "N",
                'PORCENTAJE DIFERENCIAL RETE IVA COMPRAS': "0",
                'CUPO DE CRÉDITO': "1",
                'LISTA DE PRECIO': "1",
                'FORMA DE PAGO': "1",
                'CALIFICACIÓN': "1",
                'TIPO CONTRIBUYENTE': tercerosData[i]['tipoContribuyente'],
                'CÓDIGO ACTIVIDAD ECONÓMICA': "",
                'VENDEDOR': "1",
                'COBRADOR': "5001",
                'PORCENTAJE DESCUENTO EN VENTAS': "0",
                'PERÍODO DE PAGO': tercerosData[i]['periodoPago'],
                'OBSERVACIÓN': "",
                'DÍAS OPTIMISTA': "0",
                'DÍAS PESIMISTA': "0",
                'CÓDIGO TIPO DE EMPRESA': "0",
                'CÓDIGO DE BANCO': "0",
                'CÓDIGO INTERNO': "0",
                'CÓDIGO OFICINA': "0",
                'TIPO DE CUENTA': "",
                'NÚMERO DE CUENTA': "",
                'NIT DEL TITULAR DE LA CUENTA': "0",
                'DÍGITO DE VERIFICACIÓN TITULAR DE LA CUENTA': '0',
                'NOMBRE DEL TITULAR DE LA CUENTA':'',
                'PAÍS DE LA CUENTA': '0',
                'CIUDAD DE LA CUENTA': '0',
                'SIGLAS DEPARTAMENTO DE LA CUENTA':'',
                'ACEPTA ENVÍO FACTURA POR MEDIO ELECTRÓNICO':'',
                'NOMBRE COMERCIAL':'',
                'CODIGO POSTAL':'',
                'RESPONSABILIDAD FISCAL':'',
                'AÑO APERTURA':fecha.getFullYear(),
                'MES APERTURA':(fecha.getMonth() +1),
                'DIA APERTURA':fecha.getDate(),
                'TRIBUTOS':''
            })
        }

        setContTerceros(tercerosData.length);
        
        // Crear una hoja de trabajo de Excel (worksheet) vacía
        const ws = XLSX.utils.aoa_to_sheet([[]]);

        // Agregar el texto que ocupará dos columnas
        XLSX.utils.sheet_add_aoa(ws, [["TRES SON UNO S.A.S"]], { origin: 'A1' });

        // Fusionar las celdas (A1 y AT1)(A2 y AT2)(A3 y AT3)
        ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 45 } },{ s: { r: 1, c: 0 }, e: { r: 1, c: 45 } },{ s: { r: 2, c: 0 }, e: { r: 2, c: 45 } }];


        // Convertir los datos a la hoja de trabajo, empezando desde la fila 3
        XLSX.utils.sheet_add_json(ws, dataTercero, { origin: 'A5', skipHeader: false });


        // Crear un libro de trabajo de Excel (workbook)
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Datos');

        // Generar un archivo Excel
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

        // Guardar el archivo automáticamente
        blobTerceros = new Blob([excelBuffer], { type: 'application/octet-stream' });

    }

    function prepararExcelFacturacion(){
        var productosData = JSON.parse(JSON.stringify(productosData2)); // Esto crea una copia superficial del arreglo

        let fecha = new Date();
        // Datos a exportar
        const resumenFacturas = [];
        const data = [];
        const resumenDataPedido = [];

        let total2 = 0;
        let abonoTotalPedidos = 0;

        //pedidosFacturacionData
        for (var i = 0; i <  pedidosFacturacionData.length; i++) {
            let total = 0;
            let contadorSecuencia = 1;
            let Nit = "";
            let nombreCliente = "";
            let idCliente = 0;
            let asesor = "";
            let flete = 0;
            let saldoTotal = 0;
            let descuentoTotal = 0;
            let excedenteTotal = 0;
            let abonoTotal = 0;
            let itemCartera = 0;
            let comisionTotal = 0;
            let tipoPedido = 0;
            for(var e = 0; e < pedidosData.length; e++){
                if(pedidosData[e].referencia == pedidosFacturacionData[i]){
                    idCliente = pedidosData[e].idFacturacion
                    flete =  parseInt(pedidosData[e].flete)
                    if(pedidosData[e].tipoPedido == 2 && pedidosData[e].transportadora == 9){
                        flete = 0;
                    }

                    asesor = pedidosData[e].name
                    tipoPedido = pedidosData[e].tipoPedido;
                    descuentoTotal = parseInt(pedidosData[e].descuento);
                    excedenteTotal = parseInt(pedidosData[e].excedente);
                    e = pedidosData.length
                }
            }
            if(descuentoTotal > 0){
                saldoTotal -= descuentoTotal;
            }
            for(var e = 0; e < tercerosData.length; e++){
                if(tercerosData[e].id == idCliente){
                    Nit = tercerosData[e]['noDoc'];
                    nombreCliente = tercerosData[e]['priNombre']+" "+tercerosData[e]['segNombre']+" "+tercerosData[e]['priApellido']+" "+tercerosData[e]['segApellido'];
                    if(tercerosData[e]['tipoDoc'] == 2){
                        nombreCliente = tercerosData[e]['nombre']
                    }
                    e = tercerosData.length
                }
            }
            
            //evalua los productos que tienen ivan y los agrupa con uno que no tiene
            for(var e = 0; e < productosData.length; e++){
                if(productosData[e].pedido == pedidosFacturacionData[i]){
                    comisionTotal += parseInt(productosData[e].comision)*productosData[e].cantidad;
                    let agrupar = false;
                    for(var h = 0; h < productosSiigoData.length; h++){
                        if(productosSiigoData[h].tarifa == 3 && productosSiigoData[h].linea == productosData[e].linea && productosSiigoData[h].grupo == productosData[e].grupo && productosSiigoData[h].codigo == productosData[e].codigo && productosSiigoData[h].auxiliar == productosData[e].auxiliar){
                            agrupar = true;
                            h = productosSiigoData.length;
                        }
                    }
                    if(agrupar){
                        for(var a = 0; a < productosData.length; a++){
                            if(productosData[a].pedido == pedidosFacturacionData[i]){
                                let iva = true;
                                for(var h = 0; h < productosSiigoData.length; h++){
                                    if(productosSiigoData[h].tarifa != 3 && productosSiigoData[h].linea == productosData[a].linea && productosSiigoData[h].grupo == productosData[a].grupo && productosSiigoData[h].codigo == productosData[a].codigo && productosSiigoData[h].auxiliar == productosData[a].auxiliar){
                                        iva = false;
                                        h = productosSiigoData.length;
                                    }
                                }

                                if(iva == false){
                                   
                                    if(productosData[a].cantidad > 1){
                                        const objetoClonada = JSON.parse(JSON.stringify(productosData[a]));
                                        objetoClonada.cantidad -= 1;
                                        productosData.push(objetoClonada);
                                        productosData[a].cantidad = 1;
                                        productosData[a].cobrado += (productosData[e].cobrado*productosData[a].cantidad)
                                        
                                    }else{
                                        productosData[a].cobrado += (productosData[e].cobrado*productosData[e].cantidad)
                                    }
                                    //elimina el producto con iva
                                    productosData.splice(e, 1)
                                    a = productosData.length;
                                }
                            }
                        }
                    }
                }
            }
            
            //agrupa los productos 

            let productosDataFinPedido = [];
            for(var e = 0; e < productosData.length; e++){
                if(productosData[e].pedido == pedidosFacturacionData[i]){
                    let agregar = true;
                    for(var h = 0; h < productosDataFinPedido.length; h++){
                        if(parseInt(productosDataFinPedido[h].cobrado) == parseInt(productosData[e].cobrado) && productosDataFinPedido[h].linea == productosData[e].linea && productosDataFinPedido[h].grupo == productosData[e].grupo && productosDataFinPedido[h].codigo == productosData[e].codigo && productosDataFinPedido[h].auxiliar == productosData[e].auxiliar){
                            agregar = false;
                            productosDataFinPedido[h].cantidad += productosData[e].cantidad;
                        }
                    }
                    if(agregar){
                        if(flete > 0){
                            if(productosData[e].cantidad > 1){

                                const objetoClonada = JSON.parse(JSON.stringify(productosData[e]));
                                objetoClonada.cantidad -= 1;
                                productosDataFinPedido.push(objetoClonada);
                                productosData[e].cantidad = 1;
                                productosData[e].cobrado += flete

                                
                            }else{
                                productosData[e].cobrado += flete
                            }
                            
                            flete = 0;
                        }
                        productosDataFinPedido.push(productosData[e]);
                    }

                    if(productosDataFinPedido.length == 0){
                        if(flete > 0){
                            productosData[e].cobrado += flete
                            flete = 0;
                        }
                        productosDataFinPedido.push(productosData[e]);
                    }
                }
            }

            console.log(productosDataFinPedido);

            let descripcionProducto = "";

            //reporta la venta
            for(var e = 0; e < productosDataFinPedido.length; e++){
                if(productosDataFinPedido[e].pedido == pedidosFacturacionData[i] && productosDataFinPedido[e].cobrado > 0){
                    let cuenta = "";
                    for(var h = 0; h < cuentasData.length; h++){
                        if(cuentasData[h].linea == productosDataFinPedido[e].linea && cuentasData[h].grupo == productosDataFinPedido[e].grupo){
                            cuenta = cuentasData[h]['cuenta de ventas'];
                            h = cuentasData.length;
                        }
                    }
                    
                    for(var h = 0; h < productosSiigoData.length; h++){
                        if(productosSiigoData[h].linea == productosDataFinPedido[e].linea && productosSiigoData[h].grupo == productosDataFinPedido[e].grupo && productosSiigoData[h].codigo == productosDataFinPedido[e].codigo && productosSiigoData[h].auxiliar == productosDataFinPedido[e].auxiliar){
                            descripcionProducto = productosSiigoData[h].referencia;
                            h = productosSiigoData.length
                        }
                    }
                    
                    saldoTotal += parseInt(productosDataFinPedido[e].cobrado*productosDataFinPedido[e].cantidad);

                    //agrega el producto al excel en la parte del Inventario
                    data.push({ 
                        'TIPO DE COMPROBANTE (OBLIGATORIO)': 'F', 
                        'CÓDIGO COMPROBANTE  (OBLIGATORIO)': '2', 
                        'NÚMERO DE DOCUMENTO': consecutivoFactura,
                        'CUENTA CONTABLE   (OBLIGATORIO)': cuenta,
                        'DÉBITO O CRÉDITO (OBLIGATORIO)': "C",
                        'VALOR DE LA SECUENCIA   (OBLIGATORIO)': (productosDataFinPedido[e].cobrado*productosDataFinPedido[e].cantidad),
                        'AÑO DEL DOCUMENTO': fecha.getFullYear(),
                        'MES DEL DOCUMENTO': (fecha.getMonth() +1),
                        'DÍA DEL DOCUMENTO': fecha.getDate(),
                        'CÓDIGO DEL VENDEDOR': "1",
                        'CÓDIGO DE LA CIUDAD': "154",
                        'CÓDIGO DE LA ZONA': "1",
                        'SECUENCIA': contadorSecuencia,
                        'CENTRO DE COSTO': "1",
                        'SUBCENTRO DE COSTO': "0",
                        'NIT': Nit,
                        'SUCURSAL': "0",
                        'DESCRIPCIÓN DE LA SECUENCIA': descripcionProducto,
                        'NÚMERO DE CHEQUE': "0",
                        'COMPROBANTE ANULADO': "N",
                        'CÓDIGO DEL MOTIVO DE DEVOLUCIÓN': "0",
                        'FORMA DE PAGO': "0",
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
                        'LÍNEA PRODUCTO': productosDataFinPedido[e].linea,
                        'GRUPO PRODUCTO': productosDataFinPedido[e].grupo,
                        'CÓDIGO PRODUCTO': productosDataFinPedido[e].codigo,
                        'CANTIDAD': productosDataFinPedido[e].cantidad,
                        'CANTIDAD DOS': "0",
                        'CÓDIGO DE LA BODEGA': "1",
                        'CÓDIGO DE LA UBICACIÓN': "0",
                        'CANTIDAD DE FACTOR DE CONVERSIÓN': "0",
                        'OPERADOR DE FACTOR DE CONVERSIÓN': "0",
                        'VALOR DEL FACTOR DE CONVERSIÓN': "0",
                        'TIPO DE MONEDA ELABORACIÓN': "0",
                        'TIPO Y COMPROBANTE CRUCE': "",
                        'NÚMERO DE DOCUMENTO CRUCE': "0",
                        'NÚMERO DE VENCIMIENTO': "",
                        'AÑO VENCIMIENTO DE DOCUMENTO CRUCE': "",
                        'MES VENCIMIENTO DE DOCUMENTO CRUCE': "",
                        'DÍA VENCIMIENTO DE DOCUMENTO CRUCE': "",
                        'DESCRIPCIÓN DE COMENTARIOS': "Ped: "+productosDataFinPedido[e].pedido+" Ase:"+asesor
                    })
                    contadorSecuencia += 1;
                }
            }

            //si tiene un excedente el pedido
            if(excedenteTotal > 0){
                saldoTotal += parseInt(excedenteTotal)
                if(excedenteTotal > 2000){
                    data.push({ 
                        'TIPO DE COMPROBANTE (OBLIGATORIO)': 'F', 
                        'CÓDIGO COMPROBANTE  (OBLIGATORIO)': '2', 
                        'NÚMERO DE DOCUMENTO': consecutivoFactura,
                        'CUENTA CONTABLE   (OBLIGATORIO)': '2805050000',
                        'DÉBITO O CRÉDITO (OBLIGATORIO)': "C",
                        'VALOR DE LA SECUENCIA   (OBLIGATORIO)': excedenteTotal,
                        'AÑO DEL DOCUMENTO': fecha.getFullYear(),
                        'MES DEL DOCUMENTO': (fecha.getMonth() +1),
                        'DÍA DEL DOCUMENTO': fecha.getDate(),
                        'CÓDIGO DEL VENDEDOR': "1",
                        'CÓDIGO DE LA CIUDAD': "154",
                        'CÓDIGO DE LA ZONA': "1",
                        'SECUENCIA': contadorSecuencia,
                        'CENTRO DE COSTO': "0",
                        'SUBCENTRO DE COSTO': "0",
                        'NIT': Nit,
                        'SUCURSAL': "0",
                        'DESCRIPCIÓN DE LA SECUENCIA': nombreCliente.toUpperCase(),
                        'NÚMERO DE CHEQUE': "0",
                        'COMPROBANTE ANULADO': "N",
                        'CÓDIGO DEL MOTIVO DE DEVOLUCIÓN': "0",
                        'FORMA DE PAGO': '1',
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
                        'LÍNEA PRODUCTO': "",
                        'GRUPO PRODUCTO': "",
                        'CÓDIGO PRODUCTO': "",
                        'CANTIDAD': "",
                        'CANTIDAD DOS': "0",
                        'CÓDIGO DE LA BODEGA': "1",
                        'CÓDIGO DE LA UBICACIÓN': "0",
                        'CANTIDAD DE FACTOR DE CONVERSIÓN': "0",
                        'OPERADOR DE FACTOR DE CONVERSIÓN': "0",
                        'VALOR DEL FACTOR DE CONVERSIÓN': "0",
                        'TIPO DE MONEDA ELABORACIÓN': "0",
                        'TIPO Y COMPROBANTE CRUCE': "",
                        'NÚMERO DE DOCUMENTO CRUCE': "0",
                        'NÚMERO DE VENCIMIENTO': "",
                        'AÑO VENCIMIENTO DE DOCUMENTO CRUCE': "",
                        'MES VENCIMIENTO DE DOCUMENTO CRUCE': "",
                        'DÍA VENCIMIENTO DE DOCUMENTO CRUCE': "",
                        'DESCRIPCIÓN DE COMENTARIOS': "Ped: "+pedidosFacturacionData[i]+" Ase:"+asesor
                    })
                }else{
                    data.push({ 
                        'TIPO DE COMPROBANTE (OBLIGATORIO)': 'F', 
                        'CÓDIGO COMPROBANTE  (OBLIGATORIO)': '2', 
                        'NÚMERO DE DOCUMENTO': consecutivoFactura,
                        'CUENTA CONTABLE   (OBLIGATORIO)': '4295050000',
                        'DÉBITO O CRÉDITO (OBLIGATORIO)': "C",
                        'VALOR DE LA SECUENCIA   (OBLIGATORIO)': excedenteTotal,
                        'AÑO DEL DOCUMENTO': fecha.getFullYear(),
                        'MES DEL DOCUMENTO': (fecha.getMonth() +1),
                        'DÍA DEL DOCUMENTO': fecha.getDate(),
                        'CÓDIGO DEL VENDEDOR': "1",
                        'CÓDIGO DE LA CIUDAD': "154",
                        'CÓDIGO DE LA ZONA': "1",
                        'SECUENCIA': contadorSecuencia,
                        'CENTRO DE COSTO': "1",
                        'SUBCENTRO DE COSTO': "0",
                        'NIT': Nit,
                        'SUCURSAL': "0",
                        'DESCRIPCIÓN DE LA SECUENCIA': "SOBRANTES",
                        'NÚMERO DE CHEQUE': "0",
                        'COMPROBANTE ANULADO': "N",
                        'CÓDIGO DEL MOTIVO DE DEVOLUCIÓN': "0",
                        'FORMA DE PAGO': '0',
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
                        'LÍNEA PRODUCTO': "",
                        'GRUPO PRODUCTO': "",
                        'CÓDIGO PRODUCTO': "",
                        'CANTIDAD': "",
                        'CANTIDAD DOS': "0",
                        'CÓDIGO DE LA BODEGA': "1",
                        'CÓDIGO DE LA UBICACIÓN': "0",
                        'CANTIDAD DE FACTOR DE CONVERSIÓN': "0",
                        'OPERADOR DE FACTOR DE CONVERSIÓN': "0",
                        'VALOR DEL FACTOR DE CONVERSIÓN': "0",
                        'TIPO DE MONEDA ELABORACIÓN': "0",
                        'TIPO Y COMPROBANTE CRUCE': "",
                        'NÚMERO DE DOCUMENTO CRUCE': "0",
                        'NÚMERO DE VENCIMIENTO': "",
                        'AÑO VENCIMIENTO DE DOCUMENTO CRUCE': "",
                        'MES VENCIMIENTO DE DOCUMENTO CRUCE': "",
                        'DÍA VENCIMIENTO DE DOCUMENTO CRUCE': "",
                        'DESCRIPCIÓN DE COMENTARIOS': "Ped: "+pedidosFacturacionData[i]+" Ase:"+asesor
                    })
                }
                contadorSecuencia += 1;
            }

            total += saldoTotal;
            total2 += saldoTotal;

            let totalPedido = saldoTotal;

            console.log(saldoTotal)
            //reporta los movimientos en el banco
            for(var e = 0; e < comprobantesData.length; e++){
                if(comprobantesData[e].pedido == pedidosFacturacionData[i]){
                    let fechaComprobante = new Date(comprobantesData[e].fecha)
                    fechaComprobante.setDate(fechaComprobante.getDate()+1);
                    abonoTotalPedidos += parseInt(comprobantesData[e].valor);
                    saldoTotal -= parseInt(comprobantesData[e].valor)
                    abonoTotal += parseInt(comprobantesData[e].valor)
                    data.push({ 
                        'TIPO DE COMPROBANTE (OBLIGATORIO)': 'F', 
                        'CÓDIGO COMPROBANTE  (OBLIGATORIO)': '2', 
                        'NÚMERO DE DOCUMENTO': consecutivoFactura,
                        'CUENTA CONTABLE   (OBLIGATORIO)': comprobantesData[e].cuentaSiigo,
                        'DÉBITO O CRÉDITO (OBLIGATORIO)': "D",
                        'VALOR DE LA SECUENCIA   (OBLIGATORIO)': comprobantesData[e].valor,
                        'AÑO DEL DOCUMENTO': fecha.getFullYear(),
                        'MES DEL DOCUMENTO': (fecha.getMonth() +1),
                        'DÍA DEL DOCUMENTO': fecha.getDate(),
                        'CÓDIGO DEL VENDEDOR': "1",
                        'CÓDIGO DE LA CIUDAD': "154",
                        'CÓDIGO DE LA ZONA': "1",
                        'SECUENCIA': contadorSecuencia,
                        'CENTRO DE COSTO': "1",
                        'SUBCENTRO DE COSTO': "0",
                        'NIT': Nit,
                        'SUCURSAL': "0",
                        'DESCRIPCIÓN DE LA SECUENCIA': fechaComprobante.getDate()+"-"+(fecha.getMonth() +1)+" "+nombreCliente.toUpperCase(),
                        'NÚMERO DE CHEQUE': "0",
                        'COMPROBANTE ANULADO': "N",
                        'CÓDIGO DEL MOTIVO DE DEVOLUCIÓN': "0",
                        'FORMA DE PAGO': comprobantesData[e].formadePago,
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
                        'LÍNEA PRODUCTO': "",
                        'GRUPO PRODUCTO': "",
                        'CÓDIGO PRODUCTO': "",
                        'CANTIDAD': "",
                        'CANTIDAD DOS': "0",
                        'CÓDIGO DE LA BODEGA': "1",
                        'CÓDIGO DE LA UBICACIÓN': "0",
                        'CANTIDAD DE FACTOR DE CONVERSIÓN': "0",
                        'OPERADOR DE FACTOR DE CONVERSIÓN': "0",
                        'VALOR DEL FACTOR DE CONVERSIÓN': "0",
                        'TIPO DE MONEDA ELABORACIÓN': "0",
                        'TIPO Y COMPROBANTE CRUCE': "",
                        'NÚMERO DE DOCUMENTO CRUCE': "0",
                        'NÚMERO DE VENCIMIENTO': "",
                        'AÑO VENCIMIENTO DE DOCUMENTO CRUCE': "",
                        'MES VENCIMIENTO DE DOCUMENTO CRUCE': "",
                        'DÍA VENCIMIENTO DE DOCUMENTO CRUCE': "",
                        'DESCRIPCIÓN DE COMENTARIOS': "Ped: "+pedidosFacturacionData[i]+" Ase:"+asesor
                    })
                    contadorSecuencia += 1;
                }
            }

            //si tiene un saldo pendiente se carga a credito 
            if(saldoTotal > 0){
                itemCartera = contadorSecuencia;
                data.push({ 
                    'TIPO DE COMPROBANTE (OBLIGATORIO)': 'F', 
                    'CÓDIGO COMPROBANTE  (OBLIGATORIO)': '2', 
                    'NÚMERO DE DOCUMENTO': consecutivoFactura,
                    'CUENTA CONTABLE   (OBLIGATORIO)': '1305050000',
                    'DÉBITO O CRÉDITO (OBLIGATORIO)': "D",
                    'VALOR DE LA SECUENCIA   (OBLIGATORIO)': saldoTotal,
                    'AÑO DEL DOCUMENTO': fecha.getFullYear(),
                    'MES DEL DOCUMENTO': (fecha.getMonth() +1),
                    'DÍA DEL DOCUMENTO': fecha.getDate(),
                    'CÓDIGO DEL VENDEDOR': "1",
                    'CÓDIGO DE LA CIUDAD': "154",
                    'CÓDIGO DE LA ZONA': "1",
                    'SECUENCIA': contadorSecuencia,
                    'CENTRO DE COSTO': "1",
                    'SUBCENTRO DE COSTO': "0",
                    'NIT': Nit,
                    'SUCURSAL': "0",
                    'DESCRIPCIÓN DE LA SECUENCIA': nombreCliente.toUpperCase(),
                    'NÚMERO DE CHEQUE': "0",
                    'COMPROBANTE ANULADO': "N",
                    'CÓDIGO DEL MOTIVO DE DEVOLUCIÓN': "0",
                    'FORMA DE PAGO': '1',
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
                    'LÍNEA PRODUCTO': "",
                    'GRUPO PRODUCTO': "",
                    'CÓDIGO PRODUCTO': "",
                    'CANTIDAD': "",
                    'CANTIDAD DOS': "0",
                    'CÓDIGO DE LA BODEGA': "1",
                    'CÓDIGO DE LA UBICACIÓN': "0",
                    'CANTIDAD DE FACTOR DE CONVERSIÓN': "0",
                    'OPERADOR DE FACTOR DE CONVERSIÓN': "0",
                    'VALOR DEL FACTOR DE CONVERSIÓN': "0",
                    'TIPO DE MONEDA ELABORACIÓN': "0",
                    'TIPO Y COMPROBANTE CRUCE': "",
                    'NÚMERO DE DOCUMENTO CRUCE': "0",
                    'NÚMERO DE VENCIMIENTO': "",
                    'AÑO VENCIMIENTO DE DOCUMENTO CRUCE': "",
                    'MES VENCIMIENTO DE DOCUMENTO CRUCE': "",
                    'DÍA VENCIMIENTO DE DOCUMENTO CRUCE': "",
                    'DESCRIPCIÓN DE COMENTARIOS': "Ped: "+pedidosFacturacionData[i]+" Ase:"+asesor
                })
                contadorSecuencia += 1;
            }

            //descuento general pedido
            if(descuentoTotal > 0){
                data.push({ 
                    'TIPO DE COMPROBANTE (OBLIGATORIO)': 'F', 
                    'CÓDIGO COMPROBANTE  (OBLIGATORIO)': '2', 
                    'NÚMERO DE DOCUMENTO': consecutivoFactura,
                    'CUENTA CONTABLE   (OBLIGATORIO)': '4120950503',
                    'DÉBITO O CRÉDITO (OBLIGATORIO)': "D",
                    'VALOR DE LA SECUENCIA   (OBLIGATORIO)': descuentoTotal,
                    'AÑO DEL DOCUMENTO': fecha.getFullYear(),
                    'MES DEL DOCUMENTO': (fecha.getMonth() +1),
                    'DÍA DEL DOCUMENTO': fecha.getDate(),
                    'CÓDIGO DEL VENDEDOR': "1",
                    'CÓDIGO DE LA CIUDAD': "154",
                    'CÓDIGO DE LA ZONA': "1",
                    'SECUENCIA': contadorSecuencia,
                    'CENTRO DE COSTO': "1",
                    'SUBCENTRO DE COSTO': "0",
                    'NIT': Nit,
                    'SUCURSAL': "0",
                    'DESCRIPCIÓN DE LA SECUENCIA': "DESCUENTO COMERCIAL",
                    'NÚMERO DE CHEQUE': "0",
                    'COMPROBANTE ANULADO': "N",
                    'CÓDIGO DEL MOTIVO DE DEVOLUCIÓN': "0",
                    'FORMA DE PAGO': '0',
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
                    'LÍNEA PRODUCTO': "",
                    'GRUPO PRODUCTO': "",
                    'CÓDIGO PRODUCTO': "",
                    'CANTIDAD': "",
                    'CANTIDAD DOS': "0",
                    'CÓDIGO DE LA BODEGA': "1",
                    'CÓDIGO DE LA UBICACIÓN': "0",
                    'CANTIDAD DE FACTOR DE CONVERSIÓN': "0",
                    'OPERADOR DE FACTOR DE CONVERSIÓN': "0",
                    'VALOR DEL FACTOR DE CONVERSIÓN': "0",
                    'TIPO DE MONEDA ELABORACIÓN': "0",
                    'TIPO Y COMPROBANTE CRUCE': "",
                    'NÚMERO DE DOCUMENTO CRUCE': "0",
                    'NÚMERO DE VENCIMIENTO': "",
                    'AÑO VENCIMIENTO DE DOCUMENTO CRUCE': "",
                    'MES VENCIMIENTO DE DOCUMENTO CRUCE': "",
                    'DÍA VENCIMIENTO DE DOCUMENTO CRUCE': "",
                    'DESCRIPCIÓN DE COMENTARIOS': "Ped: "+pedidosFacturacionData[i]+" Ase:"+asesor
                })
                contadorSecuencia += 1;
            }

            //reporta el inventario
            for(var e = 0; e < productosDataFinPedido.length; e++){
                if(productosDataFinPedido[e].pedido == pedidosFacturacionData[i] && productosDataFinPedido[e].cobrado > 0){
                    let cuenta = "";
                    for(var h = 0; h < cuentasData.length; h++){
                        if(cuentasData[h].linea == productosDataFinPedido[e].linea && cuentasData[h].grupo == productosDataFinPedido[e].grupo){
                            cuenta = cuentasData[h]['cuenta de inventarios'];
                            h = cuentasData.length;
                        }
                    }
                    let descripcionProducto = "";
                    for(var h = 0; h < productosSiigoData.length; h++){
                        if(productosSiigoData[h].linea == productosDataFinPedido[e].linea && productosSiigoData[h].grupo == productosDataFinPedido[e].grupo && productosSiigoData[h].codigo == productosDataFinPedido[e].codigo && productosSiigoData[h].auxiliar == productosDataFinPedido[e].auxiliar){
                            descripcionProducto = productosSiigoData[h].referencia;
                            h = productosSiigoData.length
                        }
                    }
                    

                    //agrega el producto al excel en la parte del Inventario
                    data.push({ 
                        'TIPO DE COMPROBANTE (OBLIGATORIO)': 'F', 
                        'CÓDIGO COMPROBANTE  (OBLIGATORIO)': '2', 
                        'NÚMERO DE DOCUMENTO': consecutivoFactura,
                        'CUENTA CONTABLE   (OBLIGATORIO)': cuenta,
                        'DÉBITO O CRÉDITO (OBLIGATORIO)': "C",
                        'VALOR DE LA SECUENCIA   (OBLIGATORIO)': 0,
                        'AÑO DEL DOCUMENTO': fecha.getFullYear(),
                        'MES DEL DOCUMENTO': (fecha.getMonth() +1),
                        'DÍA DEL DOCUMENTO': fecha.getDate(),
                        'CÓDIGO DEL VENDEDOR': "1",
                        'CÓDIGO DE LA CIUDAD': "154",
                        'CÓDIGO DE LA ZONA': "1",
                        'SECUENCIA': contadorSecuencia,
                        'CENTRO DE COSTO': "1",
                        'SUBCENTRO DE COSTO': "0",
                        'NIT': Nit,
                        'SUCURSAL': "0",
                        'DESCRIPCIÓN DE LA SECUENCIA': descripcionProducto,
                        'NÚMERO DE CHEQUE': "0",
                        'COMPROBANTE ANULADO': "N",
                        'CÓDIGO DEL MOTIVO DE DEVOLUCIÓN': "0",
                        'FORMA DE PAGO': "0",
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
                        'LÍNEA PRODUCTO': productosDataFinPedido[e].linea,
                        'GRUPO PRODUCTO': productosDataFinPedido[e].grupo,
                        'CÓDIGO PRODUCTO': productosDataFinPedido[e].codigo,
                        'CANTIDAD': productosDataFinPedido[e].cantidad,
                        'CANTIDAD DOS': "0",
                        'CÓDIGO DE LA BODEGA': "1",
                        'CÓDIGO DE LA UBICACIÓN': "0",
                        'CANTIDAD DE FACTOR DE CONVERSIÓN': "0",
                        'OPERADOR DE FACTOR DE CONVERSIÓN': "0",
                        'VALOR DEL FACTOR DE CONVERSIÓN': "0",
                        'TIPO DE MONEDA ELABORACIÓN': "0",
                        'TIPO Y COMPROBANTE CRUCE': "",
                        'NÚMERO DE DOCUMENTO CRUCE': "0",
                        'NÚMERO DE VENCIMIENTO': "",
                        'AÑO VENCIMIENTO DE DOCUMENTO CRUCE': "",
                        'MES VENCIMIENTO DE DOCUMENTO CRUCE': "",
                        'DÍA VENCIMIENTO DE DOCUMENTO CRUCE': "",
                        'DESCRIPCIÓN DE COMENTARIOS': "Ped: "+productosDataFinPedido[e].pedido+" Ase:"+asesor
                    })
                    contadorSecuencia += 1;
                }
            }

            resumenFacturas.push({
                factura: consecutivoFactura,
                cliente: nombreCliente,
                nit: Nit,
                total: totalPedido,
                abono: abonoTotal,
                saldo: saldoTotal,
                pedido: pedidosFacturacionData[i],
                comision: comisionTotal,
                itemCartera: itemCartera
            })

            //agrega el pedido al resumen de tipo Pedido
            if(resumenDataPedido.length == 0){
                for(var e = 0; e < pedidosData.length; e++){
                    if(pedidosData[e].referencia == pedidosFacturacionData[i]){
                        resumenDataPedido.push({
                            valor: totalPedido,
                            idTipo: pedidosData[e].tipoPedido,
                            name: pedidosData[e].nameTipoPedido
                        })
                        e = pedidosData.length
                    }
                }
            }else{
                for(var e = 0; e < pedidosData.length; e++){
                    if(pedidosData[e].referencia == pedidosFacturacionData[i]){
                        let agregar = true;
                        for(var o = 0; o < resumenDataPedido.length; o++){
                            if(resumenDataPedido[o].idTipo == pedidosData[e].tipoPedido){
                                resumenDataPedido[o].valor +=  totalPedido;
                                agregar = false;
                                o = resumenDataPedido.length;
                                e = pedidosData.length
                            }
                        }

                        if(agregar){
                            resumenDataPedido.push({
                                valor: totalPedido,
                                idTipo: pedidosData[e].tipoPedido,
                                name: pedidosData[e].nameTipoPedido
                            })
                            e = pedidosData.length
                        }
                    }
                }
            }
            consecutivoFactura += 1;
        }

        setTotalFacturacion(total2)
        setTotalAbono(abonoTotalPedidos)
        setDataResumenModalidad(resumenDataPedido);
        setDataResumen(resumenFacturas)
        

        
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
        blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        setContFacturas(pedidosFacturacionData.length)
        swalWithReactFactura.close();
        setmodalResult(true);
        

    }



    const formattedPrice = (value) => {
        if (typeof value !== 'number') {
            value = Number(value);
        }
        return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    function formatearNumeroConPuntos(numero) {
        return numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    function cerrarModal(){
        setmodalResult(false);
    }

    function descargarXLSFactura(){
        let fecha2 = new Date();
        saveAs(blob, 'FA_SAS_'+fecha2.getDate()+"_"+(fecha2.getMonth() +1)+"_"+fecha2.getFullYear()+"__"+fecha2.getHours()+":"+fecha2.getMinutes()+":"+fecha2.getSeconds()+'.xlsx');
    }

    function descargarXLSTerceros(){
        let fecha2 = new Date();
        saveAs(blobTerceros, 'TERCEROS_SAS_'+fecha2.getDate()+"_"+(fecha2.getMonth() +1)+"_"+fecha2.getFullYear()+"__"+fecha2.getHours()+":"+fecha2.getMinutes()+":"+fecha2.getSeconds()+'.xlsx');
    }

    function reportarFacturacion(){
        setmodalResult(false);
        const swalWithReact = withReactContent(Swal);
        swalWithReact.fire({
            title: "Confirmación",
            html: "¿Esta segur@ de reportar la facturación?",
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
                let comprobantesId = [];
                for (var i = 0; i <  comprobantesData.length; i++) {
                    comprobantesId.push(comprobantesData[i].id)
                }
                await axios.post(process.env.ENDPOINT_API+'/pedidos/aprobacionFacturacion',{ 
                    usuario: usuarioId,
                    pedidos: dataResumen,
                    comprobantes: comprobantesId
                }).then(response => { 

                    pedidosFacturacion()

                    swalWithReact.fire({
                        title: "Aprobado",
                        text: "Cambios Guardados",
                        icon: "success",
                        showConfirmButton: false, // Ocultar el botón de confirmación
                        timer: 2000 // Cerrar automáticamente después de 2 segundos
                    });

                    console.log(response.data);

                }).catch(error => {
                    console.log(error);
                    const swalWithReact = withReactContent(Swal);
                    // Manejar el error aquí
                    withReactContent(Swal).fire({
                        title: "Error",
                        text: "Comunica con soporte (aprobar comprobante)",
                        icon: "error"
                    })
                });
            }else{
                setmodalResult(true);
            }
        })

    }
    

    return <>  

        <Modal show={modalResult} className="modal-lg" onHide={cerrarModal}>
            <Modal.Header closeButton>
            </Modal.Header>
            <Modal.Body style={{marginTop:'-40px'}}>
                <div className='row'>
                    <div className='col-6' style={{borderRight:'1px solid #ababab'}}>
                        
                        <div className='row'>
                            <div className='col-8' style={{marginTop:'10px',textAlign:'right'}}>
                                {dataResumenModalidad.map((modalida, index) => {
                                    return (
                                        <span>
                                            {modalida.name}:
                                            <br></br>
                                        </span>
                                        
                                    )
                                })}
                                <b>TOTAL</b>
                            </div>
                            <div className='col-4' style={{marginTop:'10px',textAlign:'left'}}>
                                {dataResumenModalidad.map((modalida, index) => {
                                    return (
                                        <span>
                                            {formattedPrice(modalida.valor)}
                                            <br></br>
                                        </span>
                                    )
                                })}
                                <span style={{borderTop:'1px solid #ababab',color:'green',fontWeight:'bold'}}>{formattedPrice(totalFacturacion)}</span>
                            </div>
                        </div>
                    </div>
                    <div className='col-6'>
                        <div style={{display: 'flex',alignItems: 'center',height:'100%'}}>
                            <div className='row' style={{width:'100%',margin:'auto'}}>
                                <div className='col-6' style={{textAlign:'center'}}>
                                    <button className='btn btn-secondary'  onClick={() => descargarXLSTerceros()}   style={{width:'100%',borderRadius: '0px',margin:'10px'}}><i style={{marginRight:'5px'}} className='bx bxs-cloud-download'></i> Terceros - {contTerceros}</button>
                                </div>
                                <div className='col-6' style={{textAlign:'center'}}>
                                    <button className='btn btn-secondary'  onClick={() => descargarXLSFactura()} style={{width:'100%',borderRadius: '0px',margin:'10px'}}><i style={{marginRight:'5px'}} className='bx bxs-cloud-download'></i> Facturas - {contFacturas}</button>
                                </div>
                                <div className='col-12' style={{textAlign:'center',borderTop:'1px solid #ababab'}}>
                                    <button className='btn btn-primary' onClick={() => reportarFacturacion()} style={{width:'100%',borderRadius: '0px',margin:'10px'}}>Reportar</button>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                    
                    
                    <div className='col-12' style={{marginTop:'30px'}}>
                        <table className="table table-striped">
                            <thead>
                                <tr style={{background:"#e9e9e9"}}>
                                    <th scope="col" style={{textAlign:'center'}}>
                                        Factura
                                    </th>
                                    <th scope="col" style={{textAlign:'center'}}>Cliente</th>
                                    <th scope="col" style={{textAlign:'center'}}>Total</th>
                                    <th scope="col" style={{textAlign:'center'}}>Abono</th>
                                    <th scope="col" style={{textAlign:'center'}}>Saldo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dataResumen.map((pedido, index) => {
                                    return (
                                        <React.Fragment key={index}>
                                            <tr>
                                                <td style={{ textAlign: 'center' }}>
                                                    {pedido.factura}
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    {pedido.cliente}
                                                    <br></br>
                                                    <b>{formatearNumeroConPuntos(pedido.nit)}</b>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    {formattedPrice(pedido.total)}
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    {formattedPrice(pedido.abono)}
                                                </td>
                                                <td style={{ textAlign: 'center',color: pedido.saldo > 0 ? 'red' : 'inherit'}}>
                                                    {formattedPrice(pedido.saldo)}
                                                </td>
                                            </tr>
                                        </React.Fragment>
                                    )
                                })}
                            </tbody>
                            <tfoot>
                                <tr style={{ background: "#f1f1f1", fontWeight: 'bold' }}>
                                    <td style={{ textAlign: 'right' }} colSpan="2">TOTAL:</td>
                                    <td style={{ textAlign: 'center' }}>{formattedPrice(totalFacturacion)}</td>
                                    <td style={{ textAlign: 'center' }}>{formattedPrice(totalAbono)}</td>
                                    <td style={{ textAlign: 'center',color: (totalFacturacion-totalAbono) > 0 ? 'red' : 'inherit' }}>{formattedPrice(totalFacturacion-totalAbono)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            
            </Modal.Body>
        </Modal>

        <div className="container-xxl flex-grow-1 container-p-y">
            <div className="row">
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="d-flex align-items-start align-items-sm-center gap-4">
                            <div className='row' style={{width:'100%',marginTop:'20px'}}>
                                <div className='col-12' style={{textAlign:'right'}}>
                                    <button onClick={() => facturar()} className='btn btn-primary' style={{borderRadius: '0px'}}>Facturar</button>
                                </div>
                                <div className='col-12' style={{marginTop:'20px'}}>
                                    <table className="table table-striped">
                                        <thead>
                                            <tr style={{background:"#e9e9e9"}}>
                                                <th scope="col" style={{textAlign:'center'}}>
                                                    <input style={{position: 'inherit',margin: 'auto'}} className='form-check-input selePedido' id="seleTodo" onClick={() => selecionarTodo()} type='checkbox'></input>
                                                </th>
                                                <th scope="col" style={{textAlign:'center'}}>Pedido</th>
                                                <th scope="col" style={{textAlign:'center'}}>Valor</th>
                                                <th scope="col" style={{textAlign:'center'}}>Usuario</th>
                                                <th scope="col" style={{textAlign:'center'}}>Cliente</th>
                                                <th scope="col" style={{textAlign:'center'}}>Productos</th>
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
                                                                    <td style={{ textAlign: 'center' }}>
                                                                        <input style={{position: 'inherit',margin: 'auto'}} className='form-check-input selePedido' id={`selectPedido-${pedido.referencia}`} onClick={() => selecionarPedido(pedido.referencia)} type='checkbox'></input>
                                                                    </td>
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
    </>
    
}