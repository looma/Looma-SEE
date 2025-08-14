export interface GroupAQuestion {
  id: string
  nepali: string
  english: string
  options: { id: string; nepali: string; english: string }[]
  correctAnswer: string
  marks: number
}

export interface FreeResponseQuestion {
  id: string
  nepali: string
  english: string
  marks: number
}

export const groupAQuestions: GroupAQuestion[] = [
  {
    id: "1a",
    nepali: "कम्प्युटर मेमोरीको सबैभन्दा सानो एकाइ कुन हो?",
    english: "Which is the smallest unit of computer memory?",
    options: [
      { id: "i", nepali: "किलोबाइट (Kilobyte)", english: "Kilobyte" },
      { id: "ii", nepali: "मेगाबाइट (Megabyte)", english: "Megabyte" },
      { id: "iii", nepali: "बिट (Bit)", english: "Bit" },
      { id: "iv", nepali: "गिगाबाइट (Gigabyte)", english: "Gigabyte" },
    ],
    correctAnswer: "iii",
    marks: 1,
  },
  {
    id: "1b",
    nepali: "सल्लालाई किन सब–डिभिजन जिम्नास्पर्म अन्तर्गत राखिएको हो?",
    english: "Why is pine kept in sub-division gymnosperm?",
    options: [
      { id: "i", nepali: "यसमा सियो आकारका पातहरू हुन्छन्।", english: "It has needle shaped leaves" },
      { id: "ii", nepali: "यसमा बीउहरू नाङ्गा हुन्छन्।", english: "It has naked seeds" },
      { id: "iii", nepali: "यसमा क्लोरोफिल हुन्छ।", english: "It has chlorophyll" },
      { id: "iv", nepali: "यसमा फलको सट्टा कोनहरू हुन्छन्।", english: "It has cones instead of fruit" },
    ],
    correctAnswer: "ii",
    marks: 1,
  },
  {
    id: "1c",
    nepali: "क्रमविकासको सिद्धान्त अनुसार तलका मध्ये कुन समूहहरूका जीवहरू नजिकैका हुन्?",
    english: "Which of the following groups of organism are closely related on the basis of evolution?",
    options: [
      { id: "i", nepali: "Porifera, Annelida, Chordata", english: "Porifera, Annelida, Chordata" },
      { id: "ii", nepali: "Porifera, Arthropoda, Chordata", english: "Porifera, Arthropoda, Chordata" },
      { id: "iii", nepali: "Coelenterata, Arthropoda, Chordata", english: "Coelenterata, Arthropoda, Chordata" },
      {
        id: "iv",
        nepali: "Platyhelminthes, Nemathelminthes, Annelida",
        english: "Platyhelminthes, Nemathelminthes, Annelida",
      },
    ],
    correctAnswer: "iv",
    marks: 1,
  },
  {
    id: "1d",
    nepali: "समुद्री सतह बृद्धि हुनुका मुख्य कारण के हो?",
    english: "What is the main cause of increasing the level of ocean?",
    options: [
      { id: "i", nepali: "वन जङ्गलको विनाश", english: "Deforestation" },
      { id: "ii", nepali: "अति वृष्टि", english: "Heavy rainfall" },
      { id: "iii", nepali: "बाढी पहिरो", english: "Flood and landslide" },
      { id: "iv", nepali: "पृथ्वीको तापक्रम बढ्नु", english: "Increase in the temperature of the earth" },
    ],
    correctAnswer: "iv",
    marks: 1,
  },
  {
    id: "1e",
    nepali:
      "पृथ्वीमा ५०kg बोक्न सक्ने व्यक्तिले चन्द्रमामा कति बोक्न सक्छ? पृथ्वीको सतहमा g को मान 9.8m/s² र चन्द्रमाको सतहमा g को मान पृथ्वीको भन्दा ६ गुणा कम छ।",
    english:
      "Calculate the mass that a person can lift on moon if he can lift a mass of 50kg on the earth. The value of g on the surface of the Earth is 9.8m/s² and that of moon is 6 times less.",
    options: [
      { id: "i", nepali: "200.6 kg", english: "200.6 kg" },
      { id: "ii", nepali: "300.6 kg", english: "300.6 kg" },
      { id: "iii", nepali: "400.6 kg", english: "400.6 kg" },
      { id: "iv", nepali: "500.6 kg", english: "500.6 kg" },
    ],
    correctAnswer: "ii",
    marks: 1,
  },
  {
    id: "1f",
    nepali:
      "एउटा हाइड्रोलिक लिफ्टमा ठूलो पिस्टन A र सानो पिस्टन B को क्रस–सेक्शनल क्षेत्रफल, चाप र बल/तौल क्रमशः A₁ र A₂, P₁ र P₂ र F₁ र F₂ भए पास्कलको नियम अनुसार तलकामध्ये कुन सम्बन्ध सही हुन्छ?",
    english:
      "If large piston A and small piston B of a hydraulic lift have their cross-sectional area, pressure and force/weight are A₁ and A₂, P₁ and P₂ and F₁ and F₂ respectively, then which of the following relation would be correct according to Pascal's law?",
    options: [
      { id: "i", nepali: "P₁ = P₂", english: "P₁ = P₂" },
      { id: "ii", nepali: "A₁ = A₂", english: "A₁ = A₂" },
      { id: "iii", nepali: "F₁ = F₂", english: "F₁ = F₂" },
      { id: "iv", nepali: "F₁/A₁ = F₂/A₂", english: "F₁/A₁ = F₂/A₂" },
    ],
    correctAnswer: "i",
    marks: 1,
  },
  {
    id: "1g",
    nepali: "संगैको चित्रमा देखाइएको लेन्स अगाडिको वस्तु XY को बन्ने आकृतिको विशेषता छुट्याउनुहोस्।",
    english:
      "Identify the characteristics of the image of the object XY kept in front of the lens as shown in the given figure.",
    options: [
      { id: "i", nepali: "अवास्तविक, सुल्टो र वस्तुभन्दा ठूलो", english: "Virtual, erect and magnified" },
      { id: "ii", nepali: "वास्तविक, सुल्टो र वस्तुभन्दा ठूलो", english: "Real, erect and magnified" },
      { id: "iii", nepali: "अवास्तविक, उल्टो र वस्तुभन्दा सानो", english: "Virtual, inverted and diminished" },
      { id: "iv", nepali: "वास्तविक, उल्टो र वस्तुभन्दा ठूलो", english: "Real, inverted and magnified" },
    ],
    correctAnswer: "iv",
    marks: 1,
  },
  {
    id: "1h",
    nepali: "हब्बलको नियमले तलका मध्ये कुन कुरालाई प्रमाणित गर्दछ?",
    english: "Which of the following is proved by Hubble's law?",
    options: [
      { id: "i", nepali: "ब्रह्माण्ड खुम्चिरहेको छ।", english: "Universe is contracting" },
      { id: "ii", nepali: "ब्रह्माण्ड फैलिरहेको छ।", english: "Universe is expanding" },
      { id: "iii", nepali: "ब्रह्माण्ड जस्ताको त्यस्तै छ।", english: "Universe remains same" },
      { id: "iv", nepali: "ग्यालेक्सीहरू नजिक भइरहेका छन्।", english: "Galaxies appeared to be closer" },
    ],
    correctAnswer: "ii",
    marks: 1,
  },
  {
    id: "1i",
    nepali: "तलका मध्ये कुन चाहिँ दोहोरो विस्थापन प्रतिक्रिया हो?",
    english: "Which one is a double displacement reaction from the following?",
    options: [
      { id: "i", nepali: "X + YZ → XY + Z", english: "X + YZ → XY + Z" },
      { id: "ii", nepali: "X + Y → XY", english: "X + Y → XY" },
      { id: "iii", nepali: "XYZ → X + Y + Z", english: "XYZ → X + Y + Z" },
      { id: "iv", nepali: "XY + AB → XB + AY", english: "XY + AB → XB + AY" },
    ],
    correctAnswer: "iv",
    marks: 1,
  },
  {
    id: "1j",
    nepali:
      "एउटा कथन र दुईओटा तर्क दिइएको छ। कथन: डिटर्जेन्टलाई साबुनरहित साबुन भनिन्छ। तर्क १: यसले साबुन जस्तै वस्तु सफा गर्छ र रासायनिक प्रकृति भने फरक हुन्छ। तर्क २: साबुन जस्तै यसले पनि कडा पानीमा फिँज दिँदैन।",
    english:
      "A statement and two arguments are given below. Statement: Detergent is called a soap less soap. Argument 1: It has cleaning properties like soap but its chemical nature is different. Argument 2: It does not give lather with hard water as soap.",
    options: [
      {
        id: "i",
        nepali: "कथन र तर्क २ सही तर तर्क १ गलत",
        english: "Statement and argument 2 is correct but argument 1 is incorrect",
      },
      {
        id: "ii",
        nepali: "कथन र तर्क २ गलत तर तर्क १ सही",
        english: "Statement and argument 2 is incorrect but argument 1 is correct",
      },
      {
        id: "iii",
        nepali: "कथन र तर्क १ सही तर तर्क २ गलत",
        english: "Statement and argument 1 is correct but argument 2 is incorrect",
      },
      {
        id: "iv",
        nepali: "कथन र तर्क १ गलत तर तर्क २ सही",
        english: "Statement and argument 1 is incorrect but argument 2 is correct",
      },
    ],
    correctAnswer: "iii",
    marks: 1,
  },
]

export const groupBQuestions: FreeResponseQuestion[] = [
  {
    id: "2a",
    nepali: "स्वतन्त्र चरको एउटा फाइदा लेख्नुहोस्।",
    english: "Write an advantage of independent variable.",
    marks: 1,
  },
  {
    id: "2b",
    nepali: "उर्ध्वचाप भनेको के हो?",
    english: "What is upthrust?",
    marks: 1,
  },
  {
    id: "2c",
    nepali: "अप्टिकल फाइबरको एउटा उपयोगिता लेख्नुहोस्।",
    english: "Write down one utility of optical fiber.",
    marks: 1,
  },
  {
    id: "2d",
    nepali:
      "गर्मी महिनामा सिमेन्टेड सडकहरू पानीले भरिएको जस्तो देखिन्छन् तर नजिक गएर हेर्दा त्यस्तो हुँदैन। यसमा प्रकाशको कुन प्रक्रिया समावेश छ।",
    english:
      "In summer season, the cemented roads are seemed to be filled with water but they are not actually. Which phenomenon of light is behind this?",
    marks: 1,
  },
  {
    id: "2e",
    nepali: "कार्बन डाइ अक्साइड ग्यासलाई चुनपानीमा थोरै समय पठाउँदा के हुन्छ?",
    english: "What happens when carbon dioxide gas is passed through lime water for short time?",
    marks: 1,
  },
  {
    id: "2f",
    nepali: "रेडसिफ्ट भनेको के हो?",
    english: "What is meant by redshift?",
    marks: 1,
  },
  {
    id: "2g",
    nepali: "चाँदीको मुख्य धातुको नाम लेख्नुहोस्।",
    english: "Write the name of main ore of silver.",
    marks: 1,
  },
  {
    id: "2h",
    nepali: "पेरियोडिक टेबलको समूह सातका तत्वहरूलाई किन ह्यालोजन भनिन्छ?",
    english: "Why are group VII elements of periodic table called halogens?",
    marks: 1,
  },
  {
    id: "2i",
    nepali: "ग्लाइकोलको संरचनात्मक सूत्र लेख्नुहोस्।",
    english: "Write the structural formula of glycol.",
    marks: 1,
  },
]

export const groupCQuestions: FreeResponseQuestion[] = [
  {
    id: "3",
    nepali:
      "आधारभूत एकाइको प्रयोग गरी समीकरण P = IV मा एकरूपता छ भन्ने प्रमाणित गर्नुहोस्। यहाँ I ले विद्युत धारा, V ले भोल्टेज र P ले सामर्थ्यलाई जनाउँछ।",
    english:
      "Use fundamental units to show that equation P = IV is homogeneous, where I is electric current, V is voltage and P is power.",
    marks: 2,
  },
  {
    id: "4",
    nepali: "वनस्पति जगतको कुनै दुई विशेषता लेख्नुहोस्।",
    english: "Write any two characteristics of plant kingdom.",
    marks: 2,
  },
  {
    id: "5",
    nepali: "मौरीको पारिस्थितिक पद्धतिमा कुनै दुई भूमिका लेख्नुहोस्।",
    english: "Write any two roles of honey bee on ecosystem.",
    marks: 2,
  },
  {
    id: "6",
    nepali: "माइटोसिस कोष विभाजनलाई इक्वेसनल कोष विभाजन भनिन्छ, किन?",
    english: "Mitosis cell division is called equational division. Why?",
    marks: 2,
  },
  {
    id: "7",
    nepali:
      "भारतले नेपाललाई मुर्रा राँगो अनुदानमा दिएको छ। स्थानीय जातको राँगोका सट्टा मुर्रा राँगोको सहायतले भैंसीको प्रजनन गराउँदा भैंसीपालनबाट किसानहरूलाई पुग्ने कुनै दुई फाइदाहरू लेख्नुहोस्।",
    english:
      "India has donated Murrah Buffalo to Nepal. Mention any two benefits gained by farmers on breeding buffalo with Murrah buffalo instead of local species of buffaloes.",
    marks: 2,
  },
  {
    id: "8",
    nepali: "हिमोफिलिया र ल्युकेमियाबीच दुई फरक लेख्नुहोस्।",
    english: "Write any two differences between haemophilia and leukemia.",
    marks: 2,
  },
  {
    id: "9",
    nepali: "नेपालमा हाब्रेको संख्या कम हुँदै गएको छ। हाब्रेको संरक्षण गर्न के के उपाय अपनाउनु पर्ला? कुनै दुई उपाय लेख्नुहोस्।",
    english:
      "Number of red panda is decreasing in Nepal. What measures can be done to protect the Panda? Write any two measures.",
    marks: 2,
  },
  {
    id: "10",
    nepali: "कुनै आकाशीय पिण्डको सतहमा कुनै वस्तुको गुरुत्वबलमा निर्भर गर्ने कुनै दुई तत्वहरू लेख्नुहोस्।",
    english: "Write any two factors on which gravity on the surface of a heavenly body depends.",
    marks: 2,
  },
  {
    id: "11",
    nepali:
      "पृथ्वीको केन्द्रबाट समान दूरीमा भएको दुईवस्तुमा लाग्ने आकर्षण बल समान हुन्छ भने तिनीहरूको पिण्ड पनि समान नै हुन्छ। प्रमाणित गर्नुहोस्।",
    english:
      "Prove that if the earth attracts two bodies placed at the same distance from the centre of the earth with the same force, then their masses are equal.",
    marks: 2,
  },
  {
    id: "12",
    nepali: "गुडिरहेको साइकलमा डाइनामोको मद्दतले बालिएको बत्ति साइकल रोकिंदा निम्छ। कारण लेख्नुहोस्।",
    english:
      "Lamp is lit in the running bicycle by the help of a dynamo but it goes off when bicycle is stopped. Give reason.",
    marks: 2,
  },
  {
    id: "13",
    nepali:
      "गृहस्थ विद्युतिकरणमा 220V को विद्युत प्रवाह भएको हुन्छ। मोबाइलको ब्याट्रीले 3.7 V मा काम गर्दछ। यसको आधारमा मोबाइल चार्जरमा प्रयोग हुने ट्रान्सफर्मरको चित्र कोर्नुहोस्।",
    english:
      "In domestic house hold wiring voltage of 220V is supplied. A battery of mobile works with 3.7 V. Draw net diagram of transformer used in mobile charger.",
    marks: 2,
  },
  {
    id: "14",
    nepali:
      "पेरियोडिक तालिकाको IIA समूहको एउटा धातु र VIIA समूहको एउटा अधातुको बिचमा रासायनिक प्रतिक्रिया हुँदा बन्ने समीकरण लेखी सन्तुलित गर्नुहोस्।",
    english:
      "Write a balanced chemical equation between the reactions of a metal of group IIA with a non-metal of group VIIA.",
    marks: 2,
  },
  {
    id: "15",
    nepali: "हाइड्रोजन र कार्बनको संख्या बराबर हुने एउटा Alkyne को नाम लेख्नुहोस्। यसको कुनै एक प्रयोग लेख्नुहोस्।",
    english:
      "Write the name of members of alkyne which contains an equal number of hydrogen and carbon. Write one uses of it.",
    marks: 2,
  },
  {
    id: "16",
    nepali: "मानव स्वास्थ्यका लागि रासायनिक विषादी प्रयोग गर्नु खतरा हुन्छ। यो भनाइलाई आफ्ना दुई तर्कद्वारा पुष्टि गर्नुहोस्।",
    english:
      "It is dangerous to use chemical pesticides for human health. Justify this statement by using your two arguments.",
    marks: 2,
  },
]

export const groupDQuestions: FreeResponseQuestion[] = [
  {
    id: "17",
    nepali: "हाम्रो दैनिक जीवनमा डिजिटल प्रविधिका कुनै दुईओटा सकारात्मक र नकारात्मक प्रभावहरू लेख्नुहोस्।",
    english: "Write any two positive and negative impacts of digital technology in our daily life.",
    marks: 4,
  },
  {
    id: "18",
    nepali:
      "दिइएको चित्र अध्ययन गरी तलका प्रश्नहरूको उत्तर लेख्नुहोस्। (i) चित्रमा देखाइएको पानीको विशेष गुणलाई के भनिन्छ? (ii) पानीलाई 0°C देखि 10°C सम्म तताउँदा आयतनमा देखिने परिवर्तन लेख्नुहोस्। (iii) पानीको उक्त विशेष गुणको कुनै एक उपयोगिता लेख्नुहोस्।",
    english:
      "Study the figure and answer the following questions: (i) What is the special property of water shown in the figure called? (ii) Write the change that takes place in volume of water on heating from 0°C to 10°C. (iii) Write one use of this special property of water.",
    marks: 4,
  },
  {
    id: "19",
    nepali:
      "(a) धमनी भनेको के हो? मानव शरीरमा रहेको सबैभन्दा ठूलो धमनीको नाम लेख्नुहोस्। (b) उच्च रक्तचापका दुई ओटा कारणहरू उल्लेख गर्नुहोस्।",
    english:
      "(a) What is an artery? Name the largest artery of human body. (b) Write two causes of high blood pressure.",
    marks: 4,
  },
  {
    id: "20",
    nepali:
      "दिइएको चित्रमा तीनओटा धातुका डल्लाहरू A, B, र C लाई समान तापक्रममा तताएर मैन भएको भाँडामा राखिएका छन्। ती तीनवटै धातुको पिण्ड र आयतन बराबर छ। जसमा धातु A को विशिष्ट तापधारण क्षमता 380J/kg°C, B को 470 J/kg°C र C को 910J/kg°C छ भने, तलका प्रश्नहरूको उत्तर दिनुहोस्। (a) कुन धातुमा सबैभन्दा बढी तापशक्ति हुन्छ? (b) कुन चाहिँ धातु मैनका स्लाभमा तलसम्म जान्छ? (c) कुन चाहिँ धातु चाँडो सेलाउँछ? (d) कुन चाहिँ धातुले सबैभन्दा धेरै तापशक्ति गुमाउँछ?",
    english:
      "In the figure, A, B and C are three metal objects of equal mass and volume. They are heated to the same temperature and then placed in a vessel containing solid wax. The specific heat capacity of A, B and C are 380J/kg°C, 470 J/kg°C and 910J/kg°C respectively. Based on this information, answer the following questions: (a) Which metal has the highest amount of heat energy? (b) Which metal goes the deepest into the wax vessel? (c) Which metal cools down the fastest? (d) Which metal has the highest amount of heat lose?",
    marks: 4,
  },
  {
    id: "21",
    nepali:
      "कन्केभ लेन्स र कन्भेक्स लेन्सका बिचमा दुईओटा फरक लेख्नुहोस्। एक जना विद्यार्थीले लगाएको चश्मामा प्रयोग भएको लेन्सको सामर्थ्य -6D छ। उक्त लेन्सको केन्द्रीकरण दूरी हिसाब गर्नुहोस्। लेन्सको किसिम पनि उल्लेख गर्नुहोस्।",
    english:
      "Write two differences between concave and convex lens. The power of the lens used in the spectacles worn by a student is -6D. Calculate the focal length of the lens. Also, mention the type of lens.",
    marks: 4,
  },
  {
    id: "22",
    nepali:
      "दिइएको तत्वहरू X र Y को इलेक्ट्रोन विन्यास अध्ययन गरी दिएका प्रश्नहरूको उत्तर लेख्नुहोस्। X: 1s², 2s²2p⁶, 3s²3p⁶, 4s² Y: 1s², 2s²2p⁶, 3s²3p⁵ (a) दिइएका मध्ये कुन चाहिँ धातु हो? (b) Y तत्वको पिरियड लेख्नुहोस्। (c) X र Y को संयोजनद्वारा बन्ने यौगिकको सन्तुलित रासायनिक समीकरण लेख्नुहोस्।",
    english:
      "Study the electronic configuration of two elements X and Y and answer the given questions. X: 1s², 2s²2p⁶, 3s²3p⁶, 4s² Y: 1s², 2s²2p⁶, 3s²3p⁵ (a) Which one is metal? (b) Write period of the element Y. (c) Write balanced chemical equation of the compound formed by combination of X and Y.",
    marks: 4,
  },
  {
    id: "23",
    nepali:
      "दिइएको चित्र अध्ययन गरी निम्न प्रश्नको उत्तर दिनुहोस्। (a) ग्यास जारमा कुन ग्यास जम्मा भइरहेको छ? (b) चित्रमा A र B के के हुन्? (c) कस्तो रङ्गको लिटमस पेपरको प्रयोगबाट उक्त ग्यास पहिचान गर्न सकिन्छ?",
    english:
      "Study the given diagram and answer the following questions: (a) Which gas is being collected in gas Jar? (b) What are A & B in the figure? (c) What coloured litmus paper is used to identify such gas?",
    marks: 4,
  },
]

// Optional local static questions (kept for reference/demo).
// The app loads questions from MongoDB via /api/questions/[testId].
