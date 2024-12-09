import type { OpenAPIV3 } from "openapi-types";

// @ts-expect-error: JSR requires that we have .ts extensions
import { ALLOWED_METHODS, filterPaths, registerSchemaPath } from "./helper.ts";
import type { DescribedRoute } from "./route.ts";
import type {
  HandlerResponse,
  OpenAPIRoute,
  OpenAPIRouteHandlerConfig,
  OpenApiSpecsOptions,
} from "./types.ts";

const DEFAULT_TITLE = "Valibot schema documentation";
const DEFAULT_DESCRIPTION = "Development documentation";

/**
 * Combines DescribedRoutes into a single OpenAPI document.
 *
 * @returns OpenAPIV3.Document
 */
export async function getOpenAPISpecs(
  routes: DescribedRoute[],
  {
    documentation = {},
    exclude = [],
    excludeMethods = ["OPTIONS"],
    excludeStaticFile = true,
    excludeTags = [],
  }: OpenApiSpecsOptions = {
    documentation: {},
    exclude: [],
    excludeMethods: ["OPTIONS"],
    excludeStaticFile: true,
    excludeTags: [],
  },
): Promise<OpenAPIV3.Document> {
  const config: OpenAPIRouteHandlerConfig = {
    components: {},
    version: "3.1.0",
  };
  const schema: OpenAPIV3.PathsObject = {};

  for await (const route of routes) {
    // Exclude methods
    if ((excludeMethods as ReadonlyArray<string>).includes(route.method)) {
      continue;
    }

    // Include only allowed methods
    if (
      (ALLOWED_METHODS as ReadonlyArray<string>).includes(route.method) ===
        false &&
      route.method !== "ALL"
    ) {
      continue;
    }

    const { metadata = {}, resolver } = route as HandlerResponse;
    const { components, docs } = await resolver({ ...config, ...metadata });

    config.components = {
      ...config.components,
      ...(components ?? {}),
    };

    if (route.method === "ALL") {
      for (const method of ALLOWED_METHODS) {
        registerSchemaPath({
          data: docs,
          method,
          path: route.path,
          schema,
        });
      }
    } else {
      registerSchemaPath({
        data: docs,
        method: route.method as OpenAPIRoute["method"],
        path: route.path,
        schema,
      });
    }
  }

  // Hide routes
  for (const path in schema) {
    for (const method in schema[path]) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if ("hide" in schema[path][method] && schema[path][method]?.hide) {
        delete schema[path][method];
      }
    }
  }

  return {
    openapi: config.version,
    ...{
      ...documentation,
      components: {
        ...documentation.components,
        schemas: {
          ...config.components,
          ...documentation.components?.schemas,
        },
      },
      info: {
        description: DEFAULT_DESCRIPTION,
        title: DEFAULT_TITLE,
        version: "0.0.0",
        ...documentation.info,
      },
      paths: {
        ...filterPaths(schema, {
          exclude: Array.isArray(exclude) ? exclude : [exclude],
          excludeStaticFile,
        }),
        ...documentation.paths,
      },
      tags:
        documentation.tags?.filter(
          (tag) => !excludeTags?.includes(tag?.name),
        ) ?? [],
    },
  } satisfies OpenAPIV3.Document;
}
