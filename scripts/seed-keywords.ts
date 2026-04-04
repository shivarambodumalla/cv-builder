/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const KEYWORDS = [
  // --- DESIGN ---
  {
    role: "UX Designer",
    required: ["User Research","Wireframing","Prototyping","Figma","Usability Testing","Information Architecture","Interaction Design","User Flows"],
    important: ["Design Systems","Accessibility","A/B Testing","Sketch","InVision","Adobe XD","Journey Mapping","Personas","Heuristic Evaluation"],
    nice_to_have: ["HTML","CSS","Motion Design","Framer","Principle","Miro"],
    synonym_map: {"Figma":["Figma Cloud"],"User Research":["UX Research","User Studies"],"Prototyping":["Prototype","Interactive Prototype"],"Usability Testing":["User Testing","UT Sessions"]},
  },
  {
    role: "Product Designer",
    required: ["Figma","Prototyping","User Research","Interaction Design","Visual Design","Wireframing","Design Systems","Cross-functional Collaboration"],
    important: ["Accessibility","A/B Testing","Data-driven Design","Component Libraries","Responsive Design","Mobile Design","Web Design","Stakeholder Management"],
    nice_to_have: ["Framer","Motion Design","HTML","CSS","React","Design Tokens","Storybook"],
    synonym_map: {"Figma":["Figma Cloud"],"Design Systems":["Design System","Component Library"],"Cross-functional Collaboration":["Cross-functional","XFN"]},
  },
  {
    role: "Design Manager",
    required: ["Team Leadership","Design Strategy","Figma","Stakeholder Management","Design Systems","Mentoring","Roadmap Planning","Cross-functional Collaboration"],
    important: ["UX Research","Accessibility","Agile","Design Critique","Hiring","OKRs","Product Strategy","Executive Communication","Workshop Facilitation"],
    nice_to_have: ["Design Ops","Budget Management","Vendor Management","Data Analysis","SQL"],
    synonym_map: {"Team Leadership":["People Management","Team Management"],"Stakeholder Management":["Stakeholder Engagement"],"Mentoring":["Coaching","Mentorship"],"Cross-functional Collaboration":["Cross-functional","XFN"]},
  },
  {
    role: "Principal Designer",
    required: ["Design Strategy","Design Systems","Figma","Stakeholder Management","Cross-functional Collaboration","Mentoring","UX Research","Product Strategy"],
    important: ["Accessibility","Design Leadership","OKRs","Executive Communication","Design Critique","Workshop Facilitation","Agile","Design Ops"],
    nice_to_have: ["Design Tokens","Framer","Data Analysis","HTML","CSS","React"],
    synonym_map: {"Design Strategy":["Strategic Design"],"Design Systems":["Design System","Component Library"],"Mentoring":["Coaching","Mentorship"],"Cross-functional Collaboration":["Cross-functional","XFN"]},
  },
  {
    role: "Head of Design",
    required: ["Design Leadership","Design Strategy","Team Building","Stakeholder Management","Product Strategy","Design Systems","Roadmap Planning","Executive Communication"],
    important: ["OKRs","Hiring","Budget Management","Design Ops","Accessibility","Brand Strategy","Agile","Workshop Facilitation"],
    nice_to_have: ["Venture Capital","Go-to-market","Data Analysis","SQL","Figma"],
    synonym_map: {"Design Leadership":["Design Lead","Leading Design"],"Team Building":["Team Management","People Management"]},
  },
  {
    role: "Design Lead",
    required: ["Figma","Design Systems","Prototyping","User Research","Mentoring","Stakeholder Management","Cross-functional Collaboration","Visual Design"],
    important: ["Accessibility","Interaction Design","Component Libraries","Agile","Design Critique","Mobile Design","Responsive Design"],
    nice_to_have: ["Motion Design","Framer","HTML","CSS"],
    synonym_map: {"Mentoring":["Coaching","Mentorship"],"Design Systems":["Design System","Component Library"]},
  },
  {
    role: "UX Researcher",
    required: ["User Research","Usability Testing","Research Planning","Interview Facilitation","Survey Design","Synthesis","Personas","Journey Mapping"],
    important: ["Quantitative Research","A/B Testing","Card Sorting","Tree Testing","Diary Studies","Eye Tracking","Stakeholder Management"],
    nice_to_have: ["SQL","Python","Data Analysis","Figma","Miro","Dovetail"],
    synonym_map: {"User Research":["UX Research","User Studies"],"Usability Testing":["User Testing","UT"]},
  },
  // --- ENGINEERING ---
  {
    role: "Frontend Engineer",
    required: ["React","JavaScript","TypeScript","HTML","CSS","REST APIs","Git","Responsive Design"],
    important: ["Next.js","Redux","Testing","Webpack","Performance Optimization","Accessibility","GraphQL","CI/CD"],
    nice_to_have: ["Vue.js","Angular","React Native","Storybook","Design Systems","Docker"],
    synonym_map: {"React":["React.js","ReactJS"],"JavaScript":["JS","Javascript"],"TypeScript":["TS"],"REST APIs":["REST","RESTful APIs","API integration"],"Git":["Github","Gitlab","Version Control"]},
  },
  {
    role: "Backend Engineer",
    required: ["Node.js","REST APIs","SQL","Git","Database Design","Authentication","API Design"],
    important: ["PostgreSQL","Docker","AWS","Redis","GraphQL","Microservices","CI/CD","Testing","Message Queues","Security"],
    nice_to_have: ["Kubernetes","MongoDB","Elasticsearch","gRPC","Kafka","Terraform"],
    synonym_map: {"Node.js":["Node","NodeJS"],"PostgreSQL":["Postgres","PSQL"],"AWS":["Amazon Web Services"],"REST APIs":["REST","RESTful APIs"],"SQL":["MySQL","SQLite"]},
  },
  {
    role: "Full Stack Engineer",
    required: ["React","Node.js","JavaScript","TypeScript","REST APIs","SQL","Git","HTML","CSS"],
    important: ["PostgreSQL","Docker","AWS","Next.js","GraphQL","CI/CD","Testing","Redis"],
    nice_to_have: ["Kubernetes","MongoDB","Vue.js","React Native","Terraform","Microservices"],
    synonym_map: {"React":["React.js","ReactJS"],"Node.js":["Node","NodeJS"],"JavaScript":["JS","Javascript"],"TypeScript":["TS"],"PostgreSQL":["Postgres","PSQL"]},
  },
  {
    role: "DevOps Engineer",
    required: ["Docker","Kubernetes","CI/CD","AWS","Linux","Git","Infrastructure as Code","Monitoring"],
    important: ["Terraform","Ansible","Jenkins","GitHub Actions","Prometheus","Grafana","Security","Networking"],
    nice_to_have: ["GCP","Azure","Helm","ArgoCD","Service Mesh","FinOps"],
    synonym_map: {"AWS":["Amazon Web Services"],"Infrastructure as Code":["IaC","Terraform"],"CI/CD":["Continuous Integration","Continuous Deployment"]},
  },
  {
    role: "ML Engineer",
    required: ["Python","Machine Learning","TensorFlow","PyTorch","SQL","Data Pipelines","Git","Statistical Modeling"],
    important: ["MLOps","AWS","Docker","Spark","Feature Engineering","Model Deployment","Deep Learning","NLP"],
    nice_to_have: ["Kubernetes","Airflow","dbt","Computer Vision","Reinforcement Learning","Rust"],
    synonym_map: {"Machine Learning":["ML"],"TensorFlow":["TF"],"PyTorch":["Torch"],"Natural Language Processing":["NLP"],"Python":["Python3"]},
  },
  // --- PRODUCT ---
  {
    role: "Product Manager",
    required: ["Product Strategy","Roadmap Planning","Stakeholder Management","User Research","Agile","Cross-functional Collaboration","Prioritization","Data Analysis"],
    important: ["SQL","A/B Testing","OKRs","Jira","Product Metrics","Go-to-market","Customer Discovery","Competitive Analysis","PRDs"],
    nice_to_have: ["Figma","Python","Growth","Pricing Strategy","API Knowledge"],
    synonym_map: {"Roadmap Planning":["Product Roadmap","Roadmapping"],"Agile":["Scrum","Kanban"],"Cross-functional Collaboration":["Cross-functional","XFN"],"PRDs":["Product Requirements","Product Specs"]},
  },
  {
    role: "Senior Product Manager",
    required: ["Product Strategy","Roadmap Planning","Stakeholder Management","Data Analysis","OKRs","Cross-functional Leadership","Go-to-market","Customer Discovery"],
    important: ["SQL","A/B Testing","Executive Communication","Hiring","Mentoring","Competitive Analysis","Pricing Strategy","Platform Strategy"],
    nice_to_have: ["Python","Figma","VC Fundraising","International Expansion","API Knowledge"],
    synonym_map: {"Cross-functional Leadership":["Cross-functional","XFN"],"OKRs":["Goals","KPIs","Metrics"]},
  },
  // --- DATA ---
  {
    role: "Data Analyst",
    required: ["SQL","Excel","Data Visualization","Python","Statistical Analysis","Dashboard Creation","Data Cleaning","Reporting"],
    important: ["Tableau","Power BI","Google Analytics","A/B Testing","Business Intelligence","Stakeholder Communication","Looker"],
    nice_to_have: ["R","dbt","Airflow","Spark","Machine Learning","BigQuery"],
    synonym_map: {"SQL":["MySQL","PostgreSQL","BigQuery"],"Python":["Python3"],"Data Visualization":["Data Viz","Dashboards"],"Excel":["Google Sheets","Spreadsheets"]},
  },
  {
    role: "Data Scientist",
    required: ["Python","Machine Learning","SQL","Statistical Modeling","Data Analysis","Feature Engineering","Git","Experimentation"],
    important: ["TensorFlow","PyTorch","Spark","A/B Testing","NLP","Deep Learning","Data Pipelines","AWS"],
    nice_to_have: ["R","Scala","Airflow","dbt","Computer Vision","Reinforcement Learning"],
    synonym_map: {"Machine Learning":["ML"],"Python":["Python3"],"Statistical Modeling":["Statistics","Statistical Analysis"]},
  },
  // --- MARKETING ---
  {
    role: "Product Marketing Manager",
    required: ["Go-to-market","Positioning","Messaging","Product Launches","Competitive Analysis","Stakeholder Management","Content Strategy","Sales Enablement"],
    important: ["SEO","Demand Generation","Customer Research","Pricing Strategy","Cross-functional Collaboration","Analytics","CRM"],
    nice_to_have: ["SQL","Figma","Paid Advertising","Email Marketing","Webinars"],
    synonym_map: {"Go-to-market":["GTM","Go to Market"],"Sales Enablement":["Sales Support","Sales Tools"]},
  },
  {
    role: "Growth Marketer",
    required: ["Growth Strategy","A/B Testing","Analytics","Paid Advertising","SEO","Email Marketing","Conversion Optimization","Data Analysis"],
    important: ["SQL","Google Analytics","Facebook Ads","Google Ads","Marketing Automation","CRM","Landing Pages","Funnel Optimization"],
    nice_to_have: ["Python","dbt","Looker","Referral Programs","Viral Loops"],
    synonym_map: {"Conversion Optimization":["CRO","Conversion Rate Optimization"],"A/B Testing":["Split Testing","Experimentation"]},
  },
  // --- SALES ---
  {
    role: "Account Executive",
    required: ["B2B Sales","Pipeline Management","Closing","Negotiation","CRM","Prospecting","Stakeholder Management","Quota Attainment"],
    important: ["Salesforce","Cold Outreach","Discovery Calls","Contract Management","Sales Forecasting","Cross-selling","Upselling"],
    nice_to_have: ["SQL","Outreach","SalesLoft","LinkedIn Sales Navigator","Enterprise Sales"],
    synonym_map: {"CRM":["Salesforce","HubSpot"],"B2B Sales":["Enterprise Sales","SaaS Sales"],"Quota Attainment":["Quota Achievement","Revenue Target"]},
  },
  {
    role: "Customer Success Manager",
    required: ["Customer Onboarding","Retention","NPS","Stakeholder Management","Upselling","CRM","Account Management","Churn Reduction"],
    important: ["Salesforce","Data Analysis","Renewal Management","Executive Business Reviews","Product Feedback","Cross-functional Collaboration"],
    nice_to_have: ["SQL","Gainsight","Totango","Customer Marketing","Community Building"],
    synonym_map: {"NPS":["Net Promoter Score","Customer Satisfaction"],"Churn Reduction":["Retention","Churn Prevention"]},
  },
  // --- OPERATIONS ---
  {
    role: "Project Manager",
    required: ["Project Planning","Stakeholder Management","Risk Management","Agile","Jira","Budget Management","Cross-functional Collaboration","Reporting"],
    important: ["PMP","Scrum","Kanban","Resource Planning","Change Management","Executive Communication","Vendor Management"],
    nice_to_have: ["SQL","Power BI","Tableau","Six Sigma","Prince2"],
    synonym_map: {"Agile":["Scrum","Kanban"],"Jira":["Asana","Monday.com","Project Management Tools"],"PMP":["Project Management Professional"]},
  },
  {
    role: "Business Analyst",
    required: ["Requirements Gathering","Process Mapping","Stakeholder Management","Data Analysis","SQL","Documentation","Gap Analysis","Excel"],
    important: ["Agile","JIRA","Power BI","Tableau","UAT","Business Process Improvement","Functional Specifications"],
    nice_to_have: ["Python","Visio","Six Sigma","ERP Systems","Salesforce"],
    synonym_map: {"Requirements Gathering":["Business Requirements","BRD"],"Process Mapping":["Process Documentation","Process Design"],"UAT":["User Acceptance Testing"]},
  },
  // --- HR ---
  {
    role: "HR Business Partner",
    required: ["Employee Relations","Performance Management","Stakeholder Management","Talent Management","HR Strategy","Change Management","Compensation & Benefits","Compliance"],
    important: ["HRIS","Recruiting","L&D","Organisational Design","Workforce Planning","Executive Coaching","Data Analysis"],
    nice_to_have: ["SQL","Workday","BambooHR","Employment Law","DEI Programs"],
    synonym_map: {"HRIS":["Workday","BambooHR","HR Systems"],"L&D":["Learning and Development","Training"],"DEI":["Diversity Equity Inclusion"]},
  },
  {
    role: "Recruiter",
    required: ["Sourcing","Candidate Assessment","ATS","Stakeholder Management","Job Description Writing","Interview Coordination","Offer Management","Pipeline Management"],
    important: ["LinkedIn Recruiter","Boolean Search","Employer Branding","Diversity Hiring","Technical Recruiting","Compensation Benchmarking"],
    nice_to_have: ["SQL","Data Analysis","Greenhouse","Lever","Workday","Campus Recruiting"],
    synonym_map: {"ATS":["Applicant Tracking System","Greenhouse","Lever"],"Sourcing":["Talent Sourcing","Candidate Sourcing"]},
  },
  // --- FINANCE ---
  {
    role: "Financial Analyst",
    required: ["Financial Modeling","Excel","Data Analysis","Budgeting","Forecasting","Reporting","Variance Analysis","Stakeholder Management"],
    important: ["SQL","Power BI","Tableau","FP&A","DCF Analysis","P&L Management","ERP Systems","Presentation Skills"],
    nice_to_have: ["Python","R","Bloomberg","M&A Analysis","VBA"],
    synonym_map: {"Financial Modeling":["Financial Models","Modeling"],"Excel":["Google Sheets","Spreadsheets"],"FP&A":["Financial Planning and Analysis"]},
  },
  // --- CONTENT ---
  {
    role: "Technical Writer",
    required: ["Technical Documentation","API Documentation","Content Strategy","Editing","Research","Information Architecture","Style Guides"],
    important: ["Markdown","Git","Developer Experience","Docs-as-code","Confluence","DITA","Accessibility","SEO"],
    nice_to_have: ["HTML","CSS","Python","Video Documentation","Figma","Postman"],
    synonym_map: {"API Documentation":["API Docs","Developer Docs"],"Docs-as-code":["Documentation as Code"]},
  },
  {
    role: "UX Writer",
    required: ["Microcopy","Content Strategy","UX Writing","Figma","Accessibility","User Research","Information Architecture","Style Guides"],
    important: ["A/B Testing","Design Systems","Localisation","Stakeholder Management","Content Audits","Voice and Tone"],
    nice_to_have: ["HTML","Motion Design","Conversation Design","Chatbot Writing"],
    synonym_map: {"Microcopy":["UI Copy","Interface Copy"],"UX Writing":["Product Writing","Content Design"],"Localisation":["Localization","l10n"]},
  },
  // --- DOMAIN FALLBACKS ---
  {
    role: "domain:Design",
    required: ["Figma","User Research","Prototyping","Design Systems","Wireframing","Interaction Design","Visual Design","Accessibility"],
    important: ["Usability Testing","Stakeholder Management","Cross-functional Collaboration","Agile","Design Critique","Component Libraries"],
    nice_to_have: ["HTML","CSS","Motion Design","Framer","Miro","Design Tokens"],
    synonym_map: {"Figma":["Figma Cloud","Adobe XD","Sketch"],"User Research":["UX Research","User Studies"],"Design Systems":["Design System","Component Library"]},
  },
  {
    role: "domain:Engineering",
    required: ["Git","REST APIs","SQL","Testing","CI/CD","Problem Solving","Code Review","Documentation"],
    important: ["Docker","AWS","Agile","Microservices","Performance Optimization","Security","Monitoring"],
    nice_to_have: ["Kubernetes","Terraform","GraphQL","Open Source","Technical Writing"],
    synonym_map: {"Git":["Github","Gitlab","Version Control"],"REST APIs":["REST","RESTful","API Development"],"CI/CD":["Continuous Integration","Continuous Deployment"]},
  },
  {
    role: "domain:Product",
    required: ["Product Strategy","Roadmap Planning","Stakeholder Management","User Research","Agile","Data Analysis","Prioritization","Cross-functional Collaboration"],
    important: ["SQL","A/B Testing","OKRs","Go-to-market","Customer Discovery","Competitive Analysis"],
    nice_to_have: ["Figma","Python","Growth Strategy","Pricing Strategy"],
    synonym_map: {"Agile":["Scrum","Kanban"],"OKRs":["KPIs","Goals","Metrics"],"Roadmap Planning":["Product Roadmap","Roadmapping"]},
  },
  {
    role: "domain:Data",
    required: ["SQL","Python","Data Analysis","Statistical Modeling","Data Visualization","Reporting","Data Cleaning","Excel"],
    important: ["Tableau","Power BI","Machine Learning","A/B Testing","Data Pipelines","AWS","Git"],
    nice_to_have: ["R","Spark","dbt","Airflow","BigQuery","Deep Learning"],
    synonym_map: {"SQL":["MySQL","PostgreSQL","BigQuery"],"Python":["Python3"],"Machine Learning":["ML"]},
  },
  {
    role: "domain:Marketing",
    required: ["Content Strategy","SEO","Analytics","Email Marketing","Stakeholder Management","Copywriting","Campaign Management","CRM"],
    important: ["Google Analytics","Paid Advertising","A/B Testing","Social Media","Marketing Automation","Data Analysis","Brand Management"],
    nice_to_have: ["SQL","Python","Figma","Video Production","Influencer Marketing"],
    synonym_map: {"SEO":["Search Engine Optimization"],"CRM":["Salesforce","HubSpot"],"A/B Testing":["Split Testing","Experimentation"]},
  },
  {
    role: "domain:Sales",
    required: ["B2B Sales","Pipeline Management","CRM","Prospecting","Negotiation","Stakeholder Management","Closing","Quota Attainment"],
    important: ["Salesforce","Cold Outreach","Discovery Calls","Forecasting","Contract Management","Upselling"],
    nice_to_have: ["SQL","LinkedIn Sales Navigator","Outreach","SalesLoft","Enterprise Sales"],
    synonym_map: {"CRM":["Salesforce","HubSpot"],"B2B Sales":["SaaS Sales","Enterprise Sales"]},
  },
  {
    role: "domain:Operations",
    required: ["Project Management","Stakeholder Management","Process Improvement","Data Analysis","Cross-functional Collaboration","Reporting","Risk Management","Documentation"],
    important: ["Agile","Jira","Budget Management","Change Management","Excel","SQL"],
    nice_to_have: ["Power BI","Tableau","Six Sigma","PMP","Vendor Management"],
    synonym_map: {"Agile":["Scrum","Kanban"],"Jira":["Asana","Monday.com"]},
  },
  {
    role: "domain:Finance",
    required: ["Financial Modeling","Excel","SQL","Data Analysis","Budgeting","Forecasting","Reporting","Stakeholder Management"],
    important: ["Power BI","Tableau","FP&A","Variance Analysis","ERP Systems","Presentation Skills"],
    nice_to_have: ["Python","R","Bloomberg","M&A Analysis","VBA"],
    synonym_map: {"Excel":["Google Sheets","Spreadsheets"],"FP&A":["Financial Planning and Analysis"]},
  },
  {
    role: "domain:HR & People",
    required: ["Employee Relations","Stakeholder Management","Talent Management","HR Strategy","Performance Management","Compliance","Recruiting","Data Analysis"],
    important: ["HRIS","L&D","Compensation & Benefits","Change Management","Workforce Planning","Organisational Design"],
    nice_to_have: ["SQL","Workday","BambooHR","DEI Programs","Employment Law"],
    synonym_map: {"HRIS":["Workday","BambooHR","HR Systems"],"L&D":["Learning and Development","Training"]},
  },
  {
    role: "domain:Customer Support",
    required: ["Customer Service","Stakeholder Management","CRM","Problem Solving","Communication","Escalation Management","SLA Management"],
    important: ["Zendesk","Intercom","Data Analysis","Process Improvement","NPS","Onboarding"],
    nice_to_have: ["SQL","Salesforce","Community Management","Technical Support","Knowledge Base"],
    synonym_map: {"CRM":["Zendesk","Intercom","Salesforce"],"NPS":["Net Promoter Score","Customer Satisfaction"]},
  },
  {
    role: "domain:Content & Writing",
    required: ["Content Strategy","Editing","Research","SEO","Copywriting","Style Guides","Stakeholder Management","Content Calendar"],
    important: ["CMS","WordPress","Analytics","Social Media","Email Marketing","Information Architecture"],
    nice_to_have: ["HTML","CSS","Figma","Video Production","Podcast Production"],
    synonym_map: {"SEO":["Search Engine Optimization"],"CMS":["WordPress","Contentful","Sanity"]},
  },
  {
    role: "domain:Legal & Compliance",
    required: ["Contract Management","Compliance","Risk Management","Legal Research","Stakeholder Management","Documentation","Regulatory Knowledge"],
    important: ["Data Privacy","GDPR","Employment Law","Corporate Law","Negotiation","Due Diligence"],
    nice_to_have: ["SQL","LegalTech","IP Law","International Law","M&A"],
    synonym_map: {"GDPR":["Data Protection","Privacy Law"],"Due Diligence":["DD","Legal Due Diligence"]},
  },
  {
    role: "domain:Research",
    required: ["Research Design","Data Analysis","Survey Design","Interview Facilitation","Synthesis","Reporting","Statistical Analysis"],
    important: ["Qualitative Research","Quantitative Research","Usability Testing","Stakeholder Management","Academic Writing","Literature Review"],
    nice_to_have: ["Python","R","SQL","SPSS","Eye Tracking","Diary Studies"],
    synonym_map: {"Research Design":["Research Planning","Study Design"],"Statistical Analysis":["Statistics","Quantitative Analysis"]},
  },
];

async function seed() {
  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const kw of KEYWORDS) {
    const { error } = await supabase
      .from("keyword_lists")
      .upsert(
        {
          role: kw.role,
          required: kw.required,
          important: kw.important,
          nice_to_have: kw.nice_to_have,
          synonym_map: kw.synonym_map,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "role" }
      );

    if (error) {
      console.error(`Error inserting "${kw.role}":`, error.message);
      errors++;
    } else {
      inserted++;
    }
  }

  console.log(`Done. Inserted/updated: ${inserted}, Skipped: ${skipped}, Errors: ${errors}`);
}

seed().catch(console.error);
