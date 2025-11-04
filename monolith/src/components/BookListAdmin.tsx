import { Book } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash } from '@phosphor-icons/react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface BookListAdminProps {
  books: Book[];
  onEdit: (book: Book) => void;
  onDelete: (bookId: string) => void;
}

const STATUS_LABELS: Record<string, string> = {
  'available': '販売中',
  'coming-soon': '予約受付中',
  'sold-out': '売り切れ',
};

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  'available': 'default',
  'coming-soon': 'secondary',
  'sold-out': 'outline',
};

export function BookListAdmin({ books, onEdit, onDelete }: BookListAdminProps) {
  if (books.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground text-lg">
          まだ書籍が登録されていません
        </p>
        <p className="text-muted-foreground text-sm mt-2">
          「新規登録」ボタンから書籍を追加してください
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {books.map((book) => (
        <Card key={book.id} className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            {book.image && (
              <div className="flex-shrink-0 mx-auto sm:mx-0">
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-32 h-48 sm:w-24 sm:h-36 object-cover rounded-lg"
                />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-semibold mb-1 break-words">{book.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {book.author} | {book.publicationYear}年 | ¥{book.price.toLocaleString()}
                  </p>
                </div>
                
                <div className="flex gap-2 flex-shrink-0 self-end sm:self-start">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(book)}
                    className="h-9 w-9"
                  >
                    <Pencil size={18} />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 text-destructive hover:text-destructive"
                      >
                        <Trash size={18} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>書籍を削除しますか？</AlertDialogTitle>
                        <AlertDialogDescription>
                          「{book.title}」を削除します。この操作は取り消せません。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(book.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          削除する
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              
              <div className="flex items-center flex-wrap gap-2 mb-3">
                <Badge variant={STATUS_VARIANTS[book.status]}>
                  {STATUS_LABELS[book.status]}
                </Badge>
                {book.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <p className="text-sm text-foreground/80 line-clamp-2">
                {book.description}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
