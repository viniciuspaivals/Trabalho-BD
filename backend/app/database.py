import os
from contextlib import contextmanager
import psycopg2
from psycopg2 import errors
from psycopg2.extras import RealDictConnection
from fastapi import HTTPException
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
        dbname=os.getenv("DB_NAME", "decolae"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "postgres"),
        cursor_factory=RealDictCursor,
    )

@contextmanager
def get_db():
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            yield cur
        conn.commit()
    except errors.UniqueViolation as e:
        conn.rollback()
        raise HTTPException(status_code=409, detail=f"Registro duplicado: {e.diag.message_detail or e.pgerror}")
    except (errors.ForeignKeyViolation, errors.CheckViolation, errors.RaiseException) as e:
        conn.rollback()
        #RETORNA DIRETAMENTE A MENSAGEM DOS TRIGGERS
        msg = e.diag.message_primary or str(e)
        raise HTTPException(status_code=400, detail=msg)
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()