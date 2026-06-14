import Link from "next/link";
import { ChevronRight } from "lucide-react";
import * as Icons from "lucide-react";

type ServiceCardProps = {
  title: string;
  description: string;
  link: string;
  iconName: keyof typeof Icons;
};

export default function ServiceCard({
  title,
  description,
  link,
  iconName,
}: ServiceCardProps) {
  const IconComponent = Icons[iconName] as React.ComponentType<{ className?: string }>;

  return (
    <Link href={link} className="group block h-full">
      <div className="flex items-center gap-4 bg-white/60 hover:bg-white border border-ink/5 hover:border-bhagva/20 rounded-xl p-4 transition-all duration-300 shadow-sm hover:shadow-md h-full">
        {/* Icon container */}
        {IconComponent && (
          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-cream-tint text-bhagva rounded-lg group-hover:scale-110 transition-transform duration-300">
            <IconComponent className="w-5 h-5" />
          </div>
        )}

        {/* Content */}
        <div className="flex-grow min-w-0">
          <h4 className="text-sm font-bold font-heading text-ink group-hover:text-bhagva transition-colors truncate">
            {title}
          </h4>
          <p className="text-xs text-ink-muted leading-relaxed truncate">
            {description}
          </p>
        </div>

        {/* Action arrow */}
        <div className="flex-shrink-0 text-ink-muted group-hover:text-bhagva group-hover:translate-x-0.5 transition-all">
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>
    </Link>
  );
}
