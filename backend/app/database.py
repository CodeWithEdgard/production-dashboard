from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# URL de conexão para o PostgreSQL rodando via Docker
SQLALCHEMY_DATABASE_URL = "postgresql://admin:supersecret@db/production_dashboard_db"

# sqlalchemy.url: "postgresql://{user}:{password}@{host}/{database}"

engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()