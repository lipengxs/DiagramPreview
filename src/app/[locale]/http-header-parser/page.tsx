import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("http-header-parser");

export default function HttpHeaderParserPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="http-header-parser" />;
}
