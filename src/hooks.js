/** @type {import('@sveltejs/kit').Reroute} */
export function reroute({url}) {
  // Reroute index.html as just / for the root.
  // Browser extension starts from with the index.html file in the pathname which is not correct for the router.
  if (url.pathname === '/index.html') {
    return "/";
  }
}