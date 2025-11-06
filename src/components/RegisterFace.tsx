import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import CameraView from './CameraView';
import { detectFace, extractFaceEmbedding, saveRegisteredFace, RegisteredFace } from '@/utils/faceRecognition';

const RegisterFace = () => {
  const [name, setName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleCapture = async (canvas: HTMLCanvasElement) => {
    if (!name.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter a name before capturing',
        variant: 'destructive',
      });
      return;
    }

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

      const registeredFace: RegisteredFace = {
        id: Date.now().toString(),
        name: name.trim(),
        embedding,
        registeredAt: new Date().toISOString(),
      };

      saveRegisteredFace(registeredFace);

      toast({
        title: 'Registration Successful',
        description: `${name} has been registered`,
      });

      setName('');
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration Failed',
        description: 'An error occurred during registration',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10">
          <UserPlus className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Register New Person</h2>
          <p className="text-muted-foreground">Capture face for attendance tracking</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name..."
              disabled={isProcessing}
              className="mt-1.5"
            />
          </div>

          <CameraView onCapture={handleCapture} />

          {isProcessing && (
            <div className="text-center py-4">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="mt-2 text-sm text-muted-foreground">Processing...</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default RegisterFace;
