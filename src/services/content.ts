// Enhanced content store with local storage fallback and API integration
import { api } from "./api";

export type Profile = {
  name: string;
  title: string;
  bio: string;
  avatarDataUrl?: string;
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
  role: string;
  period: string;
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
  } catch {}
};

// Profile management
const getProfile = (): Profile => get("cms_profile", { name: "", title: "", bio: "", avatarDataUrl: "" });
const saveProfile = (v: Profile) => set("cms_profile", v);

// Projects - API only
const getProjects = async (): Promise<Project[]> => {
  try {
    const response = await api.get("/api/v1/projects");
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
      if (project.id && typeof project.id === "string" && project.id.length > 0) {
        response = await api.put(`/api/v1/projects/${project.id}`, project);
      } else {
        response = await api.post("/api/v1/projects", project);
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
    const response = await api.get("/api/v1/articles");
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
      if (article.id && article.id.length > 10 && !article.id.startsWith("temp-")) {
        try {
          const response = await api.put(`/api/v1/articles/${article.id}`, cleanedArticle);
          const responseData = response.data?.data || response.data;
          if (responseData) {
            const index = updatedArticles.findIndex((a) => a.id === article.id);
            if (index !== -1) {
              updatedArticles[index] = responseData;
            }
          }
        } catch (error: any) {
          const updateError = error as { response?: { status: number; data: any } };
          if (updateError.response && updateError.response.status === 404) {
            const createResponse = await api.post("/api/v1/articles", cleanedArticle);
            const responseData = createResponse.data?.data || createResponse.data;
            if (responseData) {
              const index = updatedArticles.findIndex((a) => a.id === article.id);
              if (index !== -1) {
                updatedArticles[index] = responseData;
              }
            }
          } else {
            throw updateError;
          }
        }
      } else {
        const response = await api.post("/api/v1/articles", cleanedArticle);
        const responseData = response.data?.data || response.data;
        if (responseData) {
          const index = updatedArticles.findIndex((a) => a.id === article.id);
          if (index !== -1) {
            updatedArticles[index] = responseData;
          }
        }
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
    const response = await api.get("/api/v1/categories");
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
};

// Tags - API only
const getTags = async (): Promise<Tag[]> => {
  try {
    const response = await api.get("/api/v1/tags");
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Failed to fetch tags:", error);
    return [];
  }
};

// Experiences - API only
const getExperiences = async (): Promise<Experience[]> => {
  try {
    const response = await api.get("/api/v1/experiences");
    console.log("Experiences API response:", response);

    const responseData = response.data?.data;
    const experiences = Array.isArray(responseData?.data) ? responseData.data : Array.isArray(responseData) ? responseData : [];

    return experiences.map((exp: any) => ({
      id: exp.id || exp.ID || 0,
      company: exp.company || "",
      role: exp.title || exp.role || "",
      period: exp.period || `${exp.startDate || ""} - ${exp.endDate || (exp.current ? "Present" : "")}`,
      description: exp.description || "",
    }));
  } catch (error) {
    console.error("Failed to fetch experiences:", error);
    return [];
  }
};

const saveExperiences = async (experiences: Experience[]): Promise<Experience[]> => {
  const updatedExperiences = [...experiences];

  for (const experience of experiences) {
    try {
      const cleanExperience = {
        title: experience.role || "",
        company: experience.company || "",
        description: experience.description || "",
        startDate: experience.period?.split(" - ")[0] || "",
        endDate: experience.period?.split(" - ")[1] !== "Present" ? experience.period?.split(" - ")[1] : "",
        current: experience.period?.includes("Present") || false,
        metadata: {
          originalId: experience.id,
          role: experience.role || "",
          period: experience.period || "",
          technologies: [],
          projects: [],
          achievements: [],
          lastUpdated: new Date().toISOString(),
          version: "1.0",
        },
      };

      if (experience.id && experience.id > 0) {
        const response = await api.put(`/api/v1/experiences/${experience.id}`, cleanExperience);
        const responseData = response.data?.data || response.data;
        if (responseData) {
          const index = updatedExperiences.findIndex((e) => e.id === experience.id);
          if (index !== -1) {
            updatedExperiences[index] = responseData;
          }
        }
      } else {
        const response = await api.post("/api/v1/experiences", cleanExperience);
        const responseData = response.data?.data || response.data;
        if (responseData) {
          const index = updatedExperiences.findIndex((e) => e.id === experience.id);
          if (index !== -1) {
            updatedExperiences[index] = responseData;
          }
        }
      }
    } catch (err: any) {
      const error = err as { response?: { status: number; data: any } };
      console.error(`Failed to save experience ${experience.company}:`, error);
      throw error;
    }
  }

  return updatedExperiences;
};

// Categories CRUD
const createCategory = async (categoryData: Partial<Category>): Promise<Category> => {
  try {
    const response = await api.post("/api/v1/categories", categoryData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error("Failed to create category:", error);
    throw error;
  }
};

const updateCategory = async (id: number, categoryData: Partial<Category>): Promise<Category> => {
  try {
    const response = await api.put(`/api/v1/categories/${id}`, categoryData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Failed to update category ${id}:`, error);
    throw error;
  }
};

const deleteCategory = async (id: number): Promise<void> => {
  try {
    await api.delete(`/api/v1/categories/${id}`);
  } catch (error) {
    console.error(`Failed to delete category ${id}:`, error);
    throw error;
  }
};

// Tags CRUD
const createTag = async (tagData: Partial<Tag>): Promise<Tag> => {
  try {
    const response = await api.post("/api/v1/tags", tagData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error("Failed to create tag:", error);
    throw error;
  }
};

const updateTag = async (id: number, tagData: Partial<Tag>): Promise<Tag> => {
  try {
    const response = await api.put(`/api/v1/tags/${id}`, tagData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Failed to update tag ${id}:`, error);
    throw error;
  }
};

const deleteTag = async (id: number): Promise<void> => {
  try {
    await api.delete(`/api/v1/tags/${id}`);
  } catch (error) {
    console.error(`Failed to delete tag ${id}:`, error);
    throw error;
  }
};

// ContentStore object for backward compatibility
export const ContentStore = {
  getProfile,
  saveProfile,
  getProjects,
  saveProjects,
  getArticles,
  saveArticles,
  getExperiences,
  saveExperiences,
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
