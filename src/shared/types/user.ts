export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  isGuest: boolean;
}

export const dummyUser: User = {
  id: "user_1",
  name: "Lucky Kashyap",
  email: "luckykrkashyap@gmail.com",
  avatarUrl: "/logo.jpg",
  isGuest: false,
};

export const dummyGuestUser: User = {
  id: "guest_1",
  name: "Guest",
  email: "",
  avatarUrl: "",
  isGuest: true,
};
