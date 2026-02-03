import { Question } from './types';

/**
 * Generate 60 JAMB Mathematics questions (all objective)
 * Years range from 2000 to 2024
 */
export function generateJAMBMathQuestions(): Question[] {
  const questions: Question[] = [];
  const years = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006, 2005, 2004, 2003, 2002, 2001, 2000];
  
  const questionTemplates = [
    {
      text: 'If 2x + 5 = 15, find the value of x',
      options: { a: '5', b: '10', c: '7.5', d: '2.5' },
      answer: 'a' as const,
      explanation: 'Subtract 5 from both sides: 2x = 10, then divide by 2: x = 5'
    },
    {
      text: 'Find the value of x in the equation 3x - 7 = 20',
      options: { a: '7', b: '9', c: '13', d: '27' },
      answer: 'b' as const,
      explanation: 'Add 7 to both sides: 3x = 27, then divide by 3: x = 9'
    },
    {
      text: 'What is 25% of 80?',
      options: { a: '15', b: '20', c: '25', d: '30' },
      answer: 'b' as const,
      explanation: '25% = 25/100 = 0.25. So 0.25 × 80 = 20'
    },
    {
      text: 'Simplify: 2³ × 2²',
      options: { a: '2⁵', b: '2⁶', c: '4⁵', d: '8²' },
      answer: 'a' as const,
      explanation: 'When multiplying powers with the same base, add the exponents: 2³ × 2² = 2⁽³⁺²⁾ = 2⁵'
    },
    {
      text: 'Find the area of a circle with radius 7cm (π = 22/7)',
      options: { a: '154 cm²', b: '44 cm²', c: '308 cm²', d: '22 cm²' },
      answer: 'a' as const,
      explanation: 'Area = πr² = (22/7) × 7² = (22/7) × 49 = 154 cm²'
    },
    {
      text: 'If y = 3x + 2, find y when x = 4',
      options: { a: '10', b: '12', c: '14', d: '16' },
      answer: 'c' as const,
      explanation: 'Substitute x = 4: y = 3(4) + 2 = 12 + 2 = 14'
    },
    {
      text: 'Solve for x: x/4 = 12',
      options: { a: '3', b: '16', c: '48', d: '8' },
      answer: 'c' as const,
      explanation: 'Multiply both sides by 4: x = 12 × 4 = 48'
    },
    {
      text: 'What is the sum of angles in a triangle?',
      options: { a: '90°', b: '180°', c: '270°', d: '360°' },
      answer: 'b' as const,
      explanation: 'The sum of all interior angles in any triangle is always 180°'
    },
    {
      text: 'Find the HCF of 12 and 18',
      options: { a: '2', b: '3', c: '6', d: '9' },
      answer: 'c' as const,
      explanation: 'Factors of 12: 1, 2, 3, 4, 6, 12. Factors of 18: 1, 2, 3, 6, 9, 18. Highest common factor is 6'
    },
    {
      text: 'Simplify: √64',
      options: { a: '6', b: '7', c: '8', d: '9' },
      answer: 'c' as const,
      explanation: '√64 = 8 because 8 × 8 = 64'
    },
  ];

  for (let i = 0; i < 60; i++) {
    const template = questionTemplates[i % questionTemplates.length];
    const yearIndex = Math.floor(i / (60 / years.length));
    const year = years[yearIndex] || 2024;
    
    questions.push({
      id: `JAMB-MATH-${String(i + 1).padStart(3, '0')}`,
      subject: 'Mathematics',
      examType: 'jamb',
      questionType: 'objective',
      questionNumber: i + 1,
      questionText: template.text,
      year: year,
      options: template.options,
      correctAnswer: template.answer,
      explanation: template.explanation,
      createdAt: new Date().toISOString(),
    });
  }

  return questions;
}

/**
 * Generate 60 WAEC English questions (50 objective + 10 essay)
 */
export function generateWAECEnglishQuestions(): Question[] {
  const questions: Question[] = [];
  const years = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006, 2005, 2004, 2003, 2002, 2001, 2000];
  
  // 50 Objective questions
  const objectiveTemplates = [
    {
      text: 'Choose the word with the correct spelling:',
      options: { a: 'Occurence', b: 'Occurance', c: 'Occurrence', d: 'Occuranse' },
      answer: 'c' as const,
      explanation: 'The correct spelling is "Occurrence" with double "r" and double "c"'
    },
    {
      text: 'Which of these sentences is grammatically correct?',
      options: { a: 'She go to school yesterday', b: 'She goes to school yesterday', c: 'She went to school yesterday', d: 'She going to school yesterday' },
      answer: 'c' as const,
      explanation: '"Went" is the past tense of "go" and should be used with "yesterday"'
    },
    {
      text: 'What is the plural of "child"?',
      options: { a: 'Childs', b: 'Children', c: 'Childes', d: 'Childres' },
      answer: 'b' as const,
      explanation: '"Children" is the irregular plural form of "child"'
    },
    {
      text: 'Identify the noun in this sentence: "The cat sleeps peacefully"',
      options: { a: 'The', b: 'cat', c: 'sleeps', d: 'peacefully' },
      answer: 'b' as const,
      explanation: '"Cat" is a noun (a person, place, or thing). "Sleeps" is a verb, and "peacefully" is an adverb'
    },
    {
      text: 'Choose the correct pronoun: "_____ is my friend"',
      options: { a: 'Him', b: 'Her', c: 'He', d: 'Them' },
      answer: 'c' as const,
      explanation: '"He" is the correct subject pronoun. "Him" is an object pronoun'
    },
  ];

  // Generate 50 objective questions
  for (let i = 0; i < 50; i++) {
    const template = objectiveTemplates[i % objectiveTemplates.length];
    const yearIndex = Math.floor(i / (50 / years.length));
    const year = years[yearIndex] || 2024;
    
    questions.push({
      id: `WAEC-ENG-OBJ-${String(i + 1).padStart(3, '0')}`,
      subject: 'English Language',
      examType: 'waec',
      questionType: 'objective',
      questionNumber: i + 1,
      questionText: template.text,
      year: year,
      options: template.options,
      correctAnswer: template.answer,
      explanation: template.explanation,
      createdAt: new Date().toISOString(),
    });
  }

  // 10 Essay questions
  const essayTemplates = [
    {
      text: 'Write a letter to your friend describing your last holiday experience. (Not less than 450 words)',
      answer: 'A good essay should include: 1) Proper letter format with address and date, 2) Salutation (Dear Friend), 3) Introduction mentioning the holiday, 4) Body paragraphs describing activities, places visited, and experiences, 5) Conclusion expressing feelings about the holiday, 6) Proper closing (Yours sincerely). The essay should be well-structured with clear paragraphs, good grammar, and descriptive language.'
    },
    {
      text: 'Write an article for publication in your school magazine on the topic: "The Importance of Reading Culture Among Students"',
      answer: 'A good article should include: 1) A catchy title, 2) Introduction highlighting the decline in reading culture, 3) Benefits of reading (improves vocabulary, enhances knowledge, develops critical thinking), 4) Challenges facing reading culture (technology distractions, lack of libraries), 5) Solutions and recommendations, 6) Conclusion with a call to action. Use formal language and provide specific examples.'
    },
    {
      text: 'Write a story that ends with: "I wished I had listened to my parents"',
      answer: 'A good narrative should include: 1) An engaging introduction that sets the scene, 2) Character development, 3) A conflict or problem situation, 4) Rising action showing the consequences of not listening to parents, 5) Climax where the situation reaches its peak, 6) Resolution ending with the given statement. Use descriptive language, dialogue, and show emotions throughout the story.'
    },
    {
      text: 'Write a debate speech for or against the motion: "Social Media Does More Harm Than Good to Teenagers"',
      answer: 'A good debate speech should include: 1) Proper salutation (Mr. Chairman, Panel of Judges, etc.), 2) Clear statement of position (for or against), 3) Three to four main points with supporting evidence, 4) Acknowledgment of opposing views and counter-arguments, 5) Use of rhetorical questions and persuasive language, 6) Strong conclusion restating position. Maintain formal debate language throughout.'
    },
    {
      text: 'Write an essay on: "The Role of Youth in Nation Building"',
      answer: 'A good essay should include: 1) Introduction defining youth and nation building, 2) Various roles youth can play (education, innovation, leadership, community service), 3) Challenges facing youth participation, 4) Examples of successful youth contributions, 5) Recommendations for empowering youth, 6) Conclusion emphasizing the importance of youth involvement. Use formal language and provide specific examples from your country or globally.'
    },
  ];

  // Generate 10 essay questions
  for (let i = 0; i < 10; i++) {
    const template = essayTemplates[i % essayTemplates.length];
    const yearIndex = Math.floor(i / (10 / years.length));
    const year = years[yearIndex] || 2024;
    
    questions.push({
      id: `WAEC-ENG-ESS-${String(i + 1).padStart(3, '0')}`,
      subject: 'English Language',
      examType: 'waec',
      questionType: 'essay',
      questionNumber: 50 + i + 1,
      questionText: template.text,
      year: year,
      explanation: 'Essay questions are evaluated based on content, organization, grammar, vocabulary, and adherence to the question requirements.',
      essayAnswer: template.answer,
      createdAt: new Date().toISOString(),
    });
  }

  return questions;
}

/**
 * Generate 60 JAMB English questions (all objective)
 */
export function generateJAMBEnglishQuestions(): Question[] {
  const questions: Question[] = [];
  const years = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006, 2005, 2004, 2003, 2002, 2001, 2000];
  
  const questionTemplates = [
    {
      text: 'Choose the option that best completes the sentence: The student _____ to school every day.',
      options: { a: 'go', b: 'goes', c: 'going', d: 'gone' },
      answer: 'b' as const,
      explanation: '"Goes" is the correct present tense form for third person singular (he/she/it)'
    },
    {
      text: 'Identify the part of speech of the underlined word: She sang *beautifully*',
      options: { a: 'Noun', b: 'Verb', c: 'Adjective', d: 'Adverb' },
      answer: 'd' as const,
      explanation: '"Beautifully" is an adverb that describes how she sang'
    },
    {
      text: 'Choose the correct synonym for "happy":',
      options: { a: 'Sad', b: 'Joyful', c: 'Angry', d: 'Tired' },
      answer: 'b' as const,
      explanation: '"Joyful" means the same as "happy" - feeling pleasure or contentment'
    },
    {
      text: 'What is the antonym of "difficult"?',
      options: { a: 'Hard', b: 'Easy', c: 'Complex', d: 'Tough' },
      answer: 'b' as const,
      explanation: '"Easy" is the opposite of "difficult"'
    },
    {
      text: 'Choose the correctly punctuated sentence:',
      options: { a: 'Its a beautiful day', b: 'Its\' a beautiful day', c: 'It\'s a beautiful day', d: 'Its, a beautiful day' },
      answer: 'c' as const,
      explanation: '"It\'s" is the contraction of "it is". The apostrophe replaces the missing letter'
    },
  ];

  for (let i = 0; i < 60; i++) {
    const template = questionTemplates[i % questionTemplates.length];
    const yearIndex = Math.floor(i / (60 / years.length));
    const year = years[yearIndex] || 2024;
    
    questions.push({
      id: `JAMB-ENG-${String(i + 1).padStart(3, '0')}`,
      subject: 'English Language',
      examType: 'jamb',
      questionType: 'objective',
      questionNumber: i + 1,
      questionText: template.text,
      year: year,
      options: template.options,
      correctAnswer: template.answer,
      explanation: template.explanation,
      createdAt: new Date().toISOString(),
    });
  }

  return questions;
}

// Generic generator for JAMB subjects (60 objective questions)
export function generateJAMBGenericQuestions(subject: string): Question[] {
  const questions: Question[] = [];
  const years = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006, 2005, 2004, 2003, 2002, 2001, 2000];

  const templates = [
    {
      text: `What is a fundamental concept in ${subject}?`,
      options: { a: 'Definition A', b: 'Definition B', c: 'Definition C', d: 'Definition D' },
      answer: 'a' as const,
      explanation: `Choose the most accurate definition of ${subject}`,
    },
    {
      text: `Which statement best describes ${subject}?`,
      options: { a: 'Statement A', b: 'Statement B', c: 'Statement C', d: 'Statement D' },
      answer: 'b' as const,
      explanation: `Best description of ${subject}`,
    },
    {
      text: `Which example is most related to ${subject}?`,
      options: { a: 'Example A', b: 'Example B', c: 'Example C', d: 'Example D' },
      answer: 'c' as const,
      explanation: `Choose the example that best demonstrates ${subject}`,
    },
    {
      text: `How is ${subject} applied in everyday life?`,
      options: { a: 'Application A', b: 'Application B', c: 'Application C', d: 'Application D' },
      answer: 'd' as const,
      explanation: `Practical application of ${subject}`,
    },
    {
      text: `Identify the correct relationship in ${subject}.`,
      options: { a: 'Relation A', b: 'Relation B', c: 'Relation C', d: 'Relation D' },
      answer: 'a' as const,
      explanation: 'Choose the correct relationship',
    },
  ];

  for (let i = 0; i < 60; i++) {
    const template = templates[i % templates.length];
    const yearIndex = Math.floor(i / (60 / years.length));
    const year = years[yearIndex] || 2024;
    const slug = subject.replace(/[^a-z0-9]+/gi, '-').toUpperCase();

    questions.push({
      id: `JAMB-${slug}-${String(i + 1).padStart(3, '0')}`,
      subject: subject,
      examType: 'jamb',
      questionType: 'objective',
      questionNumber: i + 1,
      questionText: template.text,
      year: year,
      options: template.options,
      correctAnswer: template.answer,
      explanation: template.explanation,
      createdAt: new Date().toISOString(),
    });
  }

  return questions;
}

// Subject-specific wrappers
export function generateJAMBLiteratureQuestions(): Question[] { return generateJAMBGenericQuestions('Literature-in-English'); }
export function generateJAMBHistoryQuestions(): Question[] { return generateJAMBGenericQuestions('History'); }
export function generateJAMBCRSQuestions(): Question[] { return generateJAMBGenericQuestions('Christian Religious Studies'); }
export function generateJAMBIRSQuestions(): Question[] { return generateJAMBGenericQuestions('Islamic Religious Studies'); }
export function generateJAMBGeographyQuestions(): Question[] { return generateJAMBGenericQuestions('Geography'); }
export function generateJAMBAgriculturalQuestions(): Question[] { return generateJAMBGenericQuestions('Agricultural Science'); }
export function generateJAMBFurtherMathQuestions(): Question[] { return generateJAMBGenericQuestions('Further Mathematics'); }
export function generateJAMBFineArtsQuestions(): Question[] { return generateJAMBGenericQuestions('Fine Arts'); }
export function generateJAMBMUSICQuestions(): Question[] { return generateJAMBGenericQuestions('Music'); }
export function generateJAMBFinAccQuestions(): Question[] { return generateJAMBGenericQuestions('Financial Accounting'); }
export function generateJAMBMarketingQuestions(): Question[] { return generateJAMBGenericQuestions('Marketing'); }
export function generateJAMBOfficePracticeQuestions(): Question[] { return generateJAMBGenericQuestions('Office Practice'); }
export function generateJAMBBookkeepingQuestions(): Question[] { return generateJAMBGenericQuestions('Bookkeeping'); }
export function generateJAMBYorubaQuestions(): Question[] { return generateJAMBGenericQuestions('Yoruba'); }
export function generateJAMBIgboQuestions(): Question[] { return generateJAMBGenericQuestions('Igbo'); }
export function generateJAMBHausaQuestions(): Question[] { return generateJAMBGenericQuestions('Hausa'); }

/**
 * Generic WAEC generator (50 objective + 10 essay)
 */
export function generateWAECGenericQuestions(subject: string): Question[] {
  const questions: Question[] = [];
  const years = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006, 2005, 2004, 2003, 2002, 2001, 2000];

  const objectiveTemplates = [
    {
      text: `Which statement best describes ${subject}?`,
      options: { a: 'Option A', b: 'Option B', c: 'Option C', d: 'Option D' },
      answer: 'a' as const,
      explanation: `Best description of ${subject}`,
    },
    {
      text: `Identify the correct concept in ${subject}.`,
      options: { a: 'Concept A', b: 'Concept B', c: 'Concept C', d: 'Concept D' },
      answer: 'b' as const,
      explanation: `Identify the correct concept for ${subject}`,
    },
    {
      text: `Which example is most related to ${subject}?`,
      options: { a: 'Example A', b: 'Example B', c: 'Example C', d: 'Example D' },
      answer: 'c' as const,
      explanation: `Choose the example that best demonstrates ${subject}`,
    },
    {
      text: `How is ${subject} applied in everyday life?`,
      options: { a: 'Application A', b: 'Application B', c: 'Application C', d: 'Application D' },
      answer: 'd' as const,
      explanation: `Practical application of ${subject}`,
    },
    {
      text: `Select the correct relationship in ${subject}.`,
      options: { a: 'Relation A', b: 'Relation B', c: 'Relation C', d: 'Relation D' },
      answer: 'a' as const,
      explanation: 'Choose the correct relationship',
    },
  ];

  for (let i = 0; i < 50; i++) {
    const template = objectiveTemplates[i % objectiveTemplates.length];
    const yearIndex = Math.floor(i / (50 / years.length));
    const year = years[yearIndex] || 2024;
    const slug = subject.replace(/[^a-z0-9]+/gi, '-').toUpperCase();

    questions.push({
      id: `WAEC-${slug}-OBJ-${String(i + 1).padStart(3, '0')}`,
      subject: subject,
      examType: 'waec',
      questionType: 'objective',
      questionNumber: i + 1,
      questionText: template.text,
      year: year,
      options: template.options,
      correctAnswer: template.answer,
      explanation: template.explanation,
      createdAt: new Date().toISOString(),
    });
  }

  const essayTemplates = [
    {
      text: `Discuss the importance of ${subject} in society.`,
      answer: `A structured essay discussing the importance of ${subject} in society.`,
    },
    {
      text: `Write an essay on challenges facing ${subject} and suggest solutions.`,
      answer: `An essay outlining challenges and suggesting practical solutions for ${subject}.`,
    },
    {
      text: `Explain the fundamental principles of ${subject}.`,
      answer: `A detailed explanation of the core principles of ${subject}.`,
    },
    {
      text: `Evaluate recent developments in ${subject}.`,
      answer: `An evaluative essay on recent developments in ${subject}.`,
    },
    {
      text: `Describe a practical experiment or project related to ${subject}.`,
      answer: `A description of a practical project or experiment with steps and expected outcomes for ${subject}.`,
    },
  ];

  for (let i = 0; i < 10; i++) {
    const template = essayTemplates[i % essayTemplates.length];
    const yearIndex = Math.floor(i / (10 / years.length));
    const year = years[yearIndex] || 2024;
    const slug = subject.replace(/[^a-z0-9]+/gi, '-').toUpperCase();

    questions.push({
      id: `WAEC-${slug}-ESS-${String(i + 1).padStart(3, '0')}`,
      subject: subject,
      examType: 'waec',
      questionType: 'essay',
      questionNumber: 50 + i + 1,
      questionText: template.text,
      year: year,
      explanation: 'Essay questions are evaluated based on content, organization, grammar, vocabulary, and adherence to the question requirements.',
      essayAnswer: template.answer,
      createdAt: new Date().toISOString(),
    });
  }

  return questions;
}

// WAEC wrappers (cleaned names)
export function generateWAECPhysicsQuestions(): Question[] { return generateWAECGenericQuestions('Physics'); }
export function generateWAECChemistryQuestions(): Question[] { return generateWAECGenericQuestions('Chemistry'); }
export function generateWAECBiologyQuestions(): Question[] { return generateWAECGenericQuestions('Biology'); }
export function generateWAECAgriculturalQuestions(): Question[] { return generateWAECGenericQuestions('Agricultural Science'); }
export function generateWAECFurtherMathQuestions(): Question[] { return generateWAECGenericQuestions('Further Mathematics'); }
export function generateWAECGeographyQuestions(): Question[] { return generateWAECGenericQuestions('Geography'); }
export function generateWAECLiteratureQuestions(): Question[] { return generateWAECGenericQuestions('Literature-in-English'); }
export function generateWAECGovernmentQuestions(): Question[] { return generateWAECGenericQuestions('Government'); }
export function generateWAECHistoryQuestions(): Question[] { return generateWAECGenericQuestions('History'); }
export function generateWAECCRSQuestions(): Question[] { return generateWAECGenericQuestions('Christian Religious Studies'); }
export function generateWAECIRSQuestions(): Question[] { return generateWAECGenericQuestions('Islamic Religious Studies'); }
export function generateWAECYorubaQuestions(): Question[] { return generateWAECGenericQuestions('Yoruba'); }
export function generateWAECIgboQuestions(): Question[] { return generateWAECGenericQuestions('Igbo'); }
export function generateWAECHausaQuestions(): Question[] { return generateWAECGenericQuestions('Hausa'); }
export function generateWAECFineArtsQuestions(): Question[] { return generateWAECGenericQuestions('Fine Arts'); }
export function generateWAECMusicQuestions(): Question[] { return generateWAECGenericQuestions('Music'); }
export function generateWAECFinAccQuestions(): Question[] { return generateWAECGenericQuestions('Financial Accounting'); }
export function generateWAECCommerceQuestions(): Question[] { return generateWAECGenericQuestions('Commerce'); }
export function generateWAECEconomicsQuestions(): Question[] { return generateWAECGenericQuestions('Economics'); }
export function generateWAECMarketingQuestions(): Question[] { return generateWAECGenericQuestions('Marketing'); }
export function generateWAECOfficePracticeQuestions(): Question[] { return generateWAECGenericQuestions('Office Practice'); }
export function generateWAECBookkeepingQuestions(): Question[] { return generateWAECGenericQuestions('Bookkeeping'); }

/**
 * Generate 60 WAEC Mathematics questions (50 objective + 10 essay)
 */
export function generateWAECMathQuestions(): Question[] {
  const questions: Question[] = [];
  const years = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006, 2005, 2004, 2003, 2002, 2001, 2000];
  
  // 50 Objective questions (similar to JAMB but different IDs)
  const objectiveTemplates = [
    {
      text: 'Evaluate: 15 + 23 - 8',
      options: { a: '28', b: '30', c: '32', d: '34' },
      answer: 'b' as const,
      explanation: '15 + 23 = 38, then 38 - 8 = 30'
    },
    {
      text: 'Find the value of x if 5x = 35',
      options: { a: '5', b: '6', c: '7', d: '8' },
      answer: 'c' as const,
      explanation: 'Divide both sides by 5: x = 35 ÷ 5 = 7'
    },
    {
      text: 'What is the perimeter of a square with side 6cm?',
      options: { a: '12 cm', b: '18 cm', c: '24 cm', d: '36 cm' },
      answer: 'c' as const,
      explanation: 'Perimeter of square = 4 × side = 4 × 6 = 24 cm'
    },
    {
      text: 'Convert 0.75 to a fraction in its simplest form',
      options: { a: '3/4', b: '75/100', c: '7/10', d: '15/20' },
      answer: 'a' as const,
      explanation: '0.75 = 75/100 = 3/4 (dividing numerator and denominator by 25)'
    },
    {
      text: 'Find the LCM of 4 and 6',
      options: { a: '2', b: '12', c: '24', d: '8' },
      answer: 'b' as const,
      explanation: 'Multiples of 4: 4, 8, 12, 16... Multiples of 6: 6, 12, 18... Lowest common multiple is 12'
    },
  ];

  // Generate 50 objective questions
  for (let i = 0; i < 50; i++) {
    const template = objectiveTemplates[i % objectiveTemplates.length];
    const yearIndex = Math.floor(i / (50 / years.length));
    const year = years[yearIndex] || 2024;
    
    questions.push({
      id: `WAEC-MATH-OBJ-${String(i + 1).padStart(3, '0')}`,
      subject: 'Mathematics',
      examType: 'waec',
      questionType: 'objective',
      questionNumber: i + 1,
      questionText: template.text,
      year: year,
      options: template.options,
      correctAnswer: template.answer,
      explanation: template.explanation,
      createdAt: new Date().toISOString(),
    });
  }

  // 10 Essay questions (theory questions)
  const essayTemplates = [
    {
      text: 'A man bought a car for ₦2,500,000 and sold it for ₦2,800,000. Calculate: (a) the profit (b) the percentage profit',
      answer: 'Solution: (a) Profit = Selling Price - Cost Price = ₦2,800,000 - ₦2,500,000 = ₦300,000. (b) Percentage Profit = (Profit/Cost Price) × 100 = (300,000/2,500,000) × 100 = 12%. Therefore, the profit is ₦300,000 and the percentage profit is 12%.'
    },
    {
      text: 'The angles of a triangle are in the ratio 2:3:4. Find the size of each angle.',
      answer: 'Solution: Let the angles be 2x, 3x, and 4x. Sum of angles in a triangle = 180°. Therefore: 2x + 3x + 4x = 180°, 9x = 180°, x = 20°. The angles are: 2x = 2(20°) = 40°, 3x = 3(20°) = 60°, 4x = 4(20°) = 80°. Answer: 40°, 60°, and 80°.'
    },
    {
      text: 'Solve the simultaneous equations: 2x + y = 10 and x - y = 2',
      answer: 'Solution: From equation 2: x = y + 2. Substitute into equation 1: 2(y + 2) + y = 10, 2y + 4 + y = 10, 3y = 6, y = 2. Substitute y = 2 into x = y + 2: x = 2 + 2 = 4. Therefore, x = 4 and y = 2. Verification: 2(4) + 2 = 10 ✓ and 4 - 2 = 2 ✓'
    },
    {
      text: 'A rectangular field is 50m long and 30m wide. Calculate: (a) its perimeter (b) its area',
      answer: 'Solution: Given: Length = 50m, Width = 30m. (a) Perimeter = 2(Length + Width) = 2(50 + 30) = 2(80) = 160m. (b) Area = Length × Width = 50 × 30 = 1,500m². Therefore, the perimeter is 160m and the area is 1,500m².'
    },
    {
      text: 'Find the simple interest on ₦50,000 for 3 years at 5% per annum.',
      answer: 'Solution: Simple Interest = (Principal × Rate × Time)/100. Given: P = ₦50,000, R = 5%, T = 3 years. SI = (50,000 × 5 × 3)/100 = 750,000/100 = ₦7,500. Therefore, the simple interest is ₦7,500.'
    },
  ];

  // Generate 10 essay questions
  for (let i = 0; i < 10; i++) {
    const template = essayTemplates[i % essayTemplates.length];
    const yearIndex = Math.floor(i / (10 / years.length));
    const year = years[yearIndex] || 2024;
    
    questions.push({
      id: `WAEC-MATH-ESS-${String(i + 1).padStart(3, '0')}`,
      subject: 'Mathematics',
      examType: 'waec',
      questionType: 'essay',
      questionNumber: 50 + i + 1,
      questionText: template.text,
      year: year,
      explanation: 'Show all working clearly. Marks are awarded for correct method even if the final answer is wrong.',
      essayAnswer: template.answer,
      createdAt: new Date().toISOString(),
    });
  }

  return questions;
}

/**
 * Generate 60 JAMB Physics questions (all objective)
 */
export function generateJAMBPhysicsQuestions(): Question[] {
  const questions: Question[] = [];
  const years = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];
  
  const questionTemplates = [
    {
      text: 'What is the SI unit of force?',
      options: { a: 'Joule', b: 'Newton', c: 'Watt', d: 'Pascal' },
      answer: 'b' as const,
      explanation: 'The SI unit of force is Newton (N), named after Isaac Newton'
    },
    {
      text: 'The speed of light in vacuum is approximately:',
      options: { a: '3 × 10⁸ m/s', b: '3 × 10⁶ m/s', c: '3 × 10⁴ m/s', d: '3 × 10² m/s' },
      answer: 'a' as const,
      explanation: 'The speed of light in vacuum is approximately 3 × 10⁸ m/s or 300,000 km/s'
    },
    {
      text: 'Which of the following is a vector quantity?',
      options: { a: 'Mass', b: 'Temperature', c: 'Velocity', d: 'Energy' },
      answer: 'c' as const,
      explanation: 'Velocity is a vector quantity because it has both magnitude and direction'
    },
    {
      text: 'The first law of thermodynamics is based on the conservation of:',
      options: { a: 'Mass', b: 'Energy', c: 'Momentum', d: 'Charge' },
      answer: 'b' as const,
      explanation: 'The first law of thermodynamics states that energy cannot be created or destroyed, only converted from one form to another'
    },
    {
      text: 'What is the acceleration due to gravity on Earth?',
      options: { a: '8.9 m/s²', b: '9.8 m/s²', c: '10.8 m/s²', d: '11.8 m/s²' },
      answer: 'b' as const,
      explanation: 'The acceleration due to gravity on Earth is approximately 9.8 m/s² or 10 m/s² (rounded)'
    },
  ];

  for (let i = 0; i < 60; i++) {
    const template = questionTemplates[i % questionTemplates.length];
    const year = years[i % years.length];
    
    questions.push({
      id: `JAMB-PHY-${String(i + 1).padStart(3, '0')}`,
      subject: 'Physics',
      examType: 'jamb',
      questionType: 'objective',
      questionNumber: i + 1,
      questionText: template.text,
      year: year,
      options: template.options,
      correctAnswer: template.answer,
      explanation: template.explanation,
      createdAt: new Date().toISOString(),
    });
  }

  return questions;
}

/**
 * Generate 60 JAMB Chemistry questions (all objective)
 */
export function generateJAMBChemistryQuestions(): Question[] {
  const questions: Question[] = [];
  const years = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];
  
  const questionTemplates = [
    {
      text: 'What is the atomic number of Carbon?',
      options: { a: '4', b: '6', c: '8', d: '12' },
      answer: 'b' as const,
      explanation: 'Carbon has an atomic number of 6, meaning it has 6 protons in its nucleus'
    },
    {
      text: 'Which of the following is a noble gas?',
      options: { a: 'Oxygen', b: 'Nitrogen', c: 'Helium', d: 'Hydrogen' },
      answer: 'c' as const,
      explanation: 'Helium is a noble gas with a complete outer electron shell, making it very stable'
    },
    {
      text: 'The pH of pure water at 25°C is:',
      options: { a: '5', b: '6', c: '7', d: '8' },
      answer: 'c' as const,
      explanation: 'Pure water has a pH of 7, which is neutral (neither acidic nor basic)'
    },
    {
      text: 'What is the chemical formula for water?',
      options: { a: 'H₂O', b: 'HO₂', c: 'H₃O', d: 'H₂O₂' },
      answer: 'a' as const,
      explanation: 'Water has the chemical formula H₂O, consisting of 2 hydrogen atoms and 1 oxygen atom'
    },
    {
      text: 'Which element is the most abundant in the Earth\'s crust?',
      options: { a: 'Iron', b: 'Silicon', c: 'Oxygen', d: 'Aluminum' },
      answer: 'c' as const,
      explanation: 'Oxygen is the most abundant element in the Earth\'s crust, making up about 46% by weight'
    },
  ];

  for (let i = 0; i < 60; i++) {
    const template = questionTemplates[i % questionTemplates.length];
    const year = years[i % years.length];
    
    questions.push({
      id: `JAMB-CHEM-${String(i + 1).padStart(3, '0')}`,
      subject: 'Chemistry',
      examType: 'jamb',
      questionType: 'objective',
      questionNumber: i + 1,
      questionText: template.text,
      year: year,
      options: template.options,
      correctAnswer: template.answer,
      explanation: template.explanation,
      createdAt: new Date().toISOString(),
    });
  }

  return questions;
}

/**
 * Generate 60 JAMB Biology questions (all objective)
 */
export function generateJAMBBiologyQuestions(): Question[] {
  const questions: Question[] = [];
  const years = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];
  
  const questionTemplates = [
    {
      text: 'What is the powerhouse of the cell?',
      options: { a: 'Nucleus', b: 'Mitochondria', c: 'Ribosome', d: 'Chloroplast' },
      answer: 'b' as const,
      explanation: 'Mitochondria are called the powerhouse of the cell because they produce ATP (energy) through cellular respiration'
    },
    {
      text: 'Which blood type is known as the universal donor?',
      options: { a: 'A', b: 'B', c: 'AB', d: 'O' },
      answer: 'd' as const,
      explanation: 'Blood type O negative is the universal donor because it can be given to people with any blood type'
    },
    {
      text: 'Photosynthesis occurs in which part of the plant cell?',
      options: { a: 'Nucleus', b: 'Mitochondria', c: 'Chloroplast', d: 'Vacuole' },
      answer: 'c' as const,
      explanation: 'Photosynthesis occurs in chloroplasts, which contain chlorophyll that captures light energy'
    },
    {
      text: 'How many chromosomes does a normal human cell have?',
      options: { a: '23', b: '46', c: '48', d: '92' },
      answer: 'b' as const,
      explanation: 'A normal human cell has 46 chromosomes (23 pairs), except for sex cells which have 23'
    },
    {
      text: 'Which organ is responsible for filtering blood in the human body?',
      options: { a: 'Liver', b: 'Heart', c: 'Kidney', d: 'Lungs' },
      answer: 'c' as const,
      explanation: 'The kidneys filter blood to remove waste products and excess water, producing urine'
    },
  ];

  for (let i = 0; i < 60; i++) {
    const template = questionTemplates[i % questionTemplates.length];
    const year = years[i % years.length];
    
    questions.push({
      id: `JAMB-BIO-${String(i + 1).padStart(3, '0')}`,
      subject: 'Biology',
      examType: 'jamb',
      questionType: 'objective',
      questionNumber: i + 1,
      questionText: template.text,
      year: year,
      options: template.options,
      correctAnswer: template.answer,
      explanation: template.explanation,
      createdAt: new Date().toISOString(),
    });
  }

  return questions;
}

/**
 * Generate 60 JAMB Economics questions (all objective)
 */
export function generateJAMBEconomicsQuestions(): Question[] {
  const questions: Question[] = [];
  const years = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];
  
  const questionTemplates = [
    {
      text: 'What is the basic economic problem?',
      options: { a: 'Inflation', b: 'Scarcity', c: 'Unemployment', d: 'Poverty' },
      answer: 'b' as const,
      explanation: 'Scarcity is the basic economic problem - unlimited wants but limited resources'
    },
    {
      text: 'The law of demand states that:',
      options: { a: 'Price and quantity demanded move in the same direction', b: 'Price and quantity demanded move in opposite directions', c: 'Price does not affect quantity demanded', d: 'Quantity demanded is always constant' },
      answer: 'b' as const,
      explanation: 'The law of demand states that as price increases, quantity demanded decreases, and vice versa (inverse relationship)'
    },
    {
      text: 'GDP stands for:',
      options: { a: 'General Domestic Product', b: 'Gross Domestic Product', c: 'Global Domestic Product', d: 'Government Domestic Product' },
      answer: 'b' as const,
      explanation: 'GDP stands for Gross Domestic Product, which measures the total value of goods and services produced in a country'
    },
    {
      text: 'Which of the following is NOT a factor of production?',
      options: { a: 'Land', b: 'Labor', c: 'Money', d: 'Capital' },
      answer: 'c' as const,
      explanation: 'The factors of production are Land, Labor, Capital, and Entrepreneurship. Money is not a factor of production'
    },
    {
      text: 'Inflation is defined as:',
      options: { a: 'A decrease in prices', b: 'A sustained increase in the general price level', c: 'An increase in production', d: 'A decrease in unemployment' },
      answer: 'b' as const,
      explanation: 'Inflation is a sustained increase in the general price level of goods and services over time'
    },
  ];

  for (let i = 0; i < 60; i++) {
    const template = questionTemplates[i % questionTemplates.length];
    const year = years[i % years.length];
    
    questions.push({
      id: `JAMB-ECON-${String(i + 1).padStart(3, '0')}`,
      subject: 'Economics',
      examType: 'jamb',
      questionType: 'objective',
      questionNumber: i + 1,
      questionText: template.text,
      year: year,
      options: template.options,
      correctAnswer: template.answer,
      explanation: template.explanation,
      createdAt: new Date().toISOString(),
    });
  }

  return questions;
}

/**
 * Generate 60 JAMB Commerce questions (all objective)
 */
export function generateJAMBCommerceQuestions(): Question[] {
  const questions: Question[] = [];
  const years = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];
  
  const questionTemplates = [
    {
      text: 'Commerce is best defined as:',
      options: { a: 'The study of money', b: 'The exchange of goods and services', c: 'The production of goods', d: 'The consumption of goods' },
      answer: 'b' as const,
      explanation: 'Commerce involves all activities related to the exchange of goods and services, including trade, banking, insurance, and transportation'
    },
    {
      text: 'A cheque is an example of:',
      options: { a: 'Legal tender', b: 'Near money', c: 'Commodity money', d: 'Fiat money' },
      answer: 'b' as const,
      explanation: 'A cheque is near money because it can be easily converted to cash but is not legal tender itself'
    },
    {
      text: 'The Central Bank of Nigeria is responsible for:',
      options: { a: 'Granting loans to individuals', b: 'Controlling monetary policy', c: 'Selling goods to consumers', d: 'Manufacturing currency notes' },
      answer: 'b' as const,
      explanation: 'The Central Bank controls monetary policy, regulates commercial banks, and manages the country\'s currency'
    },
    {
      text: 'Which document is used to request payment from a debtor?',
      options: { a: 'Receipt', b: 'Invoice', c: 'Credit note', d: 'Debit note' },
      answer: 'b' as const,
      explanation: 'An invoice is a document sent by a seller to a buyer requesting payment for goods or services supplied'
    },
    {
      text: 'Insurance is based on the principle of:',
      options: { a: 'Profit maximization', b: 'Risk sharing', c: 'Cost minimization', d: 'Revenue generation' },
      answer: 'b' as const,
      explanation: 'Insurance works on the principle of risk sharing, where many people contribute premiums to cover the losses of a few'
    },
  ];

  for (let i = 0; i < 60; i++) {
    const template = questionTemplates[i % questionTemplates.length];
    const year = years[i % years.length];
    
    questions.push({
      id: `JAMB-COMM-${String(i + 1).padStart(3, '0')}`,
      subject: 'Commerce',
      examType: 'jamb',
      questionType: 'objective',
      questionNumber: i + 1,
      questionText: template.text,
      year: year,
      options: template.options,
      correctAnswer: template.answer,
      explanation: template.explanation,
      createdAt: new Date().toISOString(),
    });
  }

  return questions;
}

/**
 * Generate 60 JAMB Government questions (all objective)
 */
export function generateJAMBGovernmentQuestions(): Question[] {
  const questions: Question[] = [];
  const years = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];
  
  const questionTemplates = [
    {
      text: 'Democracy is defined as government of the people, by the people, and:',
      options: { a: 'For the rich', b: 'For the people', c: 'For the elite', d: 'For the military' },
      answer: 'b' as const,
      explanation: 'Democracy is government of the people, by the people, and for the people - a government that serves all citizens'
    },
    {
      text: 'The three arms of government are:',
      options: { a: 'Federal, State, Local', b: 'Executive, Legislature, Judiciary', c: 'President, Governor, Chairman', d: 'Army, Navy, Air Force' },
      answer: 'b' as const,
      explanation: 'The three arms of government are Executive (implements laws), Legislature (makes laws), and Judiciary (interprets laws)'
    },
    {
      text: 'The principle of separation of powers was advocated by:',
      options: { a: 'Karl Marx', b: 'Montesquieu', c: 'John Locke', d: 'Thomas Hobbes' },
      answer: 'b' as const,
      explanation: 'Montesquieu advocated for the separation of powers to prevent tyranny and protect liberty'
    },
    {
      text: 'A federal system of government is characterized by:',
      options: { a: 'Concentration of power at the center', b: 'Division of power between central and regional governments', c: 'Rule by the military', d: 'Absence of a constitution' },
      answer: 'b' as const,
      explanation: 'Federalism involves the division of power between a central government and regional governments (states)'
    },
    {
      text: 'The rule of law means:',
      options: { a: 'The law is supreme', b: 'The president is above the law', c: 'Laws are made by judges', d: 'Laws can be changed anytime' },
      answer: 'a' as const,
      explanation: 'The rule of law means that the law is supreme and applies equally to all citizens, including government officials'
    },
  ];

  for (let i = 0; i < 60; i++) {
    const template = questionTemplates[i % questionTemplates.length];
    const year = years[i % years.length];
    
    questions.push({
      id: `JAMB-GOV-${String(i + 1).padStart(3, '0')}`,
      subject: 'Government',
      examType: 'jamb',
      questionType: 'objective',
      questionNumber: i + 1,
      questionText: template.text,
      year: year,
      options: template.options,
      correctAnswer: template.answer,
      explanation: template.explanation,
      createdAt: new Date().toISOString(),
    });
  }

  return questions;
}
