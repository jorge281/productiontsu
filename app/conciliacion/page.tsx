"use client";

import React, { useEffect,useState } from 'react';
import { Modal } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import withReactContent from 'sweetalert2-react-content';
const $ = require('jquery');


let usuarioId = 1;
let cargoSite = 0;
let entidadFiltro = 0;
let tipoFiltro = 0;
let estadoFiltro = "2025-01";

export default function Home() {

    const [usuario, setUsuario] = useState({ 
        nombre: '',
        perfil: '',
        foto: '',
        user: ''
    });
    const [comprobanteEdit, setComprobanteEdit] = useState({
        usuarioPedido: '',
        usuarioAprobacion: ''
    });
    const [motivo, setMotivo] = useState('1');
    const [inputOtro, setInputOtro] = useState('');
    const [isImageDetal,setIsImageDetal] = useState(false);
    const [modalEditarInf, setmodalEditarInf] = useState(false);
    const [comprobantes,setComprobantes] = useState([]);
    const [consultando,setConsultado] = useState(true);
    const [resultGeneral,setResultGeneral] = useState({
        pendientes: 0,
        pendientesValor: 0,
        pendientesFacturas: 0,
        pendientesFacturasValor: 0,
        pendientesRecibos: 0,
        pendientesRecibosValor: 0,
        aprobados: 0,
        aprobadosValor: 0,
        aprobadosFacturas: 0,
        aprobadosFacturasValor: 0,
        aprobadosRecibos: 0,
        aprobadosRecibosValor: 0,
    })
    const [entidadesResult,setEntidadesResult] = useState([]);
    const [entidades,setEntidades] = useState([]);

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
                resultComprobantes();
                cargarEntidades();
            }
            
        }
    })  

    const formatFecha = (fechaISO) => {
        if (!fechaISO) {
            // Maneja el caso donde fechaISO es undefined, null o vacío
            return "";
        }
        const date = parseISO(fechaISO);
        if(date != "Invalid Date"){
            return format(date, "d 'de' MMMM 'del' yyyy", { locale: es });
        }
        return "";
    };

    const formatFechaHora = (fechaISO) => {
        if (!fechaISO) {
            // Maneja el caso donde fechaISO es undefined, null o vacío
            return "";
        }
        const date = parseISO(fechaISO);
        if(date != "Invalid Date"){
            const formattedDate = format(date, "d 'de' MMMM 'del' yyyy", { locale: es });
            const formattedTime = format(date, "hh:mm a");

            return `${formattedDate}\n${formattedTime}`;
        }
        return "";
    };


    //cargar los comporbantes
    async function dataComprobantes(){
        await axios.post(process.env.ENDPOINT_API+'/comprobantes/dataComprobantes',{ 
            entidad: entidadFiltro,
            tipo: tipoFiltro,
            estado: estadoFiltro,
            contabilidad: 1
        }).then(response => {  
            setConsultado(false);
            setComprobantes(response.data.comprobantes)
        }).catch(error => {
            console.log(error);
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (cargar comprobantes)",
                icon: "error"
            })
        });
    }

    //carga las entidades disponibles
    async function cargarEntidades(){
        await axios.post(process.env.ENDPOINT_API+'/comprobantes/entidadesBancarias').then(response => {
            setEntidades(response.data.entidades);
            dataComprobantes();
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
    //carga el resultado total de los comprobantes
    async function resultComprobantes(){
        await axios.post(process.env.ENDPOINT_API+'/comprobantes/resultGeneral').then(response => {
            setResultGeneral({
                pendientes: response.data.pendientes.cantidad,
                pendientesValor: response.data.pendientes.valor,
                pendientesFacturas: response.data.pendientes.facturas,
                pendientesFacturasValor: response.data.pendientes.facturasValor,
                pendientesRecibos: response.data.pendientes.recibos,
                pendientesRecibosValor: response.data.pendientes.recibosValor,
                aprobados: response.data.aprobados.cantidad,
                aprobadosValor: response.data.aprobados.valor,
                aprobadosFacturas: response.data.aprobados.facturas,
                aprobadosFacturasValor: response.data.aprobados.facturasValor,
                aprobadosRecibos: response.data.aprobados.recibos,
                aprobadosRecibosValor: response.data.aprobados.recibosValor
            });
            setEntidadesResult(response.data.entidades);
        }).catch(error => {
            console.log(error);
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (cargar result general)",
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

    function handleBuscador(){
        entidadFiltro = $("#entidadFiltro").val();
        tipoFiltro = $("#tipoFiltro").val();
        estadoFiltro = $("#estadoFiltro").val();
        setConsultado(true);
        dataComprobantes()
    }

    function cargarPendientes(bandera){
        setConsultado(true);
        $("#estadoFiltro").val(1)
        if(bandera == 0){
            $("#tipoFiltro").val(0)
        }
        if(bandera == 1){
            $("#tipoFiltro").val(1)
        }
        if(bandera == 2){
            $("#tipoFiltro").val(2)
        }
        $("#entidadFiltro").val(0)
        entidadFiltro = $("#entidadFiltro").val();
        tipoFiltro = $("#tipoFiltro").val();
        estadoFiltro = $("#estadoFiltro").val();
        dataComprobantes()
    }

    function cargarAprobados(bandera){
        setConsultado(true);
        $("#estadoFiltro").val(2)
        if(bandera == 0){
            $("#tipoFiltro").val(0)
        }
        if(bandera == 1){
            $("#tipoFiltro").val(1)
        }
        if(bandera == 2){
            $("#tipoFiltro").val(2)
        }
        $("#entidadFiltro").val(0)
        entidadFiltro = $("#entidadFiltro").val();
        tipoFiltro = $("#tipoFiltro").val();
        estadoFiltro = $("#estadoFiltro").val();
        dataComprobantes()
    }

    function cargarEntidad(bandera,entidad){
        setConsultado(true);
        $("#entidadFiltro").val(entidad);
        $("#tipoFiltro").val(0)
        if(bandera == 0){
            $("#estadoFiltro").val(0)
        }
        if(bandera == 1){
            $("#estadoFiltro").val(1)
        }
        if(bandera == 2){
            $("#estadoFiltro").val(2)
        }
        entidadFiltro = $("#entidadFiltro").val();
        tipoFiltro = $("#tipoFiltro").val();
        estadoFiltro = $("#estadoFiltro").val();
        dataComprobantes()
    }

    function cerrarModal(){
        setmodalEditarInf(false);
    }

    function denegar(data){
        setmodalEditarInf(false);
        const swalWithReact = withReactContent(Swal);

        swalWithReact.fire({
            title: "Denegar",
            html: (
                <div>
                    <p>
                        ¿Esta segur@ de denegar <b>{formattedPrice(data.valor)}</b> el <b>{formatFecha(data.fecha)}</b> en <b>{data.nameEntidad}</b>?
                    </p>
                    <label style={{marginBottom:'2px',marginTop:'20px'}}>Seleccione un motivo:</label>
                    <select id="motivo" className="form-control" onChange={handleMotivoChange}>
                        <option value="1">Fecha</option>
                        <option value="2">Valor</option>
                        <option value="0">Otro</option>
                    </select>
                    <div id="inputOtro" style={{marginTop:'10px',display:'none'}}>
                        <label style={{width:'100%',textAlign:'left',marginTop:'10px',marginBottom:'2px'}}>Motivo:</label>
                        <textarea className="form-control" id="motivoDenegar">

                        </textarea>
                    </div>
                </div>
            ),
            showCancelButton: true,
            confirmButtonText: "Si",
            cancelButtonText: "No",
            allowOutsideClick: false,
            preConfirm: () => {
                if ($("#motivo").val() == 0 && $("#motivoDenegar").val() == "") {
                    Swal.showValidationMessage('Debe ingresar un motivo');
                    return false;
                }
                return true;
            }
        }).then(async (result) => {
            let motivo = $("#motivo").val();
            let observacion = $("#motivoDenegar").val();
            if (result.isConfirmed) {
                const swalWithReact = withReactContent(Swal);
                swalWithReact.fire({
                    title: "Denegando",
                    text: "Por favor, espera un momento...",
                    icon: "info",
                    showConfirmButton: false, // Ocultar el botón de confirmación
                    allowOutsideClick: false // Evitar cerrar el SweetAlert haciendo clic fuera de él
                });

                await axios.post(process.env.ENDPOINT_API+'/comprobantes/denegar',{ 
                    id: data.id,
                    usuario: usuarioId,
                    tipo: data.tipo,
                    motivo: motivo,
                    observacionMotivo: observacion,
                    pedido: data.pedido
                }).then(response => { 

                    swalWithReact.fire({
                        title: "Denegado",
                        text: "Cambios Guardados",
                        icon: "success",
                        showConfirmButton: false, // Ocultar el botón de confirmación
                        timer: 2000 // Cerrar automáticamente después de 2 segundos
                    });

                    resultComprobantes();
                    dataComprobantes()

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
            }
        });
    }

    const handleMotivoChange = (event) => {
        $("#inputOtro").hide();
        if(event.target.value == 0){
            $("#inputOtro").show();
        };
    };

    const handleInputChange = (event) => {
        setInputOtro(event.target.value);
    };

    function aprobar(data){
        setmodalEditarInf(false);
        const swalWithReact = withReactContent(Swal);
        swalWithReact.fire({
            title: "Confirmación",
            html: "¿Esta segur@ de aprobar <b>"+formattedPrice(data.valor)+"</b> el <b>"+formatFecha(data.fecha)+"</b> en <b>"+data.nameEntidad+"</b>?",
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

                await axios.post(process.env.ENDPOINT_API+'/comprobantes/aprobar',{ 
                    id: data.id,
                    usuario: usuarioId,
                    tipo: data.tipo,
                    pedido: data.pedido
                }).then(response => { 

                    swalWithReact.fire({
                        title: "Aprobado",
                        text: "Cambios Guardados",
                        icon: "success",
                        showConfirmButton: false, // Ocultar el botón de confirmación
                        timer: 2000 // Cerrar automáticamente después de 2 segundos
                    });

                    resultComprobantes();
                    dataComprobantes()

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
            }
        })
    }

    function aprobarModal(data){
        setComprobanteEdit(data);
        const isImage = /\.(jfif|jpg|jpeg|png|gif)$/.test(data.ruta.toLowerCase());
        setIsImageDetal(isImage)
        setmodalEditarInf(true);
    }

    return (
        <>  
            <Modal show={modalEditarInf} className="modal-lg" onHide={cerrarModal}>
                <Modal.Header style={{borderBottom: '2px solid #ababab'}} closeButton>
                    <Modal.Title>Comprobante</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='row'>
                        <div className='col-8'>
                            {isImageDetal ? (
                                <img
                                    src={process.env.ENDPOINT_COMPROBANTES+comprobanteEdit.ruta}
                                    alt="preview"
                                    style={{width: 'auto',maxHeight:'70vh',margin:'auto'}}
                                />
                            ) : (
                                <iframe
                                    src={process.env.ENDPOINT_COMPROBANTES+comprobanteEdit.ruta}
                                    style={{width: 'auto',maxHeight:'70vh',margin:'auto'}}
                                ></iframe>
                            )}
                        </div>
                        <div className='col-4' style={{borderLeft:'2px solid #dfdfdf'}}>
                            <h4 >{formattedPrice(comprobanteEdit.valor)}</h4>
                            {comprobanteEdit.cantidad > 1 ? (
                                <span style={{background:'red',color:'white',padding:'0px 5px',borderRadius:'20px'}}>{comprobanteEdit.aprobados} apro. de {comprobanteEdit.cantidad}</span>
                            ):(
                                <span style={{background:'green',color:'white',padding:'0px 5px',borderRadius:'20px'}}>{comprobanteEdit.aprobados} apro. de {comprobanteEdit.cantidad}</span>
                            )}
                            <br></br>
                            {comprobanteEdit.nameEntidad}
                            <br></br>
                            {formatFecha(comprobanteEdit.fecha)}
                            <br></br>
                            <b>{comprobanteEdit.tipoLabel}</b>
                            <br></br>
                            <b>Ped: </b>{comprobanteEdit.pedido}
                            <br></br>
                            <b>Ase: </b>{comprobanteEdit.usuarioPedido.toUpperCase()}   
                            {comprobanteEdit.estado == 1 ? (
                                <div style={{textAlign:'right',marginTop:'10px'}}>
                                    <span style={{color:'white',background:'green',cursor:'pointer',padding:'2px 7px',borderRadius:'20px',marginRight:'10px'}} onClick={() => aprobar(comprobanteEdit)}>Aprobar</span>
                                    <span style={{color:'white',background:'red',cursor:'pointer',padding:'2px 7px',borderRadius:'20px'}} onClick={() => denegar(comprobanteEdit)}>Denegar</span>
                                </div>
                            ):(
                                <div style={{textAlign:'right',marginTop:'10px',borderTop:'2px solid #dfdfdf'}}>
                                    <b>{comprobanteEdit.usuarioAprobacion.toUpperCase()}</b>
                                    <br></br>
                                    {formatFechaHora(comprobanteEdit.fechaBanco).split('\n').map((line, index) => (
                                        <span style={{display:'block',width:'100%'}}>{line}</span>
                                    ))}
                                </div>
                            )}                                   
                        </div>
                    </div>
                </Modal.Body>
            </Modal>

            <div className="container-xxl flex-grow-1 containerP" style={{background:'white',height: '100VH',width: '100%',position: 'relative',left: '0px',top: '0px',overflow: 'hidden'}}>
                <div className='row' style={{height:'100%',width:'98%',margin:'auto'}}>
                    <div className='col-12' style={{maxHeight:'100%',overflow:'auto',padding:'40px',paddingLeft:'0px',fontSize:'12px'}}>
                        <div className="accordion confirmacionPedido2" id="accordionExample" style={{marginBottom:'20px'}}>
                            <div className="accordion-item" style={{borderRadius:'0px',paddingTop:'30px'}}>
                                <div className='row' style={{width:'100%',margin:'auto'}}>
                                    <div className='col-4'>
                                        <label>Entidad:</label>
                                        <select className='form-control' id="entidadFiltro" onChange={handleBuscador}>
                                            <option value="0">TODAS</option>
                                            {entidades.map((entidad, index) => {
                                                return (
                                                    <option value={entidad.id}>{entidad.entidad}</option>
                                                )
                                            })}
                                            
                                        </select>
                                    </div>
                                    <div className='col-4'>
                                        <label>Tipo:</label>
                                        <select className='form-control' id="tipoFiltro" onChange={handleBuscador}>
                                            <option value="0">TODOS</option>
                                            <option value="1">Facturas</option>
                                            <option value="2">Recibos</option>
                                        </select>
                                    </div>
                                    <div className='col-4'>
                                        <label>MES:</label>
                                        <select id="estadoFiltro" className='form-control' onChange={handleBuscador}>
                                            <option selected value="2025-01">Enero</option>
                                            <option value="2025-02">Febrero</option>
                                            <option value="2025-03">Marzo</option>
                                            <option value="2025-04">Abril</option>
                                        </select>
                                    </div>
                                    <div className='col-12' style={{marginTop:'20px'}}>
                                        <table className="table table-striped">
                                            <thead>
                                                <tr style={{background:"#e9e9e9"}}>
                                                    <th scope="col" style={{textAlign:'center'}}></th>
                                                    <th scope="col" style={{textAlign:'center'}}>Comprobante</th>
                                                    <th scope="col" style={{textAlign:'center'}}>Detalle</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {consultando ? (
                                                    <tr>
                                                        <td colSpan="3" style={{ textAlign: 'center' }}>Consultando...</td>
                                                    </tr>
                                                ) : (
                                                    
                                                    comprobantes.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="3" style={{ textAlign: 'center' }}>No se encontraron registros.</td>
                                                        </tr>
                                                    ) : (

                                                        comprobantes.map((comprobante, index) => {
                                                            const isImage = /\.(jfif|jpg|jpeg|png|gif)$/.test(comprobante.ruta.toLowerCase());
                                                            return (
                                                                <React.Fragment key={index}>
                                                                    <tr>
                                                                        <td style={{textAlign:'center'}}>{index+1}</td>
                                                                        <td style={{textAlign:'center'}} onClick={() => aprobarModal(comprobante)}>
                                                                            {isImage ? (
                                                                                <img
                                                                                    src={'https://www.crmtsu.com:444/static/comprobantes/'+comprobante.ruta}
                                                                                    alt="preview"
                                                                                    style={{maxWidth: '300px', height: 'auto',maxHeight:'400px',margin:'auto'}}
                                                                                />
                                                                            ) : (
                                                                                <iframe
                                                                                    src={'https://www.crmtsu.com:444/static/comprobantes/'+comprobante.ruta}
                                                                                    style={{maxWidth: '300px', height: 'auto',maxHeight:'400px',margin:'auto'}}
                                                                                ></iframe>
                                                                            )}
                                                                        </td>
                                                                        <td style={{textAlign:'center'}}>
                                                                            {formattedPrice(comprobante.valor)}
                                                                            <br></br>
                                                                            {comprobante.cantidad > 1 ? (
                                                                                <span style={{background:'red',color:'white',padding:'0px 5px',borderRadius:'20px'}}>{comprobante.aprobados} apro. de {comprobante.cantidad}</span>
                                                                            ):(
                                                                                <span style={{background:'green',color:'white',padding:'0px 5px',borderRadius:'20px'}}>{comprobante.aprobados} apro. de {comprobante.cantidad}</span>
                                                                            )}
                                                                            <br></br>
                                                                            {comprobante.nameEntidad}
                                                                            <br></br>
                                                                            {formatFecha(comprobante.fecha)}
                                                                            <br></br>
                                                                            <b>{comprobante.tipoLabel} : {comprobante.siigo}</b>
                                                                            <br></br>
                                                                            {comprobante.abonosCartera ? (
                                                                                <>
                                                                                {comprobante.abonosCartera.map((abono, index) => (
                                                                                    <React.Fragment key={index}>
                                                                                        <b>- Ped:</b> {abono.pedido} - {formattedPrice(abono.valor)}
                                                                                        <br></br>
                                                                                        <b>- Ase:</b> {abono.name.toUpperCase()}
                                                                                        <div style={{width:'100%',height:'2px',background:'#e9e9e9'}}></div>
                                                                                    </React.Fragment>
                                                                                ))}
                                                                                </>
                                                                            ):( 
                                                                                <>
                                                                                    <b>Ped: </b>{comprobante.pedido}
                                                                                </>
                                                                            )}
                                                                            
                                                                            <br></br>
                                                                            {comprobante.abonosCartera ? (
                                                                                <>
                                                                                    
                                                                                </>
                                                                            ):( 
                                                                                <>
                                                                                    <b>Ase: </b>{comprobante.usuarioPedido.toUpperCase()}
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
                        </div>  
                    </div>
                </div>
            </div>
        </>
    )
}
