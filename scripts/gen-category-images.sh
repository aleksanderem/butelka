#!/usr/bin/env bash
# Generuje 7 obrazów głównych kategorii przez higgsfield (GPT Image 2) i pobiera do assets/categories/.
# Uruchamiać w tle: bash scripts/gen-category-images.sh
set -uo pipefail
cd "$(dirname "$0")/.."
OUT="assets/categories"
mkdir -p "$OUT"

STYLE="App aesthetic: glossy neon, deep violet-black background, purple/pink/magenta glow, playful premium 3D, cinematic. No text, no words, no letters. Vertical composition."

gen() {
  local key="$1"; local prompt="$2"
  echo "[gen] $key ..."
  local json
  json=$(higgsfield generate create gpt_image_2 --prompt "$prompt $STYLE" --aspect_ratio 3:4 --wait --wait-timeout 20m --json 2>/dev/null)
  local url
  url=$(printf '%s' "$json" | node -e 'let d="";process.stdin.on("data",c=>d+=c);process.stdin.on("end",()=>{let u=null;const re=/https?:\/\/[^"\\ ]+\.(png|jpg|jpeg|webp)/gi;const m=d.match(re);if(m&&m.length)u=m[0];process.stdout.write(u||"");});')
  if [ -z "$url" ]; then echo "[gen] $key: BRAK URL. Surowy json:"; printf '%s\n' "$json" | head -c 800; echo; return 1; fi
  echo "[gen] $key -> $url"
  curl -fsSL "$url" -o "$OUT/$key.png" && echo "[gen] $key: zapisano $OUT/$key.png" || echo "[gen] $key: blad pobierania"
}

gen classic        "Vibrant playful party energy, glowing neon question marks and lightning bolts floating in dark space, glossy 3D balloons, festive confetti, friendly fun, for everyone." &
gen teen           "Youthful energetic fun, glowing neon sneakers, smartphone, skateboard, playful emoji-like shapes, bright school-friends vibe, no faces." &
gen couples        "Romantic intimate mood, two soft glowing heart silhouettes, warm pink and violet glow, candle bokeh lights, tender cozy elegant." &
gen couples-hot    "Sensual spicy romance, deep red and magenta neon glow, silk fabric and a single rose, candlelit intimate ambiance, tasteful suggestive, elegant." &
wait
gen 18-party       "Wild nightlife party, neon cocktail glasses, disco sparkle, glowing purple and pink lights, energetic club atmosphere, no faces." &
gen 18-hot-group   "Bold flirtatious nightlife, sultry neon magenta and purple lighting, smoky club glow, daring playful party energy, tasteful, no faces." &
gen 18-very-hot    "Intense sultry atmosphere, deep magenta and crimson neon, dark sensual elegant mood, glossy silk and shadow, mysterious provocative, tasteful, abstract." &
wait
echo "[gen] GOTOWE. Pliki w $OUT:"; ls -la "$OUT"
