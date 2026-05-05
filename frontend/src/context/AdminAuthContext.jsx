import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { adminAuthApi } from '../api/endpoints'
import { getAdminToken, setAdminToken } from '../api/client'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!getAdminToken()) {
      setAdmin(null)
      setLoading(false)
      return
    }
    try {
      const { data } = await adminAuthApi.me()
      setAdmin(data?.data || null)
    } catch {
      setAdminToken(null)
      setAdmin(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const login = async ({ email, password }) => {
    const { data } = await adminAuthApi.login({ email, password })
    setAdminToken(data.data.token)
    setAdmin(data.data.admin)
    return data.data.admin
  }

  const logout = async () => {
    try {
      await adminAuthApi.logout()
    } catch {
      // ignore network errors on logout
    }
    setAdminToken(null)
    setAdmin(null)
  }

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout, refresh }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used inside <AdminAuthProvider>')
  return ctx
}
