import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("jq-filter-tester");

export default function JqFilterTesterPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="jq-filter-tester" />;
}
