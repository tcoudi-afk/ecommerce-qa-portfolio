# CLAUDE.md

Kontext pro Claude Code při práci na tomto repu. Přečti si tento soubor vždy na
začátku session.

## O projektu

QA/testovací portfolio postavené nad veřejným demo e-shopem
[AutomationExercise](https://automationexercise.com). Cíl: ukázat kompletní
testovací proces – testovací scénáře, manuální test case, automatizované UI
testy (Playwright) a API testy (Postman/Newman), zapojené do CI na GitHubu.

Autor: Tomáš Koudelka, senior QA tester/test analytik s 8+ lety praxe
(manuální testování, testovací strategie, solution design). Automatizace
(hlavně Playwright) je oblast, kde si teprve buduje praxi – proto na ní chce
pracovat postupně a s porozuměním, ne mít jen hotový vygenerovaný kód.

## Jak se mnou (Claude Code) v tomhle projektu pracovat

- **Postupuj po malých krocích**, ne rovnou celé řešení najednou – hlavně
  u Playwright testů.
- **Nejdřív vysvětli princip**, pak nech uživatele zkusit vlastní pokus,
  teprve poté dělej review a navrhuj úpravy.
- Neimplementuj mlčky rozsáhlé změny bez vysvětlení – uživatel musí umět
  každé rozhodnutí (proč tenhle test case, proč tahle struktura) zdůvodnit
  vlastními slovy, klidně na pohovoru.
- U Postman kolekce a testovacích scénářů/test case (kde má uživatel víc
  zkušeností) může být tempo rychlejší.
- Commit historie může obsahovat i opravy chyb ("první verze nefungovala,
  opraveno protože X") – nejde o to mít uměle perfektní lineární historii.

## Testovaná aplikace

- Web: https://automationexercise.com
- API: https://automationexercise.com/api_list
- Oficiální referenční test case: https://automationexercise.com/test_cases

## Rozsah projektu

1. Registrace a přihlášení (vč. negativních scénářů – duplicitní e-mail,
   špatné heslo)
2. Vyhledávání a filtrování produktů (kategorie, značka)
3. Košík – přidání, úprava množství, odebrání
4. Checkout flow – adresa, dokončení objednávky
5. API vrstva – createAccount, verifyLogin, searchProduct, productsList

Vědomě mimo rozsah (kvůli 5denní timeline): platební brány, multi-currency,
wishlist, review systém.

## Tech stack a konvence

- **Playwright** v TypeScript, struktura **Page Object Model**
  (`playwright/pages/`), testy v `playwright/tests/*.spec.ts`
- Testovací data odděleně ve `playwright/fixtures/`
- **Postman/Newman** kolekce v `postman/`, prostředí v
  `postman/environments/`
- **GitHub Actions** – workflow v `.github/workflows/ci.yml`, spouští
  Playwright i Newman testy při push/PR
- Testovací scénáře a test case v `docs/test-cases/`, po modulech (viz
  rozsah výše), formát podle skillu `senior-test-analyst`
- Pojmenování testů popisné, ne číslované (`test_login_with_invalid_password`,
  ne `test_1`)
- Žádné pevné `sleep()` v Playwright testech – vždy explicitní čekání na
  podmínku

## Co NEdělat

- Negenerovat celé sady testů najednou bez zastavení na review
- Nepoužívat druhého agenta/subagenta na "tichou" kontrolu bez zapojení
  uživatele (viz přístup výše) – zatím jednoduchý mód, review dělá uživatel
- Neukládat žádné citlivé údaje (hesla, tokeny) natvrdo v kódu, i když jde
  o demo web
