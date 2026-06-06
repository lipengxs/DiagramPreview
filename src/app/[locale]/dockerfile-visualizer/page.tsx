import {ToolPage, createToolMetadata, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("dockerfile-visualizer");

export default function Page(props: ToolRouteProps) {
  return <ToolPage {...props} slug="dockerfile-visualizer" />;
}
