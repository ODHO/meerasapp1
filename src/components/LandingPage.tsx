import { useEffect, useState } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';
import { supabase, Category } from '../lib/supabase';

interface LandingPageProps {
  onCategorySelect: (categoryId: string, categoryName: string) => void;
}

export function LandingPage({ onCategorySelect }: LandingPageProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-teal-600 p-4 rounded-full">
              <BookOpen className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Islamic Inheritance (Meeras)
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Learn about Islamic inheritance laws through informative questions.
            Select a category below to begin your educational journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category.id, category.name)}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-8 text-left group hover:scale-105"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-teal-600 transition-colors">
                {category.name}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {category.description}
              </p>
              <div className="mt-4 flex items-center text-teal-600 font-semibold">
                <span>Start Learning</span>
                <svg
                  className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              About This Learning Tool
            </h3>
            <p className="text-gray-600 leading-relaxed">
              This is an educational resource designed to help you understand the
              principles of Islamic inheritance law (Ilm al-Faraid). Each question
              is followed by detailed explanations based on Quranic verses and
              Hadith. Take your time to read and reflect on each answer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
