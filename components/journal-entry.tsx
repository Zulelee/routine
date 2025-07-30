"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BookOpen, Smile, Meh, Frown } from "lucide-react";

interface JournalEntryProps {
  journalEntry: string;
  mood: string;
  onJournalChange: (entry: string) => void;
  onMoodChange: (mood: string) => void;
}

const moodOptions = [
  { value: "😊", label: "Happy", icon: Smile, color: "text-green-500" },
  { value: "😐", label: "Neutral", icon: Meh, color: "text-yellow-500" },
  { value: "😔", label: "Sad", icon: Frown, color: "text-red-500" },
];

export function JournalEntry({
  journalEntry,
  mood,
  onJournalChange,
  onMoodChange,
}: JournalEntryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-lg">Daily Journal</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Collapse" : "Expand"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mood Selection */}
        <div className="space-y-3">
          <Label className="text-base font-medium">
            How are you feeling today?
          </Label>
          <div className="flex gap-3">
            {moodOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.value}
                  variant={mood === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => onMoodChange(option.value)}
                  className="flex items-center gap-2"
                >
                  <span className="text-lg">{option.value}</span>
                  <span className="hidden sm:inline">{option.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Journal Entry */}
        <div className="space-y-3">
          <Label htmlFor="journal" className="text-base font-medium">
            Today&apos;s Reflection
          </Label>
          <Textarea
            id="journal"
            placeholder="Write about your day, thoughts, or anything on your mind..."
            value={journalEntry}
            onChange={(e) => onJournalChange(e.target.value)}
            className={`transition-all duration-200 ${
              isExpanded ? "min-h-[200px]" : "min-h-[100px]"
            }`}
          />
        </div>

        {/* Quick Prompts */}
        {isExpanded && (
          <div className="space-y-3">
            <Label className="text-base font-medium">Quick Prompts</Label>
            <div className="grid gap-2 text-sm text-muted-foreground">
              <p>• What went well today?</p>
              <p>• What challenged you?</p>
              <p>• What are you grateful for?</p>
              <p>• What would you like to improve tomorrow?</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
