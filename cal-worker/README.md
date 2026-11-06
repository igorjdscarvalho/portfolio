# Endpoint seguro do Cal.com

Este Worker guarda a chave do Cal.com no servidor. O site consulta os booking fields do evento e envia as respostas e os participantes adicionais pelo Worker. Os nomes, opções, tipos e obrigatoriedade dos campos vêm do evento publicado no Cal.com.

## Publicar no Cloudflare Workers

1. Instale e autentique o Wrangler na sua máquina: `npm install -g wrangler` e `wrangler login`.
2. Nesta pasta, publique o Worker: `wrangler deploy`.
3. Cadastre a chave da API do Cal.com como segredo: `wrangler secret put CAL_API_KEY`.
4. Copie a URL `https://igor-cal-booking.<sua-conta>.workers.dev` exibida pelo Wrangler.
5. Em `js/cal.js`, substitua `https://YOUR-WORKER.workers.dev` pela URL publicada.
6. Publique o site atualizado.

O token deve ter as permissões `EVENT_TYPE_READ` e `BOOKING_WRITE`. Não coloque o token no JavaScript do site.

`ALLOWED_ORIGIN` em `wrangler.toml` está definido como `https://igorjdscarvalho.github.io`. Se o site for servido por outro domínio, altere esse valor antes de publicar.

O `eventTypeId` permanece `7806199` em `js/cal.js` e no Worker. Atualize ambos se trocar o tipo de evento.
