import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Brain, Clock, Target, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface StudySessionStarterProps {
  onStartSession: (config: SessionConfig) => void;
  suggestions?: string[];
}

export interface SessionConfig {
  subject?: string;
  topic?: string;
  duration: number;
  focusMode: boolean;
  musicEnabled: boolean;
}

export function StudySessionStarter({ onStartSession, suggestions = [] }: StudySessionStarterProps) {
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [focusMode, setFocusMode] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);

  const durations = [
    { value: 25, label: '25 min', subtitle: 'Pomodoro', icon: Clock },
    { value: 45, label: '45 min', subtitle: 'Focused', icon: Target },
    { value: 90, label: '90 min', subtitle: 'Deep Work', icon: Brain }
  ];

  const defaultSuggestions = [
    'Review Biology: Cell Structure',
    'Practice Mathematics: Calculus',
    'Study Chemistry: Organic Reactions',
    'Review Physics: Thermodynamics'
  ];

  const displaySuggestions = suggestions.length > 0 ? suggestions : defaultSuggestions;

  const handleStart = () => {
    const config: SessionConfig = {
      duration: selectedDuration,
      focusMode,
      musicEnabled,
      ...(selectedSuggestion && {
        subject: selectedSuggestion.split(':')[0].replace('Review ', '').replace('Practice ', '').replace('Study ', '').trim(),
        topic: selectedSuggestion.split(':')[1]?.trim()
      })
    };
    onStartSession(config);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            What do you want to study today?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Smart Suggestions */}
          <div className="space-y-3">
            <Label className="text-sm text-muted-foreground">Smart Suggestions</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {displaySuggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Button
                    variant={selectedSuggestion === suggestion ? 'default' : 'outline'}
                    className="w-full justify-start h-auto py-3"
                    onClick={() => setSelectedSuggestion(
                      selectedSuggestion === suggestion ? null : suggestion
                    )}
                  >
                    <div className="text-left">
                      <p className="font-medium">{suggestion.split(':')[0]}</p>
                      {suggestion.includes(':') && (
                        <p className="text-xs opacity-70">{suggestion.split(':')[1]}</p>
                      )}
                    </div>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Duration Selection */}
          <div className="space-y-3">
            <Label className="text-sm text-muted-foreground">Session Duration</Label>
            <div className="grid grid-cols-3 gap-3">
              {durations.map((duration) => (
                <Button
                  key={duration.value}
                  variant={selectedDuration === duration.value ? 'default' : 'outline'}
                  className="flex flex-col gap-2 h-auto py-4"
                  onClick={() => setSelectedDuration(duration.value)}
                >
                  <duration.icon className="w-5 h-5" />
                  <span className="font-semibold">{duration.label}</span>
                  <Badge variant="secondary" className="text-xs">
                    {duration.subtitle}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          {/* Session Settings */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="focus-mode">Focus Mode</Label>
                <p className="text-xs text-muted-foreground">
                  Minimize distractions during study
                </p>
              </div>
              <Switch
                id="focus-mode"
                checked={focusMode}
                onCheckedChange={setFocusMode}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="music">Lofi Music</Label>
                <p className="text-xs text-muted-foreground">
                  Background music to help focus
                </p>
              </div>
              <Switch
                id="music"
                checked={musicEnabled}
                onCheckedChange={setMusicEnabled}
              />
            </div>
          </div>

          {/* Start Button */}
          <Button
            onClick={handleStart}
            size="lg"
            className="w-full"
          >
            <Brain className="w-4 h-4 mr-2" />
            Start Study Session
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}