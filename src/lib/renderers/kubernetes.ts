import yaml from "js-yaml";
import type {TreeNode} from "./tree";

type KubernetesDoc = {
  apiVersion?: string;
  kind?: string;
  metadata?: {name?: string; namespace?: string; labels?: Record<string, string>};
  spec?: unknown;
};

export function parseKubernetesManifestTree(source: string): TreeNode {
  const docs = yaml.loadAll(source).filter(Boolean) as KubernetesDoc[];
  if (!docs.length) {
    throw new Error("Kubernetes manifest is empty.");
  }

  return {
    key: "Kubernetes",
    value: `${docs.length} resource${docs.length === 1 ? "" : "s"}`,
    children: docs.map((doc, index) => {
      const name = doc.metadata?.name || `resource-${index + 1}`;
      const children: TreeNode[] = [
        {key: "apiVersion", value: doc.apiVersion || ""},
        {key: "kind", value: doc.kind || ""},
        {key: "namespace", value: doc.metadata?.namespace || "default"}
      ];

      if (doc.metadata?.labels) {
        children.push({
          key: "labels",
          value: `Object(${Object.keys(doc.metadata.labels).length})`,
          children: Object.entries(doc.metadata.labels).map(([key, value]) => ({key, value}))
        });
      }

      children.push({key: "spec", value: doc.spec ? "Object" : "none"});

      return {
        key: name,
        value: doc.kind || "Resource",
        children
      };
    })
  };
}
