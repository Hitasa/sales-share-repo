import { Company } from './types';

// Initialize mock companies with some example data
export let mockCompanies: Company[] = [
  {
    id: 1,
    name: "Example Corp",
    industry: "Technology",
    salesVolume: "$10M",
    growth: "+20%",
    createdBy: "system",
    sharedWith: [],
    reviews: [
      {
        id: 1,
        rating: 4,
        comment: "Great company to work with",
        date: "2024-03-15"
      }
    ],
    offers: [],
    invitations: [],
    link: "https://example.com"
  }
];

// Initialize user repositories mapping
export let userRepositories: Record<string, number[]> = {
  "user1": [1], // Example user with the example company in their repository
};

// Helper function to reset mock data to initial state
export const resetMockData = () => {
  mockCompanies = [...mockCompanies];
  userRepositories = { ...userRepositories };
};