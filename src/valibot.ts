import { toJsonSchema } from "@valibot/to-json-schema";
import { type BaseIssue, type BaseSchema, parseAsync } from "valibot";

// @ts-expect-error: JSR requires that we have .ts extensions
import { convert } from "./toOpenAPISchema/index.ts";
import type { ResolverResult } from "./types.ts";

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
