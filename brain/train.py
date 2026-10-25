# ALTERA NPC 두뇌 학습: 문자/자모 n-gram 해시 → 임베딩 백 → 은닉층 2개 → 의도 + 감정
import json, re, random, math, base64, sys
import numpy as np
import torch, torch.nn as nn, torch.nn.functional as F

torch.manual_seed(1); random.seed(1); np.random.seed(1)
D = int(sys.argv[1]) if len(sys.argv) > 1 else 4096
E = int(sys.argv[2]) if len(sys.argv) > 2 else 48
import os
H = int(os.environ.get("H", "64"))
EPOCHS = int(sys.argv[3]) if len(sys.argv) > 3 else 25

CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'
JUNG = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ'

def norm(t):
    t = t.lower()
    t = re.sub(r'(.)\1{3,}', r'\1\1\1', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t

def jamo(s):
    out = []
    for ch in s:
        c = ord(ch)
        if 0xAC00 <= c <= 0xD7A3:
            i = c - 0xAC00
            out.append(CHO[i // 588]); out.append(JUNG[(i % 588) // 28])
            jg = i % 28
            if jg: out.append(chr(0x11A7 + jg))
        else:
            out.append(ch)
    return ''.join(out)

def fnv(s):
    h = 2166136261
    b = s.encode('utf-16-le')
    for k in range(0, len(b), 2):
        u = b[k] | (b[k + 1] << 8)
        h ^= u
        h = (h * 16777619) & 0xFFFFFFFF
    return h

def feats(t):
    s = norm(t)
    f = set()
    s0 = '^' + s.replace(' ', '') + '$'
    for n in (1, 2, 3):
        for i in range(len(s0) - n + 1):
            f.add('c' + s0[i:i + n])
    for w in s.split(' '):
        w = re.sub(r'[?!.~,]+$', '', w)
        if w: f.add('w' + w)
    j = '^' + jamo(s.replace(' ', '')) + '$'
    for n in (2, 3, 4):
        for i in range(len(j) - n + 1):
            f.add('j' + j[i:i + n])
    return sorted(set(fnv(x) % D for x in f))

train = json.load(open('train.json'))
test = json.load(open(sys.argv[4] if len(sys.argv) > 4 else 'test.json'))
labels = json.load(open('labels.json'))
L = {l: i for i, l in enumerate(labels)}
SENT = ['neu', 'pos', 'neg']

Xtr = [feats(t) for t, _, _ in train]
Ytr = torch.tensor([L[i] for _, i, _ in train])
Str = torch.tensor([SENT.index(s) for _, _, s in train])
Xte = [feats(t) for t, _ in test]
Yte = [L[i] for _, i in test]

class Net(nn.Module):
    def __init__(s):
        super().__init__()
        s.emb = nn.EmbeddingBag(D, E, mode='mean')
        s.l1 = nn.Linear(E, H); s.l2 = nn.Linear(H, H)
        s.hi = nn.Linear(H, len(labels)); s.hs = nn.Linear(H, 3)
        s.dp = nn.Dropout(0.15)
    def forward(s, idx, off):
        x = s.emb(idx, off)
        x = F.relu(s.l1(x)); x = s.dp(x)
        x = F.relu(s.l2(x)); x = s.dp(x)
        return s.hi(x), s.hs(x)

def batch(X, ids, drop=0.0):
    idx, off = [], []
    for i in ids:
        f = X[i]
        if drop and len(f) > 4:
            f = [x for x in f if random.random() > drop] or f
        off.append(len(idx)); idx += f
    return torch.tensor(idx, dtype=torch.long), torch.tensor(off, dtype=torch.long)

net = Net()
opt = torch.optim.Adam(net.parameters(), lr=4e-3, weight_decay=1e-5)
N = len(Xtr)
for ep in range(EPOCHS):
    net.train()
    perm = np.random.permutation(N)
    tot = 0
    for b in range(0, N, 64):
        ids = perm[b:b + 64]
        idx, off = batch(Xtr, ids, drop=0.25)
        oi, os_ = net(idx, off)
        loss = F.cross_entropy(oi, Ytr[ids], label_smoothing=0.05) + 0.5 * F.cross_entropy(os_, Str[ids])
        opt.zero_grad(); loss.backward(); opt.step()
        tot += loss.item() * len(ids)
    for g in opt.param_groups: g['lr'] *= 0.9
    if ep % 5 == 4 or ep == EPOCHS - 1:
        net.eval()
        with torch.no_grad():
            idx, off = batch(Xte, range(len(Xte)))
            oi, _ = net(idx, off)
            pr = F.softmax(oi, 1)
            p, a = pr.max(1)
            acc = sum(int(a[i]) == Yte[i] for i in range(len(Yte))) / len(Yte)
        print(f'epoch {ep+1} loss {tot/N:.3f} held-out acc {acc:.3f}')

net.eval()
with torch.no_grad():
    idx, off = batch(Xte, range(len(Xte)))
    oi, _ = net(idx, off)
    pr = F.softmax(oi, 1); p, a = pr.max(1)
wrong = [(test[i][0], test[i][1], labels[int(a[i])], round(float(p[i]), 2)) for i in range(len(Yte)) if int(a[i]) != Yte[i]]
for th in (0.3, 0.4, 0.5, 0.6):
    sel = [i for i in range(len(Yte)) if float(p[i]) >= th]
    acc = sum(int(a[i]) == Yte[i] for i in sel) / max(1, len(sel))
    print(f'threshold {th}: coverage {len(sel)/len(Yte):.2f} precision {acc:.3f}')
print('wrong:', len(wrong))
for w in wrong: print('  ', w)

# 내보내기 (int8 양자화, 출력 단위별 스케일)
def q8(W):
    W = W.detach().numpy().astype(np.float32)
    sc = np.abs(W).max(axis=1, keepdims=True) / 127.0 + 1e-12
    Q = np.clip(np.round(W / sc), -127, 127).astype(np.int8)
    return base64.b64encode(Q.tobytes()).decode(), base64.b64encode(sc.astype(np.float32).ravel().tobytes()).decode()
def f32(v): return base64.b64encode(v.detach().numpy().astype(np.float32).ravel().tobytes()).decode()
emb, embS = q8(net.emb.weight)
w1, w1s = q8(net.l1.weight); w2, w2s = q8(net.l2.weight); wi, wis = q8(net.hi.weight); ws, wss = q8(net.hs.weight)
model = {'v': 1, 'D': D, 'E': E, 'H': H, 'labels': labels, 'sent': SENT,
         'emb': emb, 'embS': embS, 'w1': w1, 'w1s': w1s, 'b1': f32(net.l1.bias), 'w2': w2, 'w2s': w2s, 'b2': f32(net.l2.bias),
         'wi': wi, 'wis': wis, 'bi': f32(net.hi.bias), 'ws': ws, 'wss': wss, 'bs': f32(net.hs.bias)}
js = '/* ALTERA NPC 두뇌: 직접 학습한 작은 신경망 가중치 (의도 ' + str(len(labels)) + '종 + 감정 3종) */\nwindow.NPC_BRAIN = ' + json.dumps(model, ensure_ascii=False, separators=(',', ':')) + ';\n'
open('npc-brain.js', 'w').write(js)
print('model file KB', round(len(js.encode()) / 1024))
# 검증용: 파이썬 기준 예측값 몇 개 저장 (자바스크립트 구현과 비교)
probe = ['안녕', '너 몇 살이야?', '오늘 너무 우울하다', '수학 시험 완전 망함', '저녁 뭐 먹지', '사라져 버리고 싶어', '방금 지하철 내렸어']
with torch.no_grad():
    idx, off = batch([feats(t) for t in probe], range(len(probe)))
    oi, os_ = net(idx, off)
    # 양자화 가중치로 다시 계산한 값과 비교하려고 float 결과도 저장
json.dump({'probe': probe, 'intent': [labels[int(x)] for x in oi.argmax(1)], 'p': [round(float(x), 3) for x in F.softmax(oi, 1).max(1)[0]], 'sent': [SENT[int(x)] for x in os_.argmax(1)]}, open('probe.json', 'w'), ensure_ascii=False)
