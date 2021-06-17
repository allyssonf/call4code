import React, {
  useState,
  useEffect,
  useRef
} from 'react';
import {
  Button,
  FormGroup,
  TextArea
} from 'carbon-components-react';
import './App.scss';
import axios from 'axios';
import recognizeMicrophone from 'watson-speech/speech-to-text/recognize-microphone';
import HeaderWA from './components/HeaderWA/Header';
import Notification from './components/Notification/Notification';
import {
  Microphone16,
  MicrophoneOff16,
  Send16,
  VolumeUpFilled16
} from "@carbon/icons-react";

let urlData = '';

if (process.env.NODE_ENV !== 'production') {
  urlData = 'http://localhost:3001'
}

const App = () => {
  const [speechTxt, setSpeechTxt] = useState("");
  const [token, setToken] = useState(null);
  const [notification, setNotification] = useState(false);
  const [messageArray, setMessageArray] = useState([]);
  const [textNotification, setTextNotification] = useState("");
  const [sessionId, setSessionId] = useState("");

  const stopRef = useRef(null);
  const recRef = useRef(null);
  const soundRef = useRef(null);
  const txtInputRef = useRef(null);
  const messageListRef = useRef(null);
  const audioElementRef = useRef(null);
  const btnSendRef = useRef(null);

  useEffect(() => {

    const params = {
      sessionId,
      message: ''
    };

    axios({
      url: `${urlData}/api/assistant`,
      method: 'POST',
      data: params
    }).then((res) => {
      const { sessionId, response } = res.data;
      setSessionId(sessionId);
      setMessageArray([...messageArray, { 'message': response, 'sender': 1 }]);
    }).catch((err) => {
      console.log('Error', err);
      setNotification(true);
      setTimeout(() => setNotification(false), 1000);
      setTextNotification("Erro ao conectar com o Watson Assistant!");
    });
  // eslint-disable-next-line 
  }, []);

  //Fazendo scroll da página a cada nova mensagem
  useEffect(() => {
    if (messageListRef.current !== null) {
      const { scrollHeight, offsetHeight } = messageListRef.current;
      if (scrollHeight > offsetHeight) {
        messageListRef.current.scrollTop = scrollHeight - offsetHeight;
      }
    }
  }, [messageArray])

  //Esta função identifica o microfone, cria o gerenciador de gravação, atribuindo os eventos 
  // de gravar e parar aos eventos de cliques dos botões rec e stop respectivamente.
  const recording = () => {
    if (token !== null) {
      let stream = recognizeMicrophone(Object.assign(token, {
        objectMode: true,
        maxAlternatives: 4,
        accessToken: token,
        model: 'pt-BR_BroadbandModel'
      }));

      //validando erro
      stream.on('error', (err) => {
        console.log('err ', err);
      });

      //quando iniciada a gravação, o estado speechTxt recebe em retorno a mensagem 
      // com maior % de estar correta comparado ao que foi dito pelo usuário.
      stream.on('data', (message) => {
        setSpeechTxt(message.results[0]?.alternatives[0]?.transcript);
      });

      //atribuindo a parada de gravação ao clique do botão stop
      document.querySelector('#stop').onclick = stream.stop.bind(stream);

      //alternando a visibilidade dos botões rec e stop
      recRef.current.style.display = 'none'
      stopRef.current.style.display = 'block'
    } else {
      btnSendRef.current.disabled = false;
      setNotification(true);
      setTimeout(() => setNotification(false), 1000);
      setTextNotification("Erro ao recuperar o token de acesso ao serviço Watson STT!");
    }
  }

  // Função que atribui o áudio criado ao elemento <audio> e então o reproduz
  const onSynthesize = async (text, voice) => {
    try {
      audioElementRef.current.setAttribute(
        'src',
        getSynthesizeUrl(text, voice),
      );
      await audioElementRef.current.play();
    } catch (err) {
      setNotification(true);
      setTimeout(() => setNotification(false), 1000);
      btnSendRef.current.disabled = false;
      recRef.current.disabled = false;
      setTextNotification("Erro ao recuperar o token de acesso ao serviço Watson TTS");

    }
  };

  //função que define o formato do audio a ser reproduzido, envia uma requisição para o texto ser convertido
  const getSynthesizeUrl = (text, voice) => {
    const params = getSearchParams();

    params.set('text', text);
    params.set('voice', voice);

    let accept = "";

    // Testando os formatos de áudio disponíveis para reprodução.
    ['audio/mp3', 'audio/ogg;codec=opus', 'audio/wav'].some(format => {
      if (canPlayAudioFormat(format, audioElementRef.current)) {
        accept = format;
      }

      return accept.length > 0;
    });

    if (accept.length > 0) {
      params.set('accept', accept);
    }

    return `${urlData}/api/synthesize?${params.toString()}`;
  };

  //Valida se é possível reproduzir o formato de áudio associado
  const canPlayAudioFormat = (mimeType, audioElement) => {
    if (!audioElement) {
      audioElement = document.createElement('audio');
    }

    if (audioElement) {
      return (
        typeof audioElement.canPlayType === 'function' &&
        audioElement.canPlayType(mimeType) !== ''
      );
    }
    return false;
  };

  //função para criar a formatação correta dos parâmetros para agragá-los a url.
  const getSearchParams = () => {
    if (typeof URLSearchParams === 'function') {
      return new URLSearchParams();
    }

    const SearchParams = () => { };

    SearchParams.prototype.set = (key, value) => {
      this[key] = value;
    };

    SearchParams.prototype.toString = () => {
      return Object.keys(this)
        .map(v => `${encodeURI(v)}=${encodeURI(this[v])}`)
        .join('&');
    };

    return new SearchParams();
  };

  const clearTA = () => {
    txtInputRef.current.value = "";
    setSpeechTxt("");
  };

  const assistantMessage = (message) => {
    const params = {
      sessionId,
      message
    };

    axios({
      url: `${urlData}/api/assistant`,
      method: 'POST',
      data: params
    }).then((res) => {
      const { sessionId, response } = res.data;
      setSessionId(sessionId);
      setMessageArray(arr => [...arr, { 'message': response, 'sender': 1 }]);
    }).catch((err) => {
      console.log('Error', err);
      setNotification(true);
      setTimeout(() => setNotification(false), 1000);
      setTextNotification("Erro ao conectar com o Watson Assistant!");
    });
  };

  return (
    <div className="App">
      {/* Carbon Header*/}
      <HeaderWA />
      <div className="header-space bx--grid">
        <div className="bx--row">
          <div className="bx--col-lg-4"></div>
          <div className="bx--col-lg-4">
            <FormGroup
              legendText="">
              <audio
                className="audio-output"
                hidden={true}
                ref={audioElementRef}
                onEnded={() => {
                  recRef.current.disabled = false;
                }}>
                Your browser does not support the <code>audio</code> element :(
              </audio>
            </FormGroup>
            <div className="chat-div">
              <div className="message-div" ref={messageListRef}>
                {messageArray.map((message, index) => (
                  <div key={index} className={message.sender === 0 ? 'message-me' : 'message-bot'}>
                    <section>
                      <p>{message.message}</p>
                      {message.sender !== 0 ?
                        <Button
                          onClick={() => {
                            btnSendRef.current.disabled = true;
                            recRef.current.disabled = true;
                            onSynthesize(message.message, 'pt-BR_IsabelaVoice')
                          }}
                          className="btnSpeaker"
                          ref={soundRef}
                          hasIconOnly
                          renderIcon={VolumeUpFilled16}
                          size='field'
                          kind="primary" /> : ""
                      }
                    </section>
                  </div>
                ))}
              </div>

              <div className="input-bar">
                <Button
                  onClick={() => {
                    // Retorna token de autenticação para 
                    // o Watson STT.
                    axios({
                      url: `${urlData}/api/speech-to-text/token`,
                      method: 'GET',
                    }).then((res) => {
                      setToken(res.data.accessToken);
                    }).catch((err) => {
                      console.log('error ' + err);
                    });

                    if (soundRef.current !== null) {
                      soundRef.current.disabled = true;
                    }
                    btnSendRef.current.disabled = true;
                    recording();
                  }}
                  ref={recRef}
                  hasIconOnly
                  renderIcon={Microphone16}
                  size='field'
                  kind="primary"
                  tooltipAlignment="center"
                  tooltipPosition="bottom"
                  iconDescription="Fale sua mensagem"
                />

                <Button
                  id="stop"
                  onClick={() => {
                    if (soundRef.current !== null) {
                      soundRef.current.disabled = false;
                    }
                    btnSendRef.current.disabled = false;
                    recRef.current.style.display = 'block'
                    stopRef.current.style.display = 'none'
                  }}
                  kind='danger'
                  ref={stopRef}
                  style={{ display: 'none' }}
                  hasIconOnly
                  renderIcon={MicrophoneOff16}
                  iconDescription="Press to stop talking..."
                  size='field' />
                <TextArea
                  ref={txtInputRef}
                  value={speechTxt}
                  cols={50}
                  helperText=""
                  id="txt-input"
                  invalidText="A valid value is required"
                  labelText=""
                  placeholder="Digite sua mensagem"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.keyCode !== 13) {
                      if (e.keyCode === 8) {
                        setSpeechTxt(speechTxt.substring(0, speechTxt.length - 1));
                      } else if ((e.keyCode === 32) || 
                                 (e.keyCode >= 48 && e.keyCode <= 57) ||
                                 (e.keyCode >= 65 && e.keyCode <= 90)) {
                        setSpeechTxt(`${speechTxt ? speechTxt : ''}${e.key}`);
                      }
                    } else {
                      //Avoid enter keystroke propagation.
                      e.preventDefault();
                      if (txtInputRef.current.value !== "") {
                        let value = txtInputRef.current.value;
                        clearTA();
                        setMessageArray(arr => [...arr, { 'message': value, 'sender': 0 }]);
                        assistantMessage(value);
                      }
                    }
                  }} 
                />
                <Button
                  hasIconOnly
                  renderIcon={Send16}
                  size='field'
                  tooltipAlignment="center"
                  tooltipPosition="right"
                  iconDescription="Enviar"
                  ref={btnSendRef}
                  disabled={speechTxt?.length === 0 || !speechTxt}
                  onClick={() => {
                    if (txtInputRef.current.value !== "") {
                      let value = txtInputRef.current.value;
                      clearTA();
                      setMessageArray(arr => [...arr, { 'message': value, 'sender': 0 }]);
                      assistantMessage(value);
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <div className="bx--col-lg-4">
            <Notification
              notification={notification}
              text={textNotification}
              duration={3000}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
