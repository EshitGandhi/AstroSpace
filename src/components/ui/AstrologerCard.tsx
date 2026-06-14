import Image from "next/image";
import { Star, Award, MessageCircle, Calendar } from "lucide-react";
import AnimatedButton from "./AnimatedButton";
import Badge from "./Badge";

type AstrologerCardProps = {
  name: string;
  specialties: string[];
  languages: string[];
  experience: number;
  rating: number;
  pricePerMinute: number;
  imageUrl?: string;
  bookingLink?: string;
  onBook?: () => void;
};

export default function AstrologerCard({
  name,
  specialties,
  languages,
  experience,
  rating,
  pricePerMinute,
  imageUrl,
  onBook,
}: AstrologerCardProps) {
  return (
    <div className="bg-white border border-ink/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row gap-6">
      {/* Photo/Avatar area */}
      <div className="flex-shrink-0 flex flex-col items-center">
        <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-gold/40 bg-cream-tint">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover"
            />
          ) : (
            // Premium SVG placeholder avatar with astrolabe styling
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-cream-tint to-cream text-gold">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
        </div>
        
        {/* Rating badge */}
        <div className="flex items-center gap-1 mt-3 bg-gold/10 text-ink font-semibold px-2 py-0.5 rounded-full text-xs">
          <Star className="w-3.5 h-3.5 fill-gold text-gold" />
          <span>{rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Details area */}
      <div className="flex-grow flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
            <h3 className="text-xl font-bold font-heading text-ink">{name}</h3>
            <div className="text-sm font-semibold text-bhagva">
              ₹{pricePerMinute}/min
            </div>
          </div>

          {/* Metadata badges */}
          <div className="flex flex-wrap gap-3 text-xs text-ink-muted mb-4 font-medium">
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-gold" />
              {experience} Years Exp
            </span>
            <span className="flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-bhagva" />
              {languages.join(", ")}
            </span>
          </div>

          {/* Specialties pills */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            {specialties.map((spec) => (
              <Badge key={spec}>{spec}</Badge>
            ))}
          </div>
        </div>

        {/* Action block */}
        <div className="flex flex-col sm:flex-row items-center gap-3 border-t border-ink/5 pt-4 mt-auto w-full">
          <div className="text-left w-full sm:w-auto">
            <span className="text-xs text-ink-muted block">Next Available</span>
            <span className="text-xs font-bold text-ink flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-bhagva" /> Today, 07:00 PM
            </span>
          </div>

          <div className="sm:ml-auto w-full sm:w-auto flex gap-2">
            <a href="https://wa.me/911234567890" target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-initial">
              <AnimatedButton variant="secondary" size="sm" className="w-full">
                Chat
              </AnimatedButton>
            </a>
            <AnimatedButton variant="primary" size="sm" onClick={onBook} className="flex-1 sm:flex-initial">
              Book Reading
            </AnimatedButton>
          </div>
        </div>
      </div>
    </div>
  );
}
