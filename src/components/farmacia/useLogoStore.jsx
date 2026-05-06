/**
 * Gestiona el logo de la farmacia.
 * Lo guarda en la BD (entidad Convenio campo logo_url en localStorage compartido)
 * y también en localStorage como caché local.
 */
import { useState, useEffect } from 'react';
import { appClient } from '@/api/appClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function useLogoStore() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  // Suscripción en tiempo real: cualquier cambio en Convenio actualiza el logo al instante
  useEffect(() => {
    const unsubscribe = appClient.entities.Convenio.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['config_logo'] });
    });
    return unsubscribe;
  }, [queryClient]);

  // Leer logo desde BD (entidad Convenio con anio=0 = config global)
  const { data: configData } = useQuery({
    queryKey: ['config_logo'],
    queryFn: async () => {
      const items = await appClient.entities.Convenio.filter({ anio: 0 });
      return items[0] || null;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const logoUrl = configData?.logo_url || null;

  const guardarLogoDB = useMutation({
    mutationFn: async (url) => {
      const existing = await appClient.entities.Convenio.filter({ anio: 0 });
      if (existing.length > 0) {
        return appClient.entities.Convenio.update(existing[0].id, { logo_url: url });
      } else {
        return appClient.entities.Convenio.create({ anio: 0, logo_url: url });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['config_logo'] }),
  });

  const subirLogo = async (file) => {
    if (!file) return;
    setUploading(true);
    const { file_url } = await appClient.integrations.Core.UploadFile({ file });
    await guardarLogoDB.mutateAsync(file_url);
    setUploading(false);
  };

  const quitarLogo = async () => {
    await guardarLogoDB.mutateAsync(null);
  };

  return { logoUrl, subirLogo, quitarLogo, uploading };
}