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
  thumbnailUrl: string;
}
