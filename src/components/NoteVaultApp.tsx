import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock, Mail, Eye, EyeOff, Globe, BookOpen, Github,
  X, User, Briefcase, Home, CheckCircle, AlertCircle,
  LayoutDashboard, FilePlus, FolderOpen, Download, Trash2, LogOut,
  Search, Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, List, ListOrdered,
  Table, Paperclip, Star, RotateCcw, Edit3, Menu,
  Minus, FileText, Sun, Moon, Plus, Filter,
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Note {
  id: string;
  title: string;
  content: string; // HTML
  date: string; // ISO
  category: 'planned' | 'watching' | 'purchased' | 'cancelled';
  files: { name: string; size: number; type: string; dataUrl: string }[];
  deleted: boolean;
  deletedAt?: string;
  highPriority: boolean;
  archived: boolean;
}

interface CurrentUser {
  name: string;
  email: string;
  photo: string | null;
}

// ─── Email type detection ────────────────────────────────────────────────────
const PERSONAL_DOMAINS = new Set([
  'gmail.com','yahoo.com','hotmail.com','outlook.com','aol.com',
  'icloud.com','live.com','msn.com','ymail.com','protonmail.com',
  'mail.com','zoho.com','gmx.com','fastmail.com','me.com',
  'mac.com','googlemail.com','yahoo.co.uk','yahoo.fr','yahoo.es',
  'rediffmail.com','inbox.com','rocketmail.com',
]);

function detectEmailType(email: string): 'professional' | 'personal' | null {
  const atIdx = email.indexOf('@');
  if (atIdx < 1) return null;
  const domain = email.slice(atIdx + 1).toLowerCase();
  if (!domain.includes('.')) return null;
  return PERSONAL_DOMAINS.has(domain) ? 'personal' : 'professional';
}

// ─── Shared input style helper ───────────────────────────────────────────────
function inputCls(light: boolean) {
  return `w-full border-2 rounded-xl px-12 py-3.5 placeholder-gray-400 focus:outline-none transition-all backdrop-blur-sm ${
    light
      ? 'bg-white/80 border-gray-200 text-gray-900 focus:border-blue-400'
      : 'bg-white/90 border-gray-200 text-gray-900 focus:border-blue-400'
  }`;
}

// ─── Password field with toggle ───────────────────────────────────────────────
function PwdInput({
  value, onChange, placeholder, show, onToggle, light,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  show: boolean; onToggle: () => void; light?: boolean;
}) {
  return (
    <div className="relative flex items-center">
      <Lock className="absolute left-4 w-5 h-5 text-gray-400" />
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={inputCls(light ?? true)}
        placeholder={placeholder ?? '••••••••'}
        required
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors"
      >
        {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
}

// ─── Modal shell ─────────────────────────────────────────────────────────────
function ModalShell({
  open, onClose, children,
}: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
          >
            <Dialog.Content asChild aria-describedby={undefined}>
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                className="relative w-full max-w-md"
                onClick={e => e.stopPropagation()}
              >
                <VisuallyHidden.Root>
                  <Dialog.Title>NoteVault dialog</Dialog.Title>
                </VisuallyHidden.Root>
                {children}
              </motion.div>
            </Dialog.Content>
          </motion.div>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ─── Google Login Modal ───────────────────────────────────────────────────────
function GoogleModal({ open, onClose, lang, onLogin }: {
  open: boolean; onClose: () => void; lang: string;
  onLogin: (user: CurrentUser) => void;
}) {
  const [gEmail, setGEmail] = useState('');
  const [gPass, setGPass] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const emailType = detectEmailType(gEmail);
  const handleClose = () => { setGEmail(''); setGPass(''); setError(''); onClose(); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      handleClose();
      const namePart = gEmail.split('@')[0];
      onLogin({ name: namePart || 'Google User', email: gEmail, photo: null });
    }, 1800);
  };

  const fieldStyle = {
    background: '#f8f9fa',
    border: '1px solid #dadce0',
    color: '#202124',
  };

  return (
    <ModalShell open={open} onClose={handleClose}>
      <div className="rounded-3xl shadow-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #dadce0' }}>
        <div className="px-8 pt-8 pb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#f1f3f4' }}>
                <svg viewBox="0 0 24 24" width="22" height="22">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              <div>
                <p className="font-semibold text-base" style={{ color: '#202124' }}>Google</p>
                <p className="text-xs" style={{ color: '#5f6368' }}>
                  {lang === 'EN' ? 'Sign in to continue' : 'Inicia sesión para continuar'}
                </p>
              </div>
            </div>
            <button onClick={handleClose} className="transition-colors hover:bg-gray-100 rounded-full p-1" style={{ color: '#5f6368' }}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-xl font-semibold mb-6" style={{ color: '#202124' }}>
            {lang === 'EN' ? 'Sign in with Google' : 'Inicia sesión con Google'}
          </h2>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl" style={{ background: 'rgba(234,67,53,0.08)', border: '1px solid rgba(234,67,53,0.3)' }}>
              <AlertCircle className="w-4 h-4 shrink-0" style={{ color: '#ea4335' }} />
              <p className="text-sm" style={{ color: '#ea4335' }}>{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1.5 font-medium" style={{ color: '#202124' }}>
                {lang === 'EN' ? 'Email or phone' : 'Correo o teléfono'}
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 w-5 h-5" style={{ color: '#5f6368' }} />
                <input
                  type="email"
                  value={gEmail}
                  onChange={e => setGEmail(e.target.value)}
                  className="w-full rounded-xl px-12 py-3 text-sm placeholder-gray-400 focus:outline-none transition-all"
                  style={fieldStyle}
                  onFocus={e => { e.currentTarget.style.border = '2px solid #1a73e8'; e.currentTarget.style.background = '#fff'; }}
                  onBlur={e => { e.currentTarget.style.border = '1px solid #dadce0'; e.currentTarget.style.background = '#f8f9fa'; }}
                  placeholder={lang === 'EN' ? 'Enter your email' : 'Ingresa tu correo'}
                  required
                  autoFocus
                />
              </div>
              {emailType && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mt-1.5 px-3 py-1.5 rounded-lg"
                  style={{ background: emailType === 'professional' ? 'rgba(26,115,232,0.06)' : 'rgba(251,188,5,0.08)', border: `1px solid ${emailType === 'professional' ? 'rgba(26,115,232,0.2)' : 'rgba(251,188,5,0.3)'}` }}>
                  {emailType === 'professional' ? <Briefcase className="w-3.5 h-3.5" style={{ color: '#1a73e8' }} /> : <Home className="w-3.5 h-3.5" style={{ color: '#f9ab00' }} />}
                  <span className="text-xs font-medium" style={{ color: emailType === 'professional' ? '#1a73e8' : '#f9ab00' }}>
                    {emailType === 'professional'
                      ? (lang === 'EN' ? 'Professional email detected' : 'Correo profesional detectado')
                      : (lang === 'EN' ? 'Personal email detected' : 'Correo personal detectado')}
                  </span>
                </motion.div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium" style={{ color: '#202124' }}>
                  {lang === 'EN' ? 'Password' : 'Contraseña'}
                </label>
                <a href="#" className="text-xs font-medium" style={{ color: '#1a73e8' }}>
                  {lang === 'EN' ? 'Forgot password?' : '¿Olvidaste tu contraseña?'}
                </a>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 w-5 h-5" style={{ color: '#5f6368' }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={gPass}
                  onChange={e => setGPass(e.target.value)}
                  className="w-full rounded-xl px-12 py-3 text-sm placeholder-gray-400 focus:outline-none transition-all"
                  style={fieldStyle}
                  onFocus={e => { e.currentTarget.style.border = '2px solid #1a73e8'; e.currentTarget.style.background = '#fff'; }}
                  onBlur={e => { e.currentTarget.style.border = '1px solid #dadce0'; e.currentTarget.style.background = '#f8f9fa'; }}
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-4 transition-colors" style={{ color: '#5f6368' }}>
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60 transition-all mt-2"
              style={{ background: 'linear-gradient(135deg, #1a73e8, #1557b0)', boxShadow: '0 1px 3px rgba(26,115,232,0.4)' }}
            >
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="rgba(255,255,255,0.9)"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="rgba(255,255,255,0.9)"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="rgba(255,255,255,0.9)"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="rgba(255,255,255,0.9)"/>
                </svg>
              )}
              {lang === 'EN' ? 'Sign in with Google' : 'Ingresar con Google'}
            </motion.button>
          </form>

          <p className="mt-4 text-center text-xs" style={{ color: '#5f6368' }}>
            {lang === 'EN' ? "Don't have a Google Account? " : '¿No tienes cuenta de Google? '}
            <a href="#" className="font-medium" style={{ color: '#1a73e8' }}>
              {lang === 'EN' ? 'Create account' : 'Crear cuenta'}
            </a>
          </p>

          <div className="mt-4 pt-4 border-t text-center" style={{ borderColor: '#e8eaed' }}>
            <p className="text-xs" style={{ color: '#80868b' }}>
              {lang === 'EN' ? 'Protected by Google reCAPTCHA · Privacy · Terms' : 'Protegido por reCAPTCHA · Privacidad · Términos'}
            </p>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

// ─── GitHub Login Modal ───────────────────────────────────────────────────────
function GitHubModal({ open, onClose, lang, onLogin }: {
  open: boolean; onClose: () => void; lang: string;
  onLogin: (user: CurrentUser) => void;
}) {
  const [ghUser, setGhUser] = useState('');
  const [ghPass, setGhPass] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => { setGhUser(''); setGhPass(''); setError(''); onClose(); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      handleClose();
      onLogin({ name: ghUser || 'GitHub User', email: `${ghUser}@github.com`, photo: null });
    }, 1800);
  };

  return (
    <ModalShell open={open} onClose={handleClose}>
      <div className="rounded-3xl shadow-2xl overflow-hidden" style={{ background: '#0d1117', border: '1px solid #30363d' }}>
        <div className="px-8 pt-8 pb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#21262d' }}>
                <Github className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-base">GitHub</p>
                <p className="text-xs" style={{ color: '#8b949e' }}>
                  {lang === 'EN' ? 'Sign in to continue' : 'Inicia sesión para continuar'}
                </p>
              </div>
            </div>
            <button onClick={handleClose} style={{ color: '#8b949e' }} className="hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-xl font-semibold text-white mb-6">
            {lang === 'EN' ? 'Sign in to GitHub' : 'Inicia sesión en GitHub'}
          </h2>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl" style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)' }}>
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1.5 font-medium" style={{ color: '#e6edf3' }}>
                {lang === 'EN' ? 'Username or email address' : 'Usuario o correo electrónico'}
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-4 w-5 h-5" style={{ color: '#8b949e' }} />
                <input
                  type="text"
                  value={ghUser}
                  onChange={e => setGhUser(e.target.value)}
                  className="w-full rounded-xl px-12 py-3 text-sm placeholder-gray-600 focus:outline-none transition-all"
                  style={{ background: '#010409', border: '1px solid #30363d', color: '#e6edf3' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#388bfd')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#30363d')}
                  placeholder={lang === 'EN' ? 'username or email' : 'usuario o correo'}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium" style={{ color: '#e6edf3' }}>
                  {lang === 'EN' ? 'Password' : 'Contraseña'}
                </label>
                <a href="#" className="text-xs" style={{ color: '#388bfd' }}>
                  {lang === 'EN' ? 'Forgot password?' : '¿Olvidaste tu contraseña?'}
                </a>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 w-5 h-5" style={{ color: '#8b949e' }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={ghPass}
                  onChange={e => setGhPass(e.target.value)}
                  className="w-full rounded-xl px-12 py-3 text-sm placeholder-gray-600 focus:outline-none transition-all"
                  style={{ background: '#010409', border: '1px solid #30363d', color: '#e6edf3' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#388bfd')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#30363d')}
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-4 transition-colors" style={{ color: '#8b949e' }}>
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
              style={{ background: 'linear-gradient(180deg, #238636, #1a7f37)', border: '1px solid rgba(240,246,252,0.1)', boxShadow: '0 0 transparent, 0 0 transparent, 0 1px 0 rgba(27,31,35,0.1), inset 0 1px 0 rgba(255,255,255,0.03)' }}
            >
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
              ) : <Github className="w-4 h-4" />}
              {lang === 'EN' ? 'Sign in with GitHub' : 'Ingresar con GitHub'}
            </motion.button>
          </form>

          <p className="mt-4 text-center text-xs" style={{ color: '#8b949e' }}>
            {lang === 'EN' ? "New to GitHub? " : "¿Nuevo en GitHub? "}
            <a href="#" style={{ color: '#388bfd' }}>
              {lang === 'EN' ? 'Create an account.' : 'Crea una cuenta.'}
            </a>
          </p>
        </div>
      </div>
    </ModalShell>
  );
}

// ─── Sign Up Modal ────────────────────────────────────────────────────────────
function SignUpModal({ open, onClose, lang, lampOn, onLogin }: {
  open: boolean; onClose: () => void; lang: string; lampOn: boolean;
  onLogin: (user: CurrentUser) => void;
}) {
  const [name, setName] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPass, setSuPass] = useState('');
  const [suConfirm, setSuConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const emailType = detectEmailType(suEmail);
  const passwordsMatch = suPass.length > 0 && suPass === suConfirm;
  const passwordStrong = suPass.length >= 8;

  const handleClose = () => {
    setName(''); setSuEmail(''); setSuPass(''); setSuConfirm('');
    setDone(false); setPhotoDataUrl(null); onClose();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhotoDataUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (suPass !== suConfirm) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
      setTimeout(() => {
        handleClose();
        onLogin({ name, email: suEmail, photo: photoDataUrl });
      }, 1200);
    }, 1800);
  };

  return (
    <ModalShell open={open} onClose={handleClose}>
      <div
        className="rounded-3xl shadow-2xl overflow-hidden border-2"
        style={{
          background: lampOn
            ? 'linear-gradient(135deg,rgba(255,255,255,0.97),rgba(255,251,235,0.92))'
            : 'linear-gradient(135deg,rgba(5,5,10,0.97),rgba(40,0,0,0.88))',
          borderColor: lampOn ? 'rgba(251,191,36,0.4)' : 'rgba(120,53,15,0.35)',
        }}
      >
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-yellow-500/30 rounded-tl-3xl" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-yellow-500/30 rounded-br-3xl" />

        <div className="relative px-8 py-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 via-amber-600 to-red-900 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-base" style={{ color: lampOn ? '#111' : '#fff' }}>NoteVault</p>
                <p className="text-xs text-yellow-600">
                  {lang === 'EN' ? 'Create your account' : 'Crea tu cuenta'}
                </p>
              </div>
            </div>
            <button onClick={handleClose} className="transition-colors" style={{ color: lampOn ? '#9ca3af' : '#6b7280' }}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Photo upload */}
          <div className="flex justify-center mb-4">
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-yellow-500/50 hover:border-yellow-500 transition-all group"
              style={{ background: lampOn ? 'rgba(251,191,36,0.1)' : 'rgba(251,191,36,0.08)' }}
            >
              {photoDataUrl ? (
                <img src={photoDataUrl} alt="profile" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-1">
                  <User className="w-7 h-7 text-yellow-500" />
                  <span className="text-xs text-yellow-600">{lang === 'EN' ? 'Photo' : 'Foto'}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
            </button>
            <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>

          {done ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-8 text-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-xl shadow-yellow-500/40">
                <CheckCircle className="w-9 h-9 text-white" />
              </div>
              <h3 className="text-xl font-semibold" style={{ color: lampOn ? '#111' : '#fff' }}>
                {lang === 'EN' ? 'Account created!' : '¡Cuenta creada!'}
              </h3>
              <p className="text-sm" style={{ color: lampOn ? '#6b7280' : '#9ca3af' }}>
                {lang === 'EN'
                  ? `Welcome to NoteVault, ${name}!`
                  : `¡Bienvenido a NoteVault, ${name}!`}
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1.5 font-medium" style={{ color: lampOn ? '#374151' : '#d1d5db' }}>
                  {lang === 'EN' ? 'Full Name' : 'Nombre completo'}
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-4 w-5 h-5 text-yellow-600" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full border-2 rounded-xl px-12 py-3.5 placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-all"
                    style={{ background: lampOn ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.4)', borderColor: lampOn ? 'rgba(251,191,36,0.4)' : 'rgba(120,53,15,0.32)', color: lampOn ? '#111' : '#fff' }}
                    placeholder={lang === 'EN' ? 'Your full name' : 'Tu nombre completo'}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1.5 font-medium" style={{ color: lampOn ? '#374151' : '#d1d5db' }}>
                  {lang === 'EN' ? 'Email Address' : 'Correo Electrónico'}
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 w-5 h-5 text-yellow-600" />
                  <input
                    type="email"
                    value={suEmail}
                    onChange={e => setSuEmail(e.target.value)}
                    className="w-full border-2 rounded-xl px-12 py-3.5 placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-all"
                    style={{ background: lampOn ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.4)', borderColor: lampOn ? 'rgba(251,191,36,0.4)' : 'rgba(120,53,15,0.32)', color: lampOn ? '#111' : '#fff' }}
                    placeholder={lang === 'EN' ? 'your@email.com' : 'tu@email.com'}
                    required
                  />
                </div>
                {emailType && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mt-1.5 px-3 py-1.5 rounded-lg"
                    style={{ background: emailType === 'professional' ? 'rgba(59,130,246,0.08)' : 'rgba(234,179,8,0.08)', border: `1px solid ${emailType === 'professional' ? 'rgba(59,130,246,0.22)' : 'rgba(234,179,8,0.25)'}` }}>
                    {emailType === 'professional' ? <Briefcase className="w-3.5 h-3.5 text-blue-500" /> : <Home className="w-3.5 h-3.5 text-yellow-500" />}
                    <span className="text-xs font-medium" style={{ color: emailType === 'professional' ? '#3b82f6' : '#ca8a04' }}>
                      {emailType === 'professional'
                        ? (lang === 'EN' ? 'Professional email' : 'Correo profesional')
                        : (lang === 'EN' ? 'Personal email' : 'Correo personal')}
                    </span>
                  </motion.div>
                )}
              </div>

              <div>
                <label className="block text-sm mb-1.5 font-medium" style={{ color: lampOn ? '#374151' : '#d1d5db' }}>
                  {lang === 'EN' ? 'Password' : 'Contraseña'}
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 w-5 h-5 text-yellow-600" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={suPass}
                    onChange={e => setSuPass(e.target.value)}
                    className="w-full border-2 rounded-xl px-12 py-3.5 placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-all"
                    style={{ background: lampOn ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.4)', borderColor: lampOn ? 'rgba(251,191,36,0.4)' : 'rgba(120,53,15,0.32)', color: lampOn ? '#111' : '#fff' }}
                    placeholder="••••••••"
                    required
                  />
                  <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-4" style={{ color: lampOn ? '#6b7280' : '#9ca3af' }}>
                    {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {suPass.length > 0 && (
                  <div className="flex items-center gap-2 mt-1.5">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                        style={{ background: suPass.length >= (i + 1) * 2 ? suPass.length >= 8 ? '#22c55e' : '#eab308' : lampOn ? '#e5e7eb' : '#374151' }} />
                    ))}
                    <span className="text-xs" style={{ color: passwordStrong ? '#22c55e' : '#eab308' }}>
                      {passwordStrong ? (lang === 'EN' ? 'Strong' : 'Fuerte') : (lang === 'EN' ? 'Weak' : 'Débil')}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm mb-1.5 font-medium" style={{ color: lampOn ? '#374151' : '#d1d5db' }}>
                  {lang === 'EN' ? 'Confirm Password' : 'Confirmar Contraseña'}
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 w-5 h-5 text-yellow-600" />
                  <input
                    type={showCf ? 'text' : 'password'}
                    value={suConfirm}
                    onChange={e => setSuConfirm(e.target.value)}
                    className="w-full border-2 rounded-xl px-12 py-3.5 placeholder-gray-400 focus:outline-none transition-all"
                    style={{ background: lampOn ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.4)', borderColor: suConfirm.length > 0 ? passwordsMatch ? '#22c55e' : '#ef4444' : lampOn ? 'rgba(251,191,36,0.4)' : 'rgba(120,53,15,0.32)', color: lampOn ? '#111' : '#fff' }}
                    placeholder="••••••••"
                    required
                  />
                  <button type="button" onClick={() => setShowCf(p => !p)} className="absolute right-4" style={{ color: lampOn ? '#6b7280' : '#9ca3af' }}>
                    {showCf ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {suConfirm.length > 0 && (
                  <p className="text-xs mt-1 flex items-center gap-1" style={{ color: passwordsMatch ? '#22c55e' : '#ef4444' }}>
                    {passwordsMatch
                      ? <><CheckCircle className="w-3.5 h-3.5" /> {lang === 'EN' ? 'Passwords match' : 'Las contraseñas coinciden'}</>
                      : <><AlertCircle className="w-3.5 h-3.5" /> {lang === 'EN' ? "Passwords don't match" : 'Las contraseñas no coinciden'}</>}
                  </p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(234,179,8,0.35)' }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || !passwordsMatch || !passwordStrong}
                className="relative w-full overflow-hidden rounded-xl py-4 bg-gradient-to-r from-yellow-500 via-amber-600 to-red-900 text-white font-medium disabled:opacity-50 shadow-lg shadow-yellow-500/30 flex items-center justify-center gap-2 mt-2"
              >
                <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <span className="relative z-10 flex items-center gap-2">
                  {loading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> : null}
                  {lang === 'EN' ? 'Create Account' : 'Crear Cuenta'}
                </span>
              </motion.button>
            </form>
          )}
        </div>
      </div>
    </ModalShell>
  );
}

// ─── Shared content modal shell ──────────────────────────────────────────────
function ContentModal({ open, onClose, title, icon, children, lampOn }: {
  open: boolean; onClose: () => void; title: string; icon: React.ReactNode;
  children: React.ReactNode; lampOn: boolean;
}) {
  return (
    <ModalShell open={open} onClose={onClose}>
      <div
        className="rounded-3xl shadow-2xl border-2 overflow-hidden flex flex-col max-h-[85vh]"
        style={{ background: lampOn ? 'linear-gradient(135deg,rgba(255,255,255,0.97),rgba(255,251,235,0.92))' : 'linear-gradient(135deg,rgba(5,5,10,0.98),rgba(30,0,0,0.92))', borderColor: lampOn ? 'rgba(251,191,36,0.4)' : 'rgba(120,53,15,0.35)' }}
      >
        <div className="flex items-center justify-between px-8 py-5 border-b shrink-0" style={{ borderColor: lampOn ? 'rgba(251,191,36,0.2)' : 'rgba(120,53,15,0.25)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-yellow-500 via-amber-600 to-red-900 rounded-xl flex items-center justify-center shadow-md shadow-yellow-500/30">
              {icon}
            </div>
            <h2 className="text-lg font-semibold" style={{ color: lampOn ? '#111' : '#f9fafb' }}>{title}</h2>
          </div>
          <button onClick={onClose} style={{ color: lampOn ? '#9ca3af' : '#6b7280' }} className="hover:scale-110 transition-transform">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-8 py-6 space-y-6 flex-1 text-sm leading-relaxed" style={{ color: lampOn ? '#374151' : '#d1d5db' }}>
          {children}
        </div>
      </div>
    </ModalShell>
  );
}

function Section({ title, children, lampOn }: { title: string; children: React.ReactNode; lampOn: boolean }) {
  return (
    <div>
      <h3 className="font-semibold mb-2 text-base" style={{ color: lampOn ? '#111' : '#f9fafb' }}>{title}</h3>
      <div className="space-y-2" style={{ color: lampOn ? '#4b5563' : '#9ca3af' }}>{children}</div>
    </div>
  );
}

// ─── Privacy Modal ────────────────────────────────────────────────────────────
function PrivacyModal({ open, onClose, lang, lampOn }: { open: boolean; onClose: () => void; lang: string; lampOn: boolean }) {
  const t = lang === 'EN';
  return (
    <ContentModal open={open} onClose={onClose} title={t ? 'Privacy Policy' : 'Política de Privacidad'} icon={<Lock className="w-4 h-4 text-white" />} lampOn={lampOn}>
      <p style={{ color: lampOn ? '#6b7280' : '#9ca3af' }}>
        {t ? 'Last updated: July 20, 2026 · Effective immediately' : 'Última actualización: 20 de julio de 2026 · Efectiva de inmediato'}
      </p>
      <Section title={t ? '1. Information We Collect' : '1. Información que recopilamos'} lampOn={lampOn}>
        <p>{t ? 'We collect information you provide directly to us when creating an account, such as your name, email address, and password. We also collect usage data including pages visited, features used, and timestamps.' : 'Recopilamos la información que nos proporcionas al crear una cuenta, como tu nombre, correo electrónico y contraseña.'}</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>{t ? 'Account information (name, email, password hash)' : 'Información de cuenta (nombre, correo, hash de contraseña)'}</li>
          <li>{t ? 'Notes content and metadata (titles, tags, creation dates)' : 'Contenido de notas y metadatos'}</li>
          <li>{t ? 'Device and browser information' : 'Información del dispositivo y navegador'}</li>
          <li>{t ? 'IP address and approximate location' : 'Dirección IP y ubicación aproximada'}</li>
        </ul>
      </Section>
      <div className="h-px" style={{ background: lampOn ? 'rgba(251,191,36,0.2)' : 'rgba(120,53,15,0.25)' }} />
      <Section title={t ? '2. How We Use Your Information' : '2. Cómo usamos tu información'} lampOn={lampOn}>
        <p>{t ? 'We use the information we collect to provide, maintain, and improve NoteVault, authenticate your identity, send transactional emails, and protect against fraud.' : 'Usamos la información para brindar, mantener y mejorar NoteVault, autenticar tu identidad y proteger contra fraudes.'}</p>
        <p>{t ? 'We do not sell, rent, or trade your personal information to third parties.' : 'No vendemos ni intercambiamos tu información personal a terceros.'}</p>
      </Section>
      <div className="h-px" style={{ background: lampOn ? 'rgba(251,191,36,0.2)' : 'rgba(120,53,15,0.25)' }} />
      <Section title={t ? '3. Data Security' : '3. Seguridad de datos'} lampOn={lampOn}>
        <p>{t ? 'We implement AES-256 encryption at rest, TLS 1.3 in transit, bcrypt password hashing, and regular security audits.' : 'Implementamos cifrado AES-256, TLS 1.3, hashing bcrypt y auditorías periódicas.'}</p>
      </Section>
      <div className="rounded-xl px-4 py-3 text-xs" style={{ background: lampOn ? 'rgba(251,191,36,0.08)' : 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', color: lampOn ? '#92400e' : '#fbbf24' }}>
        {t ? 'Questions? Contact privacy@notevault.io' : '¿Preguntas? Contáctanos en privacy@notevault.io'}
      </div>
    </ContentModal>
  );
}

// ─── Terms Modal ──────────────────────────────────────────────────────────────
function TermsModal({ open, onClose, lang, lampOn }: { open: boolean; onClose: () => void; lang: string; lampOn: boolean }) {
  const t = lang === 'EN';
  return (
    <ContentModal open={open} onClose={onClose} title={t ? 'Terms of Service' : 'Términos de Servicio'} icon={<BookOpen className="w-4 h-4 text-white" />} lampOn={lampOn}>
      <p style={{ color: lampOn ? '#6b7280' : '#9ca3af' }}>
        {t ? 'Last updated: July 20, 2026 · By using NoteVault you agree to these terms.' : 'Última actualización: 20 de julio de 2026 · Al usar NoteVault aceptas estos términos.'}
      </p>
      <Section title={t ? '1. Acceptance of Terms' : '1. Aceptación de términos'} lampOn={lampOn}>
        <p>{t ? 'By accessing or using NoteVault, you agree to be bound by these Terms of Service. If you disagree, you may not access the Service.' : 'Al acceder o usar NoteVault, aceptas estos Términos. Si no estás de acuerdo, no puedes acceder al Servicio.'}</p>
      </Section>
      <div className="h-px" style={{ background: lampOn ? 'rgba(251,191,36,0.2)' : 'rgba(120,53,15,0.25)' }} />
      <Section title={t ? '2. Account Responsibilities' : '2. Responsabilidades de cuenta'} lampOn={lampOn}>
        <ul className="list-disc list-inside space-y-1">
          <li>{t ? 'You must be at least 13 years old to use NoteVault' : 'Debes tener al menos 13 años para usar NoteVault'}</li>
          <li>{t ? 'You are responsible for maintaining the confidentiality of your password' : 'Eres responsable de mantener la confidencialidad de tu contraseña'}</li>
          <li>{t ? 'You must notify us immediately of any unauthorized account access' : 'Debes notificarnos inmediatamente cualquier acceso no autorizado'}</li>
        </ul>
      </Section>
      <div className="h-px" style={{ background: lampOn ? 'rgba(251,191,36,0.2)' : 'rgba(120,53,15,0.25)' }} />
      <Section title={t ? '3. Limitation of Liability' : '3. Limitación de responsabilidad'} lampOn={lampOn}>
        <p>{t ? 'To the maximum extent permitted by law, NoteVault shall not be liable for any indirect, incidental, or consequential damages.' : 'En la máxima medida permitida, NoteVault no será responsable de daños indirectos o consecuentes.'}</p>
      </Section>
      <div className="rounded-xl px-4 py-3 text-xs" style={{ background: lampOn ? 'rgba(251,191,36,0.08)' : 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', color: lampOn ? '#92400e' : '#fbbf24' }}>
        {t ? 'Questions? Contact legal@notevault.io' : '¿Preguntas? Contáctanos en legal@notevault.io'}
      </div>
    </ContentModal>
  );
}

// ─── Support Modal ────────────────────────────────────────────────────────────
function SupportModal({ open, onClose, lang, lampOn, onContact }: { open: boolean; onClose: () => void; lang: string; lampOn: boolean; onContact: () => void }) {
  const t = lang === 'EN';
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faqs = t ? [
    { q: 'How do I reset my password?', a: 'Click "Forgot Password?" on the login screen.' },
    { q: 'Can I access NoteVault offline?', a: 'Yes! NoteVault caches notes locally and syncs when reconnected.' },
    { q: 'How do I export my notes?', a: 'Use the "Save to Computer" view in the sidebar.' },
    { q: 'Is there a storage limit?', a: 'Free accounts get 500 MB. Premium accounts get 50 GB.' },
  ] : [
    { q: '¿Cómo restablezco mi contraseña?', a: 'Haz clic en "¿Olvidaste tu contraseña?" en el inicio de sesión.' },
    { q: '¿Puedo usar NoteVault sin conexión?', a: 'Sí. Las notas se almacenan localmente y sincronizan al reconectarte.' },
    { q: '¿Cómo exporto mis notas?', a: 'Usa la vista "Guardar en computadora" en el menú lateral.' },
    { q: '¿Hay límite de almacenamiento?', a: 'Las cuentas gratuitas tienen 500 MB. Premium tiene 50 GB.' },
  ];

  return (
    <ContentModal open={open} onClose={onClose} title={t ? 'Help & Support' : 'Ayuda y Soporte'} icon={<User className="w-4 h-4 text-white" />} lampOn={lampOn}>
      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <div key={i} className="rounded-xl overflow-hidden border transition-all" style={{ borderColor: lampOn ? 'rgba(251,191,36,0.2)' : 'rgba(120,53,15,0.25)' }}>
            <button className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors"
              style={{ background: lampOn ? (openFaq === i ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.5)') : (openFaq === i ? 'rgba(251,191,36,0.08)' : 'rgba(255,255,255,0.03)') }}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <span className="font-medium text-sm" style={{ color: lampOn ? '#111' : '#f9fafb' }}>{faq.q}</span>
              <span className="text-yellow-500 ml-2 text-lg leading-none">{openFaq === i ? '−' : '+'}</span>
            </button>
            {openFaq === i && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="px-4 pb-3 text-sm"
                style={{ color: lampOn ? '#6b7280' : '#9ca3af', background: lampOn ? 'rgba(251,191,36,0.04)' : 'rgba(255,255,255,0.02)' }}>
                {faq.a}
              </motion.div>
            )}
          </div>
        ))}
      </div>
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { onClose(); onContact(); }}
        className="w-full py-3.5 rounded-xl text-white font-medium bg-gradient-to-r from-yellow-500 via-amber-600 to-red-900 shadow-lg shadow-yellow-500/25 flex items-center justify-center gap-2">
        <Mail className="w-4 h-4" />
        {t ? 'Send Us a Message' : 'Envíanos un Mensaje'}
      </motion.button>
    </ContentModal>
  );
}

// ─── Contact Modal ────────────────────────────────────────────────────────────
function ContactModal({ open, onClose, lang, lampOn }: { open: boolean; onClose: () => void; lang: string; lampOn: boolean }) {
  const t = lang === 'EN';
  const [name, setName] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleClose = () => { setName(''); setCEmail(''); setSubject(''); setMessage(''); setSent(false); onClose(); };
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setLoading(true); setTimeout(() => { setLoading(false); setSent(true); }, 1800); };

  const inputStyle = { background: lampOn ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.4)', borderColor: lampOn ? 'rgba(251,191,36,0.4)' : 'rgba(120,53,15,0.32)', color: lampOn ? '#111' : '#fff' };
  const labelColor = lampOn ? '#374151' : '#d1d5db';

  return (
    <ContentModal open={open} onClose={handleClose} title={t ? 'Contact Us' : 'Contáctanos'} icon={<Mail className="w-4 h-4 text-white" />} lampOn={lampOn}>
      {sent ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-10 text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-xl shadow-yellow-500/40">
            <CheckCircle className="w-9 h-9 text-white" />
          </div>
          <h3 className="text-xl font-semibold" style={{ color: lampOn ? '#111' : '#fff' }}>{t ? 'Message sent!' : '¡Mensaje enviado!'}</h3>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleClose} className="mt-2 px-8 py-3 rounded-xl text-white font-medium bg-gradient-to-r from-yellow-500 via-amber-600 to-red-900">
            {t ? 'Done' : 'Cerrar'}
          </motion.button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: labelColor }}>{t ? 'Full Name' : 'Nombre'}</label>
              <div className="relative">
                <User className="absolute left-3 w-4 h-4 text-yellow-600 top-1/2 -translate-y-1/2" />
                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full border-2 rounded-xl pl-9 pr-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-all" style={inputStyle} placeholder={t ? 'Your name' : 'Tu nombre'} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: labelColor }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 w-4 h-4 text-yellow-600 top-1/2 -translate-y-1/2" />
                <input type="email" value={cEmail} onChange={e => setCEmail(e.target.value)} required className="w-full border-2 rounded-xl pl-9 pr-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-all" style={inputStyle} placeholder="you@example.com" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: labelColor }}>{t ? 'Subject' : 'Asunto'}</label>
            <select value={subject} onChange={e => setSubject(e.target.value)} required className="w-full border-2 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-500 transition-all" style={inputStyle}>
              <option value="">{t ? '— Select a topic —' : '— Selecciona un tema —'}</option>
              <option value="billing">{t ? 'Billing & Subscription' : 'Facturación'}</option>
              <option value="bug">{t ? 'Bug Report' : 'Reporte de error'}</option>
              <option value="feature">{t ? 'Feature Request' : 'Solicitud de función'}</option>
              <option value="other">{t ? 'Other' : 'Otro'}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: labelColor }}>{t ? 'Message' : 'Mensaje'}</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={4} className="w-full border-2 rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-all resize-none" style={inputStyle} placeholder={t ? 'Describe your issue...' : 'Describe tu problema...'} />
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading || !subject} className="relative w-full overflow-hidden rounded-xl py-3.5 bg-gradient-to-r from-yellow-500 via-amber-600 to-red-900 text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2">
            <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <span className="relative z-10 flex items-center gap-2">
              {loading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> : <Mail className="w-4 h-4" />}
              {t ? 'Send Message' : 'Enviar Mensaje'}
            </span>
          </motion.button>
        </form>
      )}
    </ContentModal>
  );
}

// ─── LampCordRight ────────────────────────────────────────────────────────────
function LampCordRight({ lampOn, onToggle }: { lampOn: boolean; onToggle: () => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const dragStartY = useRef(0);
  const MAX_PULL = 130;
  const TRIGGER_THRESHOLD = 65;

  const onKnobPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragStartY.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onKnobPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const delta = Math.max(0, Math.min(MAX_PULL, e.clientY - dragStartY.current));
    setPullDistance(delta);
  };
  const onKnobPointerUp = () => {
    if (!isDragging) return;
    if (pullDistance >= TRIGGER_THRESHOLD) onToggle();
    setPullDistance(0);
    setIsDragging(false);
  };

  return (
    <div className="fixed right-0 top-0 bottom-0 w-12 flex flex-col items-center justify-start pt-8 z-40" style={{ background: 'transparent' }}>
      {/* Sun/Moon icon */}
      <div className="mb-2">
        {lampOn ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-gray-500" />}
      </div>
      {/* Hint text rotated */}
      <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: '10px', color: lampOn ? '#ca8a04' : '#6b7280', marginBottom: '8px', userSelect: 'none' }}>
        Pull to toggle
      </div>
      {/* Fixed cord line */}
      <div style={{ width: '2px', height: '60px', background: lampOn ? '#ca8a04' : '#4b5563', transition: 'background 0.7s' }} />
      {/* Draggable knob */}
      <div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateY(${pullDistance}px)`, transition: isDragging ? 'none' : 'transform 0.52s cubic-bezier(0.34,1.56,0.64,1)', cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none' }}
        onPointerDown={onKnobPointerDown}
        onPointerMove={onKnobPointerMove}
        onPointerUp={onKnobPointerUp}
        onPointerCancel={onKnobPointerUp}
      >
        <div style={{ width: '2px', height: `${30 + pullDistance * 0.35}px`, background: lampOn ? '#ca8a04' : '#4b5563', transition: isDragging ? 'none' : 'height 0.52s,background 0.7s' }} />
        <motion.div
          whileHover={{ scale: 1.18 }}
          style={{ width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${lampOn ? '#ffd700' : '#4b5563'}`, background: lampOn ? 'radial-gradient(circle at 32% 28%,#fffde0,#ffd700 48%,#b8860b)' : 'radial-gradient(circle at 32% 28%,#888,#444)', boxShadow: lampOn ? '0 0 14px 5px rgba(255,215,0,0.65)' : '0 4px 10px rgba(0,0,0,0.5)', transition: 'background 0.5s,border-color 0.5s,box-shadow 0.5s' }}
        >
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: lampOn ? 'rgba(255,255,220,0.92)' : 'rgba(255,255,255,0.18)' }} />
        </motion.div>
      </div>
    </div>
  );
}

// ─── NoteVaultApp ─────────────────────────────────────────────────────────────
type AppPage = 'dashboard' | 'new-note' | 'all-files' | 'save' | 'recycle';

function NoteVaultApp({
  lampOn, onToggleLamp, notes, setNotes, currentUser, setCurrentUser, onLogout, language,
}: {
  lampOn: boolean;
  onToggleLamp: () => void;
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  currentUser: CurrentUser;
  setCurrentUser: React.Dispatch<React.SetStateAction<CurrentUser | null>>;
  onLogout: () => void;
  language: string;
}) {
  const [page, setPage] = useState<AppPage>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const photoInputRef = useRef<HTMLInputElement>(null);

  const dark = !lampOn;
  const bg = dark ? '#030712' : '#fffbeb';
  const textPrimary = dark ? '#f9fafb' : '#111827';
  const textSecondary = dark ? '#9ca3af' : '#6b7280';
  const borderColor = dark ? 'rgba(120,53,15,0.35)' : 'rgba(251,191,36,0.4)';
  const cardBg = dark ? 'rgba(15,10,5,0.8)' : 'rgba(255,255,255,0.85)';
  const sidebarBg = dark ? 'rgba(5,3,1,0.9)' : 'rgba(255,255,255,0.8)';

  const activeNotes = notes.filter(n => !n.deleted && !n.archived);
  const deletedCount = notes.filter(n => n.deleted).length;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setCurrentUser(u => u ? { ...u, photo: ev.target?.result as string } : u);
    reader.readAsDataURL(file);
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    setSearchQuery(query);
    setRecentSearches(prev => [query, ...prev.filter(s => s !== query)].slice(0, 5));
    setSearchFocused(false);
  };

  const filteredNotes = activeNotes.filter(n => {
    const matchesSearch = !searchQuery || n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.replace(/<[^>]*>/g, '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || n.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const navItems = [
    { id: 'dashboard' as AppPage, icon: <LayoutDashboard className="w-5 h-5" />, label: language === 'EN' ? 'Dashboard' : 'Panel' },
    { id: 'new-note' as AppPage, icon: <FilePlus className="w-5 h-5" />, label: language === 'EN' ? 'New Note' : 'Nueva Nota' },
    { id: 'all-files' as AppPage, icon: <FolderOpen className="w-5 h-5" />, label: language === 'EN' ? 'All Files' : 'Todos los Archivos' },
    { id: 'save' as AppPage, icon: <Download className="w-5 h-5" />, label: language === 'EN' ? 'Save to Computer' : 'Guardar en Computadora' },
    { id: 'recycle' as AppPage, icon: <Trash2 className="w-5 h-5" />, label: language === 'EN' ? 'Recycle Bin' : 'Papelera', badge: deletedCount },
  ];

  const categoryColors: Record<string, string> = {
    planned: '#3b82f6',
    watching: '#8b5cf6',
    purchased: '#22c55e',
    cancelled: '#ef4444',
  };

  return (
    <div className="flex min-h-screen transition-colors duration-700" style={{ background: bg }}>
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 transition-opacity duration-700" style={{ backgroundImage: 'linear-gradient(rgba(255,215,0,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,215,0,0.03) 1px,transparent 1px)', backgroundSize: '50px 50px', opacity: dark ? 1 : 0.25 }} />
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle,rgba(202,138,4,0.2),rgba(180,100,0,0.1))' }} />
      </div>

      {/* Sidebar */}
      <motion.div
        animate={{ width: sidebarCollapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="relative z-30 flex flex-col shrink-0 backdrop-blur-xl border-r"
        style={{ background: sidebarBg, borderColor, height: '100vh', position: 'sticky', top: 0 }}
      >
        {/* Collapse button */}
        <div className="flex items-center justify-between px-4 pt-5 pb-3">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 via-amber-600 to-red-900 rounded-xl flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-base" style={{ color: textPrimary }}>NoteVault</span>
            </div>
          )}
          <button onClick={() => setSidebarCollapsed(p => !p)} className="p-1.5 rounded-lg transition-colors" style={{ color: textSecondary, background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* User photo + name */}
        <div className={`flex flex-col items-center py-4 border-b ${sidebarCollapsed ? 'px-2' : 'px-4'}`} style={{ borderColor }}>
          <button onClick={() => photoInputRef.current?.click()} className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-yellow-500/50 hover:border-yellow-500 transition-all group mb-2">
            {currentUser.photo ? (
              <img src={currentUser.photo} alt="user" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#ca8a04,#92400e)' }}>
                <User className="w-7 h-7 text-white" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Edit3 className="w-4 h-4 text-white" />
            </div>
          </button>
          <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          {!sidebarCollapsed && (
            <>
              <p className="text-xs" style={{ color: textSecondary }}>{language === 'EN' ? 'Welcome Back,' : 'Bienvenido,'}</p>
              <p className="font-semibold text-sm text-center truncate w-full text-center" style={{ color: textPrimary }}>{currentUser.name}</p>
            </>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map(item => {
            const active = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setPage(item.id); if (item.id !== 'new-note') setEditingNote(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative ${sidebarCollapsed ? 'justify-center' : ''}`}
                style={{
                  background: active ? 'linear-gradient(135deg,rgba(234,179,8,0.25),rgba(153,0,0,0.15))' : 'transparent',
                  border: active ? '1px solid rgba(234,179,8,0.3)' : '1px solid transparent',
                  color: active ? '#fbbf24' : textSecondary,
                }}
              >
                <span className={active ? 'text-yellow-400' : ''}>{item.icon}</span>
                {!sidebarCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                {item.badge != null && item.badge > 0 && (
                  <span className={`${sidebarCollapsed ? 'absolute -top-1 -right-1' : 'ml-auto'} min-w-[20px] h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center px-1`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-2 pb-4 border-t pt-4" style={{ borderColor }}>
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-red-500/10 ${sidebarCollapsed ? 'justify-center' : ''}`}
            style={{ color: '#ef4444' }}
          >
            <LogOut className="w-5 h-5" />
            {!sidebarCollapsed && <span className="font-medium text-sm">{language === 'EN' ? 'Log Out' : 'Cerrar Sesión'}</span>}
          </button>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10" style={{ paddingRight: '48px' }}>
        {/* TopBar */}
        <div className="sticky top-0 z-20 backdrop-blur-xl border-b px-6 py-3 flex items-center gap-4" style={{ background: dark ? 'rgba(3,7,18,0.85)' : 'rgba(255,251,235,0.85)', borderColor }}>
          <div className="flex-1 relative flex justify-center">
            <div className="relative w-full max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: textSecondary }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                onKeyDown={e => { if (e.key === 'Enter' && searchQuery.trim()) handleSearch(searchQuery); }}
                placeholder={language === 'EN' ? 'Search notes...' : 'Buscar notas...'}
                className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm focus:outline-none transition-all"
                style={{ background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderColor, color: textPrimary }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: textSecondary }}>
                  <X className="w-4 h-4" />
                </button>
              )}
              {/* Recent searches dropdown */}
              <AnimatePresence>
                {searchFocused && recentSearches.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full left-0 right-0 mt-1 rounded-xl border shadow-xl overflow-hidden z-50"
                    style={{ background: dark ? '#0f0a05' : '#fff', borderColor }}
                  >
                    {recentSearches.map((s, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-2.5 hover:bg-yellow-500/10 cursor-pointer transition-colors" onClick={() => handleSearch(s)}>
                        <div className="flex items-center gap-2">
                          <Search className="w-3.5 h-3.5" style={{ color: textSecondary }} />
                          <span className="text-sm" style={{ color: textPrimary }}>{s}</span>
                        </div>
                        <button onClick={e => { e.stopPropagation(); setRecentSearches(prev => prev.filter((_, idx) => idx !== i)); }} style={{ color: textSecondary }}>
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <div className="border-t px-4 py-2" style={{ borderColor }}>
                      <button onClick={() => setRecentSearches([])} className="text-xs" style={{ color: '#ca8a04' }}>
                        {language === 'EN' ? 'Clear all recent' : 'Limpiar recientes'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {page === 'dashboard' && (
              <DashboardView key="dashboard" notes={notes} setNotes={setNotes} lampOn={lampOn} language={language}
                filteredNotes={filteredNotes} categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
                onEditNote={(note) => { setEditingNote(note); setPage('new-note'); }}
                textPrimary={textPrimary} textSecondary={textSecondary} borderColor={borderColor} cardBg={cardBg} dark={dark} categoryColors={categoryColors} />
            )}
            {page === 'new-note' && (
              <NewNoteView key="new-note" lampOn={lampOn} language={language} editingNote={editingNote}
                onSave={(note) => {
                  if (editingNote) {
                    setNotes(prev => prev.map(n => n.id === editingNote.id ? note : n));
                  } else {
                    setNotes(prev => [note, ...prev]);
                  }
                  setEditingNote(null);
                  setPage('dashboard');
                }}
                textPrimary={textPrimary} textSecondary={textSecondary} borderColor={borderColor} cardBg={cardBg} dark={dark} />
            )}
            {page === 'all-files' && (
              <AllFilesView key="all-files" notes={notes} setNotes={setNotes} lampOn={lampOn} language={language}
                onEditNote={(note) => { setEditingNote(note); setPage('new-note'); }}
                textPrimary={textPrimary} textSecondary={textSecondary} borderColor={borderColor} cardBg={cardBg} dark={dark} categoryColors={categoryColors} />
            )}
            {page === 'save' && (
              <SaveView key="save" notes={notes} lampOn={lampOn} language={language}
                textPrimary={textPrimary} textSecondary={textSecondary} borderColor={borderColor} cardBg={cardBg} dark={dark} categoryColors={categoryColors} />
            )}
            {page === 'recycle' && (
              <RecycleView key="recycle" notes={notes} setNotes={setNotes} lampOn={lampOn} language={language}
                textPrimary={textPrimary} textSecondary={textSecondary} borderColor={borderColor} cardBg={cardBg} dark={dark} />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right lamp cord */}
      <LampCordRight lampOn={lampOn} onToggle={onToggleLamp} />
    </div>
  );
}

// ─── Dashboard View ───────────────────────────────────────────────────────────
function DashboardView({ notes, setNotes, lampOn, language, filteredNotes, categoryFilter, setCategoryFilter, onEditNote, textPrimary, textSecondary, borderColor, cardBg, dark, categoryColors }: {
  notes: Note[]; setNotes: React.Dispatch<React.SetStateAction<Note[]>>; lampOn: boolean; language: string;
  filteredNotes: Note[]; categoryFilter: string; setCategoryFilter: (c: string) => void;
  onEditNote: (note: Note) => void;
  textPrimary: string; textSecondary: string; borderColor: string; cardBg: string; dark: boolean;
  categoryColors: Record<string, string>;
}) {
  const total = notes.filter(n => !n.deleted && !n.archived).length;
  const highPriority = notes.filter(n => !n.deleted && n.highPriority).length;
  const archived = notes.filter(n => n.archived && !n.deleted).length;
  const deleted = notes.filter(n => n.deleted).length;

  const stats = [
    { label: language === 'EN' ? 'Total Notes' : 'Total Notas', value: total, icon: <FileText className="w-5 h-5" />, color: '#3b82f6' },
    { label: language === 'EN' ? 'High Priority' : 'Alta Prioridad', value: highPriority, icon: <Star className="w-5 h-5" />, color: '#f59e0b' },
    { label: language === 'EN' ? 'Archived' : 'Archivadas', value: archived, icon: <FolderOpen className="w-5 h-5" />, color: '#8b5cf6' },
    { label: language === 'EN' ? 'In Recycle Bin' : 'En Papelera', value: deleted, icon: <Trash2 className="w-5 h-5" />, color: '#ef4444' },
  ];

  const categories = ['all', 'planned', 'watching', 'purchased', 'cancelled'];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
            className="rounded-2xl p-4 border" style={{ background: cardBg, borderColor, backdropFilter: 'blur(12px)' }}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ color: s.color }}>{s.icon}</span>
              <span className="text-2xl font-bold" style={{ color: textPrimary }}>{s.value}</span>
            </div>
            <p className="text-sm" style={{ color: textSecondary }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all border"
            style={{
              background: categoryFilter === cat ? 'linear-gradient(135deg,rgba(234,179,8,0.3),rgba(153,0,0,0.2))' : 'transparent',
              borderColor: categoryFilter === cat ? 'rgba(234,179,8,0.5)' : borderColor,
              color: categoryFilter === cat ? '#fbbf24' : textSecondary,
            }}
          >
            {cat === 'all' ? (language === 'EN' ? 'All' : 'Todos') : `#${cat}`}
          </button>
        ))}
      </div>

      {/* Notes grid */}
      {filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <FileText className="w-16 h-16 opacity-20" style={{ color: textSecondary }} />
          <p className="text-lg font-medium" style={{ color: textSecondary }}>{language === 'EN' ? 'No notes here yet' : 'No hay notas aquí aún'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note, i) => (
            <motion.div key={note.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-2xl p-4 border cursor-pointer hover:scale-[1.02] transition-all" style={{ background: cardBg, borderColor, backdropFilter: 'blur(12px)' }}
              onClick={() => onEditNote(note)}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold truncate flex-1" style={{ color: textPrimary }}>{note.title || (language === 'EN' ? 'Untitled' : 'Sin título')}</h3>
                {note.highPriority && <Star className="w-4 h-4 text-yellow-400 shrink-0 ml-2 fill-yellow-400" />}
              </div>
              <p className="text-sm line-clamp-2 mb-3" style={{ color: textSecondary }}>
                {note.content.replace(/<[^>]*>/g, '').slice(0, 100) || '...'}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${categoryColors[note.category]}20`, color: categoryColors[note.category] }}>
                  #{note.category}
                </span>
                <span className="text-xs" style={{ color: textSecondary }}>{new Date(note.date).toLocaleDateString()}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── New Note View ────────────────────────────────────────────────────────────
function NewNoteView({ lampOn, language, editingNote, onSave, textPrimary, textSecondary, borderColor, cardBg, dark }: {
  lampOn: boolean; language: string; editingNote: Note | null;
  onSave: (note: Note) => void;
  textPrimary: string; textSecondary: string; borderColor: string; cardBg: string; dark: boolean;
}) {
  const [title, setTitle] = useState(editingNote?.title ?? '');
  const [content, setContent] = useState(editingNote?.content ?? '');
  const [date, setDate] = useState(() => {
    if (editingNote) return editingNote.date.slice(0, 16);
    return new Date().toISOString().slice(0, 16);
  });
  const [category, setCategory] = useState<Note['category']>(editingNote?.category ?? 'planned');
  const [highPriority, setHighPriority] = useState(editingNote?.highPriority ?? false);
  const [files, setFiles] = useState<Note['files']>(editingNote?.files ?? []);
  const [showTablePicker, setShowTablePicker] = useState(false);
  const [tableHover, setTableHover] = useState<[number, number]>([0, 0]);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const execCmd = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
  };

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;
    Array.from(fileList).forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        setFiles(prev => [...prev, { name: file.name, size: file.size, type: file.type, dataUrl: ev.target?.result as string }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const insertTable = (rows: number, cols: number) => {
    let html = '<table style="border-collapse:collapse;width:100%">';
    for (let r = 0; r < rows; r++) {
      html += '<tr>';
      for (let c = 0; c < cols; c++) {
        html += '<td style="border:1px solid #ca8a04;padding:6px;min-width:60px">&nbsp;</td>';
      }
      html += '</tr>';
    }
    html += '</table>';
    document.execCommand('insertHTML', false, html);
    setShowTablePicker(false);
    editorRef.current?.focus();
  };

  const handleSave = () => {
    const note: Note = {
      id: editingNote?.id ?? `note-${Date.now()}`,
      title: title.trim() || (language === 'EN' ? 'Untitled' : 'Sin título'),
      content: editorRef.current?.innerHTML ?? content,
      date: new Date(date).toISOString(),
      category,
      files,
      deleted: false,
      highPriority,
      archived: editingNote?.archived ?? false,
    };
    onSave(note);
  };

  const toolbarBtnStyle = (active?: boolean) => ({
    padding: '6px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    background: active ? 'rgba(234,179,8,0.2)' : 'transparent',
    color: textPrimary,
    transition: 'background 0.2s',
  } as React.CSSProperties);

  const categoryColors: Record<string, string> = { planned: '#3b82f6', watching: '#8b5cf6', purchased: '#22c55e', cancelled: '#ef4444' };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="max-w-3xl mx-auto space-y-5">
      <h2 className="text-2xl font-bold" style={{ color: textPrimary }}>
        {editingNote ? (language === 'EN' ? 'Edit Note' : 'Editar Nota') : (language === 'EN' ? 'New Note' : 'Nueva Nota')}
      </h2>

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder={language === 'EN' ? 'Note title...' : 'Título de la nota...'}
        className="w-full text-2xl font-semibold bg-transparent border-b-2 pb-2 focus:outline-none transition-colors"
        style={{ borderColor, color: textPrimary }}
      />

      {/* Rich text editor */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: cardBg, borderColor }}>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b" style={{ borderColor }}>
          <button style={toolbarBtnStyle()} onClick={() => execCmd('bold')} title="Bold"><Bold className="w-4 h-4" /></button>
          <button style={toolbarBtnStyle()} onClick={() => execCmd('italic')} title="Italic"><Italic className="w-4 h-4" /></button>
          <button style={toolbarBtnStyle()} onClick={() => execCmd('underline')} title="Underline"><Underline className="w-4 h-4" /></button>
          <button style={toolbarBtnStyle()} onClick={() => execCmd('strikeThrough')} title="Strike"><Strikethrough className="w-4 h-4" /></button>
          <div className="w-px h-5 mx-1" style={{ background: borderColor }} />
          <select onChange={e => execCmd('fontSize', e.target.value)} className="text-xs rounded px-1 py-0.5 border focus:outline-none"
            style={{ background: dark ? '#0f0a05' : '#fff', borderColor, color: textPrimary }}>
            <option value="2">Small</option>
            <option value="3" selected>Normal</option>
            <option value="5">Large</option>
            <option value="7">Huge</option>
          </select>
          <div className="w-px h-5 mx-1" style={{ background: borderColor }} />
          <button style={toolbarBtnStyle()} onClick={() => execCmd('justifyLeft')}><AlignLeft className="w-4 h-4" /></button>
          <button style={toolbarBtnStyle()} onClick={() => execCmd('justifyCenter')}><AlignCenter className="w-4 h-4" /></button>
          <button style={toolbarBtnStyle()} onClick={() => execCmd('justifyRight')}><AlignRight className="w-4 h-4" /></button>
          <div className="w-px h-5 mx-1" style={{ background: borderColor }} />
          <button style={toolbarBtnStyle()} onClick={() => execCmd('insertUnorderedList')}><List className="w-4 h-4" /></button>
          <button style={toolbarBtnStyle()} onClick={() => execCmd('insertOrderedList')}><ListOrdered className="w-4 h-4" /></button>
          <div className="w-px h-5 mx-1" style={{ background: borderColor }} />
          <div className="relative">
            <button style={toolbarBtnStyle()} onClick={() => setShowTablePicker(p => !p)}><Table className="w-4 h-4" /></button>
            {showTablePicker && (
              <div className="absolute top-full left-0 mt-1 p-2 rounded-xl border shadow-xl z-50" style={{ background: dark ? '#0f0a05' : '#fff', borderColor }}>
                <p className="text-xs mb-2" style={{ color: textSecondary }}>
                  {tableHover[0] > 0 ? `${tableHover[0]} × ${tableHover[1]}` : (language === 'EN' ? 'Select size' : 'Seleccionar tamaño')}
                </p>
                <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
                  {Array.from({ length: 36 }, (_, idx) => {
                    const r = Math.floor(idx / 6) + 1;
                    const c = (idx % 6) + 1;
                    return (
                      <div key={idx} className="w-5 h-5 rounded-sm cursor-pointer border transition-colors"
                        style={{ background: r <= tableHover[0] && c <= tableHover[1] ? 'rgba(234,179,8,0.4)' : 'transparent', borderColor }}
                        onMouseEnter={() => setTableHover([r, c])}
                        onClick={() => insertTable(r, c)} />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <button style={toolbarBtnStyle()} onClick={() => execCmd('insertHorizontalRule')}><Minus className="w-4 h-4" /></button>
          <div className="w-px h-5 mx-1" style={{ background: borderColor }} />
          <button style={toolbarBtnStyle()} onClick={() => execCmd('undo')}>↩</button>
          <button style={toolbarBtnStyle()} onClick={() => execCmd('redo')}>↪</button>
        </div>
        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={() => {}}
          dangerouslySetInnerHTML={{ __html: content }}
          className="p-4 focus:outline-none"
          style={{ minHeight: '280px', color: textPrimary, caretColor: '#fbbf24' }}
        />
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: textSecondary }}>
          {language === 'EN' ? 'Date & Time' : 'Fecha y Hora'}
        </label>
        <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)}
          className="border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all"
          style={{ background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderColor, color: textPrimary }} />
      </div>

      {/* File attachment */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <label className="text-sm font-medium" style={{ color: textSecondary }}>{language === 'EN' ? 'Attachments' : 'Archivos adjuntos'}</label>
          <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-all hover:border-yellow-500"
            style={{ borderColor, color: textSecondary }}>
            <Paperclip className="w-4 h-4" />
            {language === 'EN' ? 'Attach file' : 'Adjuntar archivo'}
          </button>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileAdd} multiple />
        </div>
        {files.length > 0 && (
          <div className="space-y-1">
            {files.map((f, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg border text-sm" style={{ borderColor, background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}>
                <span style={{ color: textPrimary }}>{f.name}</span>
                <div className="flex items-center gap-3">
                  <span style={{ color: textSecondary }}>{(f.size / 1024).toFixed(1)} KB</span>
                  <button onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} style={{ color: '#ef4444' }}><X className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: textSecondary }}>{language === 'EN' ? 'Category' : 'Categoría'}</label>
        <div className="flex gap-2 flex-wrap">
          {(['planned', 'watching', 'purchased', 'cancelled'] as Note['category'][]).map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className="px-4 py-1.5 rounded-full text-sm font-medium border transition-all"
              style={{ borderColor: category === cat ? categoryColors[cat] : borderColor, color: category === cat ? categoryColors[cat] : textSecondary, background: category === cat ? `${categoryColors[cat]}15` : 'transparent' }}>
              #{cat}
            </button>
          ))}
        </div>
      </div>

      {/* High priority */}
      <div className="flex items-center gap-3">
        <button onClick={() => setHighPriority(p => !p)} className="flex items-center gap-2 px-4 py-2 rounded-xl border transition-all"
          style={{ borderColor: highPriority ? '#f59e0b' : borderColor, background: highPriority ? 'rgba(245,158,11,0.1)' : 'transparent', color: highPriority ? '#f59e0b' : textSecondary }}>
          <Star className={`w-5 h-5 ${highPriority ? 'fill-yellow-400' : ''}`} />
          {language === 'EN' ? 'High Priority' : 'Alta Prioridad'}
        </button>
      </div>

      {/* Save button */}
      <motion.button whileHover={{ scale: 1.01, boxShadow: '0 20px 40px rgba(234,179,8,0.3)' }} whileTap={{ scale: 0.99 }}
        onClick={handleSave}
        className="relative w-full overflow-hidden rounded-xl py-4 bg-gradient-to-r from-yellow-500 via-amber-600 to-red-900 text-white font-semibold shadow-lg shadow-yellow-500/30 flex items-center justify-center gap-2">
        <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <span className="relative z-10">{language === 'EN' ? 'Save Note' : 'Guardar Nota'}</span>
      </motion.button>
    </motion.div>
  );
}

// ─── All Files View ───────────────────────────────────────────────────────────
function AllFilesView({ notes, setNotes, lampOn, language, onEditNote, textPrimary, textSecondary, borderColor, cardBg, dark, categoryColors }: {
  notes: Note[]; setNotes: React.Dispatch<React.SetStateAction<Note[]>>; lampOn: boolean; language: string;
  onEditNote: (note: Note) => void;
  textPrimary: string; textSecondary: string; borderColor: string; cardBg: string; dark: boolean;
  categoryColors: Record<string, string>;
}) {
  const visibleNotes = notes.filter(n => !n.deleted).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const deleteNote = (id: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, deleted: true, deletedAt: new Date().toISOString() } : n));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
      <h2 className="text-2xl font-bold" style={{ color: textPrimary }}>{language === 'EN' ? 'All Files' : 'Todos los Archivos'}</h2>
      {visibleNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <FolderOpen className="w-16 h-16 opacity-20" style={{ color: textSecondary }} />
          <p className="text-lg font-medium" style={{ color: textSecondary }}>{language === 'EN' ? 'No files yet' : 'Sin archivos aún'}</p>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ background: cardBg, borderColor }}>
          {visibleNotes.map((note, i) => (
            <div key={note.id} className={`flex items-center gap-4 px-5 py-3.5 ${i !== 0 ? 'border-t' : ''} hover:bg-yellow-500/5 transition-colors`} style={{ borderColor }}>
              <FileText className="w-4 h-4 shrink-0" style={{ color: textSecondary }} />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate" style={{ color: textPrimary }}>{note.title}</p>
                <p className="text-xs" style={{ color: textSecondary }}>{new Date(note.date).toLocaleString()}</p>
              </div>
              {note.highPriority && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 shrink-0" />}
              <span className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0" style={{ background: `${categoryColors[note.category]}20`, color: categoryColors[note.category] }}>
                #{note.category}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => onEditNote(note)} className="p-1.5 rounded-lg transition-colors hover:bg-yellow-500/10" style={{ color: textSecondary }}>
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => deleteNote(note.id)} className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10" style={{ color: '#ef4444' }}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Save to Computer View ────────────────────────────────────────────────────
function SaveView({ notes, lampOn, language, textPrimary, textSecondary, borderColor, cardBg, dark, categoryColors }: {
  notes: Note[]; lampOn: boolean; language: string;
  textPrimary: string; textSecondary: string; borderColor: string; cardBg: string; dark: boolean;
  categoryColors: Record<string, string>;
}) {
  const visibleNotes = notes.filter(n => !n.deleted);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleAll = () => {
    if (selected.size === visibleNotes.length) setSelected(new Set());
    else setSelected(new Set(visibleNotes.map(n => n.id)));
  };

  const toggleNote = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDownload = () => {
    const selectedNotes = visibleNotes.filter(n => selected.has(n.id));
    const blob = new Blob([JSON.stringify(selectedNotes, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notevault-export-${new Date().toISOString().slice(0, 10)}.notevault`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: textPrimary }}>{language === 'EN' ? 'Save to Computer' : 'Guardar en Computadora'}</h2>
        <div className="flex items-center gap-3">
          <button onClick={toggleAll} className="text-sm px-3 py-1.5 rounded-lg border transition-all" style={{ borderColor, color: textSecondary }}>
            {selected.size === visibleNotes.length ? (language === 'EN' ? 'Deselect All' : 'Deseleccionar') : (language === 'EN' ? 'Select All' : 'Seleccionar Todo')}
          </button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleDownload} disabled={selected.size === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-40 bg-gradient-to-r from-yellow-500 to-amber-600">
            <Download className="w-4 h-4" />
            {language === 'EN' ? `Download (${selected.size})` : `Descargar (${selected.size})`}
          </motion.button>
        </div>
      </div>

      {visibleNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Download className="w-16 h-16 opacity-20" style={{ color: textSecondary }} />
          <p className="text-lg font-medium" style={{ color: textSecondary }}>{language === 'EN' ? 'No notes to export' : 'Sin notas para exportar'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleNotes.map(note => (
            <div key={note.id} onClick={() => toggleNote(note.id)} className="rounded-2xl p-4 border cursor-pointer transition-all" style={{ background: cardBg, borderColor: selected.has(note.id) ? '#fbbf24' : borderColor, outline: selected.has(note.id) ? '2px solid rgba(251,191,36,0.4)' : 'none' }}>
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all ${selected.has(note.id) ? 'bg-yellow-500 border-yellow-500' : ''}`} style={{ borderColor: selected.has(note.id) ? '#fbbf24' : borderColor }}>
                  {selected.has(note.id) && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" style={{ color: textPrimary }}>{note.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: textSecondary }}>{new Date(note.date).toLocaleDateString()}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block" style={{ background: `${categoryColors[note.category]}20`, color: categoryColors[note.category] }}>
                    #{note.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Recycle Bin View ─────────────────────────────────────────────────────────
function RecycleView({ notes, setNotes, lampOn, language, textPrimary, textSecondary, borderColor, cardBg, dark }: {
  notes: Note[]; setNotes: React.Dispatch<React.SetStateAction<Note[]>>; lampOn: boolean; language: string;
  textPrimary: string; textSecondary: string; borderColor: string; cardBg: string; dark: boolean;
}) {
  const deletedNotes = notes.filter(n => n.deleted);

  const restore = (id: string) => setNotes(prev => prev.map(n => n.id === id ? { ...n, deleted: false, deletedAt: undefined } : n));
  const deleteForever = (id: string) => setNotes(prev => prev.filter(n => n.id !== id));
  const emptyBin = () => setNotes(prev => prev.filter(n => !n.deleted));

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: textPrimary }}>{language === 'EN' ? 'Recycle Bin' : 'Papelera'}</h2>
        {deletedNotes.length > 0 && (
          <button onClick={emptyBin} className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all hover:bg-red-500/10" style={{ borderColor: '#ef4444', color: '#ef4444' }}>
            <Trash2 className="w-4 h-4" />
            {language === 'EN' ? 'Empty Recycle Bin' : 'Vaciar Papelera'}
          </button>
        )}
      </div>

      {deletedNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Trash2 className="w-16 h-16 opacity-20" style={{ color: textSecondary }} />
          <p className="text-lg font-medium" style={{ color: textSecondary }}>{language === 'EN' ? 'Recycle bin is empty' : 'La papelera está vacía'}</p>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ background: cardBg, borderColor }}>
          {deletedNotes.map((note, i) => (
            <div key={note.id} className={`flex items-center gap-4 px-5 py-3.5 ${i !== 0 ? 'border-t' : ''} hover:bg-red-500/5 transition-colors`} style={{ borderColor }}>
              <FileText className="w-4 h-4 shrink-0" style={{ color: textSecondary }} />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate" style={{ color: textPrimary }}>{note.title}</p>
                <p className="text-xs" style={{ color: textSecondary }}>
                  {language === 'EN' ? 'Deleted' : 'Eliminado'}: {note.deletedAt ? new Date(note.deletedAt).toLocaleString() : '—'}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => restore(note.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-all hover:border-green-500 hover:text-green-500" style={{ borderColor, color: textSecondary }}>
                  <RotateCcw className="w-4 h-4" />
                  {language === 'EN' ? 'Restore' : 'Restaurar'}
                </button>
                <button onClick={() => deleteForever(note.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-all hover:bg-red-500/10" style={{ borderColor: '#ef4444', color: '#ef4444' }}>
                  <X className="w-4 h-4" />
                  {language === 'EN' ? 'Delete Forever' : 'Eliminar Para Siempre'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────
function LoginPage({
  lampOn, setLampOn, language, setLanguage, onLogin,
  showGoogle, setShowGoogle, showGitHub, setShowGitHub,
  showSignUp, setShowSignUp, showPrivacy, setShowPrivacy,
  showTerms, setShowTerms, showSupport, setShowSupport,
  showContact, setShowContact,
}: {
  lampOn: boolean; setLampOn: (v: boolean) => void;
  language: string; setLanguage: (v: string) => void;
  onLogin: (user: CurrentUser) => void;
  showGoogle: boolean; setShowGoogle: (v: boolean) => void;
  showGitHub: boolean; setShowGitHub: (v: boolean) => void;
  showSignUp: boolean; setShowSignUp: (v: boolean) => void;
  showPrivacy: boolean; setShowPrivacy: (v: boolean) => void;
  showTerms: boolean; setShowTerms: (v: boolean) => void;
  showSupport: boolean; setShowSupport: (v: boolean) => void;
  showContact: boolean; setShowContact: (v: boolean) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const dragStartY = useRef(0);

  const darkMode = !lampOn;
  const MAX_PULL = 130;
  const TRIGGER_THRESHOLD = 65;
  const CORD_BASE = 80;
  const emailType = detectEmailType(email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const namePart = email.split('@')[0];
      onLogin({ name: namePart || 'User', email, photo: null });
    }, 1800);
  };

  const onKnobPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragStartY.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onKnobPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const delta = Math.max(0, Math.min(MAX_PULL, e.clientY - dragStartY.current));
    setPullDistance(delta);
  };
  const onKnobPointerUp = () => {
    if (!isDragging) return;
    if (pullDistance >= TRIGGER_THRESHOLD) setLampOn(!lampOn);
    setPullDistance(0);
    setIsDragging(false);
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden transition-colors duration-700" style={{ background: darkMode ? '#030712' : '#fffbeb' }}>
      {/* Global light radiance */}
      <motion.div className="fixed inset-0 pointer-events-none z-[1]" animate={{ opacity: lampOn ? 1 : 0 }} transition={{ duration: 0.9 }}
        style={{ background: 'radial-gradient(ellipse 75% 100% at 26% 32%, rgba(255,210,70,0.45) 0%, rgba(255,170,30,0.22) 38%, transparent 68%)' }} />

      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 transition-opacity duration-700"
          style={{ backgroundImage: 'linear-gradient(rgba(255,215,0,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,215,0,0.03) 1px,transparent 1px)', backgroundSize: '50px 50px', opacity: darkMode ? 1 : 0.25 }} />
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.45, 0.25] }} transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle,rgba(202,138,4,0.35),rgba(180,100,0,0.25))' }} />
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.18, 0.32, 0.18] }} transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle,rgba(127,0,0,0.35),rgba(100,0,0,0.2))' }} />
        {[...Array(14)].map((_, i) => (
          <motion.div key={i} animate={{ y: [0, -70, 0], opacity: [0, 0.55, 0] }}
            transition={{ duration: 3 + i * 0.22, repeat: Infinity, delay: i * 0.38 }}
            className="absolute w-1 h-1 rounded-full"
            style={{ left: `${6 + i * 6.8}%`, top: `${18 + (i % 5) * 14}%`, background: 'rgba(234,179,8,0.5)' }} />
        ))}
      </div>

      {/* HEADER */}
      <motion.header initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}
        className="relative z-20 backdrop-blur-xl border-b transition-colors duration-700"
        style={{ background: darkMode ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.7)', borderColor: darkMode ? 'rgba(120,53,15,0.22)' : 'rgba(251,191,36,0.35)' }}>
        <div className="container mx-auto px-8 py-4 flex items-center justify-between">
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3">
            <div className="relative">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-2xl blur-lg opacity-50" />
              <div className="relative w-12 h-12 bg-gradient-to-br from-yellow-500 via-amber-600 to-red-900 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-semibold transition-colors duration-700" style={{ color: darkMode ? '#fff' : '#111' }}>NoteVault</h1>
              <p className="text-xs text-yellow-600">Premium Access</p>
            </div>
          </motion.div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setLanguage(language === 'EN' ? 'ES' : 'EN')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border backdrop-blur-sm transition-all"
            style={{ background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderColor: darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)', color: darkMode ? '#fff' : '#111' }}>
            <Globe className="w-5 h-5 text-yellow-500" />
            <span>{language}</span>
          </motion.button>
        </div>
      </motion.header>

      {/* MAIN SPLIT */}
      <main className="relative z-10 flex-1 flex">
        {/* LEFT — Lamp */}
        <div className="w-1/2 flex flex-col items-center justify-center relative overflow-hidden">
          <motion.div className="absolute pointer-events-none"
            style={{ top: '5%', left: '50%', transform: 'translateX(-50%)', width: '420px', height: '72%', clipPath: 'polygon(37% 0%,63% 0%,100% 100%,0% 100%)', background: 'linear-gradient(180deg,rgba(255,230,90,0.6) 0%,rgba(255,200,55,0.22) 55%,transparent 100%)', filter: 'blur(8px)' }}
            animate={{ opacity: lampOn ? 1 : 0 }} transition={{ duration: 0.75 }} />
          <motion.div className="absolute bottom-4 pointer-events-none"
            style={{ width: '260px', height: '48px', background: 'radial-gradient(ellipse,rgba(255,220,70,0.55) 0%,transparent 70%)', filter: 'blur(12px)' }}
            animate={{ opacity: lampOn ? 1 : 0 }} transition={{ duration: 0.75, delay: 0.1 }} />

          <div className="flex flex-col items-center" style={{ marginTop: '-8%' }}>
            <div className="transition-colors duration-700" style={{ width: '2px', height: '96px', background: darkMode ? '#4b5563' : '#9ca3af' }} />
            <div className="relative flex flex-col items-center">
              <motion.div className="absolute pointer-events-none"
                style={{ width: '200px', height: '200px', top: '-40px', left: '50%', transform: 'translateX(-50%)', background: 'radial-gradient(circle,rgba(255,220,80,0.65) 0%,transparent 68%)', filter: 'blur(22px)' }}
                animate={{ opacity: lampOn ? 1 : 0 }} transition={{ duration: 0.55 }} />
              <div className="rounded" style={{ width: '60px', height: '11px', background: darkMode ? 'linear-gradient(90deg,#1c0f04,#3d1a08,#1c0f04)' : 'linear-gradient(90deg,#7c4a1e,#b06828,#7c4a1e)', transition: 'background 0.7s' }} />
              <div style={{ width: '148px', height: '94px', clipPath: 'polygon(11% 0%,89% 0%,100% 100%,0% 100%)', position: 'relative', overflow: 'hidden', background: darkMode ? 'linear-gradient(180deg,#180902 0%,#321408 60%,#1e0b02 100%)' : 'linear-gradient(180deg,#9a5520 0%,#c07030 60%,#8c4a18 100%)', transition: 'background 0.7s' }}>
                <motion.div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(255,248,160,0.95) 0%,rgba(255,200,55,0.65) 55%,rgba(255,150,20,0.18) 100%)' }} animate={{ opacity: lampOn ? 1 : 0 }} transition={{ duration: 0.5 }} />
                {[...Array(6)].map((_, i) => <div key={i} style={{ position: 'absolute', top: 0, bottom: 0, left: `${i * 18}%`, width: '1px', background: 'rgba(0,0,0,0.12)' }} />)}
              </div>
              <motion.div style={{ width: '26px', height: '26px', borderRadius: '50%', marginTop: '-5px' }}
                animate={{ background: lampOn ? 'radial-gradient(circle at 33% 28%,#fffde4,#ffd600 48%,#ff8c00)' : 'radial-gradient(circle at 33% 28%,#555,#2a2a2a)', boxShadow: lampOn ? '0 0 28px 12px rgba(255,220,40,0.95),0 0 60px 24px rgba(255,180,20,0.5)' : '0 2px 5px rgba(0,0,0,0.5)' }}
                transition={{ duration: 0.5 }} />
            </div>

            <div style={{ width: '2px', height: `${CORD_BASE}px`, background: darkMode ? '#6b7280' : '#9ca3af', transition: 'background 0.7s' }} />

            <div
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateY(${pullDistance}px)`, transition: isDragging ? 'none' : 'transform 0.52s cubic-bezier(0.34,1.56,0.64,1)', cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none' }}
              onPointerDown={onKnobPointerDown}
              onPointerMove={onKnobPointerMove}
              onPointerUp={onKnobPointerUp}
              onPointerCancel={onKnobPointerUp}
            >
              <div style={{ width: '2px', height: `${44 + pullDistance * 0.45}px`, background: darkMode ? '#6b7280' : '#9ca3af', transition: isDragging ? 'none' : 'height 0.52s cubic-bezier(0.34,1.56,0.64,1),background 0.7s' }} />
              <motion.div whileHover={{ scale: 1.18 }}
                style={{ width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${lampOn ? '#ffd700' : '#4b5563'}`, background: lampOn ? 'radial-gradient(circle at 32% 28%,#fffde0,#ffd700 48%,#b8860b)' : 'radial-gradient(circle at 32% 28%,#888,#444)', boxShadow: lampOn ? '0 0 18px 7px rgba(255,215,0,0.65),inset 0 1px 3px rgba(255,255,200,0.5)' : '0 4px 12px rgba(0,0,0,0.65),inset 0 1px 2px rgba(255,255,255,0.08)', transition: 'background 0.5s,border-color 0.5s,box-shadow 0.5s' }}>
                <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: lampOn ? 'rgba(255,255,220,0.92)' : 'rgba(255,255,255,0.18)', transition: 'background 0.5s' }} />
              </motion.div>
              {isDragging && pullDistance >= TRIGGER_THRESHOLD && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: 'rgba(255,215,0,0.18)', border: '1px solid rgba(255,215,0,0.5)', color: '#ffd700', whiteSpace: 'nowrap' }}>
                  {lampOn ? (language === 'EN' ? 'Release to turn off' : 'Suelta para apagar') : (language === 'EN' ? 'Release to turn on!' : '¡Suelta para encender!')}
                </motion.div>
              )}
            </div>
          </div>

          <motion.p className="absolute bottom-10 text-sm" style={{ color: darkMode ? '#374151' : '#9ca3af', transition: 'color 0.7s' }} animate={{ opacity: [0.55, 1, 0.55] }} transition={{ duration: 2.8, repeat: Infinity }}>
            {lampOn ? (language === 'EN' ? '↑ Pull to turn off' : '↑ Jala para apagar') : (language === 'EN' ? '↓ Pull to turn on' : '↓ Jala para encender')}
          </motion.p>
        </div>

        {/* RIGHT — Login */}
        <div className="w-1/2 relative flex items-center justify-center p-8">
          <motion.div className="absolute inset-0 pointer-events-none z-30" animate={{ opacity: darkMode ? 1 : 0 }} transition={{ duration: 0.85 }} style={{ background: 'rgba(0,0,0,0.82)' }} />
          <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="w-full max-w-md relative z-10" style={{ perspective: '1000px' }}>
            <motion.div whileHover={{ rotateY: 1.5, rotateX: 1 }} transition={{ duration: 0.3 }} className="relative" style={{ transformStyle: 'preserve-3d' }}>
              <div className="absolute inset-0 rounded-3xl blur-2xl transition-opacity duration-700" style={{ background: 'linear-gradient(135deg,rgba(255,215,0,0.28),rgba(153,0,0,0.18),rgba(255,150,20,0.28))', opacity: lampOn ? 1 : 0.28 }} />
              <div className="relative backdrop-blur-2xl rounded-3xl p-10 shadow-2xl border-2 transition-colors duration-700"
                style={{ background: lampOn ? 'linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,251,235,0.88))' : 'linear-gradient(135deg,rgba(0,0,0,0.82),rgba(60,0,0,0.3))', borderColor: lampOn ? 'rgba(251,191,36,0.45)' : 'rgba(120,53,15,0.32)' }}>
                <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-yellow-500/30 rounded-tl-3xl" />
                <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-yellow-500/30 rounded-br-3xl" />

                <div className="text-center mb-8">
                  <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500 via-amber-600 to-red-900 mb-6 shadow-2xl shadow-yellow-500/50 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl blur-md opacity-50 animate-pulse" />
                    <BookOpen className="relative w-10 h-10 text-white" />
                  </motion.div>
                  <h2 className="text-4xl mb-2 bg-gradient-to-r from-yellow-500 via-amber-600 to-yellow-500 bg-clip-text text-transparent">
                    {language === 'EN' ? 'Welcome Back' : 'Bienvenido'}
                  </h2>
                  <p className="transition-colors duration-700" style={{ color: lampOn ? '#6b7280' : '#9ca3af' }}>
                    {language === 'EN' ? 'Access your premium account' : 'Accede a tu cuenta premium'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                    <label className="block mb-2 transition-colors duration-700" style={{ color: lampOn ? '#374151' : '#d1d5db' }}>
                      {language === 'EN' ? 'Email Address' : 'Correo Electrónico'}
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity blur-sm" />
                      <div className="relative flex items-center">
                        <Mail className="absolute left-4 w-5 h-5 text-yellow-600" />
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                          className="w-full border-2 rounded-xl px-12 py-3.5 placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-all backdrop-blur-sm"
                          style={{ background: lampOn ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.42)', borderColor: lampOn ? 'rgba(251,191,36,0.45)' : 'rgba(120,53,15,0.32)', color: lampOn ? '#111' : '#fff' }}
                          placeholder={language === 'EN' ? 'your@email.com' : 'tu@email.com'} required />
                      </div>
                    </div>
                    {emailType && (
                      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg"
                        style={{ background: emailType === 'professional' ? 'rgba(59,130,246,0.08)' : 'rgba(234,179,8,0.08)', border: `1px solid ${emailType === 'professional' ? 'rgba(59,130,246,0.22)' : 'rgba(234,179,8,0.28)'}` }}>
                        {emailType === 'professional' ? <Briefcase className="w-4 h-4 text-blue-500" /> : <Home className="w-4 h-4 text-yellow-500" />}
                        <span className="text-xs font-medium" style={{ color: emailType === 'professional' ? '#3b82f6' : '#ca8a04' }}>
                          {emailType === 'professional' ? (language === 'EN' ? 'Professional email detected' : 'Correo profesional detectado') : (language === 'EN' ? 'Personal email detected' : 'Correo personal detectado')}
                        </span>
                      </motion.div>
                    )}
                  </motion.div>

                  <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                    <label className="block mb-2 transition-colors duration-700" style={{ color: lampOn ? '#374151' : '#d1d5db' }}>
                      {language === 'EN' ? 'Password' : 'Contraseña'}
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity blur-sm" />
                      <div className="relative flex items-center">
                        <Lock className="absolute left-4 w-5 h-5 text-yellow-600" />
                        <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                          className="w-full border-2 rounded-xl px-12 py-3.5 placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-all backdrop-blur-sm"
                          style={{ background: lampOn ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.42)', borderColor: lampOn ? 'rgba(251,191,36,0.45)' : 'rgba(120,53,15,0.32)', color: lampOn ? '#111' : '#fff' }}
                          placeholder="••••••••" required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 transition-colors" style={{ color: lampOn ? '#6b7280' : '#9ca3af' }}>
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer transition-colors duration-700" style={{ color: lampOn ? '#374151' : '#d1d5db' }}>
                      <input type="checkbox" className="w-4 h-4 rounded border-yellow-600 text-yellow-600 focus:ring-yellow-500/50" />
                      <span className="ml-2">{language === 'EN' ? 'Remember me' : 'Recordarme'}</span>
                    </label>
                    <a href="#" className="text-yellow-600 hover:text-yellow-500 transition-colors">
                      {language === 'EN' ? 'Forgot Password?' : '¿Olvidaste tu contraseña?'}
                    </a>
                  </motion.div>

                  <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                    whileHover={{ scale: 1.02, boxShadow: '0 25px 50px rgba(234,179,8,0.4)' }} whileTap={{ scale: 0.98 }}
                    type="submit" disabled={isLoading}
                    className="relative w-full overflow-hidden rounded-xl py-4 bg-gradient-to-r from-yellow-500 via-amber-600 to-red-900 text-white disabled:opacity-50 shadow-lg shadow-yellow-500/30">
                    <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isLoading ? (<><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />{language === 'EN' ? 'Processing...' : 'Procesando...'}</>) : (language === 'EN' ? 'Sign In' : 'Iniciar Sesión')}
                    </span>
                  </motion.button>
                </form>

                <div className="relative flex items-center gap-4 mt-6">
                  <div className="flex-1 h-px transition-colors duration-700" style={{ background: lampOn ? 'rgba(251,191,36,0.35)' : 'rgba(120,53,15,0.32)' }} />
                  <span className="text-sm whitespace-nowrap transition-colors duration-700" style={{ color: lampOn ? '#9ca3af' : '#6b7280' }}>
                    {language === 'EN' ? 'or continue with' : 'o continúa con'}
                  </span>
                  <div className="flex-1 h-px transition-colors duration-700" style={{ background: lampOn ? 'rgba(251,191,36,0.35)' : 'rgba(120,53,15,0.32)' }} />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <motion.button whileHover={{ scale: 1.03, boxShadow: '0 8px 30px rgba(234,179,8,0.22)' }} whileTap={{ scale: 0.97 }}
                    type="button" onClick={() => setShowGoogle(true)}
                    className="relative flex items-center justify-center gap-2.5 py-3 rounded-xl border-2 transition-all backdrop-blur-sm overflow-hidden"
                    style={{ background: lampOn ? 'rgba(255,255,255,0.82)' : 'rgba(0,0,0,0.4)', borderColor: lampOn ? 'rgba(251,191,36,0.4)' : 'rgba(120,53,15,0.32)', color: lampOn ? '#111' : '#fff' }}>
                    <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 1 }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/12 to-transparent" />
                    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span>Google</span>
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.03, boxShadow: '0 8px 30px rgba(234,179,8,0.22)' }} whileTap={{ scale: 0.97 }}
                    type="button" onClick={() => setShowGitHub(true)}
                    className="relative flex items-center justify-center gap-2.5 py-3 rounded-xl border-2 transition-all backdrop-blur-sm overflow-hidden"
                    style={{ background: lampOn ? 'rgba(255,255,255,0.82)' : 'rgba(0,0,0,0.4)', borderColor: lampOn ? 'rgba(251,191,36,0.4)' : 'rgba(120,53,15,0.32)', color: lampOn ? '#111' : '#fff' }}>
                    <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/12 to-transparent" />
                    <Github className="w-5 h-5 shrink-0" />
                    <span>GitHub</span>
                  </motion.button>
                </div>

                <p className="text-center mt-6 transition-colors duration-700" style={{ color: lampOn ? '#6b7280' : '#9ca3af' }}>
                  {language === 'EN' ? "Don't have an account?" : '¿No tienes cuenta?'}{' '}
                  <button type="button" onClick={() => setShowSignUp(true)} className="text-yellow-600 hover:text-yellow-500 transition-colors font-medium">
                    {language === 'EN' ? 'Sign up' : 'Regístrate'}
                  </button>
                </p>
              </div>

              <motion.div animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -top-6 -right-6 w-24 h-24 rounded-3xl backdrop-blur-sm border border-yellow-500/20 shadow-lg shadow-yellow-500/20" style={{ background: 'linear-gradient(135deg,rgba(234,179,8,0.18),rgba(180,80,0,0.08))' }} />
              <motion.div animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute -bottom-6 -left-6 w-20 h-20 rounded-3xl backdrop-blur-sm border border-red-900/20 shadow-lg shadow-red-900/20" style={{ background: 'linear-gradient(135deg,rgba(127,0,0,0.18),rgba(100,0,0,0.08))' }} />
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* FOOTER */}
      <motion.footer initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }}
        className="relative z-20 backdrop-blur-xl border-t transition-colors duration-700"
        style={{ background: darkMode ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.65)', borderColor: darkMode ? 'rgba(120,53,15,0.22)' : 'rgba(251,191,36,0.35)' }}>
        <div className="container mx-auto px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="transition-colors duration-700" style={{ color: darkMode ? '#6b7280' : '#9ca3af' }}>
              © 2026 NoteVault. {language === 'EN' ? 'All rights reserved.' : 'Todos los derechos reservados.'}
            </p>
            <div className="flex items-center gap-6">
              {[
                { en: 'Privacy', es: 'Privacidad', action: () => setShowPrivacy(true) },
                { en: 'Terms', es: 'Términos', action: () => setShowTerms(true) },
                { en: 'Support', es: 'Soporte', action: () => setShowSupport(true) },
                { en: 'Contact', es: 'Contacto', action: () => setShowContact(true) },
              ].map(item => (
                <button key={item.en} type="button" onClick={item.action} className="transition-colors" style={{ color: darkMode ? '#6b7280' : '#9ca3af' }}
                  onMouseEnter={e => ((e.target as HTMLElement).style.color = '#d97706')}
                  onMouseLeave={e => ((e.target as HTMLElement).style.color = darkMode ? '#6b7280' : '#9ca3af')}>
                  {language === 'EN' ? item.en : item.es}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [lampOn, setLampOn] = useState(false);
  const [language, setLanguage] = useState('EN');
  const [transitionKey, setTransitionKey] = useState(0);
  const [notes, setNotes] = useState<Note[]>([]);

  // Modal states
  const [showGoogle, setShowGoogle] = useState(false);
  const [showGitHub, setShowGitHub] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showContact, setShowContact] = useState(false);

  // Persist notes
  useEffect(() => {
    const saved = localStorage.getItem('nv_notes');
    if (saved) try { setNotes(JSON.parse(saved)); } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem('nv_notes', JSON.stringify(notes));
  }, [notes]);

  const handleLogin = useCallback((user: CurrentUser) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
  }, []);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setCurrentUser(null);
  }, []);

  const handleToggleLamp = useCallback(() => {
    setLampOn(prev => !prev);
    setTransitionKey(k => k + 1);
  }, []);

  return (
    <>
      {/* Modals always mounted */}
      <GoogleModal open={showGoogle} onClose={() => setShowGoogle(false)} lang={language} onLogin={handleLogin} />
      <GitHubModal open={showGitHub} onClose={() => setShowGitHub(false)} lang={language} onLogin={handleLogin} />
      <SignUpModal open={showSignUp} onClose={() => setShowSignUp(false)} lang={language} lampOn={lampOn} onLogin={handleLogin} />
      <PrivacyModal open={showPrivacy} onClose={() => setShowPrivacy(false)} lang={language} lampOn={lampOn} />
      <TermsModal open={showTerms} onClose={() => setShowTerms(false)} lang={language} lampOn={lampOn} />
      <SupportModal open={showSupport} onClose={() => setShowSupport(false)} lang={language} lampOn={lampOn} onContact={() => setShowContact(true)} />
      <ContactModal open={showContact} onClose={() => setShowContact(false)} lang={language} lampOn={lampOn} />

      {/* Lamp toggle radial-expand overlay */}
      <AnimatePresence>
        {transitionKey > 0 && (
          <motion.div
            key={transitionKey}
            initial={{ clipPath: 'circle(0% at 95% 50%)' }}
            animate={{ clipPath: 'circle(150% at 95% 50%)' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            className="fixed inset-0 pointer-events-none z-[99]"
            style={{ background: lampOn ? 'rgba(255,235,100,0.35)' : 'rgba(0,0,0,0.5)' }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!isLoggedIn ? (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.4 }}>
            <LoginPage
              lampOn={lampOn} setLampOn={(v) => { setLampOn(v); setTransitionKey(k => k + 1); }}
              language={language} setLanguage={setLanguage}
              onLogin={handleLogin}
              showGoogle={showGoogle} setShowGoogle={setShowGoogle}
              showGitHub={showGitHub} setShowGitHub={setShowGitHub}
              showSignUp={showSignUp} setShowSignUp={setShowSignUp}
              showPrivacy={showPrivacy} setShowPrivacy={setShowPrivacy}
              showTerms={showTerms} setShowTerms={setShowTerms}
              showSupport={showSupport} setShowSupport={setShowSupport}
              showContact={showContact} setShowContact={setShowContact}
            />
          </motion.div>
        ) : (
          <motion.div key="app" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <NoteVaultApp
              lampOn={lampOn}
              onToggleLamp={handleToggleLamp}
              notes={notes}
              setNotes={setNotes}
              currentUser={currentUser!}
              setCurrentUser={setCurrentUser}
              onLogout={handleLogout}
              language={language}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
