import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Fingerprint } from 'lucide-react';
import RegisterFace from '@/components/RegisterFace';
import MarkAttendance from '@/components/MarkAttendance';
import AttendanceLog from '@/components/AttendanceLog';

const Index = () => {
  const [activeTab, setActiveTab] = useState('attendance');

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-medium">
              <Fingerprint className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Face Attendance
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            AI-powered attendance tracking system
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="attendance">Mark Attendance</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
            <TabsTrigger value="log">View Log</TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="mt-0">
            <MarkAttendance />
          </TabsContent>

          <TabsContent value="register" className="mt-0">
            <RegisterFace />
          </TabsContent>

          <TabsContent value="log" className="mt-0">
            <AttendanceLog />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
