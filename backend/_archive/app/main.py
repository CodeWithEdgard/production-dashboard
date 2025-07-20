
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .api import router as api_router 

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
# Inclui todas as rotas do arquivo api.py sob o prefixo /api
app.include_router(api_router, prefix="/api")

# Endpoint raiz apenas para um health check
@app.get("/")
def read_root():
    return {"status": "API is running"}