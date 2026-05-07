# Como gerar o APK do LavaJatoAgenda (EAS Build — Preview)

Tudo já está configurado no projeto:
- `app.json` → `android.package = "com.brunodwd.lavajatoagenda"`, tema dark, plugin `expo-sqlite`
- `eas.json` → perfil `preview` que produz **APK** instalável direto (sem Play Store)
- `eas-cli` instalado em `devDependencies`

Você só precisa rodar os passos abaixo **no seu computador** (não dá para fazer login pela sua conta a partir do ambiente Emergent).

---

## 1) Criar conta Expo (gratuita)

1. Acesse → https://expo.dev/signup
2. Cadastre-se com email + senha **OU** clique em "Continue with GitHub" / "Continue with Google".
3. Confirme o email se pedido.
4. Pronto — você está logado em https://expo.dev e tem um *username* (ex: `brunodwd`). Anote-o.

> **Custo**: a conta é grátis. O plano free inclui ~30 builds Android/mês na fila gratuita (pode demorar 10–30 min). Builds prioritárias são pagas, mas você não precisa delas agora.

---

## 2) Baixar o código do projeto

No app do Emergent, clique em **"Save to Github"** (canto superior direito) e exporte o repositório, ou baixe o ZIP do código.

No seu computador:
```bash
git clone <seu-repo-do-github>
cd <pasta-do-projeto>/frontend
```

> Se você usar o Emergent como repositório próprio, é só clonar o link do GitHub que ele criou.

---

## 3) Instalar dependências

Pré-requisito: **Node.js 20+** instalado (https://nodejs.org).

```bash
# dentro de /frontend
yarn install
# ou: npm install
```

---

## 4) Login no EAS

```bash
npx eas-cli login
```

Cole o **email/usuário e senha** da conta Expo que você criou no passo 1. Você verá:

```
Logged in as brunodwd
```

---

## 5) Configurar o projeto no EAS (1ª vez apenas)

```bash
npx eas-cli init
```

Isso cria automaticamente o **projeto na sua conta Expo** e adiciona o `extra.eas.projectId` no `app.json`. Aceite com `y` quando perguntar.

> Se ele perguntar sobre conflito de package name, aceite manter `com.brunodwd.lavajatoagenda`.

---

## 6) Rodar a build do APK

```bash
npx eas-cli build --platform android --profile preview
```

O que acontece:
1. Ele faz upload do código para os servidores Expo.
2. Roda o Gradle/Android SDK na nuvem (você não precisa ter Android Studio instalado).
3. Em ~10–25 minutos a build termina e mostra um link tipo:
   ```
   ✔ Build finished
   📱 Android app:
   https://expo.dev/artifacts/eas/abc123.apk
   ```

> **Dica**: deixe o terminal aberto. Você também pode acompanhar em https://expo.dev/accounts/<seu-username>/projects/lavajato-agenda/builds.

---

## 7) Instalar o APK no celular Android

**Opção A — direto pelo link:**
1. Abra o link do APK no Chrome do **celular**.
2. Baixe o arquivo `.apk`.
3. Toque no arquivo → o Android pedirá permissão "Instalar de fontes desconhecidas" → habilite para o Chrome (ou gerenciador de arquivos).
4. Confirme a instalação. Pronto, o app aparece na gaveta com o nome **LavaJatoAgenda**.

**Opção B — via QR code:**
- Na página da build em expo.dev, clique em "Install" → leia o QR code com a câmera do celular.

**Opção C — via ADB (cabo USB, modo desenvolvedor):**
```bash
adb install caminho/para/lavajato-agenda.apk
```

---

## 8) Atualizações futuras

Sempre que mudar o código:

```bash
# para mudanças nativas (raras): bump versionCode e build novo APK
npx eas-cli build --platform android --profile preview

# para mudanças só de JS/UI: pode usar EAS Update (não exige nova build)
npx eas-cli update --branch preview --message "ajuste no layout"
```

---

## Compatibilidade Android

- ✅ Android 8.0+ (Oreo, API 26+) — vem do Expo SDK 54
- ✅ Funciona offline (banco local SQLite)
- ✅ Não pede permissões (não usa câmera, GPS, etc.)

---

## Problemas comuns

| Erro | Solução |
|---|---|
| `eas: command not found` | Use `npx eas-cli ...` em vez de `eas ...` |
| Build falha com "package conflict" | Já tem outro app com `com.brunodwd.lavajatoagenda`? Mude no `app.json` |
| "Você atingiu o limite de builds gratuitas" | Aguarde reset mensal ou faça upgrade no plano Expo |
| App instala mas trava na splash | Rode `npx expo-doctor` no projeto para checar deps |

---

Qualquer dúvida durante o processo, me chame que ajudo no passo específico.
