import { expect, test } from "vitest";

import { main } from "../src/index";

test("Test test", async () => {
  const fn = main();
  console.dir(await fn());

  expect(true).toEqual(true);
});
