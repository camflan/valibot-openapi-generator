import { expect, test } from "vitest";

import { main } from "../src/index";

test("Test test", async () => {
  const spec = await main();
  console.dir(JSON.stringify(spec));

  expect(true).toEqual(true);
});
