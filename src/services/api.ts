// Mock API endpoint - replace with your actual API endpoint
const API_URL = 'https://api.example.com';

export interface Company {
  id: number;
  name: string;
  industry: string;
  salesVolume: string;
  growth: string;
  reviews?: Array<{
    id: number;
    rating: number;
    comment: string;
    date: string;
  }>;
}

export const fetchCompanies = async (): Promise<Company[]> => {
  // For demonstration, we'll return mock data
  // Replace this with actual API call: return fetch(`${API_URL}/companies`).then(res => res.json())
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          name: "Acme Corp",
          industry: "Technology",
          salesVolume: "$1.2M",
          growth: "+15%",
          reviews: [
            {
              id: 1,
              rating: 4,
              comment: "Great company to work with!",
              date: "2024-02-20",
            },
          ],
        },
        {
          id: 2,
          name: "Beta Industries",
          industry: "Manufacturing",
          salesVolume: "$850K",
          growth: "+8%",
          reviews: [],
        },
        {
          id: 3,
          name: "Gamma Solutions",
          industry: "Services",
          salesVolume: "$2.1M",
          growth: "+22%",
          reviews: [],
        },
      ]);
    }, 1000); // Simulate network delay
  });
};

export const addCompany = async (company: Omit<Company, "id">): Promise<Company> => {
  // Replace with actual API call: return fetch(`${API_URL}/companies`, { method: 'POST', body: JSON.stringify(company) })
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ...company,
        id: Date.now(),
      });
    }, 500);
  });
};

export const addReview = async (companyId: number, review: { rating: number; comment: string }): Promise<Company> => {
  // Replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: companyId,
        name: "Updated Company",
        industry: "Updated Industry",
        salesVolume: "Updated Sales",
        growth: "Updated Growth",
        reviews: [{
          id: Date.now(),
          ...review,
          date: new Date().toISOString().split("T")[0],
        }],
      });
    }, 500);
  });
};