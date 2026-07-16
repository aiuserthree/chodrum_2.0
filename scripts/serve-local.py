#!/usr/bin/env python3
"""Local static server with vercel.json redirects + rewrites.

Plain `python3 -m http.server` does not apply Vercel pretty URLs, so
/login, /bo/login, /mypage, etc. return 404. Use this instead:

  npm run build          # after editing *.jsx / *.page.jsx
  python3 scripts/serve-local.py
  # → http://localhost:8765/login
  # → http://localhost:8765/bo/login
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[1]
HTML_DIR = ROOT / "html"
VERCEL_JSON = ROOT / "vercel.json"


def load_routes():
    data = json.loads(VERCEL_JSON.read_text(encoding="utf-8"))
    redirects = []
    for rule in data.get("redirects") or []:
        redirects.append(
            (
                re.compile("^" + re.escape(rule["source"]) + "/?$"),
                rule["destination"],
                bool(rule.get("permanent")),
            )
        )
    rewrites = []
    for rule in data.get("rewrites") or []:
        rewrites.append(
            (
                re.compile("^" + re.escape(rule["source"]) + "/?$"),
                rule["destination"],
            )
        )
    return redirects, rewrites


REDIRECTS, REWRITES = load_routes()


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, directory=None, **kwargs):
        super().__init__(*args, directory=directory, **kwargs)

    def translate_path(self, path):
        # Map pretty URLs → real files before filesystem lookup.
        parsed = urlsplit(path)
        clean = unquote(parsed.path or "/")
        for pattern, dest in REWRITES:
            if pattern.match(clean):
                path = dest + (("?" + parsed.query) if parsed.query else "")
                break
        return super().translate_path(path)

    def do_GET(self):
        parsed = urlsplit(self.path)
        clean = unquote(parsed.path or "/")
        for pattern, dest, permanent in REDIRECTS:
            if pattern.match(clean):
                loc = dest
                if parsed.query:
                    loc += ("&" if "?" in loc else "?") + parsed.query
                self.send_response(301 if permanent else 302)
                self.send_header("Location", loc)
                self.end_headers()
                return
        return super().do_GET()

    def do_HEAD(self):
        parsed = urlsplit(self.path)
        clean = unquote(parsed.path or "/")
        for pattern, dest, permanent in REDIRECTS:
            if pattern.match(clean):
                loc = dest
                if parsed.query:
                    loc += ("&" if "?" in loc else "?") + parsed.query
                self.send_response(301 if permanent else 302)
                self.send_header("Location", loc)
                self.end_headers()
                return
        return super().do_HEAD()

    def log_message(self, fmt, *args):
        sys.stderr.write("[%s] %s\n" % (self.log_date_time_string(), fmt % args))


def main():
    parser = argparse.ArgumentParser(description="CHODRUM local server (vercel rewrites)")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument(
        "--bind",
        default="localhost",
        help="Bind address (default: localhost — matches config.js YouTube rewrite)",
    )
    args = parser.parse_args()

    if not HTML_DIR.is_dir():
        sys.stderr.write("html/ not found at %s\n" % HTML_DIR)
        sys.exit(1)
    if not VERCEL_JSON.is_file():
        sys.stderr.write("vercel.json not found at %s\n" % VERCEL_JSON)
        sys.exit(1)

    handler = partial(Handler, directory=str(HTML_DIR))
    httpd = ThreadingHTTPServer((args.bind, args.port), handler)
    host = args.bind if args.bind not in ("0.0.0.0", "::") else "localhost"
    def out(msg):
        print(msg, flush=True)

    out("CHODRUM local server")
    out("  root: %s" % HTML_DIR)
    out("  url:  http://%s:%d/" % (host, args.port))
    out("  FO:   http://%s:%d/login" % (host, args.port))
    out("  BO:   http://%s:%d/bo/login" % (host, args.port))
    out("  (Ctrl+C to stop)")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nstopped")


if __name__ == "__main__":
    os.chdir(HTML_DIR)
    main()
