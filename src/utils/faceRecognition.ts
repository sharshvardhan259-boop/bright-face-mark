import { pipeline, env } from '@huggingface/transformers';

env.allowLocalModels = false;
env.useBrowserCache = true;

let detector: any = null;

export async function initializeFaceDetector() {
  if (!detector) {
    detector = await pipeline('object-detection', 'Xenova/detr-resnet-50', {
      device: 'webgpu',
    });
  }
  return detector;
}

export async function detectFace(imageElement: HTMLImageElement | HTMLVideoElement) {
  const det = await initializeFaceDetector();
  const results = await det(imageElement, { threshold: 0.5 });
  
  // Filter for person detections (face region)
  const faces = results.filter((r: any) => r.label === 'person');
  return faces.length > 0 ? faces[0] : null;
}

export function extractFaceEmbedding(canvas: HTMLCanvasElement, box: any): number[] {
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];
  
  const { xmin, ymin, xmax, ymax } = box;
  const width = xmax - xmin;
  const height = ymax - ymin;
  
  const imageData = ctx.getImageData(xmin, ymin, width, height);
  const pixels = imageData.data;
  
  // Create a simple feature vector from image data
  const features: number[] = [];
  const step = 4; // Sample every 4th pixel
  
  for (let i = 0; i < pixels.length; i += step * 4) {
    features.push(pixels[i] / 255); // R
    features.push(pixels[i + 1] / 255); // G
    features.push(pixels[i + 2] / 255); // B
  }
  
  return features;
}

export function compareFaces(embedding1: number[], embedding2: number[]): number {
  if (embedding1.length !== embedding2.length) return 0;
  
  // Calculate cosine similarity
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
    norm1 += embedding1[i] * embedding1[i];
    norm2 += embedding2[i] * embedding2[i];
  }
  
  const similarity = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  return similarity;
}

export interface RegisteredFace {
  id: string;
  name: string;
  embedding: number[];
  registeredAt: string;
}

export interface AttendanceRecord {
  id: string;
  name: string;
  timestamp: string;
}

export function saveRegisteredFace(face: RegisteredFace) {
  const faces = getRegisteredFaces();
  faces.push(face);
  localStorage.setItem('registeredFaces', JSON.stringify(faces));
}

export function getRegisteredFaces(): RegisteredFace[] {
  const data = localStorage.getItem('registeredFaces');
  return data ? JSON.parse(data) : [];
}

export function saveAttendance(record: AttendanceRecord) {
  const records = getAttendanceRecords();
  records.push(record);
  localStorage.setItem('attendanceRecords', JSON.stringify(records));
}

export function getAttendanceRecords(): AttendanceRecord[] {
  const data = localStorage.getItem('attendanceRecords');
  return data ? JSON.parse(data) : [];
}

export function findMatchingFace(embedding: number[], threshold = 0.7): RegisteredFace | null {
  const faces = getRegisteredFaces();
  let bestMatch: RegisteredFace | null = null;
  let bestScore = 0;
  
  for (const face of faces) {
    const score = compareFaces(embedding, face.embedding);
    if (score > bestScore && score > threshold) {
      bestScore = score;
      bestMatch = face;
    }
  }
  
  return bestMatch;
}

export function exportAttendanceAsText(): string {
  const records = getAttendanceRecords();
  
  let text = '=== ATTENDANCE RECORDS ===\n\n';
  
  if (records.length === 0) {
    text += 'No attendance records found.\n';
    return text;
  }
  
  // Group by date
  const byDate = records.reduce((acc, record) => {
    const date = new Date(record.timestamp).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(record);
    return acc;
  }, {} as Record<string, AttendanceRecord[]>);
  
  Object.entries(byDate).forEach(([date, dateRecords]) => {
    text += `Date: ${date}\n`;
    text += '-'.repeat(50) + '\n';
    
    dateRecords.forEach((record) => {
      const time = new Date(record.timestamp).toLocaleTimeString();
      text += `${time} - ${record.name}\n`;
    });
    
    text += '\n';
  });
  
  return text;
}
