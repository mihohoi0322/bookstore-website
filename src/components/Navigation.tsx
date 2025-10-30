import { Book } from '@phosphor-icons/react';

interface NavigationProps {
  currentPage: 'catalog' | 'detail' | 'about';
  onNavigate: (page: 'catalog' | 'about') => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
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
          </div>
        </div>
      </div>
    </nav>
  );
}
