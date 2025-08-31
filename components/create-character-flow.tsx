"use client";

import { useState, useEffect } from "react";
import { CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";

const steps = [
    { label: "Choose Style" },
    { label: "Basic Info" },
    { label: "Communication" },
    { label: "Career" },
    { label: "Personality" },
    { label: "Final Preview" },
];


type Character = {
    id: string;
    name: string;
    age: number;
    image: string;
    description: string;
    personality: string;
    occupation: string;
    hobbies: string;
    body: string;
    ethnicity: string;
    language: string;
    relationship: string;
};

async function fetchCharacters(): Promise<Character[]> {
    // Dynamic import to avoid SSR issues
    const mod = await import("@/lib/characters");
    return mod.getCharacters();
}

function ProgressBar({ step }: { step: number }) {
    return (
        <div className="flex items-center justify-between mb-8">
            {steps.map((s, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                    <div
                        className={`w-8 h-8 flex items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300  ${step === i
                            ? "bg-primary border-primary text-primary-foreground"
                            : step > i
                                ? "bg-card border-primary text-primary"
                                : "bg-[#1A1A1A] border-[#252525] text-gray-500"
                            }`}
                    >
                        {step > i ? <CheckCircle className="w-5 h-5" /> : i + 1}
                    </div>
                    <span className="mt-2 text-xs text-gray-400">{s.label}</span>
                    {i < steps.length - 1 && (
                        <div className="w-full h-1 bg-[#252525] mt-2 mb-2">
                            <div
                                className={`h-1 transition-all duration-300 ${step > i ? "bg-primary w-full" : "bg-muted w-0"
                                    }`}
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

function Card({ emoji, label, value }: { emoji: string; label: string; value: string | number }) {
    return (
        <div className="bg-[#23232b] rounded-xl p-6 flex flex-col items-center shadow-md min-w-[140px]">
            <div className="text-3xl mb-2">{emoji}</div>
            <div className="text-sm text-gray-400 mb-1">{label}</div>
            <div className="text-lg font-semibold text-white">{value}</div>
        </div>
    );
}

function Badge({ text }: { text: string }) {
    return (
    <span className="bg-muted text-primary rounded-full px-4 py-1 text-xs font-semibold mr-2 mb-2 inline-block">
            {text}
        </span>
    );
}


export default function CreateCharacterFlow() {
    const [step, setStep] = useState(0);
    const [style, setStyle] = useState<'realistic' | 'anime'>("realistic");
    const [characters, setCharacters] = useState<Character[]>([]);
    const [selected, setSelected] = useState<string | null>(null);
    // Filter state
    const [filters, setFilters] = useState({
        age: '',
        body: '',
        ethnicity: '',
        language: '',
        relationship: '',
        occupation: '',
        hobbies: '',
        personality: '',
    });

    useEffect(() => {
        fetchCharacters().then((data) => {
            setCharacters(data);
            if (data.length > 0) setSelected(data[0].id);
        });
    }, []);

    // Get unique values for each filter
    const unique = (key: keyof Character) => Array.from(new Set(characters.map((c) => c[key]).filter(Boolean)));


    // Instead of filtering out, highlight matches but always show all models
    function isMatch(char: Character) {
        return (
            (!filters.age || String(char.age) === filters.age) &&
            (!filters.body || char.body === filters.body) &&
            (!filters.ethnicity || char.ethnicity === filters.ethnicity) &&
            (!filters.language || char.language === filters.language) &&
            (!filters.relationship || char.relationship === filters.relationship) &&
            (!filters.occupation || char.occupation === filters.occupation) &&
            (!filters.hobbies || char.hobbies.includes(filters.hobbies)) &&
            (!filters.personality || char.personality.includes(filters.personality))
        );
    }

    const selectedCharacter = characters.find((c) => c.id === selected) || characters[0];

    // Handle filter change
    function handleFilterChange(key: keyof typeof filters, value: string) {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setSelected(null); // Reset selection on filter change
    }

    return (
        <div className="max-w-xl mx-auto mt-12 bg-[#18181f] rounded-2xl shadow-2xl p-8 text-white font-sans">
            <ProgressBar step={step} />
            {/* Step Content */}
            {step === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[300px] w-full">
                    <div className="text-3xl font-bold mb-2">Create my AI</div>
                    <div className="text-gray-400 mb-4">Let’s build your AI companion.</div>
                    {/* Filter Controls */}
                    <div className="w-full flex flex-wrap gap-2 mb-6 justify-center">
                        <select className="rounded bg-[#23232b] px-3 py-1 text-sm" value={filters.age} onChange={e => handleFilterChange('age', e.target.value)}>
                            <option value="">AGE</option>
                            {unique('age').map((v) => <option key={v} value={v as string}>{v}</option>)}
                        </select>
                        <select className="rounded bg-[#23232b] px-3 py-1 text-sm" value={filters.body} onChange={e => handleFilterChange('body', e.target.value)}>
                            <option value="">BODY</option>
                            {unique('body').map((v) => <option key={v} value={v as string}>{v}</option>)}
                        </select>
                        <select className="rounded bg-[#23232b] px-3 py-1 text-sm" value={filters.ethnicity} onChange={e => handleFilterChange('ethnicity', e.target.value)}>
                            <option value="">ETHNICITY</option>
                            {unique('ethnicity').map((v) => <option key={v} value={v as string}>{v}</option>)}
                        </select>
                        <select className="rounded bg-[#23232b] px-3 py-1 text-sm" value={filters.language} onChange={e => handleFilterChange('language', e.target.value)}>
                            <option value="">LANGUAGE</option>
                            {unique('language').map((v) => <option key={v} value={v as string}>{v}</option>)}
                        </select>
                        <select className="rounded bg-[#23232b] px-3 py-1 text-sm" value={filters.relationship} onChange={e => handleFilterChange('relationship', e.target.value)}>
                            <option value="">RELATIONSHIP</option>
                            {unique('relationship').map((v) => <option key={v} value={v as string}>{v}</option>)}
                        </select>
                        <select className="rounded bg-[#23232b] px-3 py-1 text-sm" value={filters.occupation} onChange={e => handleFilterChange('occupation', e.target.value)}>
                            <option value="">OCCUPATION</option>
                            {unique('occupation').map((v) => <option key={v} value={v as string}>{v}</option>)}
                        </select>
                        <select className="rounded bg-[#23232b] px-3 py-1 text-sm" value={filters.hobbies} onChange={e => handleFilterChange('hobbies', e.target.value)}>
                            <option value="">HOBBIES</option>
                            {Array.from(new Set(characters.flatMap((c) => c.hobbies.split(',').map(h => h.trim())))).map((v) => <option key={v} value={v}>{v}</option>)}
                        </select>
                        <select className="rounded bg-[#23232b] px-3 py-1 text-sm" value={filters.personality} onChange={e => handleFilterChange('personality', e.target.value)}>
                            <option value="">PERSONALITY</option>
                            {Array.from(new Set(characters.flatMap((c) => c.personality.split(',').map(p => p.trim())))).map((v) => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>
                    <div className="w-full flex flex-wrap gap-4 justify-center mb-8">
                        {characters.length === 0 && <div className="text-gray-500">No characters found.</div>}
                        {characters.map((char) => (
                            <div
                                key={char.id}
                                className={`rounded-xl p-4 flex flex-col items-center border-2 cursor-pointer transition-all duration-200 min-w-[120px] max-w-[140px] 
                  ${selected === char.id
                                        ? "border-primary bg-accent shadow-lg"
                                        : isMatch(char)
                                            ? "border-primary bg-accent opacity-90"
                                            : "border-[#23232b] bg-[#18181f] opacity-40"
                                    }`}
                                onClick={() => setSelected(char.id)}
                            >
                                <img
                                    src={char.image}
                                    alt={char.name}
                                    className="w-16 h-16 rounded-full mb-2 object-cover border-2 border-primary"
                                />
                                <span className="text-lg font-semibold mb-1">{char.name}</span>
                                <span className="text-xs text-gray-400 text-center">{char.description}</span>
                            </div>
                        ))}
                    </div>
                    <button
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl font-bold text-lg transition-all"
                        onClick={() => setStep(1)}
                        disabled={!selectedCharacter}
                    >
                        Next &rarr;
                    </button>
                </div>
            )}
            {selectedCharacter && step === 1 && (
                <div className="flex flex-col items-center min-h-[300px]">
                    <div className="text-2xl font-bold mb-2">Your AI's Core Info</div>
                    <div className="text-gray-400 mb-8">Step 2 of 6</div>
                    <div className="flex gap-6 mb-8">
                        <Card emoji="🎂" label="AGE" value={selectedCharacter.age} />
                        <Card emoji="💪" label="BODY" value={selectedCharacter.body} />
                        <Card emoji="🌎" label="ETHNICITY" value={selectedCharacter.ethnicity} />
                    </div>
                </div>
            )}
            {selectedCharacter && step === 2 && (
                <div className="flex flex-col items-center min-h-[300px]">
                    <div className="text-2xl font-bold mb-2">How They Connect</div>
                    <div className="text-gray-400 mb-8">Step 3 of 6</div>
                    <div className="flex gap-6 mb-8">
                        <Card emoji="🗣️" label="LANGUAGE" value={selectedCharacter.language} />
                        <Card emoji="💑" label="RELATIONSHIP STATUS" value={selectedCharacter.relationship} />
                    </div>
                </div>
            )}
            {selectedCharacter && step === 3 && (
                <div className="flex flex-col items-center min-h-[300px]">
                    <div className="text-2xl font-bold mb-2">What They Do</div>
                    <div className="text-gray-400 mb-8">Step 4 of 6</div>
                    <div className="flex flex-col items-center mb-8">
                        <div className="bg-[#23232b] rounded-xl p-6 flex flex-col items-center shadow-md min-w-[220px] relative overflow-hidden">
                            <div className="absolute inset-0 opacity-10 bg-cover bg-center" style={{ backgroundImage: 'url(/gaming-bg.jpg)' }} />
                            <div className="relative z-10">
                                <div className="text-3xl mb-2">💼</div>
                                <div className="text-sm text-gray-400 mb-1">OCCUPATION</div>
                                <div className="text-lg font-semibold text-white">{selectedCharacter.occupation}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {selectedCharacter && step === 4 && (
                <div className="flex flex-col items-center min-h-[300px]">
                    <div className="text-2xl font-bold mb-2">Who They Are</div>
                    <div className="text-gray-400 mb-8">Step 5 of 6</div>
                    <div className="w-full flex flex-col items-center mb-4">
                        <div className="text-sm text-gray-400 mb-2">HOBBIES</div>
                        <div className="flex flex-wrap justify-center mb-4">
                            {selectedCharacter.hobbies.split(",").map((hobby) => (
                                <Badge key={hobby.trim()} text={hobby.trim()} />
                            ))}
                        </div>
                        <div className="text-sm text-gray-400 mb-2">PERSONALITY</div>
                        <div className="flex flex-wrap justify-center">
                            {selectedCharacter.personality.split(",").map((trait) => (
                                <Badge key={trait.trim()} text={trait.trim()} />
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {selectedCharacter && step === 5 && (
                <div className="flex flex-col items-center min-h-[300px]">
                    <div className="text-2xl font-bold mb-2">Meet Your AI</div>
                    <div className="text-gray-400 mb-8">Step 6 of 6</div>
                    <div className="bg-[#23232b] rounded-2xl p-8 shadow-lg w-full max-w-md flex flex-col items-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 bg-cover bg-center" style={{ backgroundImage: `url(${selectedCharacter.image})` }} />
                        <div className="relative z-10 flex flex-col items-center">
                            <img
                                src={selectedCharacter.image}
                                alt={selectedCharacter.name}
                                className="w-24 h-24 rounded-full mb-4 object-cover border-4 border-primary shadow-lg"
                            />
                            <div className="text-2xl font-bold mb-1">{selectedCharacter.name}</div>
                            <div className="text-xs text-gray-400 mb-2 text-center max-w-xs">{selectedCharacter.description}</div>
                            <div className="flex gap-4 mb-2">
                                <Card emoji="🎂" label="AGE" value={selectedCharacter.age} />
                                <Card emoji="💪" label="BODY" value={selectedCharacter.body} />
                                <Card emoji="🌎" label="ETHNICITY" value={selectedCharacter.ethnicity} />
                            </div>
                            <div className="flex gap-4 mb-2">
                                <Card emoji="🗣️" label="LANGUAGE" value={selectedCharacter.language} />
                                <Card emoji="💑" label="RELATIONSHIP" value={selectedCharacter.relationship} />
                                <Card emoji="💼" label="OCCUPATION" value={selectedCharacter.occupation} />
                            </div>
                            <div className="w-full flex flex-col items-center mb-2">
                                <div className="text-xs text-gray-400 mb-1">HOBBIES</div>
                                <div className="flex flex-wrap justify-center mb-2">
                                    {selectedCharacter.hobbies.split(",").map((hobby) => (
                                        <Badge key={hobby.trim()} text={hobby.trim()} />
                                    ))}
                                </div>
                                <div className="text-xs text-gray-400 mb-1">PERSONALITY</div>
                                <div className="flex flex-wrap justify-center">
                                    {selectedCharacter.personality.split(",").map((trait) => (
                                        <Badge key={trait.trim()} text={trait.trim()} />
                                    ))}
                                </div>
                            </div>
                            <button
                                className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl font-bold text-lg transition-all"
                                onClick={() => setStep(0)}
                            >
                                Start Chat
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
                <button
                    className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[#23232b] text-gray-300 hover:bg-[#252525] transition-all disabled:opacity-40"
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    disabled={step === 0}
                >
                    <ChevronLeft className="w-5 h-5" /> Previous
                </button>
                {step < 5 && (
                    <button
                        className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-bold"
                        onClick={() => setStep((s) => Math.min(5, s + 1))}
                        disabled={!selectedCharacter}
                    >
                        Next <ChevronRight className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
}
