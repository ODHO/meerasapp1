import { useState } from "react";
import { UserAnswer } from "./src/lib/supabase";
import { LandingPage } from "./src/components/LandingPage";
import { QuestionDisplay } from "./src/components/QuestionDisplay";
import { ResultsPage } from "./src/components/ResultsPage";


type AppState = 'landing' | 'questions' | 'results';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('landing');
  const [selectedCategory, setSelectedCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);

  function handleCategorySelect(categoryId: string, categoryName: string) {
    setSelectedCategory({ id: categoryId, name: categoryName });
    setAppState('questions');
  }

  function handleQuestionsComplete(answers: UserAnswer[]) {
    setUserAnswers(answers);
    setAppState('results');
  }

  function handleRestart() {
    setSelectedCategory(null);
    setUserAnswers([]);
    setAppState('landing');
  }

  function handleBackToCategories() {
    setSelectedCategory(null);
    setAppState('landing');
  }

  return (
    <>
      {appState === 'landing' && (
        <LandingPage onCategorySelect={handleCategorySelect} />
      )}

      {appState === 'questions' && selectedCategory && (
        <QuestionDisplay
          categoryId={selectedCategory.id}
          categoryName={selectedCategory.name}
          onComplete={handleQuestionsComplete}
          onBack={handleBackToCategories}
        />
      )}

      {appState === 'results' && selectedCategory && (
        <ResultsPage
          categoryName={selectedCategory.name}
          userAnswers={userAnswers}
          onRestart={handleRestart}
        />
      )}
    </>
  );
}

export default App;