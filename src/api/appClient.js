const STORAGE_KEYS = {
  users: 'pharma_local_users',
  currentUserId: 'pharma_local_current_user_id',
  convenio: 'pharma_local_convenio',
  logs: 'pharma_local_app_logs'
};

const defaultAdmin = {
  id: 'local-admin',
  email: 'admin@local',
  full_name: 'Administrador Local',
  role: 'admin',
  empleado_id: null
};

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const getLocalStorage = () => (typeof window === 'undefined' ? null : window.localStorage);

const readJson = (key, fallback) => {
  const storage = getLocalStorage();
  if (!storage) return fallback;
  return safeParse(storage.getItem(key), fallback);
};

const writeJson = (key, value) => {
  const storage = getLocalStorage();
  if (!storage) return;
  storage.setItem(key, JSON.stringify(value));
};

const ensureLocalUserState = () => {
  const storage = getLocalStorage();
  if (!storage) return [defaultAdmin];

  let users = safeParse(storage.getItem(STORAGE_KEYS.users), []);
  if (!Array.isArray(users) || users.length === 0) {
    users = [defaultAdmin];
    writeJson(STORAGE_KEYS.users, users);
  }

  const currentUserId = storage.getItem(STORAGE_KEYS.currentUserId);
  if (!currentUserId) {
    storage.setItem(STORAGE_KEYS.currentUserId, users[0].id);
  }

  return users;
};

const getCurrentUser = () => {
  const storage = getLocalStorage();
  if (!storage) return defaultAdmin;

  const users = ensureLocalUserState();
  const currentUserId = storage.getItem(STORAGE_KEYS.currentUserId);
  const current = users.find(user => user.id === currentUserId);
  return current || users[0];
};

const getNextId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const ensureConvenioState = () => {
  const storage = getLocalStorage();
  if (!storage) return [];
  const convenio = safeParse(storage.getItem(STORAGE_KEYS.convenio), []);
  if (!Array.isArray(convenio)) {
    writeJson(STORAGE_KEYS.convenio, []);
    return [];
  }
  return convenio;
};

export const appClient = {
  auth: {
    me: async () => {
      const storage = getLocalStorage();
      if (!storage) return defaultAdmin;
      ensureLocalUserState();
      const current = getCurrentUser();
      if (!current) {
        throw new Error('No authenticated user');
      }
      return current;
    },
    logout: (redirectUrl) => {
      const storage = getLocalStorage();
      if (!storage) return;
      storage.removeItem(STORAGE_KEYS.currentUserId);
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        window.location.reload();
      }
    },
    redirectToLogin: (redirectUrl) => {
      const storage = getLocalStorage();
      if (!storage) return;
      storage.removeItem(STORAGE_KEYS.currentUserId);
      window.location.href = redirectUrl || '/';
    }
  },
  users: {
    inviteUser: async (email, role = 'user') => {
      const storage = getLocalStorage();
      if (!storage) throw new Error('Local storage not available');
      const users = ensureLocalUserState();
      const normalized = String(email || '').trim().toLowerCase();
      if (!normalized) throw new Error('Email is required');
      if (users.some(u => u.email.toLowerCase() === normalized)) {
        throw new Error(`El usuario ${email} ya existe`);
      }
      const nuevo = {
        id: getNextId(),
        email: normalized,
        full_name: String(email).split('@')[0],
        role,
        empleado_id: null
      };
      const next = [...users, nuevo];
      writeJson(STORAGE_KEYS.users, next);
      return nuevo;
    }
  },
  entities: {
    User: {
      list: async () => {
        return ensureLocalUserState();
      },
      update: async (id, data) => {
        const users = ensureLocalUserState();
        const index = users.findIndex(user => user.id === id);
        if (index === -1) throw new Error(`Usuario con id ${id} no encontrado`);
        const updated = { ...users[index], ...data };
        users[index] = updated;
        writeJson(STORAGE_KEYS.users, users);
        return updated;
      }
    },
    Convenio: {
      filter: async (query = {}) => {
        const convenio = ensureConvenioState();
        if (!query || Object.keys(query).length === 0) return convenio;
        return convenio.filter(item =>
          Object.entries(query).every(([key, value]) => item[key] === value)
        );
      },
      update: async (id, data) => {
        const convenio = ensureConvenioState();
        const index = convenio.findIndex(item => item.id === id);
        if (index === -1) throw new Error(`Convenio con id ${id} no encontrado`);
        const updated = { ...convenio[index], ...data };
        convenio[index] = updated;
        writeJson(STORAGE_KEYS.convenio, convenio);
        return updated;
      },
      create: async (data) => {
        const convenio = ensureConvenioState();
        const nuevo = { id: getNextId(), ...data };
        const next = [...convenio, nuevo];
        writeJson(STORAGE_KEYS.convenio, next);
        return nuevo;
      },
      subscribe: () => {
        return () => {};
      }
    }
  },
  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        if (!file) return { file_url: null };
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve({ file_url: reader.result });
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }
    }
  },
  appLogs: {
    logUserInApp: async (pageName) => {
      const storage = getLocalStorage();
      if (!storage) return null;
      const existing = safeParse(storage.getItem(STORAGE_KEYS.logs), []);
      const next = [...existing, { pageName, timestamp: new Date().toISOString() }];
      writeJson(STORAGE_KEYS.logs, next);
      return next;
    }
  }
};
