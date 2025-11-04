import { Book, GearSix, ShoppingCart } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { usePersistentState } from '@/hooks/usePersistentState';
import { CartItem } from '@/lib/types';

interface NavigationProps {
  currentPage: 'catalog' | 'detail' | 'about' | 'admin' | 'cart' | 'checkout' | 'order-completed';
  onNavigate: (page: 'catalog' | 'about' | 'admin' | 'cart') => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [cart] = usePersistentState<CartItem[]>('shopping-cart', []);

  const cartItemCount = useMemo(() => {
    if (!cart) return 0;
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);
  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('catalog')}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Book size={24} weight="fill" className="text-primary-foreground" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-semibold text-foreground group-hover:text-primary transition-colors">
                ほんのわ書店
              </h1>
              <p className="text-xs text-muted-foreground">Personal Bookstore</p>
            </div>
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => onNavigate('catalog')}
              className={`px-5 py-2 rounded-full font-medium transition-all ${
                currentPage === 'catalog' || currentPage === 'detail'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              書籍一覧
            </button>
            <button
              onClick={() => onNavigate('about')}
              className={`px-5 py-2 rounded-full font-medium transition-all ${
                currentPage === 'about'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              About
            </button>
            <button
              onClick={() => onNavigate('cart')}
              className={`px-5 py-2 rounded-full font-medium transition-all flex items-center gap-2 relative ${
                currentPage === 'cart' || currentPage === 'checkout' || currentPage === 'order-completed'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <ShoppingCart size={18} weight={currentPage === 'cart' ? 'fill' : 'regular'} />
              カート
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </button>
            <button
              onClick={() => onNavigate('admin')}
              className={`px-5 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
                currentPage === 'admin'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <GearSix size={18} weight={currentPage === 'admin' ? 'fill' : 'regular'} />
              管理
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
