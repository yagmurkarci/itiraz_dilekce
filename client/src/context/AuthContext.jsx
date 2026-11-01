import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { decodeToken, getToken, setToken } from '../api/client.js';
import { authService } from '../services/auth.service.js';

const ACADEMIC_ROLE_NAMES = ['Akademisyen', 'Öğretim Görevlisi'];
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(getToken());
  const [profile, setProfile] = useState(null);
  const [ready, setReady] = useState(false);

  const claims = useMemo(() => decodeToken(), [token]);
  const roles = useMemo(() => {
    const raw = claims?.roles || [];
    if (!Array.isArray(raw)) return [];
    return raw.map((role) => (typeof role === 'string' ? role : role?.roleName)).filter(Boolean);
  }, [claims]);
  const userId = Number(claims?.userId || 0);

  const hasRole = useCallback((...names) => names.some((name) => roles.includes(name)), [roles]);
  const hasAcademicRole = useMemo(
    () => roles.some((role) => ACADEMIC_ROLE_NAMES.includes(role)),
    [roles]
  );

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    setToken(data.token);
    setTokenState(data.token);
    return data;
  }, []);

  const logout = useCallback(() => {
    setToken('');
    setTokenState('');
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const data = await authService.me();
    setProfile(data);
    return data;
  }, []);

  useEffect(() => {
    let active = true;

    async function init() {
      if (!getToken()) {
        setReady(true);
        return;
      }

      try {
        const data = await authService.me();
        if (active) setProfile(data);
      } catch {
        if (active) {
          setToken('');
          setTokenState('');
        }
      } finally {
        if (active) setReady(true);
      }
    }

    init();
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      token,
      claims,
      roles,
      userId,
      profile,
      ready,
      isAuthenticated: Boolean(token),
      hasRole,
      hasAcademicRole,
      isStudent: hasRole('Öğrenci', 'Mezun'),
      isStudentAffairs: hasRole('Öğrenci İşleri'),
      isManager: hasRole('Root', 'Admin'),
      isRoot: hasRole('Root'),
      login,
      logout,
      refreshProfile,
      setProfile,
    }),
    [token, claims, roles, userId, profile, ready, hasRole, hasAcademicRole, login, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
