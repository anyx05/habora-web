import { Link } from "@/i18n/routing"
import { Anchor, Sailboat, Ship, Waves } from "lucide-react"
import { useTranslations } from "next-intl"

export function Footer() {
  const t = useTranslations("FooterNav")

  const vesselIconClass =
    "flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/20"

  const footerLinks = {
    services: [
      { label: t("marinaBerths"), href: "#berths" },
      { label: t("yachtMoorings"), href: "#berths" },
      { label: t("vesselSupport"), href: "#about" },
    ],
    company: [
      { label: t("aboutUs"), href: "#about" },
      { label: t("contact"), href: "mailto:hello@habora.ee" },
      { label: t("careers"), href: "mailto:careers@habora.ee" },
      { label: t("press"), href: "mailto:press@habora.ee" },
    ],
    legal: [
      { label: t("privacy"), href: "#" },
      { label: t("terms"), href: "#" },
      { label: t("cookies"), href: "#" },
    ],
  }

  return (
    <footer className="relative bg-gradient-to-b from-navy to-navy-dark text-white overflow-hidden">
      {/* Subtle wave decoration */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 mb-4 group"
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber text-navy transition-all duration-300 ease-out group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-amber/30">
                <Anchor className="w-4 h-4" />
              </div>
              <span className="font-semibold text-lg tracking-tight">
                Habora
              </span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              {t("desc")}
            </p>
            {/* Vessel type icons */}
            <div className="flex items-center gap-3 mt-5">
              <div className={vesselIconClass}>
                <Sailboat className="w-4 h-4 text-white/50" />
              </div>
              <div className={vesselIconClass}>
                <Ship className="w-4 h-4 text-white/50" />
              </div>
              <div className={vesselIconClass}>
                <Waves className="w-4 h-4 text-white/50" />
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-amber tracking-wide uppercase">
              {t("servicesTitle")}
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 hover:text-white transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-amber tracking-wide uppercase">
              {t("companyTitle")}
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 hover:text-white transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-amber tracking-wide uppercase">
              {t("legalTitle")}
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 hover:text-white transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-white/40">
              &copy; {new Date().getFullYear()} Habora. {t("rights")}
            </p>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {t("serving")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
