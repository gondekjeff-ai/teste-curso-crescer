import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Shield, Lock, Mail, AlertTriangle } from 'lucide-react';
import optiStratLogo from '@/assets/optistrat-logo-full.png';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

const RATE_LIMIT_KEY = 'login_attempts';
const RATE_LIMIT_DURATION = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

interface LoginAttempt {
  count: number;
  lastAttempt: number;
}

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [needsMfa, setNeedsMfa] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check rate limiting on mount
  useEffect(() => {
    checkRateLimit();
  }, []);

  const checkRateLimit = () => {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    if (!stored) return;

    const attempt: LoginAttempt = JSON.parse(stored);
    const timeSinceLastAttempt = Date.now() - attempt.lastAttempt;

    if (attempt.count >= MAX_ATTEMPTS && timeSinceLastAttempt < RATE_LIMIT_DURATION) {
      setRateLimited(true);
      setRemainingTime(Math.ceil((RATE_LIMIT_DURATION - timeSinceLastAttempt) / 1000));
      
      // Update countdown
      const interval = setInterval(() => {
        const newTimeSince = Date.now() - attempt.lastAttempt;
        const newRemaining = Math.ceil((RATE_LIMIT_DURATION - newTimeSince) / 1000);
        
        if (newRemaining <= 0) {
          setRateLimited(false);
          localStorage.removeItem(RATE_LIMIT_KEY);
          clearInterval(interval);
        } else {
          setRemainingTime(newRemaining);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    } else if (timeSinceLastAttempt >= RATE_LIMIT_DURATION) {
      localStorage.removeItem(RATE_LIMIT_KEY);
    }
  };

  const recordFailedAttempt = () => {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    const attempt: LoginAttempt = stored 
      ? JSON.parse(stored) 
      : { count: 0, lastAttempt: Date.now() };

    const timeSinceLastAttempt = Date.now() - attempt.lastAttempt;

    if (timeSinceLastAttempt >= RATE_LIMIT_DURATION) {
      attempt.count = 1;
    } else {
      attempt.count += 1;
    }

    attempt.lastAttempt = Date.now();
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(attempt));

    if (attempt.count >= MAX_ATTEMPTS) {
      checkRateLimit();
    }
  };

  const clearAttempts = () => {
    localStorage.removeItem(RATE_LIMIT_KEY);
    setRateLimited(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rateLimited) {
      toast({
        title: 'Tentativas excedidas',
        description: `Aguarde ${Math.floor(remainingTime / 60)}:${(remainingTime % 60).toString().padStart(2, '0')} antes de tentar novamente.`,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (!needsMfa) {
        // First step: email/password authentication
        const { data, error } = await signIn(email, password);

        if (error) {
          recordFailedAttempt();
          toast({
            title: 'Erro no login',
            description: error.message,
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        if (data?.user) {
          // Check if user is admin
          const { data: userRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', data.user.id)
            .eq('role', 'admin')
            .maybeSingle();

          if (!userRole) {
            recordFailedAttempt();
            await supabase.auth.signOut();
            toast({
              title: 'Acesso negado',
              description: 'Você não tem permissão para acessar o painel administrativo.',
              variant: 'destructive',
            });
            setLoading(false);
            return;
          }

          // Check if user has MFA enabled (only fetch mfa_enabled, not the secret)
          const { data: profile } = await supabase
            .from('profiles')
            .select('mfa_enabled')
            .eq('user_id', data.user.id)
            .single();

          if (profile?.mfa_enabled) {
            // User has MFA enabled, show MFA input
            setNeedsMfa(true);
            setLoading(false);
            return;
          } else {
            // No MFA, proceed to admin panel
            clearAttempts();
            toast({
              title: 'Login bem-sucedido',
              description: 'Redirecionando para o painel administrativo...',
            });
            // Small delay to ensure session is fully established
            setTimeout(() => {
              navigate('/admin', { replace: true });
            }, 100);
          }
        }
      } else {
        // Second step: MFA verification
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          recordFailedAttempt();
          toast({
            title: 'Erro',
            description: 'Sessão expirada. Por favor, faça login novamente.',
            variant: 'destructive',
          });
          setNeedsMfa(false);
          setLoading(false);
          return;
        }

        // Call the Edge Function for secure server-side MFA verification
        const { data: verifyResult, error: verifyError } = await supabase.functions.invoke('verify-mfa', {
          body: {
            userId: user.id,
            code: mfaCode
          }
        });

        if (verifyError) {
          console.error('MFA verification error:', verifyError);
          recordFailedAttempt();
          toast({
            title: 'Erro',
            description: 'Erro ao verificar código MFA',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        if (!verifyResult?.valid) {
          recordFailedAttempt();
          toast({
            title: 'Código inválido',
            description: 'O código de autenticação está incorreto',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        // MFA verification successful - check admin status one more time
        const { data: userRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (!userRole) {
          recordFailedAttempt();
          await supabase.auth.signOut();
          toast({
            title: 'Acesso negado',
            description: 'Você não tem permissão para acessar o painel administrativo.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        clearAttempts();
        toast({
          title: 'Login bem-sucedido',
          description: 'Redirecionando para o painel administrativo...',
        });
        // Small delay to ensure session is fully established
        setTimeout(() => {
          navigate('/admin', { replace: true });
        }, 100);
      }
    } catch (error) {
      recordFailedAttempt();
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao fazer login',
        variant: 'destructive',
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary/80 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <img src={optiStratLogo} alt="OptiStrat" className="h-32" />
          </div>
          <div className="space-y-2 text-center">
            <div className="flex justify-center">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">Área Administrativa</CardTitle>
            <CardDescription>
              Entre com suas credenciais de administrador
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {rateLimited && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Muitas tentativas de login. Aguarde {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')} antes de tentar novamente.
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            {!needsMfa ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@optistrat.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="mfa">Código de Autenticação (2FA)</Label>
                <Input
                  id="mfa"
                  type="text"
                  placeholder="000000"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  maxLength={6}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Digite o código de 6 dígitos do seu aplicativo autenticador
                </p>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading || rateLimited}>
              {loading ? 'Entrando...' : needsMfa ? 'Verificar Código' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
