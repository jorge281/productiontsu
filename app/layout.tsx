"use client";

import React, { useEffect, useState } from 'react';

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '../public/vendor/fonts/boxicons.css'
import '../public/vendor/css/core.css'
import '../public/vendor/css/theme-default.css'
import '../public/css/demo.css'
import '../public/vendor/libs/perfect-scrollbar/perfect-scrollbar.css'
import '../public/vendor/css/pages/page-auth.css'
//javscript
//import '../public/vendor/js/helpers.js'
import '../public/js/config.js'

import Image from 'next/image'

const inter = Inter({ subsets: ['latin'] })



export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
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
    <html lang="en">
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
          <div id="content">{children}</div>
        )}
        <script src="/vendor/libs/jquery/jquery.js"></script>
        <script src="/vendor/libs/popper/popper.js"></script>
        <script src="/vendor/js/bootstrap.js"></script>
        <script src="/vendor/libs/perfect-scrollbar/perfect-scrollbar.js"></script>
        <script src="/vendor/js/menu.js"></script>
        <script src="/vendor/js/helpers.js"></script>

        <script src="/js/main.js"></script>
      </body>

      
    </html>
  )
}
