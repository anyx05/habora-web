"use client"

import { Map, ListChecks, CheckCircle2 } from "lucide-react"
import { useTranslations } from "next-intl"

export function HowItWorks() {
  const t = useTranslations("HowItWorks")

  const steps = [
    {
      icon: Map,
      title: t("step1"),
      description: t("step1Desc")
    },
    {
      icon: ListChecks,
      title: t("step2"),
      description: t("step2Desc")
    },
    {
      icon: CheckCircle2,
      title: t("step3"),
      description: t("step3Desc")
    }
  ]

  return (
    <section id="how-it-works" className="pt-24 pb-12 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-balance">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="p-8 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50 hover:border-border hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-amber/10 text-amber flex items-center justify-center group-hover:bg-amber/20 group-hover:scale-110 transition-all duration-300">
                  <step.icon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
