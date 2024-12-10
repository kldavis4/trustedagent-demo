import {NextRequest, NextResponse} from 'next/server';

export function middleware(request: NextRequest) {
    if (request.nextUrl.pathname === '/') {
        return NextResponse.redirect(new URL('/crawler', request.url));
    }

    // Allow the request to proceed if it's not for '/'
    return NextResponse.next();
}

export const config = {
    matcher: '/',
};