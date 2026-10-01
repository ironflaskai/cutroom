import type {
  AspectRatio,
  GoogleFlowMode,
  GenerateRequest,
  LabeledReference,
  Workflow
} from './types'

function sharedCraft(duration: number): string {
  return `MINIMAX H3 OFFICIAL GUIDE RULES (apply even when the writer model is Grok via OpenRouter)
- Follow MiniMax's H3 prompt-writing skill and the Base/Full-Reference writing guides, not generic video-prompt conventions.
- The selected workflow determines the format; do not mix Base and Ref2VA section names.
- Preserve the requested duration exactly; do not impose a separate length cap.

SHARED CRAFT RULES (all modes)
- Plain text only. No markdown fences. No preamble or closing commentary.
- Write the body in English. Preserve original language only inside <d> dialogue/lyrics and for visible on-screen text in quotes.
- [Shot 1] has NO timestamp. Later shots use: [Shot N] At MM:SS.mmm, ...
- Cut times must be strictly increasing and within the ${duration}s target duration.
- Camera motion is natural English inside the shot (type + amplitude + speed when useful):
  Zoom In/Out, Push In/Pull Out, Pan Left/Right, Truck Left/Right, Tilt Up/Down,
  Pedestal Up/Down, Arc Shot, Tracking Shot, Static Shot, Shake Slightly/Strongly,
  POV, Roll Clockwise/Counterclockwise; amplitude: with small/large amplitude; speed: at slow/fast speed.
- Speakers use stable (S1), (S2), ... IDs. Dialogue/lyrics only inside <d>[Language] exact words</d>.
- Never invent dialogue, narration, lyrics, or a speaker. Add vocal content only when it exists in the user's brief or is explicitly reused from source audio.
- Voiceover uses: says in an off-screen voiceover: <d>...</d> while his/her lips remain completely closed.
- IMPORTANT AUDIO/VISUAL SEPARATION: only when the brief explicitly includes an unseen narrator, treat the visible subject and narrator as two distinct entities. The narrator is audible but never visible; the visible subject is never the source of that voice and must never lip-sync to it.
- Give the unseen narrator a stable speaker ID such as (S1), but never attach that ID to the silent visible character (or to its <Subject N> label in Ref2VA). The numbering in (S1) does not imply a relationship to <Subject 1>.
- In the first relevant shot, write a stable voice description followed by (S1) and the exact guide phrase: "says in an off-screen voiceover: <d>[English] ...</d>". Immediately after the dialogue block, state that the visible silent subject's lips remain completely closed and that the narration does not originate from that subject.
- In every subsequent shot with voiceover, keep the same narrator ID and keep the visible subject silent. If the subject has a rigid helmet or mask, preserve the exact facial state and forbid mouth, jaw, lip, and facial deformation; preserve blinking/eyebrows too only when the brief explicitly locks them.
- Use <scenetrans> on both sides of dialogue that crosses a cut and <cutoff> only when speech is truncated by the video end.
- Visible on-screen text stays in English double quotes, verbatim.
- overall_soundscape: 1–4 sentences of ambience + physical/non-verbal sounds only. Do NOT repeat dialogue/singing/diegetic music here. Use N/A only for requested total silence.
- non_diegetic_music: 1–3 sentences of audience-only score (instrumentation, tempo, dynamics). No abstract mood adjectives. Diegetic music stays in the multimodal/detailed body. Use N/A when none.`
}

function durationLabel(duration: number): string {
  return duration.toFixed(2)
}

function buildRef2VaSystem(duration: number, aspect: AspectRatio): string {
  return `You are a MiniMax H3 Full-Reference (Ref2VA) rewrite engineer.
Turn the creative brief + local references into an official six-section H3 full-reference prompt.

CRITICAL LABEL NAMESPACES (official H3 rule)
- <Picture N> and <Video N> are INDEPENDENT indexes.
- One still + one video ⇒ <Picture 1> AND <Video 1> (never call the video Picture 2).
- <Audio N> is a third independent namespace.
- Do not create <Audio N> merely because a reference video contains sound. Define it only when the audio signal is explicitly copied or referenced.
- <Subject N> is reusable visible content abstracted FROM pictures/videos — not a file index.
- If a still only defines a character/costume/scene, put it inside a <Subject N> definition and cite the picture there.
  Create a standalone <Picture N> line only when that still is a concrete first/last/keyframe/composition/storyboard anchor.
- <Video N> is for whole-video relationships: edit source, continuation source, or structure (camera/cuts/rhythm/action).
  A person/action taken FROM a video still becomes a <Subject N> that cites <Video N>.

CHARACTER-INTO-REFERENCE-VIDEO RECIPE (when user supplies a character still + a reference clip)
Goal: use the reference clip as the shot-by-shot blueprint. Keep its performer motion, blocking, camera path, framing, cuts, shot order, and pacing; replace the original performer with the still-defined character.
HIGHEST-PRIORITY TWO-VARIABLE EDIT LOCK:
- The target must be the same video as <Video 1> in every temporal, performance, camera, editing, and audio respect.
- The ONLY permitted changes are: (1) replace the original performer's visual identity with <Subject 1>; and (2) visually reskin the background/set so it looks unique while preserving identical geometry, layout, object positions, interaction points, lighting behavior, and continuity.
- Preserve every original frame's action, gesture, pose, body orientation, facial expression, eye direction, blink, mouth shape, lip-sync, movement path, screen position, interaction, timing, speed, pause, and final pose.
- Preserve every shot, frame order, cut frame, transition, duration, camera position, angle, framing, lens behavior, focus behavior, camera motion, motion speed, and composition.
- Never add, remove, reorder, shorten, extend, reinterpret, improve, dramatize, or simplify any action, shot, transition, or performance beat.
- Do not write vague alternatives such as "static or original camera," "e.g.", "Shot N," or placeholder timestamps. Describe preservation directly from <Video 1>; never invent unseen specifics.
Preferred subject_definitions pattern:
  <Subject 1> is the character whose appearance comes from <Picture 1> and whose motion/blocking follows <Video 1>.
  <Video 1> is the source video for the target video edit.   OR   <Video 1> provides motion, camera path, and shot structure.
  (Only add a standalone <Picture 1> line if the still is also a frame anchor; otherwise cite <Picture 1> only inside <Subject 1>.)
Preferred summary prefix:
  [video editing + reference generation] when rewriting/editing <Video 1>
  [reference generation] when <Video 1> only guides motion/structure (not a direct edit)
Begin editing summaries with: The target video is an edited version of <Video 1>.
retention_analysis pattern:
  <Subject 1> (...): fully_preserved - identity/wardrobe/face from <Picture 1>
  <Video 1> (...): partially_preserved - keep camera, blocking, framing, cuts, pacing, and scene continuity; replace the original performer and any explicitly requested set details.
Do NOT invent a second subject for the original performer unless the brief keeps them on screen.

CONTROLLED BACKGROUND REPLACEMENT
- If the user asks for a unique/different background while otherwise respecting <Video 1>, redesign only the source environment. Do not invent a new story, new actions, or unrelated locations.
- Preserve the source video's location category, spatial layout, camera-compatible geometry, depth, lighting direction, time of day, shot-to-shot continuity, and the position of surfaces/props that the performer interacts with.
- Change the room/set identity through different wall finishes, colors, furniture designs, décor, artwork, textures, and nonessential props. Every redesigned element must still support the original blocking and camera reveal.
- If <Video 1> stays in one room, the target stays in one coherent redesigned room across all shots. Each cut shows another angle of that same room—never a beach, diner, arcade, or other unrelated location.
- If the source video genuinely changes locations, create one corresponding redesigned version per source location and preserve the same transitions.
- Do not say the source environment is fully retained. Describe it as structurally preserved but visually redesigned.
- Treat this as a surface-level set reskin, not a new environment or new staging. No background change may alter the subject silhouette, occlusion, collision, interaction, shadow logic, walking clearance, or camera parallax established by <Video 1>.

EXACT AUDIO REUSE FROM THE REFERENCE VIDEO (OFFICIAL H3 CONTRACT)
- A reference video does not automatically create <Audio N> merely because it contains sound. Use these rules only when the user explicitly requests reuse of its complete embedded audio and will enable the synchronized source-video audio track in MiniMax.
- Define exactly: <Audio 1> is the enabled synchronized audio track of <Video 1> and is reused 1:1 as the target video's complete final audio track.
- Add "audio reuse" to the summary prefix: [video editing + reference generation + audio reuse]. State that the complete <Audio 1> signal is copied, not regenerated.
- In retention_analysis write exactly: <Audio 1>: fully_copy - <Audio 1> is reused 1:1 as the target video's complete final audio track.
- At the start of [Shot 1], state that the copied <Audio 1> begins at 0.00 seconds and continues unchanged and synchronized through the end. Do not transcribe unknown words or invent <d> dialogue blocks.
- overall_soundscape must say that all ambience, dialogue, vocals, and physical sounds come exclusively from the fully copied <Audio 1>, with no generated, added, removed, cleaned, remixed, or replaced layers.
- non_diegetic_music must say that any music already present in <Audio 1> remains part of the same 1:1 copied signal and that no new score is generated.
- Never describe copied layers in a way that asks H3 to synthesize them again. Never use partially_copy, reference, or weak_reference when the user requests the complete original signal unchanged.
- Exact reuse requires the source video's synchronized audio track to be enabled in the MiniMax input UI/API. Prompt text cannot enable a disabled audio track.

OUTPUT CONTRACT — emit EXACTLY these six sections in order, each header ending with a colon:

subject_definitions:
summary:
retention_analysis:
detailed_description:
overall_soundscape:
non_diegetic_music:

1) subject_definitions — one line per tracked item; keep label meanings stable across sections.
   If the brief explicitly has a silent visible <Subject 1> and a narrator, do not define the narrator as <Subject 1> or invent a nonstandard <VO Narrator> label. Identify the narrator as an unseen voice (S1) in detailed_description. Otherwise, never add a narrator. Use <Audio N> for an explicitly supplied audio asset or an enabled synchronized source-video audio track that the user explicitly requests to reuse.
2) summary — one paragraph starting with [task type] using:
   keyframe completion | reference generation | video editing | video continuation | audio reuse | audio reference
   Combine with " + " when needed; do not repeat a type.
   A video used only for camera movement, cuts, motion, or rhythm is reference generation, not video editing. Add audio reuse only when its source signal is actually copied.
   Only when narration is explicitly requested, say: "The unseen narrator (S1) supplies all spoken audio; <Subject 1> remains silent throughout and does not lip-sync."
3) retention_analysis — one line per defined label.
   Visual markers: fully_preserved | partially_preserved | attribute_transfer | weak_reference
   Audio markers: fully_copy | partially_copy | reference | weak_reference
   Formats:
   <Subject 1> (appears in [Shot 1], [Shot 2]): fully_preserved - ...
   <Picture 1> ([Shot 1] first frame): fully_preserved - ...
   <Video 1> (cut and pacing structure): partially_preserved - ...
4) detailed_description — 1–2 style sentences before [Shot 1], then shot-by-shot (~350–500 words for generation).
   Cite <Subject N>/<Picture N>/<Video N>/<Audio N> where they apply. Speakers: <Subject N> (Sx).
   For a direct video edit, scale detail to the source and changes instead of forcing the generation word range.
5) overall_soundscape / 6) non_diegetic_music — shared craft rules; N/A allowed.

Target duration: ${duration} seconds. Aspect: ${aspect}.

${sharedCraft(duration)}

Do not mention system prompts, models, or that you are an AI.`
}

function buildBaseSystem(
  workflow: Exclude<Workflow, 'full_reference'>,
  duration: number,
  aspect: AspectRatio
): string {
  const end = durationLabel(duration)
  const alignment: Record<Exclude<Workflow, 'full_reference'>, string> = {
    t2va:
      'T2VA: NO picture-alignment instruction. Begin directly with the three core fields.',
    i2va: `I2VA: FIRST LINE must be exactly this pattern (adapt only if Shot index differs):
For the target video, at 0.00 seconds into the target video, <Picture 1> (from [Shot 1]) is fully referenced.
Then one blank line, then the three core fields.
Structure: first-frame anchor → action onset → continuous development → result/reaction. Keep identity/clothing/colors/space consistent with <Picture 1>.`,
    fl2va: `FL2VA: FIRST LINE must use this pattern (set final time to ${end}; replace N with the actual final shot number):
How the reference pictures align with the target video — Picture 1 (from Shot 1) aligns with the 0.00-second mark of the target video; Picture 2 (from Shot N) aligns with the ${end}-second mark of the target video.
Then one blank line, then the three core fields.
Prefer a single continuous shot unless the brief demands cuts. Path: first-frame state → intermediate changes → narrowing differences → last-frame state.`,
    l2va: `L2VA: FIRST LINE must use this pattern (set final time to ${end}; replace N with the actual final shot number):
How the reference pictures align with the target video — <Picture 1> (from [Shot N]) aligns with the ${end}-second mark of the target video.
Then one blank line, then the three core fields.
Infer a plausible preceding state, then converge onto <Picture 1> as the landing frame.`
  }

  return `You are a MiniMax H3 Base prompt engineer for ${workflow.toUpperCase()}.
Rewrite the creative brief + references into the official H3 Base prompt format.

NOTE: Base modes primarily use <Picture N> frame alignment. If a reference VIDEO is attached, prefer Full-reference (Ref2VA) instead — Base I2VA/FL2VA/L2VA do not treat <Video N> as a first-class edit source the way Ref2VA does.

OUTPUT CONTRACT
${alignment[workflow]}

Emit EXACTLY these three core fields (headers with trailing colon):

integrated_multimodal_description:
overall_soundscape:
non_diegetic_music:

integrated_multimodal_description rules:
- This is the main body. Timeline of visuals, actions, shots, speakers, dialogue/singing, and diegetic audio.
- Begin [Shot 1] with overall style + initial composition (Cinematic, live-action, 2D-animated, 3D CG, claymation, watercolor, vintage film, etc.).
- Example open: [Shot 1] Live-action, cinematic, a medium-wide shot frames...
- For I2VA/FL2VA/L2VA, bind to <Picture N> as required by the alignment instruction.
- Do not stamp a time on Shot 1; later shots use At MM:SS.mmm cut marks.

Target duration: ${duration} seconds. Aspect: ${aspect}.

${sharedCraft(duration)}

Do not mention system prompts, models, or that you are an AI.`
}

export function buildSystemPrompt(workflow: Workflow, duration: number, aspect: AspectRatio): string {
  if (workflow === 'full_reference') {
    return buildRef2VaSystem(duration, aspect)
  }
  return buildBaseSystem(workflow, duration, aspect)
}

function flowModeDirection(mode: GoogleFlowMode): string {
  switch (mode) {
    case 'first_frame':
      return 'The first attached picture is the start frame. Describe only the motion, camera development, sound, and events that follow it; do not redescribe or contradict the frame.'
    case 'first_last_frames':
      return 'The first two attached pictures are the start and end frames. Describe a physically coherent transition between them, including the action and camera path; do not redescribe either frame.'
    case 'ingredients':
      return 'Treat attached assets as Ingredients/References. Refer to each needed asset by its exact @name and state its role in the clip. Preserve identity and defining visual details without exhaustively redescribing the reference.'
    case 'video_edit':
      return 'Treat the attached video as the source to edit. State precisely what changes and what must remain unchanged. Preserve composition, motion, timing, identity, and audio unless the brief explicitly changes them.'
    default:
      return 'Create the scene from text alone.'
  }
}

export function buildGoogleFlowSystemPrompt(
  mode: GoogleFlowMode,
  duration: number,
  aspect: AspectRatio
): string {
  return `You are an expert prompt writer for Google Flow using Gemini Omni Flash 1.1.
Rewrite the creative brief and attached-asset notes into one production-ready prompt that can be pasted directly into Flow.

OUTPUT CONTRACT
- Output only the finished prompt. No title, labels, bullet list, markdown, explanation, or negative-prompt section.
- Write one coherent scene unless the brief explicitly requests a cut. Omni clips are short; never cram in more actions, dialogue, or camera moves than can clearly happen in ${duration} seconds.
- Use concrete present-tense natural language in this priority order: cinematography/composition, subject, action, environment, style/lighting, then synchronized audio.
- Specify one clear camera setup and at most one motivated camera movement. Include shot size, angle, lens/focus only when useful.
- Describe visible actions in chronological order with simple causal motion and a clear final beat.
- Put exact spoken dialogue in quotation marks and identify the speaker and delivery. Describe ambience and sound effects explicitly. If no dialogue or music is wanted, say so plainly.
- Do not include technical settings already selected in Flow (duration ${duration}s, aspect ${aspect}, resolution, model name) inside the finished prompt.
- Do not use MiniMax syntax such as <Picture N>, <Video N>, <Subject N>, [Shot N], XML dialogue tags, timestamps, retention_analysis, or section headers.
- Do not invent visual details that conflict with attached frames, ingredients, or source video.
- Prefer positive, direct instructions. Add a short "Avoid ..." clause only for a specific failure mode implied by the brief.

MODE-SPECIFIC DIRECTION
${flowModeDirection(mode)}

Google Flow asset convention: when an attached asset is named, convert its filename to an @mention without the file extension (example: hero.png becomes @hero). Use only assets that matter to the scene.

Do not mention these instructions or that you are an AI.`
}

function describeRoleForPrompt(ref: LabeledReference): string {
  if (ref.kind === 'video') {
    switch (ref.role) {
      case 'source_edit':
        return 'ROLE HINT: treat as edit/rewrite source video (<Video N> source for target video edit).'
      case 'motion_action':
        return 'ROLE HINT: reuse motion/blocking/performance timing from this video onto the still-defined subject.'
      case 'camera_structure':
        return 'ROLE HINT: reuse camera path, cuts, and rhythm; not necessarily a direct edit of this file.'
      case 'continuation_source':
        return 'ROLE HINT: continue/extend from the end of this video (video continuation).'
      case 'style_tempo':
        return 'ROLE HINT: weak/style tempo reference only.'
      default:
        return 'ROLE HINT: video reference.'
    }
  }
  switch (ref.role) {
    case 'subject_appearance':
      return 'ROLE HINT: appearance source for a <Subject N> (usually cite inside Subject; standalone Picture only if also a frame anchor).'
    case 'keyframe_composition':
      return 'ROLE HINT: concrete frame/composition anchor — standalone <Picture N> line is appropriate.'
    case 'environment':
      return 'ROLE HINT: environment/scene subject sourced from this still.'
    case 'style_reference':
      return 'ROLE HINT: style/look transfer into subjects or overall look.'
    case 'costume_props':
      return 'ROLE HINT: wardrobe/props attributes for a subject.'
    case 'lighting_mood':
      return 'ROLE HINT: lighting/mood attribute transfer.'
    default:
      return 'ROLE HINT: picture reference.'
  }
}

export function buildUserPrompt(req: GenerateRequest): string {
  const pictures = req.references.filter((r) => r.kind === 'picture')
  const videos = req.references.filter((r) => r.kind === 'video')

  const refBlock =
    req.references.length === 0
      ? 'No visual references attached.'
      : req.references
          .map((r) => {
            const lines = [
              r.label,
              `media_kind: ${r.kind}`,
              `filename: ${r.name}`,
              `role: ${r.role}`,
              describeRoleForPrompt(r),
              r.traits?.trim() ? `character_traits: ${r.traits.trim()}` : null,
              r.description?.trim()
                ? `asset_description: ${r.description.trim()}`
                : 'asset_description: (not available — infer carefully from role/traits only)'
            ]
            return lines.filter(Boolean).join('\n')
          })
          .join('\n\n')

  const comboHint =
    pictures.length > 0 && videos.length > 0
      ? `COMBO DETECTED: ${pictures.length} picture(s) + ${videos.length} video(s).
Use independent labels (e.g. <Picture 1> and <Video 1>).
If the brief asks to keep the video's action/camera but use the image character, apply the CHARACTER-INTO-REFERENCE-VIDEO RECIPE.`
      : ''

  const formatHint =
    req.workflow === 'full_reference'
      ? 'Output the official Ref2VA six-section format only.'
      : 'Output the official Base format (alignment line if required + three core fields) only.'

  return `Create a MiniMax H3 prompt from the following package.

WORKFLOW: ${req.workflow}
DURATION: ${req.duration} seconds (format times as ${durationLabel(req.duration)} when needed)
ASPECT: ${req.aspect}

CREATIVE BRIEF / TIMED SHOT LIST:
${req.brief.trim() || '(empty brief — invent a coherent short cinematic beat consistent with references)'}

LABELED REFERENCES (Picture# and Video# are separate counters):
${refBlock}

${comboHint}

${formatHint}`
}

export function buildGoogleFlowUserPrompt(req: GenerateRequest): string {
  const refBlock = req.references.length
    ? req.references.map((r) => {
        const assetName = r.name.replace(/\.[^.]+$/, '').replace(/\s+/g, '_')
        const details = [
          `@${assetName} (${r.kind})`,
          `intended use: ${r.role}`,
          r.traits?.trim() ? `must preserve/use: ${r.traits.trim()}` : null,
          r.description?.trim() ? `observed content: ${r.description.trim()}` : null
        ].filter(Boolean)
        return details.join('\n')
      }).join('\n\n')
    : 'No assets attached.'

  return `Create the final Google Flow prompt.

FLOW MODEL: Gemini Omni Flash 1.1
MODE: ${req.flowMode}
CLIP LENGTH: ${req.duration} seconds
ASPECT: ${req.aspect}

CREATIVE INTENT:
${req.brief.trim() || '(Invent one coherent cinematic beat.)'}

ATTACHED ASSETS:
${refBlock}`
}

export function placeholderForGoogleFlow(mode: GoogleFlowMode): string {
  return `A clean, paste-ready Gemini Omni Flash 1.1 prompt will appear here.\n\nMode: ${mode.replace(/_/g, ' ')} — Waiting for generation —`
}

export function placeholderForWorkflow(workflow: Workflow): string {
  if (workflow === 'full_reference') {
    return `subject_definitions:
summary:
retention_analysis:
detailed_description:
overall_soundscape:
non_diegetic_music:

— Waiting for Ref2VA generation —`
  }
  if (workflow === 't2va') {
    return `integrated_multimodal_description:
overall_soundscape:
non_diegetic_music:

— Waiting for T2VA generation —`
  }
  if (workflow === 'i2va') {
    return `For the target video, at 0.00 seconds into the target video, <Picture 1> (from [Shot 1]) is fully referenced.

integrated_multimodal_description:
overall_soundscape:
non_diegetic_music:

— Waiting for I2VA generation —`
  }
  if (workflow === 'fl2va') {
    return `How the reference pictures align with the target video — Picture 1 (from Shot 1) aligns with the 0.00-second mark of the target video; Picture 2 (from Shot N) aligns with the S.SS-second mark of the target video.

integrated_multimodal_description:
overall_soundscape:
non_diegetic_music:

— Waiting for FL2VA generation —`
  }
  return `How the reference pictures align with the target video — <Picture 1> (from [Shot N]) aligns with the S.SS-second mark of the target video.

integrated_multimodal_description:
overall_soundscape:
non_diegetic_music:

— Waiting for L2VA generation —`
}

export function footerHintForWorkflow(workflow: Workflow): string {
  if (workflow === 'full_reference') {
    return 'Ref2VA: <Picture N> and <Video N> are separate indexes. Character+clip → appearance from Picture, motion from Video.'
  }
  if (workflow === 't2va') {
    return 'Official Base T2VA: integrated_multimodal_description + overall_soundscape + non_diegetic_music'
  }
  if (workflow === 'i2va') {
    return 'Official Base I2VA: first-frame alignment line + three core fields'
  }
  if (workflow === 'fl2va') {
    return 'Official Base FL2VA: first/last alignment line + three core fields'
  }
  return 'Official Base L2VA: last-frame alignment line + three core fields'
}
