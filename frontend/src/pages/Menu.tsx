import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MenuItem } from '@/types/menu'
import { MenuSection } from '@/components/menu/MenuSection'
import { Skeleton } from '@/components/ui/skeleton'

export default function Menu() {
  const { t } = useTranslation()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch('/api/menu')
        const data = await response.json()
        setMenuItems(data)
      } catch (error) {
        console.error('Failed to fetch menu:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMenu()
  }, [])

  const categories = [
    'starters',
    'main',
    'sides',
    'sauces',
    'drinks',
    'coffee',
    'bubble-tea'
  ]

  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-8">
        {categories.map((category) => (
          <div key={category} className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-center mb-8">
        {t('menu.title')}
      </h1>
      
      {categories.map((category) => (
        <MenuSection
          key={category}
          title={t(`menu.categories.${category}`)}
          items={menuItems.filter((item) => item.category === category)}
        />
      ))}
    </div>
  )
}