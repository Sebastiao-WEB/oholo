# Build do APK (Expo / Oholo)

Este documento descreve como gerar um ficheiro **.apk** instalável em Android, usando o ícone em `assets/img/icon.png` como ícone da app no dispositivo (configurado em `app.json`).

## Pré-requisitos

- Conta em [expo.dev](https://expo.dev) (para **EAS Build** na cloud).
- Node.js e dependências do projecto instaladas (`npm install` na pasta `mobile`).

## Configuração já definida no projecto

| Item | Onde |
|------|------|
| Ícone da app (launcher) | `app.json` → `expo.icon`, `expo.android.icon` |
| Ícone adaptativo (Android 8+) | `app.json` → `expo.android.adaptiveIcon` (mesma imagem + fundo `#0A2547`) |
| Splash | `app.json` → `expo.splash` |
| ID da app Android | `expo.android.package` → `com.oholo.app` |
| Perfil APK | `eas.json` → perfil `apk` (`buildType: apk`) |
| Script npm | `package.json` → `npm run build:apk` |

**Nota:** Para a Play Store costuma usar-se **AAB** (perfil `production` no `eas.json`). O perfil `apk` serve para instalação directa (testes, partilha).

---

## Opção A — EAS Build (recomendado)

Build na cloud da Expo; não precisas do Android Studio instalado na máquina.

### 1. Instalar e iniciar sessão

```bash
cd mobile
npx eas-cli@latest login
```

### 2. Configurar o projecto (só na primeira vez)

```bash
npx eas-cli@latest build:configure
```

Se pedido, aceita criar o projecto EAS; pode ser adicionado um `projectId` em `app.json` sob `expo.extra.eas`.

### 3. Disparar o build APK

```bash
npm run build:apk
```

Equivalente:

```bash
npx eas-cli@latest build -p android --profile apk
```

### 4. Obter o ficheiro

No terminal ou na página do build em [expo.dev](https://expo.dev), descarrega o **.apk** gerado.

### Incrementar versão para novas instalações

- Em `app.json`: aumenta `expo.version` (ex.: `1.0.1`) e, no Android, `expo.android.versionCode` (inteiro que **só aumenta**, ex.: `2`, `3`, …).

---

## Opção B — Build local (Gradle)

Gera a pasta `android/` e compilas na tua máquina (requer Android SDK / ambiente configurado).

### 1. Gerar projecto nativo

```bash
cd mobile
npx expo prebuild --platform android
```

### 2. Compilar release

```bash
cd android
./gradlew assembleRelease
```

O APK costuma ficar em:

`android/app/build/outputs/apk/release/app-release.apk`

*(Em Windows, usa `gradlew.bat` em vez de `./gradlew`.)*

---

## Ícone e qualidade

- O Expo espera sobretudo uma imagem **quadrada**; o ideal para lojas é **1024×1024 px** em PNG.
- Ícones **adaptativos** cortam as margens: convém o logótipo estar **centrado** na imagem.
- Se o ficheiro `icon.png` for muito pesado, considera comprimir sem perder legibilidade.

---

## Alterar o identificador da app

Se precisares de outro `applicationId` (ex.: conflito na Play Store ou nome de pacote único), edita em `app.json`:

```json
"android": {
  "package": "com.teu.dominio.oholo"
}
```

Depois volta a correr o build (e, em builds locais, pode ser necessário `expo prebuild` de novo se já tinhas gerado `android/`).

---

## Resumo rápido (EAS)

```bash
cd mobile
npm install
npx eas-cli@latest login
npx eas-cli@latest build:configure   # primeira vez
npm run build:apk
```
