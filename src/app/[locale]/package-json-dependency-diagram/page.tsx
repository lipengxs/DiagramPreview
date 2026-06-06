import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("package-json-dependency-diagram");

export default function PackageJsonDependencyDiagramPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="package-json-dependency-diagram" />;
}
