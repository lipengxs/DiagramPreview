import {AiToolPage, createAiToolMetadata, type AiToolRouteProps} from "../ai-tool-page";

export const generateMetadata = createAiToolMetadata("text-to-mermaid");

export default function TextToMermaidPage(props: AiToolRouteProps) {
  return <AiToolPage {...props} slug="text-to-mermaid" />;
}
