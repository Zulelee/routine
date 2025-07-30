"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Pin,
  PinOff,
  Edit,
  Trash2,
  PenLine,
  Check,
  X,
  Circle,
  Play,
  CheckCircle,
} from "lucide-react";
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
  onTitleChange: (id: string, title: string) => void;
  onDescriptionChange: (id: string, description: string) => void;
}

const priorityColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

const statusConfig = {
  todo: {
    icon: Circle,
    label: "To Do",
    className: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    activeClassName: "bg-gray-200 text-gray-800 border-black border-2",
  },
  in_progress: {
    icon: Play,
    label: "In Progress",
    className: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    activeClassName: "bg-blue-200 text-blue-800 border-black border-2",
  },
  done: {
    icon: CheckCircle,
    label: "Done",
    className: "bg-green-100 text-green-700 hover:bg-green-200",
    activeClassName: "bg-green-200 text-green-800 border-black border-2",
  },
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
  onTitleChange,
  onDescriptionChange,
}: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editDescription, setEditDescription] = useState(description || "");

  const handleStatusChange = (newStatus: TaskStatus) => {
    onStatusChange(id, newStatus);
  };

  const handleTitleSave = () => {
    if (editTitle.trim()) {
      onTitleChange(id, editTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setEditTitle(title);
    setIsEditingTitle(false);
  };

  const handleDescriptionSave = () => {
    onDescriptionChange(id, editDescription.trim());
    setIsEditingDescription(false);
  };

  const handleDescriptionCancel = () => {
    setEditDescription(description || "");
    setIsEditingDescription(false);
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
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                {/* Title with inline editing */}
                <div className="flex items-center gap-2">
                  {isEditingTitle ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleTitleSave();
                          if (e.key === "Escape") handleTitleCancel();
                        }}
                        className="flex-1"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleTitleSave}
                        className="h-8 w-8 p-0"
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleTitleCancel}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-1">
                      <h3
                        className={`font-medium flex-1 ${
                          status === "done"
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                      >
                        {title}
                      </h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditingTitle(true)}
                        className={`h-6 w-6 p-0 ${
                          isHovered ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        <PenLine className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Description with inline editing */}
                {isEditingDescription ? (
                  <div className="flex items-start gap-2 mt-2">
                    <Textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Add description..."
                      className="flex-1 min-h-[60px]"
                      autoFocus
                    />
                    <div className="flex flex-col gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleDescriptionSave}
                        className="h-8 w-8 p-0"
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleDescriptionCancel}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 mt-1">
                    {description ? (
                      <p className="text-sm text-muted-foreground flex-1 line-clamp-2">
                        {description}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground flex-1 italic">
                        No description
                      </p>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditingDescription(true)}
                      className={`h-6 w-6 p-0 ${
                        isHovered ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <PenLine className="h-3 w-3" />
                    </Button>
                  </div>
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
              {/* Status buttons */}
              <div className="flex gap-1">
                {(Object.keys(statusConfig) as TaskStatus[]).map(
                  (statusKey) => {
                    const config = statusConfig[statusKey];
                    const IconComponent = config.icon;
                    const isActive = status === statusKey;

                    return (
                      <Button
                        key={statusKey}
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(statusKey)}
                        className={`h-6 px-2 text-xs font-medium transition-all duration-200 ${
                          isActive ? config.activeClassName : config.className
                        }`}
                      >
                        <IconComponent className="h-3 w-3 mr-1" />
                        {config.label}
                      </Button>
                    );
                  }
                )}
              </div>

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
