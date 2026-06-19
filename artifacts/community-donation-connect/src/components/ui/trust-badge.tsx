import { Badge } from "@/components/ui/badge";

interface TrustBadgeProps {
  score: number;
  level: string;
}

export function TrustBadge({ score, level }: TrustBadgeProps) {
  let badgeColor = "bg-gray-100 text-gray-800 border-gray-200";
  let label = "New";

  if (level === "champion") {
    badgeColor = "bg-green-100 text-green-800 border-green-200";
    label = "Champion ⭐";
  } else if (level === "highlyTrusted") {
    badgeColor = "bg-amber-100 text-amber-800 border-amber-200";
    label = "Highly Trusted";
  } else if (level === "trusted") {
    badgeColor = "bg-blue-100 text-blue-800 border-blue-200";
    label = "Trusted";
  }

  return (
    <Badge variant="outline" className={`font-medium ${badgeColor}`}>
      {label} ({score})
    </Badge>
  );
}
