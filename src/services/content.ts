// Enhanced content store with local storage fallback and API integration
import { api } from "./api";

export type Profile = {
  name: string;
  title: string;
  bio: string;
  avatarDataUrl?: string;
  aboutSubtitle?: string;
  aboutDescription1?: string;
  aboutDescription2?: string;
  aboutDescription3?: string;
  coreExpertise?: { name: string, percentage: number }[];
  skillCategories?: { category: string, technologies: string[] }[];
  location?: string;
  email?: string;
  phone?: string;
};

export type Tag = {
  id: number;
  name: string;
  slug: string;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
};

export type Project = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  thumbnailUrl?: string;
  featuredImageUrl?: string;
  status?: string;
  categoryId?: number;
  category?: Category;
  categories?: Category[];
  tags?: Tag[];
  githubUrl?: string;
  demoUrl?: string;
  link?: string;
  liveDemoUrl?: string;
  images?: ProjectImage[];
  videos?: ProjectVideo[];
  technologies?: string[];
  metadata?: Record<string, any>;
};

export type ProjectImage = {
  id?: string;
  url: string;
  caption?: string;
  sortOrder?: number;
};

export type ProjectVideo = {
  id?: string;
  url: string;
  caption?: string;
  sortOrder?: number;
};

export type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  featuredImageUrl?: string;
  status?: string;
  categories?: Category[];
  tags?: Tag[];
  images?: ArticleImage[];
  videos?: ArticleVideo[];
  publishedAt?: string;
};

export type ArticleImage = {
  id?: string;
  url: string;
  caption?: string;
  altText?: string;
  sortOrder?: number;
};

export type ArticleVideo = {
  id?: string;
  url: string;
  caption?: string;
  sortOrder?: number;
};

export type Experience = {
  id: number;
  company: string;
  // ExperiencesEditor shape
  title?: string;
  location?: string;
  startDate?: string;
  endDate?: string | null;
  current?: boolean;
  responsibilities?: string[];
  technologies?: string[];
  companyUrl?: string;
  logoUrl?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
  // Legacy compat
  role?: string;
  period?: string;
  description?: string;
};

// Helper functions for local storage
const get = <T>(key: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};

const set = <T>(key: string, value: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { }
};

// Profile management
const getProfile = async (): Promise<Profile> => {
  try {
    const response = await api.get("/settings?keys=profile.name,profile.title,profile.bio,profile.avatarUrl,about.subtitle,about.desc1,about.desc2,about.desc3,about.expertise,about.skills,about.location,about.email,about.phone");
    const data = response.data?.data || {};
    return {
      name: data["profile.name"] || "",
      title: data["profile.title"] || "",
      bio: data["profile.bio"] || "",
      avatarDataUrl: data["profile.avatarUrl"] || "",
      aboutSubtitle: data["about.subtitle"] || "",
      aboutDescription1: data["about.desc1"] || "",
      aboutDescription2: data["about.desc2"] || "",
      aboutDescription3: data["about.desc3"] || "",
      coreExpertise: data["about.expertise"] ? JSON.parse(data["about.expertise"]) : [
        { name: 'Backend Development', percentage: 95 },
        { name: 'Golang', percentage: 90 },
        { name: 'Database Design', percentage: 85 },
        { name: 'System Architecture', percentage: 80 }
      ],
      skillCategories: data["about.skills"] ? JSON.parse(data["about.skills"]) : [
        { category: "Backend", technologies: ["Go", "Node.js", "Python", "Java", "C++"] },
        { category: "Database", technologies: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "ElasticSearch"] },
        { category: "DevOps", technologies: ["Docker", "Kubernetes", "AWS", "Jenkins", "Terraform"] },
        { category: "Architecture", technologies: ["Microservices", "REST API", "gRPC", "GraphQL", "Event Sourcing"] },
      ],
      location: data["about.location"] || "",
      email: data["about.email"] || "",
      phone: data["about.phone"] || ""
    };
  } catch (error) {
    console.error("Failed to fetch profile settings", error);
    return { name: "", title: "", bio: "", avatarDataUrl: "" };
  }
};

const saveProfile = async (v: Profile): Promise<void> => {
  try {
    const payload = {
      "profile.name": v.name,
      "profile.title": v.title,
      "profile.bio": v.bio,
      "profile.avatarUrl": v.avatarDataUrl || "",
      "about.subtitle": v.aboutSubtitle || "",
      "about.desc1": v.aboutDescription1 || "",
      "about.desc2": v.aboutDescription2 || "",
      "about.desc3": v.aboutDescription3 || "",
      "about.expertise": JSON.stringify(v.coreExpertise || []),
      "about.skills": JSON.stringify(v.skillCategories || []),
      "about.location": v.location || "",
      "about.email": v.email || "",
      "about.phone": v.phone || ""
    };
    await api.put("/settings", payload);
  } catch (error) {
    console.error("Failed to save profile settings", error);
    throw error;
  }
};

// Projects - API only
const getProjects = async (): Promise<Project[]> => {
  try {
    const response = await api.get("/projects");
    console.log("Projects API response:", response);

    const responseData = response.data?.data;
    const projects = Array.isArray(responseData?.data) ? responseData.data : Array.isArray(responseData) ? responseData : [];

    return projects.map((project: any) => ({
      id: project.id || "",
      title: project.title || "",
      slug: project.slug || "",
      description: project.description || "",
      content: project.content || "",
      thumbnailUrl: project.thumbnailURL || project.thumbnail_url || "",
      featuredImageUrl: project.featuredImageURL || project.featured_image_url || "",
      status: project.status || "draft",
      categoryId: project.categoryID || project.category_id,
      categories: project.categories || [],
      tags: project.tags || [],
      githubUrl: project.githubURL || project.github_url || "",
      liveDemoUrl: project.liveDemoURL || project.live_demo_url || "",
      technologies: project.technologies || [],
      images: project.images || [],
      videos: project.videos || [],
    }));
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return [];
  }
};

const saveProjects = async (projects: Project[]) => {
  console.log("Starting saveProjects process");

  const token = localStorage.getItem("cms_token");
  console.log(`Token available for saving projects: ${!!token}, length: ${token?.length || 0}`);

  if (!token) {
    console.error("Cannot save projects to API: No authentication token found.");
    throw new Error("Authentication required. Please login again to save projects to the server.");
  }

  if (token) {
    const tokenPrefix = token.substring(0, 10);
    const tokenSuffix = token.substring(token.length - 10);
    console.log(`Using token: ${tokenPrefix}...${tokenSuffix} (length: ${token.length})`);

    let cleanToken = token;
    let tokenWasCleaned = false;

    if (token.startsWith('"') || token.endsWith('"')) {
      console.warn("WARNING: Token has extra quotes that might cause authentication issues");
      cleanToken = token.replace(/^"|"$/g, "");
      tokenWasCleaned = true;
    }

    if (token.includes("\\")) {
      console.warn("WARNING: Token has escape characters");
      cleanToken = cleanToken.replace(/\\/g, "");
      tokenWasCleaned = true;
    }

    if (tokenWasCleaned) {
      console.log(`Cleaning token and updating in localStorage. New token length: ${cleanToken.length}`);
      localStorage.setItem("cms_token", cleanToken);
    }
  }

  const cleanedProjects = projects.map((project) => {
    const cleanProject = { ...project };

    if (!cleanProject.title) cleanProject.title = "Untitled Project";
    if (!cleanProject.slug) {
      cleanProject.slug = cleanProject.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
    }

    if (!Array.isArray(cleanProject.technologies)) cleanProject.technologies = [];
    if (!Array.isArray(cleanProject.tags)) cleanProject.tags = [];
    if (!Array.isArray(cleanProject.categories)) cleanProject.categories = [];
    if (!Array.isArray(cleanProject.images)) cleanProject.images = [];
    if (!Array.isArray(cleanProject.videos)) cleanProject.videos = [];

    return cleanProject;
  });

  const updatedProjects: Project[] = [];
  for (const project of cleanedProjects) {
    try {
      let response;
      // Only PUT if id exists AND is NOT a temp id
      const isExisting = project.id && typeof project.id === "string"
        && project.id.length > 0
        && !project.id.startsWith("temp-");

      if (isExisting) {
        try {
          response = await api.put(`/projects/${project.id}`, project);
        } catch (error: any) {
          const errData = JSON.stringify(error.response?.data || "");
          if (error.response?.status === 404 || errData.toLowerCase().includes("not found")) {
            // It's a "new" UUID generated on the frontend — create it instead
            response = await api.post("/projects", project);
          } else {
            throw error;
          }
        }
      } else {
        response = await api.post("/projects", project);
      }
      updatedProjects.push(response.data?.data || response.data);
    } catch (err: any) {
      console.error(`Failed to save project ${project.title}:`, err);
      throw err;
    }
  }
  set("cms_projects", updatedProjects);
  return updatedProjects;
};

// Articles - API only
const getArticles = async (): Promise<Article[]> => {
  try {
    const response = await api.get("/articles");
    console.log("Articles API response:", response);
    const responseData = response.data?.data;
    const articles = Array.isArray(responseData?.data) ? responseData.data : Array.isArray(responseData) ? responseData : [];
    return articles.map((article: any) => ({
      id: article.id || "",
      title: article.title || "",
      slug: article.slug || "",
      excerpt: article.excerpt || "",
      content: article.content || "",
      featuredImageUrl: article.featuredImageURL || article.featured_image_url || "",
      status: article.status || "draft",
      categories: article.categories || [],
      tags: article.tags || [],
      images: article.images || [],
      videos: article.videos || [],
      publishedAt: article.publishedAt || article.published_at,
    }));
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    return [];
  }
};

const saveArticles = async (articles: Article[]) => {
  set("cms_articles", articles);
  const token = localStorage.getItem("cms_token");
  console.log("Token available for saving articles:", !!token);
  if (!token) {
    console.error("Cannot save articles to API: No authentication token found. Please login again.");
    throw new Error("Authentication required. Please login again to save articles to the server.");
  }
  const updatedArticles = [...articles];
  for (const article of articles) {
    try {
      const cleanedArticle = {
        title: article.title || "",
        slug: article.slug || "",
        excerpt: article.excerpt || "",
        content: article.content || "",
        featuredImageUrl: article.featuredImageUrl || "",
        status: article.status || "draft",
        categoryIdStrs: Array.isArray(article.categories)
          ? article.categories.map((c) => {
            if (typeof c === "object") {
              return c.id > 0 ? String(c.id) : String(c.name);
            }
            return String(c);
          })
          : [],
        tagIdStrs: Array.isArray(article.tags)
          ? article.tags.map((t) => {
            if (typeof t === "object") {
              return t.id > 0 ? String(t.id) : String(t.name);
            }
            return String(t);
          })
          : [],
        metadata: {
          originalId: article.id,
          featuredImageUrl: article.featuredImageUrl || "",
          publishedAt: article.publishedAt || "",
          categories: Array.isArray(article.categories)
            ? article.categories.map((c) => ({
              id: typeof c === "object" ? c.id : c,
              name: typeof c === "object" ? c.name : String(c),
              slug: typeof c === "object" ? c.slug : String(c).toLowerCase().replace(/\s+/g, "-"),
            }))
            : [],
          tags: Array.isArray(article.tags)
            ? article.tags.map((t) => ({
              id: typeof t === "object" ? t.id : t,
              name: typeof t === "object" ? t.name : String(t),
              slug: typeof t === "object" ? t.slug : String(t).toLowerCase().replace(/\s+/g, "-"),
            }))
            : [],
          images: Array.isArray(article.images)
            ? article.images.map((img) => ({
              id: img.id || "",
              url: img.url || "",
              caption: img.caption || "",
              altText: img.altText || "",
              sortOrder: img.sortOrder || 0,
            }))
            : [],
          videos: Array.isArray(article.videos)
            ? article.videos.map((vid) => ({
              id: vid.id || "",
              url: vid.url || "",
              caption: vid.caption || "",
              sortOrder: vid.sortOrder || 0,
            }))
            : [],
          lastUpdated: new Date().toISOString(),
          version: "1.0",
        },
      };
      // Only PUT for existing articles with a real UUID (not empty, not temp-)
      const isExistingArticle = article.id
        && article.id.length > 10
        && !article.id.startsWith("temp-");

      let responseData;
      if (isExistingArticle) {
        try {
          const response = await api.put(`/articles/${article.id}`, cleanedArticle);
          responseData = response.data?.data || response.data;
        } catch (error: any) {
          const errData = JSON.stringify(error.response?.data || "");
          if (error.response?.status === 404 || errData.toLowerCase().includes("not found")) {
            // It's a "new" UUID generated on the frontend — create it instead
            const createResponse = await api.post("/articles", cleanedArticle);
            responseData = createResponse.data?.data || createResponse.data;
          } else {
            throw error;
          }
        }
      } else {
        const response = await api.post("/articles", cleanedArticle);
        responseData = response.data?.data || response.data;
      }

      if (responseData) {
        const index = updatedArticles.findIndex((a) => a.id === article.id);
        if (index !== -1) updatedArticles[index] = responseData;
      }
    } catch (err: any) {
      throw err;
    }
  }
  set("cms_articles", updatedArticles);
  return updatedArticles;
};

// Categories - API only
const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get("/categories");
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
};

// Tags - API only
const getTags = async (): Promise<Tag[]> => {
  try {
    const response = await api.get("/tags");
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Failed to fetch tags:", error);
    return [];
  }
};

// Experiences - API only
const getExperiences = async (): Promise<Experience[]> => {
  try {
    const response = await api.get("/experiences");
    console.log("Experiences API response:", response);

    const responseData = response.data?.data;
    const experiences = Array.isArray(responseData?.data) ? responseData.data : Array.isArray(responseData) ? responseData : [];

    return experiences.map((exp: any) => ({
      id: exp.id || exp.ID || 0,
      title: exp.title || exp.role || "",
      company: exp.company || "",
      location: exp.location || "",
      startDate: exp.startDate || exp.start_date || "",
      endDate: exp.endDate || exp.end_date || null,
      current: exp.current || false,
      description: exp.description || "",
      responsibilities: Array.isArray(exp.responsibilities) ? exp.responsibilities : [],
      technologies: Array.isArray(exp.technologies) ? exp.technologies : [],
      companyUrl: exp.companyUrl || exp.company_url || "",
      logoUrl: exp.logoUrl || exp.logo_url || "",
      metadata: exp.metadata || {},
      createdAt: exp.createdAt || exp.created_at || new Date().toISOString(),
      updatedAt: exp.updatedAt || exp.updated_at || new Date().toISOString(),
      // Legacy compat
      role: exp.title || exp.role || "",
      period: exp.period || `${exp.startDate || ""} - ${exp.endDate || (exp.current ? "Present" : "")}`,
    }));
  } catch (error) {
    console.error("Failed to fetch experiences:", error);
    return [];
  }
};

const saveExperiences = async (experiences: any[]): Promise<any[]> => {
  const token = localStorage.getItem("cms_token");
  if (!token) {
    throw new Error("Authentication required. Please login again.");
  }

  const updatedExperiences = [...experiences];

  for (const experience of experiences) {
    try {
      // Support both ExperiencesEditor shape (title, location, startDate, current...)
      // and legacy shape (role, period, ...)
      // Resolve technology IDs where possible (avoids re-creating tags)
      const techIds: number[] = Array.isArray(experience.technologies)
        ? experience.technologies
          .map((t: any) => (typeof t === "object" && t?.id > 0 ? Number(t.id) : 0))
          .filter((id: number) => id > 0)
        : [];

      const techNames: string[] = Array.isArray(experience.technologies)
        ? experience.technologies
          .map((t: any) => (typeof t === "string" ? t : t?.name || ""))
          .filter(Boolean)
        : [];

      // Ensure startDate is always a valid YYYY-MM-DD string
      const rawStartDate = experience.startDate || experience.period?.split(" - ")[0] || "";
      const startDate = rawStartDate.length >= 10
        ? rawStartDate.substring(0, 10)   // trim time part if any
        : rawStartDate;

      const rawEndDate = experience.current
        ? ""
        : (experience.endDate || (
          experience.period && experience.period.split(" - ")[1] !== "Present"
            ? experience.period.split(" - ")[1]
            : ""
        ) || "");
      const endDate = rawEndDate.length >= 10 ? rawEndDate.substring(0, 10) : rawEndDate;

      const cleanExperience = {
        title: experience.title || experience.role || "",
        company: experience.company || "",
        location: experience.location || "",
        description: experience.description || "",
        startDate,
        endDate,
        current: experience.current ?? (experience.period?.includes("Present") || false),
        responsibilities: Array.isArray(experience.responsibilities)
          ? experience.responsibilities.filter(Boolean)
          : [],
        // Prefer IDs (more reliable), fall back to names
        technologyIds: techIds.length > 0 ? techIds : [],
        technologyNames: techIds.length === 0 ? techNames : [],
        companyUrl: experience.companyUrl || "",
        logoUrl: experience.logoUrl || "",
        metadata: experience.metadata || {},
      };

      let responseData;
      if (experience.id && experience.id > 0) {
        try {
          const response = await api.put(`/experiences/${experience.id}`, cleanExperience);
          responseData = response.data?.data || response.data;
        } catch (error: any) {
          const errData = JSON.stringify(error.response?.data || "");
          if (error.response?.status === 404 || errData.toLowerCase().includes("not found")) {
            const response = await api.post("/experiences", cleanExperience);
            responseData = response.data?.data || response.data;
          } else {
            throw error;
          }
        }
      } else {
        const response = await api.post("/experiences", cleanExperience);
        responseData = response.data?.data || response.data;
      }

      if (responseData) {
        const index = updatedExperiences.findIndex((e) => e.id === experience.id);
        if (index !== -1) {
          updatedExperiences[index] = responseData;
        }
      }
    } catch (err: any) {
      console.error(`Failed to save experience ${experience.company}:`, err);
      throw err;
    }
  }

  return updatedExperiences;
};

// Categories CRUD
const createCategory = async (categoryData: Partial<Category>): Promise<Category> => {
  try {
    const response = await api.post("/categories", categoryData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error("Failed to create category:", error);
    throw error;
  }
};

const updateCategory = async (id: number, categoryData: Partial<Category>): Promise<Category> => {
  try {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Failed to update category ${id}:`, error);
    throw error;
  }
};

const deleteCategory = async (id: number): Promise<void> => {
  try {
    await api.delete(`/categories/${id}`);
  } catch (error) {
    console.error(`Failed to delete category ${id}:`, error);
    throw error;
  }
};

// Tags CRUD
const createTag = async (tagData: Partial<Tag>): Promise<Tag> => {
  try {
    const response = await api.post("/tags", tagData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error("Failed to create tag:", error);
    throw error;
  }
};

const updateTag = async (id: number, tagData: Partial<Tag>): Promise<Tag> => {
  try {
    const response = await api.put(`/tags/${id}`, tagData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Failed to update tag ${id}:`, error);
    throw error;
  }
};

const deleteTag = async (id: number): Promise<void> => {
  try {
    await api.delete(`/tags/${id}`);
  } catch (error) {
    console.error(`Failed to delete tag ${id}:`, error);
    throw error;
  }
};

export const deleteProject = async (id: string): Promise<void> => {
  if (id && !id.startsWith("temp-")) {
    try {
      await api.delete(`/projects/${id}`);
    } catch (error) {
      console.error(`Failed to delete project ${id}:`, error);
      throw error;
    }
  }
};

export const deleteArticle = async (id: string): Promise<void> => {
  if (id && !id.startsWith("temp-")) {
    try {
      await api.delete(`/articles/${id}`);
    } catch (error) {
      console.error(`Failed to delete article ${id}:`, error);
      throw error;
    }
  }
};

export const deleteExperience = async (id: number): Promise<void> => {
  if (id && id > 0) {
    try {
      await api.delete(`/experiences/${id}`);
    } catch (error) {
      console.error(`Failed to delete experience ${id}:`, error);
      throw error;
    }
  }
};

// ContentStore object for backward compatibility
export const ContentStore = {
  getProfile,
  saveProfile,
  getProjects,
  saveProjects,
  deleteProject,
  getArticles,
  saveArticles,
  deleteArticle,
  getExperiences,
  saveExperiences,
  deleteExperience,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getTags,
  createTag,
  updateTag,
  deleteTag,
};

// Also export individual functions for direct imports
export { getProfile, saveProfile, getProjects, saveProjects, getArticles, saveArticles, getExperiences, saveExperiences, getCategories, createCategory, updateCategory, deleteCategory, getTags, createTag, updateTag, deleteTag };
