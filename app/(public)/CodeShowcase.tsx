import Link from "next/link";
import { Highlight, themes } from "prism-react-renderer";
import { ROUTES } from "@/constants/routes";
import styles from "./CodeShowcase.module.css";

type Lang = {
  id: string;
  name: string;
  status: "stable" | "soon";
};

const LANGS: Lang[] = [
  { id: "python", name: "Python", status: "stable" },
  { id: "react", name: "React", status: "soon" },
  { id: "go", name: "Go", status: "soon" },
  { id: "rust", name: "Rust", status: "soon" },
];

const PYTHON_CODE = `import apbase

# Paralelismo OpenMP: defina uma vez por processo
apbase.config["n_threads"] = 4

# Filtra, gera a grade e escolhe o melhor modelo
result = apbase.create_map(x, y, z, resolution=10.0)

result.method   # modelo escolhido pela validação
result.z        # mapa pronto, dentro do contorno`;

export default function CodeShowcase() {
  return (
    <section id="codigo" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.kicker}>Use APbase com</p>
          <h2 className={styles.title}>Python</h2>
          <p className={styles.subtitle}>
            Uma chamada leva seus pontos de campo a um mapa de precisão. O mesmo
            núcleo chega às outras linguagens em seguida.
          </p>

          <div>
            <p className={styles.roadmapLabel}>Roteiro de linguagens</p>
            <ol className={styles.roadmap}>
              {LANGS.map((lang) => {
                const stable = lang.status === "stable";
                return (
                  <li key={lang.id} className={styles.roadmapItem}>
                    <span
                      aria-hidden="true"
                      className={`${styles.roadmapDot} ${stable ? styles.roadmapDotActive : ""}`}
                    />
                    <span className={styles.roadmapName}>{lang.name}</span>
                    <span className={`${styles.roadmapStatus} ${stable ? styles.roadmapStatusActive : ""}`}>
                      {stable ? "Disponível agora" : "Próximo passo"}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardAccent} aria-hidden="true" />

          <div className={styles.cardHeader}>
            <span className={styles.cardMark} aria-hidden="true">
              Py
            </span>
            <span className={styles.cardFile}>main.py</span>
          </div>

          <div className={styles.codeWrap}>
            <Highlight
              theme={themes.github}
              code={PYTHON_CODE}
              language="python"
            >
              {({ tokens, getLineProps, getTokenProps }) => (
                <pre className={styles.pre}>
                  {tokens.map((line, i) => (
                    <div key={i} {...getLineProps({ line })}>
                      {line.map((token, key) => (
                        <span key={key} {...getTokenProps({ token })} />
                      ))}
                    </div>
                  ))}
                </pre>
              )}
            </Highlight>

            <Link href={ROUTES.DOCS} className={styles.docsButton}>
              Ler docs de Python <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
