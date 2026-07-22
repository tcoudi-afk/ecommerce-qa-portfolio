# E-commerce QA Portfolio

![CI](https://github.com/<tvuj-github-username>/ecommerce-qa-portfolio/actions/workflows/ci.yml/badge.svg)

## O projektu

Ukázkový QA/testovací projekt postavený nad veřejně dostupným demo e-shopem
[AutomationExercise](https://automationexercise.com). Cílem projektu je ukázat kompletní
testovací proces od analýzy a návrhu testovacích scénářů, přes manuální test case,
až po automatizované UI testy (Playwright) a API testy (Postman/Newman), zapojené
do CI pipeline na GitHubu.

Projekt vznikl jako doplněk k praxi v manuálním testování a testovací strategii –
zaměřuje se hlavně na prohloubení automatizace a demonstraci end-to-end přístupu
k zajištění kvality.

## Testovaná aplikace

- **Web:** https://automationexercise.com
- **API:** https://automationexercise.com/api_list

## Co projekt pokrývá

- **Registrace a přihlášení** – včetně negativních scénářů (duplicitní e-mail, špatné heslo)
- **Vyhledávání a filtrování produktů** – podle kategorie a značky
- **Košík** – přidání, úprava množství, odebrání položek
- **Checkout flow** – zadání adresy, dokončení objednávky
- **API vrstva** – createAccount, verifyLogin, searchProduct, productsList

Podrobné testovací scénáře a test case najdeš ve složce [`docs/test-cases`](./docs/test-cases).

## Tech stack

| Vrstva | Nástroj |
|---|---|
| UI automatizace | Playwright (TypeScript) |
| API testy | Postman / Newman |
| CI/CD | GitHub Actions |
| Testovací dokumentace | Markdown |

## Struktura repozitáře

```
ecommerce-qa-portfolio/
├── docs/
│   ├── test-strategy.md       # testovací strategie a přístup
│   └── test-cases/            # testovací scénáře a test case po modulech
├── postman/                   # API kolekce a prostředí
├── playwright/                # UI automatizace (testy + Page Object Model)
└── .github/workflows/         # CI pipeline
```

## Jak spustit testy lokálně

### Playwright (UI testy)

```bash
cd playwright
npm install
npx playwright test
```

### Postman / Newman (API testy)

```bash
cd postman
npm install -g newman
newman run ecommerce-api.postman_collection.json -e environments/production.postman_environment.json
```

## Autor

**Tomáš Koudelka** – Senior QA Tester / Test Analyst
[LinkedIn](https://linkedin.com/in/tomas-koudelka-a95aab88/)

Tento projekt vznikl jako praktická ukázka k profilu a jako prostor pro prohloubení
znalostí testovací automatizace nad rámec dosavadní praxe.
