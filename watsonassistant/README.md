# BEM VINDO AO CHAT COM WATSON 

Esse repositório contém um exemplo de integração do IBM Watson Assistent com Watson Text to Speech e Watson Speech to Text, desenvolvido pelo Thinklab IBM Brasil. 


## Como rodar este projeto na sua máquina:

**Antes de tudo**, é necessário que você crie uma conta gratuita no [IBM Cloud](https://cloud.ibm.com/login), depois clique em Criar recurso e no catálogo clique em **Speech to Text**, crie uma instância gratuita (lite), faça o mesmo com o recurso **Text to Speech** e copie as *credenciais de serviço* de ambos serviços.

Já tendo suas credenciais para os serviços você pode clonar este repositório (git clone), abrir o diretório do projeto e instalar as dependências na sua máquina.

Crie um arquivo .env na raiz do projeto, seguindo o arquivo de exemplo (.env-exemplo), no seu arquivo passe para as variáveis **WA_KEY** e **WA_URL** os valores das suas *credenciais de serviço* da instância do Speech to text, e para as variáveis **WA_TTS_KEY** e **WA_TTS_KEY** passe os valores das suas *credenciais de serviço* da instância do Text to Speech.

Com isso você está pronto para rodar o projeto, abra um terminal (mac/linux) ou cmd (windows), navegue até o diretório do projeto e rode **yarn build**

