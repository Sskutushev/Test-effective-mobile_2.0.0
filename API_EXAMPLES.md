# Примеры запросов API

Здесь представлены примеры запросов `curl` для всех реализованных эндпоинтов.

Базовый URL: `http://localhost:5000/api`

## Аутентификация

### 1. Регистрация пользователя

`POST /api/auth/register`

```bash
curl -X POST \
  http://localhost:5000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{ "fullName": "Тестовый Пользователь", "birthDate": "1990-05-15", "email": "user@example.com", "password": "password123" }'
```

### 2. Авторизация пользователя

`POST /api/auth/login`

```bash
curl -X POST \
  http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{ "email": "user@example.com", "password": "password123" }'
```

### 3. Обновление Access Token

`POST /api/auth/refresh`

*   Предполагается, что `refreshToken` установлен в cookie после успешного логина.

```bash
curl -X POST \
  http://localhost:5000/api/auth/refresh \
  --cookie "refreshToken=<ВАШ_REFRESH_TOKEN_ИЗ_КУКИ>"
```

### 4. Выход пользователя

`POST /api/auth/logout`

*   Удаляет `refreshToken` из базы данных и очищает cookie.

```bash
curl -X POST \
  http://localhost:5000/api/auth/logout \
  --cookie "refreshToken=<ВАШ_REFRESH_TOKEN_ИЗ_КУКИ>"
```

## Управление пользователями

*   Для следующих запросов требуется `accessToken` в заголовке `Authorization: Bearer <accessToken>`.

### 1. Получение пользователя по ID

`GET /api/users/:id`

```bash
curl -X GET \
  http://localhost:5000/api/users/1 \
  -H 'Authorization: Bearer <ВАШ_ACCESS_TOKEN>'
```

### 2. Получение списка всех пользователей (только для ADMIN)

`GET /api/users`

```bash
curl -X GET \
  http://localhost:5000/api/users \
  -H 'Authorization: Bearer <ВАШ_ACCESS_TOKEN>'
```

### 3. Блокировка пользователя (только для ADMIN)

`PATCH /api/users/:id/block`

```bash
curl -X PATCH \
  http://localhost:5000/api/users/2/block \
  -H 'Authorization: Bearer <ВАШ_ACCESS_TOKEN>'
```
