import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import apiClient from './client'

// Example: User query
const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string().optional(),
})

export type User = z.infer<typeof UserSchema>

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await apiClient.get('/users')
      return response.data.map((item: unknown) => UserSchema.parse(item))
    },
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (user: Omit<User, 'id'>) => {
      const response = await apiClient.post('/users', user)
      return UserSchema.parse(response.data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
