#!/bin/zsh
cd "$(dirname "$0")" || exit 1
orbit_python="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3"
if [ ! -x "$orbit_python" ]; then orbit_python="$(command -v python3)"; fi
if [ -z "$orbit_python" ]; then
  echo "Serve Python 3 per avviare il server locale. Puoi anche pubblicare la cartella docs su GitHub Pages."
  read -r
  exit 1
fi
(sleep 1; open "http://127.0.0.1:8774/") &
echo "Officina Orbitale: http://127.0.0.1:8774/"
echo "Per fermare il server, premi Ctrl+C."
exec "$orbit_python" -m http.server 8774 --bind 127.0.0.1 --directory docs
