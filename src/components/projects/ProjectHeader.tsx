import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

interface ProjectHeaderProps {
  name: string;
  description?: string;
  isEditing: boolean;
  onBack: () => void;
  onEdit: () => void;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
}

export const ProjectHeader = ({
  name,
  description,
  isEditing,
  onBack,
  onEdit,
  onNameChange,
  onDescriptionChange,
}: ProjectHeaderProps) => {
  return (
    <>
      <div className="mb-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Button>
      </div>
      
      <CardHeader className="space-y-1">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl">
              {isEditing ? (
                <Input
                  value={name}
                  onChange={(e) => onNameChange(e.target.value)}
                  className="text-2xl font-bold"
                />
              ) : (
                name
              )}
            </CardTitle>
          </div>
          <Button onClick={onEdit}>
            {isEditing ? "Cancel" : "Edit Project"}
          </Button>
        </div>
      </CardHeader>

      {(description || isEditing) && (
        <div className="px-6">
          <Input
            value={description || ""}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Add a description..."
            disabled={!isEditing}
          />
        </div>
      )}
    </>
  );
};