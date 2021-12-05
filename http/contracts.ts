export type User = {
  id: string;
  name: string;
  avatar: string;
  email: string;
};

export interface HomePageCategoryQuestions {
  homePageCategory: string;
  questions: Question[];
}

export interface Question {
  questionId: string;
  caption: string;
  postedBy: string;
  Thumbnail: string;
  hashtags: string;
  categories: string;
  taggedUsers: string;
  audio: string;
  location: string;
  isPublished: boolean;
  questionStatus: string;
}

export interface ApiResponse {
  success: boolean;
  error: string;
}

export interface Discussion {
  discussion_id: string;
  question: string;
  answer: string;
  discussion_status: string;
  meeting_info: string;
  answered_by: string;
export interface Answer {
  answerId: string;
  question: string;
  audio: string;
  answeredBy: string;
}
