import { useMemo } from 'react';
import { usePersistentState } from '@/hooks/usePersistentState';
import { ArrowLeft, Trash, Plus, Minus, ShoppingCart } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Book, CartItem } from '@/lib/types';
import { booksData } from '@/lib/data';
import { toast } from 'sonner';

interface CartPageProps {
  onBack: () => void;
  onCheckout: () => void;
}

export function CartPage({ onBack, onCheckout }: CartPageProps) {
  const [cart, setCart] = usePersistentState<CartItem[]>('shopping-cart', []);
  const [customBooks] = usePersistentState<Book[]>('books-data', []);

  const allBooks = useMemo(() => {
    return customBooks && customBooks.length > 0 ? customBooks : booksData;
  }, [customBooks]);

  const cartItems = useMemo(() => {
    if (!cart) return [];
    return cart.map(item => {
      const book = allBooks.find(b => b.id === item.bookId);
      return { ...item, book };
    }).filter(item => item.book);
  }, [cart, allBooks]);

  const totalAmount = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      return sum + (item.book?.price || 0) * item.quantity;
    }, 0);
  }, [cartItems]);

  const updateQuantity = (bookId: string, delta: number) => {
    setCart((currentCart) => {
      if (!currentCart) return [];
      const newCart = currentCart.map(item => {
        if (item.bookId === bookId) {
          const newQuantity = item.quantity + delta;
          return { ...item, quantity: Math.max(1, newQuantity) };
        }
        return item;
      });
      return newCart;
    });
  };

  const removeItem = (bookId: string) => {
    setCart((currentCart) => {
      if (!currentCart) return [];
      return currentCart.filter(item => item.bookId !== bookId);
    });
    toast.success('カートから削除しました');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-8 -ml-2 hover:bg-muted"
          >
            <ArrowLeft className="mr-2" size={20} />
            書籍一覧に戻る
          </Button>

          <div className="text-center py-20">
            <ShoppingCart size={80} className="mx-auto text-muted-foreground mb-6" />
            <h2 className="text-2xl font-semibold mb-3">カートは空です</h2>
            <p className="text-muted-foreground mb-8">
              書籍一覧から商品をカートに追加してください
            </p>
            <Button onClick={onBack}>
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
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-8 -ml-2 hover:bg-muted"
        >
          <ArrowLeft className="mr-2" size={20} />
          書籍一覧に戻る
        </Button>

        <h1 className="text-4xl font-semibold mb-8">ショッピングカート</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map(item => (
              <Card key={item.bookId} className="p-4">
                <div className="flex gap-4">
                  <div className="w-24 h-32 bg-muted rounded overflow-hidden flex-shrink-0">
                    {item.book?.image ? (
                      <img
                        src={item.book.image}
                        alt={item.book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        📖
                      </div>
                    )}
                  </div>

                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg mb-1">{item.book?.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{item.book?.author}</p>
                    <p className="text-lg font-semibold text-primary">
                      ¥{item.book?.price.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.bookId)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash size={20} />
                    </Button>

                    <div className="flex items-center gap-2 border rounded-lg">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQuantity(item.bookId, -1)}
                        disabled={item.quantity <= 1}
                        className="h-8 w-8"
                      >
                        <Minus size={16} />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQuantity(item.bookId, 1)}
                        className="h-8 w-8"
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">注文内容</h2>
              
              <div className="space-y-3 mb-4">
                {cartItems.map(item => (
                  <div key={item.bookId} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.book?.title.length! > 20 
                        ? item.book?.title.substring(0, 20) + '...' 
                        : item.book?.title} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      ¥{((item.book?.price || 0) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-semibold">合計</span>
                <span className="text-2xl font-bold text-primary">
                  ¥{totalAmount.toLocaleString()}
                </span>
              </div>

              <Button 
                onClick={onCheckout} 
                className="w-full"
                size="lg"
              >
                お会計に進む
              </Button>

              <p className="text-xs text-muted-foreground mt-4 text-center">
                税込価格で表示しています
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
