import type { DescribeRouteOptions, OpenAPIRouteHandlerConfig } from "./types";
import { resolver } from "./valibot";

export function describeRoute(
  path: string,
  { method, ...specs }: DescribeRouteOptions,
) {
  return {
    path,
    method,
    metadata: {},
    async resolver(config: OpenAPIRouteHandlerConfig) {
      const docs = { ...specs };
      let components = {};

      if (docs.responses) {
        for (const key of Object.keys(docs.responses)) {
          const response = docs.responses[key];
          if (response && !("content" in response)) continue;

          for (const contentKey of Object.keys(response.content ?? {})) {
            const raw = response.content?.[contentKey];

            if (!raw) continue;

            if (raw.schema) {
              // @ts-expect-error
              const withResolver = resolver(raw.schema);
              const result = await withResolver.builder(config);
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

      return { docs, components };
    },
  } as const;
}

export type DescribedRoute = ReturnType<typeof describeRoute>;
