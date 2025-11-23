from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Campaign Lead Automation API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # In a real app, we would start the monitor here
    # asyncio.create_task(monitor.start())
    pass

from routes import integrations, campaigns, automations, public_links, webhooks, dashboard, campaign_detail

app.include_router(integrations.router)
app.include_router(campaigns.router)
app.include_router(automations.router)
app.include_router(public_links.router)
app.include_router(webhooks.router)
app.include_router(dashboard.router)
app.include_router(campaign_detail.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Campaign Lead Automation API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
