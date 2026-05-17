"use client"

import { useState } from "react"
import { Link, useRouter } from "@/i18n/routing"
import { Anchor, ArrowLeft, Eye, EyeOff, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { FormError } from "@/components/ui/form-error"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useTranslations, useLocale } from "next-intl"
import { validateLoginForm } from "@/lib/validations"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations("Auth")

  const clearError = (field: string) => {
    setFieldErrors(prev => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Client-side validation
    const { valid, errors } = validateLoginForm(email, password)
    if (!valid) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    setIsLoading(true)
    
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      toast.error(error.message)
      setIsLoading(false)
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()
        
        const role = profile?.role
        
        if (role === 'port_operator') {
          toast.success(t("success"))
          window.location.href = `/${locale}/dashboard`
        } else if (role === 'vessel_operator') {
          toast.success(t("success"))
          const returnTo = new URLSearchParams(window.location.search).get('returnTo') || `/${locale}`
          window.location.href = returnTo
        } else {
          await supabase.auth.signOut()
          toast.error("Account configuration issue. Please contact support.")
          setIsLoading(false)
          return
        }
      }
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-navy px-4 sm:px-6 py-12 overflow-hidden relative">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-navy via-slate to-navy-dark" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan/10 via-transparent to-transparent" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cyan/5 via-transparent to-transparent" />
      
      {/* Grid Pattern Overlay */}
      <div 
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Back Link */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors duration-300 mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
          {t("back")}
        </Link>

        {/* Glassmorphism Card */}
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan/20 via-cyan/10 to-cyan/20 rounded-3xl blur-xl opacity-50" />
          
          <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
            {/* Header */}
            <div className="text-center pt-8 pb-4 px-8">
              {/* Logo */}
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="absolute -inset-2 bg-cyan/20 rounded-2xl blur-lg" />
                  <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan to-cyan-dark text-white shadow-lg shadow-cyan/30">
                    <Anchor className="w-8 h-8" />
                  </div>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {t("title")}
              </h1>
              <p className="text-white/50 text-sm mt-2">
                {t("subtitle")}
              </p>
            </div>

            {/* Form */}
            <div className="px-8 pb-8">
              <form onSubmit={handleSubmit} noValidate>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="email" className="text-white/70 text-sm font-medium">
                      {t("emailLabel")}
                    </FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
                      placeholder={t("emailPlaceholder")}
                      className={`h-12 bg-white/[0.05] border-white/10 text-white placeholder:text-white/30 focus:border-cyan focus:ring-cyan/20 transition-all duration-300 ${fieldErrors.email ? "border-rose-500/50" : ""}`}
                      autoComplete="email"
                      aria-invalid={!!fieldErrors.email}
                    />
                    <FormError message={fieldErrors.email} />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="password" className="text-white/70 text-sm font-medium">
                      {t("passwordLabel")}
                    </FieldLabel>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
                        placeholder={t("passwordPlaceholder")}
                        className={`h-12 bg-white/[0.05] border-white/10 text-white placeholder:text-white/30 pr-12 focus:border-cyan focus:ring-cyan/20 transition-all duration-300 ${fieldErrors.password ? "border-rose-500/50" : ""}`}
                        autoComplete="current-password"
                        aria-invalid={!!fieldErrors.password}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors duration-300"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <FormError message={fieldErrors.password} />
                  </Field>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-cyan focus:ring-cyan/30"
                      />
                      <span className="text-white/50 group-hover:text-white/70 transition-colors">{t("remember")}</span>
                    </label>
                    <Link 
                      href="#" 
                      className="text-cyan hover:text-cyan-light transition-colors duration-300 font-medium"
                    >
                      {t("forgot")}
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-cyan to-cyan-dark hover:from-cyan-light hover:to-cyan text-white font-semibold shadow-lg shadow-cyan/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan/30"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {t("authenticating")}
                      </span>
                    ) : (
                      t("signInBtn")
                    )}
                  </Button>
                </FieldGroup>
              </form>

              {/* Sign Up Link */}
              <p className="text-center text-sm text-white/40 mt-8">
                {t("noAccount")}{" "}
                <Link 
                  href="/signup" 
                  className="text-cyan hover:text-cyan-light transition-colors duration-300 font-medium"
                >
                  {t("createAccount")}
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <Terminal className="w-3.5 h-3.5 text-cyan/50" />
          <p className="text-xs text-white/30">
            {t("securityNotice")}
          </p>
        </div>
      </div>
    </main>
  )
}
