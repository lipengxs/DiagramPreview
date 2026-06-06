import createNextIntlPlugin from "next-intl/plugin";
import type {NextConfig} from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react"]
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/en",
        permanent: true
      }
    ];
  }
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
