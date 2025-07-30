"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BookOpen, Calendar, Heart, MessageSquare } from "lucide-react";
import { format, subDays, eachDayOfInterval } from "date-fns";

interface JournalEntry {
  id: string;
  date: string;
  journal_entry?: string;
  mood?: string;
  water_glasses: number;
  exercised: boolean;
  sleep_hours?: number;
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadJournalEntries();
  }, []);

  const loadJournalEntries = async () => {
    setIsLoading(true);
    try {
      // Load entries for the last 30 days
      const endDate = new Date();
      const startDate = subDays(endDate, 30);
      const days = eachDayOfInterval({ start: startDate, end: endDate });

      const entriesData: JournalEntry[] = [];

      for (const day of days) {
        const dayString = format(day, "yyyy-MM-dd");
        const response = await fetch(`/api/daily-logs?date=${dayString}`);

        if (response.ok) {
          const entry = await response.json();
          if (
            entry &&
            (entry.journal_entry ||
              entry.mood ||
              entry.water_glasses > 0 ||
              entry.exercised)
          ) {
            entriesData.push(entry);
          }
        }
      }

      setEntries(entriesData.reverse()); // Most recent first
    } catch (error) {
      console.error("Error loading journal entries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMoodEmoji = (mood?: string) => {
    switch (mood) {
      case "😊":
        return "😊";
      case "😐":
        return "😐";
      case "😔":
        return "😔";
      default:
        return "📝";
    }
  };

  const getMoodLabel = (mood?: string) => {
    switch (mood) {
      case "😊":
        return "Happy";
      case "😐":
        return "Neutral";
      case "😔":
        return "Sad";
      default:
        return "No mood";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                Loading journal entries...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Journal</h1>
          <p className="text-muted-foreground">
            Reflect on your daily experiences and track your wellness journey
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Journal Timeline */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Journal Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                {entries.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No journal entries yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Start journaling to track your thoughts and experiences.
                    </p>
                    <Button onClick={() => (window.location.href = "/")}>
                      Write Today&apos;s Entry
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {entries.map((entry) => (
                      <Card
                        key={entry.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedEntry(entry)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">
                                  {getMoodEmoji(entry.mood)}
                                </span>
                                <span className="font-medium">
                                  {format(new Date(entry.date), "EEEE, MMMM d")}
                                </span>
                                <Badge variant="outline">
                                  {getMoodLabel(entry.mood)}
                                </Badge>
                              </div>

                              {entry.journal_entry && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                  {entry.journal_entry}
                                </p>
                              )}

                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                {entry.water_glasses > 0 && (
                                  <span className="flex items-center gap-1">
                                    💧 {entry.water_glasses} glasses
                                  </span>
                                )}
                                {entry.exercised && (
                                  <span className="flex items-center gap-1">
                                    💪 Exercised
                                  </span>
                                )}
                                {entry.sleep_hours && entry.sleep_hours > 0 && (
                                  <span className="flex items-center gap-1">
                                    😴 {entry.sleep_hours}h sleep
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Journal Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Journal Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Entries</span>
                  <Badge variant="secondary">{entries.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">This Month</span>
                  <Badge variant="secondary">
                    {
                      entries.filter((e) => {
                        const entryDate = new Date(e.date);
                        const now = new Date();
                        return (
                          entryDate.getMonth() === now.getMonth() &&
                          entryDate.getFullYear() === now.getFullYear()
                        );
                      }).length
                    }
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Mood Tracking</span>
                  <Badge variant="secondary">
                    {entries.filter((e) => e.mood).length}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mood Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">😊 Happy</span>
                  <Badge variant="outline">
                    {entries.filter((e) => e.mood === "😊").length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">😐 Neutral</span>
                  <Badge variant="outline">
                    {entries.filter((e) => e.mood === "😐").length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">😔 Sad</span>
                  <Badge variant="outline">
                    {entries.filter((e) => e.mood === "😔").length}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Today
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Add Entry
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Heart className="h-4 w-4 mr-2" />
                  Mood History
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Entry Detail Modal */}
        {selectedEntry && (
          <Card className="fixed inset-4 z-50 overflow-y-auto bg-background">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {format(new Date(selectedEntry.date), "EEEE, MMMM d, yyyy")}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEntry(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-3xl">
                  {getMoodEmoji(selectedEntry.mood)}
                </span>
                <Badge variant="outline">
                  {getMoodLabel(selectedEntry.mood)}
                </Badge>
              </div>

              {selectedEntry.journal_entry && (
                <div>
                  <Label className="text-base font-medium">Journal Entry</Label>
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    <p className="whitespace-pre-wrap">
                      {selectedEntry.journal_entry}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedEntry.water_glasses}
                  </div>
                  <div className="text-sm text-blue-800">Water Glasses</div>
                </div>

                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {selectedEntry.exercised ? "✓" : "✗"}
                  </div>
                  <div className="text-sm text-green-800">Exercised</div>
                </div>

                {selectedEntry.sleep_hours && (
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {selectedEntry.sleep_hours.toFixed(1)}h
                    </div>
                    <div className="text-sm text-purple-800">Sleep</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
