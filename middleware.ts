/**
 * Vercel Edge Middleware — legacy /sheet?id= → 301 /sheets/{slug}
 * Phase 1: slug pages are CSR shells; prerender HTML is Phase 2.
 */
export const config = {
  matcher: '/sheet',
};

export default async function middleware(request: Request): Promise<Response | undefined> {
  const url = new URL(request.url);
  if (url.pathname !== '/sheet') return undefined;

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
