"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  DollarSign,
  Calendar,
  User,
  Search,
  Filter,
  MoreHorizontal,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
  Edit,
} from "lucide-react";
import { InvoiceStatus } from "@/lib/types";
import { EditInvoiceDialog } from "./edit-invoice-dialog";
import { useToast } from "@/hooks/use-toast";

interface Invoice {
  id: string;
  client_id: string;
  invoice_number: string;
  title: string;
  description?: string;
  amount: number;
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

export function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [deletingInvoice, setDeletingInvoice] = useState<string | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch("/api/invoices");
        if (response.ok) {
          const data = await response.json();
          setInvoices(data);
        } else {
          console.error("Failed to fetch invoices");
          setInvoices([]);
        }
      } catch (error) {
        console.error("Error fetching invoices:", error);
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: InvoiceStatus) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4" />;
      case "sent":
        return <Send className="h-4 w-4" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4" />;
      case "draft":
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getNextStatusOptions = (currentStatus: InvoiceStatus) => {
    switch (currentStatus) {
      case "draft":
        return [
          {
            value: "sent",
            label: "Mark as Sent",
            icon: <Send className="h-4 w-4" />,
          },
        ];
      case "sent":
        return [
          {
            value: "paid",
            label: "Mark as Paid",
            icon: <CheckCircle className="h-4 w-4" />,
          },
          {
            value: "overdue",
            label: "Mark as Overdue",
            icon: <AlertCircle className="h-4 w-4" />,
          },
        ];
      case "overdue":
        return [
          {
            value: "paid",
            label: "Mark as Paid",
            icon: <CheckCircle className="h-4 w-4" />,
          },
        ];
      case "paid":
        return [
          {
            value: "sent",
            label: "Mark as Sent",
            icon: <Send className="h-4 w-4" />,
          },
        ];
      default:
        return [];
    }
  };

  const handleStatusChange = async (
    invoiceId: string,
    newStatus: InvoiceStatus
  ) => {
    setUpdatingStatus(invoiceId);

    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update invoice status");
      }

      const updatedInvoice = await response.json();

      // Update local state
      setInvoices((prev) =>
        prev.map((invoice) =>
          invoice.id === invoiceId ? { ...invoice, status: newStatus } : invoice
        )
      );

      toast({
        title: "Status Updated",
        description: `Invoice status changed to ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error updating invoice status:", error);
      toast({
        title: "Error",
        description: "Failed to update invoice status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    setDeletingInvoice(invoiceId);

    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete invoice");
      }

      // Remove from local state
      setInvoices((prev) => prev.filter((invoice) => invoice.id !== invoiceId));

      toast({
        title: "Invoice Deleted",
        description: "The invoice has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast({
        title: "Error",
        description: "Failed to delete invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingInvoice(null);
    }
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setEditDialogOpen(true);
  };

  const handleInvoiceUpdated = (updatedInvoice: Invoice) => {
    setInvoices((prev) =>
      prev.map((invoice) =>
        invoice.id === updatedInvoice.id ? updatedInvoice : invoice
      )
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading invoices...</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Invoice List */}
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => {
            const statusOptions = getNextStatusOptions(invoice.status);
            const isInvoiceOverdue = isOverdue(invoice.due_date);

            return (
              <Card
                key={invoice.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{invoice.title}</h3>
                          <Badge className={getStatusColor(invoice.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(invoice.status)}
                              {invoice.status.charAt(0).toUpperCase() +
                                invoice.status.slice(1)}
                            </div>
                          </Badge>
                          {isInvoiceOverdue && invoice.status !== "paid" && (
                            <Badge variant="destructive" className="text-xs">
                              Overdue
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {invoice.invoice_number} • {invoice.client.name}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Due: {formatDate(invoice.due_date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {formatCurrency(invoice.amount)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {statusOptions.length > 0 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={updatingStatus === invoice.id}
                            >
                              {updatingStatus === invoice.id
                                ? "Updating..."
                                : "Actions"}
                              <MoreHorizontal className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {statusOptions.map((option) => (
                              <DropdownMenuItem
                                key={option.value}
                                onClick={() =>
                                  handleStatusChange(
                                    invoice.id,
                                    option.value as InvoiceStatus
                                  )
                                }
                                className="flex items-center gap-2"
                              >
                                {option.icon}
                                {option.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditInvoice(invoice)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteInvoice(invoice.id)}
                        disabled={deletingInvoice === invoice.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {deletingInvoice === invoice.id ? (
                          "Deleting..."
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Create your first invoice to get started"}
            </p>
          </div>
        )}
      </div>

      {/* Edit Invoice Dialog */}
      <EditInvoiceDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        invoice={editingInvoice}
        onInvoiceUpdated={handleInvoiceUpdated}
      />
    </>
  );
}
