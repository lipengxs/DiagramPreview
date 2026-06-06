import {AiToolPage, createAiToolMetadata, type AiToolRouteProps} from "../ai-tool-page";

export const generateMetadata = createAiToolMetadata("prometheus-alert-rule-generator");

export default function Page(props: AiToolRouteProps) {
  return <AiToolPage {...props} slug="prometheus-alert-rule-generator" />;
}
