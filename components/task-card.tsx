"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pin, PinOff, Edit, Trash2 } from "lucide-react";
import { TaskStatus, Priority } from "@/lib/types";

interface TaskCardProps {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: Priority;
  pinned: boolean;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onPinToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const priorityColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

const statusColors = {
  todo: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800",
  done: "bg-green-100 text-green-800",
};

export function TaskCard({
  id,
  title,
  description,
  status,
  priority,
  pinned,
  onStatusChange,
  onPinToggle,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleStatusChange = (checked: boolean) => {
    onStatusChange(id, checked ? "done" : "todo");
  };

  return (
    <Card
      className={`transition-all duration-200 hover:shadow-md ${
        pinned ? "border-l-4 border-l-primary bg-primary/5" : ""
      } ${status === "done" ? "opacity-75" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={status === "done"}
            onCheckedChange={handleStatusChange}
            className="mt-1"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3
                  className={`font-medium ${
                    status === "done"
                      ? "line-through text-muted-foreground"
                      : ""
                  }`}
                >
                  {title}
                </h3>
                {description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1">
                {pinned && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full">
                    <Pin className="h-3 w-3 text-primary" />
                    <span className="text-xs text-primary font-medium">
                      Pinned
                    </span>
                  </div>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 w-8 p-0 ${
                        isHovered ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onPinToggle(id)}>
                      {pinned ? (
                        <PinOff className="h-4 w-4 mr-2" />
                      ) : (
                        <Pin className="h-4 w-4 mr-2" />
                      )}
                      {pinned ? "Unpin" : "Pin"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <Badge variant="secondary" className={statusColors[status]}>
                {status.replace("_", " ")}
              </Badge>
              {priority && (
                <Badge variant="outline" className={priorityColors[priority]}>
                  {priority}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
