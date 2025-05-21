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
                pedidosCartera();
            }
            
        }
    })  

    async function pedidosCartera(){
        await axios.post(process.env.ENDPOINT_API+'/pedidos/dataCartera').then(response => {  
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

    async function facturar() {
        
        swalWithReactFactura = withReactContent(Swal);

        swalWithReactFactura.fire({
            title: "Recibos",
            html: (
                <div>
                    <p>
                        Ingresa el consecutivo de SIIGO (R-1)
                    </p>
                    <div style={{marginTop:'10px'}}>
                        <label style={{width:'100%',textAlign:'left',marginTop:'10px',marginBottom:'2px'}}>Consecutivo:</label>
                        <input className="form-control" id="consecutivoFactura"></input>
                    </div>
                </div>
            ),
            showCancelButton: true,
            confirmButtonText: "Recibos",
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
                
        })
        
    }


    function prepararExcelFacturacion(){
        const data = [];

        const fecha = new Date();
        let dataResumen = [];

        for (var i = 0; i <  pedidosData.length; i++) {
            let contadorSecuencia = 1;
            let Nit = "";
            let nombreCliente = "";
            let  pago = 0;
            for (var h = 0; h <  tercerosData.length; h++) {
                if(pedidosData[i].idFacturacion == tercerosData[h].id){
                    Nit = tercerosData[h].noDoc;
                    nombreCliente = tercerosData[h].nombre
                    if(tercerosData[h].tipo != 2){
                        nombreCliente = tercerosData[h].priNombre+" "+tercerosData[h].priApellido
                    }
                }
            }
            for (var h = 0; h <  pedidosData[i].pedidos.length; h++) {
                let fechaFactura = new Date(pedidosData[i].pedidos[h].fechaFactura)
                pago += parseInt(pedidosData[i].pedidos[h].valor);
                //saca la persona de credito naciona
                data.push({ 
                    'TIPO DE COMPROBANTE (OBLIGATORIO)': 'R', 
                    'CÓDIGO COMPROBANTE  (OBLIGATORIO)': '1', 
                    'NÚMERO DE DOCUMENTO': consecutivoFactura,
                    'CUENTA CONTABLE   (OBLIGATORIO)': '1305050000',
                    'DÉBITO O CRÉDITO (OBLIGATORIO)': "C",
                    'VALOR DE LA SECUENCIA   (OBLIGATORIO)': (pedidosData[i].pedidos[h].valor),
                    'AÑO DEL DOCUMENTO': fecha.getFullYear(),
                    'MES DEL DOCUMENTO': (fecha.getMonth() +1),
                    'DÍA DEL DOCUMENTO': fecha.getDate(),
                    'CÓDIGO DEL VENDEDOR': "0",
                    'CÓDIGO DE LA CIUDAD': "0",
                    'CÓDIGO DE LA ZONA': "0",
                    'SECUENCIA': contadorSecuencia,
                    'CENTRO DE COSTO': "0",
                    'SUBCENTRO DE COSTO': "0",
                    'NIT': Nit,
                    'SUCURSAL': "0",
                    'DESCRIPCIÓN DE LA SECUENCIA': "CANCELA FACTURA - "+pedidosData[i].pedidos[h].pedido+" - ASE:"+pedidosData[i].name,
                    'NÚMERO DE CHEQUE': "0",
                    'COMPROBANTE ANULADO': "N",
                    'CÓDIGO DEL MOTIVO DE DEVOLUCIÓN': "0",
                    'FORMA DE PAGO': pedidosData[i].formadePago,
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
                    'TIPO Y COMPROBANTE CRUCE': "F-002",
                    'NÚMERO DE DOCUMENTO CRUCE': pedidosData[i].pedidos[h].factura,
                    'NÚMERO DE VENCIMIENTO': pedidosData[i].pedidos[h].item,
                    'AÑO VENCIMIENTO DE DOCUMENTO CRUCE': fechaFactura.getFullYear(),
                    'MES VENCIMIENTO DE DOCUMENTO CRUCE': (fechaFactura.getMonth() +1),
                    'DÍA VENCIMIENTO DE DOCUMENTO CRUCE': fechaFactura.getDate(),
                    'DESCRIPCIÓN DE COMENTARIOS': ""
                })
                contadorSecuencia += 1;
            }

            //descuento faltante
            if(pago > pedidosData[i].valor){

            }

            //sobrante
            if(pago < pedidosData[i].valor){
                //reporta el SOBRANTE
                data.push({ 
                    'TIPO DE COMPROBANTE (OBLIGATORIO)': 'R', 
                    'CÓDIGO COMPROBANTE  (OBLIGATORIO)': '1', 
                    'NÚMERO DE DOCUMENTO': consecutivoFactura,
                    'CUENTA CONTABLE   (OBLIGATORIO)': "4120950502",
                    'DÉBITO O CRÉDITO (OBLIGATORIO)': "C",
                    'VALOR DE LA SECUENCIA   (OBLIGATORIO)': (pedidosData[i].valor-pago),
                    'AÑO DEL DOCUMENTO': fecha.getFullYear(),
                    'MES DEL DOCUMENTO': (fecha.getMonth() +1),
                    'DÍA DEL DOCUMENTO': fecha.getDate(),
                    'CÓDIGO DEL VENDEDOR': "0",
                    'CÓDIGO DE LA CIUDAD': "0",
                    'CÓDIGO DE LA ZONA': "1",
                    'SECUENCIA': contadorSecuencia,
                    'CENTRO DE COSTO': "0",
                    'SUBCENTRO DE COSTO': "0",
                    'NIT': Nit,
                    'SUCURSAL': "0",
                    'DESCRIPCIÓN DE LA SECUENCIA': "SOBRANTES",
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
            }

            contadorSecuencia += 1;
            let fechaComprobante = new Date(pedidosData[i].fecha)

            //reporta el ingreso al banco
            data.push({ 
                'TIPO DE COMPROBANTE (OBLIGATORIO)': 'R', 
                'CÓDIGO COMPROBANTE  (OBLIGATORIO)': '1', 
                'NÚMERO DE DOCUMENTO': consecutivoFactura,
                'CUENTA CONTABLE   (OBLIGATORIO)': pedidosData[i].cuentaSiigo,
                'DÉBITO O CRÉDITO (OBLIGATORIO)': "D",
                'VALOR DE LA SECUENCIA   (OBLIGATORIO)': (pedidosData[i].valor),
                'AÑO DEL DOCUMENTO': fecha.getFullYear(),
                'MES DEL DOCUMENTO': (fecha.getMonth() +1),
                'DÍA DEL DOCUMENTO': fecha.getDate(),
                'CÓDIGO DEL VENDEDOR': "0",
                'CÓDIGO DE LA CIUDAD': "0",
                'CÓDIGO DE LA ZONA': "1",
                'SECUENCIA': contadorSecuencia,
                'CENTRO DE COSTO': "0",
                'SUBCENTRO DE COSTO': "0",
                'NIT': Nit,
                'SUCURSAL': "0",
                'DESCRIPCIÓN DE LA SECUENCIA': fechaComprobante.getDate()+"-"+(fecha.getMonth() +1),
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

            dataResumen.push({
                recibo: consecutivoFactura,
                cliente: nombreCliente,
                nit: Nit,
                asesor: pedidosData[i].name,
                abono: pago,
                comprobante: pedidosData[i].id,
                pedidos: pedidosData[i].pedidos
            })

            consecutivoFactura += 1;
        }

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

        swalWithReactFactura.close();
        setmodalResult(true);
        setDataResumen(dataResumen);

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

    function descargarXLS(){
        let fecha2 = new Date();
        saveAs(blob, 'RE_SAS_'+fecha2.getDate()+"_"+(fecha2.getMonth() +1)+"_"+fecha2.getFullYear()+"__"+fecha2.getHours()+":"+fecha2.getMinutes()+":"+fecha2.getSeconds()+'.xlsx');
    }



    function reportarFacturacion(){
        setmodalResult(false);
        const swalWithReact = withReactContent(Swal);
        swalWithReact.fire({
            title: "Confirmación",
            html: "¿Esta segur@ de reportar los recibos?",
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

                await axios.post(process.env.ENDPOINT_API+'/pedidos/aprobacionRecibos',{ 
                    usuario: usuarioId,
                    data: JSON.stringify(dataResumen)
                }).then(response => { 

                    pedidosCartera()

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
                    <div className='col-12'>
                        <div style={{display: 'flex',alignItems: 'center',height:'100%'}}>
                            <div className='row' style={{width:'100%',margin:'auto'}}>
                                <div className='col-6' style={{textAlign:'center'}}>
                                    <button className='btn btn-secondary'  onClick={() => descargarXLS()}   style={{width:'100%',borderRadius: '0px',margin:'10px'}}><i style={{marginRight:'5px'}} className='bx bxs-cloud-download'></i> Documento</button>
                                </div>
                                <div className='col-6' style={{textAlign:'center'}}>
                                    <button className='btn btn-primary' onClick={() => reportarFacturacion()} style={{width:'100%',borderRadius: '0px',margin:'10px'}}>Reportar</button>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                    <div className='col-12' style={{borderRight:'1px solid #ababab'}}>
                        <table className="table table-striped">
                            <thead>
                                <tr style={{background:"#e9e9e9"}}>
                                    <th scope="col" style={{textAlign:'center'}}>
                                        Recibo
                                    </th>
                                    <th scope="col" style={{textAlign:'center'}}>Cliente</th>
                                    <th scope="col" style={{textAlign:'center'}}>Asesor</th>
                                    <th scope="col" style={{textAlign:'center'}}>Abono</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dataResumen.map((pedido, index) => {
                                    return (
                                        <React.Fragment key={index}>
                                            <tr>
                                                <td style={{ textAlign: 'center' }}>
                                                    {pedido.recibo}
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    {pedido.cliente}
                                                    <br></br>
                                                    
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    {pedido.asesor}
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    {formattedPrice(pedido.abono)}
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

        <div className="container-xxl flex-grow-1 container-p-y">
            <div className="row">
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="d-flex align-items-start align-items-sm-center gap-4">
                            <div className='row' style={{width:'100%',marginTop:'20px'}}>
                                <div className='col-12' style={{textAlign:'right'}}>
                                    <button onClick={() => facturar()} className='btn btn-primary' style={{borderRadius: '0px'}}>Reportar</button>
                                </div>
                                <div className='col-12' style={{marginTop:'20px'}}>
                                    <table className="table table-striped">
                                        <thead>
                                            <tr style={{background:"#e9e9e9"}}>
                                                <th scope="col" style={{textAlign:'center'}}>Pedido</th>
                                                <th scope="col" style={{textAlign:'center'}}>Valor</th>
                                                <th scope="col" style={{textAlign:'center'}}>Usuario</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {consultando ? (
                                                <tr>
                                                    <td colSpan="3" style={{ textAlign: 'center' }}>Consultando...</td>
                                                </tr>
                                            ) : (
                                                    
                                                pedidos.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="3" style={{ textAlign: 'center' }}>No se encontraron registros.</td>
                                                    </tr>
                                                ) : (
                                                    pedidos.map((pedido, index) => {
                                                        return (
                                                            <React.Fragment key={index}>
                                                                <tr>
                                                                    <td style={{ textAlign: 'center' }}>
                                                                        {pedido.pedidos.map((abono, abonoIndex) => (
                                                                            <React.Fragment key={abonoIndex}>
                                                                                Ped: {abono.pedido} 
                                                                                <br></br>
                                                                                Abono: {formattedPrice(abono.valor)}
                                                                                {abonoIndex < pedido.pedidos.length - 1 && <div style={{ background:'#e9e9e9',height:'2px' }}></div>}
                                                                            </React.Fragment>
                                                                        ))}
                                                                    </td>
                                                                    <td style={{ textAlign: 'center' }}>{formattedPrice(pedido.valor)}</td>
                                                                    <td style={{ textAlign: 'center' }}>
                                                                        {pedido.name}
                                                                        <br></br>
                                                                        <b>{formatearNumeroConPuntos(pedido.document)}</b>
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