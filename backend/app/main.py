from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from app.receiving import models 
from .database import engine, Base

from app.receiving.routes import router as recebimento



# Cria as tabelas no DB
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Production Dashboard API")

# --- Configuração do CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MONTAGEM DO ROTEADOR DA API ---
app.include_router(recebimento)

# Endpoint raiz apenas para um health check
@app.get("/")
def read_root():
    return {"status": "API is running recebimento"}