/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    // Old 5-page structure folded into the 3-tab layout.
    return [
      { source: "/benchmarks", destination: "/explore", permanent: true },
      { source: "/table", destination: "/explore", permanent: true },
      { source: "/methodology", destination: "/trust", permanent: true },
    ];
  },
};

export default nextConfig;
