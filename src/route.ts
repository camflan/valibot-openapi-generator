import { isOfKind } from "valibot";

import type {
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
      let components = {};

      if (docs.responses) {
        for (const key of Object.keys(docs.responses)) {
          const response = docs.responses[key];

          if (!response) continue;
          if (!("content" in response)) continue;

          for (const [, raw] of Object.entries(
            "content" in response ? response.content : {},
          )) {
            if (!raw) continue;

            if (
              raw.schema &&
              "kind" in raw.schema &&
              isOfKind("schema", raw.schema)
            ) {
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
      }

      return { components, docs };
    },
  };
}
