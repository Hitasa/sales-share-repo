import { Company } from './types';
import { mockCompanies, userRepositories } from './mockData';

export const fetchUserCompanyRepository = async (userId: string): Promise<Company[]> => {
  if (!userId) return [];
  const userCompanyIds = userRepositories[userId] || [];
  const userCompanies = mockCompanies.filter(company => userCompanyIds.includes(company.id));
  return Promise.resolve(userCompanies);
};

export const addToUserRepository = async (companyId: number, userId: string): Promise<Company> => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!userRepositories[userId]) {
    userRepositories[userId] = [];
  }
  
  const company = mockCompanies.find(c => c.id === companyId);
  if (!company) {
    throw new Error("Company not found");
  }
  
  if (userRepositories[userId].includes(companyId)) {
    throw new Error(`${company.name} is already in your repository`);
  }
  
  userRepositories[userId].push(companyId);
  
  return Promise.resolve(company);
};