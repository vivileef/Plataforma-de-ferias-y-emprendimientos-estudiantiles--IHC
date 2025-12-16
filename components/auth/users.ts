export type AppUser = {
  name?: string
  email: string
  phone?: string
  password: string
  role: "vendedor" | "comprador" | "admin"
  bloqueado?: boolean
  motivoBloqueo?: string
}

const USERS_KEY = "marketplace_users_v1"
const RESET_KEY = "marketplace_reset_tokens_v1"
const SESSION_KEY = "marketplace_session_v1"

function readUsers(): AppUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as AppUser[]
  } catch (e) {
    console.error("Failed to read users from localStorage", e)
    return []
  }
}

function writeUsers(users: AppUser[]) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  } catch (e) {
    console.error("Failed to write users to localStorage", e)
  }
}

export function ensureAdminExists() {
  const users = readUsers()
  const found = users.find((u) => u.role === "admin" && u.email.toLowerCase() === "admin@gmail.com")
  if (!found) {
    users.push({ name: "Administrador", email: "admin@gmail.com", password: "admin", role: "admin" })
    writeUsers(users)
  }
}

export function addUser(user: AppUser): { ok: boolean; error?: string } {
  const users = readUsers()
  const exists = users.find((u) => u.email.toLowerCase() === user.email.toLowerCase())
  if (exists) {
    return { ok: false, error: "Ya existe una cuenta con ese correo" }
  }
  users.push(user)
  writeUsers(users)
  return { ok: true }
}

export function validateCredentials(email: string, password: string, userType: AppUser['role']): { ok: boolean; user?: AppUser; error?: string } {
  const users = readUsers()
  const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
  if (!found) return { ok: false, error: "Credenciales inválidas" }
  if (found.password !== password) return { ok: false, error: "Credenciales inválidas" }
  
  // Verificar si está bloqueado
  if (found.bloqueado && found.role === "vendedor") {
    return { ok: false, error: `Cuenta suspendida: ${found.motivoBloqueo || "Contacta al administrador"}` }
  }
  
  // role must match for admin; for others ensure roles match
  if (userType === "admin") {
    return found.role === "admin" ? { ok: true, user: found } : { ok: false, error: "Acceso denegado" }
  }
  return found.role === userType ? { ok: true, user: found } : { ok: false, error: "Tipo de usuario incorrecto" }
}

type ResetToken = { token: string; email: string; expires: number }

function readResetTokens(): ResetToken[] {
  try {
    const raw = localStorage.getItem(RESET_KEY)
    if (!raw) return []
    return JSON.parse(raw) as ResetToken[]
  } catch (e) {
    console.error("Failed to read reset tokens from localStorage", e)
    return []
  }
}

function writeResetTokens(tokens: ResetToken[]) {
  try {
    localStorage.setItem(RESET_KEY, JSON.stringify(tokens))
  } catch (e) {
    console.error("Failed to write reset tokens to localStorage", e)
  }
}

export function requestPasswordReset(email: string): { ok: boolean; token?: string; error?: string } {
  const users = readUsers()
  const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
  if (!found) return { ok: false, error: "No existe una cuenta con ese correo" }

  const token = `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
  const expires = Date.now() + 1000 * 60 * 60 // 1 hour
  const tokens = readResetTokens()
  tokens.push({ token, email: found.email, expires })
  writeResetTokens(tokens)
  return { ok: true, token }
}

export function resetPassword(token: string, newPassword: string): { ok: boolean; error?: string } {
  const tokens = readResetTokens()
  const found = tokens.find((t) => t.token === token)
  if (!found) return { ok: false, error: "Token inválido o expirado" }
  if (found.expires < Date.now()) {
    // remove expired
    writeResetTokens(tokens.filter((t) => t.token !== token))
    return { ok: false, error: "Token expirado" }
  }

  const users = readUsers()
  const user = users.find((u) => u.email.toLowerCase() === found.email.toLowerCase())
  if (!user) return { ok: false, error: "Usuario no encontrado" }

  user.password = newPassword
  writeUsers(users)

  // remove used token
  writeResetTokens(tokens.filter((t) => t.token !== token))
  return { ok: true }
}

export function setSession(session: { email: string; role: AppUser['role']; name?: string } | null) {
  try {
    if (!session) {
      localStorage.removeItem(SESSION_KEY)
      return
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch (e) {
    console.error('Failed to write session to localStorage', e)
  }
}

export function getSession(): { email: string; role: AppUser['role']; name?: string } | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to read session from localStorage', e)
    return null
  }
}

export function getUserByEmail(email: string): AppUser | undefined {
  try {
    const users = readUsers()
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase())
  } catch (e) {
    console.error('Failed to get user by email', e)
    return undefined
  }
}

export function updateUserProfile(oldEmail: string, updates: Partial<AppUser>): { ok: boolean; user?: AppUser; error?: string } {
  try {
    const users = readUsers()
    const idx = users.findIndex((u) => u.email.toLowerCase() === oldEmail.toLowerCase())
    if (idx === -1) return { ok: false, error: 'Usuario no encontrado' }

    // if updating email, ensure uniqueness
    if (updates.email && updates.email.toLowerCase() !== oldEmail.toLowerCase()) {
      const exists = users.find((u) => u.email.toLowerCase() === updates.email!.toLowerCase())
      if (exists) return { ok: false, error: 'Ya existe una cuenta con ese correo' }
    }

    const user = users[idx]
    const updated: AppUser = { ...user, ...updates }
    users[idx] = updated
    writeUsers(users)
    return { ok: true, user: updated }
  } catch (e) {
    console.error('Failed to update user profile', e)
    return { ok: false, error: 'Error al actualizar el usuario' }
  }
}

// Export readUsers for admin panel
export function getAllUsers(): AppUser[] {
  return readUsers()
}

export function deleteUser(email: string): { ok: boolean; error?: string } {
  try {
    const users = readUsers()
    const filtered = users.filter((u) => u.email.toLowerCase() !== email.toLowerCase())
    if (filtered.length === users.length) {
      return { ok: false, error: 'Usuario no encontrado' }
    }
    writeUsers(filtered)
    return { ok: true }
  } catch (e) {
    console.error('Failed to delete user', e)
    return { ok: false, error: 'Error al eliminar el usuario' }
  }
}
