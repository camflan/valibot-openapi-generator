import type { OpenAPIV3 } from "openapi-types";

import type { OpenAPIRoute } from "./types.ts";

export const ALLOWED_METHODS = [
  "GET",
  "PUT",
  "POST",
  "DELETE",
  "OPTIONS",
  "HEAD",
  "PATCH",
  "TRACE",
] as const;

export type AllowedMethod = (typeof ALLOWED_METHODS)[number];

export function toOpenAPIPath(path: string) {
  return path
    .split("/")
    .map((x) => {
      let tmp = x;
      if (tmp.startsWith(":")) {
        tmp = tmp.slice(1, tmp.length);
        if (tmp.endsWith("?")) tmp = tmp.slice(0, -1);
        tmp = `{${tmp}}`;
      }

      return tmp;
    })
    .join("/");
}

export const capitalize = (word: string) =>
  word.charAt(0).toUpperCase() + word.slice(1);

export function filterPaths(
  paths: OpenAPIV3.PathsObject,
  {
    exclude = [],
    excludeStaticFile = true,
  }: {
    exclude: (RegExp | string)[];
    excludeStaticFile: boolean;
  },
) {
  const newPaths: OpenAPIV3.PathsObject = {};

  for (const [key, value] of Object.entries(paths)) {
    if (!value) continue;

    if (
      !exclude.some((x) => {
        if (typeof x === "string") return key === x;

        return x.test(key);
      }) &&
      !key.includes("*") &&
      (excludeStaticFile ? !key.includes(".") : true)
    ) {
      for (const method of Object.keys(value)) {
        const schema = value[method as keyof typeof value];

        if (!schema || typeof schema === "string" || Array.isArray(schema)) {
          console.error("invalid schema type?", schema);
          continue;
        }

        // TODO: Do we need to support this?
        // If so we need to resolve types
        //
        if (key.includes("{")) {
          if (!("parameters" in schema) || !schema.parameters) {
            schema.parameters = [];
          }

          schema.parameters = [
            ...key
              .split("/")
              .filter(
                (x) =>
                  x.startsWith("{") &&
                  !schema.parameters?.find(
                    (params) =>
                      params["in"] === "path" &&
                      params["name"] === x.slice(1, x.length - 1),
                  ),
              )
              .map((x) => ({
                in: "path",
                name: x.slice(1, x.length - 1),
                required: true,
                schema: { type: "string" as const },
              })),
            ...schema.parameters,
          ];
        }

        if (!schema.responses)
          schema.responses = {
            200: { description: "" },
          };
      }

      newPaths[key] = value;
    }
  }

  return newPaths;
}

export function generateOperationId(method: string, paths: string) {
  let operationId = method;

  if (paths === "/") return `${operationId}Index`;

  for (const path of paths.split("/")) {
    if (path.charCodeAt(0) === 123) {
      operationId += `By${capitalize(path.slice(1, -1))}`;
    } else {
      operationId += capitalize(path);
    }
  }

  return operationId;
}

export function registerSchemaPath({
  data,
  method: _method,
  path,
  schema,
}: OpenAPIRoute & {
  schema: Partial<OpenAPIV3.PathsObject>;
}) {
  path = toOpenAPIPath(path);
  const method = _method.toLowerCase() as Lowercase<OpenAPIRoute["method"]>;

  schema[path] = {
    ...(schema[path] ? schema[path] : {}),
    [method]: {
      ...(schema[path]?.[method] ?? {}),
      operationId: generateOperationId(method, path),
      ...data,
    } satisfies OpenAPIV3.OperationObject,
  };
}
