"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Mail,
  Building,
  Phone,
  Search,
  DollarSign,
  Trash2,
} from "lucide-react";

interface Client {
  id: string;
  name: string;
  email?: string;
  company?: string;
  phone?: string;
  address?: string;
  notes?: string;
  invoices: {
    id: string;
    amount: number;
    status: string;
  }[];
}

export function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingClient, setDeletingClient] = useState<string | null>(null);

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
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleDeleteClient = async (clientId: string) => {
    setDeletingClient(clientId);

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete client");
      }

      // Remove from local state
      setClients((prev) => prev.filter((client) => client.id !== clientId));
    } catch (error) {
      console.error("Error deleting client:", error);
      // You could add a toast notification here for error feedback
    } finally {
      setDeletingClient(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getTotalRevenue = (invoices: Client["invoices"]) => {
    return invoices.reduce((total, invoice) => total + invoice.amount, 0);
  };

  const getPaidInvoices = (invoices: Client["invoices"]) => {
    return invoices.filter((invoice) => invoice.status === "paid").length;
  };

  const getOutstandingAmount = (invoices: Client["invoices"]) => {
    return invoices
      .filter((invoice) => invoice.status !== "paid")
      .reduce((total, invoice) => total + invoice.amount, 0);
  };

  const filteredClients = clients.filter((client) => {
    return (
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading clients...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Client List */}
      <div className="space-y-4">
        {filteredClients.map((client) => (
          <Card key={client.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <div>
                      <h3 className="font-semibold text-lg">{client.name}</h3>
                      {client.company && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {client.company}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
                      {client.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {client.email}
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {client.phone}
                        </div>
                      )}
                    </div>

                    {client.notes && (
                      <p className="text-sm text-muted-foreground">
                        {client.notes}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-medium">
                          Total Revenue:{" "}
                          {formatCurrency(getTotalRevenue(client.invoices))}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">
                          Paid: {getPaidInvoices(client.invoices)} invoices
                        </span>
                      </div>
                      {getOutstandingAmount(client.invoices) > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-orange-600 font-medium">
                            Outstanding:{" "}
                            {formatCurrency(
                              getOutstandingAmount(client.invoices)
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClient(client.id)}
                    disabled={deletingClient === client.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {deletingClient === client.id ? (
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
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No clients found</h3>
          <p className="text-muted-foreground">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Add your first client to get started"}
          </p>
        </div>
      )}
    </div>
  );
}
