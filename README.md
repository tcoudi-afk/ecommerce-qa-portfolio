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

## API testová kolekce (Postman/Newman)

Kolekce `postman/ecommerce-api.postman_collection.json` pokrývá `createAccount`,
`verifyLogin`, `productsList` a `searchProduct` – pozitivní, negativní i boundary scénáře,
včetně bezpečnostních a robustness kontrol.

### Architektura kolekce

- **Account** – createAccount a verifyLogin, včetně chained scénářů (účet se vytvoří a
  následně se proti němu ověřuje přihlášení) a negativních/boundary případů.
- **Product** – productsList a searchProduct, včetně kontroly Allow headeru a
  injection-like inputu.
- **Teardown** – po doběhnutí ostatních folderů smaže přes `deleteAccount` účty vytvořené
  v Account folderu, aby se testovací data nehromadila mezi běhy. Jde o **operativní**
  použití endpointu pro úklid, ne o testování `deleteAccount` jako feature – to zůstává mimo
  scope (viz `docs/test-strategy.md`). Requesty v tomto folderu se automaticky přeskočí,
  pokud odpovídající účet v daném běhu vůbec nevznikl (např. při částečném/neúspěšném běhu).
- **Collection-level test** – assertion na transportní HTTP status (200) je definovaná jednou
  na úrovni celé kolekce místo opakování v každém requestu; dva requesty, které záměrně
  testují malformed input, jsou z této kontroly vyloučené.

### Známé zvláštnosti API

- **HTTP 200 i při aplikační chybě.** AutomationExercise API vrací transportní HTTP `200`
  i v případech, kdy JSON tělo deklaruje jiný výsledek (`responseCode`). Skutečný výsledek
  operace se proto vždy ověřuje z `responseCode`/`message` v těle odpovědi, ne z HTTP statusu.
- **Matoucí `Allow` header.** Endpoint `productsList` uvádí v `Allow` headeru `DELETE`/`PUT`,
  ale tyto metody funkčně nepodporuje (vrací stejné `405`, jako jakoukoliv jinou
  nepodporovanou metodu). Zdokumentováno a otestováno přímo v kolekci.
- **Third-party nestabilita.** Aplikace občas vrátí `302` místo očekávané odpovědi
  (viz `docs/automation-notes.md`). Testy tuto situaci rozpoznají a odliší od skutečného
  selhání testu.

### Jak spustit

```bash
cd postman
newman run ecommerce-api.postman_collection.json \
    -e environments/production.postman_environment.json
```

Pro ověření opakovatelnosti (že běh nekoliduje sám se sebou díky teardownu a unikátním
testovacím datům) lze spustit víc iterací najednou:

```bash
newman run ecommerce-api.postman_collection.json \
    -e environments/production.postman_environment.json \
    --iteration-count 5 \
    --delay-request 500
```

CI (`.github/workflows/ci.yml`) spouští kolekci na každý push/PR do `main` s
`--iteration-count 2`. Výsledky ručně spuštěných běhů s vyšším počtem iterací (Postman
Runner i Newman CLI) jsou zdokumentované v [`docs/test-run-evidence.md`](./docs/test-run-evidence.md),
včetně syrového Newman JSON reportu v `docs/evidence/`.

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
│   ├── test-cases/            # testovací scénáře a test case po modulech
│   ├── test-run-evidence.md   # evidence opakovatelnosti (Postman Runner + Newman CLI)
│   └── evidence/               # syrové reporty k evidenci (např. Newman JSON)
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

Viz sekci [API testová kolekce](#api-testová-kolekce-postmannewman) výše pro architekturu
kolekce, známé zvláštnosti testované aplikace a spuštění s více iteracemi.

## Autor

**Tomáš Koudelka** – Senior QA Tester / Test Analyst
[LinkedIn](https://linkedin.com/in/tomas-koudelka-a95aab88/)

Tento projekt vznikl jako praktická ukázka k profilu a jako prostor pro prohloubení
znalostí testovací automatizace nad rámec dosavadní praxe.
