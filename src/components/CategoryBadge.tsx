import type { CategoryDto } from "@/types/tourism";

export function CategoryBadge({ category }: { category: CategoryDto }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
      style={{
        backgroundColor: `${category.color}1A`,
        color: category.color,
        border: `1px solid ${category.color}33`,
      }}
    >
      {category.name}
    </span>
  );
}
