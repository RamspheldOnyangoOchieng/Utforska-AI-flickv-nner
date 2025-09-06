"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const translations = {
  en: {
    unsubscribe: "Unsubscribe",
    success: "You have been successfully unsubscribed from our marketing emails.",
    home: "Go to Home page",
  },
  sv: {
    unsubscribe: "Avprenumerera",
    success: "Du har framgångsrikt avslutat prenumerationen på våra marknadsföringsmejl.",
    home: "Tillbaka till hemsidan",
  },
};

export default function UnsubscribePage({ lang = "en" }: { lang?: "en" | "sv" }) {
  const t = translations[lang];
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-[#232323] rounded-xl shadow-lg w-full max-w-md flex flex-col items-center justify-center p-10">
        <div className="mb-6">
          <Image src="/favicon.png" alt="DINTYP.SE" width={48} height={48} />
        </div>
        <h2 className="text-2xl font-bold mb-4 text-white">{t.unsubscribe}</h2>
        <p className="text-gray-300 text-center mb-8">{t.success}</p>
        <Button
          className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white w-full py-3 font-semibold"
          onClick={() => router.push("/")}
        >
          {t.home}
        </Button>
      </div>
    </div>
  );
}
