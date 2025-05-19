import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MenuItem } from '@/types/menu'
import { Badge } from '@/components/ui/badge'

interface MenuCardProps {
  item: MenuItem
}

export function MenuCard({ item }: MenuCardProps) {
  const { t, i18n } = useTranslation()
  const [imageError, setImageError] = useState(false)

  const displayName = i18n.language === 'vi' && item.nameVi 
    ? item.nameVi 
    : item.name

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {item.image && !imageError && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={item.image}
            alt={displayName}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        </div>
      )}
      
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <span>{displayName}</span>
          <span className="text-primary">£{item.price.toFixed(2)}</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {item.description}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {item.vegetarian && (
            <Badge variant="outline">{t('menu.badges.vegetarian')}</Badge>
          )}
          {item.spicy && (
            <Badge variant="outline">{t('menu.badges.spicy')}</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}