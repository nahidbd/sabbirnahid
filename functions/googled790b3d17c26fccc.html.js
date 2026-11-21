// Google Search Console verification file, served at its exact address with no redirect.
export function onRequest() {
  return new Response("google-site-verification: googled790b3d17c26fccc.html", {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" }
  });
}
