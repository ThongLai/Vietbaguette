import { MenuSection as MenuSectionComponent } from '../MenuSection';
import { MenuCard } from '../MenuCard';

// Create a properly exportable MenuSection with Card component
export const MenuSection = Object.assign(MenuSectionComponent, {
  Card: MenuCard
});

export default MenuSection; 