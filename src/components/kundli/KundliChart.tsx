import type { ChartHouse } from "@/lib/vedic/types";

export type { ChartHouse };

type KundliChartProps = {
  houses: ChartHouse[];
  style?: "north" | "south";
  surface?: "night" | "cream";
  className?: string;
};

const SIGN_ABBR: Record<string, string> = {
  Mesha: "Ar",
  Vrishabha: "Ta",
  Mithuna: "Ge",
  Karka: "Cn",
  Simha: "Le",
  Kanya: "Vi",
  Tula: "Li",
  Vrishchika: "Sc",
  Dhanu: "Sg",
  Makara: "Cp",
  Kumbha: "Aq",
  Meena: "Pi",
};

const PLANET_ABBR: Record<string, string> = {
  Sun: "Su",
  Moon: "Mo",
  Mars: "Ma",
  Mercury: "Me",
  Jupiter: "Ju",
  Venus: "Ve",
  Saturn: "Sa",
  Rahu: "Ra",
  Ketu: "Ke",
};

function abbreviate(planet: string): string {
  return PLANET_ABBR[planet] ?? planet.slice(0, 2);
}

function signAbbr(sign?: string): string {
  if (!sign) return "";
  return SIGN_ABBR[sign] ?? sign.slice(0, 2);
}

function getHouse(houses: ChartHouse[], num: number): ChartHouse {
  return houses.find((h) => h.house === num) ?? { house: num, planets: [] };
}

function HouseCell({
  house,
  className = "",
  labelColor,
  planetColor,
}: {
  house: ChartHouse;
  className?: string;
  labelColor: string;
  planetColor: string;
}) {
  return (
    <g className={className}>
      <text x="50%" y="18%" textAnchor="middle" fill={labelColor} fontSize="9" fontWeight="600">
        {house.sign ? signAbbr(house.sign) : `H${house.house}`}
      </text>
      <text x="50%" y="55%" textAnchor="middle" fill={planetColor} fontSize="11" fontWeight="700">
        {house.planets.map(abbreviate).join(" ")}
      </text>
    </g>
  );
}

function NorthIndianChart({
  houses,
  stroke,
  fill,
  labelColor,
  planetColor,
}: {
  houses: ChartHouse[];
  stroke: string;
  fill: string;
  labelColor: string;
  planetColor: string;
}) {
  const h = (n: number) => getHouse(houses, n);

  return (
    <svg viewBox="0 0 400 400" className="w-full max-w-md mx-auto" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M 200 20 L 380 200 L 200 380 L 20 200 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="2"
      />
      <path d="M 20 20 L 380 380 M 20 380 L 380 20 M 200 20 L 200 380 M 20 200 L 380 200" stroke={stroke} strokeWidth="1" opacity="0.5" />

      <foreignObject x="85" y="30" width="230" height="70">
        <HouseCell house={h(1)} labelColor={labelColor} planetColor={planetColor} />
      </foreignObject>
      <foreignObject x="250" y="85" width="120" height="70">
        <HouseCell house={h(2)} labelColor={labelColor} planetColor={planetColor} />
      </foreignObject>
      <foreignObject x="290" y="165" width="90" height="70">
        <HouseCell house={h(3)} labelColor={labelColor} planetColor={planetColor} />
      </foreignObject>
      <foreignObject x="250" y="250" width="120" height="70">
        <HouseCell house={h(4)} labelColor={labelColor} planetColor={planetColor} />
      </foreignObject>
      <foreignObject x="85" y="300" width="230" height="70">
        <HouseCell house={h(5)} labelColor={labelColor} planetColor={planetColor} />
      </foreignObject>
      <foreignObject x="30" y="250" width="120" height="70">
        <HouseCell house={h(6)} labelColor={labelColor} planetColor={planetColor} />
      </foreignObject>
      <foreignObject x="20" y="165" width="90" height="70">
        <HouseCell house={h(7)} labelColor={labelColor} planetColor={planetColor} />
      </foreignObject>
      <foreignObject x="30" y="85" width="120" height="70">
        <HouseCell house={h(8)} labelColor={labelColor} planetColor={planetColor} />
      </foreignObject>
      <foreignObject x="100" y="100" width="90" height="60">
        <HouseCell house={h(12)} labelColor={labelColor} planetColor={planetColor} />
      </foreignObject>
      <foreignObject x="210" y="100" width="90" height="60">
        <HouseCell house={h(11)} labelColor={labelColor} planetColor={planetColor} />
      </foreignObject>
      <foreignObject x="210" y="240" width="90" height="60">
        <HouseCell house={h(10)} labelColor={labelColor} planetColor={planetColor} />
      </foreignObject>
      <foreignObject x="100" y="240" width="90" height="60">
        <HouseCell house={h(9)} labelColor={labelColor} planetColor={planetColor} />
      </foreignObject>
    </svg>
  );
}

function SouthIndianChart({
  houses,
  stroke,
  fill,
  labelColor,
  planetColor,
}: {
  houses: ChartHouse[];
  stroke: string;
  fill: string;
  labelColor: string;
  planetColor: string;
}) {
  const FIXED_SIGNS = [
    "Mesha", "Vrishabha", "Mithuna", "Karka",
    "Simha", "Kanya", "Tula", "Vrishchika",
    "Dhanu", "Makara", "Kumbha", "Meena",
  ];

  const gridPositions = [
    { sign: "Mesha", x: 1, y: 0 }, { sign: "Vrishabha", x: 2, y: 0 }, { sign: "Mithuna", x: 3, y: 0 }, { sign: "Karka", x: 3, y: 1 },
    { sign: "Simha", x: 3, y: 2 }, { sign: "Kanya", x: 3, y: 3 }, { sign: "Tula", x: 2, y: 3 }, { sign: "Vrishchika", x: 1, y: 3 },
    { sign: "Dhanu", x: 0, y: 3 }, { sign: "Makara", x: 0, y: 2 }, { sign: "Kumbha", x: 0, y: 1 }, { sign: "Meena", x: 0, y: 0 },
  ];

  const cellSize = 100;
  const findHouseForSign = (sign: string): ChartHouse => {
    const match = houses.find((h) => h.sign === sign);
    if (match) return match;
    const idx = FIXED_SIGNS.indexOf(sign);
    return { house: idx + 1, planets: [], sign };
  };

  return (
    <svg viewBox="0 0 400 400" className="w-full max-w-md mx-auto" xmlns="http://www.w3.org/2000/svg">
      {gridPositions.map(({ sign, x, y }) => {
        const house = findHouseForSign(sign);
        const cx = x * cellSize;
        const cy = y * cellSize;
        return (
          <g key={sign}>
            <rect
              x={cx}
              y={cy}
              width={cellSize}
              height={cellSize}
              fill={fill}
              stroke={stroke}
              strokeWidth="1.5"
            />
            <text x={cx + cellSize / 2} y={cy + 22} textAnchor="middle" fill={labelColor} fontSize="10" fontWeight="600">
              {signAbbr(sign)}
            </text>
            <text x={cx + cellSize / 2} y={cy + cellSize / 2 + 5} textAnchor="middle" fill={planetColor} fontSize="11" fontWeight="700">
              {house.planets.map(abbreviate).join(" ")}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export const SAMPLE_CHART_HOUSES: ChartHouse[] = [
  { house: 1, sign: "Simha", planets: ["Sun"] },
  { house: 2, sign: "Kanya", planets: ["Mercury"] },
  { house: 3, sign: "Tula", planets: ["Venus"] },
  { house: 4, sign: "Vrishchika", planets: ["Rahu"] },
  { house: 5, sign: "Dhanu", planets: ["Jupiter"] },
  { house: 6, sign: "Makara", planets: ["Saturn"] },
  { house: 7, sign: "Kumbha", planets: [] },
  { house: 8, sign: "Meena", planets: [] },
  { house: 9, sign: "Mesha", planets: ["Mars"] },
  { house: 10, sign: "Vrishabha", planets: ["Ketu"] },
  { house: 11, sign: "Mithuna", planets: [] },
  { house: 12, sign: "Karka", planets: ["Moon"] },
];

export default function KundliChart({
  houses,
  style = "north",
  surface = "night",
  className = "",
}: KundliChartProps) {
  const isNight = surface === "night";
  const stroke = isNight ? "#E0B33C" : "#6B5046";
  const fill = isNight ? "rgba(224, 179, 60, 0.05)" : "rgba(252, 233, 218, 0.5)";
  const labelColor = isNight ? "#E0B33C" : "#6B5046";
  const planetColor = isNight ? "#FFFFFF" : "#2E1410";

  return (
    <div className={`${className}`} role="img" aria-label={`Kundli chart, ${style} Indian style`}>
      {style === "north" ? (
        <NorthIndianChart
          houses={houses}
          stroke={stroke}
          fill={fill}
          labelColor={labelColor}
          planetColor={planetColor}
        />
      ) : (
        <SouthIndianChart
          houses={houses}
          stroke={stroke}
          fill={fill}
          labelColor={labelColor}
          planetColor={planetColor}
        />
      )}
    </div>
  );
}
