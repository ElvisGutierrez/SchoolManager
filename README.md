Clonar repositorio

git clone https://github.com/ElvisGutierrez/SchoolManager.git

Backend

1. cd school
2. composer install
3. cp .env.example .env
4. php artisan key:generate
5. Configurar base de datos en `.env` 
(DB_DATABASE=laravel
DB_USERNAME=root
DB_PASSWORD=***)

6. php artisan migrate --seed
7. php artisan serve

Frontend

1. cd school-dashboard
2. npm install
3.Crear `.env` con:
VITE_GOOGLE_MAPS_API_KEY="Api key"

4. npm run dev

Usuarios de prueba:
admin@test.com
123456

user@test.com
123456
