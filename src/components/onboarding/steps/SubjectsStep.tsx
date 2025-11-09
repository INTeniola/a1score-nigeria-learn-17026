import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookOpen, X, ArrowRight, Search } from 'lucide-react';
import { POPULAR_SUBJECTS } from '@/types/onboarding';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface SubjectsStepProps {
  initialSubjects: string[];
  onNext: (subjects: string[]) => void;
  onSkip: () => void;
}

export const SubjectsStep = ({ initialSubjects, onNext, onSkip }: SubjectsStepProps) => {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(initialSubjects);
  const [customSubject, setCustomSubject] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const addSubject = (subject: string) => {
    if (!selectedSubjects.includes(subject)) {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
    setCustomSubject('');
    setIsOpen(false);
  };

  const removeSubject = (subject: string) => {
    setSelectedSubjects(selectedSubjects.filter((s) => s !== subject));
  };

  const handleCustomSubjectAdd = () => {
    if (customSubject.trim()) {
      addSubject(customSubject.trim());
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="text-center space-y-2 pb-4">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
          <BookOpen className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold">What are you learning?</CardTitle>
        <CardDescription>
          Select subjects you're currently studying. You can always add more later.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-2">
        {/* Search and Add Custom Subject */}
        <div className="space-y-3">
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <Search className="mr-2 h-4 w-4" />
                {selectedSubjects.length > 0
                  ? `${selectedSubjects.length} subject(s) selected`
                  : 'Search subjects...'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="Search subjects..."
                  value={customSubject}
                  onValueChange={setCustomSubject}
                />
                <CommandList>
                  <CommandEmpty>
                    <div className="p-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={handleCustomSubjectAdd}
                      >
                        Add "{customSubject}"
                      </Button>
                    </div>
                  </CommandEmpty>
                  <CommandGroup>
                    {POPULAR_SUBJECTS.filter(
                      (s) =>
                        s.toLowerCase().includes(customSubject.toLowerCase()) &&
                        !selectedSubjects.includes(s)
                    ).map((subject) => (
                      <CommandItem
                        key={subject}
                        onSelect={() => addSubject(subject)}
                      >
                        {subject}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Selected Subjects */}
        {selectedSubjects.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Your Subjects ({selectedSubjects.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedSubjects.map((subject) => (
                <Badge
                  key={subject}
                  variant="secondary"
                  className="px-3 py-1.5 text-sm gap-1"
                >
                  {subject}
                  <button
                    onClick={() => removeSubject(subject)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Popular Subjects Quick Select */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Popular Subjects</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SUBJECTS.slice(0, 8)
              .filter((s) => !selectedSubjects.includes(s))
              .map((subject) => (
                <Button
                  key={subject}
                  variant="outline"
                  size="sm"
                  onClick={() => addSubject(subject)}
                  className="text-xs"
                >
                  {subject}
                </Button>
              ))}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          <Button variant="ghost" onClick={onSkip}>
            Skip
          </Button>
          <Button
            onClick={() => onNext(selectedSubjects)}
            disabled={selectedSubjects.length === 0}
            className="gap-2"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
