/*!
 * Whimsy Embed Snippet v1
 *
 * Drop-in script that turns any element with `data-whimsy-template="<id>"`
 * into a fully sandboxed Phaser 3 game iframe, fetched from
 * https://kevin12369.github.io/whimsy/embed/<id>.
 *
 * Usage:
 *   <script src="https://kevin12369.github.io/whimsy/whimsy-embed.js" defer></script>
 *   <div data-whimsy-template="platformer-side-scroller-comet"
 *        data-whimsy-theme="#22d3ee" style="width:100%;height:600px"></div>
 *
 * Properties (all optional except `data-whimsy-template`):
 *   data-whimsy-template  - the template id (required, must match /^[a-z0-9-]+$/)
 *   data-whimsy-theme     - hex color to override the kit's primary color
 *   data-whimsy-height    - iframe height in px (default 600)
 *
 * Security: the iframe is built with `sandbox="allow-scripts"` (no same-origin)
 * and a per-instance nonce-style URL suffix; the server-side /embed/<id> route
 * is responsible for the denylist + size cap.
 */
(function () {
  'use strict';

  var CDN_BASE = 'https://kevin12369.github.io/whimsy/';
  var VALID_ID = /^[a-z0-9][a-z0-9-]{1,62}$/;

  function escapeAttr(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function buildHtml(id, theme, height) {
    var url = CDN_BASE + 'embed/' + encodeURIComponent(id) + '/?theme=' + encodeURIComponent(theme || '');
    var style = 'width:100%;height:' + height + 'px;border:0;display:block;background:#000;';
    return (
      '<iframe ' +
        'title="Whimsy game: ' + escapeAttr(id) + '" ' +
        'src="' + escapeAttr(url) + '" ' +
        'sandbox="allow-scripts" ' +
        'loading="lazy" ' +
        'referrerpolicy="no-referrer" ' +
        'allow="" ' +
        'style="' + escapeAttr(style) + '">' +
      '</iframe>'
    );
  }

  function mount(el) {
    if (el.__whimsyMounted) return;
    var id = el.getAttribute('data-whimsy-template');
    if (!id || !VALID_ID.test(id)) {
      el.innerHTML =
        '<p style="color:#f87171;font:14px system-ui;padding:8px;">' +
        'Whimsy embed: invalid template id' +
        '</p>';
      return;
    }
    var theme = el.getAttribute('data-whimsy-theme') || '';
    var height = parseInt(el.getAttribute('data-whimsy-height') || '600', 10);
    if (!isFinite(height) || height < 120) height = 600;
    if (height > 1600) height = 1600;
    el.innerHTML = buildHtml(id, theme, height);
    el.__whimsyMounted = true;
  }

  function scan(root) {
    var nodes = (root || document).querySelectorAll('[data-whimsy-template]');
    for (var i = 0; i < nodes.length; i++) mount(nodes[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { scan(); });
  } else {
    scan();
  }

  // Re-scan when new nodes are added (basic observer, ~no overhead).
  if (typeof MutationObserver === 'function') {
    var pending = false;
    var mo = new MutationObserver(function () {
      if (pending) return;
      pending = true;
      (window.requestAnimationFrame || setTimeout)(function () {
        pending = false;
        scan();
      }, 16);
    });
    if (document.body) {
      mo.observe(document.body, { childList: true, subtree: true });
    } else {
      document.addEventListener('DOMContentLoaded', function () {
        mo.observe(document.body, { childList: true, subtree: true });
      });
    }
  }

  // Public API for programmatic embeds.
  window.WhimsyEmbed = {
    scan: scan,
    mount: mount,
    VERSION: '1.0.0',
  };
})();
