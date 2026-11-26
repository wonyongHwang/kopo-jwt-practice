# JWT 실습
Node.js 22 이상 권장. 로컬 교육용으로만 사용하세요.

```sh
npm install
node 01-manual.js
node 02-library.js
npm start
```
브라우저 http://localhost:3000 접속. 계정 student / 1234, admin / 5678.

| 요청 | 기대 결과 |
|---|---|
| 토큰 없이 내 정보 | 401 |
| student 로그인 후 내 정보 | 200 |
| student로 관리자 API | 403 |
| student 토큰 role 변조 | 401 |
| 로그인 후 60초 경과 | 401 |
| admin 로그인 후 관리자 API | 200 |
| 로그아웃 후 내 정보 | 401 |

curl 예시(macOS/Linux/Git Bash):
```sh
curl -i http://localhost:3000/api/profile
curl -s -X POST http://localhost:3000/api/login -H 'Content-Type: application/json' -d '{"username":"student","password":"1234"}'
```
응답의 token 값을 복사하여:
```sh
TOKEN='복사한_토큰'
curl -i http://localhost:3000/api/profile -H "Authorization: Bearer $TOKEN"
curl -i http://localhost:3000/api/admin -H "Authorization: Bearer $TOKEN"
```
서버 기본 키는 실행마다 무작위 생성되므로 재시작 시 기존 토큰이 무효화됩니다. 여러 서버나 재시작 간 검증이 필요하면 서버 환경 변수 JWT_SECRET에 32바이트 이상의 랜덤 키를 hex로 설정하세요. 생성 예시: `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. 비밀키를 브라우저 또는 Git에 넣지 마세요.

실습 01은 MAC 비교만 보여주며 완전한 JWT 검증기가 아닙니다. 실습 02, 서버에서는 검증 라이브러리를 사용합니다. 서버는 실습용 공개 계정 및 로컬 HTTP만 사용하며, 운영 시 DB, 비밀번호 해싱, HTTPS, 요청 제한, 토큰 폐기/갱신 정책, 권한 변경 대응이 필요합니다. 로그아웃 버튼은 토큰을 클라이언트에서 삭제할 뿐 복사된 토큰을 서버에서 폐기하지 않습니다.
