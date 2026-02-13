import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Heart, ArrowLeft, CheckCircle, XCircle, Trophy, Star, Zap } from "lucide-react";
import UserHeader from "@/components/layout/UserHeader";
import { motion, AnimatePresence } from "framer-motion";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  image_url: string | null;
}

type QuizState = "pre-start" | "in-progress" | "finished";

interface QuizResult {
  score: number;
  total: number;
  points_earned: number;
  hearts_lost: number;
  hearts_remaining: number;
  double_points_used: boolean;
  is_completed: boolean;
  error?: string;
}

const Quiz = () => {
  const { milestoneId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [state, setState] = useState<QuizState>("pre-start");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [countDown, setCountDown] = useState(3);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    const fetchTitle = async () => {
      const { data } = await supabase.from("milestones").select("title").eq("id", milestoneId).single();
      if (data) setMilestoneTitle(data.title);
    };
    fetchTitle();
  }, [user, milestoneId, navigate]);

  const fetchQuestions = async () => {
    const { data } = await supabase.from("quiz_questions").select("id, question, options, image_url").eq("milestone_id", milestoneId);
    if (data && data.length > 0) {
      const shuffled = data.map((q) => ({ ...q, options: q.options as unknown as string[] })).sort(() => Math.random() - 0.5).slice(0, 10);
      setQuestions(shuffled);
    }
  };

  const startQuiz = async () => {
    setLoading(true);
    await fetchQuestions();
    setCountDown(3);
    setState("in-progress");
    setLoading(false);
    const timer = setInterval(() => {
      setCountDown((prev) => { if (prev <= 1) { clearInterval(timer); return 0; } return prev - 1; });
    }, 1000);
  };

  const selectAnswer = (optionIndex: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(optionIndex);
    setTimeout(() => {
      const newAnswers = [...answers, optionIndex];
      setAnswers(newAnswers);
      setSelectedAnswer(null);
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(currentIndex + 1);
      } else {
        submitQuiz(newAnswers);
      }
    }, 600);
  };

  const submitQuiz = async (finalAnswers: number[]) => {
    setLoading(true);
    const { data, error } = await supabase.rpc("submit_quiz", { p_milestone_id: milestoneId, p_answers: finalAnswers });
    if (error) {
      setResult({ score: 0, total: questions.length, points_earned: 0, hearts_lost: 0, hearts_remaining: 0, double_points_used: false, is_completed: false, error: error.message });
    } else {
      setResult(data as unknown as QuizResult);
    }
    setState("finished");
    setLoading(false);
  };

  if (!user) return null;

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex) / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <UserHeader />

      <main className="py-8 px-6 md:px-12">
        <div className="container mx-auto max-w-2xl">
          {/* Pre-start */}
          <AnimatePresence mode="wait">
            {state === "pre-start" && (
              <motion.div
                key="pre-start"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center py-20"
              >
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-accent/10 flex items-center justify-center"
                >
                  <Trophy className="w-12 h-12 text-accent" />
                </motion.div>
                <h2 className="text-3xl font-bold text-foreground mb-3">
                  {milestoneTitle}
                </h2>
                <p className="text-muted-foreground mb-2">
                  10 câu hỏi ngẫu nhiên • Đạt 8/10 để hoàn thành
                </p>
                <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-8">
                  <span className="flex items-center gap-1"><Heart className="w-4 h-4 text-destructive" /> Dưới 8: -1 tim</span>
                  <span className="flex items-center gap-1"><Zap className="w-4 h-4 text-accent" /> ≥6: nhận điểm</span>
                </div>
                <Button size="lg" onClick={startQuiz} disabled={loading} className="bg-accent text-accent-foreground hover:bg-accent/90 text-sm py-6">
                  {loading ? "Đang tải..." : "Bắt đầu Quiz 🚀"}
                </Button>
                <div className="mt-4">
                  <Button variant="ghost" onClick={() => navigate(`/milestone/${milestoneId}`)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Countdown */}
            {state === "in-progress" && countDown > 0 && (
              <motion.div
                key="countdown"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-32"
              >
                <motion.div
                  key={countDown}
                  initial={{ scale: 2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="text-8xl font-bold text-accent"
                >
                  {countDown}
                </motion.div>
                <p className="text-muted-foreground mt-4">Chuẩn bị sẵn sàng...</p>
              </motion.div>
            )}

            {/* Question */}
            {state === "in-progress" && countDown === 0 && currentQuestion && (
              <motion.div
                key={`question-${currentIndex}`}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4 }}
              >
                {/* Progress */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Câu {currentIndex + 1}/{questions.length}</span>
                    <span className="text-sm text-accent font-medium">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {/* Question Card */}
                <div className="bg-card border border-border rounded-xl p-8 mb-6 shadow-editorial">
                  {currentQuestion.image_url && (
                    <img src={currentQuestion.image_url} alt="Question" className="w-full h-48 object-cover rounded-lg mb-6" />
                  )}
                  <h3 className="text-xl font-bold text-foreground leading-relaxed">{currentQuestion.question}</h3>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    return (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => selectAnswer(index)}
                        disabled={selectedAnswer !== null}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-300
                          ${isSelected ? "border-accent bg-accent/10 shadow-md" : "border-border bg-card hover:border-accent/50 hover:bg-muted/30"}
                          ${selectedAnswer !== null && !isSelected ? "opacity-40" : ""}
                        `}
                      >
                        <div className="flex items-center gap-4">
                          <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors
                            ${isSelected ? "bg-accent text-accent-foreground" : "border border-border text-muted-foreground"}`}>
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="text-foreground font-medium">{option}</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Results */}
            {state === "finished" && result && (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-12"
              >
                {result.error ? (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-8">
                    <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-foreground mb-2">Có lỗi xảy ra</h3>
                    <p className="text-muted-foreground">{result.error}</p>
                  </div>
                ) : (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                      className={`w-36 h-36 mx-auto mb-8 rounded-full flex items-center justify-center border-4 ${
                        result.is_completed ? "border-accent bg-accent/10" : "border-muted bg-muted/30"
                      }`}
                    >
                      <div>
                        <div className="text-5xl font-bold text-foreground">{result.score}</div>
                        <div className="text-sm text-muted-foreground">/{result.total}</div>
                      </div>
                    </motion.div>

                    {result.is_completed ? (
                      <div className="mb-6">
                        <CheckCircle className="w-8 h-8 text-accent mx-auto mb-2" />
                        <h3 className="text-2xl font-bold text-foreground">Xuất sắc! 🎉</h3>
                        <p className="text-muted-foreground">Bạn đã hoàn thành cột mốc này!</p>
                      </div>
                    ) : (
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold text-foreground">
                          {result.score > 5 ? "Khá tốt! 💪" : "Cần cố gắng hơn 📚"}
                        </h3>
                        <p className="text-muted-foreground">Cần đạt 8/10 để hoàn thành cột mốc</p>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-8">
                      {[
                        { icon: <Star className="w-5 h-5 text-accent" />, value: result.points_earned, label: "Điểm" },
                        { icon: <Heart className="w-5 h-5 text-destructive" />, value: `-${result.hearts_lost}`, label: "Tim" },
                        { icon: <Heart className="w-5 h-5 text-destructive fill-destructive" />, value: result.hearts_remaining, label: "Còn lại" },
                      ].map((s, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + i * 0.1 }}
                          className="bg-card border border-border rounded-xl p-4"
                        >
                          <div className="flex justify-center mb-1">{s.icon}</div>
                          <div className="font-bold text-foreground">{s.value}</div>
                          <div className="text-xs text-muted-foreground">{s.label}</div>
                        </motion.div>
                      ))}
                    </div>

                    {result.double_points_used && (
                      <p className="text-accent text-sm mb-4">✨ Điểm đã được nhân đôi (Premium)</p>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button onClick={() => { setState("pre-start"); setCurrentIndex(0); setAnswers([]); setResult(null); }} variant="outline">
                        Làm lại Quiz
                      </Button>
                      <Button onClick={() => navigate("/timeline")} className="bg-accent text-accent-foreground hover:bg-accent/90">
                        Tiếp tục khám phá
                      </Button>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {loading && state === "finished" && (
            <div className="text-center py-20">
              <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Đang chấm điểm...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Quiz;
