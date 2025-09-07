import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ElapsedTime } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatElapsedTime(elapsed: ElapsedTime): string {
  if (elapsed.final) {
    return "物語の最後";
  }
  
  if (elapsed.value && elapsed.unit) {
    const unitNames = {
      sec: "秒後",
      min: "分後",
      hr: "時間後",
    };
    return `${elapsed.value}${unitNames[elapsed.unit]}`;
  }
  
  return "未設定";
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'サポートされていないファイル形式です。JPEG, PNG, GIF, WebP のみサポートされています。'
    };
  }
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'ファイルサイズが大きすぎます。10MB以下のファイルを選択してください。'
    };
  }
  
  return { valid: true };
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateFrameId(): string {
  return `frame_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function downloadImage(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

export function resizeImage(
  file: File, 
  maxWidth: number, 
  maxHeight: number, 
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }
    
    img.onload = () => {
      const { width, height } = img;
      
      // Calculate new dimensions
      let newWidth = width;
      let newHeight = height;
      
      if (width > height) {
        if (width > maxWidth) {
          newHeight = (height * maxWidth) / width;
          newWidth = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          newWidth = (width * maxHeight) / height;
          newHeight = maxHeight;
        }
      }
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(dataUrl);
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength - 3) + '...';
}