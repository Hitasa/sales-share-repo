import { Company } from "./types";

export const searchCompanies = async (query: string): Promise<Company[]> => {
  // Simulated API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
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
        },
        {
          id: "3",
          name: "Bio Solutions",
          industry: "Healthcare",
          salesVolume: "$3M",
          growth: "20%",
          createdBy: "user1",
          sharedWith: [],
          reviews: [],
          comments: [],
        }
      ]);
    }, 1000);
  });
};