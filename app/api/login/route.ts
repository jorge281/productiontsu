import jwt from "jsonwebtoken";
import {serialize} from "cookie"
import { cookies } from 'next/headers'
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';


const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	// Tu lógica de manejo de la ruta aquí
	if (req.method === 'POST') {
		// Leer el cuerpo de la solicitud
		const chunks = [];
		for await (const chunk of req.body) {
		chunks.push(chunk);
		}

		// Combinar los chunks en un Buffer o String según sea necesario
		const body = Buffer.concat(chunks).toString();

		// Parsear el cuerpo JSON si es necesario
		const datosDeLogin2 = JSON.parse(body);

		const datosDeLogin = {
			usuario: datosDeLogin2.usuario,
			password: datosDeLogin2.password
		};
		
		var dataRespuesta = {
			flag        : '-1',
			message     : 'Error en el servidor',
			background  : '',
			bordercolor : ''
		}

		const responseServer = await axios.post(process.env.ENDPOINT_API+'/authentication/login',{params: datosDeLogin});
		
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
			dataRespuesta['flag'] = 3;
			return Response.json(dataRespuesta);
		}else{
			dataRespuesta['flag'] = responseServer.data.flag
			dataRespuesta['message'] = responseServer.data.message
			dataRespuesta['background'] = responseServer.data.background
			dataRespuesta['bordercolor'] = responseServer.data.bordercolor
			return Response.json(dataRespuesta);
		}

		
		return Response.json(dataRespuesta);
	}
}

export default handler;
