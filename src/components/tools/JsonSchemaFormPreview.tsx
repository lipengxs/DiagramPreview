"use client";

import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import {useMemo, useState} from "react";
import type {RJSFSchema, UiSchema} from "@rjsf/utils";

type JsonSchemaFormPreviewProps = {
  schema: RJSFSchema;
  locale: string;
};

export function JsonSchemaFormPreview({schema, locale}: JsonSchemaFormPreviewProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>(() => initialFormData(schema));
  const copy = getCopy(locale);
  const uiSchema = useMemo<UiSchema>(() => buildUiSchema(schema), [schema]);
  const propertyCount = schema.properties && typeof schema.properties === "object" ? Object.keys(schema.properties).length : 0;
  const requiredCount = Array.isArray(schema.required) ? schema.required.length : 0;

  return (
    <div className="grid gap-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">{copy.eyebrow}</p>
        <h2 className="mt-2 text-xl font-bold text-ink">{String(schema.title || copy.title)}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {schema.description ? String(schema.description) : copy.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-primary">
            {propertyCount} {copy.fields}
          </span>
          <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
            {requiredCount} {copy.required}
          </span>
          <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">{copy.localOnly}</span>
        </div>
      </div>

      <div className="json-schema-form-preview rounded-lg border border-slate-200 bg-white p-4">
        <Form
          schema={schema}
          uiSchema={uiSchema}
          validator={validator}
          formData={formData}
          liveValidate={false}
          noHtml5Validate
          onChange={(event: {formData?: unknown}) => setFormData((event.formData || {}) as Record<string, unknown>)}
        >
          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200 pt-4">
            <button className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-semibold text-white hover:bg-blue-700" type="submit">
              {copy.previewSubmit}
            </button>
            <button
              className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              type="button"
              onClick={() => setFormData(initialFormData(schema))}
            >
              {copy.reset}
            </button>
          </div>
        </Form>
      </div>

      <details className="rounded-lg border border-slate-200 bg-white p-4">
        <summary className="cursor-pointer text-sm font-semibold text-ink">{copy.formData}</summary>
        <pre className="mt-3 max-h-64 overflow-auto rounded-md bg-slate-950 p-4 text-xs leading-6 text-slate-100">
          {JSON.stringify(formData, null, 2)}
        </pre>
      </details>
    </div>
  );
}

function buildUiSchema(schema: RJSFSchema): UiSchema {
  const properties = schema.properties && typeof schema.properties === "object" ? schema.properties : {};
  const uiSchema: UiSchema = {};

  for (const [key, value] of Object.entries(properties)) {
    const property = value as RJSFSchema;
    if (property.type === "string" && (property.format === "textarea" || String(property.description || "").length > 80)) {
      uiSchema[key] = {"ui:widget": "textarea"};
    }
    if (property.type === "string" && property.format === "password") {
      uiSchema[key] = {"ui:widget": "password"};
    }
  }

  return uiSchema;
}

function initialFormData(schema: RJSFSchema): Record<string, unknown> {
  if (schema.default && typeof schema.default === "object" && !Array.isArray(schema.default)) {
    return schema.default as Record<string, unknown>;
  }

  const data: Record<string, unknown> = {};
  const properties = schema.properties && typeof schema.properties === "object" ? schema.properties : {};

  for (const [key, value] of Object.entries(properties)) {
    const property = value as RJSFSchema;
    if ("default" in property) {
      data[key] = property.default;
    }
  }

  return data;
}

function getCopy(locale: string) {
  return locale.startsWith("zh")
    ? {
        eyebrow: "真实表单预览",
        title: "生成的 JSON Schema 表单",
        description: "这个表单由 JSON Schema 在浏览器本地生成，可用来检查字段、必填项、枚举、默认值和嵌套结构。",
        fields: "个字段",
        required: "个必填",
        localOnly: "本地渲染",
        previewSubmit: "预览提交",
        reset: "重置默认值",
        formData: "当前表单数据"
      }
    : {
        eyebrow: "Live form preview",
        title: "Generated JSON Schema form",
        description: "This form is generated locally from JSON Schema so you can inspect fields, required markers, enums, defaults, and nested structures.",
        fields: "fields",
        required: "required",
        localOnly: "Local render",
        previewSubmit: "Preview submit",
        reset: "Reset defaults",
        formData: "Current form data"
      };
}
