"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

let cargoSite = true;
let fecha1;
let fecha2;
const styles = `
  .total {
    --bs-table-bg-type: rgb(136, 158, 181) !important
  }
`;

export default function Home() {

    const [filaExpandida, setFilaExpandida] = useState(null);
    const [mostrarTipo, setMostrarTipo] = useState(null);
    const [consultando, setConsultando] = useState(true);
    const [orden, setOrden] = useState('usuario');
    const [ahora, setAhora] = useState(new Date());
    const [resumen, setResumen] = useState([]);
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');

    // Función para manejar el cambio en el campo de fecha "Desde"
    const handleFechaDesdeChange = (event) => {
        fecha1 = event.target.value;
        setFechaDesde(event.target.value);
        setConsultando(true);
    };

    useEffect(() => {
        if (filaExpandida !== null) {
            const intervalo = setInterval(() => {
            setAhora(new Date());
            }, 1000);
            return () => clearInterval(intervalo);
        }
    }, [filaExpandida]);

    // Función para manejar el cambio en el campo de fecha "Hasta"
    const handleFechaHastaChange = (event) => {
        fecha2 = event.target.value;
        setFechaHasta(event.target.value);
        setConsultando(true);
    };

    const toggleDetalle = (index, tipo) => {
        if (filaExpandida === index && mostrarTipo === tipo) {
            setFilaExpandida(null);
            setMostrarTipo(null);
        } else {
            setFilaExpandida(index);
            setMostrarTipo(tipo);
            setOrden('usuario'); // reset orden al abrir otra fila
        }
    };

    const calcularHorasFaltantes = (fechaExpira) => {
        const ahora = new Date();
        const expire = new Date(fechaExpira);
        const diferencia = (expire - ahora) / (1000 * 60 * 60); // en horas
        return Math.max(0, diferencia.toFixed(2)); // no menor a 0
    };

    const ordenarDetalle = (datos) => {
        const ordenados = [...datos];
        switch (orden) {
            case 'usuario':
                ordenados.sort((a, b) => a.nombre_usuario.localeCompare(b.nombre_usuario));
                break;
            case 'expire':
                ordenados.sort((a, b) => new Date(a.ultima_fecha_expira) - new Date(b.ultima_fecha_expira));
                break;
            case 'horas':
                ordenados.sort((a, b) => calcularHorasFaltantes(a.ultima_fecha_expira) - calcularHorasFaltantes(b.ultima_fecha_expira));
                break;
        }
        return ordenados;
    };


    useEffect(() => {
        // Función para obtener la fecha actual en el formato adecuado para el input date
        if (cargoSite) {

            const obtenerFechaActual = () => {
                const fecha = new Date();
                const year = fecha.getFullYear();
                let month = fecha.getMonth() + 1;
                let day = fecha.getDate();


                // Asegurarse de que el mes y el día tengan dos dígitos
                month = month < 10 ? '0' + month : month;
                day = day < 10 ? '0' + day : day;

                return `${year}-${month}-${day}`;
            };

            const obtenerFechaActual2 = () => {
                const fecha = new Date();
                fecha.setDate(fecha.getDate() - 7)
                const year = fecha.getFullYear();
                let month = fecha.getMonth() + 1;
                let day = fecha.getDate();


                // Asegurarse de que el mes y el día tengan dos dígitos
                month = month < 10 ? '0' + month : month;
                day = day < 10 ? '0' + day : day;

                return `${year}-${month}-${day}`;
            };

            fecha1 = obtenerFechaActual2();
            fecha2 = obtenerFechaActual();
            // Establecer la fecha actual al estado
            setFechaDesde(obtenerFechaActual2());
            setFechaHasta(obtenerFechaActual());

            cargoSite = false;
            cargarDataCobros()
        }
    }, []);

    const colorFondoHoras = (horas) => {
        if (horas < 6) return '#ffcccc'; // rojo claro
        if (horas < 12) return '#fff4cc'; // amarillo claro
        return '#ccffcc'; // verde claro
    };

    async function cargarDataCobros() {
        await axios.post(`${process.env.ENDPOINT_API2}/api/ticket/resultCreditos`, {
            desde: fecha1,
            hasta: fecha2
        }).then(response => {
            setConsultando(false);
            const datos = response.data.data;
            const ahora = new Date();

            // Agrupador
            const agrupadoPorFecha = {};

            datos.forEach(item => {
                const fechaObj = new Date(item.ultima_fecha_creado);
                const fecha = fechaObj.toISOString().split('T')[0]; // "2025-05-15"

                if (!agrupadoPorFecha[fecha]) {
                    agrupadoPorFecha[fecha] = {
                        fecha,           // ✅ solo día
                        ventanas: 0,
                        deta: [],
                        inactivas: [],
                        activas: []
                    };
                }

                agrupadoPorFecha[fecha].ventanas++;
                agrupadoPorFecha[fecha].deta.push(item);

                const fechaExpira = new Date(item.ultima_fecha_expira);
                if (fechaExpira < ahora) {
                    agrupadoPorFecha[fecha].inactivas.push(item);
                } else {
                    agrupadoPorFecha[fecha].activas.push(item);
                }
            });

            // Convertir a array y ordenar por fecha descendente
            const data = Object.values(agrupadoPorFecha).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

            setResumen(data)
            console.log(data);
        }).catch(error => {
            const swalWithReact = withReactContent(Swal);
            // Manejar el error aquí
            withReactContent(Swal).fire({
                title: "Error",
                text: "Comunica con soporte",
                icon: "error"
            })
        });
    }

    return (
        <div className="container-xxl flex-grow-1 container-p-y">
            <style>{styles}</style>
            <div className="row">
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="d-flex align-items-start align-items-sm-center gap-4">
                            <div className='row' style={{ width: '100%' }}>
                                <div className='col-12'>
                                    <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>REPORTE CLOUD</h1>
                                </div>
                                <div className='col-6'>
                                    <div className="form-group">
                                        <label>Desde:</label>
                                        <input type="date" onChange={handleFechaDesdeChange} className="form-control" placeholder="Desde" value={fechaDesde}></input>
                                    </div>
                                </div>
                                <div className='col-6'>
                                    <div className="form-group">
                                        <label>Hasta:</label>
                                        <input type="date" onChange={handleFechaHastaChange} className="form-control" placeholder="Hasta" value={fechaHasta}></input>
                                    </div>
                                </div>
                                <div className='col-12' style={{ marginTop: '20px' }}>
                                    <table className="table table-striped">
                                        <thead>
                                            <tr>
                                                <th scope="col"></th>
                                                <th colSpan="3" style={{ background: '#566a7f', color: 'white', textAlign: 'center' }}>Ventanas</th>
                                            </tr>
                                            <tr>
                                                <th style={{ background: '#889eb5', color: 'white', textAlign: 'center' }}>Día</th>
                                                <th style={{ background: '#889eb5', color: 'white', textAlign: 'center' }}>Activas</th>
                                                <th style={{ background: '#889eb5', color: 'white', textAlign: 'center' }}>Inactivas</th>
                                                <th style={{ background: '#889eb5', color: 'white', textAlign: 'center', borderRight: '4px solid #566a7f', borderLeft: '4px solid rgb(86, 106, 127)' }}>TOTAL</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {consultando ? (
                                                <tr>
                                                    <td colSpan="4" style={{ textAlign: 'center' }}>Consultando...</td>
                                                </tr>
                                            ) : (
                                                resumen.map((dato2, index) => (
                                                    <React.Fragment key={index}>
                                                        <tr>
                                                            <td style={{ textAlign: 'center' }}>{dato2.fecha}</td>
                                                            <td style={{ textAlign: 'center' }}>
                                                                {dato2.activas.length}{" "}
                                                                <br></br>
                                                                {dato2.activas.length > 0 && (
                                                                    <button className="btn btn-sm btn-link" onClick={() => toggleDetalle(index, 'activas')}>Ver detalle</button>
                                                                )}
                                                            </td>
                                                            <td style={{ textAlign: 'center' }}>
                                                                {dato2.inactivas.length}{" "}
                                                                <br></br>
                                                                {dato2.inactivas.length > 0 && (
                                                                    <button className="btn btn-sm btn-link" onClick={() => toggleDetalle(index, 'inactivas')}>Ver detalle</button>
                                                                )}
                                                            </td>
                                                            <td className='total' style={{ textAlign: 'center', borderRight: '4px solid #566a7f', borderLeft: '4px solid rgb(86, 106, 127)', background: '#889eb5', color: 'white' }}>
                                                                {dato2.ventanas}
                                                            </td>
                                                        </tr>

                                                        {/* Fila con detalles */}
                                                        {filaExpandida === index && (
                                                            <tr>
                                                                <td colSpan="4">
                                                                    <div style={{ padding: '10px', background: '#f0f4f7', border: '1px solid #ccc' }}>
                                                                        <strong>Detalle de {mostrarTipo}</strong>

                                                                        {/* Selector de ordenamiento */}
                                                                        <div className="mb-2">
                                                                            <label className="me-2">Ordenar por:</label>
                                                                            <select value={orden} onChange={(e) => setOrden(e.target.value)}>
                                                                                <option value="usuario">Usuario</option>
                                                                                <option value="expire">Fecha Expira</option>
                                                                                <option value="horas">Horas restantes</option>
                                                                            </select>
                                                                        </div>

                                                                        {/* Tabla de detalles */}
                                                                        <table className="table table-sm table-bordered mt-2">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th></th>
                                                                                    <th>Usuario</th>
                                                                                    <th>Teléfono</th>
                                                                                    <th>PushName</th>
                                                                                    <th>Apertura</th>
                                                                                    <th>Expira</th>
                                                                                    <th>Horas restantes</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {ordenarDetalle(dato2[mostrarTipo]).map((reg, idx) => (
                                                                                    <tr style={{ backgroundColor: colorFondoHoras(calcularHorasFaltantes(reg.ultima_fecha_expira)) }} key={idx}>
                                                                                        <td>{idx + 1}</td>
                                                                                        <td>{reg.nombre_usuario}</td>
                                                                                        <td>{reg.phone}</td>
                                                                                        <td>{reg.pushName}</td>
                                                                                        <td>{new Date(reg.ultima_fecha_creado).toLocaleString()}</td>
                                                                                        <td>{new Date(reg.ultima_fecha_expira).toLocaleString()}</td>
                                                                                        <td>{calcularHorasFaltantes(reg.ultima_fecha_expira)}</td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                ))
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
    )
}