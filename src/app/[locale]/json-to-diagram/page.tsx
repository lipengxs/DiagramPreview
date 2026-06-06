import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("json-to-diagram");

export default function JsonToDiagramPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="json-to-diagram" />;
}
