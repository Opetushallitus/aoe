#!/usr/bin/env bash
# Fetch a single day of CloudWatch logs from a log group into a file.
# Usage: ./scripts/fetch-logs.sh YYYY-MM-DD [filter-pattern]
# Example: ./scripts/fetch-logs.sh 2026-06-15 '"OAI-PMH"'
set -euo pipefail

DAY="${1:?Usage: fetch-logs.sh YYYY-MM-DD [filter-pattern]}"
FILTER="${2:-}"

LOG_GROUP="/service/web-backend"
PROFILE="aoe-prod"
REGION="eu-west-1"
TZ_OFFSET="+0300"   # Helsinki summer time; matches prod log timestamps

START=$(date -j -f "%Y-%m-%d %H:%M:%S %z" "$DAY 00:00:00 $TZ_OFFSET" +%s)000
NEXT=$(date -j -v+1d -f "%Y-%m-%d" "$DAY" +%Y-%m-%d)
END=$(date -j -f "%Y-%m-%d %H:%M:%S %z" "$NEXT 00:00:00 $TZ_OFFSET" +%s)000

OUT="web-backend-${DAY}.log"

echo "Fetching $LOG_GROUP for $DAY ($TZ_OFFSET)${FILTER:+ filter=$FILTER} -> $OUT"
aws logs filter-log-events \
  --log-group-name "$LOG_GROUP" \
  --start-time "$START" --end-time "$END" \
  ${FILTER:+--filter-pattern "$FILTER"} \
  --profile "$PROFILE" --region "$REGION" \
  --output text > "$OUT"

echo "Done: $(wc -l < "$OUT") lines in $OUT"
