/* ==========================================================================
   CONFIGURAÇÃO DE ACESSO — quem pode entrar no painel
   ==========================================================================
   Liste abaixo, um por linha, os e-mails do Google autorizados a acessar
   o site. Qualquer pessoa que tentar entrar com uma conta Google que não
   esteja nessa lista verá uma mensagem de acesso negado.

   IMPORTANTE: essa lista só controla a TELA (o que a pessoa vê no
   navegador). A proteção de verdade dos dados é feita nas Regras do
   Firestore, que também precisam ser atualizadas com a mesma lista de
   e-mails — veja o passo a passo que o Claude te mandou no chat.
   ========================================================================== */

const ALLOWED_EMAILS = [
  "isaquebrito22052006@gmail.com",
  "suzana.professora.libras@gmail.com",
  "marcosbrito1204@gmail.com",
  "marcos.brito.audio@gmail.com",
];
