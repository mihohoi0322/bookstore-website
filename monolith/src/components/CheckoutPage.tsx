import { useState, useMemo } from 'react';
import { usePersistentState } from '@/hooks/usePersistentState';
import { ArrowLeft, CreditCard, Lock } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Book, CartItem, Order } from '@/lib/types';
import { booksData } from '@/lib/data';
import { toast } from 'sonner';

interface CheckoutPageProps {
  onBack: () => void;
  onComplete: (orderId: string) => void;
}

export function CheckoutPage({ onBack, onComplete }: CheckoutPageProps) {
  const [cart] = usePersistentState<CartItem[]>('shopping-cart', []);
  const [customBooks] = usePersistentState<Book[]>('books-data', []);
  const [, setOrders] = usePersistentState<Order[]>('orders', []);
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    postalCode: '',
    prefecture: '',
    city: '',
    address: '',
    cardNumber: '',
    cardName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });

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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const limited = numbers.slice(0, 16);
    const formatted = limited.match(/.{1,4}/g)?.join(' ') || limited;
    return formatted;
  };

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    handleInputChange('cardNumber', formatted);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('お名前を入力してください');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error('有効なメールアドレスを入力してください');
      return false;
    }
    if (!formData.postalCode.trim()) {
      toast.error('郵便番号を入力してください');
      return false;
    }
    if (!formData.prefecture.trim() || !formData.city.trim() || !formData.address.trim()) {
      toast.error('住所を入力してください');
      return false;
    }
    const cardNumbers = formData.cardNumber.replace(/\s/g, '');
    if (cardNumbers.length !== 16) {
      toast.error('カード番号は16桁で入力してください');
      return false;
    }
    if (!formData.cardName.trim()) {
      toast.error('カード名義を入力してください');
      return false;
    }
    if (!formData.expiryMonth || !formData.expiryYear) {
      toast.error('有効期限を入力してください');
      return false;
    }
    if (!formData.cvv || formData.cvv.length < 3) {
      toast.error('セキュリティコードを入力してください');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    await new Promise(resolve => setTimeout(resolve, 2000));

    const orderId = `ORDER-${Date.now()}`;
    const cardLast4 = formData.cardNumber.replace(/\s/g, '').slice(-4);
    const fullAddress = `〒${formData.postalCode} ${formData.prefecture}${formData.city}${formData.address}`;

    const order: Order = {
      id: orderId,
      items: cart || [],
      totalAmount,
      customerName: formData.name,
      email: formData.email,
      address: fullAddress,
      cardLast4,
      createdAt: new Date().toISOString()
    };

    setOrders((currentOrders) => {
      if (!currentOrders) return [order];
      return [...currentOrders, order];
    });

    setIsProcessing(false);
    toast.success('ご注文が完了しました！');
    onComplete(orderId);
  };

  if (!cart || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold mb-3">カートが空です</h2>
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
      <div className="max-w-5xl mx-auto px-6 py-12">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-8 -ml-2 hover:bg-muted"
        >
          <ArrowLeft className="mr-2" size={20} />
          カートに戻る
        </Button>

        <h1 className="text-4xl font-semibold mb-8">お支払い情報の入力</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">お客様情報</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">お名前 *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="山田 太郎"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">メールアドレス *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="example@email.com"
                      required
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">配送先住所</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="postalCode">郵便番号 *</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value.replace(/\D/g, ''))}
                      placeholder="1234567"
                      maxLength={7}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="prefecture">都道府県 *</Label>
                      <Input
                        id="prefecture"
                        value={formData.prefecture}
                        onChange={(e) => handleInputChange('prefecture', e.target.value)}
                        placeholder="東京都"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">市区町村 *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="渋谷区"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">番地・建物名 *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="神南1-2-3 ABCビル4F"
                      required
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">お支払い方法</h2>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Lock size={16} />
                    <span className="text-sm">安全な決済</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">カード番号 *</Label>
                    <div className="relative">
                      <Input
                        id="cardNumber"
                        value={formData.cardNumber}
                        onChange={(e) => handleCardNumberChange(e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                      <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="cardName">カード名義 *</Label>
                    <Input
                      id="cardName"
                      value={formData.cardName}
                      onChange={(e) => handleInputChange('cardName', e.target.value.toUpperCase())}
                      placeholder="TARO YAMADA"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="expiryMonth">有効期限（月） *</Label>
                      <Input
                        id="expiryMonth"
                        value={formData.expiryMonth}
                        onChange={(e) => handleInputChange('expiryMonth', e.target.value.replace(/\D/g, '').slice(0, 2))}
                        placeholder="MM"
                        maxLength={2}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="expiryYear">年 *</Label>
                      <Input
                        id="expiryYear"
                        value={formData.expiryYear}
                        onChange={(e) => handleInputChange('expiryYear', e.target.value.replace(/\D/g, '').slice(0, 2))}
                        placeholder="YY"
                        maxLength={2}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV *</Label>
                      <Input
                        id="cvv"
                        type="password"
                        value={formData.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="123"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>
                </div>
              </Card>
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
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isProcessing}
                >
                  {isProcessing ? '処理中...' : '注文を確定する'}
                </Button>

                <p className="text-xs text-muted-foreground mt-4 text-center">
                  注文を確定すると、利用規約に同意したものとみなされます
                </p>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
