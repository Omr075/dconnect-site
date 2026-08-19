CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT,
    email TEXT,
    phone TEXT,
    password TEXT,
    provider TEXT,
    google_id TEXT,
    avatar TEXT,
    apikey TEXT,
    requests INTEGER DEFAULT 0,
    plan TEXT DEFAULT 'Free',
    status TEXT,
    suspended_at INTEGER,
    suspension_until INTEGER,
    suspension_reason TEXT,
    created_at TEXT
);

CREATE TABLE IF NOT EXISTS password_resets (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    phone TEXT NOT NULL,
    code TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    resend_at INTEGER NOT NULL,
    used INTEGER DEFAULT 0,
    used_at INTEGER
);


CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'Pendente',
    created_at TEXT NOT NULL
);


CREATE TABLE IF NOT EXISTS admin_sessions (
    token TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
);


CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    apikey TEXT,
    endpoint TEXT,
    query TEXT,
    prompt TEXT,
    provider TEXT,
    date TEXT NOT NULL
);


CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY,
    type TEXT NOT NULL,
    category TEXT DEFAULT 'register',
    source TEXT DEFAULT 'system',
    target TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    attempts INTEGER DEFAULT 0,
    created_at TEXT,
    sent_at TEXT,
    failed_at TEXT
);
