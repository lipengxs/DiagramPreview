import {AiToolPage, createAiToolMetadata, type AiToolRouteProps} from "../ai-tool-page";

export const generateMetadata = createAiToolMetadata("ai-diagram-generator");

export default function AiDiagramGeneratorPage(props: AiToolRouteProps) {
  return <AiToolPage {...props} slug="ai-diagram-generator" />;
}
