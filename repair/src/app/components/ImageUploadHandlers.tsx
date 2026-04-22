import React from 'react';
import imageCompression from 'browser-image-compression';
import heic2any from 'heic2any';
import { toast } from 'sonner';
import { getSupabaseClient } from '/utils/supabase/client';

// Generate unique request ID for file naming
function generateRequestId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Compress video file for mobile optimization
 * 
 * Features:
 * - Scales video to max 360p resolution
 * - Converts to WebM format (VP8 codec)
 * - Adaptive bitrate based on file size and duration
 * - 60-second timeout for compression
 * 
 * @param file - Original video file
 * @returns Compressed video file (WebM format)
 */
async function compressVideo(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    video.src = URL.createObjectURL(file);
    video.preload = 'metadata';
    video.muted = true;
    
    const timeout = setTimeout(() => {
      URL.revokeObjectURL(video.src);
      reject(new Error('압축 시간 초과 (60초)'));
    }, 60000);
    
    video.onloadedmetadata = () => {
      console.log(`📹 동영상 정보: ${video.duration.toFixed(1)}초, ${video.videoWidth}x${video.videoHeight}, 파일크기: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      
      const scale = Math.min(1, 360 / Math.max(video.videoWidth, video.videoHeight));
      canvas.width = Math.floor(video.videoWidth * scale);
      canvas.height = Math.floor(video.videoHeight * scale);
      
      console.log(`📐 압축 해상도: ${canvas.width}x${canvas.height} (${Math.round(scale * 100)}%)`);
      
      const fileSizeMB = file.size / 1024 / 1024;
      const duration = video.duration;
      let videoBitsPerSecond = 300000;
      
      if (fileSizeMB > 20) {
        videoBitsPerSecond = 200000;
      } else if (fileSizeMB > 10) {
        videoBitsPerSecond = 250000;
      } else if (duration > 10) {
        videoBitsPerSecond = 300000;
      } else if (duration > 5) {
        videoBitsPerSecond = 400000;
      } else {
        videoBitsPerSecond = 500000;
      }
      
      console.log(`🎬 비트레이트: ${videoBitsPerSecond / 1000}kbps (원본 ${fileSizeMB.toFixed(2)}MB)`);
      
      const chunks: Blob[] = [];
      const stream = canvas.captureStream(15);
      
      let mimeType = 'video/webm;codecs=vp8';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
        console.warn('⚠️ vp8 코덱 미지원, 기본 코덱 사용');
      }
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond
      });
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        clearTimeout(timeout);
        const blob = new Blob(chunks, { type: 'video/webm' });
        
        const compressionRatio = ((1 - blob.size / file.size) * 100).toFixed(1);
        console.log(`✅ 압축 완료: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(blob.size / 1024 / 1024).toFixed(2)}MB (${compressionRatio}% 감소)`);
        
        const compressedFile = new File(
          [blob], 
          file.name.replace(/\.[^.]+$/, '.webm'), 
          { type: 'video/webm' }
        );
        URL.revokeObjectURL(video.src);
        resolve(compressedFile);
      };
      
      mediaRecorder.onerror = (e) => {
        clearTimeout(timeout);
        URL.revokeObjectURL(video.src);
        console.error('❌ MediaRecorder 에러:', e);
        reject(new Error('압축 중 오류 발생'));
      };
      
      mediaRecorder.start();
      console.log('🎥 압축 녹화 시작...');
      
      video.currentTime = 0;
      video.play().catch(err => {
        clearTimeout(timeout);
        console.error('❌ 동영상 재생 실패:', err);
        reject(err);
      });
      
      const drawFrame = () => {
        if (video.paused || video.ended) {
          console.log('🎬 녹화 종료');
          mediaRecorder.stop();
          return;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        requestAnimationFrame(drawFrame);
      };
      
      video.onplaying = () => {
        console.log('▶️ 동영상 재생 중...');
        drawFrame();
      };
    };
    
    video.onerror = (e) => {
      clearTimeout(timeout);
      URL.revokeObjectURL(video.src);
      console.error('❌ 동영상 로드 실패:', e);
      reject(new Error('동영상 로드 실패'));
    };
  });
}

// 📸 사진 전용 업로드 핸들러 (방음부스 방식: 즉시 업로드)
export async function handleImageSelect(
  e: React.ChangeEvent<HTMLInputElement>,
  currentUrls: string[],
  setFormData: (updater: (prev: any) => any) => void,
  setIsCompressing: (value: boolean) => void,
  setUploadProgress?: (value: {current: number, total: number} | null) => void
): Promise<void> {
  const files = e.target.files;
  if (!files) return;
  
  const selectedFiles = Array.from(files);
  const loadingId = toast.loading(`사진 업로드 중... (0/${selectedFiles.length})`);
  
  // 🔥 업로드 진행 상태 초기화
  if (setUploadProgress) {
    setUploadProgress({ current: 0, total: selectedFiles.length });
  }
  
  const supabase = getSupabaseClient();
  const requestId = generateRequestId();
  const uploadedUrls: string[] = [];
  const failedFiles: string[] = [];
  
  // 🔥 [핵심] 순차 처리 + 즉시 Supabase 업로드
  for (let i = 0; i < selectedFiles.length; i++) {
    const file = selectedFiles[i];
    
    try {
      // 🔥 진행 상황 업데이트
      if (setUploadProgress) {
        setUploadProgress({ current: i, total: selectedFiles.length });
      }
      
      toast.loading(`사진 업로드 중... (${i + 1}/${selectedFiles.length})`, { id: loadingId });
      console.log(`📸 [${i+1}/${selectedFiles.length}] 이미지 처리 시작: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      
      let processedFile = file;
      
      // 1️⃣ HEIC 변환
      if (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic') {
        try {
          console.log('🔄 HEIC → JPEG 변환 시작...');
          const convertedBlob = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.6
          }) as Blob;
          
          processedFile = new File(
            [convertedBlob], 
            file.name.replace(/\.heic$/i, '.jpg'), 
            { type: 'image/jpeg' }
          );
          console.log(`✅ HEIC 변환 완료: ${(processedFile.size / 1024 / 1024).toFixed(2)}MB`);
        } catch (heicError) {
          console.warn('⚠️ HEIC 변환 실패, 원본 사용:', heicError);
        }
      }
      
      // 2️⃣ 강력 압축 (300KB 이하로 더욱 강력하게)
      setIsCompressing(true);
      
      const options = {
        maxSizeMB: 0.3, // 500KB → 300KB로 더욱 압축
        maxWidthOrHeight: 1000, // 1200 → 1000으로 축소
        useWebWorker: false,
        fileType: 'image/jpeg' as const,
        initialQuality: 0.5, // 0.6 → 0.5로 품질 낮춤
        maxIteration: 15 // 10 → 15로 증가 (더 압축)
      };
      
      console.log(`🔧 초강력 압축 시작: 최대 0.3MB, 1000px, 품질 50%`);
      
      const compressionPromise = imageCompression(processedFile, options);
      const timeoutPromise = new Promise<File>((_, reject) => 
        setTimeout(() => reject(new Error('압축 시간 초과')), 30000)
      );
      
      const compressedBlob = await Promise.race([compressionPromise, timeoutPromise]);
      
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const safeName = file.name
        .replace(/\.heic$/i, '.jpg')
        .replace(/[^a-zA-Z0-9가-힣._-]/g, '_')
        .substring(0, 50);
      
      const compressedFile = new File(
        [compressedBlob], 
        `img_${timestamp}_${random}_${i}_${safeName}`, 
        { type: 'image/jpeg' }
      );
      
      setIsCompressing(false);
      
      console.log(`✅ 압축 완료: ${(processedFile.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024).toFixed(0)}KB`);
      
      // 🔥 3️⃣ 즉시 Supabase Storage 업로드 (재시도 로직 포함)
      const fileExt = compressedFile.name.split('.').pop();
      const fileName = `${requestId}_${timestamp}_${random}.${fileExt}`;
      
      console.log(`📤 [${i+1}/${selectedFiles.length}] Supabase 업로드 시작:`, fileName, `(${(compressedFile.size / 1024 / 1024).toFixed(2)}MB)`);
      
      // 🔄 재시도 로직 (최대 3회)
      let uploadSuccess = false;
      let lastError = null;
      
      for (let retryCount = 0; retryCount < 3; retryCount++) {
        try {
          if (retryCount > 0) {
            console.log(`🔄 재시도 ${retryCount}/3...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // 재시도 전 대기
          }
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('printer-images')
            .upload(fileName, compressedFile, {
              cacheControl: '3600',
              upsert: false,
              contentType: compressedFile.type
            });
          
          if (uploadError) {
            throw uploadError;
          }
          
          // Public URL 생성
          const { data: publicUrlData } = supabase.storage
            .from('printer-images')
            .getPublicUrl(fileName);
          
          uploadedUrls.push(publicUrlData.publicUrl);
          console.log(`✅ [${i+1}/${selectedFiles.length}] 업로드 완료:`, publicUrlData.publicUrl);
          uploadSuccess = true;
          break; // 성공하면 재시도 루프 종료
          
        } catch (retryError: any) {
          lastError = retryError;
          console.error(`❌ 업로드 시도 ${retryCount + 1} 실패:`, retryError?.message || retryError);
          
          // 502, 503, 504 에러면 재시도, 그 외는 즉시 실패
          if (retryError?.message?.includes('502') || 
              retryError?.message?.includes('503') || 
              retryError?.message?.includes('504')) {
            if (retryCount < 2) {
              console.log(`⏳ 서버 문제로 인한 재시도 대기 중...`);
              continue;
            }
          } else {
            // 502/503/504 아닌 에러는 재시도 중단
            break;
          }
        }
      }
      
      if (!uploadSuccess) {
        console.error('❌ 3회 재시도 후에도 업로드 실패:', lastError);
        toast.warning(`⚠️ ${file.name} 업로드 실패 - 건너뜀`, { duration: 2000 });
        failedFiles.push(file.name);
        continue;
      }
      
      // ✅ 500ms 딜레이 (서버 부하 방지 - 방음부스 방식)
      if (i < selectedFiles.length - 1) {
        console.log('⏳ 다음 파일 업로드까지 500ms 대기...');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
    } catch (error: any) {
      setIsCompressing(false);
      console.error(`❌ [${i+1}/${selectedFiles.length}] 처리 실패:`, error?.message || error);
      toast.warning(`⚠️ ${file.name} 실패 - 건너뜀`, { duration: 2000 });
      failedFiles.push(file.name);
      
      // ✅ continue로 다음 파일 계속
      continue;
    }
  }
  
  // 🔥 업로드 완료 - 진행 상태 초기화
  if (setUploadProgress) {
    setUploadProgress(null);
  }
  
  // 결과 업데이트 (URL만 저장)
  if (uploadedUrls.length > 0) {
    setFormData((prev: any) => ({
      ...prev,
      uploadedImageUrls: [...(prev.uploadedImageUrls || []), ...uploadedUrls],
    }));
  }
  
  // 결과 알림
  toast.dismiss(loadingId);
  
  if (uploadedUrls.length > 0 && failedFiles.length === 0) {
    toast.success(`✅ ${uploadedUrls.length}개 사진 업로드 완료!`);
  } else if (uploadedUrls.length > 0 && failedFiles.length > 0) {
    toast.warning(`⚠️ ${uploadedUrls.length}개 성공, ${failedFiles.length}개 실패`);
  } else {
    toast.error(`❌ 사진 업로드 실패 (${failedFiles.length}개)`);
  }
  
  if (failedFiles.length > 0) {
    console.log('❌ 실패한 파일:', failedFiles);
  }
  
  // input 초기화
  e.target.value = '';
}

// 🎬 영상 전용 업로드 핸들러 (방음부스 방식: 즉시 업로드)
export async function handleVideoSelect(
  e: React.ChangeEvent<HTMLInputElement>,
  currentUrls: string[],
  setFormData: (updater: (prev: any) => any) => void,
  setUploadProgress?: (value: {current: number, total: number} | null) => void
): Promise<void> {
  const files = e.target.files;
  if (!files) return;
  
  const selectedFiles = Array.from(files);
  const loadingId = toast.loading(`영상 업로드 중... (0/${selectedFiles.length})`);
  
  // 🔥 업로드 진행 상태 초기화
  if (setUploadProgress) {
    setUploadProgress({ current: 0, total: selectedFiles.length });
  }
  
  const supabase = getSupabaseClient();
  const requestId = generateRequestId();
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  const uploadedUrls: string[] = [];
  const failedFiles: string[] = [];
  
  for (let i = 0; i < selectedFiles.length; i++) {
    const file = selectedFiles[i];
    
    try {
      // 🔥 진행 상황 업데이트
      if (setUploadProgress) {
        setUploadProgress({ current: i, total: selectedFiles.length });
      }
      
      toast.loading(`영상 업로드 중... (${i + 1}/${selectedFiles.length})`, { id: loadingId });
      console.log(`🎬 [${i+1}/${selectedFiles.length}] 동영상 처리: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      
      // 100MB 초과 경고
      if (file.size > 100 * 1024 * 1024) {
        toast.error(`동영상이 너무 큽니다! (${(file.size / 1024 / 1024).toFixed(1)}MB)\n100MB 이하로 촬영해주세요.`, {
          duration: 5000
        });
        failedFiles.push(file.name);
        continue;
      }
      
      let processedFile = file;
      
      // 모바일에서 압축
      if (isMobile) {
        try {
          const compressedVideo = await compressVideo(file);
          processedFile = compressedVideo;
          console.log(`✅ 동영상 압축 완료: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedVideo.size / 1024 / 1024).toFixed(2)}MB`);
        } catch (error) {
          console.error('❌ 동영상 압축 실패:', error);
          
          if (file.size <= 100 * 1024 * 1024) {
            toast.warning(`압축 실패 → 원본 사용: ${file.name}`, { duration: 3000 });
            processedFile = file;
          } else {
            failedFiles.push(file.name);
            continue;
          }
        }
      }
      
      // 🔥 즉시 Supabase Storage 업로드 (방음부스 방식)
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const fileExt = processedFile.name.split('.').pop();
      const fileName = `${requestId}_${timestamp}_${random}.${fileExt}`;
      
      console.log(`📤 [${i+1}/${selectedFiles.length}] Supabase 업로드 시작:`, fileName);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('printer-images')
        .upload(fileName, processedFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: processedFile.type
        });
      
      if (uploadError) {
        console.error('❌ 업로드 실패:', uploadError);
        toast.warning(`⚠️ ${file.name} 업로드 실패 - 건너뜀`, { duration: 2000 });
        failedFiles.push(file.name);
        
        // ✅ continue로 다음 파일 계속
        continue;
      }
      
      // Public URL 생성
      const { data: publicUrlData } = supabase.storage
        .from('printer-images')
        .getPublicUrl(fileName);
      
      uploadedUrls.push(publicUrlData.publicUrl);
      console.log(`✅ [${i+1}/${selectedFiles.length}] 업로드 완료:`, publicUrlData.publicUrl);
      
      // ✅ 500ms 딜레이 (서버 부하 방지 - 방음부스 방식)
      if (i < selectedFiles.length - 1) {
        console.log('⏳ 다음 파일 업로드까지 500ms 대기...');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
    } catch (error) {
      console.error(`❌ [${i+1}/${selectedFiles.length}] 영상 처리 실패:`, error);
      toast.warning(`⚠️ ${file.name} 실패 - 건너뜀`, { duration: 2000 });
      failedFiles.push(file.name);
      
      // ✅ continue로 다음 파일 계속
      continue;
    }
  }
  
  // 🔥 업로드 완료 - 진행 상태 초기화
  if (setUploadProgress) {
    setUploadProgress(null);
  }
  
  // 결과 업데이트 (URL만 저장)
  if (uploadedUrls.length > 0) {
    setFormData((prev: any) => ({
      ...prev,
      uploadedImageUrls: [...(prev.uploadedImageUrls || []), ...uploadedUrls],
    }));
  }
  
  // 결과 알림
  toast.dismiss(loadingId);
  
  if (uploadedUrls.length > 0 && failedFiles.length === 0) {
    toast.success(`✅ ${uploadedUrls.length}개 영상 업로드 완료!`);
  } else if (uploadedUrls.length > 0 && failedFiles.length > 0) {
    toast.warning(`⚠️ ${uploadedUrls.length}개 성공, ${failedFiles.length}개 실패`);
  } else {
    toast.error(`❌ 영상 업로드 실패 (${failedFiles.length}개)`);
  }
  
  // input 초기화
  e.target.value = '';
}