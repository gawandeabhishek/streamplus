/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'i.ytimg.com',      // YouTube thumbnails
      'yt3.ggpht.com',    // YouTube channel avatars
      'youtube.com',      // YouTube general images
      'lh3.googleusercontent.com',  // Google user profile images
      'img.youtube.com'
    ],
  },
  webpack: (config) => {
    config.externals.push({
      "utf-8-validate": "commonjs utf-8-validate",
      bufferutil: "commonjs bufferutil"
    });
    return config;
  },
}

module.exports = nextConfig 