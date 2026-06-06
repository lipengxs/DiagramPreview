import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("csv-to-diagram");

export default function CsvToDiagramPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="csv-to-diagram" />;
}
