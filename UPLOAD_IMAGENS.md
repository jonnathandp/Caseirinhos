# Upload de Imagens de Produtos

## Funcionalidade Implementada

O sistema de cadastro de produtos agora suporta upload de arquivos diretamente do dispositivo ao invés de URLs.

### Características:

1. **Upload Local**: Os arquivos são salvos na pasta `public/uploads/produtos/`
2. **Validação de Tipo**: Aceita apenas imagens (JPG, PNG, GIF, WebP)
3. **Validação de Tamanho**: Máximo 5MB por arquivo
4. **Nome Único**: Arquivos são renomeados usando hash MD5 para evitar conflitos
5. **Preview**: Visualização da imagem antes de salvar
6. **Interface Amigável**: Campo de upload com drag & drop

### Arquivos Modificados:

- `app/produtos/page.tsx`: Interface de upload e preview
- `app/api/upload/route.ts`: API para processar uploads
- `public/uploads/produtos/`: Diretório para armazenar imagens

### Como Usar:

1. Acesse a página de produtos
2. Clique em "Novo Produto" ou edite um existente
3. No campo "Imagem do Produto", clique em "Escolher arquivo"
4. Selecione uma imagem do seu dispositivo
5. A imagem será mostrada em preview
6. Salve o produto normalmente

### Segurança:

- Validação de tipo MIME no frontend e backend
- Limitação de tamanho de arquivo
- Nomes únicos previnem sobrescrita
- Sanitização de entrada

### Estrutura de Pastas:

```
public/
  uploads/
    produtos/
      [hash].jpg
      [hash].png
      ...
```

As imagens ficam acessíveis via URL: `/uploads/produtos/[nome-arquivo]`