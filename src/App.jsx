import { useState, useEffect, useRef, useCallback } from "react";
import {
  Menu, X, Container, Server, GitBranch, Terminal, Cpu, ShieldAlert,
  KeyRound, Eye, GitCommit, RotateCcw, Sparkles, HelpCircle, Users,
  Settings2, Boxes, FileCode2, CheckCircle2, ArrowRight, Zap, Bot,
  ChevronRight, Rocket, ExternalLink,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Datos                                                               */
/* ------------------------------------------------------------------ */

const TEAM = [
  "Nicolás Enrique Granada Fernández",
  "Juan Camilo López Quintana",
  "Angie Melissa Ocoro Hurtado",
  "Brayan Camilo Urrea Jurado",
];

const SECTIONS = [
  { id: "hero", label: "Inicio" },
  { id: "despliegue", label: "Despliegue tradicional" },
  { id: "genai", label: "IA generativa" },
  { id: "vercel", label: "Vercel AI" },
  { id: "deployai", label: "Deploy.ai" },
  { id: "comparativa", label: "Comparativa" },
  { id: "estrategias", label: "Estrategias asistidas" },
  { id: "riesgos", label: "Riesgos y seguridad" },
  { id: "prompts", label: "Prompts efectivos" },
  { id: "demo", label: "La demo" },
  { id: "simulacion", label: "Simulación en vivo" },
  { id: "estado", label: "Estado en vivo" },
  { id: "preguntas", label: "Preguntas" },
];

const GENAI_CARDS = [
  { icon: Container, title: "Dockerfiles", text: "Contenedores optimizados para tu stack, sin partir de una plantilla genérica." },
  { icon: Server, title: "Infraestructura", text: "Configuraciones de servidores, redes y variables de entorno listas para producción." },
  { icon: GitBranch, title: "Pipelines CI/CD", text: "Flujos de integración y despliegue continuo, paso a paso, según tu repositorio." },
  { icon: Terminal, title: "Scripts de deploy", text: "Comandos y automatizaciones para subir la app sin intervención manual." },
  { icon: Cpu, title: "Recomendación de plataforma", text: "Sugiere dónde desplegar según el tipo de proyecto y su carga esperada." },
];

const COMPARISON_ROWS = [
  {
    label: "Enfoque principal",
    vercel: "Hosting y despliegue de apps web con IA integrada",
    deployai: "Plataforma de agentes de IA empresariales",
    clasicas: "Hosting genérico para cualquier tipo de aplicación",
  },
  {
    label: "Configuración manual",
    vercel: "Mínima — detecta el framework automáticamente",
    deployai: "Media — se ajustan guardrails y modelos",
    clasicas: "Alta — pipelines e infraestructura a mano",
  },
  {
    label: "Infraestructura generada por IA",
    vercel: "Sí, dentro del flujo de build y despliegue",
    deployai: "Sí, mediante Code Canvas para agentes",
    clasicas: "No, salvo integraciones externas",
  },
  {
    label: "Ideal para",
    vercel: "Apps web y frontends con IA conversacional",
    deployai: "Automatización y agentes IA a nivel empresarial",
    clasicas: "Proyectos con requisitos de infraestructura muy específicos",
  },
];

const STRATEGIES = [
  {
    icon: Container,
    title: "Generación de Dockerfile / docker-compose",
    summary: "La IA arma el contenedor a partir de tu package.json o requirements.txt.",
    example:
`FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/server.js"]`,
  },
  {
    icon: GitBranch,
    title: "Generación de pipelines CI/CD",
    summary: "Workflows de GitHub Actions escritos a partir de una descripción en lenguaje natural.",
    example:
`name: deploy
on:
  push:
    branches: [main]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
      - run: npm run deploy`,
  },
  {
    icon: Boxes,
    title: "Infraestructura como código (Terraform)",
    summary: "Recursos cloud descritos y versionados, generados a partir del caso de uso.",
    example:
`resource "aws_s3_bucket" "app" {
  bucket = "mi-app-produccion"
}

resource "aws_cloudfront_distribution" "cdn" {
  origin {
    domain_name = aws_s3_bucket.app.bucket_regional_domain_name
  }
  enabled = true
}`,
  },
  {
    icon: Settings2,
    title: "Detección automática de framework",
    summary: "Identifica el stack y ajusta los build settings sin intervención humana.",
    example:
`Detectado: package.json → "next": "14.2.0"
Framework: Next.js
Build command:  next build
Output dir:      .next
Install command: npm install`,
  },
];

const RISKS = [
  "No exponer API keys ni secretos dentro de los prompts",
  "Revisar el código y la infraestructura generada antes de aplicarla",
  "Mantener control de versiones de cada despliegue",
  "Tener siempre un plan de rollback",
];

const PROMPT_EXAMPLE =
`Genera un Dockerfile de producción para una app Node.js
(Express, package.json con "start": "node server.js").

Requisitos:
- Usa imagen base node:20-alpine y multi-stage build
  (deps → build → runtime).
- Instala solo dependencias de producción en la imagen final.
- Ejecuta el proceso con un usuario no-root.
- Expón el puerto 3000 y define un HEALTHCHECK.
- Optimiza el orden de las capas para aprovechar la caché de Docker.

Entrega solo el Dockerfile, sin explicaciones adicionales.`;

const DEPLOY_STEPS = [
  "Instalando dependencias...",
  "Compilando build...",
  "Generando configuración de infraestructura...",
  "Subiendo a producción...",
  "✅ Deploy exitoso",
];

/* ------------------------------------------------------------------ */
/* Componentes de apoyo                                                */
/* ------------------------------------------------------------------ */

function Reveal({ id, className = "", children, setRef, visible }) {
  return (
    <section
      id={id}
      ref={(el) => setRef(id, el)}
      className={`reveal ${visible ? "reveal-visible" : ""} ${className}`}
    >
      {children}
    </section>
  );
}

function Eyebrow({ children }) {
  return <p className="section-kicker">{children}</p>;
}

function CodeBlock({ children, filename }) {
  return (
    <div className="code-block">
      {filename && <div className="code-block-head">{filename}</div>}
      <pre className="code-block-body">
        <code>{children}</code>
      </pre>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* App                                                                 */
/* ------------------------------------------------------------------ */

export default function App() {
  const [active, setActive] = useState("hero");
  const [visible, setVisible] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [openStrategy, setOpenStrategy] = useState(null);
  const [deployLines, setDeployLines] = useState([]);
  const [deploying, setDeploying] = useState(false);
  const [deployDone, setDeployDone] = useState(false);
  const [counter, setCounter] = useState(47);

  const refs = useRef({});
  const setRef = useCallback((id, el) => {
    if (el) refs.current[id] = el;
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible((v) => (v[entry.target.id] ? v : { ...v, [entry.target.id]: true }));
            if (entry.intersectionRatio > 0.45) setActive(entry.target.id);
          }
        });
      },
      { threshold: [0.15, 0.45, 0.7] }
    );
    Object.values(refs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const goTo = (id) => {
    refs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  };

  const runDeploy = () => {
    if (deploying) return;
    setDeploying(true);
    setDeployDone(false);
    setDeployLines([]);
    DEPLOY_STEPS.forEach((line, i) => {
      setTimeout(() => {
        setDeployLines((prev) => [...prev, line]);
        if (i === DEPLOY_STEPS.length - 1) {
          setTimeout(() => {
            setDeploying(false);
            setDeployDone(true);
          }, 350);
        }
      }, (i + 1) * 850);
    });
  };

  const activeIndex = SECTIONS.findIndex((s) => s.id === active);

  return (
    <div className="root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        :root {
          --bg: #0A0E14;
          --panel: #10151F;
          --panel-2: #141B27;
          --border: #232B39;
          --border-soft: #1A2029;
          --text: #E8EAF0;
          --text-dim: #8E97A8;
          --accent: #8B6BFF;
          --accent-soft: rgba(139, 107, 255, 0.14);
          --accent-line: rgba(139, 107, 255, 0.35);
          --success: #34D399;
          --warning: #F0B24B;
        }

        .root {
          background: var(--bg);
          color: var(--text);
          font-family: 'Inter', system-ui, sans-serif;
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
        }
        .font-display { font-family: 'Space Grotesk', 'Inter', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }

        html, body { scroll-behavior: smooth; }

        .section-kicker {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          letter-spacing: 0.03em;
          color: var(--accent);
          margin-bottom: 0.9rem;
        }

        .reveal {
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .reveal-visible { opacity: 1; transform: translateY(0); }
        @media (prefers-reduced-motion: reduce) {
          .reveal { opacity: 1; transform: none; transition: none; }
        }

        .card {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 14px;
        }

        .code-block {
          background: #0D1219;
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
        }
        .code-block-head {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          color: var(--text-dim);
          padding: 0.55rem 1rem;
          border-bottom: 1px solid var(--border-soft);
          background: #0A0E15;
        }
        .code-block-body {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.82rem;
          line-height: 1.65;
          color: #C9D1E0;
          padding: 1.1rem 1.2rem;
          overflow-x: auto;
          white-space: pre;
        }

        /* Riel de pipeline (nav) */
        .rail-line {
          position: absolute;
          left: 5px;
          top: 6px;
          bottom: 6px;
          width: 1px;
          background: var(--border);
        }
        .rail-dot {
          width: 11px; height: 11px; border-radius: 999px;
          border: 2px solid var(--border);
          background: var(--bg);
          flex-shrink: 0;
          transition: border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
        }
        .rail-dot.done { border-color: var(--accent); background: var(--accent); }
        .rail-dot.active {
          border-color: var(--accent);
          box-shadow: 0 0 0 4px var(--accent-soft);
        }
        .rail-item { transition: color 0.2s ease; }
        .rail-item:hover .rail-label { color: var(--text); }
        .rail-label { color: var(--text-dim); transition: color 0.2s ease; }
        .rail-label.active { color: var(--text); }

        a, button { font-family: inherit; }
        button:focus-visible, a:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }

        ::selection { background: var(--accent-soft); color: var(--text); }

        @keyframes confetti-fall {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(90px) rotate(180deg); opacity: 0; }
        }
        .confetti-piece {
          position: absolute;
          top: 0;
          width: 6px;
          height: 10px;
          border-radius: 2px;
          animation: confetti-fall 1.1s ease-in forwards;
        }
      `}</style>

      {/* -------------------------------------------------- */}
      {/* Navegación fija — desktop: riel lateral             */}
      {/* -------------------------------------------------- */}
      <nav
        className="hidden md:flex fixed left-0 top-0 h-full w-64 flex-col justify-center px-8 z-40"
        style={{ borderRight: "1px solid var(--border-soft)" }}
        aria-label="Navegación de secciones"
      >
        <div className="relative">
          <div className="rail-line" />
          <ul className="flex flex-col gap-5">
            {SECTIONS.map((s, i) => {
              const isActive = s.id === active;
              const isDone = i < activeIndex;
              return (
                <li key={s.id}>
                  <button
                    onClick={() => goTo(s.id)}
                    className="rail-item flex items-center gap-3 text-left w-full"
                  >
                    <span className={`rail-dot ${isActive ? "active" : ""} ${isDone ? "done" : ""}`} />
                    <span className={`rail-label text-sm ${isActive ? "active" : ""}`}>
                      {s.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* -------------------------------------------------- */}
      {/* Navegación fija — mobile: barra superior            */}
      {/* -------------------------------------------------- */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3"
        style={{ background: "rgba(10,14,20,0.92)", borderBottom: "1px solid var(--border-soft)", backdropFilter: "blur(6px)" }}
      >
        <span className="font-display text-sm" style={{ color: "var(--text)" }}>
          {String(activeIndex + 1).padStart(2, "0")} / {SECTIONS.length} — {SECTIONS[activeIndex]?.label}
        </span>
        <button onClick={() => setMenuOpen((o) => !o)} aria-label="Abrir menú">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {menuOpen && (
        <div
          className="md:hidden fixed top-[52px] left-0 right-0 z-30 px-4 py-4 max-h-[70vh] overflow-y-auto"
          style={{ background: "var(--panel)", borderBottom: "1px solid var(--border-soft)" }}
        >
          <ul className="flex flex-col gap-1">
            {SECTIONS.map((s, i) => (
              <li key={s.id}>
                <button
                  onClick={() => goTo(s.id)}
                  className="flex items-center gap-3 w-full text-left py-2.5 px-2 rounded-lg"
                  style={{ background: s.id === active ? "var(--accent-soft)" : "transparent" }}
                >
                  <span className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm" style={{ color: "var(--text)" }}>{s.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* -------------------------------------------------- */}
      {/* Contenido                                           */}
      {/* -------------------------------------------------- */}
      <main className="md:pl-64 pt-14 md:pt-0">

        {/* 1. HERO */}
        <Reveal id="hero" setRef={setRef} visible={visible.hero}
          className="min-h-screen flex flex-col justify-center px-6 md:px-16 py-24">
          <Eyebrow>despliegue · ia generativa</Eyebrow>
          <h1 className="font-display font-semibold leading-[1.05] text-4xl sm:text-5xl md:text-7xl max-w-4xl">
            De la HU al despliegue, todo con IA
          </h1>
          <p className="mt-8 text-lg md:text-2xl max-w-2xl" style={{ color: "var(--text-dim)" }}>
            Cómo la inteligencia artificial generativa transforma la última milla del desarrollo de software.
          </p>
          <div className="mt-14 flex flex-wrap gap-x-8 gap-y-2">
            {TEAM.map((name) => (
              <span key={name} className="text-sm md:text-base" style={{ color: "var(--text-dim)" }}>
                {name}
              </span>
            ))}
          </div>
        </Reveal>

        {/* 2. QUÉ ES EL DESPLIEGUE */}
        <Reveal id="despliegue" setRef={setRef} visible={visible.despliegue}
          className="min-h-screen flex flex-col justify-center px-6 md:px-16 py-24">
          <Eyebrow>fundamentos</Eyebrow>
          <h2 className="font-display font-semibold text-3xl md:text-5xl max-w-3xl mb-6">
            ¿Qué es el despliegue de software?
          </h2>
          <p className="text-base md:text-xl max-w-3xl mb-14" style={{ color: "var(--text-dim)" }}>
            Es el proceso de llevar el código desde el repositorio hasta un entorno donde los usuarios lo
            pueden usar: compilar el proyecto, ejecutar pruebas y publicarlo, ya sea a mano o mediante
            pipelines de CI/CD configurados paso a paso por un equipo de infraestructura.
          </p>

          <div className="grid md:grid-cols-[1fr_auto_1fr] gap-8 md:gap-6 items-stretch max-w-5xl">
            <div className="card p-8">
              <p className="font-mono text-xs mb-4" style={{ color: "var(--text-dim)" }}>antes</p>
              <ul className="space-y-3 text-sm md:text-base" style={{ color: "var(--text)" }}>
                <li>Build manual o semi-automatizado</li>
                <li>Pipelines configurados a mano, línea por línea</li>
                <li>Infraestructura definida por un ingeniero de DevOps</li>
                <li>Deploy como paso final, separado del desarrollo</li>
              </ul>
            </div>
            <div className="flex md:flex-col items-center justify-center">
              <ArrowRight className="md:hidden" size={28} style={{ color: "var(--accent)" }} />
              <ArrowRight className="hidden md:block rotate-90" size={28} style={{ color: "var(--accent)" }} />
            </div>
            <div className="card p-8 flex flex-col items-center justify-center text-center" style={{ borderStyle: "dashed" }}>
              <p className="font-mono text-xs mb-4" style={{ color: "var(--text-dim)" }}>ahora</p>
              <span className="font-display text-4xl" style={{ color: "var(--accent)" }}>?</span>
              <p className="text-sm mt-3" style={{ color: "var(--text-dim)" }}>Sigue leyendo</p>
            </div>
          </div>
        </Reveal>

        {/* 3. DESPLEGAR CON GENERATIVE AI */}
        <Reveal id="genai" setRef={setRef} visible={visible.genai}
          className="min-h-screen flex flex-col justify-center px-6 md:px-16 py-24">
          <Eyebrow>el cambio</Eyebrow>
          <h2 className="font-display font-semibold text-3xl md:text-5xl max-w-3xl mb-6">
            Desplegar con IA generativa
          </h2>
          <p className="text-base md:text-xl max-w-3xl mb-14" style={{ color: "var(--text-dim)" }}>
            La IA generativa ya no se limita a escribir código de aplicación: hoy también genera todo lo
            que rodea al despliegue.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {GENAI_CARDS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="card p-6 flex flex-col gap-4">
                <Icon size={22} style={{ color: "var(--accent)" }} />
                <h3 className="font-display text-base font-semibold">{title}</h3>
                <p className="text-sm" style={{ color: "var(--text-dim)" }}>{text}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* 4. VERCEL AI */}
        <Reveal id="vercel" setRef={setRef} visible={visible.vercel}
          className="min-h-screen flex flex-col justify-center px-6 md:px-16 py-24">
          <Eyebrow>herramienta</Eyebrow>
          <h2 className="font-display font-semibold text-3xl md:text-5xl max-w-3xl mb-6">Vercel AI</h2>
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl items-start">
            <p className="text-base md:text-xl" style={{ color: "var(--text-dim)" }}>
              Es el ecosistema de Vercel para construir y desplegar aplicaciones con IA. Incluye el
              <strong style={{ color: "var(--text)" }}> AI SDK</strong>, que permite integrar modelos de
              lenguaje con streaming de respuestas, y un despliegue automático conectado directamente al
              repositorio de Git: cada push a producción publica la app sin pasos intermedios.
            </p>
            <CodeBlock filename="terminal">
{`$ npm i ai

# cada push a main despliega automáticamente`}
            </CodeBlock>
          </div>
        </Reveal>

        {/* 5. DEPLOY.AI */}
        <Reveal id="deployai" setRef={setRef} visible={visible.deployai}
          className="min-h-screen flex flex-col justify-center px-6 md:px-16 py-24">
          <Eyebrow>herramienta</Eyebrow>
          <h2 className="font-display font-semibold text-3xl md:text-5xl max-w-3xl mb-6">Deploy.ai</h2>
          <p className="text-base md:text-xl max-w-3xl mb-8" style={{ color: "var(--text-dim)" }}>
            Es una plataforma empresarial de <strong style={{ color: "var(--text)" }}>agentes de IA</strong>,
            no de hosting tradicional. Incluye RAG para conectar los agentes a datos propios, guardrails de
            seguridad, selección entre distintos modelos, y un "Code Canvas" para generar y ajustar en vivo
            el código que define el comportamiento de cada agente.
          </p>
          <div className="max-w-3xl flex gap-4 p-5 card" style={{ borderLeft: "3px solid var(--accent)" }}>
            <Bot size={22} className="flex-shrink-0 mt-0.5" style={{ color: "var(--accent)" }} />
            <p className="text-sm md:text-base" style={{ color: "var(--text)" }}>
              Aclaración: Deploy.ai no compite directamente con Vercel como servicio de hosting. Resuelve
              un caso de uso distinto: agentes de IA para procesos empresariales.
            </p>
          </div>
        </Reveal>

        {/* 6. COMPARATIVA */}
        <Reveal id="comparativa" setRef={setRef} visible={visible.comparativa}
          className="min-h-screen flex flex-col justify-center px-6 md:px-16 py-24">
          <Eyebrow>comparativa</Eyebrow>
          <h2 className="font-display font-semibold text-3xl md:text-5xl max-w-3xl mb-10">
            Tres formas de desplegar
          </h2>
          <div className="overflow-x-auto card">
            <table className="w-full text-sm md:text-base border-collapse min-w-[760px]">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th className="text-left p-5 font-display font-semibold" style={{ color: "var(--text-dim)" }}> </th>
                  <th className="text-left p-5 font-display font-semibold">Vercel AI</th>
                  <th className="text-left p-5 font-display font-semibold">Deploy.ai</th>
                  <th className="text-left p-5 font-display font-semibold">Plataformas clásicas</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={row.label} style={{ borderBottom: i < COMPARISON_ROWS.length - 1 ? "1px solid var(--border-soft)" : "none" }}>
                    <td className="p-5 font-mono text-xs md:text-sm align-top" style={{ color: "var(--accent)" }}>{row.label}</td>
                    <td className="p-5 align-top" style={{ color: "var(--text-dim)" }}>{row.vercel}</td>
                    <td className="p-5 align-top" style={{ color: "var(--text-dim)" }}>{row.deployai}</td>
                    <td className="p-5 align-top" style={{ color: "var(--text-dim)" }}>{row.clasicas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        {/* 7. ESTRATEGIAS */}
        <Reveal id="estrategias" setRef={setRef} visible={visible.estrategias}
          className="min-h-screen flex flex-col justify-center px-6 md:px-16 py-24">
          <Eyebrow>en la práctica</Eyebrow>
          <h2 className="font-display font-semibold text-3xl md:text-5xl max-w-3xl mb-4">
            Estrategias de despliegue asistido por IA
          </h2>
          <p className="text-base md:text-lg max-w-2xl mb-10" style={{ color: "var(--text-dim)" }}>
            Toca cada tarjeta para ver un ejemplo real.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 max-w-5xl">
            {STRATEGIES.map((s, i) => {
              const Icon = s.icon;
              const open = openStrategy === i;
              return (
                <button
                  key={s.title}
                  onClick={() => setOpenStrategy(open ? null : i)}
                  className="card p-6 text-left"
                  style={{ borderColor: open ? "var(--accent-line)" : "var(--border)" }}
                  aria-expanded={open}
                >
                  <div className="flex items-start justify-between gap-4">
                    <Icon size={22} style={{ color: "var(--accent)" }} />
                    <ChevronRight
                      size={18}
                      style={{ color: "var(--text-dim)", transform: open ? "rotate(90deg)" : "none", transition: "transform 0.2s ease" }}
                    />
                  </div>
                  <h3 className="font-display text-base font-semibold mt-4">{s.title}</h3>
                  <p className="text-sm mt-2" style={{ color: "var(--text-dim)" }}>{s.summary}</p>
                  {open && (
                    <div className="mt-5">
                      <CodeBlock>{s.example}</CodeBlock>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* 8. RIESGOS */}
        <Reveal id="riesgos" setRef={setRef} visible={visible.riesgos}
          className="min-h-screen flex flex-col justify-center px-6 md:px-16 py-24">
          <Eyebrow>seguridad</Eyebrow>
          <h2 className="font-display font-semibold text-3xl md:text-5xl max-w-3xl mb-10">
            Riesgos y seguridad
          </h2>
          <ul className="flex flex-col gap-4 max-w-2xl">
            {RISKS.map((risk) => (
              <li key={risk} className="flex items-start gap-4 p-5 card">
                <ShieldAlert size={20} className="flex-shrink-0 mt-0.5" style={{ color: "var(--warning)" }} />
                <span className="text-base md:text-lg">{risk}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* 9. PROMPTS EFECTIVOS */}
        <Reveal id="prompts" setRef={setRef} visible={visible.prompts}
          className="min-h-screen flex flex-col justify-center px-6 md:px-16 py-24">
          <Eyebrow>buenas prácticas</Eyebrow>
          <h2 className="font-display font-semibold text-3xl md:text-5xl max-w-3xl mb-8">
            Prompts efectivos
          </h2>
          <p className="text-base md:text-lg max-w-2xl mb-8" style={{ color: "var(--text-dim)" }}>
            Un buen prompt de despliegue es tan específico como un ticket de infraestructura.
          </p>
          <div className="max-w-3xl">
            <CodeBlock filename="prompt.txt">{PROMPT_EXAMPLE}</CodeBlock>
          </div>
        </Reveal>

        {/* 10. LA DEMO */}
        <Reveal id="demo" setRef={setRef} visible={visible.demo}
          className="min-h-screen flex flex-col justify-center items-start px-6 md:px-16 py-24">
          <Eyebrow>meta</Eyebrow>
          <h2 className="font-display font-semibold text-3xl md:text-6xl max-w-3xl leading-tight">
            Todo lo que acaban de ver fue construido con este enfoque.
          </h2>
          <p className="mt-8 text-lg md:text-2xl max-w-2xl" style={{ color: "var(--text-dim)" }}>
            Esta página fue generada con IA y va a desplegarse en vivo, frente a ustedes.
          </p>
        </Reveal>

        {/* 11. SIMULACIÓN DE DESPLIEGUE */}
        <Reveal id="simulacion" setRef={setRef} visible={visible.simulacion}
          className="min-h-screen flex flex-col justify-center px-6 md:px-16 py-24">
          <Eyebrow>en vivo</Eyebrow>
          <h2 className="font-display font-semibold text-3xl md:text-5xl max-w-3xl mb-10">
            Simulación de despliegue
          </h2>

          <div className="max-w-2xl">
            <button
              onClick={runDeploy}
              disabled={deploying}
              className="flex items-center gap-3 px-7 py-4 rounded-xl font-display font-semibold text-base mb-8"
              style={{
                background: deploying ? "var(--panel-2)" : "var(--accent)",
                color: deploying ? "var(--text-dim)" : "#0A0E14",
                cursor: deploying ? "default" : "pointer",
              }}
            >
              <Rocket size={20} />
              {deploying ? "Desplegando…" : deployDone ? "Volver a desplegar" : "Simular despliegue"}
            </button>

            {(deployLines.length > 0) && (
              <div className="code-block relative overflow-hidden">
                <div className="code-block-head flex items-center gap-2">
                  <Terminal size={13} /> terminal — deploy.sh
                </div>
                <div className="code-block-body">
                  {deployLines.map((line, i) => (
                    <div key={i} style={{ color: line.startsWith("✅") ? "var(--success)" : "#C9D1E0" }}>
                      {line}
                    </div>
                  ))}
                  {deployDone && (
                    <div className="mt-3 flex items-center gap-2" style={{ color: "var(--success)" }}>
                      <CheckCircle2 size={16} />
                      <span>https://mi-app-produccion.vercel.app</span>
                    </div>
                  )}
                </div>
                {deployDone && (
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-24">
                    {Array.from({ length: 14 }).map((_, i) => (
                      <span
                        key={i}
                        className="confetti-piece"
                        style={{
                          left: `${(i * 7.2) % 100}%`,
                          background: i % 2 === 0 ? "var(--accent)" : "var(--success)",
                          animationDelay: `${(i % 5) * 0.08}s`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </Reveal>

        {/* 12. ESTADO EN VIVO */}
        <Reveal id="estado" setRef={setRef} visible={visible.estado}
          className="min-h-screen flex flex-col justify-center px-6 md:px-16 py-24">
          <Eyebrow>estado en vivo</Eyebrow>
          <h2 className="font-display font-semibold text-3xl md:text-5xl max-w-3xl mb-10">
            Estado en vivo
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
            <div className="card p-7">
              <div className="flex items-center gap-2 mb-3" style={{ color: "var(--text-dim)" }}>
                <Eye size={16} />
                <span className="text-sm">Última actualización</span>
              </div>
              <p className="font-display text-xl">14 de septiembre de 2026</p>
            </div>
            <div className="card p-7">
              <div className="flex items-center gap-2 mb-3" style={{ color: "var(--text-dim)" }}>
                <Users size={16} />
                <span className="text-sm">Personas viendo esta demo</span>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-display text-3xl">{counter}</p>
                <button
                  onClick={() => setCounter((c) => c + 1)}
                  className="text-xs font-mono px-3 py-1.5 rounded-md"
                  style={{ border: "1px solid var(--border)", color: "var(--text-dim)" }}
                >
                  +1
                </button>
              </div>
            </div>
          </div>
          <p className="mt-6 text-xs font-mono max-w-md" style={{ color: "var(--text-dim)" }}>
            Este bloque queda listo para editarse en vivo con un prompt durante la exposición.
          </p>
        </Reveal>

        {/* 13. PREGUNTAS */}
        <Reveal id="preguntas" setRef={setRef} visible={visible.preguntas}
          className="min-h-screen flex flex-col justify-center px-6 md:px-16 py-24">
          <HelpCircle size={36} style={{ color: "var(--accent)" }} className="mb-6" />
          <h2 className="font-display font-semibold text-5xl md:text-8xl mb-16">¿Preguntas?</h2>
          <div className="flex flex-col gap-2">
            {TEAM.map((name) => (
              <span key={name} className="text-base md:text-lg" style={{ color: "var(--text-dim)" }}>
                {name}
              </span>
            ))}
          </div>
        </Reveal>
      </main>
    </div>
  );
}
