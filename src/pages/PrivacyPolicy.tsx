import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import SEO from '@/components/SEO';
const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return <PageLayout>
      <SEO
        title="Política de Privacidade — OptiStrat"
        description="Política de Privacidade da OptiStrat em conformidade com a LGPD (Lei nº 13.709/2018) e o Marco Civil da Internet (Lei nº 12.965/2014)."
      />
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para a Página Inicial
            </Link>

            <h1 className="text-4xl font-bold mb-2 text-foreground">Política de Privacidade</h1>
            <p className="text-sm text-muted-foreground mb-8">
              Documento elaborado em conformidade com a Lei Geral de Proteção de Dados Pessoais — LGPD (Lei nº 13.709/2018), com o Marco Civil da Internet (Lei nº 12.965/2014) e com o Decreto nº 8.771/2016.
            </p>

            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-6"><strong className="text-foreground">Última atualização:</strong> 04 de junho de 2026</p>

              <p className="mb-4">
                A presente Política de Privacidade ("Política") regula o tratamento de dados pessoais e o uso do site, dos sistemas e dos serviços disponibilizados pela <strong className="text-foreground">OptiStrat</strong> ("OptiStrat", "nós" ou "Controladora"), pessoa jurídica de direito privado, doravante denominada simplesmente Empresa, e aplica-se a todo e qualquer usuário, visitante, cliente, prospect, candidato a vaga, parceiro ou terceiro que acesse, navegue, cadastre-se, contrate ou de qualquer forma interaja com nossos canais digitais ("Usuário" ou "Titular").
              </p>
              <p className="mb-4">
                <strong className="text-foreground">Ao acessar este site, preencher formulários, enviar mensagens, currículos, arquivos ou quaisquer informações, o Usuário declara ter lido, compreendido e aceito integralmente os termos desta Política, manifestando consentimento livre, informado e inequívoco, nos termos do art. 7º, inciso I, e art. 8º da LGPD.</strong> Caso não concorde com qualquer disposição aqui prevista, o Usuário deverá abster-se de utilizar este site e seus serviços.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">1. Definições</h2>
              <ul className="list-disc pl-6 mb-4">
                <li><strong className="text-foreground">Dado Pessoal:</strong> informação relacionada a pessoa natural identificada ou identificável (art. 5º, I, LGPD).</li>
                <li><strong className="text-foreground">Tratamento:</strong> toda operação realizada com dados pessoais, conforme art. 5º, X, LGPD.</li>
                <li><strong className="text-foreground">Titular:</strong> pessoa natural a quem se referem os dados pessoais.</li>
                <li><strong className="text-foreground">Controlador:</strong> a OptiStrat, responsável pelas decisões referentes ao tratamento.</li>
                <li><strong className="text-foreground">Operador:</strong> terceiro que realiza tratamento em nome do Controlador.</li>
                <li><strong className="text-foreground">ANPD:</strong> Autoridade Nacional de Proteção de Dados.</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">2. Bases Legais para o Tratamento</h2>
              <p className="mb-4">
                O tratamento de dados pessoais pela OptiStrat observa estritamente as hipóteses legais previstas nos arts. 7º e 11 da LGPD, em especial:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Consentimento do Titular (art. 7º, I);</li>
                <li>Cumprimento de obrigação legal ou regulatória (art. 7º, II);</li>
                <li>Execução de contrato ou de procedimentos preliminares a contrato (art. 7º, V);</li>
                <li>Exercício regular de direitos em processo judicial, administrativo ou arbitral (art. 7º, VI);</li>
                <li>Atendimento ao legítimo interesse do Controlador ou de terceiro (art. 7º, IX);</li>
                <li>Proteção do crédito (art. 7º, X).</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">3. Dados Coletados</h2>
              <p className="mb-4">
                A OptiStrat coleta apenas os dados estritamente necessários ao cumprimento das finalidades informadas, podendo incluir:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong className="text-foreground">Dados cadastrais:</strong> nome completo, CPF/CNPJ, endereço, cidade, estado, CEP, telefone/WhatsApp e e-mail;</li>
                <li><strong className="text-foreground">Dados profissionais:</strong> currículo, formação, experiências, empresa, cargo e demais informações voluntariamente fornecidas em formulários de carreira ou orçamento;</li>
                <li><strong className="text-foreground">Dados de navegação e conexão:</strong> endereço IP, data e hora de acesso, sistema operacional, navegador, páginas visitadas, cookies e identificadores de dispositivo, em cumprimento ao art. 15 do Marco Civil da Internet;</li>
                <li><strong className="text-foreground">Dados de comunicação:</strong> conteúdo de mensagens enviadas por formulários de contato, chat ou e-mail.</li>
              </ul>
              <p className="mb-4">
                <strong className="text-foreground">A OptiStrat não solicita dados pessoais sensíveis</strong> (origem racial, convicção religiosa, opinião política, filiação sindical, dado de saúde, vida sexual, dado genético ou biométrico). Caso o Usuário, por iniciativa própria, inclua tais informações em currículos, mensagens ou arquivos anexos, declara fazê-lo de forma livre e consciente, eximindo a Empresa de qualquer responsabilidade por sua coleta ou tratamento incidental.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">4. Responsabilidade Integral do Usuário pelas Informações Fornecidas</h2>
              <p className="mb-4">
                <strong className="text-foreground">O Usuário é único, exclusivo e integralmente responsável por toda e qualquer informação, dado, documento, currículo, arquivo, imagem, declaração ou conteúdo que voluntariamente disponibilize à OptiStrat</strong>, seja por meio de formulários, e-mail, chat, telefone, redes sociais ou qualquer outro canal.
              </p>
              <p className="mb-4">O Usuário declara, sob as penas da lei (arts. 297, 298 e 299 do Código Penal Brasileiro), que:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>todas as informações prestadas são verdadeiras, exatas, completas e atualizadas;</li>
                <li>possui plena capacidade civil e autorização legal para fornecer tais informações;</li>
                <li>quando fornecer dados de terceiros, obteve o consentimento prévio e expresso destes;</li>
                <li>não viola direitos autorais, de imagem, de personalidade ou quaisquer direitos de terceiros;</li>
                <li>isenta a OptiStrat de qualquer responsabilidade civil, criminal, administrativa ou trabalhista decorrente da falsidade, inexatidão, omissão ou desatualização das informações fornecidas.</li>
              </ul>
              <p className="mb-4">
                Eventuais prejuízos, sanções, demandas judiciais, multas ou indenizações decorrentes de informações incorretas, falsas, fraudulentas ou ilícitas prestadas pelo Usuário serão integralmente suportados pelo próprio Usuário, que desde já se compromete a manter a OptiStrat indene de qualquer reclamação, inclusive arcando com honorários advocatícios e custas processuais.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">5. Finalidades do Tratamento</h2>
              <ul className="list-disc pl-6 mb-4">
                <li>Atendimento a solicitações, dúvidas, orçamentos e propostas comerciais;</li>
                <li>Execução e gestão de contratos firmados com clientes e parceiros;</li>
                <li>Avaliação de currículos e condução de processos seletivos;</li>
                <li>Cumprimento de obrigações legais, regulatórias, fiscais e contratuais;</li>
                <li>Aprimoramento dos serviços, segurança da informação, prevenção a fraudes e auditoria;</li>
                <li>Envio de comunicações institucionais, técnicas, comerciais e de marketing, quando autorizado;</li>
                <li>Defesa em processos judiciais, administrativos e arbitrais.</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">6. Compartilhamento de Dados</h2>
              <p className="mb-4">
                A OptiStrat <strong className="text-foreground">não comercializa</strong> dados pessoais. O compartilhamento ocorrerá apenas com: (i) prestadores de serviços e operadores que atuem em nome da Empresa, mediante cláusulas contratuais de confidencialidade e proteção de dados; (ii) autoridades públicas, judiciais, policiais ou administrativas, em cumprimento de obrigação legal, ordem judicial ou requisição formal, nos termos dos arts. 10, 13 e 15 do Marco Civil da Internet; e (iii) sucessores legais em caso de operações societárias.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">7. Cookies e Tecnologias de Rastreamento</h2>
              <p className="mb-4">
                Utilizamos cookies próprios e de terceiros para garantir o funcionamento do site, mensurar audiência, personalizar a experiência e oferecer conteúdos relevantes. O Usuário poderá, a qualquer momento, gerenciar suas preferências por meio do banner de consentimento ou das configurações do navegador. A desativação de cookies pode comprometer funcionalidades do site, sem que isso gere qualquer responsabilidade para a OptiStrat.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">8. Armazenamento e Guarda de Registros</h2>
              <p className="mb-4">
                Em cumprimento ao art. 15 do Marco Civil da Internet e ao art. 16 da LGPD, os registros de acesso a aplicações de internet serão mantidos pelo prazo mínimo de <strong className="text-foreground">6 (seis) meses</strong>. Demais dados pessoais serão conservados pelo tempo necessário ao atendimento da finalidade, ao cumprimento de obrigação legal, ao exercício regular de direitos ou ao prazo prescricional aplicável.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">9. Segurança da Informação</h2>
              <p className="mb-4">
                A OptiStrat adota medidas técnicas e administrativas razoáveis, compatíveis com o estado da arte, para proteger os dados pessoais contra acessos não autorizados, destruição, perda, alteração, comunicação ou difusão indevida, incluindo criptografia, controle de acesso, segregação de ambientes, monitoramento contínuo e políticas internas de segurança.
              </p>
              <p className="mb-4">
                Não obstante, <strong className="text-foreground">o Usuário reconhece que nenhum sistema é absolutamente inviolável</strong>. A OptiStrat <strong className="text-foreground">não responderá</strong> por incidentes decorrentes de: (i) culpa exclusiva do Usuário ou de terceiros; (ii) caso fortuito ou força maior; (iii) ataques cibernéticos que, apesar das medidas adotadas, não pudessem ser razoavelmente evitados; (iv) uso indevido de credenciais por parte do próprio Usuário; ou (v) falhas em redes, dispositivos e sistemas alheios ao controle da Empresa.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">10. Direitos do Titular (art. 18 da LGPD)</h2>
              <p className="mb-4">O Titular poderá, mediante requerimento formal e devidamente identificado, exercer os seguintes direitos:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Confirmação da existência de tratamento;</li>
                <li>Acesso aos dados;</li>
                <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
                <li>Anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a LGPD;</li>
                <li>Portabilidade dos dados, observados os segredos comercial e industrial;</li>
                <li>Eliminação dos dados tratados com base no consentimento, ressalvadas as hipóteses do art. 16 da LGPD;</li>
                <li>Informação sobre entidades públicas e privadas com as quais houve uso compartilhado;</li>
                <li>Informação sobre a possibilidade de não fornecer consentimento e sobre suas consequências;</li>
                <li>Revogação do consentimento.</li>
              </ul>
              <p className="mb-4">
                A OptiStrat poderá exigir comprovação de identidade do requerente e indeferir, motivadamente, solicitações manifestamente abusivas, ilegais, impossíveis de cumprir ou que conflitem com obrigação legal, regulatória ou contratual.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">11. Limitação de Responsabilidade</h2>
              <p className="mb-4">
                Nos limites máximos permitidos pela legislação vigente, a OptiStrat <strong className="text-foreground">não se responsabiliza</strong> por:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>conteúdos, informações, opiniões ou declarações prestadas pelo Usuário ou por terceiros;</li>
                <li>danos indiretos, lucros cessantes, perda de chance ou danos morais decorrentes do uso ou impossibilidade de uso do site;</li>
                <li>indisponibilidades técnicas, falhas de transmissão, interrupções, suspensões ou eventuais erros de funcionamento;</li>
                <li>conteúdo de sites de terceiros eventualmente acessados por meio de links disponibilizados;</li>
                <li>uso indevido, não autorizado ou fraudulento dos dados pelo próprio Titular ou por terceiros mediante engenharia social, phishing ou compartilhamento voluntário de credenciais.</li>
              </ul>
              <p className="mb-4">
                O Usuário reconhece e concorda expressamente que a responsabilidade da OptiStrat, em qualquer hipótese, observará os princípios da proporcionalidade, razoabilidade e mitigação de danos previstos no ordenamento jurídico brasileiro.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">12. Marco Civil da Internet</h2>
              <p className="mb-4">
                Nos termos do art. 19 da Lei nº 12.965/2014, a OptiStrat <strong className="text-foreground">somente</strong> poderá ser responsabilizada civilmente por conteúdos gerados por terceiros após ordem judicial específica e exequível determinando a sua remoção. A guarda e disponibilização de registros observarão o devido processo legal e a preservação da intimidade, vida privada, honra e imagem.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">13. Transferência Internacional</h2>
              <p className="mb-4">
                Eventual transferência internacional de dados observará as hipóteses do art. 33 da LGPD, restringindo-se a países que ofereçam grau de proteção adequado ou mediante a adoção de garantias específicas, tais como cláusulas contratuais padrão e normas corporativas globais.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">14. Encarregado pelo Tratamento de Dados (DPO)</h2>
              <p className="mb-4">
                Para o exercício de direitos e demais comunicações relacionadas a dados pessoais, o Titular poderá contatar o Encarregado pelo Tratamento de Dados Pessoais da OptiStrat pelo e-mail: <strong className="text-foreground">dpo@optistrat.com.br</strong>.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">15. Alterações desta Política</h2>
              <p className="mb-4">
                Esta Política poderá ser atualizada a qualquer tempo, em razão de alterações legislativas, regulatórias, jurisprudenciais ou da evolução dos serviços. A versão vigente será sempre aquela disponibilizada nesta página, cabendo ao Usuário sua consulta periódica. O uso continuado do site após eventuais alterações implica a aceitação tácita da nova redação.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">16. Foro e Legislação Aplicável</h2>
              <p className="mb-4">
                Esta Política é regida pelas leis da República Federativa do Brasil, em especial a LGPD, o Marco Civil da Internet, o Código de Defesa do Consumidor (quando aplicável) e o Código Civil. Fica eleito o foro da Comarca da sede da OptiStrat para dirimir quaisquer controvérsias decorrentes desta Política, com renúncia expressa a qualquer outro, por mais privilegiado que seja.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">17. Contato</h2>
              <p className="mb-4">
                Dúvidas, solicitações ou reclamações relacionadas a esta Política poderão ser direcionadas para: <strong className="text-foreground">dpo@optistrat.com.br</strong> ou <strong className="text-foreground">contato@optistrat.com.br</strong>.
              </p>

              <p className="mt-8 text-sm italic">
                Este documento foi elaborado de forma a refletir o atual estágio da legislação brasileira de proteção de dados e responsabilidade civil na internet. Não substitui aconselhamento jurídico individualizado para casos concretos.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>;
};
export default PrivacyPolicy;