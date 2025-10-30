import { Separator } from '@/components/ui/separator';
import teamLogo from '@/assets/images/teamlogo.png';

export function AboutPage() {
  const history = [
    { year: 2018, event: 'Demo-Createチーム結成。Webアプリケーション開発をスタート' },
    { year: 2019, event: '初のECサイトプロジェクト完了。地域のカフェをオンライン展開' },
    { year: 2020, event: 'リモートワーク体制確立。全国のクライアントとの協業開始' },
    { year: 2021, event: '書店向けシステム開発に着手。本との出会いをデジタルで支援' },
    { year: 2022, event: 'ほんのわ書店プロジェクト開始。温かみのあるデザインを追求' },
    { year: 2023, event: '個人書店向けプラットフォーム展開。全国10店舗との提携実現' },
    { year: 2024, event: '新機能リリース予定。より豊かな読書体験の提供を目指して' },
  ];

  const members = [
    {
      role: 'プロジェクトマネージャー',
      description: 'チーム全体の統括とクライアントとの橋渡し役',
    },
    {
      role: 'デザイナー',
      description: '温かみのあるUIデザインとユーザー体験の設計',
    },
    {
      role: 'フロントエンドエンジニア',
      description: 'React/TypeScriptを用いた高品質な実装',
    },
    {
      role: 'バックエンドエンジニア',
      description: '安定したシステム基盤の構築と運用',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-16 text-center">
          <div className="flex justify-center mb-8">
            <img 
              src={teamLogo} 
              alt="Demo-Create" 
              className="h-24 w-auto object-contain"
            />
          </div>
          <h2 className="text-4xl font-semibold mb-4">About Us</h2>
          <p className="text-xl text-muted-foreground">
            私たちDemo-Createについて
          </p>
        </div>

        <section className="mb-16">
          <div className="bg-card rounded-lg p-8 shadow-sm">
            <h3 className="text-2xl font-semibold mb-6">ミッション</h3>
            <p className="text-lg leading-relaxed text-foreground/90 mb-6">
              Demo-Createは、温かみのあるデジタル体験を通じて、人と本、人と人をつなぐことを使命としています。
            </p>
            <p className="leading-relaxed text-foreground/80">
              私たちは、書店がただの本の販売場所ではなく、文化を育み、コミュニティを形成する大切な場所であると考えています。
              デジタル技術の力で、その温かな体験をより多くの人々に届け、地域の書店と読者の架け橋となることを目指しています。
            </p>
          </div>
        </section>

        <Separator className="my-12" />

        <section className="mb-16">
          <h3 className="text-2xl font-semibold mb-8 text-center">チーム構成</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {members.map((member, index) => (
              <div
                key={index}
                className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <h4 className="font-semibold text-lg mb-2 text-primary">
                  {member.role}
                </h4>
                <p className="text-sm text-foreground/80">{member.description}</p>
              </div>
            ))}
          </div>
        </section>

        <Separator className="my-12" />

        <section className="mb-16">
          <h3 className="text-2xl font-semibold mb-8 text-center">沿革</h3>
          <div className="space-y-6">
            {history.map((item, index) => (
              <div key={index} className="flex gap-6 group">
                <div className="flex-shrink-0 w-20 text-right">
                  <span className="text-xl font-semibold text-primary">
                    {item.year}
                  </span>
                </div>
                <div className="flex-shrink-0 w-px bg-border relative">
                  <div className="absolute top-2 -left-1.5 w-3 h-3 rounded-full bg-primary group-hover:scale-125 transition-transform" />
                </div>
                <div className="flex-1 pb-8">
                  <p className="text-foreground/90 leading-relaxed">{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Separator className="my-12" />

        <section className="text-center">
          <div className="bg-accent/10 rounded-lg p-8 border border-accent/20">
            <h3 className="text-2xl font-semibold mb-4">お問い合わせ</h3>
            <p className="text-foreground/80 mb-2">
              プロジェクトのご相談や、ほんのわ書店システムの導入をご検討の方は、
            </p>
            <p className="text-foreground/80 mb-6">
              お気軽にお問い合わせください。
            </p>
            <div className="inline-block bg-card px-6 py-3 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Email</p>
              <p className="font-medium text-primary">contact@demo-create.example</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
