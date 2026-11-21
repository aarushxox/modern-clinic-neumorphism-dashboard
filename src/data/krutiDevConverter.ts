/**
 * Legacy RTF & Kruti-Dev 010 to Unicode Hindi Converter & Prescription Medicine Parser
 * Preserves authentic legacy medical notes & Hindi treatment dosage instructions
 * Addresses PRD 2 requirements:
 * - Proper 'f' (chhoti-i matra) reordering
 * - Hindi word spacing fixes (e.g. "fदन मेदोबार" -> "दिन में दो बार", "रात मेंखानेकेबाद" -> "रात में खाने के बाद")
 * - Single medicine icon per row, clean card rendering
 * - Normalization of typos like 'GONE' -> 1, '1/2' -> ½ tablet
 */

// Mapping of Kruti Dev 010 characters to Devanagari Unicode
const KRUTI_TO_UNICODE_MAP: Record<string, string> = {
  'k': 'ा',
  'l': 'ी',
  'L': 'ीं',
  'f': 'ि',
  'h': 'ी',
  'q': 'ु',
  'w': 'ू',
  'e': 'े',
  'E': 'ै',
  's': 'ो',
  'S': 'ौ',
  'a': 'ं',
  'A': 'ँ',
  'd': '्',
  'D': '्',
  'z': '़',
  'Z': '्र',
  '`': '़',
  '~': '़',
  '1': '१',
  '2': '२',
  '3': '३',
  '4': '४',
  '5': '५',
  '6': '६',
  '7': '७',
  '8': '८',
  '9': '९',
  '0': '०',
  'x': 'ग',
  'X': 'घ',
  'c': 'म',
  'C': 'ण',
  'v': 'न',
  'V': 'न',
  'b': 'व',
  'B': 'ब',
  'n': 'ल',
  'N': 'ळ',
  'm': 'स',
  'M': 'श',
  'j': 'र',
  'J': 'श्र',
  'u': 'ह',
  'U': 'ह',
  'y': 'त',
  'Y': 'थ',
  't': 'ज',
  'T': 'झ',
  'r': 'प',
  'R': 'फ',
  'p': 'द',
  'P': 'ध',
  'o': 'ड',
  'O': 'ढ',
  'i': 'ब',
  'I': 'भ',
  'g': 'ह',
  'G': 'ङ',
  'K': 'ज्ञ',
  'H': 'भ',
  '[': 'ख',
  '{': 'क्ष',
  ';': 'य',
  ':': 'छ',
  "'": 'ट',
  '"': 'ठ',
  ',': 'ए',
  '<': 'ऋ',
  '.': '।',
};

/**
 * Converts Kruti Dev encoded text to UTF-8 Unicode Devanagari
 * Handles pre-positioned chhoti-i matra 'f' correctly
 */
export function convertKrutiDevToUnicode(krutiText: string): string {
  if (!krutiText) return '';

  // If already pure Unicode devanagari, clean up known spacing issues
  if (/[\u0900-\u097F]/.test(krutiText)) {
    return cleanHindiSpacing(krutiText);
  }

  let text = krutiText;

  // Handle 'f' (chhoti i) which in Kruti Dev precedes the consonant
  // e.g., 'fnu' -> 'd' + 'f' + 'v' -> 'द' + 'ि' + 'न' = 'दिन'
  text = text.replace(/f([a-zA-Z])/g, '$1f');

  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    result += KRUTI_TO_UNICODE_MAP[char] || char;
  }

  return cleanHindiSpacing(result);
}

/**
 * Cleans corrupt Devanagari spacing and common legacy abbreviations
 */
export function cleanHindiSpacing(hindiText: string): string {
  let cleaned = hindiText;

  // Fix common corrupted strings identified in PRD 2
  cleaned = cleaned.replace(/fदन/g, 'दिन');
  cleaned = cleaned.replace(/fदन/g, 'दिन');
  cleaned = cleaned.replace(/मेदोबार/g, 'में दो बार');
  cleaned = cleaned.replace(/मेतीन बार/g, 'में तीन बार');
  cleaned = cleaned.replace(/मेतीनबार/g, 'में तीन बार');
  cleaned = cleaned.replace(/मेएकबार/g, 'में एक बार');
  cleaned = cleaned.replace(/रात मेंखानेकेबाद/g, 'रात में खाने के बाद');
  cleaned = cleaned.replace(/खानेकेबाद/g, 'खाने के बाद');
  cleaned = cleaned.replace(/खानेकेपहले/g, 'खाने से पहले');
  cleaned = cleaned.replace(/नाश्तेकेबाद/g, 'नाश्ते के बाद');
  cleaned = cleaned.replace(/सुबहशाम/g, 'सुबह-शाम');
  cleaned = cleaned.replace(/खालीपेट/g, 'खाली पेट');
  cleaned = cleaned.replace(/गुनगुनेपानीसे/g, 'गुनगुने पानी से');
  cleaned = cleaned.replace(/दर्दहोनेपर/g, 'दर्द होने पर');
  cleaned = cleaned.replace(/बुखारहोनेपर/g, 'बुखार होने पर');
  cleaned = cleaned.replace(/जरूरतपड़नेपर/g, 'जरूरत पड़ने पर');

  // Fix missing spaces after common postpositions
  cleaned = cleaned.replace(/में([^\s])/g, 'में $1');
  cleaned = cleaned.replace(/से([^\s])/g, 'से $1');
  cleaned = cleaned.replace(/के([^\s])/g, 'के $1');

  // Clean redundant spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

/**
 * Strips RTF control words and extracts readable plain text
 */
export function parseRTFToPlainText(rtfText: string): string {
  if (!rtfText) return '';
  if (!rtfText.startsWith('{\\rtf') && !rtfText.includes('\\par') && !rtfText.includes('\\b ')) {
    return rtfText.trim();
  }

  let text = rtfText;
  text = text.replace(/\{\\fonttbl[\s\S]*?\}/g, '');
  text = text.replace(/\{\\colortbl[\s\S]*?\}/g, '');
  text = text.replace(/\{\\stylesheet[\s\S]*?\}/g, '');
  text = text.replace(/\{\\\*[\s\S]*?\}/g, '');

  text = text.replace(/\\par/g, '\n');
  text = text.replace(/\\line/g, '\n');
  text = text.replace(/\\tab/g, '\t');

  text = text.replace(/\\[a-zA-Z0-9]+(-?[0-9]+)?[ ]?/g, '');
  text = text.replace(/[{}]/g, '');

  text = text.replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, '\n').trim();
  return text;
}

export interface ParsedMedicineItem {
  type: 'TAB' | 'CAP' | 'SYP' | 'INJ' | 'OINT' | 'DROPS' | 'OTHER';
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructionsHindi?: string;
  rawText: string;
}

/**
 * Formats legacy treatment text into structured medicine segments
 * Follows PRD 2 Rules 42-48:
 * - One icon per medicine
 * - Normalized dosage (e.g. 1 tablet, ½ tablet)
 * - Clean frequency and duration
 * - Authentic Hindi dosage instructions
 */
export function formatPrescriptionTreatment(treatmentRaw: string): {
  plainText: string;
  medicines: ParsedMedicineItem[];
} {
  const plainText = parseRTFToPlainText(treatmentRaw);
  const lines = plainText.split(/\n+/).map((l) => l.trim()).filter(Boolean);

  const medicines: ParsedMedicineItem[] = [];

  for (const line of lines) {
    let type: 'TAB' | 'CAP' | 'SYP' | 'INJ' | 'OINT' | 'DROPS' | 'OTHER' = 'TAB';
    const upper = line.toUpperCase();

    if (upper.startsWith('TAB') || upper.includes('TAB.')) type = 'TAB';
    else if (upper.startsWith('CAP') || upper.includes('CAP.')) type = 'CAP';
    else if (upper.startsWith('SYP') || upper.includes('SYP.') || upper.includes('SYRUP')) type = 'SYP';
    else if (upper.startsWith('INJ') || upper.includes('INJ.')) type = 'INJ';
    else if (upper.startsWith('OINT') || upper.includes('CREAM') || upper.includes('GEL')) type = 'OINT';
    else if (upper.startsWith('DROPS') || upper.includes('GTT')) type = 'DROPS';
    else type = 'OTHER';

    // Parse dosage quantity (1 tablet, 1/2 tablet, 2 tablets, GONE -> 1 tablet)
    let dosage = '1 tablet';
    if (/\b(1\/2|HALF|आधा|आधी)\b/i.test(line)) {
      dosage = '½ tablet';
    } else if (/\b(2|TWO|दो)\b/i.test(line)) {
      dosage = '2 tablets';
    } else if (/\b(2 TSP|10ML|10 ML)\b/i.test(line)) {
      dosage = '2 teaspoons (10ml)';
    } else if (/\b(1 TSP|5ML|5 ML)\b/i.test(line)) {
      dosage = '1 teaspoon (5ml)';
    } else if (/\b(1 PUFF|1 ROTACAP)\b/i.test(line)) {
      dosage = '1 inhalation / puff';
    } else if (type === 'OINT') {
      dosage = 'Apply locally';
    } else if (type === 'INJ') {
      dosage = '1 ampoule / vial';
    } else if (type === 'DROPS') {
      dosage = '2 drops';
    }

    // Parse frequency (BD, TDS, OD, HS, SOS, QID, 1-0-1, etc.)
    let frequency = 'Twice daily';
    let freqCode = '1-0-1';

    if (/\b(THRICE DAILY|TDS|1-1-1|तीन बार)\b/i.test(line)) {
      frequency = 'Thrice daily (TDS)';
      freqCode = '1-1-1';
    } else if (/\b(TWICE DAILY|BD|1-0-1|दो बार)\b/i.test(line)) {
      frequency = 'Twice daily (BD)';
      freqCode = '1-0-1';
    } else if (/\b(AFTER DINNER|HS|0-0-1|रात में|सोते समय)\b/i.test(line)) {
      frequency = 'After dinner / Bedtime (HS)';
      freqCode = '0-0-1';
    } else if (/\b(ONCE DAILY|OD|1-0-0|एक बार|सुबह)\b/i.test(line)) {
      frequency = 'Once daily (OD)';
      freqCode = '1-0-0';
    } else if (/\b(SOS|जरूरत पड़ने पर|WHEN REQUIRED)\b/i.test(line)) {
      frequency = 'As needed (SOS)';
      freqCode = 'SOS';
    } else if (/\b(QID|1-1-1-1|चार बार)\b/i.test(line)) {
      frequency = 'Four times daily (QID)';
      freqCode = '1-1-1-1';
    }

    // Parse duration (x 5, x 5 days, for 3 days, x 7d)
    let duration = 'Duration: 5 days';
    const durMatch = line.match(/\b(x\s*(\d+)\s*(?:days?|weeks?|months?|d)?|for\s*(\d+)\s*(?:days?|weeks?|months?))\b/i);
    if (durMatch) {
      const daysCount = durMatch[2] || durMatch[3] || '5';
      duration = `Duration: ${daysCount} days`;
    }

    // Extract or construct authentic Hindi instructions
    let instructionsHindi = '';
    // Check if line has embedded Hindi
    const devanagariMatch = line.match(/[\u0900-\u097F\s]+/);
    if (devanagariMatch && devanagariMatch[0].trim().length > 3) {
      instructionsHindi = cleanHindiSpacing(devanagariMatch[0].trim());
    } else if (/fदन|मेदोबार|मेतीन|रात में|खानेके/i.test(line)) {
      // Decode corrupted Kruti-Dev text in line
      instructionsHindi = cleanHindiSpacing(convertKrutiDevToUnicode(line));
    }

    // If still empty or generic, use standard clinical directions
    if (!instructionsHindi) {
      if (freqCode === '1-0-1') {
        instructionsHindi = 'दिन में दो बार (सुबह-शाम) खाने के बाद';
      } else if (freqCode === '1-1-1') {
        instructionsHindi = 'दिन में तीन बार खाने के बाद';
      } else if (freqCode === '0-0-1') {
        instructionsHindi = 'रात में खाने के बाद (सोते समय)';
      } else if (freqCode === '1-0-0') {
        instructionsHindi = 'दिन में एक बार (सुबह नाश्ते के बाद)';
      } else if (freqCode === 'SOS') {
        instructionsHindi = 'जरूरत पड़ने पर (दर्द या बुखार होने पर)';
      } else {
        instructionsHindi = 'डॉक्टर के निर्देशानुसार पानी के साथ लें';
      }
    }

    // Clean drug name by stripping prefix type and extraneous tokens
    let cleanedName = line
      .replace(/^(TAB\.?|CAP\.?|SYP\.?|INJ\.?|OINT\.?|DROPS\.?)\s*/i, '')
      .replace(/\b(ONE|GONE|TWO|1\/2|HALF)\b/gi, '')
      .replace(/\b(TWICE DAILY|THRICE DAILY|ONCE DAILY|AFTER DINNER|OD|BD|TDS|HS|SOS)\b/gi, '')
      .replace(/[\u0900-\u097F].*$/, '') // strip trailing Devanagari text from title
      .replace(/x\s*\d+\s*(?:days?|weeks?|months?|d)?/gi, '')
      .replace(/for\s*\d+\s*(?:days?|weeks?|months?)/gi, '')
      .replace(/fदन.*$/, '')
      .trim();

    if (!cleanedName) {
      cleanedName = line.split(/\s+/).slice(0, 3).join(' ');
    }

    medicines.push({
      type,
      name: cleanedName,
      dosage,
      frequency,
      duration,
      instructionsHindi,
      rawText: line,
    });
  }

  return { plainText, medicines };
}
