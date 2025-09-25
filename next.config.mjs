import { createRequire } from 'module';
import webpack from 'webpack';
import createNextIntlPlugin from 'next-intl/plugin';

const require = createRequire(import.meta.url);

const withNextIntl = createNextIntlPlugin('./app/libs/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['ts', 'tsx'],
  images: {
    formats: ['image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
      },
      {
        protocol: 'https',
        hostname: 'tether.to',
      },
      {
        protocol: 'https',
        hostname: 'cryptologos.cc',
      },
      {
        protocol: 'https',
        hostname: 'cdn.brandfetch.io',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: require.resolve('buffer/'),
        process: require.resolve('process/browser'),
        fs: false,
        path: false,
      };

      config.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser.js',
          Buffer: ['buffer', 'Buffer'],
        })
      );
    }

    config.externals.push('pino-pretty', 'lokijs', 'encoding');

    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            svgo: true,
            svgoConfig: {
              plugins: [
                {
                  name: 'preset-default',
                  params: {
                    overrides: {
                      removeViewBox: false,
                    },
                  },
                },
                'prefixIds',
              ],
            },
          },
        },
      ],
    });

    return config;
  },
};

export default withNextIntl(nextConfig);
