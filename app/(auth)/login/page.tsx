'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/stores/app-store';
import { t } from '@/lib/i18n/strings';

export default function LoginPage() {
  const locale = useAppStore((s) => s.locale);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <p className="font-jp text-4xl mb-2">組込みコード</p>
          <h1 className="text-2xl font-bold text-slate-100">Keogo <span className="text-cyan-400">&</span> Code</h1>
          <p className="text-slate-400 text-sm mt-1">Japanese for embedded engineers</p>
        </div>

        {sent ? (
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 text-center">
            <p className="text-slate-300">{t('auth.check_email', locale)}</p>
            <p className="text-slate-500 text-sm mt-2">{email}</p>
          </div>
        ) : (
          <form onSubmit={handleMagicLink} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.email', locale)}
              required
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-zinc-950 font-semibold rounded-lg px-4 py-3 transition-colors"
            >
              {loading ? '...' : t('auth.magic_link', locale)}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
