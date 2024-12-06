import * as v from "valibot";

// @ts-expect-error: JSR requires that we have .ts extensions
import { getOpenAPISpecs } from "./openapi.ts";
// @ts-expect-error: JSR requires that we have .ts extensions
import { describeRoute } from "./route.ts";
// @ts-expect-error: JSR requires that we have .ts extensions
import { resolver } from "./valibot.ts";

export function main() {
  const schema = v.object({
    name: v.string(),
    users: v.array(
      v.object({
        id: v.number(),
        name: v.nullish(v.string()),
      }),
    ),
  });

  const route = describeRoute("/", {
    description: "Test test test",
    method: "GET",
    responses: {
      200: {
        content: {
          "application/json": {
            schema: resolver(schema),
          },
        },
        description: "test 200 response?",
      },
    },
    summary:
      "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.",
  });

  return getOpenAPISpecs([route], {
    documentation: {
      info: {
        title: "My first schema",
        version: "2024.12.1",
      },
    },
  });
}
