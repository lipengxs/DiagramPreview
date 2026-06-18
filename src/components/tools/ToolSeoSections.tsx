import {Link} from "@/i18n/navigation";
import type {ReactNode} from "react";

type ToolSeoSectionsProps = {
  locale: string;
  toolName: string;
  toolDescription: string;
  maturity?: {
    label: string;
    title: string;
    description: string;
  };
  howTitle: string;
  useCasesTitle: string;
  relatedTitle: string;
  faqTitle: string;
  howToUse: string[];
  useCases: string[];
  relatedTools: Array<{slug: string; name: string; description: string}>;
  faq: Array<{question: string; answer: string}>;
  seoBody: string[];
  sampleSummaries: string[];
  deepDives?: ToolDeepDive[];
};

type SampleValue = {
  label?: string;
  prompt?: string;
  code?: string;
  diagramType?: string;
};

export type ToolDeepDive = {
  title: string;
  body: string;
  bullets?: string[];
  code?: string;
  caption?: string;
};

export function ToolSeoSections({
  locale,
  toolName,
  toolDescription,
  maturity,
  howTitle,
  useCasesTitle,
  relatedTitle,
  faqTitle,
  howToUse,
  useCases,
  relatedTools,
  faq,
  seoBody,
  sampleSummaries,
  deepDives = []
}: ToolSeoSectionsProps) {
  const helperCopy = getHelperCopy(locale, toolName, toolDescription);

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
      <InfoBlock title={howTitle}>
        <ol className="grid gap-2">
          {howToUse.map((item, index) => (
            <li key={item} className="flex gap-3 text-sm leading-6 text-slate-600">
              <span className="flex h-6 w-6 flex-none items-center justify-center rounded-md bg-blue-50 text-xs font-bold text-primary">
                {index + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </InfoBlock>
      <InfoBlock title={useCasesTitle}>
        <div className="flex flex-wrap gap-2">
          {useCases.map((item) => (
            <span key={item} className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
              {item}
            </span>
          ))}
        </div>
      </InfoBlock>
      <InfoBlock title={relatedTitle}>
        <div className="grid gap-3">
          {relatedTools.map((tool) => (
            <Link key={tool.slug} href={`/${tool.slug}`} className="rounded-md border border-slate-200 p-3 hover:border-primary hover:bg-blue-50">
              <div className="font-semibold text-ink">{tool.name}</div>
              <p className="mt-1 text-sm leading-6 text-slate-600">{tool.description}</p>
            </Link>
          ))}
        </div>
      </InfoBlock>
      <InfoBlock title={faqTitle}>
        <div className="grid gap-4">
          {faq.map((item) => (
            <div key={item.question}>
              <h3 className="font-semibold text-ink">{item.question}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">{item.answer}</p>
            </div>
          ))}
        </div>
      </InfoBlock>
      <div className="rounded-lg border border-slate-200 bg-white p-5 lg:col-span-2">
        <div className="grid gap-4 text-sm leading-7 text-slate-600 md:grid-cols-3">
          {seoBody.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
      {deepDives.length ? (
        <div className="grid gap-4 lg:col-span-2">
          {deepDives.map((section) => (
            <article key={section.title} className="rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-semibold text-ink">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{section.body}</p>
              {section.bullets?.length ? (
                <ul className="mt-4 grid gap-2 text-sm leading-7 text-slate-600">
                  {section.bullets.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {section.code ? (
                <pre className="mt-4 overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-4 text-xs leading-5 text-slate-100">
                  <code>{section.code}</code>
                </pre>
              ) : null}
              {section.caption ? <p className="mt-3 text-xs leading-5 text-slate-500">{section.caption}</p> : null}
            </article>
          ))}
        </div>
      ) : null}
      <InfoBlock title={helperCopy.reviewTitle}>
        <div className="grid gap-3 text-sm leading-7 text-slate-600">
          <p>{helperCopy.reviewBody}</p>
          <p>{helperCopy.reviewChecklist}</p>
        </div>
      </InfoBlock>
      <InfoBlock title={helperCopy.limitsTitle}>
        <div className="grid gap-3 text-sm leading-7 text-slate-600">
          <p>{helperCopy.limitsBody}</p>
          <p>{helperCopy.limitsNote}</p>
        </div>
      </InfoBlock>
      {sampleSummaries.length ? (
        <InfoBlock title={helperCopy.examplesTitle}>
          <ul className="grid gap-2 text-sm leading-7 text-slate-600">
            {sampleSummaries.map((sample) => (
              <li key={sample}>{sample}</li>
            ))}
          </ul>
        </InfoBlock>
      ) : null}
      {maturity ? (
        <InfoBlock title={helperCopy.maturityTitle}>
          <div className="grid gap-3 text-sm leading-7 text-slate-600">
            <span className="w-fit rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
              {maturity.label}
            </span>
            <h3 className="text-base font-semibold text-ink">{maturity.title}</h3>
            <p>{maturity.description}</p>
            <p>{helperCopy.maturityNote}</p>
          </div>
        </InfoBlock>
      ) : null}
    </section>
  );
}

function getHelperCopy(locale: string, toolName: string, toolDescription: string) {
  const zhHans = {
    reviewTitle: `${toolName} 检查清单`,
    reviewBody: `当你需要在文档、PR、故障复盘或交接材料发布前检查源码内容时，可以使用 ${toolName}。${toolDescription}`,
    reviewChecklist: "导出前建议检查标签是否可读、关系是否和源码一致、示例是否包含敏感信息，以及修改输入后预览是否仍然成立。",
    limitsTitle: "限制与排查",
    limitsBody: "如果预览失败，先把输入缩小到最小完整示例，确认格式语法，再逐段加回内容。很多失败来自不完整文件、缩进错误、缺少图表头，或复制了依赖隐藏上下文的片段。",
    limitsNote: "请把预览结果当作 review 界面，而不是生产事实来源。生成的图表、转换文件、看板和规则示例在进入正式文档或运维流程前仍需要人工确认。",
    examplesTitle: "可测试的示例输入",
    maturityTitle: "工具完成度",
    maturityNote: "分级不是质量打分，而是告诉用户当前工具更适合稳定导出、深度调试、快速解析，还是 AI 辅助生成。"
  };

  const helperCopy = {
    en: {
      reviewTitle: `Review checklist for ${toolName}`,
      reviewBody: `Use ${toolName} when you need to inspect source content visually before it becomes documentation, a pull request note, an incident write-up, or a handoff artifact. ${toolDescription}`,
      reviewChecklist: "Before exporting, check that labels are readable, relationships match the source, generated examples do not contain private data, and the preview still makes sense after you edit the input.",
      limitsTitle: "Limits and troubleshooting",
      limitsBody: "If the preview fails, reduce the input to the smallest complete example, confirm the format syntax, and then add sections back one at a time. Many rendering failures come from partial files, indentation mistakes, missing diagram headers, or copied snippets that depend on hidden context.",
      limitsNote: "Treat the preview as a review surface rather than a source of truth. Generated diagrams, converted files, dashboards, and rule examples should be checked before they are used in production documentation or operations.",
      examplesTitle: "Example inputs to test",
      maturityTitle: "Tool maturity",
      maturityNote: "The maturity label is not a quality score. It tells visitors whether the tool is best for stable export, deeper debugging, quick parsing, or AI-assisted generation."
    },
    "zh-CN": zhHans,
    "zh-TW": {
      reviewTitle: `${toolName} 檢查清單`,
      reviewBody: `當你需要在文件、PR、事故復盤或交接材料發布前檢查原始內容時，可以使用 ${toolName}。${toolDescription}`,
      reviewChecklist: "匯出前建議檢查標籤是否可讀、關係是否和原始內容一致、範例是否包含敏感資訊，以及修改輸入後預覽是否仍然成立。",
      limitsTitle: "限制與排查",
      limitsBody: "如果預覽失敗，先把輸入縮小到最小完整範例，確認格式語法，再逐段加回內容。",
      limitsNote: "請把預覽結果視為 review 介面，而不是正式事實來源。進入文件或維運流程前仍需要人工確認。",
      examplesTitle: "可測試的範例輸入",
      maturityTitle: "工具完成度",
      maturityNote: "分級不是品質分數，而是說明目前工具更適合穩定匯出、深度除錯、快速解析，或 AI 輔助生成。"
    },
    pt: {
      reviewTitle: `Checklist de revisão para ${toolName}`,
      reviewBody: `Use ${toolName} para inspecionar visualmente conteúdo de origem antes de publicar documentação, notas de PR, incidentes ou handoffs. ${toolDescription}`,
      reviewChecklist: "Antes de exportar, confira legibilidade, relações, dados sensíveis e se a prévia ainda faz sentido após editar a entrada.",
      limitsTitle: "Limites e solução de problemas",
      limitsBody: "Se a prévia falhar, reduza a entrada ao menor exemplo completo, valide a sintaxe e adicione as partes de volta aos poucos.",
      limitsNote: "Trate a prévia como superfície de revisão, não como fonte de verdade. Resultados críticos ainda exigem validação humana.",
      examplesTitle: "Entradas de exemplo",
      maturityTitle: "Maturidade da ferramenta",
      maturityNote: "O rótulo indica se a ferramenta é melhor para exportação estável, depuração, análise rápida ou geração com AI."
    },
    es: {
      reviewTitle: `Checklist de revisión para ${toolName}`,
      reviewBody: `Usa ${toolName} para inspeccionar visualmente contenido fuente antes de publicar documentación, notas de PR, incidentes o handoffs. ${toolDescription}`,
      reviewChecklist: "Antes de exportar, revisa legibilidad, relaciones, datos sensibles y si la vista sigue teniendo sentido tras editar la entrada.",
      limitsTitle: "Límites y solución de problemas",
      limitsBody: "Si la vista falla, reduce la entrada al ejemplo completo más pequeño, valida la sintaxis y agrega secciones gradualmente.",
      limitsNote: "Trata la vista como superficie de revisión, no como fuente de verdad. Los resultados críticos requieren validación humana.",
      examplesTitle: "Entradas de ejemplo",
      maturityTitle: "Madurez de la herramienta",
      maturityNote: "La etiqueta indica si la herramienta sirve mejor para exportar, depurar, analizar rápido o generar con AI."
    },
    de: {
      reviewTitle: `Review-Checkliste für ${toolName}`,
      reviewBody: `Nutze ${toolName}, um Quellinhalte vor Dokumentation, PR-Notizen, Incident-Berichten oder Übergaben visuell zu prüfen. ${toolDescription}`,
      reviewChecklist: "Prüfe vor dem Export Lesbarkeit, Beziehungen, sensible Daten und ob die Vorschau nach Änderungen weiterhin passt.",
      limitsTitle: "Grenzen und Fehlersuche",
      limitsBody: "Wenn die Vorschau fehlschlägt, reduziere die Eingabe auf ein kleines vollständiges Beispiel und füge Abschnitte schrittweise zurück.",
      limitsNote: "Behandle die Vorschau als Review-Fläche, nicht als Quelle der Wahrheit. Kritische Ergebnisse brauchen menschliche Prüfung.",
      examplesTitle: "Beispieleingaben",
      maturityTitle: "Werkzeugreife",
      maturityNote: "Das Label zeigt, ob das Werkzeug eher für stabilen Export, Debugging, schnelles Parsen oder AI-gestützte Generierung gedacht ist."
    },
    fr: {
      reviewTitle: `Checklist de revue pour ${toolName}`,
      reviewBody: `Utilisez ${toolName} pour inspecter visuellement une source avant documentation, note de PR, post-mortem ou transfert. ${toolDescription}`,
      reviewChecklist: "Avant export, vérifiez la lisibilité, les relations, les données sensibles et la cohérence après modification.",
      limitsTitle: "Limites et dépannage",
      limitsBody: "Si l'aperçu échoue, réduisez l'entrée au plus petit exemple complet, validez la syntaxe puis réajoutez les sections.",
      limitsNote: "Considérez l'aperçu comme une surface de revue, pas comme une source de vérité. Les résultats critiques doivent être validés.",
      examplesTitle: "Exemples à tester",
      maturityTitle: "Maturité de l'outil",
      maturityNote: "Le libellé indique si l'outil convient surtout à l'export stable, au débogage, à l'analyse rapide ou à la génération AI."
    },
    ru: {
      reviewTitle: `Чеклист review для ${toolName}`,
      reviewBody: `Используйте ${toolName}, чтобы визуально проверить исходный материал перед документацией, PR, incident review или handoff. ${toolDescription}`,
      reviewChecklist: "Перед экспортом проверьте читаемость, связи, чувствительные данные и корректность предпросмотра после правок.",
      limitsTitle: "Ограничения и отладка",
      limitsBody: "Если предпросмотр не работает, сократите ввод до минимального полного примера, проверьте синтаксис и возвращайте секции постепенно.",
      limitsNote: "Считайте предпросмотр поверхностью review, а не источником истины. Критичные результаты требуют ручной проверки.",
      examplesTitle: "Примеры для проверки",
      maturityTitle: "Зрелость инструмента",
      maturityNote: "Метка показывает, для чего инструмент подходит лучше: стабильный экспорт, отладка, быстрый парсинг или AI-генерация."
    },
    ja: {
      reviewTitle: `${toolName} のレビューチェックリスト`,
      reviewBody: `ドキュメント、PR、障害メモ、引き継ぎの前にソースを視覚的に確認する場合は ${toolName} を使えます。${toolDescription}`,
      reviewChecklist: "エクスポート前に、ラベルの読みやすさ、関係の正しさ、機密情報の有無、編集後のプレビュー整合性を確認してください。",
      limitsTitle: "制限とトラブルシュート",
      limitsBody: "プレビューに失敗したら、入力を最小の完全な例に縮小し、構文を確認してから少しずつ戻してください。",
      limitsNote: "プレビューはレビュー面であり、唯一の正解ではありません。重要な出力は人が確認してください。",
      examplesTitle: "試せるサンプル入力",
      maturityTitle: "ツール成熟度",
      maturityNote: "ラベルは、安定エクスポート、深いデバッグ、素早い解析、AI 支援生成のどれに向くかを示します。"
    },
    ko: {
      reviewTitle: `${toolName} 검토 체크리스트`,
      reviewBody: `문서, PR, 장애 회고, 인수인계 전에 소스 내용을 시각적으로 확인할 때 ${toolName}을 사용할 수 있습니다. ${toolDescription}`,
      reviewChecklist: "내보내기 전 라벨 가독성, 관계 정확성, 민감 정보 포함 여부, 입력 수정 후 미리보기 일관성을 확인하세요.",
      limitsTitle: "제한과 문제 해결",
      limitsBody: "미리보기가 실패하면 입력을 가장 작은 완전한 예제로 줄이고 문법을 확인한 뒤 섹션을 다시 추가하세요.",
      limitsNote: "미리보기는 검토 화면이지 사실의 원천은 아닙니다. 중요한 결과는 사람이 확인해야 합니다.",
      examplesTitle: "테스트할 예제 입력",
      maturityTitle: "도구 완성도",
      maturityNote: "라벨은 안정적인 내보내기, 깊은 디버깅, 빠른 파싱, AI 보조 생성 중 어디에 더 적합한지 알려줍니다."
    }
  };

  return helperCopy[locale as keyof typeof helperCopy] || helperCopy.en;
}

function InfoBlock({title, children}: {title: string; children: ReactNode}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="mb-4 text-lg font-semibold text-ink">{title}</h2>
      {children}
    </div>
  );
}

export function summarizeToolSamples(samples: Record<string, SampleValue>, limit = 3) {
  return Object.values(samples)
    .slice(0, limit)
    .map((sample) => {
      const label = sample.label || "Sample";
      const source = sample.prompt || sample.code || sample.diagramType || "";
      const summary = source.replace(/\s+/g, " ").trim();
      return summary ? `${label}: ${summary.slice(0, 180)}${summary.length > 180 ? "..." : ""}` : label;
    });
}
