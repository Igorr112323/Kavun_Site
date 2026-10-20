export type Condition = 'new' | 'used'
export type EquipmentStatus = 'in_stock' | 'in_transit' | 'on_order' | 'reserved' | 'sold'
export type RequestStatus = 'new' | 'in_progress' | 'closed'
export type Role = 'admin' | 'editor'

export type Spec = { label: string; value: string }

export type Category = {
  id: number
  slug: string
  title: string
  short_title: string | null
  description: string | null
  sort: number
}

export type Manufacturer = {
  id: number
  slug: string
  name: string
  country: string | null
  founded: string | null
  site_url: string | null
  summary: string | null
  note: string | null
  sort: number
}

export type Equipment = {
  id: number
  slug: string
  title: string
  manufacturer_id: number | null
  category_id: number | null
  model: string | null
  condition: Condition
  year: number | null
  price: number | null
  price_on_request: number
  status: EquipmentStatus
  specs: string
  description: string | null
  condition_note: string | null
  checked: number
  complete_set: string | null
  power: string | null
  weight: string | null
  dimensions: string | null
  images: string
  passport_url: string | null
  is_published: number
  is_featured: number
  sort: number
  created_at: string
  updated_at: string
}

export type EquipmentFull = Equipment & {
  specs_parsed: Spec[]
  images_parsed: string[]
  manufacturer: Manufacturer | null
  category: Category | null
}

export type Post = {
  id: number
  slug: string
  title: string
  excerpt: string | null
  body: string | null
  cover: string | null
  equipment_id: number | null
  published_at: string
  is_published: number
  is_pinned: number
}

export type CatalogFile = {
  id: number
  title: string
  manufacturer_id: number | null
  description: string | null
  cover: string | null
  pdf_url: string | null
  pages_label: string | null
  file_size: string | null
  year: number | null
  sort: number
}

export type RequestRow = {
  id: number
  name: string
  phone: string
  email: string | null
  message: string | null
  equipment_id: number | null
  source_page: string | null
  status: RequestStatus
  manager_note: string | null
  created_at: string
}

export type User = {
  id: number
  email: string
  name: string
  role: Role
  is_active: number
  created_at: string
}

export type PageBlock = {
  slug: string
  title: string
  seo_title: string | null
  seo_description: string | null
  blocks: Record<string, string>
  updated_at?: string
}
