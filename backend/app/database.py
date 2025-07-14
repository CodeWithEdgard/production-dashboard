# backend/app/database.py

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
# A biblioteca 'dotenv' não é nativa, então garantimos que ela esteja no requirements.txt
from dotenv import load_dotenv 

# Carrega as variáveis de um arquivo .env se ele existir (para desenvolvimento local)
load_dotenv()

# --- A LÓGICA CHAVE ---

# 1. Tenta ler a variável de ambiente 'DATABASE_URL' (que o Render injeta)
# 2. Se não encontrar (porque estamos rodando localmente), usa a URL do nosso Docker como padrão.
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://admin:supersecret@localhost/production_dashboard_db")

# 3. Plataformas como o Render fornecem URLs que começam com "postgres://".
#    O SQLAlchemy espera "postgresql://". Esta linha corrige isso.
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# --- O resto do código continua como antes ---
engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()