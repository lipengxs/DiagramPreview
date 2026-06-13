import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("kubernetes-service-topology-diagram");

export default function Page(props: ToolRouteProps) {
  return <ToolPage {...props} slug="kubernetes-service-topology-diagram" />;
}
