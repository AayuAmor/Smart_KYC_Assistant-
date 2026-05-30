/**
 * Nepal administrative hierarchy — all 7 provinces, 77 districts, 753 LGUs.
 * Based on the 2017 federal restructuring (Constitution of Nepal 2015).
 */

/* ── Provinces ────────────────────────────────────────────────── */
export const PROVINCES = [
  'Koshi Province',
  'Madhesh Province',
  'Bagmati Province',
  'Gandaki Province',
  'Lumbini Province',
  'Karnali Province',
  'Sudurpashchim Province',
]

/* ── Districts by Province (alphabetical within each) ────────── */
export const DISTRICTS_BY_PROVINCE = {
  'Koshi Province': [
    'Bhojpur','Dhankuta','Ilam','Jhapa','Khotang','Morang',
    'Okhaldhunga','Panchthar','Sankhuwasabha','Solukhumbu',
    'Sunsari','Taplejung','Tehrathum','Udayapur',
  ],
  'Madhesh Province': [
    'Bara','Dhanusha','Mahottari','Parsa','Rautahat','Saptari','Sarlahi','Siraha',
  ],
  'Bagmati Province': [
    'Bhaktapur','Chitwan','Dhading','Dolakha','Kathmandu',
    'Kavrepalanchok','Lalitpur','Makwanpur','Nuwakot',
    'Ramechhap','Rasuwa','Sindhuli','Sindhupalchok',
  ],
  'Gandaki Province': [
    'Baglung','Gorkha','Kaski','Lamjung','Manang',
    'Mustang','Myagdi','Nawalpur','Parbat','Syangja','Tanahun',
  ],
  'Lumbini Province': [
    'Arghakhanchi','Banke','Bardiya','Dang','Gulmi',
    'Kapilvastu','Nawalparasi West','Palpa','Pyuthan',
    'Rolpa','Rukum East','Rupandehi',
  ],
  'Karnali Province': [
    'Dailekh','Dolpa','Humla','Jajarkot','Jumla',
    'Kalikot','Mugu','Rukum West','Salyan','Surkhet',
  ],
  'Sudurpashchim Province': [
    'Achham','Baitadi','Bajhang','Bajura','Dadeldhura',
    'Darchula','Doti','Kailali','Kanchanpur',
  ],
}

/* ── Municipalities & Rural Municipalities by District ─────────
   Format: "Name Municipality" | "Name Sub-Metropolitan City" |
           "Name Metropolitan City" | "Name Rural Municipality"
   ─────────────────────────────────────────────────────────────── */
export const MUNICIPALITIES_BY_DISTRICT = {

  /* ═══════════════════ KOSHI PROVINCE ═══════════════════════ */

  Bhojpur: [
    'Bhojpur Municipality',
    'Shadananda Municipality',
    'Arun Rural Municipality',
    'Hatuwagadhi Rural Municipality',
    'Pauwadungma Rural Municipality',
    'Ramprasad Rai Rural Municipality',
    'Salpasilichho Rural Municipality',
    'Temkemaiyung Rural Municipality',
    'Tyamkemaiyung Rural Municipality',
  ],

  Dhankuta: [
    'Dhankuta Municipality',
    'Pakhribas Municipality',
    'Chhathar Jorpati Rural Municipality',
    'Khalsa Devi Rural Municipality',
    'Mahalaxmi Rural Municipality',
    'Sahidbhumi Rural Municipality',
    'Sangurigadhi Rural Municipality',
    'Tambapakha Rural Municipality',
  ],

  Ilam: [
    'Ilam Municipality',
    'Deumai Municipality',
    'Mai Municipality',
    'Suryodaya Municipality',
    'Chulachuli Rural Municipality',
    'Fakfokthum Rural Municipality',
    'Maijogmai Rural Municipality',
    'Mangsebung Rural Municipality',
    'Phakphokthum Rural Municipality',
    'Rong Rural Municipality',
    'Sandakpur Rural Municipality',
  ],

  Jhapa: [
    'Arjundhara Municipality',
    'Bhadrapur Municipality',
    'Birtamod Municipality',
    'Damak Municipality',
    'Gauradaha Municipality',
    'Kankai Municipality',
    'Mechinagar Municipality',
    'Surunga Municipality',
    'Barhadashi Rural Municipality',
    'Buddhashanti Rural Municipality',
    'Haldibari Rural Municipality',
    'Jhapa Rural Municipality',
    'Kamal Rural Municipality',
    'Shivasataxi Rural Municipality',
  ],

  Khotang: [
    'Diktel Rupakot Majhuwagadhi Municipality',
    'Halesi Tuwachung Municipality',
    'Ainselukhark Rural Municipality',
    'Barahapokhari Rural Municipality',
    'Diprung Chuichumma Rural Municipality',
    'Kepilasgadhi Rural Municipality',
    'Khotehang Rural Municipality',
    'Lamidanda Rural Municipality',
    'Rawabesi Rural Municipality',
    'Sakela Rural Municipality',
    'Waling Rural Municipality',
  ],

  Morang: [
    'Biratnagar Metropolitan City',
    'Itahari Sub-Metropolitan City',
    'Budhiganga Municipality',
    'Dhanpalthan Municipality',
    'Gramthan Municipality',
    'Kerabari Municipality',
    'Letang Municipality',
    'Patahrishanishchare Municipality',
    'Rangeli Municipality',
    'Ratuwamai Municipality',
    'Sundarharaicha Municipality',
    'Urlabari Municipality',
    'Jahada Rural Municipality',
    'Katahari Rural Municipality',
    'Miklajung Rural Municipality',
    'Sunbarshi Rural Municipality',
    'Udam Rural Municipality',
  ],

  Okhaldhunga: [
    'Okhaldhunga Municipality',
    'Siddhicharan Municipality',
    'Champadevi Rural Municipality',
    'Chisankhugadhi Rural Municipality',
    'Khijidemba Rural Municipality',
    'Manebhanjyang Rural Municipality',
    'Molung Rural Municipality',
    'Sunkoshi Rural Municipality',
  ],

  Panchthar: [
    'Phidim Municipality',
    'Chhintapu Rural Municipality',
    'Falgunanda Rural Municipality',
    'Hilihang Rural Municipality',
    'Kummayak Rural Municipality',
    'Miklajung Rural Municipality',
    'Phalelung Rural Municipality',
    'Tumbewa Rural Municipality',
    'Yang Pengma Rural Municipality',
    'Yangwarak Rural Municipality',
  ],

  Sankhuwasabha: [
    'Chainpur Municipality',
    'Khandbari Municipality',
    'Chichila Rural Municipality',
    'Dharmadevi Rural Municipality',
    'Madi Rural Municipality',
    'Makalu Rural Municipality',
    'Panchakhapan Rural Municipality',
    'Sabhapokhari Rural Municipality',
    'Silichong Rural Municipality',
  ],

  Solukhumbu: [
    'Solududhakunda Municipality',
    'Thulung Dudhkoshi Rural Municipality',
    'Dudhkoshi Rural Municipality',
    'Khumbupasanglahmu Rural Municipality',
    'Likhupike Rural Municipality',
    'Mahakulung Rural Municipality',
    'Nechasalyan Rural Municipality',
    'Sotang Rural Municipality',
  ],

  Sunsari: [
    'Dharan Sub-Metropolitan City',
    'Itahari Sub-Metropolitan City',
    'Barahakshetra Municipality',
    'Duhabi Municipality',
    'Inaruwa Municipality',
    'Ramdhuni Municipality',
    'Harinagar Rural Municipality',
    'Koshi Rural Municipality',
  ],

  Taplejung: [
    'Phungling Municipality',
    'Aathrai Tribeni Municipality',
    'Maiwa Rural Municipality',
    'Maiwakhola Rural Municipality',
    'Meringden Rural Municipality',
    'Mikwakhola Rural Municipality',
    'Pathivara Yangwarak Rural Municipality',
    'Phaktanglung Rural Municipality',
    'Sidingba Rural Municipality',
    'Sirijangha Rural Municipality',
  ],

  Tehrathum: [
    'Myanglung Municipality',
    'Aathrai Rural Municipality',
    'Chhathar Rural Municipality',
    'Dungma Rural Municipality',
    'Laligurans Rural Municipality',
    'Menchayam Rural Municipality',
    'Phedap Rural Municipality',
  ],

  Udayapur: [
    'Chaudandigadhi Municipality',
    'Katari Municipality',
    'Belaka Municipality',
    'Triyuga Municipality',
    'Champadevi Rural Municipality',
    'Limbuchula Rural Municipality',
    'Rautamai Rural Municipality',
    'Sunkoshi Rural Municipality',
    'Tapli Rural Municipality',
    'Udayapurgadhi Rural Municipality',
  ],

  /* ═══════════════════ MADHESH PROVINCE ═══════════════════════ */

  Bara: [
    'Jitpur Simara Sub-Metropolitan City',
    'Kalaiya Sub-Metropolitan City',
    'Adarshkotwal Rural Municipality',
    'Bishrampur Rural Municipality',
    'Devetal Rural Municipality',
    'Karaiyamai Rural Municipality',
    'Kolhabi Municipality',
    'Mahagadhimai Municipality',
    'Nijgadh Municipality',
    'Pachrauta Municipality',
    'Parwanipur Municipality',
    'Pheta Rural Municipality',
    'Prasauni Rural Municipality',
    'Simraungadh Municipality',
    'Suwarna Rural Municipality',
    'Vismainagar Municipality',
  ],

  Dhanusha: [
    'Janakpur Sub-Metropolitan City',
    'Bideha Municipality',
    'Chhireshwornath Municipality',
    'Dhanauji Rural Municipality',
    'Ganeshman Charnath Municipality',
    'Hansapur Municipality',
    'Janaknandini Rural Municipality',
    'Lakshminiya Rural Municipality',
    'Mithila Bihari Municipality',
    'Mithila Municipality',
    'Mukhiyapatti Musaharniya Rural Municipality',
    'Nagarain Municipality',
    'Sabaila Municipality',
    'Shahidnagar Municipality',
  ],

  Mahottari: [
    'Jaleshwor Municipality',
    'Bardibas Municipality',
    'Aurahi Municipality',
    'Balwa Municipality',
    'Bhangaha Municipality',
    'Ekdara Rural Municipality',
    'Gaushala Municipality',
    'Loharpatti Municipality',
    'Mahottari Rural Municipality',
    'Manara Siswa Municipality',
    'Matihani Municipality',
    'Pipra Rural Municipality',
    'Ramgopalpur Municipality',
    'Samsi Rural Municipality',
    'Sonama Rural Municipality',
  ],

  Parsa: [
    'Birgunj Metropolitan City',
    'Bahudarmai Municipality',
    'Bindabasini Rural Municipality',
    'Chhipaharmai Municipality',
    'Dhobinibarwa Rural Municipality',
    'Jagarnathpur Municipality',
    'Jirabhawani Rural Municipality',
    'Kalikamai Rural Municipality',
    'Pakaha Mainpur Rural Municipality',
    'Parsagadhi Municipality',
    'Paterwa Sugauli Rural Municipality',
    'Pokhariya Municipality',
    'Sakhuwa Prasauni Rural Municipality',
    'Thori Rural Municipality',
  ],

  Rautahat: [
    'Gaur Municipality',
    'Baudhimai Municipality',
    'Brindaban Municipality',
    'Chandrapur Municipality',
    'Dewahi Gonahi Municipality',
    'Durga Bhagwati Rural Municipality',
    'Gadhimai Municipality',
    'Garuda Municipality',
    'Gujara Rural Municipality',
    'Ishanath Municipality',
    'Katahariya Municipality',
    'Madhav Narayan Municipality',
    'Maulapur Municipality',
    'Paroha Municipality',
    'Phatuwa Bijayapur Municipality',
    'Phehelong Rural Municipality',
    'Rajdevi Municipality',
    'Rajpur Rural Municipality',
    'Shivaspur Rural Municipality',
    'Yamunamai Rural Municipality',
  ],

  Saptari: [
    'Rajbiraj Municipality',
    'Balan-Bihul Rural Municipality',
    'Bishnupur Rural Municipality',
    'Bodebarsain Rural Municipality',
    'Chhinnamasta Rural Municipality',
    'Dakneshwori Rural Municipality',
    'Hanumannagar Kankalini Municipality',
    'Kanchanrup Municipality',
    'Khadak Municipality',
    'Mahadeva Rural Municipality',
    'Rupani Rural Municipality',
    'Saptakoshi Rural Municipality',
    'Shambhunath Municipality',
    'Surunga Municipality',
    'Tirhut Rural Municipality',
  ],

  Sarlahi: [
    'Lalbandi Municipality',
    'Malangawa Municipality',
    'Bagmati Municipality',
    'Balara Municipality',
    'Barahathwa Municipality',
    'Bishnu Municipality',
    'Chandranagar Rural Municipality',
    'Chakraghatta Rural Municipality',
    'Dhankaul Rural Municipality',
    'Haripurwa Municipality',
    'Hariwan Municipality',
    'Ishworpur Municipality',
    'Kabilasi Municipality',
    'Parsa Rural Municipality',
    'Ramnagar Rural Municipality',
  ],

  Siraha: [
    'Lahan Municipality',
    'Siraha Municipality',
    'Arnama Rural Municipality',
    'Aurahi Municipality',
    'Bhagawanpur Rural Municipality',
    'Bishnupur Rural Municipality',
    'Bariyarpatti Rural Municipality',
    'Dhangadhimai Municipality',
    'Golbazar Municipality',
    'Karjanha Municipality',
    'Kalyanpur Municipality',
    'Mirchaiya Municipality',
    'Nawarajpur Rural Municipality',
    'Sakhuwanankarkatti Rural Municipality',
    'Sukhipur Municipality',
  ],

  /* ═══════════════════ BAGMATI PROVINCE ═══════════════════════ */

  Bhaktapur: [
    'Bhaktapur Municipality',
    'Changunarayan Municipality',
    'Madhyapur Thimi Municipality',
    'Suryabinayak Municipality',
  ],

  Chitwan: [
    'Bharatpur Metropolitan City',
    'Ichchhakamana Rural Municipality',
    'Khairahani Municipality',
    'Rapti Municipality',
    'Ratnanagar Municipality',
  ],

  Dhading: [
    'Nilkantha Municipality',
    'Dhunibesi Municipality',
    'Benighat Rorang Rural Municipality',
    'Galchi Rural Municipality',
    'Gangajamuna Rural Municipality',
    'Jwalamukhi Rural Municipality',
    'Khaniyabas Rural Municipality',
    'Netrawati Dabjong Rural Municipality',
    'Rubi Valley Rural Municipality',
    'Siddhalek Rural Municipality',
    'Thakre Rural Municipality',
    'Tripura Sundari Rural Municipality',
  ],

  Dolakha: [
    'Bhimeshwar Municipality',
    'Jiri Municipality',
    'Baiteshwar Rural Municipality',
    'Bigu Rural Municipality',
    'Gaurishankar Rural Municipality',
    'Kalinchok Rural Municipality',
    'Melung Rural Municipality',
    'Sailung Rural Municipality',
    'Tamakoshi Rural Municipality',
  ],

  Kathmandu: [
    'Kathmandu Metropolitan City',
    'Budhanilkantha Municipality',
    'Chandragiri Municipality',
    'Dakshinkali Municipality',
    'Gokarneshwar Municipality',
    'Kageshwori Manohara Municipality',
    'Kirtipur Municipality',
    'Nagarjun Municipality',
    'Shankharapur Municipality',
    'Tarakeshwar Municipality',
    'Tokha Municipality',
  ],

  Kavrepalanchok: [
    'Banepa Municipality',
    'Dhulikhel Municipality',
    'Mandan Deupur Municipality',
    'Namobuddha Municipality',
    'Panauti Municipality',
    'Panchkhal Municipality',
    'Bethanchok Rural Municipality',
    'Bhumlu Rural Municipality',
    'Chauri Deurali Rural Municipality',
    'Khanikhola Rural Municipality',
    'Mahabharat Rural Municipality',
    'Roshi Rural Municipality',
    'Temal Rural Municipality',
  ],

  Lalitpur: [
    'Lalitpur Metropolitan City',
    'Godawari Municipality',
    'Mahalaxmi Municipality',
    'Bagmati Rural Municipality',
    'Konjyosom Rural Municipality',
  ],

  Makwanpur: [
    'Hetauda Sub-Metropolitan City',
    'Thaha Municipality',
    'Bagmati Rural Municipality',
    'Bakaiya Rural Municipality',
    'Bhimphedi Rural Municipality',
    'Indrasarowar Rural Municipality',
    'Kailash Rural Municipality',
    'Makawanpurgadhi Rural Municipality',
    'Manahari Rural Municipality',
    'Raksirang Rural Municipality',
  ],

  Nuwakot: [
    'Bidur Municipality',
    'Belkotgadhi Municipality',
    'Dupcheshwar Rural Municipality',
    'Kakani Rural Municipality',
    'Kispang Rural Municipality',
    'Likhu Rural Municipality',
    'Meghang Rural Municipality',
    'Myagang Rural Municipality',
    'Panchakanya Rural Municipality',
    'Shivapuri Rural Municipality',
    'Suryagadhi Rural Municipality',
    'Tadi Rural Municipality',
    'Tarkeshwar Rural Municipality',
  ],

  Ramechhap: [
    'Manthali Municipality',
    'Ramechhap Municipality',
    'Doramba Rural Municipality',
    'Gokulganga Rural Municipality',
    'Khandadevi Rural Municipality',
    'Likhu Tamakoshi Rural Municipality',
    'Sunapati Rural Municipality',
    'Umakunda Rural Municipality',
  ],

  Rasuwa: [
    'Gosaikunda Rural Municipality',
    'Kalika Rural Municipality',
    'Naukunda Rural Municipality',
    'Parbatikunda Rural Municipality',
    'Uttargaya Rural Municipality',
  ],

  Sindhuli: [
    'Dudhauli Municipality',
    'Kamalamai Municipality',
    'Golanjor Rural Municipality',
    'Hariharpurgadhi Rural Municipality',
    'Marin Rural Municipality',
    'Phikkal Rural Municipality',
    'Sunkoshi Rural Municipality',
    'Tinpatan Rural Municipality',
  ],

  Sindhupalchok: [
    'Barhabise Municipality',
    'Chautara Sangachowkgadhi Municipality',
    'Melamchi Municipality',
    'Bahrabise Municipality',
    'Bhotekoshi Rural Municipality',
    'Helambu Rural Municipality',
    'Indrawati Rural Municipality',
    'Jugal Rural Municipality',
    'Lisankhu Pakhar Rural Municipality',
    'Sunkoshi Rural Municipality',
    'Tripurasundari Rural Municipality',
  ],

  /* ═══════════════════ GANDAKI PROVINCE ═══════════════════════ */

  Baglung: [
    'Baglung Municipality',
    'Dhorpatan Municipality',
    'Jaimini Municipality',
    'Badigad Rural Municipality',
    'Bareng Rural Municipality',
    'Galkot Municipality',
    'Kanthekhola Rural Municipality',
    'Nisikhola Rural Municipality',
    'Taman Khola Rural Municipality',
    'Tara Hill Rural Municipality',
  ],

  Gorkha: [
    'Gorkha Municipality',
    'Palungtar Municipality',
    'Aarughat Rural Municipality',
    'Ajirkot Rural Municipality',
    'Barpak Sulikot Rural Municipality',
    'Bhimsen Thapa Rural Municipality',
    'Dharche Rural Municipality',
    'Gandaki Rural Municipality',
    'Sahid Lakhan Rural Municipality',
    'Siranchowk Rural Municipality',
    'Sulikot Rural Municipality',
    'Tsum Nubri Rural Municipality',
  ],

  Kaski: [
    'Pokhara Metropolitan City',
    'Annapurna Rural Municipality',
    'Machhapuchchhre Rural Municipality',
    'Madi Rural Municipality',
    'Rupa Rural Municipality',
  ],

  Lamjung: [
    'Besishahar Municipality',
    'Madhya Nepal Municipality',
    'Rainas Municipality',
    'Sundarbazar Municipality',
    'Dordi Rural Municipality',
    'Dudhpokhari Rural Municipality',
    'Kwholasothar Rural Municipality',
    'Marsyangdi Rural Municipality',
  ],

  Manang: [
    'Chame Rural Municipality',
    'Manang Ngisyang Rural Municipality',
    'Narphu Rural Municipality',
    'Nasong Rural Municipality',
  ],

  Mustang: [
    'Gharapjhong Rural Municipality',
    'Lomanthang Rural Municipality',
    'Lo-Ghekar Damodarkunda Rural Municipality',
    'Thasang Rural Municipality',
    'Waragung Muktikhsetra Rural Municipality',
  ],

  Myagdi: [
    'Beni Municipality',
    'Annapurna Rural Municipality',
    'Dhaulagiri Rural Municipality',
    'Mangala Rural Municipality',
    'Malika Rural Municipality',
    'Raghuganga Rural Municipality',
  ],

  Nawalpur: [
    'Kawasoti Municipality',
    'Bulingtar Rural Municipality',
    'Baudihi Rural Municipality',
    'Binayee Tribeni Rural Municipality',
    'Devchuli Municipality',
    'Gaindakot Municipality',
    'Hupsekot Municipality',
    'Madhyabindu Municipality',
    'Pratappur Rural Municipality',
  ],

  Parbat: [
    'Kushma Municipality',
    'Phalebas Municipality',
    'Airawati Rural Municipality',
    'Bihadi Rural Municipality',
    'Jaljala Rural Municipality',
    'Mahashila Rural Municipality',
    'Modi Rural Municipality',
    'Painyu Rural Municipality',
  ],

  Syangja: [
    'Putalibazar Municipality',
    'Waling Municipality',
    'Arjunchaupari Rural Municipality',
    'Biruwa Rural Municipality',
    'Bhirkot Municipality',
    'Chapakot Municipality',
    'Galyang Municipality',
    'Harinas Rural Municipality',
    'Kaligandaki Rural Municipality',
    'Phedikhola Rural Municipality',
  ],

  Tanahun: [
    'Vyas Municipality',
    'Bhanu Municipality',
    'Bhimad Municipality',
    'Shuklagandaki Municipality',
    'Bandipur Rural Municipality',
    'Devghat Rural Municipality',
    'Ghiring Rural Municipality',
    'Myagde Rural Municipality',
    'Rhishing Rural Municipality',
    'Risung Rural Municipality',
    'Anbukhaireni Rural Municipality',
  ],

  /* ═══════════════════ LUMBINI PROVINCE ═══════════════════════ */

  Arghakhanchi: [
    'Sandhikharka Municipality',
    'Sitganga Municipality',
    'Bhumekasthan Rural Municipality',
    'Chhatradev Rural Municipality',
    'Malarani Rural Municipality',
    'Panini Rural Municipality',
    'Shivapur Rural Municipality',
  ],

  Banke: [
    'Nepalgunj Sub-Metropolitan City',
    'Kohalpur Municipality',
    'Baijanath Rural Municipality',
    'Duduwa Rural Municipality',
    'Janaki Rural Municipality',
    'Khajura Rural Municipality',
    'Narainapur Rural Municipality',
    'Raptisonari Rural Municipality',
  ],

  Bardiya: [
    'Gulariya Municipality',
    'Bansgadhi Municipality',
    'Barbardiya Municipality',
    'Madhuwan Municipality',
    'Rajapur Municipality',
    'Thakurbaba Municipality',
    'Badhaiyatal Rural Municipality',
    'Geruwa Rural Municipality',
    'Suryapatuwa Rural Municipality',
  ],

  Dang: [
    'Ghorahi Sub-Metropolitan City',
    'Tulsipur Sub-Metropolitan City',
    'Lamahi Municipality',
    'Shantinagar Municipality',
    'Babai Rural Municipality',
    'Banglachuli Rural Municipality',
    'Dangisharan Rural Municipality',
    'Gadhawa Rural Municipality',
    'Krishnagar Rural Municipality',
    'Rajpur Rural Municipality',
    'Rapti Rural Municipality',
  ],

  Gulmi: [
    'Musikot Municipality',
    'Resunga Municipality',
    'Chatrakot Rural Municipality',
    'Chandrakot Rural Municipality',
    'Dhurkot Rural Municipality',
    'Gulmidarbar Rural Municipality',
    'Isma Rural Municipality',
    'Madane Rural Municipality',
    'Malika Rural Municipality',
    'Ruru Rural Municipality',
    'Satyawati Rural Municipality',
  ],

  Kapilvastu: [
    'Kapilvastu Municipality',
    'Krishna Nagar Municipality',
    'Maharajgunj Municipality',
    'Shivaraj Municipality',
    'Banganga Municipality',
    'Buddhabhumi Municipality',
    'Mayadevi Rural Municipality',
    'Sudhodhan Rural Municipality',
    'Yashodhara Rural Municipality',
    'Bijaynagar Rural Municipality',
  ],

  'Nawalparasi West': [
    'Ramgram Municipality',
    'Sunwal Municipality',
    'Bardaghat Municipality',
    'Pratappur Rural Municipality',
    'Palhinandan Rural Municipality',
    'Susta Rural Municipality',
    'Sarawal Rural Municipality',
    'Vijayapur Rural Municipality',
  ],

  Palpa: [
    'Tansen Municipality',
    'Rampur Municipality',
    'Bagnaskali Rural Municipality',
    'Mathagadhi Rural Municipality',
    'Nisdi Rural Municipality',
    'Purbakhola Rural Municipality',
    'Rainadevi Chhahara Rural Municipality',
    'Ribdikot Rural Municipality',
    'Rishing Rural Municipality',
    'Tinau Rural Municipality',
  ],

  Pyuthan: [
    'Pyuthan Municipality',
    'Swargadwari Municipality',
    'Airawati Rural Municipality',
    'Gaumukhi Rural Municipality',
    'Jhimruk Rural Municipality',
    'Mallarani Rural Municipality',
    'Mandavi Rural Municipality',
    'Naubahini Rural Municipality',
    'Sarumarani Rural Municipality',
  ],

  Rolpa: [
    'Rolpa Municipality',
    'Thabang Rural Municipality',
    'Dhor Bariban Rural Municipality',
    'Gangadeva Rural Municipality',
    'Khor Rural Municipality',
    'Lungri Rural Municipality',
    'Madi Rural Municipality',
    'Pariwartan Rural Municipality',
    'Runtigadhi Rural Municipality',
    'Sunil Smriti Rural Municipality',
    'Tribeni Rural Municipality',
  ],

  'Rukum East': [
    'Putha Uttarganga Rural Municipality',
    'Bhume Rural Municipality',
    'Sisne Rural Municipality',
  ],

  Rupandehi: [
    'Butwal Sub-Metropolitan City',
    'Tilottama Municipality',
    'Devdaha Municipality',
    'Lumbini Sanskritik Municipality',
    'Sainamaina Municipality',
    'Gaidahawa Rural Municipality',
    'Kotahimai Rural Municipality',
    'Marchawari Rural Municipality',
    'Mayadevi Rural Municipality',
    'Omsatiya Rural Municipality',
    'Rohini Rural Municipality',
    'Sammarimai Rural Municipality',
    'Siyari Rural Municipality',
    'Sudhdhodhan Rural Municipality',
  ],

  /* ═══════════════════ KARNALI PROVINCE ═══════════════════════ */

  Dailekh: [
    'Narayan Municipality',
    'Dullu Municipality',
    'Aathabis Municipality',
    'Bhairabi Rural Municipality',
    'Chamunda Bindrasaini Municipality',
    'Dungeshwar Rural Municipality',
    'Gurans Rural Municipality',
    'Mahabu Rural Municipality',
    'Naumule Rural Municipality',
    'Thantikandh Rural Municipality',
    'Bheriganga Rural Municipality',
  ],

  Dolpa: [
    'Thuli Bheri Municipality',
    'Tripura Sundari Municipality',
    'Dolpo Buddha Rural Municipality',
    'Jagadulla Rural Municipality',
    'Kaike Rural Municipality',
    'Mudkechula Rural Municipality',
    'She Phoksundo Rural Municipality',
    'Shey Phoksundo Rural Municipality',
  ],

  Humla: [
    'Simkot Rural Municipality',
    'Adanchuli Rural Municipality',
    'Chankheli Rural Municipality',
    'Kharpunath Rural Municipality',
    'Namkha Rural Municipality',
    'Sarkegad Rural Municipality',
    'Tanjakot Rural Municipality',
  ],

  Jajarkot: [
    'Bheri Municipality',
    'Chhedagad Municipality',
    'Barekot Rural Municipality',
    'Junichande Rural Municipality',
    'Kuse Rural Municipality',
    'Nalagad Municipality',
    'Shiwalaya Rural Municipality',
  ],

  Jumla: [
    'Chandannath Municipality',
    'Hima Rural Municipality',
    'Kanakasundari Rural Municipality',
    'Patarasi Rural Municipality',
    'Sinja Rural Municipality',
    'Tatopani Rural Municipality',
    'Tila Rural Municipality',
    'Guthichaur Rural Municipality',
    'Vijaynagar Rural Municipality',
  ],

  Kalikot: [
    'Manma Municipality',
    'Raskot Municipality',
    'Kalika Municipality',
    'Pachaljharana Rural Municipality',
    'Palata Rural Municipality',
    'Mahawai Rural Municipality',
    'Naraharinath Rural Municipality',
    'Shubha Kalika Rural Municipality',
    'Sanni Triveni Rural Municipality',
    'Tilagufa Municipality',
  ],

  Mugu: [
    'Chhayanath Rara Municipality',
    'Khatyad Rural Municipality',
    'Mugum Karmarong Rural Municipality',
    'Soru Rural Municipality',
  ],

  'Rukum West': [
    'Aathbiskot Municipality',
    'Banfikot Rural Municipality',
    'Chaurjahari Municipality',
    'Musikot Rural Municipality',
    'Putha Uttarganga Rural Municipality',
    'Sanibheri Rural Municipality',
    'Triveni Rural Municipality',
  ],

  Salyan: [
    'Sharada Municipality',
    'Bangad Kupinde Municipality',
    'Bagchaur Municipality',
    'Kalimati Rural Municipality',
    'Kapurkot Rural Municipality',
    'Kumakh Rural Municipality',
    'Siddha Kumakh Rural Municipality',
    'Darma Rural Municipality',
    'Tribeni Rural Municipality',
    'Chatreshwari Rural Municipality',
  ],

  Surkhet: [
    'Birendranagar Municipality',
    'Bheriganga Municipality',
    'Gurbhakot Municipality',
    'Lekbesi Municipality',
    'Panchapuri Municipality',
    'Barahatal Rural Municipality',
    'Chaukune Rural Municipality',
    'Chingad Rural Municipality',
    'Simta Rural Municipality',
  ],

  /* ═══════════════════ SUDURPASHCHIM PROVINCE ════════════════ */

  Achham: [
    'Mangalsen Municipality',
    'Panchadewal Binayak Municipality',
    'Bannigadhi Jayagadh Rural Municipality',
    'Chaurpati Rural Municipality',
    'Dhakari Rural Municipality',
    'Jorayal Rural Municipality',
    'Kamalbazar Municipality',
    'Mellekh Rural Municipality',
    'Ramaroshan Rural Municipality',
    'Sanfebagar Municipality',
    'Turmakhand Rural Municipality',
  ],

  Baitadi: [
    'Dasharathchand Municipality',
    'Patan Municipality',
    'Dilasaini Rural Municipality',
    'Dogadakedar Rural Municipality',
    'Melauli Municipality',
    'Purchundi Rural Municipality',
    'Shailyashikhar Municipality',
    'Sigas Rural Municipality',
    'Surnaya Rural Municipality',
    'Pancheswor Rural Municipality',
    'Pancheshwar Rural Municipality',
  ],

  Bajhang: [
    'Jayaprithvi Municipality',
    'Bungal Municipality',
    'Badimalika Municipality',
    'Bitthadchir Rural Municipality',
    'Chhabis Pathivera Rural Municipality',
    'Durgathali Rural Municipality',
    'Kedar Rural Municipality',
    'Khaptad Chhededaha Rural Municipality',
    'Masta Rural Municipality',
    'Surma Rural Municipality',
    'Talkot Rural Municipality',
    'Thalara Rural Municipality',
  ],

  Bajura: [
    'Badhalikanda Rural Municipality',
    'Budhiganga Municipality',
    'Budhinanda Municipality',
    'Gaumul Rural Municipality',
    'Himali Rural Municipality',
    'Jagannath Rural Municipality',
    'Khaptad Chhededaha Rural Municipality',
    'Swami Kartik Khapar Rural Municipality',
    'Triveni Rural Municipality',
  ],

  Dadeldhura: [
    'Amargadhi Municipality',
    'Aalital Rural Municipality',
    'Ajayameru Rural Municipality',
    'Bhageshwar Rural Municipality',
    'Ganyapadhura Rural Municipality',
    'Nawadurga Rural Municipality',
    'Parashuram Municipality',
  ],

  Darchula: [
    'Darchula Municipality',
    'Mahakali Municipality',
    'Apihimal Rural Municipality',
    'Byans Rural Municipality',
    'Duhu Rural Municipality',
    'Lekam Rural Municipality',
    'Marma Rural Municipality',
    'Naugad Rural Municipality',
    'Shailyashikhar Rural Municipality',
  ],

  Doti: [
    'Dipayal Silgadhi Municipality',
    'Shikhar Municipality',
    'Aadarsha Rural Municipality',
    'Badikedar Rural Municipality',
    'Bogtan Phudsil Rural Municipality',
    'Jorayal Rural Municipality',
    'K.I.Singh Rural Municipality',
    'Purbichauki Rural Municipality',
    'Sayal Rural Municipality',
  ],

  Kailali: [
    'Dhangadhi Sub-Metropolitan City',
    'Tikapur Municipality',
    'Bhajani Municipality',
    'Gauriganga Municipality',
    'Ghodaghodi Municipality',
    'Godawari Municipality',
    'Joshipur Rural Municipality',
    'Kailari Rural Municipality',
    'Lamki Chuha Municipality',
    'Bardagoriya Rural Municipality',
    'Chure Rural Municipality',
    'Janaki Rural Municipality',
    'Mohanyal Rural Municipality',
  ],

  Kanchanpur: [
    'Bhimdatta Municipality',
    'Mahendranagar Municipality',
    'Belauri Municipality',
    'Krishnapur Municipality',
    'Punarbas Municipality',
    'Shuklaphanta Municipality',
    'Beldandi Rural Municipality',
    'Laljhadi Rural Municipality',
  ],
}

/* ── Helpers ─────────────────────────────────────────────────── */

export function getDistricts(province) {
  return DISTRICTS_BY_PROVINCE[province] || []
}

export function getMunicipalities(district) {
  return MUNICIPALITIES_BY_DISTRICT[district] || []
}

/* ── OCR Address Parser ──────────────────────────────────────────
 * Converts a flat address string like:
 *   "Bharatpur Metropolitan City-10, Chitwan, Bagmati Province"
 * into structured fields:
 *   { province, district, municipality, ward, tole }
 * ────────────────────────────────────────────────────────────── */
export function parseOCRAddress(addressStr) {
  if (!addressStr) return {}
  const str   = addressStr.trim()
  const lower = str.toLowerCase()
  const result = {}

  /* Province */
  for (const p of PROVINCES) {
    if (lower.includes(p.toLowerCase())) { result.province = p; break }
  }

  /* District — search within matched province, else all districts */
  const districtPool = result.province
    ? DISTRICTS_BY_PROVINCE[result.province] || []
    : Object.values(DISTRICTS_BY_PROVINCE).flat()
  for (const d of districtPool) {
    if (lower.includes(d.toLowerCase())) { result.district = d; break }
  }

  /* Municipality — strip suffix to find a keyword match */
  const muniPool = result.district ? getMunicipalities(result.district) : []
  for (const m of muniPool) {
    const base = m
      .replace(/\s+(Metropolitan City|Sub-Metropolitan City|Municipality|Rural Municipality)$/i, '')
      .toLowerCase()
    if (lower.includes(base)) { result.municipality = m; break }
  }

  /* Ward number — pattern: "-10" or "Ward No 10" */
  const wardRx = /ward\s*(?:no\.?\s*)?(\d{1,2})/i.exec(str)
             || /[-–](\d{1,2})(?=\s*[,\s]|$)/.exec(str)
  if (wardRx) result.ward = wardRx[1]

  /* Tole — strip all matched tokens from the original string */
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  let rem = str
  if (result.municipality) {
    const base = result.municipality
      .replace(/\s+(Metropolitan City|Sub-Metropolitan City|Municipality|Rural Municipality)$/i, '')
    rem = rem.replace(new RegExp(esc(result.municipality), 'gi'), '')
    rem = rem.replace(new RegExp(esc(base), 'gi'), '')
  }
  if (result.district) rem = rem.replace(new RegExp(esc(result.district), 'gi'), '')
  if (result.province)  rem = rem.replace(new RegExp(esc(result.province), 'gi'), '')
  rem = rem
    .replace(/ward\s*(?:no\.?\s*)?\d{1,2}/gi, '')
    .replace(/[-–]\s*\d{1,2}/, '')
    .replace(/^[,\s]+|[,\s]+$/g, '')
    .replace(/,{2,}/g, ',')
    .trim()
  if (rem && rem !== '-') result.tole = rem

  return result
}
