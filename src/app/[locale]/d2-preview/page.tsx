import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("d2-preview");

export default function D2PreviewPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="d2-preview" />;
}
