#!/bin/sh
# Sobe o schema sempre (idempotente); só semeia (que APAGA e recria todos
# os nós a partir dos .md do repo, ver seed_db.py) se o banco estiver
# vazio -- um restart normal do container (crash, redeploy, reboot do
# host) NUNCA deve apagar edições feitas pela API/UI. Achado em produção
# (2026-07-17): o comando antigo rodava seed_db.py incondicionalmente a
# cada start. Pra ressincronizar conteúdo novo dos arquivos .md num banco
# que já tem dados, use POST /api/seed (mesma lógica, só que explícita).
set -e

alembic upgrade head

NODE_COUNT=$(python -c "
from database import engine
from sqlalchemy import text
with engine.connect() as conn:
    try:
        print(conn.execute(text('SELECT COUNT(*) FROM nodes')).scalar())
    except Exception:
        print(0)
")

if [ "$NODE_COUNT" = "0" ]; then
    echo "banco vazio -- rodando seed inicial..."
    python seed_db.py
else
    echo "banco ja tem $NODE_COUNT no(s) -- pulando seed automatico (nao ha mais rota HTTP pra ressincronizar; rodar 'python seed_db.py' manualmente via docker exec quando for necessario, sabendo que isso apaga nos criados so via API)"
fi

exec uvicorn main:app --host 0.0.0.0 --port 8000
