from fastapi import FastAPI
from . import models
from .database import engine

# Cria a tabela no DB (se ela não existir) ao iniciar a aplicação
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Production Dashboard API")

@app.get("/")
def read_root():
  return {"status": "API is running!"}