#!/bin/sh
set -e

# Check backend health. The /api/health endpoint returns 200 unconditionally.
# `wget --spider` sends HEAD, which /api/health accepts (axum GET handler
# responds to HEAD automatically).
echo "Checking backend on port $BACKEND_BIND_PORT..."
wget --no-verbose --tries=1 --spider --timeout=5 "http://localhost:$BACKEND_BIND_PORT/api/health" 2>/dev/null || {
  echo "Backend health check failed on port $BACKEND_BIND_PORT"
  exit 1
}

# Check frontend health via the public /welcome page. We must NOT hit the root
# `/`, because the auth middleware would redirect a HEAD request into the
# Auth.js handler, which rejects anything other than GET/POST. Using `-O -`
# forces GET; output is discarded via redirection.
echo "Checking frontend on port $FRONTEND_BIND_PORT..."
wget --no-verbose --tries=1 --timeout=5 -O - "http://localhost:$FRONTEND_BIND_PORT/welcome" >/dev/null 2>&1 || {
  echo "Frontend health check failed on port $FRONTEND_BIND_PORT"
  exit 1
}

echo "Both services are healthy"
exit 0
