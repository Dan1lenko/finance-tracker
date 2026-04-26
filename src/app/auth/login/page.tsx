"use client";

import { useState } from "react";
import { useFinanceStore } from "@/store/useFinanceStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KeyRound, Mail, Sparkles } from "lucide-react";

export default function LoginPage() {
  const login = useFinanceStore((state) => state.login);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = "Введіть електронну пошту";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Невірний формат пошти";
    }

    if (!password) {
      newErrors.password = "Введіть пароль";
    } else if (password.length < 6) {
      newErrors.password = "Пароль має бути не менше 6 символів";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    await login(email, password);
    setIsLoading(false);
    
    // Check if login succeeded (currentUser will be set)
    const user = useFinanceStore.getState().currentUser;
    if (user) {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-20" style={{ background: 'var(--accent-violet)', filter: 'blur(120px)' }} />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full opacity-15" style={{ background: 'var(--accent-cyan)', filter: 'blur(120px)' }} />
      </div>

      <div className="relative w-full max-w-md animate-fade-in-up">
        <div className="glass-card p-6 sm:p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'var(--gradient-brand)' }}>
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold gradient-text">Вхід в систему</h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              Або{' '}
              <Link href="/auth/register" className="font-medium transition-colors" style={{ color: 'var(--accent-violet)' }}>
                зареєструйтеся
              </Link>
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleLogin} noValidate>
            <div>
              <div className="relative">
                <Mail className="absolute top-3 left-3.5 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  className={`glass-input ${errors.email ? 'input-error' : ''}`}
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Електронна пошта"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors(prev => ({ ...prev, email: undefined })); }}
                  autoComplete="username"
                />
              </div>
              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>

            <div>
              <div className="relative">
                <KeyRound className="absolute top-3 left-3.5 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  className={`glass-input ${errors.password ? 'input-error' : ''}`}
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Пароль"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors(prev => ({ ...prev, password: undefined })); }}
                  autoComplete="current-password"
                />
              </div>
              {errors.password && <p className="error-text">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="gradient-btn w-full py-3 text-sm mt-2 disabled:opacity-50"
            >
              {isLoading ? 'Входимо...' : 'Увійти'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
