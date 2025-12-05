import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {},
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "react-native-web/dist/apis/StyleSheet/registry": path.resolve(
        __dirname,
        "lib/shims/react-native-web-style-registry.ts",
      ),
    };
    return config;
  },
};

export default nextConfig;
