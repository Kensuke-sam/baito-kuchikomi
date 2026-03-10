import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "バイト体験談マップにおける個人情報・ログ・広告計測の取り扱い方針です。",
};

const sections = [
  {
    title: "取得する情報",
    items: [
      "投稿フォーム、通報フォーム、削除申請フォーム、当事者コメントで入力された情報",
      "IPアドレス、ユーザーエージェント、送信日時などの運用ログ",
      "Cookie、閲覧ページ、クリックイベントなどのアクセス解析情報",
    ],
  },
  {
    title: "利用目的",
    items: [
      "投稿審査、掲載判断、削除申請対応、当事者確認対応のため",
      "虚偽投稿、スパム、不正アクセスその他の不正利用を防止するため",
      "検索流入やクリック状況を把握し、記事や導線を改善するため",
      "法令に基づく照会や権利侵害対応に必要な範囲で確認するため",
    ],
  },
] as const;

const proseSections = [
  {
    title: "アクセス解析と広告計測",
    body: "本サービスでは、Google Analytics 4 や Google Tag Manager などの解析ツールを導入する場合があります。これらのツールはCookie等を利用して閲覧状況やリンククリックを計測することがあります。また、求人サービスや関連サービスへの提携リンクを設置する場合があります。外部リンクを含む記事や比較ページでは、PR表記を行ったうえで、どのページからリンクがクリックされたかを把握するための計測を行うことがあります。",
  },
  {
    title: "第三者提供",
    body: "取得した情報は、法令に基づく場合や権利侵害対応で必要な場合を除き、本人の同意なく第三者へ提供しません。ただし、アクセス解析やメール送信などの委託先サービスに必要な範囲で情報が処理されることがあります。",
  },
  {
    title: "安全管理",
    body: "本サービスは、取得した情報への不要なアクセス、漏えい、改ざんを防ぐために、合理的な範囲で管理を行います。ただし、インターネット通信や外部サービスの性質上、完全な安全性を保証するものではありません。",
  },
] as const;

export default function PrivacyPage() {
  return (
    <main className="app-shell mx-auto max-w-4xl px-4 py-8 sm:py-10">
      <section className="section-frame p-6 sm:p-8">
        <span className="eyebrow">プライバシー</span>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-[var(--page-ink)] sm:text-4xl">
          プライバシーポリシー
        </h1>
        <p className="mt-3 text-sm text-[var(--page-muted)]">最終更新: 2026年3月10日</p>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--page-muted)]">
          バイト体験談マップ（以下「本サービス」）は、主観ベースの体験談を安全寄りに扱うため、投稿・通報・削除申請・アクセス解析に必要な範囲で情報を取り扱います。
        </p>

        {/* リスト付きセクション */}
        <div className="mt-8 space-y-4">
          {sections.map((section) => (
            <section key={section.title} className="glass-panel rounded-[26px] p-5">
              <h2 className="text-xl font-semibold tracking-[-0.04em] text-[var(--page-ink)]">
                {section.title}
              </h2>
              <ul className="mt-3 space-y-2">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm leading-7 text-[var(--page-muted)]">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* テキストセクション */}
        <div className="mt-4 space-y-4">
          {proseSections.map((section) => (
            <section key={section.title} className="glass-panel rounded-[26px] p-5">
              <h2 className="text-xl font-semibold tracking-[-0.04em] text-[var(--page-ink)]">
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--page-muted)]">{section.body}</p>
            </section>
          ))}
        </div>

        {/* 相談先 */}
        <div className="glass-panel mt-4 rounded-[26px] p-5">
          <h2 className="text-xl font-semibold tracking-[-0.04em] text-[var(--page-ink)]">
            開示・訂正・削除の相談先
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--page-muted)]">
            掲載内容の削除や訂正を希望する場合は、
            <Link href="/takedown" className="font-semibold text-[var(--accent)] hover:opacity-80">
              削除申請フォーム
            </Link>
            を利用してください。運営判断で確認し、必要に応じて非公開化・修正・補足掲載を行います。
          </p>
        </div>

        {/* 関連ページ */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/terms" className="primary-button text-sm">
            利用規約
          </Link>
          <Link href="/editorial-policy" className="secondary-button text-sm">
            編集方針
          </Link>
          <Link href="/guidelines" className="secondary-button text-sm">
            投稿ガイドライン
          </Link>
        </div>

        <p className="mt-8 text-xs text-[var(--page-muted)]">
          ※ 本ポリシーは運用方針を示すものであり、法的助言ではありません。必要に応じて専門家に相談してください。
        </p>
      </section>
    </main>
  );
}
