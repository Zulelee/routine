"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AssignToProjectData } from "@/lib/types";

interface AssignToProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: any;
  onAssignmentCreated: (assignment: any) => void;
}

export function AssignToProjectDialog({
  open,
  onOpenChange,
  member,
  onAssignmentCreated,
}: AssignToProjectDialogProps) {
  const [formData, setFormData] = useState<AssignToProjectData>({
    project_id: "",
    hourly_rate: member?.hourly_rate || 0,
    payment_type: "hourly_rate",
    payment_amount: undefined,
    role: "",
    notes: "",
  });
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchProjects();
    }
  }, [open]);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `/api/projects/${formData.project_id}/members`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            team_member_id: member.id,
            name: member.name,
            role: formData.role || member.role,
            email: member.email,
            hourly_rate: formData.hourly_rate,
            payment_type: formData.payment_type,
            payment_amount: formData.payment_amount,
            notes: formData.notes,
          }),
        }
      );

      if (response.ok) {
        const newAssignment = await response.json();
        onAssignmentCreated(newAssignment);
        resetForm();
      } else {
        console.error("Failed to assign team member to project");
      }
    } catch (error) {
      console.error("Error assigning team member to project:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      project_id: "",
      hourly_rate: member?.hourly_rate || 0,
      payment_type: "hourly_rate",
      payment_amount: undefined,
      role: "",
      notes: "",
    });
  };

  const handleInputChange = (field: keyof AssignToProjectData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign to Project</DialogTitle>
          <DialogDescription>
            Assign {member?.name} to a project and set their project-specific
            details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="project">Project *</Label>
            <Select
              value={formData.project_id}
              onValueChange={(value) => handleInputChange("project_id", value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name} - {project.client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Project Role</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => handleInputChange("role", e.target.value)}
                placeholder={member?.role || "e.g., Lead Developer"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_type">Payment Type</Label>
              <Select
                value={formData.payment_type}
                onValueChange={(value) =>
                  handleInputChange("payment_type", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly_rate">Hourly Rate</SelectItem>
                  <SelectItem value="fixed_budget">Fixed Budget</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.payment_type === "fixed_budget" ? (
              <div className="space-y-2">
                <Label htmlFor="payment_amount">Fixed Amount (USD) *</Label>
                <Input
                  id="payment_amount"
                  type="number"
                  step="0.01"
                  value={formData.payment_amount || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "payment_amount",
                      parseFloat(e.target.value)
                    )
                  }
                  placeholder="0.00"
                  required
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="hourly_rate">Project Hourly Rate (USD) *</Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  step="0.01"
                  value={formData.hourly_rate}
                  onChange={(e) =>
                    handleInputChange("hourly_rate", parseFloat(e.target.value))
                  }
                  placeholder="0.00"
                  required
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Project Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Project-specific notes or instructions..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Assigning..." : "Assign to Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
