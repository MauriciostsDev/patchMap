# Deploy do app PatchMap (Android — APK e .aab)

Guia para gerar o **APK** (teste no device) e o **.aab** (Play Store) com Gradle local.

Pré-requisitos na sua máquina:
- Node + dependências instaladas (`npm install` dentro de `frontend/`)
- **JDK 17** e **Android SDK** (via Android Studio)
- Variável `ANDROID_HOME` apontando para o SDK

---

## 1. Apontar para a API de produção (o único passo que muda a cada deploy)

Edite **`app.json`** → `expo.extra.apiUrl` com a URL da sua VM:

```jsonc
"extra": {
  "apiUrl": "https://api.seu-dominio.com"   // ou http://SEU_IP:8000 (ver nota HTTP abaixo)
}
```

> Vazio (`""`) = modo desenvolvimento (usa `10.0.2.2:8000` no emulador).
> Esse é o **único campo** que você precisa trocar antes de gerar o build.

> ⚠️ **HTTP sem HTTPS:** o Android bloqueia tráfego "limpo" (cleartext) por
> padrão. Se a API for `http://` (sem TLS), veja a seção **HTTP em produção** no
> fim. O recomendado é servir a API por **HTTPS** (ver `DEPLOY.md` do backend).

---

## 2. Gerar o projeto nativo Android (uma vez)

A pasta `android/` não é versionada (Continuous Native Generation). Gere com:

```bash
cd frontend
npx expo prebuild --platform android
```

> Rode de novo se mudar `app.json` (nome, ícone, package). **Não** use
> `--clean` depois de configurar a assinatura (passo 3), senão sobrescreve.

---

## 3. Criar a keystore de assinatura (uma vez)

A Play Store exige o app assinado. Gere a sua keystore (guarde-a com cuidado —
**sem ela você não consegue publicar atualizações**):

```bash
keytool -genkeypair -v -keystore patchmap-release.keystore \
  -alias patchmap -keyalg RSA -keysize 2048 -validity 10000
```

Mova `patchmap-release.keystore` para `frontend/android/app/`.

Crie **`frontend/android/keystore.properties`** (NÃO versione — já está no
`.gitignore`):

```properties
storeFile=patchmap-release.keystore
storePassword=SUA_SENHA_DA_STORE
keyAlias=patchmap
keyPassword=SUA_SENHA_DA_CHAVE
```

Edite **`frontend/android/app/build.gradle`** para usar essa assinatura no
release. Dentro de `android { ... }`:

```gradle
    // no topo do bloco android { }
    def keystorePropertiesFile = rootProject.file("keystore.properties")
    def keystoreProperties = new Properties()
    if (keystorePropertiesFile.exists()) {
        keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
    }

    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
        }
    }
    buildTypes {
        release {
            // troque "signingConfig signingConfigs.debug" por:
            signingConfig signingConfigs.release
            // ... (mantenha o resto do bloco release)
        }
    }
```

---

## 4. Gerar o APK (teste no device)

```bash
cd frontend/android
./gradlew assembleRelease        # Windows: .\gradlew assembleRelease
```

Saída: `frontend/android/app/build/outputs/apk/release/app-release.apk`

Instale no device: `adb install -r app-release.apk`

## 5. Gerar o .aab (Play Store)

```bash
cd frontend/android
./gradlew bundleRelease          # Windows: .\gradlew bundleRelease
```

Saída: `frontend/android/app/build/outputs/bundle/release/app-release.aab`

Suba esse `.aab` no **Google Play Console**.

> A cada nova versão, incremente `expo.android.versionCode` (e, se quiser,
> `expo.version`) no `app.json`, rode `expo prebuild` e gere o bundle de novo.

---

## Resumo do fluxo de deploy (já configurado)

```bash
# 1. trocar a URL da API em app.json (extra.apiUrl)
# 2. gerar o bundle:
cd frontend
npx expo prebuild --platform android
cd android && ./gradlew bundleRelease
# 3. subir o .aab na Play Store
```

---

## HTTP em produção (sem HTTPS)

Se a API ficar em `http://` (não recomendado), permita cleartext só para o seu
host. Após `expo prebuild`, crie
`frontend/android/app/src/main/res/xml/network_security_config.xml`:

```xml
<network-security-config>
  <domain-config cleartextTrafficPermitted="true">
    <domain includeSubdomains="true">SEU_IP_OU_DOMINIO</domain>
  </domain-config>
</network-security-config>
```

E referencie no `AndroidManifest.xml` (`<application android:networkSecurityConfig="@xml/network_security_config" ...>`).
Preferível: usar **HTTPS** e evitar isso.
