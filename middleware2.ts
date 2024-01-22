import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
 
// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  
  return NextResponse.next()
  /*
  //cookie con el token
  const token = request.cookies.get('tokenLogin');

  //esta en login
  if(request.nextUrl.pathname == '/login'){
    //no esta logeado
    if(token == undefined){
      return NextResponse.next()
    }else{
      return NextResponse.redirect(new URL('/', request.url))
    }
  }else{
    //no esta logeado
    if(token == undefined){
      return NextResponse.redirect(new URL('/login', request.url))
    }else{
     return NextResponse.next()
    }
  }  */ 
}
 
