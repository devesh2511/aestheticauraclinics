const FRAMER = "sweet-oval-892843.framer.app";
const DOMAIN = "aestheticauraclinics.com";

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Send www to the main domain
    if (url.hostname === "www." + DOMAIN) {
      url.hostname = DOMAIN;
      return Response.redirect(url.toString(), 301);
    }

    url.hostname = FRAMER;
    const res = await fetch(new Request(url, request), { redirect: "manual" });

    // Keep any Framer redirects on our own domain
    const headers = new Headers(res.headers);
    const loc = headers.get("Location");
    if (loc) headers.set("Location", loc.replaceAll(FRAMER, DOMAIN));

    // Swap framer.app links in HTML pages for our domain
    const type = headers.get("Content-Type") || "";
    if (type.includes("text/html")) {
      const html = (await res.text()).replaceAll(FRAMER, DOMAIN);
      headers.delete("Content-Length");
      return new Response(html, { status: res.status, headers });
    }
    return new Response(res.body, { status: res.status, headers });
  },
};
