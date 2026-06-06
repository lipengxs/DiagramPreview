import {createToolMetadata, ToolPage, type ToolRouteProps} from "../tool-page";

export const generateMetadata = createToolMetadata("kubernetes-manifest-visualizer");

export default function KubernetesManifestVisualizerPage(props: ToolRouteProps) {
  return <ToolPage {...props} slug="kubernetes-manifest-visualizer" />;
}
