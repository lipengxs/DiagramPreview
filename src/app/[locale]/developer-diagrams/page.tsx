import {createHubMetadata, HubPage, type HubRouteProps} from "../hub-page";

export const generateMetadata = createHubMetadata("developer-diagrams");

export default function DeveloperDiagramsPage(props: HubRouteProps) {
  return <HubPage {...props} hubSlug="developer-diagrams" />;
}
