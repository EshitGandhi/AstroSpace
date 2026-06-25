/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "@ishubhamx/panchangam-js",
      "astronomy-engine",
    ],
    // Reduce parallel workers — helps avoid SIGBUS on low-memory machines
    workerThreads: false,
    cpus: 1,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        "@ishubhamx/panchangam-js",
        "astronomy-engine",
      ];
    }
    return config;
  },
  async redirects() {
    return [
      {
        source: "/booking",
        destination: "/consultation",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
