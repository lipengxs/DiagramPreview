export function handoffCopy(locale?: string) {
  if (locale?.startsWith("zh")) return {
    source: "携带当前源码继续", xml: "携带转换后的 XML 继续", open: "打开工具", unavailable: "当前输入转换成功后，可携带 XML 打开查看器。",
    large: "内容的 URL 片段编码超过 32 KiB，无法生成携带内容的链接。请下载文件，在目标工具本地打开，或复制源码后粘贴。",
    download: "下载待传递文件", downloadSource: "下载当前输入", shareLarge: "分享和 Markdown 链接已暂停，避免生成过长链接。"
  };
  if (locale?.startsWith("es")) return {
    source: "Continuar con el código actual", xml: "Continuar con el XML convertido", open: "Abrir herramienta", unavailable: "Convierte la entrada actual correctamente para abrir su XML en el visor.",
    large: "El fragmento URL codificado supera los 32 KiB. Descarga el archivo y ábrelo localmente en la herramienta de destino, o copia y pega el código.",
    download: "Descargar archivo para continuar", downloadSource: "Descargar entrada actual", shareLarge: "Los enlaces para compartir y Markdown están desactivados por su longitud."
  };
  return {
    source: "Continue with current source", xml: "Continue with converted XML", open: "Open tool", unavailable: "Convert the current input successfully to open its XML in the viewer.",
    large: "The encoded URL fragment exceeds 32 KiB. Download the file and open it locally in the target tool, or copy and paste the source.",
    download: "Download file to continue", downloadSource: "Download current input", shareLarge: "Share and Markdown links are paused to avoid oversized URLs."
  };
}
