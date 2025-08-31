import { TranslationServiceClient } from "@google-cloud/translate"

// Initialize the Translation client with API key
const getTranslationClient = () => {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY

  if (!apiKey) {
    throw new Error("Google Translate API key is not defined")
  }

  return new TranslationServiceClient({
    credentials: { client_email: undefined, private_key: undefined },
    projectId: "ai-character-explorer",
    apiEndpoint: "translate.googleapis.com",
    auth: {
      apiKey,
    } as any,
  })
}

export async function translateText(text: string, targetLanguage = "sv"): Promise<string> {
  try {
    const client = getTranslationClient()

    const request = {
      parent: `projects/ai-character-explorer/locations/global`,
      contents: [text],
      mimeType: "text/plain",
      sourceLanguageCode: "en",
      targetLanguageCode: targetLanguage,
    }

    const [response] = await client.translateText(request)

    if (response.translations && response.translations.length > 0) {
      return response.translations[0].translatedText || text
    }

    return text
  } catch (error) {
    console.error("Translation error:", error)
    return text
  }
}
