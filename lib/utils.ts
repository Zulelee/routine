import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Currency } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: Currency = "USD"
): string {
  const currencyConfig = {
    USD: { symbol: "$", locale: "en-US" },
    GBP: { symbol: "£", locale: "en-GB" },
    EUR: { symbol: "€", locale: "de-DE" },
    CAD: { symbol: "C$", locale: "en-CA" },
    AUD: { symbol: "A$", locale: "en-AU" },
    JPY: { symbol: "¥", locale: "ja-JP" },
  };

  // Fallback to USD if currency is not supported
  const safeCurrency = currencyConfig[currency] ? currency : "USD";
  const config = currencyConfig[safeCurrency];

  if (safeCurrency === "JPY") {
    // Japanese Yen doesn't use decimal places
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: safeCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: safeCurrency,
  }).format(amount);
}

export function getCurrencySymbol(currency: Currency): string {
  const symbols = {
    USD: "$",
    GBP: "£",
    EUR: "€",
    CAD: "C$",
    AUD: "A$",
    JPY: "¥",
  };
  return symbols[currency] || "$";
}
