import { createClient } from '@supabase/supabase-js';

// 이 값들은 Supabase 프로젝트 설정에서 가져와 .env.local 파일에 설정해야 합니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 추후 사용될 데이터베이스 타입 정의
export type Policy = {
  id: string;
  type: 'scholarship' | 'policy';
  title: string;
  description: string;
  min_gpa: number;
  max_income_quintile: number;
  allowed_majors: string[];
  allowed_regions: string[];
  apply_url: string;
  deadline: string;
};

export type Announcement = {
  id: string;
  title: string;
  content_snippet: string;
  posted_date: string;
  source_url: string;
};
