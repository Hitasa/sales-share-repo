import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddCompanyFormProps {
  onSubmit: (company: {
    name: string;
    industry: string;
    salesVolume: string;
    growth: string;
  }) => void;
}

const AddCompanyForm = ({ onSubmit }: AddCompanyFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    salesVolume: "",
    growth: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: "",
      industry: "",
      salesVolume: "",
      growth: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Company Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="industry">Industry</Label>
        <Input
          id="industry"
          value={formData.industry}
          onChange={(e) =>
            setFormData({ ...formData, industry: e.target.value })
          }
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="salesVolume">Sales Volume</Label>
        <Input
          id="salesVolume"
          value={formData.salesVolume}
          onChange={(e) =>
            setFormData({ ...formData, salesVolume: e.target.value })
          }
          placeholder="e.g. $1.2M"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="growth">Growth</Label>
        <Input
          id="growth"
          value={formData.growth}
          onChange={(e) =>
            setFormData({ ...formData, growth: e.target.value })
          }
          placeholder="e.g. +15%"
          required
        />
      </div>
      <Button type="submit" className="w-full">
        Add Company
      </Button>
    </form>
  );
};

export default AddCompanyForm;