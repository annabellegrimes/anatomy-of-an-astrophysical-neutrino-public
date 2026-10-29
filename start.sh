#!/bin/sh
# Start the local server and open the page (macOS and Linux).
# Optional: pass a different port, e.g.  ./start.sh 3001
cd "$(dirname "$0")" || exit 1
PORT="${1:-3000}"
for PY in python3 python; do
  if command -v "$PY" >/dev/null 2>&1 && "$PY" -c 'import sys; sys.exit(sys.version_info < (3, 7))' 2>/dev/null; then
    exec "$PY" server.py --port "$PORT"
  fi
done
echo ""
echo "This page needs Python 3.7 or newer to run its local server, and none was found."
if [ "$(uname)" = "Darwin" ]; then
  echo "On a Mac, run this in Terminal and accept the prompt to install the developer tools:"
  echo "  xcode-select --install"
else
  echo "Install it with your package manager, for example:"
  echo "  sudo apt install python3      (Debian, Ubuntu)"
  echo "  sudo dnf install python3      (Fedora)"
fi
echo ""
exit 1
