export interface Profile {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  github_url: string | null
  created_at: string
}

export interface Category {
  id: string
  slug: string
  name: string
  description: string | null
  color: string | null
  skill_count: number
  sort_order: number
}

export interface Skill {
  id: string
  slug: string
  filename: string
  title: string
  description: string
  content: string
  category_id: string | null
  author_id: string | null
  file_url: string | null
  file_size_bytes: number | null
  download_count: number
  view_count: number
  featured: boolean
  published: boolean
  tags: string[] | null
  preview_bg: string | null
  created_at: string
  updated_at: string
  // Joined relations (optional — present when selected with join)
  category?: Category
  author?: Profile
}

export interface Download {
  id: string
  skill_id: string
  user_id: string | null
  ip_hash: string
  created_at: string
}

export interface Favorite {
  user_id: string
  skill_id: string
  created_at: string
}

export interface Comment {
  id: string
  skill_id: string
  user_id: string
  content: string
  created_at: string
  author?: Profile
}
