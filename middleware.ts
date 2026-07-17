/**
 * Vercel Edge Middleware
 * 1) legacy /sheet?id= → 301 /sheets/{slug} (via build-time id-to-slug.json)
 * 2) /sheets/{slug} → prerendered HTML when present; else fall through to
 *    vercel.json rewrite → FO-03 CSR (covers sheets registered after last deploy)
 */
import { rewrite } from '@vercel/functions';

export const config = {
  matcher: ['/sheet', '/sheets/:slug'],
};

export default async function middleware(request: Request): Promise<Response | undefined> {
  const url = new URL(request.url);

  if (url.pathname === '/sheet') {
    const id = url.searchParams.get('id');
    if (!id) {
      return Response.redirect(new URL('/sheets', request.url), 302);
    }

    try {
      const mapUrl = new URL('/_seo/id-to-slug.json', request.url);
      const res = await fetch(mapUrl.toString(), {
        headers: { accept: 'application/json' },
      });
      if (!res.ok) return undefined;

      const map = (await res.json()) as Record<string, string>;
      const slug = map[id];
      if (!slug) return undefined;

      const dest = new URL('/sheets/' + encodeURIComponent(slug), request.url);
      return Response.redirect(dest, 301);
    } catch {
      return undefined;
    }
  }

  const m = url.pathname.match(/^\/sheets\/([^/]+)\/?$/);
  if (!m || !m[1]) return undefined;

  const slugSeg = m[1];
  try {
    const prerenderUrl = new URL('/sheets/' + slugSeg + '/index.html', request.url);
    const probe = await fetch(prerenderUrl, {
      method: 'HEAD',
      redirect: 'manual',
    });
    if (probe.ok) {
      return rewrite(prerenderUrl);
    }
  } catch {
    /* fall through — vercel.json serves FO-03 CSR shell */
  }

  return undefined;
}
