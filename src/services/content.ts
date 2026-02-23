// Enhanced content store with local storage fallback and API integration
import { api } from "./api";

export type Profile = {
  name: string;
  title: string;
  title_id?: string;
  bio: string;
  bio_id?: string;
  avatarDataUrl?: string;
  aboutSubtitle?: string;
  aboutSubtitle_id?: string;
  aboutDescription1?: string;
  aboutDescription1_id?: string;
  aboutDescription2?: string;
  aboutDescription2_id?: string;
  aboutDescription3?: string;
  aboutDescription3_id?: string;
  coreExpertise?: { name: string; percentage: number }[];
  skillCategories?: { category: string; technologies: string[] }[];
  location?: string;
  location_id?: string;
  email?: string;
  email_id?: string;
  phone?: string;
  phone_id?: string;
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
  metadata?: Record<string, any>;
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
    const response = await api.get(
      "/settings?keys=profile.name,profile.title,profile.title.id,profile.bio,profile.bio.id,profile.avatarUrl,about.subtitle,about.subtitle.id,about.desc1,about.desc1.id,about.desc2,about.desc2.id,about.desc3,about.desc3.id,about.expertise,about.skills,about.location,about.location.id,about.email,about.email.id,about.phone,about.phone.id",
    );
    const data = response.data?.data || {};
    return {
      name: data["profile.name"] || "",
      title: data["profile.title"] || "",
      title_id: data["profile.title.id"] || "",
      bio: data["profile.bio"] || "",
      bio_id: data["profile.bio.id"] || "",
      avatarDataUrl: data["profile.avatarUrl"] || "",
      aboutSubtitle: data["about.subtitle"] || "",
      aboutSubtitle_id: data["about.subtitle.id"] || "",
      aboutDescription1: data["about.desc1"] || "",
      aboutDescription1_id: data["about.desc1.id"] || "",
      aboutDescription2: data["about.desc2"] || "",
      aboutDescription2_id: data["about.desc2.id"] || "",
      aboutDescription3: data["about.desc3"] || "",
      aboutDescription3_id: data["about.desc3.id"] || "",
      coreExpertise: data["about.expertise"]
        ? JSON.parse(data["about.expertise"])
        : [
          { name: "Backend Development", percentage: 95 },
          { name: "Golang", percentage: 90 },
          { name: "Database Design", percentage: 85 },
          { name: "System Architecture", percentage: 80 },
        ],
      skillCategories: data["about.skills"]
        ? JSON.parse(data["about.skills"])
        : [
          {
            category: "Backend",
            technologies: ["Go", "Node.js", "Python", "Java", "C++"],
          },
          {
            category: "Database",
            technologies: [
              "PostgreSQL",
              "MySQL",
              "MongoDB",
              "Redis",
              "ElasticSearch",
            ],
          },
          {
            category: "DevOps",
            technologies: [
              "Docker",
              "Kubernetes",
              "AWS",
              "Jenkins",
              "Terraform",
            ],
          },
          {
            category: "Architecture",
            technologies: [
              "Microservices",
              "REST API",
              "gRPC",
              "GraphQL",
              "Event Sourcing",
            ],
          },
        ],
      location: data["about.location"] || "",
      location_id: data["about.location.id"] || "",
      email: data["about.email"] || "",
      email_id: data["about.email.id"] || "",
      phone: data["about.phone"] || "",
      phone_id: data["about.phone.id"] || "",
    };
  } catch (error) {
    return { name: "", title: "", bio: "", avatarDataUrl: "" };
  }
};

const saveProfile = async (v: Profile): Promise<void> => {
  try {
    const payload = {
      "profile.name": v.name,
      "profile.title": v.title,
      "profile.title.id": v.title_id || "",
      "profile.bio": v.bio,
      "profile.bio.id": v.bio_id || "",
      "profile.avatarUrl": v.avatarDataUrl || "",
      "about.subtitle": v.aboutSubtitle || "",
      "about.subtitle.id": v.aboutSubtitle_id || "",
      "about.desc1": v.aboutDescription1 || "",
      "about.desc1.id": v.aboutDescription1_id || "",
      "about.desc2": v.aboutDescription2 || "",
      "about.desc2.id": v.aboutDescription2_id || "",
      "about.desc3": v.aboutDescription3 || "",
      "about.desc3.id": v.aboutDescription3_id || "",
      "about.expertise": JSON.stringify(v.coreExpertise || []),
      "about.skills": JSON.stringify(v.skillCategories || []),
      "about.location": v.location || "",
      "about.location.id": v.location_id || "",
      "about.email": v.email || "",
      "about.email.id": v.email_id || "",
      "about.phone": v.phone || "",
      "about.phone.id": v.phone_id || "",
    };
    await api.put("/settings", payload);
  } catch (error) {
    throw error;
  }
};

// Projects - API only
const getProjects = async (): Promise<Project[]> => {
  try {
    const response = await api.get("/projects");

    const responseData = response.data?.data;
    const projects = Array.isArray(responseData?.data)
      ? responseData.data
      : Array.isArray(responseData)
        ? responseData
        : [];

    return projects.map((project: any) => {
      // Technologies dari backend bisa berupa array of {id, name, slug} atau string[]
      const techRaw = project.technologies || [];
      const technologies: string[] = techRaw
        .map((t: any) => (typeof t === "string" ? t : t?.name || ""))
        .filter(Boolean);

      return {
        id: project.id || "",
        title: project.title || "",
        slug: project.slug || "",
        description: project.description || "",
        content: project.content || "",
        // Backend mengembalikan camelCase: thumbnailUrl, githubUrl, liveDemoUrl
        thumbnailUrl:
          project.thumbnailUrl ||
          project.thumbnailURL ||
          project.thumbnail_url ||
          "",
        featuredImageUrl:
          project.thumbnailUrl ||
          project.featuredImageUrl ||
          project.featuredImageURL ||
          project.featured_image_url ||
          "",
        status: project.status || "draft",
        categoryId:
          project.categoryId || project.categoryID || project.category_id,
        category: project.category || null,
        categories: Array.isArray(project.categoryModels) && project.categoryModels.length > 0
          ? project.categoryModels
          : Array.isArray(project.categories) && project.categories.length > 0 && typeof project.categories[0] === 'object'
            ? project.categories
            : (project.categoryId ? [{ id: project.categoryId, name: project.category || "Selected" }] : []),
        tags: Array.isArray(project.tagModels) && project.tagModels.length > 0
          ? project.tagModels
          : Array.isArray(project.tags) && project.tags.length > 0 && typeof project.tags[0] === 'object'
            ? project.tags
            : [],
        link: project.liveDemoUrl || project.demoUrl || project.link || "",
        githubUrl:
          project.githubUrl || project.githubURL || project.github_url || "",
        demoUrl:
          project.liveDemoUrl ||
          project.liveDemoURL ||
          project.live_demo_url ||
          "",
        liveDemoUrl:
          project.liveDemoUrl ||
          project.liveDemoURL ||
          project.live_demo_url ||
          "",
        technologies,
        images: (project.metadata && project.metadata.images) || project.images || [],
        videos: (project.metadata && project.metadata.videos) || project.videos || [],
        metadata: project.metadata || {},
      };
    });
  } catch (error) {
    return [];
  }
};

const saveProjects = async (projects: Project[]) => {
  const token = localStorage.getItem("cms_token");
  if (!token) {
    throw new Error(
      "Authentication required. Please login again to save projects to the server.",
    );
  }

  const updatedProjects: Project[] = [];

  for (const project of projects) {
    // Separate Technologies (used for the stack)
    const techIds: number[] = [];
    const techNames: string[] = [];
    if (Array.isArray(project.technologies)) {
      project.technologies.forEach((t: any) => {
        if (typeof t === "number") techIds.push(t);
        else if (typeof t === "string") techNames.push(t);
        else if (t?.id) techIds.push(Number(t.id));
        else if (t?.name) techNames.push(t.name);
      });
    }

    // Separate Tags (general labels)
    const tagIds: number[] = [];
    const tagNames: string[] = [];
    if (Array.isArray(project.tags)) {
      project.tags.forEach((t: any) => {
        if (typeof t === "number") tagIds.push(t);
        else if (typeof t === "string") tagNames.push(t);
        else if (t?.id && t.id > 0) tagIds.push(Number(t.id));
        else if (t?.name) tagNames.push(t.name);
      });
    }

    // Pastikan title & slug selalu ada
    const title = project.title?.trim() || "Untitled Project";
    const slug =
      project.slug?.trim() ||
      title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");

    // Payload — hanya sertakan field yang ada (partial/patch friendly)
    const payload: Record<string, any> = {
      title,
      slug,
      status: project.status || "draft",
    };

    if (project.description !== undefined)
      payload.description = project.description;
    if (project.content !== undefined) payload.content = project.content;
    if (
      project.thumbnailUrl !== undefined ||
      project.featuredImageUrl !== undefined
    )
      payload.thumbnailUrl =
        project.featuredImageUrl || project.thumbnailUrl || "";
    if (project.categories) {
      payload.categoryIdStrs = project.categories.map((c: any) =>
        typeof c === "object"
          ? c.id > 0
            ? String(c.id)
            : String(c.name || "")
          : String(c),
      );
    } else if (project.categoryId !== undefined) {
      payload.categoryIds = project.categoryId ? [project.categoryId] : [];
    }
    if (project.githubUrl !== undefined) payload.githubUrl = project.githubUrl;
    if (
      project.liveDemoUrl !== undefined ||
      project.demoUrl !== undefined ||
      project.link !== undefined
    ) {
      payload.liveDemoUrl =
        project.liveDemoUrl || project.demoUrl || project.link || "";
    }

    // Send both independently
    payload.technologies = techIds;
    payload.technologyNames = techNames;
    payload.tags = tagIds;
    payload.tagNames = tagNames;

    // Add tagIdStrs payload matching Articles
    payload.tagIdStrs = Array.isArray(project.tags)
      ? project.tags.map((t: any) =>
        typeof t === "object"
          ? t.id > 0
            ? String(t.id)
            : String(t.name)
          : String(t),
      )
      : [];

    const finalMetadata = project.metadata ? { ...project.metadata } : {};
    if (project.images !== undefined) finalMetadata.images = project.images;
    if (project.videos !== undefined) finalMetadata.videos = project.videos;
    payload.metadata = finalMetadata;

    try {
      let response;
      const isExisting =
        project.id &&
        typeof project.id === "string" &&
        project.id.length > 0 &&
        !project.id.startsWith("temp-");

      if (isExisting) {
        // PATCH untuk update parsial — hanya field yang dikirim yang berubah
        response = await api.patch(`/projects/${project.id}`, payload);
      } else {
        // POST untuk create baru
        response = await api.post("/projects", payload);
      }

      const saved = response.data?.data || response.data;
      updatedProjects.push(saved);
    } catch (err: any) {
      throw err;
    }
  }

  return await getProjects();
};

// Articles - API only
const getArticles = async (): Promise<Article[]> => {
  try {
    const response = await api.get("/articles");

    const responseData = response.data?.data;
    const articles = Array.isArray(responseData?.data)
      ? responseData.data
      : Array.isArray(responseData)
        ? responseData
        : [];
    return articles.map((article: any) => ({
      id: article.id || "",
      title: article.title || "",
      slug: article.slug || "",
      excerpt: article.excerpt || "",
      content: article.content || "",
      // Backend mengembalikan camelCase featuredImageUrl
      featuredImageUrl:
        article.featuredImageUrl ||
        article.featuredImageURL ||
        article.featured_image_url ||
        "",
      status: article.status || "draft",
      categories: Array.isArray(article.categoryModels) && article.categoryModels.length > 0
        ? article.categoryModels
        : Array.isArray(article.categories)
          ? article.categories.map((c: any) => typeof c === 'string' ? { id: 0, name: c } : c)
          : [],
      tags: Array.isArray(article.tagModels) && article.tagModels.length > 0
        ? article.tagModels
        : Array.isArray(article.tags)
          ? article.tags.map((t: any) => typeof t === 'string' ? { id: 0, name: t } : t)
          : [],
      images: (article.metadata && article.metadata.images) || article.images || [],
      videos: (article.metadata && article.metadata.videos) || article.videos || [],
      publishedAt: article.publishedAt || article.published_at,
      // Preserve metadata termasuk translations
      metadata: article.metadata || {},
    }));
  } catch (error) {
    return [];
  }
};

const saveArticles = async (articles: Article[]) => {
  const token = localStorage.getItem("cms_token");
  if (!token) {
    throw new Error(
      "Authentication required. Please login again to save articles to the server.",
    );
  }

  const updatedArticles: Article[] = [];

  for (const article of articles) {
    const payload: Record<string, any> = {
      title: article.title || "",
      slug: article.slug || "",
      status: article.status || "draft",
      categoryIdStrs: Array.isArray(article.categories)
        ? article.categories.map((c: any) =>
          typeof c === "object"
            ? c.id > 0
              ? String(c.id)
              : String(c.name)
            : String(c),
        )
        : [],
      tagIdStrs: Array.isArray(article.tags)
        ? article.tags.map((t: any) =>
          typeof t === "object"
            ? t.id > 0
              ? String(t.id)
              : String(t.name)
            : String(t),
        )
        : [],
      metadata: {
        ...(article.metadata || {}),
        lastUpdated: new Date().toISOString(),
        images: article.images || [],
        videos: article.videos || [],
      },
    };

    if (article.excerpt !== undefined) payload.excerpt = article.excerpt;
    if (article.content !== undefined) payload.content = article.content;
    if (article.featuredImageUrl !== undefined)
      payload.featuredImageUrl = article.featuredImageUrl;
    if (article.publishedAt !== undefined) {
      if (article.publishedAt) {
        try {
          payload.publishAt = new Date(article.publishedAt).toISOString();
        } catch (e) {
          payload.publishAt = article.publishedAt;
        }
      } else {
        payload.publishAt = null; // or undefined based on backend requirements
      }
    }

    const isExisting =
      article.id && article.id.length > 10 && !article.id.startsWith("temp-");

    try {
      let response;
      if (isExisting) {
        // PATCH → partial update, hanya field yang dikirim
        response = await api.patch(`/articles/${article.id}`, payload);
      } else {
        response = await api.post("/articles", payload);
      }
      const saved = response.data?.data || response.data;
      updatedArticles.push(saved);
    } catch (err: any) {
      throw err;
    }
  }

  return await getArticles();
};

// Categories - API only
const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get("/categories");
    return response.data?.data || response.data || [];
  } catch (error) {
    return [];
  }
};

// Tags - API only
const getTags = async (): Promise<Tag[]> => {
  try {
    const response = await api.get("/tags");
    return response.data?.data || response.data || [];
  } catch (error) {
    return [];
  }
};

// Experiences - API only
const getExperiences = async (): Promise<Experience[]> => {
  try {
    const response = await api.get("/experiences");

    const responseData = response.data?.data;
    const experiences = Array.isArray(responseData?.data)
      ? responseData.data
      : Array.isArray(responseData)
        ? responseData
        : [];

    return experiences.map((exp: any) => {
      // Technologies dari backend adalah array of {id, name, slug}
      // Kita preserve sebagai array of objects untuk mapping yang benar saat save
      const techRaw = Array.isArray(exp.technologies) ? exp.technologies : [];

      return {
        id: exp.id || exp.ID || 0,
        title: exp.title || exp.role || "",
        company: exp.company || "",
        location: exp.location || "",
        startDate: exp.startDate || exp.start_date || "",
        endDate: exp.endDate || exp.end_date || null,
        current: exp.current || false,
        description: exp.description || "",
        responsibilities: Array.isArray(exp.responsibilities)
          ? exp.responsibilities
          : [],
        // Preserve sebagai objects agar ID bisa dipakai saat save
        technologies: techRaw,
        companyUrl: exp.companyUrl || exp.company_url || "",
        logoUrl: exp.logoUrl || exp.logo_url || "",
        metadata: exp.metadata || {},
        createdAt: exp.createdAt || exp.created_at || new Date().toISOString(),
        updatedAt: exp.updatedAt || exp.updated_at || new Date().toISOString(),
        // Legacy compat
        role: exp.title || exp.role || "",
        period:
          exp.period ||
          `${exp.startDate || ""} - ${exp.endDate || (exp.current ? "Present" : "")}`,
      };
    });
  } catch (error) {
    return [];
  }
};

const saveExperiences = async (experiences: any[]): Promise<any[]> => {
  const token = localStorage.getItem("cms_token");
  if (!token) {
    throw new Error("Authentication required. Please login again.");
  }

  const updatedExperiences: any[] = [];

  for (const experience of experiences) {
    try {
      const techIds: number[] = Array.isArray(experience.technologies)
        ? experience.technologies
          .map((t: any) =>
            typeof t === "object" && t?.id > 0 ? Number(t.id) : 0,
          )
          .filter((id: number) => id > 0)
        : [];

      const techNames: string[] = Array.isArray(experience.technologies)
        ? experience.technologies
          .map((t: any) => (typeof t === "string" ? t : t?.name || ""))
          .filter(Boolean)
        : [];

      const rawStartDate =
        experience.startDate || experience.period?.split(" - ")[0] || "";
      const startDate =
        rawStartDate.length === 7
          ? `${rawStartDate}-01`
          : rawStartDate.length >= 10
            ? rawStartDate.substring(0, 10)
            : rawStartDate;

      const rawEndDate = experience.current
        ? ""
        : experience.endDate ||
        (experience.period && experience.period.split(" - ")[1] !== "Present"
          ? experience.period.split(" - ")[1]
          : "") ||
        "";
      const endDate =
        rawEndDate.length === 7
          ? `${rawEndDate}-01`
          : rawEndDate.length >= 10
            ? rawEndDate.substring(0, 10)
            : rawEndDate;

      const payload: Record<string, any> = {
        title: experience.title || experience.role || "",
        company: experience.company || "",
        location: experience.location || "",
        current:
          experience.current ??
          (experience.period?.includes("Present") || false),
      };

      if (experience.description !== undefined)
        payload.description = experience.description;
      if (startDate !== "") payload.startDate = startDate;
      if (endDate !== "") payload.endDate = endDate;
      if (experience.responsibilities !== undefined) {
        payload.responsibilities = Array.isArray(experience.responsibilities)
          ? experience.responsibilities.filter(Boolean)
          : [];
      }
      payload.technologyIds = techIds;
      payload.technologyNames = techNames;
      if (experience.companyUrl !== undefined)
        payload.companyUrl = experience.companyUrl;
      if (experience.logoUrl !== undefined)
        payload.logoUrl = experience.logoUrl;
      if (experience.metadata !== undefined)
        payload.metadata = experience.metadata;

      const isExisting =
        experience.id &&
        experience.id > 0 &&
        String(experience.id) !== "0" &&
        !String(experience.id).startsWith("temp-");

      let response;
      if (isExisting) {
        // Use PATCH for partial updates
        response = await api.patch(`/experiences/${experience.id}`, payload);
      } else {
        response = await api.post("/experiences", payload);
      }

      const saved = response.data?.data || response.data;
      updatedExperiences.push(saved);
    } catch (err: any) {
      throw err;
    }
  }

  return await getExperiences();
};

// Categories CRUD
const createCategory = async (
  categoryData: Partial<Category>,
): Promise<Category> => {
  try {
    const response = await api.post("/categories", categoryData);
    return response.data?.data || response.data;
  } catch (error) {
    throw error;
  }
};

const updateCategory = async (
  id: number,
  categoryData: Partial<Category>,
): Promise<Category> => {
  try {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data?.data || response.data;
  } catch (error) {
    throw error;
  }
};

const deleteCategory = async (id: number): Promise<void> => {
  try {
    await api.delete(`/categories/${id}`);
  } catch (error) {
    throw error;
  }
};

// Tags CRUD
const createTag = async (tagData: Partial<Tag>): Promise<Tag> => {
  try {
    const response = await api.post("/tags", tagData);
    return response.data?.data || response.data;
  } catch (error) {
    throw error;
  }
};

const updateTag = async (id: number, tagData: Partial<Tag>): Promise<Tag> => {
  try {
    const response = await api.put(`/tags/${id}`, tagData);
    return response.data?.data || response.data;
  } catch (error) {
    throw error;
  }
};

const deleteTag = async (id: number): Promise<void> => {
  try {
    await api.delete(`/tags/${id}`);
  } catch (error) {
    throw error;
  }
};

export const deleteProject = async (id: string): Promise<void> => {
  if (id && !id.startsWith("temp-")) {
    try {
      await api.delete(`/projects/${id}`);
    } catch (error) {
      throw error;
    }
  }
};

export const deleteArticle = async (id: string): Promise<void> => {
  if (id && !id.startsWith("temp-")) {
    try {
      await api.delete(`/articles/${id}`);
    } catch (error) {
      throw error;
    }
  }
};

export const deleteExperience = async (id: number): Promise<void> => {
  if (id && id > 0) {
    try {
      await api.delete(`/experiences/${id}`);
    } catch (error) {
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
export {
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
