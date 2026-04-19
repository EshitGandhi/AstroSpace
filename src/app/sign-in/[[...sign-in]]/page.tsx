import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="glass-card p-8 rounded-2xl">
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-transparent shadow-none",
              headerTitle: "text-white font-heading",
              headerSubtitle: "text-gray-400",
              socialButtonsBlockButton: "bg-white/10 border border-white/20 text-white hover:bg-white/20",
              socialButtonsBlockButtonText: "text-white",
              formButtonPrimary: "bg-gradient-to-r from-[#ff8c00] to-[#d35400] hover:opacity-90",
              formFieldInput: "bg-[#0d0a08]/50 border-white/10 text-white",
              formFieldLabel: "text-gray-300",
              footerActionLink: "text-[#ffd700] hover:text-[#ff8c00]",
              identityPreviewEditButton: "text-[#ffd700]",
              formFieldInputShowPasswordButton: "text-gray-400",
            },
          }}
        />
      </div>
    </div>
  );
}
