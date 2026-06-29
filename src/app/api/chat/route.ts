import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ZODIAC_SIGNS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo", 
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
];

export async function POST(req: Request) {
  try {
    const { message, role, context } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const msgLower = message.toLowerCase();
    
    // 1. Fetch Dynamic Contexts from Admin DB
    const adminContexts = await prisma.chatbotContext.findMany();
    const dynamicSuggestions = adminContexts
      .filter((c) => c.isButton && c.buttonLabel)
      .map((c) => c.buttonLabel as string);

    // Check if the user message matches any Admin Custom Context
    const matchedAdminContext = adminContexts.find(c => 
      msgLower.includes(c.keyword.toLowerCase()) || 
      (c.buttonLabel && msgLower === c.buttonLabel.toLowerCase())
    );

    if (matchedAdminContext) {
      return NextResponse.json({
        reply: matchedAdminContext.reply,
        context: null,
        suggestions: dynamicSuggestions.length > 0 ? dynamicSuggestions : null,
      });
    }
    
    // Process Multi-turn Horoscope Flow
    if (context && context.step) {
      if (context.step === "AWAITING_SIGN") {
        const signMatch = ZODIAC_SIGNS.find(s => msgLower.includes(s));
        if (signMatch) {
          return NextResponse.json({
            reply: `Great! You selected ${signMatch.charAt(0).toUpperCase() + signMatch.slice(1)}. Which language would you prefer for your reading?`,
            context: { step: "AWAITING_LANG", sign: signMatch },
            suggestions: ["English", "Hindi"]
          });
        } else {
          return NextResponse.json({
            reply: "I couldn't detect a valid zodiac sign. Please select one from the options below or type it out.",
            context: { step: "AWAITING_SIGN" },
            suggestions: ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
          });
        }
      }
      
      if (context.step === "AWAITING_LANG") {
        const lang = msgLower.includes("hindi") || msgLower.includes("hi") ? "hi" : "en";
        const sign = context.sign;
        
        try {
          // Note: using absolute URL or internal origin because fetch requires absolute URLs in route handlers
          // However, since we are inside the same Next.js app, we can just fetch the external API or the internal one.
          // Since it's server-side, we can bypass CORS and hit the external API directly, or hit our own API if we know the host.
          // Hitting the external API directly and mimicking our internal route logic is safer in Server Components.
          const res = await fetch(`https://freehoroscopeapi.com/api/v1/get-horoscope/daily?sign=${sign}`, { next: { revalidate: 3600 } });
          const data = await res.json();
          
          if (data && data.data && data.data.horoscope) {
            let reading = data.data.horoscope;
            let date = data.data.date;
            
            // If Hindi, translate using Google Translate API (same as we do internally)
            if (lang === "hi") {
              const translateRes = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(reading)}`);
              const translateData = await translateRes.json();
              if (translateData && translateData[0]) {
                reading = translateData[0].map((item: any) => item[0]).join('');
              }
            }
            
            const reply = `Here is your Daily Horoscope for ${sign.charAt(0).toUpperCase() + sign.slice(1)} (Date: ${date}):\n\n${reading}`;
            return NextResponse.json({ reply, context: null, suggestions: null });
          } else {
            throw new Error("Invalid external API response");
          }
        } catch (err) {
          console.error("Horoscope check error:", err);
          return NextResponse.json({ 
            reply: "I'm sorry, I couldn't fetch your horoscope at this time. Please try again later.",
            context: null,
            suggestions: null
          });
        }
      }
    }

    // Default Flow
    let reply = "I'm sorry, I don't have information about that yet. Please try asking another question or contact support.";
    let suggestions: string[] | null = null;
    let action = null;
    let newContext = null;

    // Feedback
    if (msgLower.includes("feedback") || msgLower.includes("suggest") || msgLower.includes("bug")) {
      reply = "I'd love to hear your feedback. Please tell us what we can improve.";
      action = "FEEDBACK_PROMPT";
    }
    // Horoscope Flow Trigger
    else if (msgLower.includes("check horoscope") || msgLower.includes("daily horoscope")) {
      reply = "I can fetch your daily horoscope for you! First, please select your Zodiac Sign:";
      newContext = { step: "AWAITING_SIGN" };
      suggestions = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
    }
    // Greetings & General
    else if (msgLower.includes("hi") || msgLower.includes("hello") || msgLower.includes("hey")) {
      reply = "Hello! I am your AstroGuru virtual assistant. How can I guide you today?";
    } else if (msgLower.includes("what features") || msgLower.includes("help") || msgLower.includes("guide")) {
      reply = "Welcome to AstroGuru! We currently offer personalized Horoscopes, interactive Tarot Readings, and expert Astrologer consultations (Talk to Guru). Let me know what you'd like to explore!";
    }
    // Role-specific routing
    else if (role === "ASTROLOGER") {
      if (msgLower.includes("complete my profile") || msgLower.includes("update my bio") || msgLower.includes("profile picture")) {
        reply = "To update your profile, go to the Pandit Dashboard and navigate to the 'Settings' tab. From there, you can upload your profile picture, update your bio, and save your changes.";
      } else if (msgLower.includes("pricing") || msgLower.includes("consultation")) {
        reply = "You can manage your chat, call, and video consultation pricing from the 'Pricing' tab in your Pandit Dashboard.";
      } else if (msgLower.includes("availability")) {
        reply = "To manage your working hours, head to the 'Availability' section in your dashboard. You can toggle your active days and set your time slots.";
      } else if (msgLower.includes("dashboard") || msgLower.includes("where can i view")) {
        reply = "You can access your dashboard by clicking on your profile icon in the sidebar and selecting 'Dashboard'.";
      } else if (msgLower.includes("verification status") || msgLower.includes("pending")) {
        reply = "Your profile is currently under review by our admin team to ensure quality. Verification usually takes 24-48 hours. We will notify you once approved.";
      }
    } else {
      // General/User routing
      if (msgLower.includes("how do i use horoscope") || msgLower.includes("today's horoscope")) {
        reply = "1. Open the Horoscope page.\n2. Select your zodiac sign.\n3. Choose Daily, Weekly, or Monthly.\n4. Read your personalized horoscope.";
      } else if (msgLower.includes("how do i use tarot") || msgLower.includes("read tarot")) {
        reply = "1. Navigate to the Horoscope page.\n2. Click the 'Tarot Reading' tab.\n3. Choose from Daily Card, Three Card Reading, Major Arcana Explorer, or the Complete Deck to start your reading.";
      } else if (msgLower.includes("register as an astrologer")) {
        reply = "To join us as an Astrologer, click 'Join as Astrologer' on the homepage, fill out the registration form with your details, and submit it for review.";
      } else if (msgLower.includes("edit my profile") || msgLower.includes("update profile")) {
        reply = "You can edit your profile by clicking on your account in the sidebar and selecting 'My Profile'. From there, you can update your details.";
      } else if (msgLower.includes("change my password") || msgLower.includes("login")) {
        reply = "You can manage your authentication and password from the 'My Profile' settings page if you are logged in, or click 'Forgot Password' on the login screen.";
      } else if (msgLower.includes("find an astrologer")) {
        reply = "You can browse our certified astrologers on the 'Talk to Guru' page. Filter by expertise, language, and pricing to find the perfect match.";
      }
    }

    if (!suggestions && dynamicSuggestions.length > 0) {
      suggestions = dynamicSuggestions;
    }

    return NextResponse.json({ reply, action, context: newContext, suggestions });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Failed to process chat message" }, { status: 500 });
  }
}
