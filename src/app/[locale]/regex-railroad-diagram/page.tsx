import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("regex-railroad-diagram");

export default function RegexRailroadDiagramPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="regex-railroad-diagram" />;
}
