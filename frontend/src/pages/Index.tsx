
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Index = () => {
  const { t } = useLanguage();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-linear-to-b from-viet-beige to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/30 dark:bg-black/60 z-10"></div>
          <img
            src="/image/hero-bg.avif"
            alt="Vietnamese Food"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="container mx-auto px-6 relative z-20 text-center">
          <h1 className="font-cursive text-5xl md:text-7xl mb-6 text-white">
            {t('home.hero.title')}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
            {t('home.hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/menu">
              <Button size="lg" className="bg-viet-red hover:bg-viet-darkred">
                View Our Menu
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-viet-red">
                Find Us
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-white/10 backdrop-blur-xs hover:bg-white/20 text-white animate-bounce"
            onClick={() => {
              const specialtiesSection = document.getElementById('specialties');
              if (specialtiesSection) {
                specialtiesSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            <ArrowRight className="h-5 w-5 rotate-90" />
          </Button>
        </div>
      </section>

      {/* Our Specialties */}
      <section id="specialties" className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <h2 className="section-title">{t('home.specialties.title')}</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                {t('home.specialties.desc')}
              </p>
              <Link to="/menu">
                <Button className="bg-viet-red hover:bg-viet-darkred">
                  Explore Menu
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="relative">
              <img
                src="/image/specialty.avif"
                alt="Vietnamese Coffee"
                className="rounded-lg shadow-lg max-w-full h-auto"
              />
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="font-cursive text-xl text-viet-red mb-2">Original Dripping Coffee</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Slow-brewed Vietnamese dripping coffee with rich bold flavors
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Menu Items */}
      <section className="py-20 bg-viet-beige/30 dark:bg-gray-800/50">
        <div className="container mx-auto px-6">
          <h2 className="section-title">Featured Menu</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="food-card overflow-hidden">
              <div className="relative h-48">
                <img
                  src="/placeholder.svg"
                  alt="Banh Mi"
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-1">Baguette</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  A unique homemade baguette filled with salad, pickles, herbs and your choice of protein
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-viet-red font-medium">£7.00</span>
                  <Badge className="bg-viet-green text-white">Popular</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card className="food-card overflow-hidden">
              <div className="relative h-48">
                <img
                  src="/placeholder.svg"
                  alt="Pho"
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-1">Pho</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Aromatic Vietnamese soup with broth, rice noodles, bean sprouts, herbs, and your choice of protein
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-viet-red font-medium">£8.00</span>
                  <Badge className="bg-viet-orange text-white">Best Seller</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card className="food-card overflow-hidden">
              <div className="relative h-48">
                <img
                  src="/placeholder.svg"
                  alt="Bubble Tea"
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-1">Bubble Tea</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Flavoured milk powder, syrup, milk, jasmine tea and toppings in various flavors
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-viet-red font-medium">£4.50</span>
                  <Badge className="bg-viet-brown text-white">Refreshing</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-10">
            <Link to="/menu">
              <Button className="bg-viet-red hover:bg-viet-darkred">
                See Full Menu
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Opening Hours & Location */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="section-title text-left">Opening Hours</h2>
              <div className="space-y-2 mb-8">
                <div className="flex justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                  <span>Monday</span>
                  <span className="font-medium">Closed</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                  <span>Tuesday - Saturday</span>
                  <span className="font-medium">10am - 7pm</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                  <span>Sunday</span>
                  <span className="font-medium">11am - 5pm</span>
                </div>
              </div>
              
              <h2 className="section-title text-left">Contact Us</h2>
              <div className="space-y-3">
                <p className="flex items-start">
                  <span className="mr-2">📍</span>
                  <span>40 Market St, Halifax, HX1 1PB</span>
                </p>
                <p className="flex items-start">
                  <span className="mr-2">📞</span>
                  <span>01422 292250</span>
                </p>
                <p className="flex items-start">
                  <span className="mr-2">📧</span>
                  <span>info@vietbaguette.co.uk</span>
                </p>
              </div>
              
              <div className="mt-8">
                <Link to="/contact">
                  <Button className="bg-viet-red hover:bg-viet-darkred">
                    Find Us
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="aspect-w-4 aspect-h-3">
              <iframe
                title="Google Maps Location"
                className="w-full h-full border-0 rounded-lg shadow-lg"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2358.2864874365114!2d-1.8581!3d53.7224!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487be819433532b3%3A0x41f8b583b4042e87!2s40%20Market%20St%2C%20Halifax%20HX1%201PB!5e0!3m2!1sen!2suk!4v1621348924149!5m2!1sen!2suk"
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter or Promo */}
      <section className="py-16 bg-viet-red text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-cursive mb-4">Catering Services</h2>
          <p className="max-w-2xl mx-auto mb-8">
            Catering or Bao Party is a delicious innovation for your event - family, friends, colleagues or work services. Try the perfect sharing solution for Vietnamese cuisine in your private event and gatherings.
          </p>
          <Button variant="outline" className="border-white text-white hover:bg-white hover:text-viet-red">
            Learn More
          </Button>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;

// Following import needs to be removed once we add real Badge component
import { Badge } from '@/components/ui/badge';
