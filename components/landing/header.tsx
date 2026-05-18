"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Link, usePathname, useRouter } from "@/i18n/routing"
import { useLocale, useTranslations } from "next-intl"
import { Anchor, Menu, LogOut, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// ─── Hook ────────────────────────────────────────────────────────────────────

interface UserState {
  role: string | null
  email: string | null
  isLoading: boolean
}

function useCurrentUser(): UserState {
  const [state, setState] = useState<UserState>({
    role: null,
    email: null,
    isLoading: true,
  })

  useEffect(() => {
    const supabase = createClient()

    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .maybeSingle()

        setState({
          role: profile?.role ?? null,
          email: user.email ?? null,
          isLoading: false,
        })
      } else {
        setState({ role: null, email: null, isLoading: false })
      }
    }

    fetchUser()

    // Keep header in sync when auth state changes (e.g. sign-out from another tab)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchUser()
    })

    return () => subscription.unsubscribe()
  }, [])

  return state
}

// ─── Avatar ──────────────────────────────────────────────────────────────────

function AvatarCircle({ email }: { email: string }) {
  const initial = email.charAt(0).toUpperCase()
  return (
    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan/20 text-cyan text-sm font-semibold border border-cyan/30 select-none">
      {initial}
    </span>
  )
}

// ─── Avatar Dropdown ─────────────────────────────────────────────────────────

function AvatarDropdown({ email }: { email: string }) {
  const t = useTranslations("Header")
  const router = useRouter()
  const locale = useLocale()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1.5 rounded-lg px-1 py-1 hover:bg-navy/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/40"
          aria-label="Account menu"
        >
          <AvatarCircle email={email} />
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="text-xs text-muted-foreground">{t("email")}</p>
          <p className="text-sm font-medium truncate mt-0.5">{email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={handleSignOut}
          className="gap-2 text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── Header ──────────────────────────────────────────────────────────────────

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { role, email, isLoading } = useCurrentUser()
  const t = useTranslations("Header")
  const pathname = usePathname()
  const router = useRouter()
  const locale = useLocale()

  const isLanding = pathname === "/"

  // Center nav links — only shown on the landing page
  const navLinks = [
    { label: t("services"), href: "#how-it-works" },
    { label: t("map"), href: "#map" },
  ]

  // Smooth-scroll helper for hash links when already on the landing page
  const handleHashClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (href.startsWith("#")) {
      e.preventDefault()
      document.getElementById(href.slice(1))?.scrollIntoView({ behavior: "smooth" })
    }
    setIsOpen(false)
  }

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

          {/* Desktop Center Nav — landing page only */}
          <div className="hidden md:flex items-center gap-1">
            {isLanding &&
              navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleHashClick(e, link.href)}
                  className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 ease-out rounded-lg hover:bg-navy/5"
                >
                  {link.label}
                </a>
              ))}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />

            {/* Loading skeleton */}
            {isLoading && (
              <div className="w-24 h-9 rounded-md bg-muted/40 animate-pulse" />
            )}

            {/* Signed out */}
            {!isLoading && !role && (
              <>
                <Button
                  variant="ghost"
                  asChild
                  className="text-muted-foreground hover:text-foreground hover:bg-navy/5 transition-all duration-300 ease-out"
                >
                  <Link href="/login">{t("signIn")}</Link>
                </Button>
                <Button
                  asChild
                  className="bg-amber hover:bg-amber/90 text-navy font-semibold shadow-md shadow-amber/20 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber/30 focus-visible:ring-2 focus-visible:ring-amber/50 focus-visible:ring-offset-2"
                >
                  <Link href="/signup?role=port_operator">{t("listMarina")}</Link>
                </Button>
              </>
            )}

            {/* Vessel operator */}
            {!isLoading && role === "vessel_operator" && (
              <>
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (isLanding) {
                      document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      router.push(`/#map` as any);
                    }
                  }}
                  className="text-muted-foreground hover:text-foreground hover:bg-navy/5 transition-all duration-300 ease-out"
                >
                  {t("browsePorts")}
                </Button>
                <Button
                  variant="ghost"
                  asChild
                  className="text-muted-foreground hover:text-foreground hover:bg-navy/5 transition-all duration-300 ease-out"
                >
                  <Link href="/bookings">{t("myTrips")}</Link>
                </Button>
                {email && <AvatarDropdown email={email} />}
              </>
            )}

            {/* Port operator */}
            {!isLoading && role === "port_operator" && (
              <>
                <Button
                  variant="ghost"
                  asChild
                  className="text-muted-foreground hover:text-foreground hover:bg-navy/5 transition-all duration-300 ease-out"
                >
                  <Link href="/dashboard">{t("dashboard")}</Link>
                </Button>
                {email && <AvatarDropdown email={email} />}
              </>
            )}
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

              {/* Mobile nav links — landing page only */}
              {isLanding && (
                <nav className="flex flex-col gap-1 py-6">
                  {navLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={(e) => handleHashClick(e, link.href)}
                      className="px-4 py-3 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-navy/5 rounded-xl transition-all duration-300 ease-out"
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
              )}

              <div className="flex flex-col gap-3 pt-6 border-t border-border/50">
                {/* Loading skeleton */}
                {isLoading && (
                  <div className="w-full h-10 rounded-md bg-muted/40 animate-pulse" />
                )}

                {/* Signed out */}
                {!isLoading && !role && (
                  <>
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
                      className="w-full justify-center bg-amber hover:bg-amber/90 text-navy font-semibold shadow-md shadow-amber/20 transition-all duration-300 ease-out"
                      onClick={() => setIsOpen(false)}
                    >
                      <Link href="/signup?role=port_operator">{t("listMarina")}</Link>
                    </Button>
                  </>
                )}

                {/* Vessel operator */}
                {!isLoading && role === "vessel_operator" && (
                  <>
                    <Button
                      variant="outline"
                      className="w-full justify-center border-border/50 hover:bg-navy/5 transition-all duration-300 ease-out"
                      onClick={() => {
                        setIsOpen(false);
                        if (isLanding) {
                          document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' });
                        } else {
                          router.push(`/#map` as any);
                        }
                      }}
                    >
                      {t("browsePorts")}
                    </Button>
                    <Button
                      variant="outline"
                      asChild
                      className="w-full justify-center border-border/50 hover:bg-navy/5 transition-all duration-300 ease-out"
                      onClick={() => setIsOpen(false)}
                    >
                      <Link href="/bookings">{t("myTrips")}</Link>
                    </Button>
                    {email && (
                      <div className="flex items-center gap-3 px-1 py-2">
                        <AvatarCircle email={email} />
                        <span className="text-sm text-muted-foreground truncate flex-1">{email}</span>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      className="w-full justify-center text-destructive hover:text-destructive hover:bg-destructive/5 gap-2"
                      onClick={async () => {
                        const supabase = createClient()
                        await supabase.auth.signOut()
                        setIsOpen(false)
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                      {t("signOut")}
                    </Button>
                  </>
                )}

                {/* Port operator */}
                {!isLoading && role === "port_operator" && (
                  <>
                    <Button
                      asChild
                      className="w-full justify-center bg-navy hover:bg-navy-light text-white shadow-md shadow-navy/20 transition-all duration-300 ease-out"
                      onClick={() => setIsOpen(false)}
                    >
                      <Link href="/dashboard">{t("dashboard")}</Link>
                    </Button>
                    {email && (
                      <div className="flex items-center gap-3 px-1 py-2">
                        <AvatarCircle email={email} />
                        <span className="text-sm text-muted-foreground truncate flex-1">{email}</span>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      className="w-full justify-center text-destructive hover:text-destructive hover:bg-destructive/5 gap-2"
                      onClick={async () => {
                        const supabase = createClient()
                        await supabase.auth.signOut()
                        setIsOpen(false)
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                      {t("signOut")}
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </header>
  )
}
