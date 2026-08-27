export type Role = 'usuario' | 'moderador' | 'admin'

export type SightingStatus =
  | 'aguardando_revisao'
  | 'em_revisao'
  | 'correcao_solicitada'
  | 'revisao_especialista'
  | 'aprovado'
  | 'rejeitado'

export type AnimalCondition = 'vivo' | 'morto' | 'ferido' | 'aparentemente_saudavel' | 'nao_avaliado'
export type Behavior = 'parado' | 'fugindo' | 'defensivo' | 'agressivo' | 'escondido' | 'outro'

export interface Profile {
  id: string
  full_name: string
  contact: string | null
  phone: string | null
  city: string | null
  state: string
  notify_enabled: boolean
  phone_public: boolean
  active: boolean
  role: Role
  is_admin: boolean
  created_at: string
}

export interface Species {
  id: string
  common_name: string
  scientific_name: string
  family: string | null
  genus: string | null
  venomous: boolean
  image_url: string | null
  description: string | null
  identification_features: string | null
  habitat: string | null
  vegetation?: string | null
  region: string | null
  occurrence_regions: string[]
  references_list: string[]
  active: boolean
  created_at?: string
  updated_at?: string
}

export interface SpeciesPhoto {
  id: string
  species_id: string
  url: string
  is_primary: boolean
  order_index: number
}

export interface Sighting {
  id: string
  user_id: string
  suggested_species_id: string | null
  confirmed_species_id: string | null
  dont_know_species: boolean
  reported_name: string | null
  identified_by: string | null
  identified_at: string | null
  notes: string | null
  municipio: string | null
  localidade: string | null
  local_especifico: string | null
  latitude: number | null
  longitude: number | null
  latitude_public?: number | null
  longitude_public?: number | null
  gps_accuracy_m: number | null
  location_type: string | null
  observation_date: string | null
  observation_time: string | null
  vegetation_type: string | null
  season: string | null
  weather_condition: string | null
  day_period: string | null
  animal_condition: AnimalCondition | null
  behavior: Behavior | null
  share_contact: boolean
  status: SightingStatus
  reviewed_by: string | null
  reviewed_at: string | null
  review_note: string | null
  view_count: number
  created_at: string
}

export interface SightingPhoto {
  id: string
  sighting_id: string
  url: string
  media_type: 'foto' | 'video' | 'anexo'
  is_primary: boolean
  order_index: number
}

export interface SightingPublic {
  id: string
  municipio: string | null
  localidade: string | null
  location_type: string | null
  latitude: number | null
  longitude: number | null
  observation_date: string | null
  observation_time: string | null
  vegetation_type: string | null
  season: string | null
  weather_condition: string | null
  day_period: string | null
  animal_condition: AnimalCondition | null
  behavior: Behavior | null
  notes: string | null
  reported_name: string | null
  dont_know_species: boolean
  suggested_species_id: string | null
  confirmed_species_id: string | null
  species_display_name: string | null
  venomous_display: boolean | null
  identification_confirmed: boolean
  author_name: string | null
  created_at: string
  view_count: number
  primary_photo_url: string | null
}

export interface FirstAidInfo {
  id: string
  title: string
  content: string
  category: string | null
  order_index?: number
}

export interface Stats {
  total_sightings: number
  venomous_sightings: number
  safe_sightings: number
  awaiting_identification_sightings: number
  municipalities: number
  total_species: number
  total_users: number
}

export const ANIMAL_CONDITION_LABELS: Record<AnimalCondition, string> = {
  vivo: 'Vivo',
  morto: 'Morto',
  ferido: 'Ferido',
  aparentemente_saudavel: 'Aparentemente saudável',
  nao_avaliado: 'Não foi possível avaliar',
}

export const BEHAVIOR_LABELS: Record<Behavior, string> = {
  parado: 'Parado',
  fugindo: 'Fugindo',
  defensivo: 'Defensivo',
  agressivo: 'Agressivo',
  escondido: 'Escondido',
  outro: 'Outro',
}

export const STATUS_LABELS: Record<SightingStatus, string> = {
  aguardando_revisao: 'Aguardando revisão',
  em_revisao: 'Em revisão',
  correcao_solicitada: 'Correção solicitada',
  revisao_especialista: 'Revisão especialista',
  aprovado: 'Aprovado',
  rejeitado: 'Rejeitado',
}
