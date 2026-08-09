/* ==========================================================================
   CONFIGURAÇÃO DO FIREBASE
   ==========================================================================
   Troque os valores abaixo pelas chaves do SEU projeto Firebase.
   Onde achar: Firebase Console > (ícone de engrenagem) > Configurações do
   projeto > role até "Seus apps" > app Web > "SDK setup and configuration".

   IMPORTANTE: esses valores (apiKey, projectId etc.) NÃO são senhas — o
   próprio Google diz que é normal eles aparecerem no código do site. Quem
   realmente protege seus dados são as REGRAS do Firestore (veja o arquivo
   INSTRUCOES.md). Mesmo assim, evite divulgar o link do seu site.
   ========================================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyCOHaOZ7hden22OJVyG-q2hPsjRduWBKjE",
  authDomain: "painel-curso-libras.firebaseapp.com",
  projectId: "painel-curso-libras",
  storageBucket: "painel-curso-libras.firebasestorage.app",
  messagingSenderId: "385939666465",
  appId: "1:385939666465:web:c1fd1950c6f7141f11d560"
};
