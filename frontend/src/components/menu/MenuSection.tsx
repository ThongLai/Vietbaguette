import { MenuItem } from '@/types/menu'
import { MenuCard } from '@/components/menu/MenuCard'

interface MenuSectionProps {
  title: string
  items: MenuItem[]
}

export function MenuSection({ title, items }: MenuSectionProps) {
  if (items.length === 0) return null

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold mb-6 text-primary">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <MenuCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}