// components/SelectItemNoCheck.tsx
import { SelectItemText, Item } from '@radix-ui/react-select';
import { cn } from '@/lib/utils'; // 使っていない場合は className を直接書いてOK

export function SelectItemNoCheck({ children, className, ...props }: any) {
  return (
    <Item
      {...props}
      className={cn(
        'cursor-pointer hover:bg-gray-100 hover:text-black transition-colors px-2 py-1 rounded-md',
        className
      )}
    >
      <SelectItemText>{children}</SelectItemText>
      {/* チェックマーク省略: ItemIndicator を描画しない */}
    </Item>
  );
}
