import {AiToolPage, createAiToolMetadata, type AiToolRouteProps} from "../ai-tool-page";

export const generateMetadata = createAiToolMetadata("grafana-dashboard-generator");

export default function Page(props: AiToolRouteProps) {
  return <AiToolPage {...props} slug="grafana-dashboard-generator" />;
}
