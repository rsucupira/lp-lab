#!/usr/bin/env bash
set -euo pipefail

SLUG="${1:-}"
NAME="${2:-Nome do profissional}"
SERVICE="${3:-Serviço principal}"
WHATSAPP="${4:-5531999999999}"

if [[ ! "$SLUG" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
  echo "Uso: ./scripts/nova-lp.sh ana-nutricao 'Ana Martins' 'Nutrição clínica' 5531999999999"
  exit 1
fi

LAB_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$(dirname "$LAB_ROOT")/lp-$SLUG"

[[ -e "$DEST" ]] && { echo "A pasta já existe: $DEST"; exit 1; }
cp -R "$LAB_ROOT/templates/lp-servicos" "$DEST"

find "$DEST" -type f \( -name '*.html' -o -name '*.css' -o -name '*.js' -o -name '*.md' \) -print0 | while IFS= read -r -d '' file; do
  sed -i \
    -e "s/{{NOME}}/$NAME/g" \
    -e "s/{{SERVICO}}/$SERVICE/g" \
    -e "s/{{WHATSAPP}}/$WHATSAPP/g" \
    "$file"
done

echo "Projeto criado em: $DEST"
