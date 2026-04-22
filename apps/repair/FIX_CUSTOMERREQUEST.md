# CustomerRequest.tsx 파일 수정 방법

## 문제
`/src/app/components/CustomerRequest.tsx` 파일이 1280번 줄에서 끝나야 하는데, 1281번 줄부터 2183번 줄까지 쓰레기 코드가 포함되어 구문 오류가 발생합니다.

## 해결 방법 (아래 중 하나 선택)

### 방법 1: 터미널 명령 사용 (가장 빠름)
프로젝트 루트 디렉토리에서 다음 명령을 실행하세요:

```bash
head -n 1280 src/app/components/CustomerRequest.tsx > /tmp/fixed.txt && mv /tmp/fixed.txt src/app/components/CustomerRequest.tsx
```

### 방법 2: Python 스크립트 사용
프로젝트 루트 디렉토리에서 다음 명령을 실행하세요:

```bash
python3 fix_file.py
```

### 방법 3: Node.js 스크립트 사용
프로젝트 루트 디렉토리에서 다음 명령을 실행하세요:

```bash
node fix_file.js
```

### 방법 4: 텍스트 에디터 사용
1. `src/app/components/CustomerRequest.tsx` 파일을 텍스트 에디터로 엽니다
2. 1280번 줄 `export default CustomerRequest;` 까지만 남기고
3. 1281번 줄부터 파일 끝까지 모두 삭제합니다
4. 파일을 저장합니다

## 확인
수정 후 다음 명령으로 파일 라인 수를 확인하세요:
```bash
wc -l src/app/components/CustomerRequest.tsx
```

결과가 `1280`이면 성공입니다!
