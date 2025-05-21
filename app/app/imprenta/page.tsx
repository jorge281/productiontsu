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

                usuarioId = decodedToken.payload.user; 
                usuarioProducto  = 19//decodedToken.payload.userWeb;

                cargoSite = 1;
                pedidosFacturacion();
                cargarCiudades();
            }
            
        }
    })  

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
    

    return <>  
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
        <div className="container-xxl flex-grow-1 container-p-y">
            <div className="row">
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="d-flex align-items-start align-items-sm-center gap-4">
                            <div className='row' style={{width:'100%',marginTop:'20px'}}>
                                <div className='col-12' style={{marginTop:'20px'}}>
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
        </div>
    </>
    
}