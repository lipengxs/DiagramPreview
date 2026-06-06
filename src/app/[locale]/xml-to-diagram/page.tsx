import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("xml-to-diagram");

export default function XmlToDiagramPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="xml-to-diagram" />;
}
