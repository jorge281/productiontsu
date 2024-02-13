"use client";

import Image from 'next/image'
import { abrirMenu, cerrarMenu} from '../public/vendor/js/menu.js'
import React, { useEffect,useState } from 'react';
import Cookies from 'js-cookie';
import jwt from 'jsonwebtoken';

const Navbar = ({ contenido }) => {

  const [isLoading, setIsLoading] = useState(true);
  

  useEffect(() => {
    // Obtener el valor de una cookie
    const token = Cookies.get('tokenLogin');
    //const decodedToken = jwt.verify(token, 'TSU-CRMAP82');
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

      console.log(decodedToken);
      //const decodedToken = jwt.verify("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoxLCJub21icmUiOiJKb3JnZSBMdWlzIENhc3RyaWxsb24iLCJwZXJmaWwiOiJBZG1pbiIsImZvdG8iOiJpbWcvdXNlci5wbmciLCJpYXQiOjE3MDc4NTc2MjQsImV4cCI6MTcwNzg2MTIyNH0.rSkL1zgse176OqR_Dx2jI4Xn9SrFVAB81r_fNH3ji-w", 'TSU-CRMAP82');
    }
  },[])

  return (
    <div className="layout-wrapper layout-content-navbar">
      <div className="layout-container">
        <aside id="layout-menu" className="layout-menu menu-vertical menu bg-menu-theme">
          <div className="app-brand demo">
            <a href="/" className="app-brand-link">
              <Image
                src="/img/logo.svg"
                alt="Logo"
                style={{ width: '70%', height: 'auto', margin:'auto' }}
                width={100}
                height={100}
                priority
              />
            </a>
            <a onClick={cerrarMenu} className="layout-menu-toggle menu-link text-large ms-auto d-block d-xl-none">
              <i className="bx bx-chevron-left bx-sm align-middle"></i>
            </a>
          </div>

          <div className="menu-inner-shadow"></div>

          <ul className="menu-inner py-1">
            <li className="menu-item active">
              <a href="index.html" className="menu-link">
                <i className="menu-icon tf-icons bx bx-home-circle"></i>
                <div data-i18n="Analytics">Dashboard</div>
              </a>
            </li>

            <li className="menu-item">
              <a href="" className="menu-link menu-toggle">
                <i className="menu-icon tf-icons bx bx-layout"></i>
                <div data-i18n="Layouts">Layouts</div>
              </a>

              <ul className="menu-sub">
                <li className="menu-item">
                  <a href="layouts-without-menu.html" className="menu-link">
                    <div data-i18n="Without menu">Without menu</div>
                  </a>
                </li>
                <li className="menu-item">
                  <a href="layouts-without-navbar.html" className="menu-link">
                    <div data-i18n="Without navbar">Without navbar</div>
                  </a>
                </li>
                <li className="menu-item">
                  <a href="layouts-container.html" className="menu-link">
                    <div data-i18n="Container">Container</div>
                  </a>
                </li>
                <li className="menu-item">
                  <a href="layouts-fluid.html" className="menu-link">
                    <div data-i18n="Fluid">Fluid</div>
                  </a>
                </li>
                <li className="menu-item">
                  <a href="layouts-blank.html" className="menu-link">
                    <div data-i18n="Blank">Blank</div>
                  </a>
                </li>
              </ul>
            </li>

            <li className="menu-header small text-uppercase">
              <span className="menu-header-text">Pages</span>
            </li>

            <li className="menu-item">
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

        <div className="layout-page">
          <nav
            className="layout-navbar container-xxl navbar navbar-expand-xl navbar-detached align-items-center bg-navbar-theme"
            id="layout-navbar"
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
                      <img src="/img/perfil.jpg" className="w-px-40 h-auto rounded-circle" />
                    </div>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <a className="dropdown-item" href="#">
                        <div className="d-flex">
                          <div className="flex-shrink-0 me-3">
                            <div className="avatar avatar-online">
                              <img src="/img/perfil.jpg" className="w-px-40 h-auto rounded-circle" />
                            </div>
                          </div>
                          <div className="flex-grow-1">
                            <span className="fw-semibold d-block">John Doe</span>
                            <small className="text-muted">Admin</small>
                          </div>
                        </div>
                      </a>
                    </li>
                    <li>
                      <div className="dropdown-divider"></div>
                    </li>
                    <li>
                      <a className="dropdown-item" href="#">
                        <i className="bx bx-user me-2"></i>
                        <span className="align-middle">My Profile</span>
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="#">
                        <i className="bx bx-cog me-2"></i>
                        <span className="align-middle">Settings</span>
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="#">
                        <span className="d-flex align-items-center align-middle">
                          <i className="flex-shrink-0 bx bx-credit-card me-2"></i>
                          <span className="flex-grow-1 align-middle">Billing</span>
                          <span className="flex-shrink-0 badge badge-center rounded-pill bg-danger w-px-20 h-px-20">4</span>
                        </span>
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

          <div className="content-wrapper">

            <div className="container-xxl flex-grow-1 container-p-y">
              {contenido}
            </div>
          </div>
        </div>
      </div>
      <div className="layout-overlay layout-menu-toggle"></div>
    </div>
  )
}

export default Navbar;
