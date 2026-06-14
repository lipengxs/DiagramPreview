import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("postman-collection-sequence-diagram");

export default function Page(props: ToolRouteProps) {
  return <ToolPage {...props} slug="postman-collection-sequence-diagram" />;
}
