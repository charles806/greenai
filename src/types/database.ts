export interface Profile {
  id: string;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewProfile {
  id: string;
  email?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateProfile {
  email?: string | null;
  updated_at?: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: NewProfile;
        Update: UpdateProfile;
      };
    };
  };
}
