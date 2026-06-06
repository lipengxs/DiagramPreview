import {createAiToolMetadata, AiToolPage, type AiToolRouteProps} from "../ai-tool-page";

export const generateMetadata = createAiToolMetadata("architecture-diagram-generator");

export default function ArchitectureDiagramGeneratorPage(props: AiToolRouteProps) {
  return <AiToolPage {...props} slug="architecture-diagram-generator" />;
}
