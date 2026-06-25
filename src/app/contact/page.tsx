import type { Metadata } from "next";
import Badge from "@/components/ui/Badge";
import AnimatedButton from "@/components/ui/AnimatedButton";
import { Mail, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Talk to Astrologer | AstroGuru",
  description: "Connect with an AstroGuru astrologer via WhatsApp or email.",
};

export default function ContactPage() {
  return (
    <div className="bg-cream min-h-screen pt-32 pb-24 px-6 text-ink">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <Badge>Get in Touch</Badge>
        <h1 className="text-4xl md:text-5xl font-heading font-bold">Talk to an Astrologer</h1>
        <p className="text-lg text-ink-muted">
          Have a quick question? Reach out directly — no booking required.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
          <a
            href="https://wa.me/911234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="bg-white border border-ink/10 rounded-2xl p-8 hover:border-bhagva/30 transition-colors space-y-4">
              <MessageCircle className="w-10 h-10 text-bhagva mx-auto" />
              <h2 className="font-heading font-bold text-lg">WhatsApp</h2>
              <p className="text-sm text-ink-muted">Chat with us instantly</p>
              <AnimatedButton variant="primary" size="sm" className="w-full">
                Open WhatsApp
              </AnimatedButton>
            </div>
          </a>

          <a href="mailto:hello@astroguru.com" className="block">
            <div className="bg-white border border-ink/10 rounded-2xl p-8 hover:border-bhagva/30 transition-colors space-y-4">
              <Mail className="w-10 h-10 text-gold mx-auto" />
              <h2 className="font-heading font-bold text-lg">Email</h2>
              <p className="text-sm text-ink-muted">hello@astroguru.com</p>
              <AnimatedButton variant="secondary" size="sm" className="w-full">
                Send Email
              </AnimatedButton>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
