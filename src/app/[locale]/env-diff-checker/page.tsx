import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("env-diff-checker");

export default function EnvDiffCheckerPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="env-diff-checker" />;
}
