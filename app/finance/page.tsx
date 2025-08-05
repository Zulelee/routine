"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  DollarSign,
  FileText,
  Users,
  TrendingUp,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { InvoiceList } from "@/components/invoice-list";
import { ClientList } from "@/components/client-list";
import { FinanceOverview } from "@/components/finance-overview";
import { CreateInvoiceDialog } from "@/components/create-invoice-dialog";
import { CreateClientDialog } from "@/components/create-client-dialog";

interface Invoice {
  id: string;
  amount: number;
  status: string;
  issue_date: string;
}

interface Client {
  id: string;
  name: string;
  created_at: string;
}

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [showCreateClient, setShowCreateClient] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    outstanding: 0,
    thisMonth: 0,
    activeClients: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [invoicesResponse, clientsResponse] = await Promise.all([
          fetch("/api/invoices"),
          fetch("/api/clients"),
        ]);

        let invoices: Invoice[] = [];
        let clients: Client[] = [];

        if (invoicesResponse.ok) {
          invoices = await invoicesResponse.json();
        }

        if (clientsResponse.ok) {
          clients = await clientsResponse.json();
        }

        // Calculate stats
        const totalRevenue = invoices
          .filter((invoice) => invoice.status === "paid")
          .reduce((total, invoice) => total + invoice.amount, 0);

        const outstanding = invoices
          .filter((invoice) => invoice.status !== "paid")
          .reduce((total, invoice) => total + invoice.amount, 0);

        const thisMonth = invoices
          .filter((invoice) => {
            const invoiceDate = new Date(invoice.issue_date);
            const now = new Date();
            return (
              invoiceDate.getMonth() === now.getMonth() &&
              invoiceDate.getFullYear() === now.getFullYear() &&
              invoice.status === "paid"
            );
          })
          .reduce((total, invoice) => total + invoice.amount, 0);

        const activeClients = clients.length;

        setStats({
          totalRevenue,
          outstanding,
          thisMonth,
          activeClients,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <main className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Finance
          </h1>
          <p className="mt-2 text-muted-foreground">
            Track your invoices, manage clients, and monitor your financial
            overview
          </p>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : formatCurrency(stats.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                {loading ? "Loading..." : "All time paid invoices"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : formatCurrency(stats.outstanding)}
              </div>
              <p className="text-xs text-muted-foreground">
                {loading ? "Loading..." : "Pending payments"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : formatCurrency(stats.thisMonth)}
              </div>
              <p className="text-xs text-muted-foreground">
                {loading ? "Loading..." : "Current month revenue"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Clients
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.activeClients}
              </div>
              <p className="text-xs text-muted-foreground">
                {loading ? "Loading..." : "Total clients"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Invoices
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Clients
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <FinanceOverview />
          </TabsContent>

          <TabsContent value="invoices" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Invoices</h2>
                <p className="text-muted-foreground">
                  Manage your invoices and track payments through status updates
                </p>
              </div>
              <Button onClick={() => setShowCreateInvoice(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Invoice
              </Button>
            </div>
            <InvoiceList />
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Clients</h2>
                <p className="text-muted-foreground">
                  Manage your client relationships
                </p>
              </div>
              <Button onClick={() => setShowCreateClient(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Client
              </Button>
            </div>
            <ClientList />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <CreateInvoiceDialog
        open={showCreateInvoice}
        onOpenChange={setShowCreateInvoice}
      />
      <CreateClientDialog
        open={showCreateClient}
        onOpenChange={setShowCreateClient}
      />
    </main>
  );
}
