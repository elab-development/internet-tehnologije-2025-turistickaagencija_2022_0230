# Ready2Go Tourist Agency

Ready2Go is a web application for managing and booking tourist arrangements. It provides separate experiences for clients, agents, and administrators.

## Main Features

- Browse active tourist arrangements.
- View arrangement details, travel dates, hotel information, and prices.
- View average temperature for the travel period.
- View the hotel location on an OpenStreetMap map.
- Register, activate an account by email, log in, and reset a password.
- Create and manage bookings.
- Manage countries, destinations, hotels, transports, arrangements, users, and bookings as an administrator.
- Manage agent-owned arrangements and bookings.
- Upload destination and hotel images through the administration panel.
- Manage user activation status from the administration panel.

## Technologies

- Frontend: Angular, TypeScript, SCSS, RxJS.
- Backend: Django, Django REST Framework, Simple JWT.
- Database: SQLite for local development and PostgreSQL-compatible configuration for deployment.
- Media: Django `ImageField` with files stored in the server `media/` directory.
- External APIs: Open-Meteo for weather data and OpenStreetMap for map display.

## Project Structure

```text
Client/       Angular frontend
Server/src/   Django backend and API
Server/src/media/
              Uploaded destination and hotel images
docker-compose.yml
              Local development configuration
```

## Requirements

For Docker development:

- Docker
- Docker Compose

For running services manually:

- Node.js 24 or newer
- npm
- Python 3.12 or newer

## Running With Docker Compose

From the project root, create a `.env` file. It can be empty for the default local setup, or contain values such as:

```env
SECRET_KEY=django-insecure-local-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,backend
CORS_ALLOWED_ORIGINS=http://localhost:4200
CSRF_TRUSTED_ORIGINS=http://localhost:4200
FRONTEND_URL=http://localhost:4200
```

Do not commit real email passwords or production secrets to `.env`.

Start the application:

```bash
docker compose up --build
```

Open the application at:

- Frontend: http://localhost:4200
- Backend API: http://localhost:8000/api
- Django admin: http://localhost:8000/admin

Stop the services with:

```bash
docker compose down
```

The Compose development configuration runs Django migrations automatically when the backend starts. Uploaded files are stored in `Server/src/media/`.

## Running Manually

### Backend

From the project root:

```bash
cd Server/src
python3 -m venv ../../.venv
source ../../.venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The API will be available at http://localhost:8000/api.

On Windows, activate the virtual environment with:

```powershell
..\..\.venv\Scripts\Activate.ps1
```

### Frontend

In a second terminal:

```bash
cd Client
npm install
npm start
```

The Angular application will be available at http://localhost:4200.

The development frontend expects the local backend at `http://localhost:8000`. This value is configured in `Client/src/environments/environment.ts`.

## Tests and Build

Frontend build:

```bash
cd Client
npm run build
```

Frontend unit tests:

```bash
cd Client
npm test
```

Backend checks and tests:

```bash
cd Server/src
python manage.py check
python manage.py test
```

## User Roles

- **Client**: browses arrangements and creates bookings.
- **Agent**: manages assigned arrangements and bookings.
- **Admin**: manages application data, users, bookings, and user activation.

Newly registered users are inactive until they activate their account through the email link. An administrator can also change the `Active` value from the user management screen.
