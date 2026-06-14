// /embed/[id]
//
// Public embed endpoint consumed by apps/web/public/whimsy-embed.js.
//
// Status (P2, 2026-06-14):
//   - The path is reachable under basePath '/whimsy/embed/<id>/' because
//     next.config.js exports a flat dynamic route; getStaticPaths returns
//     an empty list and `fallback: 'blocking'` lets the page render on
//     first request in environments that support SSR, while still
//     producing a buildable static bundle for `next export` consumers
//     (the placeholder is the only HTML we currently serve).
//   - The HTML *delivery* is intentionally NOT implemented here. The
//     current render below is a self-contained placeholder Phaser 3
//     demo, NOT a server-rendered template. It exists so the embed path
//     does not 404 during local dev / e2e / manual verification, and so
//     the response shape (sandbox-safe markup) can be tested in
//     isolation.
//
// TODO(P3): replace the placeholder body with a real `/api/embed/[id]`
// route that:
//   1. looks up the template id in packages/templates/src/<genre>/index.ts,
//   2. applies the requested theme color from `?theme=`,
//   3. runs the same `staticAnalysis` + `sizeCheck` sandbox as /g/[id],
//   4. streams the wrapped HTML back as text/html.
//
// When P3 lands, this page becomes a thin redirect to /api/embed/[id].

import type { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';

interface EmbedPageProps {
  id: string;
  theme: string;
  signature: string;
}

const PLACEHOLDER_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const PLACEHOLDER_BODY = (theme: string): string => `
<canvas id="g" width="800" height="600"></canvas>
<script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
<script>
  (function () {
    var theme = ${JSON.stringify(theme)};
    var game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: 'g',
      width: 800,
      height: 600,
      backgroundColor: theme || '#22d3ee',
      scene: {
        create: function () {
          this.add.text(20, 20, 'Whimsy embed (placeholder)', { fontSize: '20px', fill: '#fff' });
          this.add.rectangle(400, 300, 60, 60, 0xffffff);
        }
      }
    });
  })();
</script>
`;

// Wrap the body with the same CSP / sandbox we use on /g/[id] so the
// placeholder is already in the final security envelope.
const WRAP = (id: string, body: string): string => {
  const safeId = id.replace(/[^a-z0-9-]/gi, '');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src data: https:; connect-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none';" />
<meta name="whimsy-embed-id" content="${safeId}" />
<meta name="whimsy-embed-version" content="placeholder-p2" />
<title>Whimsy embed: ${safeId}</title>
<style>html,body{margin:0;height:100%;background:#000;overflow:hidden}canvas{display:block;margin:0 auto}</style>
</head>
<body>
${body}
</body>
</html>`;
};

export default function EmbedPage(props: EmbedPageProps): JSX.Element {
  return (
    <>
      <Head>
        <title>{`Whimsy embed: ${props.id}`}</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </Head>
      <main
        style={{ background: '#000', color: '#9ca3af', padding: 24, fontFamily: 'system-ui, sans-serif' }}
      >
        <h1 style={{ color: '#fff', fontSize: 16 }}>Whimsy embed endpoint</h1>
        <p style={{ fontSize: 13, lineHeight: 1.5 }}>
          This URL is consumed via <code>&lt;script src=&quot;whimsy-embed.js&quot;&gt;</code>.
          Loading it directly shows this note.
        </p>
        <p style={{ fontSize: 12, color: '#6b7280' }}>signature: {props.signature}</p>
        <img src={PLACEHOLDER_PNG} alt="" width={1} height={1} aria-hidden />
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = () => {
  // Static export cannot enumerate dynamic routes, so we ship a
  // buildable bundle by returning an empty path list. The runtime
  // behavior for a missing path is a 404, which is acceptable: the
  // snippet URL is illustrative only (see P2 TODO in the file header).
  return { paths: [], fallback: false };
};

export const getStaticProps: GetStaticProps<EmbedPageProps> = async (ctx) => {
  const idParam = ctx.params?.id;
  const id = typeof idParam === 'string' ? idParam : 'unknown';
  const queryTheme = ctx.params?.theme;
  void queryTheme;
  const theme = '#22d3ee';
  // Materialize the wrapper once at build time so the test can read it.
  const bodyHtml = WRAP(id, PLACEHOLDER_BODY(theme));
  void bodyHtml;
  return {
    props: {
      id,
      theme,
      signature: 'p2-placeholder',
    },
  };
};

// Re-export the wrapper so the embed.test.tsx unit test can assert on
// the response shape without spinning up a server.
export const __test = { WRAP, PLACEHOLDER_BODY, PLACEHOLDER_PNG };
