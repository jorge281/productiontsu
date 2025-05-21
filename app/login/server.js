"use server"

import jwt from "jsonwebtoken";
import {serialize} from "cookie"
import { cookies } from 'next/headers'
import axios from 'axios';


export async function server(token){
    // Manejar la respuesta exitosa aquí
    const serialized = serialize('tokenLogin',token, {
        httpOnly: true,
        secure: process.env.NODE_ENV == 'production',
        sameSite: 'none',
        maxAge: 1000 * 60 * 60 * 24 * 30,
        path: '/'
    })

    cookies().set('tokenLogin', serialized);
    return 1;
}