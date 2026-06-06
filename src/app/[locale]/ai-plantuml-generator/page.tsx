import {createAiToolMetadata, AiToolPage, type AiToolRouteProps} from "../ai-tool-page";

export const generateMetadata = createAiToolMetadata("ai-plantuml-generator");

export default function AiPlantumlGeneratorPage(props: AiToolRouteProps) {
  return <AiToolPage {...props} slug="ai-plantuml-generator" />;
}
