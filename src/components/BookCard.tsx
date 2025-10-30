import { Book } from '@/lib/types';
import { ShoppingCart } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

interface BookCardProps {
  book: Book;
  onClick: () => void;
  onAddToCart: (e: React.MouseEvent) => void;
}

export function BookCard({ book, onClick, onAddToCart }: BookCardProps) {
  const statusConfig = {
    available: { label: '販売中', className: 'bg-secondary text-secondary-foreground' },
    'coming-soon': { label: '予約受付中', className: 'bg-accent/20 text-accent-foreground' },
    'sold-out': { label: '完売', className: 'bg-muted text-muted-foreground' },
  };

  const status = statusConfig[book.status];

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
    >
      <div className="aspect-[3/4] bg-muted relative overflow-hidden">
        {book.image ? (
          <img
            src={book.image}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="text-6xl mb-2">📖</div>
              <div className="text-sm">画像準備中</div>
            </div>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.className}`}>
            {status.label}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-lg mb-1 line-clamp-2 group-hover:text-primary transition-colors">
          {book.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-2">{book.author}</p>
        <p className="text-sm text-foreground/80 line-clamp-2 mb-3">{book.description}</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {book.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-primary">¥{book.price.toLocaleString()}</p>
          {book.status === 'available' && (
            <Button
              size="sm"
              onClick={onAddToCart}
              className="gap-2"
            >
              <ShoppingCart size={16} />
              カートへ
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
