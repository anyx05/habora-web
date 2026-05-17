"use client"

import { AlertCircle, ArrowLeft, LogOut, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher"

export default function WrongAccountPage() {
  const router = useRouter()
  const t = useTranslations("WrongAccount")

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-navy px-4 sm:px-6 py-12 overflow-hidden relative">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-navy via-slate to-navy-dark" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <button
            onClick={handleSignOut}
            className="group flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            {t("backToSignIn")}
          </button>
          <LanguageSwitcher />
        </div>

        {/* Card */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-rose-500/20 via-rose-500/5 to-transparent rounded-2xl blur-xl" />

          <div className="relative bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-6 sm:p-8 text-center">
            {/* Icon */}
            <div className="relative inline-block mb-6">
              <div className="absolute -inset-2 bg-rose-500/20 rounded-full blur-lg" />
              <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-lg shadow-rose-500/30 mx-auto">
                <AlertCircle className="w-10 h-10" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">
              {t("title")}
            </h1>
            <p className="text-white/70 text-sm mb-8 leading-relaxed">
              {t("description")}
            </p>

            {/* App Download Stubs */}
            <div className="bg-white/[0.05] border border-white/10 rounded-xl p-6 mb-8">
              <Smartphone className="w-8 h-8 text-cyan mx-auto mb-3" />
              <h3 className="text-white font-medium mb-1">{t("mobileApp")}</h3>
              <p className="text-white/50 text-xs mb-4">{t("mobileAppDesc")}</p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white/80 hover:text-white hover:bg-black transition-colors text-sm">
                  App Store
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white/80 hover:text-white hover:bg-black transition-colors text-sm">
                  Google Play
                </button>
              </div>
            </div>

            {/* Sign Out Action */}
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full bg-white/[0.05] border-white/10 hover:bg-white/[0.1] text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t("signInDifferent")}
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
