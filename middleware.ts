import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const nivel = req.cookies.get('nivel_acesso')?.value
  const codigoSala = req.cookies.get('codigo_sala')?.value

  const urlParts = req.nextUrl.pathname.split('/').filter(Boolean)
  const [rotaCodigoSala, rotaNivel] = urlParts

  if (!codigoSala || !nivel) {
    return NextResponse.redirect(new URL('/enter', req.url))
  }

  if (codigoSala !== rotaCodigoSala || nivel !== rotaNivel) {
    return NextResponse.redirect(new URL('/enter', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/:codigo_sala/(admin|voluntario|visitante)'],
}