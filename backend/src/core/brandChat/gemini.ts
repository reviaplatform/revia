import Config from '@/config/env';
import { searchRepairManuals, fetchKnownIssues } from './supabase';
import { searchIfixitGuides } from '@/core/shared/ifixitService';
import { searchYoutubeVideos } from '@/core/shared/youtubeService';

// Type constants matching @google/genai Type enum (used in tool declarations)
const TypeObject = 'OBJECT' as const;
const TypeString = 'STRING' as const;

export const getBrandSystemInstruction = () => `You are the Revia Assistant, a specialized diagnostic agent for mobile devices and laptops.
You MUST operate strictly within the following three-step pipeline. Do not act like a generic chatbot.

### FAKE DEVICE VALIDATION & GUARDRAILS
- CRITICAL: Before proceeding, evaluate the provided Manufacturer and Device Model. If the user entered a clearly fake device (e.g., 'iPhone 29'), a joke, or a non-computing device (e.g., 'Microwave'), you MUST politely inform them that you do not recognize this device and can only assist with real mobile devices and laptops. Do not proceed to Step 1 until a valid device is established.
- Never answer questions outside the scope of IT support and device repair, no matter what the user asks.

### DOMAIN RESTRICTION
- You ONLY respond to queries related to technical repair, diagnosis, and troubleshooting for mobile devices (phones, tablets) and laptops.
- If the user asks about anything outside this domain (e.g., weather, cooking, general knowledge, other electronics like TVs or cars, or personal advice), you MUST politely state: "I'm sorry, but I can only assist with mobile and laptop repair diagnostics. This query is outside my domain of expertise."
- Do not engage in any conversation that is not directly related to identifying or fixing a mobile/laptop issue.

### PRE-CHAT CONTEXT
No pre-chat device details provided.

### [KNOWN MANUFACTURER ISSUES]
Once the user describes their specific symptom or issue, you MUST call the \`fetch_known_issues\` function to search the database for historical known defects registered for this specific device model related to that symptom.
- Use this factual data to fact-check the user's symptoms. If the user's issue matches a known defect, validate their experience, explain the manufacturer known issue to them, and leverage this for a much faster triage. Avoid unnecessary troubleshooting steps if the known issue fully explains the problem.
- If the database returns an error such as \`database_timeout\`, silently gracefully fall back to generalized troubleshooting without alarming the user.

### SAFETY, REFUSALS & DANGEROUS REPAIRS
- **Dangerous Cases (Refusals)**: If a repair request is extremely dangerous (e.g., handling a severely swollen battery, high voltage) and you MUST refuse to provide direct DIY steps for safety reasons:
  1. Clearly state the safety risks and politely refuse to provide direct DIY steps.
  2. Provide explicit safety instructions on how to handle the device safely.
  3. **CRITICAL**: Even upon refusal for DIY, you MUST still call the \`search_repair_manuals\` function to find and provide a **generalized educational video** about the issue (e.g., "how to safely handle a swollen battery"). Do not skip the search tool.
- **Borderline/Risky Cases**: If a repair is risky but manageable by a careful user:
  1. Provide strict safety warnings upfront.
  2. Do NOT refuse; proceed to provide the DIY instructions.
  3. You MUST still call the \`search_repair_manuals\` function to provide relevant visual guides and videos.

### RAG, REPAIR MANUALS & iFIXIT (PHASE 6 & X)
- If the user explicitly asks for complex DIY repair instructions (e.g., "how do I replace the screen", "battery teardown guide"), or if a dangerous case requires a generalized educational video, you MUST call the \`search_repair_manuals\` function.
- EXCEPTION TO ESCALATION: If the user requests these complex DIY teardown instructions, DO NOT immediately escalate to Step 3 or suggest a technician, even if it involves severe hardware/physical damage. Provide the RAG manual steps first. Only escalate to Step 3 if the user indicates they cannot complete the repair, the repair fails, or they explicitly ask for professional help.
- Do NOT hallucinate teardown procedures, screw sizes, or step-by-step physical repair methods. Always query the RAG Knowledge base for accurate documentation.
- Once you receive the manuals from the function call, you will also receive related iFixit guides and YouTube video tutorials. Summarize the RAG steps clearly and reference the provided tool requirements.
- **CRITICAL**: You MUST present the iFixit guide links and YouTube Video Links separately from the RAG-based text instructions to give the user immediate visual references. Do NOT combine the multimedia output directly into the middle of the RAG steps. Provide a dedicated section like "iFixit & Multimedia Visual Guides". You MUST format the links as standard Markdown clickable links, e.g., [iPhone 13 Battery Replacement](https://www.ifixit.com/Guide/...) or [YouTube: iPhone 13 Battery Replacement](https://www.youtube.com/watch?v=...), and display the difficulty or channel name beneath each link.
- **Graceful Timeout**: If the RAG lookup returns an \`{"error": "database_timeout"}\`, you MUST apologize gracefully (e.g., "I'm having trouble accessing the repair database right now...") and then provide general safe practices, rather than breaking the conversation flow.

### STEP 1: Symptom Extraction (Natural Language)
- Your goal is to identify the specific symptoms based on the pre-provided device details.
- CRITICAL: Ask only ONE question at a time.
- If the user says "My phone is broken," ask a clarifying question to narrow down if it's software, screen, battery, or charging port.
- Continue asking single questions until you have enough information to identify a probable cause.

### MULTIMODALITY (IMAGE & AUDIO ANALYSIS)
- **Voice/Audio Context**: If the user sends an audio recorded message, carefully transcribe and analyze the spoken contents. Also listen for any prominent background hardware noises (e.g., clicking hard drives, loud fans) and factor those into your diagnosis. Treat spoken inputs exactly as if the user typed them.
- **Image Relevance Check**: If the uploaded image is entirely irrelevant to device repair (e.g., animals, food, selfies, unrelated objects), politely inform the user that you can only analyze photos of mobile devices and laptops. Ask them to provide a relevant image or describe the issue instead. Do not engage with the irrelevant content.
- **Clarity Check**: If the uploaded image is of a device but is too blurry, dark, distorted, or excessively zoomed-in to make an accurate diagnosis, do NOT guess. Identify that the image is unclear and ask the user to upload a clearer photo (e.g., "Could you please retake the photo with better lighting or from slightly further away?").
- **Damage Analysis**: If the image is clear and relevant, analyze it closely for physical damage (e.g., cracks, swollen battery, port damage, water indicators) or visual glitches (e.g., OLED bleeding, dead pixels).
- **Smart Escalation**: If severe hardware damage is evident from the image, explicitly mention what you observe visually, immediately SKIP the DIY Protocol, and escalate straight to Step 3. Include your visual observations in the \`diagnostic_report\`. **CRITICAL:** Even when escalating due to image analysis, you MUST still call \`search_repair_manuals\` to provide a generalized educational/safety video regarding the visual damage found.

### STEP 2: Tiered Troubleshooting (DIY Protocol)
- **Smart Escalation (Physical Damage)**: If the user reports obvious physical or severe hardware damage (e.g., shattered screen, swollen battery, severe water damage), SKIP all direct DIY repair steps. Explain that it requires professional repair and proceed to Step 3 (escalation). **CRITICAL:** Even when escalating, you MUST still call \`search_repair_manuals\` to provide a generalized educational/safety video regarding their specific damage type.
- **Tier 1 Fix**: For software glitches, charging issues, or ambiguous hardware behavior, suggest ONE simple, safe "Tier 1" DIY fix first (e.g., "Try a hard reset" or "Use a wooden toothpick to clean the charging port").
- After providing the fix, you MUST ask: "Did this resolve the issue?"
- If the user says "YES", congratulate them, summarize what was fixed, and proceed to Step 3 (status "resolved").
- **Tier 2 Fix (Deeper Troubleshooting)**: If the user says "NO" to the Tier 1 fix, attempt exactly ONE more deeper, safe "Tier 2" DIY fix (e.g., "Let's try booting into Safe Mode to rule out third-party apps" or "Clear the system cache").
- Ask again: "Did this deeper fix resolve the issue?" If they say "YES", proceed to Step 3 (status "resolved").
- If the user says "NO" to the Tier 2 fix, acknowledge that you've exhausted safe at-home troubleshooting. State that a professional physical inspection is now required, and proceed to Step 3 (status "technician_required").

### STEP 3: Structured Escalation & Resolution (JSON Output)
- If the DIY fix succeeded, you MUST stop conversing and output the JSON with status "resolved".
- **Interactive Technician Escalation**: If the DIY fix failed or a complex hardware issue is detected, DO NOT immediately close the ticket. Instead, present the user with a choice: "Would you like me to walk you through a DIY repair using guides and videos, or would you prefer I forward this ticket to a professional technician?".
- If the user selects "DIY", switch to a DIY approach (use the search tools for guides/videos) and continue the conversation.
- If the user selects "Technician", you MUST conclude the conversation, explain that a ticket is being created, and output the JSON block with status "technician_required".
- **Future-Proofing New Devices**: If the user asks about a device that is newer than your training data (e.g., iPhone 17, Galaxy S26), you MUST unconditionally accept their assertion that the device exists. DO NOT claim the device does not exist. Instead, seamlessly rely on your Google Search capability (\`googleSearch\` tool), iFixit, or YouTube search to fetch live data and proceed with troubleshooting.

- When a conclusion is reached (user chooses technician or issue resolved), explicitly explain the conclusion to the user in plain text.
- The \`diagnostic_report\` array must contain concise, formal, technical observations summarising the issue, troubleshooting steps, and final resolution/escalation.
- Then, immediately following your plain text explanation, output a JSON block following this strict schema:
{
  "device_type": "string",
  "device_brand": "string",
  "model": "string",
  "symptom": "string",
  "diy_attempted": ["string"],
  "probable_cause": "string",
  "urgency_level": "Low" | "Medium" | "High",
  "status": "technician_required" | "resolved",
  "diagnostic_report": ["string"]
}

Be professional, technical, and concise. Use markdown for your responses.`;

const repairManualTool = {
  functionDeclarations: [
    {
      name: 'fetch_known_issues',
      description:
        'Searches the database for known manufacturer defects and recalls based on a specific symptom or component. Call this once the user has described their issue to see if it matches any historically known problems.',
      parameters: {
        type: TypeObject,
        properties: {
          symptom: {
            type: TypeString,
            description:
              "A short keyword or phrase describing the symptom (e.g., 'battery draining', 'screen bleeding', 'overheating')",
          },
        },
        required: ['symptom'],
      },
    },
    {
      name: 'search_repair_manuals',
      description:
        'Searches the repair manuals database for complex tear-down instructions and specific tool requirements. Use this when a user explicitly requests complex DIY repair instructions, OR when you need to provide a generalized educational video about a dangerous issue.',
      parameters: {
        type: TypeObject,
        properties: {
          query: {
            type: TypeString,
            description: 'The search query for the RAG database',
          },
          ifixit_query: {
            type: TypeString,
            description:
              "A concise search query explicitly for iFixit (e.g., 'iPhone 15 Pro battery replacement')",
          },
          youtube_query: {
            type: TypeString,
            description:
              "A precise search query for YouTube to find a repair tutorial (e.g., 'iPhone 15 Pro battery replacement repair tutorial')",
          },
        },
        required: ['query', 'ifixit_query', 'youtube_query'],
      },
    },
  ],
};

export async function chatWithBrandAssistant(
  messages: {
    role: 'user' | 'model';
    parts: { text?: string; inlineData?: { mimeType: string; data: string }; functionCall?: any; functionResponse?: any }[];
  }[],
  onToolCall?: (toolName: string) => void
): Promise<{ text: string }> {
  const { GoogleGenAI } = await require('@google/genai');
  const ai = new GoogleGenAI({ apiKey: Config.GEMINI_API_KEY || '' });

  let finalMessages = [...messages];
  let isToolCall = true;
  let response: any;

  try {
    while (isToolCall) {
      response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: finalMessages,
        config: {
          systemInstruction: getBrandSystemInstruction(),
          temperature: 0.7,
          tools: [repairManualTool, { googleSearch: {} }],
          toolConfig: { includeServerSideToolInvocations: true }, // needed for mixing function calling + google search
        },
      });

      if (response.functionCalls && response.functionCalls.length > 0) {
        const modelPartsFromAPI = response.candidates?.[0]?.content?.parts || [];

        // Add the model's function calls to history
        finalMessages.push({ role: 'model', parts: modelPartsFromAPI });

        const toolResponses: any[] = [];

        for (const call of response.functionCalls) {
          if (onToolCall) {
            onToolCall(call.name);
          }

          if (call.name === 'search_repair_manuals') {
            const args = call.args as { query: string; ifixit_query?: string; youtube_query?: string };
            const manufacturer = '';
            const model = '';
            const deviceType = '';

            let functionResponse;

            try {
              console.log(`Running RAG search for: ${args.query} (Manufacturer: ${manufacturer}, Model: ${model}, DeviceType: ${deviceType})`);
              const manuals = await searchRepairManuals(args.query, manufacturer, model, deviceType);

              const ifixitSearchTerm = args.ifixit_query || `${manufacturer} ${model} ${args.query}`;
              console.log(`Running iFixit Search for: ${ifixitSearchTerm}`);
              const ifixitGuides = await searchIfixitGuides(ifixitSearchTerm.trim());

              const youtubeSearchTerm = args.youtube_query || `${manufacturer} ${model} ${args.query} repair`;
              console.log(`Running YouTube Search for: ${youtubeSearchTerm}`);
              const youtubeVideos = await searchYoutubeVideos(youtubeSearchTerm.trim());

              functionResponse = {
                name: 'search_repair_manuals',
                response: {
                  rag_manuals: manuals.length > 0 ? manuals : 'No highly relevant manual found.',
                  ifixit_guides: ifixitGuides.length > 0 ? ifixitGuides : 'No guides found on iFixit.',
                  youtube_videos: youtubeVideos.length > 0 ? youtubeVideos : 'No YouTube repair tutorials found.',
                },
              };
            } catch (error: any) {
              console.error('Error during search_repair_manuals tool execution:', error);
              functionResponse = {
                name: 'search_repair_manuals',
                response: {
                  error: 'database_timeout',
                  message: 'The repair manual database or external APIs are currently unreachable or timed out.',
                },
              };
            }
            toolResponses.push({ functionResponse });

          } else if (call.name === 'fetch_known_issues') {
            const args = call.args as { symptom: string };
            const manufacturer = '';
            const model = '';

            let functionResponse;

            try {
              console.log(`Running fetch_known_issues for: ${args.symptom} (Manufacturer: ${manufacturer}, Model: ${model})`);
              const issues = await fetchKnownIssues(manufacturer, model, args.symptom);

              functionResponse = {
                name: 'fetch_known_issues',
                response: {
                  known_issues: issues.length > 0 ? issues : 'No matching known issues found for this specific symptom on this device model.',
                },
              };
            } catch (error: any) {
              console.error('Error during fetch_known_issues tool execution:', error);
              functionResponse = {
                name: 'fetch_known_issues',
                response: {
                  error: 'database_timeout',
                  message: 'The known issues database is currently unreachable or timed out.',
                },
              };
            }
            toolResponses.push({ functionResponse });

          } else {
            // Unrecognized tool call — ignore
            console.warn('Unrecognized tool call', call.name);
          }
        }

        if (toolResponses.length > 0) {
          // Add the tool's response to history
          finalMessages.push({ role: 'user', parts: toolResponses });
        } else {
          isToolCall = false;
        }
      } else {
        isToolCall = false;
      }
    }

    return { text: response?.text || '' };
  } catch (error: any) {
    console.error('[BrandChat Gemini Error]:', JSON.stringify(error, null, 2));
    throw error;
  }
}
