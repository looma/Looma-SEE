import json
import os

# Directory containing the files
DATA_DIR = r"C:\Users\porte\Desktop\Looma-SEE\nepali-exam-helper\app-code\data\New test backups"

# Translation Map
# Key: A unique substring from the English passage to identify it.
# Value: The full Nepali translation.
TRANSLATIONS = {
    "Once upon a time, there lived (a)": "एकादेशमा, एउटा गाउँमा (क) _____ (a/an/the/no article) इमानदार किसान बस्थे। उनी (ख) _____ (is/was/are/were) धेरै गरिब थिए, तर उनले कहिल्यै गुनासो गरेनन्। उनी हरेक दिन आफ्नो खेतमा कडा परिश्रम गर्थे। एक दिन, जब उनी खेतमा (ग) _____ (worked/was working/had worked/has worked), उनले सुनको भाँडो फेला पारे। उनी धेरै इमानदार मानिस थिए, (घ) _____ (was he/wasn't he/is he/isn't he)? गरिब (ङ) _____ (Although/Because/So/In spite of) पनि, उनले त्यो भाँडो राजाकहाँ लैजाने निर्णय गरे। राजाले उनलाई (च) _____ (how he find/how did he find/how he found/how had he found) भनेर सोधे। किसानले सबै कुरा बताए। राजा उनको इमानदारी (छ) _____ (by/with/at/for) धेरै खुसी भए। सुनको भाँडो राजाद्वारा किसानलाई पुरस्कार स्वरूप (ज) _____ (was given/given/is given/had given)। यदि किसान लोभी भएको भए, उसले यति ठूलो पुरस्कार (झ) _____ (will not get/would not get/would not have gotten/had not gotten)। राजाले गाउँलेहरूलाई इमानदारीको महत्त्व (ञ) _____ (to understand/understand/understood/understanding) लगाए।",
    
    "Last week, I went to (a)": "गएको हप्ता, म गोर्खा दरबार भनिने (क) _____ (a/an/the/no article) ऐतिहासिक ठाउँमा गएँ। यो १६ औं शताब्दीमा (ख) _____ (is/was/has been/had been)। यो समृद्ध इतिहासको घर हो, (ग) _____ (is it/isn't it/was it/wasn't it)? म वास्तुकला देखेर चकित परें। गाइड, (घ) _____ (who/whom/which/whose) ज्ञान प्रभावशाली थियो, उनले हामीलाई धेरै कथाहरू सुनाए। यदि मलाई यसको सुन्दरताको बारेमा पहिले नै थाहा भएको भए, म धेरै पहिले नै (ङ) _____ (will visit/would visit/would have visited/had visited)। आगन्तुकहरूले प्राचीन कलाकृतिहरू छुन (च) _____ (must/can/may/might)। मैले गाइडलाई सोधें, \"(छ) _____ (Why this palace is important/Why is this palace important/Why was this palace important/Why the palace was important)?\" उनले बताए कि यो त्यो ठाउँ हो (ज) _____ (which/that/where/when) राजा पृथ्वीनारायण शाहले आफ्नो एकीकरण अभियान सुरु गरेका थिए। स्थानीय मानिसहरूले आगन्तुकहरूलाई धेरै स्वागत (झ) _____ (feel/to feel/felt/feeling) गराउँछन्। उकालो ठाडो (ञ) _____ (Therefore/However/Although/Because) पनि, माथिबाट देखिने दृश्य हेर्न लायक थियो।",

    "Chitwan National Park is one of the most popular": "चितवन राष्ट्रिय निकुञ्ज नेपालको समृद्ध जैविक विविधताका लागि परिचित सबैभन्दा लोकप्रिय पर्यटकीय गन्तव्यहरू मध्ये एक हो। यो (क) _____ (a/an/the/no article) युनेस्को विश्व सम्पदा क्षेत्र हो। निकुञ्ज सन् १९७३ मा (ख) _____ (is established/established/has been established/was established)। यो दुर्लभ प्रजातिका जनावर र चराचुरुङ्गीहरूको घर हो, (ग) _____ (isn't it/aren't they/hasn't it/haven't they)? नारायणी नदीमा (घ) _____ (at/by/on/in) नुहाइरहेका एक सिङ्गे गैंडाहरूको दृश्य देखेर आगन्तुकहरू अक्सर चकित पर्छन्। गाइडहरू (ङ) _____ (whom/which/who/whose) उच्च तालिम प्राप्त छन्, उनीहरूले आगन्तुकहरूलाई विस्तृत जानकारी प्रदान गर्छन्। पूर्ण अनुभव लिन चाहने आगन्तुकहरूले जङ्गल सफारी पहिले नै बुक (च) _____ (should/could/would/might)। यदि निकुञ्ज (छ) _____ (is not protected/was not protected/had not been protected/will not be protected) भने, यी प्रजातिहरू लोप हुन सक्छन्। निकुञ्ज अधिकारीहरूले निकुञ्जको सुरक्षा सुनिश्चित गर्न आगन्तुकहरूलाई कडा नियमहरू (ज) _____ (following/follow/to follow/followed) लगाउँछन्। पर्यटकहरू अक्सर सोध्छन्, \"(झ) _____ (Why is the Park famous/Why the park is famous/Why was the Park famous/Why the Park had been famous)?\" गाइडहरू बताउँछन् कि यो यसको प्राकृतिक सौन्दर्य र वन्यजन्तुको लागि प्रसिद्ध छ। आगन्तुकहरू जङ्गल सफारी र डुङ्गा सयर जस्ता गतिविधिहरूमा रमाइलो गर्छन्। (ञ) _____ (However/Therefore/Because/Although), उनीहरू अविष्मरणीय यादहरू लिएर फर्कन्छन्।",

    "There are many historical places in Nepal, (a)": "नेपालमा धेरै ऐतिहासिक ठाउँहरू छन्, (क) _____ (is there/isn't there/are there/aren't there)? भक्तपुर दरबार स्क्वायर ती मध्ये एक हो। यो सन् १९७९ मा विश्व सम्पदा क्षेत्रको रूपमा (ख) _____ (was listed/is listed/listed/had listed)। हरेक वर्ष धेरै पर्यटकहरू यो ठाउँ घुम्न आउँछन्। यदि म पर्यटक गाइड भएको भए, म (ग) _____ (will tell/would tell/would have told/had told) उनीहरूलाई यसको इतिहासबारे बताउने थिएँ। गाइडले भने कि दरबार १५ औं शताब्दीमा (घ) _____ (is/was/has been/had been)। उनले मलाई ५५ झ्याले दरबारको बारेमा (ङ) _____ (if I know/if I knew/do I know/did I know) सोधे। स्थानीय निकायले आगन्तुकहरूलाई निश्चित नियमहरू (च) _____ (to follow/follow/followed/following) लगाएको छ। सन् २०१५ को भूकम्प (छ) _____ (Despite/Although/Because of/Because) पनि, यो क्षेत्रले अझै पनि आफ्नो प्राचीन आकर्षण कायम राखेको छ। भूकम्पबाट धेरै भवनहरू (ज) _____ (were destroyed/destroyed/had destroyed/are destroyed)। सरकार क्षतिग्रस्त संरचनाहरू (झ) _____ (renovate/to renovate/renovating/renovated) कडा मेहनत गरिरहेको छ। मैले क्षेत्रको अन्वेषण गर्दै (ञ) _____ (a/an/the/no article) दिन बिताएँ।",

    "One evening in December I decided to see": "डिसेम्बरको एक साँझ मैले मेरी साथी रेणुकालाई (क) _____ (a/an/the/no article) भेट्ने निर्णय गरें। रेणुका (ख) _____ (whose/who/whom/which) सबैले कुख्यात महिला भन्थे, उनले आफ्नो २५ औं जन्मदिन मनाउने निर्णय गरिन्। उनले आफ्ना साथीभाइ र आफन्तहरूलाई पार्टीमा (ग) _____ (to/for/in/of) निम्तो दिइन्। मैले उनलाई भेटें र जन्मदिनको शुभकामना (घ) _____ (wished/to wish/wishing/wishes)। उनी खुसी थिइनन् (ङ) _____ (although/because/in spite of/otherwise) त्यो अविस्मरणीय पल। अचानक, एक महिला प्रहरी अधिकृत देखा परिन्। उनले रेणुकालाई उनको लापरवाह ड्राइभिङका कारण मन्त्रीको कार बिगारेको मुद्दा (च) _____ (accepts/accepted/accept/accepting) लगाइन्। उनलाई प्रहरी चौकीमा (छ) _____ (takes/was being taken/was taken/had taken)। प्रहरी चौकीमा, प्रहरी नायब उपरीक्षकले भने, \"रेणुकाले आफूले गरेको क्षतिको क्षतिपूर्ति (ज) _____ (May/must/can/will) तिर्नुपर्छ।\" यदि रेणुकाले आफ्नो मोटरसाइकल होसियारपूर्वक चलाएको भए, उनले दुर्घटना (झ) _____ (will not cause/would not cause/would not have caused/would not have been casued)। अन्ततः, उनले (ञ) _____ (bad/as bad as/worse/worst) सजाय पाइन्।"
}

def process_object(obj):
    if isinstance(obj, dict):
        # check if it's question 10
        if obj.get("questionNumberEnglish") == 10 and "passageEnglish" in obj:
            english_passage = obj["passageEnglish"]
            matched_translation = None
            
            # Find matching translation
            for key, translation in TRANSLATIONS.items():
                if key in english_passage:
                    matched_translation = translation
                    break
            
            if matched_translation:
                obj["passageNepali"] = matched_translation
                # We don't need to rebuild the object, just update in place
                return obj
            else:
                print(f"WARNING: No translation found for passage starting with: {english_passage[:50]}...")
                return obj 
                
        # Recursive step for other dicts
        for k, v in obj.items():
            obj[k] = process_object(v)
        return obj
    
    elif isinstance(obj, list):
        return [process_object(item) for item in obj]
    else:
        return obj

def main():
    for i in range(1, 6):
        filename = f"see_2081_english_practice_{i}_generated.json"
        filepath = os.path.join(DATA_DIR, filename)
        
        if not os.path.exists(filepath):
            print(f"File not found: {filepath}")
            continue
            
        print(f"Processing {filename}...")
        
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        new_data = process_object(data)
        
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(new_data, f, indent=2, ensure_ascii=False)
            
        print(f"Finished {filename}")

if __name__ == "__main__":
    main()
