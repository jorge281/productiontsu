"use server"

import jwt from "jsonwebtoken";
import {serialize} from "cookie"
import { cookies } from 'next/headers'
import axios from 'axios';


export async function server(){
    
    // Manejar la respuesta exitosa aquí
    cookies().set('updateBackend', 1);
    return 1;
}