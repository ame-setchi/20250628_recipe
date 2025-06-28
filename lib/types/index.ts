export interface Recipe {
  id: string
  title: string
  description: string
  ingredients: string[]
  instructions: string[]
  cooking_time: number
  servings: number
  difficulty: 'easy' | 'medium' | 'hard'
  image_url: string | null
  source_url: string
  tags: string[]
  created_at?: string
}

export interface ScrapedRecipe {
  title: string
  description: string
  ingredients: string[]
  instructions: string[]
  cooking_time: number
  servings: number
  difficulty: 'easy' | 'medium' | 'hard'
  image_url: string | null
  source_url: string
  tags: string[]
} 