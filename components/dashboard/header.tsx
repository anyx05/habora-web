"use client"

import { Bell, Search, Menu, Command } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface DashboardHeaderProps {
  sidebarCollapsed: boolean
  onMenuClick: () => void
}

import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher"
import { useTranslations, useLocale } from "next-intl"

export function DashboardHeader({ sidebarCollapsed, onMenuClick }: DashboardHeaderProps) {
  const t = useTranslations("Dashboard")
  const locale = useLocale()

  
  return (
    <header 
      className={cn(
        "fixed top-0 right-0 z-30 h-16 bg-background/80 backdrop-blur-xl border-b border-border/50 flex items-center justify-between px-4 sm:px-6 transition-all duration-300",
        "left-0 lg:left-64",
        sidebarCollapsed && "lg:left-[72px]"
      )}
    >
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-foreground"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("search")}
            className="pl-10 w-48 md:w-64 h-9 bg-muted/50 border-border/50 focus:bg-muted focus:border-cyan/30 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 text-muted-foreground/50">
            <Command className="w-3 h-3" />
            <span className="text-xs">K</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-cyan rounded-full ring-2 ring-background" />
        </Button>


        <LanguageSwitcher />

        {/* Current Date/Time */}
        <div className="hidden md:flex items-center gap-3 pl-3 border-l border-border/50">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground" suppressHydrationWarning>
              {new Date().toLocaleDateString(locale === "et" ? "et-EE" : "en-EE", { 
                weekday: "short", 
                month: "short", 
                day: "numeric" 
              })}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("authority")}
            </p>
          </div>
          {/* Status Indicator */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-emerald-600">{t("online")}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
