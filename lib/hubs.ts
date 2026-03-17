import { type PartnerLinkKey } from "@/lib/partnerLinks";

export type HubKind = "jobs" | "areas" | "apps";

export interface HubSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface HubEntry {
  kind: HubKind;
  slug: string;
  shortTitle: string;
  title: string;
  description: string;
  excerpt: string;
  intent: string;
  eyebrow: string;
  partnerKey: PartnerLinkKey;
  ctaTitle: string;
  ctaBody: string;
  highlights: string[];
  sections: HubSection[];
  relatedGuideSlugs: string[];
}

const jobHubs: HubEntry[] = [
  {
    kind: "jobs",
    slug: "konbini",
    shortTitle: "コンビニ",
    title: "コンビニバイトがきつい人向けの見方と、別の選択肢の考え方",
    description:
      "コンビニバイトがきついと感じる大学生向けに、負荷が高くなりやすいポイントと、次の候補を考えるときの軸を整理したページです。",
    excerpt:
      "レジ、品出し、宅配受付、深夜対応が重なると負荷が一気に上がります。向き不向きで見直す方が早い職種です。",
    intent: "コンビニバイトがしんどく、何がつらいのか整理したい大学生向け",
    eyebrow: "Job Hub",
    partnerKey: "partTimeJobs",
    ctaTitle: "接客負荷が低めの仕事も並行して見ておく",
    ctaBody: "今の職場が合わないだけなら、別職種へ切り替える方が早く安定することがあります。",
    highlights: [
      "接客、作業、時間帯責任が重なりやすい",
      "人手不足のしわ寄せを受けやすい",
      "別職種に変えると負担が下がることが多い",
    ],
    sections: [
      {
        title: "コンビニがきつくなりやすい理由",
        paragraphs: [
          "コンビニは、仕事の種類が多いわりに、現場では少人数で回すことが多い職種です。レジだけでなく、品出し、清掃、宅配便、公共料金対応などが重なると、初心者ほど消耗しやすくなります。",
          "大学生の場合は、授業終わりや深夜帯に入ると生活リズムが崩れやすく、疲れが抜けないまま次のシフトへ入る流れになりがちです。",
        ],
        bullets: [
          "業務の幅が広い",
          "少人数運営だと責任が重くなる",
          "時間帯によってしんどさが大きく変わる",
        ],
      },
      {
        title: "向いていないと感じたときの見方",
        paragraphs: [
          "『自分が弱い』と考えるより、今の働き方と職種が合っているかを見る方が現実的です。マルチタスクがしんどい人、対面接客が強いストレスになる人は、別職種へ移った方が早く安定することがあります。",
          "逆に、作業の切り替えが得意で、人と話すことがそこまで苦にならない人なら続けやすいこともあります。",
        ],
      },
      {
        title: "次に選び直すときの軸",
        paragraphs: [
          "次の候補は、時給だけでなく、業務の少なさ、固定シフトの重さ、接客量で比べると失敗が減ります。裏方作業や単発を混ぜると、負荷を調整しやすくなります。",
        ],
        bullets: [
          "接客量が少ないか",
          "急な責任が乗りにくいか",
          "授業との両立がしやすいか",
        ],
      },
    ],
    relatedGuideSlugs: ["baito-yametai-daigakusei", "black-baito-miwakekata", "baito-sokujitsu-yameru"],
  },
  {
    kind: "jobs",
    slug: "izakaya",
    shortTitle: "居酒屋",
    title: "居酒屋バイトがつらい人向けに、きつさの原因と逃げ先を整理する",
    description:
      "居酒屋バイトがきついと感じる大学生向けに、ピーク時間、人間関係、終電、酔客対応などの負荷を整理するページです。",
    excerpt:
      "忙しさだけでなく、夜遅さや人間関係の濃さで消耗しやすい職種です。",
    intent: "居酒屋バイトで疲弊していて、次の選び方を考えたい人向け",
    eyebrow: "Job Hub",
    partnerKey: "partTimeJobs",
    ctaTitle: "夜の接客を外した求人を優先して見る",
    ctaBody: "終電や酔客対応がつらいなら、昼寄り・裏方寄りの仕事へ切り替える方が楽になります。",
    highlights: [
      "ピークの忙しさが強い",
      "夜型シフトで生活が崩れやすい",
      "人間関係の密度が高く、合わないとつらい",
    ],
    sections: [
      {
        title: "居酒屋バイトが消耗しやすいポイント",
        paragraphs: [
          "居酒屋はピークが短時間に集中しやすく、忙しさが一気に上がります。加えて、夜帯中心のシフト、人間関係の距離感、酔客対応があるため、疲れの種類が多い職種です。",
        ],
      },
      {
        title: "大学生にとって相性が悪くなりやすい条件",
        paragraphs: [
          "授業がある翌日に深夜帯が続く、終電ギリギリまでシフトがある、職場のノリが強すぎる。このあたりが重なると、時給が多少高くても続きにくくなります。",
        ],
        bullets: [
          "終電リスクがある",
          "飲み会文化が重い",
          "ピーク時に感情的な指示が飛びやすい",
        ],
      },
      {
        title: "次の候補を選ぶなら",
        paragraphs: [
          "接客が嫌いというより、夜帯やスピード勝負がきついなら、カフェ、スーパー、軽作業、単発などに変えると負荷が下がることがあります。",
        ],
      },
    ],
    relatedGuideSlugs: ["baito-yametai-daigakusei", "tanpatsu-baito-app-hikaku"],
  },
  {
    kind: "jobs",
    slug: "cafe",
    shortTitle: "カフェ",
    title: "カフェバイトの向き不向きと、大学生が失敗しにくい見方",
    description:
      "カフェバイトに憧れはあるが不安もある人向けに、忙しさ、接客密度、見えにくい負荷を整理したページです。",
    excerpt:
      "見た目よりマルチタスクが強い職種なので、向き不向きを先に見る方が安全です。",
    intent: "カフェバイトに興味はあるが、きつさや相性も知っておきたい人向け",
    eyebrow: "Job Hub",
    partnerKey: "partTimeJobs",
    ctaTitle: "接客寄りの仕事を比較しながら選ぶ",
    ctaBody: "カフェが合う人もいますが、忙しさと気配りが重い職種なので比較して決める方が安全です。",
    highlights: [
      "見た目以上にマルチタスク",
      "接客の丁寧さが求められやすい",
      "落ち着いた店と忙しい店で差が大きい",
    ],
    sections: [
      {
        title: "カフェバイトで見落としやすい負荷",
        paragraphs: [
          "カフェは落ち着いて見えることがありますが、実際にはレジ、ドリンク、清掃、ピーク時の回転対応などを同時に回す場面が多いです。",
        ],
      },
      {
        title: "向いている人・向いていない人",
        paragraphs: [
          "人と話すことがそこまで苦でなく、気配りや作業の切り替えが得意な人は比較的合いやすいです。反対に、急な切り替えや対面接客が強いストレスになる人は疲れやすくなります。",
        ],
      },
      {
        title: "失敗しにくい見方",
        paragraphs: [
          "店の規模、ピーク時間、テイクアウト比率、教育の丁寧さを面接前に見ると、かなり見極めやすくなります。",
        ],
      },
    ],
    relatedGuideSlugs: ["black-baito-miwakekata", "tanpatsu-baito-app-hikaku"],
  },
  {
    kind: "jobs",
    slug: "souko",
    shortTitle: "倉庫",
    title: "倉庫バイトがきつい人へ 体力負荷と単発の使い分けを整理する",
    description:
      "倉庫バイトが合わないと感じる人向けに、体力、単純作業、時間帯、単発活用の観点から整理したページです。",
    excerpt:
      "接客が少なくても、体力や単調さで合わないことがあります。向き不向きを分けて見ます。",
    intent: "倉庫バイトがしんどい、でも接客以外で探したい人向け",
    eyebrow: "Job Hub",
    partnerKey: "singleDayJobs",
    ctaTitle: "単発で軽作業系を試しながら相性を見る",
    ctaBody: "長期で入る前に、単発で仕事内容の感触を確かめると失敗を減らせます。",
    highlights: [
      "接客は少ないが体力負荷がある",
      "単純作業の相性差が大きい",
      "単発との相性が良い職種",
    ],
    sections: [
      {
        title: "倉庫バイトのきつさは『静かなきつさ』になりやすい",
        paragraphs: [
          "倉庫は接客が少ない一方で、立ち作業、重さ、スピード、単調さによる疲れが積み上がりやすい職種です。人間関係より体力や集中力で削られるタイプのきつさがあります。",
        ],
      },
      {
        title: "向き不向きを分けるポイント",
        paragraphs: [
          "黙々作業が好きでも、体力が合わないと長続きしません。反対に、接客が苦手で作業中心が合う人には、かなり楽になることもあります。",
        ],
      },
      {
        title: "単発との使い分け",
        paragraphs: [
          "倉庫系は単発案件も多いので、長期で入る前に試しやすいのが利点です。まず短く試し、それから長期へ行く方が安全です。",
        ],
      },
    ],
    relatedGuideSlugs: ["tanpatsu-baito-app-hikaku", "black-baito-miwakekata", "kyuryo-miharai-taisho-daigakusei"],
  },
  {
    kind: "jobs",
    slug: "famiresu",
    shortTitle: "ファミレス",
    title: "ファミレスバイトがきつい人へ 忙しさの種類と乗り越え方を整理する",
    description:
      "ファミレスバイトのきつさを感じている大学生向けに、ピーク対応、接客の多さ、土日シフトのプレッシャーなど負荷の構造を整理したページです。",
    excerpt:
      "種類の多さと回転の速さが重なるのがファミレスのきつさです。向き不向きを先に把握してください。",
    intent: "ファミレスバイトで消耗していて、理由を整理したい大学生向け",
    eyebrow: "Job Hub",
    partnerKey: "partTimeJobs",
    ctaTitle: "接客量が調整しやすい求人を比較する",
    ctaBody: "ファミレスより負荷が選びやすい職種も多いので、比較してから判断した方が安全です。",
    highlights: [
      "ピーク時間の密度が高い",
      "接客・配膳・清掃が同時に来る",
      "土日祝のシフトプレッシャーがかかりやすい",
    ],
    sections: [
      {
        title: "ファミレスバイトがきつくなりやすい構造",
        paragraphs: [
          "ファミレスは客単価が低い分、回転数で売り上げを作る業態です。ピーク時間は注文、配膳、清掃、レジが重なり、少人数でさばく必要があるため、初心者ほど消耗しやすいです。",
          "特に昼・夕のピーク帯と、土日祝のシフトが重なると、精神的な負荷もかなり上がります。学業との両立で疲れが抜けにくい大学生には、ペースを崩しやすい環境です。",
        ],
        bullets: [
          "ピーク時に複数業務が同時発生する",
          "土日が休みにくい",
          "接客の量が多く、クレーム対応もある",
        ],
      },
      {
        title: "向いている人・向いていない人",
        paragraphs: [
          "動きながら考えることが苦でなく、人と接することにそこまでストレスを感じない人は比較的合いやすい職種です。一方、マルチタスクで頭が混乱しやすい人、接客が強いストレスになる人は、消耗が先に来やすいです。",
          "店舗の規模やピーク時間帯にも大きく左右されるため、面接前に忙しさの感触を聞けると判断しやすくなります。",
        ],
      },
      {
        title: "次の選択肢を考えるなら",
        paragraphs: [
          "ファミレスがしんどい理由が接客量なら、品出しや軽作業系に切り替えるだけで負荷が大きく下がることがあります。夜帯を外すだけでも体力の回復がかなり違います。",
          "今すぐ収入をつなぐなら単発で逃げ先を確保しながら、次を落ち着いて選ぶ順番が現実的です。",
        ],
        bullets: [
          "接客を減らしたいなら倉庫・品出し系へ",
          "夜帯のつらさが主なら昼寄りの業種へ",
          "まず単発でつないで、次を選び直す",
        ],
      },
    ],
    relatedGuideSlugs: ["baito-yametai-daigakusei", "black-baito-miwakekata", "baito-sokujitsu-yameru"],
  },
  {
    kind: "jobs",
    slug: "hikkoshi",
    shortTitle: "引越し",
    title: "引越しバイトは本当にきついのか 大学生が入る前に知っておくべきこと",
    description:
      "引越しバイトを検討している大学生向けに、体力負荷の実態、時給との比較、向き不向きを整理したページです。",
    excerpt:
      "時給は高めでも、体力消耗が激しいので向き不向きが明確に出る職種です。入る前に実態を把握してください。",
    intent: "引越しバイトの実態を知ってから判断したい大学生向け",
    eyebrow: "Job Hub",
    partnerKey: "singleDayJobs",
    ctaTitle: "体力と時給のバランスが合う単発で試してみる",
    ctaBody: "長期で入る前に、単発で体力負荷の感触を確かめると失敗を減らせます。",
    highlights: [
      "時給は高めだが体力消耗がかなり大きい",
      "単発で試しやすい職種",
      "繁忙期と閑散期の差が大きい",
    ],
    sections: [
      {
        title: "引越しバイトの体力負荷の実態",
        paragraphs: [
          "引越しバイトは、重い荷物の運搬、階段の上り下り、長時間の立ち作業が続くため、体力の消耗が他の職種より大きくなりやすいです。特に繁忙期（3月・4月）は1日の移動件数が増え、肉体的な疲れが翌日以降まで残ることがあります。",
          "一方で、接客の負荷は少なく、指示に従って動く仕事中心なので、対面ストレスは比較的低い職種です。",
        ],
        bullets: [
          "体力・筋力への負荷が大きい",
          "繁忙期は拘束時間が長くなりやすい",
          "接客ストレスは少ない",
        ],
      },
      {
        title: "時給との費用対効果を見る",
        paragraphs: [
          "引越しバイトは時給が高めに設定されていることが多いですが、消耗した後の翌日・翌々日を含めたトータルで考えると、必ずしも割がいいとは言えないこともあります。特に体力に不安がある場合や、翌日に授業や試験がある場合は慎重に判断してください。",
          "単発で数回試してから、体力的に無理がないと感じれば続けるという判断が現実的です。",
        ],
      },
      {
        title: "向いている人・向いていない人",
        paragraphs: [
          "体を動かすことが好きで、黙々と作業するのが苦でない人には合いやすい職種です。接客やマルチタスクより、体力勝負の方が向いているという人には選択肢になります。",
          "逆に、体力に自信がない、腰や膝に不安がある、翌日の学業に支障が出るという人には長期で続けるのは難しいです。",
        ],
        bullets: [
          "体を動かすのが好き → 向いている可能性が高い",
          "体力に不安がある → 単発で試してから判断",
          "翌日に影響が出やすい → 頻度に注意",
        ],
      },
    ],
    relatedGuideSlugs: ["tanpatsu-baito-app-hikaku", "baito-yametai-daigakusei", "kyuryo-miharai-taisho-daigakusei"],
  },
  {
    kind: "jobs",
    slug: "supermarket",
    shortTitle: "スーパー",
    title: "スーパーのバイトは楽なのか 大学生向けに向き不向きを整理する",
    description:
      "スーパーのバイトを検討している大学生向けに、部門差、忙しさ、接客量、続けやすさを整理したページです。",
    excerpt:
      "スーパーは比較的安定して見えますが、部門ごとの差がかなり大きい職種です。",
    intent: "スーパーの仕事が自分に合うか見たい大学生向け",
    eyebrow: "Job Hub",
    partnerKey: "partTimeJobs",
    ctaTitle: "接客量と部門差を見ながら候補を比較する",
    ctaBody: "レジ、品出し、惣菜で負荷はかなり変わるので、職種名だけで決めない方が安全です。",
    highlights: [
      "部門差が大きい",
      "夜遅くなりすぎにくい",
      "比較的安定して続けやすいことが多い",
    ],
    sections: [
      {
        title: "スーパーは『どの部門か』でかなり違う",
        paragraphs: [
          "スーパーのレジ、品出し、惣菜、ベーカリーは、同じ店舗でも仕事内容がかなり違います。求人を見るときは、店名より先に部門を確認した方が失敗が減ります。",
        ],
      },
      {
        title: "大学生に向きやすい条件",
        paragraphs: [
          "夜が深すぎない、教育の流れが見えやすい、仕事内容が明確。この3つが揃うと、初バイトでも比較的入りやすいことが多いです。",
        ],
      },
      {
        title: "選び方の軸",
        paragraphs: [
          "接客を避けたいなら品出し寄り、対面が平気ならレジ寄りといった形で、苦手な負荷を先に避けるのが大事です。",
        ],
      },
    ],
    relatedGuideSlugs: ["black-baito-miwakekata", "baito-yametai-daigakusei"],
  },
];

const areaHubs: HubEntry[] = [
  {
    kind: "areas",
    slug: "tokyo",
    shortTitle: "東京",
    title: "東京で大学生が危ないバイトを避けながら探すための考え方",
    description:
      "東京で大学生がバイトを探すときに、案件数の多さに流されず、危ない求人を避けて比較するための地域ハブです。",
    excerpt:
      "求人が多い都市ほど、条件だけで飛びつかず、勤務地・終電・仕事内容の透明さで絞る方が安全です。",
    intent: "東京で大学生向けの安全寄りなバイト選びをしたい人向け",
    eyebrow: "Area Hub",
    partnerKey: "partTimeJobs",
    ctaTitle: "東京で比較しやすい求人から先に見る",
    ctaBody: "案件数が多い都市ほど、条件の透明さがある求人から比較した方が失敗が減ります。",
    highlights: [
      "案件数が多いぶん、見極めが重要",
      "通学導線と終電を先に見る",
      "繁華街案件は時間帯も要確認",
    ],
    sections: [
      {
        title: "東京で探すときに起きやすい失敗",
        paragraphs: [
          "東京は案件数が多いので、時給や駅名だけで選びやすくなります。ただし、移動時間、終電、繁華街の時間帯、仕事内容の差を見ないと、想像より消耗しやすいです。",
        ],
      },
      {
        title: "大学生向けの絞り方",
        paragraphs: [
          "通学路から大きく外れない、夜が深すぎない、仕事内容が具体的。この3つで絞るだけでも、かなり安全寄りになります。",
        ],
      },
      {
        title: "東京で口コミを見るときの前提",
        paragraphs: [
          "同じチェーンでも店舗差が大きいので、地域や駅名、勤務時間帯をセットで読む方が判断しやすくなります。",
        ],
      },
    ],
    relatedGuideSlugs: ["black-baito-miwakekata", "tanpatsu-baito-app-hikaku"],
  },
  {
    kind: "areas",
    slug: "osaka",
    shortTitle: "大阪",
    title: "大阪で大学生がバイトを選ぶときに、危ない求人を避けるための見方",
    description:
      "大阪エリアで大学生がバイトを探すときの地域ハブ。繁華街案件、夜帯、通学導線の見方を整理しています。",
    excerpt:
      "にぎやかなエリアほど、仕事内容と時間帯を具体的に確認する方が安全です。",
    intent: "大阪で大学生向けに失敗しにくいバイト選びをしたい人向け",
    eyebrow: "Area Hub",
    partnerKey: "partTimeJobs",
    ctaTitle: "大阪で通いやすい求人から先に見る",
    ctaBody: "駅の知名度より、通学との相性と業務の見えやすさで絞る方が続きやすいです。",
    highlights: [
      "繁華街エリアは時間帯を確認",
      "通学路との相性を優先",
      "接客量が多い案件は向き不向きが分かれやすい",
    ],
    sections: [
      {
        title: "大阪で気をつけたい条件",
        paragraphs: [
          "繁華街の案件は目立ちやすいですが、忙しさや時間帯の負荷も高くなりがちです。仕事内容が曖昧なまま時給だけが強い案件は避けた方が安全です。",
        ],
      },
      {
        title: "大学生向けの絞り込み軸",
        paragraphs: [
          "通学導線、終電、仕事内容の具体性。この3つで見ると、候補の質がかなり上がります。",
        ],
      },
      {
        title: "口コミとの合わせ方",
        paragraphs: [
          "口コミを見るときは、駅名よりも『どんな忙しさだったか』『どんな人間関係だったか』に注目すると、地域差が見えやすくなります。",
        ],
      },
    ],
    relatedGuideSlugs: ["black-baito-miwakekata", "baito-yametai-daigakusei"],
  },
  {
    kind: "areas",
    slug: "nagoya",
    shortTitle: "名古屋",
    title: "名古屋で大学生がバイトを選ぶときの安全寄りな絞り方",
    description:
      "名古屋で大学生がバイトを探すときに、通学しやすさ、職種差、夜帯の負荷を見ながら選ぶための地域ハブです。",
    excerpt:
      "生活圏に近いか、仕事内容が見えやすいかで比較する方が失敗を減らせます。",
    intent: "名古屋で失敗しにくいバイト選びをしたい大学生向け",
    eyebrow: "Area Hub",
    partnerKey: "partTimeJobs",
    ctaTitle: "名古屋で生活圏に近い候補から見る",
    ctaBody: "通いやすさが悪いと、仕事自体が合っていても続きにくくなります。",
    highlights: [
      "生活圏との相性が重要",
      "職種差を先に見る",
      "夜帯負荷を軽く見ない",
    ],
    sections: [
      {
        title: "地域で選ぶときに先に見ること",
        paragraphs: [
          "名古屋でも、駅の近さだけでなく、学校からの動線と帰宅時間を見た方が現実的です。仕事の内容より移動で消耗するケースもあります。",
        ],
      },
      {
        title: "向いている求人の見え方",
        paragraphs: [
          "仕事内容が具体的、時間帯が明確、教育が見えやすい。この3つが揃う求人は大学生でも入りやすい傾向があります。",
        ],
      },
    ],
    relatedGuideSlugs: ["tanpatsu-baito-app-hikaku", "black-baito-miwakekata"],
  },
  {
    kind: "areas",
    slug: "yokohama",
    shortTitle: "横浜",
    title: "横浜で大学生がバイトを選ぶときに失敗しにくくなる考え方",
    description:
      "横浜エリアで大学生がバイトを探すときに、みなとみらい・関内・横浜駅周辺の繁華街案件と通学動線の見方を整理した地域ハブです。",
    excerpt:
      "観光・飲食が多い地域なので、時間帯と仕事内容を具体的に確認してから応募した方が安全です。",
    intent: "横浜で失敗しにくいバイト選びをしたい大学生向け",
    eyebrow: "Area Hub",
    partnerKey: "partTimeJobs",
    ctaTitle: "横浜で通いやすい求人から先に比較する",
    ctaBody: "駅の多いエリアだからこそ、通学動線との相性と業務の透明さで絞る方が続きやすいです。",
    highlights: [
      "飲食・観光系の案件が多く時間帯確認が重要",
      "みなとみらい・関内・横浜駅で状況が異なる",
      "通学路と終電を先に見る",
    ],
    sections: [
      {
        title: "横浜エリアの求人で見落としやすい点",
        paragraphs: [
          "横浜はみなとみらい、関内、横浜駅周辺、桜木町など複数のエリアに案件が分散しています。駅名だけで決めると、実際の移動時間が想定より長くなることがあります。",
          "飲食・観光系の案件が多いエリアなので、夜帯や週末シフトの負荷が高くなりやすい傾向があります。仕事内容と時間帯をセットで確認することが重要です。",
        ],
        bullets: [
          "勤務地の最寄り駅と乗り換えを具体的に確認する",
          "夜帯の終電を先に調べる",
          "繁華街案件は忙しさのピークを確認する",
        ],
      },
      {
        title: "横浜で大学生向けに安全な絞り方",
        paragraphs: [
          "通学路から大きく外れない、夜が深くなりすぎない、仕事内容が具体的。この3つで絞ると候補の質が上がります。大学のキャンパスから何分かかるかを基準に動線を確認してください。",
        ],
        bullets: [
          "通学路との動線を先に確認",
          "終電・夜帯の深さを確認",
          "飲食系は忙しさの時間帯を聞く",
        ],
      },
      {
        title: "口コミを読むときの前提",
        paragraphs: [
          "横浜は同じチェーン店でも店舗によって状況が大きく違います。口コミを見るときはエリアや店舗名と合わせて読む方が参考になります。",
        ],
      },
    ],
    relatedGuideSlugs: ["black-baito-miwakekata", "tanpatsu-baito-app-hikaku"],
  },
  {
    kind: "areas",
    slug: "sapporo",
    shortTitle: "札幌",
    title: "札幌で大学生がバイトを探すときに安全寄りな選び方をするための整理",
    description:
      "札幌で大学生がバイトを探すときの地域ハブ。冬の交通・深夜帯リスク・すすきの周辺案件の注意点を整理しています。",
    excerpt:
      "冬場の交通リスクと深夜帯の判断が、札幌ならではの注意ポイントです。",
    intent: "札幌で大学生向けに安全なバイトを選びたい人向け",
    eyebrow: "Area Hub",
    partnerKey: "partTimeJobs",
    ctaTitle: "札幌で通いやすく続けやすい求人を比較する",
    ctaBody: "冬の移動を踏まえた動線と、夜帯の深さを先に確認してから応募した方が失敗が減ります。",
    highlights: [
      "冬の交通・移動リスクを先に見る",
      "すすきの周辺は時間帯を要確認",
      "通学動線と積雪期の移動時間をセットで考える",
    ],
    sections: [
      {
        title: "札幌で気をつけたい冬のリスク",
        paragraphs: [
          "札幌は冬期間の積雪・凍結により、移動時間と体力消耗が増えます。バイト終わりに終電を逃すリスクや、悪天候で帰宅が困難になる状況も想定しておく必要があります。夜帯が深い案件は、冬場のリスクを踏まえて判断してください。",
          "夏と冬で通勤にかかる時間が大きく変わる地域なので、冬のシミュレーションをしてから応募する方が安全です。",
        ],
        bullets: [
          "冬場の移動時間を夏より長めに見積もる",
          "終電・終バスを余裕を持って確認する",
          "深夜帯は特に慎重に判断する",
        ],
      },
      {
        title: "大学生向けの絞り込みの軸",
        paragraphs: [
          "仕事内容が具体的、夜が深すぎない、学校からの動線が現実的。この3つを軸にすると、冬場でも続けやすい候補が絞りやすくなります。",
          "すすきの周辺の飲食・接客系は時給は高めでも時間帯リスクがあります。最初の1本目は昼寄りの案件を選ぶ方が安全です。",
        ],
      },
      {
        title: "口コミとの合わせ方",
        paragraphs: [
          "札幌は地下街やバスの動線が独特なので、口コミを読むときは移動や気候も含めた体験談を参考にしてください。",
        ],
      },
    ],
    relatedGuideSlugs: ["baito-yametai-daigakusei", "black-baito-miwakekata"],
  },
  {
    kind: "areas",
    slug: "fukuoka",
    shortTitle: "福岡",
    title: "福岡で大学生がバイトを探すときに見ておきたい安全ポイント",
    description:
      "福岡で大学生がバイトを探すときに、アクセス、時間帯、仕事内容の具体性を軸に比較するための地域ハブです。",
    excerpt:
      "通いやすさと仕事内容の明確さを先に見ると、地域選びの失敗を減らせます。",
    intent: "福岡で大学生向けに安全寄りのバイトを探したい人向け",
    eyebrow: "Area Hub",
    partnerKey: "partTimeJobs",
    ctaTitle: "福岡で比較しやすい求人を見る",
    ctaBody: "場所の印象より、通いやすさと仕事内容の透明さで比較した方が続きやすいです。",
    highlights: [
      "通学との相性を優先",
      "時間帯負荷を確認",
      "仕事内容が具体的な求人を選ぶ",
    ],
    sections: [
      {
        title: "福岡で見落としやすい点",
        paragraphs: [
          "都市規模が大きすぎない分、店舗や案件の差が見えにくく感じることがあります。だからこそ、仕事内容の具体性や教育の流れを重視した方が安全です。",
        ],
      },
      {
        title: "比較の軸",
        paragraphs: [
          "通いやすさ、夜の遅さ、対面接客量。この3つを基準にすれば、大学生でもかなり判断しやすくなります。",
        ],
      },
    ],
    relatedGuideSlugs: ["baito-yametai-daigakusei", "black-baito-miwakekata"],
  },
];

const appHubs: HubEntry[] = [
  {
    kind: "apps",
    slug: "timee",
    shortTitle: "タイミー",
    title: "タイミーを大学生が使う前に見たいポイントと、向いている使い方",
    description:
      "タイミー系の単発アプリを大学生が使う前に、向いている場面、失敗しやすい使い方、注意点を整理した比較ページです。",
    excerpt:
      "急ぎで働きたいときに強い一方、仕事内容確認を飛ばすと消耗しやすいタイプのサービスです。",
    intent: "すぐ働ける単発アプリを検討している大学生向け",
    eyebrow: "App Hub",
    partnerKey: "singleDayJobs",
    ctaTitle: "今すぐ働ける単発候補を比較する",
    ctaBody: "急いでいるときほど、仕事内容と勤務の流れが見えやすい候補から比較した方が失敗が減ります。",
    highlights: [
      "即日性と手軽さが強み",
      "仕事内容確認を飛ばすと危ない",
      "逃げ先・つなぎとして使いやすい",
    ],
    sections: [
      {
        title: "向いている場面",
        paragraphs: [
          "今のバイトがつらくて一旦距離を置きたい、今週の生活費をつなぎたい、長期前に仕事の感触を試したい。こうした場面では単発アプリはかなり強い選択肢です。",
        ],
      },
      {
        title: "失敗しやすい使い方",
        paragraphs: [
          "仕事内容を見ずに応募する、移動時間を軽く見る、授業との兼ね合いを見ずに入れる。この3つはかなり失敗しやすいです。",
        ],
      },
      {
        title: "大学生向けの使い方",
        paragraphs: [
          "逃げ先やつなぎとして使い、長期の本命は別で探す。この二段構えにすると、単発の便利さを活かしやすくなります。",
        ],
      },
    ],
    relatedGuideSlugs: ["tanpatsu-baito-app-hikaku", "baito-yametai-daigakusei"],
  },
  {
    kind: "apps",
    slug: "sharefull",
    shortTitle: "シェアフル",
    title: "シェアフル系アプリを大学生が使う前に見たい安全ポイント",
    description:
      "シェアフル系の単発アプリを使う前に、案件の見方、向いている使い方、失敗を減らすコツを整理したページです。",
    excerpt:
      "単発は便利ですが、比較軸なしで入ると次の日にまた消耗します。",
    intent: "単発アプリの安全な使い方を知りたい大学生向け",
    eyebrow: "App Hub",
    partnerKey: "singleDayJobs",
    ctaTitle: "仕事内容が見えやすい単発候補を先に見る",
    ctaBody: "案件数だけでなく、仕事内容の具体性が見える候補から選ぶ方が安全です。",
    highlights: [
      "単発の使い方次第で満足度が変わる",
      "案件の説明量が重要",
      "長期と分けて使うと失敗しにくい",
    ],
    sections: [
      {
        title: "大学生が見るべきポイント",
        paragraphs: [
          "仕事内容、勤務フロー、通いやすさ、キャンセルルール。この4つを見れば、かなり比較しやすくなります。",
        ],
      },
      {
        title: "危ない使い方を避ける",
        paragraphs: [
          "説明が短すぎる案件に飛びつくより、少し地味でも仕事内容が見える案件の方が失敗は少ないです。",
        ],
      },
    ],
    relatedGuideSlugs: ["tanpatsu-baito-app-hikaku", "black-baito-miwakekata"],
  },
  {
    kind: "apps",
    slug: "baitoru",
    shortTitle: "バイトル系",
    title: "バイトル系の総合求人で大学生が失敗しにくく探すための見方",
    description:
      "総合求人サービスを使って長めのバイトを探すときに、大学生が見ておきたい比較軸を整理したページです。",
    excerpt:
      "単発ではなく、次の本命バイトを探すときの比較軸を持つためのハブです。",
    intent: "次の長めのバイト候補を探したい大学生向け",
    eyebrow: "App Hub",
    partnerKey: "partTimeJobs",
    ctaTitle: "次の本命候補を比較する",
    ctaBody: "今の職場が合わないなら、同じ失敗を避けるために条件の見方を変える方が早いです。",
    highlights: [
      "長期候補を探すのに向く",
      "条件の見方を変えると失敗が減る",
      "職種比較と相性が良い",
    ],
    sections: [
      {
        title: "総合求人で見るべき条件",
        paragraphs: [
          "仕事内容、教育の流れ、シフトの柔軟さ、勤務地。これらが具体的な求人ほど、大学生でも入りやすいです。",
        ],
      },
      {
        title: "時給だけで選ばない",
        paragraphs: [
          "時給は大事ですが、合わない仕事を選ぶと結局続きません。続けやすさを一緒に見る方が収支も安定しやすいです。",
        ],
      },
    ],
    relatedGuideSlugs: ["black-baito-miwakekata", "baito-yametai-daigakusei", "kyuryo-miharai-taisho-daigakusei"],
  },
  {
    kind: "apps",
    slug: "indeed",
    shortTitle: "Indeed系",
    title: "Indeed系の求人で大学生が失敗しにくく探すための比較軸",
    description:
      "Indeed系の大規模求人サービスを使うときに、大学生が危ない求人を避けながら比較する方法を整理したページです。",
    excerpt:
      "案件数が多いだけに、絞り方を持っていないと危ない求人に当たりやすくなります。",
    intent: "Indeed系の求人サービスで安全なバイトを探したい大学生向け",
    eyebrow: "App Hub",
    partnerKey: "partTimeJobs",
    ctaTitle: "条件が見えやすい求人から先に比較する",
    ctaBody: "件数が多いサービスほど、仕事内容と勤務条件が具体的な求人から絞る方が安全です。",
    highlights: [
      "件数の多さが強みでもあり落とし穴でもある",
      "仕事内容と条件の具体性で絞る",
      "バイト・パート専用サービスと使い分けが重要",
    ],
    sections: [
      {
        title: "Indeed系を使うときに起きやすい失敗",
        paragraphs: [
          "Indeed系は正社員・契約社員・バイトが混在しているため、条件で絞らないと自分に合わない案件が大量に表示されます。検索条件を大学生向けに絞り込む手間を省くと、危ない求人や条件の曖昧な案件に当たりやすくなります。",
          "また、掲載元の情報量にばらつきがあります。求人票の情報が薄い場合は、別の手段で補足情報を確認してから応募する方が安全です。",
        ],
        bullets: [
          "絞り込みを甘くすると条件が合わない案件ばかりになる",
          "仕事内容の説明が薄い案件は要注意",
          "口コミ・評判を合わせて確認する",
        ],
      },
      {
        title: "大学生向けの絞り込みの軸",
        paragraphs: [
          "バイト・パート、週2〜3日、時間帯（昼寄りか夜寄りか）、勤務地（自宅または大学から何分か）。この4つを検索条件に入れると、候補の質がかなり変わります。",
          "仕事内容の説明量も判断材料になります。業務内容、研修の有無、シフトのルールが具体的に書かれている案件を優先してください。",
        ],
        bullets: [
          "バイト・パートで絞る",
          "勤務地を通学動線で絞る",
          "仕事内容の説明が具体的か確認する",
          "時給だけで飛びつかない",
        ],
      },
      {
        title: "バイト専用サービスとの使い分け",
        paragraphs: [
          "Indeed系は総合的な求人プラットフォームなので、バイト・パート専用サービスと使い分けるのが効率的です。バイトに特化したサービスの方が、条件が見えやすく比較しやすいことも多いです。",
          "まずバイト専用サービスで候補を絞り、そこで見つからない場合にIndeed系で補完するというフローが失敗しにくいです。",
        ],
      },
    ],
    relatedGuideSlugs: ["black-baito-miwakekata", "tanpatsu-baito-app-hikaku", "baito-sokujitsu-yameru"],
  },
  {
    kind: "apps",
    slug: "townwork",
    shortTitle: "タウンワーク系",
    title: "タウンワーク系の求人を大学生が安全寄りに比較するための見方",
    description:
      "総合求人サイトで大学生がバイトを探すときに、求人票の読み方と危ない募集の避け方を整理したページです。",
    excerpt:
      "求人票をちゃんと読むだけで避けられる失敗はかなりあります。",
    intent: "総合求人サイトで危ない募集を避けたい大学生向け",
    eyebrow: "App Hub",
    partnerKey: "partTimeJobs",
    ctaTitle: "条件が見えやすい求人から比較する",
    ctaBody: "総合求人は数が多いぶん、仕事内容とシフト条件が見えやすい案件から比べる方が安全です。",
    highlights: [
      "求人票の読み方が重要",
      "仕事内容の曖昧さは要注意",
      "比較しながら絞るのに向く",
    ],
    sections: [
      {
        title: "求人票で先に見ること",
        paragraphs: [
          "業務内容、勤務時間、研修、交通費、給与の流れ。この基本が薄い求人は避けた方が安全です。",
        ],
      },
      {
        title: "大学生が見落としやすい点",
        paragraphs: [
          "授業との両立、試験期間の調整、終電。このあたりが曖昧だと後からかなり負担になります。",
        ],
      },
    ],
    relatedGuideSlugs: ["black-baito-miwakekata", "tanpatsu-baito-app-hikaku", "kyuryo-miharai-taisho-daigakusei"],
  },
];

const allHubs = [...jobHubs, ...areaHubs, ...appHubs];

export function getAllHubs(): HubEntry[] {
  return allHubs;
}

export function getJobHubs(): HubEntry[] {
  return jobHubs;
}

export function getAreaHubs(): HubEntry[] {
  return areaHubs;
}

export function getAppHubs(): HubEntry[] {
  return appHubs;
}

export function getHubPath(entry: HubEntry): string {
  return `/${entry.kind}/${entry.slug}`;
}

export function getJobHubBySlug(slug: string): HubEntry | undefined {
  return jobHubs.find((entry) => entry.slug === slug);
}

export function getAreaHubBySlug(slug: string): HubEntry | undefined {
  return areaHubs.find((entry) => entry.slug === slug);
}

export function getAppHubBySlug(slug: string): HubEntry | undefined {
  return appHubs.find((entry) => entry.slug === slug);
}

export function getSiblingHubs(kind: HubKind, currentSlug: string, limit = 3): HubEntry[] {
  const source = allHubs.filter((entry) => entry.kind === kind && entry.slug !== currentSlug);
  return source.slice(0, limit);
}
