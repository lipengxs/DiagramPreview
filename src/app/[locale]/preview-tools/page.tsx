import {createHubMetadata, HubPage, type HubRouteProps} from "../hub-page";

export const generateMetadata = createHubMetadata("preview-tools");

export default function PreviewToolsPage(props: HubRouteProps) {
  return <HubPage {...props} hubSlug="preview-tools" />;
}
