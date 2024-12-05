import { expect, test } from "vitest";

import { main } from "../src/index";

test("Test test", async () => {
  const fn = main();
  const spec = await fn();
  console.dir(JSON.stringify(spec));

  expect(true).toEqual(true);
});
