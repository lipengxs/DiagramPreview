import assert from "node:assert/strict";
import {test} from "node:test";
import {buildMetadata} from "../src/lib/seo";
import {renderD2Preview} from "../src/lib/renderers/d2";
import {evidenceFamilies} from "../src/config/tool-evidence";
import {readFileSync, existsSync} from "node:fs";
import {resolve} from "node:path";

test("page locale eligibility controls reciprocal alternates and canonical fallback", () => {
  const input = {locale: "en" as const, path: "/en/workflows/example", title: "Title", description: "Description", pageLocales: ["en"] as const};
  const english = buildMetadata(input);
  assert.deepEqual(english.alternates?.languages, {en: "https://diagrampreview.com/en/workflows/example", "x-default": "https://diagrampreview.com/en/workflows/example"});
  const translated = buildMetadata({...input, locale: "zh-CN", path: "/zh-CN/workflows/example"});
  assert.equal(translated.alternates?.languages, undefined);
  assert.equal(translated.alternates?.canonical, english.alternates?.canonical);
  assert.deepEqual(translated.robots, {index: false, follow: true});
  const blog = buildMetadata({...input, pageLocales: ["en", "zh-CN"], path: "/en/blog/example"});
  assert.deepEqual(Object.keys(blog.alternates?.languages || {}), ["en", "zh-CN", "x-default"]);
});

test("D2 examples preserve flat labels, relationships and XML escaping", () => {
  const svg = renderD2Preview(evidenceFamilies.d2.cases[1].source);
  assert.equal((svg.match(/marker-end=/g) || []).length, 4);
  for (const label of ["Web app", "Order API", "Database", "Event queue", "Worker", "HTTPS", "SQL", "publish", "consume"]) assert.ok(svg.includes(label));
  assert.match(renderD2Preview('api: A & B\napi -> db'), /A &amp; B/);
});

test("D2 subset rejects unsupported syntax instead of silently drawing it as nodes", () => {
  for (const source of [evidenceFamilies.d2.cases[2].source, "direction: right\nA -> B", "A <-> B", "A--B", "A ->", "A: test\nA.style.fill: red", "shape: sequence_diagram\nA -> B", "A; B"]) assert.throws(() => renderD2Preview(source), /Unsupported D2 syntax/);
  assert.throws(() => renderD2Preview(Array.from({length:101}, (_,i)=>`n${i}`).join("\n")), /100 nodes/);
  assert.throws(() => renderD2Preview(Array.from({length:201}, ()=>"a -> b").join("\n")), /200 relationships/);
});

test("published evidence inputs match loadable source and successful cases have actual export files", () => {
  for (const [familyId, family] of Object.entries(evidenceFamilies)) {
    for (const example of family.cases) {
      const path = resolve(`public/examples/${familyId}/${example.id}`);
      assert.equal(readFileSync(`${path}.${family.extension}`, "utf8"), example.source);
      if (example.id === "failure") {
        assert.equal(existsSync(`${path}.svg`), false);
        assert.equal(existsSync(`${path}.png`), false);
      } else {
        assert.match(readFileSync(`${path}.svg`, "utf8"), /<svg/);
        assert.equal(readFileSync(`${path}.png`).subarray(1,4).toString(), "PNG");
        if ("xmlResult" in family && family.xmlResult) assert.match(readFileSync(`${path}.drawio`, "utf8"), /<mxGraphModel/);
      }
    }
  }
});
