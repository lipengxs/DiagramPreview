import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("yaml-path-tester");

export default function YamlPathTesterPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="yaml-path-tester" />;
}
