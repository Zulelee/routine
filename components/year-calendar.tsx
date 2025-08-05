"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Currency } from "@/lib/types";

interface Invoice {
  id: string;
  amount: number;
  currency?: Currency;
  status: string;
  issue_date: string;
  paid_date?: string;
}

interface YearCalendarProps {
  invoices: Invoice[];
}

export function YearCalendar({ invoices }: YearCalendarProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Calculate monthly revenue for the selected year
  const monthlyRevenue = months.map((month, index) => {
    const monthInvoices = invoices.filter((invoice) => {
      if (invoice.status !== "paid" || !invoice.paid_date) return false;

      const paidDate = new Date(invoice.paid_date);
      return (
        paidDate.getFullYear() === selectedYear && paidDate.getMonth() === index
      );
    });

    const totalAmount = monthInvoices.reduce(
      (sum, invoice) => sum + invoice.amount,
      0
    );

    // Get the most common currency for this month
    const currencyCounts = monthInvoices.reduce((counts, invoice) => {
      const currency = invoice.currency || "USD";
      counts[currency] = (counts[currency] || 0) + 1;
      return counts;
    }, {} as Record<Currency, number>);

    const primaryCurrency =
      (Object.entries(currencyCounts).sort(
        (a, b) => b[1] - a[1]
      )[0]?.[0] as Currency) || "USD";

    return {
      month,
      amount: totalAmount,
      currency: primaryCurrency,
      invoiceCount: monthInvoices.length,
    };
  });

  // Calculate year total and average
  const yearTotal = monthlyRevenue.reduce(
    (sum, month) => sum + month.amount,
    0
  );
  const yearAverage = yearTotal / 12;
  const maxAmount = Math.max(...monthlyRevenue.map((m) => m.amount));

  // Get the most common currency for the year
  const yearCurrencyCounts = invoices
    .filter((invoice) => invoice.status === "paid" && invoice.paid_date)
    .reduce((counts, invoice) => {
      const currency = invoice.currency || "USD";
      counts[currency] = (counts[currency] || 0) + 1;
      return counts;
    }, {} as Record<Currency, number>);

  const yearPrimaryCurrency =
    (Object.entries(yearCurrencyCounts).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] as Currency) || "USD";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <span>{selectedYear} Revenue Calendar</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedYear(selectedYear - 1)}
              disabled={selectedYear <= 2020}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{selectedYear}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedYear(selectedYear + 1)}
              disabled={selectedYear >= new Date().getFullYear()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          Monthly breakdown of your revenue for {selectedYear}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Year Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">
                {formatCurrency(yearTotal, yearPrimaryCurrency)}
              </p>
            </div>
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <p className="text-sm text-muted-foreground">Monthly Average</p>
              <p className="text-2xl font-bold">
                {formatCurrency(yearAverage, yearPrimaryCurrency)}
              </p>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-3 gap-4">
            {monthlyRevenue.map((month, index) => {
              const isCurrentMonth = new Date().getMonth() === index;
              const isPastMonth = index < new Date().getMonth();
              const isFutureMonth = index > new Date().getMonth();

              // Calculate percentage for visual indicator
              const percentage =
                maxAmount > 0 ? (month.amount / maxAmount) * 100 : 0;

              return (
                <div
                  key={month.month}
                  className={`p-4 rounded-lg border transition-colors ${
                    isCurrentMonth
                      ? "bg-primary/10 border-primary/20"
                      : isPastMonth
                      ? "bg-muted/20 border-muted/30"
                      : "bg-muted/10 border-muted/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{month.month}</span>
                    {isCurrentMonth && (
                      <Badge variant="secondary" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-lg font-bold">
                      {formatCurrency(month.amount, month.currency)}
                    </p>

                    {/* Visual bar indicator */}
                    <div className="w-full bg-muted/30 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          isCurrentMonth
                            ? "bg-primary"
                            : isPastMonth
                            ? "bg-green-500"
                            : "bg-muted"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{month.invoiceCount} invoices</span>
                      {month.amount > 0 && (
                        <span className="flex items-center gap-1">
                          {month.amount > yearAverage ? (
                            <TrendingUp className="h-3 w-3 text-green-500" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-500" />
                          )}
                          {month.amount > yearAverage
                            ? "Above avg"
                            : "Below avg"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span>Past months</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full" />
              <span>Current month</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-muted rounded-full" />
              <span>Future months</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
