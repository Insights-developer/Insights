// /frontend/utils/types.ts

export type UserProfile = {
  id: string;
  email: string;
  role: string;
  created_at: string;
};

export type AccessGroup = {
  id: number;
  name: string;
  description: string | null;
};

export type UserAccessGroup = {
  user_id: string;
  group_id: number;
};

export type Database = {
  public: {
    Tables: {
      users: {
        Row: UserProfile;
        Insert: {
          email: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          email?: string;
          role?: string;
          created_at?: string;
        };
      };
      access_groups: {
        Row: AccessGroup;
        Insert: {
          name: string;
          description?: string | null;
        };
        Update: {
          name?: string;
          description?: string | null;
        };
      };
      user_access_groups: {
        Row: UserAccessGroup;
        Insert: {
          user_id: string;
          group_id: number;
        };
        Update: {
          user_id?: string;
          group_id?: number;
        };
      };
      // Add more tables here as needed
    };
  };
};
