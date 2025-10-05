import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Image, FileText, Shield, Users } from 'lucide-react';

const AdminHome = () => {
  const stats = [
    {
      title: 'Imagens do Carrossel',
      value: '4',
      icon: Image,
      description: 'Imagens ativas',
    },
    {
      title: 'Seções de Conteúdo',
      value: '1',
      icon: FileText,
      description: 'Hero configurado',
    },
    {
      title: 'Administradores',
      value: '1',
      icon: Shield,
      description: 'Usuários admin',
    },
    {
      title: 'Contatos',
      value: '0',
      icon: Users,
      description: 'Novos contatos',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
        <p className="text-muted-foreground mt-2">
          Bem-vindo ao painel de administração do OptiStrat
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Guia Rápido</CardTitle>
          <CardDescription>
            Como usar o painel administrativo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Image className="h-4 w-4" />
              Gerenciar Carrossel
            </h3>
            <p className="text-sm text-muted-foreground">
              Adicione, edite ou remova imagens do carrossel da página inicial. As imagens são exibidas automaticamente em rotação.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Editar Conteúdo
            </h3>
            <p className="text-sm text-muted-foreground">
              Modifique os textos da seção Hero, incluindo título, subtítulo e textos dos botões. As alterações são salvas no banco de dados.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Segurança
            </h3>
            <p className="text-sm text-muted-foreground">
              Este painel é protegido por autenticação e controle de acesso baseado em roles. Apenas administradores podem acessar.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminHome;
