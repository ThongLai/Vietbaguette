import { Link } from 'react-router-dom';
import Menu from './Menu';

export default function Landing() {
  return (
    <div className="bg-cream dark:bg-gray-900 min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center h-[60vh] bg-cover bg-center" style={{ backgroundImage: 'url(/hero-bg.jpg)' }}>
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          <img src="/logo.png" alt="Viet Baguette Logo" className="h-20 w-20 rounded-full shadow mb-4" />
          <h1 className="font-script text-5xl md:text-7xl text-white text-center drop-shadow-lg mb-4">Authentic Vietnamese Street Food</h1>
          <Link to="/menu" className="mt-4 px-6 py-3 bg-primary text-accent font-bold rounded shadow hover:bg-yellow-400 transition">SHOP OUR MENU</Link>
        </div>
      </section>

      {/* Specialties Section */}
      <section className="max-w-4xl mx-auto flex flex-col md:flex-row items-center my-12 p-6 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow">
        <img src="/specialty.jpg" alt="Vietnamese Coffee" className="w-40 h-40 object-cover rounded-lg mb-4 md:mb-0 md:mr-8" />
        <div>
          <h2 className="font-script text-3xl text-accent mb-2">Our Specialities</h2>
          <p className="text-gray-700 dark:text-gray-200 mb-2">
            At Viet Baguette, we bring the heart of Vietnamese street food to Halifax. Whether you're craving a fragrant bowl of Phở, a crispy and flavorful Bánh Mì Vietnamese Baguette, or a refreshing glass of Bubble Tea, our menu is crafted with love, using fresh ingredients and authentic recipes to give you a true taste of Vietnam.
          </p>
          <Link to="/menu" className="inline-block mt-2 px-4 py-2 bg-primary text-accent font-semibold rounded shadow hover:bg-yellow-400 transition">VIEW MENU</Link>
        </div>
      </section>

      {/* Menu Preview Section */}
      <section className="max-w-6xl mx-auto w-full mb-12">
        <h3 className="font-script text-2xl text-accent text-center mb-6">Menu Highlights</h3>
        <Menu />
      </section>

      {/* Footer */}
      <footer className="bg-cream dark:bg-gray-900 py-8 mt-auto border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between px-4">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <img src="/logo.png" alt="Viet Baguette Logo" className="h-10 w-10 rounded-full" />
            <span className="font-script text-xl text-accent">Viet Baguette</span>
          </div>
          <div className="text-gray-700 dark:text-gray-200 text-center md:text-left">
            <div className="mb-1">40 Market Street, Halifax HX1 1PB</div>
            <div className="mb-1">Tel: 0123456789</div>
            <div>Email: info@vietbaguette.co.uk</div>
          </div>
          <div className="text-gray-500 text-sm mt-4 md:mt-0">&copy; 2025, Powered by VMJAgency</div>
        </div>
      </footer>
    </div>
  );
} 