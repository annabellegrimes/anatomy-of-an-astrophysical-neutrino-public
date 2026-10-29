#!/usr/bin/env python3
"""
Local web server for "Anatomy of an Astrophysical Neutrino" on macOS and Linux.
Serves the files in ./public at http://localhost:3000 using only Python 3's standard library.
(On Windows, start.bat and server.ps1 do the same job with nothing to install.)

Usage:  python3 server.py [--port 3000] [--no-browser]
Stop it with Ctrl+C or by closing the window.
"""
import argparse
import functools
import http.server
import os
import sys
import threading
import time
import webbrowser

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public")


class Handler(http.server.SimpleHTTPRequestHandler):
    # Same types as server.ps1; Python's own table misses some on older versions
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".html": "text/html; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".svg": "image/svg+xml",
        ".woff2": "font/woff2",
        ".woff": "font/woff",
        ".txt": "text/plain; charset=utf-8",
    }

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def log_message(self, fmt, *args):
        sys.stdout.write("%s  %s\n" % (time.strftime("%H:%M:%S"), fmt % args))


def main():
    ap = argparse.ArgumentParser(description="Serve the neutrino page locally.")
    ap.add_argument("--port", type=int, default=3000)
    ap.add_argument("--no-browser", action="store_true", help="don't open the browser")
    args = ap.parse_args()
    url = "http://localhost:%d/" % args.port

    try:
        server = http.server.ThreadingHTTPServer(("127.0.0.1", args.port), functools.partial(Handler, directory=ROOT))
    except OSError:
        print("\nCould not start the server on port %d." % args.port)
        print("Something else is probably using it. Close that program, or run:")
        print("  ./start.sh 3001\n")
        sys.exit(1)

    print("\n  Anatomy of an Astrophysical Neutrino")
    print("  Serving " + ROOT)
    print("  Open %s in your browser." % url)
    print("  Press Ctrl+C or close this window to stop.\n")

    if not args.no_browser:
        threading.Timer(0.5, webbrowser.open, [url]).start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
        print("\nServer stopped.")


if __name__ == "__main__":
    main()
