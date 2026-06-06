import {AiToolPage, createAiToolMetadata, type AiToolRouteProps} from "../ai-tool-page";

export const generateMetadata = createAiToolMetadata("ai-drawio-generator");

export default function Page(props: AiToolRouteProps) {
  return <AiToolPage {...props} slug="ai-drawio-generator" />;
}
