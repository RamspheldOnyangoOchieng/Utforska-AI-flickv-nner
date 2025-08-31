"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getPrivacyPolicy() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("documents")
        .select("content")
        .eq("name", "privacy_policy")
        .single();

    if (error) {
        console.error("Error fetching privacy policy:", error);
        return "";
    }

    return data.content;
}

export async function getTermsOfService() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("documents")
        .select("content")
        .eq("name", "terms_of_service")
        .single();

    if (error) {
        console.error("Error fetching terms of service:", error);
        return "";
    }

    return data.content;
}

export async function updatePrivacyPolicy(content: string) {
    const supabase = createClient();
    const { error } = await supabase
        .from("documents")
        .update({ content })
        .eq("name", "privacy_policy");

    if (error) {
        console.error("Error updating privacy policy:", error);
        return { error: "Failed to update privacy policy." };
    }

    revalidatePath("/privacy");
    revalidatePath("/admin/dashboard/documents");

    return { success: "Privacy policy updated successfully." };
}

export async function updateTermsOfService(content: string) {
    const supabase = createClient();
    const { error } = await supabase
        .from("documents")
        .update({ content })
        .eq("name", "terms_of_service");

    if (error) {
        console.error("Error updating terms of service:", error);
        return { error: "Failed to update terms of service." };
    }

    revalidatePath("/terms");
    revalidatePath("/admin/dashboard/documents");

    return { success: "Terms of service updated successfully." };
}