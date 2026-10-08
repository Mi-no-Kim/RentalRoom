import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

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
    vi.useRealTimers();
    vi.unstubAllGlobals();
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

  it("유효한 아이디만 입력을 멈춘 뒤 조회한다", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ available: false }),
    });
    vi.stubGlobal("fetch", fetchMock);
    renderSignUp();

    const loginId = screen.getByRole("textbox", { name: "아이디" });
    fireEvent.change(loginId, { target: { value: "Rental1" } });
    await act(async () => vi.advanceTimersByTimeAsync(600));
    expect(fetchMock).not.toHaveBeenCalled();

    fireEvent.change(loginId, { target: { value: "rental1" } });
    await act(async () => vi.advanceTimersByTimeAsync(499));
    expect(fetchMock).not.toHaveBeenCalled();
    await act(async () => vi.advanceTimersByTimeAsync(1));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(
      "/api/members/availability?field=loginId&value=rental1",
    );
    expect(loginId).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("이미 사용 중입니다.")).toBeInTheDocument();
  });

  it("한글 조합 중에는 조회하지 않고 입력칸을 떠나면 즉시 조회한다", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ available: true }),
    });
    vi.stubGlobal("fetch", fetchMock);
    renderSignUp();

    const nickname = screen.getByRole("textbox", { name: "닉네임" });
    fireEvent.compositionStart(nickname);
    fireEvent.change(nickname, { target: { value: "가나다" } });
    await act(async () => vi.advanceTimersByTimeAsync(600));
    expect(fetchMock).not.toHaveBeenCalled();

    fireEvent.compositionEnd(nickname);
    fireEvent.blur(nickname);
    await act(async () => vi.advanceTimersByTimeAsync(0));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(
      "/api/members/availability?field=nickname&value=%EA%B0%80%EB%82%98%EB%8B%A4",
    );
    expect(screen.getByText("사용할 수 있습니다.")).toBeInTheDocument();
  });

  it("값을 바꾼 뒤 도착한 이전 조회 결과를 무시한다", async () => {
    vi.useFakeTimers();
    let finishFirst!: (response: {
      ok: boolean;
      json: () => Promise<unknown>;
    }) => void;
    const first = new Promise<{ ok: boolean; json: () => Promise<unknown> }>(
      (resolve) => {
        finishFirst = resolve;
      },
    );
    const fetchMock = vi
      .fn()
      .mockReturnValueOnce(first)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ available: true }),
      });
    vi.stubGlobal("fetch", fetchMock);
    renderSignUp();

    const loginId = screen.getByRole("textbox", { name: "아이디" });
    fireEvent.change(loginId, { target: { value: "rental1" } });
    await act(async () => vi.advanceTimersByTimeAsync(500));
    expect(fetchMock).toHaveBeenCalledTimes(1);

    fireEvent.change(loginId, { target: { value: "rental2" } });
    expect(screen.queryByText("중복 확인 중입니다.")).toBeNull();
    await act(async () => vi.advanceTimersByTimeAsync(500));
    expect(screen.getByText("사용할 수 있습니다.")).toBeInTheDocument();

    await act(async () =>
      finishFirst({ ok: true, json: async () => ({ available: false }) }),
    );
    expect(screen.getByText("사용할 수 있습니다.")).toBeInTheDocument();
    expect(screen.queryByText("이미 사용 중입니다.")).toBeNull();
  });
});
