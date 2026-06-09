const SUPPORT_HOST = "support\\.(?:localhost|drivelady\\.fr)(?::\\d+)?";
const SUPPORT_HOST_MATCH = [{ type: "host", value: SUPPORT_HOST }];

const nextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/",
          has: SUPPORT_HOST_MATCH,
          destination: "/support-portal",
        },
        {
          source: "/fr-fr",
          has: SUPPORT_HOST_MATCH,
          destination: "/support-portal/fr-fr",
        },
        {
          source: "/fr-fr/:path*",
          has: SUPPORT_HOST_MATCH,
          destination: "/support-portal/fr-fr/:path*",
        },
        {
          source: "/contact",
          has: SUPPORT_HOST_MATCH,
          destination: "/support-portal/fr-fr/articles/contacter-support",
        },
        {
          source: "/contact/:path*",
          has: SUPPORT_HOST_MATCH,
          destination: "/support-portal/fr-fr/articles/contacter-support",
        },
      ],
    };
  },
};

module.exports = nextConfig;
