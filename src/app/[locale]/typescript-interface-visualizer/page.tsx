import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("typescript-interface-visualizer");

export default function Page(props: ToolRouteProps) {
  return <ToolPage {...props} slug="typescript-interface-visualizer" />;
}
