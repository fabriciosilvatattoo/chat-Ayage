
import { GoogleGenAI, Chat, GenerateContentResponse, Type, Part } from '@google/genai';
import { SYSTEM_PROMPT } from '../constants';
import { Webhook, PanelContent } from '../types';

let chat: Chat | null = null;
let savedWebhooks: Webhook[] = [];

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const tools = [{
  functionDeclarations: [
    {
      name: 'callWebhook',
      description: 'Realiza uma requisição HTTP. Use o nome de um webhook da lista `caderno_de_webhooks` ou forneça uma URL completa.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          webhookName: { type: Type.STRING, description: 'O nome de um webhook salvo para chamar.' },
          url: { type: Type.STRING, description: 'O URL completo do webhook, se não usar um nome salvo.' },
          method: { type: Type.STRING, description: 'O método HTTP a ser usado (ex: "GET", "POST").' },
          payload: { type: Type.STRING, description: 'O payload a ser enviado, geralmente uma string JSON. Opcional.' },
        },
        required: ['method'],
      },
    },
    {
      name: 'renderPanelContent',
      description: 'Renderiza uma interface de usuário (HTML, CSS, JS) no painel direito da tela.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          html: { type: Type.STRING, description: 'O código HTML a ser renderizado.' },
          css: { type: Type.STRING, description: 'O código CSS para estilização.' },
          js: { type: Type.STRING, description: 'O código JavaScript para interatividade.' },
        },
        required: ['html'],
      },
    }
  ],
}];

export const initializeOrUpdateGemini = (webhooks: Webhook[] = []) => {
  savedWebhooks = webhooks;
  if (!process.env.API_KEY) {
    chat = null;
    console.error("API_KEY environment variable not set. Gemini service is inactive.");
    throw new Error("A chave de API não foi configurada no ambiente. Por favor, configure a variável de ambiente API_KEY.");
  }
  try {
    const dynamicPrompt = JSON.parse(JSON.stringify(SYSTEM_PROMPT));
    if (webhooks.length > 0) {
        dynamicPrompt.system_prompt.caderno_de_webhooks = {
            description: "Uma lista de webhooks pré-configurados que você pode chamar pelo nome. Use o 'webhookName' na ferramenta callWebhook.",
            webhooks: webhooks.map(wh => ({ name: wh.name, url: wh.url }))
        };
    }

    chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: JSON.stringify(dynamicPrompt),
        tools: tools,
      },
    });
    console.log("Gemini service initialized/updated successfully with new context.");
  } catch (error) {
    console.error("Failed to initialize Gemini service:", error);
    chat = null;
    throw new Error("Falha ao inicializar o serviço Gemini. A chave de API pode ser inválida.");
  }
};


const executeWebhook = async (url: string, method: string, payload?: string): Promise<Record<string, unknown>> => {
    try {
        const options: RequestInit = {
            method: method.toUpperCase(),
        };

        if (payload && options.method !== 'GET' && options.method !== 'HEAD') {
            options.headers = { 'Content-Type': 'application/json' };
            options.body = payload;
        }

        const fetchResponse = await fetch(url, options);

        if (!fetchResponse.ok) {
            throw new Error(`Request failed with status ${fetchResponse.status}: ${await fetchResponse.text()}`);
        }
        
        const responseData = await fetchResponse.text();
        try {
             const jsonData = JSON.parse(responseData);
             return { result: jsonData };
        } catch {
             return { result: `Sucesso. Resposta do servidor: ${responseData}` };
        }

    } catch (e) {
        const error = e instanceof Error ? e.message : 'Erro desconhecido ao chamar o webhook.';
        console.error('Webhook execution error:', error);
        return { error: `Falhou: ${error}` };
    }
};

export const sendMessageToGemini = async (userInput: string, onRenderPanel: (content: PanelContent) => void): Promise<string> => {
  if (!chat) {
    if (!process.env.API_KEY) {
        throw new Error('A chave de API não foi configurada no ambiente. Por favor, configure a variável de ambiente API_KEY.');
    }
    throw new Error('O serviço Gemini não foi inicializado. Tente recarregar a página.');
  }

  try {
    let response: GenerateContentResponse = await chat.sendMessage({ message: userInput });

    while (response.functionCalls && response.functionCalls.length > 0) {
      const toolResponses: Part[] = [];

      for (const functionCall of response.functionCalls) {
        const { name, args } = functionCall;
        
        if (name === 'renderPanelContent' && args) {
            const { html, css, js } = args;
            const content: PanelContent = {
                html: typeof html === 'string' ? html : '',
                css: typeof css === 'string' ? css : '',
                js: typeof js === 'string' ? js : '',
            };
            onRenderPanel(content);
            toolResponses.push({
                functionResponse: {
                    name,
                    response: { success: true, message: 'Conteúdo enviado para renderização no painel.' },
                }
            });
            continue; // Go to next function call
        }
        
        if (name === 'callWebhook' && args) {
          const { webhookName, url, method, payload } = args;
          let finalUrl = '';

          if (typeof webhookName === 'string' && webhookName) {
            const found = savedWebhooks.find(wh => wh.name === webhookName);
            if (found) {
              finalUrl = found.url;
            } else {
              toolResponses.push({ functionResponse: { name, response: { error: `Webhook com o nome '${webhookName}' não encontrado.` } }});
              continue;
            }
          } else if (typeof url === 'string' && url) {
            finalUrl = url;
          } else {
            toolResponses.push({ functionResponse: { name, response: { error: "Erro: você deve fornecer 'webhookName' ou 'url'." } }});
            continue;
          }
          
          if (finalUrl && typeof method === 'string') {
            const webhookResult = await executeWebhook(finalUrl, method, typeof payload === 'string' ? payload : undefined);
            toolResponses.push({
               functionResponse: {
                  name,
                  response: webhookResult,
                }
            });
          }
        }
      }

      if (toolResponses.length > 0) {
        response = await chat.sendMessage({ message: toolResponses });
      } else {
        break;
      }
    }

    return response.text;
  } catch (error) {
    console.error('Error sending message to Gemini:', error);
    let errorMessage = 'Failed to get a response from the AI.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    throw new Error(errorMessage);
  }
};
