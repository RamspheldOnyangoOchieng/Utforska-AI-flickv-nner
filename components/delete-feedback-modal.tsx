"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const translations = {
  en: {
    title: "Help us improve",
    desc: "Before you leave, could you let us know why you're deleting your account? Your feedback is vital for us to improve.",
    reason: "Select a reason",
    description: "Description",
    next: "Next",
  },
  sv: {
    title: "Hjälp oss att bli bättre",
    desc: "Innan du lämnar, kan du berätta varför du raderar ditt konto? Din feedback är ovärderlig för att vi ska kunna förbättras.",
    reason: "Välj en orsak",
    description: "Förklaring",
    next: "Fortsätt",
  },
};

const reasons = {
  en: [
    "Privacy Concern",
    "Not satisfied with features",
    "Found a better alternative",
    "Concerns about data security",
    "The service didn't meet my expectations",
    "Difficulty in navigating or using the platform",
    "Lack of interesting content or interactions",
    "It's just a temporary break",
  ],
  sv: [
    "Integritetsbekymmer.",
    "Inte nöjd med funktionerna",
    "Hittade ett bättre alternativ",
    "Bekymmer om datasäkerhet",
    "Tjänsten uppfyllde inte mina förväntningar",
    "Svårigheter att navigera eller använda plattformen",
    "Brist på intressant innehåll eller interaktioner",
    "Det är bara en tillfällig paus",
  ],
};

export default function DeleteFeedbackModal({ open, onClose, lang = "en", onNext }: { open: boolean; onClose: () => void; lang?: "en" | "sv"; onNext?: (reason: string, description: string) => void }) {
  const t = translations[lang];
  const [selectedReason, setSelectedReason] = useState("");
  const [description, setDescription] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-[#232323] rounded-xl shadow-lg w-full max-w-sm flex flex-col p-8 relative">
        <button className="absolute top-4 right-4 text-white text-xl" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-bold mb-2 text-white">{t.title}</h2>
        <p className="text-gray-300 mb-6">{t.desc}</p>
        <select
          className="w-full p-2 rounded bg-[#252525] border border-[#333] mb-4 text-white"
          value={selectedReason}
          onChange={e => setSelectedReason(e.target.value)}
        >
          <option value="" disabled>{t.reason}</option>
          {reasons[lang].map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <textarea
          className="w-full p-2 rounded bg-[#252525] border border-[#333] mb-6 text-white"
          rows={4}
          placeholder={t.description}
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <Button
          className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white w-full py-3 font-semibold"
          onClick={() => onNext?.(selectedReason, description)}
          disabled={!selectedReason}
        >
          {t.next}
        </Button>
      </div>
    </div>
  );
}
