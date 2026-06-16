from fastapi import FastAPI
from pydantic import BaseModel
import spacy
from sentence_transformers import SentenceTransformer, util
import re

app = FastAPI(title="Sage AI NLP Microservice", description="Python FastAPI microservice for semantic text similarity and skill extraction.")

# Load spaCy and Sentence-Transformers models
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    # If the model is not found, download it automatically
    import spacy.cli
    spacy.cli.download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

model = SentenceTransformer("all-MiniLM-L6-v2")

# Taxonomy covering 200+ common tech skills, tools, and methodologies with synonyms
TAXONOMY = {
    "languages": {
        "Python": ["python", "py"],
        "JavaScript": ["javascript", "js", "ecmascript"],
        "TypeScript": ["typescript", "ts"],
        "Java": ["java"],
        "C++": ["c++", "cpp"],
        "C#": ["c#", "csharp", "c-sharp"],
        "C": [" c "], # Enforce spaces to avoid matching letters in other words
        "Ruby": ["ruby", "rb"],
        "Go": ["go", "golang"],
        "Rust": ["rust", "rs"],
        "PHP": ["php"],
        "HTML": ["html", "html5"],
        "CSS": ["css", "css3"],
        "SQL": ["sql"],
        "Scala": ["scala"],
        "Kotlin": ["kotlin"],
        "Swift": ["swift"],
        "Objective-C": ["objective-c", "obj-c", "objective c"],
        "R": [" r "],
        "Dart": ["dart"],
        "Shell": ["bash", "shell", "powershell", "sh", "zsh"],
        "Perl": ["perl"],
        "Haskell": ["haskell"],
        "Julia": ["julia"],
        "Lua": ["lua"],
        "Solidity": ["solidity"],
        "GraphQL": ["graphql", "gql"],
        "XML": ["xml"],
        "YAML": ["yaml"],
        "JSON": ["json"]
    },
    "frameworks": {
        "React": ["react", "reactjs", "react.js"],
        "Next.js": ["nextjs", "next.js", "next js"],
        "Angular": ["angular", "angularjs", "angular.js"],
        "Vue.js": ["vue", "vuejs", "vue.js"],
        "Svelte": ["svelte", "sveltejs"],
        "Node.js": ["node", "nodejs", "node.js"],
        "Express.js": ["express", "expressjs", "express.js"],
        "Django": ["django"],
        "Flask": ["flask"],
        "FastAPI": ["fastapi"],
        "Spring Boot": ["spring", "springboot", "spring boot", "spring framework"],
        "Ruby on Rails": ["rails", "ruby on rails", "ror"],
        "ASP.NET": ["asp.net", "dotnet", ".net", "asp net"],
        "Laravel": ["laravel"],
        "Tailwind CSS": ["tailwind", "tailwindcss"],
        "Bootstrap": ["bootstrap"],
        "jQuery": ["jquery"],
        "TensorFlow": ["tensorflow", "tf"],
        "PyTorch": ["pytorch"],
        "Keras": ["keras"],
        "Redux": ["redux", "redux-toolkit"],
        "Fastify": ["fastify"],
        "NestJS": ["nestjs", "nest.js"],
        "Pandas": ["pandas"],
        "NumPy": ["numpy"],
        "Scikit-Learn": ["scikit-learn", "sklearn"],
        "Matplotlib": ["matplotlib"],
        "Seaborn": ["seaborn"],
        "Gatsby": ["gatsby"],
        "Nuxt.js": ["nuxt", "nuxt.js"],
        "Remix": ["remix", "remix-run"],
        "Koa": ["koa"],
        "Ember.js": ["ember", "ember.js"],
        "Backbone.js": ["backbone", "backbone.js"],
        "Celery": ["celery"],
        "OpenCV": ["opencv"],
        "NLTK": ["nltk"],
        "Spacy": ["spacy"],
        "HuggingFace": ["huggingface", "hugging face"],
        "Web3.js": ["web3", "web3.js", "ethers.js"],
        "Nuxt": ["nuxt"],
        "Django REST Framework": ["drf", "django rest framework"],
        "Fastai": ["fastai"],
        "Pygame": ["pygame"],
        "Electron": ["electron"],
        "React Native": ["react native", "react-native"],
        "Flutter": ["flutter"]
    },
    "databases": {
        "PostgreSQL": ["postgres", "postgresql"],
        "MySQL": ["mysql"],
        "MongoDB": ["mongodb", "mongo"],
        "Redis": ["redis"],
        "SQLite": ["sqlite"],
        "Oracle": ["oracle", "oracle database"],
        "SQL Server": ["sql server", "mssql", "microsoft sql server"],
        "Cassandra": ["cassandra"],
        "DynamoDB": ["dynamodb"],
        "Neo4j": ["neo4j"],
        "Firebase": ["firestore", "firebase"],
        "MariaDB": ["mariadb"],
        "Elasticsearch": ["elasticsearch", "elastic"],
        "InfluxDB": ["influxdb"],
        "Supabase": ["supabase"],
        "Prisma": ["prisma"],
        "Mongoose": ["mongoose"],
        "Snowflake": ["snowflake"],
        "BigQuery": ["bigquery"],
        "ClickHouse": ["clickhouse"],
        "CouchDB": ["couchdb"],
        "CockroachDB": ["cockroachdb"],
        "Realm": ["realm"]
    },
    "cloud": {
        "AWS": ["aws", "amazon web services", "s3", "ec2", "rds", "lambda", "ecs", "eks", "route53", "iam"],
        "Google Cloud Platform": ["gcp", "google cloud", "google cloud platform"],
        "Azure": ["azure", "microsoft azure"],
        "Docker": ["docker"],
        "Kubernetes": ["k8s", "kubernetes"],
        "Terraform": ["terraform"],
        "Ansible": ["ansible"],
        "Jenkins": ["jenkins"],
        "CI/CD": ["ci/cd", "continuous integration", "github actions", "gitlab ci", "travis", "circleci"],
        "Vercel": ["vercel"],
        "Heroku": ["heroku"],
        "Netlify": ["netlify"],
        "Git": ["git"],
        "GitHub": ["github"],
        "GitLab": ["gitlab"],
        "Bitbucket": ["bitbucket"],
        "Linux": ["linux", "ubuntu", "debian", "centos", "redhat", "fedora", "unix"],
        "Nginx": ["nginx"],
        "Apache": ["apache", "httpd"],
        "Prometheus": ["prometheus"],
        "Grafana": ["grafana"],
        "ELK Stack": ["elk", "logstash", "kibana"],
        "Helm": ["helm"],
        "Cloudflare": ["cloudflare"],
        "Serverless": ["serverless"],
        "DigitalOcean": ["digitalocean"],
        "Sentry": ["sentry"],
        "Datadog": ["datadog"],
        "OpenShift": ["openshift"],
        "SaltStack": ["saltstack"],
        "Splunk": ["splunk"]
    },
    "soft_skills": {
        "Communication": ["communication", "writing", "presentation", "verbal", "written", "public speaking", "interpersonal"],
        "Leadership": ["leadership", "mentoring", "team management", "leading", "coaching", "mentor", "influence"],
        "Problem Solving": ["problem solving", "troubleshooting", "analytical thinking", "debugging", "critical analysis"],
        "Collaboration": ["collaboration", "teamwork", "cooperation", "cross-functional", "team player", "partnering"],
        "Agile": ["agile", "scrum", "kanban", "xp", "extreme programming"],
        "Time Management": ["time management", "prioritization", "scheduling", "deadlines", "planning"],
        "Adaptability": ["adaptability", "flexibility", "resilience", "adaptable"],
        "Creativity": ["creativity", "innovation", "design thinking", "creative"],
        "Project Management": ["project management", "product management", "jira", "trello", "scrum master"],
        "Critical Thinking": ["critical thinking", "analysis", "decision making", "rational thinking"],
        "Emotional Intelligence": ["emotional intelligence", "eq", "empathy", "empathic"],
        "Conflict Resolution": ["conflict resolution", "mediation", "negotiating"],
        "Active Listening": ["active listening", "listening skills"],
        "Negotiation": ["negotiation", "negotiate"],
        "Customer Service": ["customer service", "client relations", "customer support"],
        "Work Ethic": ["work ethic", "integrity", "reliability", "responsible"],
        "Mentorship": ["mentorship", "mentoring"],
        "Self-Motivation": ["self-motivated", "proactive", "initiative", "self-motivation"],
        "Attention to Detail": ["attention to detail", "detail-oriented"]
    }
}

class SimilarityBody(BaseModel):
    text1: str
    text2: str

class SkillsBody(BaseModel):
    text: str

@app.post("/semantic-similarity")
async def semantic_similarity(body: SimilarityBody):
    text1 = body.text1
    text2 = body.text2

    doc1 = nlp(text1)
    doc2 = nlp(text2)

    # Filter out sentences that are too short to be semantically meaningful
    sents1 = [sent.text.strip() for sent in doc1.sents if len(sent.text.strip()) > 5]
    sents2 = [sent.text.strip() for sent in doc2.sents if len(sent.text.strip()) > 5]

    if not sents1 or not sents2:
        return {
            "score": 0.0,
            "interpretation": "Poor match",
            "top_matching_pairs": []
        }

    # Calculate overall similarity of the entire text blocks
    embeddings1 = model.encode(text1, convert_to_tensor=True)
    embeddings2 = model.encode(text2, convert_to_tensor=True)
    overall_score = float(util.cos_sim(embeddings1, embeddings2)[0][0])

    # Calculate pairwise similarities for individual sentences
    emb_sents1 = model.encode(sents1, convert_to_tensor=True)
    emb_sents2 = model.encode(sents2, convert_to_tensor=True)
    cosine_scores = util.cos_sim(emb_sents1, emb_sents2)

    pairs = []
    for i in range(len(sents1)):
        for j in range(len(sents2)):
            score = float(cosine_scores[i][j])
            pairs.append({
                "sentence1": sents1[i],
                "sentence2": sents2[j],
                "similarity": score
            })

    # Sort to find the top 3 matches
    pairs.sort(key=lambda x: x["similarity"], reverse=True)
    top_pairs = pairs[:3]

    # Interpret similarity score
    if overall_score >= 0.8:
        interpretation = "Excellent match"
    elif overall_score >= 0.6:
        interpretation = "Good match"
    elif overall_score >= 0.4:
        interpretation = "Partial match"
    else:
        interpretation = "Poor match"

    return {
        "score": overall_score,
        "interpretation": interpretation,
        "top_matching_pairs": top_pairs
    }

@app.post("/extract-skills")
async def extract_skills(body: SkillsBody):
    text = body.text
    text_lower = text.lower()
    
    found_skills = set()
    categories = {
        "languages": set(),
        "frameworks": set(),
        "databases": set(),
        "cloud": set(),
        "soft_skills": set()
    }

    # Match against taxonomy with custom boundary rules (handles + and # properly)
    for category, skills_dict in TAXONOMY.items():
        for skill_name, synonyms in skills_dict.items():
            for synonym in synonyms:
                pattern = r'(?:^|[^a-zA-Z0-9])' + re.escape(synonym) + r'(?:$|[^a-zA-Z0-9])'
                if re.search(pattern, text_lower):
                    found_skills.add(skill_name)
                    categories[category].add(skill_name)
                    break  # Found this skill, skip other synonyms for this skill

    # Additionally extract named entities using spaCy
    doc = nlp(text)
    for ent in doc.ents:
        if ent.label_ in ("ORG", "PRODUCT", "WORK_OF_ART"):
            ent_text = ent.text.strip()
            # Basic validation
            if len(ent_text) > 1 and ent_text.lower() not in ["the", "google", "amazon", "microsoft", "apple"]:
                # Check if it isn't already added (case-insensitive checks)
                lower_found = {s.lower() for s in found_skills}
                if ent_text.lower() not in lower_found:
                    found_skills.add(ent_text)

    return {
        "skills": sorted(list(found_skills)),
        "categories": {cat: sorted(list(skills)) for cat, skills in categories.items()}
    }
