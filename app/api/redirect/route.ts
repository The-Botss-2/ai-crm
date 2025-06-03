import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const urlParam = request.nextUrl.searchParams.get('url');

    if (!urlParam) {
        return NextResponse.json({ error: 'URL query parameter is required' }, { status: 400 });
    }

    try {
        // Validate the URL (optional security check)
        const redirectUrl = new URL(urlParam);

        // Perform the redirect
        return NextResponse.redirect(redirectUrl.toString());
    } catch (error) {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }
}
