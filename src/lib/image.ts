// 업로드 파일을 정사각 크롭 + 최대 변 size로 리사이즈해 JPEG Blob 반환
export async function processImage(file: File, size = 512): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - side) / 2;
  const sy = (bitmap.height - side) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, size, size);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      b => (b ? resolve(b) : reject(new Error('toBlob failed'))),
      'image/jpeg', 0.82,
    );
  });
}

// Blob → object URL (img src용). 컴포넌트 언마운트 시 revoke 필요.
export function blobUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}
