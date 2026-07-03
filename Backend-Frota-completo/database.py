from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Configurações do Banco de Dados fornecidas pelo usuário
<<<<<<< Updated upstream
# IP: 192.168.1.171, Usuário: postgres, Senha: postgres
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:postgres@192.168.1.171:5432/logistica"
=======
# IP: 192.168.1.172, Usuário: postgres, Senha: postgres
SQLALCHEMY_DATABASE_URL = os.getenv("DB_URL")
>>>>>>> Stashed changes

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependência para obter a sessão do banco de dados
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
