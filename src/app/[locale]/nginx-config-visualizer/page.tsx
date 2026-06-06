import {ToolPage, createToolMetadata, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("nginx-config-visualizer");

export default function Page(props: ToolRouteProps) {
  return <ToolPage {...props} slug="nginx-config-visualizer" />;
}
