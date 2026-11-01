# Следующие чаты

## 9 — Вход + Личный кабинет (паспорт §4, §11 п. 8)
Страницы: `/login` (почта + пароль, «Войти в демо-кабинет»), `/account` (обзор), `/account/requests`, `/account/orders` (таймлайн статусов, «Повторить заказ»), `/account/documents` (PDF), `/account/favorites`, `/account/company` (ИНН, КПП, адреса доставки).
Уже есть: `lib/api.ts` — `login`, `loginDemo`, `logout`, `getKpRequests`, `getOrders`, `getOrder`, `getDocuments`, `updateCompany`; сторы `lib/stores/` (вход, избранное, КП); данные `data/user.json`, `orders.json`, `kp-requests.json`, `documents.json`. Статусы КП 01–04 — как в сводке `/kp/` (`components/kp/KpSteps.tsx`). Картинка входа — `public/pages/base.webp` (обесцвечена в чате 8).
PDF-образцы для «Документов» (`public/docs/`, 2–3 файла) ещё не сделаны — собрать в этом чате (pdf-скилл или reportlab).
Шапка: кнопка кабинета ведёт на `/account/` — без входа редирект на `/login/`.

## Потом — общая проверка
Lighthouse моб. (главная ≥ 85, остальные ≥ 90), битые ссылки, 360 px всех страниц, тексты → `docs/HANDOFF.md`.
