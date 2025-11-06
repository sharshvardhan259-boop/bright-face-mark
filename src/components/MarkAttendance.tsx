import { useState, useEffect } from 'react';
import { CheckCircle2, UserCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import CameraView from './CameraView';
import { 
  detectFace, 
  extractFaceEmbedding, 
  findMatchingFace, 
  saveAttendance,
  AttendanceRecord 
} from '@/utils/faceRecognition';

const MarkAttendance = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastMarked, setLastMarked] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (lastMarked) {
      const timer = setTimeout(() => setLastMarked(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastMarked]);

  const handleCapture = async (canvas: HTMLCanvasElement) => {
    setIsProcessing(true);

    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable');

      const img = new Image();
      img.src = canvas.toDataURL();
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const face = await detectFace(img);
      
      if (!face) {
        toast({
          title: 'No Face Detected',
          description: 'Please ensure your face is clearly visible',
          variant: 'destructive',
        });
        setIsProcessing(false);
        return;
      }

      const embedding = extractFaceEmbedding(canvas, face.box);
      const match = findMatchingFace(embedding);

      if (!match) {
        toast({
          title: 'Face Not Recognized',
          description: 'Please register first or try again',
          variant: 'destructive',
        });
        setIsProcessing(false);
        return;
      }

      const record: AttendanceRecord = {
        id: Date.now().toString(),
        name: match.name,
        timestamp: new Date().toISOString(),
      };

      saveAttendance(record);
      setLastMarked(match.name);

      toast({
        title: 'Attendance Marked',
        description: `Welcome, ${match.name}!`,
      });

    } catch (error) {
      console.error('Attendance error:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark attendance',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-accent/10">
          <UserCheck className="h-6 w-6 text-accent" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Mark Attendance</h2>
          <p className="text-muted-foreground">Position your face in the camera</p>
        </div>
      </div>

      <CameraView onCapture={handleCapture} />

      {isProcessing && (
        <Card className="p-6 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Recognizing face...</p>
        </Card>
      )}

      {lastMarked && (
        <Card className="p-6 bg-accent/10 border-accent">
          <div className="flex items-center gap-3 justify-center">
            <CheckCircle2 className="h-6 w-6 text-accent" />
            <div>
              <p className="font-semibold text-accent">Attendance Marked</p>
              <p className="text-sm text-muted-foreground">Welcome, {lastMarked}!</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MarkAttendance;
