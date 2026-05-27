// Gemini API helper + mock fallback for FORGE

const MOCK_QUESTIONS = [
  {
    difficulty: 'medium',
    stem: 'Explain the role of the cell surface membrane in controlling the movement of substances into and out of the cell.',
    parts: [
      { label: '(a)', text: 'Describe the fluid mosaic model of the cell membrane.', marks: 3 },
      { label: '(b)', text: 'Compare active transport and facilitated diffusion.', marks: 4 },
      { label: '(c)', text: 'Explain why the cell membrane is described as selectively permeable.', marks: 3 },
    ],
    hint: 'Think about the phospholipid bilayer structure, the role of proteins, and how the properties of molecules affect which transport mechanism they use.',
    answer: '**Part (a) — 3 marks:**\n\nThe fluid mosaic model describes the membrane as a **phospholipid bilayer** with hydrophilic heads facing outward and hydrophobic tails facing inward. **Proteins** are embedded throughout (integral proteins) or attached to the surface (peripheral proteins). The membrane is described as "fluid" because the phospholipids can move laterally, and "mosaic" because of the varied proteins embedded within it.\n\n**Part (b) — 4 marks:**\n\n**Active transport:**\n• Requires ATP (energy from respiration)\n• Moves substances against a concentration gradient\n• Uses carrier proteins with specific shapes\n\n**Facilitated diffusion:**\n• Does not require ATP (passive process)\n• Moves substances down a concentration gradient\n• Uses channel or carrier proteins\n\nBoth processes require specific membrane proteins, but active transport uses metabolic energy while facilitated diffusion does not.\n\n**Part (c) — 3 marks:**\n\nThe membrane allows some molecules to pass through freely while restricting others. Small, non-polar molecules (e.g. oxygen, CO₂) can pass through the phospholipid bilayer. Large or polar molecules require specific protein channels or carriers. Ions need specific channel proteins. This selective permeability allows the cell to control its internal environment.',
  },
  {
    difficulty: 'harder',
    stem: 'A student investigated the effect of temperature on the rate of enzyme activity using amylase and starch solution. The results showed maximum activity at 37°C and no activity above 65°C.',
    parts: [
      { label: '(a)', text: 'Explain why enzyme activity increases from 10°C to 37°C.', marks: 3 },
      { label: '(b)', text: 'Explain why there is no activity above 65°C, even when the temperature is reduced back to 37°C.', marks: 4 },
    ],
    hint: 'For (a): consider kinetic energy and enzyme-substrate complex formation. For (b): think about what permanently changes at high temperature and why that change cannot be reversed.',
    answer: '**Part (a) — 3 marks:**\n\nAs temperature increases from 10°C to 37°C, molecules have greater **kinetic energy**. This means more frequent and more energetic collisions between enzyme and substrate molecules. More enzyme-substrate complexes form per unit time, increasing the rate of reaction. The optimum temperature for amylase is ~37°C (body temperature), where this effect is maximised without damaging the enzyme.\n\n**Part (b) — 4 marks:**\n\nAbove 65°C, the enzyme is **denatured** — the high thermal energy disrupts the **hydrogen bonds and other non-covalent interactions** maintaining the tertiary structure of the enzyme. This permanently alters the shape of the **active site**. Even when temperature is reduced to 37°C, the enzyme cannot regain its original conformation because the bonds cannot reform in the same arrangement. The substrate can no longer bind to form an enzyme-substrate complex, so no catalysis occurs.',
  },
  {
    difficulty: 'accessible',
    stem: 'Describe and explain the role of negative feedback in maintaining blood glucose concentration.',
    parts: [],
    hint: 'Include: what triggers the response, which organ/cells respond, what they release, what effect this has, and how it reduces the stimulus.',
    answer: '**Negative feedback — blood glucose (5 marks):**\n\n1. Blood glucose rises above the set point (e.g. after a meal)\n2. **Beta cells** in the islets of Langerhans (pancreas) detect the rise\n3. Beta cells secrete **insulin** into the blood\n4. Insulin causes **increased uptake of glucose** by liver and muscle cells\n5. Liver converts glucose to **glycogen** (glycogenesis)\n6. Blood glucose concentration **falls back towards the set point**\n7. The stimulus (high glucose) is removed → insulin secretion decreases\n\nThis is negative feedback because the response opposes the initial change, maintaining homeostasis.',
  },
  {
    difficulty: 'exam-hard',
    stem: 'Evaluate the evidence that natural selection is the primary mechanism driving evolutionary change in populations.',
    parts: [
      { label: '(a)', text: 'Describe the mechanism of natural selection.', marks: 4 },
      { label: '(b)', text: 'Evaluate the extent to which natural selection alone can explain evolutionary change.', marks: 8 },
    ],
    hint: 'For (b): consider supporting evidence (antibiotic resistance, fossil record, comparative anatomy), but also counter-evidence or limitations (genetic drift in small populations, neutral mutations, punctuated equilibrium). Reach a reasoned conclusion.',
    answer: '**Part (a) — 4 marks:**\n\n1. Variation exists within a population (from mutation and sexual reproduction)\n2. Organisms produce more offspring than the environment can support → competition\n3. Organisms with advantageous characteristics (better adapted) are more likely to survive and reproduce\n4. Beneficial alleles are passed to offspring → their frequency in the population increases over generations\n\n**Part (b) — 8 marks (AO3):**\n\n**Evidence supporting natural selection as primary mechanism:**\n• Antibiotic resistance: MRSA developed resistance through selection of resistant individuals → strong real-world evidence\n• Artificial selection: humans have driven rapid phenotypic change in crops and livestock through selective breeding\n• Comparative anatomy: homologous structures (e.g. pentadactyl limb) suggest common ancestry shaped by selection\n• Fossil record: gradual morphological changes consistent with selection over time\n\n**Limitations and alternative mechanisms:**\n• **Genetic drift**: in small populations, allele frequency can change by chance without any selection pressure — particularly important during population bottlenecks\n• **Neutral mutations**: many mutations have no phenotypic effect (silent mutations) — these are not subject to selection but do change allele frequencies\n• **Punctuated equilibrium**: fossil evidence suggests evolution can be rapid and discontinuous — may require mechanisms beyond gradual selection\n• **Sexual selection**: mate choice can drive traits that reduce survival fitness (e.g. peacock tails)\n\n**Conclusion:**\nNatural selection remains the most well-evidenced mechanism for **adaptive** evolutionary change, but genetic drift, sexual selection, and neutral evolution are significant contributors — particularly in small populations and for non-adaptive traits. Evolution is best understood as multi-mechanism.',
  },
  {
    difficulty: 'medium',
    stem: 'A student investigated the effect of light intensity on the rate of photosynthesis in aquatic plants. Oxygen bubble production was measured at different distances from a lamp.',
    parts: [
      { label: '(a)', text: 'Identify one limitation of using oxygen bubble count as a measure of photosynthesis rate.', marks: 2 },
      { label: '(b)', text: 'Explain the relationship between light intensity and photosynthesis rate at low light intensities.', marks: 3 },
      { label: '(c)', text: 'Predict what would happen to the rate if CO₂ concentration was doubled at the light intensity that gave maximum rate. Justify your answer.', marks: 2 },
    ],
    hint: 'For (a): think about the reliability of counting bubbles. For (b): light intensity affects the light-dependent reactions — which products does this affect? For (c): consider limiting factors.',
    answer: '**Part (a) — 2 marks:**\nBubble size may vary between measurements, meaning bubble count does not accurately reflect volume of oxygen produced. Bubbles may also contain other gases. Improved method: collect and measure gas volume instead.\n\n**Part (b) — 3 marks:**\nAt low light intensities, light is the **limiting factor**. As light intensity increases, more light energy is available for the light-dependent reactions → more ATP and NADPH are produced → more triose phosphate is reduced in the Calvin cycle → the rate of photosynthesis increases in proportion to light intensity.\n\n**Part (c) — 2 marks:**\nThe rate would increase. At maximum light intensity, if the rate is plateauing, CO₂ is now the limiting factor. Doubling CO₂ concentration means more substrate is available for the Calvin cycle (CO₂ fixation by rubisco), removing the CO₂ limitation and allowing the rate to increase.',
  },
];

export async function generateWithGemini(key, prompt) {
  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
      }),
    }
  );
  const data = await resp.json();
  if (data.error) throw new Error(data.error.message);
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const s = raw.indexOf('['), e = raw.lastIndexOf(']');
  if (s === -1 || e === -1) throw new Error('No JSON array in response');
  return JSON.parse(raw.slice(s, e + 1));
}

export function getMockQuestions(count = 3, difficulty = 'mixed') {
  const pool = difficulty === 'mixed'
    ? MOCK_QUESTIONS
    : MOCK_QUESTIONS.filter(q => q.difficulty === difficulty);
  const src = pool.length ? pool : MOCK_QUESTIONS;
  const result = [];
  for (let i = 0; i < Math.min(count, src.length); i++) {
    result.push(src[i % src.length]);
  }
  return result;
}

export function buildForgePrompt(subject, code, topic, subtopic, difficulty, style, num, isMaths) {
  return `You are an expert ${subject}${code ? ` (${code})` : ''} examiner and tutor. Generate exactly ${num} practice question(s) on:

Subject: ${subject}${code ? ` (${code})` : ''}
Topic: ${topic}
Subtopic: ${subtopic}
Difficulty: ${difficulty}
Style: ${style}
${isMaths ? `\nFormatting rules for maths:\n- Use LaTeX for ALL maths: \\( ... \\) inline, \\[ ... \\] display\n- Multi-part questions with realistic mark allocations\n- Worked answers step-by-step with clear LaTeX notation` : ''}

Reply with ONLY a raw JSON array — no preamble, no markdown. Start with [ and end with ].

Each element:
{
  "difficulty": "accessible|medium|harder|exam-hard",
  "stem": "Main question text",
  "parts": [{"label":"(a)","text":"part text","marks":3}],
  "hint": "Concise hint — guides method without giving the answer",
  "answer": "Full worked answer / model answer with mark allocation"
}
If no sub-parts, use "parts": [] and put everything in "stem".`;
}
