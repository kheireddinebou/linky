export {};

declare global {
  interface User {
    id: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    avatar?: string;
    provider: string;
    created_at: string;
  }

  interface URLItem {
    id: number;
    user_id: number;
    original_url: string;
    short_code: string;
    clicks: number;
    title?: string;
    created_at: string;
    updated_at: string;
  }
}
