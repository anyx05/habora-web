"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle, Ship, Sailboat, Anchor } from "lucide-react"
import { useTranslations } from "next-intl"

interface HeroSectionProps {
  onOpenChat: () => void
}

export function HeroSection({ onOpenChat }: HeroSectionProps) {
  const t = useTranslations("Landing")

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-navy via-navy to-navy-dark">
      {/* Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-navy-light/20 via-transparent to-transparent" />

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Animated Waves */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg
          className="w-full h-20 sm:h-28 text-white/[0.03]"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            fill="currentColor"
            opacity=".25"
          />
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            fill="currentColor"
            opacity=".5"
          />
          <path
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            fill="currentColor"
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
        {/* Icon Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.08] border border-white/10 backdrop-blur-sm mb-8">
          <Ship className="w-4 h-4 text-amber" />
          <span className="text-sm font-medium text-white/80">
            {t('badge')}
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 tracking-tight text-balance leading-[1.1]">
          {t('title')}
          <span className="block text-amber mt-2">{t('titleHighlight')}</span>
        </h1>

        <p className="text-base sm:text-lg lg:text-xl text-white/60 max-w-2xl mx-auto mb-10 text-pretty leading-relaxed">
          {t('description')}
        </p>

        {/* CTA Buttons - Stack on mobile */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Button
            size="lg"
            onClick={onOpenChat}
            className="w-full sm:w-auto bg-amber hover:bg-amber/90 text-navy font-semibold px-6 sm:px-8 h-12 sm:h-14 text-sm sm:text-base transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-amber/30 focus-visible:ring-2 focus-visible:ring-amber/50 focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
          >
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            {t('chatBtn')}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto border-white/20 bg-white/[0.05] text-white hover:bg-white/10 hover:border-white/30 hover:text-white px-6 sm:px-8 h-12 sm:h-14 text-sm sm:text-base transition-all duration-300 ease-out hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
          >
            {t('browseBtn')}
          </Button>
        </div>

        {/* Stats - Glassmorphism cards */}
        <div className="mt-16 sm:mt-20 lg:mt-24 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
          {[
            { value: "24/7", label: t('statsSupport'), icon: Anchor },
            { value: "150+", label: t('statsBerths'), icon: Ship },
            { value: "99.8%", label: t('statsUptime'), icon: Sailboat },
            { value: "5min", label: t('statsResponse'), icon: MessageCircle },
          ].map((stat) => (
            <div
              key={stat.label}
              className="group relative p-4 sm:p-5 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-sm transition-all duration-300 ease-out hover:bg-white/[0.08] hover:border-white/20 hover:-translate-y-1"
            >
              <stat.icon className="w-4 h-4 text-amber/60 mb-2 mx-auto transition-colors duration-300 group-hover:text-amber" />
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-white/50 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
