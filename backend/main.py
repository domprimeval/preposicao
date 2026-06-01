from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from docx import Document
from datetime import datetime
from docx2pdf import convert
import shutil
import sqlite3
import os
import uuid

app = FastAPI(title="PROCON Galvão - Gerador de CP")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "documentos.db"
UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_db() as conn:
        conn.execute('''CREATE TABLE IF NOT EXISTS modelos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL UNIQUE,
            arquivo TEXT NOT NULL
        )''')
        conn.commit()


init_db()


def formatar_data_por_extenso():
    meses = {
        1: "janeiro", 2: "fevereiro", 3: "março", 4: "abril",
        5: "maio", 6: "junho", 7: "julho", 8: "agosto",
        9: "setembro", 10: "outubro", 11: "novembro", 12: "dezembro"
    }
    hoje = datetime.today()
    return f"{hoje.day} de {meses[hoje.month]} de {hoje.year}"


def substituir_texto(doc, placeholder, novo_texto):
    for paragrafo in doc.paragraphs:
        for run in paragrafo.runs:
            if placeholder in run.text:
                run.text = run.text.replace(placeholder, novo_texto)
    for tabela in doc.tables:
        for linha in tabela.rows:
            for celula in linha.cells:
                for paragrafo in celula.paragraphs:
                    for run in paragrafo.runs:
                        if placeholder in run.text:
                            run.text = run.text.replace(placeholder, novo_texto)


# --- Rotas ---

@app.get("/modelos")
def listar_modelos():
    with get_db() as conn:
        rows = conn.execute("SELECT id, nome FROM modelos").fetchall()
    return [{"id": r["id"], "nome": r["nome"]} for r in rows]


@app.post("/modelos")
async def adicionar_modelo(arquivo: UploadFile = File(...)):
    if not arquivo.filename.endswith(".docx"):
        raise HTTPException(status_code=400, detail="Apenas arquivos .docx são aceitos.")

    nome_modelo = arquivo.filename.replace(".docx", "")
    unique_name = f"{uuid.uuid4()}_{arquivo.filename}"
    caminho = os.path.join(UPLOAD_DIR, unique_name)

    with open(caminho, "wb") as f:
        shutil.copyfileobj(arquivo.file, f)

    try:
        with get_db() as conn:
            conn.execute(
                "INSERT OR REPLACE INTO modelos (nome, arquivo) VALUES (?, ?)",
                (nome_modelo, caminho)
            )
            conn.commit()
    except Exception as e:
        os.remove(caminho)
        raise HTTPException(status_code=500, detail=str(e))

    return {"mensagem": "Modelo adicionado com sucesso!", "nome": nome_modelo}


@app.delete("/modelos/{nome}")
def remover_modelo(nome: str):
    with get_db() as conn:
        row = conn.execute("SELECT arquivo FROM modelos WHERE nome = ?", (nome,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Modelo não encontrado.")
        try:
            if os.path.exists(row["arquivo"]):
                os.remove(row["arquivo"])
        except Exception:
            pass
        conn.execute("DELETE FROM modelos WHERE nome = ?", (nome,))
        conn.commit()
    return {"mensagem": "Modelo removido com sucesso!"}


@app.post("/gerar")
async def gerar_documento(
    modelo: str = Form(...),
    polo_ativo: str = Form(...),
    numero_reclamacao: str = Form(...),
    comarca: str = Form("")
):
    with get_db() as conn:
        row = conn.execute("SELECT arquivo FROM modelos WHERE nome = ?", (modelo,)).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Modelo não encontrado.")

    caminho_arquivo = row["arquivo"]
    if not os.path.exists(caminho_arquivo):
        raise HTTPException(status_code=500, detail="Arquivo do modelo não encontrado no servidor.")

    doc = Document(caminho_arquivo)
    data_hoje = formatar_data_por_extenso()

    substituicoes = {
        "POLOATIVO": polo_ativo,
        "NRECLAMAÇÃO": numero_reclamacao,
        "DATAHOJE": data_hoje,
        "CMJUIZO": comarca,
    }
    for chave, valor in substituicoes.items():
        substituir_texto(doc, chave, valor)

    uid = uuid.uuid4().hex[:8]
    nome_base = f"{polo_ativo} - CARTA DE PREPOSIÇÃO - {uid}"
    caminho_docx = os.path.join(OUTPUT_DIR, f"{nome_base}.docx")
    caminho_pdf = os.path.join(OUTPUT_DIR, f"{nome_base}.pdf")

    doc.save(caminho_docx)

    try:
        convert(caminho_docx, caminho_pdf)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao converter para PDF: {e}")
    finally:
        if os.path.exists(caminho_docx):
            os.remove(caminho_docx)

    if not os.path.exists(caminho_pdf):
        raise HTTPException(status_code=500, detail="PDF não foi gerado.")

    return FileResponse(
        caminho_pdf,
        media_type="application/pdf",
        filename=f"{polo_ativo} - CARTA DE PREPOSIÇÃO.pdf",
        background=None
    )


@app.get("/health")
def health():
    return {"status": "ok"}
