export type TranslationKey =
  | "general.siteName"
  | "general.welcome"
  | "general.save"
  | "general.cancel"
  | "general.loading"
  | "general.error"
  | "general.success"
  | "general.home"
  | "general.explore"
  | "general.generate"
  | "general.create"
  | "general.chat"
  | "general.collection"
  | "auth.welcomeBack"
  | "general.premium"
  | "general.aiCharacters"
  | "general.admin"
  | "general.user"
  | "auth.login"
  | "auth.logout"
  | "auth.createAccount"
  | "auth.greeting"
  | "home.exploreCharacters"
  | "home.companion.title"
  | "home.companion.p1"
  | "home.companion.p2"
  | "home.companion.p3"
  | "home.companion.p4"
  | "home.companion.p5"
  | "home.companion.p6"
  | "home.companion.p7"
  | "home.companion.p8"
  | "admin.settings"
  | "admin.language"
  | "admin.languageDescription"
  | "admin.selectLanguage"
  | "admin.english"
  | "admin.swedish"
  | "admin.stripeIntegration"
  | "admin.stripeDescription"
  | "admin.stripeSecretKey"
  | "admin.stripeSecretKeyDescription"
  | "admin.stripeWebhookSecret"
  | "admin.stripeWebhookSecretDescription"
  | "admin.saveSettings"
  | "admin.settingsSaved"
  | "admin.settingsError"
  | "admin.languageNote"
  | "generate.title"
  | "generate.promptPlaceholder"
  | "generate.paste"
  | "generate.showNegativePrompt"
  | "generate.hideNegativePrompt"
  | "generate.negativePromptLabel"
  | "generate.negativePromptPlaceholder"
  | "generate.suggestions"
  | "generate.numberOfImages"
  | "generate.generateImage"
  | "generate.premium"
  | "generate.generateButton"
  | "generate.generating"
  | "generate.viewCollection"
  | "generate.generatedImages"
  | "generate.downloadAll"
  | "generate.collection"
  | "generate.noImagesYet"
  | "generate.noImagesDescription"
  | "generate.savingImages"
  | "generate.download"
  | "generate.share"
  | "generate.image"
  | "generate.saved"
  | "generate.freeTrial"
  | "generate.promptRequired"
  | "generate.promptRequiredDescription"
  | "generate.loginRequired"
  | "generate.loginRequiredDescription"
  | "generate.downloadFailed"
  | "generate.downloadFailedDescription"
  | "generate.imageSaved"
  | "generate.imageSavedDescription"
  | "generate.allImagesSaved"
  | "generate.allImagesSavedDescription"
  | "generate.copiedToClipboard"
  | "generate.pastedFromClipboard"
  | "generate.imageUrlCopied"
  | "generate.noSuggestionCategories"
  | "chat.chats"
  | "chat.viewConversationHistory"
  | "chat.createCharacter"
  | "chat.allCharacters"
  | "chat.viewAll"
  | "chat.loadingCharacters"
  | "chat.noConversationsYet"
  | "chat.startChattingMessage"
  | "chat.browseCharacters"
  | "chat.recentConversations"
  | "chat.noMessagesYet"
  | "chat.inputPlaceholder"
  | "chat.ask"
  | "chat.showMe"
  | "chat.sendMe"
  | "chat.canISee"
  | "chat.howToUse"
  | "chat.viewVideoIntro"
  | "chat.noVideoAvailable"
  | "collection.yourImageCollection"
  | "collection.noImagesYet"
  | "collection.noImagesDescription"
  | "collection.refresh"
  | "collection.collections"
  | "collection.generateNewImages"
  | "collection.generateImages"
  | "collection.addToCollection"
  | "collection.delete"
  | "collection.removeFromFavorites"
  | "collection.addToFavorites"
  | "collection.download"
  | "collection.collectionRefreshed"
  | "collection.collectionUpdated"
  | "collection.createCollection"
  | "collection.newCollection"
  | "collection.cancel"
  | "collection.createNewCollection"
  | "collection.name"
  | "collection.description"
  | "collection.descriptionOptional"
  | "collection.myCollection"
  | "collection.collectionDescription"
  | "collection.noCollectionsYet"
  | "login.logIn"
  | "login.signUp"
  | "login.loginToContinue"
  | "login.submitting"
  | "login.orLoginWith"
  | "login.forgotPassword"
  | "signup.createAccount"
  | "signup.joinCommunity"
  | "signup.username"
  | "signup.email"
  | "signup.password"
  | "signup.confirmPassword"
  | "signup.createAccountButton"
  | "signup.alreadyHaveAccount"
  | "signup.haveAccount"
  | "signup.allFieldsRequired"
  | "signup.passwordsDoNotMatch"
  | "signup.passwordMinLength"
  | "signup.passwordHint"
  | "signup.emailInUse"
  | "signup.errorOccurred"
  | "signup.creatingAccount"
  | "signup.submitting"
  | "signup.orContinueWith"
  | "login.invalidCredentials"
  | "login.loginError"
  | "login.emailLabel"
  | "login.emailPlaceholder"
  | "login.passwordLabel"
  | "login.passwordPlaceholder"
  | "login.noAccount"
  | "reset.title"
  | "reset.emailLabel"
  | "reset.emailRequired"
  | "reset.emailPlaceholder"
  | "reset.sendLink"
  | "reset.sending"
  | "reset.linkSentTitle"
  | "reset.linkSentDescription"
  | "reset.errorGeneric"
  | "reset.newPasswordLabel"
  | "reset.newPasswordPlaceholder"
  | "reset.updatePassword"
  | "reset.updating"
  | "reset.updatedTitle"
  | "reset.updatedDescription"
  | "reset.invalidEmail"
  | "reset.missingConfig"
  | "chat.aboutMe"
  | "profile.age"
  | "profile.body"
  | "profile.ethnicity"
  | "profile.language"
  | "profile.relationship"
  | "profile.occupation"
  | "profile.hobbies"
  | "profile.personality"
  | "chat.searchForProfile"
  | "generate.generate"
  | "general.features"
  | "general.popular"
  | "general.legal"
  | "premium.chooseYourPlan"
  | "premium.anonymousDisclaimer"
  | "premium.cancelAnytime"
  | "premium.springSale"
  | "premium.forNewUsers"
  | "premium.discountEnds"
  | "premium.dontMissOut"
  | "premium.selectedPlan"
  | "premium.benefits"
  | "premium.payWithCard"
  | "premium.processing"
  | "premium.alreadyPremium"
  | "premium.monthlyPayment"
  | "premium.oneTimePayment"
  | "premium.of"
  | "premium.securityBadges"
  | "premium.antivirusSecured"
  | "premium.privacyInStatement"
  | "premium.noAdultTransaction"
  | "premium.noHiddenFees"
  | "premium.month"
  | "premium.months"
  | "premium.year"
  | "premium.was"
  | "chat.clearHistory"
  | "chat.clearConfirmation"
  | "chat.clearing"
  | "chat.clearButton"
  | "chat.cancelButton"
  | "admin.seo"
  | "admin.seoSettings"
  | "admin.seoGlobalSettings"
  | "admin.seoPageSettings"
  | "admin.seoSiteName"
  | "admin.seoTitleTemplate"
  | "admin.seoDescription"
  | "admin.seoKeywords"
  | "admin.seoOgImage"
  | "admin.seoTwitterHandle"
  | "admin.seoPageTitle"
  | "admin.seoPageDescription"
  | "admin.seoPageKeywords"
  | "admin.seoPageOgImage"
  | "admin.seoSaveSuccess"
  | "admin.seoSaveError"
  | "profile.title"
  | "profile.accountInfo"
  | "profile.accountInfoDesc"
  | "profile.username"
  | "profile.email"
  | "profile.accountCreated"
  | "profile.accountType"
  | "profile.admin"
  | "profile.user"
  | "profile.subscriptionStatus"
  | "profile.subscriptionStatusDesc"
  | "profile.premiumActive"
  | "profile.premiumActiveDesc"
  | "profile.notPremium"
  | "profile.notPremiumDesc"
  | "profile.expiryDate"
  | "profile.upgradeToPremium"
  | "profile.changePassword"
  | "profile.changePasswordDesc"
  | "profile.currentPassword"
  | "profile.newPassword"
  | "profile.confirmPassword"
  | "profile.passwordRequirements"
  | "profile.changing"
  | "profile.passwordChanged"
  | "profile.passwordsDoNotMatch"
  | "profile.passwordTooShort"
  | "profile.errorChangingPassword"
  | "profile.errorCheckingStatus"
  | "sidebar.toggleSidebar"
  | "sidebar.userMenu"
  | "sidebar.profile"
  | "sidebar.navigation"
  | "premium.addTokens"
  | "legal.privacyNotice"
  | "legal.termsOfService"
  | "Calling..."
  | "Call me"
  | "+1 (555) 123-4567"
  | "Enter your phone number with country code (e.g., +1 for US)"
  | "Enter your phone number"
  | "Phone number required"
  | "Please enter a valid phone number"
  | "Call failed"
  | "Failed to initiate call"
  | "Call initiated!"
  | "Character will call you shortly"
  | "Initiating call..."
  | "Calling"
  | "Calling character..."
  | "imageGeneration.title"
  | "imageGeneration.describePrompt"
  | "imageGeneration.promptPlaceholder"
  | "imageGeneration.generating"
  | "imageGeneration.generatingMessage"
  | "imageGeneration.emptyStateTitle"
  | "imageGeneration.emptyStateMessage"
  | "imageGeneration.generateWith"
  | "imageGeneration.generateButton"
  | "imageGeneration.cancelButton"
  | "home.exploreAIGirlfriends"
  | "general.aiGirlfriends"
  | "footer.companyDescription"
  | "footer.contact"
  | "footer.features.createImage"
  | "footer.features.chat"
  | "footer.features.createCharacter"
  | "footer.features.gallery"
  | "footer.features.explore"
  | "footer.about.title"
  | "footer.company.title"
  | "footer.legal.termsPolicies"
  | "footer.about.aiGirlfriendChat"
  | "footer.about.aiSexting"
  | "footer.about.howItWorks"
  | "footer.about.aboutUs"
  | "footer.about.roadmap"
  | "footer.about.blog"
  | "footer.about.guide"
  | "footer.about.complaints"
  | "footer.about.termsPolicies"
  | "footer.company.weAreHiring"
  | "footer.editFooter"
  | "footer.addItem"
  | "footer.rightsReserved"
  | "footer.resetDefaults"

export type Translations = {
  [key in TranslationKey]: string
}

export const translations: Record<"en" | "sv", Translations> = {
  en: {
    "general.siteName": "AI Character Explorer",
    "general.welcome": "Welcome",
    "general.home": "Home",
    "general.legal": "Legal",
    "general.features": "Features",
    "general.popular": "Popular",
    "chat.searchForProfile": "Search",
    "profile.personality": "Personality",
    "profile.hobbies": "Hobbies",
    "profile.occupation": "Occupation",
    "profile.relationship": "Relationship",
    "profile.language": "Language",
    "profile.ethnicity": "Ethnicity",
    "generate.generate": "Generate Image",
    "generate.generateImage": "Generate Image",
    "auth.welcomeBack": "Welcome Back",
    "login.loginToContinue": "Login to continue",
    "general.save": "Save",
    "general.cancel": "Cancel",
    "general.loading": "Loading...",
    "general.error": "An error occurred",
    "general.success": "Success",
    "general.explore": "Explore",
    "general.generate": "Generate",
    "general.create": "Create",
    "general.chat": "Chat",
    "general.collection": "Collection",
    "general.premium": "Premium",
    "general.aiCharacters": "AI Characters",
    "general.admin": "Admin",
    "general.user": "User",
    "auth.login": "Login",
  "auth.logout": "Logout",
  "auth.createAccount": "Create Free Account",
    "auth.greeting": "Hi",
    "home.exploreCharacters": "Explore AI Characters",
  "home.companion.title": "AI Companion Experience with DINTYP.SE",
  "home.companion.p1": "Step into a new kind of connection with DINTYP.SE – your gateway to personal, emotionally intelligent AI companions.",
  "home.companion.p2": "Looking for an anime companion, an AI girlfriend to chat with, or maybe a caring AI boyfriend? DINTYP.SE makes it easy to create, personalize, and evolve your ideal match using modern AI.",
  "home.companion.p3": "We don't just offer chatbots. We offer deeply customizable AI experiences shaped to your wishes: realistic voice, image generation, and playful videos.",
  "home.companion.p4": "Your AI companion remembers your preferences and adapts over time. Whether you want a deep relationship or spontaneous encounters, you’re always in control.",
  "home.companion.p5": "Yes—your companion can send selfies, generate custom videos, or respond with voice. Ask for specific outfits, unique poses, or playful scenarios.",
  "home.companion.p6": "Privacy is a top priority. Conversations are encrypted and optional two-factor authentication keeps your account secure.",
  "home.companion.p7": "Curious what an AI companion is? Think of a digital partner who can talk, react, flirt, and connect in real time.",
  "home.companion.p8": "Whether you want casual company or something more romantic, DINTYP.SE adapts to your pace from first message to goodnight.",
    "admin.settings": "Admin Settings",
    "admin.language": "Language",
    "admin.languageDescription": "Set the default language for the application",
    "admin.selectLanguage": "Select language",
    "admin.english": "English",
    "admin.swedish": "Swedish",
    "admin.stripeIntegration": "Stripe Integration",
    "admin.stripeDescription": "Configure your Stripe API keys for payment processing",
    "admin.stripeSecretKey": "Stripe Secret Key",
    "admin.stripeSecretKeyDescription": "Your Stripe secret key. Never share this key publicly.",
    "admin.stripeWebhookSecret": "Stripe Webhook Secret",
    "admin.stripeWebhookSecretDescription": "Your Stripe webhook secret for verifying webhook events.",
    "admin.saveSettings": "Save Settings",
    "admin.settingsSaved": "Settings saved successfully",
    "admin.settingsError": "Failed to save settings",
    "admin.languageNote":
      "This setting translates the entire web site interface for all users. Changes take effect immediately.",
    "generate.title": "Generate Image",
    "generate.promptPlaceholder": "Describe the image you want to generate...",
    "generate.paste": "Paste",
    "generate.showNegativePrompt": "Show Negative Prompt",
    "generate.hideNegativePrompt": "Hide Negative Prompt",
    "generate.negativePromptLabel": "Negative Prompt (what to avoid in the image)",
    "generate.negativePromptPlaceholder": "Elements to exclude from the image...",
    "generate.suggestions": "Suggestions",
    "generate.numberOfImages": "Number of Images",
    "generate.premium": "Premium",
    "generate.generateButton": "Generate Image",
    "generate.generating": "Generating...",
    "generate.viewCollection": "View Your Collection",
    "generate.generatedImages": "Generated Images",
    "generate.downloadAll": "Download All",
    "generate.collection": "Collection",
    "generate.noImagesYet": "No Images Generated Yet",
    "generate.noImagesDescription":
      "Enter a prompt and click the Generate button to create AI-generated images based on your description.",
    "generate.savingImages": "Saving images to your collection...",
    "generate.download": "Download",
    "generate.share": "Share",
    "generate.image": "Image",
    "generate.saved": "Saved",
    "generate.freeTrial": "Free Trial",
    "generate.promptRequired": "Prompt required",
    "generate.promptRequiredDescription": "Please enter a description for the image you want to generate.",
    "generate.loginRequired": "Login required",
    "generate.loginRequiredDescription": "Please log in to generate and save images",
    "generate.downloadFailed": "Download failed",
    "generate.downloadFailedDescription": "Failed to download the image. Please try again.",
    "generate.imageSaved": "Success",
    "generate.imageSavedDescription": "Image saved to your collection",
    "generate.allImagesSaved": "Images saved",
    "generate.allImagesSavedDescription": "All images have been saved to your collection.",
    "generate.copiedToClipboard": "Copied to clipboard",
    "generate.pastedFromClipboard": "Pasted from clipboard",
    "generate.imageUrlCopied": "Image URL copied to clipboard",
  "generate.noSuggestionCategories": "No suggestion categories available.",
    "chat.chats": "Chats",
    "chat.viewConversationHistory": "View your conversation history with characters.",
    "chat.createCharacter": "Create Character",
    "chat.allCharacters": "All Characters",
    "chat.viewAll": "View all",
    "chat.loadingCharacters": "Loading characters...",
    "chat.noConversationsYet": "No conversations yet",
    "chat.startChattingMessage": "Start chatting with a character to see your conversation history here.",
    "chat.browseCharacters": "Browse Characters",
    "chat.recentConversations": "Recent Conversations",
    "chat.noMessagesYet": "No messages yet",
  "chat.inputPlaceholder": "Write a message...",
  "chat.ask": "Ask",
  "chat.showMe": "Show me...",
  "chat.sendMe": "Send me...",
  "chat.canISee": "Can I see...",
  "chat.howToUse": "How to Use",
  "chat.viewVideoIntro": "View video introduction",
  "chat.noVideoAvailable": "No video available",
    "collection.yourImageCollection": "Your Image Collection",
    "collection.noImagesYet": "No images saved yet",
    "collection.noImagesDescription": "Generate some images and save them to see them here!",
    "collection.refresh": "Refresh",
    "collection.collections": "Collections",
    "collection.generateNewImages": "Generate New Images",
    "collection.generateImages": "Generate Images",
    "collection.addToCollection": "Add to Collection",
    "collection.delete": "Delete",
    "collection.removeFromFavorites": "Remove from Favorites",
    "collection.addToFavorites": "Add to Favorites",
    "collection.download": "Download",
    "collection.collectionRefreshed": "Collection refreshed",
    "collection.collectionUpdated": "Your image collection has been updated.",
    "collection.createCollection": "Create Collection",
    "collection.newCollection": "New Collection",
    "collection.cancel": "Cancel",
    "collection.createNewCollection": "Create New Collection",
    "collection.name": "Name",
    "collection.description": "Description",
    "collection.descriptionOptional": "Description (optional)",
  "collection.myCollection": "My Collection",
  "collection.collectionDescription": "A collection of my favorite images",
  "collection.noCollectionsYet": "You don't have any collections yet.",
    "login.logIn": "Log In",
    "login.signUp": "Sign Up",
  "login.submitting": "Logging in...",
  "login.orLoginWith": "Or log in with",
  "login.forgotPassword": "Forgot password?",
    "signup.createAccount": "Create an Account",
    "signup.joinCommunity": "Join our community and start chatting with AI characters",
    "signup.username": "Username",
    "signup.email": "Email",
    "profile.age": "Age",
    "chat.aboutMe": "About me",
    "signup.password": "Password",
    "signup.confirmPassword": "Confirm Password",
    "signup.createAccountButton": "Sign Up",
    "signup.alreadyHaveAccount": "Already have an account?",
  "signup.haveAccount": "Already have an account?",
    "signup.allFieldsRequired": "All fields are required",
    "signup.passwordsDoNotMatch": "Passwords do not match",
    "signup.passwordMinLength": "Password must be at least 6 characters",
  "signup.passwordHint": "At least 6 characters",
    "signup.emailInUse": "Email already in use",
    "signup.errorOccurred": "An error occurred during signup",
    "signup.creatingAccount": "Creating Account...",
  "signup.submitting": "Creating account...",
  "signup.orContinueWith": "or continue with",
    "login.invalidCredentials": "Invalid email or password",
    "login.loginError": "An error occurred during login",
    "login.emailLabel": "Email",
    "profile.body": "Body",
    "login.emailPlaceholder": "john@example.com",
    "login.passwordLabel": "Password",
    "login.passwordPlaceholder": "••••••••",
    "login.noAccount": "Don't have an account? ",
  "reset.title": "Reset your password",
  "reset.emailLabel": "Email",
  "reset.emailPlaceholder": "your@email.com",
  "reset.emailRequired": "Email is required",
  "reset.sendLink": "Send reset link",
  "reset.sending": "Sending...",
  "reset.linkSentTitle": "Reset link sent",
  "reset.linkSentDescription": "Check your inbox for a link to reset your password.",
  "reset.errorGeneric": "Something went wrong. Please try again.",
  "reset.newPasswordLabel": "New password",
  "reset.newPasswordPlaceholder": "••••••••",
  "reset.updatePassword": "Update password",
  "reset.updating": "Updating...",
  "reset.updatedTitle": "Password updated",
  "reset.updatedDescription": "Your password has been updated. Redirecting...",
  "reset.invalidEmail": "Please enter a valid email address",
  "reset.missingConfig": "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    "premium.chooseYourPlan": "Choose your Plan",
    "premium.anonymousDisclaimer": "100% anonymous. You can cancel anytime.",
    "premium.cancelAnytime": "Cancel subscription at any time",
    "premium.springSale": "Spring Sale",
    "premium.forNewUsers": "for New Users",
    "premium.discountEnds": "Discount ends soon.",
    "premium.dontMissOut": "Don't miss out!",
    "premium.selectedPlan": "Selected Plan",
    "premium.benefits": "Premium Benefits",
    "premium.payWithCard": "Pay with Credit / Debit Card",
    "premium.processing": "Processing...",
    "premium.alreadyPremium": "Already Premium",
    "premium.monthlyPayment": "Monthly payment of",
    "premium.oneTimePayment": "One-time payment of",
    "premium.of": "of",
    "premium.securityBadges": "Security badges",
    "premium.antivirusSecured": "Antivirus Secured",
    "premium.privacyInStatement": "Privacy in bank statement",
    "premium.noAdultTransaction": "No adult transaction in your bank statement",
    "premium.noHiddenFees": "No hidden fees • Cancel subscription at any time",
    "premium.month": "month",
    "premium.months": "months",
    "premium.year": "year",
    "premium.was": "Was",
    "chat.clearHistory": "Clear chat history",
    "chat.clearConfirmation": "Are you sure you want to clear your chat history? This action cannot be undone.",
    "chat.clearing": "Clearing...",
    "chat.clearButton": "Clear history",
    "chat.cancelButton": "Cancel",
    "admin.seo": "SEO",
    "admin.seoSettings": "SEO Settings",
    "admin.seoGlobalSettings": "Global SEO Settings",
    "admin.seoPageSettings": "Page SEO Settings",
    "admin.seoSiteName": "Site Name",
    "admin.seoTitleTemplate": "Title Template",
    "admin.seoDescription": "Description",
    "admin.seoKeywords": "Keywords",
    "admin.seoOgImage": "Open Graph Image",
    "admin.seoTwitterHandle": "Twitter Handle",
    "admin.seoPageTitle": "Page Title",
    "admin.seoPageDescription": "Page Description",
    "admin.seoPageKeywords": "Page Keywords",
    "admin.seoPageOgImage": "Page Open Graph Image",
    "admin.seoSaveSuccess": "SEO settings saved successfully",
    "admin.seoSaveError": "Failed to save SEO settings",
    "profile.title": "My Profile",
    "profile.accountInfo": "Account Information",
    "profile.accountInfoDesc": "Your personal account details",
    "profile.username": "Username",
    "profile.email": "Email",
    "profile.accountCreated": "Account Created",
    "profile.accountType": "Account Type",
    "profile.admin": "Administrator",
    "profile.user": "User",
    "profile.subscriptionStatus": "Subscription Status",
    "profile.subscriptionStatusDesc": "Your current subscription plan and status",
    "profile.premiumActive": "Premium Active",
    "profile.premiumActiveDesc": "You have access to all premium features",
    "profile.notPremium": "No Premium Subscription",
    "profile.notPremiumDesc": "Upgrade to premium to access all features",
    "profile.expiryDate": "Expiry Date",
    "profile.upgradeToPremium": "Upgrade to Premium",
    "profile.changePassword": "Change Password",
    "profile.changePasswordDesc": "Update your password to keep your account secure",
    "profile.currentPassword": "Current Password",
    "profile.newPassword": "New Password",
    "profile.confirmPassword": "Confirm New Password",
    "profile.passwordRequirements": "Password must be at least 8 characters long",
    "profile.changing": "Changing...",
    "profile.passwordChanged": "Password changed successfully",
    "profile.passwordsDoNotMatch": "New passwords do not match",
    "profile.passwordTooShort": "Password must be at least 8 characters long",
    "profile.errorChangingPassword": "Error changing password",
    "profile.errorCheckingStatus": "Error checking premium status",
    "sidebar.toggleSidebar": "Toggle sidebar",
    "sidebar.userMenu": "User menu",
    "sidebar.profile": "Profile",
    "sidebar.navigation": "Navigation",
  "premium.addTokens": "Add Tokens",
  "legal.privacyNotice": "Privacy Notice",
  "legal.termsOfService": "Terms of Service",
    "Calling...": "Calling...",
    "Call me": "Call me",
    "+1 (555) 123-4567": "+1 (555) 123-4567",
    "Enter your phone number with country code (e.g., +1 for US)":
      "Enter your phone number with country code (e.g., +1 for US)",
    "Enter your phone number": "Enter your phone number",
    "Phone number required": "Phone number required",
    "Please enter a valid phone number": "Please enter a valid phone number",
    "Call failed": "Call failed",
    "Failed to initiate call": "Failed to initiate call",
    "Call initiated!": "Call initiated!",
    "Character will call you shortly": "{{name}} will call you shortly at {{phoneNumber}}",
    "Initiating call...": "Initiating call...",
    "Calling": "Calling",
    "Calling character...": "Calling {{name}}...",
    "imageGeneration.title": "Generate an image",
    "imageGeneration.generateWith": "Generate an image with {{name}}",
    "imageGeneration.describePrompt": "Describe what you want to see",
    "imageGeneration.promptPlaceholder": "Describe the image you want to generate...",
    "imageGeneration.generating": "Generating...",
    "imageGeneration.generatingMessage": "Generating your image...",
    "imageGeneration.emptyStateTitle": "Your generated image will appear here",
    "imageGeneration.emptyStateMessage": "Enter a prompt and click Generate to create an image",
    "imageGeneration.generateButton": "Generate Image",
    "imageGeneration.cancelButton": "Cancel",
    "home.exploreAIGirlfriends": "Explore AI Girlfriends",
    "general.aiGirlfriends": "AI Girlfriends",
  "footer.companyDescription": "AI Character Explorer delivers immersive experiences with AI companions that feel real, allowing users to generate images and chat.",
  "footer.contact": "Contact",
  "footer.features.createImage": "Create Image",
  "footer.features.chat": "Chat",
  "footer.features.createCharacter": "Create Character",
  "footer.features.gallery": "Gallery",
  "footer.features.explore": "Explore",
  "footer.about.title": "About us",
  "footer.company.title": "Company",
  "footer.legal.termsPolicies": "Terms and Policies",
  "footer.about.aiGirlfriendChat": "AI-flickvänschatt",
  "footer.about.aiSexting": "AI-sexting",
  "footer.about.howItWorks": "How it works",
  "footer.about.aboutUs": "About Us",
  "footer.about.roadmap": "Roadmap",
  "footer.about.blog": "Blog",
  "footer.about.guide": "Guide",
  "footer.about.complaints": "Complaints & Content Removal",
  "footer.about.termsPolicies": "Terms and Policies",
  "footer.company.weAreHiring": "We're hiring",
  "footer.editFooter": "Edit Footer",
  "footer.addItem": "Add Item",
  "footer.rightsReserved": "All rights reserved",
  "footer.resetDefaults": "Reset to defaults",
  },
  sv: {
    "general.siteName": "AI Karaktärsutforskare",
    "general.welcome": "Välkommen",
    "profile.age": "Åldras",
    "general.legal": "Rättslig",
    "general.features": "AI-flickvänner",
    "general.popular": "Populär",
    "profile.hobbies": "Hobbyer",
    "profile.body": "Kropp",
    "profile.relationship": "Relation",
    "profile.language": "Språk",
    "chat.searchForProfile": "söka",
    "chat.aboutMe": "Om mig",
    "profile.personality": "Personlighet",
    "profile.occupation": "Ockupation",
    "profile.ethnicity": "Etnicitet",
    "auth.welcomeBack": "välkommen tillbaka",
    "general.save": "Spara",
    "general.collection": "samling",
    "generate.generate": "Skapa bild",
    "generate.generateImage": "Skapa bild",
    "general.cancel": "Avbryt",
    "general.home": "Hem",
    "general.loading": "Laddar...",
    "general.error": "Ett fel inträffade",
    "general.success": "Framgång",
    "general.explore": "Utforska",
    "general.generate": "Generera",
    "general.create": "Skapa",
    "general.chat": "Chatta",
    "general.premium": "Premium",
    "general.aiCharacters": "AI-karaktärer",
    "general.admin": "Administratör",
    "general.user": "Användare",
    "auth.login": "Logga in",
  "auth.logout": "Logga ut",
  "auth.createAccount": "Skapa konto",
    "auth.greeting": "Hej",
    "home.exploreCharacters": "Utforska AI-karaktärer",
  "home.companion.title": "AI-kompanjonsupplevelse med DINTYP.SE",
  "home.companion.p1": "Kliv in i en ny typ av kontakt med DINTYP.SE – din port till personliga och emotionellt intelligenta AI-kompanjoner.",
  "home.companion.p2": "Letar du efter en anime-kompanjon, en AI-flickvän att chatta med eller kanske en omtänksam AI-pojkvän? DINTYP.SE gör det enkelt att skapa, anpassa och utveckla din ideala matchning.",
  "home.companion.p3": "Vi erbjuder inte bara chatbots – vi erbjuder djupt anpassningsbara AI-upplevelser med röst, bildgenerering och lekfulla videor.",
  "home.companion.p4": "Din AI-kompanjon minns dina preferenser och anpassar sig med tiden. Oavsett om du vill ha något djupt eller spontant har du alltid kontrollen.",
  "home.companion.p5": "Ja – din kompanjon kan skicka selfies, generera skräddarsydda videor eller svara med röst. Be om outfits, poser eller scenarier.",
  "home.companion.p6": "Integritet är högsta prioritet. Samtal krypteras och du kan aktivera tvåfaktorsautentisering för extra säkerhet.",
  "home.companion.p7": "Nyfiken på AI-kompanjoner? Tänk dig en digital partner som kan prata, reagera, flirta och knyta an i realtid.",
  "home.companion.p8": "Oavsett om du söker sällskap eller något romantiskt anpassar sig DINTYP.SE efter ditt tempo – från första meddelandet till godnatt.",
    "admin.settings": "Administratörsinställningar",
    "admin.language": "Språk",
    "admin.languageDescription": "Ställ in standardspråk för applikationen",
    "admin.selectLanguage": "Välj språk",
    "admin.english": "Engelska",
    "admin.swedish": "Svenska",
    "admin.stripeIntegration": "Stripe Integration",
    "admin.stripeDescription": "Konfigurera dina Stripe API-nycklar för betalningsbehandling",
    "admin.stripeSecretKey": "Stripe Hemlig Nyckel",
    "admin.stripeSecretKeyDescription": "Din hemliga Stripe-nyckel. Dela aldrig denna nyckel offentligt.",
    "admin.stripeWebhookSecret": "Stripe Webhook Hemlighet",
    "admin.stripeWebhookSecretDescription": "Din Stripe webhook-hemlighet för att verifiera webhook-händelser.",
    "admin.saveSettings": "Spara Inställningar",
    "admin.settingsSaved": "Inställningar sparades framgångsrikt",
    "admin.settingsError": "Det gick inte att spara inställningarna",
    "admin.languageNote":
      "Denna inställning översätter hela webbplatsens gränssnitt för alla användare. Ändringar träder i kraft omedelbart.",
    "generate.title": "Generera Bild",
    "generate.promptPlaceholder": "Beskriv bilden du vill generera...",
    "generate.paste": "Klistra in",
    "generate.showNegativePrompt": "Visa Negativ Prompt",
    "generate.hideNegativePrompt": "Dölj Negativ Prompt",
    "generate.negativePromptLabel": "Negativ Prompt (vad som ska undvikas i bilden)",
    "generate.negativePromptPlaceholder": "Element att utesluta från bilden...",
    "generate.suggestions": "Förslag",
    "generate.numberOfImages": "Antal Bilder",
    "generate.premium": "Premium",
    "generate.generateButton": "Generera Bild",
    "generate.generating": "Genererar...",
    "generate.viewCollection": "Visa Din Samling",
    "generate.generatedImages": "Genererade Bilder",
    "generate.downloadAll": "Ladda Ner Alla",
    "generate.collection": "Samling",
    "generate.noImagesYet": "Inga Bilder Genererade Än",
    "generate.noImagesDescription":
      "Ange en prompt och klicka på Generera-knappen för att skapa AI-genererade bilder baserat på din beskrivning.",
    "generate.savingImages": "Sparar bilder till din samling...",
    "generate.download": "Ladda Ner",
    "generate.share": "Dela",
    "generate.image": "Bild",
    "generate.saved": "Sparad",
    "generate.freeTrial": "Gratis Provperiod",
    "generate.promptRequired": "Prompt krävs",
    "generate.promptRequiredDescription": "Vänligen ange en beskrivning för bilden du vill generera.",
    "generate.loginRequired": "Inloggning krävs",
    "generate.loginRequiredDescription": "Vänligen logga in för att generera och spara bilder",
    "generate.downloadFailed": "Nedladdning misslyckades",
    "generate.downloadFailedDescription": "Det gick inte att ladda ner bilden. Försök igen.",
    "generate.imageSaved": "Framgång",
    "generate.imageSavedDescription": "Bild sparad till din samling",
    "generate.allImagesSaved": "Bilder sparade",
    "generate.allImagesSavedDescription": "Alla bilder har sparats till din samling.",
    "generate.copiedToClipboard": "Kopierad till urklipp",
    "generate.pastedFromClipboard": "Klistrat in från urklipp",
    "generate.imageUrlCopied": "Bild-URL kopierad till urklipp",
  "generate.noSuggestionCategories": "Inga förslag finns tillgängliga.",
    "chat.chats": "Chattar",
    "chat.viewConversationHistory": "Visa din konversationshistorik med karaktärer.",
    "chat.createCharacter": "Skapa Karaktär",
    "chat.allCharacters": "Alla Karaktärer",
    "chat.viewAll": "Visa alla",
    "chat.loadingCharacters": "Laddar karaktärer...",
    "chat.noConversationsYet": "Inga konversationer än",
    "chat.startChattingMessage": "Börja chatta med en karaktär för att se din konversationshistorik här.",
    "chat.browseCharacters": "Bläddra bland karaktärer",
    "chat.recentConversations": "Senaste konversationer",
    "chat.noMessagesYet": "Inga meddelanden än",
  "chat.inputPlaceholder": "Skriv ett meddelande...",
  "chat.ask": "Fråga",
  "chat.showMe": "Visa mig...",
  "chat.sendMe": "Skicka mig...",
  "chat.canISee": "Kan jag se...",
  "chat.howToUse": "Hur man använder",
  "chat.viewVideoIntro": "Visa videointroduktion",
  "chat.noVideoAvailable": "Ingen video tillgänglig",
    "collection.yourImageCollection": "Din bildsamling",
    "collection.noImagesYet": "Inga bilder sparade än",
    "collection.noImagesDescription": "Generera några bilder och spara dem för att se dem här!",
    "collection.refresh": "Uppdatera",
    "collection.collections": "Samlingar",
    "collection.generateNewImages": "Generera nya bilder",
    "collection.generateImages": "Generera bilder",
    "collection.addToCollection": "Lägg till i samling",
    "collection.delete": "Ta bort",
    "collection.removeFromFavorites": "Ta bort från favoriter",
    "collection.addToFavorites": "Lägg till i favoriter",
    "collection.download": "Ladda ner",
    "collection.collectionRefreshed": "Samling uppdaterad",
    "collection.collectionUpdated": "Din bildsamling har uppdaterats.",
    "collection.createCollection": "Skapa samling",
    "collection.newCollection": "Ny samling",
    "collection.cancel": "Avbryt",
    "collection.createNewCollection": "Skapa ny samling",
    "collection.name": "Namn",
    "collection.description": "Beskrivning",
    "collection.descriptionOptional": "Beskrivning (valfritt)",
  "collection.myCollection": "Min samling",
  "collection.collectionDescription": "En samling av mina favoritbilder",
  "collection.noCollectionsYet": "Du har inga samlingar än.",
    "login.logIn": "Logga in",
    "login.signUp": "Registrera dig",
  "login.submitting": "Loggar in...",
  "login.orLoginWith": "eller logga in med",
  "login.forgotPassword": "Glömt lösenord?",
    "login.loginToContinue": "logga in för att fortsätta",
    "signup.createAccount": "Skapa ett konto",
    "signup.joinCommunity": "Gå med i vår gemenskap och börja chatta med AI-karaktärer",
    "signup.username": "Användarnamn",
    "signup.email": "E-post",
    "signup.password": "Lösenord",
    "signup.confirmPassword": "Bekräfta lösenord",
    "signup.createAccountButton": "Registrera dig",
    "signup.alreadyHaveAccount": "Har du redan ett konto?",
  "signup.haveAccount": "Har du redan ett konto?",
    "signup.allFieldsRequired": "Alla fält är obligatoriska",
    "signup.passwordsDoNotMatch": "Lösenorden matchar inte",
    "signup.passwordMinLength": "Lösenordet måste vara minst 6 tecken",
  "signup.passwordHint": "Minst 6 tecken",
    "signup.emailInUse": "E-postadressen används redan",
    "signup.errorOccurred": "Ett fel inträffade vid registreringen",
    "signup.creatingAccount": "Skapar konto...",
  "signup.submitting": "Skapar konto...",
  "signup.orContinueWith": "eller fortsätt med",
    "login.invalidCredentials": "Ogiltig e-post eller lösenord",
    "login.loginError": "Ett fel inträffade vid inloggningen",
    "login.emailLabel": "E-post",
    "login.emailPlaceholder": "john@example.com",
    "login.passwordLabel": "Lösenord",
    "login.passwordPlaceholder": "••••••••",
    "login.noAccount": "Har du inget konto? ",
  "reset.title": "Återställ ditt lösenord",
  "reset.emailLabel": "E-post",
  "reset.emailPlaceholder": "din@epost.se",
  "reset.emailRequired": "E-post krävs",
  "reset.sendLink": "Skicka återställningslänk",
  "reset.sending": "Skickar...",
  "reset.linkSentTitle": "Återställningslänk skickad",
  "reset.linkSentDescription": "Kontrollera din inkorg för en länk för att återställa lösenordet.",
  "reset.errorGeneric": "Något gick fel. Försök igen.",
  "reset.newPasswordLabel": "Nytt lösenord",
  "reset.newPasswordPlaceholder": "••••••••",
  "reset.updatePassword": "Uppdatera lösenord",
  "reset.updating": "Uppdaterar...",
  "reset.updatedTitle": "Lösenord uppdaterat",
  "reset.updatedDescription": "Ditt lösenord har uppdaterats. Omdirigerar...",
  "reset.invalidEmail": "Ange en giltig e-postadress",
  "reset.missingConfig": "Supabase är inte konfigurerat. Sätt NEXT_PUBLIC_SUPABASE_URL och NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    "premium.chooseYourPlan": "Välj din plan",
    "premium.anonymousDisclaimer": "100% anonym. Du kan avbryta när som helst.",
    "premium.cancelAnytime": "Avbryt prenumerationen när som helst",
    "premium.springSale": "Vårrea",
    "premium.forNewUsers": "för nya användare",
    "premium.discountEnds": "Rabatten slutar snart.",
    "premium.dontMissOut": "Missa inte!",
    "premium.selectedPlan": "Vald plan",
    "premium.benefits": "Premiumförmåner",
    "premium.payWithCard": "Betala med kredit-/betalkort",
    "premium.processing": "Bearbetar...",
    "premium.alreadyPremium": "Redan Premium",
    "premium.monthlyPayment": "Månadsbetalning på",
    "premium.oneTimePayment": "Engångsbetalning på",
    "premium.of": "av",
    "premium.securityBadges": "Säkerhetsmärken",
    "premium.antivirusSecured": "Antivirussäkrad",
    "premium.privacyInStatement": "Sekretess i kontoutdrag",
    "premium.noAdultTransaction": "Ingen vuxentransaktion i ditt kontoutdrag",
    "premium.noHiddenFees": "Inga dolda avgifter • Avbryt prenumerationen när som helst",
    "premium.month": "månad",
    "premium.months": "månader",
    "premium.year": "år",
    "premium.was": "Var",
    "chat.clearHistory": "Rensa chatthistorik",
    "chat.clearConfirmation": "Är du säker på att du vill rensa din chatthistorik? Denna åtgärd kan inte ångras.",
    "chat.clearing": "Rensar...",
    "chat.clearButton": "Rensa historik",
    "chat.cancelButton": "Avbryt",
    "admin.seo": "SEO",
    "admin.seoSettings": "SEO-inställningar",
    "admin.seoGlobalSettings": "Globala SEO-inställningar",
    "admin.seoPageSettings": "Sid-specifika SEO-inställningar",
    "admin.seoSiteName": "Webbplatsnamn",
    "admin.seoTitleTemplate": "Titelmall",
    "admin.seoDescription": "Beskrivning",
    "admin.seoKeywords": "Nyckelord",
    "admin.seoOgImage": "Open Graph-bild",
    "admin.seoTwitterHandle": "Twitter-användarnamn",
    "admin.seoPageTitle": "Sidtitel",
    "admin.seoPageDescription": "Sidbeskrivning",
    "admin.seoPageKeywords": "Sidnyckelord",
    "admin.seoPageOgImage": "Sid Open Graph-bild",
    "admin.seoSaveSuccess": "SEO-inställningar sparades framgångsrikt",
    "admin.seoSaveError": "Det gick inte att spara SEO-inställningarna",
    "profile.title": "Min Profil",
    "profile.accountInfo": "Kontoinformation",
    "profile.accountInfoDesc": "Dina personliga kontouppgifter",
    "profile.username": "Användarnamn",
    "profile.email": "E-post",
    "profile.accountCreated": "Konto skapat",
    "profile.accountType": "Kontotyp",
    "profile.admin": "Administratör",
    "profile.user": "Användare",
    "profile.subscriptionStatus": "Prenumerationsstatus",
    "profile.subscriptionStatusDesc": "Din nuvarande prenumerationsplan och status",
    "profile.premiumActive": "Premium Aktivt",
    "profile.premiumActiveDesc": "Du har tillgång till alla premiumfunktioner",
    "profile.notPremium": "Ingen Premiumprenumeration",
    "profile.notPremiumDesc": "Uppgradera till premium för att få tillgång till alla funktioner",
    "profile.expiryDate": "Utgångsdatum",
    "profile.upgradeToPremium": "Uppgradera till Premium",
    "profile.changePassword": "Ändra Lösenord",
    "profile.changePasswordDesc": "Uppdatera ditt lösenord för att hålla ditt konto säkert",
    "profile.currentPassword": "Nuvarande Lösenord",
    "profile.newPassword": "Nytt Lösenord",
    "profile.confirmPassword": "Bekräfta Nytt Lösenord",
    "profile.passwordRequirements": "Lösenordet måste vara minst 8 tecken långt",
    "profile.changing": "Ändrar...",
    "profile.passwordChanged": "Lösenordet har ändrats",
    "profile.passwordsDoNotMatch": "De nya lösenorden matchar inte",
    "profile.passwordTooShort": "Lösenordet måste vara minst 8 tecken långt",
    "profile.errorChangingPassword": "Fel vid ändring av lösenord",
    "profile.errorCheckingStatus": "Fel vid kontroll av premiumstatus",
    "sidebar.toggleSidebar": "Växla sidofält",
    "sidebar.userMenu": "Användarmeny",
    "sidebar.profile": "Profil",
    "sidebar.navigation": "Navigation",
  "premium.addTokens": "Lägg till tokens",
  "legal.privacyNotice": "Integritetsmeddelande",
  "legal.termsOfService": "Användarvillkor",
    "Calling...": "Ringer...",
    "Call me": "Ring mig",
    "+1 (555) 123-4567": "+46 (70) 123-4567",
    "Enter your phone number with country code (e.g., +1 for US)":
      "Ange ditt telefonnummer med landskod (t.ex. +46 för Sverige)",
    "Enter your phone number": "Ange ditt telefonnummer",
    "Phone number required": "Telefonnummer krävs",
    "Please enter a valid phone number": "Vänligen ange ett giltigt telefonnummer",
    "Call failed": "Samtalet misslyckades",
    "Failed to initiate call": "Det gick inte att ringa samtalet",
    "Call initiated!": "Samtal initierat!",
    "Character will call you shortly": "{{name}} kommer att ringa dig inom kort på {{phoneNumber}}",
    "Initiating call...": "Initierar samtal...",
    "Calling": "Ringer",
    "Calling character...": "Ringer {{name}}...",
    "imageGeneration.title": "Generera en bild",
    "imageGeneration.generateWith": "Generera en bild med {{name}}",
    "imageGeneration.describePrompt": "Beskriv vad du vill se",
    "imageGeneration.promptPlaceholder": "Beskriv bilden du vill generera...",
    "imageGeneration.generating": "Genererar...",
    "imageGeneration.generatingMessage": "Genererar din bild...",
    "imageGeneration.emptyStateTitle": "Din genererade bild kommer att visas här",
    "imageGeneration.emptyStateMessage": "Ange en prompt och klicka på Generera för att skapa en bild",
    "imageGeneration.generateButton": "Generera Bild",
    "imageGeneration.cancelButton": "Avbryt",
    "home.exploreAIGirlfriends": "Utforska AI-flickvänner",
    "general.aiGirlfriends": "AI-flickvänner",
  "footer.companyDescription": "AI Karaktärsutforskare ger uppslukande upplevelser med AI-flickvänner som känns verkliga, vilket gör att användarna kan skapa bilder och chatta.",
  "footer.contact": "Kontakt",
  "footer.features.createImage": "Skapa bild",
  "footer.features.chat": "Chatta",
  "footer.features.createCharacter": "Skapa karaktär",
  "footer.features.gallery": "Galleri",
  "footer.features.explore": "Utforska",
  "footer.about.title": "Om oss",
  "footer.company.title": "Företag",
  "footer.legal.termsPolicies": "Villkor och Policyer",
  "footer.about.aiGirlfriendChat": "AI Girlfriend Chat",
  "footer.about.aiSexting": "AI Sexting",
  "footer.about.howItWorks": "Hur det fungerar",
  "footer.about.aboutUs": "Om oss",
  "footer.about.roadmap": "Färdplan",
  "footer.about.blog": "Blogg",
  "footer.about.guide": "Guide",
  "footer.about.complaints": "Klagomål & borttagning av innehåll",
  "footer.about.termsPolicies": "Villkor och policyer",
  "footer.company.weAreHiring": "Vi anställer",
  "footer.editFooter": "Redigera Footer",
  "footer.addItem": "Lägg till",
  "footer.rightsReserved": "Alla rättigheter förbehållna",
  "footer.resetDefaults": "Återställ standard",
  },
}
