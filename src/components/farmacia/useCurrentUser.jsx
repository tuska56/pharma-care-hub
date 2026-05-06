import { useState, useEffect } from 'react';
import { appClient } from '@/api/appClient';

export default function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const cargarUser = async () => {
    try {
      const u = await appClient.auth.me();
      setUser(u);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUser();
  }, []);

  // Admin: role === 'admin'
  // Empleado: cualquier otro role (incluyendo 'user')
  // CRÍTICO: si no hay user todavía, no decidir aún
  const isAdmin = user?.role === 'admin';
  // Un usuario es empleado si su rol NO es admin
  // Solo se considera empleado si el user ya está cargado
  const isEmpleado = !!user && user.role !== 'admin';

  return { user, loading, isAdmin, isEmpleado, recargarUser: cargarUser };
}