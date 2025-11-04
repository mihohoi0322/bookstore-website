import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { Navigation } from '@/components/Navigation';
import { CatalogPage } from '@/components/CatalogPage';
import { BookDetailPage } from '@/components/BookDetailPage';
import { AboutPage } from '@/components/AboutPage';
import { AdminPage } from '@/components/AdminPage';
import { CartPage } from '@/components/CartPage';
import { CheckoutPage } from '@/components/CheckoutPage';
import { OrderCompletedPage } from '@/components/OrderCompletedPage';

type Page = 'catalog' | 'detail' | 'about' | 'admin' | 'cart' | 'checkout' | 'order-completed';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('catalog');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, selectedBookId]);

  const handleNavigate = (page: 'catalog' | 'about' | 'admin' | 'cart') => {
    setCurrentPage(page);
    if (page === 'catalog') {
      setSelectedBookId(null);
    }
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

  const handleBackFromCart = () => {
    setCurrentPage('catalog');
  };

  const handleCheckout = () => {
    setCurrentPage('checkout');
  };

  const handleBackFromCheckout = () => {
    setCurrentPage('cart');
  };

  const handleOrderComplete = (orderId: string) => {
    setCompletedOrderId(orderId);
    setCurrentPage('order-completed');
  };

  const handleReturnToCatalog = () => {
    setCurrentPage('catalog');
    setSelectedBookId(null);
    setCompletedOrderId(null);
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
      
      {currentPage === 'cart' && (
        <CartPage onBack={handleBackFromCart} onCheckout={handleCheckout} />
      )}
      
      {currentPage === 'checkout' && (
        <CheckoutPage onBack={handleBackFromCheckout} onComplete={handleOrderComplete} />
      )}
      
      {currentPage === 'order-completed' && completedOrderId && (
        <OrderCompletedPage orderId={completedOrderId} onReturnToCatalog={handleReturnToCatalog} />
      )}
      
      <Toaster />
    </div>
  );
}

export default App;