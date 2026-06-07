# Neto Rodas Store

Loja online separada do ERP, criada com Next.js e pronta para deploy na Vercel.

## Desenvolvimento

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Variaveis da Vercel

- `NEXT_PUBLIC_ERP_API_URL`: endpoint publico do ERP. Exemplo: `https://erp-netorodas.online/api/public/products`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`: WhatsApp com codigo do pais e DDD. Exemplo: `5575991665469`
- `ERP_API_BASE_URL`: endpoint protegido do ERP. Exemplo: `https://erp-netorodas.online/api`
- `ERP_API_TOKEN`: token da API do ERP, usado somente no servidor da loja para sincronizar o cliente com o CRM.
- `NEXT_PUBLIC_SUPABASE_URL`: URL do projeto Supabase.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: chave publica/publishable do Supabase.
- `SUPABASE_SECRET_KEY`: chave secreta do Supabase, usada somente nas rotas server-side. Nunca exponha no navegador.
- `IP_GEOLOCATION_API_URL`: endpoint opcional para detectar cidade/UF pelo IP. Use `{ip}` como placeholder. Padrao: `https://ipwho.is/{ip}`.
- `OPENAI_API_KEY`: chave da OpenAI usada no endpoint server-side de visualizacao de rodas.
- `OPENAI_IMAGE_MODEL`: modelo de imagem. Padrao: `gpt-image-1`.

## Deploy

1. Crie um projeto no Supabase.
2. Abra o SQL Editor e execute `supabase/schema.sql`.
3. Copie a URL, a publishable key e a service role key para as variaveis da Vercel.
4. Configure tambem `ERP_API_BASE_URL` e `ERP_API_TOKEN`.
5. Conecte este repositorio/pasta na Vercel e publique.

O Supabase armazena contas, senhas e sessoes. O ERP continua armazenando CRM, enderecos, vendas e historico comercial, vinculados pelo `erp_customer_id`.
