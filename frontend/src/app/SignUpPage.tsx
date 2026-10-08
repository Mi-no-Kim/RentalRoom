import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router";

type Field = "loginId" | "password" | "familyName" | "givenName" | "nickname";
type Values = Record<Field, string>;
type Errors = Record<Field, string | null>;
type AvailabilityField = "loginId" | "nickname";
type Availability = {
  value: string;
  status: "checking" | "available" | "used" | "error";
};

const initialValues: Values = {
  loginId: "",
  password: "",
  familyName: "",
  givenName: "",
  nickname: "",
};

const fields: { name: Field; label: string; guide: string }[] = [
  { name: "loginId", label: "아이디", guide: "영문 소문자와 숫자 6~20자" },
  {
    name: "password",
    label: "비밀번호",
    guide: "공백 없는 영문·숫자·기호 8~32자, 두 종류 이상 조합",
  },
  { name: "familyName", label: "성", guide: "완성형 한글 1~12자" },
  { name: "givenName", label: "이름", guide: "완성형 한글 1~12자" },
  {
    name: "nickname",
    label: "닉네임",
    guide: "한글·영문·숫자·_·- 중 2~12자",
  },
];

function validateField(field: Field, value: string): string | null {
  if (!value) return "필수 입력 항목입니다.";

  switch (field) {
    case "loginId":
      return /^[a-z0-9]{6,20}$/.test(value)
        ? null
        : "영문 소문자와 숫자로 6~20자 입력해 주세요.";
    case "password": {
      const kinds = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(
        (pattern) => pattern.test(value),
      ).length;
      return /^[!-~]{8,32}$/.test(value) && kinds >= 2
        ? null
        : "공백 없이 보이는 영문·숫자·기호 8~32자로, 두 종류 이상 조합해 주세요.";
    }
    case "familyName":
    case "givenName":
      return /^[가-힣]{1,12}$/.test(value)
        ? null
        : "완성형 한글로 1~12자 입력해 주세요.";
    case "nickname":
      return /^[가-힣A-Za-z0-9_-]{2,12}$/.test(value)
        ? null
        : "한글·영문·숫자·_·-로 2~12자 입력해 주세요.";
  }
}

function useAvailability(
  field: AvailabilityField,
  value: string,
  composing: boolean,
) {
  const [result, setResult] = useState<Availability | null>(null);
  const [urgent, setUrgent] = useState<{
    value: string;
    sequence: number;
  } | null>(null);
  const current = !composing && result?.value === value ? result : null;

  useEffect(() => {
    if (composing || validateField(field, value)) return;

    let active = true;
    const controller = new AbortController();
    const timer = window.setTimeout(
      async () => {
        setResult({ value, status: "checking" });
        try {
          const query = new URLSearchParams({ field, value });
          const response = await fetch(`/api/members/availability?${query}`, {
            signal: controller.signal,
          });
          if (!response.ok) throw new Error("Availability request failed");
          const body: { available: boolean } = await response.json();
          if (typeof body.available !== "boolean") {
            throw new Error("Invalid availability response");
          }
          if (active) {
            setResult({ value, status: body.available ? "available" : "used" });
          }
        } catch {
          if (active) setResult({ value, status: "error" });
        }
      },
      urgent?.value === value ? 0 : 500,
    );

    return () => {
      active = false;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [field, value, composing, urgent]);

  function checkOnBlur() {
    if (
      !validateField(field, value) &&
      (!current || current.status === "error")
    ) {
      setUrgent((previous) => ({
        value,
        sequence: (previous?.sequence ?? 0) + 1,
      }));
    }
  }

  return { result: current, checkOnBlur, resetUrgency: () => setUrgent(null) };
}

export function SignUpPage() {
  const [values, setValues] = useState<Values>(initialValues);
  const [errors, setErrors] = useState<Errors>({
    loginId: null,
    password: null,
    familyName: null,
    givenName: null,
    nickname: null,
  });
  const [composing, setComposing] = useState({
    loginId: false,
    nickname: false,
  });
  const loginIdCheck = useAvailability(
    "loginId",
    values.loginId,
    composing.loginId,
  );
  const nicknameCheck = useAvailability(
    "nickname",
    values.nickname,
    composing.nickname,
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = Object.fromEntries(
      fields.map(({ name }) => [name, validateField(name, values[name])]),
    ) as Errors;
    setErrors(nextErrors);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:py-20">
      <div className="mx-auto max-w-xl">
        <Link
          className="text-sm text-sky-300 underline-offset-4 hover:underline"
          to="/"
        >
          홈으로
        </Link>
        <h1 className="mt-8 text-3xl font-bold">회원가입</h1>
        <p className="mt-3 text-slate-300">
          입력 규칙에 맞게 작성해 주세요. 아이디와 닉네임은 각각 중복될 수
          없습니다.
        </p>

        <form className="mt-8 space-y-5" noValidate onSubmit={handleSubmit}>
          {fields.map(({ name, label, guide }) => {
            const check =
              name === "loginId"
                ? loginIdCheck
                : name === "nickname"
                  ? nicknameCheck
                  : null;
            const availabilityMessage =
              check?.result?.status === "checking"
                ? "중복 확인 중입니다."
                : check?.result?.status === "available"
                  ? "사용할 수 있습니다."
                  : check?.result?.status === "used"
                    ? "이미 사용 중입니다."
                    : check?.result?.status === "error"
                      ? "중복 확인에 실패했습니다. 다시 입력하거나 나중에 시도해 주세요."
                      : null;
            const invalid = !!errors[name] || check?.result?.status === "used";

            return (
              <div key={name}>
                <label className="block font-semibold" htmlFor={name}>
                  {label}
                </label>
                <input
                  aria-describedby={`${name}-help${errors[name] ? ` ${name}-error` : ""}${availabilityMessage ? ` ${name}-availability` : ""}`}
                  aria-invalid={invalid}
                  autoComplete={
                    name === "password"
                      ? "new-password"
                      : name === "familyName"
                        ? "family-name"
                        : name === "givenName"
                          ? "given-name"
                          : name === "nickname"
                            ? "nickname"
                            : "username"
                  }
                  className="mt-2 block w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white outline-none focus-visible:border-sky-300 focus-visible:ring-2 focus-visible:ring-sky-300/30 aria-invalid:border-rose-400"
                  id={name}
                  name={name}
                  onBlur={() => {
                    setErrors((current) => ({
                      ...current,
                      [name]: validateField(name, values[name]),
                    }));
                    check?.checkOnBlur();
                  }}
                  onChange={(event) => {
                    setValues((current) => ({
                      ...current,
                      [name]: event.target.value,
                    }));
                    setErrors((current) => ({ ...current, [name]: null }));
                    check?.resetUrgency();
                  }}
                  onCompositionEnd={() => {
                    if (check) {
                      setComposing((current) => ({
                        ...current,
                        [name]: false,
                      }));
                    }
                  }}
                  onCompositionStart={() => {
                    if (check) {
                      setComposing((current) => ({ ...current, [name]: true }));
                    }
                  }}
                  type={name === "password" ? "password" : "text"}
                  value={values[name]}
                />
                <p className="mt-2 text-sm text-slate-400" id={`${name}-help`}>
                  {guide}
                </p>
                {errors[name] && (
                  <p
                    className="mt-1 text-sm text-rose-300"
                    id={`${name}-error`}
                    role="alert"
                  >
                    {errors[name]}
                  </p>
                )}
                {availabilityMessage && (
                  <p
                    className={`mt-1 text-sm ${check?.result?.status === "available" ? "text-emerald-300" : check?.result?.status === "used" ? "text-rose-300" : "text-slate-300"}`}
                    id={`${name}-availability`}
                    role={check?.result?.status === "used" ? "alert" : "status"}
                  >
                    {availabilityMessage}
                  </p>
                )}
              </div>
            );
          })}

          <button
            className="w-full rounded-lg bg-sky-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300"
            type="submit"
          >
            가입하기
          </button>
        </form>
      </div>
    </main>
  );
}
