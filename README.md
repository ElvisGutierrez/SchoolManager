Clonar repositorio

git clone https://github.com/ElvisGutierrez/SchoolManager.git

Backend

cd school
composer install
cp .env.example .env
php artisan key:generate

Configurar base de datos en `.env` 
(DB_DATABASE=laravel
DB_USERNAME=root
DB_PASSWORD=***)

php artisan migrate --seed
php artisan serve

Frontend

cd school-dashboard
npm install

Crear `.env` con:

VITE_GOOGLE_MAPS_API_KEY="Api key"

npm run dev

Usuarios de prueba:
admin@test.com
123456

user@test.com
123456
