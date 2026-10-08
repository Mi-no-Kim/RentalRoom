import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { App } from "./App";
import { AppProviders } from "./AppProviders";

describe("App", () => {
  afterEach(() => {
    cleanup();
    window.history.replaceState(null, "", "/");
  });

  it("REST API 학습 목적을 안내한다", () => {
    render(
      <AppProviders>
        <App />
      </AppProviders>,
    );

    expect(
      screen.getByRole("heading", {
        name: "Spring REST API를 정직하게 보여주는 클라이언트",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "프런트엔드 기반 원칙" }),
    ).toBeInTheDocument();
  });

  it("홈에서 회원가입 화면으로 이동한다", async () => {
    const user = userEvent.setup();
    render(
      <AppProviders>
        <App />
      </AppProviders>,
    );

    await user.click(screen.getByRole("link", { name: "회원가입" }));

    expect(
      screen.getByRole("heading", { name: "회원가입" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "아이디" })).toBeInTheDocument();
  });

  it("알 수 없는 경로에서 홈으로 돌아갈 수 있다", async () => {
    window.history.replaceState(null, "", "/unknown");
    const user = userEvent.setup();

    render(
      <AppProviders>
        <App />
      </AppProviders>,
    );

    expect(
      screen.getByRole("heading", { name: "페이지를 찾을 수 없습니다" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "홈으로 돌아가기" }));

    expect(
      screen.getByRole("heading", {
        name: "Spring REST API를 정직하게 보여주는 클라이언트",
      }),
    ).toBeInTheDocument();
  });
});
