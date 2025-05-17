import { useEffect, useState } from 'react';
import axios from 'axios';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string | null;
  category: string;
}

const API_URL = 'http://localhost:4000/api/menu';

export default function Menu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios.get(API_URL)
      .then(res => setItems(res.data))
      .catch(err => setError('Failed to load menu'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">Menu</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map(item => (
          <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col items-center">
            {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-32 h-32 object-cover rounded mb-2" />}
            <h3 className="text-xl font-semibold mb-1">{item.name}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-2">{item.description}</p>
            <div className="font-bold text-lg mb-1">£{item.price.toFixed(2)}</div>
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">{item.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 