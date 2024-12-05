import { toJsonSchema } from "@valibot/to-json-schema";
import type { ValidationTargets } from "hono";
import {
  type BaseIssue,
  type BaseSchema,
  type GenericSchema,
  type GenericSchemaAsync,
  parseAsync,
} from "valibot";

import { convert } from "./toOpenAPISchema/index.ts";
import type { OpenAPIRouteHandlerConfig, ResolverResult } from "./types.ts";
import { generateValidatorDocs } from "./utils.ts";

export function resolver<
  T extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(schema: T): ResolverResult {
  return {
    async builder() {
      return {
        schema: await convert(toJsonSchema(schema)),
      };
    },
    async validator(value) {
      await parseAsync(schema, value);
    },
  };
}

export function validator<
  T extends GenericSchema | GenericSchemaAsync,
  Target extends keyof ValidationTargets,
>(target: Target, schema: T) {
  return async (config: OpenAPIRouteHandlerConfig) =>
    // @ts-expect-error Need to fix the type
    generateValidatorDocs(target, await resolver(schema).builder(config));
}
