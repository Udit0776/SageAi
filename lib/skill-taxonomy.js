// Deterministic Skill Taxonomy & Extraction System

export const SKILLS_TAXONOMY = {
  // Languages (35 entries)
  "JavaScript": { category: "languages", synonyms: ["javascript", "js", "ecmascript"], relatedSkills: ["React", "Node.js", "TypeScript"] },
  "TypeScript": { category: "languages", synonyms: ["typescript", "ts"], relatedSkills: ["JavaScript", "Angular", "React"] },
  "Python": { category: "languages", synonyms: ["python", "py"], relatedSkills: ["Django", "Flask", "FastAPI", "Pandas"] },
  "Java": { category: "languages", synonyms: ["java"], relatedSkills: ["Spring Boot", "Hibernate", "Android"] },
  "C++": { category: "languages", synonyms: ["c++", "cpp"], relatedSkills: ["C", "Embedded Systems", "Algorithms"] },
  "C#": { category: "languages", synonyms: ["c#", "csharp", "c-sharp"], relatedSkills: [".NET Core", "ASP.NET", "Unity"] },
  "Ruby": { category: "languages", synonyms: ["ruby"], relatedSkills: ["Ruby on Rails", "Sinatra"] },
  "Go": { category: "languages", synonyms: ["go", "golang"], relatedSkills: ["Docker", "Kubernetes", "Microservices"] },
  "Rust": { category: "languages", synonyms: ["rust", "rustlang"], relatedSkills: ["WebAssembly", "Systems Programming"] },
  "PHP": { category: "languages", synonyms: ["php"], relatedSkills: ["Laravel", "Symfony", "WordPress", "MySQL"] },
  "Swift": { category: "languages", synonyms: ["swift"], relatedSkills: ["iOS", "Xcode", "UIKit", "SwiftUI"] },
  "Kotlin": { category: "languages", synonyms: ["kotlin"], relatedSkills: ["Android", "Java", "Jetpack Compose"] },
  "HTML": { category: "languages", synonyms: ["html", "html5"], relatedSkills: ["CSS", "JavaScript", "Web Development"] },
  "CSS": { category: "languages", synonyms: ["css", "css3"], relatedSkills: ["HTML", "Sass", "Tailwind CSS"] },
  "SQL": { category: "languages", synonyms: ["sql"], relatedSkills: ["PostgreSQL", "MySQL", "Database Design"] },
  "R": { category: "languages", synonyms: ["r-lang", "r language"], relatedSkills: ["Data Science", "Statistics", "ggplot2"] },
  "Scala": { category: "languages", synonyms: ["scala"], relatedSkills: ["Apache Spark", "JVM", "Functional Programming"] },
  "Dart": { category: "languages", synonyms: ["dart"], relatedSkills: ["Flutter", "Mobile Development"] },
  "Shell Scripting": { category: "languages", synonyms: ["shell", "bash", "shell scripting", "powershell"], relatedSkills: ["Linux", "DevOps", "Automation"] },
  "Objective-C": { category: "languages", synonyms: ["objective-c", "obj-c"], relatedSkills: ["iOS", "Swift"] },
  "Haskell": { category: "languages", synonyms: ["haskell"], relatedSkills: ["Functional Programming", "Compiler Design"] },
  "Perl": { category: "languages", synonyms: ["perl"], relatedSkills: ["Regex", "System Administration"] },
  "Lua": { category: "languages", synonyms: ["lua"], relatedSkills: ["Game Development", "Redis Scripting"] },
  "C": { category: "languages", synonyms: ["c language"], relatedSkills: ["C++", "Assembly", "Operating Systems"] },
  "Clojure": { category: "languages", synonyms: ["clojure"], relatedSkills: ["Lisp", "JVM", "Functional Programming"] },
  "Elixir": { category: "languages", synonyms: ["elixir"], relatedSkills: ["Erlang", "Phoenix Framework"] },
  "Erlang": { category: "languages", synonyms: ["erlang"], relatedSkills: ["Elixir", "OTP"] },
  "Julia": { category: "languages", synonyms: ["julia"], relatedSkills: ["Data Science", "Machine Learning"] },
  "F#": { category: "languages", synonyms: ["f#", "fsharp"], relatedSkills: [".NET", "Functional Programming"] },
  "Fortran": { category: "languages", synonyms: ["fortran"], relatedSkills: ["Scientific Computing"] },
  "Cobol": { category: "languages", synonyms: ["cobol"], relatedSkills: ["Mainframe"] },
  "Assembly": { category: "languages", synonyms: ["assembly", "asm", "x86 assembly"], relatedSkills: ["Reverse Engineering", "C"] },
  "GraphQL Query": { category: "languages", synonyms: ["graphql query"], relatedSkills: ["Apollo", "REST API"] },
  "MATLAB": { category: "languages", synonyms: ["matlab"], relatedSkills: ["Simulink", "Data Analysis"] },
  "SAS": { category: "languages", synonyms: ["sas"], relatedSkills: ["Data Analytics", "Statistics"] },

  // Frameworks & Libraries (45 entries)
  "React": { category: "frameworks", synonyms: ["react", "reactjs", "react.js"], relatedSkills: ["Redux", "TypeScript", "Next.js"] },
  "Angular": { category: "frameworks", synonyms: ["angular", "angularjs", "angular.js"], relatedSkills: ["TypeScript", "RxJS"] },
  "Vue.js": { category: "frameworks", synonyms: ["vue", "vuejs", "vue.js"], relatedSkills: ["Nuxt.js", "Vuex"] },
  "Next.js": { category: "frameworks", synonyms: ["nextjs", "next.js"], relatedSkills: ["React", "Vercel", "SSR"] },
  "Nuxt.js": { category: "frameworks", synonyms: ["nuxtjs", "nuxt.js"], relatedSkills: ["Vue.js", "SSR"] },
  "Svelte": { category: "frameworks", synonyms: ["svelte", "sveltekit"], relatedSkills: ["JavaScript", "HTML"] },
  "Gatsby": { category: "frameworks", synonyms: ["gatsby"], relatedSkills: ["React", "GraphQL"] },
  "Django": { category: "frameworks", synonyms: ["django"], relatedSkills: ["Python", "PostgreSQL", "REST APIs"] },
  "Flask": { category: "frameworks", synonyms: ["flask"], relatedSkills: ["Python", "SQLAlchemy"] },
  "FastAPI": { category: "frameworks", synonyms: ["fastapi"], relatedSkills: ["Python", "Pydantic", "Uvicorn"] },
  "Spring Boot": { category: "frameworks", synonyms: ["spring boot", "spring framework", "springboot"], relatedSkills: ["Java", "Hibernate"] },
  "Express.js": { category: "frameworks", synonyms: ["express", "expressjs", "express.js"], relatedSkills: ["Node.js", "MongoDB"] },
  "NestJS": { category: "frameworks", synonyms: ["nestjs", "nest.js"], relatedSkills: ["TypeScript", "Node.js", "GraphQL"] },
  "Laravel": { category: "frameworks", synonyms: ["laravel"], relatedSkills: ["PHP", "Composer", "MySQL"] },
  "Ruby on Rails": { category: "frameworks", synonyms: ["rails", "ruby on rails", "ror"], relatedSkills: ["Ruby", "PostgreSQL"] },
  "ASP.NET": { category: "frameworks", synonyms: ["asp.net", "aspnet", ".net core", "dotnet"], relatedSkills: ["C#", "Entity Framework"] },
  "Tailwind CSS": { category: "frameworks", synonyms: ["tailwind", "tailwindcss"], relatedSkills: ["CSS", "HTML", "Vite"] },
  "Bootstrap": { category: "frameworks", synonyms: ["bootstrap"], relatedSkills: ["CSS", "HTML", "jQuery"] },
  "Redux": { category: "frameworks", synonyms: ["redux", "redux toolkit"], relatedSkills: ["React", "State Management"] },
  "Sass": { category: "frameworks", synonyms: ["sass", "scss"], relatedSkills: ["CSS", "CSS Modules"] },
  "jQuery": { category: "frameworks", synonyms: ["jquery"], relatedSkills: ["JavaScript", "HTML"] },
  "Hibernate": { category: "frameworks", synonyms: ["hibernate", "jpa"], relatedSkills: ["Java", "Spring Boot"] },
  "Flask-RESTful": { category: "frameworks", synonyms: ["flask-restful"], relatedSkills: ["Python", "Flask"] },
  "Pydantic": { category: "frameworks", synonyms: ["pydantic"], relatedSkills: ["Python", "FastAPI"] },
  "Koa": { category: "frameworks", synonyms: ["koa", "koajs"], relatedSkills: ["Node.js", "Express.js"] },
  "Sails.js": { category: "frameworks", synonyms: ["sails", "sailsjs"], relatedSkills: ["Node.js", "Waterline"] },
  "Fastify": { category: "frameworks", synonyms: ["fastify"], relatedSkills: ["Node.js", "Express.js"] },
  "Gin": { category: "frameworks", synonyms: ["gin framework", "gin-gonic"], relatedSkills: ["Go", "Go REST API"] },
  "Echo": { category: "frameworks", synonyms: ["echo framework"], relatedSkills: ["Go"] },
  "Symfony": { category: "frameworks", synonyms: ["symfony"], relatedSkills: ["PHP", "Composer"] },
  "Spring MVC": { category: "frameworks", synonyms: ["spring mvc"], relatedSkills: ["Java", "Spring Boot"] },
  "Phoenix": { category: "frameworks", synonyms: ["phoenix framework", "phoenix"], relatedSkills: ["Elixir", "Erlang"] },
  "Remix": { category: "frameworks", synonyms: ["remix", "remix-run"], relatedSkills: ["React", "Next.js"] },
  "SolidJS": { category: "frameworks", synonyms: ["solidjs", "solid.js"], relatedSkills: ["React", "Reactive Programming"] },
  "Material-UI": { category: "frameworks", synonyms: ["mui", "material-ui", "material ui"], relatedSkills: ["React", "CSS"] },
  "Chakra UI": { category: "frameworks", synonyms: ["chakra ui", "chakra-ui"], relatedSkills: ["React", "Tailwind CSS"] },
  "Styled Components": { category: "frameworks", synonyms: ["styled components", "styled-components"], relatedSkills: ["React", "CSS"] },
  "RxJS": { category: "frameworks", synonyms: ["rxjs"], relatedSkills: ["Angular", "Reactive Programming"] },
  "Gevent": { category: "frameworks", synonyms: ["gevent"], relatedSkills: ["Python", "Concurrency"] },
  "Celery": { category: "frameworks", synonyms: ["celery"], relatedSkills: ["Python", "Redis", "RabbitMQ"] },
  "Apollo Client": { category: "frameworks", synonyms: ["apollo client", "apollo graphql"], relatedSkills: ["GraphQL", "React"] },
  "Electron": { category: "frameworks", synonyms: ["electron", "electronjs"], relatedSkills: ["JavaScript", "Node.js", "HTML/CSS"] },
  "Tornado": { category: "frameworks", synonyms: ["tornado"], relatedSkills: ["Python", "WebSockets"] },
  "Sanic": { category: "frameworks", synonyms: ["sanic"], relatedSkills: ["Python", "FastAPI"] },
  "Play Framework": { category: "frameworks", synonyms: ["play framework"], relatedSkills: ["Scala", "Java"] },

  // Databases (25 entries)
  "MongoDB": { category: "databases", synonyms: ["mongodb", "mongo", "nosql"], relatedSkills: ["Mongoose", "Express.js", "Node.js"] },
  "PostgreSQL": { category: "databases", synonyms: ["postgresql", "postgres"], relatedSkills: ["SQL", "Prisma", "pgAdmin"] },
  "MySQL": { category: "databases", synonyms: ["mysql"], relatedSkills: ["SQL", "PHP", "Database Management"] },
  "Redis": { category: "databases", synonyms: ["redis"], relatedSkills: ["Caching", "Key-Value Stores", "Node.js"] },
  "SQLite": { category: "databases", synonyms: ["sqlite"], relatedSkills: ["SQL", "Mobile Databases"] },
  "DynamoDB": { category: "databases", synonyms: ["dynamodb", "aws dynamodb"], relatedSkills: ["AWS", "NoSQL"] },
  "Cassandra": { category: "databases", synonyms: ["cassandra", "apache cassandra"], relatedSkills: ["Big Data", "NoSQL"] },
  "Oracle Database": { category: "databases", synonyms: ["oracle", "oracle database"], relatedSkills: ["SQL", "PL/SQL"] },
  "Firebase Firestore": { category: "databases", synonyms: ["firestore", "firebase firestore"], relatedSkills: ["Firebase", "NoSQL"] },
  "Elasticsearch": { category: "databases", synonyms: ["elasticsearch", "elk"], relatedSkills: ["Kibana", "Logstash", "Search Engines"] },
  "MariaDB": { category: "databases", synonyms: ["mariadb"], relatedSkills: ["MySQL", "SQL"] },
  "Neo4j": { category: "databases", synonyms: ["neo4j"], relatedSkills: ["Graph Databases", "Cypher"] },
  "CouchDB": { category: "databases", synonyms: ["couchdb"], relatedSkills: ["NoSQL", "Document Databases"] },
  "InfluxDB": { category: "databases", synonyms: ["influxdb"], relatedSkills: ["Time Series Databases", "DevOps"] },
  "Firebase": { category: "databases", synonyms: ["firebase"], relatedSkills: ["Firestore", "Authentication", "Cloud Functions"] },
  "SQL Server": { category: "databases", synonyms: ["sql server", "mssql", "microsoft sql server"], relatedSkills: ["SQL", "T-SQL", ".NET"] },
  "Prisma": { category: "databases", synonyms: ["prisma", "prisma orm"], relatedSkills: ["TypeScript", "PostgreSQL", "Next.js"] },
  "Mongoose": { category: "databases", synonyms: ["mongoose"], relatedSkills: ["MongoDB", "Node.js"] },
  "Sequelize": { category: "databases", synonyms: ["sequelize"], relatedSkills: ["Node.js", "PostgreSQL", "MySQL"] },
  "TypeORM": { category: "databases", synonyms: ["typeorm"], relatedSkills: ["TypeScript", "NestJS", "PostgreSQL"] },
  "Knex.js": { category: "databases", synonyms: ["knex", "knex.js"], relatedSkills: ["Node.js", "SQL"] },
  "Airtable": { category: "databases", synonyms: ["airtable"], relatedSkills: ["API Integration", "Low-Code"] },
  "ClickHouse": { category: "databases", synonyms: ["clickhouse"], relatedSkills: ["Analytics Databases", "Big Data"] },
  "CockroachDB": { category: "databases", synonyms: ["cockroachdb", "cockroach"], relatedSkills: ["PostgreSQL", "Distributed Databases"] },
  "GraphQL": { category: "databases", synonyms: ["graphql", "gql"], relatedSkills: ["REST API", "ApolloClient"] },

  // Cloud (20 entries)
  "AWS": { category: "cloud", synonyms: ["aws", "amazon web services", "ec2", "s3", "lambda"], relatedSkills: ["Cloud Computing", "DevOps"] },
  "Azure": { category: "cloud", synonyms: ["azure", "microsoft azure"], relatedSkills: [".NET Core", "Cloud Security"] },
  "Google Cloud Platform": { category: "cloud", synonyms: ["gcp", "google cloud", "google cloud platform"], relatedSkills: ["Kubernetes", "BigQuery"] },
  "Heroku": { category: "cloud", synonyms: ["heroku"], relatedSkills: ["Vercel", "Deployment"] },
  "Vercel": { category: "cloud", synonyms: ["vercel"], relatedSkills: ["Next.js", "React", "Serverless"] },
  "Netlify": { category: "cloud", synonyms: ["netlify"], relatedSkills: ["JAMstack", "Frontend Deployments"] },
  "DigitalOcean": { category: "cloud", synonyms: ["digitalocean", "droplet"], relatedSkills: ["Linux", "VPS", "Docker"] },
  "Cloudflare": { category: "cloud", synonyms: ["cloudflare", "cdn"], relatedSkills: ["DNS", "Caching", "SSL"] },
  "OpenStack": { category: "cloud", synonyms: ["openstack"], relatedSkills: ["Private Cloud", "Virtualization"] },
  "Linode": { category: "cloud", synonyms: ["linode"], relatedSkills: ["Linux", "VPS"] },
  "OpenShift": { category: "cloud", synonyms: ["openshift"], relatedSkills: ["Kubernetes", "RedHat"] },
  "AWS S3": { category: "cloud", synonyms: ["aws s3", "amazon s3"], relatedSkills: ["AWS", "Cloud Storage"] },
  "AWS EC2": { category: "cloud", synonyms: ["aws ec2", "amazon ec2"], relatedSkills: ["AWS", "VPS"] },
  "AWS Lambda": { category: "cloud", synonyms: ["aws lambda", "serverless lambda"], relatedSkills: ["AWS", "Serverless"] },
  "AWS CloudFormation": { category: "cloud", synonyms: ["cloudformation"], relatedSkills: ["AWS", "Infrastructure as Code"] },
  "AWS IAM": { category: "cloud", synonyms: ["aws iam", "iam"], relatedSkills: ["AWS", "Cloud Security"] },
  "ECS": { category: "cloud", synonyms: ["ecs", "aws ecs"], relatedSkills: ["AWS", "Docker"] },
  "EKS": { category: "cloud", synonyms: ["eks", "aws eks"], relatedSkills: ["AWS", "Kubernetes"] },
  "Google Cloud Run": { category: "cloud", synonyms: ["cloud run", "google cloud run"], relatedSkills: ["GCP", "Docker"] },
  "Azure Devops": { category: "cloud", synonyms: ["azure devops"], relatedSkills: ["Azure", "DevOps", "CI/CD"] },

  // DevOps & Infrastructure (25 entries)
  "Docker": { category: "devops", synonyms: ["docker", "containerization"], relatedSkills: ["Kubernetes", "DevOps", "Docker Compose"] },
  "Kubernetes": { category: "devops", synonyms: ["kubernetes", "k8s"], relatedSkills: ["Docker", "Terraform", "Helm"] },
  "Terraform": { category: "devops", synonyms: ["terraform", "iac"], relatedSkills: ["Ansible", "AWS", "Infrastructure as Code"] },
  "Ansible": { category: "devops", synonyms: ["ansible"], relatedSkills: ["Terraform", "Puppet", "Automation"] },
  "Jenkins": { category: "devops", synonyms: ["jenkins"], relatedSkills: ["CI/CD", "Docker", "Pipelines"] },
  "GitHub Actions": { category: "devops", synonyms: ["github actions", "github action"], relatedSkills: ["CI/CD", "GitHub", "Automation"] },
  "GitLab CI": { category: "devops", synonyms: ["gitlab ci", "gitlab cd"], relatedSkills: ["CI/CD", "GitLab"] },
  "CircleCI": { category: "devops", synonyms: ["circleci"], relatedSkills: ["CI/CD", "GitHub"] },
  "Travis CI": { category: "devops", synonyms: ["travis ci"], relatedSkills: ["CI/CD", "GitHub"] },
  "CI/CD": { category: "devops", synonyms: ["ci/cd", "continuous integration", "deployment pipeline"], relatedSkills: ["DevOps", "Automation"] },
  "Linux": { category: "devops", synonyms: ["linux", "ubuntu", "debian", "centos", "redhat"], relatedSkills: ["Shell Scripting", "System Administration"] },
  "Nginx": { category: "devops", synonyms: ["nginx"], relatedSkills: ["Apache", "Reverse Proxy", "Load Balancing"] },
  "Apache": { category: "devops", synonyms: ["apache", "httpd"], relatedSkills: ["Nginx", "Linux"] },
  "Prometheus": { category: "devops", synonyms: ["prometheus"], relatedSkills: ["Grafana", "Alertmanager", "Monitoring"] },
  "Grafana": { category: "devops", synonyms: ["grafana"], relatedSkills: ["Prometheus", "Kibana", "Metrics"] },
  "Vagrant": { category: "devops", synonyms: ["vagrant"], relatedSkills: ["VirtualBox", "Docker"] },
  "ELK Stack": { category: "devops", synonyms: ["elk stack", "elk", "kibana", "logstash"], relatedSkills: ["Elasticsearch", "Logging"] },
  "Helm": { category: "devops", synonyms: ["helm"], relatedSkills: ["Kubernetes", "DevOps"] },
  "Puppet": { category: "devops", synonyms: ["puppet"], relatedSkills: ["Chef", "Ansible"] },
  "Chef": { category: "devops", synonyms: ["chef"], relatedSkills: ["Puppet", "Ansible"] },
  "Datadog": { category: "devops", synonyms: ["datadog"], relatedSkills: ["Cloud Monitoring", "DevOps"] },
  "Splunk": { category: "devops", synonyms: ["splunk"], relatedSkills: ["Log Analysis", "Security"] },
  "Istio": { category: "devops", synonyms: ["istio", "service mesh"], relatedSkills: ["Kubernetes", "Microservices"] },
  "SonarQube": { category: "devops", synonyms: ["sonarqube", "code quality"], relatedSkills: ["CI/CD", "Static Analysis"] },
  "New Relic": { category: "devops", synonyms: ["new relic", "apm"], relatedSkills: ["Monitoring", "Performance Tuning"] },

  // Mobile & Desktop Frameworks (10 entries)
  "React Native": { category: "mobile", synonyms: ["react native", "react-native"], relatedSkills: ["React", "JavaScript", "iOS", "Android"] },
  "Flutter": { category: "mobile", synonyms: ["flutter"], relatedSkills: ["Dart", "Mobile App Development"] },
  "Xamarin": { category: "mobile", synonyms: ["xamarin"], relatedSkills: ["C#", ".NET"] },
  "Ionic": { category: "mobile", synonyms: ["ionic", "ionic framework"], relatedSkills: ["Angular", "Capacitor"] },
  "Cordova": { category: "mobile", synonyms: ["cordova", "phonegap"], relatedSkills: ["HTML/CSS", "JavaScript"] },
  "SwiftUI": { category: "mobile", synonyms: ["swiftui"], relatedSkills: ["Swift", "UIKit"] },
  "Jetpack Compose": { category: "mobile", synonyms: ["jetpack compose"], relatedSkills: ["Kotlin", "Android Development"] },
  "Android SDK": { category: "mobile", synonyms: ["android sdk", "android development"], relatedSkills: ["Java", "Kotlin"] },
  "iOS SDK": { category: "mobile", synonyms: ["ios development", "uikit"], relatedSkills: ["Swift", "Xcode"] },
  "Capacitor": { category: "mobile", synonyms: ["capacitor"], relatedSkills: ["Ionic", "Webview"] },

  // Testing & Quality Assurance (15 entries)
  "Jest": { category: "testing", synonyms: ["jest"], relatedSkills: ["React Testing Library", "JavaScript Testing"] },
  "Cypress": { category: "testing", synonyms: ["cypress"], relatedSkills: ["E2E Testing", "JavaScript Testing"] },
  "Playwright": { category: "testing", synonyms: ["playwright"], relatedSkills: ["Cypress", "Puppeteer", "E2E Testing"] },
  "Selenium": { category: "testing", synonyms: ["selenium", "selenium webdriver"], relatedSkills: ["Java", "Test Automation"] },
  "Puppeteer": { category: "testing", synonyms: ["puppeteer"], relatedSkills: ["Playwright", "Headless Chrome"] },
  "Mocha": { category: "testing", synonyms: ["mocha"], relatedSkills: ["Chai", "Node.js Testing"] },
  "Chai": { category: "testing", synonyms: ["chai"], relatedSkills: ["Mocha", "Assertion Libraries"] },
  "JUnit": { category: "testing", synonyms: ["junit"], relatedSkills: ["Java", "Mockito", "Unit Testing"] },
  "Pytest": { category: "testing", synonyms: ["pytest"], relatedSkills: ["Python Testing", "Unit Testing"] },
  "React Testing Library": { category: "testing", synonyms: ["react testing library", "rtl"], relatedSkills: ["Jest", "React"] },
  "Mockito": { category: "testing", synonyms: ["mockito"], relatedSkills: ["JUnit", "Java Mocking"] },
  "Supertest": { category: "testing", synonyms: ["supertest"], relatedSkills: ["Express.js", "API Testing"] },
  "Jasmine": { category: "testing", synonyms: ["jasmine"], relatedSkills: ["Karma", "JavaScript Testing"] },
  "Karma": { category: "testing", synonyms: ["karma"], relatedSkills: ["Jasmine", "Angular Testing"] },
  "Postman Testing": { category: "testing", synonyms: ["postman", "newman"], relatedSkills: ["API Testing", "Postman Collection"] },

  // Ecosystem & Core Tools (15 entries)
  "Git": { category: "tools", synonyms: ["git"], relatedSkills: ["GitHub", "Version Control"] },
  "GitHub": { category: "tools", synonyms: ["github"], relatedSkills: ["Git", "GitHub Actions"] },
  "GitLab": { category: "tools", synonyms: ["gitlab"], relatedSkills: ["Git", "GitLab CI"] },
  "Bitbucket": { category: "tools", synonyms: ["bitbucket"], relatedSkills: ["Git", "Jira"] },
  "Webpack": { category: "tools", synonyms: ["webpack"], relatedSkills: ["Babel", "Vite", "Build Tools"] },
  "Vite": { category: "tools", synonyms: ["vite", "vitejs"], relatedSkills: ["Webpack", "ESBuild", "React"] },
  "NPM": { category: "tools", synonyms: ["npm"], relatedSkills: ["Yarn", "Node.js", "Package Management"] },
  "Yarn": { category: "tools", synonyms: ["yarn"], relatedSkills: ["NPM", "pnpm"] },
  "pnpm": { category: "tools", synonyms: ["pnpm"], relatedSkills: ["NPM", "Yarn"] },
  "Babel": { category: "tools", synonyms: ["babel"], relatedSkills: ["Webpack", "ES6"] },
  "ESLint": { category: "tools", synonyms: ["eslint"], relatedSkills: ["Prettier", "Linter"] },
  "Prettier": { category: "tools", synonyms: ["prettier"], relatedSkills: ["ESLint", "Formatting"] },
  "Figma": { category: "tools", synonyms: ["figma", "ui design figma"], relatedSkills: ["UI/UX", "Adobe XD"] },
  "Swagger": { category: "tools", synonyms: ["swagger", "openapi"], relatedSkills: ["API Documentation", "REST API"] },
  "Xcode": { category: "tools", synonyms: ["xcode"], relatedSkills: ["iOS Development", "Swift"] },

  // Machine Learning, AI & Data Science (15 entries)
  "TensorFlow": { category: "ai", synonyms: ["tensorflow", "tf"], relatedSkills: ["Keras", "Deep Learning", "Python"] },
  "PyTorch": { category: "ai", synonyms: ["pytorch"], relatedSkills: ["Deep Learning", "Computer Vision"] },
  "Keras": { category: "ai", synonyms: ["keras"], relatedSkills: ["TensorFlow", "Neural Networks"] },
  "Scikit-learn": { category: "ai", synonyms: ["scikit-learn", "sklearn"], relatedSkills: ["Machine Learning", "Python"] },
  "Pandas": { category: "ai", synonyms: ["pandas"], relatedSkills: ["NumPy", "Python Data Science"] },
  "NumPy": { category: "ai", synonyms: ["numpy"], relatedSkills: ["Pandas", "Scientific Computing"] },
  "Jupyter": { category: "ai", synonyms: ["jupyter", "jupyter notebook"], relatedSkills: ["Python", "Data Science"] },
  "Hugging Face": { category: "ai", synonyms: ["hugging face", "transformers"], relatedSkills: ["NLP", "PyTorch"] },
  "NLP": { category: "ai", synonyms: ["nlp", "natural language processing", "spacy"], relatedSkills: ["Text Classification", "Machine Learning"] },
  "Computer Vision": { category: "ai", synonyms: ["computer vision", "opencv"], relatedSkills: ["Deep Learning", "PyTorch"] },
  "Apache Spark": { category: "ai", synonyms: ["spark", "apache spark", "pyspark"], relatedSkills: ["Scala", "Hadoop", "Big Data"] },
  "Hadoop": { category: "ai", synonyms: ["hadoop", "hdfs"], relatedSkills: ["MapReduce", "Hive"] },
  "Tableau": { category: "ai", synonyms: ["tableau"], relatedSkills: ["Data Visualization", "Power BI"] },
  "Power BI": { category: "ai", synonyms: ["power bi", "powerbi"], relatedSkills: ["Data Visualization", "Tableau"] },
  "OpenCV": { category: "ai", synonyms: ["opencv"], relatedSkills: ["Computer Vision", "Python"] },

  // Architecture & Concepts (10 entries)
  "REST API": { category: "architecture", synonyms: ["rest", "rest api", "restful api", "restful web services"], relatedSkills: ["HTTP", "GraphQL", "JSON"] },
  "Microservices": { category: "architecture", synonyms: ["microservices", "microservice architecture"], relatedSkills: ["Docker", "Kubernetes", "gRPC"] },
  "Serverless": { category: "architecture", synonyms: ["serverless", "lambda functions"], relatedSkills: ["AWS Lambda", "API Gateway"] },
  "OOP": { category: "architecture", synonyms: ["oop", "object oriented programming"], relatedSkills: ["Design Patterns", "SOLID"] },
  "System Design": { category: "architecture", synonyms: ["system design", "software architecture"], relatedSkills: ["Scalability", "Load Balancing"] },
  "Design Patterns": { category: "architecture", synonyms: ["design patterns", "design pattern"], relatedSkills: ["OOP", "SOLID"] },
  "WebSockets": { category: "architecture", synonyms: ["websockets", "websocket", "socket.io"], relatedSkills: ["Real-time", "Node.js"] },
  "gRPC": { category: "architecture", synonyms: ["grpc"], relatedSkills: ["Protocol Buffers", "Microservices"] },
  "JWT": { category: "architecture", synonyms: ["jwt", "json web token"], relatedSkills: ["OAuth 2.0", "Authentication"] },
  "OAuth": { category: "architecture", synonyms: ["oauth", "oauth2", "oauth 2.0"], relatedSkills: ["Authentication", "JWT"] },

  // Soft Skills & Methodologies (15 entries)
  "Agile": { category: "soft_skills", synonyms: ["agile"], relatedSkills: ["Scrum", "Kanban", "Jira"] },
  "Scrum": { category: "soft_skills", synonyms: ["scrum"], relatedSkills: ["Agile", "Sprint Planning"] },
  "Kanban": { category: "soft_skills", synonyms: ["kanban"], relatedSkills: ["Agile", "Trello"] },
  "Jira": { category: "soft_skills", synonyms: ["jira"], relatedSkills: ["Agile", "Confluence"] },
  "Project Management": { category: "soft_skills", synonyms: ["project management", "pmp"], relatedSkills: ["Agile", "Leadership"] },
  "Leadership": { category: "soft_skills", synonyms: ["leadership"], relatedSkills: ["Team Management", "Communication"] },
  "Communication": { category: "soft_skills", synonyms: ["communication", "written communication", "verbal communication"], relatedSkills: ["Public Speaking", "Teamwork"] },
  "Problem Solving": { category: "soft_skills", synonyms: ["problem solving", "analytical skills"], relatedSkills: ["Algorithms", "Critical Thinking"] },
  "Teamwork": { category: "soft_skills", synonyms: ["teamwork", "collaboration", "team collaboration"], relatedSkills: ["Agile", "Communication"] },
  "Mentoring": { category: "soft_skills", synonyms: ["mentoring", "coaching", "training"], relatedSkills: ["Leadership", "Code Review"] },
  "Code Review": { category: "soft_skills", synonyms: ["code review", "code reviews"], relatedSkills: ["Git", "GitHub"] },
  "Time Management": { category: "soft_skills", synonyms: ["time management", "prioritization"], relatedSkills: ["Project Management"] },
  "Product Management": { category: "soft_skills", synonyms: ["product management", "product owner"], relatedSkills: ["Scrum", "Roadmapping"] },
  "Technical Writing": { category: "soft_skills", synonyms: ["technical writing", "documentation"], relatedSkills: ["Markdown", "Communication"] },
  "Critical Thinking": { category: "soft_skills", synonyms: ["critical thinking"], relatedSkills: ["Problem Solving"] }
};

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchesTerm(text, term) {
  const escaped = escapeRegExp(term.toLowerCase());
  const isWordStart = /^[a-z0-9]/i.test(term);
  const isWordEnd = /[a-z0-9]$/i.test(term);
  
  const before = isWordStart ? '(?<=^|[^a-zA-Z0-9_])' : '';
  const after = isWordEnd ? '(?=$|[^a-zA-Z0-9_])' : '';
  
  const regex = new RegExp(before + escaped + after, 'i');
  return regex.test(text);
}

function countOccurrences(text, skillName, synonyms) {
  let count = 0;
  const terms = Array.from(new Set([skillName, ...synonyms]));
  for (const term of terms) {
    const escaped = escapeRegExp(term.toLowerCase());
    const isWordStart = /^[a-z0-9]/i.test(term);
    const isWordEnd = /[a-z0-9]$/i.test(term);
    const before = isWordStart ? '(?<=^|[^a-zA-Z0-9_])' : '';
    const after = isWordEnd ? '(?=$|[^a-zA-Z0-9_])' : '';
    const regex = new RegExp(before + escaped + after, 'gi');
    const matches = text.match(regex);
    if (matches) {
      count += matches.length;
    }
  }
  return count;
}

export function extractCanonicalSkills(text) {
  const matchedSkills = new Set();
  if (!text) return matchedSkills;

  const lowerText = text.toLowerCase();
  for (const [canonicalName, details] of Object.entries(SKILLS_TAXONOMY)) {
    // Check canonical name
    if (matchesTerm(lowerText, canonicalName)) {
      matchedSkills.add(canonicalName);
      continue;
    }
    // Check synonyms
    let synonymFound = false;
    for (const syn of details.synonyms) {
      if (matchesTerm(lowerText, syn)) {
        synonymFound = true;
        break;
      }
    }
    if (synonymFound) {
      matchedSkills.add(canonicalName);
    }
  }

  return matchedSkills;
}

export function computeSkillGap(resumeText, jdText) {
  const presentSkills = extractCanonicalSkills(resumeText);
  const requiredSkills = extractCanonicalSkills(jdText);

  // Compute intersections and differences
  const matchingSkills = new Set(
    [...requiredSkills].filter(x => presentSkills.has(x))
  );
  
  const missingSkillsSet = new Set(
    [...requiredSkills].filter(x => !presentSkills.has(x))
  );

  const extraSkills = new Set(
    [...presentSkills].filter(x => !requiredSkills.has(x))
  );

  // Assemble missing skills breakdown with priorities
  const missingSkills = [];
  const missingByCategory = {};

  for (const skill of missingSkillsSet) {
    const details = SKILLS_TAXONOMY[skill];
    const category = details ? details.category : "other";
    const relatedSkills = details ? details.relatedSkills : [];
    const synonyms = details ? details.synonyms : [];

    // Count occurrences in Job Description to assign priority
    const occurrences = countOccurrences(jdText, skill, synonyms);
    let priority = "nice-to-have";
    if (occurrences >= 3) {
      priority = "critical";
    } else if (occurrences >= 1) {
      priority = "important";
    }

    missingSkills.push({
      skill,
      category,
      priority,
      relatedSkills
    });

    if (!missingByCategory[category]) {
      missingByCategory[category] = [];
    }
    missingByCategory[category].push(skill);
  }

  const readinessScore = requiredSkills.size > 0 
    ? Math.round((matchingSkills.size / requiredSkills.size) * 100)
    : 100; // If no skills are required, user is 100% ready

  return {
    readinessScore,
    presentSkills: Array.from(presentSkills),
    requiredSkills: Array.from(requiredSkills),
    matchingSkills: Array.from(matchingSkills),
    missingSkills,
    extraSkills: Array.from(extraSkills),
    missingByCategory
  };
}
