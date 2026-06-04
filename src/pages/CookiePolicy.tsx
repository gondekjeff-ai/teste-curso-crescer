import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import SEO from '@/components/SEO';

const CookiePolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PageLayout>
      <SEO
        title="Política de Cookies — OptiStrat"
        description="Política de Cookies da OptiStrat. Conheça as tecnologias de rastreamento utilizadas e como gerenciar suas preferências de consentimento."
      />
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para a Página Inicial
            </Link>

            <h1 className="text-4xl font-bold mb-2 text-foreground">Política de Cookies</h1>
            <p className="text-sm text-muted-foreground mb-8">
              Documento elaborado em conformidade com a Lei Geral de Proteção de Dados Pessoais — LGPD (Lei nº 13.709/2018), o Marco Civil da Internet (Lei nº 12.965/2014) e as diretrizes da Autoridade Nacional de Proteção de Dados (ANPD).
            </p>

            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-6"><strong className="text-foreground">Última atualização:</strong> 04 de junho de 2026</p>

              <p className="mb-4">
                A presente Política de Cookies ("Política") é um documento complementar à <Link to="/privacy-policy" className="text-primary hover:underline">Política de Privacidade</Link> da <strong className="text-foreground">OptiStrat</strong> ("OptiStrat", "nós" ou "Controladora") e tem por finalidade informar de forma clara, precisa e adequada quais tecnologias de rastreamento são utilizadas em nossos canais digitais, para quais finalidades, por quanto tempo e como o <strong className="text-foreground">Usuário</strong> ("Titular", "você") pode gerenciar suas preferências de consentimento.
              </p>
              <p className="mb-4">
                <strong className="text-foreground">Ao continuar a navegação em nosso site, o Usuário declara ter lido, compreendido e aceito os termos desta Política de Cookies, manifestando consentimento livre, informado e inequívoco para a utilização das tecnologias aqui descritas, nos termos do art. 7º, inciso I, e art. 8º da LGPD.</strong> Caso não concorde, o Usuário poderá ajustar suas preferências por meio do banner de consentimento ou das configurações de seu navegador, conforme instruído na seção 8 deste documento.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">1. Definições</h2>
              <ul className="list-disc pl-6 mb-4">
                <li><strong className="text-foreground">Cookies:</strong> pequenos arquivos de texto armazenados no dispositivo do Usuário (computador, tablet, smartphone) pelo navegador, que permitem a coleta de informações sobre a navegação, preferências e interações com o site.</li>
                <li><strong className="text-foreground">Pixels (Pixel Tags / Web Beacons):</strong> pequenas imagens ou trechos de código incorporados em páginas ou e-mails, que permitem rastrear visualizações, aberturas e interações, mesmo que o dispositivo não armazene um cookie.</li>
                <li><strong className="text-foreground">LocalStorage e SessionStorage:</strong> APIs do navegador que permitem armazenar dados no dispositivo do Usuário de forma persistente (LocalStorage) ou apenas durante a sessão de navegação (SessionStorage), sem prazo de expiração automática como os cookies.</li>
                <li><strong className="text-foreground">Fingerprinting:</strong> técnicas que identificam um dispositivo por meio de suas características técnicas (sistema operacional, navegador, resolução de tela, fontes instaladas, etc.), sem a necessidade de armazenamento local.</li>
                <li><strong className="text-foreground">Tecnologias Similares:</strong> qualquer outro mecanismo de armazenamento ou recuperação de dados no dispositivo do Usuário, incluindo, mas não se limitando a, IndexedDB, Service Workers, caches de aplicativos e identificadores de publicidade de dispositivos móveis (IDFA, AAID).</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">2. Bases Legais para o Uso de Cookies e Tecnologias Similares</h2>
              <p className="mb-4">
                O uso de cookies e tecnologias similares pela OptiStrat observa as seguintes bases legais, conforme a natureza e a finalidade de cada tecnologia:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong className="text-foreground">Interesse Legítimo (art. 7º, IX, LGPD):</strong> aplicável a cookies estritamente necessários para o funcionamento, segurança e acessibilidade do site, cuja ausência inviabilizaria a prestação do serviço.</li>
                <li><strong className="text-foreground">Consentimento (art. 7º, I, LGPD):</strong> aplicável a cookies e tecnologias de rastreamento utilizados para fins de análise de audiência, personalização de conteúdo, publicidade, remarketing e perfilamento comportamental. O consentimento é obtido por meio do banner de preferências apresentado no primeiro acesso, podendo ser revogado a qualquer tempo.</li>
                <li><strong className="text-foreground">Cumprimento de Obrigação Legal (art. 7º, II, LGPD):</strong> aplicável à guarda de registros de acesso, nos termos do art. 15 do Marco Civil da Internet.</li>
              </ul>
              <p className="mb-4">
                <strong className="text-foreground">A OptiStrat não emprega cookies ou tecnologias de rastreamento para a coleta de dados pessoais sensíveis</strong>, nos termos do art. 5º, II, da LGPD, salvo mediante consentimento específico e destacado, quando estritamente necessário e em conformidade com a regulamentação aplicável.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">3. Tipos de Cookies e Tecnologias Utilizadas</h2>
              <p className="mb-4">
                A OptiStrat utiliza as seguintes categorias de cookies e tecnologias, de acordo com suas finalidades:
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">3.1. Cookies Necessários (Essenciais)</h3>
              <p className="mb-4">
                São indispensáveis ao funcionamento básico do site, permitindo a navegação em suas páginas e o uso de funcionalidades essenciais, como segurança, autenticação de sessões administrativas e controle de tráfego. <strong className="text-foreground">Estes cookies não armazenam informações pessoais identificáveis do Usuário</strong> e não podem ser desativados, pois sua inabilitação comprometeria a disponibilidade ou a segurança do site.
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Exemplos:</strong> cookies de sessão de autenticação (JWT), tokens de segurança CSRF, cookies de preferências de idioma e modo de exibição (claro/escuro), cookies de balanceamento de carga (load balancing).</li>
                <li><strong>Base Legal:</strong> Interesse Legítimo / Cumprimento de Obrigação Legal.</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">3.2. Cookies de Análise e Desempenho (Analytics)</h3>
              <p className="mb-4">
                Utilizados para compreender como os visitantes interagem com o site, quais páginas são mais acessadas, o tempo de permanência, a origem do tráfego e eventuais erros de navegação. As informações coletadas são agregadas e, em regra, anonimizadas, servindo exclusivamente para aprimorar a experiência do usuário e otimizar a performance técnica do site.
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Exemplos:</strong> Google Analytics (gtag.js / GTM), Google Tag Manager, cookies de medição de velocidade de carregamento (Core Web Vitals), heatmaps e mapas de clique.</li>
                <li><strong>Base Legal:</strong> Consentimento do Titular.</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">3.3. Cookies de Marketing e Publicidade</h3>
              <p className="mb-4">
                Empregados para rastrear visitantes em diferentes sites e construir perfis de interesse, viabilizando a exibição de anúncios relevantes e personalizados em parceiros e redes de display. Também são utilizados para medir a eficácia de campanhas publicitárias e limitar a frequência com que um anúncio é exibido.
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Exemplos:</strong> cookies de remarketing do Google Ads, pixels do Meta (Facebook/Instagram), pixels do LinkedIn, cookies de segmentação de audiência (audience targeting).</li>
                <li><strong>Base Legal:</strong> Consentimento do Titular.</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">3.4. Cookies de Funcionalidade</h3>
              <p className="mb-4">
                Permitem que o site memorize escolhas feitas pelo Usuário (como nome de usuário, região, preferências de layout) e ofereçam recursos aprimorados e personalizados. A informação coletada por estes cookies pode ser anonimizada e não rastreia a atividade de navegação em outros sites.
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Exemplos:</strong> armazenamento de preferências de chatbot (Silktide), dados preenchidos previamente em formulários (quando autorizado pelo Usuário), lembretes de newsletter.</li>
                <li><strong>Base Legal:</strong> Consentimento do Titular (quando identificáveis) ou Interesse Legítimo (quando estritamente anonimizados).</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">3.5. Tecnologias Similares</h3>
              <p className="mb-4">
                Além dos cookies, a OptiStrat poderá utilizar:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>localStorage / sessionStorage:</strong> para armazenar preferências de consentimento de cookies, tema visual (claro/escuro) e cache de dados de interface, reduzindo requisições desnecessárias ao servidor.</li>
                <li><strong>Pixels de Rastreamento:</strong> imagens transparentes de 1×1 pixel inseridas em e-mails ou páginas para registrar aberturas, cliques e conversões, sem depender de cookies persistentes.</li>
                <li><strong>Identificadores de Publicidade Móvel:</strong> em aplicativos móveis (se aplicável), poderão ser utilizados IDFA (iOS) ou AAID (Android), sujeitos às políticas de consentimento das respectivas lojas de aplicativos.</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">4. Cookies de Terceiros</h2>
              <p className="mb-4">
                A OptiStrat utiliza serviços de terceiros que podem implantar cookies e tecnologias de rastreamento em nome da Empresa. Abaixo relacionamos os principais parceiros, suas finalidades e os links para suas respectivas políticas de privacidade:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Google LLC (Analytics, Tag Manager, Ads):</strong> análise de audiência, publicidade e remarketing. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Política de Privacidade do Google</a>.</li>
                <li><strong>Meta Platforms, Inc. (Facebook / Instagram):</strong> publicidade e segmentação de audiência. <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Política de Privacidade do Meta</a>.</li>
                <li><strong>LinkedIn Corporation:</strong> publicidade B2B e análise de campanhas. <a href="https://www.linkedin.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Política de Privacidade do LinkedIn</a>.</li>
                <li><strong>Silktide Ltd:</strong> gestão de consentimento de cookies e acessibilidade. <a href="https://silktide.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Política de Privacidade da Silktide</a>.</li>
              </ul>
              <p className="mb-4">
                <strong className="text-foreground">A OptiStrat não controla a operação dos cookies de terceiros</strong> e não se responsabiliza pelo tratamento de dados realizado por tais parceiros. Recomendamos a consulta direta às políticas de privacidade de cada provedor para maiores esclarecimentos.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">5. Prazo de Retenção (Validade dos Cookies)</h2>
              <p className="mb-4">
                Os cookies e dados armazenados em localStorage obedecem aos seguintes prazos de retenção, conforme sua categoria:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Cookies de Sessão:</strong> excluídos automaticamente ao fechar o navegador.</li>
                <li><strong>Cookies Persistentes:</strong> podem permanecer no dispositivo pelo prazo de <strong className="text-foreground">até 24 (vinte e quatro) meses</strong>, ou conforme configurado pelo parceiro de terceiros (Google Analytics: até 26 meses; Meta: até 180 dias, renováveis). O Usuário poderá removê-los antecipadamente por meio das configurações do navegador.</li>
                <li><strong>localStorage (Consentimento):</strong> mantido indefinidamente até que o Usuário limpe os dados de navegação ou revogue o consentimento por meio do banner de preferências.</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">6. Transferência Internacional de Dados via Cookies</h2>
              <p className="mb-4">
                Alguns cookies de terceiros (Google, Meta, LinkedIn) podem resultar na transferência de dados para servidores localizados fora do território nacional, em especial nos Estados Unidos da América. Tais transferências observam as hipóteses do art. 33 da LGPD e as decisões de adequação da ANPD, quando aplicáveis, ou se fundamentam em cláusulas contratuais padrão (SCCs) e garantias de conformidade com a legislação brasileira.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">7. Consequências da Recusa ou Desativação de Cookies</h2>
              <p className="mb-4">
                A recusa de cookies necessários pode inviabilizar o acesso a determinadas funcionalidades ou áreas do site. A desativação de cookies de análise ou marketing não impedirá o acesso ao site, mas poderá:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>reduzir a relevância das recomendações e conteúdos exibidos;</li>
                <li>impossibilitar a mensuração de audiência e a otimização contínua da experiência de navegação;</li>
                <li>exigir o reenvio de informações previamente fornecidas em formulários;</li>
                <li>resultar na exibição de anúncios genéricos em vez de publicidade segmentada.</li>
              </ul>
              <p className="mb-4">
                <strong className="text-foreground">A OptiStrat não se responsabiliza por eventuais limitações de funcionalidade ou degradação da experiência de navegação decorrentes da desativação de cookies pelo Usuário.</strong>
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">8. Como Gerenciar Preferências de Consentimento</h2>
              <p className="mb-4">
                O Usuário dispõe de diversos mecanismos para gerenciar, revisar e revogar o consentimento para o uso de cookies e tecnologias similares:
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">8.1. Banner de Consentimento da OptiStrat</h3>
              <p className="mb-4">
                Ao acessar o site, o Usuário é apresentado a um banner de cookies que permite:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Aceitar Todos:</strong> consentir com todas as categorias de cookies e tecnologias (necessários, análise, marketing e funcionalidade).</li>
                <li><strong>Aceitar Apenas Necessários:</strong> permitir exclusivamente os cookies essenciais ao funcionamento do site, recusando analytics e marketing.</li>
                <li><strong>Gerenciar Preferências:</strong> acessar painel granular para ativar ou desativar individualmente as categorias de cookies de análise e marketing, mantendo sempre os necessários ativos.</li>
              </ul>
              <p className="mb-4">
                O banner pode ser reaberto a qualquer momento para revisão de preferências. <strong className="text-foreground">A revogação do consentimento não afeta a licitude do tratamento realizado com base no consentimento anterior à sua revogação</strong>, nos termos do art. 9º, parágrafo único, da LGPD.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">8.2. Configurações do Navegador</h3>
              <p className="mb-4">
                A maioria dos navegadores permite visualizar, gerenciar, bloquear e excluir cookies. As instruções para os principais navegadores encontram-se nos links abaixo:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Chrome</a></li>
                <li><a href="https://support.mozilla.org/pt-BR/kb/gerencie-configuracoes-de-armazenamento-local" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mozilla Firefox</a></li>
                <li><a href="https://support.microsoft.com/pt-br/microsoft-edge/excluir-cookies-no-microsoft-edge-63947406-40ac-c3b8-7b51-fa..." target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Microsoft Edge</a></li>
                <li><a href="https://support.apple.com/pt-br/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Apple Safari (macOS)</a></li>
                <li><a href="https://support.apple.com/pt-br/HT201265" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Apple Safari (iOS)</a></li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">8.3. Ferramentas de Opt-Out de Terceiros</h3>
              <p className="mb-4">
                O Usuário poderá, ainda, recusar cookies específicos de parceiros por meio das seguintes ferramentas oficiais:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Analytics Opt-Out</a></li>
                <li><a href="https://adssettings.google.com/authenticated" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Ads Settings</a></li>
                <li><a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Digital Advertising Alliance (DAA)</a></li>
                <li><a href="https://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Your Online Choices (IAB Europe)</a></li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">8.4. Limpeza de localStorage</h3>
              <p className="mb-4">
                Para remover dados armazenados via localStorage ou sessionStorage, o Usuário deverá limpar os dados de navegação (cache, cookies e dados do site) nas configurações de seu navegador. A remoção desses dados poderá redefinir preferências de tema, idioma e consentimento, exigindo nova configuração no próximo acesso.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">9. Proteção de Dados e Segurança</h2>
              <p className="mb-4">
                Os dados coletados por meio de cookies e tecnologias similares são tratados com o mesmo rigor técnico e administrativo aplicado aos demais dados pessoais, conforme descrito na <Link to="/privacy-policy" className="text-primary hover:underline">Política de Privacidade</Link> da OptiStrat. Adotamos criptografia em trânsito (TLS 1.2+), controle de acesso, anonimização de dados de analytics e auditoria contínua de segurança.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">10. Direitos do Titular sob a LGPD</h2>
              <p className="mb-4">
                O Titular poderá exercer perante a OptiStrat todos os direitos previstos no art. 18 da LGPD, incluindo confirmação de tratamento, acesso, correção, anonimização, bloqueio, eliminação e portabilidade dos dados coletados via cookies. Para tanto, deverá encaminhar requerimento formal ao Encarregado de Dados (DPO), conforme seção 12.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">11. Alterações desta Política de Cookies</h2>
              <p className="mb-4">
                A presente Política poderá ser atualizada periodicamente para refletir mudanças nas tecnologias utilizadas, na legislação aplicável ou nas práticas da Empresa. A versão vigente será sempre disponibilizada nesta página, com a data da última atualização indicada no cabeçalho. O uso continuado do site após alterações implica aceitação tácita dos novos termos.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">12. Encarregado pelo Tratamento de Dados (DPO) e Contato</h2>
              <p className="mb-4">
                Para exercício de direitos, dúvidas, reclamações ou solicitações relacionadas a cookies e tecnologias de rastreamento, o Titular poderá contatar o Encarregado pelo Tratamento de Dados Pessoais (DPO) da OptiStrat:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>E-mail DPO:</strong> <a href="mailto:dpo@optistrat.com.br" className="text-primary hover:underline">dpo@optistrat.com.br</a></li>
                <li><strong>E-mail Geral:</strong> <a href="mailto:contato@optistrat.com.br" className="text-primary hover:underline">contato@optistrat.com.br</a></li>
              </ul>
              <p className="mb-4">
                A OptiStrat compromete-se a responder ao Titular no prazo máximo de <strong className="text-foreground">15 (quinze) dias</strong>, nos termos do art. 19, §2º, da LGPD, podendo prorrogar o prazo por mais 10 (dez) dias mediante comunicação fundamentada, se necessário.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">13. Foro e Legislação Aplicável</h2>
              <p className="mb-4">
                Esta Política de Cookies é regida pelas leis da República Federativa do Brasil, em especial a LGPD, o Marco Civil da Internet, o Código Civil e o Código de Defesa do Consumidor. Fica eleito o foro da Comarca da sede da OptiStrat para dirimir eventuais controvérsias, com renúncia expressa a qualquer outro, por mais privilegiado que seja.
              </p>

              <p className="mt-8 text-sm italic">
                Este documento foi elaborado com base na legislação brasileira vigente e nas melhores práticas de governança de dados. Não se destina a substituir aconselhamento jurídico especializado para situações concretas.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default CookiePolicy;
