import type {DrawioViewerError} from "@/lib/renderers/drawio-viewer-model";

const en = {
  upload: "Open local .drawio / XML file", page: "Page", zoom: "Zoom", zoomIn: "Zoom in", zoomOut: "Zoom out", fit: "Fit width",
  objects: "objects", pages: "pages", empty: "This page is empty.", pending: "Updating the local preview…",
  local: "Files are read in this browser. File content is not uploaded. Local drafts may be saved in this browser.",
  scope: "Basic viewer: rectangles, rounded rectangles, ellipses, diamonds, text and connectors. Layout, labels and arrowheads may differ from diagrams.net. Groups, images and custom shapes require diagrams.net.",
  source: "Download file saves only the selected page as .drawio; SVG and PNG export the selected preview. Keep your original multi-page file.",
  simplified: "Formatted labels and custom label placement are simplified to plain text.", links: "Links are not opened or included in the preview.",
  fileError: "Unable to read this file. Choose a UTF-8 .drawio or .xml file.",
  errors: {
    INVALID_XML: "Invalid draw.io XML. Check the file and try again.", INVALID_FILE: "Open a .drawio file containing mxfile, diagram, or mxGraphModel XML.",
    LIMIT: "This file exceeds a viewer limit. Use at most 2 MiB, 20 pages and 500 cells per page; split large diagrams.",
    COMPRESSION: "Unable to decode this compressed page. Check the original file in diagrams.net.",
    UNSUPPORTED: "This page contains unsupported objects or styles. Open it in diagrams.net; image export is disabled.",
    GEOMETRY: "This page has invalid geometry or connector endpoints. Check the source in diagrams.net."
  }
};
const zh = {
  upload: "打开本地 .drawio / XML 文件", page: "页面", zoom: "缩放", zoomIn: "放大", zoomOut: "缩小", fit: "适应宽度",
  objects: "个对象", pages: "页", empty: "当前页面为空。", pending: "正在更新本地预览…",
  local: "文件仅在当前浏览器读取，文件内容不会上传。本地草稿可能保存在此浏览器中。",
  scope: "基础查看器支持矩形、圆角矩形、椭圆、菱形、文本和连线。布局、标签和箭头可能与 diagrams.net 不同；分组、图片和自定义形状请用 diagrams.net 打开。",
  source: "“下载文件”仅保存当前页为 .drawio；SVG/PNG 导出当前页预览。请另行保留原始多页文件。",
  simplified: "富文本标签和自定义标签位置会简化为纯文本。", links: "预览不会打开或保留链接。",
  fileError: "无法读取文件，请选择 UTF-8 编码的 .drawio 或 .xml 文件。",
  errors: {
    INVALID_XML: "draw.io XML 无效，请检查文件后重试。", INVALID_FILE: "请打开包含 mxfile、diagram 或 mxGraphModel XML 的 .drawio 文件。",
    LIMIT: "文件超过查看器限制。文件最多 2 MiB、20 页，每页最多 500 个 cell；请拆分大图。",
    COMPRESSION: "无法解压当前页面，请在 diagrams.net 中检查原始文件。",
    UNSUPPORTED: "当前页包含不支持的对象或样式，请用 diagrams.net 打开；图片导出已禁用。",
    GEOMETRY: "当前页包含无效坐标或连线端点，请在 diagrams.net 中检查。"
  }
};
const es = {
  upload: "Abrir archivo local .drawio / XML", page: "Página", zoom: "Zoom", zoomIn: "Ampliar", zoomOut: "Reducir", fit: "Ajustar al ancho",
  objects: "objetos", pages: "páginas", empty: "Esta página está vacía.", pending: "Actualizando la vista local…",
  local: "Los archivos se leen en este navegador. Su contenido no se sube. Los borradores locales pueden guardarse en este navegador.",
  scope: "Visor básico: rectángulos, rectángulos redondeados, elipses, rombos, texto y conectores. El diseño, las etiquetas y las flechas pueden diferir de diagrams.net. Abre grupos, imágenes y formas personalizadas en diagrams.net.",
  source: "Descargar archivo guarda solo la página seleccionada como .drawio; SVG y PNG exportan su vista previa. Conserva el archivo original con todas las páginas.",
  simplified: "Las etiquetas con formato y su posición personalizada se simplifican a texto plano.", links: "Los enlaces no se abren ni se incluyen en la vista previa.",
  fileError: "No se pudo leer el archivo. Elige un archivo .drawio o .xml en UTF-8.",
  errors: {
    INVALID_XML: "XML draw.io no válido. Revisa el archivo e inténtalo de nuevo.", INVALID_FILE: "Abre un archivo .drawio con XML mxfile, diagram o mxGraphModel.",
    LIMIT: "El archivo supera un límite: máximo 2 MiB, 20 páginas y 500 celdas por página. Divide los diagramas grandes.",
    COMPRESSION: "No se pudo descomprimir esta página. Revisa el archivo original en diagrams.net.",
    UNSUPPORTED: "Esta página contiene objetos o estilos no compatibles. Ábrela en diagrams.net; la exportación de imágenes está desactivada.",
    GEOMETRY: "Esta página contiene geometría o extremos de conectores no válidos. Revísala en diagrams.net."
  }
};
export function drawioViewerCopy(locale?: string) {return locale?.startsWith("zh") ? zh : locale === "es" ? es : en;}
export function drawioErrorText(error: DrawioViewerError, locale?: string) {
  return locale?.startsWith("zh") || locale === "es" ? drawioViewerCopy(locale).errors[error.code] : error.message;
}
