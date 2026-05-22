interface RulesEngineInput {
  rawText: string;
  structuredJson: {
    contactInfo?: {
      name?: string;
      email?: string;
      phone?: string;
      location?: string;
      links?: string[];
    };
    skills?: Array<{ name: string; category?: string }>;
    workExperience?: Array<{
      company: string;
      role: string;
      bullets?: string[];
    }>;
    education?: Array<{
      institution: string;
      degree?: string;
    }>;
    projects?: Array<{
      name: string;
      bullets?: string[];
    }>;
  };
  targetKeywords: string[];
}

interface RulesEngineOutput {
  keywordDensityAlerts: string[];
  missingStandardHeaders: string[];
  formattingConsistencyAlerts: string[];
  contactInfoClarityAlerts: string[];
  parsingSafetyAlerts: string[];
  heuristicsScore: number;
}

export function runATSRulesEngine(input: RulesEngineInput): RulesEngineOutput {
  const { rawText, structuredJson, targetKeywords } = input;
  const keywordDensityAlerts: string[] = [];
  const missingStandardHeaders: string[] = [];
  const formattingConsistencyAlerts: string[] = [];
  const contactInfoClarityAlerts: string[] = [];
  const parsingSafetyAlerts: string[] = [];

  let deductions = 0;

  // 1. Keyword Density Checks
  const cleanText = rawText.toLowerCase();
  const words = cleanText.split(/\s+/).filter(w => w.length > 2);
  const totalWordCount = words.length || 1;

  targetKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'gi');
    const matches = cleanText.match(regex);
    const count = matches ? matches.length : 0;
    const density = (count / totalWordCount) * 100;

    if (density > 4.0) {
      keywordDensityAlerts.push(
        `Keyword "${keyword}" is used too frequently (${density.toFixed(1)}% density). Try reducing to avoid stuffing flags.`
      );
      deductions += 5;
    }
  });

  // 2. Section Headers
  const lowerText = rawText.toLowerCase();
  const standardSections = [
    { name: 'experience', patterns: ['experience', 'work history', 'employment'] },
    { name: 'education', patterns: ['education', 'academic', 'degrees'] },
    { name: 'skills', patterns: ['skills', 'technologies', 'technical skills', 'expertise'] }
  ];

  standardSections.forEach(section => {
    const hasPattern = section.patterns.some(pattern => lowerText.includes(pattern));
    if (!hasPattern) {
      missingStandardHeaders.push(
        `Could not find a standard header for "${section.name.toUpperCase()}". ATS systems might fail to classify this block.`
      );
      deductions += 10;
    }
  });

  // 3. Formatting Consistency
  // Checking for non-standard bullet symbols like ➔, ❖, etc., which break some older parsers
  const complexBullets = /[➔❖■◆✅➤➢]/g;
  if (complexBullets.test(rawText)) {
    formattingConsistencyAlerts.push(
      'Contains complex bullet characters (e.g. ➔, ❖, ◆) which can confuse legacy ATS parsers. Use standard circles (-) or bullet symbols.'
    );
    deductions += 5;
  }

  // 4. Contact Info Clarity
  const contact = structuredJson.contactInfo;
  if (!contact?.email) {
    contactInfoClarityAlerts.push('No email address detected. Contact information is critical.');
    deductions += 15;
  } else if (!/\S+@\S+\.\S+/.test(contact.email)) {
    contactInfoClarityAlerts.push('Email address format seems invalid.');
    deductions += 5;
  }

  if (!contact?.phone) {
    contactInfoClarityAlerts.push('No phone number detected.');
    deductions += 10;
  }

  // 5. File Parsing Safety
  if (rawText.length < 200) {
    parsingSafetyAlerts.push(
      'Document text extraction is extremely short. The file might be saved as a scanned image rather than select-safe text.'
    );
    deductions += 30;
  }

  // Calculate high-level heuristics score
  const heuristicsScore = Math.max(10, 100 - deductions);

  return {
    keywordDensityAlerts,
    missingStandardHeaders,
    formattingConsistencyAlerts,
    contactInfoClarityAlerts,
    parsingSafetyAlerts,
    heuristicsScore
  };
}
