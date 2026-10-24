// ALTERA 서버 유지용 예약 함수
// Supabase 무료 프로젝트는 일주일 동안 요청이 거의 없으면 일시 중지된다.
// 이 함수가 6시간마다 DB에 가벼운 조회를 보내서, 접속자가 없어도 서버가 계속 켜져 있게 한다.
// 주소와 공개 키는 사이트의 config.js 에서 읽어 오므로 따로 설정할 것이 없다.

export default async () => {
  const site = process.env.URL || 'https://altera-system.netlify.app';
  try {
    const cfg = await (await fetch(site + '/config.js', { cache: 'no-store' })).text();
    const url = (cfg.match(/supabaseUrl:\s*'([^']+)'/) || [])[1];
    const key = (cfg.match(/supabaseAnonKey:\s*'([^']+)'/) || [])[1];
    if (!url || !key || /YOUR/i.test(url + key)) {
      console.log('keepalive: config.js 에 서버 정보가 없음');
      return new Response('config missing', { status: 200 });
    }
    const r = await fetch(url + '/rest/v1/docs?select=path&limit=1', { headers: { apikey: key } });
    console.log('keepalive: supabase ' + r.status);
    return new Response('ok ' + r.status);
  } catch (e) {
    console.log('keepalive error: ' + (e && e.message));
    return new Response('error', { status: 200 });
  }
};

export const config = { schedule: '0 */6 * * *' };
