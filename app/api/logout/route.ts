import { cookies } from 'next/headers'
import { NextApiRequest, NextApiResponse } from 'next';

export async function GET(request: NextApiRequest, res: NextApiResponse) {
    cookies().delete('tokenLogin');
    return Response.redirect(new URL('/', request.url));
}