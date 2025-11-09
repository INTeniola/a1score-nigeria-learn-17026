import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  Play, Pause, RotateCcw, Coffee, BookOpen, Timer
} from "lucide-react";
import { toast } from "sonner";
import { useStudyTimer } from "@/hooks/useStudyTimer";

interface TimerPreset {
  name: string;
  focus: number;
  shortBreak: number;
  longBreak: number;
}

const StudyTimer = () => {
  const {
    currentSession,
    isRunning,
    timeElapsed,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    getTodayStats
  } = useStudyTimer();

  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [preset, setPreset] = useState('classic');
  const [targetMinutes, setTargetMinutes] = useState(25);
  const [todayStats, setTodayStats] = useState({ totalMinutes: 0, sessionCount: 0 });

  const presets: Record<string, TimerPreset> = {
    classic: {
      name: 'Classic Pomodoro',
      focus: 25,
      shortBreak: 5,
      longBreak: 15,
    },
    extended: {
      name: 'Extended Focus',
      focus: 50,
      shortBreak: 10,
      longBreak: 20,
    },
    short: {
      name: 'Short Burst',
      focus: 15,
      shortBreak: 3,
      longBreak: 10,
    },
  };

  const subjects = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'English',
    'Economics',
    'Government',
    'Literature'
  ];

  useEffect(() => {
    loadTodayStats();
  }, []);

  useEffect(() => {
    const focusTime = presets[preset].focus;
    setTargetMinutes(focusTime);
  }, [preset]);

  const loadTodayStats = async () => {
    const stats = await getTodayStats();
    setTodayStats(stats);
  };

  const handleStart = async () => {
    await startSession('focus', selectedSubject, undefined, {
      preset,
      targetMinutes
    });
  };

  const handleEnd = async () => {
    await endSession();
    await loadTodayStats();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progress = targetMinutes > 0 ? (timeElapsed / (targetMinutes * 60)) * 100 : 0;
  const minutesElapsed = Math.floor(timeElapsed / 60);

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Timer className="h-8 w-8 text-blue-600" />
          Study Timer
        </h2>
        <p className="text-gray-600 mt-1">Track your focused study sessions</p>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Today's Study Time</p>
              <p className="text-3xl font-bold text-blue-600">{todayStats.totalMinutes} min</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Sessions Completed</p>
              <p className="text-3xl font-bold text-green-600">{todayStats.sessionCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timer Display */}
      <Card>
        <CardHeader>
          <CardTitle>Focus Timer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!currentSession ? (
            <>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="preset">Timer Preset</Label>
                  <Select value={preset} onValueChange={setPreset}>
                    <SelectTrigger id="preset">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(presets).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value.name} ({value.focus} min)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger id="subject">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleStart} className="w-full" size="lg">
                <Play className="h-5 w-5 mr-2" />
                Start Study Session
              </Button>
            </>
          ) : (
            <>
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="w-48 h-48 mx-auto relative">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-200"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 88}`}
                        strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                        className="text-blue-600 transition-all duration-1000"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-5xl font-bold text-gray-900">{formatTime(timeElapsed)}</p>
                        <p className="text-sm text-gray-600 mt-2">{selectedSubject}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-gray-600">
                    {minutesElapsed} / {targetMinutes} minutes
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {isRunning ? (
                  <Button onClick={pauseSession} variant="outline" className="flex-1">
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                ) : (
                  <Button onClick={resumeSession} className="flex-1">
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </Button>
                )}
                <Button onClick={handleEnd} variant="destructive" className="flex-1">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  End Session
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Study Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Eliminate distractions before starting your timer</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Use breaks to rest your eyes and stretch</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Stay hydrated during study sessions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Review what you learned after each session</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudyTimer;