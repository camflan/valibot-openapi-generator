import type {
  DescribeRouteOptions,
  OpenAPIRouteHandlerConfig,
} from "./types.ts";

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

            if (raw.schema && "builder" in raw.schema) {
              const result = await raw.schema.builder(config);

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
