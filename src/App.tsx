import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { 
  Topic, 
  answers, 
  questionToTopic, 
  questionPatterns,
  defaultQuestions 
} from './chatConfig';
interface Message {
  type: 'user' | 'assistant';
  content: string;
}
interface TypeWriterProps {
  text: string;
  onComplete?: () => void;
  speed?: number; // Speed in milliseconds between each character

}

interface MessageProps {
  message: Message;
  isLatest: boolean;
}

interface IntroAnimationProps {
  onComplete: () => void;
}

const TypeWriter: React.FC<TypeWriterProps> = ({ 
  text, 
  onComplete, 
  speed = 30 // Default speed, lower number = faster typing
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return <span>{displayText}</span>;
};

// Adjusting the speed of the load animation here
const LoadingDots: React.FC = () => {
  return (
    <div className="flex space-x-2 p-4 bg-gray-700 rounded-lg w-20">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
    </div>
  );
};

const Message: React.FC<MessageProps> = ({ message, isLatest }) => {
  const [isTyping, setIsTyping] = useState(message.type === 'assistant' && isLatest);

  return (
    <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className="flex items-start gap-3 max-w-xl">
        {message.type === 'assistant' && (
            <img
            src="profile.png"
            alt="Profile"
            className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
          />
        )}
        <div
          className={`rounded-lg p-4 ${
            message.type === 'user'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-100'
          }`}
        >
          {message.type === 'assistant' && isTyping ? (
            <TypeWriter 
              text={message.content} 
              onComplete={() => setIsTyping(false)}
              speed={10}  // Adjust the speed of typing here
            />
          ) : (
            message.content
          )}
        </div>
      </div>
    </div>
  );
};

const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timings = [1000, 2000, 3000];
    
    const timer = setTimeout(() => {
      if (step < timings.length) {
        setStep(step + 1);
      } else {
        onComplete();
      }
    }, timings[step] || 3000);

    return () => clearTimeout(timer);
  }, [step, onComplete]);

  return (
    <div className="fixed inset-0 bg-gray-800 flex items-center justify-center z-50">
      <div className="text-center">
        {step >= 0 && (
          <h1 className="text-4xl font-bold text-white mb-4 animate-fade-in">
            Welcome to Kan's Portfolio
          </h1>
        )}
        {step >= 1 && (
          <p className="text-xl text-gray-300 mb-8 animate-fade-in">
            Let's have a conversation
          </p>
        )}
        {step >= 2 && (
          <div className="animate-fade-in">
            <LoadingDots />
          </div>
        )}
      </div>
    </div>
  );
};

// vector calculation
const calculateSimilarity = (str1: string, str2: string): number => {
  const cleanStr1 = str1.toLowerCase().replace(/[.,?!]/g, '');
  const cleanStr2 = str2.toLowerCase().replace(/[.,?!]/g, '');

  const words1 = cleanStr1.split(' ');
  const words2 = cleanStr2.split(' ');
  const uniqueWords = new Set([...words1, ...words2]);

  const vector1 = Array.from(uniqueWords).map(word => words1.includes(word) ? 1 : 0);
  const vector2 = Array.from(uniqueWords).map(word => words2.includes(word) ? 1 : 0);

  const dotProduct = vector1.reduce((sum: number, val: number, i: number) => sum + val * vector2[i], 0);
  
  const magnitude1 = Math.sqrt(vector1.reduce((sum: number, val: number) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(vector2.reduce((sum: number, val: number) => sum + val * val, 0));

  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  return dotProduct / (magnitude1 * magnitude2);
};

const findBestMatch = (input: string, questionPatterns: Record<Topic, string[]>): Topic | null => {
  let bestMatch: Topic | null = null;
  let highestSimilarity = 0.3;

  for (const [topic, patterns] of Object.entries(questionPatterns)) {
    for (const pattern of patterns) {
      const similarity = calculateSimilarity(input, pattern);
      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        bestMatch = topic as Topic;
      }
    }
  }

  return bestMatch;
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [questionQueue, setQuestionQueue] = useState<string[]>(defaultQuestions);
  const [usedQuestions, setUsedQuestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Get the first 3 available questions
  const currentSuggestions = questionQueue.slice(0, 3);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const addResponse = async (question: string, answer: string) => {
    setMessages(prev => [...prev, { type: 'user', content: question }]);
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setMessages(prev => [...prev, { type: 'assistant', content: answer }]);
  };

  const handleQuestionClick = (question: string) => {
    const topic = questionToTopic[question];
    addResponse(question, answers[topic]);

    // Remove the used question from queue and add to used questions
    setQuestionQueue(prev => prev.filter(q => q !== question));
    setUsedQuestions(prev => [...prev, question]);

    // If fewer than 3 questions in queue and there are used questions,
    // add the oldest used question back to the end of the queue
    if (questionQueue.length <= 3 && usedQuestions.length > 0) {
      const [oldestUsed, ...remainingUsed] = usedQuestions;
      setQuestionQueue(prev => [...prev, oldestUsed]);
      setUsedQuestions(remainingUsed);
    }
  };



  useEffect(() => {
    if (!showIntro) {
      setTimeout(() => {
        setMessages([{
          type: 'assistant',
          content: "Hi, I'm Kan!"
        }]);
      }, 500);
    }
  }, [showIntro]);




  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      const matchedTopic = findBestMatch(inputMessage, questionPatterns);
      
      if (matchedTopic) {
        await addResponse(inputMessage, answers[matchedTopic]);
      } else {
        await addResponse(
          inputMessage,
          "I'm not sure about that. Could you try asking about my age, occupation, or where I'm from?"
        );
      }
      
      setInputMessage('');
    }
  };

  return (
    <>
      {showIntro ? (
        <IntroAnimation onComplete={() => setShowIntro(false)} />
      ) : (
        <div className="flex h-screen bg-gray-800 animate-fade-in">
          {/* Left Sidebar */}
          <div className="w-1/4 bg-gray-900 p-6">
            <div className="flex flex-col items-center">
              <img
                src="profile.png"
                alt="Profile"
                className="rounded-full w-32 h-32 mb-4 animate-scale-in"
              />
              <h2 className="text-xl font-bold mb-2 text-white animate-fade-in">Kan</h2>
              <p className="text-gray-400 text-sm animate-fade-in">Founder DataScienceWorld.Kan</p>
            </div>
            <div className="mt-6 animate-fade-in">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">About me</h3>
              <p className="text-sm text-gray-400">
              Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit...
              </p>
            </div>

            {/* Contact Information */}
            <div className="mt-6 animate-fade-in">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Connect with me</h3>
              <div className="space-y-2">
                <a 
                  href="https://www.linkedin.com/in/khanh-bui020403/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  LinkedIn
                </a>
                <a 
                  href="https://github.com/khanheric2003" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </a>
                <a 
                  href="https://www.youtube.com/@depressionkid8859" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  YouTube
                </a>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col relative">
            <div className="flex-1 p-6 overflow-y-auto pb-32">
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((message, index) => (
                  <Message 
                    key={index} 
                    message={message} 
                    isLatest={index === messages.length - 1}
                  />
                ))}
                <div ref={messagesEndRef} />
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-3">
                      <img
                        src="profile.png"
                        alt="Profile"
                        className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
                      />
                      <LoadingDots />
                    </div>
                  </div>
                )}

          {!isLoading && messages[messages.length - 1]?.type === 'assistant' && (
              <div className="flex flex-wrap gap-2 mt-4 animate-fade-in">
                {currentSuggestions.map((question) => (
                  <button
                    key={question}
                    onClick={() => handleQuestionClick(question)}
                    className="bg-gray-700 hover:bg-gray-600 rounded-lg px-4 py-2 text-sm text-gray-200 flex items-center gap-2 border border-gray-600"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {question}
                  </button>
                ))}
              </div>
              )}
              </div>
            </div>

            {/* Input Area */}
            <div className="absolute bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700">
              <div className="max-w-3xl mx-auto p-6">
                <form onSubmit={handleSubmit} className="relative">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Send a message..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 pr-12 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-gray-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .animate-scale-in {
          animation: scaleIn 0.5s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default App;