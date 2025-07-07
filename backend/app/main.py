from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from . import models, schemas, crud, auth
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

# --- ENDPOINT DE REGISTRO DE USUÁRIO
@app.post("/user/", response_model=schemas.User)    
def create_new_user(user:  schemas.UserCreate, db: Session = Depends(get_db)):
  # Verifica se o e-mail já está cadastrado
  db_user = crud.get_user_by_email(db, email=user.email)
  if db_user:
    raise HTTPException(status_code=400, detail="Email already registeded")
  
  return crud.create_user(db=db, user=user)

# --- ENDPOINT DE LOGIN ---
@app.post("/login", response_model=auth.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, email=form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}