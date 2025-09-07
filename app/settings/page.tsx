"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import DeleteFeedbackModal from "@/components/delete-feedback-modal";
import DeleteConfirmationModal from "@/components/delete-confirmation-modal";


// ...existing code...
const translations: Record<string, { [key: string]: string }> = {
  en: {
    profileSettings: "Profile Settings",
    nickname: "Nickname",
    gender: "Gender",
    male: "Male",
    female: "Female",
    email: "E-mail",
    password: "Password",
    phone: "Phone Number",
    currentPlan: "Current Plan",
    free: "Free",
    upgrade: "Upgrade to Premium",
    language: "Language",
    notifications: "Automatic Notifications",
    notificationsDesc: "As a user, you will receive automatic notifications from us. If you don't want any notifications, uncheck the box by clicking on it.",
    dangerZone: "Danger Zone",
    dangerDesc: "If you want to permanently delete this account and all of its data, click below.",
    deleteAccount: "Delete account",
    restrictions: "Chatbot Restrictions",
  },
  sv: {
    profileSettings: "Profilinställningar",
    nickname: "Användarnamn",
    gender: "Kön",
    male: "Man",
    female: "Kvinna",
    email: "Email",
    password: "Lösenord",
    phone: "Telefonnummer",
    currentPlan: "Nuvarande",
    free: "Gratis",
    upgrade: "Uppgradera till Premium",
    language: "Språk",
    notifications: "Automatiska aviseringar",
    notificationsDesc: "Som användare kommer du att få automatiska aviseringar från oss. Om du inte vill ha några aviseringar, avmarkera rutan genom att klicka på den.",
    dangerZone: "Om du vill radera detta konto och all dess data permanent.",
    deleteAccount: "Radera konto",
    restrictions: "Begränsningar för chatbotten",
  },
};

const languages = [
  { value: "sv", label: "Svenska" },
  { value: "en", label: "English" },
];

const rules = [
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
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("********");
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState("");
  const [language, setLanguage] = useState("sv");
  const [notifications, setNotifications] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch user profile from Supabase
  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("profiles")
          .select("username, gender, email, phone, is_premium, language, notifications")
          .eq("id", user.id)
          .single();
        if (!active) return;
        if (error) {
          toast.error("Failed to load profile");
        } else if (data) {
          setNickname(data.username || "");
          setGender(data.gender || "");
          setEmail(data.email || user.email || "");
          setPhone(data.phone || "");
          setPlan(data.is_premium ? "Premium" : "Free");
          setLanguage((data as any).language || "sv");
          setNotifications((data as any).notifications !== false);
          setPassword("********");
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false };
  }, [user?.id]); // Only depend on user ID, not the whole user object

  // Save profile changes to Supabase
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const supabase = createClient();
    const updates = {
      username: nickname,
      gender,
      email,
      phone,
      language,
      notifications,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
    if (error) {
      toast.error("Failed to save profile");
    } else {
      toast.success("Profile updated");
    }
    setSaving(false);
  };

  // Modal state for delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteFeedback, setPendingDeleteFeedback] = useState<{reason:string; description:string} | null>(null);

  // Delete account handler
  const handleDeleteAccount = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await fetch('/api/delete-account', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ userId: user.id, reason: pendingDeleteFeedback?.reason, description: pendingDeleteFeedback?.description }) })
      toast.success('Account deletion submitted');
    } catch (e:any) {
      toast.error('Failed to submit deletion');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setShowDeleteModal(false);
    }
  };

  const t = translations[language];
  return (
    <div className="min-h-screen bg-[#181818] text-white flex flex-col items-center py-10">
      <h1 className="text-3xl font-bold mb-8">{t.profileSettings}</h1>
      <div className="bg-[#232323] rounded-xl p-8 shadow-lg w-full max-w-xl mb-8">
        <div className="flex flex-wrap gap-6 mb-6">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm mb-1">{t.nickname}</label>
            <input value={nickname} onChange={e => setNickname(e.target.value)} className="w-full p-2 rounded bg-[#252525] border border-[#333]" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm mb-1">{t.gender}</label>
            <select value={gender} onChange={e => setGender(e.target.value)} className="w-full p-2 rounded bg-[#252525] border border-[#333]">
              <option value="Male">{t.male}</option>
              <option value="Female">{t.female}</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-6 mb-6">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm mb-1">{t.email}</label>
            <input value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 rounded bg-[#252525] border border-[#333]" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm mb-1">{t.password}</label>
            <input type="password" value={password} disabled className="w-full p-2 rounded bg-[#252525] border border-[#333]" />
          </div>
        </div>
        <div className="flex flex-wrap gap-6 mb-6">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm mb-1">{t.phone}</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2 rounded bg-[#252525] border border-[#333]" />
          </div>
        </div>
        <button
          className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded font-semibold w-full mt-4"
          onClick={handleSave}
          disabled={saving || loading}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
      <div className="bg-[#232323] rounded-xl p-6 shadow-lg w-full max-w-xl mb-8 flex items-center justify-between">
        <div>
          <span className="font-semibold">{t.currentPlan}</span> <span className="ml-2 px-3 py-1 rounded bg-[#2563eb] text-[#fff]">{plan === "Premium" ? "Premium" : t.free}</span>
        </div>
        <button
          className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded font-semibold"
          onClick={() => router.push("/premium")}
        >
          {t.upgrade}
        </button>
      </div>
      <div className="bg-[#232323] rounded-xl p-6 shadow-lg w-full max-w-xl mb-8">
        <label className="block text-sm mb-2 font-semibold">{t.language}</label>
        <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full p-2 rounded bg-[#252525] border border-[#333] mb-4">
          {languages.map(lang => (
            <option key={lang.value} value={lang.value}>{lang.label}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 mb-4">
          <input type="checkbox" checked={notifications} onChange={e => setNotifications(e.target.checked)} className="accent-blue-500" />
          {t.notifications}
        </label>
        <p className="text-xs text-gray-400 mb-4">{t.notificationsDesc}</p>
        <div className="border-t border-[#333] pt-4 mt-4">
          <span className="font-semibold text-blue-400">{t.dangerZone}</span>
          <p className="text-xs text-gray-400 mb-2">{t.dangerDesc}</p>
          <button className="text-blue-400 underline" onClick={() => setShowDeleteModal(true)}>{t.deleteAccount}</button>
          <DeleteFeedbackModal
            open={showDeleteModal && !showDeleteConfirm}
            onClose={() => setShowDeleteModal(false)}
            lang={language as any}
            onNext={(reason, description) => { setPendingDeleteFeedback({reason, description}); setShowDeleteConfirm(true); }}
          />
          <DeleteConfirmationModal
            open={showDeleteConfirm}
            onClose={()=> setShowDeleteConfirm(false)}
            lang={language as any}
            onDelete={handleDeleteAccount}
          />
        </div>
      </div>
      <Card className="mt-8 border-blue-500">
        <h2 className="text-xl font-bold text-blue-600 mb-2">{t.restrictions}</h2>
        <ul className="list-disc pl-6 text-sm text-blue-700">
          {rules.map((rule, idx) => (
            <li key={idx}>{rule}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
