import jwt from "jsonwebtoken";
import {serialize} from "cookie"
import { cookies } from 'next/headers'
import { NextApiResponse } from 'next';

export async function POST(request: Request,res: NextApiResponse) {
  	
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

	cookies().set('tokenLogin', serialized);
	return Response.json("hola");
}
