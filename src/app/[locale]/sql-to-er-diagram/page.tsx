import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("sql-to-er-diagram");

export default function SqlToErDiagramPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="sql-to-er-diagram" />;
}
