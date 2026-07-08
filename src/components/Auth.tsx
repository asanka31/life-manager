import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { 
  KeyRound, 
  Mail, 
  User, 
  Sparkles, 
  Lock, 
  ArrowRight, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export const Auth: React.FC = () => {
  const { loginWithGoogle, settings, logAction } = useApp();
  const t = translations[settings.language];

  // Active view: 'login' | 'register' | 'forgot'
  const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Input fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Status/Error messages
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setError(null);
    setInfo(null);
    setSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err: any) {
      setError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password || !name.trim()) return;
    setError(null);
    setInfo(null);
    setSubmitting(true);

    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const registeredUser = result.user;

      // Update Display Name in Firebase Auth profile
      await updateProfile(registeredUser, { displayName: name.trim() });

      // Save user profile in Firestore
      let finalRole: 'user' | 'admin' = 'user';
      if (registeredUser.email === 'asankaudayak31@gmail.com') {
        finalRole = 'admin';
      }

      const userProfile = {
        uid: registeredUser.uid,
        name: name.trim(),
        email: registeredUser.email || '',
        role: finalRole,
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'users', registeredUser.uid), userProfile);

      // Save initial settings
      const initSettings = {
        userId: registeredUser.uid,
        darkMode: false,
        language: 'en',
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'settings', registeredUser.uid), initSettings);

    } catch (err: any) {
      setError(err.message || "Could not register account. Please check formatting.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    setInfo(null);
    setSubmitting(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setInfo("Check your inbox! We've sent a secure password reset link.");
    } catch (err: any) {
      setError(err.message || "Failed to send reset link. Double check your email.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-slate-200 flex flex-col items-center justify-center p-4 select-none relative overflow-hidden font-sans">
      {/* Dynamic graphic particles */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-500/5 rounded-full filter blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/5 rounded-full filter blur-3xl animate-pulse" />

      <div className="w-full max-w-md glass-card p-8 space-y-6 relative z-10">
        
        {/* Brand Banner */}
        <div className="text-center space-y-1.5">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-[#6366f1] flex items-center justify-center text-white shadow-lg shadow-[#6366f1]/20">
            <Sparkles size={24} />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Life Manager</h1>
          <p className="text-xs text-slate-400">Your secure modern full-stack life organization hub</p>
        </div>

        {/* Message banners */}
        {error && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold rounded-2xl flex items-start gap-2.5 animate-shake">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        {info && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-2xl flex items-start gap-2.5">
            <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
            <p className="leading-relaxed">{info}</p>
          </div>
        )}

        {/* Auth Forms */}
        {view === 'login' && (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            {/* Email */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-white/10 bg-[#161920] text-slate-200 outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Password</label>
                <button 
                  type="button" 
                  onClick={() => setView('forgot')}
                  className="text-[10px] text-[#6366f1] hover:underline font-bold"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-white/10 bg-[#161920] text-slate-200 outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#6366f1] hover:bg-[#6366f1]/90 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#6366f1]/10 flex items-center justify-center gap-1.5"
            >
              <span>{submitting ? "Signing In..." : "Sign In with Email"}</span>
              <ArrowRight size={14} />
            </button>
          </form>
        )}

        {view === 'register' && (
          <form onSubmit={handleEmailRegister} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Your Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                <input
                  type="text"
                  required
                  maxLength={50}
                  placeholder="Alexander"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-white/10 bg-[#161920] text-slate-200 outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-white/10 bg-[#161920] text-slate-200 outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-white/10 bg-[#161920] text-slate-200 outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#6366f1] hover:bg-[#6366f1]/90 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#6366f1]/10 flex items-center justify-center gap-1.5"
            >
              <span>{submitting ? "Registering..." : "Create Free Account"}</span>
              <ArrowRight size={14} />
            </button>
          </form>
        )}

        {view === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-white/10 bg-[#161920] text-slate-200 outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#6366f1] hover:bg-[#6366f1]/90 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#6366f1]/10 flex items-center justify-center gap-1.5"
            >
              <span>{submitting ? "Sending reset..." : "Send Reset Link"}</span>
              <ArrowRight size={14} />
            </button>

            <button
              type="button"
              onClick={() => setView('login')}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-200 font-bold"
            >
              Back to Sign In
            </button>
          </form>
        )}

        {/* View Switch Toggles */}
        {view !== 'forgot' && (
          <div className="text-center text-xs text-slate-500 font-medium pt-2">
            {view === 'login' ? (
              <>
                New to Life Manager?{' '}
                <button 
                  onClick={() => setView('register')} 
                  className="text-[#6366f1] hover:underline font-bold"
                >
                  Create Account
                </button>
              </>
            ) : (
              <>
                Already registered?{' '}
                <button 
                  onClick={() => setView('login')} 
                  className="text-[#6366f1] hover:underline font-bold"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        )}

        {/* Social Authentication divider */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-white/5" />
          <span className="flex-shrink mx-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider">or sign in with</span>
          <div className="flex-grow border-t border-white/5" />
        </div>

        {/* Google Popup Button */}
        <button
          onClick={loginWithGoogle}
          className="w-full py-3.5 rounded-xl border border-white/10 bg-[#161920] hover:bg-[#161920]/80 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2.5 shadow-xs"
        >
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>
      </div>
    </div>
  );
};
