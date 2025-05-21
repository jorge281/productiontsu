"use client";

import React, { useEffect,useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './style.css'
import withReactContent from 'sweetalert2-react-content';
import { Modal,Button } from 'react-bootstrap';
import { off } from 'process';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

let banderaCarga = true;
let selectedOption2 = 1;
let contPaginacion = 0;
let valBuscador = "";
let limit = 10;
let dataResul = [];
let offset = 0;
let orderBy = "DESC";
let atributoOrder = 'anuncios.id';
var controladorTiempo = "";
let colourOptions = [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' }
]
let dataFiltros2 = [
    {id:1,title:'Whatsapp',estatus:0,select:true,opciones:[]},
    {id:2,title:'Estado',estatus:1,select:true,opciones:[]}
]

const animatedComponents = makeAnimated();

const styles = `
  .total {
    --bs-table-bg-type: rgb(136, 158, 181) !important
  }
`;

export default function Home() {

    const [consultando, setConsultando] = useState(true),
    [selectedOptionsFiltro, setSelectedOptionsFiltro] = useState([]),
    [statusData, setstatusData] = useState([]),
    [dataPaginacion, setdataPaginacion] = useState({contador:0,total:0,paginacion:false,prev:false,next:false,pagina:1}),
    [dataFiltros, setdataFiltros] = useState([{id:1,title:'Whatsapp',estatus:0,select:true,opciones:[]},{id:2,title:'Estado',estatus:1,select:true,opciones:[]}]),
    [data, setData] = useState([]),
    [modalFiltros, setmodalFiltros] = useState(false),
    [selectedOption, setSelectedOption] = useState(1);
    
    
    useEffect(() => {
        //para ejecutar los script una sola vez al cargar la pagina
        if(banderaCarga){
            banderaCarga = false;
            //carga los estados de un anuncio
            cargarEstadosAnuncio();
            //carga las lineas activas
            cargarLineas();
            
            //cargar los anuncios
            cargarDataAnuncios();
        }
    })

    function handleSelectChange(event){
        setSelectedOption(event.target.value);
        selectedOption2 = event.target.value;
        offset = 0;
        contPaginacion = 0;
        cargarDataAnuncios()
    }

    async function cargarEstadosAnuncio(){
        await axios.post(process.env.ENDPOINT_API+'/anuncios/consultStatus').then(response => {

            // Creamos un nuevo array de datos
            dataFiltros2 = dataFiltros2.map(filtro => {
                // Si el título del filtro es 'Estado', actualizamos las opciones
                if (filtro.title === 'Estado') {
                    let opciones = [];
                    for (var i = 0; i < response.data.length; i++) {
                        opciones.push({value: response.data[i].id, label: response.data[i].name})
                    }
                    return { ...filtro, opciones: opciones};
                }
                return filtro; // Mantenemos los otros filtros sin cambios
            });
        
            // Actualizamos el estado con el nuevo array de datos
            setdataFiltros(dataFiltros2);
            
        })
    }

    async function cargarLineas(){
        await axios.post(process.env.ENDPOINT_API+'/whatsapp/consultLineas').then(response => {

            // Creamos un nuevo array de datos
            dataFiltros2 = dataFiltros2.map(filtro => {
                // Si el título del filtro es 'Estado', actualizamos las opciones
                if (filtro.title === 'Whatsapp') {
                    let opciones = [];
                    for (var i = 0; i < response.data.data.length; i++) {
                        opciones.push({value: response.data.data[i].id, label: response.data.data[i].name})
                    }
                    return { ...filtro, opciones: opciones};
                }
                return filtro; // Mantenemos los otros filtros sin cambios
            });
        
            // Actualizamos el estado con el nuevo array de datos
            setdataFiltros(dataFiltros2);
        })
    }

    async function cargarDataAnuncios() {
        await axios.post(process.env.ENDPOINT_API+'/anuncios/consultAll',{ 
            status: selectedOption2,
            limit: limit,
            offset: offset,
            orderBy: orderBy,
            search: valBuscador,
            atributoOrder: atributoOrder
        }).then(response => {
            dataResul = response.data.data;
            for (var i = 0; i < dataResul.length; i++) {
                contPaginacion ++;
                dataResul[i].contPagina = contPaginacion;
            }
            
            setdataPaginacion(prevState => ({ ...prevState, contador: contPaginacion, total: response.data.dataTotal[0]['COUNT(anuncios.id)'] }));
            setData(dataResul);
            
            //habilita la paginacion
            if(response.data.dataTotal[0]['COUNT(anuncios.id)'] > limit){
                setdataPaginacion(prevState => ({ ...prevState, paginacion:true}));
            }

            //tienen siguiente pagina
            if(offset*limit >= response.data.dataTotal[0]['COUNT(anuncios.id)']){
                setdataPaginacion(prevState => ({ ...prevState, next:false}));
            }else{
                setdataPaginacion(prevState => ({ ...prevState, next:true}));
            }

            //no tiene anterior pagina
            if(offset == 0){
                setdataPaginacion(prevState => ({ ...prevState, prev:false}));
            }
        
            setConsultando(false);
        })
    }

    /*input buscador*/
    function buscadorInput(event){
        clearTimeout(controladorTiempo); 
        valBuscador = event;
        offset = 0;
        contPaginacion = 1;
        setConsultando(true);
        controladorTiempo = setTimeout(buscadorInput2,300);
    }

    function buscadorInput2(){
        cargarDataAnuncios();
    }

    //siguiente paginacion
    function siguientePagina(){
        setdataPaginacion(prevState => ({ ...prevState, prev:true,pagina: prevState.pagina  + 1 }));
        offset += limit;
        setConsultando(true);
        cargarDataAnuncios();
        console.log("hola llego")
    }

    //anterior pagina
    function anteriroPagina(){
        setdataPaginacion(prevState => ({ ...prevState,pagina: prevState.pagina  - 1 }));
        if(dataResul.length == limit){
            contPaginacion -= (dataResul.length*2)
        }else{
            contPaginacion -= (limit+dataResul.length)
        }
        
        offset -= limit;
        setConsultando(true);
        cargarDataAnuncios();
    }

    //abrir modal de filtros
    function abrirModalFiltro(){
        setmodalFiltros(true);
        console.log("hola llego")
    }

    //cerrar modales
    function cerrarModal(){
        setmodalFiltros(false);
    }

    //aplicar el filtro
    function aplicarFiltro(){
        dataFiltros.map(filtro => {
            const multimediaElements = document.getElementById(`select-${filtro.id}`);
            console.log(multimediaElements.value);
            console.log(filtro);
        })
    }

     // Función para manejar el cambio de selección
    const handleSelectChange2 = (selected) => {
        console.log(selectd);
    };

    return <>
        <Modal show={modalFiltros} onHide={cerrarModal}>
            <Modal.Header style={{borderBottom:'2px solid #566a7f'}} closeButton>
                <Modal.Title>Filtros</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{paddingTop:'0px'}}>
                <div className="row">
                    {dataFiltros.map((filtro,index)=>(
                        <>
                            <div className="col-2" style={{marginTop:'10px',textAlign:'right',paddingTop:'6px',paddingRight:'0px'}}>
                                {filtro.title}:
                            </div>
                            <div className="col-10" style={{marginTop:'10px'}}>
                                {filtro.select ?(
                                    <Select
                                        id={'select-'+filtro.id}
                                        closeMenuOnSelect={false}
                                        onChange={handleSelectChange2}
                                        components={animatedComponents}
                                        isMulti
                                        options={filtro.opciones}
                                    />
                                ):(
                                    <div></div>
                                )}
                            </div>
                        </>
                    ))}
                    <div className='col-12' style={{marginTop:'20px',textAlign:'right'}}>
                        <button className="btn btn-primary" onClick={aplicarFiltro} style={{background:'#566a7f'}}>Aplicar</button>
                    </div>
                </div>
           </Modal.Body>
        </Modal>   

        <div className="container-xxl flex-grow-1 container-p-y">
            <style>{styles}</style>
            <div className="row">
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="d-flex align-items-start align-items-sm-center gap-4">
                            <div className='row' style={{width:'100%'}}>
                                <div className='col-12'>
                                    <h1 style={{textAlign:'center',marginBottom:'40px'}}>ANUNCIOS</h1>
                                </div>
                                <div className='col-12' style={{marginTop:'20px'}}>
                                    <div className='row mb-3'>
                                        <div className='col-6'>
                                            <button className="btn btn-primary" style={{background:'#566a7f'}}>Registrar</button>
                                        </div>
                                        <div className='col-6' style={{textAlign:'right'}}>
                                            <div className="input-group" style={{width:'inherit',display:'inline-flex'}}>
                                                <span className="input-group-text" style={{background:'#566a7f',color:'white'}}><i className='bx bx-search'></i></span>
                                                <input onChange={(event) => buscadorInput(event.target.value)} type="text" className="form-control" placeholder="Buscar..." aria-label="Username" aria-describedby="basic-addon1"></input>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='row mb-3'>
                                        <div className='col-1' onClick={abrirModalFiltro} style={{textAlign:'right',padding:'10px',cursor:'pointer'}}>
                                            Filtros:
                                        </div>
                                        <div className='col-11'>
                                            <div className="scrolling-wrapper row flex-row flex-nowrap ">
                                                <div className="col-xs-4" style={{height:'30px',width:'auto',background:'#f9fafb',padding:'10px',borderRadius:'20px',margin:'0px 5px'}}>Whatsapp: Resplandor <i class='bx bx-x'></i></div>
                                                <div className="col-xs-4" style={{height:'30px',width:'auto',background:'#f9fafb',padding:'10px',borderRadius:'20px',margin:'0px 5px'}}>Whatsapp: Resplandor <i class='bx bx-x'></i></div>
                                                <div className="col-xs-4" style={{height:'30px',width:'auto',background:'#f9fafb',padding:'10px',borderRadius:'20px',margin:'0px 5px'}}>Whatsapp: Resplandor <i class='bx bx-x'></i></div>
                                                <div className="col-xs-4" style={{height:'30px',width:'auto',background:'#f9fafb',padding:'10px',borderRadius:'20px',margin:'0px 5px'}}>Whatsapp: Resplandor <i class='bx bx-x'></i></div>
                                                <div className="col-xs-4" style={{height:'30px',width:'auto',background:'#f9fafb',padding:'10px',borderRadius:'20px',margin:'0px 5px'}}>Whatsapp: Resplandor <i class='bx bx-x'></i></div>
                                                <div className="col-xs-4" style={{height:'30px',width:'auto',background:'#f9fafb',padding:'10px',borderRadius:'20px',margin:'0px 5px'}}>Whatsapp: Resplandor <i class='bx bx-x'></i></div>
                                                <div className="col-xs-4" style={{height:'30px',width:'auto',background:'#f9fafb',padding:'10px',borderRadius:'20px',margin:'0px 5px'}}>Whatsapp: Resplandor <i class='bx bx-x'></i></div>
                                                <div className="col-xs-4" style={{height:'30px',width:'auto',background:'#f9fafb',padding:'10px',borderRadius:'20px',margin:'0px 5px'}}>Whatsapp: Resplandor <i class='bx bx-x'></i></div>
                                                <div className="col-xs-4" style={{height:'30px',width:'auto',background:'#f9fafb',padding:'10px',borderRadius:'20px',margin:'0px 5px'}}>Whatsapp: Resplandor <i class='bx bx-x'></i></div>
                                            </div>
                                        </div>
                                    </div>
                                    <table className="table table-striped">
                                        <thead>
                                            <tr>
                                                <th style={{background:'#566a7f',color:'white',textAlign:'center',verticalAlign:'middle',border:'1px solid white',borderBottom:'1px solid #566a7f'}} scope="col"></th>
                                                <th style={{background:'#566a7f',color:'white',textAlign:'center',verticalAlign:'middle',border:'1px solid white',borderBottom:'1px solid #566a7f'}} scope="col">Imagen</th>
                                                <th style={{background:'#566a7f',color:'white',textAlign:'center',verticalAlign:'middle',border:'1px solid white',borderBottom:'1px solid #566a7f'}} scope="col">Nombre</th>
                                                <th style={{background:'#566a7f',color:'white',textAlign:'center',verticalAlign:'middle',border:'1px solid white',borderBottom:'1px solid #566a7f'}} scope="col">Whatsapp</th>
                                                <th style={{background:'#566a7f',color:'white',textAlign:'center',verticalAlign:'middle',border:'1px solid white',borderBottom:'1px solid #566a7f'}} scope="col">Opciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {consultando ? (
                                                <tr>
                                                    <td style={{textAlign:'center'}} colspan="5">Consultando...</td>
                                                </tr>
                                            ):( 
                                                <>
                                                    {data.length == 0 ? (
                                                        <tr>
                                                            <td style={{textAlign:'center'}} colspan="5">No se encontraron registros</td>
                                                        </tr>
                                                    ):(
                                                        data.map((dato2, index) => (
                                                            <tr key={index}>
                                                                <td style={{textAlign:'center'}}>
                                                                    {dato2.contPagina}
                                                                </td>
                                                                <td style={{textAlign:'center'}}>
                                                                    <img style={{maxHeight:'100px',margin:'auto'}} src={process.env.ENDPOINT_IMG+'/'+dato2.image}></img>
                                                                </td>
                                                                <td>
                                                                    {dato2.name}
                                                                </td>
                                                                <td style={{textAlign:'center'}}>
                                                                    {dato2.nameWhatsapps}
                                                                </td>
                                                                <td style={{textAlign:'center'}}>
                                                                    <i style={{cursor:'pointer'}} className='bx bxs-edit' ></i>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </>
                                            )}
                                        </tbody>
                                    </table>
                                    <nav aria-label="Page navigation example" style={{marginTop:'10px',textAlign:'right'}}>
                                        <p>{dataPaginacion.contador} de {dataPaginacion.total} registros</p>
                                        {dataPaginacion.paginacion ? (
                                            <ul className="pagination justify-content-end">
                                                <React.Fragment>
                                                    {dataPaginacion.prev ? (
                                                        <li className="page-item" style={{cursor:'pointer'}} onClick={anteriroPagina}>
                                                            <a className="page-link" href="#" tabindex="-1">Anterior</a>
                                                        </li>
                                                    ):(
                                                        <li className="page-item disabled" style={{cursor:'pointer'}}>
                                                            <a className="page-link" href="#" tabindex="-1">Anterior</a>
                                                        </li>
                                                    )}
                                                </React.Fragment>
                                                  
                                                <li className="page-item active">
                                                    <a className="page-link" style={{background:'#566a7f',borderColor:'#566a7f'}} href="#">{dataPaginacion.pagina}</a>
                                                </li>
                                                <React.Fragment>
                                                    {dataPaginacion.next ? (
                                                        <li className="page-item" style={{cursor:'pointer'}} onClick={siguientePagina}>
                                                            <a className="page-link">Siguiente</a>
                                                        </li>
                                                    ):(
                                                        <li className="page-item disabled" style={{cursor:'pointer'}}>
                                                            <a className="page-link">Siguiente</a>
                                                        </li>
                                                    )}
                                                </React.Fragment>
                                            </ul>
                                        ):(
                                            <></>
                                        )}
                                            
                                            
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
    
}