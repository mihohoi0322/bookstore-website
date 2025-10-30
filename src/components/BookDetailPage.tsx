import { ArrowLeft } from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Book } from '@/lib/types';
import { booksData } from '@/lib/data';
import { toast } from 'sonner';
import { useMemo } from 'react';

interface BookDetailPageProps {
  bookId: string;
  onBack: () => void;
}

export function BookDetailPage({ bookId, onBack }: BookDetailPageProps) {
  const [customBooks] = useKV<Book[]>('books-data', []);

  const book = useMemo(() => {
    const allBooks = customBooks && customBooks.length > 0 ? customBooks : booksData;
    return allBooks.find(b => b.id === bookId);
  }, [bookId, customBooks]);

  if (!book) {
    toast.error('本が見つかりませんでした');
    onBack();
    return null;
  }

  const statusConfig = {
    available: { label: '販売中', className: 'bg-secondary text-secondary-foreground' },
    'coming-soon': { label: '予約受付中', className: 'bg-accent/20 text-accent-foreground' },
    'sold-out': { label: '完売', className: 'bg-muted text-muted-foreground' },
  };

  const status = statusConfig[book.status];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-8 -ml-2 hover:bg-muted"
        >
          <ArrowLeft className="mr-2" size={20} />
          一覧に戻る
        </Button>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden shadow-lg">
            {book.image ? (
              <img
                src={book.image}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="text-8xl mb-4">📖</div>
                  <div className="text-lg">画像準備中</div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="mb-4">
              <Badge className={`${status.className} px-4 py-1`}>
                {status.label}
              </Badge>
            </div>

            <h1 className="text-4xl font-semibold mb-3">{book.title}</h1>
            <p className="text-xl text-muted-foreground mb-6">{book.author}</p>

            <div className="mb-6">
              <p className="text-3xl font-semibold text-primary">
                ¥{book.price.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mt-1">税込価格</p>
            </div>

            <Separator className="my-6" />

            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3">ジャンル・タグ</h3>
              <div className="flex flex-wrap gap-2">
                {book.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="px-3 py-1">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">出版年</h3>
              <p className="text-muted-foreground">{book.publicationYear}年</p>
            </div>

            <Separator className="my-6" />

            <div>
              <h3 className="font-semibold text-lg mb-4">作品について</h3>
              <div className="prose prose-sm max-w-none">
                {book.fullDescription.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-foreground/90 leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {book.status === 'available' && (
              <div className="mt-8 p-6 bg-accent/10 rounded-lg border border-accent/20">
                <p className="text-sm text-foreground/80">
                  この本は現在販売中です。詳細は店舗までお問い合わせください。
                </p>
              </div>
            )}

            {book.status === 'coming-soon' && (
              <div className="mt-8 p-6 bg-secondary/50 rounded-lg border border-secondary">
                <p className="text-sm text-foreground/80">
                  この本は予約受付中です。入荷次第お知らせいたします。
                </p>
              </div>
            )}

            {book.status === 'sold-out' && (
              <div className="mt-8 p-6 bg-muted rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">
                  この本は完売いたしました。再入荷の予定は未定です。
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
