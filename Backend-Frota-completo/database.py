from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Configurações do Banco de Dados fornecidas pelo usuário
# IP: 192.168.1.178, Usuário: postgres, Senha: postgres
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:postgres@192.168.1.178:5432/logistica"

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
