import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAttendanceRecords, exportAttendanceAsText } from '@/utils/faceRecognition';
import { useToast } from '@/hooks/use-toast';

const AttendanceLog = () => {
  const records = getAttendanceRecords();
  const { toast } = useToast();

  const handleDownload = () => {
    const text = exportAttendanceAsText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Downloaded',
      description: 'Attendance log saved as text file',
    });
  };

  const groupedRecords = records.reduce((acc, record) => {
    const date = new Date(record.timestamp).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(record);
    return acc;
  }, {} as Record<string, typeof records>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Attendance Log</h2>
            <p className="text-muted-foreground">View and export records</p>
          </div>
        </div>
        
        {records.length > 0 && (
          <Button onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
        )}
      </div>

      <Card>
        <ScrollArea className="h-[500px]">
          {records.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No attendance records yet</p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {Object.entries(groupedRecords).map(([date, dateRecords]) => (
                <div key={date}>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-3 sticky top-0 bg-card py-2">
                    {date}
                  </h3>
                  <div className="space-y-2">
                    {dateRecords.map((record) => (
                      <Card key={record.id} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{record.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(record.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="h-2 w-2 rounded-full bg-accent" />
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
};

export default AttendanceLog;
