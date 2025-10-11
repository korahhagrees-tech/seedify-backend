"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectsService = exports.ProjectsService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class ProjectsService {
    constructor() {
        this.projects = new Map();
        this.codeToIdMap = new Map();
        this.loadProjects();
        this.buildCodeMapping();
    }
    static getInstance() {
        if (!ProjectsService.instance) {
            ProjectsService.instance = new ProjectsService();
        }
        return ProjectsService.instance;
    }
    loadProjects() {
        try {
            const projectsPath = path.join(__dirname, '../constants/projects.json');
            const fileContents = fs.readFileSync(projectsPath, 'utf-8');
            const data = JSON.parse(fileContents);
            if (data.projects && Array.isArray(data.projects)) {
                data.projects.forEach((project) => {
                    this.projects.set(project.id, project);
                });
            }
        }
        catch (error) {
            console.error('Error loading projects.json:', error);
        }
    }
    buildCodeMapping() {
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
    getProjectByCode(beneficiaryCode) {
        const projectId = this.codeToIdMap.get(beneficiaryCode);
        if (!projectId) {
            return null;
        }
        return this.projects.get(projectId) || null;
    }
    /**
     * Get project data by project ID
     */
    getProjectById(id) {
        return this.projects.get(id) || null;
    }
    /**
     * Get all projects
     */
    getAllProjects() {
        return Array.from(this.projects.values());
    }
}
exports.ProjectsService = ProjectsService;
// Export singleton instance
exports.projectsService = ProjectsService.getInstance();
