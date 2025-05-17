import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MenuItem } from '@/types/menu'
import { MenuSection } from '@/components/Menu/MenuSection'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import MainLayout from '@/components/Layout/MainLayout'

export default function Menu() {
  const { t } = useTranslation()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  // Wrap with MainLayout to maintain consistent header and footer
  return (
    <MainLayout>
      <MenuContent />
    </MainLayout>
  )
}

function MenuContent() {
  const { t } = useTranslation()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')

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
    { id: 'all', label: 'All' },
    { id: 'starters', label: 'Starters' },
    { id: 'main', label: 'Main Courses' },
    { id: 'sides', label: 'Sides' },
    { id: 'sauces', label: 'Sauces' },
    { id: 'drinks', label: 'Drinks' },
    { id: 'coffee', label: 'Coffee & Tea' },
    { id: 'bubble_tea', label: 'Bubble Tea' }
  ]

  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory)

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 space-y-8">
          <Skeleton className="h-16 w-96 mx-auto" />
          <Skeleton className="h-12 w-full max-w-2xl mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-[380px] rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-background"
    >
      {/* Hero Section */}
      <div className="relative h-[300px] bg-gradient-to-r from-orange-600/90 to-red-800/90 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url(/image/hero-bg.avif)',
            filter: 'brightness(0.4)'
          }}
        />
        <div className="relative container mx-auto px-4 h-full flex flex-col items-center justify-center text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-cursive text-5xl md:text-6xl lg:text-7xl text-white mb-4"
          >
            {t('menu.title', 'Our Menu')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-cursive text-3xl md:text-4xl text-gray-200 max-w-2xl"
          >
            {t('home.hero.title', 'Authentic Vietnamese Street Food')}
          </motion.p>
        </div>
      </div>

      {/* Menu Navigation */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4">
          <ScrollArea className="w-full">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="py-4">
              <TabsList className="h-12">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="min-w-[100px] font-medium"
                  >
                    {category.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </ScrollArea>
        </div>
      </div>

      {/* Menu Items */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <MenuSection.Card item={item} />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}