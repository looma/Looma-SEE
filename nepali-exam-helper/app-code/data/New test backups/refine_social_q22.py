import sys
import json
import os
import glob

# Set stdout to utf-8
sys.stdout.reconfigure(encoding='utf-8')

directory = r"c:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"

# Definition of the answers for each file
answers_data = {
    "see_2081_social_practice_1_generated.json": {
        "en": "1. Pashupati Area: Bagmati Province, Kathmandu. Holy Hindu pilgrimage site listed in World Heritage Sites.\n2. Koshi Tappu Wildlife Reserve: Koshi Province, Sunsari/Saptari/Udayapur. Famous for Wild Buffalo (Arna).\n3. Gandaki Province: Central Nepal. Province containing mountains like Annapurna and lakes like Phewa.\n4. Mahendra Highway: Longest highway of Nepal connecting Mechi (East) to Mahakali (West).",
        "ne": "१. पशुपति क्षेत्र: बागमती प्रदेश, काठमाडौँ । विश्व सम्पदा सूचीमा सूचीकृत पवित्र हिन्दु तीर्थस्थल ।\n२. कोशी टप्पु वन्यजन्तु आरक्ष: कोशी प्रदेश, सुनसरी/सप्तरी/उदयपुर । अर्ना (Wild Buffalo) का लागि प्रसिद्ध ।\n३. गण्डकी प्रदेश: मध्य नेपाल । अन्नपूर्ण, माछापुच्छ्रे जस्ता हिमाल र फेवा जस्ता तालहरू रहेको प्रदेश ।\n४. महेन्द्र राजमार्ग: नेपालको पूर्व मेचीदेखि पश्चिम महाकालीसम्म जोड्ने सबैभन्दा लामो राजमार्ग ।"
    },
    "see_2081_social_practice_2_generated.json": {
        "en": "1. Lumbini: Lumbini Province, Rupandehi. Birthplace of Lord Buddha and a World Heritage Site.\n2. Pushpalal (Mid-Hill) Highway: Mid-Hills (East to West). A National Pride Project connecting mid-hill districts.\n3. Bagmati Province: Central Nepal. The province where the capital city Kathmandu is located.\n4. Rara Lake: Karnali Province, Mugu. The largest lake of Nepal.",
        "ne": "१. लुम्बिनी: लुम्बिनी प्रदेश, रूपन्देही । भगवान् गौतम बुद्धको जन्मस्थल र विश्व सम्पदा क्षेत्र ।\n२. पुष्पलाल (मध्यपहाडी) राजमार्ग: मध्य पहाड (पूर्वदेखि पश्चिम) । मध्य पहाडी जिल्लाहरू जोड्ने राष्ट्रिय गौरवको आयोजना ।\n३. बागमती प्रदेश: मध्य नेपाल । देशको राजधानी सहर काठमाडौँ अवस्थित प्रदेश ।\n४. रारा ताल: कर्णाली प्रदेश, मुगु । नेपालको सबैभन्दा ठुलो ताल ।"
    },
    "see_2081_social_practice_3_generated.json": {
        "en": "1. Mt. Annapurna: Gandaki Province. The 10th highest peak in the world (8,091m).\n2. Koshi River: Koshi Province. The largest river of Nepal in terms of water volume.\n3. Lumbini Province: Western Nepal. A province with high potential for agriculture and industry, birthplace of Buddha.\n4. East-West Highway: The main highway connecting the eastern and western borders of Nepal through the Terai region.",
        "ne": "१. अन्नपूर्ण हिमाल: गण्डकी प्रदेश । विश्वको १०औँ अग्लो हिमाल (८,०९१ मि.) ।\n२. कोशी नदी: कोशी प्रदेश । जलराशिका आधारमा नेपालको सबैभन्दा ठुलो नदी ।\n३. लुम्बिनी प्रदेश: पश्चिमी नेपाल । कृषि र उद्योगको सम्भावना बोकेको तथा बुद्धको जन्मस्थल रहेको प्रदेश ।\n४. पूर्व-पश्चिम राजमार्ग: नेपालको तराई क्षेत्र हुँदै पूर्व मेचीदेखि पश्चिम महाकाली जोड्ने मुख्य राजमार्ग ।"
    },
    "see_2081_social_practice_4_generated.json": {
        "en": "1. Mount Everest (Sagarmatha): Koshi Province, Solukhumbu. The highest peak in the world (8848.86m).\n2. Karnali River: Karnali Province. The longest river of Nepal.\n3. Chitwan National Park: Bagmati Province, Chitwan. Nepal's first national park, famous for the One-horned Rhinoceros.\n4. Koshi Province: Eastern Nepal. The province containing the highest peak Everest and the largest river Koshi.",
        "ne": "१. माउन्ट एभरेस्ट (सगरमाथा): कोशी प्रदेश, सोलुखुम्बु । विश्वको सर्वोच्च शिखर (८८४८.८६ मिटर) ।\n२. कर्णाली नदी: कर्णाली प्रदेश । नेपालको सबैभन्दा लामो नदी ।\n३. चितवन राष्ट्रिय निकुञ्ज: बागमती प्रदेश, चितवन । एकसिङ्गे गैँडाका लागि प्रसिद्ध नेपालको पहिलो राष्ट्रिय निकुञ्ज ।\n४. कोशी प्रदेश: पूर्वी नेपाल । सगरमाथा हिमाल र कोशी नदी रहेको प्रदेश ।"
    },
    "see_2081_social_practice_5_generated.json": {
        "en": "1. Karnali Province: Western Nepal. The largest province by area, known for its remoteness and natural beauty.\n2. Phewa Lake: Gandaki Province, Pokhara. A famous tourist destination featuring the Tal Barahi Temple.\n3. Janakpurdham: Madhesh Province, Dhanusha. Birthplace of Goddess Sita and famous for the Janaki Temple.\n4. Sagarmatha National Park: Koshi Province, Solukhumbu. A World Heritage Site protecting the biodiversity of the Everest region.",
        "ne": "१. कर्णाली प्रदेश: पश्चिमी नेपाल । क्षेत्रफलको हिसाबले सबैभन्दा ठुलो तर दुर्गम र प्राकृतिक सुन्दरताले भरिपूर्ण प्रदेश ।\n२. फेवा ताल: गण्डकी प्रदेश, पोखरा । तालबाराही मन्दिर रहेको प्रसिद्ध पर्यटकीय गन्तव्य ।\n३. जनकपुरधाम: मधेश प्रदेश, धनुषा । सीताको जन्मस्थल र जानकी मन्दिरका लागि प्रसिद्ध धार्मिक स्थल ।\n४. सगरमाथा राष्ट्रिय निकुञ्ज: कोशी प्रदेश, सोलुखुम्बु । सगरमाथा क्षेत्रको जैविक विविधता संरक्षण गर्ने विश्व सम्पदा क्षेत्र ।"
    }
}

new_explanation_ne = "यो प्रश्नले विद्यार्थीको नेपालका महत्त्वपूर्ण स्थानहरूको अवस्थिति र विशेषतासम्बन्धी भौगोलिक ज्ञानको परीक्षण गर्दछ ।\nउद्धरण: एकाइ ६, पाठ ८।"
new_explanation_en = "This question tests the student's geographical knowledge about the location and characteristics of important places in Nepal.\nCitation: Unit 6, Lesson 8"

def refine_q22():
    pattern = os.path.join(directory, "see_2081_social_practice_*.json")
    files = glob.glob(pattern)
    
    print(f"Refining {len(files)} files...\n")
    
    for filepath in sorted(files):
        filename = os.path.basename(filepath)
        
        if filename not in answers_data:
            print(f"Skipping {filename} (no data defined)")
            continue
            
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            modified = False
            
            # Helper to process
            def process_question(q):
                if str(q.get('questionNumberEnglish')) == '22':
                    return True
                return False
                
            # Traverse
            if isinstance(data, list):
                for item in data:
                    if 'groups' in item:
                        for group in item['groups']:
                            questions = group.get('questions', [])
                            for idx, q in enumerate(questions):
                                if process_question(q):
                                    # Found Q22
                                    print(f"  - Found Q22 in {filename}")
                                    
                                    # 1. Flatten Structure
                                    if 'alternatives' in q:
                                        main_alt = None
                                        for alt in q['alternatives']:
                                            if alt.get('type') == 'main':
                                                main_alt = alt
                                                break
                                        
                                        if main_alt:
                                            q['questionNepali'] = main_alt.get('questionNepali')
                                            q['questionEnglish'] = main_alt.get('questionEnglish')
                                            del q['alternatives']
                                    
                                    # 2. Update Answers and Explanation
                                    q['answerEnglish'] = answers_data[filename]['en']
                                    q['answerNepali'] = answers_data[filename]['ne']
                                    q['explanationEnglish'] = new_explanation_en
                                    q['explanationNepali'] = new_explanation_ne
                                    
                                    # Ensure type is long_answer
                                    q['type'] = 'long_answer'
                                    
                                    modified = True
                                    break # Break inner questions loop
                            if modified: break # Break groups loop
                    if modified: break # Break items loop
            
            if modified:
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                print(f"Successfully saved {filename}")

        except Exception as e:
            print(f"[ERROR] {filename}: {e}")

if __name__ == "__main__":
    refine_q22()
