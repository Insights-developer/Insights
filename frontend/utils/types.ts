// /frontend/utils/types.ts

// === User Profile Type ===
export type UserProfile = {
  id: string;
  email: string;
  username: string | null;
  phone: string | null;
  role: string;
  created_at: string;
  current_login_at: string | null;
  previous_login_at: string | null;
  login_count: number;
  groups: AccessGroup[];
};

// === Access Groups ===
export type AccessGroup = {
  id: number;
  name: string;
  description: string | null;
};

// === User to Access Group Linking ===
export type UserAccessGroup = {
  user_id: string;
  group_id: number;
};

// === System Features Table (Global Feature Catalog) ===
export type Feature = {
  id: number;
  key: string;              // e.g., 'manage_users'
  name: string;             // Human-friendly label
  description: string | null;
};

// === Access Group Feature Assignments ===
export type AccessGroupFeature = {
  group_id: number;
  feature: string;           // references Feature.key
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
      features: {
        Row: Feature;
        Insert: {
          key: string;
          name: string;
          description?: string | null;
        };
        Update: {
          key?: string;
          name?: string;
          description?: string | null;
        };
      };
      access_group_features: {
        Row: AccessGroupFeature;
        Insert: {
          group_id: number;
          feature: string;
        };
        Update: {
          group_id?: number;
          feature?: string;
        };
      };
    };
  };
};
