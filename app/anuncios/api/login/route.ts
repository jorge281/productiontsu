
function checkLogin(username, password) {
	// Aquí colocarías la lógica para verificar el inicio de sesión
	// Por ejemplo, podrías consultar una base de datos para verificar las credenciales
	if (username === 'usuario' && password === 'contraseña') {
	  return true;
	} else {
	  return false;
	}
  }
  
module.exports = { checkLogin };

/*import jwt from "jsonwebtoken";
import {serialize} from "cookie"
import { cookies } from 'next/headers'
import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';


export async function POST(request: Request) {

	var dataRespuesta = {
		flag        : '-1',
		message     : 'Error en el servidor',
		background  : '',
		bordercolor : ''
	}
	console.log("hola llego")
	if(request.body != null){
		const chunks: Uint8Array[] = [];

		const reader = request.body.getReader();

		try {
			while (true) {
				const { done, value } = await reader.read();

				if (done) {
				break;
				}

				chunks.push(value);
			}

			// Calculate the total length of all chunks
			const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);

			// Combine the chunks into a single Uint8Array
			const combinedBuffer = new Uint8Array(totalLength);

			let offset = 0;

			chunks.forEach(chunk => {
				combinedBuffer.set(chunk, offset);
				offset += chunk.length;
			});

			// If you want to convert the Uint8Array to a string, you can use TextDecoder
			const text = JSON.parse(new TextDecoder().decode(combinedBuffer));
			//const text = JSON.parse(new TextDecoder().decode(combinedBuffer));
			// Combinar los chunks en un Buffer o String según sea necesario
			const datosDeLogin = {
				usuario: text.usuario,
				password: text.password
			};
			
			
	
			const responseServer = await axios.post(process.env.ENDPOINT_API+'/authentication/login',{params: datosDeLogin});
			console.log(responseServer);
			if(responseServer.data.flag == 3){
					
				// Manejar la respuesta exitosa aquí
				const serialized = serialize('tokenLogin',responseServer.data.token, {
					httpOnly: true,
					secure: process.env.NODE_ENV == 'production',
					sameSite: 'none',
					maxAge: 1000 * 60 * 60 * 24 * 30,
					path: '/'
				})
			
				cookies().set('tokenLogin', serialized);
				dataRespuesta['flag'] = '3';
				return Response.json(dataRespuesta);
			}else{
				dataRespuesta['flag'] = responseServer.data.flag
				dataRespuesta['message'] = responseServer.data.message
				dataRespuesta['background'] = responseServer.data.background
				dataRespuesta['bordercolor'] = responseServer.data.bordercolor
				return Response.json(dataRespuesta);
			}
		} finally {
			return Response.json(dataRespuesta);
		}
	}
}
*/