import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Shield, Lock, Mail } from 'lucide-react';
import optiStratLogo from '@/assets/optistrat-logo-full.png';
import { supabase } from '@/integrations/supabase/client';
import { verifyMFAToken } from '@/lib/mfa';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [needsMfa, setNeedsMfa] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!needsMfa) {
        // First step: email/password authentication
        const { data, error } = await signIn(email, password);

        if (error) {
          toast({
            title: 'Erro no login',
            description: error.message,
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        if (data?.user) {
          // Check if user has MFA enabled
          const { data: profile } = await supabase
            .from('profiles')
            .select('mfa_enabled, mfa_secret')
            .eq('user_id', data.user.id)
            .single();

          if (profile?.mfa_enabled && profile?.mfa_secret) {
            // User has MFA enabled, show MFA input
            setNeedsMfa(true);
            setLoading(false);
            return;
          } else {
            // No MFA, proceed to admin panel
            toast({
              title: 'Login bem-sucedido',
              description: 'Redirecionando para o painel administrativo...',
            });
            navigate('/admin');
          }
        }
      } else {
        // Second step: MFA verification
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast({
            title: 'Erro',
            description: 'Sessão expirada. Por favor, faça login novamente.',
            variant: 'destructive',
          });
          setNeedsMfa(false);
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('mfa_secret')
          .eq('user_id', user.id)
          .single();

        if (!profile?.mfa_secret) {
          toast({
            title: 'Erro',
            description: 'Configuração de 2FA não encontrada',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        const isValid = verifyMFAToken(mfaCode, profile.mfa_secret);

        if (!isValid) {
          toast({
            title: 'Código inválido',
            description: 'O código de autenticação está incorreto',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        // MFA verification successful
        toast({
          title: 'Login bem-sucedido',
          description: 'Redirecionando para o painel administrativo...',
        });
        navigate('/admin');
      }
    } catch (error) {
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : needsMfa ? 'Verificar Código' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
