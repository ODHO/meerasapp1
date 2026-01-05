import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { supabase, Question, Option, UserAnswer } from '../lib/supabase';

interface QuestionDisplayProps {
  categoryId: string;
  categoryName: string;
  onComplete: (answers: UserAnswer[]) => void;
  onBack: () => void;
}

export function QuestionDisplay({
  categoryId,
  categoryName,
  onComplete,
  onBack,
}: QuestionDisplayProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [allOptions, setAllOptions] = useState<{ [key: string]: Option[] }>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestionsAndOptions();
  }, [categoryId]);

  async function fetchQuestionsAndOptions() {
    try {
      setLoading(true);

      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('category_id', categoryId)
        .order('order_index', { ascending: true });

      if (questionsError) throw questionsError;

      const { data: optionsData, error: optionsError } = await supabase
        .from('options')
        .select('*')
        .in('question_id', questionsData.map((q) => q.id))
        .order('order_index', { ascending: true });

      if (optionsError) throw optionsError;

      const optionsByQuestion: { [key: string]: Option[] } = {};
      optionsData.forEach((option) => {
        if (!optionsByQuestion[option.question_id]) {
          optionsByQuestion[option.question_id] = [];
        }
        optionsByQuestion[option.question_id].push(option);
      });

      setQuestions(questionsData);
      setAllOptions(optionsByQuestion);
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleOptionSelect(optionId: string) {
    if (showExplanation) return;
    setSelectedOption(optionId);
  }

  function handleSubmitAnswer() {
    if (!selectedOption) return;

    const currentQuestion = questions[currentQuestionIndex];
    const options = allOptions[currentQuestion.id];
    const selectedOptionData = options.find((opt) => opt.id === selectedOption);

    if (selectedOptionData) {
      setUserAnswers([
        ...userAnswers,
        {
          questionId: currentQuestion.id,
          selectedOptionId: selectedOption,
          isCorrect: selectedOptionData.is_correct,
        },
      ]);
      setShowExplanation(true);
    }
  }

  function handleNextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      onComplete(userAnswers);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <p className="text-gray-600 mb-4">No questions available in this category.</p>
          <button
            onClick={onBack}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const options = allOptions[currentQuestion.id] || [];
  const selectedOptionData = options.find((opt) => opt.id === selectedOption);
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="text-teal-600 hover:text-teal-700 font-semibold flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Categories
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-teal-600">
                {categoryName}
              </span>
              <span className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-8">
            {currentQuestion.question_text}
          </h2>

          <div className="space-y-4 mb-8">
            {options.map((option) => {
              const isSelected = selectedOption === option.id;
              const showCorrectness = showExplanation && isSelected;

              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id)}
                  disabled={showExplanation}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected && !showExplanation
                      ? 'border-teal-600 bg-teal-50'
                      : isSelected && showExplanation && option.is_correct
                      ? 'border-green-600 bg-green-50'
                      : isSelected && showExplanation && !option.is_correct
                      ? 'border-red-600 bg-red-50'
                      : 'border-gray-200 hover:border-teal-300 bg-white'
                  } ${showExplanation ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-800">{option.option_text}</span>
                    {showCorrectness && (
                      <span className="ml-4">
                        {option.is_correct ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-600" />
                        )}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {showExplanation && selectedOptionData && (
            <div className="mb-6 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-600">
              <h3 className="font-semibold text-blue-900 mb-2">Explanation:</h3>
              <p className="text-blue-800 mb-4">{selectedOptionData.explanation}</p>
              <div className="p-4 bg-white rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Detailed Information:
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            {!showExplanation ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedOption}
                className={`px-8 py-3 rounded-lg font-semibold flex items-center ${
                  selectedOption
                    ? 'bg-teal-600 text-white hover:bg-teal-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-700 flex items-center"
              >
                {currentQuestionIndex < questions.length - 1
                  ? 'Next Question'
                  : 'View Results'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
