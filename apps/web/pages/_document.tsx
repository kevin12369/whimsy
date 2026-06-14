import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          httpEquiv="Content-Security-Policy"
          content={[
            "default-src 'none'",
            "script-src 'self' https://cdn.jsdelivr.net/npm/phaser@3.70.0/",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data:",
            "connect-src 'self' https://api.anthropic.com https://api.deepseek.com https://generativelanguage.googleapis.com https://api.cloudflare.com http://localhost:* http://127.0.0.1:*",
            "frame-src 'self'",
            "base-uri 'none'",
            "form-action 'none'",
            "object-src 'none'",
            "worker-src 'none'",
            "manifest-src 'none'",
          ].join('; ')}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}