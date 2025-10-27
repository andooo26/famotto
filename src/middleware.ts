import { auth } from "./auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  // ログインページは認証しない
  if (pathname === "/login") {
    if (isLoggedIn) {
      // ルートへリダイレクト
      return NextResponse.redirect(new URL("/", req.url))
    }
    return NextResponse.next()
  }

  // 未認証ならloginへ
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}