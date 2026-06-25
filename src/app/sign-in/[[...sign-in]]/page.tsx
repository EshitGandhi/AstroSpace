import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 bg-cream">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-white shadow-md border border-ink/10 rounded-2xl",
            headerTitle: "text-ink font-heading",
            headerSubtitle: "text-ink-muted",
            socialButtonsBlockButton:
              "bg-cream border border-ink/20 text-ink hover:bg-cream-tint",
            socialButtonsBlockButtonText: "text-ink",
            formButtonPrimary: "bg-bhagva hover:bg-bhagva/90",
            formFieldInput:
              "bg-cream border-ink/20 text-ink focus:border-bhagva",
            formFieldLabel: "text-ink",
            footerActionLink: "text-bhagva hover:text-bhagva/80",
            identityPreviewEditButton: "text-bhagva",
            formFieldInputShowPasswordButton: "text-ink-muted",
          },
        }}
      />
    </div>
  );
}
