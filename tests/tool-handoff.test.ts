import assert from "node:assert/strict";
import {test} from "node:test";
import {boundedSourceUrl, MAX_SOURCE_FRAGMENT_BYTES, sharedSourceFromUrl, sourceFragmentBytes} from "../src/lib/source-links";
import {sourceFile, toolHandoff} from "../src/lib/tool-handoff";

test("fragment budget includes #source= and percent encoded UTF-8, preserving exact boundary", () => {
  const atLimit = "a".repeat(MAX_SOURCE_FRAGMENT_BYTES - "#source=".length);
  assert.equal(sourceFragmentBytes(atLimit), MAX_SOURCE_FRAGMENT_BYTES);
  assert.equal(boundedSourceUrl("/en/mermaid-preview", atLimit).tooLarge, false);
  assert.equal(boundedSourceUrl("/en/mermaid-preview", atLimit + "a").tooLarge, true);
  assert.equal(sourceFragmentBytes("中文🙂"), "#source=".length + 9 + 9 + 12);
  const unicode = "中文🙂".repeat(1100);
  assert.equal(Buffer.byteLength(unicode) < MAX_SOURCE_FRAGMENT_BYTES, true);
  assert.deepEqual(boundedSourceUrl("/en/drawio-preview", unicode), {href: "/en/drawio-preview", tooLarge: true});
});

test("compatible tools preserve exact source, locale paths and special characters", () => {
  for (const [slug, target, source] of [
    ["mermaid-to-drawio", "mermaid-preview", 'flowchart LR\n A["中文 & + #%🙂"] --> B'],
    ["mermaid-preview", "mermaid-to-drawio", "flowchart LR\n A --> B"],
    ["plantuml-preview", "plantuml-to-drawio", "@startuml\nAlice -> Bob: 中文\n@enduml"]
  ]) {
    const handoff = toolHandoff({slug, source, current: false}, target);
    assert.equal(handoff.kind, "source");
    assert.equal(sharedSourceFromUrl(`https://diagrampreview.com${handoff.href}`), source);
    assert.equal(handoff.file?.content, source);
  }
});

test("viewer receives only current converted XML and never Mermaid or stale artifacts", () => {
  const artifact = {filename: "diagram.drawio", mime: "application/xml", content: '<mxfile name="中文"/>'};
  for (const slug of ["mermaid-to-drawio", "plantuml-to-drawio"]) {
    const input = {slug, source: "source", artifact, current: true};
    const valid = toolHandoff(input, "drawio-preview");
    assert.equal(sharedSourceFromUrl(`https://diagrampreview.com${valid.href}`), artifact.content);
    for (const invalid of [{...input, current: false}, {...input, artifact: undefined}]) {
      const handoff = toolHandoff(invalid, "drawio-preview");
      assert.equal(handoff.kind, "unavailable");
      assert.equal(handoff.file, undefined);
      assert.equal(handoff.href, "/drawio-preview");
    }
  }
});

test("incompatible tools stay clean and oversized artifacts remain available as exact downloads", () => {
  for (const [slug, target] of [["mermaid-to-drawio", "plantuml-to-drawio"], ["drawio-preview", "drawio-to-svg"], ["mermaid-preview", "text-to-mermaid"]]) {
    const handoff = toolHandoff({slug, source: "private", current: true}, target);
    assert.equal(handoff.kind, "none");
    assert.equal(handoff.href, `/${target}`);
  }
  const artifact = {filename: "diagram.drawio", mime: "application/xml", content: `<mxfile>${"中文".repeat(2000)}</mxfile>`};
  const handoff = toolHandoff({slug: "mermaid-to-drawio", source: "source", current: true, artifact}, "drawio-preview");
  assert.equal(handoff.tooLarge, true);
  assert.equal(handoff.href, "/drawio-preview");
  assert.equal(handoff.file, artifact);
  assert.equal(sourceFile("mermaid-to-drawio", "source").filename, "mermaid-to-drawio-source.mmd");
  assert.equal(sourceFile("plantuml-to-drawio", "source").filename, "plantuml-to-drawio-source.puml");
});
