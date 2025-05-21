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
import { FileUploader } from "react-drag-drop-files";
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
const $ = require('jquery');

let usuarioId = 1;
let imprimirOrden = 0;
let usuarioProducto = 1;
let blob = "";
let departamentosArray = [];
let blobTerceros = "";
let swalWithReactFactura;
let cargoSite = 0;
let entidadFiltro = 0;
let tipoFiltro = 0;
let estadoFiltro = 1;
let pedidosData = [];
let arrayFile = [];
let tercerosData = [];
let productosData2 = [];
let productosSiigoData = [];
let comprobantesData = [];
let consecutivoFactura = "";
let pedidosFacturacionData = [];
let cuentasData = [];

export default function Home() {

    const [entidades,setEntidades] = useState([]);
    const [file,setFile] = useState([]);
    const [usuario, setUsuario] = useState({ 
        nombre: '',
        perfil: '',
        foto: '',
        user: ''
    });
    const [abonoTotal,setAbonoTotal] = useState(0);
    const [linkQR, setLinkQR] = useState('');
    const [consultando,setConsultado] = useState(true);
    const [pedidos,setPedidos] = useState([]);
    const [modalPago,setModalPago] = useState(false);
    const [productos,setProductos] = useState([]);
    const [pedidosAbono,setPedidosAbono] = useState([]);
    const [abonos, setAbonos] = useState({});

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

                usuarioId = decodedToken.payload.user; 
                usuarioProducto  = decodedToken.payload.user; 

                cargoSite = 1;
                pedidosCartera();
                cargarEntidades();
            }
            
        }
    })  

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

    async function pedidosCartera(){
        await axios.post(process.env.ENDPOINT_API+'/pedidos/carteraAsesor',{ 
            usuario: usuarioProducto
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

    const formattedPrice = (value) => {
        if (typeof value !== 'number') {
            value = Number(value);
        }
        return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    function formatearNumeroConPuntos(numero) {
        return numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
    
    function formatearNumeroConPuntos(numero) {
        return numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    const formatSpanishDate = (date) => {
        date = new Date(date);
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

    function abonoFactura(val,referenciaPedido){

        if(val.length == 0){
            val = 0;
        }
        if (isNaN(val) == true) {
            val = 0;
        }
        // Actualizar el estado de abonos
         // Actualizar el estado de abonos
        setAbonos((prevAbonos) => {
            const nuevosAbonos = {
                ...prevAbonos,
                [referenciaPedido]: parseInt(val),
            };
    
            // Calcular la suma total de todos los abonos
            const sumaTotal = Object.values(nuevosAbonos).reduce((acc, abono) => acc + abono, 0);
            setAbonoTotal(sumaTotal);
            $("#valorPago").val(sumaTotal);
            return nuevosAbonos;
        });


        setPedidos((prevPedidos) =>
            prevPedidos.map((pedido) => {
              if (pedido.referencia === referenciaPedido) {
                // Crear un nuevo objeto con el abono2 actualizado
                return { ...pedido, abonos2: parseInt(pedido.saldo)-parseInt(val) };
              }
              return pedido; // Retornar el pedido sin cambios si no coincide
            })
        );

    }

    function pagar(){
        if(pedidosFacturacionData.length == 0){
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                type: "info",
                title: 'Alerta',
                text: "Elige uno o varios pedidos",
            });
        }else{
            setModalPago(true);
            setPedidosAbono(pedidosFacturacionData);
            let abonoTotal = 0;
            for(var i = 0; i < pedidosFacturacionData.length; i++){
                for(var e = 0; e < pedidos.length; e++){
                    let referencia = pedidos[e].referencia;
                    let saldo = pedidos[e].saldo-pedidos[e].abonos2;
                    if(pedidos[e].referencia == pedidosFacturacionData[i]){
                        abonoTotal += saldo;
                        setAbonos((prevAbonos) => ({
                            ...prevAbonos,
                            [referencia]: saldo,
                        }));
                    }
                }
            }
            setAbonoTotal(abonoTotal)
            setTimeout(function(){
                $("#valorPago").val(abonoTotal)
            }, 50);
            
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
    
    function cerrarModal(){
        setModalPago(false);
    }

    const handleChangeFile = (file) => {
        file.rutaPreview = URL.createObjectURL(file);
        arrayFile.push(file);
        setFile([file]);
    }

    async function subirComprobante(){
        setModalPago(false);
        if($("#valorPago").val() < abonoTotal || file.length == 0 || $("#fechaPago").val().length == 0){
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Datos de comprobante (campos incompletos)",
                icon: "error"
            })
            return 1;
        }else{
            
            const swalWithReact = withReactContent(Swal);
            swalWithReact.fire({
                title: "Guardando",
                text: "Por favor, espera un momento...",
                icon: "info",
                showConfirmButton: false, // Ocultar el botón de confirmación
                allowOutsideClick: false // Evitar cerrar el SweetAlert haciendo clic fuera de él
            });
            
            $(".swal2-container").css({'background':'#cfcfcfde'})

            const formData = new FormData();
            arrayFile.forEach((file, index) => {
                formData.append(`file${index}`, file); // Agrega el archivo
                formData.append(`rutaPreview${index}`, file.rutaPreview);
                formData.append(`entidad${index}`, $("#entidadPago").val());
                formData.append(`fecha${index}`, $("#fechaPago").val());
                formData.append(`valor${index}`, $("#valorPago").val());
            });
            let pedidosAbono = [];
            pedidosFacturacionData.forEach((pedido, index) => {
                console.log(pedido);
                pedidosAbono.push({
                    'pedido': pedido,
                    'valor': abonos[pedido],
                    'usuario': usuarioId
                })
            });
            formData.append(`pedidos`,JSON.stringify(pedidosAbono));

            await axios.post(process.env.ENDPOINT_API+'/pedidos/comprobantesCartera', formData)
            .then(async(response) => {
                if(response.data.bandera == 0){
                    // Manejar el error aquí
                    withReactContent(Swal).fire({
                        title: "Error",
                        text: "Comunica con soporte (subir Comprobantes)",
                        icon: "error"
                    })
                }else{
                    swalWithReact.fire({
                        title: "Aplicado",
                        text: "comprobante Reportado",
                        icon: "success",
                        showConfirmButton: false, // Ocultar el botón de confirmación
                        timer: 2000 // Cerrar automáticamente después de 2 segundos
                    });
                    pedidosCartera();
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
    }

    return <>

        <Modal show={modalPago} className="modal-lg" onHide={cerrarModal}>
            <Modal.Header closeButton>
                Pago Cartera
            </Modal.Header>
            <Modal.Body>
                <div className='row'>
                    <div className='col-12 fileCompro' style={{textAlign:'right'}}>
                        <h3>{formattedPrice(abonoTotal)}</h3>
                    </div>
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
                                <span style={{marginTop:'10px',display:'block',width:'100%'}}>Entidad:</span>
                                <span style={{marginTop:'22px',display:'block',width:'100%'}}>Fecha:</span>
                                <span style={{marginTop:'26px',display:'block',width:'100%'}}>Valor:</span>
                            </div>
                            <div className='col-8'>
                                <select id="entidadPago" className='form-control'>
                                    {entidades.map((entidad, index) => (
                                        <option key={entidad.id} value={entidad.id}>
                                            {entidad.entidad}
                                        </option>
                                    ))}
                                </select>
                                <input id="fechaPago" style={{marginTop:'10px'}} type='Date' className='form-control'></input>
                                <input id="valorPago" style={{marginTop:'10px'}} type='text' className='form-control'></input>
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
                    <div className='col-12' style={{textAlign:'center',marginTop:'10px'}}>
                        <button style={{width:'90%'}}  onClick={subirComprobante} className='btn btn-primary confirmacionPedido2'>Subir Comprobante</button>        
                    </div>
                </div>
                <table className="table table-striped" style={{marginTop:'10px'}}>
                    <thead>
                        <tr style={{background:"#e9e9e9"}}>
                            <th scope="col" style={{textAlign:'center'}}></th>
                            <th scope="col" style={{textAlign:'center'}}>Pedido</th>
                            <th scope="col" style={{textAlign:'center'}}>Total</th>
                            <th scope="col" style={{textAlign:'center'}}>saldo</th>
                            <th scope="col" style={{textAlign:'center'}}>Abono</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pedidosFacturacionData.map((factura, index) => (
                            <tr key={index}>
                                <th style={{ textAlign: 'center' }}>{index + 1}</th>
                                {pedidos.map((pedido) => {
                                    const abonoCartera = abonos[pedido.referencia];
                                    if (pedido.referencia === factura) {
                                        return (
                                        <React.Fragment key={pedido.referencia}>
                                            <td style={{ textAlign: 'center' }}>{pedido.referencia}</td>
                                            <td style={{ textAlign: 'center' }}>
                                            {formattedPrice(pedido.saldo)}
                                            </td>
                                            <td style={{ textAlign: 'center' }} id={`saldo-${pedido.referencia}`}>
                                            {formattedPrice(pedido.abonos2)}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                            <input
                                                onChange={(e) => abonoFactura(e.target.value, pedido.referencia)}
                                                style={{ border: '1px solid', textAlign: 'center' }}
                                                placeholder="$0"
                                                value={abonoCartera}
                                                className="form-control"
                                                type="text"
                                            />
                                            </td>
                                        </React.Fragment>
                                        );
                                    }
                                return null;
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Modal.Body>
        </Modal>  
        <div className="container-xxl flex-grow-1 container-p-y">
            <div className="row">
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="d-flex align-items-start align-items-sm-center gap-4">
                            <div className='row' style={{width:'100%',marginTop:'20px'}}>
                                <div className='col-12' style={{textAlign:'right'}}>
                                    <button onClick={() => pagar()} className='btn btn-primary' style={{borderRadius: '0px'}}>Pagar</button>
                                </div>
                                <div className='col-12' style={{marginTop:'20px'}}>
                                    <table className="table table-striped">
                                        <thead>
                                            <tr style={{background:"#e9e9e9"}}>
                                                <th scope="col" style={{textAlign:'center'}}></th>
                                                <th scope="col" style={{textAlign:'center'}}>Pedido</th>
                                                <th scope="col" style={{textAlign:'center'}}>Total</th>
                                                <th scope="col" style={{textAlign:'center'}}>Abono</th>
                                                <th scope="col" style={{textAlign:'center'}}>Saldo</th>
                                                <th scope="col" style={{textAlign:'center'}}>Dias</th>
                                                <th scope="col" style={{textAlign:'center'}}>Cliente</th>
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
                                                                    <td style={{ textAlign: 'center' }}>{formattedPrice(pedido.saldo)}</td>
                                                                    <td style={{ textAlign: 'center' }}>{formattedPrice(pedido.abonos)}</td>
                                                                    <td style={{ textAlign: 'center',color:'red' }}>
                                                                        {formattedPrice(pedido.saldo-pedido.abonos)}
                                                                    </td>
                                                                    <td style={{ textAlign: 'center',color:pedido.colorDias }}>
                                                                        {pedido.dias}
                                                                        <br></br>
                                                                        <span>{formatSpanishDate(pedido.fechaFactura)}</span>
                                                                    </td>
                                                                    <td style={{ textAlign: 'center' }}>
                                                                        {pedido.cliente}
                                                                        <br></br>
                                                                        <b>{formatearNumeroConPuntos(pedido.noDoc)}</b>
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