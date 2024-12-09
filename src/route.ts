import { OpenAPIV3 } from "openapi-types";
import { isOfKind } from "valibot";

import type {
  ContentWithSchema,
  DescribeRouteOptions,
  OpenAPIRouteHandlerConfig,
} from "./types.ts";
// @ts-expect-error: JSR requires that we have .ts extensions
import { resolver } from "./valibot.ts";

export type DescribedRoute = {
  metadata: Record<string, string>;
  method: DescribeRouteOptions["method"];
  path: string;
  resolver: (config: OpenAPIRouteHandlerConfig) => Promise<{
    components: unknown;
    docs: unknown;
  }>;
};

type HandleSchemaOptions = {
  components: Record<string, unknown>;
  config: OpenAPIRouteHandlerConfig;
};

/** describeRoute
 * Creates a route description that will be used by getOpenAPISpecs to combine
 * into a single OpenAPI spec document.
 *
 * @returns DescribedRoute - Route description for getOpenAPISpecs
 */
export function describeRoute(
  path: string,
  { method, ...specs }: DescribeRouteOptions,
): DescribedRoute {
  return {
    metadata: {},
    method,
    path,
    async resolver(config: OpenAPIRouteHandlerConfig) {
      const docs = { ...specs };
      const components = {};

      if (docs.requestBody) {
        await handleSchema(docs.requestBody, { components, config });
      }

      if (docs.responses) {
        for (const key of Object.keys(docs.responses)) {
          const response = docs.responses[key];

          await handleSchema(response, {
            components,
            config,
          });
        }
      }

      return { components, docs };
    },
  };
}

async function handleSchema<T extends ContentWithSchema>(
  doc: OpenAPIV3.ReferenceObject | T | undefined,
  { components, config }: HandleSchemaOptions,
) {
  if (!doc) return;
  if (!("content" in doc)) return;

  for (const [, raw] of Object.entries("content" in doc ? doc.content : {})) {
    if (!raw) continue;

    if (raw.schema && "kind" in raw.schema && isOfKind("schema", raw.schema)) {
      const { builder } = resolver(raw.schema);
      const result = await builder(config);

      raw.schema = result.schema;

      if (result.components) {
        components = {
          ...components,
          ...result.components,
        };
      }
    }
  }
}
