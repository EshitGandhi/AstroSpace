import Link from "next/link";
import { ArrowRight } from "lucide-react";
import * as Icons from "lucide-react";

type HouseCardProps = {
  houseNumber: number;
  houseName: string; // e.g. "Tanu" / "Bandhu" / "Yuvati" / "Karma"
  title: string;
  description: string;
  link: string;
  iconName: keyof typeof Icons;
};

export default function HouseCard({
  houseNumber,
  houseName,
  title,
  description,
  link,
  iconName,
}: HouseCardProps) {
  // Dynamically resolve lucide icon
  const IconComponent = Icons[iconName] as React.ComponentType<{ className?: string }>;

  return (
    <Link href={link} className="group block">
      <div className="relative overflow-hidden bg-white hover:bg-cream-tint/30 border border-ink/10 rounded-2xl p-6 transition-all duration-300 shadow-sm hover:shadow-md hover:border-bhagva/30 flex flex-col h-full min-h-[200px]">
        {/* Kendra House Diamond Badge */}
        <div className="flex justify-between items-start mb-6">
          <div className="relative w-12 h-12 flex items-center justify-center">
            {/* Golden diamond shape background */}
            <div className="absolute inset-0 border border-gold bg-gold/5 rotate-45 rounded-sm transition-transform duration-500 group-hover:rotate-[135deg]"></div>
            {/* Non-rotating house number */}
            <span className="relative z-10 text-gold font-bold font-heading text-sm">
              H{houseNumber}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-ink-muted font-semibold block">
              House {houseNumber}
            </span>
            <span className="text-xs text-bhagva font-medium block">
              {houseName} Bhava
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow">
          <div className="flex items-center gap-3 mb-2">
            {IconComponent && (
              <div className="p-2 bg-cream-tint text-bhagva rounded-lg group-hover:bg-bhagva group-hover:text-white transition-colors duration-300">
                <IconComponent className="w-5 h-5" />
              </div>
            )}
            <h3 className="text-lg font-bold font-heading text-ink group-hover:text-bhagva transition-colors">
              {title}
            </h3>
          </div>
          <p className="text-sm text-ink-muted leading-relaxed">
            {description}
          </p>
        </div>

        {/* Action arrow */}
        <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-bhagva group-hover:translate-x-1 transition-transform">
          <span>Explore</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}
