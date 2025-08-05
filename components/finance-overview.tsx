"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertCircle,
  CheckCircle,
  Send,
  Clock,
} from "lucide-react";

interface Invoice {
  id: string;
  amount: number;
  status: string;
  issue_date: string;
  due_date: string;
  title: string;
  invoice_number: string;
  client: {
    name: string;
  };
}

interface Client {
  id: string;
  name: string;
  company?: string;
  invoices: Invoice[];
}

export function FinanceOverview() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invoicesResponse, clientsResponse] = await Promise.all([
          fetch("/api/invoices"),
          fetch("/api/clients"),
        ]);

        if (invoicesResponse.ok) {
          const invoicesData = await invoicesResponse.json();
          setInvoices(invoicesData);
        }

        if (clientsResponse.ok) {
          const clientsData = await clientsResponse.json();
          setClients(clientsData);
        }
      } catch (error) {
        console.error("Error fetching finance data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getTotalRevenue = () => {
    return invoices
      .filter((invoice) => invoice.status === "paid")
      .reduce((total, invoice) => total + invoice.amount, 0);
  };

  const getOutstandingAmount = () => {
    return invoices
      .filter((invoice) => invoice.status !== "paid")
      .reduce((total, invoice) => total + invoice.amount, 0);
  };

  const getSentAmount = () => {
    return invoices
      .filter((invoice) => invoice.status === "sent")
      .reduce((total, invoice) => total + invoice.amount, 0);
  };

  const getOverdueAmount = () => {
    return invoices
      .filter((invoice) => invoice.status === "overdue")
      .reduce((total, invoice) => total + invoice.amount, 0);
  };

  const getPaidInvoices = () => {
    return invoices.filter((invoice) => invoice.status === "paid").length;
  };

  const getSentInvoices = () => {
    return invoices.filter((invoice) => invoice.status === "sent").length;
  };

  const getOverdueInvoices = () => {
    return invoices.filter((invoice) => invoice.status === "overdue").length;
  };

  const getTopClients = () => {
    return clients
      .map((client) => ({
        name: client.name,
        company: client.company,
        totalRevenue: client.invoices
          .filter((invoice) => invoice.status === "paid")
          .reduce((total, invoice) => total + invoice.amount, 0),
        invoiceCount: client.invoices.length,
      }))
      .filter((client) => client.totalRevenue > 0)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 3);
  };

  const getRecentActivity = () => {
    return invoices
      .sort(
        (a, b) =>
          new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime()
      )
      .slice(0, 3)
      .map((invoice) => ({
        ...invoice,
        activityType:
          invoice.status === "paid"
            ? "paid"
            : invoice.status === "sent"
            ? "sent"
            : "overdue",
        timeAgo: getTimeAgo(new Date(invoice.issue_date)),
      }));
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return `${Math.floor(diffInDays / 7)} weeks ago`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "sent":
        return <Send className="h-4 w-4 text-blue-600" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-600";
      case "sent":
        return "bg-blue-100 text-blue-600";
      case "overdue":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading finance overview...</div>
      </div>
    );
  }

  const totalRevenue = getTotalRevenue();
  const outstandingAmount = getOutstandingAmount();
  const sentAmount = getSentAmount();
  const overdueAmount = getOverdueAmount();
  const totalAmount = totalRevenue + outstandingAmount;

  return (
    <div className="space-y-6">
      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>Financial performance and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
            <div className="text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Chart component will be added here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Status</CardTitle>
            <CardDescription>Current invoice distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Paid</span>
              </div>
              <span className="text-sm font-medium">
                {formatCurrency(totalRevenue)}
              </span>
            </div>
            <Progress
              value={totalAmount > 0 ? (totalRevenue / totalAmount) * 100 : 0}
              className="h-2"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Sent</span>
              </div>
              <span className="text-sm font-medium">
                {formatCurrency(sentAmount)}
              </span>
            </div>
            <Progress
              value={totalAmount > 0 ? (sentAmount / totalAmount) * 100 : 0}
              className="h-2"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm">Overdue</span>
              </div>
              <span className="text-sm font-medium">
                {formatCurrency(overdueAmount)}
              </span>
            </div>
            <Progress
              value={totalAmount > 0 ? (overdueAmount / totalAmount) * 100 : 0}
              className="h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest invoice status changes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {getRecentActivity().map((activity, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(
                      activity.status
                    )}`}
                  >
                    {getStatusIcon(activity.status)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Invoice{" "}
                      {activity.activityType === "paid"
                        ? "Paid"
                        : activity.activityType === "sent"
                        ? "Sent"
                        : "Overdue"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.invoice_number} - {activity.title}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {formatCurrency(activity.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.timeAgo}
                  </p>
                </div>
              </div>
            ))}
            {getRecentActivity().length === 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  No recent activity
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invoice Workflow */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Workflow</CardTitle>
          <CardDescription>Track your invoice lifecycle</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium">Draft</p>
                <p className="text-sm text-muted-foreground">
                  Create and prepare invoice
                </p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">→</div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Send className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Sent</p>
                <p className="text-sm text-muted-foreground">
                  Invoice sent to client
                </p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">→</div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Paid</p>
                <p className="text-sm text-muted-foreground">
                  Payment received
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Clients */}
      <Card>
        <CardHeader>
          <CardTitle>Top Clients</CardTitle>
          <CardDescription>Clients with highest revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getTopClients().map((client, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{client.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {client.invoiceCount} invoices
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {formatCurrency(client.totalRevenue)}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    Active
                  </Badge>
                </div>
              </div>
            ))}
            {getTopClients().length === 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  No clients with revenue yet
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
