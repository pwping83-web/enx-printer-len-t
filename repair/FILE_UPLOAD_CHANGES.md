# 파일 업로드 기능 수정 완료 ✅

## 1. UI 변경 완료 ✅

### 섹션 제목
- **이전**: "사진 업로드"
- **변경**: "고장 부위 사진 또는 증상 영상(10초 미만)"

### 입력 필드 통합 ✅
- **이전**: 외부 사진 / 내부 사진 / 기타 사진 (3개 분리)
- **변경**: 하나의 업로드 영역으로 통합
  - accept="image/*,video/*" (사진 + 동영상)
  - 안내 문구: "동영상은 10초 미만(20MB 이하)만 가능"

### 미리보기 표시 ✅
- 사진: 썸네일 이미지
- 동영상: 🎥 아이콘 + "영상" 텍스트

## 2. handleImageUpload 함수 수정 완료 ✅

```typescript
const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (files) {
    const newFiles = Array.from(files);
    
    // 동영상 파일 크기 체크 (20MB = 20 * 1024 * 1024 bytes)
    const MAX_VIDEO_SIZE = 20 * 1024 * 1024;
    
    for (const file of newFiles) {
      // 동영상 파일인지 체크
      if (file.type.startsWith('video/')) {
        if (file.size > MAX_VIDEO_SIZE) {
          alert('용량이 너무 큽니다. 10초 미만으로 줄여주세요');
          return; // 업로드 중단
        }
      }
    }
    
    // 모든 파일이 검증을 통과하면 업로드
    setFormData((prev) => ({
      ...prev,
      printerImages: [...prev.printerImages, ...newFiles],
    }));
  }
};
```

### 동작 방식
1. 사진 파일 (image/*): 제한 없이 업로드
2. 동영상 파일 (video/*): 
   - 20MB 이하 ✅ → 업로드 허용
   - 20MB 초과 ❌ → 경고창 표시 후 업로드 차단

## 3. formData 변경 완료 ✅
```typescript
// 이전
exteriorImages: [] as File[]
interiorImages: [] as File[]
otherImages: [] as File[]

// 변경
printerImages: [] as File[] // 모두 통합
```

## 4. 필수 체크 제거 ✅
```typescript
// 이전
if (formData.exteriorImages.length === 0 || formData.interiorImages.length === 0) {
  alert("외부와 내부 사진을 모두 업로드해주세요.");
  return;
}

// 변경
// 사진/영상 필수 체크는 제거 (선택사항으로 변경)
```

---

## ⏳ 남은 수정 사항

### 1. 파일 업로드 로직 수정 (handleSubmit 내부)

현재 코드에서 수정 필요:

```typescript
// ❌ 현재 (잘못된 코드)
for (const file of formData.exteriorImages) { ... }
for (const file of formData.interiorImages) { ... }

// ✅ 수정 필요
for (const file of formData.printerImages) { ... }
```

### 2. 업로드된 URL 저장 변수명 변경

```typescript
// ❌ 현재
const uploadedExteriorUrls: string[] = [];
const uploadedInteriorUrls: string[] = [];

// ✅ 수정 필요
const uploadedFileUrls: string[] = [];
```

### 3. 내부 사진 업로드 for 루프 삭제

567-600줄 정도에 있는 `for (const file of formData.interiorImages)` 전체 삭제 필요

### 4. Supabase INSERT 시 image_url 필드

```typescript
// ❌ 현재
image_url: [...uploadedExteriorUrls, ...uploadedInteriorUrls]

// ✅ 수정 필요
image_url: uploadedFileUrls
```

### 5. 이메일/SMS 발송 시 이미지 URL

```typescript
// 이미지 URL을 이메일/SMS 본문에 포함할 때도 
// uploadedFileUrls 사용
```

---

## 📝 다음 단계

파일 업로드 로직 수정을 계속 진행하시려면:

```
"파일 업로드 for 루프 부분에서 interiorImages 관련 코드 전체 삭제하고, uploadedExteriorUrls와 uploadedInteriorUrls를 uploadedFileUrls 하나로 통합해줘"
```
