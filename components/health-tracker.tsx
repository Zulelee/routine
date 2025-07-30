"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Droplets, Dumbbell, Bed } from "lucide-react";

interface HealthTrackerProps {
  waterGlasses: number;
  exercised: boolean;
  sleepHours?: number;
  onWaterChange: (glasses: number) => void;
  onExerciseChange: (exercised: boolean) => void;
  onSleepChange: (hours: number) => void;
}

export function HealthTracker({
  waterGlasses,
  exercised,
  sleepHours = 0,
  onWaterChange,
  onExerciseChange,
  onSleepChange,
}: HealthTrackerProps) {
  const handleWaterIncrement = () => {
    if (waterGlasses < 8) {
      onWaterChange(waterGlasses + 1);
    }
  };

  const handleWaterDecrement = () => {
    if (waterGlasses > 0) {
      onWaterChange(waterGlasses - 1);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Health Tracker</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Water Intake */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-blue-500" />
            <Label className="text-base font-medium">Water Intake</Label>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleWaterDecrement}
              disabled={waterGlasses === 0}
            >
              -
            </Button>
            <span className="text-2xl font-bold text-blue-600 min-w-[3rem] text-center">
              {waterGlasses}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleWaterIncrement}
              disabled={waterGlasses === 8}
            >
              +
            </Button>
            <span className="text-sm text-muted-foreground">glasses</span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded ${
                  i < waterGlasses ? "bg-blue-500" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Exercise */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-green-500" />
            <Label className="text-base font-medium">Exercise</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="exercised"
              checked={exercised}
              onCheckedChange={(checked) =>
                onExerciseChange(checked as boolean)
              }
            />
            <Label htmlFor="exercised" className="text-sm">
              Did you exercise today?
            </Label>
          </div>
        </div>

        {/* Sleep Hours */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Bed className="h-5 w-5 text-purple-500" />
            <Label className="text-base font-medium">Sleep Hours</Label>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>0h</span>
              <span className="font-medium">{sleepHours.toFixed(1)}h</span>
              <span>12h</span>
            </div>
            <Slider
              value={[sleepHours]}
              onValueChange={(value) => onSleepChange(value[0])}
              max={12}
              min={0}
              step={0.5}
              className="w-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
