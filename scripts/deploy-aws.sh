#!/usr/bin/env bash
# Deploy dist/ to S3 + CloudFront. Usage: scripts/deploy-aws.sh [--no-build]
set -euo pipefail
export AWS_PROFILE="${AWS_PROFILE:-resodesk-admin}"
BUCKET="oracle-site-822940159660"
DIST_ID="ERFSFT6EXOJIH"
cd "$(dirname "$0")/.."
[[ "${1:-}" == "--no-build" ]] || npm run build
# Hashed assets: cache for a year. Everything else (index.html, public files): revalidate every time.
aws s3 sync dist/assets "s3://$BUCKET/assets" --delete --cache-control "public,max-age=31536000,immutable"
aws s3 sync dist "s3://$BUCKET" --delete --exclude "assets/*" --cache-control "no-cache"
aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/*" --query Invalidation.Id --output text
echo "Deployed: https://dypp4lw2iurly.cloudfront.net"
