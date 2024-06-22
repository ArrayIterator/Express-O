import {strval} from "../helpers/DataType.js";

/**
 *
 * @type {{
 *     [code2: string] : {
 *         "name": string,
 *         "local": string,
 *         "1": string,
 *         "2": string,
 *         "2T": string,
 *         "2B": string,
 *         "3": string
 *     }
 * }} ISO_639
 */
const ISO_639 = {
    ab: {"name": "Abkhaz", "local": "Аҧсуа", "1": "ab", "2": "abk", "2T": "abk", "2B": "abk", "3": "abk"},
    aa: {"name": "Afar", "local": "Afaraf", "1": "aa", "2": "aar", "2T": "aar", "2B": "aar", "3": "aar"},
    af: {"name": "Afrikaans", "local": "Afrikaans", "1": "af", "2": "afr", "2T": "afr", "2B": "afr", "3": "afr"},
    ak: {"name": "Akan", "local": "Akan", "1": "ak", "2": "aka", "2T": "aka", "2B": "aka", "3": "aka"},
    sq: {"name": "Albanian", "local": "Shqip", "1": "sq", "2": "sqi", "2T": "sqi", "2B": "alb", "3": "sqi"},
    am: {"name": "Amharic", "local": "አማርኛ", "1": "am", "2": "amh", "2T": "amh", "2B": "amh", "3": "amh"},
    ar: {"name": "Arabic", "local": "العربية", "1": "ar", "2": "ara", "2T": "ara", "2B": "ara", "3": "ara"},
    an: {"name": "Aragonese", "local": "Aragonés", "1": "an", "2": "arg", "2T": "arg", "2B": "arg", "3": "arg"},
    hy: {"name": "Armenian", "local": "Հայերեն", "1": "hy", "2": "hye", "2T": "hye", "2B": "arm", "3": "hye"},
    as: {"name": "Assamese", "local": "অসমীয়া", "1": "as", "2": "asm", "2T": "asm", "2B": "asm", "3": "asm"},
    av: {"name": "Avaric", "local": "Авар", "1": "av", "2": "ava", "2T": "ava", "2B": "ava", "3": "ava"},
    ae: {"name": "Avestan", "local": "avesta", "1": "ae", "2": "ave", "2T": "ave", "2B": "ave", "3": "ave"},
    ay: {"name": "Aymara", "local": "Aymar", "1": "ay", "2": "aym", "2T": "aym", "2B": "aym", "3": "aym"},
    az: {"name": "Azerbaijani", "local": "Azərbaycanca", "1": "az", "2": "aze", "2T": "aze", "2B": "aze", "3": "aze"},
    bm: {"name": "Bambara", "local": "Bamanankan", "1": "bm", "2": "bam", "2T": "bam", "2B": "bam", "3": "bam"},
    ba: {"name": "Bashkir", "local": "Башҡортса", "1": "ba", "2": "bak", "2T": "bak", "2B": "bak", "3": "bak"},
    eu: {"name": "Basque", "local": "Euskara", "1": "eu", "2": "eus", "2T": "eus", "2B": "baq", "3": "eus"},
    be: {"name": "Belarusian", "local": "Беларуская", "1": "be", "2": "bel", "2T": "bel", "2B": "bel", "3": "bel"},
    bn: {"name": "Bengali", "local": "বাংলা", "1": "bn", "2": "ben", "2T": "ben", "2B": "ben", "3": "ben"},
    bh: {"name": "Bihari", "local": "भोजपुरी", "1": "bh", "2": "bih", "2T": "bih", "2B": "bih", "3": "bih"},
    bi: {"name": "Bislama", "local": "Bislama", "1": "bi", "2": "bis", "2T": "bis", "2B": "bis", "3": "bis"},
    bs: {"name": "Bosnian", "local": "Bosanski", "1": "bs", "2": "bos", "2T": "bos", "2B": "bos", "3": "bos"},
    br: {"name": "Breton", "local": "Brezhoneg", "1": "br", "2": "bre", "2T": "bre", "2B": "bre", "3": "bre"},
    bg: {"name": "Bulgarian", "local": "Български", "1": "bg", "2": "bul", "2T": "bul", "2B": "bul", "3": "bul"},
    my: {"name": "Burmese", "local": "မြန်မာဘာသာ", "1": "my", "2": "mya", "2T": "mya", "2B": "bur", "3": "mya"},
    ca: {"name": "Catalan", "local": "Català", "1": "ca", "2": "cat", "2T": "cat", "2B": "cat", "3": "cat"},
    ch: {"name": "Chamorro", "local": "Chamoru", "1": "ch", "2": "cha", "2T": "cha", "2B": "cha", "3": "cha"},
    ce: {"name": "Chechen", "local": "Нохчийн", "1": "ce", "2": "che", "2T": "che", "2B": "che", "3": "che"},
    ny: {"name": "Chichewa", "local": "Chichewa", "1": "ny", "2": "nya", "2T": "nya", "2B": "nya", "3": "nya"},
    zh: {"name": "Chinese", "local": "中文", "1": "zh", "2": "zho", "2T": "zho", "2B": "chi", "3": "zho"},
    cv: {"name": "Chuvash", "local": "Чӑвашла", "1": "cv", "2": "chv", "2T": "chv", "2B": "chv", "3": "chv"},
    kw: {"name": "Cornish", "local": "Kernewek", "1": "kw", "2": "cor", "2T": "cor", "2B": "cor", "3": "cor"},
    co: {"name": "Corsican", "local": "Corsu", "1": "co", "2": "cos", "2T": "cos", "2B": "cos", "3": "cos"},
    cr: {"name": "Cree", "local": "ᓀᐦᐃᔭᐍᐏᐣ", "1": "cr", "2": "cre", "2T": "cre", "2B": "cre", "3": "cre"},
    hr: {"name": "Croatian", "local": "Hrvatski", "1": "hr", "2": "hrv", "2T": "hrv", "2B": "hrv", "3": "hrv"},
    cs: {"name": "Czech", "local": "Čeština", "1": "cs", "2": "ces", "2T": "ces", "2B": "cze", "3": "ces"},
    da: {"name": "Danish", "local": "Dansk", "1": "da", "2": "dan", "2T": "dan", "2B": "dan", "3": "dan"},
    dv: {"name": "Divehi", "local": "Divehi", "1": "dv", "2": "div", "2T": "div", "2B": "div", "3": "div"},
    nl: {"name": "Dutch", "local": "Nederlands", "1": "nl", "2": "nld", "2T": "nld", "2B": "dut", "3": "nld"},
    dz: {"name": "Dzongkha", "local": "རྫོང་ཁ", "1": "dz", "2": "dzo", "2T": "dzo", "2B": "dzo", "3": "dzo"},
    en: {"name": "English", "local": "English", "1": "en", "2": "eng", "2T": "eng", "2B": "eng", "3": "eng"},
    eo: {"name": "Esperanto", "local": "Esperanto", "1": "eo", "2": "epo", "2T": "epo", "2B": "epo", "3": "epo"},
    et: {"name": "Estonian", "local": "Eesti", "1": "et", "2": "est", "2T": "est", "2B": "est", "3": "est"},
    ee: {"name": "Ewe", "local": "Eʋegbe", "1": "ee", "2": "ewe", "2T": "ewe", "2B": "ewe", "3": "ewe"},
    fo: {"name": "Faroese", "local": "Føroyskt", "1": "fo", "2": "fao", "2T": "fao", "2B": "fao", "3": "fao"},
    fj: {"name": "Fijian", "local": "Na Vosa Vaka-Viti", "1": "fj", "2": "fij", "2T": "fij", "2B": "fij", "3": "fij"},
    fi: {"name": "Finnish", "local": "Suomi", "1": "fi", "2": "fin", "2T": "fin", "2B": "fin", "3": "fin"},
    fr: {"name": "French", "local": "Français", "1": "fr", "2": "fra", "2T": "fra", "2B": "fre", "3": "fra"},
    ff: {"name": "Fula", "local": "Fulfulde", "1": "ff", "2": "ful", "2T": "ful", "2B": "ful", "3": "ful"},
    gl: {"name": "Galician", "local": "Galego", "1": "gl", "2": "glg", "2T": "glg", "2B": "glg", "3": "glg"},
    ka: {"name": "Georgian", "local": "ქართული", "1": "ka", "2": "kat", "2T": "kat", "2B": "geo", "3": "kat"},
    de: {"name": "German", "local": "Deutsch", "1": "de", "2": "deu", "2T": "deu", "2B": "ger", "3": "deu"},
    el: {"name": "Greek", "local": "Ελληνικά", "1": "el", "2": "ell", "2T": "ell", "2B": "gre", "3": "ell"},
    gn: {"name": "Guaraní", "local": "Avañe'ẽ", "1": "gn", "2": "grn", "2T": "grn", "2B": "grn", "3": "grn"},
    gu: {"name": "Gujarati", "local": "ગુજરાતી", "1": "gu", "2": "guj", "2T": "guj", "2B": "guj", "3": "guj"},
    ht: {"name": "Haitian", "local": "Kreyòl Ayisyen", "1": "ht", "2": "hat", "2T": "hat", "2B": "hat", "3": "hat"},
    ha: {"name": "Hausa", "local": "هَوُسَ", "1": "ha", "2": "hau", "2T": "hau", "2B": "hau", "3": "hau"},
    he: {"name": "Hebrew", "local": "עברית", "1": "he", "2": "heb", "2T": "heb", "2B": "heb", "3": "heb"},
    hz: {"name": "Herero", "local": "Otjiherero", "1": "hz", "2": "her", "2T": "her", "2B": "her", "3": "her"},
    hi: {"name": "Hindi", "local": "हिन्दी", "1": "hi", "2": "hin", "2T": "hin", "2B": "hin", "3": "hin"},
    ho: {"name": "Hiri Motu", "local": "Hiri Motu", "1": "ho", "2": "hmo", "2T": "hmo", "2B": "hmo", "3": "hmo"},
    hu: {"name": "Hungarian", "local": "Magyar", "1": "hu", "2": "hun", "2T": "hun", "2B": "hun", "3": "hun"},
    ia: {"name": "Interlingua", "local": "Interlingua", "1": "ia", "2": "ina", "2T": "ina", "2B": "ina", "3": "ina"},
    id: {
        "name": "Indonesian",
        "local": "Bahasa Indonesia",
        "1": "id",
        "2": "ind",
        "2T": "ind",
        "2B": "ind",
        "3": "ind"
    },
    ie: {"name": "Interlingue", "local": "Interlingue", "1": "ie", "2": "ile", "2T": "ile", "2B": "ile", "3": "ile"},
    ga: {"name": "Irish", "local": "Gaeilge", "1": "ga", "2": "gle", "2T": "gle", "2B": "gle", "3": "gle"},
    ig: {"name": "Igbo", "local": "Igbo", "1": "ig", "2": "ibo", "2T": "ibo", "2B": "ibo", "3": "ibo"},
    ik: {"name": "Inupiaq", "local": "Iñupiak", "1": "ik", "2": "ipk", "2T": "ipk", "2B": "ipk", "3": "ipk"},
    io: {"name": "Ido", "local": "Ido", "1": "io", "2": "ido", "2T": "ido", "2B": "ido", "3": "ido"},
    is: {"name": "Icelandic", "local": "Íslenska", "1": "is", "2": "isl", "2T": "isl", "2B": "ice", "3": "isl"},
    it: {"name": "Italian", "local": "Italiano", "1": "it", "2": "ita", "2T": "ita", "2B": "ita", "3": "ita"},
    iu: {"name": "Inuktitut", "local": "ᐃᓄᒃᑎᑐᑦ", "1": "iu", "2": "iku", "2T": "iku", "2B": "iku", "3": "iku"},
    ja: {"name": "Japanese", "local": "日本語", "1": "ja", "2": "jpn", "2T": "jpn", "2B": "jpn", "3": "jpn"},
    jv: {"name": "Javanese", "local": "Basa Jawa", "1": "jv", "2": "jav", "2T": "jav", "2B": "jav", "3": "jav"},
    kl: {"name": "Kalaallisut", "local": "Kalaallisut", "1": "kl", "2": "kal", "2T": "kal", "2B": "kal", "3": "kal"},
    kn: {"name": "Kannada", "local": "ಕನ್ನಡ", "1": "kn", "2": "kan", "2T": "kan", "2B": "kan", "3": "kan"},
    kr: {"name": "Kanuri", "local": "Kanuri", "1": "kr", "2": "kau", "2T": "kau", "2B": "kau", "3": "kau"},
    ks: {"name": "Kashmiri", "local": "كشميري", "1": "ks", "2": "kas", "2T": "kas", "2B": "kas", "3": "kas"},
    kk: {"name": "Kazakh", "local": "Қазақша", "1": "kk", "2": "kaz", "2T": "kaz", "2B": "kaz", "3": "kaz"},
    km: {"name": "Khmer", "local": "ភាសាខ្មែរ", "1": "km", "2": "khm", "2T": "khm", "2B": "khm", "3": "khm"},
    ki: {"name": "Kikuyu", "local": "Gĩkũyũ", "1": "ki", "2": "kik", "2T": "kik", "2B": "kik", "3": "kik"},
    rw: {"name": "Kinyarwanda", "local": "Kinyarwanda", "1": "rw", "2": "kin", "2T": "kin", "2B": "kin", "3": "kin"},
    ky: {"name": "Kyrgyz", "local": "Кыргызча", "1": "ky", "2": "kir", "2T": "kir", "2B": "kir", "3": "kir"},
    kv: {"name": "Komi", "local": "Коми", "1": "kv", "2": "kom", "2T": "kom", "2B": "kom", "3": "kom"},
    kg: {"name": "Kongo", "local": "Kongo", "1": "kg", "2": "kon", "2T": "kon", "2B": "kon", "3": "kon"},
    ko: {"name": "Korean", "local": "한국어", "1": "ko", "2": "kor", "2T": "kor", "2B": "kor", "3": "kor"},
    ku: {"name": "Kurdish", "local": "Kurdî", "1": "ku", "2": "kur", "2T": "kur", "2B": "kur", "3": "kur"},
    kj: {"name": "Kwanyama", "local": "Kuanyama", "1": "kj", "2": "kua", "2T": "kua", "2B": "kua", "3": "kua"},
    la: {"name": "Latin", "local": "Latina", "1": "la", "2": "lat", "2T": "lat", "2B": "lat", "3": "lat"},
    lb: {
        "name": "Luxembourgish",
        "local": "Lëtzebuergesch",
        "1": "lb",
        "2": "ltz",
        "2T": "ltz",
        "2B": "ltz",
        "3": "ltz"
    },
    lg: {"name": "Ganda", "local": "Luganda", "1": "lg", "2": "lug", "2T": "lug", "2B": "lug", "3": "lug"},
    li: {"name": "Limburgish", "local": "Limburgs", "1": "li", "2": "lim", "2T": "lim", "2B": "lim", "3": "lim"},
    ln: {"name": "Lingala", "local": "Lingála", "1": "ln", "2": "lin", "2T": "lin", "2B": "lin", "3": "lin"},
    lo: {"name": "Lao", "local": "ພາສາລາວ", "1": "lo", "2": "lao", "2T": "lao", "2B": "lao", "3": "lao"},
    lt: {"name": "Lithuanian", "local": "Lietuvių", "1": "lt", "2": "lit", "2T": "lit", "2B": "lit", "3": "lit"},
    lu: {"name": "Luba-Katanga", "local": "Tshiluba", "1": "lu", "2": "lub", "2T": "lub", "2B": "lub", "3": "lub"},
    lv: {"name": "Latvian", "local": "Latviešu", "1": "lv", "2": "lav", "2T": "lav", "2B": "lav", "3": "lav"},
    gv: {"name": "Manx", "local": "Gaelg", "1": "gv", "2": "glv", "2T": "glv", "2B": "glv", "3": "glv"},
    mk: {"name": "Macedonian", "local": "Македонски", "1": "mk", "2": "mkd", "2T": "mkd", "2B": "mac", "3": "mkd"},
    mg: {"name": "Malagasy", "local": "Malagasy", "1": "mg", "2": "mlg", "2T": "mlg", "2B": "mlg", "3": "mlg"},
    ms: {"name": "Malay", "local": "Bahasa Melayu", "1": "ms", "2": "msa", "2T": "msa", "2B": "may", "3": "msa"},
    ml: {"name": "Malayalam", "local": "മലയാളം", "1": "ml", "2": "mal", "2T": "mal", "2B": "mal", "3": "mal"},
    mt: {"name": "Maltese", "local": "Malti", "1": "mt", "2": "mlt", "2T": "mlt", "2B": "mlt", "3": "mlt"},
    mi: {"name": "Māori", "local": "Māori", "1": "mi", "2": "mri", "2T": "mri", "2B": "mao", "3": "mri"},
    mr: {"name": "Marathi", "local": "मराठी", "1": "mr", "2": "mar", "2T": "mar", "2B": "mar", "3": "mar"},
    mh: {"name": "Marshallese", "local": "Kajin M̧ajeļ", "1": "mh", "2": "mah", "2T": "mah", "2B": "mah", "3": "mah"},
    mn: {"name": "Mongolian", "local": "Монгол", "1": "mn", "2": "mon", "2T": "mon", "2B": "mon", "3": "mon"},
    na: {"name": "Nauru", "local": "Dorerin Naoero", "1": "na", "2": "nau", "2T": "nau", "2B": "nau", "3": "nau"},
    nv: {"name": "Navajo", "local": "Diné Bizaad", "1": "nv", "2": "nav", "2T": "nav", "2B": "nav", "3": "nav"},
    nd: {
        "name": "Northern Ndebele",
        "local": "isiNdebele",
        "1": "nd",
        "2": "nde",
        "2T": "nde",
        "2B": "nde",
        "3": "nde"
    },
    ne: {"name": "Nepali", "local": "नेपाली", "1": "ne", "2": "nep", "2T": "nep", "2B": "nep", "3": "nep"},
    ng: {"name": "Ndonga", "local": "Owambo", "1": "ng", "2": "ndo", "2T": "ndo", "2B": "ndo", "3": "ndo"},
    nb: {
        "name": "Norwegian Bokmål", "local": "Norsk (Bokmål)", "1": "nb",
        "2": "nob",
        "2T": "nob",
        "2B": "nob",
        "3": "nob"
    },
    nn: {
        "name": "Norwegian Nynorsk", "local": "Norsk (Nynorsk)", "1": "nn",
        "2": "nno",
        "2T": "nno",
        "2B": "nno",
        "3": "nno"
    },
    no: {"name": "Norwegian", "local": "Norsk", "1": "no", "2": "nor", "2T": "nor", "2B": "nor", "3": "nor"},
    ii: {"name": "Nuosu", "local": "ꆈꌠ꒿ Nuosuhxop", "1": "ii", "2": "iii", "2T": "iii", "2B": "iii", "3": "iii"},
    nr: {
        "name": "Southern Ndebele",
        "local": "isiNdebele",
        "1": "nr",
        "2": "nbl",
        "2T": "nbl",
        "2B": "nbl",
        "3": "nbl"
    },
    oc: {"name": "Occitan", "local": "Occitan", "1": "oc", "2": "oci", "2T": "oci", "2B": "oci", "3": "oci"},
    oj: {"name": "Ojibwe", "local": "ᐊᓂᔑᓈᐯᒧᐎᓐ", "1": "oj", "2": "oji", "2T": "oji", "2B": "oji", "3": "oji"},
    cu: {
        "name": "Old Church Slavonic", "local": "Словѣ́ньскъ", "1": "cu",
        "2": "chu",
        "2T": "chu",
        "2B": "chu",
        "3": "chu"
    },
    om: {"name": "Oromo", "local": "Afaan Oromoo", "1": "om", "2": "orm", "2T": "orm", "2B": "orm", "3": "orm"},
    or: {"name": "Oriya", "local": "ଓଡି଼ଆ", "1": "or", "2": "ori", "2T": "ori", "2B": "ori", "3": "ori"},
    os: {"name": "Ossetian", "local": "Ирон æвзаг", "1": "os", "2": "oss", "2T": "oss", "2B": "oss", "3": "oss"},
    pa: {"name": "Panjabi", "local": "ਪੰਜਾਬੀ", "1": "pa", "2": "pan", "2T": "pan", "2B": "pan", "3": "pan"},
    pi: {"name": "Pāli", "local": "पाऴि", "1": "pi", "2": "pli", "2T": "pli", "2B": "pli", "3": "pli"},
    fa: {"name": "Persian", "local": "فارسی", "1": "fa", "2": "fas", "2T": "fas", "2B": "per", "3": "fas"},
    pl: {"name": "Polish", "local": "Polski", "1": "pl", "2": "pol", "2T": "pol", "2B": "pol", "3": "pol"},
    ps: {"name": "Pashto", "local": "پښتو", "1": "ps", "2": "pus", "2T": "pus", "2B": "pus", "3": "pus"},
    pt: {"name": "Portuguese", "local": "Português", "1": "pt", "2": "por", "2T": "por", "2B": "por", "3": "por"},
    qu: {"name": "Quechua", "local": "Runa Simi", "1": "qu", "2": "que", "2T": "que", "2B": "que", "3": "que"},
    rm: {"name": "Romansh", "local": "Rumantsch", "1": "rm", "2": "roh", "2T": "roh", "2B": "roh", "3": "roh"},
    rn: {"name": "Kirundi", "local": "Kirundi", "1": "rn", "2": "run", "2T": "run", "2B": "run", "3": "run"},
    ro: {"name": "Romanian", "local": "Română", "1": "ro", "2": "ron", "2T": "ron", "2B": "rum", "3": "ron"},
    ru: {"name": "Russian", "local": "Русский", "1": "ru", "2": "rus", "2T": "rus", "2B": "rus", "3": "rus"},
    sa: {"name": "Sanskrit", "local": "संस्कृतम्", "1": "sa", "2": "san", "2T": "san", "2B": "san", "3": "san"},
    sc: {"name": "Sardinian", "local": "Sardu", "1": "sc", "2": "srd", "2T": "srd", "2B": "srd", "3": "srd"},
    sd: {"name": "Sindhi", "local": "سنڌي‎", "1": "sd", "2": "snd", "2T": "snd", "2B": "snd", "3": "snd"},
    se: {"name": "Northern Sami", "local": "Sámegiella", "1": "se", "2": "sme", "2T": "sme", "2B": "sme", "3": "sme"},
    sm: {"name": "Samoan", "local": "Gagana Sāmoa", "1": "sm", "2": "smo", "2T": "smo", "2B": "smo", "3": "smo"},
    sg: {"name": "Sango", "local": "Sängö", "1": "sg", "2": "sag", "2T": "sag", "2B": "sag", "3": "sag"},
    sr: {"name": "Serbian", "local": "Српски", "1": "sr", "2": "srp", "2T": "srp", "2B": "srp", "3": "srp"},
    gd: {"name": "Gaelic", "local": "Gàidhlig", "1": "gd", "2": "gla", "2T": "gla", "2B": "gla", "3": "gla"},
    sn: {"name": "Shona", "local": "ChiShona", "1": "sn", "2": "sna", "2T": "sna", "2B": "sna", "3": "sna"},
    si: {"name": "Sinhala", "local": "සිංහල", "1": "si", "2": "sin", "2T": "sin", "2B": "sin", "3": "sin"},
    sk: {"name": "Slovak", "local": "Slovenčina", "1": "sk", "2": "slk", "2T": "slk", "2B": "slo", "3": "slk"},
    sl: {"name": "Slovene", "local": "Slovenščina", "1": "sl", "2": "slv", "2T": "slv", "2B": "slv", "3": "slv"},
    so: {"name": "Somali", "local": "Soomaaliga", "1": "so", "2": "som", "2T": "som", "2B": "som", "3": "som"},
    st: {"name": "Southern Sotho", "local": "Sesotho", "1": "st", "2": "sot", "2T": "sot", "2B": "sot", "3": "sot"},
    es: {"name": "Spanish", "local": "Español", "1": "es", "2": "spa", "2T": "spa", "2B": "spa", "3": "spa"},
    su: {"name": "Sundanese", "local": "Basa Sunda", "1": "su", "2": "sun", "2T": "sun", "2B": "sun", "3": "sun"},
    sw: {"name": "Swahili", "local": "Kiswahili", "1": "sw", "2": "swa", "2T": "swa", "2B": "swa", "3": "swa"},
    ss: {"name": "Swati", "local": "SiSwati", "1": "ss", "2": "ssw", "2T": "ssw", "2B": "ssw", "3": "ssw"},
    sv: {"name": "Swedish", "local": "Svenska", "1": "sv", "2": "swe", "2T": "swe", "2B": "swe", "3": "swe"},
    ta: {"name": "Tamil", "local": "தமிழ்", "1": "ta", "2": "tam", "2T": "tam", "2B": "tam", "3": "tam"},
    te: {"name": "Telugu", "local": "తెలుగు", "1": "te", "2": "tel", "2T": "tel", "2B": "tel", "3": "tel"},
    tg: {"name": "Tajik", "local": "Тоҷикӣ", "1": "tg", "2": "tgk", "2T": "tgk", "2B": "tgk", "3": "tgk"},
    th: {"name": "Thai", "local": "ภาษาไทย", "1": "th", "2": "tha", "2T": "tha", "2B": "tha", "3": "tha"},
    ti: {"name": "Tigrinya", "local": "ትግርኛ", "1": "ti", "2": "tir", "2T": "tir", "2B": "tir", "3": "tir"},
    bo: {"name": "Tibetan Standard", "local": "བོད་ཡིག", "1": "bo", "2": "bod", "2T": "bod", "2B": "tib", "3": "bod"},
    tk: {"name": "Turkmen", "local": "Türkmençe", "1": "tk", "2": "tuk", "2T": "tuk", "2B": "tuk", "3": "tuk"},
    tl: {"name": "Tagalog", "local": "Tagalog", "1": "tl", "2": "tgl", "2T": "tgl", "2B": "tgl", "3": "tgl"},
    tn: {"name": "Tswana", "local": "Setswana", "1": "tn", "2": "tsn", "2T": "tsn", "2B": "tsn", "3": "tsn"},
    to: {"name": "Tonga", "local": "faka Tonga", "1": "to", "2": "ton", "2T": "ton", "2B": "ton", "3": "ton"},
    tr: {"name": "Turkish", "local": "Türkçe", "1": "tr", "2": "tur", "2T": "tur", "2B": "tur", "3": "tur"},
    ts: {"name": "Tsonga", "local": "Xitsonga", "1": "ts", "2": "tso", "2T": "tso", "2B": "tso", "3": "tso"},
    tt: {"name": "Tatar", "local": "Татарча", "1": "tt", "2": "tat", "2T": "tat", "2B": "tat", "3": "tat"},
    tw: {"name": "Twi", "local": "Twi", "1": "tw", "2": "twi", "2T": "twi", "2B": "twi", "3": "twi"},
    ty: {"name": "Tahitian", "local": "Reo Mā’ohi", "1": "ty", "2": "tah", "2T": "tah", "2B": "tah", "3": "tah"},
    ug: {"name": "Uyghur", "local": "ئۇيغۇرچه", "1": "ug", "2": "uig", "2T": "uig", "2B": "uig", "3": "uig"},
    uk: {"name": "Ukrainian", "local": "Українська", "1": "uk", "2": "ukr", "2T": "ukr", "2B": "ukr", "3": "ukr"},
    ur: {"name": "Urdu", "local": "اردو", "1": "ur", "2": "urd", "2T": "urd", "2B": "urd", "3": "urd"},
    uz: {"name": "Uzbek", "local": "O‘zbek", "1": "uz", "2": "uzb", "2T": "uzb", "2B": "uzb", "3": "uzb"},
    ve: {"name": "Venda", "local": "Tshivenḓa", "1": "ve", "2": "ven", "2T": "ven", "2B": "ven", "3": "ven"},
    vi: {"name": "Vietnamese", "local": "Tiếng Việt", "1": "vi", "2": "vie", "2T": "vie", "2B": "vie", "3": "vie"},
    vo: {"name": "Volapük", "local": "Volapük", "1": "vo", "2": "vol", "2T": "vol", "2B": "vol", "3": "vol"},
    wa: {"name": "Walloon", "local": "Walon", "1": "wa", "2": "wln", "2T": "wln", "2B": "wln", "3": "wln"},
    cy: {"name": "Welsh", "local": "Cymraeg", "1": "cy", "2": "cym", "2T": "cym", "2B": "wel", "3": "cym"},
    wo: {"name": "Wolof", "local": "Wolof", "1": "wo", "2": "wol", "2T": "wol", "2B": "wol", "3": "wol"},
    fy: {"name": "Western Frisian", "local": "Frysk", "1": "fy", "2": "fry", "2T": "fry", "2B": "fry", "3": "fry"},
    xh: {"name": "Xhosa", "local": "isiXhosa", "1": "xh", "2": "xho", "2T": "xho", "2B": "xho", "3": "xho"},
    yi: {"name": "Yiddish", "local": "ייִדיש", "1": "yi", "2": "yid", "2T": "yid", "2B": "yid", "3": "yid"},
    yo: {"name": "Yoruba", "local": "Yorùbá", "1": "yo", "2": "yor", "2T": "yor", "2B": "yor", "3": "yor"},
    za: {"name": "Zhuang", "local": "Cuengh", "1": "za", "2": "zha", "2T": "zha", "2B": "zha", "3": "zha"},
    zu: {"name": "Zulu", "local": "isiZulu", "1": "zu", "2": "zul", "2T": "zul", "2B": "zul", "3": "zul"}
}
/**
 * Cached
 *
 * @type {{[name: string]: [code2: string]}}
 */
const identities_name = {};
/**
 * Cached
 *
 * @type {{[code3:string]: [code2: string]}}
 */
const identities_3 = {};
for (let key in ISO_639) {
    let val = ISO_639[key];
    identities_name[val.name.toLowerCase()] = key;
    identities_3[val['2']] = key;
}

export default class Iso639 {
    /**
     * Find locale
     *
     * @param {string} idOrName
     * @return {?{name: string, local: string, "1": string, "2": string, "2T": string, "2B": string, "3": string}}
     */
    static find(idOrName) {
        let lowerId = strval(idOrName).toLowerCase();
        if (!ISO_639.hasOwnProperty(lowerId)) {
            lowerId = identities_3[lowerId] || identities_name[lowerId];
        }
        return lowerId ? ISO_639[lowerId] : null;
    }
}
