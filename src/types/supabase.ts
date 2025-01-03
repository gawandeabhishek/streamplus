export type Database = {
  public: {
    Tables: {
      messages: {
        Row: {
          id: string;
          content: string;
          chat_id: string;
          sender_id: string;
          created_at: string;
          sender: {
            id: string;
            name: string | null;
            image: string | null;
          };
        };
      };
    };
  };
}; 