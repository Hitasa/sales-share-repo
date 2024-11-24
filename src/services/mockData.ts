import { Company } from "./types";

export const mockCompanies: Company[] = [
  {
    id: "1",
    name: "Tech Corp",
    industry: "Technology",
    salesVolume: "$1M",
    growth: "10%",
    createdBy: "user1",
    sharedWith: [],
    reviews: [],
    comments: [],
    website: "https://techcorp.com",
    phoneNumber: "123-456-7890",
    email: "contact@techcorp.com",
  },
  {
    id: "2",
    name: "Green Energy Co",
    industry: "Energy",
    salesVolume: "$2M",
    growth: "15%",
    createdBy: "user1",
    sharedWith: [],
    reviews: [],
    comments: [],
    website: "https://greenenergy.com",
    phoneNumber: "123-456-7891",
    email: "contact@greenenergy.com",
  },
];

export const userRepositories: { [key: string]: string[] } = {
  'user1': ['1', '2']
};