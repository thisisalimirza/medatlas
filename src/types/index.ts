export interface Place {
  id: number
  slug: string
  name: string
  type: 'school' | 'rotation' | 'residency'
  institution?: string
  city: string
  state: string
  country: string
  location_city: string
  location_state: string
  location_country: string
  lat: number
  lng: number
  photo_url?: string
  tags: string[]
  rank_overall?: number
  
  // Direct properties for easier access
  tuition_in_state?: number
  tuition_out_state?: number
  mcat_avg?: number
  gpa_avg?: number
  acceptance_rate?: number
  img_friendly?: boolean
  usmle_step1_pass_rate?: number
  match_rate?: number
  
  metrics: {
    tuition?: number
    tuition_out_state?: number
    col_index?: number
    research_output?: number
    img_friendly?: boolean
    workload?: number
    mcat_avg?: number
    gpa_avg?: number
    acceptance_rate?: number
    match_rate?: number
    usmle_step1_pass_rate?: number
    class_size?: number
    [key: string]: any
  }
  scores: {
    quality_of_training: number
    community_score: number
    lifestyle: number
    burnout: number
    match_strength: number
    [key: string]: any
  }
  created_at?: string
  updated_at?: string
}

export interface User {
  id: number
  email: string
  password_hash?: string
  stage: 'premed' | 'ms1' | 'ms2' | 'ms3' | 'ms4' | 'resident' | 'attending'
  display_name?: string
  avatar_url?: string
  is_paid: boolean
  created_at?: string
  updated_at?: string
}

export interface CheckIn {
  id: number
  user_id: number
  place_id: number
  status: 'now' | 'soon' | 'been'
  private: boolean
  eta_date?: string
  created_at?: string
}

export interface Review {
  id: number
  user_id: number
  place_id: number
  rating: number
  tags: string[]
  body: string
  is_anonymous: boolean
  created_at?: string
  updated_at?: string
}

export interface FilterOptions {
  type?: string[]
  tuition?: { min?: number; max?: number }
  research_output?: { min?: number; max?: number }
  img_friendly?: boolean
  workload?: { min?: number; max?: number }
  tags?: string[]
  location?: { country?: string; state?: string; city?: string }
  search?: string
}