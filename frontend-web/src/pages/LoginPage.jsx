import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { GlassCard } from '../components/ui/GlassCard';
import { GooeyInput } from '../components/ui/GooeyInput';
import { AnimatedBeams } from '../components/ui/AnimatedBeams';
import { DottedBackground } from '../components/ui/DottedBackground';
import { Loader } from 'lucide-react';

export function LoginPage() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center relative overflow-hidden">
      <DottedBackground />

      <div className="relative z-10 w-full max-w-md px-6">
        <GlassCard className="p-8">
          <AnimatedBeams />

          <div className="relative z-10">
            <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white text-center mb-2">
              HybridHerd
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-8">
              Livestock Health Monitoring
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <GooeyInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
              />

              <GooeyInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />

              {error && (
                <div className="bg-red-50 border border-red-300/50 dark:bg-red-500/20 dark:border-red-500/50 rounded-lg p-3">
                  <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-medium py-3 rounded-full hover:from-teal-600 hover:to-teal-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <p className="text-center text-slate-500 dark:text-slate-400 text-sm mt-6">
              Demo credentials available from your administrator
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
