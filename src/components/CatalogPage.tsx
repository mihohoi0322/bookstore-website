import { useState, useMemo, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { BookCard } from './BookCard';
import { FilterBar } from './FilterBar';
import { EmptyState } from './EmptyState';
import { Book, SalesStatus } from '@/lib/types';
import { booksData } from '@/lib/data';

interface CatalogPageProps {
  onBookSelect: (bookId: string) => void;
}

export function CatalogPage({ onBookSelect }: CatalogPageProps) {
  const [selectedStatus, setSelectedStatus] = useState<SalesStatus | 'all'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customBooks, setCustomBooks] = useKV<Book[]>('books-data', []);

  useEffect(() => {
    if (!customBooks || customBooks.length === 0) {
      setCustomBooks((current) => {
        if (!current || current.length === 0) {
          return booksData;
        }
        return current;
      });
    }
  }, [customBooks, setCustomBooks]);

  const allBooks = useMemo(() => {
    if (customBooks && customBooks.length > 0) {
      return customBooks;
    }
    return booksData;
  }, [customBooks]);

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    allBooks.forEach(book => {
      book.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [allBooks]);

  const filteredBooks = useMemo(() => {
    return allBooks.filter((book) => {
      const matchesStatus = selectedStatus === 'all' || book.status === selectedStatus;
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => book.tags.includes(tag));
      return matchesStatus && matchesTags;
    });
  }, [allBooks, selectedStatus, selectedTags]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleClearFilters = () => {
    setSelectedStatus('all');
    setSelectedTags([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-semibold mb-3">書籍一覧</h2>
          <p className="text-muted-foreground">
            心を豊かにする、厳選された本たちをご紹介します
          </p>
        </div>

        <FilterBar
          availableTags={availableTags}
          selectedStatus={selectedStatus}
          selectedTags={selectedTags}
          onStatusChange={setSelectedStatus}
          onTagToggle={handleTagToggle}
          onClearFilters={handleClearFilters}
        />

        {filteredBooks.length === 0 ? (
          <EmptyState
            title="本が見つかりませんでした"
            description="条件に合う本がありません。フィルターを変更してお試しください。"
            action={{
              label: 'フィルターをクリア',
              onClick: handleClearFilters,
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onClick={() => onBookSelect(book.id)}
              />
            ))}
          </div>
        )}

        <div className="mt-8 text-center text-sm text-muted-foreground">
          {filteredBooks.length}冊の本を表示中
        </div>
      </div>
    </div>
  );
}
