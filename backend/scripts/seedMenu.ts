// Script to seed the database with menu items
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

interface OptionChoice {
  name: string;
  price?: number;
}

interface MenuOption {
  name: string;
  choices: OptionChoice[];
}

interface MenuItem {
  name: string;
  nameVi?: string;
  price: number;
  description?: string;
  image?: string;
  category: string;
  vegetarian: boolean;
  options?: MenuOption[];
}

const menuItems: MenuItem[] = [
  // Starters
  {
    name: 'Spring Rolls',
    nameVi: 'Chả Giò',
    price: 5.00,
    description: '3 spring rolls with chicken, veggies, vermicelli, herbs, served with sweet chili dip',
    category: 'starters',
    vegetarian: false,
  },
  {
    name: 'Fresh Spring Rolls',
    nameVi: 'Gỏi Cuốn',
    price: 5.00,
    description: '3 homemade rolls with grilled pork, herbs, fried egg, pickles, vermicelli, served with hoisin dip',
    category: 'starters',
    vegetarian: false,
    options: [
      {
        name: 'Extra',
        choices: [
          { name: 'Prawn', price: 1.00 },
          { name: 'Beef', price: 1.00 },
        ],
      },
    ],
  },
  {
    name: 'Sweetcorn Fritters',
    nameVi: 'Bánh Ngô Chiên',
    price: 5.00,
    description: 'Crispy and soft sweetcorn fritters with egg and seasoning, served with sweet chili dip',
    category: 'starters',
    vegetarian: true,
  },
  {
    name: 'Filo Prawns',
    nameVi: 'Tôm Cuốn Bột',
    price: 5.00,
    description: '7 king prawns wrapped in batter and breadcrumbs',
    category: 'starters',
    vegetarian: false,
  },
  {
    name: 'BBQ Chicken Wings',
    nameVi: 'Cánh Gà Nướng',
    price: 5.00,
    description: '6 smoky grilled chicken wings with garlic, onions, and fish sauce, finished with a hint of sweetness and chili',
    category: 'starters',
    vegetarian: false,
  },
  {
    name: 'Mixed Salad',
    nameVi: 'Gỏi Trộn',
    price: 6.00,
    description: 'Homemade dressing, pickled veggies, herbs, with choice of protein. Served with prawn crackers',
    category: 'starters',
    vegetarian: false,
    options: [
      {
        name: 'Protein',
        choices: [
          { name: 'Beef' },
          { name: 'Prawn' },
          { name: 'Chicken' },
          { name: 'Tofu', price: 0 },
        ],
      },
    ],
  },
  {
    name: 'Taster Box',
    nameVi: 'Hộp Đồ Ăn Thử',
    price: 7.00,
    description: 'Mixed starters with summer rolls, spring rolls, filo prawn, and sweetcorn fritters, served with hoisin and sweet chilli dip',
    category: 'starters',
    vegetarian: false,
  },
  {
    name: 'Homemade Soup',
    nameVi: 'Súp Tự Làm',
    price: 4.00,
    description: 'Silky and smooth homemade chicken broth with chicken breast, crab sticks, veggies, egg, herbs',
    category: 'starters',
    vegetarian: false,
  },
  {
    name: 'Miso Soup',
    nameVi: 'Súp Miso',
    price: 2.50,
    description: 'Miso soup with fried tofu, spring onion, and wakame seaweed',
    category: 'starters',
    vegetarian: true,
  },
  
  // Main Courses
  {
    name: 'Pho',
    nameVi: 'Phở',
    price: 8.00,
    description: 'Aromatic Vietnamese soup with broth, rice noodles, bean sprouts, fresh mint and your choice of protein',
    category: 'main',
    vegetarian: false,
    options: [
      {
        name: 'Protein',
        choices: [
          { name: 'Beef' },
          { name: 'Chicken' },
          { name: 'Prawn' },
          { name: 'Tofu', price: 0 },
        ],
      },
      {
        name: 'Extra',
        choices: [
          { name: 'Beef and poached egg', price: 2.00 },
        ],
      },
    ],
  },
  {
    name: 'Baguette',
    nameVi: 'Bánh Mì',
    price: 7.00,
    description: 'A unique homemade baguette filled with salad, pickles, herbs and your choice of topping',
    category: 'main',
    vegetarian: false,
    options: [
      {
        name: 'Protein',
        choices: [
          { name: 'Grilled pork with pate' },
          { name: 'Char-siu pork with pate' },
          { name: 'Chicken' },
          { name: 'Crispy chicken' },
          { name: 'Beef' },
          { name: 'Crispy beef' },
          { name: 'Fried egg', price: 0 },
          { name: 'Tofu', price: 0 },
        ],
      },
      {
        name: 'Extra',
        choices: [
          { name: 'Any extra topping', price: 2.00 },
        ],
      },
    ],
  },
  {
    name: 'Stir-fry',
    nameVi: 'Món Xào',
    price: 6.00,
    description: 'Choose your base and protein for a delicious stir-fry',
    category: 'main',
    vegetarian: false,
    options: [
      {
        name: 'Base',
        choices: [
          { name: 'Egg noodle' },
          { name: 'Rice noodle' },
          { name: 'Fried rice' },
          { name: 'Boiled rice' },
        ],
      },
      {
        name: 'Protein',
        choices: [
          { name: 'Grilled pork' },
          { name: 'Char-siu pork' },
          { name: 'Beef' },
          { name: 'Crispy beef' },
          { name: 'Chicken' },
          { name: 'Crispy chicken' },
          { name: 'Prawn' },
          { name: 'Tofu' },
          { name: 'Veggie', price: -1.00 },
        ],
      },
      {
        name: 'Size',
        choices: [
          { name: 'Small (default)' },
          { name: 'Large', price: 2.00 },
        ],
      },
      {
        name: 'Extra',
        choices: [
          { name: 'Any extra topping', price: 2.00 },
        ],
      },
    ],
  },
  {
    name: 'Rice vermicelli',
    nameVi: 'Bún',
    price: 7.00,
    description: 'Rice vermicelli with salad, pickles, herbs, fried onion, homemade dressing and your choice of protein',
    category: 'main',
    vegetarian: false,
    options: [
      {
        name: 'Protein',
        choices: [
          { name: 'Grilled pork' },
          { name: 'Fried spring roll' },
          { name: 'Tofu' },
          { name: 'Stir-fried beef' },
          { name: 'Stir-fried chicken' },
        ],
      },
    ],
  },
  {
    name: 'Salt & Peppers',
    nameVi: 'Muối Tiêu',
    price: 6.50,
    description: 'Chips with homemade salt & pepper seasoning and your choice of topping',
    category: 'main',
    vegetarian: false,
    options: [
      {
        name: 'Protein',
        choices: [
          { name: 'Chicken breast' },
          { name: 'Chicken wings' },
          { name: 'Crispy beef' },
          { name: 'Tofu' },
        ],
      },
      {
        name: 'Extra',
        choices: [
          { name: 'Any extra topping', price: 2.00 },
        ],
      },
    ],
  },
  {
    name: 'Vietnamese Curry',
    nameVi: 'Cà Ri Việt Nam',
    price: 7.50,
    description: 'Choose your protein for our authentic Vietnamese curry',
    category: 'main',
    vegetarian: false,
    options: [
      {
        name: 'Protein',
        choices: [
          { name: 'Katsu' },
          { name: 'Chicken breast' },
          { name: 'Beef' },
          { name: 'Crispy beef' },
          { name: 'Prawn' },
          { name: 'Tofu' },
        ],
      },
    ],
  },
  {
    name: 'Caramelised Pork',
    nameVi: 'Thịt Kho',
    price: 9.00,
    description: 'Boiled jasmine rice served with caramelised pork',
    category: 'main',
    vegetarian: false,
    options: [
      {
        name: 'Protein',
        choices: [
          { name: 'Pork belly' },
          { name: 'Pork ribs' },
        ],
      },
    ],
  },
  {
    name: 'Banh Mi Chao',
    nameVi: 'Bánh Mì Chảo',
    price: 9.00,
    description: 'Crispy baguette served with a sunny-side-up egg, stir-fry beef, chili, fresh salad, pate and tomato sauce',
    category: 'main',
    vegetarian: false,
  },
  
  // Sides
  {
    name: 'Chips',
    nameVi: 'Khoai Tây Chiên',
    price: 2.50,
    description: 'Freshly made chips',
    category: 'sides',
    vegetarian: true,
  },
  {
    name: 'Salt & pepper chips',
    nameVi: 'Khoai Tây Muối Tiêu',
    price: 4.00,
    description: 'Chips with homemade salt & pepper seasoning',
    category: 'sides',
    vegetarian: true,
  },
  {
    name: 'Cheesy salt & pepper chips',
    nameVi: 'Khoai Tây Phô Mai Muối Tiêu',
    price: 4.50,
    description: 'Chips with homemade salt & pepper seasoning and cheese',
    category: 'sides',
    vegetarian: true,
  },
  {
    name: 'Prawn crackers',
    nameVi: 'Bánh Phồng Tôm',
    price: 2.50,
    description: 'Crispy prawn crackers',
    category: 'sides',
    vegetarian: false,
  },
  {
    name: 'Boiled jasmine rice',
    nameVi: 'Cơm Trắng',
    price: 2.50,
    description: 'Aromatic jasmine rice',
    category: 'sides',
    vegetarian: true,
  },
  
  // Sauces
  {
    name: 'Curry sauce',
    nameVi: 'Nước Sốt Cà Ri',
    price: 0.50,
    description: 'Homemade curry sauce',
    category: 'sauces',
    vegetarian: true,
  },
  {
    name: 'Sweet & sour sauce',
    nameVi: 'Nước Sốt Chua Ngọt',
    price: 0.50,
    description: 'Sweet and sour sauce',
    category: 'sauces',
    vegetarian: true,
  },
  {
    name: 'Special sauce',
    nameVi: 'Nước Sốt Đặc Biệt',
    price: 0.50,
    description: 'Our special secret recipe sauce',
    category: 'sauces',
    vegetarian: true,
  },
  {
    name: 'Sweet chilli',
    nameVi: 'Tương Ớt Ngọt',
    price: 0.50,
    description: 'Sweet chilli dipping sauce',
    category: 'sauces',
    vegetarian: true,
  },
  {
    name: 'Hoisin',
    nameVi: 'Tương Hoisin',
    price: 0.50,
    description: 'Sweet and savory hoisin sauce',
    category: 'sauces',
    vegetarian: true,
  },
  {
    name: 'Chilli garlic',
    nameVi: 'Tỏi Ớt',
    price: 0.50,
    description: 'Spicy chilli garlic sauce',
    category: 'sauces',
    vegetarian: true,
  },
  
  // Drinks
  {
    name: 'Coke',
    price: 1.50,
    description: 'Coca Cola',
    category: 'drinks',
    vegetarian: true,
  },
  {
    name: 'Diet Coke',
    price: 1.50,
    description: 'Diet Coca Cola',
    category: 'drinks',
    vegetarian: true,
  },
  {
    name: 'Fanta',
    price: 1.20,
    description: 'Orange Fanta',
    category: 'drinks',
    vegetarian: true,
  },
  {
    name: 'Rubicon',
    price: 1.20,
    description: 'Rubicon juice',
    category: 'drinks',
    vegetarian: true,
  },
  {
    name: 'Seven Up',
    price: 1.20,
    description: '7-Up lemon-lime soda',
    category: 'drinks',
    vegetarian: true,
  },
  
  // Coffee & Tea
  {
    name: 'Original Dripping Coffee',
    nameVi: 'Cà Phê Phin',
    price: 3.00,
    description: 'Slow-brewed Vietnamese dripping coffee with bold flavors and a smooth, aromatic finish',
    category: 'coffee',
    vegetarian: true,
  },
  {
    name: 'Vietnamese Flat White',
    nameVi: 'Cà Phê Sữa',
    price: 3.00,
    description: 'Vietnamese flat white with smooth, creamy condensed milk and lightly brewed coffee for a balanced taste',
    category: 'coffee',
    vegetarian: true,
  },
  {
    name: 'Vietnamese Jasmine Tea',
    nameVi: 'Trà Lài',
    price: 1.00,
    description: 'Vietnamese jasmine tea with a delicate aroma and a light, floral flavor',
    category: 'coffee',
    vegetarian: true,
  },
  {
    name: 'Ice Blended',
    nameVi: 'Đá Xay',
    price: 5.00,
    description: 'Fresh milk, flavored milk powder, syrup, blended ice, whipping cream and toppings',
    category: 'coffee',
    vegetarian: true,
  },
  {
    name: 'Matcha Latte',
    nameVi: 'Trà Xanh Sữa',
    price: 4.50,
    description: 'Fresh milk and pure matcha',
    category: 'coffee',
    vegetarian: true,
  },
  
  // Bubble Tea
  {
    name: 'Fruit Tea',
    nameVi: 'Trà Trái Cây',
    price: 4.00,
    description: 'Syrup, fruit jam, jasmine tea base and toppings',
    category: 'bubble_tea',
    vegetarian: true,
    options: [
      {
        name: 'Flavor',
        choices: [
          { name: 'Strawberry' },
          { name: 'Mango' },
          { name: 'Peach' },
          { name: 'Lychee' },
          { name: 'Passion Fruit' },
        ],
      },
      {
        name: 'Pops',
        choices: [
          { name: 'Strawberry' },
          { name: 'Mango' },
          { name: 'Peach' },
          { name: 'Passion fruit' },
          { name: 'None', price: 0 },
        ],
      },
      {
        name: 'Tapioca',
        choices: [
          { name: 'Brown Sugar' },
          { name: 'Original' },
          { name: 'None', price: 0 },
        ],
      },
      {
        name: 'Ice Level',
        choices: [
          { name: '25%' },
          { name: '50%' },
          { name: '75%' },
          { name: '100%' },
        ],
      },
      {
        name: 'Sugar Level',
        choices: [
          { name: '25%' },
          { name: '50%' },
          { name: '75%' },
          { name: '100%' },
        ],
      },
    ],
  },
  {
    name: 'Milk Tea',
    nameVi: 'Trà Sữa',
    price: 4.50,
    description: 'Flavored milk powder, syrup, milk, jasmine tea and toppings',
    category: 'bubble_tea',
    vegetarian: true,
    options: [
      {
        name: 'Flavor',
        choices: [
          { name: 'Strawberry' },
          { name: 'Mango' },
          { name: 'Chocolate' },
          { name: 'Taro' },
          { name: 'Matcha' },
          { name: 'Original' },
          { name: 'Brown Sugar' },
        ],
      },
      {
        name: 'Pops',
        choices: [
          { name: 'Strawberry' },
          { name: 'Mango' },
          { name: 'Peach' },
          { name: 'Passion fruit' },
          { name: 'None', price: 0 },
        ],
      },
      {
        name: 'Tapioca',
        choices: [
          { name: 'Brown Sugar' },
          { name: 'Original' },
          { name: 'None', price: 0 },
        ],
      },
      {
        name: 'Ice Level',
        choices: [
          { name: '25%' },
          { name: '50%' },
          { name: '75%' },
          { name: '100%' },
        ],
      },
      {
        name: 'Sugar Level',
        choices: [
          { name: '25%' },
          { name: '50%' },
          { name: '75%' },
          { name: '100%' },
        ],
      },
    ],
  },
];

async function seedMenu() {
  try {
    console.log('Starting menu seeding...');
    
    // Clear existing menu items to avoid duplicates
    await prisma.menuOption.deleteMany();
    await prisma.menuItem.deleteMany();
    
    console.log('Previous menu items deleted');
    
    // Create each menu item with its options
    for (const item of menuItems) {
      const { options, ...menuItemData } = item;
      
      const createdItem = await prisma.menuItem.create({
        data: menuItemData,
      });
      
      console.log(`Created menu item: ${createdItem.name}`);
      
      // Create options if they exist
      if (options && options.length > 0) {
        for (const option of options) {
          await prisma.menuOption.create({
            data: {
              name: option.name,
              menuItemId: createdItem.id,
              choices: {
                create: option.choices.map(choice => ({
                  name: choice.name,
                  price: choice.price,
                })),
              },
            },
          });
          console.log(`  Added option: ${option.name} with ${option.choices.length} choices`);
        }
      }
    }
    
    console.log('Menu seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding menu:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedMenu(); 