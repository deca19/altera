# ALTERA 서버 배포 가이드

제타 플롯 「ALTERA - 현실 TS 시스템」의 앱을 내 사이트로 운영하기 위한 묶음이다.

```
GitHub (코드 보관)  ──push──▶  Netlify (사이트 배포, 올릴 때마다 자동 갱신)
                                   │
                                   ▼
                           Supabase (진행 상황 저장 · 관리자 · 실시간 접속)
```

| 파일 | 역할 |
| --- | --- |
| `index.html` | 앱 전체 |
| `config.js` | Supabase 주소와 공개 키 (직접 채워 넣기) |
| `schema.sql` | DB 테이블과 보안 규칙(RLS) |
| `netlify.toml` | Netlify 배포 설정 |
| `netlify/functions/keepalive.mjs` | 6시간마다 서버를 깨워 두는 예약 함수 |
| `npc-brain.js` | NPC가 말을 알아듣는 신경망 가중치 (학습 코드는 `brain/`) |

---

## 1. Supabase 준비

1. supabase.com 에서 **New project** 를 만든다. 지역은 `Northeast Asia (Seoul)` 이 가깝다.
2. 왼쪽 **SQL Editor → New query** 에 `schema.sql` 내용을 전부 붙여 넣고 **Run**.
3. **Authentication → Sign In / Providers** 에서 **Anonymous Sign-Ins** 를 켠다. (Email 은 기본으로 켜져 있다)
4. **Project Settings → API** 에서 `Project URL` 과 `Publishable key` 를 복사해 `config.js` 에 붙여 넣는다.
   - anon 키는 공개용이라 사이트에 들어가도 괜찮다. 데이터는 RLS 규칙이 지킨다.
   - **service_role 키는 절대 넣지 말 것.**

## 2. GitHub 에 올리기

1. GitHub 에서 새 저장소(예: `altera`)를 만든다. 공개/비공개 둘 다 된다.
2. 저장소 화면의 **uploading an existing file** 을 눌러 이 폴더의 파일을 전부 끌어다 놓고 **Commit changes**.
   

## 3. Netlify 로 배포

1. netlify.com → **Add new site → Import an existing project → GitHub** → 방금 만든 저장소 선택.
2. Build command 는 비워 두고, Publish directory 는 `.` (이미 `netlify.toml` 에 적혀 있다) → **Deploy**.
3. 배포가 끝나면 `https://○○○.netlify.app` 주소가 생긴다. **Site configuration → Change site name** 에서 이름을 바꿀 수 있다.

## 4. 메일 로그인 주소 등록

Supabase **Authentication → URL Configuration** 에서

- **Site URL** 에 Netlify 주소를 넣고
- **Redirect URLs** 에도 같은 주소를 추가한다.

이걸 해야 "이메일 연결 / 다른 기기 로그인" 메일의 링크가 내 사이트로 돌아온다.

## 5. 나를 관리자로 등록

1. 내 사이트에 접속해 튜토리얼을 끝낸다.
2. **로그 탭 → 데이터** 에서 이메일을 입력하고 **이메일 연결** → 받은 메일의 링크를 누른다.
   (이걸 먼저 해야 다른 기기·브라우저에서도 같은 관리자 계정을 쓸 수 있다)
3. 같은 화면의 **ID 복사** 를 누른다.
4. Supabase SQL Editor 에서 실행:
   ```sql
   insert into public.admins (user_id) values ('복사한-ID') on conflict do nothing;
   ```
5. 앱 명령창에 `deca10x2` → 처음 한 번 관리자 비밀번호를 정한다. 이후엔 그 비밀번호로 열린다.

관리자로 등록되지 않은 계정은 같은 명령을 쳐도 일반 오류 메시지만 나온다.

---

## 업데이트하는 법

- **직접 고칠 때**: GitHub 저장소에서 파일을 열고 연필 아이콘으로 수정하거나, 바뀐 파일을 다시 업로드해 **Commit**. Netlify 가 자동으로 다시 배포한다(보통 1분 안쪽).
- **Claude 에게 맡길 때**: Claude 에서 GitHub 를 연결하고 이 저장소를 붙여 주면 코드를 고쳐서 바로 올릴 수 있다. 연결이 어렵다면 바뀐 `index.html` 을 받아서 위 방법으로 업로드하면 된다.
- **되돌리기**: Netlify **Deploys** 에서 예전 배포를 골라 **Publish deploy**.
- 플레이어 진행 상황은 Supabase 에 있어서 코드를 바꿔도 그대로 남는다.

## 참고

- `config.js` 가 비어 있으면 서버 없이 그 기기에만 저장되는 모드로 동작한다.
- NPC 대화와 상황 분석 퀘스트는 서버 없이 브라우저 안에서 돌아간다. NPC 대화에는 직접 학습한 작은 신경망(`npc-brain.js`)이 쓰인다. 다시 학습하는 법은 `brain/README.md`.
- Supabase 무료 프로젝트는 일주일쯤 요청이 없으면 일시 중지된다. 그래서 `netlify/functions/keepalive.mjs` 가 6시간마다 DB에 가벼운 조회를 보내 서버를 깨워 둔다. 동작 기록은 Netlify **Logs → Functions → keepalive** 에서 볼 수 있다. 그래도 멈췄다면 Supabase 대시보드에서 **Restore** 를 누르면 데이터 그대로 다시 켜진다(1년 안). 멈춤 없는 보장은 유료(Pro) 요금제뿐이다.
- Supabase 기본 메일 발송은 양이 적게 제한되어 있다. 사용자가 많아지면 **Authentication → Emails → SMTP** 를 설정한다.
- 앱에는 "진행 요약은 제작자가 볼 수 있다"는 안내가 표시된다. 공개 운영한다면 간단한 이용 안내를 따로 두는 게 좋다.
