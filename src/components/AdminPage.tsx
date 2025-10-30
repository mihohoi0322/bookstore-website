import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Book } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from '@phosphor-icons/react';
import { BookForm } from './BookForm';
import { BookListAdmin } from './BookListAdmin';
import { toast } from 'sonner';
import { booksData } from '@/lib/data';

interface AdminPageProps {
  onBack: () => void;
}

export function AdminPage({ onBack }: AdminPageProps) {
  const [books, setBooks] = useKV<Book[]>('books-data', []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  useEffect(() => {
    if (!books || books.length === 0) {
      setBooks(() => booksData);
    }
  }, [books, setBooks]);

  const handleAddBook = () => {
    setEditingBook(null);
    setIsFormOpen(true);
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setIsFormOpen(true);
  };

  const handleDeleteBook = (bookId: string) => {
    setBooks((currentBooks) => (currentBooks || []).filter((book) => book.id !== bookId));
    toast.success('書籍を削除しました');
  };

  const handleSaveBook = (book: Book) => {
    if (editingBook) {
      setBooks((currentBooks) =>
        (currentBooks || []).map((b) => (b.id === book.id ? book : b))
      );
      toast.success('書籍を更新しました');
    } else {
      setBooks((currentBooks) => [...(currentBooks || []), book]);
      toast.success('書籍を追加しました');
    }
    setIsFormOpen(false);
    setEditingBook(null);
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingBook(null);
  };

  const handleResetToDefault = () => {
    setBooks(() => booksData);
    toast.success('デフォルトデータにリセットしました');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="rounded-full flex-shrink-0"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-semibold mb-1 sm:mb-2">商品管理</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                書籍の登録・編集・削除ができます
              </p>
            </div>
          </div>
          {!isFormOpen && (
            <div className="flex gap-2 w-full sm:w-auto flex-col sm:flex-row">
              <Button onClick={handleAddBook} className="gap-2">
                <Plus size={20} weight="bold" />
                新規登録
              </Button>
              <Button onClick={handleResetToDefault} variant="outline" className="gap-2">
                デフォルトに戻す
              </Button>
            </div>
          )}
        </div>

        {isFormOpen ? (
          <BookForm
            book={editingBook}
            onSave={handleSaveBook}
            onCancel={handleCancelForm}
          />
        ) : (
          <BookListAdmin
            books={books || []}
            onEdit={handleEditBook}
            onDelete={handleDeleteBook}
          />
        )}
      </div>
    </div>
  );
}
