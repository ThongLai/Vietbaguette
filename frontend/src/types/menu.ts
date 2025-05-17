export interface MenuItem {
  id: string
  name: string
  nameVi?: string
  description: string
  price: number
  category: string
  imageUrl?: string
  vegetarian: boolean
  spicy?: boolean
  options?: MenuOption[]
}

export interface MenuOption {
  name: string
  required?: boolean
  choices: OptionChoice[]
}

export interface OptionChoice {
  name: string
  price?: number
}