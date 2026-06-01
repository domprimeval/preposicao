import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://SEU-BACKEND.onrender.com';

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

function compilarPrepostos(prepostos) {
  const validos = prepostos.filter(p => p.nome.trim());
  if (validos.length === 0) return '';
  const partes = validos.map(p =>
    p.cpf.trim() ? `${p.nome.trim()}, CPF ${p.cpf.trim()}` : p.nome.trim()
  );
  if (partes.length === 1) return partes[0];
  return partes.slice(0, -1).join(', ') + ' e ' + partes[partes.length - 1];
}

export default function App() {
  const [modelos, setModelos] = useState([]);
  const [modeloSelecionado, setModeloSelecionado] = useState('');
  const [poloAtivo, setPoloAtivo] = useState('');
  const [numeroReclamacao, setNumeroReclamacao] = useState('');
  const [juizoComarca, setJuizoComarca] = useState('');
  const [prepostos, setPrepostos] = useState([{ nome: '', cpf: '' }]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => { fetchModelos(); }, []);

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

  function atualizarPreposto(index, campo, valor) {
    setPrepostos(prev => prev.map((p, i) => i === index ? { ...p, [campo]: valor } : p));
  }

  function adicionarPreposto() {
    setPrepostos(prev => [...prev, { nome: '', cpf: '' }]);
  }

  function removerPreposto(index) {
    setPrepostos(prev => prev.filter((_, i) => i !== index));
  }

  async function handleGerarDocumento(e) {
    e.preventDefault();
    if (!modeloSelecionado || !poloAtivo || !numeroReclamacao) {
      showToast('Preencha todos os campos obrigatórios.', 'error');
      return;
    }
    setLoading(true);
    const form = new FormData();
    form.append('modelo', modeloSelecionado);
    form.append('polo_ativo', poloAtivo);
    form.append('numero_reclamacao', numeroReclamacao);
    form.append('juizo_comarca', juizoComarca);
    form.append('dpreposto', compilarPrepostos(prepostos));
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
      showToast('PDF gerado e baixado com sucesso!');
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <div className="bg-texture" />

      <header className="header">
        <div className="header__badge">TEP</div>
        <div className="header__text">
          <h1 className="header__title">Trindade e Pernigotti</h1>
          <p className="header__subtitle">Gerador de Carta de Preposição</p>
        </div>
        <div className="header__seal">CP</div>
      </header>

      <main className="main">
        <section className="card">
          <div className="card__header">
            <span className="card__number">01</span>
            <h2 className="card__title">Modelos de Documento</h2>
          </div>

          <div
            className={`dropzone ${dragOver ? 'dropzone--active' : ''} ${uploading ? 'dropzone--loading' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUploadModelo(e.dataTransfer.files[0]); }}
            onClick={() => fileInputRef.current.click()}
          >
            <input ref={fileInputRef} type="file" accept=".docx" style={{ display: 'none' }}
              onChange={(e) => handleUploadModelo(e.target.files[0])} />
            <div className="dropzone__icon">{uploading ? '⟳' : '↑'}</div>
            <p className="dropzone__text">
              {uploading ? 'Enviando modelo...' : 'Arraste um arquivo .docx ou clique para selecionar'}
            </p>
          </div>

          {modelos.length > 0 ? (
            <ul className="modelo-list">
              {modelos.map((m) => (
                <li key={m.id}
                  className={`modelo-item ${modeloSelecionado === m.nome ? 'modelo-item--active' : ''}`}
                  onClick={() => setModeloSelecionado(m.nome)}
                >
                  <span className="modelo-item__icon">📄</span>
                  <span className="modelo-item__nome">{m.nome}</span>
                  {modeloSelecionado === m.nome && <span className="modelo-item__check">✓</span>}
                  <button className="modelo-item__delete"
                    onClick={(e) => { e.stopPropagation(); promptRemover(m.nome); }}
                    title="Remover modelo">✕</button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">Nenhum modelo cadastrado. Adicione um arquivo .docx acima.</p>
          )}
        </section>

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

            <div className="form__section-title">Processo</div>

            <div className="field">
              <label className="field__label">Polo Ativo <span className="required">*</span></label>
              <input className="field__input" type="text" placeholder="Nome do reclamante"
                value={poloAtivo} onChange={(e) => setPoloAtivo(e.target.value)} required />
            </div>

            <div className="field">
              <label className="field__label">Número da Reclamação <span className="required">*</span></label>
              <input className="field__input" type="text" placeholder="Ex: 0001234-56.2024.8.21.0001"
                value={numeroReclamacao} onChange={(e) => setNumeroReclamacao(e.target.value)} required />
            </div>

            <div className="field">
              <label className="field__label">Juízo / Comarca</label>
              <input className="field__input" type="text" placeholder="Ex: 1ª Vara Cível de Porto Alegre"
                value={juizoComarca} onChange={(e) => setJuizoComarca(e.target.value)} />
            </div>

            <div className="form__section-title">
              Preposto(s)
              <button type="button" className="btn-add-preposto" onClick={adicionarPreposto}>
                + Adicionar preposto
              </button>
            </div>

            {prepostos.map((p, i) => (
              <div key={i} className="preposto-row">
                <div className="preposto-index">{i + 1}</div>
                <div className="preposto-fields">
                  <input className="field__input" type="text" placeholder="Nome completo"
                    value={p.nome} onChange={(e) => atualizarPreposto(i, 'nome', e.target.value)} />
                  <input className="field__input" type="text" placeholder="CPF (000.000.000-00)"
                    value={p.cpf} onChange={(e) => atualizarPreposto(i, 'cpf', e.target.value)} />
                </div>
                {prepostos.length > 1 && (
                  <button type="button" className="btn-remove-preposto" onClick={() => removerPreposto(i)}
                    title="Remover preposto">✕</button>
                )}
              </div>
            ))}

            {prepostos.some(p => p.nome.trim()) && (
              <div className="preposto-preview">
                <span className="preposto-preview__label">Texto gerado:</span>
                <span className="preposto-preview__text">{compilarPrepostos(prepostos)}</span>
              </div>
            )}

            <div className="form__footer">
              <p className="form__date-note">
                📅 Data automática: <strong>{new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
              </p>
              <button className={`btn btn--primary ${loading ? 'btn--loading' : ''}`}
                type="submit" disabled={loading || !modeloSelecionado}>
                {loading ? <><span className="spinner" /> Gerando...</> : <>↓ Gerar PDF</>}
              </button>
            </div>
          </form>
        </section>
      </main>

      <footer className="footer">Powered by RaniellyCV</footer>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {confirm && <ConfirmModal message={confirm.message} onConfirm={confirm.onConfirm} onCancel={confirm.onCancel} />}
    </div>
  );
}
