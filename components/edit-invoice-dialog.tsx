"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, RefreshCw } from "lucide-react";
import { UpdateInvoiceData, InvoiceStatus, Currency } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: string;
  name: string;
  company?: string;
}

interface Invoice {
  id: string;
  client_id: string;
  invoice_number: string;
  title: string;
  description?: string;
  amount: number;
  currency?: Currency;
  tax_rate: number;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  notes?: string;
  client: {
    name: string;
    company?: string;
  };
}

interface EditInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
  onInvoiceUpdated: (updatedInvoice: Invoice) => void;
}

export function EditInvoiceDialog({
  open,
  onOpenChange,
  invoice,
  onInvoiceUpdated,
}: EditInvoiceDialogProps) {
  const [formData, setFormData] = useState<Partial<UpdateInvoiceData>>({});
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [generatingNumber, setGeneratingNumber] = useState(false);
  const { toast } = useToast();

  // Function to generate new invoice number
  const generateNewInvoiceNumber = async () => {
    setGeneratingNumber(true);
    try {
      const response = await fetch("/api/invoices?nextNumber=true");
      if (response.ok) {
        const data = await response.json();
        setFormData((prev) => ({
          ...prev,
          invoice_number: data.nextInvoiceNumber,
        }));
        toast({
          title: "Invoice number generated",
          description: `New invoice number: ${data.nextInvoiceNumber}`,
        });
      }
    } catch (error) {
      console.error("Error generating invoice number:", error);
      toast({
        title: "Error",
        description: "Failed to generate new invoice number",
        variant: "destructive",
      });
    } finally {
      setGeneratingNumber(false);
    }
  };

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch("/api/clients");
        if (response.ok) {
          const data = await response.json();
          setClients(data);
        } else {
          console.error("Failed to fetch clients");
          setClients([]);
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
        setClients([]);
      } finally {
        setClientsLoading(false);
      }
    };

    if (open) {
      fetchClients();
    }
  }, [open]);

  useEffect(() => {
    if (invoice) {
      setFormData({
        client_id: invoice.client_id,
        invoice_number: invoice.invoice_number,
        title: invoice.title,
        description: invoice.description || "",
        amount: invoice.amount,
        currency: invoice.currency || "USD",
        tax_rate: invoice.tax_rate,
        status: invoice.status,
        issue_date: invoice.issue_date.split("T")[0],
        due_date: invoice.due_date.split("T")[0],
        notes: invoice.notes || "",
      });
    }
  }, [invoice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update invoice");
      }

      const updatedInvoice = await response.json();
      console.log("Invoice updated:", updatedInvoice);

      onInvoiceUpdated(updatedInvoice);
      onOpenChange(false);
      toast({
        title: "Invoice Updated",
        description: "The invoice has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast({
        title: "Error",
        description: "Failed to update invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof UpdateInvoiceData,
    value: string | number | Date
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Invoice</DialogTitle>
          <DialogDescription>
            Update the invoice details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => handleInputChange("client_id", value)}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      clientsLoading ? "Loading clients..." : "Select a client"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {clientsLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading clients...
                    </SelectItem>
                  ) : clients.length === 0 ? (
                    <SelectItem value="no-clients" disabled>
                      No clients available
                    </SelectItem>
                  ) : (
                    clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.company
                          ? `${client.name} (${client.company})`
                          : client.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice_number">Invoice Number</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="invoice_number"
                  placeholder="INV-001"
                  value={formData.invoice_number || ""}
                  onChange={(e) =>
                    handleInputChange("invoice_number", e.target.value)
                  }
                  required
                  disabled={generatingNumber}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateNewInvoiceNumber}
                  disabled={generatingNumber}
                >
                  {generatingNumber ? (
                    "Generating..."
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Invoice Title</Label>
            <Input
              id="title"
              placeholder="Website Development"
              value={formData.title || ""}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the work or services provided..."
              value={formData.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.amount || ""}
                onChange={(e) =>
                  handleInputChange("amount", parseFloat(e.target.value) || 0)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) =>
                  handleInputChange("currency", value as Currency)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="CAD">CAD (C$)</SelectItem>
                  <SelectItem value="AUD">AUD (A$)</SelectItem>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_rate">Tax Rate (%)</Label>
              <Input
                id="tax_rate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="0.00"
                value={formData.tax_rate || ""}
                onChange={(e) =>
                  handleInputChange("tax_rate", parseFloat(e.target.value) || 0)
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  handleInputChange("status", value as InvoiceStatus)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issue_date">Issue Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="issue_date"
                  type="date"
                  value={
                    typeof formData.issue_date === "string"
                      ? formData.issue_date
                      : ""
                  }
                  onChange={(e) =>
                    handleInputChange("issue_date", e.target.value)
                  }
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="due_date"
                  type="date"
                  value={
                    typeof formData.due_date === "string"
                      ? formData.due_date
                      : ""
                  }
                  onChange={(e) =>
                    handleInputChange("due_date", e.target.value)
                  }
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes or terms..."
              value={formData.notes || ""}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={2}
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
              {loading ? "Updating..." : "Update Invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
