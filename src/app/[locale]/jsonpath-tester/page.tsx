import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("jsonpath-tester");

export default function JsonpathTesterPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="jsonpath-tester" />;
}
