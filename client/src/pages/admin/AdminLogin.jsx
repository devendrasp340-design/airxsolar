import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function AdminLogin() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const result = await login(email.trim(), password);
    setSubmitting(false);

    if (result.success) {
      navigate('/admin', { replace: true });
    } else {
      setError(result.error || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
        <div className="text-center mb-8">
          <img src="/logo-icon.png" alt="AirXSolar" className="w-16 h-16 object-contain mx-auto mb-3" />
          <h1 className="font-heading font-extrabold text-2xl text-navy">
            AirXSolar Admin
          </h1>
          <p className="text-sm text-navy/60 mt-1">Sign in to manage leads &amp; content</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-navy mb-1.5">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-navy/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@airxsolar.com.au"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 text-navy focus:outline-none focus:ring-2 focus:ring-amber"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-navy/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 text-navy focus:outline-none focus:ring-2 focus:ring-amber"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-amber text-navy font-bold py-3.5 rounded-xl hover:bg-amber/90 transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
