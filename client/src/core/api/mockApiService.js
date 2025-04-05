import { candidates, jobs, interviews, dashboardData } from '../../utils/mockData';

// Helper to simulate API delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to generate a random ID
const generateId = () => Math.floor(Math.random() * 10000) + 10000;

// Mock API service
const mockApiService = {
  // Candidates
  getAllCandidates: async () => {
    await delay();
    return { data: candidates };
  },

  getCandidate: async (id) => {
    await delay();
    const candidate = candidates.find(c => c.id === parseInt(id));
    
    if (!candidate) {
      throw new Error(`Candidate with ID ${id} not found`);
    }
    
    return { data: candidate };
  },

  createCandidate: async (candidateData) => {
    await delay();
    const newCandidate = {
      id: generateId(),
      ...candidateData,
      appliedDate: new Date().toISOString().split('T')[0]
    };
    
    return { data: newCandidate };
  },

  updateCandidate: async (id, candidateData) => {
    await delay();
    const candidate = candidates.find(c => c.id === parseInt(id));
    
    if (!candidate) {
      throw new Error(`Candidate with ID ${id} not found`);
    }
    
    const updatedCandidate = { ...candidate, ...candidateData };
    return { data: updatedCandidate };
  },

  deleteCandidate: async (id) => {
    await delay();
    const candidate = candidates.find(c => c.id === parseInt(id));
    
    if (!candidate) {
      throw new Error(`Candidate with ID ${id} not found`);
    }
    
    return { data: { success: true, message: 'Candidate deleted successfully' } };
  },

  updateCandidateStatus: async (id, status) => {
    await delay();
    const candidate = candidates.find(c => c.id === parseInt(id));
    
    if (!candidate) {
      throw new Error(`Candidate with ID ${id} not found`);
    }
    
    const updatedCandidate = { ...candidate, status };
    return { data: updatedCandidate };
  },

  searchCandidates: async (params) => {
    await delay();
    let filteredCandidates = [...candidates];
    
    if (params.status) {
      filteredCandidates = filteredCandidates.filter(c => c.status === params.status);
    }
    
    if (params.department) {
      filteredCandidates = filteredCandidates.filter(c => c.department === params.department);
    }
    
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredCandidates = filteredCandidates.filter(c => 
        c.name.toLowerCase().includes(searchLower) ||
        c.email.toLowerCase().includes(searchLower) ||
        c.position.toLowerCase().includes(searchLower)
      );
    }
    
    return { data: filteredCandidates };
  },

  getCandidateInterviews: async (id) => {
    await delay();
    const candidateInterviews = interviews.filter(i => i.candidateId === parseInt(id));
    return { data: candidateInterviews };
  },

  // Jobs
  getAllJobs: async () => {
    await delay();
    return { data: jobs };
  },

  getJob: async (id) => {
    await delay();
    const job = jobs.find(j => j.id === parseInt(id));
    
    if (!job) {
      throw new Error(`Job with ID ${id} not found`);
    }
    
    return { data: job };
  },

  createJob: async (jobData) => {
    await delay();
    const newJob = {
      id: generateId(),
      ...jobData,
      postedDate: new Date().toISOString().split('T')[0],
      applicants: 0,
      interviews: 0
    };
    
    return { data: newJob };
  },

  updateJob: async (id, jobData) => {
    await delay();
    const job = jobs.find(j => j.id === parseInt(id));
    
    if (!job) {
      throw new Error(`Job with ID ${id} not found`);
    }
    
    const updatedJob = { ...job, ...jobData };
    return { data: updatedJob };
  },

  deleteJob: async (id) => {
    await delay();
    const job = jobs.find(j => j.id === parseInt(id));
    
    if (!job) {
      throw new Error(`Job with ID ${id} not found`);
    }
    
    return { data: { success: true, message: 'Job deleted successfully' } };
  },

  updateJobStatus: async (id, status) => {
    await delay();
    const job = jobs.find(j => j.id === parseInt(id));
    
    if (!job) {
      throw new Error(`Job with ID ${id} not found`);
    }
    
    const updatedJob = { ...job, status };
    return { data: updatedJob };
  },

  searchJobs: async (params) => {
    await delay();
    let filteredJobs = [...jobs];
    
    if (params.status) {
      filteredJobs = filteredJobs.filter(j => j.status === params.status);
    }
    
    if (params.department) {
      filteredJobs = filteredJobs.filter(j => j.department === params.department);
    }
    
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredJobs = filteredJobs.filter(j => 
        j.title.toLowerCase().includes(searchLower) ||
        j.description.toLowerCase().includes(searchLower) ||
        j.department.toLowerCase().includes(searchLower)
      );
    }
    
    return { data: filteredJobs };
  },

  getJobApplicants: async (id) => {
    await delay();
    const jobApplicants = candidates.filter(c => c.position === jobs.find(j => j.id === parseInt(id))?.title);
    return { data: jobApplicants };
  },

  getJobsByDepartment: async (department) => {
    await delay();
    const departmentJobs = jobs.filter(j => j.department === department);
    return { data: departmentJobs };
  },

  // Interviews
  getAllInterviews: async () => {
    await delay();
    return { data: interviews };
  },

  getInterview: async (id) => {
    await delay();
    const interview = interviews.find(i => i.id === parseInt(id));
    
    if (!interview) {
      throw new Error(`Interview with ID ${id} not found`);
    }
    
    return { data: interview };
  },

  createInterview: async (interviewData) => {
    await delay();
    const newInterview = {
      id: generateId(),
      ...interviewData
    };
    
    return { data: newInterview };
  },

  updateInterview: async (id, interviewData) => {
    await delay();
    const interview = interviews.find(i => i.id === parseInt(id));
    
    if (!interview) {
      throw new Error(`Interview with ID ${id} not found`);
    }
    
    const updatedInterview = { ...interview, ...interviewData };
    return { data: updatedInterview };
  },

  deleteInterview: async (id) => {
    await delay();
    const interview = interviews.find(i => i.id === parseInt(id));
    
    if (!interview) {
      throw new Error(`Interview with ID ${id} not found`);
    }
    
    return { data: { success: true, message: 'Interview deleted successfully' } };
  },

  updateInterviewStatus: async (id, status) => {
    await delay();
    const interview = interviews.find(i => i.id === parseInt(id));
    
    if (!interview) {
      throw new Error(`Interview with ID ${id} not found`);
    }
    
    const updatedInterview = { ...interview, status };
    return { data: updatedInterview };
  },

  getInterviewsByDateRange: async (startDate, endDate) => {
    await delay();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const filteredInterviews = interviews.filter(i => {
      const interviewDate = new Date(i.scheduledAt);
      return interviewDate >= start && interviewDate <= end;
    });
    
    return { data: filteredInterviews };
  },

  getUpcomingInterviews: async () => {
    await delay();
    const now = new Date();
    
    const upcomingInterviews = interviews
      .filter(i => new Date(i.scheduledAt) > now && i.status !== 'cancelled')
      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
      
    return { data: upcomingInterviews };
  },

  getInterviewsByCandidate: async (candidateId) => {
    await delay();
    const candidateInterviews = interviews.filter(i => i.candidateId === parseInt(candidateId));
    return { data: candidateInterviews };
  },

  getInterviewsByJob: async (jobId) => {
    await delay();
    const jobInterviews = interviews.filter(i => i.jobId === parseInt(jobId));
    return { data: jobInterviews };
  },

  // Dashboard
  getDashboardData: async (timeRange = 'month') => {
    await delay();
    // For demo, we don't filter by time range but in a real app, we would
    return { data: dashboardData };
  },

  getStats: async (timeRange = 'month') => {
    await delay();
    return { data: dashboardData.stats };
  },

  getRecentActivity: async (limit = 10) => {
    await delay();
    return { data: dashboardData.recentActivity.slice(0, limit) };
  },

  getJobsByDepartmentStats: async (timeRange = 'month') => {
    await delay();
    return { data: dashboardData.jobsByDepartment };
  },

  getHiringFunnel: async (timeRange = 'month') => {
    await delay();
    return { data: dashboardData.hiringFunnel };
  },

  getApplicationTrend: async (timeRange = 'month') => {
    await delay();
    return { data: dashboardData.applicationTrend };
  }
};

export default mockApiService; 