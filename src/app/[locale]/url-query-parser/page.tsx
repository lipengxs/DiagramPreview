import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("url-query-parser");

export default function UrlQueryParserPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="url-query-parser" />;
}
