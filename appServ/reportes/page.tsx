"use client";

import React, { useEffect,useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

let fecha1;
let fecha2;
let fecha3;

const styles = `
  .total {
    --bs-table-bg-type: rgb(136, 158, 181) !important
  }
`;

export default function Home() {

    const [consultando, setConsultando] = useState(true);
    const [consultando2, setConsultando2] = useState(true);
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [fechaDesde2, setFechaDesde2] = useState('');
    const [datos, setDatos] = useState([]);
    const [datos2, setDatos2] = useState([]);

    // Función para manejar el cambio en el campo de fecha "Desde"
    const handleFechaDesdeChange = (event) => {
        fecha1 = event.target.value;
        setFechaDesde(event.target.value);
        setConsultando(true);
        cargarData();
    };

    // Función para manejar el cambio en el campo de fecha "Desde"
    const handleFechaDesdeChange2 = (event) => {
        fecha3 = event.target.value;
        setFechaDesde(event.target.value);
        setConsultando2(true);
        cargarData2();
    };

    // Función para manejar el cambio en el campo de fecha "Hasta"
    const handleFechaHastaChange = (event) => {
        fecha2 = event.target.value;
        setFechaHasta(event.target.value);
        setConsultando(true);
        cargarData();
    };

    useEffect(() => {
        // Función para obtener la fecha actual en el formato adecuado para el input date
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

        fecha1 = obtenerFechaActual();
        fecha2 = obtenerFechaActual();
        fecha3 = obtenerFechaActual();
        // Establecer la fecha actual al estado
        setFechaDesde(obtenerFechaActual());
        setFechaHasta(obtenerFechaActual());
        setFechaDesde2(obtenerFechaActual());
        cargarData();
        cargarData2();
    }, []);

    //function para cargar la data del reporte
    async function cargarData(){
        await axios.post(process.env.ENDPOINT_API+'/whatsapp/reporteTitckets',{ 
            desde: fecha1,
            hasta: fecha2
        }).then(response => {
            let arrayAsesores = response.data.datos;
            for (var e = arrayAsesores.length - 1; e >= 0; e--) {
                //aceptados
                arrayAsesores[e].aceptadosBiblia = [];
                arrayAsesores[e].aceptadosResplandor = [];
                for (var i = response.data.result.length - 1; i >= 0; i--) {
                    if(response.data.result[i].idUser == arrayAsesores[e].id){
                        if(response.data.result[i].linea == 4){
                            arrayAsesores[e].aceptadosBiblia.push(response.data.result[i].id)
                        }else{
                            arrayAsesores[e].aceptadosResplandor.push(response.data.result[i].id)
                        }
                    }
                }

                //asignados
                arrayAsesores[e].asignadosBiblia = [];
                arrayAsesores[e].asignadosResplandor = [];
                for (var i = response.data.asignados.length - 1; i >= 0; i--) {
                    if(response.data.asignados[i].idUser == arrayAsesores[e].id){
                        if(response.data.asignados[i].linea == 4){
                            arrayAsesores[e].asignadosBiblia.push(response.data.asignados[i].id)
                        }else{
                            arrayAsesores[e].asignadosResplandor.push(response.data.asignados[i].id)
                        }
                    }
                }
            }
            setDatos(response.data.datos);
            setConsultando(false);
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

      //function para cargar la data del reporte
    async function cargarData2(){
        await axios.post(process.env.ENDPOINT_API+'/whatsapp/reporteTitcketsCola',{ 
            hasta: fecha3,
        }).then(response => {
            let arrayAsesores = response.data.asesores;
            for (var e = arrayAsesores.length - 1; e >= 0; e--) {
                //aceptados
                /*arrayAsesores[e].aceptadosBiblia = [];
                arrayAsesores[e].aceptadosResplandor = [];
                for (var i = response.data.result.length - 1; i >= 0; i--) {
                    if(response.data.result[i].idUser == arrayAsesores[e].id){
                        if(response.data.result[i].linea == 4){
                            arrayAsesores[e].aceptadosBiblia.push(response.data.result[i].id)
                        }else{
                            arrayAsesores[e].aceptadosResplandor.push(response.data.result[i].id)
                        }
                    }
                }

                //asignados
                arrayAsesores[e].asignadosBiblia = [];
                arrayAsesores[e].asignadosResplandor = [];
                for (var i = response.data.asignados.length - 1; i >= 0; i--) {
                    if(response.data.asignados[i].idUser == arrayAsesores[e].id){
                        if(response.data.asignados[i].linea == 4){
                            arrayAsesores[e].asignadosBiblia.push(response.data.asignados[i].id)
                        }else{
                            arrayAsesores[e].asignadosResplandor.push(response.data.asignados[i].id)
                        }
                    }
                }*/
            }
            setDatos2(arrayAsesores);
            setConsultando2(false);
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
                            <div className='row' style={{width:'100%'}}>
                                <div className='col-12'>
                                    <h1 style={{textAlign:'center',marginBottom:'40px'}}>REPORTE ASIGNADOS</h1>
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
                                <div className='col-12' style={{marginTop:'20px'}}>
                                    <table className="table table-striped">
                                        <thead>
                                            <tr>
                                                <th rowspan="2" style={{background:'#566a7f',color:'white',textAlign:'center',verticalAlign:'middle',border:'1px solid white',borderBottom:'1px solid #566a7f'}} scope="col">Asesor</th>
                                                <th colspan="3" style={{background:'#566a7f',color:'white',textAlign:'center',borderRight:'4px solid #566a7f'}} scope="col">Asignados</th>
                                                <th colspan="3" style={{background:'#566a7f',color:'white',textAlign:'center'}} scope="col">Aceptados</th>
                                            </tr>
                                            <tr>
                                                <th style={{background:'#889eb5',color:'white',textAlign:'center'}} scope="col">Mi Biblia</th>
                                                <th style={{background:'#889eb5',color:'white',textAlign:'center'}} scope="col">Resplandor</th>
                                                <th style={{background:'#889eb5',color:'white',textAlign:'center',borderRight:'4px solid #566a7f',borderLeft:'4px solid rgb(86, 106, 127)'}} scope="col">TOTAL</th>
                                                <th style={{background:'#889eb5',color:'white',textAlign:'center'}} scope="col">Mi Biblia</th>
                                                <th style={{background:'#889eb5',color:'white',textAlign:'center'}} scope="col">Resplandor</th>
                                                <th style={{background:'#889eb5',color:'white',textAlign:'center',borderRight:'4px solid #566a7f',borderLeft:'4px solid rgb(86, 106, 127)'}} scope="col">TOTAL</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {consultando ? (
                                                <tr>
                                                    <td style={{textAlign:'center'}} colspan="7">Consultando...</td>
                                                </tr>
                                            ):(
                                                datos.map((dato2, index) => (
                                                    <tr key={index}>
                                                        <td style={{textAlign:'center'}}>
                                                            {dato2.name}
                                                        </td>
                                                        <td style={{textAlign:'center',color:'red'}}>
                                                            {dato2.asignadosBiblia.length}
                                                        </td>
                                                        <td style={{textAlign:'center',color:'green'}}>
                                                            {dato2.asignadosResplandor.length}
                                                        </td>
                                                        <td className='total' style={{textAlign:'center',borderRight:'4px solid #566a7f',borderLeft:'4px solid rgb(86, 106, 127)',background:'#889eb5',color:'white',backgroundColor:'rgb(136, 158, 181) !important'}}>
                                                            {dato2.asignadosBiblia.length+dato2.asignadosResplandor.length}
                                                        </td>

                                                        <td style={{textAlign:'center',color:'red'}}>
                                                            {dato2.aceptadosBiblia.length}
                                                        </td>
                                                        <td style={{textAlign:'center',color:'green'}}>
                                                            {dato2.aceptadosResplandor.length}
                                                        </td>
                                                        <td className='total' style={{textAlign:'center',background:'#889eb5',color:'white',borderRight:'4px solid #566a7f',borderLeft:'4px solid rgb(86, 106, 127)'}}>
                                                            {dato2.aceptadosBiblia.length+dato2.aceptadosResplandor.length}
                                                        </td>
                                                        
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className='col-12'>
                                    <h1 style={{textAlign:'center',marginTop:'40px',marginBottom:'40px'}}>REPORTE COLA</h1>
                                </div>
                                <div className='col-6'></div>
                                <div className='col-6'>
                                    <div className="form-group">
                                        <label>Hasta:</label>
                                        <input type="date" onChange={handleFechaDesdeChange2} className="form-control" placeholder="Desde" value={fechaDesde2}></input>
                                    </div>
                                </div>
                                <div className='col-12' style={{marginTop:'20px'}}>
                                    <table className="table table-striped">
                                        <thead>
                                            <tr>
                                                <th rowspan="2" style={{background:'#566a7f',color:'white',textAlign:'center',verticalAlign:'middle',border:'1px solid white',borderBottom:'1px solid #566a7f'}} scope="col">Asesor</th>
                                                <th colspan="3" style={{background:'#566a7f',color:'white',textAlign:'center',borderRight:'4px solid #566a7f'}} scope="col">En Cola</th>
                                                <th colspan="3" style={{background:'#566a7f',color:'white',textAlign:'center'}} scope="col">Trabajando</th>
                                            </tr>
                                            <tr>
                                                <th style={{background:'#889eb5',color:'white',textAlign:'center'}} scope="col">Mi Biblia</th>
                                                <th style={{background:'#889eb5',color:'white',textAlign:'center'}} scope="col">Resplandor</th>
                                                <th style={{background:'#889eb5',color:'white',textAlign:'center',borderRight:'4px solid #566a7f',borderLeft:'4px solid rgb(86, 106, 127)'}} scope="col">TOTAL</th>
                                                <th style={{background:'#889eb5',color:'white',textAlign:'center'}} scope="col">Mi Biblia</th>
                                                <th style={{background:'#889eb5',color:'white',textAlign:'center'}} scope="col">Resplandor</th>
                                                <th style={{background:'#889eb5',color:'white',textAlign:'center',borderRight:'4px solid #566a7f',borderLeft:'4px solid rgb(86, 106, 127)'}} scope="col">TOTAL</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {consultando2 ? (
                                                <tr>
                                                    <td style={{textAlign:'center'}} colspan="7">Consultando...</td>
                                                </tr>
                                            ):(
                                                datos.map((dato2, index) => (
                                                    <tr key={index}>
                                                        <td style={{textAlign:'center'}}>
                                                            {dato2.name}
                                                        </td>
                                                        <td style={{textAlign:'center',color:'red'}}>
                                                            {dato2.asignadosBiblia.length}
                                                        </td>
                                                        <td style={{textAlign:'center',color:'green'}}>
                                                            {dato2.asignadosResplandor.length}
                                                        </td>
                                                        <td className='total' style={{textAlign:'center',borderRight:'4px solid #566a7f',borderLeft:'4px solid rgb(86, 106, 127)',background:'#889eb5',color:'white',backgroundColor:'rgb(136, 158, 181) !important'}}>
                                                            {dato2.asignadosBiblia.length+dato2.asignadosResplandor.length}
                                                        </td>

                                                        <td style={{textAlign:'center',color:'red'}}>
                                                            {dato2.aceptadosBiblia.length}
                                                        </td>
                                                        <td style={{textAlign:'center',color:'green'}}>
                                                            {dato2.aceptadosResplandor.length}
                                                        </td>
                                                        <td className='total' style={{textAlign:'center',background:'#889eb5',color:'white',borderRight:'4px solid #566a7f',borderLeft:'4px solid rgb(86, 106, 127)'}}>
                                                            {dato2.aceptadosBiblia.length+dato2.aceptadosResplandor.length}
                                                        </td>
                                                        
                                                    </tr>
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