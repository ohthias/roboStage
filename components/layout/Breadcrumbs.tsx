import { Squares2X2Icon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumbs({ start }: { start: string }) {
  const pathname = usePathname();
  const allSegments = pathname.split("/").filter(Boolean);
  const startIndex = allSegments.indexOf(start);
  const segments =
    startIndex >= 0 ? allSegments.slice(startIndex + 1) : allSegments;

  return (
    <div className="breadcrumbs text-sm">
      <ul>
        <li>
          <Link href={`/${start}`}>
            <Squares2X2Icon className="mr-1 inline-block h-4 w-4" />
            {start.charAt(0).toUpperCase() + start.slice(1)}
          </Link>
        </li>

        {segments.map((segment, idx) => {
          const href = `/${start}/${segments.slice(0, idx + 1).join("/")}`;
          const label =
            segment.charAt(0).toUpperCase() +
            segment.slice(1).replace(/-/g, " ");

          return (
            <li key={href}>
              {idx === segments.length - 1 ? (
                <span className="font-semibold">{label}</span>
              ) : (
                <Link href={href}>{label}</Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}