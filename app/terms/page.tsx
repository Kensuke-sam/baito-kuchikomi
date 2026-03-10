import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "利用規約・免責事項",
  description: "バイト体験談マップの利用規約、免責事項、ログ保存、削除申請対応の方針です。",
};

const sections = [
  {
    title: "本サービスの位置づけ",
    body: "本サービスは、アルバイト・パートに関する体験談を共有する口コミサービスです。掲載内容は投稿者個人の主観・経験に基づくものであり、運営が事実認定や評価を行うものではありません。",
  },
  {
    title: "免責事項",
    body: "本サービスに掲載されている体験談・口コミは、投稿者個人の主観的な意見・体験であり、運営は内容の正確性・完全性・最新性を保証しません。掲載情報を参考にした結果生じた損害について、運営は一切の責任を負いません。",
  },
  {
    title: "投稿者の責任",
    body: "投稿者は自己の投稿内容に責任を持ちます。投稿内容が第三者の権利を侵害した場合、投稿者自身が責任を負います。運営は投稿者の行為について責任を負いません。",
  },
  {
    title: "コンテンツの管理",
    body: "投稿は管理者確認後に公開されます。運営は、投稿ガイドラインに反する投稿を非公開化・要修正・削除し、当事者からの削除申請や訂正依頼に応じて内容を見直す権利を有します。削除等に対する補償は行いません。",
  },
  {
    title: "削除申請・当事者コメント",
    body: "企業・店舗・本人その他の当事者は、削除申請フォームを通じて削除または非公開化を求めることができます。また、反論・補足・訂正がある場合は、当事者コメント送信フォームから送信でき、運営判断により掲載することがあります。",
  },
  {
    title: "プライバシー・ログ",
    body: "投稿・通報・削除申請等に際して、内部識別子、IPアドレス、ユーザーエージェント、作成時刻その他必要な運用ログを内部的に記録します。これらは公開しません。法令に基づく要請または権利侵害対応のため必要がある場合、必要な範囲で利用または提供することがあります。",
  },
  {
    title: "禁止行為",
    body: "個人情報の掲載、差別的表現、脅迫、虚偽情報、違法性を断定する表現、なりすまし、スパムその他運営が不適切と判断する行為を禁止します。",
  },
  {
    title: "サービスの変更・終了",
    body: "運営は予告なくサービスを変更・終了する場合があります。",
  },
  {
    title: "準拠法",
    body: "本規約は日本法を準拠法とします。",
  },
] as const;

export default function TermsPage() {
  return (
    <main className="app-shell mx-auto max-w-4xl px-4 py-8 sm:py-10">
      <section className="section-frame p-6 sm:p-8">
        <span className="eyebrow">利用規約</span>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-[var(--page-ink)] sm:text-4xl">
          利用規約・免責事項
        </h1>
        <p className="mt-3 text-sm text-[var(--page-muted)]">最終更新: 2026年3月</p>

        <div className="mt-8 space-y-4">
          {sections.map((section) => (
            <section key={section.title} className="glass-panel rounded-[26px] p-5">
              <h2 className="text-xl font-semibold tracking-[-0.04em] text-[var(--page-ink)]">
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--page-muted)]">{section.body}</p>
            </section>
          ))}
        </div>

        <div className="glass-panel mt-6 rounded-[26px] p-5">
          <h2 className="text-xl font-semibold tracking-[-0.04em] text-[var(--page-ink)]">
            関連ページ
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--page-muted)]">
            個人情報、Cookie、アクセス解析、広告計測の取り扱い方針は{" "}
            <Link href="/privacy" className="font-semibold text-[var(--accent)] hover:opacity-80">
              プライバシーポリシー
            </Link>{" "}
            でも案内しています。
          </p>
        </div>

        <p className="mt-8 text-xs text-[var(--page-muted)]">
          ※ 本規約は一般的な方針を示すものであり、法的助言ではありません。具体的な法律問題については専門家にご相談ください。
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/privacy" className="primary-button text-sm">
            プライバシーポリシー
          </Link>
          <Link href="/editorial-policy" className="secondary-button text-sm">
            編集方針へ
          </Link>
        </div>
      </section>
    </main>
  );
}
