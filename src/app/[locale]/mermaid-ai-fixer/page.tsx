import {AiToolPage, createAiToolMetadata, type AiToolRouteProps} from "../ai-tool-page";

export const generateMetadata = createAiToolMetadata("mermaid-ai-fixer");

export default function MermaidAiFixerPage(props: AiToolRouteProps) {
  return <AiToolPage {...props} slug="mermaid-ai-fixer" />;
}
