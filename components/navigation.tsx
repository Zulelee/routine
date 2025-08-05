"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  Calendar,
  BarChart3,
  BookOpen,
  Settings,
  DollarSign,
} from "lucide-react";

const navigationItems = [
  { value: "/", label: "Today", icon: Home },
  { value: "/calendar", label: "Calendar", icon: Calendar },
  { value: "/weekly", label: "Weekly", icon: BarChart3 },
  { value: "/journal", label: "Journal", icon: BookOpen },
  { value: "/finance", label: "Finance", icon: DollarSign },
  { value: "/settings", label: "Settings", icon: Settings },
];

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <Tabs value={pathname} onValueChange={router.push} className="w-full">
          <TabsList className="grid w-full grid-cols-6 h-12">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
