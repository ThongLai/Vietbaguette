
import { createContext, useState, useContext, ReactNode } from 'react';

type Language = 'en' | 'vi';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.menu': 'Menu',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.login': 'Login',
    'nav.dashboard': 'Dashboard',
    'nav.logout': 'Logout',
    
    // Home page
    'home.hero.title': 'Authentic Vietnamese Street Food',
    'home.hero.subtitle': 'Experience the flavors of Vietnam in Halifax',
    'home.specialties.title': 'Our Specialties',
    'home.specialties.desc': 'Visit Viet Baguette, an outpost in Halifax filled with Vietnamese street foods & bubble teas. Follow our journey on a culinary tour of Vietnam where every cup of dripping coffee will remind you of a leisurely morning in a vibrant alleyway or a refreshing glass of smoothie topped with fresh fruits.',
    
    // Menu
    'menu.title': 'Our Menu',
    'menu.categories.starters': 'Starters',
    'menu.categories.main': 'Main Courses',
    'menu.categories.sides': 'Sides',
    'menu.categories.drinks': 'Drinks',
    'menu.categories.desserts': 'Desserts',
    
    // Dashboard
    'dashboard.welcome': 'Welcome Back',
    'dashboard.orders.dashboard': 'Dashboard',
    'dashboard.orders.title': 'Orders',
    'dashboard.orders.new': 'New Order',
    'dashboard.orders.active': 'Active Orders',
    'dashboard.orders.completed': 'Completed Orders',
    'dashboard.orders.cancel': 'Cancel',
    'dashboard.orders.modify': 'Modify',
    'dashboard.orders.markDone': 'Mark as Done',
    'dashboard.orders.urgent': 'Urgent',
    
    // Form labels
    'form.email': 'Email Address',
    'form.password': 'Password',
    'form.login': 'Login',
    'form.forgotPassword': 'Forgot Password?',
    'form.name': 'Name',
    'form.phone': 'Phone Number',
    
    // Staff dashboard
    'staff.schedule': 'Schedule',
    'staff.unavailability': 'Set Unavailability',
    'staff.communication': 'Communication',
    'staff.notifications': 'Notifications',
    'staff.orders': 'Orders',
    
    // Admin dashboard
    'admin.employees': 'Employees',
    'admin.menu': 'Menu Management',
    'admin.statistics': 'Statistics',
    'admin.settings': 'Settings',
    'admin.addEmployee': 'Add Employee',
    
    // Common actions
    'actions.save': 'Save',
    'actions.cancel': 'Cancel',
    'actions.edit': 'Edit',
    'actions.delete': 'Delete',
    'actions.add': 'Add',
    'actions.search': 'Search',
    
    // Settings
    'settings.theme': 'Theme',
    'settings.theme.light': 'Light',
    'settings.theme.dark': 'Dark',
    'settings.theme.system': 'System',
    'settings.language': 'Language',
    'settings.language.english': 'English',
    'settings.language.vietnamese': 'Vietnamese',
  },
  vi: {
    // Navigation
    'nav.home': 'Trang chủ',
    'nav.menu': 'Thực đơn',
    'nav.about': 'Giới thiệu',
    'nav.contact': 'Liên hệ',
    'nav.login': 'Đăng nhập',
    'nav.dashboard': 'Bảng điều khiển',
    'nav.logout': 'Đăng xuất',
    
    // Home page
    'home.hero.title': 'Ẩm thực đường phố Việt Nam',
    'home.hero.subtitle': 'Trải nghiệm hương vị Việt Nam tại Halifax',
    'home.specialties.title': 'Món đặc sản',
    'home.specialties.desc': 'Ghé thăm Viet Baguette, một điểm đến tại Halifax với đầy đủ món ăn đường phố Việt Nam và trà sữa. Theo chân chúng tôi trong hành trình ẩm thực Việt Nam, nơi mỗi tách cà phê phin sẽ gợi nhớ bạn về một buổi sáng nhàn nhã trong một con hẻm sôi động hoặc một ly sinh tố mát lạnh được trang trí với trái cây tươi.',
    
    // Menu
    'menu.title': 'Thực đơn',
    'menu.categories.starters': 'Khai vị',
    'menu.categories.main': 'Món chính',
    'menu.categories.sides': 'Món phụ',
    'menu.categories.drinks': 'Đồ uống',
    'menu.categories.desserts': 'Tráng miệng',
    
    // Dashboard
    'dashboard.welcome': 'Chào mừng trở lại',
    'dashboard.orders.dashboard': 'Bảng điều khiển',
    'dashboard.orders.title': 'Đơn hàng',
    'dashboard.orders.new': 'Đơn hàng mới',
    'dashboard.orders.active': 'Đơn hàng đang xử lý',
    'dashboard.orders.completed': 'Đơn hàng hoàn thành',
    'dashboard.orders.cancel': 'Hủy',
    'dashboard.orders.modify': 'Chỉnh sửa',
    'dashboard.orders.markDone': 'Đánh dấu hoàn thành',
    'dashboard.orders.urgent': 'Khẩn cấp',
    
    // Form labels
    'form.email': 'Địa chỉ Email',
    'form.password': 'Mật khẩu',
    'form.login': 'Đăng nhập',
    'form.forgotPassword': 'Quên mật khẩu?',
    'form.name': 'Họ tên',
    'form.phone': 'Số điện thoại',
    
    // Staff dashboard
    'staff.schedule': 'Lịch làm việc',
    'staff.unavailability': 'Đặt thời gian không làm việc',
    'staff.communication': 'Giao tiếp',
    'staff.notifications': 'Thông báo',
    'staff.orders': 'Đơn hàng',
    
    // Admin dashboard
    'admin.employees': 'Nhân viên',
    'admin.menu': 'Quản lý thực đơn',
    'admin.statistics': 'Thống kê',
    'admin.settings': 'Cài đặt',
    'admin.addEmployee': 'Thêm nhân viên',
    
    // Common actions
    'actions.save': 'Lưu',
    'actions.cancel': 'Hủy',
    'actions.edit': 'Chỉnh sửa',
    'actions.delete': 'Xóa',
    'actions.add': 'Thêm',
    'actions.search': 'Tìm kiếm',
    
    // Settings
    'settings.theme': 'Giao diện',
    'settings.theme.light': 'Sáng',
    'settings.theme.dark': 'Tối',
    'settings.theme.system': 'Hệ thống',
    'settings.language': 'Ngôn ngữ',
    'settings.language.english': 'Tiếng Anh',
    'settings.language.vietnamese': 'Tiếng Việt',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('viet_baguette_lang') as Language;
    return savedLanguage || 'en';
  });

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('viet_baguette_lang', newLanguage);
  };

  return (
    <LanguageContext.Provider 
      value={{ 
        language, 
        setLanguage: handleLanguageChange, 
        t 
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
