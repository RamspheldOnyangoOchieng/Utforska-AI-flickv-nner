import { getPrivacyPolicy, getTermsOfService } from "@/app/actions/document-actions";
import DocumentForm from "./document-form";

export default async function DocumentsPage() {
    const privacyPolicy = await getPrivacyPolicy();
    const termsOfService = await getTermsOfService();

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Edit Documents</h1>
            <div className="space-y-8">
                <DocumentForm
                    title="Privacy Policy"
                    content={privacyPolicy}
                    updateAction="updatePrivacyPolicy"
                />
                <DocumentForm
                    title="Terms of Service"
                    content={termsOfService}
                    updateAction="updateTermsOfService"
                />
            </div>
        </div>
    );
}