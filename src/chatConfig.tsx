
export type Topic = 
  | 'introduction' 
  | 'age' 
  | 'location' 
  | 'occupation' 
  | 'goals' 
  | 'favorites' 
  | 'hobbies';

export const questionPatterns: Record<Topic, string[]> = {
  introduction: [
    "who are you",
    "what is your name",
    "tell me about yourself",
    "introduce yourself",
    "your background"
  ],
  age: [
    "how old are you",
    "what is your age",
    "whats your age",
    "what age are you",
    "when were you born",
    "your age",
    "birth year"
  ],
  location: [
    "where are you from",
    "where do you live",
    "which country are you from",
    "what is your nationality",
    "where were you born",
    "your hometown",
    "your country"
  ],
  occupation: [
    "what do you do",
    "what is your job",
    "what is your occupation",
    "what do you work as",
    "your profession",
    "your job",
    "your career"
  ],
  goals: [
    "what is your life goal",
    "what are your goals",
    "what do you want to achieve",
    "your ambitions",
    "your dreams",
    "future plans",
    "life goals",
    "career goals"
  ],
  favorites: [
    "what is your favorite color",
    "whats your favorite food",
    "favorite things",
    "what food do you like",
    "what colors do you like",
    "preferred color",
    "preferred food"
  ],
  hobbies: [
    "what do you do in your free time",
    "what are your hobbies",
    "whats your hobby",
    "what do you like doing",
    "free time activities",
    "leisure activities",
    "what do you enjoy",
    "your interests"
  ]
};

export const answers: Record<Topic, string> = {
  introduction: "I'm Kan, a passionate software developer with a love for creating innovative solutions. I specialize in web development and enjoy tackling complex technical challenges.",
  location: "I'm from Vietnam, specifically from Ho Chi Minh. I moved abroad to pursue my studies and career in technology.",
  occupation: "I'm a software developer specializing in full-stack web development and AI. I love creating user-friendly applications and solving complex problems.",
  age: "I'm 22 years old, born in 2003. I started my coding journey when I was 18.",
  goals: "My life's goal is to create technology that makes a positive impact on people's lives. I aim to build innovative solutions that solve real-world problems and contribute to the tech community.",
  favorites: "I love the color blue as it reminds me of the ocean and sky. As for food, I'm a big fan of Thai cuisine, especially Pad Thai and Tom Yum soup",
  hobbies: "In my free time, I enjoy coding personal projects, contributing to open-source, and learning new technologies. I also love playing basketball and reading tech blogs to stay updated with the latest trends."
};

export const questionToTopic: Record<string, Topic> = {
  "Who are you?": "introduction",
  "Where are you from?": "location",
  "What do you do?": "occupation",
  "How old are you?": "age",
  "What is your life's goals?": "goals",
  "What's your favorite color?": "favorites",
  "What's your favorite food?": "favorites",
  "What do you do in your free time": "hobbies",
  "What's your hobby?": "hobbies"
};

export const defaultQuestions = [
  "Who are you?",
  "Where are you from?",
  "What do you do?",
  "How old are you?",
  "What is your life's goals?",
  "What's your favorite color?",
  "What's your favorite food?",
  "What do you do in your free time",
  "What's your hobby?"
];