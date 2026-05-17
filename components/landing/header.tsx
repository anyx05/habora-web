"use client"

import { useState } from "react"
import { Link } from "@/i18n/routing"
import { Anchor, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher"
import { useTranslations } from "next-intl"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const t = useTranslations("Header")

  const navLinks = [
    { label: t("services"), href: "#services" },
    { label: t("about"), href: "#about" },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-[1100] bg-background/70 backdrop-blur-xl border-b border-white/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber text-navy transition-all duration-300 ease-out group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-amber/30">
              <Anchor className="w-4 h-4" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-foreground">
              Habora
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 ease-out rounded-lg hover:bg-navy/5"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              asChild
              className="text-muted-foreground hover:text-foreground hover:bg-navy/5 transition-all duration-300 ease-out"
            >
              <Link href="/login">{t("signIn")}</Link>
            </Button>
            <Button
              asChild
              className="bg-navy hover:bg-navy-light text-white shadow-md shadow-navy/20 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-navy/30 focus-visible:ring-2 focus-visible:ring-amber/50 focus-visible:ring-offset-2"
            >
              <Link href="/dashboard">{t("dashboard")}</Link>
            </Button>
          </div>

          {/* Mobile Menu Trigger */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground hover:bg-navy/5 transition-all duration-300 ease-out"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full max-w-xs bg-background/95 backdrop-blur-xl border-l border-white/10"
            >
              <SheetHeader className="pb-6 border-b border-border/50">
                <SheetTitle className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-navy to-navy-light text-white">
                    <Anchor className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-lg tracking-tight">
                    Habora
                  </span>
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Navigation menu
                </SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col gap-1 py-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-3 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-navy/5 rounded-xl transition-all duration-300 ease-out"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="flex flex-col gap-3 pt-6 border-t border-border/50">
                <Button
                  variant="outline"
                  asChild
                  className="w-full justify-center border-border/50 hover:bg-navy/5 transition-all duration-300 ease-out"
                  onClick={() => setIsOpen(false)}
                >
                  <Link href="/login">{t("signIn")}</Link>
                </Button>
                <Button
                  asChild
                  className="w-full justify-center bg-navy hover:bg-navy-light text-white shadow-md shadow-navy/20 transition-all duration-300 ease-out"
                  onClick={() => setIsOpen(false)}
                >
                  <Link href="/dashboard">{t("dashboard")}</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </header>
  )
}
