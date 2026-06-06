import {ToolPage, createToolMetadata, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("helm-values-visualizer");

export default function Page(props: ToolRouteProps) {
  return <ToolPage {...props} slug="helm-values-visualizer" />;
}
