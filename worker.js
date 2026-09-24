const ORIGIN = "https://devesh2511.github.io/aestheticauraclinics";
const DOMAIN = "aestheticauraclinics.com";
const OLD_FRAMER = "sweet-oval-892843.framer.app";

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Send www to the main domain
    if (url.hostname === "www." + DOMAIN) {
      url.hostname = DOMAIN;
      return Response.redirect(url.toString(), 301);
    }

    let res = await fetch(ORIGIN + url.pathname + url.search, { redirect: "manual" });

    // Pages like /about only exist inside index.html, so fall back to it
    const isPage = !url.pathname.split("/").pop().includes(".");
    if (res.status === 404 && isPage) {
      res = await fetch(ORIGIN + "/", { redirect: "manual" });
    }

    // Keep any GitHub redirects on our own domain
    const headers = new Headers(res.headers);
    const loc = headers.get("Location");
    if (loc) headers.set("Location", loc.replace(ORIGIN, "https://" + DOMAIN));

    // Swap GitHub and old Framer links in HTML pages for our domain
    const type = headers.get("Content-Type") || "";
    if (type.includes("text/html")) {
      const html = (await res.text())
        .replaceAll(ORIGIN.replace("https://", ""), DOMAIN)
        .replaceAll(OLD_FRAMER, DOMAIN);
      headers.delete("Content-Length");
      return new Response(html, { status: res.status, headers });
    }
    return new Response(res.body, { status: res.status, headers });
  },
};
