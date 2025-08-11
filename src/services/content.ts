// Simple localStorage-based content store (temporary until backend endpoints are ready)
export type Profile = { name: string; title: string; bio: string; avatarDataUrl?: string }
export type Project = { id: number; title: string; description?: string; link?: string }
export type Article = { id: number; title: string; url: string }
export type Experience = { id: number; company: string; role: string; period: string; description?: string }

const get = <T>(key: string, fallback: T): T => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) as T : fallback } catch { return fallback }
}
const set = <T>(key: string, value: T) => { try { localStorage.setItem(key, JSON.stringify(value)) } catch {} }

export const ContentStore = {
  getProfile: (): Profile => get<Profile>('cms_profile', { name: '', title: '', bio: '', avatarDataUrl: undefined }),
  saveProfile: (v: Profile) => set('cms_profile', v),

  getProjects: (): Project[] => get<Project[]>('cms_projects', []),
  saveProjects: (v: Project[]) => set('cms_projects', v),

  getArticles: (): Article[] => get<Article[]>('cms_articles', []),
  saveArticles: (v: Article[]) => set('cms_articles', v),

  getExperiences: (): Experience[] => get<Experience[]>('cms_experiences', []),
  saveExperiences: (v: Experience[]) => set('cms_experiences', v),
}
