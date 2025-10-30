import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { Navigation } from '@/components/Navigation';
import { CatalogPage } from '@/components/CatalogPage';
import { BookDetailPage } from '@/components/BookDetailPage';
import { AboutPage } from '@/components/AboutPage';
import { AdminPage } from '@/components/AdminPage';

type Page = 'catalog' | 'detail' | 'about' | 'admin';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('catalog');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, selectedBookId]);

  const handleNavigate = (page: 'catalog' | 'about' | 'admin') => {
    setCurrentPage(page);
    setSelectedBookId(null);
  };

  const handleBookSelect = (bookId: string) => {
    setSelectedBookId(bookId);
    setCurrentPage('detail');
  };

  const handleBack = () => {
    setCurrentPage('catalog');
    setSelectedBookId(null);
  };

  const handleBackFromAdmin = () => {
    setCurrentPage('catalog');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
      
      {currentPage === 'catalog' && (
        <CatalogPage onBookSelect={handleBookSelect} />
      )}
      
      {currentPage === 'detail' && selectedBookId && (
        <BookDetailPage bookId={selectedBookId} onBack={handleBack} />
      )}
      
      {currentPage === 'about' && <AboutPage />}
      
      {currentPage === 'admin' && <AdminPage onBack={handleBackFromAdmin} />}
      
      <Toaster />
    </div>
  );
}

export default App;