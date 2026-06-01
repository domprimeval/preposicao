import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// ← Troque pela URL do seu backend no Render.com após o deploy
const API_URL = process.env.REACT_APP_API_URL || 'https://preposicao.onrender.com';

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`toast toast--${type}`}>
      <span className="toast__icon">{type === 'success' ? '✓' : '✕'}</span>
      <span>{message}</span>
    </div>
  );
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <p className="modal__text">{message}</p>
        <div className="modal__actions">
          <button className="btn btn--ghost" onClick={onCancel}>Cancelar</button>
          <button className="btn btn--danger" onClick={onConfirm}>Confirmar</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [modelos, setModelos] = useState([]);
  const [modeloSelecionado, setModeloSelecionado] = useState('');
  const [poloAtivo, setPoloAtivo] = useState('');
  const [numeroReclamacao, setNumeroReclamacao] = useState('');
  const [comarca, setComarca] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef();

  const isVirtual = modeloSelecionado.toUpperCase().includes('VIRTUAL');

  useEffect(() => {
    fetchModelos();
  }, []);

  const showToast = (message, type = 'success') => setToast({ message, type });

  async function fetchModelos() {
    try {
      const res = await fetch(`${API_URL}/modelos`);
      const data = await res.json();
      setModelos(data);
    } catch {
      showToast('Erro ao conectar com o servidor.', 'error');
    }
  }

  async function handleUploadModelo(file) {
    if (!file || !file.name.endsWith('.docx')) {
      showToast('Apenas arquivos .docx são aceitos.', 'error');
      return;
    }
    setUploading(true);
    const form = new FormData();
    form.append('arquivo', file);
    try {
      const res = await fetch(`${API_URL}/modelos`, { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erro desconhecido');
      showToast(data.mensagem);
      fetchModelos();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setUploading(false);
    }
  }

  function promptRemover(nome) {
    setConfirm({
      message: `Remover o modelo "${nome}"?`,
      onConfirm: async () => {
        setConfirm(null);
        try {
          const res = await fetch(`${API_URL}/modelos/${encodeURIComponent(nome)}`, { method: 'DELETE' });
          const data = await res.json();
          if (!res.ok) throw new Error(data.detail);
          showToast(data.mensagem);
          if (modeloSelecionado === nome) setModeloSelecionado('');
          fetchModelos();
        } catch (e) {
          showToast(e.message, 'error');
        }
      },
      onCancel: () => setConfirm(null),
    });
  }

  async function handleGerarDocumento(e) {
    e.preventDefault();
    if (!modeloSelecionado || !poloAtivo || !numeroReclamacao) {
      showToast('Preencha todos os campos obrigatórios.', 'error');
      return;
    }
    if (isVirtual && !comarca) {
      showToast('Informe a comarca para audiências virtuais.', 'error');
      return;
    }
    setLoading(true);
    const form = new FormData();
    form.append('modelo', modeloSelecionado);
    form.append('polo_ativo', poloAtivo);
    form.append('numero_reclamacao', numeroReclamacao);
    form.append('comarca', comarca);
    try {
      const res = await fetch(`${API_URL}/gerar`, { method: 'POST', body: form });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Erro ao gerar documento');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${poloAtivo} - CARTA DE PREPOSIÇÃO.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Documento gerado e baixado com sucesso!');
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      {/* Background texture */}
      <div className="bg-texture" />

      {/* Header */}
      <header className="header">
        <div className="header__badge">PROCON</div>
        <div className="header__text">
          <h1 className="header__title">Galvão</h1>
          <p className="header__subtitle">Gerador de Carta de Preposição</p>
        </div>
        <div className="header__seal">CP</div>
      </header>

      <main className="main">
        {/* Modelos */}
        <section className="card">
          <div className="card__header">
            <span className="card__number">01</span>
            <h2 className="card__title">Modelos de Documento</h2>
          </div>

          <div
            className={`dropzone ${dragOver ? 'dropzone--active' : ''} ${uploading ? 'dropzone--loading' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files[0];
              if (file) handleUploadModelo(file);
            }}
            onClick={() => fileInputRef.current.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx"
              style={{ display: 'none' }}
              onChange={(e) => handleUploadModelo(e.target.files[0])}
            />
            <div className="dropzone__icon">{uploading ? '⟳' : '↑'}</div>
            <p className="dropzone__text">
              {uploading ? 'Enviando modelo...' : 'Arraste um arquivo .docx ou clique para selecionar'}
            </p>
          </div>

          {modelos.length > 0 ? (
            <ul className="modelo-list">
              {modelos.map((m) => (
                <li
                  key={m.id}
                  className={`modelo-item ${modeloSelecionado === m.nome ? 'modelo-item--active' : ''}`}
                  onClick={() => setModeloSelecionado(m.nome)}
                >
                  <span className="modelo-item__icon">📄</span>
                  <span className="modelo-item__nome">{m.nome}</span>
                  {modeloSelecionado === m.nome && <span className="modelo-item__check">✓</span>}
                  <button
                    className="modelo-item__delete"
                    onClick={(e) => { e.stopPropagation(); promptRemover(m.nome); }}
                    title="Remover modelo"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">Nenhum modelo cadastrado. Adicione um arquivo .docx acima.</p>
          )}
        </section>

        {/* Formulário */}
        <section className="card">
          <div className="card__header">
            <span className="card__number">02</span>
            <h2 className="card__title">Dados do Documento</h2>
          </div>

          <form className="form" onSubmit={handleGerarDocumento}>
            <div className="field">
              <label className="field__label">Modelo selecionado</label>
              <div className={`field__preview ${!modeloSelecionado ? 'field__preview--empty' : ''}`}>
                {modeloSelecionado || 'Selecione um modelo acima'}
              </div>
            </div>

            <div className="field">
              <label className="field__label">
                Polo Ativo <span className="required">*</span>
              </label>
              <input
                className="field__input"
                type="text"
                placeholder="Nome do polo ativo"
                value={poloAtivo}
                onChange={(e) => setPoloAtivo(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label className="field__label">
                Número da Reclamação <span className="required">*</span>
              </label>
              <input
                className="field__input"
                type="text"
                placeholder="Ex: 0001234-56.2024.8.21.0001"
                value={numeroReclamacao}
                onChange={(e) => setNumeroReclamacao(e.target.value)}
                required
              />
            </div>

            {isVirtual && (
              <div className="field field--animated">
                <label className="field__label">
                  Comarca <span className="required">*</span>
                </label>
                <input
                  className="field__input"
                  type="text"
                  placeholder="Ex: Porto Alegre"
                  value={comarca}
                  onChange={(e) => setComarca(e.target.value)}
                />
              </div>
            )}

            <div className="form__footer">
              <p className="form__date-note">
                📅 Data preenchida automaticamente: <strong>{new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
              </p>
              <button
                className={`btn btn--primary ${loading ? 'btn--loading' : ''}`}
                type="submit"
                disabled={loading || !modeloSelecionado}
              >
                {loading ? (
                  <><span className="spinner" /> Gerando PDF...</>
                ) : (
                  <>↓ Gerar e Baixar PDF</>
                )}
              </button>
            </div>
          </form>
        </section>
      </main>

      <footer className="footer">
        Powered by RaniellyCV
      </footer>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {confirm && (
        <ConfirmModal
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={confirm.onCancel}
        />
      )}
    </div>
  );
}
