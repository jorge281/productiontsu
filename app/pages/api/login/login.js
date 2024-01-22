

import jwt from "jsonwebtoken";
import {serialize} from "cookie"


export default function handler(req,res){
	 if (req.method === 'POST') {
	    const loginData = req.body;

	    // Aquí puedes realizar la lógica de autenticación
	    // Por ejemplo, verificar las credenciales en una base de datos

	    if (loginData.username === 'nombreUsuario' && loginData.password === 'contrasena') {
	      res.status(200).json({ message: 'Inicio de Sesión Exitoso' });
	    } else {
	      res.status(401).json({ message: 'Credenciales incorrectas' });
	    }
	} else {
	    res.status(405).end(); // Método no permitido
	}

	return 1;
	
	const token = jwt.sign({
		exp: Math.floor((Date.now()/1000)+ (60 *60 * 24 * 30 )),
		id: 1,
		name: "prueba"
	},'secretTSU')

	//tokenLogin
	const serialized = serialize('tokenLogin',token, {
		httpOnly: true,
		secure: process.env.NODE_ENV == 'production',
		sameSite: 'none',
		maxAge: 1000 * 60 * 60 * 24 * 30,
		path: '/'
	})

	res.setHeader('Set-Cookie',serialized)
	//return res.json("login");
	//return res.status(401).json("login");
	return 1;
	console.log("hola423");
}