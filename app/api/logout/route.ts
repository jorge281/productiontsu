import { cookies } from 'next/headers'
import { NextApiRequest, NextApiResponse } from 'next';

export async function GET(req: Request){
    cookies().delete('tokenLogin');
    return Response.redirect(new URL('/', req.url));
}