# ▶️ Como rodar o PatchMap (estado atual)

Guia de execução do projeto **como ele está hoje** (Fase 3 — integração
frontend ↔ backend concluída no MVP). Para o contexto/arquitetura, ver
[`docs/00 - Índice.md`](docs/00%20-%20Índice.md) e
[`docs/Integração Frontend-Backend.md`](docs/Integra%C3%A7%C3%A3o%20Frontend-Backend.md).

> **TL;DR**
> 1. Backend (repo próprio [patchMapApi](https://github.com/MauriciostsDev/patchMapApi)):
>    `git clone` → venv → `migrate` → `seed_data` → `runserver 0.0.0.0:8000`
> 2. Frontend: `cd frontend` → `npm install` → `npx expo run:android` (**dev build**, não Expo Go)
> 3. Login no app: **`admin@patchmap.com` / `123456`**

> 📦 **O backend vive em outro repositório:**
> <https://github.com/MauriciostsDev/patchMapApi>. Este repo (`patchMap`) tem só o
> **frontend** + a documentação. Clone os dois lado a lado.

---

## 0. Pré-requisitos

| Ferramenta | Versão usada | Observação |
|---|---|---|
| Python | 3.13 | backend Django |
| Node.js | 18+ | frontend Expo |
| JDK | 21 (Temurin) | build Android (`JAVA_HOME`) |
| Android SDK | via Android Studio | `ANDROID_HOME` apontando p/ o SDK |
| Emulador | Pixel_9a (API 37, **páginas de 16KB**) | ou device físico |

> ⚠️ **Por que não Expo Go?** O emulador (Android 15+/16) usa **páginas de
> 16 KB**. O Expo Go da Play Store **não é alinhado a 16 KB** e mostra um aviso
> de incompatibilidade a cada abertura. Por isso rodamos um **development build**
> (APK nativo próprio, SDK 53 / RN 0.79 com libs alinhadas). Ver
> [`docs/decisoes/0001 - Stack do Frontend`] e a nota de ambiente do projeto.

---

## 1. Backend (Django + DRF + JWT) — repo [patchMapApi](https://github.com/MauriciostsDev/patchMapApi)

Por padrão usa **SQLite** (não precisa de Postgres para desenvolver).

```powershell
# clone o repositório do backend (ao lado do patchMap)
git clone https://github.com/MauriciostsDev/patchMapApi.git
cd patchMapApi

# venv + dependências
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt

# banco + dados reais (ver "Seed" abaixo)
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py seed_data

# servidor — 0.0.0.0 p/ o emulador alcançar via 10.0.2.2
.\.venv\Scripts\python.exe manage.py runserver 0.0.0.0:8000
```

No Linux/macOS troque `.\.venv\Scripts\python.exe` por `.venv/bin/python`.

**Verificar:**
- API: <http://localhost:8000/sectors/>
- Admin Django: <http://localhost:8000/admin/> — `admin@patchmap.com` / `123456`
- Login: `POST http://localhost:8000/auth/login` `{ "email": "...", "password": "..." }`

### 1.1 Seed (dados reais — SETHAS) e como rodar localmente

`python manage.py seed_data` popula o banco com os dados reais importados da
planilha **"Pontos sethas"**:

| Entidade | Qtde |
|---|---|
| Setores | 26 |
| Patch panels (A–F) | 6 |
| Switches (CORE, GEREN-01/02/03-SW, DIST-01/02-SW) | 6 |
| VLANs | 0 *(não havia no PDF)* |
| Conexões | **209** |

Regras e detalhes da importação: [[docs/Seed de Dados|Seed de Dados]].

```powershell
# rodar a seed (cria/atualiza tudo; é destrutivo p/ as tabelas de dados:
# limpa setores/painéis/switches/VLANs/conexões e recria — o admin é mantido)
.\.venv\Scripts\python.exe manage.py seed_data
```

> ⚠️ O `seed_data` **apaga e recria** os dados de topologia/conexões a cada
> execução (idempotente, sempre chega no mesmo estado). O superusuário
> `admin@patchmap.com` é preservado. Use SQLite local (`db.sqlite3`) — basta
> não definir `DATABASE_URL`.

**Resetar o banco do zero (se quiser):**
```powershell
del db.sqlite3
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py seed_data
```

---

## 2. Frontend (Expo SDK 53 — development build)

```powershell
cd frontend
npm install
```

Garanta que o Android SDK está localizável (uma das opções):
- definir `ANDROID_HOME` (ex.: `C:\Users\<você>\AppData\Local\Android\Sdk`), **ou**
- criar `frontend/android/local.properties` com
  `sdk.dir=C:\\Users\\<você>\\AppData\\Local\\Android\\Sdk`
  *(o `android/` é gerado no primeiro build — ver abaixo)*

Com o **emulador aberto** (ou device USB com depuração ativa):

```powershell
npx expo run:android
```

Na primeira vez isso:
1. gera o projeto nativo (`expo prebuild`) em `frontend/android/`;
2. compila o APK com o Gradle (baixa dependências — pode levar alguns minutos);
3. instala e abre o app no emulador;
4. sobe o **Metro** (porta 8081) para servir o JS.

> O `frontend/android/` é **gerado** (não versionado — _Continuous Native
> Generation_). Para recriar do zero: `npx expo prebuild --clean --platform android`.

### Recompilar / rodar depois
- Só mudou JS/TS → o Metro faz _fast refresh_; se precisar, reabra o app.
- Mudou dependência nativa/config → rode `npx expo run:android` de novo.

---

## 3. Usar o app

1. Abra o app no emulador → tela de **Login**.
2. Entre com **`admin@patchmap.com` / `123456`** (autenticação real via JWT).
3. A lista troca do seed local pelos **209 pontos reais do backend** (SETHAS);
   o badge no topo mostra **Sincronizado**.
4. Abas: **Pontos** (lista/busca), **VLANs**, **Painel** (racks dos patch panels A–F).
5. Criar/editar/excluir um ponto sincroniza com o backend (POST/PUT/DELETE).
   Offline, fica pendente (`dirty`) e reenvia ao tocar no badge de sync.

### Endereço do backend visto pelo app
| Plataforma | Base URL |
|---|---|
| Emulador Android | `http://10.0.2.2:8000` |
| Web / iOS Simulator | `http://localhost:8000` |
| Override | `expo.extra.apiUrl` ou `EXPO_PUBLIC_API_URL` |

Resolução automática em `frontend/src/api/config.ts`. O `10.0.2.2` já está em
`ALLOWED_HOSTS` do Django.

---

## 3.5 Rodar tudo pelo Android Studio (fluxo atual)

O **Android Studio** entra para fornecer o **SDK do Android** e o **emulador**.
O backend e o Metro continuam rodando no **terminal** (o Android Studio não roda
Python nem o bundler JS). Passo a passo:

**1) Subir o emulador**
- Android Studio → **More Actions ▸ Virtual Device Manager** (ou ícone de
  celular) → dê **▶ Play** no AVD **Pixel_9a** (API 37, 16 KB).
- Espere o Android iniciar por completo.

**2) Subir o backend** (terminal próprio, no `patchMapApi`)
```powershell
cd patchMapApi
.\.venv\Scripts\python.exe manage.py runserver 0.0.0.0:8000
```

**3) Buildar e rodar o app** — duas opções:

**Opção A (recomendada — terminal):** no `frontend`, com o emulador aberto:
```powershell
cd frontend
npx expo run:android
```
Isso compila, instala e abre o app, e sobe o Metro. Simples e suficiente.

**Opção B (pela IDE):** abrir o projeto nativo no Android Studio:
1. Rode o Metro num terminal: `cd frontend; npx expo start`.
2. Android Studio → **Open** → selecione a pasta **`frontend/android`**.
3. Aguarde o **Gradle sync** terminar.
4. Selecione o device (Pixel_9a) na barra superior e clique **▶ Run 'app'**.
   - O Android Studio buila o APK e instala; o app conecta no Metro (passo 1).
   - Se reclamar do SDK, confira `frontend/android/local.properties`
     (`sdk.dir=...`) — ver seção 2.

> 💡 Para **só desenvolver** (mexer em JS/TS), depois do primeiro build basta
> deixar o **Metro rodando** (`npx expo start`) e reabrir o app no emulador —
> o _fast refresh_ recarrega sem rebuildar. Só refaça o build nativo
> (`run:android` ou Run no AS) ao mudar dependência nativa/config.

> ⚠️ **Não** use o botão de rodar pensando em **Expo Go** — no emulador 16 KB
> ele não funciona. O fluxo é sempre o **dev build** (APK próprio).

---

## 4. Docker

O [`docker-compose.yml`](docker-compose.yml) deste repo sobe **apenas o
frontend web**. O backend + Postgres ficam no repo
[patchMapApi](https://github.com/MauriciostsDev/patchMapApi) (rode a API de lá).

> O caminho **recomendado para o app mobile** continua sendo o **dev build**
> (seção 2), porque o emulador exige libs 16 KB que só o build nativo entrega.

---

## 5. Problemas comuns

| Sintoma | Causa / solução |
|---|---|
| Aviso "App isn't 16 KB compatible" | Está abrindo pelo **Expo Go**. Use o dev build (`npx expo run:android`). |
| "Unable to load script" no app | Metro não está rodando. Rode `npx expo start` (ou `run:android`) e dê _reload_. |
| Login falha / lista não carrega | Backend no ar em `0.0.0.0:8000`? Emulador alcança `10.0.2.2`? |
| Gradle: "SDK location not found" | Defina `ANDROID_HOME` ou crie `android/local.properties` (seção 2). |
| Painel vazio | Faça login (os painéis vêm da topologia do backend após o login). |

---

Credenciais, contrato da API e detalhes de sync estão em
[`docs/API Backend.md`](docs/API%20Backend.md) e
[`docs/Integração Frontend-Backend.md`](docs/Integra%C3%A7%C3%A3o%20Frontend-Backend.md).
