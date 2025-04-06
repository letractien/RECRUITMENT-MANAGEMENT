// Mock data for development purposes
import { faker } from '@faker-js/faker';

// Helper functions to generate random data
const generateRandomId = () => Math.floor(Math.random() * 10000) + 1;

const generateRandomDate = (start = new Date(2023, 0, 1), end = new Date()) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

const randomStatus = () => {
  const statuses = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

const randomDepartment = () => {
  const departments = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'HR', 'Finance'];
  return departments[Math.floor(Math.random() * departments.length)];
};

const randomJobTitle = (department) => {
  const titles = {
    Engineering: ['Frontend Developer', 'Backend Engineer', 'DevOps Engineer', 'Full Stack Developer', 'Mobile Developer'],
    Product: ['Product Manager', 'Product Owner', 'Business Analyst', 'Product Analyst'],
    Design: ['UX Designer', 'UI Designer', 'Graphic Designer', 'Product Designer'],
    Marketing: ['Marketing Specialist', 'Content Writer', 'SEO Specialist', 'Social Media Manager'],
    Sales: ['Sales Representative', 'Account Executive', 'Sales Manager', 'Business Development'],
    HR: ['HR Specialist', 'Recruiter', 'HR Manager', 'Talent Acquisition'],
    Finance: ['Financial Analyst', 'Accountant', 'Finance Manager', 'Payroll Specialist']
  };
  
  const deptTitles = titles[department] || titles.Engineering;
  return deptTitles[Math.floor(Math.random() * deptTitles.length)];
};

const randomLocation = () => {
  const locations = [
    'San Francisco, CA', 
    'New York, NY', 
    'Seattle, WA', 
    'Austin, TX', 
    'Remote', 
    'Boston, MA', 
    'Chicago, IL'
  ];
  return locations[Math.floor(Math.random() * locations.length)];
};

const randomSalary = () => {
  const base = Math.floor(Math.random() * 50) + 70; // 70k-120k base
  const ceiling = base + Math.floor(Math.random() * 30) + 10; // 10-40k range
  return `$${base},000 - $${ceiling},000`;
};

// Generate random candidates
export const generateCandidates = (count = 5) => {
  const candidates = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const department = randomDepartment();
    
    candidates.push({
      id: generateRandomId(),
      name: `${firstName} ${lastName}`,
      email: faker.internet.email({ firstName, lastName }),
      phone: faker.phone.number(),
      position: randomJobTitle(department),
      department,
      status: randomStatus(),
      appliedDate: formatDate(generateRandomDate()),
      resume: `https://example.com/resumes/${firstName.toLowerCase()}-${lastName.toLowerCase()}.pdf`,
      photo: faker.image.avatar(),
      notes: faker.lorem.sentence()
    });
  }
  
  return candidates;
};

// Generate random jobs
export const generateJobs = (count = 5) => {
  const jobs = [];
  
  for (let i = 0; i < count; i++) {
    const department = randomDepartment();
    const title = randomJobTitle(department);
    
    jobs.push({
      id: generateRandomId(),
      title,
      department,
      location: randomLocation(),
      type: Math.random() > 0.2 ? 'Full-time' : 'Part-time',
      status: Math.random() > 0.3 ? 'active' : 'filled',
      description: faker.lorem.paragraph(),
      requirements: faker.lorem.sentences(2),
      postedDate: formatDate(generateRandomDate()),
      applicants: Math.floor(Math.random() * 50) + 5,
      interviews: Math.floor(Math.random() * 10) + 1,
      salary: randomSalary()
    });
  }
  
  return jobs;
};

// Generate random interviews
export const generateInterviews = (candidatesList, jobsList, count = 5) => {
  const interviews = [];
  const interviewTypes = ['Technical', 'Cultural Fit', 'Behavioral', 'Initial Screening', 'Final'];
  const interviewStatuses = ['scheduled', 'completed', 'cancelled', 'pending'];
  
  for (let i = 0; i < count; i++) {
    // Use provided candidates and jobs or generate random IDs
    const candidate = candidatesList && candidatesList.length > 0 
      ? candidatesList[Math.floor(Math.random() * candidatesList.length)]
      : { id: generateRandomId(), name: `${faker.person.firstName()} ${faker.person.lastName()}` };
      
    const job = jobsList && jobsList.length > 0
      ? jobsList[Math.floor(Math.random() * jobsList.length)]
      : { id: generateRandomId(), title: randomJobTitle(randomDepartment()) };
    
    const scheduledAt = generateRandomDate();
    
    interviews.push({
      id: generateRandomId(),
      candidateId: candidate.id,
      candidateName: candidate.name,
      jobId: job.id,
      jobTitle: job.title,
      scheduledAt: scheduledAt.toISOString(),
      duration: [30, 45, 60][Math.floor(Math.random() * 3)],
      interviewers: [
        faker.person.fullName(),
        Math.random() > 0.5 ? faker.person.fullName() : null
      ].filter(Boolean),
      type: interviewTypes[Math.floor(Math.random() * interviewTypes.length)],
      status: interviewStatuses[Math.floor(Math.random() * interviewStatuses.length)],
      location: Math.random() > 0.7 
        ? 'Office - Meeting Room ' + Math.floor(Math.random() * 5 + 1)
        : 'Video Call - ' + ['Zoom', 'Google Meet', 'Microsoft Teams'][Math.floor(Math.random() * 3)],
      notes: faker.lorem.sentences(2)
    });
  }
  
  return interviews;
};

// Default data sets - Pre-generated for immediate use
export const candidates = generateCandidates(8);
export const jobs = generateJobs(10);
export const interviews = generateInterviews(candidates, jobs, 15); 