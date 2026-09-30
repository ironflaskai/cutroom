import type {
  BrainstormIdea,
  BrainstormRequest,
  ImageEngineTarget,
  ImagePromptRequest,
  ImagePromptResult,
  MemePresetId,
  MemeStylePreset
} from './types'

export interface MemePresetDefinition {
  id: MemePresetId
  name: string
  subtitle: string
  icon: string
  defaultTitle: string
  defaultScene: string
  defaultManOutfit: string
  defaultWomanOutfit: string
  defaultBackground: string
  defaultSpeechBubble: string
  defaultSpeechSpeaker: string
  defaultTopText: string
  defaultBottomText: string
  defaultHeadline: string
  defaultStyle: MemeStylePreset
}

export const MEME_PRESETS: MemePresetDefinition[] = [
  {
    id: 'diner_gossip',
    name: 'Diner Table Gossip',
    subtitle: 'Man & Woman dining, background patrons whispering pregnancy rumors',
    icon: '☕',
    defaultTitle: 'Cardi Bee Diner Gossip — $1M Pregnancy Bet',
    defaultScene:
      'A cozy, warm vintage American retro diner at night. My male character (@image1) and female character (@image2) are sitting together at a booth table having milkshakes and burgers, looking glamorous and stylish. Behind them, neighboring diner patrons and waitresses are leaning in, staring, and whispering to each other with animated suspicious gossip expressions.',
    defaultManOutfit:
      'Trendy designer silk bomber jacket, sunglasses perched on head, gold chain, looking cool and focused on his burger',
    defaultWomanOutfit:
      'Glamorous rhinestone crop top, high-waisted denim, oversized hoop earrings, diamond bracelets, looking radiant with a knowing smile',
    defaultBackground:
      'A nosy patron in the booth right behind them leaning over with hand cupped around mouth whispering to his friend, with an exaggerated comic speech bubble',
    defaultSpeechBubble: "I'm sure she gets pregnant soon! Did you bet on Cardi Bee?!",
    defaultSpeechSpeaker: 'Nosy diner patron behind them',
    defaultTopText: 'WHEN YOU GO ON A CASUAL DINER DATE',
    defaultBottomText: 'BUT THE WHOLE ROOM BET $1M ON WHETHER YOU GET PREGNANT',
    defaultHeadline: 'SPOTTED: CARDI BEE & DATE AT DINER AMID $1M PREGNANCY BET POOL',
    defaultStyle: 'photo_speech_bubble'
  },
  {
    id: 'ultrasound_bet',
    name: 'The $1M Ultrasound Scandal',
    subtitle: 'OBGYN clinic ultrasound showing memecoin chart & baby bee',
    icon: '🏥',
    defaultTitle: 'The $1M Ultrasound Scan Shock',
    defaultScene:
      'Inside a modern high-end Beverly Hills medical clinic ultrasound room. The female character (@image2) is lying on the exam table looking totally shocked and laughing. The male character (@image1) is standing next to her pumping his fist in celebration. The doctor points enthusiastically at the ultrasound monitor which reveals a hilarious ultrasound silhouette of a baby wearing a bee crown next to a massive green crypto chart candlestick.',
    defaultManOutfit: 'Designer tailored blazer over streetwear tee, holding phone showing live crypto charts',
    defaultWomanOutfit: 'Sleek luxury maternity-ready pastel designer lounge set, diamond necklace',
    defaultBackground: 'The OBGYN doctor in white medical coat looking astonished at the scan results',
    defaultSpeechBubble: 'Doc, tell us if I just won the $1,000,000 bet or not!',
    defaultSpeechSpeaker: 'Excited husband pointing at monitor',
    defaultTopText: 'THE ULTRASOUND RESULTS ARE IN...',
    defaultBottomText: '$1,000,000 POOL AT CARDIBEEWAP.COM IS ABOUT TO PAY OUT',
    defaultHeadline: 'EXCLUSIVE: CARDI BEE ULTRASOUND LEAK SENDS $111K PRESALE TO THE MOON',
    defaultStyle: 'photo_candid'
  },
  {
    id: 'tabloid_breaking',
    name: 'Tabloid TMZ Breaking Cover',
    subtitle: 'Flashbulb paparazzi photo with sensational breaking news banner',
    icon: '📰',
    defaultTitle: 'TMZ Breaking News: The $1M Baby Bump Bet',
    defaultScene:
      'High-energy dramatic nighttime paparazzi flash snapshot outside a luxury restaurant. Flashes illuminating the scene with authentic candid lens flare. Male character (@image1) escorting female character (@image2) through an aggressive swarm of paparazzi holding cameras and boom mics. Female character holds an iced drink subtly shielding her midsection.',
    defaultManOutfit: 'Sharp dark streetwear suit, protective sunglasses, stern bodyguard escort pose',
    defaultWomanOutfit: 'Bodycon glamorous yellow-and-black honey bee patterned couture dress and stiletto heels',
    defaultBackground: 'Swarm of frantic paparazzi photographers with big flash cameras popping',
    defaultSpeechBubble: 'IS SHE PREGNANT?! TELL US ABOUT CARDIBEEWAP.COM!',
    defaultSpeechSpeaker: 'Paparazzi photographer shouting with mic',
    defaultTopText: 'BREAKING: THE $1,000,000 PREGNANCY BET IS REAL',
    defaultBottomText: 'PRESALE RAISING $111,000 LIVE NOW AT CARDIBEEWAP.COM',
    defaultHeadline: 'IS SHE PREGNANT?! $1M IN BETS FLOOD CARDIBEEWAP.COM AS $111K PRESALE OPENS',
    defaultStyle: 'tabloid_paparazzi'
  },
  {
    id: 'crypto_sportsbook',
    name: 'Las Vegas Degen Sportsbook',
    subtitle: 'Crowded neon sports betting floor with pregnancy odds board',
    icon: '🎰',
    defaultTitle: 'Cardi Bee Pregnancy Odds Board',
    defaultScene:
      'A neon-lit Las Vegas style crypto sportsbook casino floor. In the foreground, male character (@image1) and female character (@image2) are laughing and holding giant stacks of betting slips. In the background, a massive luminous digital LED odds board displays live betting lines for Cardi Bee pregnancy predictions alongside a $111,000 presale progress bar.',
    defaultManOutfit: 'Velvet casino jacket, gold Rolex watch, sunglasses',
    defaultWomanOutfit: 'Sparkling cocktail dress, bee honey comb earrings, holding a celebratory champagne flute',
    defaultBackground: 'Degens and casino patrons frantically placing bets at teller counters under neon lights',
    defaultSpeechBubble: "Odds on 'YES PREGNANT' just hit +450! Put another 50k on it!",
    defaultSpeechSpeaker: 'Excited crypto trader placing bet',
    defaultTopText: 'VEGAS OPENED ODDS ON CARDI BEE GETTING PREGNANT',
    defaultBottomText: 'WIN UP TO $1,000,000 AT CARDIBEEWAP.COM',
    defaultHeadline: 'SPORTSBOOK CHAOS: OVER $1M BET ON CARDI BEE PREGNANCY PROBABILITY',
    defaultStyle: 'cinematic_movie'
  },
  {
    id: 'test_reveal',
    name: 'Live Stream Pregnancy Test',
    subtitle: 'Dramatic social media live-stream reaction holding the test',
    icon: '📱',
    defaultTitle: 'Live Stream Test Reveal Shock',
    defaultScene:
      'Framed like a viral TikTok/Instagram Live broadcast from a luxury bathroom vanity. Female character (@image2) holds a digital pregnancy test close to the camera with wide eyes and open-mouthed expression. Male character (@image1) in the background peeking around the doorway with hands on his head in pure suspense. Live stream comments and heart emojis floating along the side of the screen.',
    defaultManOutfit: 'Casual oversized hoodie, messy stylish hair, shocked reaction face',
    defaultWomanOutfit: 'Silk morning robe, perfect makeup, holding the test stick',
    defaultBackground: 'Glowing luxury bathroom mirror with floating livestream comments & emoji reactions',
    defaultSpeechBubble: 'Chat... do you see two lines or is it just the $111k presale hype?!',
    defaultSpeechSpeaker: 'Cardi Bee talking directly into stream camera',
    defaultTopText: 'THE CHAT WHEN SHE DOES THE PREGNANCY TEST LIVE',
    defaultBottomText: '$1,000,000 ON THE LINE AT CARDIBEEWAP.COM',
    defaultHeadline: 'VIRAL STREAM: 500,000 VIEWERS TUNE IN FOR $1M CARDI BEE TEST REVEAL',
    defaultStyle: 'photo_candid'
  },
  {
    id: 'presale_shower',
    name: '$111k Presale Honey Baby Shower',
    subtitle: 'Extravagant golden honey bee themed crypto victory celebration',
    icon: '🐝',
    defaultTitle: 'Cardi Bee $111,000 Presale Sold Out Shower',
    defaultScene:
      'An over-the-top opulent outdoor garden baby shower party in Miami. Lush floral arrangements of yellow sunflowers and golden honeycomb arches. A giant celebratory cake sculpted like a giant baby bottle filled with golden honey and "$111,000 PRESALE FILLED" written in icing. Male character (@image1) popping a golden champagne bottle while female character (@image2) beams proudly beside him.',
    defaultManOutfit: 'Crisp all-white summer linen suit with gold bee lapel pin, popping champagne',
    defaultWomanOutfit: 'Flowing sunflower-yellow silk maternity gown with gold crown headpiece',
    defaultBackground: 'Celebrity guests cheering with confetti and golden bee balloons floating in the air',
    defaultSpeechBubble: '$111,000 PRESALE SOLD OUT! Now who takes the $1M baby bet?!',
    defaultSpeechSpeaker: 'Male host cheering with mic',
    defaultTopText: '$111,000 PRESALE COMPLETED IN RECORD TIME',
    defaultBottomText: 'NOW THE $1,000,000 PREGNANCY BET BEGINS AT CARDIBEEWAP.COM',
    defaultHeadline: 'SOLD OUT: CARDI BEE RAISES $111K PRESALE — NEXT STOP: $1M BET POOL',
    defaultStyle: 'photo_candid'
  },
  {
    id: 'custom',
    name: 'Custom Viral Meme Scene',
    subtitle: 'Design your own custom viral marketing concept from scratch',
    icon: '✨',
    defaultTitle: 'Custom Viral Meme Prompt',
    defaultScene:
      'My male character (@image1) and female character (@image2) in a funny viral marketing scene with consistent facial features and body shape, custom outfits, and viral meme comedy.',
    defaultManOutfit: 'Stylish modern outfit matching the scene theme',
    defaultWomanOutfit: 'Glamorous iconic outfit matching the scene theme',
    defaultBackground: 'Background characters reacting with expressive humor and excitement',
    defaultSpeechBubble: 'Bet on Cardi Bee at cardibeewap.com!',
    defaultSpeechSpeaker: 'Background bystander',
    defaultTopText: 'WHEN CARDI BEE DROPS THE $111K PRESALE',
    defaultBottomText: 'AND THE $1M PREGNANCY BET GOES LIVE AT CARDIBEEWAP.COM',
    defaultHeadline: 'VIRAL SCANDAL: CARDI BEE TAKES OVER CRYPTO WITH $1M PREGNANCY BET',
    defaultStyle: 'photo_speech_bubble'
  }
]

export function buildImageSystemPrompt(): string {
  return `You are an elite AI Image Prompt & Viral Meme Marketing Director specialized in Grok (xAI) image generation for crypto projects.
Your goal is to engineer the ultimate viral image prompts and marketing copy for the memecoin "Cardi Bee" (Presale raising $111,000, $1,000,000 pregnancy bet betting pool at cardibeewap.com).

CRITICAL GROK IMAGE GENERATOR RULES:
- Grok excels at direct, unfiltered, highly vivid photographic realism and natural dialogue speech bubbles.
- Character 1 (@image1): Male character. Must preserve EXACT facial likeness, jawline, eye shape, hairstyle, and body proportions from reference @image1 across any custom outfit.
- Character 2 (@image2): Female character (Cardi Bee). Must preserve EXACT signature facial features, lips, eyes, makeup, and voluptuous physique from reference @image2 across any custom outfit.
- Speech Bubbles & Meme Text: Grok renders text with high precision when framed inside clear quotes: e.g., 'There is a cartoon speech bubble above the background patron that clearly reads "I\'m sure she gets pregnant soon! Did you bet on Cardi Bee?!"'.

OUTPUT STRUCTURE:
Emit the Grok prompt first and foremost:
[IMAGE_PROMPT_GROK]
(Direct, ultra-realistic narrative prompt specifically engineered for Grok on X/Twitter with exact character likeness preservation from @image1 and @image2, raw candid photographic detail, and natural speech bubble dialogue in quotes)

[IMAGE_PROMPT_FLUX]
(FLUX.1 prompt)

[IMAGE_PROMPT_MIDJOURNEY]
(Midjourney prompt with --cref parameters)

[IMAGE_PROMPT_IDEOGRAM]
(Ideogram prompt with quoted typography)

[IMAGE_PROMPT_SDXL]
(SDXL prompt)

[NEGATIVE_PROMPT]
(Comprehensive negative prompt)

[VIRAL_SOCIAL_COPY]
(Ready-to-post Twitter/X & Telegram marketing copy with emojis, hooks for $111k presale, $1M pregnancy bet, and cardibeewap.com)

No filler explanations or conversational preambles. Output the structured sections directly.`
}

export function buildImageUserPrompt(req: ImagePromptRequest): string {
  return `Generate an elite Grok-optimized viral meme image prompt package with these parameters:

CAMPAIGN: ${req.campaignContext.tokenName} | Presale: ${req.campaignContext.presaleGoal} | Bet Pool: ${req.campaignContext.betPool} | Site: ${req.campaignContext.website}
PRESET: ${req.presetId} - ${req.title}
PRIMARY TARGET ENGINE: GROK (xAI / Twitter)
ASPECT RATIO: ${req.aspect}
VISUAL STYLE: ${req.style}
TEXT MODE: ${req.textMode}

SCENE DESCRIPTION:
${req.sceneDescription}

CHARACTER 1 (MALE - @image1):
- Identity: Exact face, bone structure & body of reference @image1
- Outfit: ${req.manCharacter.outfit || 'Stylish designer attire'}
- Expression/Action: ${req.manCharacter.expression || 'Expressive and animated'}
- Custom Traits: ${req.manCharacter.traits || 'None'}

CHARACTER 2 (FEMALE / CARDI BEE - @image2):
- Identity: Exact face, signature features & body of reference @image2
- Outfit: ${req.womanCharacter.outfit || 'Glamorous iconic couture'}
- Expression/Action: ${req.womanCharacter.expression || 'Expressive, confident, radiant'}
- Custom Traits: ${req.womanCharacter.traits || 'None'}

BACKGROUND / OTHER CHARACTERS:
${req.backgroundPeople || 'Background people observing and reacting with humorous expressions'}

TEXT & SPEECH BUBBLE CONTENT:
- Speech Bubble: "${req.speechBubbleText}" (Speaker: ${req.speechBubbleSpeaker})
- Top Meme Text: "${req.topMemeText}"
- Bottom Meme Text: "${req.bottomMemeText}"
- Tabloid Headline: "${req.tabloidHeadline}"`
}

function stylePrefix(style: MemeStylePreset): string {
  switch (style) {
    case 'photo_candid':
      return 'Authentic 35mm candid flash photography, raw realistic documentary style, natural grain, direct flash lighting, cinematic film still,'
    case 'photo_speech_bubble':
      return 'Photorealistic 35mm flash photo hybrid with clean animated speech bubble overlay, vivid candid realism, high contrast flash,'
    case 'satirical_3d':
      return 'Satirical 3D stylized animated comedy feature film render, expressive caricature facial animations, vibrant colorful lighting, 8k render octane,'
    case 'comic_popart':
      return 'Vintage pop-art comic book illustration, Roy Lichtenstein style halftone dot pattern, bold black inked outlines, retro 90s meme comic panel,'
    case 'tabloid_paparazzi':
      return 'Harsh paparazzi telephoto nighttime flash photography, TMZ celebrity tabloid cover candid, direct blinding camera flash, motion blur in background,'
    case 'cinematic_movie':
      return 'Cinematic 85mm movie still, Arri Alexa Mini, anamorphic lens flare, shallow depth of field f/1.8, warm film grading, dramatic narrative framing,'
    default:
      return 'Photorealistic candid photograph, 35mm film,'
  }
}

export function compileInstantImagePrompt(req: ImagePromptRequest): ImagePromptResult {
  const sp = stylePrefix(req.style)
  const manFace = req.manCharacter.traits
    ? `male character (exact facial likeness and body from @image1: ${req.manCharacter.traits})`
    : 'male character (exact facial likeness and body from @image1)'
  const womanFace = req.womanCharacter.traits
    ? `female character (exact face and body from @image2: ${req.womanCharacter.traits})`
    : 'female character (exact face and body from @image2)'

  const manDesc = `${manFace} wearing ${req.manCharacter.outfit || 'trendy stylish clothes'}, identical face structure and body physique matching reference @image1, expression is ${req.manCharacter.expression || 'candid and lively'}`
  const womanDesc = `${womanFace} wearing ${req.womanCharacter.outfit || 'glamorous outfit'}, identical face geometry, facial features, and body physique matching reference @image2, expression is ${req.womanCharacter.expression || 'expressive and glowing'}`

  const bgDesc = req.backgroundPeople
    ? `In the background: ${req.backgroundPeople}.`
    : 'In the background, other people in the room are staring and whispering to each other with hilarious shocked and nosy expressions.'

  let textClause = ''
  let ideogramTextClause = ''
  let grokTextClause = ''
  if (req.textMode === 'speech_bubble' && req.speechBubbleText) {
    textClause = ` A cartoon speech bubble floats above the background person with tail pointing to their mouth, containing the text "${req.speechBubbleText}".`
    ideogramTextClause = ` Speech bubble coming from ${req.speechBubbleSpeaker || 'background patron'} with legible bold text: "${req.speechBubbleText}".`
    grokTextClause = ` There is a cartoon dialogue speech bubble floating above ${req.speechBubbleSpeaker || 'the background person'} pointing to their mouth, clearly showing the text: "${req.speechBubbleText}".`
  } else if (req.textMode === 'top_bottom_meme') {
    textClause = ` Bold meme caption on top: "${req.topMemeText}" and on bottom: "${req.bottomMemeText}".`
    ideogramTextClause = ` Classic top meme text in bold white Impact font with black outline: "${req.topMemeText}", bottom text: "${req.bottomMemeText}".`
    grokTextClause = ` The image has bold white meme text with black outline. Top text: "${req.topMemeText}". Bottom text: "${req.bottomMemeText}".`
  } else if (req.textMode === 'tabloid_headline' && req.tabloidHeadline) {
    textClause = ` A bold yellow-and-red breaking news tabloid banner across the lower third reading "${req.tabloidHeadline}".`
    ideogramTextClause = ` Tabloid headline graphic banner with bold capitalized typography: "${req.tabloidHeadline}".`
    grokTextClause = ` A bold tabloid breaking news headline banner across the bottom reading: "${req.tabloidHeadline}".`
  }

  // Grok (xAI) Master Prompt
  const grokPrompt = `A high-impact, hyper-realistic candid viral meme photo in ${req.style.replace(/_/g, ' ')} style. Scene: ${req.sceneDescription}. Main subjects: ${manDesc}; and ${womanDesc}. ${bgDesc}${grokTextClause} Authentic, unfiltered viral internet humor, natural 35mm flash camera lighting, detailed realistic skin pores, photorealistic clothing textures, 8k resolution.`

  // FLUX.1 prompt
  const fluxPrompt = `${sp} ${req.sceneDescription}. Featuring two central figures: ${manDesc}; and ${womanDesc}. ${bgDesc}${textClause} Highly detailed, hyperrealistic skin pores, photorealistic clothing folds, atmospheric lighting, 8k resolution, authentic viral internet humor.`

  // Midjourney prompt
  const mjAspect = req.aspect.replace(':', ':')
  const mjPrompt = `/imagine prompt: ${sp} ${req.sceneDescription}, ${manDesc}, ${womanDesc}, ${bgDesc}${textClause} --ar ${mjAspect} --v 6.1 --style raw --cref @image1 @image2 --cw 100 --c 5`

  // Ideogram 2.0 prompt
  const ideogramPrompt = `${sp} A funny viral meme image: ${req.sceneDescription}. ${manDesc}. ${womanDesc}. ${bgDesc}${ideogramTextClause} Clean typography, perfect spelling, crisp speech bubbles, high aesthetic photo composition.`

  // SDXL prompt
  const sdxlPrompt = `(masterpiece, best quality, ultra-detailed:1.3), ${sp} (${req.sceneDescription}:1.2), (${manDesc}:1.2), (${womanDesc}:1.2), (${bgDesc}:1.1), ${textClause}, cinematic lighting, photorealistic, 8k uhd, sharp focus`

  // DALL-E 3 prompt
  const dalle3Prompt = `A high-quality viral meme photograph in ${req.style} style. ${req.sceneDescription}. Two main subjects: a man (${manDesc}) and a woman (${womanDesc}). ${bgDesc}${textClause} Photorealistic, sharp focus, vibrant contrast, humorous viral mood.`

  // Negative prompt
  const negativePrompt =
    'bad anatomy, deformed face, distorted eyes, poorly drawn hands, missing fingers, extra limbs, blurry, out of focus, low resolution, mutated features, unrealistic plastic skin, duplicate faces, misspelled text outside intended bubbles, watermark, logo, bad composition'

  // Social Media Viral Copy
  const socialCopy = `🚨 RUMOR MILL IS GOING CRAZY! 🐝🍼

Is Cardi Bee getting pregnant?! 👀

The whole room is whispering, and over $1,000,000 is on the line in the official Pregnancy Bet Pool!

💰 Presale is LIVE: Raising $111,000
🎯 Bet & Win up to $1,000,000: Will she get pregnant or NO?!
🌐 Join the presale now at: https://${req.campaignContext.website || 'cardibeewap.com'}

#CardiBee #CardiBeeWAP #Memecoin #CryptoGems #Presale #Solana #CryptoBetting #DeFi`

  // Determine main prompt based on chosen engine (default Grok)
  let mainPrompt = grokPrompt
  if (req.engine === 'flux') mainPrompt = fluxPrompt
  else if (req.engine === 'midjourney') mainPrompt = mjPrompt
  else if (req.engine === 'ideogram') mainPrompt = ideogramPrompt
  else if (req.engine === 'sdxl') mainPrompt = sdxlPrompt
  else if (req.engine === 'dalle3') mainPrompt = dalle3Prompt

  return {
    mainPrompt,
    enginePrompts: {
      grok: grokPrompt,
      flux: fluxPrompt,
      midjourney: mjPrompt,
      ideogram: ideogramPrompt,
      sdxl: sdxlPrompt,
      dalle3: dalle3Prompt
    },
    negativePrompt,
    socialCopy,
    textInstructions: textClause.trim() || 'No text overlay'
  }
}

export function buildBrainstormSystemPrompt(): string {
  return `You are an unhinged, hilarious, brilliant viral memecoin marketing director.
Your goal is to brainstorm 5 completely original, funny, viral meme & image scenario concepts for the memecoin "Cardi Bee" (Presale raising $111,000, $1,000,000 pregnancy bet betting pool at cardibeewap.com).

CHARACTERS INVOLVED:
- Man character (@image1): stylish, cool, animated partner.
- Woman character (@image2): glamorous, iconic, voluptuous Cardi Bee.
- Background characters: nosy neighbors, paparazzi, crypto degens, doctors, waitresses, judges, sports bettors, family members whispering and reacting.

CREATIVE DIRECTION:
- The humor revolves around gossip, ridiculous betting odds, baby bump speculation, presale hype ($111k), the massive $1,000,000 payout, dramatic paparazzi moments, luxury dates turned chaotic, or funny everyday situations where everyone is secretly betting on her.
- Each idea must be unique, funny, visual, and highly memeable on Twitter/X, TikTok, and Telegram.

OUTPUT FORMAT:
Output ONLY a strict, valid JSON array of 5 objects with NO markdown fences, no explanatory text.
JSON Schema for each object:
{
  "id": "unique_slug",
  "title": "Short punchy meme title",
  "concept": "1-sentence funny viral summary",
  "scene": "Detailed visual scene description with camera angle, lighting, and action",
  "manOutfit": "Man outfit description in this scene",
  "womanOutfit": "Woman outfit description in this scene",
  "background": "Background crowd/characters actions and expressions",
  "speechBubble": "Funny punchline inside speech bubble",
  "speechSpeaker": "Who speaks the bubble (e.g. Nosy bystander, Doctor, Reporter)",
  "topText": "Classic top meme text",
  "bottomText": "Classic bottom meme text",
  "headline": "Tabloid breaking headline banner",
  "style": "photo_candid" | "photo_speech_bubble" | "satirical_3d" | "comic_popart" | "tabloid_paparazzi" | "cinematic_movie"
}`
}

export function buildBrainstormUserPrompt(req: BrainstormRequest): string {
  const topicDirective = req.topic?.trim()
    ? `SPECIFIC THEME / TOPIC TO EXPLORE: "${req.topic.trim()}"`
    : `EXPLORE DIVERSE VIRAL SCENARIOS: (e.g. court trial, grocery shopping, red carpet, luxury yacht, game show, airport security, press conference, family dinner, crypto conference)`

  return `Brainstorm 5 wildly funny, viral meme image concepts for Cardi Bee ($111,000 presale, $1,000,000 pregnancy bet at cardibeewap.com).

${topicDirective}

Return a valid JSON array of 5 idea objects.`
}

export function parseBrainstormResponse(text: string): BrainstormIdea[] {
  try {
    const cleaned = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    // Find JSON array bounds
    const startIdx = cleaned.indexOf('[')
    const endIdx = cleaned.lastIndexOf(']')
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      const jsonStr = cleaned.slice(startIdx, endIdx + 1)
      const parsed = JSON.parse(jsonStr)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item, idx) => ({
          id: String(item.id || `idea_${Date.now()}_${idx}`),
          title: String(item.title || `Viral Meme Idea #${idx + 1}`),
          concept: String(item.concept || item.title || ''),
          scene: String(item.scene || ''),
          manOutfit: String(item.manOutfit || 'Trendy streetwear attire'),
          womanOutfit: String(item.womanOutfit || 'Glamorous iconic outfit'),
          background: String(item.background || 'Background characters reacting with shock'),
          speechBubble: String(item.speechBubble || "Did you bet on Cardi Bee?!"),
          speechSpeaker: String(item.speechSpeaker || 'Background bystander'),
          topText: String(item.topText || 'WHEN CARDI BEE WALKS IN'),
          bottomText: String(item.bottomText || '$1M PREGNANCY BET IS LIVE AT CARDIBEEWAP.COM'),
          headline: String(item.headline || 'BREAKING: $1,000,000 PREGNANCY BET AT CARDIBEEWAP.COM'),
          style: (item.style as MemeStylePreset) || 'photo_speech_bubble'
        }))
      }
    }
  } catch {
    // fallback parsing below
  }

  // Fallback rich brainstorm ideas if Qwen fails JSON parsing
  return [
    {
      id: `idea_courtroom_${Date.now()}`,
      title: 'The $1M Pregnancy Trial',
      concept: 'Judge and jury holding betting slips instead of legal papers',
      scene:
        'A chaotic, glamorous courtroom drama. Male character (@image1) and female character (@image2) are sitting at the defense table looking fabulous. The judge at the bench is wearing a powdered wig and holding a glowing ultrasound monitor, while the entire jury box is leaning forward holding neon betting slips.',
      manOutfit: 'Pinstripe luxury mob boss suit with gold tie clip, looking calm and confident',
      womanOutfit: 'Designer tweed Chanel-style courtroom suit with oversized diamond sunglasses',
      background: 'Jury members in the jury box arguing heatedly over pregnancy odds',
      speechBubble: 'Your Honor, the defense bets $100,000 she delivers twins!',
      speechSpeaker: 'Defense attorney slamming desk',
      topText: 'WHEN THE COURT CANNOT DECIDE ON THE EVIDENCE',
      bottomText: 'SO THEY OPEN A $1,000,000 BETTING POOL AT CARDIBEEWAP.COM',
      headline: 'COURTROOM DRAMA: JUDGE ORDERS PATERNITY TEST ON LIVE STREAM',
      style: 'photo_speech_bubble'
    },
    {
      id: `idea_supermarket_${Date.now()}`,
      title: 'Midnight Grocery Cravings',
      concept: 'Paparazzi ambush in the snack aisle buying pickles and ice cream',
      scene:
        'Late night neon-lit supermarket aisle. Female character (@image2) is standing with a shopping cart piled 6 feet high with pickles, hot sauce, watermelon, and honey. Male character (@image1) is laughing while holding a gallon of ice cream. Cashier and shoppers in the background are whispering with eyes wide.',
      manOutfit: 'Cozy luxury silk hoodie and sweatpants with designer slides',
      womanOutfit: 'Oversized fluffy pink fur coat over silk slip dress, fluffy slippers',
      background: 'Nosy shoppers hiding behind cereal boxes peeking and taking sneaky phone photos',
      speechBubble: 'Look at those cravings! She is 100% pregnant! Buy the bet now!',
      speechSpeaker: 'Shopper whispering behind chips aisle',
      topText: 'SHE JUST BOUGHT PICKLES AND HOT SAUCE AT 3 AM',
      bottomText: 'THE $1,000,000 YES-PREGNANT ODDS JUST SKYROCKETED',
      headline: 'SPOTTED: 3 AM CRAVING RUN FUELS $1M CARDI BEE BETTING FRENZY',
      style: 'photo_candid'
    },
    {
      id: `idea_redcarpet_${Date.now()}`,
      title: 'Met Gala Honey Bee Reveal',
      concept: 'Red carpet photographers dropping cameras looking at her stomach',
      scene:
        'Grand Met Gala museum steps with red velvet carpet. Female character (@image2) poses with hands gently framing her stomach in an extravagant golden bee gown made of amber crystals. Male character (@image1) proudly fixes her train. Hundreds of paparazzi and celebrities in the background are gasping.',
      manOutfit: 'Tailored black velvet tuxedo with gold embroidered honeycombs',
      womanOutfit: 'Extravagant golden honey couture dress with 10-foot sheer yellow train',
      background: 'A wall of 200 photographers with flashing cameras and open mouths in shock',
      speechBubble: 'DID SHE JUST POSE WITH A BABY BUMP?! BET ON CARDIBEEWAP.COM!',
      speechSpeaker: 'Red carpet reporter yelling with mic',
      topText: 'THE RED CARPET POSE THAT BROKE THE INTERNET',
      bottomText: '$1,000,000 PREGNANCY POOL FILLED IN 10 MINUTES',
      headline: 'MET GALA SHOCK: CARDI BEE STEALS SHOW AMID $1M BET SCANDAL',
      style: 'tabloid_paparazzi'
    },
    {
      id: `idea_airport_${Date.now()}`,
      title: 'TSA Security Scanner Scandal',
      concept: 'Airport TSA agents staring at the X-ray screen in total awe',
      scene:
        'High-security VIP airport checkpoint. Female character (@image2) is stepping through the futuristic body scanner with sunglasses on. Male character (@image1) is waiting at the conveyor belt holding luxury luggage. Three TSA officers are huddled together pointing excitedly at the monitor.',
      manOutfit: 'Designer tracksuit, gold watch, rolling a stack of Rimowa suitcases',
      womanOutfit: 'Sleek luxury travel catsuit, long trench coat, stiletto boots',
      background: 'TSA agents calling over supervisors to look at the screen scanner results',
      speechBubble: 'Officer, is that a baby bump or $111,000 in presale tokens?!',
      speechSpeaker: 'TSA Officer talking into radio',
      topText: 'WHEN TSA RUNS THE BODY SCANNER ON CARDI BEE',
      bottomText: 'AND THE ENTIRE AIRPORT PLACES A BET AT CARDIBEEWAP.COM',
      headline: 'AIRPORT SECURITY LEAK: CARDI BEE TRAVELS TO VEGAS FOR $1M BET REVEAL',
      style: 'cinematic_movie'
    },
    {
      id: `idea_press_${Date.now()}`,
      title: 'The White House Style Press Briefing',
      concept: 'Official press conference with microphones and betting charts',
      scene:
        'Official press briefing room with wooden podium covered in 50 news microphones. Male character (@image1) and female character (@image2) stand at the podium. Behind them, a giant chart shows "$111,000 PRESALE COMPLETED - $1,000,000 PREGNANCY BET POOL". The entire press corps has their hands raised in the air.',
      manOutfit: 'Presidential navy blue tailored suit with gold bee pin',
      womanOutfit: 'Executive sharp golden-yellow pantsuit with diamond brooch',
      background: 'Frantic journalists and reporters with hands raised shouting questions',
      speechBubble: 'No more questions about the economy! Are you pregnant or NO?!',
      speechSpeaker: 'White House correspondent shouting with pen and pad',
      topText: 'THE ONLY PRESS BRIEFING THE WORLD CARES ABOUT',
      bottomText: 'BET AND WIN UP TO $1,000,000 AT CARDIBEEWAP.COM',
      headline: 'PRESS CONFERENCE CHAOS: CARDI BEE REFUSES TO CONFIRM OR DENY PREGNANCY',
      style: 'photo_candid'
    }
  ]
}

