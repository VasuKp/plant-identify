import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

// Create necessary tables if they don't exist
export const initializeDatabase = async () => {
  const client = await pool.connect()
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone_number VARCHAR(20),
        role VARCHAR(20) NOT NULL DEFAULT 'USER',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        last_login TIMESTAMP
      )
    `)
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(token)
      )
    `)
    
    console.log('Database initialized successfully')
    return true
  } catch (error) {
    console.error('Database initialization error:', error)
    return false
  } finally {
    client.release()
  }
}

// Test database connection
export const testConnection = async () => {
  try {
    const client = await pool.connect()
    client.release()
    return true
  } catch (error) {
    console.error('Database connection error:', error)
    return false
  }
}

// Helper for securing passwords
const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash)
}

// Generate secure token
const generateToken = (): string => {
  return crypto.randomBytes(32).toString('hex')
}

// User operations
export const createUser = async (userData: {
  name: string
  email: string
  password: string
  phoneNumber?: string
}) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    
    // Check if email already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [userData.email.toLowerCase()]
    )
    
    if (existingUser.rows.length > 0) {
      throw new Error('Email already registered')
    }
    
    // Hash password before storing
    const hashedPassword = await hashPassword(userData.password)
    
    // Insert new user
    const result = await client.query(
      `INSERT INTO users (name, email, password, phone_number, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, name, email, phone_number, role, created_at`,
      [
        userData.name,
        userData.email.toLowerCase(),
        hashedPassword,
        userData.phoneNumber || null,
        'USER'
      ]
    )
    
    await client.query('COMMIT')
    return result.rows[0]
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export const authenticateUser = async (email: string, password: string) => {
  const client = await pool.connect()
  try {
    // Find user by email
    const userResult = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    )
    
    const user = userResult.rows[0]
    if (!user) {
      return null
    }
    
    // Check password
    const passwordMatch = await comparePassword(password, user.password)
    if (!passwordMatch) {
      return null
    }
    
    // Create session token
    const token = generateToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // Token valid for 7 days
    
    // Save session
    await client.query(
      `INSERT INTO user_sessions (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, token, expiresAt]
    )
    
    // Update last login
    await client.query(
      'UPDATE users SET last_login = NOW(), updated_at = NOW() WHERE id = $1',
      [user.id]
    )
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phone_number,
      role: user.role,
      token
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  } finally {
    client.release()
  }
}

export const validateToken = async (token: string) => {
  const client = await pool.connect()
  try {
    const sessionResult = await client.query(
      `SELECT s.*, u.id as user_id, u.name, u.email, u.role, u.phone_number
       FROM user_sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.token = $1 AND s.expires_at > NOW()`,
      [token]
    )
    
    if (sessionResult.rows.length === 0) {
      return null
    }
    
    const session = sessionResult.rows[0]
    return {
      id: session.user_id,
      name: session.name,
      email: session.email,
      phoneNumber: session.phone_number,
      role: session.role
    }
  } catch (error) {
    console.error('Token validation error:', error)
    return null
  } finally {
    client.release()
  }
}

export const logoutUser = async (token: string) => {
  const client = await pool.connect()
  try {
    await client.query(
      'DELETE FROM user_sessions WHERE token = $1',
      [token]
    )
    return true
  } catch (error) {
    console.error('Logout error:', error)
    return false
  } finally {
    client.release()
  }
}

export const findUserByEmail = async (email: string) => {
  const client = await pool.connect()
  try {
    const result = await client.query(
      'SELECT id, name, email, phone_number, role, created_at, last_login FROM users WHERE email = $1',
      [email.toLowerCase()]
    )
    return result.rows[0]
  } finally {
    client.release()
  }
}

export const updateUserPassword = async (userId: string, newPassword: string) => {
  const client = await pool.connect()
  try {
    const hashedPassword = await hashPassword(newPassword)
    await client.query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, userId]
    )
    return true
  } catch (error) {
    console.error('Password update error:', error)
    return false
  } finally {
    client.release()
  }
}

export default pool 