export interface Artist {
  id: string;
  name: string;
  genre: string[];
  bio: string;
  image: string;
  rating: number;
  verified: boolean;
  followers: number;
  socials: {
    spotify?: string;
    instagram?: string;
    soundcloud?: string;
  };
  samples: Sample[];
  availability: DateRange[];
}

export interface Sample {
  id: string;
  title: string;
  url: string;
  duration: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface Booking {
  id: string;
  artistId: string;
  eventName: string;
  eventDate: Date;
  eventLocation: string;
  duration: number;
  budget: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  bookedBy: string;
  notes: string;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderImage: string;
  recipientId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  image: string;
  type: "artist" | "booking_agent" | "fan";
  bio?: string;
  verified: boolean;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  participants: User[];
  messages: ChatMessage[];
  lastMessage: ChatMessage;
  updatedAt: Date;
}
