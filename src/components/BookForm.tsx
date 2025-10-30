import { useState, useEffect } from 'react';
import { Book, SalesStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { X, Image as ImageIcon, Upload } from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';

interface BookFormProps {
  book: Book | null;
  onSave: (book: Book) => void;
  onCancel: () => void;
}

const STATUS_LABELS: Record<SalesStatus, string> = {
  'available': '販売中',
  'coming-soon': '予約受付中',
  'sold-out': '売り切れ',
};

export function BookForm({ book, onSave, onCancel }: BookFormProps) {
  const [formData, setFormData] = useState<Omit<Book, 'id'>>({
    title: '',
    author: '',
    description: '',
    fullDescription: '',
    price: 0,
    status: 'available',
    tags: [],
    publicationYear: new Date().getFullYear(),
    image: undefined,
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title,
        author: book.author,
        description: book.description,
        fullDescription: book.fullDescription,
        price: book.price,
        status: book.status,
        tags: book.tags,
        publicationYear: book.publicationYear,
        image: book.image,
      });
    }
  }, [book]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.author.trim()) {
      return;
    }

    const newBook: Book = {
      id: book?.id || `book-${Date.now()}`,
      ...formData,
    };

    onSave(newBook);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          image: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="p-8">
      <h2 className="text-2xl font-semibold mb-6">
        {book ? '書籍を編集' : '新規書籍を登録'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title">タイトル *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="書籍のタイトル"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">著者 *</Label>
            <Input
              id="author"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              placeholder="著者名"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="price">価格 (円)</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
              placeholder="1800"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">出版年</Label>
            <Input
              id="year"
              type="number"
              value={formData.publicationYear}
              onChange={(e) => setFormData({ ...formData, publicationYear: parseInt(e.target.value) || new Date().getFullYear() })}
              placeholder="2024"
              min="1900"
              max="2100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">販売状態</Label>
            <Select
              value={formData.status}
              onValueChange={(value: SalesStatus) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">簡単な説明</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="カタログに表示される簡単な説明文"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullDescription">詳細説明</Label>
          <Textarea
            id="fullDescription"
            value={formData.fullDescription}
            onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
            placeholder="詳細ページに表示される詳しい説明文"
            rows={6}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">書籍画像</Label>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Label
                htmlFor="image"
                className="flex items-center gap-2 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer transition-colors"
              >
                <Upload size={18} />
                <span className="text-sm font-medium">
                  {formData.image ? '画像を変更' : '画像をアップロード'}
                </span>
              </Label>
              {formData.image && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({ ...formData, image: undefined })}
                  className="gap-2"
                >
                  <X size={16} />
                  削除
                </Button>
              )}
            </div>
            {formData.image ? (
              <div className="flex items-start gap-4 p-4 border rounded-lg bg-muted/30">
                <img
                  src={formData.image}
                  alt="プレビュー"
                  className="w-24 h-36 object-cover rounded-lg border"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">画像プレビュー</p>
                  <p className="text-xs text-muted-foreground">
                    この画像が書籍カバーとして表示されます
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 border border-dashed rounded-lg bg-muted/10">
                <ImageIcon size={32} className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    画像がアップロードされていません
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPG、PNG形式の画像ファイルをアップロードしてください
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">タグ</Label>
          <div className="flex gap-2">
            <Input
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="タグを入力してEnterまたは追加ボタン"
            />
            <Button type="button" onClick={handleAddTag} variant="outline">
              追加
            </Button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 pl-3 pr-2 py-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:bg-background/80 rounded-full p-0.5 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1">
            {book ? '更新する' : '登録する'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            キャンセル
          </Button>
        </div>
      </form>
    </Card>
  );
}
