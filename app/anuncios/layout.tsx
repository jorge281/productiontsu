"use client";

import React, { use, useEffect, useState } from 'react';

import Cookies from 'js-cookie';
import jwt from 'jsonwebtoken';
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '../public/vendor/fonts/boxicons.css'
import '../public/vendor/css/core.css'
import '../public/vendor/css/theme-default.css'
import '../public/css/demo.css'
import '../public/vendor/libs/perfect-scrollbar/perfect-scrollbar.css'
import '../public/vendor/css/pages/page-auth.css'
import Navbar from './navbar.js';

//javscript
import '../public/js/config.js'

import Image from 'next/image'

const inter = Inter({ subsets: ['latin'] })



export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isLogin, setLogin] = useState(false);
  
  useEffect(() => {
    
    const token = Cookies.get('tokenLogin');
    if(token == undefined){
      setLogin(true);
    }
    // Simulating a delay for the loader (you can replace this with your actual loading logic)
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Adjust the delay as needed

    return () => {
      // Clear the timeout to avoid memory leaks
      clearTimeout(loadingTimeout);
    };
  }, []);

  return (
    <html lang="en"
    className="light-style layout-menu-fixed"
    dir="ltr"
    data-theme="theme-default"
    id="htmlElement"
    data-template="vertical-menu-template-free">
      <head>
        
      </head>
      <body className={inter.className}>

        {isLoading ? (
          <div id="loader">
            <div id="logo" style={{paddingBottom:'10px',width:'80%'}}>
              <Image
                src="/img/logo.svg"
                alt="Logo"
                style={{ width: '100%', height: 'auto', margin:'auto' }}
                width={100}
                height={100}
                priority
              />
            </div>
            <div id="progressbar"></div>
          </div>
        ) : (
          <div id="content">
            {isLogin ? (
              children
            ):(
              <Navbar contenido={children}></Navbar>
            )}
            
          </div>
        )}
        <script src="/vendor/libs/jquery/jquery.js" async></script>
        <script src="/vendor/libs/popper/popper.js" async></script>
        <script src="/js/encoderWorker.umd.js" async></script>
        <script src="/vendor/js/bootstrap.js" async></script>
        <script src="/vendor/libs/perfect-scrollbar/perfect-scrollbar.js" async></script>
        <script src="/vendor/js/menu.js" async></script>
        <script src="/vendor/js/helpers.js" async></script>

        <script src="/vendor/libs/apex-charts/apexcharts.js" async></script>

        <script src="/js/main.js" async></script>
      </body>

      
    </html>
  )
}
