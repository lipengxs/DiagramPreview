import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("har-file-sequence-diagram");

export default function Page(props: ToolRouteProps) {
  return <ToolPage {...props} slug="har-file-sequence-diagram" />;
}
