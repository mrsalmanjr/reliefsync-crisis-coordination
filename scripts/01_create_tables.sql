-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  category VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL,
  people_affected INTEGER DEFAULT 0,
  ai_analysis JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create volunteers table
CREATE TABLE IF NOT EXISTS volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  skills TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  availability BOOLEAN DEFAULT true,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  assigned_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(report_id, volunteer_id)
);

-- Create indexes for performance
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_priority ON reports(priority);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_volunteers_user_id ON volunteers(user_id);
CREATE INDEX idx_volunteers_availability ON volunteers(availability);
CREATE INDEX idx_assignments_report_id ON assignments(report_id);
CREATE INDEX idx_assignments_volunteer_id ON assignments(volunteer_id);
CREATE INDEX idx_assignments_status ON assignments(status);

-- Enable RLS (Row Level Security)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reports
CREATE POLICY "Users can view all reports" ON reports FOR SELECT USING (true);
CREATE POLICY "Users can create reports" ON reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reports" ON reports FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for volunteers
CREATE POLICY "Users can view all volunteers" ON volunteers FOR SELECT USING (true);
CREATE POLICY "Users can create volunteer profile" ON volunteers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own volunteer profile" ON volunteers FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for assignments
CREATE POLICY "Users can view all assignments" ON assignments FOR SELECT USING (true);
CREATE POLICY "Users can create assignments" ON assignments FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM reports WHERE id = report_id));
CREATE POLICY "Users can update assignments" ON assignments FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM reports WHERE id = report_id));
