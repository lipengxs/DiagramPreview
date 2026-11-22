# Configurações do espaço de trabalho — especificação

> Exemplo independente do DiagramPreview. Adapte ao produto; não é um formato oficial do Figma.

## Objetivo e escopo
Permitir que o proprietário altere o nome e a preferência de notificações.
Não inclui cobrança, convites nem gestão de permissões.
Usar dados fictícios sem conectar à produção.

## Tokens de design
- Ação principal: #1D4ED8 com texto branco.
- Texto: #0F172A sobre #FFFFFF; secundário: #475569; erro: #B91C1C.
- Fonte: system-ui; corpo 16px / 24px; título 24px / 32px.
- Espaçamentos: 4, 8, 12, 16, 24, 32px; raio do cartão: 8px.
- Usar tokens nomeados, sem adicionar cores ou espaços arbitrários.

## Componentes e estados
### Botão Salvar
- Padrão: “Salvar alterações”, com fundo principal.
- Ao passar o cursor: #1E40AF com texto branco legível.
- Foco: contorno visível de 2px com afastamento de 2px.
- Desativado sem alterações ou com dados inválidos; explicar os erros junto ao campo.
- Salvando: mostrar mensagem e impedir envios duplicados.
- Sucesso: anunciar “Alterações salvas” em uma região dinâmica.
- Em caso de erro, preservar os dados e permitir tentar novamente.
### Nome do espaço
- Obrigatório, de 2 a 60 caracteres após remover espaços externos.
- Rótulo e ajuda visíveis; texto de exemplo não substitui o rótulo.
- Validar ao perder o foco e antes de salvar; associar erros ao campo.
- Não salvar dados inválidos.

## Interação e dados
1. Carregar o nome e a preferência atuais.
2. Ativar Salvar apenas com valores válidos e alterados.
3. Simular uma requisição e indicar o carregamento.
4. No sucesso, manter valores confirmados e anunciar a conclusão.
5. Na falha, preservar o rascunho e permitir tentar novamente.
- Carregamento inicial: mostrar indicador com texto.
- Falha inicial: permitir tentar novamente sem inventar dados salvos.
- Se o nome estiver vazio, mostrar mensagem de campo obrigatório.

## Layout responsivo
- Abaixo de 768px: uma coluna, margem de 16px e botão com largura total.
- A partir de 768px: formulário centralizado, largura máxima 640px e margem de 24px.
- Com largura de 320px: sem rolagem horizontal.

## Acessibilidade
- Cada entrada tem rótulo programático; Tab segue a ordem visual.
- Todos os controles funcionam pelo teclado com foco visível.
- Informar sucesso e erros por texto, não apenas por cor.
- Verificar contraste mínimo de 4.5:1 do texto comum contra o fundo real.

## Critérios de aceitação
- [ ] Para nomes vazios, mostrar erro e impedir o envio.
- [ ] Fora de 2–60 caracteres, mostrar erro específico.
- [ ] Cliques repetidos durante o salvamento geram uma única requisição.
- [ ] Na falha, preservar os dados e permitir tentar novamente.
- [ ] Anunciar sucesso sem mover o foco.
- [ ] Testar teclado e layout de 320px.
- [ ] Comparar todos os estados implementados com esta especificação.

## Decisões antes da produção
- TODO: confirmar API, autorizações e erros com a equipe de desenvolvimento.
- TODO: confirmar notificações e textos com a equipe de produto.
- Substituir a simulação após aprovação do contrato de dados.
