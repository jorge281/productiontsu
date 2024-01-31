"use client"

import Image from 'next/image'
import axios from 'axios';


export default function Home() {
  
  async function login(){
    const response = await axios.post('/api/login');
  }
  
  return (
    <div className="container-xxl">
      <div className="authentication-wrapper authentication-basic container-p-y">
        <div className="authentication-inner">
          <div className="card">
            <div className="card-body">
              <div className="app-brand justify-content-center">
                <a href="index.html" className="app-brand-link gap-2">
                  <span className="app-brand-logo demo">
                    <Image
                      src="/img/logo.svg"
                      alt="Logo"
                      style={{ width: '60%', height: 'auto', margin:'auto' }}
                      width={100}
                      height={100}
                      priority
                    />
                  </span>
                </a>
              </div>
              <form id="formAuthentication" className="mb-3" action="index.html">
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Usuario</label>
                  <input
                    type="text"
                    className="form-control"
                    id="email"
                    name="email-username"
                    placeholder="Ingresa tu usuario"
                    autoFocus />
                </div>
                <div className="mb-3 form-password-toggle">
                  <div className="d-flex justify-content-between">
                    <label className="form-label" htmlFor="password">Contraseña</label>
                    <a href="auth-forgot-password-basic.html">
                      <small>Has olvidado tu contraseña?</small>
                    </a>
                  </div>
                  <div className="input-group input-group-merge">
                    <input
                      type="password"
                      id="password"
                      className="form-control"
                      name="password"
                      placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;"
                      aria-describedby="password" />
                    <span className="input-group-text cursor-pointer"><i className="bx bx-hide"></i></span>
                  </div>
                </div>
                <div className="mb-3">
                  <button className="btn btn-primary d-grid w-100" type="submit">Ingresar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
