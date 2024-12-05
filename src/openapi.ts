import type { OpenAPIV3 } from "openapi-types";
import { ALLOWED_METHODS, filterPaths, registerSchemaPath } from "./helper";
import type { DescribedRoute } from "./route";
import type {
  HandlerResponse,
  OpenAPIRoute,
  OpenAPIRouteHandlerConfig,
  OpenApiSpecsOptions,
} from "./types";

const DEFAULT_TITLE = "Valibot schema documentation";
const DEFAULT_DESCRIPTION = "Development documentation";

export function openAPISpecs(
  routes: DescribedRoute[],
  {
    documentation = {},
    excludeStaticFile = true,
    exclude = [],
    excludeMethods = ["OPTIONS"],
    excludeTags = [],
  }: OpenApiSpecsOptions = {
    documentation: {},
    excludeStaticFile: true,
    exclude: [],
    excludeMethods: ["OPTIONS"],
    excludeTags: [],
  },
) {
  const config: OpenAPIRouteHandlerConfig = {
    version: "3.1.0",
    components: {},
  };
  const schema: OpenAPIV3.PathsObject = {};

  let specs: OpenAPIV3.Document | null = null;

  return async () => {
    for await (const route of routes) {
      // Exclude methods
      if ((excludeMethods as ReadonlyArray<string>).includes(route.method)) {
        console.log(`Excluding [${route.method}]: ${route.path}`);
        continue;
      }

      // Include only allowed methods
      if (
        (ALLOWED_METHODS as ReadonlyArray<string>).includes(route.method) ===
          false &&
        route.method !== "ALL"
      ) {
        console.log(`Excluding [${route.method}]: ${route.path}`);
        continue;
      }

      const { resolver, metadata = {} } = route as HandlerResponse;
      const { docs, components } = await resolver({ ...config, ...metadata });

      config.components = {
        ...config.components,
        ...(components ?? {}),
      };

      if (route.method === "ALL") {
        for (const method of ALLOWED_METHODS) {
          registerSchemaPath({
            path: route.path,
            data: docs,
            method,
            schema,
          });
        }
      } else {
        registerSchemaPath({
          method: route.method as OpenAPIRoute["method"],
          path: route.path,
          data: docs,
          schema,
        });
      }
    }

    // Hide routes
    for (const path in schema) {
      for (const method in schema[path]) {
        if (schema[path][method]?.hide) {
          delete schema[path][method];
        }
      }
    }

    specs = {
      openapi: config.version,
      ...{
        ...documentation,
        tags: documentation.tags?.filter(
          (tag) => !excludeTags?.includes(tag?.name),
        ),
        info: {
          title: DEFAULT_TITLE,
          description: DEFAULT_DESCRIPTION,
          version: "0.0.0",
          ...documentation.info,
        },
        paths: {
          ...filterPaths(schema, {
            excludeStaticFile,
            exclude: Array.isArray(exclude) ? exclude : [exclude],
          }),
          ...documentation.paths,
        },
        components: {
          ...documentation.components,
          schemas: {
            ...config.components,
            ...documentation.components?.schemas,
          },
        },
      },
    } satisfies OpenAPIV3.Document;

    return specs;
  };
}
