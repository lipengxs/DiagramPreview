import {createHubMetadata, HubPage, type HubRouteProps} from "../hub-page";

export const generateMetadata = createHubMetadata("tools");

export default function ToolsPage(props: HubRouteProps) {
  return <HubPage {...props} hubSlug="tools" />;
}
