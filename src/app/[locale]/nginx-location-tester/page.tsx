import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("nginx-location-tester");

export default function NginxLocationTesterPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="nginx-location-tester" />;
}
