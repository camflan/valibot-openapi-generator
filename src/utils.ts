import type { ValidationTargets } from "hono";
import type { OpenAPIV3 } from "openapi-types";

import type { ResolverResult } from "./types.ts";

export const uniqueSymbol = Symbol("openapi");

export async function generateValidatorDocs<
  Target extends keyof ValidationTargets,
>(target: Target, _result: ReturnType<ResolverResult["builder"]>) {
  const result = await _result;
  const docs: Pick<OpenAPIV3.OperationObject, "parameters" | "requestBody"> =
    {};

  if (target === "form" || target === "json") {
    docs.requestBody = {
      content: {
        [target === "json"
          ? "application/json"
          : "application/x-www-form-urlencoded"]: {
          schema: result.schema,
        },
      },
    };
  } else {
    const parameters: (
      | OpenAPIV3.ParameterObject
      | OpenAPIV3.ReferenceObject
    )[] = [];

    if ("$ref" in result.schema) {
      parameters.push({
        in: target,
        name: result.schema.$ref,
        schema: result.schema,
      });
    } else {
      for (const [key, value] of Object.entries(
        result.schema.properties ?? {},
      )) {
        parameters.push({
          in: target,
          name: key,
          required: result.schema.required?.includes(key),
          schema: value,
        });
      }
    }

    docs.parameters = parameters;
  }

  return { components: result.components, docs };
}
