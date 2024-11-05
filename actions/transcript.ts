"use server"

import { AzureOpenAI} from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { AzureKeyCredential  } from "@azure/core-auth";


export default async function transcription(prevState: object, formData: FormData) {
    // console.log("PREVIOUS STATE", prevState);

    const id = Math.random().toString(36);

    if (
        process.env.AZURE_API_KEY === undefined ||
        process.env.AZURE_OPENAI_ENDPOINT === undefined ||
        process.env.AZURE_DEPLOYMENT_NAME === undefined ||
        process.env.AZURE_DEPLOYMENT_COMPLETIONS_NAME === undefined
    ) {
        console.log("Azure credentials not set");
        return {
            sender: "",
            response: "Azure credentials not set",
        }
    }

    const file = formData.get("audio") as File;

    if (file.size === 0) {
        return {
            sender: "",
            response: "No audio file provided",
        }
    }

    // console.log(">>", file);


    const apiKey = new AzureKeyCredential(process.env.AZURE_API_KEY);
 
     // Construct the Azure Whisper client
     const client = new AzureOpenAI({
         endpoint: process.env.AZURE_OPENAI_ENDPOINT,
         apiKey: apiKey.key,
         apiVersion: "2024-08-01-preview",
         deployment: process.env.AZURE_DEPLOYMENT_NAME,
     });

    //  // Construct the Azure OpenAI client
    const client2 = new AzureOpenAI({
        endpoint: process.env.AZURE_OPENAI_ENDPOINT,
        apiKey: apiKey.key,
        apiVersion: "2024-08-01-preview",
        deployment: process.env.AZURE_DEPLOYMENT_COMPLETIONS_NAME,
    });


    // Convert audio file into data that can be sent to Azure
    const arrayBuffer = await file.arrayBuffer();
    const audio = new Uint8Array(arrayBuffer);

    // Get audio transcription from Azure Whisper AI service
    // console.log("== Transcribe Audio Sample ==");

     // Modify audio file into compatible format
    const audioFile = new File([audio], 'audio.webm', { type: 'audio/webm' });

    // Obtain text from Whisper AI transcription (also able to translate languages)
    const result = await client.audio.transcriptions.create({
        model: "whisper",
        file: audioFile,
    });

    // console.log(`Transcription: ${result.text}`);


   // Create assistant characteristics and obtain response
   const messages: ChatCompletionMessageParam[] = [
    {
        role: "system",
        content: "You are a sarcastic assistant. You will answer questions and reply I cannot answer that if you dont know the answer and be slightly rude like you don't like to be bothered.",
    },
    {
        role: "user",
        content: result.text,
    }
   ]

    //   console.log(`Messages: $messages.map((m) => m.content).join("\n")`);

   const completions = await client2.chat.completions.create({
    messages,
    model: "gpt-4",
    max_tokens: 100,
    });

   const response = completions.choices[0].message?.content;


   // Send data back to user
   return {
    sender: result.text,
    response: response,
    id: id,
   }
}