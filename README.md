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
- `ERP_API_TOKEN`: token da API do ERP, usado somente no servidor da loja para validar login de clientes.
- `CUSTOMER_SESSION_SECRET`: segredo forte para assinar o cookie da area do cliente.
- `OPENAI_API_KEY`: chave da OpenAI usada no endpoint server-side de visualizacao de rodas.
- `OPENAI_IMAGE_MODEL`: modelo de imagem. Padrao: `gpt-image-1`.

## Deploy

Conecte este repositorio/pasta na Vercel e configure as variaveis acima.
