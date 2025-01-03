import "next-auth";
import { SubscriptionStatus } from "@prisma/client";

declare module "next-auth" {
  interface User {
    subscriptionStatus: SubscriptionStatus;
  }
  
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      subscriptionStatus: SubscriptionStatus;
      accessToken?: string;
    }
  }
} 