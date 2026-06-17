import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("robots-txt-tester");

export default function RobotsTxtTesterPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="robots-txt-tester" />;
}
