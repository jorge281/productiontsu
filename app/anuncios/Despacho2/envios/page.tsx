
"use client";

import Swal                          from 'sweetalert2';
import axios                         from 'axios';
import Cookies                       from 'js-cookie';
import withReactContent              from 'sweetalert2-react-content';
import React, { useEffect,useState } from 'react';
import { format, parseISO }          from 'date-fns';
import { Modal }                     from 'react-bootstrap';
import { es }                        from 'date-fns/locale';

import '../comprobantes/style.css';
import './style.css';


const $ = require('jquery');

let usuarioId = 1;
let cargoSite = 0;
let offsetPagina = 0;
let limitPagina = 10;
let controladorTiempo = "";
let nombreUsuario = "";
let rastreoGuias = [];
let resultRastreoTCC = [];

export default function Home() {

    const [consultando,setConsultado] = useState(true);
    const [pedidos,setPedidos] = useState([]);
    const [resultRecaudo,setResultRecaudo] = useState({
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
    const [resultOtrosEnvios,setResultOtrosEnvios] = useState([])
    const [transportadoras,setTransportadoras] = useState([]);
    const [modalSeguimiento,setModalSeguimiento] = useState(false);
    const [modalNovedades,setModalNovedades] = useState(false);
    const [novedadesASesor,setNovedadesAsesor] = useState([]);
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
                usuarioId = 19;

                $(".navbar").hide();

                cargoSite = 1;
                cargarTransportadoras();
            }
        }
    })

    async function cargarTransportadoras() {
        await axios.get(process.env.ENDPOINT_API+'/despachos/transportadoras').then(response => { 
            if(response.data.bandera == 1){
                setTransportadoras(response.data.transportadoras)
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
        await axios.post(process.env.ENDPOINT_API+'/despachos/resultdespachoAsesor',{ 
            usuario: usuarioId
        }).then(response => { 
            if(response.data.bandera == 1){
                setResultOtrosEnvios(response.data.transportadoras)
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
            console.log(response.data);
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

    function cargarDataFiltro(){
        offsetPagina = 0;
        cargarData();
    }

    async function cargarData(){
        await axios.post(process.env.ENDPOINT_API+'/despachos/despachoAsesor',{ 
            transportadora: $("#transportadora").val(),
            tipoEnvio: $("#tipoEnvio").val(),
            estado: $("#estadoEnvio").val(),
            search: $("#buscadorInput").val(),
            offset: offsetPagina,
            limit: limitPagina,
            usuario: usuarioId,
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
                if(offsetPagina == 0){
                    setPedidos(response.data.pedidos)
                }else{
                    setPedidos((prevPedidos) => [...prevPedidos, ...response.data.pedidos]);
                }
                let consultarWsTCC = false;
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

                if(consultarWsTCC){
                    seguimientoGuiasTCC();
                }
               
                if(response.data.pedidos.length == limitPagina){
                    offsetPagina += limitPagina;
                    cargarData()
                }
            }
            console.log(response.data);
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
                
            }else{
                const swalWithReact = withReactContent(Swal);
                // Manejar el error aquí
                withReactContent(Swal).fire({
                    title: "Error",
                    text: "Comunica con soporte (cargar seguimiento TCC)",
                    icon: "error"
                })
            }
        }).catch(error => {
            console.log(error);
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (cargar seguimiento TCC)",
                icon: "error"
            })
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

    const formattedPrice = (value) => {
        if (typeof value !== 'number') {
            value = Number(value);
        }
        return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    function cerrarModal(){
        setModalSeguimiento(false);
        setModalNovedades(false);
    }

    function trasabilidadEnvio(pedido){
        
        $(".resultPedidoModal").html("")

        setModalSeguimiento(true);
        setTimeout(() => {

            let div = "<h3 style='margin-bottom:0px;text-align:center;width:100%'>"+pedido.referencia+"</h3>"
            div += "<div style='text-align:center;border-right:3px solid #e9e9e9' class='col-8'>";
            div += "<p style='text-align:left;margin-top:20px;line-height:14px'>"
            div += "<b>Destinatario:</b> "+pedido.destinatario
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
            div += "<b>Destinatario:</b> "+pedido.destinatario
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

    //buscador de datos de facturacion
    const handleBuscador = (event) => {
        clearTimeout(controladorTiempo); 
        controladorTiempo = setTimeout(() => cargarDataFiltro(), 100);
    }


    async function solucionarNovedad(id){
        $("#alertNovedad-"+id).hide().html("Debes ingresar un comentario");
        if($("#observacion-"+id).val().length == 0){
            $("#alertNovedad-"+id).show();
            return 0
        }else{
            await axios.post(process.env.ENDPOINT_API+'/despachos/solucionNovedad',{ 
                novedad: id,
                observacion: $("#observacion-"+id).val(),
                solucion: $("#opcionNovedad-"+id).val(),
                usuario: usuarioId
            }).then(response => { 
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
                        ? { ...novedad, estado: 2,solucion:$("#opcionNovedad-"+id+" option:selected").text(),observacionSolucion:$("#observacion-"+id).val(),asesor:nombreUsuario,fechaSolucion:fechaSubida} // Cambiamos el estado si id es 1
                        : novedad // Si no es el id 1, lo dejamos igual
                    )
                );
                offsetPagina = 0;
                cargarData()
                cargarResult();
            }).catch(error => {
                $("#alertNovedad-"+id).show().html("ERROR - Comunica con soporte (Reportar solucion)");
            }); 
        }
    }

    async function envioEntregado(pedido){
        const swalWithReact = withReactContent(Swal);
        swalWithReact.fire({
            title: "Confirmación",
            html: "¿Esta segur@ que el pedido "+pedido.referencia+" fue entregado?",
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

                await axios.post(process.env.ENDPOINT_API+'/despachos/pedidoEntregado',{ 
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

    return <>
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
                                console.log(novedad); // Verificar si está recorriendo correctamente
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
                        <div className="card-body">
                            <div className="d-flex align-items-start align-items-sm-center">
                                <div className='row' style={{width:'100%',margin:'auto',marginTop:'20px'}}>
                                    <div className='col-12' style={{marginBottom:'20px'}}>
                                        <input id="buscadorInput" onChange={handleBuscador} type='text' style={{width:'80%',margin:'auto',textAlign:'center'}} className='form-control' placeholder='Buscar'></input>
                                    </div>
                                    <div style={{marginTop:'10px'}} className='col-12 col-md-4'>
                                        <label>Transportadora:</label>
                                        <select id="transportadora" onChange={() => cargarDataFiltro()} className='form-control'>
                                            <option value="0">TODAS</option>
                                            {transportadoras.map((transportadora,index) => {
                                                return (
                                                    <>
                                                        <option value={transportadora.id}>{transportadora.nombre}</option>
                                                    </>
                                                )
                                            })}
                                        </select>
                                    </div>
                                    <div style={{marginTop:'10px'}} className='col-12 col-md-4'>
                                        <label>Tipo:</label>
                                        <select id="tipoEnvio" onChange={() => cargarDataFiltro()} className='form-control'>
                                            <option value="0">TODOS</option>
                                            <option value="1">Contado</option>
                                            <option value="2">Conta Entrega</option>
                                            <option value="3">Recaudo</option>
                                        </select>
                                    </div>
                                    <div style={{marginTop:'10px'}} className='col-12 col-md-4'>
                                        <label>Estado:</label>
                                        <select id="estadoEnvio" onChange={() => cargarDataFiltro()} className='form-control'>
                                            <option value="3">TODOS</option>
                                            <option value="0">Viajando</option>
                                            <option value="2">En Novedad</option>
                                            <option value="1">Entregado</option>
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

                                                                return (
                                                                    <React.Fragment key={index}>
                                                                        <tr style={{
                                                                            backgroundColor: 
                                                                            pedido.estadoDespacho == 0 && pedido.novedad == 1 && novedadPendiente == 1
                                                                            ? '#ffa3a3' // Rojo claro
                                                                            : pedido.estadoDespacho == 0 && pedido.novedad == 1 && novedadPendiente == 0
                                                                                ? '#ffce73' // Naranja
                                                                                : pedido.estadoDespacho == 0 && diferenciaDiasSalida > 4 
                                                                                ? '#a9ffa3' // Amarillo claro
                                                                                : 'none' // Sin color
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
                                                                                        {pedido.novedades.map((novedad, index) => {
                                                                                            if(novedad.estado == 1){
                                                                                                novedadPendiente += 1;
                                                                                            }else{
                                                                                                novedadSolucionada += 1;
                                                                                            }
                                                                                        })}
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
                <div className='col-3' style={{maxHeight:'100vh',overflow:'auto',background:'#f5f5f5',paddingTop:'40px',boxShadow:'0px 0px 18px 0px #bdbdbdbf'}}>
                    <label style={{background:'#e9e9e9',width:'90%',padding:'10px',textAlign:'center',marginLeft:'5%'}}>RECAUDOS</label>
                    <div className='row' style={{width:'90%',border:'2px solid #e9e9e9',padding:'10px 0px',marginLeft:'5%',fontSize:'12px'}}>
                        <div className='col-7'>
                            <span style={{cursor:'pointer',marginRight:'3px'}}>-Viajando</span>({resultRecaudo.cantidadViajando})
                            <br></br>
                            {resultRecaudo.prioridadViajando > 0 && (
                                <>
                                    <span style={{color:'red',marginLeft:'19px',fontWeight:'500'}}>{resultRecaudo.prioridadViajando} Prioritarios</span>
                                    <br></br>
                                </>
                            )}
                        </div>
                        <div className='col-4' style={{textAlign:'right',paddingRight:'0px'}}>
                            <span style={{cursor:'pointer'}}>{formattedPrice(resultRecaudo.valorViajando)}</span>
                            <br></br>
                        </div>
                        <div className='col-12' style={{marginTop:'5px',marginBottom:'5px'}}>
                            <div style={{height:'1px',width:'100%',borderBottom:'1px dotted #c1c1c1'}}></div>
                        </div>

                        <div className='col-7'>
                            <span style={{cursor:'pointer',marginRight:'3px'}}>-Proc. de entrega</span>({resultRecaudo.cantidadProcesoEntrega})
                            <br></br>
                            {resultRecaudo.prioridadProcesoEntrega > 0 && (
                                <>
                                    <span style={{color:'red',marginLeft:'19px',fontWeight:'500'}}>{resultRecaudo.prioridadProcesoEntrega} Prioritarios</span>
                                    <br></br>
                                </>
                            )}
                        </div>
                        <div className='col-4' style={{textAlign:'right',paddingRight:'0px'}}>
                            <span style={{cursor:'pointer'}}>{formattedPrice(resultRecaudo.valorProcesoEntrega)}</span>
                            <br></br>
                        </div>
                        <div className='col-12' style={{marginTop:'5px',marginBottom:'5px'}}>
                            <div style={{height:'1px',width:'100%',borderBottom:'1px dotted #c1c1c1'}}></div>
                        </div>


                        <div className='col-7'>
                            <span style={{cursor:'pointer',marginRight:'3px'}}>-En Novedad</span>({resultRecaudo.cantidadNovedad})
                            <br></br>
                            {resultRecaudo.prioridadNovedad > 0 && (
                                <>
                                    <span style={{color:'red',marginLeft:'19px',fontWeight:'500'}}>{resultRecaudo.prioridadNovedad} Prioritarios</span>
                                    <br></br>
                                </>
                            )}
                        </div>
                        <div className='col-4' style={{textAlign:'right',paddingRight:'0px'}}>
                            <span style={{cursor:'pointer'}}>{formattedPrice(resultRecaudo.valorNovedad)}</span>
                            <br></br>
                        </div>
                        <div className='col-12' style={{marginTop:'5px',marginBottom:'5px'}}>
                            <div style={{height:'1px',width:'100%',borderBottom:'1px dotted #c1c1c1'}}></div>
                        </div>


                        <div className='col-7'>
                            <span style={{cursor:'pointer',marginRight:'3px'}}>-Entregado</span>({resultRecaudo.cantidadEntregado})
                            <br></br>
                        </div>
                        <div className='col-4' style={{textAlign:'right',paddingRight:'0px'}}>
                            <span style={{cursor:'pointer'}}>{formattedPrice(resultRecaudo.valorEntregado)}</span>
                            <br></br>
                        </div>
                        <div className='col-12' style={{marginTop:'5px',marginBottom:'5px'}}>
                            <div style={{height:'1px',width:'100%',borderBottom:'1px solid #c1c1c1'}}></div>
                        </div>


                        <div className='col-7'>
                            <span style={{cursor:'pointer',color: '#758693',fontWeight:'bold'}}>{resultRecaudo.cantidad} Paquetes</span>
                            <br></br>
                        </div>
                        <div className='col-4' style={{textAlign:'right',paddingRight:'0px'}}>
                            <span style={{cursor:'pointer',color: '#758693',fontWeight:'bold'}}>{formattedPrice(resultRecaudo.valor)}</span>
                            <br></br>
                        </div>
                    </div>
                            
                    {resultOtrosEnvios.map((transportadora,index) => {
                        return (
                            <>
                                <div style={{marginTop:'10px'}}>
                                    <label style={{background:'#e9e9e9',width:'90%',padding:'10px',textAlign:'center',marginLeft:'5%'}}>{transportadora.nombre}</label>
                                </div>
                                <div className='row' style={{width:'90%',border:'2px solid #e9e9e9',padding:'10px 0px',marginLeft:'5%',fontSize:'12px'}}>
                                    <div className='col-7'>
                                        <span style={{cursor:'pointer',marginRight:'3px'}}>-Viajando</span>
                                        <br></br>
                                        {transportadora.prioridadViajando > 0 && (
                                            <>
                                                <span style={{color:'red',marginLeft:'19px',fontWeight:'500'}}>{transportadora.prioridadViajando} Prioritarios</span>
                                                <br></br>
                                            </>
                                        )}
                                    </div>
                                    <div className='col-4' style={{textAlign:'right',paddingRight:'0px'}}>
                                        <span>{transportadora.cantidadViajando}</span>
                                    </div>
                                    <div className='col-12' style={{marginTop:'5px',marginBottom:'5px'}}>
                                        <div style={{height:'1px',width:'100%',borderBottom:'1px dotted #c1c1c1'}}></div>
                                    </div>
                                    {transportadora.api == 0 ? (
                                        <>
                                            <div className='col-7'>
                                                <span style={{cursor:'pointer',marginRight:'3px'}}>-En Novedad</span>
                                                <br></br>
                                                {transportadora.prioridadNovedad > 0 && (
                                                    <>
                                                        <span style={{color:'red',marginLeft:'19px',fontWeight:'500'}}>{transportadora.prioridadNovedad} Prioritarios</span>
                                                        <br></br>
                                                    </>
                                                )}
                                            </div>
                                            <div className='col-4' style={{textAlign:'right',paddingRight:'0px'}}>
                                                <span>{transportadora.cantidadNovedad}</span>
                                            </div>
                                            <div className='col-12' style={{marginTop:'5px',marginBottom:'5px'}}>
                                                <div style={{height:'1px',width:'100%',borderBottom:'1px dotted #c1c1c1'}}></div>
                                            </div>


                                            <div className='col-7'>
                                                <span style={{cursor:'pointer',marginRight:'3px'}}>-Entregado</span>
                                                <br></br>
                                            </div>
                                            <div className='col-4' style={{textAlign:'right',paddingRight:'0px'}}>
                                                <span>{transportadora.cantidadEntregado}</span>
                                            </div>
                                            <div className='col-12' style={{marginTop:'5px',marginBottom:'5px'}}>
                                                <div style={{height:'1px',width:'100%',borderBottom:'1px solid #c1c1c1'}}></div>
                                            </div>
                                        </>
                                    ):(
                                        <>
                                            <div className='col-7'>
                                                <span style={{cursor:'pointer',marginRight:'3px'}}>-Proc. de entrega</span>
                                                <br></br>
                                                {transportadora.prioridadProcesoEntrega > 0 && (
                                                    <>
                                                        <span style={{color:'red',marginLeft:'19px',fontWeight:'500'}}>{transportadora.prioridadProcesoEntrega} Prioritarios</span>
                                                        <br></br>
                                                    </>
                                                )}
                                            </div>
                                            <div className='col-4' style={{textAlign:'right',paddingRight:'0px'}}>
                                                <span>{transportadora.cantidadProcesoEntrega}</span>
                                            </div>
                                            <div className='col-12' style={{marginTop:'5px',marginBottom:'5px'}}>
                                                <div style={{height:'1px',width:'100%',borderBottom:'1px dotted #c1c1c1'}}></div>
                                            </div>


                                            <div className='col-7'>
                                                <span style={{cursor:'pointer',marginRight:'3px'}}>-En Novedad</span>
                                                <br></br>
                                                {transportadora.prioridadNovedad > 0 && (
                                                    <>
                                                        <span style={{color:'red',marginLeft:'19px',fontWeight:'500'}}>{transportadora.prioridadNovedad} Prioritarios</span>
                                                        <br></br>
                                                    </>
                                                )}
                                            </div>
                                            <div className='col-4' style={{textAlign:'right',paddingRight:'0px'}}>
                                                <span>{transportadora.cantidadNovedad}</span>
                                            </div>
                                            <div className='col-12' style={{marginTop:'5px',marginBottom:'5px'}}>
                                                <div style={{height:'1px',width:'100%',borderBottom:'1px dotted #c1c1c1'}}></div>
                                            </div>


                                            <div className='col-7'>
                                                <span style={{cursor:'pointer',marginRight:'3px'}}>-Entregado</span>
                                                <br></br>
                                            </div>
                                            <div className='col-4' style={{textAlign:'right',paddingRight:'0px'}}>
                                                <span>{transportadora.cantidadEntregado}</span>
                                            </div>
                                            <div className='col-12' style={{marginTop:'5px',marginBottom:'5px'}}>
                                                <div style={{height:'1px',width:'100%',borderBottom:'1px solid #c1c1c1'}}></div>
                                            </div>

                                        </>
                                    )}
                                    <div className='col-12' style={{textAlign:'left'}}>
                                        <span style={{cursor:'pointer',color: '#758693',fontWeight:'bold'}}>{transportadora.cantidad} Paquetes</span>
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