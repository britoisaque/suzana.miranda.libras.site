/* ==========================================================================
   CONFIGURAÇÃO DO CLOUDINARY
   ==========================================================================
   Usado para hospedar os arquivos (PDF/vídeo) enviados na aba
   "Material de Apoio", sem precisar de cartão de crédito.

   Onde achar:
   1. Crie uma conta grátis em https://cloudinary.com/users/register/free
   2. No Dashboard, copie o "Cloud name".
   3. Vá em Settings (engrenagem) > Upload > Upload presets > Add upload preset.
      - Signing Mode: Unsigned
      - (Recomendado) Restrinja formatos, tamanho máximo e uma pasta fixa.
   4. Copie o nome do preset e cole abaixo.

   Veja o passo a passo completo em INSTRUCOES.md.
   ========================================================================== */

const CLOUD_CONFIG = {
  cloudName: "df5pu4xbb",
  uploadPreset: "suzanalibras",
};
