"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { updatePrivacyPolicy, updateTermsOfService } from "@/app/actions/document-actions";

interface DocumentFormProps {
    title: string;
    content: string;
    updateAction: "updatePrivacyPolicy" | "updateTermsOfService";
}

const actions = {
    updatePrivacyPolicy,
    updateTermsOfService,
};

export default function DocumentForm({ title, content, updateAction }: DocumentFormProps) {
    const [newContent, setNewContent] = useState(content);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const action = actions[updateAction];
        const result = await action(newContent);
        if (result.error) {
            setMessage(result.error);
        } else if (result.success) {
            setMessage(result.success);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-2">{title}</h2>
            <form onSubmit={handleSubmit}>
                <Textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    rows={20}
                    className="mb-4"
                />
                <Button type="submit">Update {title}</Button>
            </form>
            {message && <p className="mt-4">{message}</p>}
        </div>
    );
}