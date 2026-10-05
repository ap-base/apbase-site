import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import CodeShowcase from './CodeShowcase';
import CopyCommand from './CopyCommand';
import styles from './page.module.css';

const HERO_VALUES = [
  { title: 'Inteligente', text: 'Remove outliers locais e escolhe o melhor modelo matemático sozinho.' },
  { title: 'Alta performance', text: 'Núcleo em Fortran com OpenMP, em todos os núcleos.' },
  { title: 'Escalável', text: 'Do notebook a plugins, SIGs, APIs e clusters na nuvem.' },
];

const MODEL_ERRORS = [
  { name: 'Modelo A', width: 78, chosen: false },
  { name: 'Modelo B', width: 46, chosen: true },
  { name: 'Modelo C', width: 63, chosen: false },
];

const PIPELINE_STEPS = ['Filtra outliers', 'Gera contorno e grade', 'Escolhe o modelo', 'Entrega o mapa recortado'];

const ENGINE_ITEMS = [
  { title: 'Fortran + OpenMP', text: 'Kernels nativos em todos os núcleos, já incluídos no pacote.' },
  {
    title: 'Leve e sem dependências',
    text: 'Recebe coordenadas e valores e devolve o mapa. Sem framework web nem banco de dados.',
  },
  { title: 'Determinístico', text: 'Mesma entrada, mesmo mapa, sempre.' },
];

const SCALE_STEPS = [
  { name: 'Notebook', detail: '' },
  { name: 'Plugins e SIGs', detail: 'Integração em softwares GIS' },
  { name: 'API', detail: '' },
  { name: 'Workers e filas', detail: '' },
  { name: 'Containers', detail: 'Kubernetes, Cloud Run, ECS' },
  { name: 'Agentes de IA', detail: 'Servidores MCP' },
];

const stepNumber = (index: number) => String(index + 1).padStart(2, '0');

export default function Home() {
  return (
    <div className={styles.page}>
      <section id="hero" className={`${styles.section} ${styles.hero}`}>
        <div className={styles.heroDots} aria-hidden="true" />
        <div className={styles.container}>
          <p className={styles.kicker}>Processamento geoespacial para agricultura de precisão</p>
          <h1>
            Dados de campo viram <span className={styles.heroHighlight}>mapas de precisão</span>. Em uma
            chamada.
          </h1>
          <p className={styles.lead}>Confiáveis e sem ajuste manual. Prontos para APIs, cloud e agentes de IA.</p>

          <div className={styles.ctaRow}>
            <CopyCommand command="pip install apbase" />
            <Link href={ROUTES.DOCS} className={styles.secondaryCta}>
              Ver documentação
            </Link>
          </div>

          <ol className={styles.heroValues}>
            {HERO_VALUES.map((value, i) => (
              <li key={value.title}>
                <strong>
                  <span className={styles.stepNum}>{stepNumber(i)}</span> {value.title}
                </strong>
                <p>{value.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="inteligente" className={styles.section}>
        <div className={styles.container}>
          <header className={styles.sectionHeader}>
            <p className={styles.kicker}>Inteligente</p>
            <h2>
              Dados de campo brutos entram. <span className={styles.heroHighlight}>Mapa de precisão</span> sai.
            </h2>
            <p className={styles.lead}>
              Monitor de colheita, amostras de solo e grades de sensores chegam irregulares e com ruído. O
              APbase decide sozinho o que limpar e qual modelo usar.
            </p>
          </header>

          <div className={styles.pillars}>
            <article className={styles.pillar}>
              <div className={styles.pillarBody}>
                <p className={styles.pillarTag}>Remoção automática de outliers</p>
                <h3>Limpa dados densos sem regra manual</h3>
                <p>
                  Cada ponto é comparado com a sua vizinhança, o jeito certo de filtrar monitor de colheita e
                  sensores de alta densidade.
                </p>
              </div>
              <p className={`${styles.pillarFoot} ${styles.pillarFootText}`}>
                Remove dados inválidos, outliers globais e outliers espaciais locais.
              </p>
            </article>

            <article className={styles.pillar}>
              <div className={styles.pillarBody}>
                <p className={styles.pillarTag}>Melhor modelo matemático</p>
                <h3>Escolhe a interpolação de menor erro</h3>
                <p>
                  Compara modelos por validação cruzada e usa o que erra menos nos seus dados. Sem ajuste
                  manual.
                </p>
              </div>
              <figure className={`${styles.pillarFoot} ${styles.errorChart}`}>
                <figcaption className={styles.errorChartHead}>
                  <span>Erro na validação cruzada</span>
                  <span className={styles.errorChartNote}>Ilustrativo</span>
                </figcaption>
                {MODEL_ERRORS.map((model) => (
                  <div key={model.name} className={model.chosen ? `${styles.errorRow} ${styles.errorRowChosen}` : styles.errorRow}>
                    <span>{model.name}</span>
                    <span className={styles.errorTrack}>
                      <span className={styles.errorBar} style={{ width: `${model.width}%` }} />
                    </span>
                    <span className={styles.errorTag}>{model.chosen && 'Escolhido'}</span>
                  </div>
                ))}
              </figure>
            </article>
          </div>

          <ol className={styles.pipeline} aria-label="Etapas do processamento">
            {PIPELINE_STEPS.map((step, i) => (
              <li key={step}>
                <span className={styles.stepNum}>{stepNumber(i)}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <CodeShowcase />

      <section id="performance" className={styles.section}>
        <div className={styles.container}>
          <header className={styles.sectionHeader}>
            <p className={styles.kicker}>Alta performance e escalável</p>
            <h2>
              Um motor rápido que <span className={styles.heroHighlight}>escala</span> com a sua aplicação
            </h2>
          </header>

          <div className={styles.engineLayout}>
            <div>
              <p className={styles.engineLabel}>O motor</p>
              <ol className={styles.engineList}>
                {ENGINE_ITEMS.map((item, i) => (
                  <li key={item.title} className={styles.engineItem}>
                    <span className={styles.stepNum}>{stepNumber(i)}</span>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className={styles.scale}>
              <ol className={styles.scaleSteps} aria-label="Onde o APbase roda">
                {SCALE_STEPS.map((step) => (
                  <li key={step.name} className={styles.scaleStep}>
                    <span className={styles.scaleStepName}>{step.name}</span>
                    {step.detail && <span className={styles.scaleStepDetail}>{step.detail}</span>}
                  </li>
                ))}
              </ol>
              <p className={styles.scaleCaption}>Mesmo pipeline, mesmo resultado em todos os níveis</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
