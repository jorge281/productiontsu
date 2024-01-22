"use client"

import Image from 'next/image'
import axios from 'axios';

export default function Home() {
  
  async function login(){
    const response = await axios.post('/api/login');
  }
  
  return (
    <h1>Login</h1>
  )
}
