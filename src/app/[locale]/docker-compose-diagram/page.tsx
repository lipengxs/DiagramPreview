import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("docker-compose-diagram");

export default function DockerComposeDiagramPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="docker-compose-diagram" />;
}
