import {AiToolPage, createAiToolMetadata, type AiToolRouteProps} from "../ai-tool-page";

export const generateMetadata = createAiToolMetadata("observability-pack-generator");

export default function Page(props: AiToolRouteProps) {
  return <AiToolPage {...props} slug="observability-pack-generator" />;
}
