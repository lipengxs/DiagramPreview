import {createHubMetadata, HubPage, type HubRouteProps} from "../hub-page";

export const generateMetadata = createHubMetadata("converters");

export default function ConvertersPage(props: HubRouteProps) {
  return <HubPage {...props} hubSlug="converters" />;
}
