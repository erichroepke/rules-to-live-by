export interface Rule {
  id: string;
  text: string;
  author: string;
  upvotes: number;
  created_at: string;
  has_voted?: boolean;
}

export interface Vote {
  id: string;
  rule_id: string;
  voter: string;
  created_at: string;
}
