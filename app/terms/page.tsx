import { getTermsOfService } from "@/app/actions/document-actions";

export default async function TermsPage() {
    const content = await getTermsOfService();

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
            <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
    );
}