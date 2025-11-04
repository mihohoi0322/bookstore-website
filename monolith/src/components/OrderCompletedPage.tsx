import { useMemo, useEffect } from 'react';
import { usePersistentState } from '@/hooks/usePersistentState';
import { CheckCircle, Package, EnvelopeSimple } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Book, Order } from '@/lib/types';
import { booksData } from '@/lib/data';

interface OrderCompletedPageProps {
  orderId: string;
  onReturnToCatalog: () => void;
}

export function OrderCompletedPage({ orderId, onReturnToCatalog }: OrderCompletedPageProps) {
  const [orders] = usePersistentState<Order[]>('orders', []);
  const [customBooks] = usePersistentState<Book[]>('books-data', []);
  const [, setCart] = usePersistentState<any[]>('shopping-cart', []);

  useEffect(() => {
    setCart(() => []);
  }, [setCart]);

  const allBooks = useMemo(() => {
    return customBooks && customBooks.length > 0 ? customBooks : booksData;
  }, [customBooks]);

  const order = useMemo(() => {
    return orders?.find(o => o.id === orderId);
  }, [orders, orderId]);

  const orderItems = useMemo(() => {
    if (!order) return [];
    return order.items.map(item => {
      const book = allBooks.find(b => b.id === item.bookId);
      return { ...item, book };
    }).filter(item => item.book);
  }, [order, allBooks]);

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold mb-3">注文情報が見つかりません</h2>
            <Button onClick={onReturnToCatalog}>
              書籍一覧へ
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-secondary rounded-full mb-6">
            <CheckCircle size={48} weight="fill" className="text-primary" />
          </div>
          <h1 className="text-4xl font-semibold mb-3">ご注文ありがとうございます</h1>
          <p className="text-xl text-muted-foreground">
            注文が正常に完了しました
          </p>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">注文番号</p>
              <p className="text-xl font-semibold">{order.id}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">注文日時</p>
              <p className="text-lg">
                {new Date(order.createdAt).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Package size={20} className="text-primary" />
                <h2 className="text-lg font-semibold">注文内容</h2>
              </div>
              <div className="space-y-3">
                {orderItems.map(item => (
                  <div key={item.bookId} className="flex gap-4">
                    <div className="w-16 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                      {item.book?.image ? (
                        <img
                          src={item.book.image}
                          alt={item.book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          📖
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium">{item.book?.title}</p>
                      <p className="text-sm text-muted-foreground">{item.book?.author}</p>
                      <p className="text-sm text-muted-foreground">数量: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ¥{((item.book?.price || 0) * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex items-center gap-2 mb-3">
                <EnvelopeSimple size={20} className="text-primary" />
                <h2 className="text-lg font-semibold">配送先情報</h2>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="font-medium mb-1">{order.customerName}</p>
                <p className="text-sm text-muted-foreground mb-2">{order.email}</p>
                <p className="text-sm">{order.address}</p>
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">お支払い方法</span>
                <span>クレジットカード (****{order.cardLast4})</span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold">
                <span>合計金額</span>
                <span className="text-primary">¥{order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="bg-accent/10 border border-accent/20 rounded-lg p-6 mb-6">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <EnvelopeSimple size={20} />
            確認メールを送信しました
          </h3>
          <p className="text-sm text-muted-foreground">
            ご登録のメールアドレス（{order.email}）に注文確認メールを送信しました。
            配送準備が整い次第、発送通知メールをお送りいたします。
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <Button onClick={onReturnToCatalog} size="lg">
            書籍一覧に戻る
          </Button>
        </div>
      </div>
    </div>
  );
}
