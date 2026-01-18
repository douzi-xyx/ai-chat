import { useState } from 'react';
import { Loader2, Mail, Lock, User, Eye, EyeOff, CheckCircle } from 'lucide-react';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onModeChange: (mode: 'signin' | 'signup') => void;
  onSuccess: (sessionData?: { user: any }) => void;
}

/**
 * 认证表单组件（登录/注册）
 * 采用与聊天界面一致的玻璃态设计风格
 */
export function AuthForm({ mode, onModeChange, onSuccess }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 表单状态
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const endpoint = mode === 'signin' ? '/api/auth/signin' : '/api/auth/signup';

      // 注册时需要额外字段
      const body = mode === 'signin'
        ? { email: formData.email, password: formData.password }
        : {
            email: formData.email,
            password: formData.password,
            name: formData.name,
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '操作失败');
      }

      // 注册成功，检查是否需要邮箱验证
      if (mode === 'signup' && data.requiresConfirmation) {
        setSuccessMessage(data.message || '注册成功！请查收验证邮件');
        // 不调用 onSuccess，因为需要用户先验证邮箱
        return;
      }

      // 登录成功（注册成功但不需要验证的情况也会走到这里）
      setSuccessMessage(mode === 'signin' ? '登录成功！' : '注册成功！正在跳转...');

      // Cookie 由后端自动设置，无需手动保存

      // 短暂延迟后跳转，让用户看到成功提示
      setTimeout(() => {
        onSuccess({ user: data.user });
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    if (mode === 'signin') {
      return formData.email && formData.password;
    } else {
      return (
        formData.email &&
        formData.password &&
        formData.confirmPassword &&
        formData.name &&
        formData.password === formData.confirmPassword &&
        formData.password.length >= 6
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* 背景效果 */}
      <div className="absolute inset-0 tech-grid-bg z-0 pointer-events-none"></div>
      <div className="ambient-glow"></div>

      {/* 主容器 */}
      <div className="relative z-10 w-full max-w-md px-6">
        {/* 玻璃态卡片 */}
        <div className="glass-panel rounded-2xl p-8 shadow-2xl">
          {/* 标题 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-gradient">AI Chat</span>
            </h1>
            <p className="text-gray-400 text-sm">
              {mode === 'signin' ? '欢迎回来！请登录您的账户' : '创建账户开始使用'}
            </p>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 注册时显示姓名输入框 */}
            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-sm text-gray-300 font-medium block">
                  用户名
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-gray200 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="请输入用户名"
                    required
                  />
                </div>
              </div>
            )}

            {/* 邮箱输入框 */}
            <div className="space-y-2">
              <label className="text-sm text-gray-300 font-medium block">
                邮箱地址
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-gray200 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="请输入邮箱"
                  required
                />
              </div>
            </div>

            {/* 密码输入框 */}
            <div className="space-y-2">
              <label className="text-sm text-gray-300 font-medium block">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-11 pr-12 py-3 bg-white/5 border border-gray200 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder={mode === 'signup' ? '至少6位字符' : '请输入密码'}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* 注册时的确认密码 */}
            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-sm text-gray-300 font-medium block">
                  确认密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-gray200 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="请再次输入密码"
                    required
                  />
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">两次输入的密码不一致</p>
                )}
              </div>
            )}

            {/* 错误提示 */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm flex items-start gap-2">
                <span className="flex-shrink-0">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* 成功提示 */}
            {successMessage && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-green-400 text-sm flex items-start gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={!isFormValid() || isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {mode === 'signin' ? '登录中...' : '注册中...'}
                </>
              ) : (
                <span>{mode === 'signin' ? '登录' : '注册'}</span>
              )}
            </button>
          </form>

          {/* 切换登录/注册 */}
          <div className="mt-6 text-center text-sm text-gray-400">
            {mode === 'signin' ? (
              <>
                还没有账户？{' '}
                <button
                  type="button"
                  onClick={() => {
                    onModeChange('signup');
                    setError('');
                  }}
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  立即注册
                </button>
              </>
            ) : (
              <>
                已有账户？{' '}
                <button
                  type="button"
                  onClick={() => {
                    onModeChange('signin');
                    setError('');
                  }}
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  立即登录
                </button>
              </>
            )}
          </div>
        </div>

        {/* 底部说明 */}
        <div className="text-center mt-6 text-xs text-gray-500">
          登录即表示您同意我们的服务条款和隐私政策
        </div>
      </div>
    </div>
  );
}
