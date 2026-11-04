# 블록 문법

예시 `examples/infiniband.html` 에서 그대로 복사해 쓴다. 여기는 각 블록의 뼈대와 규칙만 적는다.

## 페이지 뼈대

```html
<title>주제 이름</title>
<link 글꼴: Do Hyeon · Jua · Inter · IBM Plex Sans KR · IBM Plex Mono />
<style>
  /* runtime/explainer.css 전체 */
</style>
<!-- runtime/symbols.svg.html 전체 (캐릭터·화살표 기호) -->
<header class="hero">
  eyebrow · h1 · p.lead(비유 한 문장 + 내용 한 문장) · ul.howto · ul.cast ·
  ol.map
</header>
<div class="bar">이름 · nav.dots(칸으로 가기) · button#theme</div>
<main class="wrap">
  <section class="stop" id="…" data-stop>칸</section>
  …
  <section id="see">직접 보기 · 용어 짝꿍표</section>
  <section id="qna">Q&A</section>
  <section id="src">출처 · .hist 고친 기록</section>
</main>
<script type="application/json" id="scenes">
  { … }
</script>
<script>
  /* runtime/scenes.js 전체 */
</script>
```

- 본문에 메타 설명("이 설명서는…")을 쓰지 않는다. lead 는 비유와 내용으로 바로 시작한다.
- 본문에 날짜를 쓰지 않는다. 날짜는 `.hist` 고친 기록에만 둔다.
- 문서끼리 다른 곳, 읽은 것 · 못 읽은 것은 페이지에 넣지 않고 작업자에게 보고한다.

## 등장인물 (캐릭터)

`symbols.svg.html` 의 기호를 `<use>` 로 쓴다. 몸 색은 `color` 로 준다.

| 기호                | 역할                       | 색 클래스             |
| ------------------- | -------------------------- | --------------------- |
| `#i-infra` (안전모) | 인프라 담당자              | `c-install`           |
| `#i-admin` (넥타이) | 관리자                     | `c-admin`             |
| `#i-pm` (클립보드)  | 프로젝트 매니저            | `c-pm`                |
| `#i-pd` (노트북)    | 프로젝트 디벨로퍼 · 팀원   | `c-pd`                |
| `#i-bot` (로봇)     | 시스템 (operator 프로그램) | `c-system`            |
| `#i-person`         | 비유 속 작업자 (Pod)       | `c-a` · `c-b` (팀 색) |

사람이 아닌 것(프로그램)은 사람으로 그리지 않는다. 역할 표시는 색 점 대신 캐릭터 얼굴(`svg.av`)로 한다.

## 1층 칸

```html
<section class="stop" id="door" data-stop>
  <header class="sh">
    <span class="num">2</span>
    <p class="ask">
      <svg class="av c-pd" viewBox="0 0 40 56"><use href="#i-pd" /></svg
      ><span>질문 한 줄?</span>
    </p>
    <h2>한 줄 답 <mark>핵심어</mark></h2>
  </header>
  <figure class="fig">
    <svg class="dg" viewBox="0 0 600 290" role="img" aria-label="…">
      일러스트
    </svg>
  </figure>
  <p class="cap">두세 문장. 핵심어는 <b>…</b></p>
  <div class="try col">값 바꿔 보기 (개념에 붙는 것만)</div>
  <details class="more">
    <summary>조금 더 자세히</summary>
    <div class="in">…</div>
  </details>
  <div class="go2">
    <button
      class="l2btn"
      type="button"
      aria-haspopup="dialog"
      aria-controls="l2-door"
    >
      …AIPub 화면에서 보기…
    </button>
  </div>
  <dialog class="modal" id="l2-door">2층</dialog>
</section>
```

그림 클래스: 외곽선 `.o`(굵게) `.o2`(얇게), 면 `.f-bldg` `.f-roof` `.f-chip` `.f-tun` `.f-a` `.f-b` `.f-rel` `.f-paper` `.f-mark` `.f-tower` …, 글 `.s` `.b` `.m` `.acc`, 선 `.ln` `.ln-ok` `.ln-bad`, 움직임 `.pk-run`(`--d` 거리, `--t` 시간) `.bob`. 색은 모두 토큰이라 라이트·다크가 따라간다.

## 값 바꿔 보기 (`.try`)

1층(개념)이나 2층(화면 숫자)에 둔다. 식은 변수 이름과 `Math` 를 쓰는 JS 식이다.

| 속성                                                               | 뜻                                                            |
| ------------------------------------------------------------------ | ------------------------------------------------------------- |
| `.stp[data-var]`                                                   | − 값 + 스테퍼. `data-min` `data-max` `data-val`               |
| `input[type=checkbox][data-var]`                                   | 0 / 1                                                         |
| `select[data-var]`                                                 | 고른 값(숫자)                                                 |
| `.try[data-let]`                                                   | 중간 값 `이름=식; …`                                          |
| `data-text` · `data-grow` · `data-if` · `data-slots="전체:켜진수"` | 글자 · 막대 칸 · 보이기 · 네모 칸 (`.slots.doors` 면 문 모양) |
| `data-cls="클래스: 식; …"`                                         | 클래스. `;` `:` 로 나누므로 식에 삼항 연산자를 쓰지 않는다    |

## 2층 모달

```html
<dialog class="modal" id="l2-door" aria-label="…">
  <div class="m-head">
    <span class="m-k">AIPub 화면에서 보기</span><b>칸 제목</b
    ><button class="m-close">✕</button>
  </div>
  <div class="l2">
    <div class="l2-meta">
      하는 일(.chip.fn read|create|update) · 누가(.rl + svg.av) · 어디서(.where)
      · a.fig-link(Figma)
    </div>
    <p class="lead2">한두 문장</p>
    <div class="player" data-scene="door">
      <div class="viewport">
        <div class="stage">
          <div class="mock">
            <div class="ui app">
              <div class="ui-chrome">
                <i></i><i></i><i></i
                ><span class="ui-url" data-k="url">/nodes/…</span>
              </div>
              <div class="ui-body">화면 내용. 움직일 요소에 data-k</div>
            </div>
          </div>
        </div>
      </div>
      <div class="timeline"></div>
    </div>
    <p class="hint">실제 값인지 예시인지</p>
    <div class="links3">비유 · 화면 · 데이터 카드 3장</div>
  </div>
</dialog>
```

- `.ui.app` 은 엔진이 AIPub 앱 틀(위 막대 · 왼쪽 메뉴 · 경로)로 감싼다. 주소(`url`)가 바뀌면 메뉴 선택과 경로도 따라간다.
- 화면 색은 aipub-web `globals.css` 토큰(`--ui-*`, `--ub-*`, `--bar-*`)을 쓴다. 막대 칸 순서는 코드와 같게: 현재 → 다른 → 회수 대기 → 미할당.
- 여러 화면을 오가는 장면은 화면마다 `data-k="v1"` … 을 두고 `hide`/`show` 와 `url` 로 옮긴다.
- 모달은 열 때 한 번 재생하고 마지막 장면에 멈춘다. 손 버튼은 "직접 눌러 보기": 다음 단계의 첫 `move` 대상에 점이 뜨고, 대상이 없으면 "다음 단계 ▶" 버튼이 뜬다.

## 장면 JSON (`#scenes`)

```json
{
  "door": [
    {
      "cap": "캡션 한 문장",
      "acts": [
        ["move", "chev"],
        ["click", "chev"],
        ["show", "vfs"]
      ]
    }
  ]
}
```

| 동작             | 인자         | 하는 일                     |
| ---------------- | ------------ | --------------------------- |
| `move` · `click` | 키           | 커서 이동 · 클릭 물결       |
| `show` · `hide`  | 키           | 보이기 · 숨기기             |
| `text`           | 키, 글자     | 글자 바꾸기                 |
| `add` · `rm`     | 키, 클래스   | 클래스 붙이기 · 떼기        |
| `css`            | 키, 속성, 값 | 인라인 스타일               |
| `grow`           | 키, 숫자     | 막대 칸 크기                |
| `flash`          | 키           | 강조                        |
| `url`            | 글자         | 주소창 · 메뉴 · 경로 바꾸기 |
| `wait`           | 밀리초       | 쉬기                        |

장면 하나는 3~6단계다. 화면 대화상자(`.ui-dialog`)는 가운데 고정이며 transform 을 쓰지 않는다(등장 애니메이션과 부딪혀 점 위치가 틀어진다).

## 아래쪽 칸

- **Q&A** (`details.qa`): 실제로 받을 법한 질문(증상·오해) 10개 안팎, 답 끝에 관련 칸 링크.
- **출처** (`.srcs` > `.sg`): 정책서 · 설계 · Figma · Jira/PR · Slack · 실제 데이터. 프론트 코드 경로는 넣지 않는다.
- **고친 기록** (`.hist`): 날짜와 바뀐 것 한 줄씩.
