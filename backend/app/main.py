from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, gerente, admin, cliente

app = FastAPI(
    title="Decolaê API",
    description="Backend do Sistema de Gestão de Voos e Passagens",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(gerente.router)
app.include_router(admin.router)
app.include_router(cliente.router)


@app.get("/health", tags=["Sistema"])
def health_check():
    return {"status": "ok", "service": "Decolaê API"}