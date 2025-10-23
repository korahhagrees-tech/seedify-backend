import * as fs from 'fs';
import * as path from 'path';

export interface ProjectData {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  area: string;
  description: string;
  benefits: string[];
  moreDetails: string;
  backgroundImage: string;
  readMoreLink?: string; // External link to learn more about the project
  climate?: string;
  nativeFlora?: string;
  creditType?: string;
  technologyIntegration?: string;
  communityInnovation?: string;
}

export class ProjectsService {
  private static instance: ProjectsService;
  private projects: Map<string, ProjectData> = new Map();
  private codeToIdMap: Map<string, string> = new Map();

  private constructor() {
    this.loadProjects();
    this.buildCodeMapping();
  }

  static getInstance(): ProjectsService {
    if (!ProjectsService.instance) {
      ProjectsService.instance = new ProjectsService();
    }
    return ProjectsService.instance;
  }

  private loadProjects(): void {
    try {
      const projectsPath = path.join(__dirname, '../constants/projects.json');
      const fileContents = fs.readFileSync(projectsPath, 'utf-8');
      const data = JSON.parse(fileContents);
      
      if (data.projects && Array.isArray(data.projects)) {
        data.projects.forEach((project: ProjectData) => {
          this.projects.set(project.id, project);
        });
      }
    } catch (error) {
      console.error('Error loading projects.json:', error);
    }
  }

  private buildCodeMapping(): void {
    // Map beneficiary codes to project IDs based on the order in projects.json
    // The beneficiaries are: 01-GRG, 02-ELG, 03-JAG, 04-BUE, 05-WAL, 06-PIM, 07-HAR, 08-STE
    this.codeToIdMap.set('01-GRG', '1'); // Grgich Hills Estate
    this.codeToIdMap.set('02-ELG', '2'); // El Globo Habitat Bank
    this.codeToIdMap.set('03-JAG', '3'); // Jaguar Stewardship
    this.codeToIdMap.set('04-BUE', '4'); // Buena Vista Heights
    this.codeToIdMap.set('05-WAL', '5'); // Walkers Reserve
    this.codeToIdMap.set('06-PIM', '6'); // Pimlico Farm
    this.codeToIdMap.set('07-HAR', '7'); // Harvey Manning Park
    this.codeToIdMap.set('08-STE', '8'); // St. Elmo Preservation
  }

  /**
   * Get project data by beneficiary code (e.g., "01-GRG")
   */
  getProjectByCode(beneficiaryCode: string): ProjectData | null {
    const projectId = this.codeToIdMap.get(beneficiaryCode);
    if (!projectId) {
      return null;
    }
    return this.projects.get(projectId) || null;
  }

  /**
   * Get project data by project ID
   */
  getProjectById(id: string): ProjectData | null {
    return this.projects.get(id) || null;
  }

  /**
   * Get all projects
   */
  getAllProjects(): ProjectData[] {
    return Array.from(this.projects.values());
  }
}

// Export singleton instance
export const projectsService = ProjectsService.getInstance();

