#!/usr/bin/env bash
# Skips the Identity Chat entirely for DNA-generation testing: logs in,
# posts a canned Identity Profile straight to the existing
# POST /identity-profile endpoint (the same one the chat's summarize step
# writes to — it doesn't know or care whether a human typed these answers
# or a script did), then triggers /dna/generate and prints the result.
#
# Usage: ./seed-test-dna.sh [bandId] [baseUrl]
# Env:   BANDLY_TEST_EMAIL, BANDLY_TEST_PASSWORD (defaults below)

set -euo pipefail

BAND_ID="${1:-d1ba6b04-3aab-431c-9611-fdd86c3a5b13}"
BASE_URL="${2:-http://localhost:8080}"
EMAIL="${BANDLY_TEST_EMAIL:-dennis@bandly.test}"
PASSWORD="${BANDLY_TEST_PASSWORD:-correct-horse-battery-staple-1}"

echo "==> Logging in as $EMAIL"
TOKEN=$(curl -sf -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])")

echo "==> Posting a canned Identity Profile for band $BAND_ID (skipping the chat)"
curl -sf -X POST "$BASE_URL/api/v1/bands/$BAND_ID/dna/identity-profile" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "en",
    "answers": {
      "purpose": "I make music because it is the only honest way I know how to process what I have been through.",
      "problem": "Nobody in my scene is combining raw, unpolished songwriting with genuinely danceable production — it is either one or the other.",
      "sound": "Moody indie folk with warm analog guitars, brushed drums, and a lot of space between notes, occasionally breaking into an EDM-tinged burst of energy.",
      "differentiation": "I sing in both English and German, and I bring in Schlager-style melodic hooks that most indie folk artists would never touch.",
      "personality": "Storyteller and instigator at the same time — quiet verses, loud choruses.",
      "audience": "People who have lived between two cultures, or gone through something heavy and came out the other side.",
      "feeling": "Comfort, and a little bit of power — like someone finally said the thing out loud."
    }
  }' | python3 -m json.tool

echo "==> Generating Artist DNA from that profile"
curl -sf -X POST "$BASE_URL/api/v1/bands/$BAND_ID/dna/generate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | python3 -m json.tool

echo "==> Current generated assets"
curl -sf "$BASE_URL/api/v1/bands/$BAND_ID/dna/current" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
