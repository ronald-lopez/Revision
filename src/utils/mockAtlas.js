// Mock ATLAS response engine
// Keyword-matched rich responses that simulate a real AI tutor

const RESPONSE_DELAY = 1400; // ms to "think"

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Rich response renderer helpers — return JSX-compatible objects
// Each response is an array of "blocks":
// { type: 'text'|'heading'|'list'|'tip'|'divider'|'forge-cta', content, items }

function text(content) { return { type: 'text', content }; }
function heading(content) { return { type: 'heading', content }; }
function list(items) { return { type: 'list', items }; }
function tip(content) { return { type: 'tip', content }; }
function divider() { return { type: 'divider' }; }
function forgeCta(label) { return { type: 'forge-cta', content: label }; }

// ── RESPONSE LIBRARY ─────────────────────────────────────────────────────────

const RESPONSES = {
  explain_insulin: [
    text('Great question — this is a high-frequency exam topic. Let me break down **insulin** properly.'),
    heading('What insulin does'),
    list([
      'Secreted by **beta cells** in the islets of Langerhans (pancreas)',
      'Released when blood glucose rises above ~90 mg/100 cm³',
      'Binds to receptors on liver and muscle cells',
      'Stimulates **uptake of glucose** from the blood',
      'Promotes conversion of glucose → glycogen (**glycogenesis**)',
      'Inhibits glycogen → glucose breakdown',
    ]),
    heading('The negative feedback loop'),
    text('High blood glucose → insulin secreted → cells absorb glucose → blood glucose falls → insulin secretion stops. This maintains homeostasis around the set point.'),
    tip('⚡ Examiner tip: Never say "insulin breaks down glucose." It promotes *uptake* and *storage*. Examiners consistently penalise this. Use the words: receptor, effector, negative feedback.'),
    divider(),
    forgeCta('Generate a FORGE paper on Hormonal Coordination →'),
  ],

  explain_mitosis: [
    text('**Mitosis** is the type of nuclear division that produces two genetically identical daughter cells — used for growth, repair, and asexual reproduction.'),
    heading('The four stages'),
    list([
      '**Prophase** — chromosomes condense, nuclear envelope breaks down, spindle fibres form',
      '**Metaphase** — chromosomes line up at the equator (cell plate); spindle fibres attach to centromeres',
      '**Anaphase** — sister chromatids pulled apart to opposite poles by spindle fibres contracting',
      '**Telophase** — nuclear envelopes reform around each set of chromosomes, chromosomes decondense',
    ]),
    text('This is followed by **cytokinesis** — division of the cytoplasm into two separate cells.'),
    heading('Key distinction'),
    text('Mitosis: 2 genetically identical cells (diploid → diploid). Don\'t confuse with **meiosis** which produces 4 genetically unique gametes (diploid → haploid).'),
    tip('⚡ Examiner tip: If asked to "describe" the stages, include the behaviour of chromosomes AND spindle fibres at each stage — both are needed for full marks.'),
    divider(),
    forgeCta('Generate a FORGE paper on Cell Division →'),
  ],

  explain_essays: [
    text('Extended writing is where most students lose marks — not because they lack knowledge, but because they don\'t *structure their argument*. Here\'s a framework that works for any 8–20 mark question.'),
    heading('The PEEL structure'),
    list([
      '**Point** — State your argument clearly in one sentence',
      '**Explain** — Develop the point with subject knowledge and detail',
      '**Evidence** — Support with data, examples, named studies, or theory',
      '**Link** — Explicitly connect back to the question (most students skip this)',
    ]),
    heading('What examiners want to see'),
    list([
      'A clear, consistent line of argument from paragraph 1 to conclusion',
      'Evaluation — showing you can weigh competing views or evidence',
      'A conclusion that *directly answers* the question (not just summarises)',
      'Appropriate technical vocabulary used correctly',
    ]),
    tip('⚡ Examiner tip: After writing each paragraph, ask yourself: "Have I answered the question in this paragraph?" If the answer is "not explicitly," add a link sentence at the end.'),
    text('Your diagnostic flagged **extended writing** as a focus area. This suggests your knowledge base is solid — it\'s the structuring that\'s holding your mark back.'),
    divider(),
    forgeCta('Generate an extended writing practice question →'),
  ],

  explain_mark_scheme: [
    text('Understanding how mark schemes work is one of the fastest ways to improve your grade. Most students read mark schemes passively — the trick is to understand the *logic* behind them.'),
    heading('The three assessment objectives (AOs)'),
    list([
      '**AO1** — Knowledge and understanding: recall facts, definitions, mechanisms',
      '**AO2** — Application: apply knowledge to novel contexts and scenarios',
      '**AO3** — Analysis and evaluation: interpret data, evaluate evidence, form judgements',
    ]),
    heading('How this affects your answers'),
    text('A 6-mark question might be 2+2+2 across AO1, AO2, AO3. Writing 6 lines of pure recall (AO1) will cap you at 2 marks. You need to *apply* and *evaluate* too.'),
    tip('⚡ Examiner tip: When practising with mark schemes, label each point you\'d make as AO1/AO2/AO3. If all your points are AO1, rewrite the answer to include application and evaluation.'),
    divider(),
    forgeCta('Generate a mixed AO practice paper →'),
  ],

  explain_time_management: [
    text('Poor time management in exams is the most *fixable* of all mistakes. Here\'s the framework:'),
    heading('The 1 mark = 1 minute rule'),
    text('Most A-Level papers are designed around this ratio. If a question is worth 8 marks, allocate 8 minutes. No more.'),
    heading('The triage method'),
    list([
      '**Pass 1** (first 5 min): Skim the whole paper. Star the questions you find easiest.',
      '**Pass 2**: Answer starred questions first — bank easy marks while your brain is fresh.',
      '**Pass 3**: Return to harder questions with remaining time.',
      '**Never leave blanks**: Even for questions you don\'t know, write something. Part marks exist.',
    ]),
    tip('⚡ Examiner tip: Students who run out of time on Question 1 and skip Question 4 lose *far* more marks than if they\'d kept to time. A partially answered Question 4 is worth more than a perfected Question 1.'),
  ],

  flashcard_enzyme: [
    heading('Flashcard: Enzyme Inhibition'),
    text('**Competitive inhibition**'),
    list([
      'Inhibitor has similar shape to the substrate',
      'Competes for the **active site**',
      'Effect reduced by increasing substrate concentration',
      'Example: malonate inhibiting succinate dehydrogenase',
    ]),
    text('**Non-competitive inhibition**'),
    list([
      'Inhibitor binds to the **allosteric site** (not active site)',
      'Changes the shape of the active site',
      'Substrate concentration does NOT overcome inhibition',
      'Example: cyanide inhibiting cytochrome c oxidase',
    ]),
    tip('⚡ Exam hook: A question showing a graph where increasing substrate overcomes inhibition → competitive. No effect from more substrate → non-competitive.'),
  ],

  practice_question: [
    heading('Practice question — try before you look at the answer'),
    text('**Question (6 marks)**'),
    text('Explain how insulin brings about a decrease in blood glucose concentration after a meal. [6]'),
    divider(),
    text('*Think: mechanism, receptor, effector, what happens inside cells...*'),
    tip('📝 When you\'re ready, ask me to reveal the mark scheme.'),
  ],

  practice_answer: [
    heading('Mark scheme — Insulin & blood glucose (6 marks)'),
    list([
      'Blood glucose rises after meal / above set point [AO1]',
      'Beta cells (in islets of Langerhans) detect rise and secrete insulin [AO1]',
      'Insulin binds to receptors on liver/muscle cells [AO1]',
      'Causes increased uptake of glucose by cells [AO1]',
      'Stimulates glycogenesis (glucose → glycogen) in liver [AO1]',
      'Negative feedback: blood glucose falls, less insulin secreted [AO2]',
    ]),
    tip('⚡ Common mistakes: Saying "insulin breaks down glucose" (wrong — it promotes uptake and storage). Not naming beta cells specifically. Not mentioning negative feedback.'),
  ],

  struggling: [
    text('Let\'s figure out where the gap is. When you say you\'re struggling, it\'s usually one of three things:'),
    list([
      '**Don\'t understand the concept** → start with an explanation. Ask me "explain [topic]"',
      '**Understand it but can\'t apply it** → need practice questions in context. Say "give me a practice question on [topic]"',
      '**Know it but can\'t write good answers** → essay technique. Ask me "how do I structure a [x]-mark question"',
    ]),
    text('Which one sounds most like you? Or just tell me what specifically you\'re finding hard and I\'ll work through it with you.'),
  ],

  default_encouraging: [
    text('I\'m here to help. Ask me to explain any concept from your subjects, give you a model answer, create a flashcard, or walk you through exam technique.'),
    text('You can also say things like:'),
    list([
      '"Explain [topic]" — detailed breakdown with examiner tips',
      '"Give me a practice question on [topic]"',
      '"How do I structure a [x]-mark question?"',
      '"I\'m struggling with [topic]"',
      '"Show me a model answer for..."',
    ]),
    divider(),
    forgeCta('Or jump straight to FORGE for a practice paper →'),
  ],
};

// ── KEYWORD MATCHER ────────────────────────────────────────────────────────────

function matchResponse(message) {
  const m = message.toLowerCase();

  if (m.includes('insulin') || (m.includes('blood') && m.includes('glucose'))) return RESPONSES.explain_insulin;
  if (m.includes('mitosis') || m.includes('cell division') || (m.includes('cell') && m.includes('divid'))) return RESPONSES.explain_mitosis;
  if (m.includes('essay') || m.includes('extended writ') || m.includes('long answer') || m.includes('structure') || m.includes('peel')) return RESPONSES.explain_essays;
  if (m.includes('mark scheme') || m.includes('assessment objective') || m.includes('ao1') || m.includes('ao2') || m.includes('ao3')) return RESPONSES.explain_mark_scheme;
  if (m.includes('time') && (m.includes('exam') || m.includes('manage') || m.includes('run out'))) return RESPONSES.explain_time_management;
  if (m.includes('enzyme') && (m.includes('flash') || m.includes('card') || m.includes('inhibit'))) return RESPONSES.flashcard_enzyme;
  if (m.includes('inhibit') && m.includes('enzyme')) return RESPONSES.flashcard_enzyme;
  if (m.includes('practice question') || (m.includes('test me') || m.includes('quiz me') || m.includes('give me a question'))) return RESPONSES.practice_question;
  if (m.includes('mark scheme') && (m.includes('reveal') || m.includes('answer') || m.includes('show'))) return RESPONSES.practice_answer;
  if (m.includes('strug') || m.includes('don\'t understand') || m.includes('confused') || m.includes('help me with')) return RESPONSES.struggling;

  return RESPONSES.default_encouraging;
}

// ── PUBLIC API ────────────────────────────────────────────────────────────────

export async function getAtlasResponse(message) {
  await delay(RESPONSE_DELAY + Math.random() * 600);
  return matchResponse(message);
}

export const DIAGNOSTIC_QUESTIONS = [
  {
    q: 'When answering a 6-mark analysis question, what should you prioritise?',
    opts: [
      'Covering as many different points as possible',
      'Developing 2–3 points with explanation, evidence, and a link back to the question',
      'Starting with a clear definition of key terms',
      'Writing as much as you can in the time available',
    ],
    correct: 1,
    area: 'Extended writing structure',
  },
  {
    q: 'What does the command word "Assess" require you to do?',
    opts: [
      'Describe the key features of the topic',
      'Make a balanced judgement with evidence and a conclusion',
      'List the main arguments for and against',
      'Explain the causes or reasons for something',
    ],
    correct: 1,
    area: 'Command word interpretation',
  },
  {
    q: 'How should you best use a mark scheme when revising?',
    opts: [
      'Memorise the key phrases it uses so you can include them',
      'Understand which Assessment Objective each mark point targets',
      'Check your answer at the end and note where you went wrong',
      'Focus on the highest-mark questions only',
    ],
    correct: 1,
    area: 'Mark scheme interpretation',
  },
  {
    q: 'What is the most effective exam time strategy?',
    opts: [
      'Spend more time on questions you are confident about to maximise marks',
      'Allocate time in proportion to the marks available for each question',
      'Answer questions in order and skip ones you find difficult',
      'Leave the hardest questions until you have finished everything else',
    ],
    correct: 1,
    area: 'Exam time management',
  },
  {
    q: 'In a data-response question, what should your answer prioritise?',
    opts: [
      'Showing your general subject knowledge about the topic',
      'Referring directly to the data provided and using it to support your points',
      'Providing a full explanation of the underlying theory',
      'Writing a balanced evaluative conclusion',
    ],
    correct: 1,
    area: 'Data-response technique',
  },
  {
    q: 'What makes a conclusion effective in an extended answer?',
    opts: [
      'It summarises all the points made in the main body',
      'It states the most important point again clearly',
      'It directly answers the question with a supported judgement',
      'It introduces one final piece of evidence',
    ],
    correct: 2,
    area: 'Conclusion writing',
  },
];

export function computeWeakAreas(answers) {
  // answers: array of selected option indices
  const weak = [];
  DIAGNOSTIC_QUESTIONS.forEach((q, i) => {
    if (answers[i] !== q.correct) weak.push(q.area);
  });
  // Always return at least 2 areas for demo purposes
  if (weak.length < 2) {
    const all = DIAGNOSTIC_QUESTIONS.map(q => q.area);
    for (const area of all) {
      if (!weak.includes(area)) { weak.push(area); if (weak.length >= 2) break; }
    }
  }
  return weak.slice(0, 4);
}
