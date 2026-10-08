import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { App } from "./App";
import { AppProviders } from "./AppProviders";

function renderSignUp() {
  window.history.replaceState(null, "", "/sign-up");
  render(
    <AppProviders>
      <App />
    </AppProviders>,
  );
}

describe("회원가입 입력", () => {
  afterEach(() => {
    cleanup();
    window.history.replaceState(null, "", "/");
  });

  it("빈 필드와 형식이 맞지 않는 값을 해당 입력칸에 표시한다", async () => {
    const user = userEvent.setup();
    renderSignUp();

    await user.type(screen.getByRole("textbox", { name: "아이디" }), "Rental1");
    await user.type(screen.getByLabelText("비밀번호"), "abcdefgh");
    await user.type(screen.getByRole("textbox", { name: "성" }), "Kim");
    await user.type(screen.getByRole("textbox", { name: "닉네임" }), "a");
    await user.click(screen.getByRole("button", { name: "가입하기" }));

    expect(screen.getByRole("textbox", { name: "아이디" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByLabelText("비밀번호")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByRole("textbox", { name: "성" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByRole("textbox", { name: "이름" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByRole("textbox", { name: "닉네임" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getAllByRole("alert")).toHaveLength(5);
  });

  it("값을 고친 뒤 입력칸을 떠나면 오류를 지운다", async () => {
    const user = userEvent.setup();
    renderSignUp();

    const loginId = screen.getByRole("textbox", { name: "아이디" });
    await user.type(loginId, "Rental1");
    await user.tab();
    expect(loginId).toHaveAttribute("aria-invalid", "true");

    await user.clear(loginId);
    await user.type(loginId, "rental1");
    await user.tab();

    expect(loginId).toHaveAttribute("aria-invalid", "false");
    expect(within(loginId.parentElement!).queryByRole("alert")).toBeNull();
  });
});
