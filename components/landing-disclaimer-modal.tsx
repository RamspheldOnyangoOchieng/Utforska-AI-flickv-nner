"use client";
import { useState, useCallback } from "react";
import { CONSENT_VERSION, POLICY_VERSION } from "@/lib/consent-config";
import { Button } from "@/components/ui/button";

const translations = {
  en: {
    ageTitle: "This site is for adults only! It contains only AI-generated adult content.",
  ageDesc: "By entering this website, you confirm that you are 18 years or older. We use cookies for basic analytics and spam detection. All content on this website is AI-generated! Any generations that resemble real people are purely coincidental.",
    cookieTitle: "This website uses cookies",
    cookieDesc: "To change your preferences, please click on the settings button.",
    cookieSettings: "Cookie-inställningar",
  confirmAll: "Bekräfta alla villkor",
  reject: "Reject non-essential",
  termsLink: "Terms",
  privacyLink: "Privacy",
  ageCheckbox: "I confirm I am at least 18 years old",
  termsCheckbox: "I agree to the Terms and Policies",
  needConfirm: "Please confirm age and accept terms first",
    rulesTitle: "Chatbots are strictly allowed for sexting with minimum age of 18. Restricted and blocked activities from chat bots:",
    rules: [
      "Illegal Activities & Criminal Behavior",
      "Commercial sexual activities (including prostitution)",
      "Human trafficking",
      "Sexual exploitation and pornography (including child pornography)",
      "Solicitation or promotion of criminal activity",
      "Child labor exploitation",
      "Promotion of illegal drugs or substance abuse",
      "Promotion of illegal weapons",
      "Use of the service for phishing, scams, or account hijacking",
      "Distribution or discussion of cannibalism",
      "Breach of local, national, or international laws and regulations",
      "Child Exploitation & Minor Protection",
      "Creation or depiction of underage characters (realistic, fictional, AI-generated, or 'aged-up')",
      "Sharing any sexualized or exploitative material involving minors (including drawings, art, or AI-generated visuals)",
      "Any content that harms, entices, or endangers minors",
      "Sexual Content Restrictions",
      "Explicit images showing real or realistic nudity or sexual acts",
      "Overt or implied sexual acts, unless clearly fictionalized and within permitted contexts",
      "Kink content involving:",
      "Death or serious harm to humans or animals",
      "Amputation, dismemberment",
      "Cannibalism",
      "Bodily fluids (feces, urine, semen, cum, saliva, mucus, menstrual blood, vomit)",
      "Bestiality (real-life animals)",
      "Non-consensual sexual acts (rape, sexual abuse, sextortion, revenge porn, etc.)",
      "Incest (including non-blood-related scenarios like step-relationships)",
      "Sexual depictions in digital or real art unless within strict educational, scientific, or comedic context",
      "Violence & Harm",
      "Incitement, glorification, or depiction of violence, murder, or terrorism",
      "Threats of physical harm or violence",
      "Promotion or encouragement of self-harm, suicide, eating disorders, or drug abuse",
      "Depictions of gore, death of animals, or intense violence",
      "Discussions encouraging or promoting necrophilia",
      "Hate Speech & Discrimination",
      "Content promoting hatred or violence against individuals or groups based on:",
      "Race or ethnicity",
      "Nationality",
      "Religion",
      "Disability",
      "Gender or gender identity",
      "Sexual orientation",
      "Age or veteran status",
      "Idolization or glorification of hate figures (e.g., Adolf Hitler, Joseph Stalin, Pol Pot)",
      "Privacy, Deception, and Impersonation",
      "Sharing personal or confidential information of others without consent",
      "Impersonation of real individuals, including celebrities or public figures",
      "Uploading real images or AI-generated images that resemble real individuals without consent",
      "Using the service for deceptive behavior (false information, multiple accounts, fake identities)",
      "Solicitation of payments from users under deceptive pretenses",
      "Misinformation & Political Interference",
      "Posting misinformation that could lead to violence, harm, or disrupt political processes",
      "Discussions of political opinions or religious and spiritual beliefs (explicitly prohibited topics)",
      "Spam & Irrelevant Content",
      "Spamming, including sending unwanted promotional, commercial, or bulk messages",
      "Generating meaningless, irrelevant, or purposeless content",
      "Restricted Goods and Transactions",
      "Advertising or attempting to transact regulated or restricted goods"
    ],
  },
  sv: {
    ageTitle: "Den här sidan är endast för vuxna!",
  ageDesc: "Den innehåller enbart AI-genererat vuxeninnehåll. Genom att besöka denna webbplats bekräftar du att du är 18 år eller äldre. Vi använder cookies för grundläggande analys och skräppostdetektering. Allt innehåll på denna webbplats är AI-genererat! Eventuella likheter med verkliga personer är helt tillfälliga.",
    cookieTitle: "Denna webbplats använder cookies",
    cookieDesc: "För att ändra dina inställningar, klicka på knappen för inställningar.",
    cookieSettings: "Cookie-inställningar",
  confirmAll: "Bekräfta alla villkor",
  reject: "Avvisa icke-nödvändiga",
  termsLink: "Villkor",
  privacyLink: "Integritet",
  ageCheckbox: "Jag bekräftar att jag är minst 18 år gammal",
  termsCheckbox: "Jag godkänner Villkor och Policyer",
  needConfirm: "Bekräfta ålder och godkänn villkor först",
    rulesTitle: "Chatbots är strikt tillåtna för sexting med minimiålder 18. Begränsade och blockerade aktiviteter från chatbots:",
    rules: [
      "Illegal verksamhet och kriminellt beteende",
      "Kommersiella sexuella aktiviteter (inklusive prostitution)",
      "Människohandel",
      "Sexuell exploatering och pornografi (inklusive barnpornografi)",
      "Uppmaning till eller främjande av kriminell verksamhet",
      "Exploatering av barnarbete",
      "Främjande av olagliga droger eller substansmissbruk",
      "Främjande av olagliga vapen",
      "Användning av tjänsten för phishing, bedrägerier eller kapning av konton",
      "Spridning eller diskussion om kannibalism",
      "Brott mot lokala, nationella eller internationella lagar och regler",
      "Barnexploatering och skydd av minderåriga",
      "Skapande eller avbildning av minderåriga karaktärer (realistiska, fiktiva, AI-genererade eller 'åldrade')",
      "Delning av sexualiserat eller exploaterande material som involverar minderåriga (inklusive teckningar, konst eller AI-genererade bilder)",
      "Allt innehåll som skadar, lockar eller utsätter minderåriga för fara",
      "Sexuella innehållsbegränsningar",
      "Explicit bilder som visar verklig eller realistisk nakenhet eller sexuella handlingar",
      "Öppna eller antydda sexuella handlingar, om inte tydligt fiktiva och inom tillåtna sammanhang",
      "Kink-innehåll som involverar:",
      "Död eller allvarlig skada på människor eller djur",
      "Amputation, stympning",
      "Kannibalism",
      "Kroppsvätskor (avföring, urin, sperma, saliv, slem, menstruationsblod, kräkningar)",
      "Tidigare (verkliga) djur",
      "Icke samtyckande sexuella handlingar (våldtäkt, sexuella övergrepp, sextortion, hämndporr, etc.)",
      "Incest (inklusive icke-blodrelaterade scenarier som styvförhållanden)",
      "Sexuella avbildningar i digital eller verklig konst om inte inom strikt utbildnings-, vetenskapligt eller komiskt sammanhang",
      "Våld och skada",
      "Uppmaning till, glorifiering eller avbildning av våld, mord eller terrorism",
      "Hot om fysisk skada eller våld",
      "Främjande eller uppmuntran till självskada, självmord, ätstörningar eller drogmissbruk",
      "Avbildningar av blod, död av djur eller intensivt våld",
      "Diskussioner som uppmuntrar eller främjar nekrofili",
      "Hatpropaganda och diskriminering",
      "Innehåll som främjar hat eller våld mot individer eller grupper baserat på:",
      "Ras eller etnicitet",
      "Nationalitet",
      "Religion",
      "Funktionsnedsättning",
      "Kön eller könsidentitet",
      "Sexuell läggning",
      "Ålder eller veteranstatus",
      "Idolisering eller glorifiering av hatfigurer (t.ex. Adolf Hitler, Joseph Stalin, Pol Pot)",
      "Integritet, bedrägeri och imitation",
      "Delning av personliga eller konfidentiella uppgifter om andra utan samtycke",
      "Imitation av verkliga individer, inklusive kändisar eller offentliga personer",
      "Uppladdning av verkliga bilder eller AI-genererade bilder som liknar verkliga individer utan samtycke",
      "Användning av tjänsten för bedrägligt beteende (falsk information, flera konton, falska identiteter)",
      "Begäran om betalning från användare under falska förespeglingar",
      "Desinformation och politisk påverkan",
      "Publicering av desinformation som kan leda till våld, skada eller störa politiska processer",
      "Diskussioner om politiska åsikter eller religiösa och andliga övertygelser (explicit förbjudna ämnen)",
      "Spam och irrelevant innehåll",
      "Spam, inklusive att skicka oönskade reklam-, kommersiella eller massmeddelanden",
      "Generering av meningslöst, irrelevant eller syfteslöst innehåll",
      "Begränsade varor och transaktioner",
      "Annonsering eller försök att transagera reglerade eller begränsade varor"
    ],
  },
};

interface CookiePreferences {
  analytics: boolean;
  marketing: boolean;
}

interface ConsentPayload {
  version: number;
  policyVersion: number;
  timestamp: number;
  preferences: CookiePreferences;
  confirmations: { age: boolean; terms: boolean };
}

export default function LandingDisclaimerModal({
  open,
  onConfirm,
  onCookieSettings,
  lang = "sv",
  initialPreferences,
}: {
  open: boolean;
  // Called with final saved preferences (either accept all or custom)
  onConfirm: (prefs: CookiePreferences, full?: ConsentPayload) => void;
  onCookieSettings: () => void;
  lang?: "en" | "sv";
  initialPreferences?: Partial<CookiePreferences>;
}) {
  const t = translations[lang];
  const [showSettings, setShowSettings] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>({
    analytics: initialPreferences?.analytics ?? true,
    marketing: initialPreferences?.marketing ?? false,
  });
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const ready = ageConfirmed && termsAccepted;
  const [showValidation, setShowValidation] = useState(false);

  const ensureReady = useCallback((action: () => void) => {
    if (!ready) {
      // trigger validation message highlight
      setShowValidation(true);
      setTimeout(() => setShowValidation(false), 1600);
      return;
    }
    action();
  }, [ready]);

  if (!open) return null;

  const buildConsent = (finalPrefs: CookiePreferences): ConsentPayload => ({
    version: CONSENT_VERSION,
    policyVersion: POLICY_VERSION,
    timestamp: Date.now(),
    preferences: finalPrefs,
    confirmations: { age: ageConfirmed, terms: termsAccepted },
  });

  const saveAndClose = (finalPrefs: CookiePreferences) => {
    const consent = buildConsent(finalPrefs);
    onConfirm(finalPrefs, consent);
  };

  const acceptAll = () => ensureReady(() => saveAndClose({ analytics: true, marketing: true }));
  const rejectNonEssential = () => ensureReady(() => saveAndClose({ analytics: false, marketing: false }));
  const saveCustom = () => ensureReady(() => saveAndClose(prefs));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-xl w-[75%] max-h-[90vh] overflow-y-auto flex flex-col p-8 relative border border-blue-400/30">
        {!showSettings && (
          <>
            <h2 className="text-2xl font-bold mb-2 text-white">{t.ageTitle}</h2>
            <p className="text-white mb-3">{t.ageDesc}</p>
            <p className="text-white text-xs mb-4 space-x-4">
              <a href="/terms" className="underline hover:text-blue-200" target="_blank" rel="noopener noreferrer">{t.termsLink}</a>
              <a href="/privacy" className="underline hover:text-blue-200" target="_blank" rel="noopener noreferrer">{t.privacyLink}</a>
            </p>
            <h3 className="text-lg font-bold mb-2 text-white">{t.cookieTitle}</h3>
            <p className="text-white mb-4">{t.cookieDesc}</p>
            <h3 className="text-lg font-bold mb-2 text-white">{t.rulesTitle}</h3>
            <ul className="text-white text-sm mb-6 list-disc pl-6 max-h-48 overflow-y-auto">
              {t.rules.map((rule, idx) => (
                <li key={idx}>{rule}</li>
              ))}
            </ul>
            <div className="space-y-3 mb-4">
              <label className="flex items-start gap-2 text-white text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-400"
                  checked={ageConfirmed}
                  onChange={(e) => setAgeConfirmed(e.target.checked)}
                />
                <span>{t.ageCheckbox}</span>
              </label>
              <label className="flex items-start gap-2 text-white text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-400"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />
                <span>{t.termsCheckbox}</span>
              </label>
              {(!ready || showValidation) && (
                <p className={`text-xs font-medium transition-colors ${showValidation ? "text-red-200 animate-pulse" : "text-red-100/80"}`}>{t.needConfirm}</p>
              )}
            </div>
            <div className="flex flex-col lg:flex-row gap-3 mt-2">
              <div className="flex flex-1 gap-3">
                <Button
                  className="bg-white text-blue-600 hover:text-blue-700 font-semibold flex-1 border border-blue-200 hover:border-blue-300 shadow-sm pointer-events-auto"
                  type="button"
                  onClick={() => setShowSettings(true)}
                >
                  {t.cookieSettings}
                </Button>
                <Button
                  variant="destructive"
                  className={`bg-red-500 hover:bg-red-600 text-white font-semibold flex-1 shadow ${!ready && "opacity-60"}`}
                  type="button"
                  onClick={rejectNonEssential}
                  aria-disabled={!ready}
                >
                  {t.reject}
                </Button>
              </div>
              <Button
                className={`bg-blue-500 hover:bg-blue-600 text-white font-semibold flex-1 shadow focus:ring-2 focus:ring-offset-2 focus:ring-blue-300 ${!ready && "opacity-60"}`}
                type="button"
                onClick={acceptAll}
                aria-disabled={!ready}
              >
                {t.confirmAll}
              </Button>
            </div>
          </>
        )}

        {showSettings && (
          <div className="text-white space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">{t.cookieTitle}</h2>
              <button
                className="text-sm underline hover:text-blue-200"
                onClick={() => setShowSettings(false)}
              >
                ← {lang === "sv" ? "Tillbaka" : "Back"}
              </button>
            </div>
            <p className="text-sm opacity-90">{t.cookieDesc}</p>
            <div className="bg-blue-800/40 rounded-lg p-4 border border-blue-300/20">
              <h3 className="font-semibold">{lang === "sv" ? "Nödvändiga" : "Necessary"}</h3>
              <p className="text-xs opacity-80">
                {lang === "sv"
                  ? "Obligatoriska för att webbplatsen ska fungera (alltid aktiverade)."
                  : "Required for the site to function (always enabled)."}
              </p>
              <div className="mt-2 text-xs inline-block px-2 py-1 rounded bg-blue-900/50 border border-blue-700/40">
                {lang === "sv" ? "Aktiv" : "Active"}
              </div>
            </div>
            <div className="bg-blue-800/40 rounded-lg p-4 border border-blue-300/20 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold">{lang === "sv" ? "Analys" : "Analytics"}</h3>
                <p className="text-xs opacity-80 max-w-md">
                  {lang === "sv"
                    ? "Hjälper oss förstå användning och förbättra tjänsten."
                    : "Helps us understand usage and improve the service."}
                </p>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-400"
                  checked={prefs.analytics}
                  onChange={(e) => setPrefs((p) => ({ ...p, analytics: e.target.checked }))}
                />
                <span className="text-sm">{prefs.analytics ? (lang === "sv" ? "På" : "On") : (lang === "sv" ? "Av" : "Off")}</span>
              </label>
            </div>
            <div className="bg-blue-800/40 rounded-lg p-4 border border-blue-300/20 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold">{lang === "sv" ? "Marknadsföring" : "Marketing"}</h3>
                <p className="text-xs opacity-80 max-w-md">
                  {lang === "sv"
                    ? "Används för personaliserat innehåll och erbjudanden."
                    : "Used for personalized content and offers."}
                </p>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-400"
                  checked={prefs.marketing}
                  onChange={(e) => setPrefs((p) => ({ ...p, marketing: e.target.checked }))}
                />
                <span className="text-sm">{prefs.marketing ? (lang === "sv" ? "På" : "On") : (lang === "sv" ? "Av" : "Off")}</span>
              </label>
            </div>
            <div className="flex flex-col lg:flex-row gap-3 pt-2">
              <div className="flex flex-1 gap-3">
                <Button
                  variant="outline"
                  className={`bg-white text-blue-600 hover:text-blue-700 font-semibold flex-1 border border-blue-200 hover:border-blue-300 shadow-sm ${!ready && "opacity-60"}`}
                  type="button"
                  onClick={saveCustom}
                  aria-disabled={!ready}
                >
                  {lang === "sv" ? "Spara inställningar" : "Save preferences"}
                </Button>
                <Button
                  variant="destructive"
                  className={`bg-red-500 hover:bg-red-600 text-white font-semibold flex-1 shadow ${!ready && "opacity-60"}`}
                  type="button"
                  onClick={rejectNonEssential}
                  aria-disabled={!ready}
                >
                  {t.reject}
                </Button>
              </div>
              <Button
                className={`bg-blue-500 hover:bg-blue-600 text-white font-semibold flex-1 shadow focus:ring-2 focus:ring-offset-2 focus:ring-blue-300 ${!ready && "opacity-60"}`}
                type="button"
                onClick={acceptAll}
                aria-disabled={!ready}
              >
                {lang === "sv" ? "Acceptera alla" : "Accept all"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
