'use server'

import { 
  authenticateUser as dbAuthenticateUser, 
  findUserByEmail as dbFindUserByEmail 
} from '../lib/db'

// Server action for authentication
export async function authenticateUser(email: string, password: string) {
  try {
    const result = await dbAuthenticateUser(email, password)
    
    if (!result) {
      return { success: false, error: 'Invalid credentials' }
    }
    
    return { 
      success: true, 
      user: {
        id: result.id,
        name: result.name,
        email: result.email,
        role: result.role
      },
      token: result.token
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return { success: false, error: 'Authentication failed' }
  }
}

// Server action to find user by email
export async function findUserByEmail(email: string) {
  try {
    const user = await dbFindUserByEmail(email)
    return user ? { success: true, user } : { success: false, error: 'User not found' }
  } catch (error) {
    console.error('Error finding user:', error)
    return { success: false, error: 'Failed to find user' }
  }
} 