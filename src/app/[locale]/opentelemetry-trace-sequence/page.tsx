import {ToolPage, createToolMetadata, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("opentelemetry-trace-sequence");

export default function Page(props: ToolRouteProps) {
  return <ToolPage {...props} slug="opentelemetry-trace-sequence" />;
}
