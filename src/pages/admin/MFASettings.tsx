import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generateMFASecret, generateQRCode, verifyMFAToken } from '@/lib/mfa';
import { Shield, CheckCircle } from 'lucide-react';
import QRCode from 'qrcode';

const MFASettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaSecret, setMfaSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMFAStatus();
  }, [user]);

  const loadMFAStatus = async () => {
    if (!user) return;

    try {
      // Only fetch mfa_enabled status, never fetch the secret from client
      const { data: profile } = await supabase
        .from('profiles')
        .select('mfa_enabled')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setMfaEnabled(profile.mfa_enabled || false);
      }
    } catch (error) {
      toast({
        title: 'Erro ao carregar configurações',
        description: 'Não foi possível carregar as configurações de segurança',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const startMFASetup = async () => {
    if (!user?.email) return;

    const secret = generateMFASecret();
    const otpauth = generateQRCode(user.email, secret);

    try {
      const qrUrl = await QRCode.toDataURL(otpauth);
      setQrCodeUrl(qrUrl);
      setMfaSecret(secret);
      setIsSettingUp(true);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o código QR',
        variant: 'destructive',
      });
    }
  };

  const verifyAndEnableMFA = async () => {
    if (!user || !mfaSecret || !verificationCode) return;

    const isValid = verifyMFAToken(verificationCode, mfaSecret);

    if (!isValid) {
      toast({
        title: 'Código inválido',
        description: 'O código de verificação está incorreto',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          email: user.email!,
          mfa_enabled: true,
          mfa_secret: mfaSecret,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setMfaEnabled(true);
      setIsSettingUp(false);
      setVerificationCode('');
      toast({
        title: 'Sucesso',
        description: 'Autenticação de dois fatores ativada com sucesso',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível ativar o 2FA',
        variant: 'destructive',
      });
    }
  };

  const disableMFA = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          mfa_enabled: false,
          mfa_secret: null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setMfaEnabled(false);
      setMfaSecret('');
      setQrCodeUrl('');
      toast({
        title: 'Sucesso',
        description: 'Autenticação de dois fatores desativada',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível desativar o 2FA',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Configurações de Segurança</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <CardTitle>Autenticação de Dois Fatores (2FA)</CardTitle>
          </div>
          <CardDescription>
            Adicione uma camada extra de segurança à sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!mfaEnabled && !isSettingUp && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                A autenticação de dois fatores adiciona uma camada extra de segurança 
                exigindo um código do seu aplicativo autenticador além da sua senha.
              </p>
              <Button onClick={startMFASetup}>
                Ativar 2FA
              </Button>
            </div>
          )}

          {isSettingUp && (
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  1. Escaneie este código QR com seu aplicativo autenticador:
                </p>
                <div className="flex justify-center p-4 bg-white border rounded-lg">
                  <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Recomendamos Google Authenticator ou Microsoft Authenticator
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">
                  2. Digite o código de 6 dígitos do aplicativo:
                </p>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                    className="max-w-xs"
                  />
                  <Button onClick={verifyAndEnableMFA} disabled={verificationCode.length !== 6}>
                    Verificar e Ativar
                  </Button>
                </div>
              </div>

              <Button variant="outline" onClick={() => setIsSettingUp(false)}>
                Cancelar
              </Button>
            </div>
          )}

          {mfaEnabled && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">2FA Ativo</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Sua conta está protegida com autenticação de dois fatores.
              </p>
              <Button variant="destructive" onClick={disableMFA}>
                Desativar 2FA
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MFASettings;
