import Image from "next/image";
import Link from "next/link";
import type { HubEntry, HubKind } from "@/lib/hubs";
import { getHubPath } from "@/lib/hubs";

const hubIcons: Record<HubKind, string> = {
  jobs: "/images/icon-jobs.png",
  areas: "/images/icon-areas.png",
  apps: "/images/icon-apps.png",
};

interface Props {
  hub: HubEntry;
}

export function HubCard({ hub }: Props) {
  const icon = hubIcons[hub.kind];

  return (
    <Link href={getHubPath(hub)} className="hub-card-compact">
      <div className="hub-card-compact__header">
        <Image
          src={icon}
          alt={hub.eyebrow}
          width={40}
          height={40}
          className="hub-card-compact__icon"
        />
        <div className="hub-card-compact__titles">
          <span className="hub-card-compact__short-title">{hub.shortTitle}</span>
          <span className="hub-card-compact__eyebrow">{hub.eyebrow}</span>
        </div>
        <span className="hub-card-compact__arrow">→</span>
      </div>
      <p className="hub-card-compact__excerpt">{hub.excerpt}</p>
    </Link>
  );
}
