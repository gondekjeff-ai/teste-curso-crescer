import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Image, FileText, Package, Newspaper, Eye, MessageSquare, Users,
  TrendingUp, TrendingDown, RefreshCw, ArrowUpRight, Activity, ShoppingBag, Mail, Circle, AlertTriangle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SeriesPoint { day: string; count: number; }
interface TopPage { page_path: string; views: number; }
interface RecentContact { id: string | number; name: string; email: string; subject?: string; message?: string; created_at: string; }
interface Stats {
  carouselImages: number; contacts: number; pageViews: number;
  chatbotInteractions: number; products: number; news: number; orders?: number;
  topPages: TopPage[];
  series: { views: SeriesPoint[]; chatbot: SeriesPoint[]; contacts: SeriesPoint[] };
  previous: { pageViews: number; chatbotInteractions: number; contacts: number };
  recentContacts: RecentContact[];
  generatedAt: string;
}

const REFRESH_MS = 15000;

const PIE_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2, 173 58% 39%))',
  'hsl(var(--chart-3, 197 37% 44%))',
  'hsl(var(--chart-4, 43 74% 66%))',
  'hsl(var(--chart-5, 27 87% 67%))',
];

const formatDayLabel = (d: string) => {
  try { return format(parseISO(d), 'dd/MM'); } catch { return d; }
};

const trendPct = (current: number, previous: number): { pct: number; up: boolean } => {
  if (!previous) return { pct: current > 0 ? 100 : 0, up: current >= 0 };
  const diff = ((current - previous) / previous) * 100;
  return { pct: Math.round(Math.abs(diff)), up: diff >= 0 };
};

const AdminHome = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [live, setLive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const loadStats = async (silent = false) => {
    try {
      if (!silent) setRefreshing(true);
      const data = await api.get<Stats>('/admin/stats');
      // Defensive normalization to avoid render crashes if server omits a field
      const normalized: Stats = {
        carouselImages: data?.carouselImages ?? 0,
        contacts: data?.contacts ?? 0,
        pageViews: data?.pageViews ?? 0,
        chatbotInteractions: data?.chatbotInteractions ?? 0,
        products: data?.products ?? 0,
        news: data?.news ?? 0,
        orders: data?.orders ?? 0,
        topPages: Array.isArray(data?.topPages) ? data.topPages : [],
        series: {
          views: Array.isArray(data?.series?.views) ? data.series.views : [],
          chatbot: Array.isArray(data?.series?.chatbot) ? data.series.chatbot : [],
          contacts: Array.isArray(data?.series?.contacts) ? data.series.contacts : [],
        },
        previous: {
          pageViews: Number(data?.previous?.pageViews ?? 0),
          chatbotInteractions: Number(data?.previous?.chatbotInteractions ?? 0),
          contacts: Number(data?.previous?.contacts ?? 0),
        },
        recentContacts: Array.isArray(data?.recentContacts) ? data.recentContacts : [],
        generatedAt: data?.generatedAt ?? new Date().toISOString(),
      };
      setStats(normalized);
      setError(null);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setError(error instanceof Error ? error.message : 'Falha ao carregar estatísticas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (!live) return;
    timerRef.current = window.setInterval(() => loadStats(true), REFRESH_MS);
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [live]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent"></div>
          <span className="text-sm text-muted-foreground">Carregando painel...</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Não foi possível carregar o painel
            </CardTitle>
            <CardDescription className="text-xs break-words">
              {error || 'O servidor não respondeu com dados válidos.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="sm" onClick={() => { setLoading(true); loadStats(); }}>
              <RefreshCw className="h-3.5 w-3.5 mr-2" /> Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const viewsTrend = trendPct(stats.pageViews, stats.previous?.pageViews ?? 0);
  const chatTrend = trendPct(stats.chatbotInteractions, stats.previous?.chatbotInteractions ?? 0);
  const contactsTrend = trendPct(stats.contacts, stats.previous?.contacts ?? 0);

  const statCards = [
    {
      title: 'Visitas (30d)', value: stats.pageViews, icon: Eye,
      accent: 'from-blue-500/20 to-blue-500/5', iconColor: 'text-blue-500',
      trend: viewsTrend, sub: 'vs. 30 dias anteriores',
    },
    {
      title: 'Interações Chatbot', value: stats.chatbotInteractions, icon: MessageSquare,
      accent: 'from-emerald-500/20 to-emerald-500/5', iconColor: 'text-emerald-500',
      trend: chatTrend, sub: 'últimos 30 dias',
    },
    {
      title: 'Contatos', value: stats.contacts, icon: Users,
      accent: 'from-purple-500/20 to-purple-500/5', iconColor: 'text-purple-500',
      trend: contactsTrend, sub: 'total recebido', link: '/admin/contacts',
    },
    {
      title: 'Pedidos', value: stats.orders ?? 0, icon: ShoppingBag,
      accent: 'from-amber-500/20 to-amber-500/5', iconColor: 'text-amber-500',
      sub: 'total', link: '/admin/products',
    },
  ];

  const contentCards = [
    { label: 'Carrossel', value: stats.carouselImages, icon: Image, link: '/admin/carousel', color: 'text-orange-500' },
    { label: 'Produtos', value: stats.products, icon: Package, link: '/admin/products', color: 'text-cyan-500' },
    { label: 'Notícias', value: stats.news, icon: Newspaper, link: '/admin/news', color: 'text-pink-500' },
  ];

  // Combined series for the main area chart
  const combined = stats.series.views.map((v, i) => ({
    day: v.day,
    label: formatDayLabel(v.day),
    Visitas: v.count,
    Chatbot: stats.series.chatbot[i]?.count ?? 0,
    Contatos: stats.series.contacts[i]?.count ?? 0,
  }));

  const topPagesData = stats.topPages.map((p, i) => ({
    name: p.page_path === '/' ? 'Home' : p.page_path.replace(/^\//, ''),
    value: p.views,
    fill: PIE_COLORS[i % PIE_COLORS.length],
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Painel Geral</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visão geral em tempo real do site OptiStrat
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`gap-1.5 ${live ? 'border-emerald-500/40 text-emerald-500' : 'border-muted text-muted-foreground'}`}
          >
            <Circle className={`h-2 w-2 ${live ? 'fill-emerald-500 text-emerald-500 animate-pulse' : 'fill-muted-foreground text-muted-foreground'}`} />
            {live ? 'Ao vivo' : 'Pausado'}
          </Badge>
          {lastUpdate && (
            <span className="text-[11px] text-muted-foreground hidden sm:inline">
              atualizado {formatDistanceToNow(lastUpdate, { addSuffix: true, locale: ptBR })}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLive(v => !v)}
            className="h-8"
          >
            {live ? 'Pausar' : 'Retomar'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadStats()}
            disabled={refreshing}
            className="h-8"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Primary KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((s) => {
          const Wrapper: any = s.link ? Link : 'div';
          const wProps = s.link ? { to: s.link } : {};
          return (
            <Wrapper key={s.title} {...wProps} className={s.link ? 'block group' : ''}>
              <Card className="relative overflow-hidden h-full transition-shadow group-hover:shadow-md">
                <div className={`absolute inset-0 bg-gradient-to-br ${s.accent} pointer-events-none`} />
                <CardContent className="relative p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg bg-background/60 backdrop-blur ${s.iconColor}`}>
                      <s.icon className="h-5 w-5" />
                    </div>
                    {s.trend && (
                      <div className={`flex items-center gap-1 text-xs font-medium ${s.trend.up ? 'text-emerald-500' : 'text-red-500'}`}>
                        {s.trend.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {s.trend.pct}%
                      </div>
                    )}
                  </div>
                  <div className="text-3xl font-bold tabular-nums">{s.value.toLocaleString('pt-BR')}</div>
                  <p className="text-sm font-medium mt-1">{s.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{s.sub}</p>
                </CardContent>
              </Card>
            </Wrapper>
          );
        })}
      </div>

      {/* Main chart + secondary donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Atividade nos últimos 30 dias
                </CardTitle>
                <CardDescription className="text-xs">Visitas, chatbot e contatos por dia</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={combined} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gChat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gContacts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="Visitas" stroke="hsl(var(--primary))" fill="url(#gViews)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Chatbot" stroke="#10b981" fill="url(#gChat)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Contatos" stroke="#a855f7" fill="url(#gContacts)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Páginas mais visitadas
            </CardTitle>
            <CardDescription className="text-xs">Distribuição nos últimos 30 dias</CardDescription>
          </CardHeader>
          <CardContent>
            {topPagesData.length > 0 ? (
              <>
                <div className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={topPagesData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={2}
                      >
                        {topPagesData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} stroke="hsl(var(--background))" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 mt-2">
                  {topPagesData.map((p, i) => (
                    <div key={p.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.fill }} />
                        <span className="truncate">{p.name}</span>
                      </div>
                      <span className="text-muted-foreground tabular-nums">{p.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Sem dados ainda</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chatbot bar + Recent contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-emerald-500" />
              Interações do Chatbot por dia
            </CardTitle>
            <CardDescription className="text-xs">Últimos 30 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.series.chatbot.map(d => ({ label: formatDayLabel(d.day), count: d.count }))}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail className="h-4 w-4 text-purple-500" />
                  Contatos recentes
                </CardTitle>
                <CardDescription className="text-xs">Últimas 5 mensagens</CardDescription>
              </div>
              <Link to="/admin/contacts" className="text-xs text-primary hover:underline flex items-center gap-0.5">
                Ver <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentContacts?.length > 0 ? (
              <div className="space-y-3">
                {stats.recentContacts.map((c) => (
                  <div key={c.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center flex-shrink-0">
                      {c.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-sm font-medium truncate">{c.name}</p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                      {(c.subject || c.message) && (
                        <p className="text-xs mt-0.5 truncate">{c.subject || c.message}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhum contato ainda</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Content shortcuts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Conteúdo do site</CardTitle>
          <CardDescription className="text-xs">Acesso rápido aos gerenciadores</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {contentCards.map((c) => (
            <Link
              key={c.label}
              to={c.link}
              className="flex flex-col items-start gap-2 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-colors group"
            >
              <c.icon className={`h-4 w-4 ${c.color}`} />
              <div className="w-full">
                <div className="text-lg font-semibold tabular-nums">{c.value}</div>
                <div className="text-[11px] text-muted-foreground">{c.label}</div>
              </div>
            </Link>
          ))}
          <Link
            to="/admin/content"
            className="flex flex-col items-start gap-2 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-colors"
          >
            <FileText className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-sm font-medium">Conteúdo</div>
              <div className="text-[11px] text-muted-foreground">Textos do site</div>
            </div>
          </Link>
          <Link
            to="/admin/testimonials"
            className="flex flex-col items-start gap-2 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-colors"
          >
            <Users className="h-4 w-4 text-emerald-500" />
            <div>
              <div className="text-sm font-medium">Depoimentos</div>
              <div className="text-[11px] text-muted-foreground">Testemunhos</div>
            </div>
          </Link>
          <Link
            to="/admin/social-links"
            className="flex flex-col items-start gap-2 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-colors"
          >
            <Activity className="h-4 w-4 text-pink-500" />
            <div>
              <div className="text-sm font-medium">Redes Sociais</div>
              <div className="text-[11px] text-muted-foreground">Links externos</div>
            </div>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminHome;