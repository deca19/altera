# ALTERA NPC 두뇌 학습 데이터 v3
# v2 데이터에 더해: 상관없는 앞뒤 말 섞기, 비슷한 말로 바꾸기, 어순 바꾸기, 이유가 붙은 문장.
import random, json, re
src = open('gen_data2.py', encoding='utf-8').read().split('# ---------- 증강 ----------')[0]
exec(src)
random.seed(23)

# 이유가 붙은 인사·잠 인사
REASON = ['내일 학교 가야 해서', '피곤해서', '숙제해야 해서', '엄마가 불러서', '학원 가야 돼서', '일찍 일어나야 돼서', '밥 먹어야 해서', '씻어야 해서']
add('night', [(x, 'neu') for x in expand('{' + '|'.join(REASON) + '} {잘게|자러 갈게|먼저 잘게|이만 잘게|자야 할 듯}')])
add('bye', [(x, 'neu') for x in expand('{' + '|'.join(REASON) + '} {갈게|가볼게|이만|나가볼게|먼저 갈게}')])
add('call', [(x, 'neu') for x in expand('{야|저기|있지|있잖아|여보세요} {대답 좀 해|대답 좀 해봐|나 할 말 있어|잠깐만|듣고 있지|어디 갔냐}') + expand('{있지|있지 있지|있잖아 있잖아|야야야야|여기 좀 봐}')])
add('why', [(x, 'neu') for x in expand('{왜인데|뭐 때문에|무슨 이유로|이유가 뭔데|왜 그런 건데|어째서 그런데|그건 왜}{?|}')])
add('feel_bored', [(x, 'neu') for x in expand('{너무|진짜|완전|} {따분해|지루하다|할 일 없음|심심하다 진짜|재미있는 게 없어|하루가 길다}')])
add('crush', [(x, 'neu') for x in expand('{혹시|너|넌} {좋아하는 애 있어|좋아하는 사람 있냐|맘에 드는 사람 있어|짝사랑해 본 적 있어}{?|}')])
add('topic_shop', [(x, 'neu') for x in expand('{택배 왔다|배송 왔어|언박싱 했어|주문한 거 도착했어|쇼핑하고 왔어|장 보고 왔어}{!|}')])
add('topic_future', [(x, 'neu') for x in expand('{가고 싶은 학과가 있어|전공 고민 중|하고 싶은 일이 생겼어|진학 상담 받았어|어느 대학 갈지 정했어}')])
add('ask_dream', [(x, 'neu') for x in expand('{너|넌|} {무슨 직업 갖고 싶어|어떤 직업이 좋아|무슨 일 하면서 살고 싶어|어른 되면 뭐 할 거야}{?|}')])

# ---------- 증강 ----------
END_RULES = [
    (r'했어$', ['했음', '했다', '했네', '했어요', '함', '했당', '햇어']), (r'었어$', ['었음', '었다', '었네', '었어요', '엇어']), (r'았어$', ['았음', '았다', '았네', '았어요', '앗어']),
    (r'해$', ['함', '하다', '해요', '하네', '한다', '하당', '해여']), (r'워$', ['움', '워요', '웠어', '운 듯']), (r'려$', ['림', '려요', '린다']),
    (r'파$', ['픔', '파요', '프다', '파여']), (r'야\?$', ['냐?', '니?', '임?', '?', '야??']), (r'어\?$', ['냐?', '니?', '음?', '어요?', '어??']), (r'해\?$', ['하냐?', '하니?', '함?', '해요?']),
    (r'야$', ['임', '이다', '예요', '얌']), (r'어$', ['음', '어요', '다', '엉']), (r'아$', ['음', '아요', '다', '앙']), (r'돼$', ['됨', '되', '돼요', '된다']),
]
TYPO = [('했', '햇'), ('돼', '되'), ('되', '돼'), ('않', '안'), ('왜', '외'), ('뭐', '머'), ('뭐', '모'), ('없', '업'), ('있', '잇'), ('겠', '겟'), ('어', '여')]
SYN = [('짜증', '빡침'), ('짜증', '열받음'), ('피곤', '지침'), ('심심', '따분'), ('심심', '지루'), ('슬퍼', '우울해'), ('슬퍼', '속상해'), ('친구', '베프'), ('친구', '친구들'),
       ('엄마', '어머니'), ('진짜', '정말'), ('진짜', '완전'), ('진짜', '레알'), ('너무', '엄청'), ('너무', '되게'), ('너무', '겁나'), ('먹었어', '먹음'), ('봤어', '봄'),
       ('좋아', '맘에 들어'), ('재밌', '꿀잼이'), ('학교', '학굔'), ('오늘', '오늘도'), ('나', '난'), ('너', '넌'), ('뭐', '무엇을')]
PRE = ['아까 학원 끝나고', '집에 오는 길인데', '방금 씻고 나왔는데', '버스 안인데', '수업 끝나고', '점심시간에', '자기 전인데', '주말이라 그런지', '친구랑 있다가 왔는데', '지금 방인데', '숙제하다가', '폰 보다가', '밥 먹고 나서', '오늘따라', '그냥 갑자기', '아 맞다']
POST = ['진짜로', '아무튼', '암튼', '하하', 'ㅋㅋ 진짜', '그냥 그렇다고', '그랬어 오늘']
def vary(t):
    for pat, opts in END_RULES:
        if re.search(pat, t): return re.sub(pat, pick(opts), t)
    return t
def typo(t):
    a, b = pick(TYPO)
    return t.replace(a, b, 1) if a in t else t
def syn(t):
    a, b = pick(SYN)
    return t.replace(a, b, 1) if a in t else t
def shuffle_words(t):
    w = t.split(' ')
    if 2 <= len(w) <= 3: random.shuffle(w)
    return ' '.join(w)
STATEMENT = ('feel_', 'topic_', 'blame', 'crisis', 'meh', 'weather', 'other')
def aug(t, intent):
    if random.random() < .45: t = vary(t)
    if random.random() < .2: t = syn(t)
    if random.random() < .1: t = typo(t)
    if random.random() < .08 and intent.startswith(('topic_', 'feel_')): t = shuffle_words(t)
    if random.random() < .12:
        w = t.split(' ')
        if len(w) >= 2: w.insert(len(w) - 1, pick(['너무', '진짜', '완전', '개', 'ㄹㅇ', '엄청', '좀'])); t = ' '.join(w)
    if intent.startswith(STATEMENT) and random.random() < .22: t = pick(PRE) + ' ' + t
    elif intent.startswith(STATEMENT) and random.random() < .08: t = t + ' ' + pick(POST)
    r = random.random()
    if r < .25: t = t.replace(' ', '')
    elif r < .31 and len(t) > 3:
        i = random.randrange(len(t)); t = t[:i] + t[i+1:]
    if random.random() < .12: t = t + pick(['ㅋㅋ', 'ㅎㅎ', '..', '!!', '?', 'ㅠ', 'ㅠㅠ', '~'])
    return t.strip()

norm = lambda x: re.sub(r'[\s.!?~,ㅋㅎㅠㅜ]+', '', x)
banned = set(norm(t) for f in ('test2.json', 'test3.json', 'test4.json', 'test5.json', 'test6.json') for t, _ in json.load(open(f)))
train = []
for intent, rows in D.items():
    rows = [r for r in dict.fromkeys(rows) if norm(r[0]) not in banned]
    random.shuffle(rows)
    rows = rows[:1000]
    out = []
    for t, s in rows:
        out.append((t, intent, s))
        for _ in range(2):
            a = aug(t, intent)
            if norm(a) not in banned: out.append((a, intent, s))
    while len(out) < 1100:
        t, s = pick(rows); a = aug(t, intent)
        if norm(a) not in banned: out.append((a, intent, s))
    train += out
random.shuffle(train)
print('intents', len(D), 'train', len(train))
json.dump(train, open('train.json', 'w'), ensure_ascii=False)
json.dump(sorted(D.keys()), open('labels.json', 'w'), ensure_ascii=False)
