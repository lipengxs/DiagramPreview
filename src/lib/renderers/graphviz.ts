import {instance} from "@viz-js/viz";

let vizPromise: ReturnType<typeof instance> | undefined;

export async function renderGraphviz(source: string) {
  if (!vizPromise) {
    vizPromise = instance();
  }

  const viz = await vizPromise;
  const svgElement = viz.renderSVGElement(source);
  return svgElement.outerHTML;
}
