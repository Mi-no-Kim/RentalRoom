import { Link, Route, Routes } from "react-router";

const foundations = [
  {
    label: "HTTP 피드백",
    title: "응답 상태를 숨기지 않습니다",
    description:
      "loading, empty, error, success를 분리하고 상태 코드와 오류 사유를 화면에 연결합니다.",
  },
  {
    label: "서버 상태",
    title: "서버가 데이터의 기준입니다",
    description:
      "쓰기 성공 후 관련 query를 다시 조회해 Spring API의 확정된 결과를 보여줍니다.",
  },
  {
    label: "사용자 검증",
    title: "보이는 동작을 테스트합니다",
    description:
      "Vitest와 React Testing Library로 사용자가 접하는 결과를 기준으로 검증합니다.",
  },
];

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16 lg:px-10">
        <section className="max-w-3xl">
          <p className="mb-5 inline-flex rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-sm font-semibold tracking-wide text-sky-200">
            Frontend foundation ready
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Spring REST API를 정직하게 보여주는 클라이언트
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            RentalRoom 프런트엔드는 화면의 복잡도보다 요청, 응답, 오류와 서버
            데이터 갱신 과정을 분명하게 드러내는 데 집중합니다.
          </p>
        </section>

        <section
          aria-label="프런트엔드 기반 원칙"
          className="mt-12 grid gap-4 md:grid-cols-3"
        >
          {foundations.map((foundation) => (
            <article
              key={foundation.label}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur"
            >
              <p className="text-sm font-semibold text-sky-300">
                {foundation.label}
              </p>
              <h2 className="mt-3 text-xl font-semibold text-white">
                {foundation.title}
              </h2>
              <p className="mt-3 leading-7 text-slate-400">
                {foundation.description}
              </p>
            </article>
          ))}
        </section>

        <p className="mt-10 text-sm text-slate-500">
          다음 단계는 Spring API 계약에 맞춘 첫 사용자 흐름입니다.
        </p>
      </main>
    </div>
  );
}

function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <section className="text-center">
        <p className="text-sm font-semibold text-sky-300">404</p>
        <h1 className="mt-3 text-3xl font-bold">페이지를 찾을 수 없습니다</h1>
        <Link
          className="mt-8 inline-flex rounded-lg bg-sky-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300"
          to="/"
        >
          홈으로 돌아가기
        </Link>
      </section>
    </main>
  );
}
