import type { Metadata } from 'next';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { SITE_CONFIG } from '@/config/site';
import CopyCommand from '../CopyCommand';
import styles from '../page.module.css';
import pkg from './pacotes.module.css';

export const metadata: Metadata = {
  title: 'Pacotes',
  description: 'O pacote Python apbase, disponível hoje, e o roadmap das próximas versões.',
};

type Status = 'live' | 'next' | 'planned';

type Release = {
  version: string;
  status: Status;
  title: string;
  detail: string;
  code?: string;
};

type Phase = {
  label: string;
  releases: Release[];
};

const STATUS_LABEL: Record<Status, string> = {
  live: 'Disponível',
  next: 'Próxima versão',
  planned: 'Planejado',
};

const SPECS = [
  { term: 'Python', value: '3.12+' },
  { term: 'Licença', value: 'Apache 2.0' },
  { term: 'Núcleo', value: 'Fortran + OpenMP' },
  { term: 'Métodos', value: 'IDW, krigagem ordinária' },
];

const ROADMAP: Phase[] = [
  {
    label: 'Núcleo · v0.1.x',
    releases: [
      {
        version: 'v0.1.1',
        status: 'live',
        title: 'Pipeline em uma chamada',
        detail: 'Filtra outliers, gera a grade e escolhe entre IDW e krigagem ordinária.',
        code: 'result = apbase.create_map(x, y, z)',
      },
      {
        version: 'v0.1.2',
        status: 'next',
        title: 'KNN e krigagem indicatriz',
        detail:
          'Dois novos interpoladores. A krigagem indicatriz estima a probabilidade de passar de um limiar, como o teor crítico de um nutriente.',
        code: 'result.method  # agora pode ser "knn"\n               # ou "indicatriz"',
      },
      {
        version: 'v0.1.3',
        status: 'planned',
        title: 'Exportar e visualizar',
        detail: 'Do resultado direto para um mapa interativo: um HTML para compartilhar ou um leafmap no notebook.',
        code: 'result.to_html("talhao_07.html")\nresult.to_leafmap()',
      },
      {
        version: 'v0.1.4',
        status: 'planned',
        title: 'Gráficos de diagnóstico',
        detail: 'Semivariograma experimental com o modelo ajustado e gráficos da validação cruzada, para auditar o mapa.',
        code: 'result.plot_variogram()\nresult.plot_cross_validation()',
      },
    ],
  },
  {
    label: 'Escala · v0.2 em diante',
    releases: [
      {
        version: 'v0.2.0',
        status: 'planned',
        title: 'Processamento em lote',
        detail: 'Muitos talhões ou safras de uma vez, nos núcleos da máquina ou em workers.',
        code: 'apbase.create_maps(talhoes)',
      },
      {
        version: 'v0.3.0',
        status: 'planned',
        title: 'Dashboard',
        detail: 'Painel para acompanhar mapas, camadas e diagnósticos gerados, sem abrir o notebook.',
      },
    ],
  },
];

export default function PacotesPage() {
  return (
    <div className={styles.page}>
      <section className={styles.productsSection}>
        <div className={styles.container}>
          <div className={styles.solutionBlock}>
            <p className={styles.kicker}>Disponível agora</p>
            <h2>
              O núcleo geoespacial <span className={styles.heroHighlight}>já existe</span> e está pronto para uso.
            </h2>

            <div className={pkg.current}>
              <div className={pkg.currentMain}>
                <span className={`${pkg.pill} ${pkg.live}`}>v0.1.1 · estável</span>
                <h3>apbase</h3>
                <p>
                  Filtragem espacial, grid métrico, variograma, IDW, krigagem ordinária e cross-validation, com
                  kernels nativos Fortran/OpenMP para alto desempenho.
                </p>
                <div className={styles.ctaRow}>
                  <CopyCommand command="pip install apbase" />
                  <Link href={ROUTES.DOCS} className={styles.secondaryCta}>
                    Ver documentação
                  </Link>
                </div>
              </div>

              <dl className={pkg.specs}>
                {SPECS.map((spec) => (
                  <div key={spec.term}>
                    <dt>{spec.term}</dt>
                    <dd>{spec.value}</dd>
                  </div>
                ))}
                <div>
                  <dt>Código</dt>
                  <dd>
                    <Link href={SITE_CONFIG.links.github}>GitHub ↗</Link>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.productsSection}>
        <div className={styles.container}>
          <div className={styles.solutionBlock}>
            <p className={styles.kicker}>Roadmap</p>
            <h2>
              O que chega <span className={styles.heroHighlight}>nas próximas versões</span>.
            </h2>
            <p className={styles.lead}>
              Primeiro o apbase fica mais completo: mais métodos, mais formas de ver o mapa e diagnósticos
              visuais. Depois ganha escala, com processamento em lote e um painel.
            </p>

            <div className={pkg.timeline}>
              {ROADMAP.map((phase) => (
                <div key={phase.label}>
                  <p className={pkg.phase}>{phase.label}</p>
                  <ol className={pkg.releases}>
                    {phase.releases.map((release) => (
                      <li key={release.version} className={`${pkg.release} ${pkg[release.status] ?? ''}`}>
                        <span className={pkg.version}>{release.version}</span>
                        <span className={pkg.rail} aria-hidden="true">
                          <span className={pkg.dot} />
                        </span>
                        <div className={pkg.body}>
                          <div className={pkg.text}>
                            <h3>
                              {release.title}
                              <span className={`${pkg.pill} ${pkg[release.status] ?? ''}`}>
                                {STATUS_LABEL[release.status]}
                              </span>
                            </h3>
                            <p>{release.detail}</p>
                          </div>
                          {release.code && (
                            <pre className={pkg.code}>
                              <code>{release.code}</code>
                            </pre>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>

            <p className={pkg.note}>Versões planejadas podem mudar. Só a v0.1.1 é instalável hoje.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
