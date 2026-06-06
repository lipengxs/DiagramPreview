import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("yaml-to-diagram");

export default function YamlToDiagramPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="yaml-to-diagram" />;
}
