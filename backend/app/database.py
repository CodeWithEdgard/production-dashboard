
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv 

# Carrega as variáveis do arquivo .env para o ambiente
load_dotenv()

# URL de conexão com o banco de dados PostgreSQL.
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://admin:supersecret@localhost/production_dashboard_db")

#    O SQLAlchemy espera "postgresql://".
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# O "motor" que gerencia as conexões com o banco.
engine = create_engine(DATABASE_URL)

# Uma classe que funcionará como uma "fábrica" de novas sessões de banco de dados.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# A classe base da qual todos os modelos ORM (tabelas) irão herdar.
# O SQLAlchemy usa isso para mapear seus modelos para as tabelas do banco.
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()