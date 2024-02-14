import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
 
// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  
  //return NextResponse.next()
  
  //cookie con el token
  const token = request.cookies.get('tokenLogin');

  //archivos css
  if(request.nextUrl.pathname.includes('_next')){
    return NextResponse.next()
  }
  //imagenes
  else if(request.nextUrl.pathname.includes('/img/')){
    return NextResponse.next()
  }
  //imagenes
  else if(request.nextUrl.pathname.includes('/js/')){
    return NextResponse.next()
  }
  //api
  else if(request.nextUrl.pathname.includes('/api/')){
    return NextResponse.next()
  }
  //imagenes
  else if(request.nextUrl.pathname.includes('/vendor/')){
    return NextResponse.next()
  }else{
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
    }  
  
  }

}
 
