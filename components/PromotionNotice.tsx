interface Props {
  className?: string;
}

export function PromotionNotice({ className = "" }: Props) {
  return (
    <div className={`rounded-[24px] border border-[rgba(37,99,235,0.14)] bg-[rgba(37,99,235,0.06)] p-4 ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--page-muted)]">
        PR Disclosure
      </p>
      <p className="mt-2 text-xs leading-6 text-[var(--page-muted)]">
        このページには提携先への外部リンクを含む場合があります。紹介順や条件は固定ではないため、最終的な募集内容・報酬・応募条件は遷移先で確認してください。
      </p>
    </div>
  );
}
