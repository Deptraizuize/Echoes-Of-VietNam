import { CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";

interface ReviewQuestion {
  question: string;
  options: string[];
  userAnswer: number;
  correctAnswer: number;
  image_url: string | null;
}

const QuizReview = ({ questions }: { questions: ReviewQuestion[] }) => {
  const wrongQuestions = questions.filter((q) => q.userAnswer !== q.correctAnswer);

  if (wrongQuestions.length === 0) {
    return (
      <div className="text-center py-6">
        <CheckCircle className="w-8 h-8 text-accent mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Bạn trả lời đúng tất cả! 🎉</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-foreground text-sm">
        Xem lại {wrongQuestions.length} câu sai:
      </h4>
      {wrongQuestions.map((q, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          {q.image_url && (
            <img src={q.image_url} alt="Question" className="w-full h-36 object-cover rounded-lg mb-3" />
          )}
          <p className="text-sm font-medium text-foreground mb-3">{q.question}</p>
          <div className="space-y-2">
            {q.options.map((opt, oi) => {
              const isCorrect = oi === q.correctAnswer;
              const isUserWrong = oi === q.userAnswer && !isCorrect;
              return (
                <div
                  key={oi}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                    isCorrect
                      ? "bg-accent/10 border border-accent/30 text-accent"
                      : isUserWrong
                      ? "bg-destructive/10 border border-destructive/30 text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  {isCorrect && <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />}
                  {isUserWrong && <XCircle className="w-3.5 h-3.5 flex-shrink-0" />}
                  <span className={`font-bold mr-1 ${!isCorrect && !isUserWrong ? "text-muted-foreground" : ""}`}>
                    {String.fromCharCode(65 + oi)}.
                  </span>
                  {opt}
                </div>
              );
            })}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default QuizReview;
