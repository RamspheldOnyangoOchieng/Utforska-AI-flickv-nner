"use client";
import { Button } from "@/components/ui/button";

const translations = {
  en: {
    title: "Final step...",
    desc: "Remember, deleting your account is permanent and we don't offer refunds. Are you sure about your decision?",
    yes: "Yes, Delete",
    no: "No, Stay",
  },
  sv: {
    title: "Sista steg",
    desc: "Kom ihåg att radera ditt konto är permanent och vi erbjuder inga återbetalningar. Är du säker på ditt beslut?",
    yes: "Ja, radera",
    no: "Nej, stanna",
  },
};

export default function DeleteConfirmationModal({ open, onClose, lang = "en", onDelete }: { open: boolean; onClose: () => void; lang?: "en" | "sv"; onDelete?: () => void }) {
  const t = translations[lang];
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-[#232323] rounded-xl shadow-lg w-full max-w-sm flex flex-col p-8 relative">
        <button className="absolute top-4 right-4 text-white text-xl" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-bold mb-2 text-white">{t.title}</h2>
        <p className="text-gray-300 mb-8">{t.desc}</p>
        <div className="flex gap-4">
          <Button
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold flex-1"
            onClick={onDelete}
          >
            {t.yes}
          </Button>
          <Button
            className="bg-[#252525] border border-[#333] text-white font-semibold flex-1"
            onClick={onClose}
          >
            {t.no}
          </Button>
        </div>
      </div>
    </div>
  );
}
