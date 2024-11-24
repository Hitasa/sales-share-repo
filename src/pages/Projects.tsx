import { useState } from "react";
import { useProjectsData } from "@/hooks/useProjectsData";
import { ProjectList } from "@/components/projects/ProjectList";
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog";
import { ProjectProfile } from "@/components/projects/ProjectProfile";

const Projects = () => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  
  const {
    projects,
    teams,
    isLoadingProjects,
    projectCompanies,
    availableCompanies,
    isLoadingCompanies,
    createProject,
    deleteProject,
    addCompanyToProject,
    removeCompanyFromProject,
  } = useProjectsData();

  if (isLoadingProjects) {
    return <div>Loading...</div>;
  }

  const selectedProjectData = projects?.find(p => p.id === selectedProject);

  return (
    <div className="container mx-auto py-8 animate-fadeIn">
      {selectedProject && selectedProjectData ? (
        <ProjectProfile
          project={selectedProjectData}
          companies={projectCompanies}
          availableCompanies={availableCompanies}
          isLoadingCompanies={isLoadingCompanies}
          onBack={() => setSelectedProject(null)}
          onAddCompany={addCompanyToProject}
          onRemoveCompany={removeCompanyFromProject}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Projects</h1>
            <CreateProjectDialog 
              onSubmit={createProject}
              teams={teams || []}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <ProjectList
              projects={projects || []}
              selectedProject={selectedProject}
              onProjectSelect={setSelectedProject}
              onProjectDelete={deleteProject}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Projects;