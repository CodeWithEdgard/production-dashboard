from passlib.context import CryptContext

# Cria um contexto para hashing de senhas, especificando o algoritmo bcrypt
# 'bcrypt' é o padrão de mercado para hashing de senhas hoje.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Gera o hash de uma senha em texto puro."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica se a senha em texto puro corresponde à senha com hash."""
    return pwd_context.verify(plain_password, hashed_password)