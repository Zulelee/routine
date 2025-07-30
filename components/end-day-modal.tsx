"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Target, MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface EndDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedTasks: number;
  totalTasks: number;
  waterGlasses: number;
  exercised: boolean;
  journalEntry?: string;
  mood?: string;
  onSubmit: (data: {
    what_went_well: string;
    what_to_improve: string;
    notes_for_tomorrow: string;
  }) => void;
}

export function EndDayModal({
  isOpen,
  onClose,
  completedTasks,
  totalTasks,
  waterGlasses,
  exercised,
  journalEntry,
  mood,
  onSubmit,
}: EndDayModalProps) {
  const [whatWentWell, setWhatWentWell] = useState("");
  const [whatToImprove, setWhatToImprove] = useState("");
  const [notesForTomorrow, setNotesForTomorrow] = useState("");

  const handleSubmit = () => {
    onSubmit({
      what_went_well: whatWentWell,
      what_to_improve: whatToImprove,
      notes_for_tomorrow: notesForTomorrow,
    });
    onClose();
  };

  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            End of Day Recap - {format(new Date(), "EEEE, MMMM d")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Day Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {completedTasks}/{totalTasks}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Tasks Completed
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {waterGlasses}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Water Glasses
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {exercised ? "✓" : "✗"}
                  </div>
                  <div className="text-sm text-muted-foreground">Exercised</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {mood || "📝"}
                  </div>
                  <div className="text-sm text-muted-foreground">Mood</div>
                </div>
              </div>

              {totalTasks > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completion Rate</span>
                    <span>{completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${completionRate}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reflection Questions */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="what-went-well" className="text-base font-medium">
                What went well today?
              </Label>
              <Textarea
                id="what-went-well"
                placeholder="Reflect on your achievements, positive moments, or things you're grateful for..."
                value={whatWentWell}
                onChange={(e) => setWhatWentWell(e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>

            <div>
              <Label
                htmlFor="what-to-improve"
                className="text-base font-medium"
              >
                What could I improve tomorrow?
              </Label>
              <Textarea
                id="what-to-improve"
                placeholder="Think about areas for growth, challenges you faced, or habits you'd like to change..."
                value={whatToImprove}
                onChange={(e) => setWhatToImprove(e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="notes-tomorrow" className="text-base font-medium">
                Notes for tomorrow
              </Label>
              <Textarea
                id="notes-tomorrow"
                placeholder="Any specific goals, reminders, or intentions for tomorrow..."
                value={notesForTomorrow}
                onChange={(e) => setNotesForTomorrow(e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              End Day & Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
