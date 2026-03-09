export type PartnerLinkKey = "singleDayJobs" | "partTimeJobs" | "careerStep";

interface PartnerLink {
  href: string;
  label: string;
  description: string;
}

const partnerLinks: Record<PartnerLinkKey, PartnerLink> = {
  singleDayJobs: {
    href: process.env.NEXT_PUBLIC_PARTNER_SINGLE_DAY_JOBS_URL || "/guides/tanpatsu-baito-app-hikaku",
    label: "今すぐ働ける単発バイトを見る",
    description: "面接なし・即日勤務寄りの選択肢を先に見たい人向け",
  },
  partTimeJobs: {
    href: process.env.NEXT_PUBLIC_PARTNER_PART_TIME_JOBS_URL || "/list",
    label: "別のアルバイト候補を探す",
    description: "今の職場が合わないときに、次の候補を比較したい人向け",
  },
  careerStep: {
    href: process.env.NEXT_PUBLIC_PARTNER_CAREER_URL || "/guides/baito-yametai-daigakusei",
    label: "働き方を見直すヒントを見る",
    description: "バイト自体を変えるか迷っている人向け",
  },
};

export function getPartnerLink(key: PartnerLinkKey): PartnerLink {
  return partnerLinks[key];
}

export function isExternalHref(href: string): boolean {
  return /^https?:\/\//.test(href);
}
