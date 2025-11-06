import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CameraViewProps {
  onCapture?: (canvas: HTMLCanvasElement) => void;
  showCapture?: boolean;
}

const CameraView = ({ onCapture, showCapture = true }: CameraViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsActive(false);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        
        if (onCapture) {
          onCapture(canvas);
        }
      }
    }
  };

  return (
    <Card className="overflow-hidden shadow-medium">
      <div className="relative bg-muted aspect-video flex items-center justify-center min-h-[360px]">
        {isActive ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
          </>
        ) : (
          <div className="text-center p-8">
            <Camera className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Camera inactive</p>
          </div>
        )}
      </div>
      
      <div className="p-4 flex gap-2 justify-center bg-card">
        {!isActive ? (
          <Button onClick={startCamera} className="gap-2">
            <Camera className="h-4 w-4" />
            Start Camera
          </Button>
        ) : (
          <>
            <Button onClick={stopCamera} variant="secondary" className="gap-2">
              <CameraOff className="h-4 w-4" />
              Stop Camera
            </Button>
            {showCapture && (
              <Button onClick={captureFrame} className="gap-2">
                <Camera className="h-4 w-4" />
                Capture
              </Button>
            )}
          </>
        )}
      </div>
    </Card>
  );
};

export default CameraView;
