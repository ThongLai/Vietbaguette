export const normalizeCategory = (category: string): string => {
  // Convert snake_case or kebab-case to space-separated
  const withSpaces = category.replace(/[_-]/g, ' ');
  
  // Special cases
  const specialCases: Record<string, string> = {
    'bubbletea': 'Bubble Tea',
    'bubble tea': 'Bubble Tea',
    'bubble_tea': 'Bubble Tea',
    'pho': 'Phở',
    'banh mi': 'Bánh Mì',
    'banh_mi': 'Bánh Mì',
  };
  
  const lowerCase = withSpaces.toLowerCase();
  if (lowerCase in specialCases) {
    return specialCases[lowerCase];
  }
  
  // Capitalize each word
  return withSpaces
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
