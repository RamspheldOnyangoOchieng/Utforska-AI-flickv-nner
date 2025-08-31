import { getPrivacyPolicy } from "@/app/actions/document-actions";

export default async function PrivacyPage() {
    const content = await getPrivacyPolicy();

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
            <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
    );
}