import {createHubMetadata, HubPage, type HubRouteProps} from "../hub-page";

export const generateMetadata = createHubMetadata("ai-diagram");

export default function AiDiagramPage(props: HubRouteProps) {
  return <HubPage {...props} hubSlug="ai-diagram" />;
}
