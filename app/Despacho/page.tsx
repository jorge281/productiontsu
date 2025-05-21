"use client"

import React, { use, useEffect, useState, useCallback, ChangeEvent, useRef } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { PDFDocument } from 'pdf-lib';

const $ = require('jquery');

let cargoSite = 0;
let usuarioId = 0;
let procesoConsulta = 0;
let offsetConsulta = 0;
let departamentosArray  = [];
let controladorTiempo = "";
let searchBuscador = "";

export default function Home() {
    
    
    const [usuario, setUsuario] = useState({ 
        nombre: '',
        perfil: '',
        foto: '',
        user: ''
    });
    const [pedidos,setPedidos] = useState([]);
    const [consultando,setConsultando] = useState(true);
    const [proceso, setProceso] = useState(0);

    const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setProceso(Number(event.target.value));
        procesoConsulta = Number(event.target.value);
    };

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

                //usuarioId = decodedToken.payload.user;
                usuarioId =  decodedToken.payload.userWeb

                cargoSite = 1;

                $(".content-wrapper").css('max-height','none');
                cargarCiudades();
            }
        }
    })

    //cargar las ciudades
    async function cargarCiudades(){
        await axios.post(process.env.ENDPOINT_API+'/apoyoTSU/ciudades').then(response => {

            departamentosArray = response.data.ciudades
            cargarPedidos();

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

    //carga los pedidos
    async function cargarPedidos(){

        await axios.post(process.env.ENDPOINT_API+'/apoyoTSU/Despachos',{ 

            usuario: usuarioId,
            proceso: procesoConsulta,
            offset: offsetConsulta,
            limit: 10,
            search: searchBuscador

        }).then(response => {
            setConsultando(false);
            for( var i = response.data.pedidos.length - 1; i >= 0; i-- ){
                for (var e = departamentosArray.length - 1; e >= 0; e--) {
                    if(departamentosArray[e].nombre == response.data.pedidos[i].departamento){
                        departamentosArray[e].ciudades2.split(",").forEach(function(element) {
                            if(element.split(":")[0] == response.data.pedidos[i].ciudad){
                                response.data.pedidos[i].ciudadName = element.split(":")[1];
                            }
                        })
                    }
                }
            }

            setPedidos(response.data.pedidos)
            console.log(response);

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

    const handleChangeTransportadora = (index, event) => {
        const newProductos = [...pedidos];
        newProductos[index].transportadora = event.target.value;
        setPedidos(newProductos);
    }

    async function despacharPedido(datos,id){
        //tcc
        if($("#transportadora-"+id).val() == 1){
            const swalWithReact = withReactContent(Swal);
            swalWithReact.fire({
                title: "Generando",
                text: "Por favor, espera un momento...",
                icon: "info",
                showConfirmButton: false, // Ocultar el botón de confirmación
                allowOutsideClick: false // Evitar cerrar el SweetAlert haciendo clic fuera de él
            });

            await axios.post(process.env.ENDPOINT_API+'/apoyoTSU/guardarRemesaTCC',{ 
                referencia:datos.referencia
            }).then(response => {

                swalWithReact.fire({
                    title: "Despachado",
                    text: "Cambios Guardados",
                    icon: "success",
                    showConfirmButton: false, // Ocultar el botón de confirmación
                    timer: 2000 // Cerrar automáticamente después de 2 segundos
                });
                cargarPedidos()
                window.open(response.data.rotulo, '_blank');

            }).catch(error => {         
                // Manejar el error aquí
                withReactContent(Swal).fire({
                    title: "Error",
                    text: "Comunica con soporte (guardar remesa)",
                    icon: "error"
                })
            });
        }
        //inte
        else if($("#transportadora-"+id).val() == 3){
            const swalWithReact = withReactContent(Swal);
            swalWithReact.fire({
                title: "Generando",
                text: "Por favor, espera un momento...",
                icon: "info",
                showConfirmButton: false, // Ocultar el botón de confirmación
                allowOutsideClick: false // Evitar cerrar el SweetAlert haciendo clic fuera de él
            });

            await axios.post(process.env.ENDPOINT_API+'/apoyoTSU/guardarRemesaInter',{ 
                referencia:datos.referencia
            }).then(async response => {

                swalWithReact.fire({
                    title: "Despachado",
                    text: "Cambios Guardados",
                    icon: "success",
                    showConfirmButton: false, // Ocultar el botón de confirmación
                    timer: 2000 // Cerrar automáticamente después de 2 segundos
                });

                const dataRemesa = [{ 
                    "numeroPreenvio":response.data.remesa.toString()
                }];

                const rotulo = await axios.post(
                    'https://3oc1rd23za.execute-api.us-east-1.amazonaws.com/RecogidasProduccion/api/Preenvios/ObtenerPreenviosRotulo', 
                    dataRemesa,
                    {
                      headers: {
                        'Content-Type': 'application/json; charset=utf-8'
                      }
                    }
                );
                
                rotuloPedido(datos)

                const base64String = rotulo.data;
    
                // Decodificar la cadena base64
                const bytes = Uint8Array.from(atob(base64String), c => c.charCodeAt(0));

                // Crear un documento PDF a partir del array de bytes
                const pdfDoc = await PDFDocument.load(bytes);

                // Serializar el PDF a un array de bytes
                const pdfBytes = await pdfDoc.save();

                // Crear un blob a partir del array de bytes del PDF
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });

                // Crear un enlace de descarga
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = "GUIA-"+datos.referencia+'.pdf';

                // Hacer clic en el enlace para iniciar la descarga
                link.click();

                // Liberar el objeto URL
                URL.revokeObjectURL(link.href);

                cargarPedidos();


            }).catch(error => {         
                // Manejar el error aquí
                withReactContent(Swal).fire({
                    title: "Error",
                    text: "Comunica con soporte (guardar remesa)",
                    icon: "error"
                })
            });
        }
        else{
            const swalWithReact = withReactContent(Swal);
            swalWithReact.fire({
                title: 'Ingrese el número de guía',
                input: 'text',
                inputPlaceholder: 'Número de guía',
                width: 600,
                showCancelButton: true,
                confirmButtonText: 'Confirmar',
                cancelButtonText: 'Cancelar',
                inputValidator: (value) => {
                  if (!value) {
                    return '¡Debe ingresar un número de guía!'
                  }
                }
              }).then(async (result) => {
                if (result.isConfirmed) {

                    swalWithReact.fire({
                        title: "Validando",
                        text: "Por favor, espera un momento...",
                        icon: "info",
                        showConfirmButton: false, // Ocultar el botón de confirmación
                        allowOutsideClick: false // Evitar cerrar el SweetAlert haciendo clic fuera de él
                    });

                    const numeroDeGuia = result.value;
                    await axios.post(process.env.ENDPOINT_API+'/apoyoTSU/guardarRemesa',{ 
                        referencia:datos.referencia,
                        guia: numeroDeGuia,
                        transportadora: $("#transportadora-"+id).val()
                    }).then(response => {

                        swalWithReact.fire({
                            title: "Despachado",
                            text: "Cambios Guardados",
                            icon: "success",
                            showConfirmButton: false, // Ocultar el botón de confirmación
                            timer: 2000 // Cerrar automáticamente después de 2 segundos
                        });
                        cargarPedidos()

                    }).catch(error => {         
                        // Manejar el error aquí
                        withReactContent(Swal).fire({
                            title: "Error",
                            text: "Comunica con soporte (guardar remesa)",
                            icon: "error"
                        })
                    });
                }
            });
        }
    }

    async function pedidoRecogido(referencia,id) {
        
        const swalWithReact = withReactContent(Swal);
        swalWithReact.fire({
            title: "Confirmación",
            html: "¿Esta segur@ que ya recogieron el pedido?",
            showCancelButton: true,
            confirmButtonText: "Si", // Texto personalizado para el botón de confirmación
            cancelButtonText: "No", // Texto personalizado para el botón de cancelación
            allowOutsideClick: false
        }).then(async(result) => {
            // Aquí puedes continuar con el flujo normal si el usuario seleccionó una opción válida
            if (result.isConfirmed) {
                await axios.post(process.env.ENDPOINT_API+'/apoyoTSU/pedidoEntregado',{ 
                    referencia:referencia,
                }).then(response => {

                    swalWithReact.fire({
                        title: "Entregado",
                        text: "Cambios Guardados",
                        icon: "success",
                        showConfirmButton: false, // Ocultar el botón de confirmación
                        timer: 2000 // Cerrar automáticamente después de 2 segundos
                    });
                    cargarPedidos()

                }).catch(error => {         
                    // Manejar el error aquí
                    withReactContent(Swal).fire({
                        title: "Error",
                        text: "Comunica con soporte (guardar remesa)",
                        icon: "error"
                    })
                });
            }
        })
    }

    const handleBusqueda = (event) => {
        setConsultando(true);
        clearTimeout(controladorTiempo); 
        controladorTiempo = setTimeout(() => handleBusqueda2(event.target.value), 100);
    }


    function handleBusqueda2(value){
        searchBuscador = value;
        cargarPedidos()
    }

    function rotuloPedido(datos){
        const input = document.getElementById('divToPrint');
        input.classList.remove('hidden');
        $("#destinatarioRotulo").html(datos.destinatario.toUpperCase()+" ("+datos.cedula+")");
        $("#direccionRotulo").html(datos.observacion.toUpperCase());
        $("#ciudadRotulo").html(datos.departamento.toUpperCase()+' - '+datos.ciudadName.toUpperCase());
        $("#telefonoRotulo").html('TELEFONO: '+datos.telefono.toUpperCase());
        $(".divMensajero").hide();
        if($("#transportadora-"+datos.id).val() == 4){
            $(".divMensajero").show();
        }
        $("#pedidoRotulo").html('PED:'+datos.referencia.toUpperCase()+" "+datos.observacion2.toUpperCase());

        html2canvas(input, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            // Cambiar a media carta horizontal
            const pdf = new jsPDF('l', 'pt', [612, 430]); // Media carta en puntos (5.5 x 8.5 pulgadas, pero en orientación horizontal)
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const padding = 2; // Padding de 2px

            const ratio = Math.min((pdfWidth - 2 * padding) / imgWidth, (pdfHeight - 2 * padding) / imgHeight);
            const width = imgWidth * ratio;
            const height = imgHeight * ratio;
    
            pdf.addImage(imgData, 'PNG', padding, padding, width, height);
            pdf.autoPrint();
            window.open(pdf.output('bloburl'), '_blank');
            input.classList.add('hidden');
        });
    }

    return (
        <>  
            <div id="divToPrint" className="hidden" style={{padding:'50px',width:'100%'}}>
                <div className='row' style={{height: '800px',marginTop: '20px',width:'100%'}}>
                    <h1>TRES SON UNO SAS</h1>
                    <div className='col-12' style={{border:'2px solid #333',height:'480px',width:'100%'}}>
                        <div className='row' style={{marginTop:'10px'}}>
                            <div className='col-3'>
                                <h3 style={{lineHeight:'60px'}}>
                                    REMITENTE
                                    <br></br>
                                    DIRECCIÓN
                                </h3>
                            </div>
                            <div className='col-9'>
                                <h3 style={{lineHeight:'60px',width:'100%'}}>
                                    <span style={{borderBottom:'2px dotted #333',width:'100%',display:'block'}}>TRES SON UNO S.A.S</span>
                                    <span style={{borderBottom:'2px dotted #333',width:'100%',display:'block'}}>CARRERA 7 # 5 - 58</span>
                                </h3>
                            </div>
                            <div className='col-3'>
                                <h3>
                                    CIUDAD
                                </h3>
                            </div>
                            <div className='col-5'>
                                <h3>
                                    YUMBO- VALLE
                                </h3>
                            </div>
                            <div className='col-4'>
                                <h3>
                                    TELEFONO: 3013277564
                                </h3>
                            </div>
                        </div>

                        <div className='row' style={{marginTop:'10px',borderTop:'2px solid #333'}}>
                            <div className='col-3'>
                                <h3 style={{lineHeight:'60px'}}>
                                    DESTINATARIO
                                    <br></br>
                                    DIRECCIÓN
                                </h3>
                            </div>
                            <div className='col-9'>
                                <h3 style={{lineHeight:'60px'}}>
                                    <span id='destinatarioRotulo' style={{borderBottom:'2px dotted #333',width:'100%',display:'block'}}>TRES SON UNO S.A.S</span>
                                    <span id='direccionRotulo' style={{borderBottom:'2px dotted #333',width:'100%',display:'block'}}>TRES SON UNO S.A.S</span>
                                </h3>
                            </div>
                            <div className='col-3'>
                                <h3>
                                    CIUDAD
                                </h3>
                            </div>
                            <div className='col-5' style={{borderBottom:'2px dotted #333'}}>
                                <h3 id='ciudadRotulo'>
                                    YUMBO- VALLE
                                </h3>
                            </div>
                            <div className='col-4' style={{borderBottom:'2px dotted #333'}}>
                                <h3 id='telefonoRotulo'>
                                    TELEFONO: 3013277564
                                </h3>
                            </div>
                            <div className='col-3'>
                                <h3 style={{lineHeight:'60px'}}>
                                    CONTENIDO
                                </h3>
                            </div>
                            <div className='col-9'>
                                <h3 id='pedidoRotulo' style={{lineHeight:'60px'}}>
                                    PED: 2024-1542
                                </h3>
                            </div>
                        </div>

                    </div>


                    <div className='col-2 divMensajero' style={{textAlign:'right'}}>
                        <h3>RECIBE:</h3>
                    </div>
                    <div className='col-6 divMensajero' >
                        <h3 style={{borderBottom:'2px dotted #333',marginTop:'40px'}}></h3>
                    </div>
                </div>
            </div>
            <div className="opacityOpen" style={{height:'105%',marginTop:'20px'}}>
                <div className="card" style={{height:'100%'}}>
                    <div className="card-body" style={{height:'100%'}}>
                        <div className="container testimonial-group divChat2" style={{padding:'0px'}}>
                            <div className="row">
                                <div className="col-8">
                                    <h1>Despacho</h1>
                                </div>
                                <div className="col-4">
                                    <select className="form-control" value={proceso} onChange={handleSelectChange}>
                                        <option value="1">Para Despachar</option>
                                        <option value="2">Despachados</option>
                                    </select>
                                </div>
                                <div className="col-12" style={{marginTop:'20px',marginBottom:'20PX'}}>
                                    <input type="text" onChange={handleBusqueda} style={{width:'50%',margin:'auto'}} className="form-control buscador" placeholder="Buscar" aria-label="Username" aria-describedby="basic-addon1"/>
                                </div>
                                <div className="col-12">
                                    <table className="table table-striped">
                                        <thead>
                                            <tr style={{background:"#e9e9e9"}}>
                                                <th scope="col"></th>
                                                <th scope="col" style={{textAlign:'center'}}>Referencia</th>
                                                <th scope="col" style={{textAlign:'center'}}>Guia</th>
                                                <th scope="col" style={{textAlign:'center'}}>Tipo de envio</th>
                                                <th scope="col" style={{textAlign:'center'}}>Ciudad</th>
                                                <th scope="col" style={{textAlign:'center'}}>Destinatario</th>
                                                <th scope="col" style={{textAlign:'center'}}>Observacion</th>
                                                <th scope="col" style={{textAlign:'center'}}>Transportadora</th>
                                                <th scope="col" style={{textAlign:'center'}}>Opciones</th>
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
                                                    pedidos.map((result, index) => (
                                                        <tr key={index}>
                                                            <th>{index+1}</th>
                                                            <td>{result.referencia}</td>
                                                            <td style={{textAlign:'center'}}>
                                                                Pendiente
                                                            </td>
                                                            <td style={{textAlign:'center'}}>
                                                                {result.tipoEnvio == 6 && (
                                                                    <>Contado</>
                                                                )}

                                                                {result.tipoEnvio == 7 && (
                                                                    <>Contra Entrega</>
                                                                )}

                                                                {result.tipoEnvio == 8 && (
                                                                    <>Recaudo</>
                                                                )}

                                                                {result.tipoEnvio == 4 && (
                                                                    <>Recoge En Tienda</>
                                                                )}

                                                            </td>
                                                            <td style={{textAlign:'center'}}>
                                                                {result.tipoEnvio != 4 && (
                                                                    <>
                                                                        {result.ciudadName}<br></br>{result.departamento}
                                                                    </>
                                                                )}
                                                            </td>
                                                            <td style={{textAlign:'center'}}>
                                                                {result.destinatario}
                                                            </td>
                                                            <td style={{textAlign:'center'}}>
                                                                {result.observacion}
                                                            </td>
                                                            <td style={{textAlign:'center'}}>
                                                                {result.tipoEnvio != 4 && (
                                                                    <select onChange={(e) => handleChangeTransportadora(index, e)} value={result.transportadora} id={`transportadora-${result.id}`} className='form-control'>
                                                                        <option value="1">TCC</option>
                                                                        <option value="2">Envia</option>
                                                                        <option value="3">Inter Rapidisimo</option>
                                                                        <option value="4">Mensajero</option>
                                                                        <option value="6">Otra Transportadora</option>
                                                                    </select>
                                                                )}
                                                            </td>
                                                            <td style={{textAlign:'center'}}>
                                                                <div style={{display:'inline-flex'}}>
                                                                    {result.tipoEnvio != 4 ? (
                                                                        <i className='bx bxs-truck' style={{margin:'0px 5px',fontSize:'25px',cursor:'pointer',color:'green'}} onClick={(e) => despacharPedido(result,result.id)}></i>
                                                                    ):(
                                                                        <i className='bx bxs-user-circle' style={{margin:'0px 5px',fontSize:'25px',cursor:'pointer',color:'green'}} onClick={(e) => pedidoRecogido(result.referencia,result.id)}></i>
                                                                    )}
                                                                    <i style={{margin:'0px 5px',fontSize:'25px',cursor:'pointer'}} className='bx bxs-printer' onClick={(e) => rotuloPedido(result)}></i>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
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
        </>
    )
}