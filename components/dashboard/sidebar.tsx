"use client"

import { useState, useEffect } from "react"
import { Link, usePathname, useRouter } from "@/i18n/routing"
import { 
  Anchor, 
  Ship, 
  Calendar, 
  LogOut, 
  ChevronLeft,
  LayoutDashboard,
  User,
  X,
  Loader2,
  BarChart
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen?: boolean
  onMobileClose?: () => void
}


export function DashboardSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    const loadUser = async () => {
      try {
        const supabase = createClient()
        const { data: { user }, error } = await supabase.auth.getUser()
        if (user && !error) {
          setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || "User")
          setUserEmail(user.email || "")
        }
      } catch {
        // Sidebar auth load failed silently
      }
    }
    loadUser()
  }, [])

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}
      
      <aside 
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-navy/95 backdrop-blur-xl border-r border-white/5 text-white transition-all duration-300 flex flex-col",
          // Desktop
          "hidden lg:flex",
          collapsed ? "lg:w-[72px]" : "lg:w-64",
        )}
      >
        <SidebarContent 
          collapsed={collapsed} 
          onToggle={onToggle}
          pathname={pathname}
          showCollapseButton
          userName={userName}
          userEmail={userEmail}
        />
      </aside>
      
      {/* Mobile Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-72 bg-navy/95 backdrop-blur-xl border-r border-white/5 text-white transition-transform duration-300 flex flex-col lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile Close Button */}
        <button
          onClick={onMobileClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <SidebarContent 
          collapsed={false} 
          onToggle={onToggle}
          pathname={pathname}
          onNavigate={onMobileClose}
          userName={userName}
          userEmail={userEmail}
        />
      </aside>
    </>
  )
}

function SidebarContent({ 
  collapsed, 
  onToggle, 
  pathname,
  showCollapseButton,
  onNavigate,
  userName,
  userEmail
}: { 
  collapsed: boolean
  onToggle: () => void
  pathname: string
  showCollapseButton?: boolean
  onNavigate?: () => void
  userName: string
  userEmail: string
}) {
  const t = useTranslations("Dashboard")

  const navItems = [
    {
      label: t("overview"),
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: t("berths"),
      href: "/dashboard/berths",
      icon: Ship,
    },
    {
      label: t("bookings"),
      href: "/dashboard/bookings",
      icon: Calendar,
    },
    {
      label: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart,
    },
  ]

  return (
    <>
      {/* Header */}
      <div className="flex items-center h-16 px-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3" onClick={onNavigate}>
          <div className="relative">
            <div className="absolute -inset-1 bg-cyan/20 rounded-xl blur-md opacity-50" />
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan to-cyan-dark text-white shrink-0">
              <Anchor className="w-5 h-5" />
            </div>
          </div>
          <span className={cn(
            "font-semibold text-lg tracking-tight whitespace-nowrap transition-opacity duration-300",
            collapsed ? "opacity-0 w-0" : "opacity-100"
          )}>
            Habora
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 overflow-y-auto">
        <p className={cn(
          "text-[10px] uppercase tracking-wider text-white/30 font-medium mb-3 px-3 transition-opacity",
          collapsed && "opacity-0"
        )}>
          {t("navigation")}
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group",
                    isActive 
                      ? "bg-cyan/10 text-white" 
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan rounded-r-full" />
                  )}
                  <item.icon className={cn(
                    "w-5 h-5 shrink-0 transition-colors duration-300",
                    isActive ? "text-cyan" : "group-hover:text-cyan"
                  )} />
                  <span className={cn(
                    "whitespace-nowrap transition-opacity duration-300",
                    collapsed ? "opacity-0 w-0" : "opacity-100"
                  )}>
                    {item.label}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="mt-auto border-t border-white/5 p-3">
        {/* User Profile */}
        <div className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 mb-3 transition-all duration-300",
          collapsed && "justify-center"
        )}>
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-cyan/20 to-cyan/10 text-cyan shrink-0 ring-1 ring-cyan/20">
            <User className="w-4 h-4" />
          </div>
          <div className={cn(
            "transition-opacity duration-300 overflow-hidden",
            collapsed ? "opacity-0 w-0" : "opacity-100"
          )}>
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-xs text-white/40 truncate">{userEmail}</p>
          </div>
        </div>

        {/* Logout */}
        <SignOutButton 
          collapsed={collapsed} 
          onNavigate={onNavigate}
          label={t("signOut")}
          signingOutLabel={t("signingOut")}
          signOutSuccessLabel={t("signOutSuccess")}
        />

        {/* Collapse Toggle - Desktop Only */}
        {showCollapseButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={cn(
              "w-full mt-3 text-white/50 hover:text-white hover:bg-white/5 transition-all duration-300",
              collapsed && "px-0"
            )}
          >
            <ChevronLeft className={cn(
              "w-5 h-5 transition-transform duration-300",
              collapsed && "rotate-180"
            )} />
            <span className={cn(
              "ml-2 transition-opacity duration-300",
              collapsed ? "opacity-0 w-0" : "opacity-100"
            )}>
              {t("collapse")}
            </span>
          </Button>
        )}
      </div>
    </>
  )
}

function SignOutButton({ collapsed, onNavigate, label, signingOutLabel, signOutSuccessLabel }: { collapsed: boolean; onNavigate?: () => void; label: string; signingOutLabel: string; signOutSuccessLabel: string }) {
  const [isSigningOut, setIsSigningOut] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      toast.success(signOutSuccessLabel)
    } catch {
      // Sign out may fail locally but we still redirect
    } finally {
      onNavigate?.()
      router.push("/login")
    }
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={isSigningOut}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 hover:bg-white/5 hover:text-white transition-all duration-300 w-full",
        collapsed && "justify-center",
        isSigningOut && "opacity-50 cursor-not-allowed"
      )}
    >
      {isSigningOut ? (
        <Loader2 className="w-5 h-5 shrink-0 animate-spin" />
      ) : (
        <LogOut className="w-5 h-5 shrink-0" />
      )}
      <span className={cn(
        "whitespace-nowrap transition-opacity duration-300",
        collapsed ? "opacity-0 w-0" : "opacity-100"
      )}>
        {isSigningOut ? signingOutLabel : label}
      </span>
    </button>
  )
}
