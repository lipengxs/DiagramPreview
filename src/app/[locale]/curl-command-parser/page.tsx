import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("curl-command-parser");

export default function CurlCommandParserPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="curl-command-parser" />;
}
