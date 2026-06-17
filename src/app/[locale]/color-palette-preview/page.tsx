import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("color-palette-preview");

export default function ColorPalettePreviewPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="color-palette-preview" />;
}
