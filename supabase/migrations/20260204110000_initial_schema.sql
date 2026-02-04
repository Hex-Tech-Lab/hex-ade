-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  path VARCHAR(1024) NOT NULL,
  has_spec BOOLEAN DEFAULT FALSE,
  default_concurrency INT DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  CONSTRAINT concurrency_range CHECK (default_concurrency BETWEEN 1 AND 5)
);

-- Features table
CREATE TABLE IF NOT EXISTS features (
  id BIGSERIAL PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'FUNCTIONAL',
  priority INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  passes BOOLEAN DEFAULT FALSE,
  in_progress BOOLEAN DEFAULT FALSE,
  steps JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_status CHECK (status IN ('pending', 'in_progress', 'complete', 'blocked')),
  CONSTRAINT valid_category CHECK (category IN ('FUNCTIONAL', 'UI', 'API', 'DB', 'DOCS', 'TEST', 'DEVOPS'))
);

-- Tasks table (execution history)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  feature_id BIGINT REFERENCES features(id) ON DELETE SET NULL,
  task_description TEXT NOT NULL,
  complexity VARCHAR(50),
  role VARCHAR(50),
  bias VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  result JSONB,
  duration_seconds INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  executed_at TIMESTAMP WITH TIME ZONE
);

-- Agent logs table
CREATE TABLE IF NOT EXISTS agent_logs (
  id BIGSERIAL PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  agent_name VARCHAR(255),
  log_level VARCHAR(20),
  message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_features_project ON features(project_id);
CREATE INDEX IF NOT EXISTS idx_features_status ON features(status);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_project ON agent_logs(project_id, created_at DESC);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Projects policies
CREATE POLICY "Projects are viewable by creator"
  ON projects FOR SELECT
  USING (created_by = auth.uid() OR created_by IS NULL);

CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = created_by OR created_by IS NULL);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (created_by = auth.uid() OR created_by IS NULL);

-- Features policies
CREATE POLICY "Features are viewable by everyone"
  ON features FOR SELECT
  USING (TRUE);

CREATE POLICY "Features can be managed by project owners"
  ON features FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = features.project_id
      AND (projects.created_by = auth.uid() OR projects.created_by IS NULL)
    )
  );

-- Tasks policies
CREATE POLICY "Tasks are viewable by everyone"
  ON tasks FOR SELECT
  USING (TRUE);

CREATE POLICY "Tasks can be managed by project owners"
  ON tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tasks.project_id
      AND (projects.created_by = auth.uid() OR projects.created_by IS NULL)
    )
  );

-- Agent logs policies
CREATE POLICY "Logs are viewable by everyone"
  ON agent_logs FOR SELECT
  USING (TRUE);

CREATE POLICY "Logs can be managed by project owners"
  ON agent_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = agent_logs.project_id
      AND (projects.created_by = auth.uid() OR projects.created_by IS NULL)
    )
  );
