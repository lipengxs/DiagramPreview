import {createHubMetadata, HubPage, type HubRouteProps} from "../hub-page";

export const generateMetadata = createHubMetadata("data-visualizers");

export default function DataVisualizersPage(props: HubRouteProps) {
  return <HubPage {...props} hubSlug="data-visualizers" />;
}
