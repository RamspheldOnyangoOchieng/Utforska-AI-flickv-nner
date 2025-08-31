export function CompanionExperienceSection() {
  const { t } = require("@/lib/use-translations").useTranslations()
  return (
    <div className="w-full bg-gradient-to-r from-gray-100 via-white to-gray-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 py-8 sm:py-12 md:py-16 px-4 border-t border-b border-gray-200 dark:border-zinc-800 rounded-[2px]">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-800 dark:text-white mb-6 md:mb-8">
          {t("home.companion.title")}
        </h2>

        <div className="space-y-4 sm:space-y-6 text-zinc-700 dark:text-zinc-300">
          <p className="text-base sm:text-lg">{t("home.companion.p1")}</p>

          <p>{t("home.companion.p2")}</p>

          <p>{t("home.companion.p3")}</p>

          <p>{t("home.companion.p4")}</p>

          <p>{t("home.companion.p5")}</p>

          <p>{t("home.companion.p6")}</p>

          <p>{t("home.companion.p7")}</p>

          <p>{t("home.companion.p8")}</p>
        </div>
      </div>
    </div>
  )
}
