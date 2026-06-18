import type {Locale} from "@/config/locales";
import type {ToolConfig} from "@/config/tools";

export type ToolMaturityTier = "stable" | "advanced" | "basic" | "ai";

export type ToolMaturityCopy = {
  tier: ToolMaturityTier;
  label: string;
  title: string;
  description: string;
};

const stableRenderers: ToolConfig["renderer"][] = [
  "mermaid",
  "markdown",
  "graphviz",
  "openapi",
  "sql",
  "plantuml-to-drawio",
  "mermaid-to-drawio",
  "drawio-svg",
  "svg-preview",
  "html-preview",
  "json-diff",
  "color-palette",
  "css-shadow",
  "css-gradient",
  "base64-image"
];

const advancedRenderers: ToolConfig["renderer"][] = [
  "docker-compose",
  "terraform",
  "github-actions",
  "dockerfile",
  "nginx",
  "otel-trace",
  "log-sequence",
  "graphql",
  "protobuf",
  "asyncapi",
  "dbml",
  "prisma",
  "cron",
  "jwt",
  "api-error-flow",
  "kubernetes-topology",
  "cicd-pipeline",
  "postman",
  "har",
  "har-timeline",
  "typescript",
  "zod",
  "cloudformation",
  "c4"
];

const maturityText: Record<
  Locale,
  Record<ToolMaturityTier, {label: string; title: string; description: string}>
> = {
  en: {
    stable: {
      label: "Stable renderer",
      title: "Stable tool",
      description: "This tool has a dedicated renderer or preview surface, useful exports, and a repeatable browser-first workflow."
    },
    advanced: {
      label: "Advanced preview",
      title: "Advanced parser",
      description: "This tool extracts useful structure and relationships from developer input. Complex edge cases should still be checked against the source."
    },
    basic: {
      label: "Basic parser",
      title: "Basic parser",
      description: "This tool focuses on fast structure inspection. Use it for review and debugging, then verify critical output before production use."
    },
    ai: {
      label: "AI beta",
      title: "AI-assisted beta",
      description: "This tool can generate editable source with an AI provider. Review the output, render it locally, and adjust details before publishing."
    }
  },
  "zh-CN": {
    stable: {
      label: "稳定渲染器",
      title: "稳定工具",
      description: "这个工具已有专用渲染或预览界面，支持常用导出，适合浏览器内反复预览、修改和发布前检查。"
    },
    advanced: {
      label: "高级预览",
      title: "高级解析",
      description: "这个工具会从开发者输入中提取结构和关系，适合调试与文档 review；复杂边界仍建议回到源码确认。"
    },
    basic: {
      label: "基础解析",
      title: "基础解析",
      description: "这个工具偏向快速结构检查，适合预览、排查和定位问题；关键输出进入生产前仍需要人工复核。"
    },
    ai: {
      label: "AI Beta",
      title: "AI 辅助 Beta",
      description: "这个工具会调用 AI 生成可编辑源码。建议先本地预览，再修改细节，最后再用于文档或工程流程。"
    }
  },
  "zh-TW": {
    stable: {
      label: "穩定渲染器",
      title: "穩定工具",
      description: "此工具已有專用渲染或預覽介面，支援常用匯出，適合在瀏覽器內反覆預覽、修改與發布前檢查。"
    },
    advanced: {
      label: "進階預覽",
      title: "進階解析",
      description: "此工具會從開發者輸入中提取結構與關係，適合除錯與文件 review；複雜邊界仍建議回到原始碼確認。"
    },
    basic: {
      label: "基礎解析",
      title: "基礎解析",
      description: "此工具偏向快速結構檢查，適合預覽、排查與定位問題；關鍵輸出進入正式流程前仍需人工複核。"
    },
    ai: {
      label: "AI Beta",
      title: "AI 輔助 Beta",
      description: "此工具會呼叫 AI 產生可編輯原始碼。建議先本機預覽，再調整細節，最後再用於文件或工程流程。"
    }
  },
  pt: {
    stable: {
      label: "Renderizador estável",
      title: "Ferramenta estável",
      description: "Esta ferramenta tem uma superfície dedicada de visualização, exportações úteis e um fluxo repetível no navegador."
    },
    advanced: {
      label: "Prévia avançada",
      title: "Analisador avançado",
      description: "Esta ferramenta extrai estrutura e relações de entradas de desenvolvimento. Casos complexos ainda devem ser conferidos na origem."
    },
    basic: {
      label: "Analisador básico",
      title: "Analisador básico",
      description: "Esta ferramenta prioriza inspeção rápida de estrutura. Use para revisão e depuração, depois valide resultados críticos."
    },
    ai: {
      label: "AI beta",
      title: "Beta assistido por AI",
      description: "Esta ferramenta gera código editável com AI. Revise, renderize localmente e ajuste antes de publicar."
    }
  },
  es: {
    stable: {
      label: "Render estable",
      title: "Herramienta estable",
      description: "Esta herramienta tiene una vista dedicada, exportaciones útiles y un flujo repetible dentro del navegador."
    },
    advanced: {
      label: "Vista avanzada",
      title: "Analizador avanzado",
      description: "Esta herramienta extrae estructura y relaciones de entradas de desarrollo. Los casos complejos deben comprobarse contra la fuente."
    },
    basic: {
      label: "Analizador básico",
      title: "Analizador básico",
      description: "Esta herramienta se centra en inspección rápida de estructura. Úsala para revisar y depurar, y valida lo crítico antes de producción."
    },
    ai: {
      label: "AI beta",
      title: "Beta asistida por AI",
      description: "Esta herramienta genera código editable con AI. Revísalo, renderízalo localmente y ajusta detalles antes de publicar."
    }
  },
  de: {
    stable: {
      label: "Stabiler Renderer",
      title: "Stabiles Werkzeug",
      description: "Dieses Werkzeug hat eine eigene Vorschau, nützliche Exporte und einen wiederholbaren Browser-Workflow."
    },
    advanced: {
      label: "Erweiterte Vorschau",
      title: "Erweiterter Parser",
      description: "Dieses Werkzeug extrahiert Struktur und Beziehungen aus Entwicklereingaben. Komplexe Randfälle sollten gegen die Quelle geprüft werden."
    },
    basic: {
      label: "Basisparser",
      title: "Basisparser",
      description: "Dieses Werkzeug ist für schnelle Strukturprüfung gedacht. Nutze es zur Prüfung und Fehlersuche, validiere aber kritische Ergebnisse."
    },
    ai: {
      label: "AI beta",
      title: "AI-gestützte Beta",
      description: "Dieses Werkzeug erzeugt editierbaren Quelltext mit AI. Prüfe, rendere lokal und passe Details vor der Veröffentlichung an."
    }
  },
  fr: {
    stable: {
      label: "Rendu stable",
      title: "Outil stable",
      description: "Cet outil dispose d'une prévisualisation dédiée, d'exports utiles et d'un flux répétable dans le navigateur."
    },
    advanced: {
      label: "Aperçu avancé",
      title: "Analyse avancée",
      description: "Cet outil extrait la structure et les relations depuis des entrées développeur. Les cas complexes doivent être vérifiés avec la source."
    },
    basic: {
      label: "Analyse basique",
      title: "Analyse basique",
      description: "Cet outil vise l'inspection rapide de structure. Utilisez-le pour relire et déboguer, puis validez les résultats critiques."
    },
    ai: {
      label: "AI beta",
      title: "Beta assistée par AI",
      description: "Cet outil génère une source modifiable avec AI. Relisez, prévisualisez localement et ajustez avant publication."
    }
  },
  ru: {
    stable: {
      label: "Стабильный рендер",
      title: "Стабильный инструмент",
      description: "У инструмента есть отдельная область предпросмотра, полезный экспорт и повторяемый workflow в браузере."
    },
    advanced: {
      label: "Расширенный просмотр",
      title: "Расширенный парсер",
      description: "Инструмент извлекает структуру и связи из developer-ввода. Сложные случаи стоит сверять с исходником."
    },
    basic: {
      label: "Базовый парсер",
      title: "Базовый парсер",
      description: "Инструмент предназначен для быстрой проверки структуры. Используйте для review и отладки, а критичный результат проверяйте отдельно."
    },
    ai: {
      label: "AI beta",
      title: "AI beta",
      description: "Инструмент генерирует редактируемый исходный текст с AI. Проверьте результат, отрендерьте локально и поправьте детали."
    }
  },
  ja: {
    stable: {
      label: "安定レンダラー",
      title: "安定ツール",
      description: "このツールは専用のプレビュー、実用的なエクスポート、ブラウザ内で繰り返せる確認フローを備えています。"
    },
    advanced: {
      label: "高度なプレビュー",
      title: "高度なパーサー",
      description: "このツールは開発者向け入力から構造と関係を抽出します。複雑なケースは元ソースで確認してください。"
    },
    basic: {
      label: "基本パーサー",
      title: "基本パーサー",
      description: "このツールは素早い構造確認向けです。レビューやデバッグに使い、重要な出力は別途検証してください。"
    },
    ai: {
      label: "AI beta",
      title: "AI 支援 beta",
      description: "このツールは AI で編集可能なソースを生成します。ローカルでプレビューし、調整してから公開してください。"
    }
  },
  ko: {
    stable: {
      label: "안정 렌더러",
      title: "안정 도구",
      description: "이 도구는 전용 미리보기, 유용한 내보내기, 브라우저 안에서 반복 가능한 검토 흐름을 제공합니다."
    },
    advanced: {
      label: "고급 미리보기",
      title: "고급 파서",
      description: "이 도구는 개발자 입력에서 구조와 관계를 추출합니다. 복잡한 예외는 원본과 함께 확인하세요."
    },
    basic: {
      label: "기본 파서",
      title: "기본 파서",
      description: "이 도구는 빠른 구조 점검에 초점을 둡니다. 리뷰와 디버깅에 사용하고 중요한 결과는 별도로 검증하세요."
    },
    ai: {
      label: "AI beta",
      title: "AI 보조 beta",
      description: "이 도구는 AI로 편집 가능한 소스를 생성합니다. 로컬에서 미리보고 수정한 뒤 게시하세요."
    }
  }
};

export function getToolMaturityTier(renderer: ToolConfig["renderer"]): ToolMaturityTier {
  if (renderer === "ai") return "ai";
  if (stableRenderers.includes(renderer)) return "stable";
  if (advancedRenderers.includes(renderer)) return "advanced";
  return "basic";
}

export function getToolMaturityCopy(locale: Locale, renderer: ToolConfig["renderer"]): ToolMaturityCopy {
  const tier = getToolMaturityTier(renderer);
  return {
    tier,
    ...maturityText[locale][tier]
  };
}
