import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { parse } from 'cookie';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {

  //return NextResponse.  next()

  //cookie con el token
  const token = request.cookies.get('tokenLogin');
  let idUser = 0;
  if (token != undefined) {
    const rawValue = token?.value || ''; // string: "tokenLogin=eyJhbGci...; Max-Age=..."

    // Extraer solo el token con una expresión regular
    const match = rawValue.match(/tokenLogin=([^;]+)/);
    const jwt = match ? match[1] : null;

    const [headerBase64, payloadBase64, signature] = jwt.split('.');

    // Decodificar las partes Base64
    const header = JSON.parse(Buffer.from(headerBase64, 'base64').toString('utf-8'));
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf-8'));

    // Crear un objeto JSON con la información decodificada
    const decodedToken = {
      header,
      payload,
      signature
    };

    const palabras = decodedToken.payload.nombre.split(' ');
    const primerNombre = palabras[0];
    const primerApellido = palabras.length > 1 ? palabras[1] : '';
    idUser = decodedToken.payload.user
  }
  //archivos css
  if (request.nextUrl.pathname.includes('_next')) {
    return NextResponse.next()
  }
  //imagenes
  else if (request.nextUrl.pathname.includes('/img/')) {
    return NextResponse.next()
  }
  //imagenes
  else if (request.nextUrl.pathname.includes('/js/')) {
    return NextResponse.next()
  }
  //api
  else if (request.nextUrl.pathname.includes('/api/')) {
    return NextResponse.next()
  }
  //imagenes
  else if (request.nextUrl.pathname.includes('/vendor/')) {
    return NextResponse.next()
  } else {
    //esta en login
    if (request.nextUrl.pathname == '/login') {
      //no esta logeado
      if (token == undefined) {
        return NextResponse.next()
      } else {
        return NextResponse.redirect(new URL('/CRM2', request.url))
      }
    }
    if (request.nextUrl.pathname == '/') {
      if(idUser == 31){
        return NextResponse.redirect(new URL('/conciliacion', request.url))
      }
      return NextResponse.redirect(new URL('/CRM2', request.url))
    } else {
      //no esta logeado
      if (token == undefined) {
        return NextResponse.redirect(new URL('/login', request.url))
      } else {
        if(idUser == 31 && request.nextUrl.pathname != '/conciliacion'){
          return NextResponse.redirect(new URL('/conciliacion', request.url))
        }
        return NextResponse.next()
      }
    }

  }

}

