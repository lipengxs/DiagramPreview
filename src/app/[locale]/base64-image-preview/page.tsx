import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("base64-image-preview");

export default function Base64ImagePreviewPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="base64-image-preview" />;
}
