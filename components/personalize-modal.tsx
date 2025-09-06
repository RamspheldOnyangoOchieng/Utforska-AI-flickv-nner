"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const translations = {
  en: {
    title: "Personalize Your AI Experience",
    desc: "It will help to customize your interactions with the AI characters.",
    nickname: "Nickname",
    male: "Male",
    female: "Female",
  },
  sv: {
    title: "Välj ditt användarnamn",
    desc: "Det hjälper till att anpassa dina interaktioner med AI-karaktärerna.",
    nickname: "Användarnamn",
    male: "Man",
    female: "Kvinna",
  },
};

export default function PersonalizeModal({ open, onClose, lang = "en", onSave }: { open: boolean; onClose: () => void; lang?: "en" | "sv"; onSave?: (nickname: string, gender: string) => void }) {
  const t = translations[lang];
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-[#232323] rounded-xl shadow-lg w-full max-w-sm flex flex-col p-8 relative">
        <button className="absolute top-4 right-4 text-white text-xl" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-bold mb-2 text-white">{t.title}</h2>
        <p className="text-gray-300 mb-6">{t.desc}</p>
        <input
          className="w-full p-2 rounded bg-[#252525] border border-[#333] mb-4 text-white"
          placeholder={t.nickname}
          value={nickname}
          onChange={e => setNickname(e.target.value)}
        />
        <select
          className="w-full p-2 rounded bg-[#252525] border border-[#333] mb-6 text-white"
          value={gender}
          onChange={e => setGender(e.target.value)}
        >
          <option value="" disabled>{t.nickname}</option>
          <option value="Male">{t.male}</option>
          <option value="Female">{t.female}</option>
        </select>
        <Button
          className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white w-full py-3 font-semibold"
          onClick={() => onSave?.(nickname, gender)}
          disabled={!nickname || !gender}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
