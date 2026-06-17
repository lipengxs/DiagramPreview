import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("toml-visualizer");

export default function TomlVisualizerPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="toml-visualizer" />;
}
