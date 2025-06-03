import type { NextConfig } from "next";

const nextConfig: NextConfig =  ({
  productionBrowserSourceMaps: false,
 
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.freepik.com",
      },{
        protocol: "https",
        hostname: "callingagent.thebotss.com",
      }
    ],
  },
    
  
  async headers() {
    return [
      {
        // Cache control headers for CSS files in multiple directories
        source: "/(css|styles|assets)/(.*).css", // Adjust the regex pattern to match your directory structure
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/sitemap.xml",
        headers: [
          {
            "key": "Cache-Control",
            "value": "no-store, no-cache, must-revalidate, proxy-revalidate"
          }
        ]
      },
      {
        // Cache control headers for font files in multiple directories
        source: "/fonts/(.*).(woff|woff2|ttf|otf|eot)", // Adjust the regex pattern to match your directory structure
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
});

export default nextConfig;
