import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, CheckCircle, XCircle, Trophy, ArrowRight, RefreshCcw } from 'lucide-react';
import { clsx } from 'clsx';
import api from '@/lib/api';
import { useNavigate } from 'react-router-dom';

const POOL_QUESTIONS = [
    {
        id: 1,
        question: "Theo quan điểm của Chủ nghĩa duy vật biện chứng, yếu tố nào quyết định ý thức?",
        options: [
            "A. Ý chí chủ quan",
            "B. Vật chất",
            "C. Thượng đế",
            "D. Tinh thần tuyệt đối"
        ],
        correct: 1, // B
        explanation: "Chủ nghĩa duy vật biện chứng khẳng định: Vật chất có trước, ý thức có sau, vật chất quyết định ý thức."
    },
    {
        id: 2,
        question: "Quy luật nào được coi là hạt nhân của phép biện chứng duy vật?",
        options: [
            "A. Quy luật Lượng - Chất",
            "B. Quy luật Phủ định của phủ định",
            "C. Quy luật Mâu thuẫn",
            "D. Quy luật Giá trị"
        ],
        correct: 2, // C
        explanation: "Quy luật thống nhất và đấu tranh của các mặt đối lập (Quy luật mâu thuẫn) là hạt nhân của phép biện chứng."
    },
    {
        id: 3,
        question: "Ai là tác giả của tác phẩm 'Tuyên ngôn của Đảng Cộng sản'?",
        options: [
            "A. V.I. Lênin",
            "B. Hê-ghen",
            "C. C. Mác và Ph. Ăng-ghen",
            "D. Hồ Chí Minh"
        ],
        correct: 2, // C
        explanation: "Tuyên ngôn Đảng Cộng sản được soạn thảo bởi C. Mác và Ph. Ăng-ghen, công bố năm 1848."
    },
    {
        id: 4,
        question: "Trong xã hội có giai cấp, động lực chủ yếu của sự phát triển là gì?",
        options: [
            "A. Sự phát triển khoa học kỹ thuật",
            "B. Đấu tranh giai cấp",
            "C. Sự gia tăng dân số",
            "D. Hợp tác quốc tế"
        ],
        correct: 1, // B
        explanation: "Trong xã hội có giai cấp, đấu tranh giai cấp là động lực trực tiếp và quan trọng của lịch sử."
    },
    {
        id: 5,
        question: "Hàng hóa có hai thuộc tính cơ bản nào?",
        options: [
            "A. Giá trị sử dụng và Giá trị trao đổi",
            "B. Giá trị sử dụng và Giá trị",
            "C. Giá cả và Lợi nhuận",
            "D. Cung và Cầu"
        ],
        correct: 1, // B
        explanation: "Hàng hóa là sự thống nhất biện chứng của hai thuộc tính: Giá trị sử dụng và Giá trị."
    },
    {
        id: 6,
        question: "Mối quan hệ giữa vật chất và ý thức là mối quan hệ như thế nào?",
        options: [
            "A. Một chiều: Vật chất quyết định ý thức",
            "B. Một chiều: Ý thức quyết định vật chất",
            "C. Biện chứng: Vật chất quyết định ý thức, ý thức tác động trở lại vật chất",
            "D. Độc lập, không quan hệ với nhau"
        ],
        correct: 2,
        explanation: "Vật chất quyết định nguồn gốc và nội dung của ý thức, nhưng ý thức có tính độc lập tương đối và tác động trở lại vật chất."
    },
    {
        id: 7,
        question: "Thực tiễn là gì?",
        options: [
            "A. Hoạt động tinh thần của con người",
            "B. Hoạt động vật chất có mục đích, mang tính lịch sử - xã hội",
            "C. Hoạt động bản năng của loài người",
            "D. Sự suy ngẫm về thế giới"
        ],
        correct: 1,
        explanation: "Thực tiễn là toàn bộ hoạt động vật chất có mục đích, mang tính lịch sử - xã hội của con người nhằm cải biến tự nhiên và xã hội."
    },
    {
        id: 8,
        question: "Hình thái kinh tế - xã hội được cấu thành từ những yếu tố nào?",
        options: [
            "A. Lực lượng sản xuất, Quan hệ sản xuất, Kiến trúc thượng tầng",
            "B. Cơ sở hạ tầng và Kiến trúc thượng tầng",
            "C. Giai cấp thống trị và giai cấp bị trị",
            "D. Kinh tế và Chính trị"
        ],
        correct: 0,
        explanation: "Cấu trúc hình thái KT-XH gồm: Lực lượng sản xuất, Quan hệ sản xuất (Cơ sở hạ tầng), và Kiến trúc thượng tầng."
    },
    {
        id: 9,
        question: "Giai cấp công nhân là giai cấp đại biểu cho cái gì?",
        options: [
            "A. Nền sản xuất thủ công nghiệp",
            "B. Phương thức sản xuất tiên tiến",
            "C. Lợi ích của giai cấp tư sản",
            "D. Truyền thống văn hóa dân tộc"
        ],
        correct: 1,
        explanation: "Giai cấp công nhân đại biểu cho phương thức sản xuất tiên tiến, gắn liền với nền công nghiệp hiện đại."
    },
    {
        id: 10,
        question: "Bản chất của nhà nước là gì?",
        options: [
            "A. Cơ quan quản lý xã hội vì lợi ích chung",
            "B. Công cụ thống trị của giai cấp này đối với giai cấp khác",
            "C. Tổ chức trọng tài đứng giữa các giai cấp",
            "D. Biểu tượng của sự đoàn kết dân tộc"
        ],
        correct: 1,
        explanation: "Theo chủ nghĩa Mác-Lênin, nhà nước là bộ máy dùng để duy trì sự thống trị của giai cấp này đối với giai cấp khác."
    }
];

export default function Quiz() {
    const [questions, setQuestions] = useState<typeof POOL_QUESTIONS>([]);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const navigate = useNavigate();
    const [canTakeQuiz, setCanTakeQuiz] = useState(true);

    const currentQuestion = questions[currentQuestionIdx];

    useEffect(() => {
        const initQuiz = async () => {
            // 1. Check status
            try {
                const statusRes = await api.get('/quiz/status');
                setCanTakeQuiz(statusRes.data.can_take_quiz);
                
                if (!statusRes.data.can_take_quiz) return;

                // 2. Fetch AI questions with timeout race
                try {
                    const fetchPromise = api.get('/quiz/generate');
                    const timeoutPromise = new Promise((_, reject) => 
                        setTimeout(() => reject(new Error("Timeout")), 6000)
                    );

                    const quizRes: any = await Promise.race([fetchPromise, timeoutPromise]);
                    
                    if (quizRes.data.questions && quizRes.data.questions.length > 0) {
                        setQuestions(quizRes.data.questions);
                    } else {
                        throw new Error("No questions returned");
                    }
                } catch (e) {
                    console.warn("Using fallback questions (AI too slow or failed)");
                    const shuffled = [...POOL_QUESTIONS].sort(() => 0.5 - Math.random());
                    setQuestions(shuffled.slice(0, 5));
                }

            } catch (error) {
                console.error("Failed to check quiz status", error);
            }
        };
        initQuiz();
    }, []);

    const handleOptionSelect = (idx: number) => {
        if (isAnswered || !canTakeQuiz) return;
        setSelectedOption(idx);
    };

    if ((!canTakeQuiz && !showResult) || questions.length === 0) {
        return (
            <div className="flex h-full bg-gray-50 items-center justify-center font-sans p-4">
                {questions.length === 0 ? (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 border-4 border-soviet-red-200 border-t-soviet-red-700 rounded-full animate-spin mb-4"></div>
                        <div className="text-soviet-red-700 font-medium animate-pulse">Đang chuẩn bị câu hỏi...</div>
                    </div>
                ) : (
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center"
                    >
                        <div className="bg-soviet-red-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="h-12 w-12 text-soviet-red-600" />
                        </div>
                        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Đã hoàn thành!</h2>
                        <p className="text-gray-600 mb-6">Bạn đã hoàn thành bài trắc nghiệm của ngày hôm nay. Hãy quay lại vào ngày mai nhé!</p>
                        
                        <button 
                            onClick={() => navigate('/leaderboard')}
                            className="w-full py-3 bg-soviet-red-700 text-white rounded-xl font-medium hover:bg-soviet-red-800 transition-colors flex items-center justify-center"
                        >
                            <Trophy className="mr-2 h-5 w-5" />
                            Xem Bảng xếp hạng
                        </button>
                    </motion.div>
                )}
            </div>
        );
    }

    const handleSubmit = async () => {
        if (selectedOption === null) return;
        
        setIsAnswered(true);
        const isCorrect = selectedOption === currentQuestion.correct;
        
        if (isCorrect) {
            setScore(score + 1);
        }
    };

    const handleNext = () => {
        if (currentQuestionIdx < questions.length - 1) {
            setCurrentQuestionIdx(currentQuestionIdx + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = async () => {
        setShowResult(true);
        try {
            if (score > 0 || (selectedOption === currentQuestion.correct)) {
                 await api.post('/quiz/submit', { score: score });
            }
        } catch (error: any) {
            console.error("Failed to submit score", error);
        }
    }

    const handleRestart = () => {
        // Shuffle again on restart? Or just reset?
        // Let's shuffle again to keep it interesting
        const shuffled = [...POOL_QUESTIONS].sort(() => 0.5 - Math.random());
        setQuestions(shuffled.slice(0, 5));
        
        setCurrentQuestionIdx(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setScore(0);
        setShowResult(false);
    };

    if (showResult) {
        return (
            <div className="flex h-full bg-gray-50 items-center justify-center font-sans">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center"
                >
                    <div className="bg-soviet-red-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trophy className="h-12 w-12 text-soviet-red-600" />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Hoàn thành!</h2>
                    <p className="text-gray-600 mb-6">Bạn đã trả lời đúng</p>
                    
                    <div className="text-5xl font-bold text-soviet-red-700 mb-8">
                        {score} <span className="text-2xl text-gray-400">/ {questions.length}</span>
                    </div>

                    <div className="space-y-3">
                        <button 
                            onClick={() => navigate('/leaderboard')}
                            className="w-full py-3 bg-soviet-red-700 text-white rounded-xl font-medium hover:bg-soviet-red-800 transition-colors flex items-center justify-center"
                        >
                            <Trophy className="mr-2 h-5 w-5" />
                            Xem Bảng xếp hạng
                        </button>
                        <button 
                            onClick={handleRestart}
                            className="w-full py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
                        >
                            <RefreshCcw className="mr-2 h-5 w-5" />
                            Thử lại
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gray-50 overflow-y-auto font-sans">
            <div className="max-w-4xl mx-auto w-full py-10 px-4 sm:px-6 lg:px-8 flex flex-col min-h-full">
                
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-2 text-soviet-red-700 mb-2">
                        <BrainCircuit className="h-6 w-6" />
                        <span className="font-bold tracking-wider uppercase text-sm">Trắc nghiệm Triết học</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full">
                        <motion.div 
                            className="bg-soviet-red-600 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
                        <span>Câu {currentQuestionIdx + 1}</span>
                        <span>{questions.length} câu hỏi</span>
                    </div>
                </div>

                {/* Question Card */}
                <div className="flex-1 flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQuestion.id}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
                        >
                            <h3 className="text-xl md:text-2xl font-serif font-bold text-gray-900 mb-8 leading-relaxed">
                                {currentQuestion.question}
                            </h3>

                            <div className="space-y-4">
                                {currentQuestion.options.map((option, idx) => {
                                    const isSelected = selectedOption === idx;
                                    const isCorrect = idx === currentQuestion.correct;
                                    
                                    let itemClass = "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group ";
                                    
                                    if (isAnswered) {
                                        if (isCorrect) itemClass += "border-green-500 bg-green-50 text-green-900";
                                        else if (isSelected) itemClass += "border-red-500 bg-red-50 text-red-900";
                                        else itemClass += "border-gray-100 text-gray-400 opacity-50";
                                    } else {
                                        if (isSelected) itemClass += "border-soviet-red-500 bg-soviet-red-50 text-soviet-red-900 shadow-sm";
                                        else itemClass += "border-gray-100 hover:border-soviet-red-200 hover:bg-gray-50 text-gray-700";
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleOptionSelect(idx)}
                                            disabled={isAnswered}
                                            className={itemClass}
                                        >
                                            <span className="font-medium">{option}</span>
                                            {isAnswered && isCorrect && <CheckCircle className="h-5 w-5 text-green-600" />}
                                            {isAnswered && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-600" />}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Explanation */}
                            {isAnswered && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-6 pt-6 border-t border-gray-100"
                                >
                                    <p className="text-sm font-bold text-gray-900 mb-1">Giải thích:</p>
                                    <p className="text-gray-600 italic">{currentQuestion.explanation}</p>
                                </motion.div>
                            )}

                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer Controls */}
                <div className="mt-8 flex justify-end pb-10">
                    {!isAnswered ? (
                        <button
                            onClick={handleSubmit}
                            disabled={selectedOption === null}
                            className="px-8 py-3 bg-soviet-red-700 text-white rounded-xl font-medium shadow-md hover:bg-soviet-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Trả lời
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="px-8 py-3 bg-gray-900 text-white rounded-xl font-medium shadow-md hover:bg-black transition-all flex items-center"
                        >
                            {currentQuestionIdx < questions.length - 1 ? "Câu tiếp theo" : "Xem kết quả"}
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
