from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from app.receiving import models
from app.ca import models  as ca_models
from app.requisitions import models as requisition_models
from app.requisitions.routes import router as requisitions_router

from .database import engine, Base

from app.receiving.routes import router as recebimento
from app.ca.routes import router as ca_router



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
app.include_router(ca_router)
app.include_router(requisitions_router)


# Endpoint raiz apenas para um health check
@app.get("/")
def read_root():
    return {"status": "API is running recebimento"}