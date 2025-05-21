import { cookies } from 'next/headers'
import { NextApiRequest, NextApiResponse } from 'next';

export async function GET(req: Request){
    cookies().delete('tokenLogin');
    return Response.redirect('https://www.crmtsu.com:2597/login');
}