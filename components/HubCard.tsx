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
      {/* PC: アイコンと本文を横並び */}
      <div className="hub-card-compact__body">
        <Image
          src={icon}
          alt={hub.eyebrow}
          width={44}
          height={44}
          className="hub-card-compact__icon"
        />
        <div className="hub-card-compact__content">
          <div className="hub-card-compact__header">
            <div className="hub-card-compact__titles">
              <span className="hub-card-compact__eyebrow">{hub.eyebrow}</span>
              <span className="hub-card-compact__short-title">{hub.shortTitle}</span>
            </div>
            <span className="hub-card-compact__arrow">→</span>
          </div>
          <p className="hub-card-compact__excerpt">{hub.excerpt}</p>
        </div>
      </div>
    </Link>
  );
}
