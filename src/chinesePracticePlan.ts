export type ChinesePracticeWord = {
  id: string;
  hanzi: string;
  pinyin: string;
  meaning: string;
  hsk: number;
  tags: string[];
};

export type ChinesePracticeDayWord = ChinesePracticeWord & {
  practiceId: string;
  slot: number;
  cycle: number;
};

export type ChinesePracticeReviewAnchor = {
  day: number;
  label: string;
  offset: number;
};

export type ChinesePracticeDay = {
  day: number;
  phase: number;
  phaseTitle: string;
  focus: string;
  wordsPerDay: number;
  cumulativeWordSlots: number;
  words: ChinesePracticeDayWord[];
  reviewAnchors: ChinesePracticeReviewAnchor[];
};

export const CHINESE_PRACTICE_TOTAL_DAYS = 500;
export const CHINESE_PRACTICE_PHASE_LENGTH = 50;
export const CHINESE_PRACTICE_INCREMENT = 5;

export const chinesePracticePhases = [
  { phase: 1, days: "001-050", wordsPerDay: 5, title: "Sound Foundation", focus: "tones, greetings, pronouns, core verbs" },
  { phase: 2, days: "051-100", wordsPerDay: 10, title: "Survival Speech", focus: "questions, family, time, food, location" },
  { phase: 3, days: "101-150", wordsPerDay: 15, title: "Sentence Engine", focus: "word order, aspect, measure words, daily actions" },
  { phase: 4, days: "151-200", wordsPerDay: 20, title: "HSK Expansion", focus: "high-frequency verbs, adjectives, connectors" },
  { phase: 5, days: "201-250", wordsPerDay: 25, title: "Reading Grid", focus: "radicals, compounds, school and work vocabulary" },
  { phase: 6, days: "251-300", wordsPerDay: 30, title: "Conversation Load", focus: "opinions, plans, comparisons, short responses" },
  { phase: 7, days: "301-350", wordsPerDay: 35, title: "Topic Control", focus: "health, travel, technology, money, emotions" },
  { phase: 8, days: "351-400", wordsPerDay: 40, title: "Native Patterning", focus: "collocations, complements, result/direction patterns" },
  { phase: 9, days: "401-450", wordsPerDay: 45, title: "Long Memory", focus: "abstract words, formal phrasing, idiom families" },
  { phase: 10, days: "451-500", wordsPerDay: 50, title: "Output Density", focus: "production review, mixed HSK, speed recall" },
];

export const chinesePracticeVocabularyBank: ChinesePracticeWord[] = [
  { id: "wo", hanzi: "我", pinyin: "wǒ", meaning: "I; me", hsk: 1, tags: ["pronoun", "core"] },
  { id: "ni", hanzi: "你", pinyin: "nǐ", meaning: "you", hsk: 1, tags: ["pronoun", "core"] },
  { id: "ta-he", hanzi: "他", pinyin: "tā", meaning: "he; him", hsk: 1, tags: ["pronoun"] },
  { id: "ta-she", hanzi: "她", pinyin: "tā", meaning: "she; her", hsk: 1, tags: ["pronoun"] },
  { id: "women", hanzi: "我们", pinyin: "wǒ men", meaning: "we; us", hsk: 1, tags: ["pronoun"] },
  { id: "nimen", hanzi: "你们", pinyin: "nǐ men", meaning: "you plural", hsk: 1, tags: ["pronoun"] },
  { id: "shi", hanzi: "是", pinyin: "shì", meaning: "to be; yes", hsk: 1, tags: ["verb", "core"] },
  { id: "bu", hanzi: "不", pinyin: "bù", meaning: "not; no", hsk: 1, tags: ["grammar", "core"] },
  { id: "ma-question", hanzi: "吗", pinyin: "ma", meaning: "question particle", hsk: 1, tags: ["grammar", "question"] },
  { id: "de", hanzi: "的", pinyin: "de", meaning: "possessive particle", hsk: 1, tags: ["grammar", "core"] },
  { id: "hen", hanzi: "很", pinyin: "hěn", meaning: "very", hsk: 1, tags: ["adverb"] },
  { id: "hao", hanzi: "好", pinyin: "hǎo", meaning: "good; well", hsk: 1, tags: ["adjective", "core"] },
  { id: "nihao", hanzi: "你好", pinyin: "nǐ hǎo", meaning: "hello", hsk: 1, tags: ["phrase"] },
  { id: "zaijian", hanzi: "再见", pinyin: "zài jiàn", meaning: "goodbye", hsk: 1, tags: ["phrase"] },
  { id: "xiexie", hanzi: "谢谢", pinyin: "xiè xie", meaning: "thank you", hsk: 1, tags: ["phrase"] },
  { id: "bu-keqi", hanzi: "不客气", pinyin: "bú kè qi", meaning: "you are welcome", hsk: 1, tags: ["phrase"] },
  { id: "duibuqi", hanzi: "对不起", pinyin: "duì bu qǐ", meaning: "sorry", hsk: 1, tags: ["phrase"] },
  { id: "mei-guanxi", hanzi: "没关系", pinyin: "méi guān xi", meaning: "it does not matter", hsk: 1, tags: ["phrase"] },
  { id: "qing", hanzi: "请", pinyin: "qǐng", meaning: "please; invite", hsk: 1, tags: ["verb", "polite"] },
  { id: "wen", hanzi: "问", pinyin: "wèn", meaning: "to ask", hsk: 1, tags: ["verb"] },
  { id: "shuo", hanzi: "说", pinyin: "shuō", meaning: "to speak; say", hsk: 1, tags: ["verb"] },
  { id: "ting", hanzi: "听", pinyin: "tīng", meaning: "to listen", hsk: 1, tags: ["verb"] },
  { id: "kan", hanzi: "看", pinyin: "kàn", meaning: "to look; read", hsk: 1, tags: ["verb"] },
  { id: "du", hanzi: "读", pinyin: "dú", meaning: "to read aloud", hsk: 1, tags: ["verb", "study"] },
  { id: "xie", hanzi: "写", pinyin: "xiě", meaning: "to write", hsk: 1, tags: ["verb", "study"] },
  { id: "xuexi", hanzi: "学习", pinyin: "xué xí", meaning: "to study", hsk: 1, tags: ["verb", "study"] },
  { id: "xuesheng", hanzi: "学生", pinyin: "xué sheng", meaning: "student", hsk: 1, tags: ["school"] },
  { id: "laoshi", hanzi: "老师", pinyin: "lǎo shī", meaning: "teacher", hsk: 1, tags: ["school"] },
  { id: "xuexiao", hanzi: "学校", pinyin: "xué xiào", meaning: "school", hsk: 1, tags: ["school"] },
  { id: "zhongwen", hanzi: "中文", pinyin: "zhōng wén", meaning: "Chinese language", hsk: 1, tags: ["language"] },
  { id: "hanyu", hanzi: "汉语", pinyin: "hàn yǔ", meaning: "Mandarin Chinese", hsk: 2, tags: ["language"] },
  { id: "yingyu", hanzi: "英语", pinyin: "yīng yǔ", meaning: "English", hsk: 1, tags: ["language"] },
  { id: "mingzi", hanzi: "名字", pinyin: "míng zi", meaning: "name", hsk: 1, tags: ["identity"] },
  { id: "ren", hanzi: "人", pinyin: "rén", meaning: "person", hsk: 1, tags: ["noun"] },
  { id: "pengyou", hanzi: "朋友", pinyin: "péng you", meaning: "friend", hsk: 1, tags: ["people"] },
  { id: "baba", hanzi: "爸爸", pinyin: "bà ba", meaning: "father", hsk: 1, tags: ["family"] },
  { id: "mama", hanzi: "妈妈", pinyin: "mā ma", meaning: "mother", hsk: 1, tags: ["family"] },
  { id: "gege", hanzi: "哥哥", pinyin: "gē ge", meaning: "older brother", hsk: 1, tags: ["family"] },
  { id: "jiejie", hanzi: "姐姐", pinyin: "jiě jie", meaning: "older sister", hsk: 1, tags: ["family"] },
  { id: "jia", hanzi: "家", pinyin: "jiā", meaning: "home; family", hsk: 1, tags: ["family", "place"] },
  { id: "ai", hanzi: "爱", pinyin: "ài", meaning: "to love", hsk: 1, tags: ["verb", "emotion"] },
  { id: "xiang", hanzi: "想", pinyin: "xiǎng", meaning: "to think; want", hsk: 1, tags: ["verb"] },
  { id: "yao", hanzi: "要", pinyin: "yào", meaning: "to want; need", hsk: 1, tags: ["verb"] },
  { id: "you-have", hanzi: "有", pinyin: "yǒu", meaning: "to have; there is", hsk: 1, tags: ["verb"] },
  { id: "mei-you", hanzi: "没有", pinyin: "méi yǒu", meaning: "do not have; there is not", hsk: 1, tags: ["verb", "negation"] },
  { id: "zai", hanzi: "在", pinyin: "zài", meaning: "at; in; doing now", hsk: 1, tags: ["grammar", "location"] },
  { id: "qu", hanzi: "去", pinyin: "qù", meaning: "to go", hsk: 1, tags: ["verb", "movement"] },
  { id: "lai", hanzi: "来", pinyin: "lái", meaning: "to come", hsk: 1, tags: ["verb", "movement"] },
  { id: "hui", hanzi: "会", pinyin: "huì", meaning: "can; will; meeting", hsk: 1, tags: ["modal"] },
  { id: "neng", hanzi: "能", pinyin: "néng", meaning: "can; able", hsk: 2, tags: ["modal"] },
  { id: "keyi", hanzi: "可以", pinyin: "kě yǐ", meaning: "may; can", hsk: 2, tags: ["modal"] },
  { id: "chi", hanzi: "吃", pinyin: "chī", meaning: "to eat", hsk: 1, tags: ["verb", "food"] },
  { id: "he", hanzi: "喝", pinyin: "hē", meaning: "to drink", hsk: 1, tags: ["verb", "food"] },
  { id: "shui", hanzi: "水", pinyin: "shuǐ", meaning: "water", hsk: 1, tags: ["food"] },
  { id: "cha", hanzi: "茶", pinyin: "chá", meaning: "tea", hsk: 1, tags: ["food"] },
  { id: "kafei", hanzi: "咖啡", pinyin: "kā fēi", meaning: "coffee", hsk: 1, tags: ["food"] },
  { id: "fan", hanzi: "饭", pinyin: "fàn", meaning: "rice; meal", hsk: 1, tags: ["food"] },
  { id: "mianbao", hanzi: "面包", pinyin: "miàn bāo", meaning: "bread", hsk: 2, tags: ["food"] },
  { id: "shuiguo", hanzi: "水果", pinyin: "shuǐ guǒ", meaning: "fruit", hsk: 1, tags: ["food"] },
  { id: "pingguo", hanzi: "苹果", pinyin: "píng guǒ", meaning: "apple", hsk: 1, tags: ["food"] },
  { id: "cai", hanzi: "菜", pinyin: "cài", meaning: "dish; vegetable", hsk: 1, tags: ["food"] },
  { id: "qian", hanzi: "钱", pinyin: "qián", meaning: "money", hsk: 1, tags: ["money"] },
  { id: "kuai", hanzi: "块", pinyin: "kuài", meaning: "yuan; piece", hsk: 1, tags: ["money", "measure"] },
  { id: "mai-buy", hanzi: "买", pinyin: "mǎi", meaning: "to buy", hsk: 1, tags: ["verb", "shopping"] },
  { id: "mai-sell", hanzi: "卖", pinyin: "mài", meaning: "to sell", hsk: 2, tags: ["verb", "shopping"] },
  { id: "duoshao", hanzi: "多少", pinyin: "duō shao", meaning: "how many; how much", hsk: 1, tags: ["question"] },
  { id: "ji-howmany", hanzi: "几", pinyin: "jǐ", meaning: "how many; several", hsk: 1, tags: ["question"] },
  { id: "shenme", hanzi: "什么", pinyin: "shén me", meaning: "what", hsk: 1, tags: ["question"] },
  { id: "shei", hanzi: "谁", pinyin: "shéi", meaning: "who", hsk: 1, tags: ["question"] },
  { id: "nali", hanzi: "哪里", pinyin: "nǎ lǐ", meaning: "where", hsk: 1, tags: ["question"] },
  { id: "weishenme", hanzi: "为什么", pinyin: "wèi shén me", meaning: "why", hsk: 2, tags: ["question"] },
  { id: "zenme", hanzi: "怎么", pinyin: "zěn me", meaning: "how", hsk: 2, tags: ["question"] },
  { id: "jintian", hanzi: "今天", pinyin: "jīn tiān", meaning: "today", hsk: 1, tags: ["time"] },
  { id: "mingtian", hanzi: "明天", pinyin: "míng tiān", meaning: "tomorrow", hsk: 1, tags: ["time"] },
  { id: "zuotian", hanzi: "昨天", pinyin: "zuó tiān", meaning: "yesterday", hsk: 1, tags: ["time"] },
  { id: "xianzai", hanzi: "现在", pinyin: "xiàn zài", meaning: "now", hsk: 1, tags: ["time"] },
  { id: "nian", hanzi: "年", pinyin: "nián", meaning: "year", hsk: 1, tags: ["time"] },
  { id: "yue", hanzi: "月", pinyin: "yuè", meaning: "month; moon", hsk: 1, tags: ["time"] },
  { id: "ri", hanzi: "日", pinyin: "rì", meaning: "day; date", hsk: 1, tags: ["time"] },
  { id: "hao-date", hanzi: "号", pinyin: "hào", meaning: "date number; number", hsk: 1, tags: ["time"] },
  { id: "xingqi", hanzi: "星期", pinyin: "xīng qī", meaning: "week", hsk: 1, tags: ["time"] },
  { id: "dian", hanzi: "点", pinyin: "diǎn", meaning: "o'clock; point", hsk: 1, tags: ["time"] },
  { id: "fenzhong", hanzi: "分钟", pinyin: "fēn zhōng", meaning: "minute", hsk: 2, tags: ["time"] },
  { id: "yi", hanzi: "一", pinyin: "yī", meaning: "one", hsk: 1, tags: ["number"] },
  { id: "er", hanzi: "二", pinyin: "èr", meaning: "two", hsk: 1, tags: ["number"] },
  { id: "san", hanzi: "三", pinyin: "sān", meaning: "three", hsk: 1, tags: ["number"] },
  { id: "si", hanzi: "四", pinyin: "sì", meaning: "four", hsk: 1, tags: ["number"] },
  { id: "wu", hanzi: "五", pinyin: "wǔ", meaning: "five", hsk: 1, tags: ["number"] },
  { id: "liu", hanzi: "六", pinyin: "liù", meaning: "six", hsk: 1, tags: ["number"] },
  { id: "qi", hanzi: "七", pinyin: "qī", meaning: "seven", hsk: 1, tags: ["number"] },
  { id: "ba", hanzi: "八", pinyin: "bā", meaning: "eight", hsk: 1, tags: ["number"] },
  { id: "jiu", hanzi: "九", pinyin: "jiǔ", meaning: "nine", hsk: 1, tags: ["number"] },
  { id: "shi-ten", hanzi: "十", pinyin: "shí", meaning: "ten", hsk: 1, tags: ["number"] },
  { id: "ling", hanzi: "零", pinyin: "líng", meaning: "zero", hsk: 1, tags: ["number"] },
  { id: "ge", hanzi: "个", pinyin: "gè", meaning: "general measure word", hsk: 1, tags: ["measure"] },
  { id: "ben", hanzi: "本", pinyin: "běn", meaning: "measure for books; root", hsk: 1, tags: ["measure", "school"] },
  { id: "sui", hanzi: "岁", pinyin: "suì", meaning: "years old", hsk: 1, tags: ["time", "identity"] },
  { id: "da", hanzi: "大", pinyin: "dà", meaning: "big; large", hsk: 1, tags: ["adjective"] },
  { id: "xiao", hanzi: "小", pinyin: "xiǎo", meaning: "small", hsk: 1, tags: ["adjective"] },
  { id: "duo", hanzi: "多", pinyin: "duō", meaning: "many; much", hsk: 1, tags: ["adjective"] },
  { id: "shao", hanzi: "少", pinyin: "shǎo", meaning: "few; little", hsk: 1, tags: ["adjective"] },
  { id: "leng", hanzi: "冷", pinyin: "lěng", meaning: "cold", hsk: 1, tags: ["adjective", "weather"] },
  { id: "re", hanzi: "热", pinyin: "rè", meaning: "hot", hsk: 1, tags: ["adjective", "weather"] },
  { id: "mang", hanzi: "忙", pinyin: "máng", meaning: "busy", hsk: 1, tags: ["adjective"] },
  { id: "gao", hanzi: "高", pinyin: "gāo", meaning: "tall; high", hsk: 2, tags: ["adjective"] },
  { id: "kuai-fast", hanzi: "快", pinyin: "kuài", meaning: "fast; happy soon", hsk: 1, tags: ["adjective"] },
  { id: "man", hanzi: "慢", pinyin: "màn", meaning: "slow", hsk: 2, tags: ["adjective"] },
  { id: "xin", hanzi: "新", pinyin: "xīn", meaning: "new", hsk: 2, tags: ["adjective"] },
  { id: "jiu-old", hanzi: "旧", pinyin: "jiù", meaning: "old; used", hsk: 3, tags: ["adjective"] },
  { id: "gaoxing", hanzi: "高兴", pinyin: "gāo xìng", meaning: "happy", hsk: 1, tags: ["emotion"] },
  { id: "xihuan", hanzi: "喜欢", pinyin: "xǐ huan", meaning: "to like", hsk: 1, tags: ["emotion", "verb"] },
  { id: "renshi", hanzi: "认识", pinyin: "rèn shi", meaning: "to know; recognize", hsk: 1, tags: ["verb"] },
  { id: "zhidao", hanzi: "知道", pinyin: "zhī dào", meaning: "to know", hsk: 1, tags: ["verb"] },
  { id: "jiao", hanzi: "叫", pinyin: "jiào", meaning: "to be called; call", hsk: 1, tags: ["verb"] },
  { id: "gongzuo", hanzi: "工作", pinyin: "gōng zuò", meaning: "work; job", hsk: 1, tags: ["work"] },
  { id: "yisheng", hanzi: "医生", pinyin: "yī shēng", meaning: "doctor", hsk: 1, tags: ["work", "health"] },
  { id: "yiyuan", hanzi: "医院", pinyin: "yī yuàn", meaning: "hospital", hsk: 1, tags: ["place", "health"] },
  { id: "shangdian", hanzi: "商店", pinyin: "shāng diàn", meaning: "store", hsk: 1, tags: ["place"] },
  { id: "fanguan", hanzi: "饭馆", pinyin: "fàn guǎn", meaning: "restaurant", hsk: 1, tags: ["place", "food"] },
  { id: "gongyuan", hanzi: "公园", pinyin: "gōng yuán", meaning: "park", hsk: 1, tags: ["place"] },
  { id: "ji", hanzi: "机场", pinyin: "jī chǎng", meaning: "airport", hsk: 2, tags: ["place", "travel"] },
  { id: "chezhan", hanzi: "车站", pinyin: "chē zhàn", meaning: "station", hsk: 2, tags: ["place", "travel"] },
  { id: "qiche", hanzi: "汽车", pinyin: "qì chē", meaning: "car", hsk: 1, tags: ["travel"] },
  { id: "chuzuche", hanzi: "出租车", pinyin: "chū zū chē", meaning: "taxi", hsk: 1, tags: ["travel"] },
  { id: "feiji", hanzi: "飞机", pinyin: "fēi jī", meaning: "airplane", hsk: 1, tags: ["travel"] },
  { id: "piao", hanzi: "票", pinyin: "piào", meaning: "ticket", hsk: 2, tags: ["travel"] },
  { id: "luyou", hanzi: "旅游", pinyin: "lǚ yóu", meaning: "travel", hsk: 2, tags: ["travel"] },
  { id: "tianqi", hanzi: "天气", pinyin: "tiān qì", meaning: "weather", hsk: 1, tags: ["weather"] },
  { id: "xiayu", hanzi: "下雨", pinyin: "xià yǔ", meaning: "to rain", hsk: 1, tags: ["weather"] },
  { id: "shuijiao", hanzi: "睡觉", pinyin: "shuì jiào", meaning: "to sleep", hsk: 1, tags: ["daily"] },
  { id: "qichuang", hanzi: "起床", pinyin: "qǐ chuáng", meaning: "to get up", hsk: 2, tags: ["daily"] },
  { id: "paobu", hanzi: "跑步", pinyin: "pǎo bù", meaning: "to run", hsk: 2, tags: ["health"] },
  { id: "yundong", hanzi: "运动", pinyin: "yùn dòng", meaning: "exercise; sport", hsk: 2, tags: ["health"] },
  { id: "shenti", hanzi: "身体", pinyin: "shēn tǐ", meaning: "body; health", hsk: 2, tags: ["health"] },
  { id: "yao-medicine", hanzi: "药", pinyin: "yào", meaning: "medicine", hsk: 2, tags: ["health"] },
  { id: "shouji", hanzi: "手机", pinyin: "shǒu jī", meaning: "mobile phone", hsk: 2, tags: ["technology"] },
  { id: "diannao", hanzi: "电脑", pinyin: "diàn nǎo", meaning: "computer", hsk: 1, tags: ["technology"] },
  { id: "wangluo", hanzi: "网络", pinyin: "wǎng luò", meaning: "network; internet", hsk: 4, tags: ["technology"] },
  { id: "youjian", hanzi: "邮件", pinyin: "yóu jiàn", meaning: "email; mail", hsk: 3, tags: ["technology"] },
  { id: "zhaopian", hanzi: "照片", pinyin: "zhào piàn", meaning: "photo", hsk: 2, tags: ["technology"] },
  { id: "dianhua", hanzi: "电话", pinyin: "diàn huà", meaning: "phone", hsk: 1, tags: ["technology"] },
  { id: "dianying", hanzi: "电影", pinyin: "diàn yǐng", meaning: "movie", hsk: 1, tags: ["media"] },
  { id: "yinyue", hanzi: "音乐", pinyin: "yīn yuè", meaning: "music", hsk: 1, tags: ["media"] },
  { id: "shu", hanzi: "书", pinyin: "shū", meaning: "book", hsk: 1, tags: ["study"] },
  { id: "baozhi", hanzi: "报纸", pinyin: "bào zhǐ", meaning: "newspaper", hsk: 2, tags: ["media"] },
  { id: "kewen", hanzi: "课文", pinyin: "kè wén", meaning: "lesson text", hsk: 2, tags: ["study"] },
  { id: "kaoshi", hanzi: "考试", pinyin: "kǎo shì", meaning: "exam", hsk: 2, tags: ["study"] },
  { id: "wenti", hanzi: "问题", pinyin: "wèn tí", meaning: "question; problem", hsk: 2, tags: ["study"] },
  { id: "daan", hanzi: "答案", pinyin: "dá àn", meaning: "answer", hsk: 3, tags: ["study"] },
  { id: "bangzhu", hanzi: "帮助", pinyin: "bāng zhù", meaning: "to help; help", hsk: 2, tags: ["verb"] },
  { id: "kaishi", hanzi: "开始", pinyin: "kāi shǐ", meaning: "to start", hsk: 2, tags: ["verb"] },
  { id: "jieshu", hanzi: "结束", pinyin: "jié shù", meaning: "to finish", hsk: 3, tags: ["verb"] },
  { id: "wan-cheng", hanzi: "完成", pinyin: "wán chéng", meaning: "to complete", hsk: 3, tags: ["verb"] },
  { id: "jihua", hanzi: "计划", pinyin: "jì huà", meaning: "plan", hsk: 3, tags: ["planning"] },
  { id: "mubiao", hanzi: "目标", pinyin: "mù biāo", meaning: "goal; target", hsk: 4, tags: ["planning"] },
  { id: "renwu", hanzi: "任务", pinyin: "rèn wu", meaning: "task; mission", hsk: 4, tags: ["planning"] },
  { id: "jinbu", hanzi: "进步", pinyin: "jìn bù", meaning: "progress", hsk: 3, tags: ["planning"] },
  { id: "jianchi", hanzi: "坚持", pinyin: "jiān chí", meaning: "to persist", hsk: 4, tags: ["discipline"] },
  { id: "nuli", hanzi: "努力", pinyin: "nǔ lì", meaning: "to work hard", hsk: 3, tags: ["discipline"] },
  { id: "lianxi", hanzi: "练习", pinyin: "liàn xí", meaning: "practice", hsk: 2, tags: ["study"] },
  { id: "fuxi", hanzi: "复习", pinyin: "fù xí", meaning: "to review", hsk: 3, tags: ["study"] },
  { id: "jiyi", hanzi: "记忆", pinyin: "jì yì", meaning: "memory", hsk: 4, tags: ["study"] },
  { id: "fangfa", hanzi: "方法", pinyin: "fāng fǎ", meaning: "method", hsk: 3, tags: ["study"] },
];

export function getChinesePracticeQuota(day: number) {
  const safeDay = Math.min(Math.max(Math.trunc(day), 1), CHINESE_PRACTICE_TOTAL_DAYS);
  return Math.ceil(safeDay / CHINESE_PRACTICE_PHASE_LENGTH) * CHINESE_PRACTICE_INCREMENT;
}

export function getChinesePracticePhase(day: number) {
  const safeDay = Math.min(Math.max(Math.trunc(day), 1), CHINESE_PRACTICE_TOTAL_DAYS);
  return Math.ceil(safeDay / CHINESE_PRACTICE_PHASE_LENGTH);
}

export function getChinesePracticeSlotsBeforeDay(day: number) {
  const safeDay = Math.min(Math.max(Math.trunc(day), 1), CHINESE_PRACTICE_TOTAL_DAYS + 1);
  let total = 0;
  for (let currentDay = 1; currentDay < safeDay; currentDay += 1) {
    total += getChinesePracticeQuota(currentDay);
  }
  return total;
}

function buildChinesePracticeWords(day: number) {
  const quota = getChinesePracticeQuota(day);
  const slotsBeforeDay = getChinesePracticeSlotsBeforeDay(day);
  return Array.from({ length: quota }, (_, index) => {
    const absoluteSlot = slotsBeforeDay + index;
    const source = chinesePracticeVocabularyBank[absoluteSlot % chinesePracticeVocabularyBank.length];
    return {
      ...source,
      practiceId: `D${String(day).padStart(3, "0")}-W${String(index + 1).padStart(2, "0")}`,
      slot: index + 1,
      cycle: Math.floor(absoluteSlot / chinesePracticeVocabularyBank.length) + 1,
    };
  });
}

function buildReviewAnchors(day: number): ChinesePracticeReviewAnchor[] {
  return [1, 3, 7, 14, 30]
    .filter((offset) => day - offset >= 1)
    .map((offset) => ({
      day: day - offset,
      label: `D-${offset}`,
      offset,
    }));
}

function buildChinesePracticeDay(day: number): ChinesePracticeDay {
  const phase = getChinesePracticePhase(day);
  const phaseInfo = chinesePracticePhases[phase - 1];
  return {
    day,
    phase,
    phaseTitle: phaseInfo.title,
    focus: phaseInfo.focus,
    wordsPerDay: getChinesePracticeQuota(day),
    cumulativeWordSlots: getChinesePracticeSlotsBeforeDay(day + 1),
    words: buildChinesePracticeWords(day),
    reviewAnchors: buildReviewAnchors(day),
  };
}

export const chinesePracticeDatabase = Array.from({ length: CHINESE_PRACTICE_TOTAL_DAYS }, (_, index) =>
  buildChinesePracticeDay(index + 1),
);

export const chinesePracticeSummary = {
  totalDays: CHINESE_PRACTICE_TOTAL_DAYS,
  phaseLength: CHINESE_PRACTICE_PHASE_LENGTH,
  totalWordSlots: chinesePracticeDatabase.reduce((total, day) => total + day.wordsPerDay, 0),
  vocabularyBankSize: chinesePracticeVocabularyBank.length,
};

export const chinesePracticeWordIndex = chinesePracticeVocabularyBank.reduce<Record<string, ChinesePracticeWord>>((index, word) => {
  index[word.hanzi] = word;
  return index;
}, {});

export function getChinesePracticeDay(day: number) {
  const safeDay = Math.min(Math.max(Math.trunc(day), 1), CHINESE_PRACTICE_TOTAL_DAYS);
  return chinesePracticeDatabase[safeDay - 1];
}
