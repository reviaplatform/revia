import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://lightsalmon-ibis-912038.hostingersite.com';

async function handleRequest(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const pathParts = (await params).path;
  const path = pathParts.join('/');
  
  // Guard against double prefixing: if input is /api/v1/auth/refresh, 
  // we want to proxy to BACKEND/api/v1/auth/refresh, not /api/v1/v1/auth/refresh
  // Determine the subPath (path minus the 'v1' prefix if present)
  let subPath = path;
  if (pathParts[0] === 'v1') {
    subPath = pathParts.slice(1).join('/');
  }

  const targetUrl = `${BACKEND_URL.replace(/\/$/, '')}/api/v1/${subPath}${request.nextUrl.search}`;
  
  const method = request.method;
  console.log(`🌉 Bridge: ${method} /api/${path} -> ${targetUrl}`);

  // Create clean headers for backend
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Explicitly forward Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader) {
    console.log(`🔑 Bridge [${subPath}]: Forwarding Auth header...`);
    headers['Authorization'] = authHeader;
  } else {
    // Only log if it's a known protected route and NOT a guest likely page
    if (subPath === 'me' || (subPath.startsWith('auth/') && subPath !== 'auth/send-otp')) {
      console.log(`ℹ️ Bridge [${subPath}]: Request without Auth header (Guest?)`);
    }
  }

  // Forward optional browser headers
  const forwardHeaders = ['User-Agent', 'Origin', 'Referer', 'Accept-Language', 'Cookie'];
  forwardHeaders.forEach(h => {
    const val = request.headers.get(h);
    if (val) {
      // Per API preference: skip cookies for refresh (uses Bearer only)
      if (h.toLowerCase() === 'cookie' && subPath === 'auth/refresh') return;
      headers[h] = val;
    }
  });

  // Deep Token Search Helper
  const findTokensInBody = (obj: any, depth: number = 0): string[] => {
    if (!obj || depth > 5) return [];
    let found: string[] = [];
    for (const key in obj) {
      const val = obj[key];
      if (typeof val === 'string' && key.toLowerCase().includes('token')) {
        found.push(`${key}:${val.substring(0, 5)}...`);
      } else if (typeof val === 'object' && val !== null) {
        found = found.concat(findTokensInBody(val, depth + 1));
      }
    }
    return found;
  };

  try {
    let body;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const textBody = await request.text();
      body = textBody ? JSON.parse(textBody) : undefined;
    }

    // Level 1: Try with /api/v1/
    let response = await axios({
      method,
      url: targetUrl,
      data: body,
      headers,
      validateStatus: () => true,
      responseType: 'text',
    });
    
    console.log(`📡 Bridge: [1/3] Primary (/api/v1/) for ${path} -> ${response.status}`);

    // Level 2: If 404, try /api/path (without v1)
    if (response.status === 404) {
      const apiOnlyUrl = `${BACKEND_URL.replace(/\/$/, '')}/api/${subPath}${request.nextUrl.search}`;
      console.log(`⚠️  [2/3] Trying without v1 -> ${apiOnlyUrl}`);
      response = await axios({
        method,
        url: apiOnlyUrl,
        data: body,
        headers,
        validateStatus: () => true,
        responseType: 'text',
      });
      console.log(`📡 Bridge: [2/3] Response for ${path} -> ${response.status}`);
    }

    // Level 3: If still 404, try root path
    if (response.status === 404) {
      const rootUrl = `${BACKEND_URL.replace(/\/$/, '')}/${path}${request.nextUrl.search}`;
      console.log(`⚠️  [3/3] Trying Root -> ${rootUrl}`);
      response = await axios({
        method,
        url: rootUrl,
        data: body,
        headers,
        validateStatus: () => true,
        responseType: 'text',
      });
      console.log(`📡 Bridge: [3/3] Response for ${path} -> ${response.status}`);
    }

    // Safely parse JSON or return null/empty
    const bodyText = response.data || '';
    let responseData;
    try {
      responseData = bodyText ? JSON.parse(bodyText) : null;
      if (responseData) {
        const topKeys = Object.keys(responseData);
        const dataKeys = responseData.data ? Object.keys(responseData.data) : [];
        console.log(`📦 Bridge: Response keys for ${path}: [${topKeys.join(', ')}] | data: [${dataKeys.join(', ')}]`);
      }
    } catch {
      responseData = bodyText;
    }

    if (subPath.includes('auth/refresh')) {
      console.log(`🔍 Bridge: Full response payload for ${subPath}: ${bodyText.substring(0, 500)}`);
    }

    const nextResponse = NextResponse.json(responseData, { 
      status: response.status,
    });
    
    // Forward and sanitize Set-Cookie headers from backend
    const setCookie = response.headers['set-cookie'];
    const sanitizeSetCookie = (cookie: string) => {
      return cookie
        .replace(/Domain=[^;]+;?/i, '') // Remove domain to allow localhost/any dev host
        .replace(/Secure;?/i, '')       // Remove secure flag for http local dev
        .replace(/Path=[^;]+;?/i, 'Path=/;') // Force root path so it's available to all /api routes
        .replace(/SameSite=None/i, 'SameSite=Lax') // SameSite=None requires Secure
        .trim()
        .replace(/;$/, '');
    };

    if (setCookie) {
      console.log(`🍪 Bridge: Received Set-Cookie from backend: ${Array.isArray(setCookie) ? setCookie.length : 1} cookies`);
      if (Array.isArray(setCookie)) {
        setCookie.forEach((c) => {
          const sanitized = sanitizeSetCookie(c);
          nextResponse.headers.append('Set-Cookie', sanitized);
        });
      } else {
        const sanitized = sanitizeSetCookie(setCookie as string);
        nextResponse.headers.set('Set-Cookie', sanitized);
      }
    }

    return nextResponse;
  } catch (error: any) {
    console.error(`Bridge Error (${method} ${path}):`, error.message);
    return NextResponse.json(
      { error: 'Internal Bridge Error', message: error.message },
      { status: 500 }
    );
  }
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const DELETE = handleRequest;
export const PATCH = handleRequest;
