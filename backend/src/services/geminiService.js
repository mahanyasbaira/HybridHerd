const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function generateVetBriefing(payload) {
  const { animal, riskLevel, telemetrySummary, rancherNote } = payload;

  const prompt = `You are a veterinary assistant helping a rancher report a sick cattle animal. Write a concise 3-4 sentence clinical briefing for a veterinarian based on these sensor readings:

Animal: ${animal.name} (${animal.breed}), Tag: ${animal.tag_id}
BRD Risk Level: ${riskLevel}
Average body temperature: ${telemetrySummary.avgTemp}°C
Average respiratory rate: ${telemetrySummary.avgRespRate} breaths/min
Average chew frequency: ${telemetrySummary.avgChewFreq} chews/min
Total cough events (24h): ${telemetrySummary.totalCoughs}
Average behavior index: ${telemetrySummary.avgBehaviorIndex}/100
Rancher's note: ${rancherNote || 'No additional notes'}

Write a professional, factual briefing suitable for a veterinarian. Mention which readings are abnormal and what BRD symptoms they suggest.`;

  if (!GEMINI_API_KEY) {
    return getFallbackBriefing(animal, riskLevel, telemetrySummary);
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    return getFallbackBriefing(animal, riskLevel, telemetrySummary);
  }
}

function getFallbackBriefing(animal, riskLevel, telemetrySummary) {
  const tempStatus = telemetrySummary.avgTemp > 39 ? 'elevated' : 'normal';
  const respStatus = telemetrySummary.avgRespRate > 40 ? 'elevated' : 'normal';
  const coughStatus = telemetrySummary.totalCoughs > 5 ? 'concerning' : 'minimal';

  return `${animal.name} (${animal.tag_id}, ${animal.breed}) presents with ${riskLevel.toLowerCase()} BRD risk. Clinical indicators include ${tempStatus} body temperature (${telemetrySummary.avgTemp}°C), ${respStatus} respiratory rate (${telemetrySummary.avgRespRate} breaths/min), and ${coughStatus} cough activity (${telemetrySummary.totalCoughs} events in 24h). Behavior index of ${telemetrySummary.avgBehaviorIndex}/100 suggests reduced activity levels consistent with respiratory disease.`;
}

module.exports = { generateVetBriefing };
