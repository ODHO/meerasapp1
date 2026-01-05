import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Award, BookOpen, Loader2 } from 'lucide-react';
import { supabase, UserAnswer, Question, Option } from '../lib/supabase';

interface ResultsPageProps {
  categoryName: string;
  userAnswers: UserAnswer[];
  onRestart: () => void;
}

interface QuestionResult {
  question: Question;
  selectedOption: Option;
  correctOption: Option;
  isCorrect: boolean;
}

export function ResultsPage({
  categoryName,
  userAnswers,
  onRestart,
}: ResultsPageProps) {
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetailedResults();
  }, [userAnswers]);

  async function fetchDetailedResults() {
    try {
      setLoading(true);

      const questionIds = userAnswers.map((ans) => ans.questionId);

      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .in('id', questionIds)
        .order('order_index', { ascending: true });

      if (questionsError) throw questionsError;

      const { data: optionsData, error: optionsError } = await supabase
        .from('options')
        .select('*')
        .in('question_id', questionIds);

      if (optionsError) throw optionsError;

      const detailedResults: QuestionResult[] = questionsData.map((question) => {
        const userAnswer = userAnswers.find((ans) => ans.questionId === question.id);
        const questionOptions = optionsData.filter(
          (opt) => opt.question_id === question.id
        );
        const selectedOption = questionOptions.find(
          (opt) => opt.id === userAnswer?.selectedOptionId
        );
        const correctOption = questionOptions.find((opt) => opt.is_correct);

        return {
          question,
          selectedOption: selectedOption!,
          correctOption: correctOption!,
          isCorrect: userAnswer?.isCorrect || false,
        };
      });

      setResults(detailedResults);
    } catch (err) {
      console.error('Error fetching results:', err);
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

  const correctAnswers = results.filter((r) => r.isCorrect).length;
  const totalQuestions = results.length;
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-8 text-white">
            <div className="flex items-center justify-center mb-4">
              <Award className="w-16 h-16" />
            </div>
            <h1 className="text-3xl font-bold text-center mb-2">
              Learning Summary
            </h1>
            <p className="text-center text-teal-100 text-lg">
              {categoryName}
            </p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {totalQuestions}
                </div>
                <div className="text-sm text-gray-600 mt-1">Total Questions</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {correctAnswers}
                </div>
                <div className="text-sm text-gray-600 mt-1">Correct Answers</div>
              </div>
              <div className="bg-teal-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-teal-600">
                  {percentage}%
                </div>
                <div className="text-sm text-gray-600 mt-1">Score</div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <BookOpen className="w-6 h-6 mr-2 text-teal-600" />
                Detailed Review
              </h2>
              <p className="text-gray-600 mb-6">
                Review each question below to reinforce your understanding of Islamic
                inheritance principles.
              </p>
            </div>

            <div className="space-y-6">
              {results.map((result, index) => (
                <div
                  key={result.question.id}
                  className="border-2 border-gray-200 rounded-lg p-6 hover:border-teal-300 transition-colors"
                >
                  <div className="flex items-start mb-4">
                    <div className="flex-shrink-0 mr-4">
                      {result.isCorrect ? (
                        <div className="bg-green-100 rounded-full p-2">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                      ) : (
                        <div className="bg-red-100 rounded-full p-2">
                          <XCircle className="w-6 h-6 text-red-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-sm font-semibold text-gray-500 mr-2">
                          Question {index + 1}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            result.isCorrect
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {result.isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        {result.question.question_text}
                      </h3>

                      <div className="space-y-2 mb-4">
                        <div>
                          <span className="text-sm font-semibold text-gray-600">
                            Your Answer:
                          </span>
                          <div
                            className={`mt-1 p-3 rounded-lg ${
                              result.isCorrect
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-red-50 border border-red-200'
                            }`}
                          >
                            <p className="text-gray-800">
                              {result.selectedOption.option_text}
                            </p>
                          </div>
                        </div>

                        {!result.isCorrect && (
                          <div>
                            <span className="text-sm font-semibold text-gray-600">
                              Correct Answer:
                            </span>
                            <div className="mt-1 p-3 rounded-lg bg-green-50 border border-green-200">
                              <p className="text-gray-800">
                                {result.correctOption.option_text}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-600">
                        <h4 className="font-semibold text-blue-900 mb-2">
                          Educational Information:
                        </h4>
                        <p className="text-blue-800 leading-relaxed">
                          {result.question.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="bg-teal-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-teal-900 mb-2 text-lg">
                  Remember
                </h3>
                <p className="text-teal-800 leading-relaxed">
                  Islamic inheritance law is a comprehensive system revealed in the
                  Quran and explained through the Hadith. Continue learning and
                  consulting with knowledgeable scholars for specific situations.
                  Understanding these principles helps ensure justice and fairness
                  in the distribution of wealth according to Islamic teachings.
                </p>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={onRestart}
                  className="bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors flex items-center"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Explore More Topics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
