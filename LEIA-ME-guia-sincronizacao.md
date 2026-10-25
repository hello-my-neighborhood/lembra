# Lembra no computador e sincronização pelo Google Drive

O celular e o computador passam a guardar os mesmos dados num arquivo do **seu** Google Drive
(`lembra-sync.json`, visível em "Meu Drive"). Não há servidor nosso no meio.

O que sincroniza: tarefas, projetos, áreas, hábitos, metas, Dia a dia (sem as capas), registros,
lixeira e quase todas as configurações (menos o visual de cada aparelho).
O que **não** sincroniza: capas das mídias, fotos do Foco, lembretes agendados (cada aparelho agenda os seus).

Em qualquer dúvida, o arquivo é só um backup em JSON: dá para baixar do Drive e importar em Ajustes › Dados.

---

## Parte 1 — Google Cloud (uma vez só, uns 15 minutos)

1. Entre em https://console.cloud.google.com com a sua conta Google e crie um projeto chamado **Lembra**.
2. Menu **APIs e serviços › Biblioteca** → procure **Google Drive API** → **Ativar**.
3. **Google Auth Platform** (antes "Tela de permissão OAuth"):
   - **Marca**: nome "Lembra" e o seu e-mail.
   - **Público-alvo**: *Externo*, e deixe em **Teste**.
   - **Usuários de teste**: adicione **o seu próprio e-mail** (só ele precisa).
   - **Acesso a dados › Adicionar escopo**: `https://www.googleapis.com/auth/drive.file`
     (dá ao Lembra acesso **só aos arquivos que ele mesmo criar**, nunca ao resto do seu Drive).
4. **Clientes › Criar cliente**:
   - **Aplicativo da Web**, nome "Lembra Web". Em **Origens JavaScript autorizadas** coloque o endereço
     onde você vai hospedar o app no computador (Parte 2), por exemplo `https://lembra-seunome.netlify.app`.
     Copie o **ID do cliente** (termina em `.apps.googleusercontent.com`). É ele que você cola no app, nos dois aparelhos.
   - **Android**, nome "Lembra Android": **nome do pacote** = o `appId` do seu projeto Capacitor
     (está em `capacitor.config.json`) e a **SHA-1** da chave com que você assina o APK.
     Para a chave de teste: na pasta `android`, rode `./gradlew signingReport` e copie a SHA-1 de `debug`.
     (Se um dia você assinar com outra chave, crie outro cliente Android com a nova SHA-1.)

## Parte 2 — Computador

1. Hospede a pasta **lembra-desktop** (do zip) num endereço `https`. O jeito mais simples é
   https://app.netlify.com/drop: arraste a pasta e ele devolve um endereço. (GitHub Pages também serve.)
2. Volte ao passo 4 da Parte 1 e coloque esse endereço em **Origens JavaScript autorizadas** do cliente Web.
3. Abra o endereço no **Chrome ou Edge** e clique no ícone de instalar na barra de endereço: o Lembra vira um app com janela própria.
4. No Lembra: **Ajustes › Sincronização** → cole o ID do cliente Web → **Conectar ao Drive** → entre com o Google.
   Como o app está em modo Teste, o Google mostra "app não verificado": **Avançado › Acessar Lembra**.
5. No computador a permissão dura cerca de 1 hora. Passado isso, o Lembra mostra "Toque em Sincronizar agora": é um clique.

No computador o menu lateral fica sempre à vista. Atalhos: **N** nova tarefa · **Ctrl+K** busca · botão direito numa área: opções.

## Parte 3 — Celular (Android)

1. Na pasta do projeto Capacitor:
   ```
   npm install @capgo/capacitor-social-login
   ```
   No `capacitor.config.json` (ou `.ts`), dentro de `plugins`, deixe só o Google ligado:
   ```json
   "plugins": { "SocialLogin": { "providers": { "google": true, "apple": false, "facebook": false, "twitter": false } } }
   ```
2. Troque o conteúdo de `android/app/src/main/java/.../MainActivity.java` por isto
   (**mantenha a primeira linha `package ...` do seu arquivo**):
   ```java
   import android.content.Intent;
   import com.getcapacitor.BridgeActivity;
   import com.getcapacitor.Plugin;
   import com.getcapacitor.PluginHandle;
   import ee.forgr.capacitor.social.login.GoogleProvider;
   import ee.forgr.capacitor.social.login.ModifiedMainActivityForSocialLoginPlugin;
   import ee.forgr.capacitor.social.login.SocialLoginPlugin;

   public class MainActivity extends BridgeActivity implements ModifiedMainActivityForSocialLoginPlugin {
       @Override
       public void onActivityResult(int requestCode, int resultCode, Intent data) {
           super.onActivityResult(requestCode, resultCode, data);
           if (requestCode >= GoogleProvider.REQUEST_AUTHORIZE_GOOGLE_MIN
                   && requestCode < GoogleProvider.REQUEST_AUTHORIZE_GOOGLE_MAX) {
               PluginHandle handle = getBridge().getPlugin("SocialLogin");
               if (handle == null) return;
               Plugin plugin = handle.getInstance();
               if (plugin instanceof SocialLoginPlugin) {
                   ((SocialLoginPlugin) plugin).handleGoogleLoginIntent(requestCode, data);
               }
           }
       }
       @Override
       public void IHaveModifiedTheMainActivityForTheUseWithSocialLoginPlugin() {}
   }
   ```
3. Troque o `www/index.html` pelo novo, rode `npx cap sync android` e gere/instale o APK.
4. No Lembra do celular: **Ajustes › Sincronização** → cole o **mesmo** ID do cliente Web → **Conectar ao Drive** → escolha a conta.

### Primeira conexão
Se já existir cópia no Drive e o aparelho também tiver dados, o app pergunta: **Juntar**, **Usar a do Drive** (apaga os dados do aparelho)
ou **Usar a daqui** (substitui a do Drive). Num aparelho novo e vazio ele usa a cópia do Drive sozinho.

### Se der erro
| Mensagem | O que costuma ser |
|---|---|
| `[28444] Developer console is not set up correctly` | pacote ou SHA-1 do cliente Android não bate com o APK instalado; ou o ID colado não é o do cliente **Web** |
| `access_denied` / "app não verificado" sem opção de continuar | seu e-mail não está em **Usuários de teste** |
| "origin is not allowed" no computador | o endereço do app não está nas **Origens JavaScript autorizadas** (precisa ser idêntico, sem barra no fim) |
| "O plugin de login do Google não está instalado" | faltou o `npm install` + `npx cap sync` da Parte 3 |
| "Drive respondeu 403" | a **Google Drive API** não foi ativada (Parte 1, passo 2) |

Mudanças feitas sem internet ficam no aparelho e sobem sozinhas quando voltar a conexão.
Se os dois aparelhos mudarem **o mesmo item** ao mesmo tempo, vale a alteração mais recente daquele item inteiro.
