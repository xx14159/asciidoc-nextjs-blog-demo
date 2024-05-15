/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",

  images: {
    loader: "custom",
  },

  webpack: (config) => {
    config.experiments = { asyncWebAssembly: true, layers: true };
    return config;
  },
};

module.exports = nextConfig;
