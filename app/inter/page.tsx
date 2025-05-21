"use client";

import './style.css';
import axios from 'axios';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';
import Barcode from 'react-barcode';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import withReactContent from 'sweetalert2-react-content';
import { Modal, Button, Table } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import React, { useEffect, useState } from 'react';

let cargoSite = false,
    controladorTiempo2 = "",
    banderaEntro = true,
    fechaDesde2 = new Date(),
    fechaHasta2 = new Date(),
    usuarioId = 0,
    estadosEnvios = [
        { codigo: "90", nombre: 'Guia Relacionada', bandera: true, contador: 0 },
        { codigo: "500", nombre: 'Viajando', bandera: true, contador: 0 },
        { codigo: "501", nombre: 'En Novedad', bandera: true, contador: 0 },
        { codigo: "5000", nombre: 'En Oficina', bandera: true, contador: 0 },
        { codigo: "3000", nombre: 'Entregado al destinatario', bandera: true, contador: 0 }
    ],
    resultGeneral = {
        devoluciones: 0,
        porcentajeEntregas: 0,
        tiempoEntrega: 0
    },
    limit = 10,
    offset = 0,
    fechasRango = "";

export default function Home() {


    const [consultandoRotulos, setConsultadoRotulos] = useState(true);
    const [dataRecordatorios, setDataRecordatorios] = useState([]);
    const [resumenExcel, setResumenExcel] = useState([]);
    const [consultaModalTrasabilidad, setConsultaModalTrasabilidad] = useState(1);
    const [banderaValidacion, setBanderaValidacion] = useState(false);
    const [contAlertas, setContAlertas] = useState(0);
    const [alertas, setAlertas] = useState([]);
    const [recordatorios, setRecordatorios] = useState([]);
    const [contRecordatorios, setContRecordatorios] = useState(0);
    const [banderaConsultaAlerta, setBanderaConsultaAlerta] = useState(true);
    const [totalPedidos, setTotalPedidos] = useState(0);
    const [search, setSearch] = useState('');
    const [dataGeneral, setDataGeneral] = useState(resultGeneral);
    const [pedidos, setPedidos] = useState([]);
    const [pedidosTrasabilidad, setPedidosTrasabilidad] = useState([]);
    const [filtroConsulta, setFiltroConsulta] = useState(true);
    const [cargaMas, setCargaMas] = useState(false);
    const [modalAdmitir, setModalAdmitir] = useState(false);
    const [pedidoInf, setPedidoInf] = useState({});
    const [dataTrasabilidad, setDataTrasabilidad] = useState([]);
    const [consultaDias, setConsultaDias] = useState(true);
    const [resumenDiario, setResumenDiario] = useState([]);
    const [banderaRelacion, setBanderaRelacion] = useState(false);
    const [consultaTrasabilidad, setConsultaTrasabilidad] = useState(false);
    const [modalFiltro, setModalFiltro] = useState(false);
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [usuario, setUsuario] = useState({
        nombre: '',
        perfil: '',
        foto: '',
        user: ''
    });
    const [estadosConsulta, setEstadosConsulta] = useState(estadosEnvios);
    const deepCopy = (arr) => arr.map(obj => ({ ...obj }));
    const [estadoTemporal, setEstadoTemporal] = useState(deepCopy(estadosEnvios));
    const [showModal, setShowModal] = useState(false);
    const [jsonData, setJsonData] = useState([]);
    const [resumenPorEstado, setResumenPorEstado] = useState([]);
    const [mostrarDetalle, setMostrarDetalle] = useState({
        recibos: false,
        anomalias: false,
        sinReportar: false,
        noExisten: false,
        sinConfirmar: false,
    });

    const [codigo, setCodigo] = useState('');
    const [capturando, setCapturando] = useState(false);
    let buffer = '';
    useEffect(() => {
        const handleKeyDown = (e) => {
          if (!capturando) {
            setCapturando(true);
            buffer = '';
          }
    
          if (e.key === 'Enter') {
            setCodigo(buffer);
            console.log(buffer);
            buffer = '';
            setCapturando(false);
          } else {
            buffer += e.key;
          }
        };
    
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
      }, []);

      
    const toggleDetalle = (key) => {
        setMostrarDetalle(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };


    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(sheet, { range: 14 }); // desde la fila 13
            console.log(json);
            const clean = json.filter(row => row["Número de guía"] && row["Número de guía"].toString().trim() !== "").map(row => ({
                fechaEnvio: row["Fecha de envío"],
                guia: row["Número de guía"]?.toString().trim(),
                estado: row["Estado"]?.trim(),
                cuenta: row["Número de cuenta"] !== "N/A" ? row["Número de cuenta"]?.trim() : null,
                titular: row["Nombre titular"]?.trim() || null,
                valor: Number(row["Valor"]) || 0
            }));
            const resumenPorEstado2 = clean.reduce((acc, item) => {
                const estado = item.estado || "Sin estado";
                acc[estado] = acc[estado] || { total: 0, cantidad: 0 };
                acc[estado].total += item.valor;
                acc[estado].cantidad += 1;
                return acc;
            }, {});
            setBanderaValidacion(false);
            setResumenPorEstado(resumenPorEstado2);
            validarGuia(clean)

            setJsonData(clean); // Aquí tienes los datos para validar con la BD
        };
        reader.readAsArrayBuffer(file);
    };

    async function validarGuia(guias) {


        await axios.post(process.env.ENDPOINT_API + '/despachos/validarGuiasInter', {
            transportadora: 9,
            guias: guias
        }).then(response => {
            console.log(response.data.result);
            setResumenExcel(response.data.result);
            setBanderaValidacion(true);
            /*setPedidos(response.data.datos);
            setConsultadoRotulos(false);
            if ($("#estadoRotulado").val() == 2) {
                setBanderaRelacion(true);
            } else {
                setBanderaRelacion(false);
            }*/
        }).catch(error => {
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (validar guia)",
                icon: "error"
            })
        })
    }


    useEffect(() => {
        if (cargoSite == false) {
            cargoSite = true;
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
            }

            if (filtroConsulta) {
                cargarDatosRotulos();
                cargarResumenDiario();
            }
        }

        if (modalAdmitir || modalFiltro) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        // Limpieza por si el componente se desmonta
        return () => {
            document.body.style.overflow = 'auto';
        };

    }, [modalAdmitir, modalFiltro])

    useEffect(() => {
        console.log("hola llego")
        if (estadosConsulta && consultaTrasabilidad) {
            if (banderaEntro) {
                clearTimeout(controladorTiempo2);
                banderaEntro = false
                offset = 0;
                setCargaMas(false);
                if ($("#desdeFiltro").val()) {
                    fechaDesde2 = $("#desdeFiltro").val()
                    fechaHasta2 = $("#hastaFiltro").val()
                }

                setModalFiltro(false);
                cargarEnvios();
            }
        } else {
            banderaEntro = true;
        }
    }, [estadosConsulta, consultaTrasabilidad]);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (banderaEntro) {
                banderaEntro = false;
                clearTimeout(controladorTiempo2);
                console.log("Llamando cargarEnvios con:", search);
                offset = 0;
                setCargaMas(false);
                cargarEnvios();
            }
        }, 300); // 300 ms de espera después de que el usuario deja de escribir

        return () => clearTimeout(delayDebounce); // limpia el timeout si el usuario sigue escribiendo
    }, [search]);

    function consultaSearch() {

    }

    async function cargarResumenDiario() {
        setConsultaDias(true);
        await axios.post(process.env.ENDPOINT_API + '/despachos/resumenDias', {
            transportadora: 9
        }).then(response => {
            resultGeneral.devoluciones = response.data.devoluciones.length
            resultGeneral.porcentajeEntregas = response.data.porcentajeEntrega[0]['porcentaje_entregados']
            resultGeneral.tiempoEntrega = response.data.diaPromedio[0]['promedio_dias']
            resultGeneral.saldoPendiete = 0;
            resultGeneral.paquetesPendientes = 0;
            for (let i = 0; i < response.data.pendientes.length; i++) {
                if (response.data.pendientes[i].saldo > 0) {
                    resultGeneral.saldoPendiete += response.data.pendientes[i].saldo
                    resultGeneral.paquetesPendientes += 1;
                }
            }

            resultGeneral.saldoDisponible = 0;
            resultGeneral.paquetesDisponible = 0;
            for (let i = 0; i < response.data.disponibles.length; i++) {
                if (response.data.disponibles[i].saldo > 0) {
                    resultGeneral.saldoDisponible += response.data.disponibles[i].saldo
                    resultGeneral.paquetesDisponible += 1;
                }
            }
            setContRecordatorios(response.data.recordatorios.length);
            setRecordatorios(response.data.recordatorios);
            setDataGeneral(resultGeneral);
            setContAlertas(response.data.alertas.length);
            setAlertas(response.data.alertas);
            if (response.data.resumen.length > 0) {
                fechasRango = response.data.resumen.map(item => item.dia.split('T')[0])
                    .join(', ');
                fechaDesde2 = fechasRango.split(', ')[0]
                fechaHasta2 = fechasRango.split(', ')[fechasRango.split(', ').length - 1]
                setFechaDesde(fechasRango.split(', ')[0]);
                setFechaHasta(fechasRango.split(', ')[fechasRango.split(', ').length - 1]);
            }
            const nuevaResumen = response.data.resumen.map(item => ({
                ...item,
                fecha: formatearFechaCorta(item.dia)
            }));

            setResumenDiario(nuevaResumen);
            setConsultaDias(false);
        }).catch(error => {
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (cargar dias)",
                icon: "error"
            })
        })
    }

    async function cargarDatosRotulos() {
        setPedidos([]);
        setConsultadoRotulos(true);
        await axios.post(process.env.ENDPOINT_API + '/despachos/guiasRotular', {
            estado: $("#estadoRotulado").val()
        }).then(response => {
            console.log(response.data.datos);
            setPedidos(response.data.datos);
            setConsultadoRotulos(false);
            if ($("#estadoRotulado").val() == 2) {
                setBanderaRelacion(true);
            } else {
                setBanderaRelacion(false);
            }
        }).catch(error => {
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (cargar pedidos)",
                icon: "error"
            })
        })
    }

    const formattedPrice = (value) => {
        if (typeof value !== 'number') {
            value = Number(value);
        }
        return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    function formatearNumeroCelular2(numero) {
        return `${numero.replace(/^(\d{2})(\d{3})(\d{7})$/, "$1 $2 $3")}`
    }

    function remplazoEnvio(pedido) {
        const swalWithReact = withReactContent(Swal);
        let nuevaGuia = ""
        swalWithReact.fire({
            title: "Admitido",
            html: (
                <div>
                    <p>¿Estás segur@ de remplazar la guía <strong>{pedido.guia}</strong>?</p>
                    <input
                        id="nuevaGuia"
                        className="swal2-input"
                        placeholder="Nueva guía"
                        autoComplete="off"
                    />
                </div>
            ),
            showCancelButton: true,
            confirmButtonText: "Sí",
            cancelButtonText: "No",
            preConfirm: () => {
                nuevaGuia = document.getElementById("nuevaGuia").value.trim();
                if (!nuevaGuia) {
                    Swal.showValidationMessage("Debes ingresar la nueva guía");
                }
                return nuevaGuia;
            },
            allowOutsideClick: () => !Swal.isLoading()
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
                    guiaNueva: nuevaGuia,
                    estado: "Guia remplazada",
                    codigo: "90"
                }).then(response => {

                    cargarDatosRotulos();
                    setPedidoInf(prev => ({
                        ...prev,
                        codigoEstado: '90'
                    }));
                    cargarTrasabilidad(pedido.guia);

                    withReactContent(Swal).fire({
                        title: "Registrado",
                        text: "Trasabilidad reportada",
                        icon: "success",
                        showConfirmButton: false, // Ocultar el botón de confirmación
                        timer: 2000 // Cerrar automáticamente después de 2 segundos
                    });

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

    function reportarRecibos() {
        const swalWithReact = withReactContent(Swal);
        swalWithReact.fire({
            title: "Reportar recibos",

            html: "¿Esta segur@ de reportar " + resumenExcel.recibos?.filter(row => row.recibo === 1).length + " para hacer recibos?",
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

                await axios.post(process.env.ENDPOINT_API + '/despachos/reportarParaRecibos', {
                    guias: resumenExcel.recibos?.filter(row => row.recibo === 1),
                    usuario: usuarioId
                }).then(response => {

                    setJsonData([]);
                    setShowModal(false);
                    setResumenPorEstado([]);
                    withReactContent(Swal).fire({
                        title: "Registrado",
                        text: "Guias reportadas para recibos",
                        icon: "success",
                        showConfirmButton: false, // Ocultar el botón de confirmación
                        timer: 2000 // Cerrar automáticamente después de 2 segundos
                    });

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

    function cancelarEnvio(pedido) {
        const swalWithReact = withReactContent(Swal);
        swalWithReact.fire({
            title: "Admitido",
            html: "¿Esta segur@ de cancelar la guia " + pedido.guia + "?",
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
                    pedido: pedido.referencia,
                    estado: "guia cancelada",
                    codigo: "10"
                }).then(response => {

                    cargarDatosRotulos();
                    setPedidoInf(prev => ({
                        ...prev,
                        codigoEstado: '10'
                    }));
                    cargarTrasabilidad(pedido.guia);

                    withReactContent(Swal).fire({
                        title: "Registrado",
                        text: "Trasabilidad reportada",
                        icon: "success",
                        showConfirmButton: false, // Ocultar el botón de confirmación
                        timer: 2000 // Cerrar automáticamente después de 2 segundos
                    });

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

    function admitirEnvio(pedido) {
        const swalWithReact = withReactContent(Swal);
        swalWithReact.fire({
            title: "Admitido",
            html: "¿Esta segur@ que la guia " + pedido.guia + " fue admitido?",
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
                    estado: "Guia admitida",
                    codigo: "80"
                }).then(response => {

                    cargarDatosRotulos();
                    setPedidoInf(prev => ({
                        ...prev,
                        codigoEstado: '80'
                    }));
                    cargarTrasabilidad(pedido.guia);

                    withReactContent(Swal).fire({
                        title: "Registrado",
                        text: "Trasabilidad reportada",
                        icon: "success",
                        showConfirmButton: false, // Ocultar el botón de confirmación
                        timer: 2000 // Cerrar automáticamente después de 2 segundos
                    });

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

    function abrirModalAdmitir(pedido) {
        cargarTrasabilidad(pedido.guia);
        setPedidoInf(pedido);
        setModalAdmitir(true);
    }

    async function cargarTrasabilidad(guia) {
        await axios.post(process.env.ENDPOINT_API + '/despachos/trasabilidadGuia', {
            guia: guia
        }).then(response => {

            const nuevaTrasabilidad = response.data.trasabilidad.map(item => ({
                ...item,
                fecha: formatearFechaPersonalizada(item.fecha)
            }));

            setDataTrasabilidad(nuevaTrasabilidad);
            setDataRecordatorios(response.data.recordatorios);
        }).catch(error => {
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (cargar pedidos)",
                icon: "error"
            })
        })
    }

    function formatearFechaPersonalizada(fechaStr) {
        const fecha = new Date(fechaStr.replace(" ", "T")); // Convierte a objeto Date válido

        const opcionesFecha = { day: "numeric", month: "long" };
        const opcionesHora = { hour: "numeric", minute: "2-digit", hour12: true };

        const diaMes = fecha.toLocaleDateString("es-ES", opcionesFecha);
        const hora = fecha.toLocaleTimeString("es-ES", opcionesHora).toLowerCase();

        return `${diaMes} a las ${hora}`;
    }

    function formatearFechaCorta(fechaISO) {
        const meses = [
            "enero", "febrero", "marzo", "abril", "mayo", "junio",
            "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
        ];

        const fecha = new Date(fechaISO);
        const dia = fecha.getUTCDate(); // Usamos getUTCDate para evitar desfase por zona horaria
        const mes = meses[fecha.getUTCMonth()];

        return `${dia} de ${mes}`;
    }

    function formatearFechaHora(fecha) {
        const meses = [
            "enero", "febrero", "marzo", "abril", "mayo", "junio",
            "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
        ];
        const dia = fecha.getDate();
        const mes = meses[fecha.getMonth()];
        let horas = fecha.getHours();
        const minutos = fecha.getMinutes().toString().padStart(2, '0');
        const ampm = horas >= 12 ? 'pm' : 'am';
        horas = horas % 12 || 12;

        return `${dia} de ${mes} a las ${horas}:${minutos} ${ampm}`;
    }

    function generarRelacion() {
        const swalWithReact = withReactContent(Swal);
        swalWithReact.fire({
            title: "Relación de despacho",
            html: "¿Esta segur@ de generar la relacion por " + pedidos.length + " paquetes?",
            showCancelButton: true,
            confirmButtonText: "Si", // Texto personalizado para el botón de confirmación
            cancelButtonText: "No", // Texto personalizado para el botón de cancelación
            allowOutsideClick: false
        }).then(async (result) => {
            if (result.isConfirmed) {

                const swalWithReact = withReactContent(Swal);
                swalWithReact.fire({
                    title: "Generando",
                    text: "Por favor, espera un momento...",
                    icon: "info",
                    showConfirmButton: false, // Ocultar el botón de confirmación
                    allowOutsideClick: false // Evitar cerrar el SweetAlert haciendo clic fuera de él
                });

                await axios.post(process.env.ENDPOINT_API + '/despachos/generarRelacion', {
                    hora: Date.now(),
                    usuario: usuarioId,
                    guia: pedidos.map(p => p.guia).join(','),
                }).then(response => {

                    withReactContent(Swal).fire({
                        title: "Reportado",
                        text: "Relacion reportada",
                        icon: "success",
                        showConfirmButton: false, // Ocultar el botón de confirmación
                        timer: 2000 // Cerrar automáticamente después de 2 segundos
                    });
                    cargarDatosRotulos();
                    cargarResumenDiario();

                }).catch(error => {
                    const swalWithReact = withReactContent(Swal);
                    // Manejar el error aquí
                    withReactContent(Swal).fire({
                        title: "Error",
                        text: "Comunica con soporte (reportar relacion)",
                        icon: "error"
                    })
                })

                const doc = new jsPDF();

                const ahora = new Date();
                const fechaFormateada = formatearFechaHora(ahora);

                // Información en la cabecera
                doc.setFontSize(10);
                doc.text(`Generado por: ${usuario.nombre}`, 14, 10);
                doc.text(`Fecha: ${fechaFormateada}`, 14, 15);
                doc.text(`Total de paquetes: ${pedidos.length}`, 150, 10); // parte derecha

                // Título
                doc.setFontSize(16);
                doc.text('Relación de Guías', 14, 25);

                // Tabla
                const columns = [
                    { header: '#', dataKey: 'index' },
                    { header: 'Guía', dataKey: 'guia' },
                    { header: 'Pedido', dataKey: 'referenciaUsuario' },
                    { header: 'Tipo Envío', dataKey: 'recaudoTipo' },
                    { header: 'Destinatario', dataKey: 'destinatarioTelefono' },
                    { header: 'Destino', dataKey: 'ciudadDepartamento' }
                ];

                const rows = pedidos.map((pedido, index) => {
                    const tipoEnvioTexto =
                        pedido.tipoEnvio == 1 ? 'Contado' :
                            pedido.tipoEnvio == 2 ? 'Contra Entrega' :
                                pedido.tipoEnvio == 3 ? 'Recaudo' : '';

                    return {
                        index: index + 1,
                        guia: pedido.guia,
                        referenciaUsuario: `${pedido.referencia}\n${pedido.usuario}`,
                        recaudoTipo: `${formattedPrice(pedido.recaudo)}\n${tipoEnvioTexto}`,
                        destinatarioTelefono: `${pedido.destinatario}\n${formatearNumeroCelular2(pedido.telefono)}`,
                        ciudadDepartamento: `${pedido.ciudaName}\n${pedido.nameDepartamnento}`
                    };
                });


                autoTable(doc, {
                    startY: 30,
                    columns,
                    body: rows,
                    styles: {
                        fontSize: 10,
                        halign: 'center',      // Centrado horizontal
                        valign: 'middle',      // Centrado vertical
                        lineWidth: 0.1,        // Grosor de las líneas
                        lineColor: [0, 0, 0]   // Color de las líneas (negro)
                    },
                    headStyles: {
                        fillColor: [200, 200, 200],
                        halign: 'center',
                        valign: 'middle',
                        textColor: 0,
                        lineWidth: 0.1,
                        lineColor: [0, 0, 0]
                    }
                });

                doc.save('relacion_guias_' + fechaFormateada + '.pdf');
            }
        })

    }

    function cambioConsulta(bandera) {
        setConsultaTrasabilidad(bandera)
        if (!bandera) {
            cargarDatosRotulos();
            cargarResumenDiario();
        } else {
            cargarResumenProcesos();
        }
    }

    async function cargarResumenProcesos() {
        setPedidos([]);
        await axios.post(process.env.ENDPOINT_API + '/despachos/resumenProcesos', {
            transportadora: 9,
            procesos: estadosEnvios,
            fechasRango: fechasRango
        }).then(response => {
            for (let i = 0; i < estadosEnvios.length; i++) {
                estadosEnvios[i].contador = 0;
                response.data.procesos.map(item => {
                    if (parseInt(estadosEnvios[i].codigo) == parseInt(item.codigo)) {
                        estadosEnvios[i].contador = item.total;
                    }
                })
            }
            setEstadosConsulta([...estadosEnvios]);
            setEstadoTemporal(deepCopy(estadosEnvios));
        }).catch(error => {
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (cargar resumen)",
                icon: "error"
            })
        })
    }

    async function cargarEnvios() {
        if (offset == 0) {
            setPedidos([]);
            setConsultadoRotulos(true);
        }
        console.log(fechaDesde2);
        await axios.post(process.env.ENDPOINT_API + '/despachos/trasabilidadTransportadora', {
            transportadora: 9,
            estados: estadosConsulta.filter(e => e.bandera).map(e => e.codigo).join(','),
            desde: fechaDesde2,
            hasta: fechaHasta2,
            limit: limit,
            offset: offset,
            search: search
        }).then(response => {
            setTotalPedidos(response.data.pedidosTotal)
            if (offset == 0) {
                setPedidosTrasabilidad(response.data.pedidos);
                setConsultadoRotulos(false);
            } else {
                setPedidosTrasabilidad((prevPedidos) => [...prevPedidos, ...response.data.pedidos]);
            }
            console.log(response.data.pedidos);
            console.log(limit);
            if (response.data.pedidos.length == limit) {
                console.log("entro");
                clearTimeout(controladorTiempo2);
                setCargaMas(true)
                if (response.data.pedidos.length < limit) {
                    setCargaMas(false)
                }
                controladorTiempo2 = setTimeout(() => {
                    offset += limit;
                    cargarEnvios()
                }, 3000);
            } else {
                setCargaMas(false);
            }
            /*console.log(response.data.datos);
            setPedidos(response.data.datos);
            setConsultadoRotulos(false);
            if ($("#estadoRotulado").val() == 2) {
                setBanderaRelacion(true);
            } else {
                setBanderaRelacion(false);
            }*/
        }).catch(error => {
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte (cargar pedidos)",
                icon: "error"
            })
        })
    }

    function formateaFechaUltimMovimiento(fechaTexto) {
        // Aseguramos compatibilidad reemplazando espacio por 'T'
        const fecha = new Date(fechaTexto.replace(' ', 'T'));

        const opcionesFecha = { day: 'numeric', month: 'long' };
        const opcionesHora = { hour: 'numeric', minute: '2-digit', hour12: true };

        const formatoFecha = new Intl.DateTimeFormat('es-ES', opcionesFecha).format(fecha);
        const formatoHora = new Intl.DateTimeFormat('es-ES', opcionesHora).format(fecha).toLowerCase();

        return `${formatoFecha} a las ${formatoHora}`;
    }

    async function reportarRecordatorio(pedido) {
        const swalWithReact = withReactContent(Swal);

        swalWithReact.fire({
            title: "Confirmación",
            html: `
        <p>¿Reportar recordatorio para la  <b>${pedido.guia}</b>?</p>
        <div style="border-top:2px solid #c9c9c9;padding-top:11px;"> 
            <textarea 
                style="width:100%;margin:0px !important;padding:0px !important" 
                id="novedad" 
                class="swal2-textarea" 
                placeholder="Recordatorio..."
            ></textarea>
            <br/>
            <label style="margin-top:10px;">Recordatorio para:</label>
            <input 
                type="date" 
                id="fechaRecordatorio" 
                class="swal2-input" 
                style="margin:auto;width:100%" 
            />
        </div>
    `,
            showCancelButton: true,
            confirmButtonText: "Sí",
            cancelButtonText: "No",
            allowOutsideClick: false,
            preConfirm: () => {
                const novedad = document.getElementById("novedad").value.trim();
                const fecha = document.getElementById("fechaRecordatorio").value;

                if (!novedad) {
                    Swal.showValidationMessage("Debe ingresar el motivo de la novedad");
                    return false;
                }

                if (!fecha) {
                    Swal.showValidationMessage("Debe seleccionar una fecha para el recordatorio");
                    return false;
                }

                return { novedad, fecha }; // Devuelve ambos valores como un objeto
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                const { novedad, fecha } = result.value;

                console.log("Motivo:", novedad);
                console.log("Fecha recordatorio:", fecha);

                swalWithReact.fire({
                    title: "Aprobando",
                    text: "Por favor, espera un momento...",
                    icon: "info",
                    showConfirmButton: false,
                    allowOutsideClick: false
                });

                await axios.post(process.env.ENDPOINT_API + '/despachos/reportarRecordatorio', {
                    guia: pedido.guia,
                    usuario: usuarioId,
                    motivo: novedad,
                    fecha: fecha
                }).then(response => {


                    cargarTrasabilidad(pedido.guia);
                    offset = 0;
                    setCargaMas(false);
                    cargarEnvios();
                    cargarResumenDiario()

                    withReactContent(Swal).fire({
                        title: "Registrado",
                        text: "Recordatorio reportado",
                        icon: "success",
                        showConfirmButton: false, // Ocultar el botón de confirmación
                        timer: 2000 // Cerrar automáticamente después de 2 segundos
                    });

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
        });

    }
    async function reportarTrasabilidad(pedido, codigo, estado) {
        if (codigo == "5000") {
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
                        estado: estado,
                        codigo: codigo
                    }).then(response => {

                        setPedidoInf(prev => ({
                            ...prev,
                            codigoEstado: codigo
                        }));
                        cargarTrasabilidad(pedido.guia);
                        offset = 0;
                        setCargaMas(false);
                        cargarEnvios();
                        cargarResumenDiario()

                        withReactContent(Swal).fire({
                            title: "Registrado",
                            text: "Trasabilidad reportada",
                            icon: "success",
                            showConfirmButton: false, // Ocultar el botón de confirmación
                            timer: 2000 // Cerrar automáticamente después de 2 segundos
                        });

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
        else if (codigo == "501") {
            const swalWithReact = withReactContent(Swal);

            swalWithReact.fire({
                title: "Confirmación",
                html: `
                    <p>¿Está segur@ que la guia <b>${pedido.guia}</b> esta en novedad?</p>
                    <div style="border-top:2px solid #c9c9c9;padding-top:11px;"> 
                        <textarea style="width:100%;margin:0px !important;padding:0px !important" id="novedad" class="swal2-textarea" placeholder="Motivo"></textarea>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: "Si",
                cancelButtonText: "No",
                allowOutsideClick: false,
                preConfirm: () => {
                    const novedad = document.getElementById("novedad").value.trim();
                    if (!novedad) {
                        Swal.showValidationMessage("Debe ingresar el motivo de la novedad");
                        return false;
                    }
                    return novedad;
                }
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
                        estado: result.value,
                        codigo: codigo
                    }).then(response => {

                        setPedidoInf(prev => ({
                            ...prev,
                            codigoEstado: codigo
                        }));
                        cargarTrasabilidad(pedido.guia);
                        offset = 0;
                        setCargaMas(false);
                        cargarEnvios();
                        cargarResumenDiario()

                        withReactContent(Swal).fire({
                            title: "Registrado",
                            text: "Trasabilidad reportada",
                            icon: "success",
                            showConfirmButton: false, // Ocultar el botón de confirmación
                            timer: 2000 // Cerrar automáticamente después de 2 segundos
                        });

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
        } else {
            const swalWithReact = withReactContent(Swal);
            swalWithReact.fire({
                title: "Admitido",
                html: "¿Esta segur@ de reportar la guia " + pedido.guia + " como " + estado + "?",
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
                        estado: estado,
                        codigo: codigo
                    }).then(response => {

                        setPedidoInf(prev => ({
                            ...prev,
                            codigoEstado: codigo
                        }));
                        cargarTrasabilidad(pedido.guia);
                        offset = 0;
                        setCargaMas(false);
                        cargarEnvios();
                        cargarResumenDiario()

                        withReactContent(Swal).fire({
                            title: "Registrado",
                            text: "Trasabilidad reportada",
                            icon: "success",
                            showConfirmButton: false, // Ocultar el botón de confirmación
                            timer: 2000 // Cerrar automáticamente después de 2 segundos
                        });

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
    }

    function formatearFechaYContarDias(fechaStr) {
        const meses = [
            'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
        ];

        const fechaObjetivo = new Date(fechaStr);
        fechaObjetivo.setDate(fechaObjetivo.getDate() + 1); // Sumar un día para incluir la fecha actual
        const hoy = new Date();

        // Limpiar hora para comparar solo fechas
        fechaObjetivo.setHours(0, 0, 0, 0);
        hoy.setHours(0, 0, 0, 0);

        const diferenciaMs = fechaObjetivo - hoy;
        const diasFaltantes = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));

        const dia = fechaObjetivo.getDate();
        const mesNombre = meses[fechaObjetivo.getMonth()];

        return {
            fechaFormateada: `${dia} de ${mesNombre}`,
            diasFaltantes: diasFaltantes
        };
    }



    return (
        <>
            {modalFiltro && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0,
                    width: '100vw', height: '100vh',
                    backgroundColor: 'rgba(0,0,0,0.5)', // Fondo opaco
                    zIndex: 9999,
                }}>
                    <div style={{
                        background: 'white',
                        position: 'absolute',
                        top: '0%',
                        right: '0',
                        width: '25vw',
                        height: '100%',
                        zIndex: 10000,
                        transform: 'translateX(100%)',
                        animation: 'slideIn 0.4s forwards ease-out',
                    }}>
                        <style>
                            {`
                            @keyframes slideIn {
                            to {
                                transform: translateX(0);
                            }
                            }
                        `}
                        </style>
                        <div className='row' style={{ display: 'ruby', width: '100%', margin: 'auto', height: '100%', overflow: 'auto' }}>
                            <div className='col-8'>
                                <h3 style={{ marginTop: '15px', marginBottom: '0px' }}>Filtros</h3>
                            </div>
                            <div className='col-4' style={{ textAlign: 'right' }}>
                                <button
                                    onClick={() => setModalFiltro(false)}
                                    style={{
                                        marginTop: '10px',
                                        background: 'transparent',
                                        border: 'none',
                                        fontSize: '1.5rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    &times;
                                </button>
                            </div>
                            <div className='col-12' style={{ borderTop: '1px solid #e7e7e7', paddingTop: '10px' }}>
                                {estadoTemporal.map((estado, index) => (
                                    <div key={estado.codigo} className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id={`estado-${estado.codigo}`}
                                            checked={estado.bandera}
                                            onChange={() => {
                                                const nuevosEstados = [...estadoTemporal];
                                                nuevosEstados[index].bandera = !nuevosEstados[index].bandera;
                                                setEstadoTemporal(nuevosEstados);
                                            }}
                                        />
                                        <label className="form-check-label" htmlFor={`estado-${estado.codigo}`}>
                                            {estado.nombre} - ({estado.contador})
                                        </label>
                                    </div>
                                ))}

                            </div>
                            <div className='col-6' style={{ marginTop: '20px' }}>
                                <label htmlFor="fechaInicio">Desde</label>
                                <input type="Date" value={fechaDesde} id='desdeFiltro' onChange={(e) => setFechaDesde(e.target.value)} className='form-control' />
                            </div>
                            <div className='col-6' style={{ borderLeft: '1px solid #e7e7e7', marginTop: '20px' }}>
                                <label htmlFor="fechaInicio">Hasta</label>
                                <input type="Date" value={fechaHasta} id='hastaFiltro' onChange={(e) => setFechaHasta(e.target.value)} className='form-control' />
                            </div>
                            <div className='col-12' style={{ marginTop: '20px' }}>
                                <button
                                    className="btn btn-primary mt-2"
                                    onClick={() => {
                                        setEstadosConsulta(estadoTemporal.map(e => ({ ...e }))); // copia profunda
                                        // cierra el modal
                                        // llama la función
                                    }}
                                    style={{ width: '98%' }}
                                >
                                    Aplicar filtro
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {modalAdmitir && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0,
                    width: '100vw', height: '100vh',
                    backgroundColor: 'rgba(0,0,0,0.5)', // Fondo opaco
                    zIndex: 9999,
                }}>
                    <div style={{
                        background: 'white',
                        position: 'absolute',
                        top: '0%',
                        right: '0',
                        width: '30vw',
                        height: '100%',
                        zIndex: 10000,
                        transform: 'translateX(100%)',
                        animation: 'slideIn 0.4s forwards ease-out',
                    }}>
                        <style>
                            {`
                            @keyframes slideIn {
                            to {
                                transform: translateX(0);
                            }
                            }
                        `}
                        </style>
                        <div className='row' style={{ display: 'ruby', width: '100%', margin: 'auto', height: '100%', overflow: 'auto' }}>
                            <div className='col-8'>
                                <h3 style={{ marginTop: '15px', marginBottom: '0px' }}>{pedidoInf.guia}</h3>
                            </div>
                            <div className='col-4' style={{ textAlign: 'right' }}>
                                <button
                                    onClick={() => setModalAdmitir(false)}
                                    style={{
                                        marginTop: '10px',
                                        background: 'transparent',
                                        border: 'none',
                                        fontSize: '1.5rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    &times;
                                </button>
                            </div>
                            <div className='col-12' style={{ display: 'flex', justifyContent: 'center', borderBottom: '1px solid #e7e7e7' }}>
                                <Barcode value={pedidoInf.guia} height={50} displayValue={false} />
                            </div>
                            <div className='col-12'>
                                <p>
                                    <b>Referencia:</b> {pedidoInf.referencia}<br></br>
                                    <b>Destinatario:</b> {pedidoInf.destinatario}<br></br>
                                    <b>Teléfono:</b> {formatearNumeroCelular2(pedidoInf.telefono)}<br></br>
                                    <b>Dirección:</b> {pedidoInf.direccion}<br></br>
                                    <b>Ciudad:</b> {pedidoInf.ciudaName} - {pedidoInf.nameDepartamnento}<br></br>
                                    <b>Recaudo:</b> {formattedPrice(pedidoInf.recaudo)}<br></br>
                                    {pedidoInf.fleteFacturado > 0 && pedidoInf.tipoEnvio != 1 && (
                                        <>
                                            <b>Valor declarado:</b>{formattedPrice(pedidoInf.recaudo - pedidoInf.fleteFacturado)}
                                        </>
                                    )}
                                </p>
                            </div>
                            {pedidoInf.recaudo > 0 ? (
                                <>
                                    <div style={{ textAlign: 'center', borderRight: '1px solid #e7e7e7', marginBottom: '20px' }} className='col-6'>
                                        {pedidoInf.fleteFacturado > 0 ? (
                                            <b>AL COBRO</b>
                                        ) : (
                                            <b>CONTADO</b>
                                        )}
                                    </div>
                                    <div style={{ textAlign: 'center', marginBottom: '20px' }} className='col-6'>
                                        <b>PAGO EN CASA</b>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div style={{ textAlign: 'center', marginBottom: '20px' }} className='col-12'>
                                        {pedidoInf.tipoEnvio == 1 ? (
                                            <b>CONTADO</b>
                                        ) : (pedidoInf.fleteFacturado > 0) ? (
                                            <b>CONTADO</b>
                                        ) : (
                                            <b>AL COBRO</b>
                                        )}

                                    </div>
                                </>
                            )}

                            {pedidoInf.codigoEstado == 0 && (
                                <>
                                    <div className='col-12' style={{ marginTop: '20px', marginBottom: '5px' }}>
                                        <button style={{ width: '100%' }} onClick={() => admitirEnvio(pedidoInf)} className='btn btn-primary'>Admitida</button>
                                    </div>
                                    <div className='col-6' style={{ marginBottom: '20px' }}>
                                        <button style={{ width: '100%' }} onClick={() => remplazoEnvio(pedidoInf)} className='btn btn-secondary'>Remplazada</button>
                                    </div>
                                    <div className='col-6' style={{ marginBottom: '20px' }}>
                                        <button style={{ width: '100%' }} onClick={() => cancelarEnvio(pedidoInf)} className='btn btn-danger'>Cancelada</button>
                                    </div>
                                </>
                            )}

                            {pedidoInf.codigoEstado == 90 && (
                                <>
                                    <div className='col-6'>
                                        <button style={{ width: '100%' }} onClick={() => reportarTrasabilidad(pedidoInf, "500", "Viajando a destino")} className='btn btn-secondary'>Viajando</button>
                                    </div>
                                    <div className='col-6'>
                                        <button style={{ width: '100%' }} onClick={() => cancelarEnvio(pedidoInf)} className='btn btn-danger'>Cancelada</button>
                                    </div>
                                </>
                            )}

                            {pedidoInf.codigoEstado == 500 && (
                                <>
                                    <div className='col-6'>
                                        <button style={{ width: '100%' }} onClick={() => reportarTrasabilidad(pedidoInf, "3000", "Envío entregado al destinatario")} className='btn btn-secondary'>Entregado</button>
                                    </div>
                                    <div className='col-6'>
                                        <button style={{ width: '100%' }} onClick={() => reportarTrasabilidad(pedidoInf, "5000", "En oficina")} className='btn btn-warning'>En oficina</button>
                                    </div>
                                </>
                            )}

                            {pedidoInf.codigoEstado == 501 && (
                                <>
                                    <div className='col-6'>
                                        <button style={{ width: '100%' }} onClick={() => reportarTrasabilidad(pedidoInf, "500", "Viajando a destino")} className='btn btn-secondary'>Viajando</button>
                                    </div>
                                    <div className='col-6'>
                                        <button style={{ width: '100%' }} onClick={() => reportarTrasabilidad(pedidoInf, "1000", "Devolucion")} className='btn btn-danger'>Devolucion</button>
                                    </div>
                                </>
                            )}

                            {pedidoInf.codigoEstado == 5000 && (
                                <>
                                    <div className='col-6'>
                                        <button style={{ width: '100%' }} onClick={() => reportarTrasabilidad(pedidoInf, "3000", "Envío entregado al destinatario")} className='btn btn-secondary'>Entregado</button>
                                    </div>
                                    <div className='col-6'>
                                        <button style={{ width: '100%' }} onClick={() => reportarTrasabilidad(pedidoInf, "1000", "Devolucion")} className='btn btn-danger'>Devolucion</button>
                                    </div>

                                </>
                            )}

                            {pedidoInf.codigoEstado != 3000 && (
                                <>
                                    <div className='col-4' style={{ marginTop: '5px' }}>
                                        <button className='btn btn-primary' style={{ width: '100%' }} onClick={() => reportarTrasabilidad(pedidoInf, "501", "En Novedad")}><i className='bx bx-stop-circle' style={{ marginRight: '5px' }}></i> Nov.</button>
                                    </div>
                                    <div className='col-4' style={{ marginTop: '5px' }}>
                                        <button className='btn btn-primary' style={{ width: '100%' }} onClick={() => reportarRecordatorio(pedidoInf)}><i className='bx bx-calendar' style={{ marginRight: '5px' }}></i> Rec. {pedidoInf.recordatorios}</button>
                                    </div>
                                    <div className='col-4' style={{ marginTop: '5px' }}>
                                        <button className='btn btn-primary' style={{ width: '100%' }}><i className='bx bx-stop-circle' style={{ marginRight: '5px' }}></i> Obs.</button>
                                    </div>
                                </>
                            )}

                            <div className='col-12'>
                                <select className='form-select' style={{ marginTop: '10px' }} onChange={(e) => setConsultaModalTrasabilidad(e.target.value)}>
                                    <option value="1">Trasabilidad</option>
                                    <option value="2">Recordatorios</option>
                                    <option value="3">Observaciones</option>
                                </select>
                                <div className="timeline p-4 mb-4" style={{ maxHeight: '40vh', overflow: 'auto' }}>
                                    {consultaModalTrasabilidad == 1 ? (
                                        <>
                                            {dataTrasabilidad.slice().reverse().map((item, index) => {
                                                return (
                                                    <div className="tl-item" key={index}>
                                                        <div className="tl-dot"><a className="tl-author" href="#" data-abc="true"><span className="w-32 avatar circle gd-info"><i className='bx bx-check'></i></span></a></div>
                                                        <div className="tl-content">
                                                            <div>
                                                                {item.estado}                                                  </div>
                                                            <div className="tl-date text-muted mt-1">{item.usuario} - {item.fecha}</div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </>
                                    ) : consultaModalTrasabilidad == 2 ? (
                                        <>
                                            {dataRecordatorios.slice().reverse().map((item, index) => {
                                                return (
                                                    <div className="tl-item" key={index}>
                                                        <div className="tl-dot">
                                                            <a className="tl-author" href="#" data-abc="true">
                                                                <span className="w-32 avatar circle gd-info">
                                                                    <i className='bx bx-check'></i></span></a></div>
                                                        <div className="tl-content">
                                                            <div>
                                                                {item.motivo}
                                                            </div>
                                                            <div className="tl-date text-muted mt-1">{item.name} - {item.fecha}</div>
                                                        </div>
                                                    </div>
                                                )
                                            })}

                                        </>
                                    ) : (
                                        <div style={{ textAlign: 'center' }}>
                                            Cargando datos...<br></br>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="container-xxl flex-grow-1 containerP" style={{ background: 'white', height: '100%', width: '100%', position: 'relative', left: '0px', top: '0px', overflow: 'hidden' }}>
                <div className='row' style={{ height: '100%', width: '98%', margin: 'auto', marginTop: '20px' }}>
                    <div className="col-md-6 col-12 mt-3 mb-3 d-flex align-items-center">
                        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                            <div>
                                <h5 className="card-title text-primary">Resumen últimos 30 días</h5>
                                <ul className="list-unstyled mb-0" style={{ marginLeft: '20px', marginTop: '10px' }}>
                                    <li>
                                        <strong>📦 Devoluciones:</strong> {dataGeneral.devoluciones}
                                    </li>
                                    <li>
                                        <strong>✅ Porcentaje de entrega:</strong> {dataGeneral.porcentajeEntregas}%
                                    </li>
                                    <li>
                                        <strong>⏱ Tiempo promedio de entrega:</strong> {dataGeneral.tiempoEntrega} días
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    {usuario.perfil == "Admin" && (
                        <div className="col-md-6 col-12" style={{ textAlign: 'left', borderLeft: '1px solid #e7e7e7' }}>
                            <div className="row">
                                {/* Botón centrado */}
                                <div className="col-12 text-center">
                                    <button
                                        className="btn"
                                        style={{ width: '100%', color: 'white', marginBottom: '15px', backgroundColor: '#6C63FF', border: 'none' }}
                                        onClick={() => setShowModal(true)}
                                    >
                                        <i className="bx bx-upload" style={{ marginRight: '6px' }}></i>
                                        Importar informe
                                    </button>

                                    <Modal size="xl" show={showModal} onHide={() => setShowModal(false)} centered>
                                        <Modal.Header closeButton>
                                            <Modal.Title>Subir archivo Excel</Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body>
                                            <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
                                            {jsonData.length > 0 && (
                                                <>
                                                    <div className="row mt-4">
                                                        <div className="col-md-6">
                                                            {Object.keys(resumenPorEstado).length > 0 && (
                                                                <div className="p-3 border rounded">
                                                                    <h6 className="mb-3">📊 Resumen por estado</h6>
                                                                    <Table striped bordered hover size="sm" className="mb-2">
                                                                        <thead>
                                                                            <tr>
                                                                                <th>Estado</th>
                                                                                <th>Cantidad</th>
                                                                                <th>Valor total</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {Object.entries(resumenPorEstado).map(([estado, datos]) => (
                                                                                <tr key={estado}>
                                                                                    <td>{estado}</td>
                                                                                    <td>{datos.cantidad}</td>
                                                                                    <td>{datos.total.toLocaleString()} COP</td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </Table>
                                                                    <div className="text-end fw-bold">
                                                                        Total general:{" "}
                                                                        {Object.values(resumenPorEstado)
                                                                            .reduce((acc, curr) => acc + curr.total, 0)
                                                                            .toLocaleString()}{" "}
                                                                        COP
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="col-md-6">
                                                            {/* Aquí va tu parte de validación u otra lógica */}
                                                            <div className="p-3 border rounded" style={{ height: '100%' }}>
                                                                <h6>🔍 Validando con la base de datos</h6>
                                                                {banderaValidacion ? (
                                                                    <>
                                                                        <span>
                                                                            {/* Guias con recibo correcto */}
                                                                            - Guias aprobadas para hacer recibo: <b>{resumenExcel.recibos.filter(row => row.recibo === 1).length}</b>
                                                                            <button onClick={() => toggleDetalle("recibos")} className="btn btn-sm btn-primary ms-2">Ver detalle</button>
                                                                            {mostrarDetalle.recibos && (
                                                                                <div className="mb-2">
                                                                                    {resumenExcel.recibos.filter(row => row.recibo === 1).map((g, i) => (
                                                                                        <div key={i}>{g.guia} - {g.nota}</div>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                            <br />
                                                                            <br />
                                                                            {/* Guias con diferencias de valor */}
                                                                            - Guias con anomalias en el recaudo: <b>{resumenExcel.recibos.filter(row => row.recibo === 2).length}</b>
                                                                            <button onClick={() => toggleDetalle("anomalias")} className="btn btn-sm btn-primary ms-2">Ver detalle</button>
                                                                            {mostrarDetalle.anomalias && (
                                                                                <div className="mb-2">
                                                                                    {resumenExcel.recibos.filter(row => row.recibo === 2).map((g, i) => (
                                                                                        <div key={i}>{g.guia} - {g.nota}</div>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                            <br />
                                                                            <br />
                                                                            {/* Guias no entregadas aún */}
                                                                            - Guias sin reportar como entregadas: <b>{resumenExcel.sinReportar.length}</b>
                                                                            <button onClick={() => toggleDetalle("sinReportar")} className="btn btn-sm btn-primary ms-2">Ver detalle</button>
                                                                            {mostrarDetalle.sinReportar && (
                                                                                <div className="mb-2">
                                                                                    {resumenExcel.sinReportar.map((g, i) => (
                                                                                        <div key={i}>{g}</div>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                            <br />
                                                                            <br />
                                                                            {/* Guias no existen en BD */}
                                                                            - Guias no ingresadas a la plataforma: <b>{resumenExcel.noExisten.length}</b>
                                                                            <button onClick={() => toggleDetalle("noExisten")} className="btn btn-sm btn-primary ms-2">Ver detalle</button>
                                                                            {mostrarDetalle.noExisten && (
                                                                                <div className="mb-2">
                                                                                    {resumenExcel.noExisten.map((g, i) => (
                                                                                        <div key={i}>{g}</div>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                            <br />
                                                                            <br />
                                                                            {/* Guias entregadas pero sin confirmar */}
                                                                            - Guias que ya fueron entregadas y no se encontraron: <b>{resumenExcel.sinConfirmar.length}</b>
                                                                            <button onClick={() => toggleDetalle("sinConfirmar")} className="btn btn-sm btn-primary ms-2">Ver detalle</button>
                                                                            {mostrarDetalle.sinConfirmar && (
                                                                                <div className="mb-2">
                                                                                    {resumenExcel.sinConfirmar.map((g, i) => (
                                                                                        <div key={i}>{g.guia}</div>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </span>
                                                                        {resumenExcel.recibos?.filter(row => row.recibo === 1).length > 0 && (
                                                                            <button
                                                                                className="btn"
                                                                                style={{ width: '100%', color: 'white', marginTop: '15px', backgroundColor: '#6C63FF', border: 'none' }}
                                                                                onClick={() => reportarRecibos()}
                                                                            > Reportar guias para recibos - {resumenExcel.recibos?.filter(row => row.recibo === 1).length}</button>
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <div className="text-danger">...</div>
                                                                )}
                                                                {/* Contenido dinámico de validación aquí */}
                                                            </div>
                                                        </div>
                                                    </div>


                                                    <div className="table-responsive mt-4">
                                                        <Table striped bordered hover size="sm">
                                                            <thead>
                                                                <tr>
                                                                    <th>Fecha de envío</th>
                                                                    <th>Guía</th>
                                                                    <th>Estado</th>
                                                                    <th>Cuenta</th>
                                                                    <th>Titular</th>
                                                                    <th>Valor</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {jsonData.map((item, index) => (
                                                                    <tr key={index}>
                                                                        <td>{item.fechaEnvio}</td>
                                                                        <td>{item.guia}</td>
                                                                        <td>{item.estado}</td>
                                                                        <td>{item.cuenta}</td>
                                                                        <td>{item.titular}</td>
                                                                        <td>{item.valor.toLocaleString()} COP</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </Table>
                                                    </div>
                                                </>
                                            )}

                                        </Modal.Body>
                                        <Modal.Footer>
                                            <Button variant="secondary" onClick={() => setShowModal(false)}>Cerrar</Button>
                                        </Modal.Footer>
                                    </Modal>
                                </div>
                                {/* Caja Pendiente */}
                                <div className="col-md-6 col-12 mb-3">
                                    <div
                                        className="p-3 h-100"
                                        style={{
                                            border: '1px solid #eee',
                                            borderRadius: '12px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                            backgroundColor: '#fff'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <i className="bx bx-time-five" style={{ color: '#FFA500', fontSize: '1.8rem', marginRight: '12px' }}></i>
                                            <div>
                                                <span style={{ fontWeight: '600', fontSize: '16px', color: '#555' }}>Pendiente</span>
                                                <h2 style={{ margin: '4px 0 0 0', fontSize: '24px', color: '#212529' }}>${dataGeneral.saldoPendiete?.toLocaleString('es-CO')} COP</h2>
                                                <small style={{ width: '100%', textAlign: 'right', display: 'block', borderTop: '1px solid #efebeb', marginTop: '10px' }} className="text-muted">{dataGeneral.paquetesPendientes} unidades</small>

                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Caja Disponible */}
                                <div className="col-md-6 col-12 mb-3">
                                    <div
                                        className="p-3 h-100"
                                        style={{
                                            border: '1px solid #eee',
                                            borderRadius: '12px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                            backgroundColor: '#fff'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <i className="bx bx-check-circle" style={{ color: '#28a745', fontSize: '1.8rem', marginRight: '12px' }}></i>
                                            <div>
                                                <span style={{ fontWeight: '600', fontSize: '16px', color: '#555' }}>Disponible</span>
                                                <h2 style={{ margin: '4px 0 0 0', fontSize: '24px', color: '#212529' }}>${dataGeneral.saldoDisponible?.toLocaleString('es-CO')} COP</h2>
                                                <small style={{ width: '100%', textAlign: 'right', display: 'block', borderTop: '1px solid #efebeb', marginTop: '10px' }} className="text-muted">{dataGeneral.paquetesDisponible} unidades</small>

                                            </div>
                                        </div>
                                    </div>
                                </div>


                            </div>
                        </div>

                    )}

                    <div className='col-md-6 col-12' style={{ textAlign: 'right', display: 'none' }}>
                        <h1 style={{ marginBottom: '0px' }}>$49.900</h1>
                        <p>Ult. cierre el 2 de abril</p>
                    </div>
                    <div className='col-md-8 col-12' style={{ paddingTop: '55px' }}>
                        {consultaDias ? (
                            <div style={{ textAlign: 'center' }}>
                                Cargando datos...<br></br>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th scope="col"></th>
                                            <th scope="col" style={{ background: '#e7e7e7' }}>Paquetes</th>
                                            <th scope="col" style={{ background: '#e7e7e7' }}>Relacionadas</th>
                                            <th scope="col" style={{ background: '#e7e7e7' }}>Viajando</th>
                                            <th scope="col" style={{ background: '#e7e7e7' }}>En Oficina</th>
                                            <th scope="col" style={{ background: '#e7e7e7' }}>Novedad</th>
                                            <th scope="col" style={{ background: '#e7e7e7' }}>Entregados</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {resumenDiario.map((item, index) => {
                                            return (
                                                <tr key={index}>
                                                    <th style={{ cursor: 'pointer' }} onClick={() => {
                                                        estadosEnvios = estadosEnvios.map(estado => ({
                                                            ...estado,
                                                            bandera: true
                                                        }));
                                                        banderaEntro = true;

                                                        setFechaDesde(item.dia.split('T')[0])
                                                        setFechaHasta(item.dia.split('T')[0])
                                                        fechaDesde2 = item.dia.split('T')[0]
                                                        fechaHasta2 = item.dia.split('T')[0]
                                                        offset = 0;
                                                        setCargaMas(false);
                                                        cambioConsulta(true)
                                                        setEstadosConsulta(estadosEnvios);
                                                        setEstadoTemporal(estadosEnvios);
                                                        setSearch("")
                                                        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

                                                    }} scope="row">
                                                        {item.fecha}
                                                        <div className="progress">
                                                            <div
                                                                className="progress-bar"
                                                                role="progressbar"
                                                                style={{ width: `${(item.entregados * 100) / item.paquetes}%` }}
                                                                aria-valuenow={(item.entregados * 100) / item.paquetes}
                                                                aria-valuemin="0"
                                                                aria-valuemax="100"
                                                            ></div>
                                                        </div>

                                                    </th>
                                                    <td style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => {
                                                        estadosEnvios = estadosEnvios.map(estado => ({
                                                            ...estado,
                                                            bandera: true
                                                        }));
                                                        banderaEntro = true;

                                                        setFechaDesde(item.dia.split('T')[0])
                                                        setFechaHasta(item.dia.split('T')[0])
                                                        fechaDesde2 = item.dia.split('T')[0]
                                                        fechaHasta2 = item.dia.split('T')[0]
                                                        offset = 0;
                                                        setCargaMas(false);
                                                        cambioConsulta(true)
                                                        setEstadosConsulta(estadosEnvios);
                                                        setEstadoTemporal(estadosEnvios);
                                                        setSearch("")
                                                        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

                                                    }}>{item.paquetes}</td>
                                                    <td style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => {
                                                        estadosEnvios = estadosEnvios.map(estado => ({
                                                            ...estado,
                                                            bandera: estado.codigo === "90"
                                                        }));
                                                        banderaEntro = true;

                                                        setFechaDesde(item.dia.split('T')[0])
                                                        setFechaHasta(item.dia.split('T')[0])
                                                        fechaDesde2 = item.dia.split('T')[0]
                                                        fechaHasta2 = item.dia.split('T')[0]
                                                        offset = 0;
                                                        setCargaMas(false);
                                                        cambioConsulta(true)
                                                        setEstadosConsulta(estadosEnvios);
                                                        setEstadoTemporal(estadosEnvios);
                                                        setSearch("")
                                                        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

                                                    }}>{item.relacionadas}</td>

                                                    <td style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => {
                                                        estadosEnvios = estadosEnvios.map(estado => ({
                                                            ...estado,
                                                            bandera: estado.codigo === "500"
                                                        }));
                                                        banderaEntro = true;

                                                        setFechaDesde(item.dia.split('T')[0])
                                                        setFechaHasta(item.dia.split('T')[0])
                                                        fechaDesde2 = item.dia.split('T')[0]
                                                        fechaHasta2 = item.dia.split('T')[0]
                                                        offset = 0;
                                                        setCargaMas(false);
                                                        cambioConsulta(true)
                                                        setEstadosConsulta(estadosEnvios);
                                                        setEstadoTemporal(estadosEnvios);
                                                        setSearch("")
                                                        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

                                                    }}>{item.viajando}</td>

                                                    <td style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => {
                                                        estadosEnvios = estadosEnvios.map(estado => ({
                                                            ...estado,
                                                            bandera: estado.codigo === "5000"
                                                        }));
                                                        banderaEntro = true;

                                                        setFechaDesde(item.dia.split('T')[0])
                                                        setFechaHasta(item.dia.split('T')[0])
                                                        fechaDesde2 = item.dia.split('T')[0]
                                                        fechaHasta2 = item.dia.split('T')[0]
                                                        offset = 0;
                                                        setCargaMas(false);
                                                        cambioConsulta(true)
                                                        setEstadosConsulta(estadosEnvios);
                                                        setEstadoTemporal(estadosEnvios);
                                                        setSearch("")
                                                        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

                                                    }}>{item.oficina}</td>

                                                    <td style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => {
                                                        estadosEnvios = estadosEnvios.map(estado => ({
                                                            ...estado,
                                                            bandera: estado.codigo === "501"
                                                        }));
                                                        banderaEntro = true;

                                                        setFechaDesde(item.dia.split('T')[0])
                                                        setFechaHasta(item.dia.split('T')[0])
                                                        fechaDesde2 = item.dia.split('T')[0]
                                                        fechaHasta2 = item.dia.split('T')[0]
                                                        offset = 0;
                                                        setCargaMas(false);
                                                        cambioConsulta(true)
                                                        setEstadosConsulta(estadosEnvios);
                                                        setEstadoTemporal(estadosEnvios);
                                                        setSearch("")
                                                        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

                                                    }}>{item.novedad}</td>
                                                    <td className="bg-custom-red" style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => {
                                                        estadosEnvios = estadosEnvios.map(estado => ({
                                                            ...estado,
                                                            bandera: estado.codigo === "3000"
                                                        }));
                                                        banderaEntro = true;

                                                        setFechaDesde(item.dia.split('T')[0])
                                                        setFechaHasta(item.dia.split('T')[0])
                                                        fechaDesde2 = item.dia.split('T')[0]
                                                        fechaHasta2 = item.dia.split('T')[0]
                                                        offset = 0;
                                                        setCargaMas(false);
                                                        cambioConsulta(true)
                                                        setEstadosConsulta(estadosEnvios);
                                                        setEstadoTemporal(estadosEnvios);
                                                        setSearch("")
                                                        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

                                                    }}>{item.entregados}</td>
                                                </tr>
                                            )
                                        })}

                                        {resumenDiario.length === 0 && (
                                            <tr>
                                                <td colSpan="5" style={{ textAlign: 'center' }}>No se encontraron registros.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                    <tfoot>
                                        {resumenDiario.length > 0 && (() => {
                                            const total = resumenDiario.reduce((acc, item) => ({
                                                paquetes: acc.paquetes + (item.paquetes || 0),
                                                viajando: acc.viajando + (item.viajando || 0),
                                                oficina: acc.oficina + (item.oficina || 0),
                                                novedad: acc.novedad + (item.novedad || 0),
                                                relacionadas: acc.relacionadas + (item.relacionadas || 0),
                                                entregados: acc.entregados + (item.entregados || 0),
                                            }), { paquetes: 0, viajando: 0, oficina: 0, novedad: 0, entregados: 0, relacionadas: 0 });

                                            return (
                                                <tr style={{ fontWeight: 'bold' }}>
                                                    <th style={{ textAlign: 'center', background: '#e7e7e7' }}></th>
                                                    <th onClick={() => {
                                                        estadosEnvios = estadosEnvios.map(estado => ({
                                                            ...estado,
                                                            bandera: true
                                                        }));

                                                        setFechaDesde(resumenDiario[0].dia.split('T')[0])
                                                        setFechaHasta(resumenDiario[resumenDiario.length - 1].dia.split('T')[0])
                                                        fechaDesde2 = resumenDiario[0].dia.split('T')[0]
                                                        fechaHasta2 = resumenDiario[resumenDiario.length - 1].dia.split('T')[0]

                                                        banderaEntro = true;
                                                        setSearch("")
                                                        offset = 0;
                                                        setCargaMas(false);
                                                        cambioConsulta(true)
                                                        setEstadosConsulta(estadosEnvios);
                                                        setEstadoTemporal(estadosEnvios);
                                                        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

                                                    }} style={{ cursor: 'pointer', textAlign: 'center', background: '#e7e7e7' }}>{total.paquetes}</th>
                                                    <th onClick={() => {
                                                        estadosEnvios = estadosEnvios.map(estado => ({
                                                            ...estado,
                                                            bandera: estado.codigo === "90"
                                                        }));

                                                        setFechaDesde(resumenDiario[0].dia.split('T')[0])
                                                        setFechaHasta(resumenDiario[resumenDiario.length - 1].dia.split('T')[0])
                                                        fechaDesde2 = resumenDiario[0].dia.split('T')[0]
                                                        fechaHasta2 = resumenDiario[resumenDiario.length - 1].dia.split('T')[0]

                                                        banderaEntro = true;
                                                        setSearch("")
                                                        offset = 0;
                                                        setCargaMas(false);
                                                        cambioConsulta(true)
                                                        setEstadosConsulta(estadosEnvios);
                                                        setEstadoTemporal(estadosEnvios);
                                                        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

                                                    }} style={{ cursor: 'pointer', textAlign: 'center', background: '#e7e7e7' }}>{total.relacionadas}</th>

                                                    <th onClick={() => {
                                                        estadosEnvios = estadosEnvios.map(estado => ({
                                                            ...estado,
                                                            bandera: estado.codigo === "500"
                                                        }));

                                                        setFechaDesde(resumenDiario[0].dia.split('T')[0])
                                                        setFechaHasta(resumenDiario[resumenDiario.length - 1].dia.split('T')[0])
                                                        fechaDesde2 = resumenDiario[0].dia.split('T')[0]
                                                        fechaHasta2 = resumenDiario[resumenDiario.length - 1].dia.split('T')[0]

                                                        banderaEntro = true;
                                                        setSearch("")
                                                        offset = 0;
                                                        setCargaMas(false);
                                                        cambioConsulta(true)
                                                        setEstadosConsulta(estadosEnvios);
                                                        setEstadoTemporal(estadosEnvios);
                                                        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

                                                    }} style={{ cursor: 'pointer', textAlign: 'center', background: '#e7e7e7' }}>{total.viajando}</th>
                                                    <th onClick={() => {
                                                        estadosEnvios = estadosEnvios.map(estado => ({
                                                            ...estado,
                                                            bandera: estado.codigo === "5000"
                                                        }));

                                                        setFechaDesde(resumenDiario[0].dia.split('T')[0])
                                                        setFechaHasta(resumenDiario[resumenDiario.length - 1].dia.split('T')[0])
                                                        fechaDesde2 = resumenDiario[0].dia.split('T')[0]
                                                        fechaHasta2 = resumenDiario[resumenDiario.length - 1].dia.split('T')[0]

                                                        banderaEntro = true;
                                                        setSearch("")
                                                        offset = 0;
                                                        setCargaMas(false);
                                                        cambioConsulta(true)
                                                        setEstadosConsulta(estadosEnvios);
                                                        setEstadoTemporal(estadosEnvios);
                                                        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

                                                    }} style={{ cursor: 'pointer', textAlign: 'center', background: '#e7e7e7' }}>{total.oficina}</th>
                                                    <th onClick={() => {
                                                        estadosEnvios = estadosEnvios.map(estado => ({
                                                            ...estado,
                                                            bandera: estado.codigo === "501"
                                                        }));

                                                        setFechaDesde(resumenDiario[0].dia.split('T')[0])
                                                        setFechaHasta(resumenDiario[resumenDiario.length - 1].dia.split('T')[0])
                                                        fechaDesde2 = resumenDiario[0].dia.split('T')[0]
                                                        fechaHasta2 = resumenDiario[resumenDiario.length - 1].dia.split('T')[0]

                                                        banderaEntro = true;
                                                        setSearch("")
                                                        offset = 0;
                                                        setCargaMas(false);
                                                        cambioConsulta(true)
                                                        setEstadosConsulta(estadosEnvios);
                                                        setEstadoTemporal(estadosEnvios);
                                                        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

                                                    }} style={{ cursor: 'pointer', textAlign: 'center', background: '#e7e7e7' }}>{total.novedad}</th>
                                                    <th onClick={() => {
                                                        estadosEnvios = estadosEnvios.map(estado => ({
                                                            ...estado,
                                                            bandera: estado.codigo === "3000"
                                                        }));

                                                        setFechaDesde(resumenDiario[0].dia.split('T')[0])
                                                        setFechaHasta(resumenDiario[resumenDiario.length - 1].dia.split('T')[0])
                                                        fechaDesde2 = resumenDiario[0].dia.split('T')[0]
                                                        fechaHasta2 = resumenDiario[resumenDiario.length - 1].dia.split('T')[0]

                                                        banderaEntro = true;
                                                        setSearch("")
                                                        offset = 0;
                                                        setCargaMas(false);
                                                        cambioConsulta(true)
                                                        setEstadosConsulta(estadosEnvios);
                                                        setEstadoTemporal(estadosEnvios);
                                                        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

                                                    }} style={{ cursor: 'pointer', textAlign: 'center', background: '#e7e7e7' }}>{total.entregados}</th>
                                                </tr>
                                            );
                                        })()}
                                    </tfoot>
                                </table>
                            </div>
                        )}

                    </div>
                    <div className='col-md-4 col-12' style={{ borderLeft: '1px solid' }}>
                        {consultaDias ? (
                            <div style={{ textAlign: 'center' }}>
                                Cargando datos...<br></br>
                            </div>
                        ) : (
                            <div>
                                <button type="button" onClick={() => setBanderaConsultaAlerta(true)} className="btn btn-danger position-relative">
                                    Alertas
                                    {contAlertas > 0 && (
                                        <span style={{ border: '3px solid' }} className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                            {contAlertas}
                                        </span>
                                    )}
                                </button>
                                <button type="button" onClick={() => setBanderaConsultaAlerta(false)} className="btn btn-primary position-relative" style={{ marginLeft: '30px' }}>
                                    Recordatorios
                                    {contRecordatorios > 0 && (
                                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                            {contRecordatorios}
                                        </span>
                                    )}
                                </button>
                            </div>

                        )}

                        {banderaConsultaAlerta ? (
                            <>
                                {alertas.length === 0 && (
                                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                                        No hay alertas pendientes.
                                    </div>
                                )}
                                <div style={{ maxHeight: '61vh', overflow: 'auto', paddingTop: '10px', paddingRight: '5px' }}>
                                    {alertas.map((alerta, index) => {
                                        return (
                                            <div className="card rounded-3 border-0" style={{ marginTop: '5px', marginBottom: '10px', overflow: 'hidden' }}>
                                                <div className="card-header d-flex align-items-center" onClick={() => {
                                                    estadosEnvios = estadosEnvios.map(estado => ({
                                                        ...estado,
                                                        bandera: true
                                                    }));

                                                    setFechaDesde(resumenDiario[0].dia.split('T')[0])
                                                    setFechaHasta(resumenDiario[resumenDiario.length - 1].dia.split('T')[0])
                                                    fechaDesde2 = resumenDiario[0].dia.split('T')[0]
                                                    fechaHasta2 = resumenDiario[resumenDiario.length - 1].dia.split('T')[0]

                                                    banderaEntro = true;
                                                    setSearch(alerta.guia)
                                                    offset = 0;
                                                    setCargaMas(false);
                                                    cambioConsulta(true)
                                                    setEstadosConsulta(estadosEnvios);
                                                    setEstadoTemporal(estadosEnvios);
                                                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                                                    setTimeout(() => {
                                                        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                                                    }, 1000);
                                                }} style={{ cursor: 'pointer', backgroundColor: '#e7e7e7', padding: '10px 15px', fontWeight: 'bold', fontSize: '16px', color: '#333' }}>
                                                    <i className='bx bxs-error text-danger' style={{ marginRight: '8px', fontSize: '18px' }}></i>
                                                    {alerta.guia}
                                                </div>
                                                <div className="card-body" style={{ backgroundColor: '#fff', border: '3px solid #e7e7e7', padding: '15px 20px' }}>
                                                    <blockquote className="blockquote mb-3 text-muted" style={{ fontSize: '15px' }}>
                                                        <p className="mb-0">Desde el {formateaFechaUltimMovimiento(alerta.fechaUltimoMovimiento)} la guía está {alerta.estadoTransportadora}</p>
                                                    </blockquote>
                                                    <div className='row border-top pt-2' style={{ fontSize: '14px' }}>
                                                        <div className='col-6 text-center border-end'>
                                                            <strong>Pedido:</strong><br />
                                                            {alerta.pedido}
                                                        </div>
                                                        <div className='col-6 text-center'>
                                                            <strong>Asesora:</strong><br />
                                                            {alerta.name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>)
                                    })}
                                </div>
                            </>
                        ) : (
                            <>
                                {recordatorios.length === 0 && (
                                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                                        No hay recordatorios pendientes.
                                    </div>
                                )}
                                <div style={{ maxHeight: '61vh', overflow: 'auto', paddingTop: '10px', paddingRight: '5px' }}>
                                    {recordatorios.map((alerta, index) => {
                                        return (
                                            <div className="card rounded-3 border-0" style={{ marginTop: '5px', marginBottom: '10px', overflow: 'hidden' }}>
                                                <div className="card-header d-flex align-items-center" onClick={() => {
                                                    estadosEnvios = estadosEnvios.map(estado => ({
                                                        ...estado,
                                                        bandera: true
                                                    }));

                                                    setFechaDesde(resumenDiario[0].dia.split('T')[0])
                                                    setFechaHasta(resumenDiario[resumenDiario.length - 1].dia.split('T')[0])
                                                    fechaDesde2 = resumenDiario[0].dia.split('T')[0]
                                                    fechaHasta2 = resumenDiario[resumenDiario.length - 1].dia.split('T')[0]

                                                    banderaEntro = true;
                                                    setSearch(alerta.guia)
                                                    offset = 0;
                                                    setCargaMas(false);
                                                    cambioConsulta(true)
                                                    setEstadosConsulta(estadosEnvios);
                                                    setEstadoTemporal(estadosEnvios);
                                                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                                                    setTimeout(() => {
                                                        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                                                    }, 1000);
                                                }} style={{ cursor: 'pointer', backgroundColor: '#e7e7e7', padding: '10px 15px', fontWeight: 'bold', fontSize: '16px', color: '#333' }}>
                                                    <i className='bx bx-bell text-primary' style={{ marginRight: '8px', fontSize: '18px' }}></i>
                                                    {alerta.guia}
                                                </div>
                                                <div className="card-body" style={{ backgroundColor: '#fff', border: '3px solid #e7e7e7', padding: '15px 20px' }}>
                                                    <blockquote className="blockquote mb-3 text-muted" style={{ fontSize: '15px' }}>
                                                        <p className="mb-0">{alerta.motivo}</p>
                                                    </blockquote>

                                                    <div style={{ textAlign: 'right' }}>
                                                        {formatearFechaYContarDias(alerta.fecha).fechaFormateada}  - {formatearFechaYContarDias(alerta.fecha).diasFaltantes} dias
                                                    </div>

                                                    <div className='row border-top pt-2' style={{ fontSize: '14px' }}>
                                                        <div className='col-6 text-center border-end'>
                                                            <strong>Pedido:</strong><br />
                                                            {alerta.pedido}
                                                        </div>
                                                        <div className='col-6 text-center'>
                                                            <strong>Asesora:</strong><br />
                                                            {alerta.name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>)
                                    })}
                                </div>
                            </>
                        )}

                    </div>
                    {consultaTrasabilidad ? (
                        <div style={{ margin: 'auto', marginTop: '20px', textAlign: 'center', width: '80%' }} className='col-12'>
                            <button style={{ width: '100%' }} onClick={() => cambioConsulta(false)} className='btn btn-primary'><i className='bx bx-list-check' style={{ marginRight: '10px' }}></i> Admiciones</button>
                        </div>
                    ) : (
                        <div style={{ margin: 'auto', marginTop: '20px', textAlign: 'center', width: '80%' }} className='col-12'>
                            <button style={{ width: '100%' }}
                                onClick={() => {
                                    cambioConsulta(true)
                                }}
                                className='btn btn-primary'><i className='bx bxs-truck' style={{ marginRight: '10px' }}></i> Seguimientos</button>
                        </div>
                    )}
                    <div className='col-12' style={{ marginTop: '20px', display: consultaTrasabilidad ? 'none' : 'block' }}>
                        <div className='row'>
                            <div className='col-6'>
                                <select className='form-control' id="estadoRotulado" onChange={() => cargarDatosRotulos()} style={{ width: '200px' }}>
                                    <option value="1">Para Admitir</option>
                                    <option value="2">Admitidos</option>
                                </select>
                            </div>
                            <div className='col-6' style={{ textAlign: 'right' }}>
                                {banderaRelacion && (
                                    <button className='btn btn-primary' onClick={() => generarRelacion()} style={{ width: '200px', marginLeft: '10px' }}>Generar Relacion</button>
                                )}

                            </div>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-striped" style={{ marginTop: '20px' }}>
                                <thead>
                                    <tr>
                                        <th scope="col" style={{ background: '#e7e7e7' }}></th>
                                        <th scope="col" style={{ textAlign: 'center', background: '#e7e7e7' }}>Guia</th>
                                        <th scope="col" style={{ textAlign: 'center', background: '#e7e7e7' }}>Pedido</th>
                                        <th scope="col" style={{ textAlign: 'center', background: '#e7e7e7' }}>Tipo</th>
                                        <th scope="col" style={{ textAlign: 'center', background: '#e7e7e7' }}>Recaudo</th>
                                        <th scope="col" style={{ textAlign: 'center', background: '#e7e7e7' }}>Destinatario</th>
                                        <th scope="col" style={{ textAlign: 'center', background: '#e7e7e7' }}>Destino</th>
                                        <th scope="col" style={{ textAlign: 'center', background: '#e7e7e7' }}>Opciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {consultandoRotulos ? (
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
                                                return (
                                                    <tr>
                                                        <th scope="row">{index + 1}</th>
                                                        <td style={{ textAlign: 'center' }}>{pedido.guia}</td>
                                                        <td style={{ textAlign: 'center' }}>{pedido.referencia}<br></br><b>{pedido.usuario}</b></td>
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
                                                                </>
                                                            )}
                                                        </td>
                                                        <td style={{ textAlign: 'center' }}>{formattedPrice(pedido.recaudo)}</td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            {pedido.destinatario}<br></br><b>{formatearNumeroCelular2(pedido.telefono)}</b>
                                                        </td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            {pedido.ciudaName}<br></br><b>{pedido.nameDepartamnento}</b>
                                                        </td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            {pedido.codigoEstado == 0 && (
                                                                <button onClick={() => abrirModalAdmitir(pedido)} className='btn btn-primary'>Admitir</button>
                                                            )}

                                                            {pedido.codigoEstado != 0 && (
                                                                <button onClick={() => abrirModalAdmitir(pedido)} className='btn btn-danger'>Trasabilidad</button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className='col-12' style={{ marginTop: '20px', display: consultaTrasabilidad ? 'block' : 'none' }}>
                        <div className='row'>
                            <div className='col-11'>
                                <input
                                    type="text"
                                    placeholder="Buscar..."
                                    className="form-control"
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); banderaEntro = true; }}
                                />
                            </div>
                            <div className='col-1'>
                                <button style={{ width: '100%' }} onClick={() => { setModalFiltro(true); banderaEntro = true }} className='btn btn-primary'>Filtros</button>
                            </div>
                            <div className='col-12' style={{ marginTop: '10px' }}>
                                {estadosConsulta
                                    .filter(e => e.bandera == true)
                                    .map((estado, index) => (
                                        <span onClick={() => {
                                            estadosEnvios = estadosEnvios.map(estado2 => ({
                                                ...estado2,
                                                bandera: estado.codigo === estado2.codigo
                                            }));

                                            setFechaDesde(resumenDiario[0].dia.split('T')[0])
                                            setFechaHasta(resumenDiario[resumenDiario.length - 1].dia.split('T')[0])
                                            fechaDesde2 = resumenDiario[0].dia.split('T')[0]
                                            fechaHasta2 = resumenDiario[resumenDiario.length - 1].dia.split('T')[0]

                                            banderaEntro = true;
                                            setSearch("")
                                            offset = 0;
                                            setCargaMas(false);
                                            cambioConsulta(true)
                                            setEstadosConsulta(estadosEnvios);
                                            setEstadoTemporal(estadosEnvios);
                                        }} style={{ background: '#222d32', margin: '0px 2px', cursor: 'pointer' }} className="badge badge-pill badge-secondary">{estado.nombre} - {estado.contador}</span>
                                    ))}
                                {estadosConsulta.some(e => e.bandera === false) && (
                                    <span
                                        onClick={() => {
                                            estadosEnvios = estadosEnvios.map(e => ({ ...e, bandera: true }));
                                            setFechaDesde(resumenDiario[0].dia.split('T')[0])
                                            setFechaHasta(resumenDiario[resumenDiario.length - 1].dia.split('T')[0])
                                            fechaDesde2 = resumenDiario[0].dia.split('T')[0]
                                            fechaHasta2 = resumenDiario[resumenDiario.length - 1].dia.split('T')[0]

                                            banderaEntro = true;
                                            setSearch("")
                                            offset = 0;
                                            setCargaMas(false);
                                            cambioConsulta(true)
                                            setEstadosConsulta(estadosEnvios);
                                            setEstadoTemporal(estadosEnvios);

                                        }}
                                        style={{ background: '#5cb85c', margin: '0px 2px', cursor: 'pointer' }}
                                        className="badge badge-pill badge-success"
                                    >
                                        Restaurar filtros
                                    </span>
                                )}
                            </div>
                            <div className='col-12'>
                                {pedidosTrasabilidad.length} de {totalPedidos} paquetes
                            </div>
                        </div>
                        <div className="table-responsive" style={{ marginBottom: '50px' }}>
                            <table className="table table-striped" style={{ marginTop: '20px' }}>
                                <thead>
                                    <tr>
                                        <th scope="col" style={{ textAlign: 'center', background: '#e7e7e7' }}>Guia</th>
                                        <th scope="col" style={{ textAlign: 'center', background: '#e7e7e7' }}>Pedido</th>
                                        <th scope="col" style={{ textAlign: 'center', background: '#e7e7e7' }}>Tipo</th>
                                        <th scope="col" style={{ textAlign: 'center', background: '#e7e7e7' }}>Recaudo</th>
                                        <th scope="col" style={{ textAlign: 'center', background: '#e7e7e7' }}>Destinatario</th>
                                        <th scope="col" style={{ textAlign: 'center', background: '#e7e7e7' }}>Destino</th>
                                        <th scope="col" style={{ textAlign: 'center', background: '#e7e7e7' }}>Ult. Movimiento</th>
                                        <th scope="col" style={{ textAlign: 'center', background: '#e7e7e7' }}>Opciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {consultandoRotulos ? (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: 'center' }}>Consultando...</td>
                                        </tr>
                                    ) : (
                                        pedidosTrasabilidad.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" style={{ textAlign: 'center' }}>No se encontraron registros.</td>
                                            </tr>
                                        ) : (
                                            <>
                                                {pedidosTrasabilidad.map((pedido, index) => {
                                                    return (
                                                        <tr>
                                                            <td style={{ textAlign: 'center' }}>
                                                                {pedido.guia}
                                                                <br></br>
                                                                <button onClick={() => abrirModalAdmitir(pedido)} className='btn btn-danger'>Trasabilidad</button>
                                                            </td>
                                                            <td style={{ textAlign: 'center' }}>{pedido.referencia}<br></br><b>{pedido.usuario}</b></td>
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
                                                                    </>
                                                                )}
                                                            </td>
                                                            <td style={{ textAlign: 'center' }}>{formattedPrice(pedido.recaudo)}</td>
                                                            <td style={{ textAlign: 'center' }}>
                                                                {pedido.destinatario}<br></br><b>{formatearNumeroCelular2(pedido.telefono)}</b>
                                                            </td>
                                                            <td style={{ textAlign: 'center' }}>
                                                                {pedido.ciudaName}<br></br><b>{pedido.nameDepartamnento}</b>
                                                            </td>
                                                            <td style={{ textAlign: 'center' }}>
                                                                {pedido.estadoTransportadora}<br></br><b>{formateaFechaUltimMovimiento(pedido.fechaUltimoMovimiento)}</b>
                                                            </td>
                                                            <td style={{ textAlign: 'center' }}>
                                                                {pedido.recordatorios > 0 && (
                                                                    <span
                                                                        className="badge badge-pill badge-danger"
                                                                        title={`${pedido.recordatorios} recordatorio(s)`}
                                                                        style={{ margin: '0px 2px', cursor: 'pointer', background: 'red' }}
                                                                    >
                                                                        <i className="bx bx-bell"></i> {pedido.recordatorios}
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                                {cargaMas && (
                                                    <tr>
                                                        <td colSpan="7" style={{ textAlign: 'center' }}>Cargando...</td>
                                                    </tr>
                                                )}
                                            </>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
