from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from . import models, schemas, crud
from .database import engine, SessionLocal

# Cria a tabela no DB (se ela não existir) ao iniciar a aplicação
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Production Dashboard API")

# Dependência para obter a sessão do banco de dados 
def get_db():
  db = SessionLocal()
  try: 
    yield db
  finally:
    db.close()

@app.post("/user/", response_model=schemas.User)    
def create_new_user(user:  schemas.UserCreate, db: Session = Depends(get_db)):
  """
  Cria um novo usuário
  """
  # Verifica se o e-mail já está cadastrado
  db_user = crud.get_user_by_email(db, email=user.email)
  if db_user:
    raise HTTPException(status_code=400, detail="Email already registeded")
  
  return crud.create_user(db=db, user=user)