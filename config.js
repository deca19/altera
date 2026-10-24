// ALTERA 서버 설정
// Supabase 대시보드 > Project Settings > API 에서 두 값을 복사해 아래에 붙여 넣는다.
// anon public 키는 브라우저에 공개되도록 만들어진 키라 여기 적어도 된다. (service_role 키는 절대 넣지 말 것)
// 값을 비워 두거나 YOUR 가 남아 있으면 서버 없이 이 기기에만 저장되는 모드로 동작한다.
window.ALTERA_CONFIG = {
  supabaseUrl: 'https://YOUR-PROJECT.supabase.co',
  supabaseAnonKey: 'YOUR-ANON-PUBLIC-KEY'
};
