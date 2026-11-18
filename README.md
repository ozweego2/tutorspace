# TutorSpace

Рабочее пространство репетитора: календарь на месяцы, ученики, домашние задания с вложениями, результаты, оплаты и баланс. Версия 1.0.0.

## Быстрый запуск разработки

Нужны Node.js 22.13+ и Git. Проверено на Node.js 24.20.0 в Windows.

```powershell
npm ci
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_purple_omega_flight.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_tutor_integrity.sql
npm run dev
```

Примените каждую миграцию один раз к новой локальной базе. Затем откройте адрес из вывода команды, обычно http://127.0.0.1:5173. Вход локальной разработки имитируется платформенным помощником и недоступен в продуктивной сборке. Рабочая публикация использует настоящий вход с ChatGPT.

## Проверки

```powershell
node scripts/test-tutor.mjs
node node_modules/typescript/bin/tsc --noEmit
npm run build
```

Тесты серверной логики используют временную SQLite в памяти и реальные обработчики API. Они не изменяют рабочие данные. Результат сохраняется в work/api-test-results.json.

## Документация

- docs/USER_GUIDE.md — пользовательские сценарии.
- docs/ARCHITECTURE.md — устройство, API и отличия от исходного ТЗ.
- docs/VERIFICATION.md — результаты проверок и ограничения.

Схема и неизменяемые SQL-миграции находятся в db/ и drizzle/. Обработчики — app/api/. Интерфейс — app/workspace.tsx и app/globals.css. Серверный запуск — worker/index.ts. Интеграцию Sites в сборке следует сохранять.

Ключи и пароли для работы опубликованного приложения в исходниках не нужны. Исходный код не содержит локальную базу, пользовательские вложения и учетные токены. Шрифт Manrope включен локально с открытой лицензией OFL.

Хостинг объявлен в .openai/hosting.json. Повторные публикации должны использовать тот же project_id. Локальная и опубликованная базы независимы; демонстрационные данные тестовой среды не переносятся при публикации.
