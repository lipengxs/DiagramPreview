import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("mermaid-preview");

export default function MermaidPreviewPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="mermaid-preview" />;
}
