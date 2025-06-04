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
      },
      {
        protocol: "https",
        hostname: "cdn-icons-png.flaticon.com",
      },
    ],
  },
    
  
});

export default nextConfig;
