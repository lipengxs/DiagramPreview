import {evidenceAsset, evidenceFamilies, evidenceText, type EvidenceFamilyId} from "@/config/tool-evidence";
import {sourceUrl} from "@/lib/source-links";
import {TrackedToolLink} from "./TrackedToolLink";

export function ToolEvidence({family: familyId, locale}: {family: EvidenceFamilyId; locale: string}) {
  const family = evidenceFamilies[familyId];
  const zh = locale === "zh-CN";
  const es = locale === "es";
  const copy = zh ? {title: "用真实文件验证结果", minimal: "最小示例", business: "业务示例", failure: "失败示例", open: "载入此示例", input: "下载原始输入", result: "下载可编辑结果", limits: "支持范围与限制", caption: "由本站工具实际导出的示例结果。"}
    : es ? {title: "Comprueba el resultado con archivos reales", minimal: "Ejemplo mínimo", business: "Caso práctico", failure: "Caso no compatible", open: "Cargar ejemplo", input: "Descargar entrada", result: "Descargar resultado editable", limits: "Alcance y límites", caption: "Resultado exportado por esta herramienta."}
    : {title: "Verify the result with real files", minimal: "Minimal example", business: "Business example", failure: "Failure example", open: "Load this example", input: "Download original input", result: "Download editable result", limits: "Support and limits", caption: "Example output exported by this site's tool."};
  return (
    <section data-tool-evidence={familyId} className="mx-auto grid max-w-7xl min-w-0 gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <h2 className="text-xl font-bold text-ink">{copy.title}</h2>
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm leading-7 text-slate-700"><h3 className="font-semibold">{copy.limits}</h3><p>{evidenceText(family.limits, locale)}</p></div>
      <div className="grid min-w-0 gap-5 lg:grid-cols-3">
        {family.cases.map((example) => <article key={example.id} data-evidence-case={example.id} className="min-w-0 rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-lg font-semibold text-ink">{copy[example.id]}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{evidenceText(example.description, locale)}</p>
          <pre className="mt-4 max-h-64 overflow-auto rounded-md bg-slate-950 p-3 text-xs leading-5 text-slate-100"><code>{example.source}</code></pre>
          {example.id !== "failure" ? <figure className="mt-4"><img src={evidenceAsset(familyId, example, "svg")} alt={`${copy[example.id]}: ${evidenceText(example.description, locale)}`} loading="lazy" className="max-h-72 w-full rounded border border-slate-100 object-contain" /><figcaption className="mt-2 text-xs text-slate-500">{copy.caption}</figcaption></figure> : null}
          <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-primary">
            <TrackedToolLink href={sourceUrl(`/${family.tool}`, example.source)} eventName="tool_entry_click" targetToolSlug={family.tool} source="tool_verified_example" className="rounded border border-blue-200 px-3 py-2 hover:bg-blue-50">{copy.open}</TrackedToolLink>
            <a href={evidenceAsset(familyId, example, family.extension)} download className="py-2 underline underline-offset-4">{copy.input}</a>
            {example.id !== "failure" ? <>
              {"xmlResult" in family && family.xmlResult ? <a href={evidenceAsset(familyId, example, "drawio")} download className="py-2 underline underline-offset-4">{copy.result}</a> : null}
              <a href={evidenceAsset(familyId, example, "svg")} download className="py-2 underline underline-offset-4">SVG</a>
              <a href={evidenceAsset(familyId, example, "png")} download className="py-2 underline underline-offset-4">PNG</a>
            </> : null}
          </div>
        </article>)}
      </div>
    </section>
  );
}
