export interface LegoSet {
  set_num: string
  name: string
  year: number
  theme_id: number
  num_parts: number
  set_img_url: string
  set_url: string
  last_modified_dt: string
}

export interface SavedLegoSet extends LegoSet {
  savedAt: string
  purchased?: boolean
}

export interface SharedList {
  id: string
  userId: string
  sets: SavedLegoSet[]
  createdAt: string
}
