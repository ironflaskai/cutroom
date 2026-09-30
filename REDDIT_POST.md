**Subreddit:** r/stablediffusion

**Title:**
local MiniMax H3 prompt helper (ollama) — new to video models, is my mental model of shots/refs even right?

---

so i made a local desktop thing because MiniMax H3 prompt format was kicking my ass.

i do stills. i am not a video person. i can follow a doc but i dont actually *know* how Hailuo/H3 "sees" a shot vs a reference. i wrote an electron app anyway (amateur coder, dont roast the stack too hard). it talks to ollama / lm studio, no cloud. ive been using `smtek/Qwen3.8-27B:Q4_K_XL` on a 20gb a4500.

app is called Cutroom. you paste a brief, drop local images/videos, it streams a structured H3 prompt.

**what i think i understand (please correct me)**

H3 is not midjourney. you dont write "cinematic, 8k, masterpiece". you write a timeline the rewriter can lock.

two families of prompts:

1. **Base** (T2VA / I2VA / FL2VA / L2VA)  
   `integrated_multimodal_description` + `overall_soundscape` + `non_diegetic_music`  
   I2VA/FL2VA/L2VA also need that first alignment line so H3 knows *when* a picture is the first/last frame.

2. **Full reference / Ref2VA**  
   the 6 block thing:  
   `subject_definitions`  
   `summary`  
   `retention_analysis`  
   `detailed_description`  
   `overall_soundscape`  
   `non_diegetic_music`

**shots — this is where im unsure**

docs say:

- `[Shot 1]` has **no** timestamp
- later shots are `[Shot 2] At 00:03.500, the camera cuts to...`
- timestamp is for a **cut**, not a random action inside the shot
- if you timestamp Shot 1, or reuse a time, or put a time outside duration, H3 just... ignores it?

so if i forget Shot 2 entirely and dump the whole 8 seconds into Shot 1, does H3 treat that as one continuous take (good for FL2VA) or does it smear the action?

and if i write Shot 2 but forget the `At MM:SS.mmm`, does it just glue it onto Shot 1?

app currently forces that shot grammar in the system prompt. i dont know if thats helping or if im over-structuring garbage.

**pictures vs videos — i had this wrong at first**

i originally numbered everything Picture 1, Picture 2 even if one was an mp4. thats wrong.

if you upload **1 still + 1 clip** it should be:

- `<Picture 1>`
- `<Video 1>`

separate indexes. the clip is not Picture 2.

also from the ref guide:

- `<Subject N>` = reusable *content* (the person / room / dog), not the file
- standalone `<Picture N>` only if that still is an actual first frame / last frame / keyframe / storyboard anchor
- if the still is just "this is my character's face", you cite it *inside* the Subject line, you dont make a Picture section for it
- `<Video N>` is for edit / continue / camera-cut-rhythm of a whole clip. a person taken *from* a video is still a Subject that *cites* Video 1

**the job i actually want**

i have a reference video. i have a photo of my character. i want *that same video* (camera, blocking, pacing, location) but my person instead of theirs.

right now the app has a recipe button that does:

```
<Subject 1> is the character whose appearance comes from <Picture 1>
and whose motion/blocking follows <Video 1>.
<Video 1> is the source video for the target video edit.

summary: [video editing + reference generation]
retention:
  <Subject 1> fully_preserved  (face/wardrobe from the still)
  <Video 1> partially_preserved (keep camera/blocking, replace performer)
```

is that how people actually do identity swap on H3, or should that be I2VA (first frame of *my* character) and just pray the motion follows? or FL2VA with first+last of the character?

**missing reference / missing shot — what does H3 actually do**

this is the part i cant test enough because im new:

- if i define `<Picture 2>` in subject_definitions but never mention it in detailed_description, does retention_analysis have to still list it as `weak_reference`, or does H3 drop it?
- if i *dont* attach a still and pick I2VA anyway, the alignment line ` <Picture 1> (from [Shot 1]) is fully referenced` is a lie. app still lets you do it. should it block?
- if FL2VA and i only drop 1 image, Picture 2 doesnt exist. do people duplicate Picture 1 as last frame or is that a wasted gen?
- if Ref2VA and i forget a Subject that is clearly in the clip, does H3 invent a random extra person (because the video still has them) or does it keep the original performer *and* mine?
- `attribute_transfer` vs `weak_reference` — when do you actually pick those? i have been defaulting to fully_preserved / partially_preserved because im scared

**audio**

i put `overall_soundscape` (room tone, foley, no dialogue) and `non_diegetic_music` (or N/A). speakers are `(S1)` and lines go in `<d>[English] ...</d>`.

i have `<Audio N>` in the contract because the docs have it, but i dont really ingest reference audio yet. if the source mp4 has dialogue, should that become Audio 1 `partially_copy` / `reference` for timbre, or do i just rewrite the lines in the shot body?

**what the app does today**

- local only, drag drop images/videos
- workflow dropdown for the 5 modes
- duration 4–15s, 16:9 9:16 1:1 21:9
- streams qwen output into a monospace box, copy / save / txt
- local library
- vision describe is optional (qwen 27b is not a vl model so that part is kinda dead unless you pick a vision model)

**questions for people who actually gen H3**

1. character-into-clip: Ref2VA edit of Video 1, or I2VA, or something else?
2. if a shot is missing vs a reference is missing, which one ruins the gen more?
3. do you still hand-edit the 6 blocks after a local llm, and what do you always have to fix?
4. is qwen3.8 27b even a sane rewriter for this or am i wasting vram?
5. anything from chinese guides / discord that the huggingface base+ref docs dont say?

not selling anything. if the shot/ref logic is wrong i would rather hear it now than keep generating prompts H3 reads as "you didnt actually attach Picture 1".

i can dump the repo if anyone wants to break it.

---

*(paste title + body into reddit. this file is just so you dont lose it.)*
