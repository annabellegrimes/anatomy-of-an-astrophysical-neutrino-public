#!/bin/sh
# macOS: double-click in Finder to start the local server and open the page.
# It opens a Terminal window; leave it open while you use the page.
cd "$(dirname "$0")" || exit 1
./start.sh "$@"
echo ""
printf "Press Return to close this window. "
read -r _
