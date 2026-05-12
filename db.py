#!/usr/bin/env python3
"""
Gerenciador do banco de dados - Vendinha Phoenix
Uso:
  python db.py init      - Cria tabelas e inicializa dados (primeiro uso)
  python db.py seed      - Cria usuário admin e produtos padrão
"""

import subprocess
import sys
import os

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))

def pedir_url():
    print("\nCole a DATABASE_URL do banco:")
    print("  Formato: postgresql://usuario:senha@host:5432/banco")
    url = input("  DATABASE_URL: ").strip()
    if not url.startswith("postgresql://") and not url.startswith("postgres://"):
        print("URL inválida. Deve começar com postgresql://")
        sys.exit(1)
    return url

def rodar(comando, env):
    print(f"\n  $ {' '.join(comando)}")
    result = subprocess.run(comando, cwd=PROJECT_DIR, env=env)
    if result.returncode != 0:
        print(f"\nErro ao executar: {' '.join(comando)}")
        sys.exit(1)

def montar_env(database_url):
    env = os.environ.copy()
    env["DATABASE_URL"] = database_url
    return env

def cmd_init():
    print("=" * 50)
    print("  INICIALIZAR BANCO DA VENDINHA")
    print("=" * 50)
    url = pedir_url()
    env = montar_env(url)

    print("\n[1/2] Criando tabelas...")
    rodar(["npx", "prisma", "db", "push"], env)

    print("\n[2/2] Criando usuário admin e produtos padrão...")
    rodar(["npx", "tsx", "src/db/seed.ts"], env)

    print("\n✓ Banco inicializado com sucesso!")
    print("  Usuário: admin@vendinha.com")
    print("  Senha:   123\n")

def cmd_update():
    print("=" * 50)
    print("  ATUALIZAR SCHEMA DO BANCO")
    print("=" * 50)
    url = pedir_url()
    env = montar_env(url)

    print("\nAtualizando schema (prisma db push)...")
    rodar(["npx", "prisma", "db", "push"], env)

    print("\n✓ Schema atualizado com sucesso!\n")

def cmd_seed():
    print("=" * 50)
    print("  RODAR SEED (admin + produtos)")
    print("=" * 50)
    url = pedir_url()
    env = montar_env(url)

    print("\nRodando seed...")
    rodar(["npx", "tsx", "src/db/seed.ts"], env)

    print("\n✓ Seed executado com sucesso!\n")

COMANDOS = {
    "init": cmd_init,
    "update": cmd_update,
    "seed": cmd_seed,
}

if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] not in COMANDOS:
        print(__doc__)
        sys.exit(0)

    COMANDOS[sys.argv[1]]()
