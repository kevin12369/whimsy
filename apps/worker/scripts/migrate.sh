#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
wrangler d1 migrations apply DB --local
