# NPC 두뇌 (직접 학습한 신경망)

NPC가 말을 알아듣는 데 쓰는 작은 딥러닝 모델이다. 외부 AI 서비스 없이 브라우저 안에서 돈다.

- 입력: 문장을 음절 n-gram, 단어, 자모 n-gram으로 쪼갠 뒤 해시(2048칸)로 바꾼다.
- 구조: 임베딩(48차원) → 은닉층 64 → 은닉층 64 → 의도 69종 + 감정 3종(긍정·부정·보통).
- 크기: int8 양자화해서 `npc-brain.js` 약 157KB. 한 문장 판단에 0.2ms 정도.
- 성능: 학습에 쓰지 않은 문장 137개 기준 정확도 약 85%, 확신도 0.5 이상일 때 약 94%.

대화 엔진은 먼저 규칙으로 답해 보고, 규칙이 못 알아들었거나 엉뚱하게 답했을 때 모델이 읽은 의도로 다시 답한다.
위기 표현은 규칙과 모델 둘 중 하나만 잡아도 반응하고 상담 전화를 안내한다.

## 다시 학습하기

```bash
pip install torch numpy
cd brain
python3 gen_data.py          # 학습 데이터 생성 (train.json, labels.json)
python3 test_set.py; python3 test2.py
python3 train.py 2048 48 30 test2.json   # npc-brain.js 생성
cp npc-brain.js ../npc-brain.js
```

말이 안 통하는 문장이 있으면 `gen_data.py`의 해당 의도 목록에 비슷한 문장을 더하고 다시 학습하면 된다.
시험용 문장(`test2.py`)은 학습 데이터에 넣지 않아야 정확도가 정직하게 나온다.
