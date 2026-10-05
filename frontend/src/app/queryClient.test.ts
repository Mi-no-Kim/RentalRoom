import { describe, expect, it } from "vitest";

import { createQueryClient } from "./queryClient";

describe("createQueryClient", () => {
  it("학습 중에는 숨은 재시도를 만들지 않는다", () => {
    const queryClient = createQueryClient();
    const defaults = queryClient.getDefaultOptions();

    expect(defaults.queries?.retry).toBe(false);
    expect(defaults.queries?.refetchOnWindowFocus).toBe(false);
    expect(defaults.mutations?.retry).toBe(false);
  });
});
