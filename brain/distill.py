# 지식 증류: 선생 모델 여러 개의 판단(부드러운 확률)을 학생 모델 하나에 가르친다.
# 사용법: python3 distill.py 선생1.js,선생2.js 에폭 [시험지.json]
import json, re, sys, base64, random
import numpy as np, torch, torch.nn as nn, torch.nn.functional as F
sys.argv = [sys.argv[0], '4096', '48', '1', 'test2_clean.json'] + sys.argv[1:]
TEACHERS = sys.argv[5].split(',')
EPOCHS = int(sys.argv[6]) if len(sys.argv) > 6 else 22
TEMP = 2.0
src = open('train.py', encoding='utf-8').read()
head = src.split('class Net(nn.Module):')[0]          # 특징 추출과 데이터 로딩만 가져온다
exec(head)
exec('def batch' + src.split('def batch', 1)[1].split('\nnet = Net()')[0])
H = 96
EPOCHS = int(sys.argv[6]) if len(sys.argv) > 6 else 22

class Net(nn.Module):
    def __init__(s, D, E, H, K):
        super().__init__()
        s.emb = nn.EmbeddingBag(D, E, mode='mean'); s.l1 = nn.Linear(E, H); s.l2 = nn.Linear(H, H)
        s.hi = nn.Linear(H, K); s.hs = nn.Linear(H, 3); s.dp = nn.Dropout(0.15)
    def forward(s, idx, off):
        x = s.emb(idx, off); x = F.relu(s.l1(x)); x = s.dp(x); x = F.relu(s.l2(x)); x = s.dp(x)
        return s.hi(x), s.hs(x)

def load_teacher(path):
    t = open(path, encoding='utf-8').read()
    m = json.loads(t[t.index('{'):t.rindex('}') + 1])
    assert m['labels'] == labels, 'label mismatch'
    def deq(k, ks, rows):
        q = np.frombuffer(base64.b64decode(m[k]), dtype=np.int8).astype(np.float32).reshape(rows, -1)
        s = np.frombuffer(base64.b64decode(m[ks]), dtype=np.float32).reshape(rows, 1)
        return torch.tensor(q * s)
    f32 = lambda k: torch.tensor(np.frombuffer(base64.b64decode(m[k]), dtype=np.float32).copy())
    net = Net(m['D'], m['E'], m['H'], len(labels))
    with torch.no_grad():
        net.emb.weight.copy_(deq('emb', 'embS', m['D'])); net.l1.weight.copy_(deq('w1', 'w1s', m['H'])); net.l1.bias.copy_(f32('b1'))
        net.l2.weight.copy_(deq('w2', 'w2s', m['H'])); net.l2.bias.copy_(f32('b2'))
        net.hi.weight.copy_(deq('wi', 'wis', len(labels))); net.hi.bias.copy_(f32('bi'))
        net.hs.weight.copy_(deq('ws', 'wss', 3)); net.hs.bias.copy_(f32('bs'))
    net.eval()
    return net, m['D']

def feats_D(t, Dm):
    global D
    old = D; D = Dm
    try: return feats(t)
    finally: D = old

# 선생들의 부드러운 확률
soft_i = torch.zeros(len(train), len(labels)); soft_s = torch.zeros(len(train), 3)
for path in TEACHERS:
    net, Dm = load_teacher(path)
    X = Xtr if Dm == D else [feats_D(t, Dm) for t, _, _ in train]
    with torch.no_grad():
        for b in range(0, len(X), 2048):
            ids = range(b, min(len(X), b + 2048))
            idx, off = batch(X, ids)
            oi, os_ = net(idx, off)
            soft_i[b:b + len(ids)] += F.softmax(oi / TEMP, 1); soft_s[b:b + len(ids)] += F.softmax(os_ / TEMP, 1)
    print('teacher', path, 'done')
soft_i /= len(TEACHERS); soft_s /= len(TEACHERS)

torch.manual_seed(5); random.seed(5); np.random.seed(5)
net = Net(D, E, H, len(labels))
opt = torch.optim.Adam(net.parameters(), lr=4e-3, weight_decay=1e-5)
N = len(Xtr)
for ep in range(EPOCHS):
    net.train(); perm = np.random.permutation(N)
    for b in range(0, N, 64):
        ids = perm[b:b + 64]
        idx, off = batch(Xtr, ids, drop=0.25)
        oi, os_ = net(idx, off)
        hard = F.cross_entropy(oi, Ytr[ids], label_smoothing=0.05) + 0.5 * F.cross_entropy(os_, Str[ids])
        kd = F.kl_div(F.log_softmax(oi / TEMP, 1), soft_i[ids], reduction='batchmean') + 0.5 * F.kl_div(F.log_softmax(os_ / TEMP, 1), soft_s[ids], reduction='batchmean')
        loss = 0.4 * hard + 0.6 * kd * TEMP * TEMP
        opt.zero_grad(); loss.backward(); opt.step()
    for g in opt.param_groups: g['lr'] *= 0.9
    if ep % 5 == 4 or ep == EPOCHS - 1:
        net.eval()
        with torch.no_grad():
            idx, off = batch(Xte, range(len(Xte))); oi, _ = net(idx, off)
            acc = (oi.argmax(1).numpy() == np.array(Yte)).mean()
        print(f'epoch {ep+1} held-out acc {acc:.3f}')

def q8(W):
    W = W.detach().numpy().astype(np.float32)
    sc = np.abs(W).max(axis=1, keepdims=True) / 127.0 + 1e-12
    Q = np.clip(np.round(W / sc), -127, 127).astype(np.int8)
    return base64.b64encode(Q.tobytes()).decode(), base64.b64encode(sc.astype(np.float32).ravel().tobytes()).decode()
def f32(v): return base64.b64encode(v.detach().numpy().astype(np.float32).ravel().tobytes()).decode()
net.eval()
emb, embS = q8(net.emb.weight); w1, w1s = q8(net.l1.weight); w2, w2s = q8(net.l2.weight); wi, wis = q8(net.hi.weight); ws, wss = q8(net.hs.weight)
model = {'v': 2, 'D': D, 'E': E, 'H': H, 'labels': labels, 'sent': SENT, 'emb': emb, 'embS': embS, 'w1': w1, 'w1s': w1s, 'b1': f32(net.l1.bias),
         'w2': w2, 'w2s': w2s, 'b2': f32(net.l2.bias), 'wi': wi, 'wis': wis, 'bi': f32(net.hi.bias), 'ws': ws, 'wss': wss, 'bs': f32(net.hs.bias)}
js = '/* ALTERA NPC 두뇌: 직접 학습한 신경망 가중치 (의도 ' + str(len(labels)) + '종 + 감정 3종, 선생 모델 ' + str(len(TEACHERS)) + '개에서 지식 증류) */\nwindow.NPC_BRAIN = ' + json.dumps(model, ensure_ascii=False, separators=(',', ':')) + ';\n'
open('npc-brain.js', 'w').write(js)
print('model file KB', round(len(js.encode()) / 1024))
