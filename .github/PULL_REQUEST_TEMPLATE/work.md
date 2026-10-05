<!--
제목: [#<issue>-w<work>] <요약>
base: 부모 Issue 브랜치
병합: squash merge
-->

## 상위 작업

Related to #<issue>

- Work: w<work> — <이름>

## 변경 결과

<!-- 이 Work로 실제 달라진 결과를 작성합니다. -->

## 계획과 달라진 점

없음

<!-- 차이가 있다면 `없음`을 지우고 아래 내용을 작성합니다.
- 계획:
- 실제:
- 변경 이유:
- 영향 및 후속 조치:
- 관련 개발 노트:
-->

## 제외 범위와 남은 사항

없음

## 검증

- 방법:
- 결과:

## 최종 squash commit message

```text
<type>(be|fe): <한글 요약>
```

## 체크리스트

- [ ] 올바른 부모 Issue 브랜치를 base로 지정했다.
- [ ] 부모 Issue의 해당 Work 범위만 변경했다.
- [ ] 필요한 검증을 실행하고 결과를 기록했다.
- [ ] 관련 문서·계약을 갱신했거나 갱신이 필요 없음을 확인했다.
- [ ] 부모 Issue의 Work 번호·내용과 이 PR이 일치한다.
- [ ] squash commit message가 최종 diff와 일치한다.
