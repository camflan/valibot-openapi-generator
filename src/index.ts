import * as v from "valibot";
import { describeRoute } from "./route";
import { openAPISpecs } from "./openapi";

export function main() {
  const schema = v.object({
    name: v.string(),
  });

  const route = describeRoute({
    description: "Test test test",
    responses: {
      200: {
        description: "test 200 response?",
        content: {
          "application/json": {
            schema,
          },
        },
      },
    },
  });

  const specs = openAPISpecs({ routes: [route] });

  return specs;
}
