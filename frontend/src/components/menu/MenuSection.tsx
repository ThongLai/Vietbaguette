import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MenuItem } from '@/types/menu'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Leaf, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface MenuSectionProps {
  title: string
  items: MenuItem[]
}

interface MenuCardProps {
  item: MenuItem
}

function MenuCard({ item }: MenuCardProps) {
  const { t } = useTranslation()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  return (
    <>
      <Card className="overflow-hidden group hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => setIsDialogOpen(true)}>
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={item.image || '/placeholder.svg'}
            alt={item.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />          {item.vegetarian && (
            <Badge 
              variant="secondary" 
              className="absolute top-2 right-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100 border-green-200 dark:border-green-800"
            >
              <Leaf className="w-3 h-3 mr-1 text-green-500 dark:text-green-400" />
              Vegetarian
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-start gap-2 mb-2">
            <div>
              <h3 className="font-semibold text-lg leading-tight">{item.name}</h3>
              {item.nameVi && (
                <p className="text-sm text-muted-foreground font-medium">{item.nameVi}</p>
              )}
            </div>
            <p className="font-bold text-lg whitespace-nowrap">£{item.price.toFixed(2)}</p>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          {item.options && item.options.length > 0 && (
            <Button variant="ghost" size="sm" className="ml-auto">
              Customize <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </CardFooter>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-start gap-4">
              <div>
                <span className="text-2xl">{item.name}</span>
                {item.nameVi && (
                  <p className="text-lg text-muted-foreground font-medium">{item.nameVi}</p>
                )}
              </div>
              <span className="text-2xl font-bold">£{item.price.toFixed(2)}</span>
            </DialogTitle>
            <DialogDescription className="text-base py-4">
              {item.description}
            </DialogDescription>
          </DialogHeader>
          
          {item.options && item.options.length > 0 && (
            <div className="space-y-4">
              {item.options.map((option, index) => (
                <div key={index} className="space-y-2">
                  <h4 className="font-medium">{option.name}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {option.choices.map((choice, choiceIndex) => (
                      <div key={choiceIndex} className="flex justify-between items-center p-2 rounded-md border">
                        <span>{choice.name}</span>
                        {choice.price && choice.price !== 0 && (
                          <Badge variant="secondary">
                            {choice.price > 0 ? '+' : ''} £{choice.price.toFixed(2)}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export function MenuSection({ title, items }: MenuSectionProps) {
  if (items.length === 0) return null

  return (
    <AnimatePresence>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-semibold mb-6 text-primary">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>
      </motion.section>
    </AnimatePresence>
  )
}

// Export the MenuCard component as a static property of MenuSection
MenuSection.Card = MenuCard