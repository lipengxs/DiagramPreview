import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("xpath-tester");

export default function XPathTesterPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="xpath-tester" />;
}
