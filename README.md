# No-Code Lead Automation & Dashboard System

A complete SaaS platform for lead automation and management with real-time connection status monitoring, no-code automation workflows, and public dashboard sharing.

## Features

- **Connection Status Indicators**: Real-time monitoring of all integrations (Meta, Webhook, SMTP) with Green/Yellow/Red status dots
- **No-Code Automation Builder**: Visual workflow builder with triggers, conditions, and actions
- **Public Dashboard Sharing**: UUID-based shareable links with password protection and CSV export
- **Integration Management**: Support for Meta Lead Ads, Incoming Webhooks, SMTP, and more

## Tech Stack

- **Backend**: FastAPI + SQLAlchemy + PostgreSQL
- **Frontend**: React + TypeScript + Tailwind CSS + shadcn UI
- **Database**: PostgreSQL

## Setup

### Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL 13+

### Backend Setup

```bash
cd backend
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run the server
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend
npm install

# Run the development server
npm run dev
```

The app will be available at `http://localhost:5173`

## Database Configuration

Update the `.env` file in the `backend` directory:

```env
DATABASE_URL=postgresql://postgres:postgres@123@localhost:5433/one
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## Project Structure

```
Campaign/
├── backend/
│   ├── main.py                    # FastAPI app entry point
│   ├── database.py                # Database connection
│   ├── models.py                  # SQLAlchemy ORM models
│   ├── services/                  # Business logic services
│   │   ├── integration_monitor.py
│   │   ├── meta_service.py
│   │   ├── webhook_service.py
│   │   ├── smtp_service.py
│   │   └── automation_engine.py
│   └── routes/                    # API endpoints
│       ├── integrations.py
│       ├── campaigns.py
│       ├── automations.py
│       └── public_links.py
│
└── frontend/
    ├── src/
    │   ├── components/            # Reusable UI components
    │   ├── pages/                 # Page components
    │   ├── hooks/                 # Custom React hooks
    │   └── lib/                   # Utility functions
    └── tailwind.config.js
```

## Key Features

### 1. Connection Status Indicators

Real-time monitoring of integration health with color-coded status:
- **Green**: Connected and working
- **Yellow**: Warning (e.g., token expiring, no recent events)
- **Red**: Disconnected or error

Status indicators appear in:
- Integration cards on the main page
- Sidebar navigation menu
- Integration detail pages

### 2. Automation Builder

Create no-code workflows with:
- **Triggers**: New lead, status change, field update
- **Conditions**: Field-based filtering (equals, contains)
- **Actions**: Send email, update lead, call webhook

### 3. Public Links

Generate shareable dashboard links with:
- UUID-based URLs (hard to guess)
- Optional password protection
- Optional expiry dates
- CSV export functionality

## API Endpoints

### Integrations
- `GET /api/integrations` - List all integrations
- `POST /api/integrations` - Create integration
- `GET /api/integrations/{id}` - Get integration details
- `GET /api/integrations/{id}/status` - Get real-time status

### Automations
- `GET /api/automations` - List automations
- `POST /api/automations` - Create automation
- `PATCH /api/automations/{id}` - Update automation
- `DELETE /api/automations/{id}` - Delete automation

### Public Links
- `POST /api/public-links` - Generate public link
- `GET /api/public-links/{uuid}` - Access public dashboard
- `GET /api/public-links/{uuid}/csv` - Download CSV

## Development

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Database Migrations

The application automatically creates tables on startup. For production, consider using Alembic for migrations.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.
