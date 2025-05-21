"use client";

import Image from 'next/image'
import { abrirMenu, cerrarMenu} from '../public/vendor/js/menu.js'
import React, { useEffect,useState } from 'react';
import Cookies from 'js-cookie';
import jwt from 'jsonwebtoken';

const Navbar = ({ contenido }) => {

  const [isLoading, setIsLoading] = useState(true);
  const [usuario, setUsuario] = useState({ 
    nombre : '',
    perfil : '',
    foto   : ''
  });
  const [loaded2, setLoaded2] = useState(false);
  

  useEffect(() => {
    // Obtener el valor de una cookie
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
        foto   : process.env.ENDPOINT_IMG+decodedToken.payload.foto
      });
    }
   
  },[])

  return (
    <>
    
    <div className="layout-wrapper layout-content-navbar">
      <div className="layout-container">
        <aside id="layout-menu" style={{display:'none'}} className="opacityOpen layout-menu menu-vertical menu bg-menu-theme">
          <div className="app-brand demo">
            <a href="/" className="app-brand-link">
              <Image
                src="/img/logo.svg"
                alt="Logo"
                style={{ width: '70%', height: 'auto', margin:'auto' }}
                width={100}
                height={100}
                
              />
            </a>
            <a onClick={cerrarMenu} className="layout-menu-toggle menu-link text-large ms-auto d-block d-xl-none">
              <i className="bx bx-chevron-left bx-sm align-middle"></i>
            </a>
          </div>

          <div className="menu-inner-shadow"></div>

          <ul className="menu-inner py-1">
            <li className="menu-item active" style={{display:'none'}}>
              <a href="/" className="menu-link">
                <i className="menu-icon tf-icons bx bx-home-circle"></i>
                <div data-i18n="Analytics">Dashboard</div>
              </a>
            </li>

            <li className="menu-item active">
              <a href="/CRM" className="menu-link">
                <i className="menu-icon tf-icons bx bxl-whatsapp"></i>
                <div data-i18n="Analytics">CRM</div>
              </a>
            </li>

            <li className="menu-header small text-uppercase" style={{display:'none'}}>
              <span className="menu-header-text">Pages</span>
            </li>

            <li className="menu-item" style={{display:'none'}}> 
              <a href="" className="menu-link menu-toggle">
                <i className="menu-icon tf-icons bx bx-dock-top"></i>
                <div data-i18n="Account Settings">Account Settings</div>
              </a>
              <ul className="menu-sub">
                <li className="menu-item">
                  <a href="pages-account-settings-account.html" className="menu-link">
                    <div data-i18n="Account">Account</div>
                  </a>
                </li>
                <li className="menu-item">
                  <a href="pages-account-settings-notifications.html" className="menu-link">
                    <div data-i18n="Notifications">Notifications</div>
                  </a>
                </li>
                <li className="menu-item">
                  <a href="pages-account-settings-connections.html" className="menu-link">
                    <div data-i18n="Connections">Connections</div>
                  </a>
                </li>
              </ul>
            </li>

          </ul>

        </aside>

        <div className="layout-page" style={{paddingLeft:'0px'}}>
          <nav
            className="opacityOpen layout-navbar container-xxl navbar navbar-expand-xl navbar-detached align-items-center bg-navbar-theme"
            id="layout-navbar"
            style={{height:'60px'}}
          >
            <div className="layout-menu-toggle navbar-nav align-items-xl-center me-3 me-xl-0 d-xl-none">
              <a className="nav-item nav-link px-0 me-xl-4" onClick={abrirMenu}>
                <i className="bx bx-menu bx-sm"></i>
              </a>
            </div>

            <div className="navbar-nav-right d-flex align-items-center" id="navbar-collapse">
              <div className="navbar-nav align-items-center">
              </div>

              <ul className="navbar-nav flex-row align-items-center ms-auto">
                <li className="nav-item lh-1 me-3">
                  En Linea
                </li>

                <li className="nav-item navbar-dropdown dropdown-user dropdown">
                  <a className="nav-link dropdown-toggle hide-arrow" href="" data-bs-toggle="dropdown">
                    <div className="avatar avatar-online">
                      <img 
                        src={usuario.foto}
                        alt="Logo"
                        className='w-px-40 h-auto rounded-circle'
                        width={100}
                        height={100}
                      >
                      </img>
                    </div>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <a className="dropdown-item" href="#">
                        <div className="d-flex">
                          <div className="flex-shrink-0 me-3">
                            <div className="avatar avatar-online">
                              <img 
                                src={usuario.foto}
                                alt="Logo"
                                className='w-px-40 h-auto rounded-circle'
                                width={100}
                                height={100}
                              >
                              </img>
                            </div>
                          </div>
                          <div className="flex-grow-1">
                            <span className="fw-semibold d-block">{usuario.nombre}</span>
                            <small className="text-muted">{usuario.perfil}</small>
                          </div>
                        </div>
                      </a>
                    </li>
                    <li>
                      <div className="dropdown-divider"></div>
                    </li>
                    <li>
                      <a className="dropdown-item" href="/user/perfil">
                        <i className="bx bx-user me-2"></i>
                        <span className="align-middle">Perfil</span>
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="/user/seguridad">
                        <i className="bx bx-cog me-2"></i>
                        <span className="align-middle">Seguridad</span>
                      </a>
                    </li>
                    <li>
                      <div className="dropdown-divider"></div>
                    </li>
                    <li>
                      <a className="dropdown-item" href="api/logout">
                        <i className="bx bx-power-off me-2"></i>
                        <span className="align-middle">Salir</span>
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </nav>

          <div className="content-wrapper" style={{maxHeight:'calc(100vh - 100px)'}}>

            <div className="container-xxl flex-grow-1 container-p-y" style={{height:'100%'}}>
              {contenido}
            </div>
          </div>
          <p id="pFooter" style={{textAlign:'center',paddingTop:'10px'}}>
            By. Tres Son Uno
          </p>
        </div>
      </div>
      <div className="layout-overlay layout-menu-toggle"></div>
    </div>
    
    </>
  )
}

export default Navbar;
