import { useState } from 'react';

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just log in (we'll add real auth later)
    if (email && password) {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-[420px]">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <svg className="w-[52px] h-[52px]" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="13" cy="13" r="12" stroke="#8a6c3e" strokeWidth="1.2" />
              <circle cx="13" cy="13" r="6.5" stroke="#8a6c3e" strokeWidth="0.9" strokeDasharray="1.8 2.4" />
              <circle cx="13" cy="13" r="2" fill="#8a6c3e" />
            </svg>
          </div>
          <h1
            style={{ fontFamily: 'var(--font-h)', color: 'var(--ink)' }}
            className="text-[1.8rem] italic mb-2"
          >
            One Honest Look
          </h1>
          <p className="text-[0.82rem] leading-relaxed" style={{ color: 'var(--ink3)' }}>
            A personal map of who you are and who you're becoming.
          </p>
        </div>

        {/* Login Card */}
        <div
          className="rounded-[13px] border p-8 mb-4"
          style={{ background: 'var(--bg)', borderColor: 'var(--rule)', boxShadow: 'var(--sh-lg)' }}
        >
          <div className="mb-6">
            <h2
              style={{ fontFamily: 'var(--font-h)', color: 'var(--ink)' }}
              className="text-[1.2rem] italic mb-1"
            >
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-[0.72rem]" style={{ color: 'var(--ink3)' }}>
              {isSignUp ? 'Start your honest journey' : 'Continue your journey'}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                className="text-[0.65rem] font-medium tracking-[0.08em] uppercase block mb-2"
                style={{ color: 'var(--ink3)' }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full text-[0.82rem] rounded-lg px-4 py-3 border outline-none transition-all duration-150 focus:border-[var(--gold-lt)]"
                style={{
                  fontFamily: 'var(--font-b)',
                  background: 'var(--bg2)',
                  borderColor: 'var(--rule)',
                  color: 'var(--ink)',
                }}
              />
            </div>

            <div className="mb-6">
              <label
                className="text-[0.65rem] font-medium tracking-[0.08em] uppercase block mb-2"
                style={{ color: 'var(--ink3)' }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full text-[0.82rem] rounded-lg px-4 py-3 border outline-none transition-all duration-150 focus:border-[var(--gold-lt)]"
                style={{
                  fontFamily: 'var(--font-b)',
                  background: 'var(--bg2)',
                  borderColor: 'var(--rule)',
                  color: 'var(--ink)',
                }}
              />
            </div>

            <button
              type="submit"
              className="w-full text-[0.82rem] font-medium px-4 py-3 rounded-lg border-none transition-all duration-150 tracking-wide hover:opacity-90 mb-4"
              style={{
                fontFamily: 'var(--font-b)',
                background: 'var(--gold)',
                color: '#fff',
              }}
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </button>

            {!isSignUp && (
              <div className="text-center mb-4">
                <button
                  type="button"
                  className="text-[0.72rem] bg-transparent border-none cursor-pointer p-0 hover:opacity-80"
                  style={{ color: 'var(--gold)', fontFamily: 'var(--font-b)' }}
                >
                  Forgot password?
                </button>
              </div>
            )}
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: 'var(--rule2)' }} />
            </div>
            <div className="relative flex justify-center text-[0.68rem]">
              <span className="px-3" style={{ background: 'var(--bg)', color: 'var(--ink4)' }}>
                OR
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onLogin()}
            className="w-full text-[0.78rem] font-medium px-4 py-3 rounded-lg border transition-all duration-150 tracking-wide hover:opacity-80 mb-3"
            style={{
              fontFamily: 'var(--font-b)',
              background: 'var(--bg)',
              borderColor: 'var(--rule)',
              color: 'var(--ink2)',
            }}
          >
            Continue as Guest
          </button>
        </div>

        {/* Sign Up / Sign In Toggle */}
        <div className="text-center">
          <p className="text-[0.74rem]" style={{ color: 'var(--ink3)' }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="bg-transparent border-none cursor-pointer p-0 hover:opacity-80 font-medium"
              style={{ color: 'var(--gold)', fontFamily: 'var(--font-b)' }}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>

        {/* Footer Note */}
        <div
          className="text-center mt-8 text-[0.68rem] leading-relaxed px-4"
          style={{ color: 'var(--ink4)' }}
        >
          Your data is private and stored securely. We will never sell your data.
    
          <br />
          This is a space for honest self-reflection.
        </div>
      </div>
    </div>
  );
}
