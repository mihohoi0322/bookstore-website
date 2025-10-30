import { useState } from 'react';
import { X } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SalesStatus } from '@/lib/types';

interface FilterBarProps {
  availableTags: string[];
  selectedStatus: SalesStatus | 'all';
  selectedTags: string[];
  onStatusChange: (status: SalesStatus | 'all') => void;
  onTagToggle: (tag: string) => void;
  onClearFilters: () => void;
}

export function FilterBar({
  availableTags,
  selectedStatus,
  selectedTags,
  onStatusChange,
  onTagToggle,
  onClearFilters,
}: FilterBarProps) {
  const [showAllTags, setShowAllTags] = useState(false);

  const statusOptions: { value: SalesStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'すべて' },
    { value: 'available', label: '販売中' },
    { value: 'coming-soon', label: '予約受付中' },
    { value: 'sold-out', label: '完売' },
  ];

  const hasActiveFilters = selectedStatus !== 'all' || selectedTags.length > 0;
  const displayTags = showAllTags ? availableTags : availableTags.slice(0, 8);

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">絞り込み</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1" size={16} />
            クリア
          </Button>
        )}
      </div>

      <div className="space-y-5">
        <div>
          <h4 className="text-sm font-medium mb-3 text-muted-foreground">販売ステータス</h4>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <Button
                key={option.value}
                variant={selectedStatus === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onStatusChange(option.value)}
                className="rounded-full"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-3 text-muted-foreground">ジャンル・タグ</h4>
          <div className="flex flex-wrap gap-2">
            {displayTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <Badge
                  key={tag}
                  variant={isSelected ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary/90 transition-colors rounded-full px-3 py-1"
                  onClick={() => onTagToggle(tag)}
                >
                  {tag}
                </Badge>
              );
            })}
            {availableTags.length > 8 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllTags(!showAllTags)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {showAllTags ? '閉じる' : `+${availableTags.length - 8}件`}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
