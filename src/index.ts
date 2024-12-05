import * as v from "valibot";

import { describeRoute } from "./route";
import { openAPISpecs } from "./openapi";

export function main() {
  const schema = v.object({
    name: v.string(),
    users: v.array(
      v.object({
        name: v.nullish(v.string()),
        id: v.number(),
      }),
    ),
  });

  const route = describeRoute("/", {
    method: "GET",
    description: "Test test test",
    summary:
      "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.",
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

  const specs = openAPISpecs([route], {
    documentation: {
      info: {
        title: "My first schema",
        version: "2024.12.1",
      },
    },
  });

  return specs;
}
