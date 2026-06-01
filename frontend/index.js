/* ─── Reset & Base ─── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --green-900: #1B3A1F;
  --green-800: #1B5E20;
  --green-700: #2E7D32;
  --green-600: #388E3C;
  --green-400: #66BB6A;
  --green-200: #A5D6A7;
  --green-50:  #F1F8E9;
  --gold:      #C8A84B;
  --gold-light:#E8CB76;
  --cream:     #FAF8F2;
  --ink:       #1A1A18;
  --ink-soft:  #3D3D38;
  --ink-muted: #7A7A72;
  --red:       #C62828;
  --red-light: #FFEBEE;
  --white:     #FFFFFF;
  --shadow-sm: 0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.06);
  --shadow-md: 0 4px 16px rgba(0,0,0,.10), 0 2px 6px rgba(0,0,0,.06);
  --shadow-lg: 0 12px 40px rgba(0,0,0,.14);
  --radius:    12px;
  --transition: 220ms cubic-bezier(.4,0,.2,1);
}

html { font-size: 16px; }

body {
  font-family: 'DM Sans', sans-serif;
  background: var(--cream);
  color: var(--ink);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

/* ─── Background texture ─── */
.bg-texture {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background-image:
    radial-gradient(circle at 15% 25%, rgba(27,94,32,.07) 0%, transparent 50%),
    radial-gradient(circle at 85% 75%, rgba(200,168,75,.06) 0%, transparent 50%),
    url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231B5E20' fill-opacity='0.025'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

/* ─── Layout ─── */
.app {
  position: relative; z-index: 1;
  min-height: 100vh;
  display: flex; flex-direction: column;
  max-width: 760px;
  margin: 0 auto;
  padding: 0 20px 40px;
}

/* ─── Header ─── */
.header {
  display: flex; align-items: center; gap: 16px;
  padding: 32px 0 28px;
  border-bottom: 2px solid var(--green-800);
  margin-bottom: 32px;
  position: relative;
}

.header::after {
  content: '';
  position: absolute; bottom: -5px; left: 0; right: 0;
  height: 1px; background: var(--gold);
  opacity: .4;
}

.header__badge {
  background: var(--green-800);
  color: var(--gold);
  font-family: 'DM Serif Display', serif;
  font-size: 13px;
  letter-spacing: .2em;
  text-transform: uppercase;
  padding: 6px 12px;
  border: 1px solid var(--gold);
  border-radius: 4px;
  flex-shrink: 0;
}

.header__text { flex: 1; }

.header__title {
  font-family: 'DM Serif Display', serif;
  font-size: 2.25rem;
  line-height: 1;
  color: var(--green-800);
  letter-spacing: -.02em;
}

.header__subtitle {
  font-size: .8rem;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--ink-muted);
  margin-top: 3px;
  font-weight: 500;
}

.header__seal {
  width: 52px; height: 52px;
  border-radius: 50%;
  border: 2px solid var(--green-800);
  display: flex; align-items: center; justify-content: center;
  font-family: 'DM Serif Display', serif;
  font-size: 1.1rem;
  color: var(--green-800);
  flex-shrink: 0;
  box-shadow: inset 0 0 0 4px var(--cream), 0 0 0 1px rgba(27,94,32,.15);
}

/* ─── Main ─── */
.main {
  display: flex; flex-direction: column; gap: 24px;
  flex: 1;
}

/* ─── Card ─── */
.card {
  background: var(--white);
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  border: 1px solid rgba(27,94,32,.08);
  animation: fadeUp .4s ease both;
}

.card:nth-child(2) { animation-delay: .1s; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.card__header {
  display: flex; align-items: center; gap: 12px;
  padding: 20px 24px 16px;
  border-bottom: 1px solid rgba(27,94,32,.07);
}

.card__number {
  font-family: 'DM Serif Display', serif;
  font-size: 1.6rem;
  color: var(--green-200);
  line-height: 1;
  min-width: 32px;
}

.card__title {
  font-family: 'DM Serif Display', serif;
  font-size: 1.15rem;
  color: var(--green-800);
  font-weight: 400;
}

/* ─── Dropzone ─── */
.dropzone {
  margin: 20px 24px 16px;
  border: 2px dashed rgba(27,94,32,.25);
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: var(--transition);
  transition-property: border-color, background;
}

.dropzone:hover,
.dropzone--active {
  border-color: var(--green-600);
  background: var(--green-50);
}

.dropzone--loading {
  pointer-events: none;
  opacity: .7;
}

.dropzone__icon {
  font-size: 1.8rem;
  color: var(--green-700);
  margin-bottom: 8px;
  display: block;
  animation: none;
}

.dropzone--loading .dropzone__icon {
  display: inline-block;
  animation: spin .8s linear infinite;
}

.dropzone__text {
  font-size: .85rem;
  color: var(--ink-muted);
  font-weight: 400;
}

/* ─── Modelo List ─── */
.modelo-list {
  list-style: none;
  margin: 0 24px 20px;
  border: 1px solid rgba(27,94,32,.1);
  border-radius: 8px;
  overflow: hidden;
}

.modelo-item {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 14px;
  cursor: pointer;
  transition: background var(--transition);
  border-bottom: 1px solid rgba(27,94,32,.06);
  font-size: .9rem;
}

.modelo-item:last-child { border-bottom: none; }

.modelo-item:hover { background: var(--green-50); }

.modelo-item--active {
  background: var(--green-50);
  border-left: 3px solid var(--green-700);
}

.modelo-item__icon { font-size: .95rem; flex-shrink: 0; }

.modelo-item__nome { flex: 1; font-weight: 500; color: var(--ink-soft); }

.modelo-item--active .modelo-item__nome { color: var(--green-800); }

.modelo-item__check {
  color: var(--green-700);
  font-weight: 700;
  font-size: .85rem;
}

.modelo-item__delete {
  background: none; border: none;
  color: var(--ink-muted);
  cursor: pointer;
  font-size: .75rem;
  padding: 4px 6px;
  border-radius: 4px;
  transition: var(--transition);
  transition-property: background, color;
  line-height: 1;
}

.modelo-item__delete:hover {
  background: var(--red-light);
  color: var(--red);
}

.empty-state {
  margin: 0 24px 20px;
  padding: 20px;
  text-align: center;
  font-size: .85rem;
  color: var(--ink-muted);
  background: var(--green-50);
  border-radius: 8px;
  border: 1px dashed rgba(27,94,32,.15);
}

/* ─── Form ─── */
.form { padding: 20px 24px 24px; }

.field { margin-bottom: 18px; }

.field__label {
  display: block;
  font-size: .78rem;
  font-weight: 600;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--ink-muted);
  margin-bottom: 7px;
}

.required { color: var(--green-700); }

.field__input {
  width: 100%;
  padding: 11px 14px;
  border: 1.5px solid rgba(27,94,32,.2);
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: .95rem;
  color: var(--ink);
  background: var(--white);
  transition: border-color var(--transition), box-shadow var(--transition);
  outline: none;
}

.field__input:focus {
  border-color: var(--green-700);
  box-shadow: 0 0 0 3px rgba(46,125,50,.12);
}

.field__input::placeholder { color: var(--ink-muted); }

.field__preview {
  padding: 11px 14px;
  border: 1.5px solid rgba(27,94,32,.12);
  border-radius: 8px;
  font-size: .95rem;
  background: var(--green-50);
  color: var(--green-800);
  font-weight: 500;
  min-height: 42px;
}

.field__preview--empty {
  color: var(--ink-muted);
  font-weight: 400;
  font-style: italic;
}

.field--animated {
  animation: slideDown .25s ease both;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.form__footer {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(27,94,32,.08);
  display: flex; align-items: center; gap: 16px;
  flex-wrap: wrap;
}

.form__date-note {
  font-size: .82rem;
  color: var(--ink-muted);
  flex: 1;
  min-width: 180px;
}

.form__date-note strong { color: var(--ink-soft); }

/* ─── Buttons ─── */
.btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: .9rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: var(--transition);
  transition-property: background, transform, box-shadow, opacity;
  letter-spacing: .02em;
}

.btn--primary {
  background: var(--green-800);
  color: var(--white);
  box-shadow: 0 2px 8px rgba(27,94,32,.3);
}

.btn--primary:hover:not(:disabled) {
  background: var(--green-700);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(27,94,32,.35);
}

.btn--primary:disabled { opacity: .6; cursor: not-allowed; }

.btn--loading { pointer-events: none; }

.btn--ghost {
  background: transparent;
  color: var(--ink-soft);
  border: 1.5px solid rgba(0,0,0,.15);
}

.btn--ghost:hover { background: rgba(0,0,0,.04); }

.btn--danger {
  background: var(--red);
  color: var(--white);
}

.btn--danger:hover { background: #b71c1c; }

/* ─── Spinner ─── */
.spinner {
  display: inline-block;
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin .7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ─── Toast ─── */
.toast {
  position: fixed; bottom: 28px; right: 28px;
  display: flex; align-items: center; gap: 10px;
  padding: 14px 20px;
  border-radius: 10px;
  font-size: .9rem;
  font-weight: 500;
  box-shadow: var(--shadow-lg);
  animation: toastIn .3s ease both;
  z-index: 1000;
  max-width: 340px;
}

@keyframes toastIn {
  from { opacity: 0; transform: translateY(12px) scale(.95); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.toast--success { background: var(--green-800); color: var(--white); }
.toast--error   { background: var(--red);       color: var(--white); }

.toast__icon { font-size: 1rem; font-weight: 700; }

/* ─── Modal ─── */
.modal-overlay {
  position: fixed; inset: 0; z-index: 900;
  background: rgba(0,0,0,.45);
  display: flex; align-items: center; justify-content: center;
  animation: fadeIn .2s ease;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.modal {
  background: var(--white);
  border-radius: var(--radius);
  padding: 28px;
  max-width: 360px; width: 90%;
  box-shadow: var(--shadow-lg);
  animation: fadeUp .25s ease;
}

.modal__text {
  font-size: 1rem;
  color: var(--ink-soft);
  margin-bottom: 20px;
  line-height: 1.5;
}

.modal__actions { display: flex; gap: 10px; justify-content: flex-end; }

/* ─── Footer ─── */
.footer {
  text-align: center;
  padding: 24px 0 8px;
  font-size: .75rem;
  color: var(--ink-muted);
  letter-spacing: .08em;
  text-transform: uppercase;
}

/* ─── Responsive ─── */
@media (max-width: 480px) {
  .header__title { font-size: 1.75rem; }
  .card__header, .form, .dropzone { padding-left: 16px; padding-right: 16px; }
  .modelo-list { margin-left: 16px; margin-right: 16px; }
  .form__footer { flex-direction: column; align-items: stretch; }
  .btn--primary { width: 100%; justify-content: center; }
  .toast { right: 16px; left: 16px; bottom: 16px; max-width: none; }
}

/* ─── PDF Hint ─── */
.pdf-hint {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 14px;
  padding: 12px 14px;
  background: #FFF8E1;
  border: 1px solid #FFE082;
  border-radius: 8px;
  font-size: .82rem;
  color: #5D4037;
  line-height: 1.5;
}

.pdf-hint__icon { font-size: 1rem; flex-shrink: 0; margin-top: 1px; }
