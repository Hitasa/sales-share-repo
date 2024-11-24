import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

interface Project {
  id: string;
  name: string;
}

interface ProjectListProps {
  projects: Project[];
  selectedProject: string | null;
  onProjectSelect: (projectId: string) => void;
  onProjectDelete: (projectId: string) => void;
}

export const ProjectList = ({ 
  projects, 
  selectedProject, 
  onProjectSelect, 
  onProjectDelete 
}: ProjectListProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Project List</h2>
      {projects?.map((project) => (
        <Card
          key={project.id}
          className={`p-4 cursor-pointer hover:bg-accent transition-colors ${
            selectedProject === project.id ? "bg-accent" : ""
          }`}
          onClick={() => onProjectSelect(project.id)}
        >
          <div className="flex justify-between items-center">
            <span>{project.name}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onProjectDelete(project.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};