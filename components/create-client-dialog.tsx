"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreateClientData } from "@/lib/types";

interface CreateClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateClientDialog({
  open,
  onOpenChange,
}: CreateClientDialogProps) {
  const [formData, setFormData] = useState<Partial<CreateClientData>>({
    name: "",
    email: "",
    company: "",
    phone: "",
    address: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create client");
      }

      const newClient = await response.json();
      console.log("Client created:", newClient);

      // Reset form
      setFormData({
        name: "",
        email: "",
        company: "",
        phone: "",
        address: "",
        notes: "",
      });

      onOpenChange(false);
      // You could add a toast notification here for success feedback
    } catch (error) {
      console.error("Error creating client:", error);
      // You could add a toast notification here for error feedback
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateClientData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>
            Add a new client to your contact list. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              placeholder="John Smith"
              value={formData.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              placeholder="Acme Corp"
              value={formData.company || ""}
              onChange={(e) => handleInputChange("company", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phone || ""}
              onChange={(e) => handleInputChange("phone", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              placeholder="123 Business St, City, State 12345"
              value={formData.address || ""}
              onChange={(e) => handleInputChange("address", e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about the client..."
              value={formData.notes || ""}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Add Client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
