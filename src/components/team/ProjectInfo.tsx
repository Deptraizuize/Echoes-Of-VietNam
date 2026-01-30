import { ProjectInfo as ProjectInfoType } from "@/data/teamData";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Github, Globe } from "lucide-react";

interface ProjectInfoProps {
  project: ProjectInfoType;
}

const ProjectInfoSection = ({ project }: ProjectInfoProps) => {
  return (
    <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-8">
      <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
        {project.name}
      </h2>
      
      <p className="text-muted-foreground mb-6 leading-relaxed">
        {project.description}
      </p>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Công nghệ sử dụng
        </h3>
        <div className="flex flex-wrap gap-2">
          {project.technologies.map((tech) => (
            <Badge
              key={tech}
              variant="secondary"
              className="bg-accent/10 text-accent hover:bg-accent/20"
            >
              {tech}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <span className="font-medium">Phiên bản:</span>
        <Badge variant="outline">{project.version}</Badge>
      </div>

      <div className="flex flex-wrap gap-4">
        {project.repository && (
          <a
            href={project.repository}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>Repository</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
        {project.website && (
          <a
            href={project.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span>Website</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
};

export default ProjectInfoSection;
