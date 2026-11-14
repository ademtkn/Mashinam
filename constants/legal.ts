import type { Lang } from './i18n';

// The operator is a placeholder ("X") until the real company is registered.
// Keep this file as the single source of truth for the in-app legal texts.
// The texts are a product draft, not legal advice: a Kyrgyz lawyer should
// review them before the app is published. See HANDOFF.md.
export const LEGAL_COMPANY = 'X';
export const LEGAL_EMAIL = 'admin@mashinam.kg';
export const LEGAL_UPDATED = '14.11.2026';

export type LegalDocId = 'privacy' | 'terms';

export interface LegalSection {
  title: string;
  body: string[];
}

export interface LegalDoc {
  title: string;
  intro: string;
  sections: LegalSection[];
  footer: string;
}

type LegalSet = Record<LegalDocId, LegalDoc>;

const RU: LegalSet = {
  privacy: {
    title: 'Политика конфиденциальности',
    intro:
      'Эта Политика объясняет, какие данные Mashinam собирает, зачем и как вы можете ими управлять. Оператор сервиса — X (далее «мы»), Бишкек, Кыргызская Республика. Контакт: admin@mashinam.kg.',
    sections: [
      {
        title: '1. Какие данные мы обрабатываем',
        body: [
          'Аккаунт: имя, номер телефона и необязательный e-mail.',
          'Действия в приложении: избранное, просмотренные объявления, выбранный язык, настройки уведомлений.',
          'Объявления: марка, модель, год, цена, пробег, город, фото и видео, телефон/WhatsApp продавца.',
          'Технические данные: тип устройства, версия операционной системы, журналы ошибок (когда будет подключена аналитика).',
          'Мы не получаем доступ к вашим контактам, галерее или геолокации без отдельного разрешения.',
        ],
      },
      {
        title: '2. Зачем мы это делаем',
        body: [
          'Чтобы создать аккаунт и синхронизировать избранное.',
          'Чтобы показать объявление и дать покупателям возможность связаться с продавцом.',
          'Для безопасности, борьбы со спамом и мошенничеством, а также поддержки.',
          'Чтобы улучшать ленту и отправлять уведомления — только с вашего согласия.',
        ],
      },
      {
        title: '3. Правовые основания',
        body: [
          'Ваше согласие; исполнение договора; законные интересы (безопасность и улучшение сервиса); требования закона.',
          'Обработка регулируется Законом Кыргызской Республики «О персональных данных» (№ 58 от 2008 года, с изменениями 2022 года).',
        ],
      },
      {
        title: '4. Публичный телефон и WhatsApp',
        body: [
          'Если вы публикуете объявление, ваш телефон/WhatsApp показывается в объявлении и доступен всем пользователям. Мы публикуем его только с вашим отдельным согласием, которое вы подтверждаете при отправке объявления.',
          'Вы можете отозвать согласие, попросив удалить объявление или аккаунт. Объявление будет снято, но копии у третьих лиц (например, в WhatsApp) мы контролировать не можем.',
        ],
      },
      {
        title: '5. Передача и хранение',
        body: [
          'Данные могут обрабатываться на серверах за пределами Кыргызстана (хостинг, CDN, база данных). Мы принимаем договорные и технические меры защиты.',
          'Аккаунт хранится до удаления. Объявление показывается 15 дней, затем снимается; данные удаляются или обезличиваются в разумный срок, если закон не требует иного.',
          'Пароли мы не храним: вход выполняется по одноразовому коду.',
        ],
      },
      {
        title: '6. Ваши права',
        body: [
          'Вы можете запросить доступ, исправление, удаление или ограничение обработки, отозвать согласие и подать жалобу в уполномоченный орган Кыргызской Республики.',
          `Запросы: ${LEGAL_EMAIL}. Мы отвечаем в срок, установленный законом.`,
        ],
      },
      {
        title: '7. Дети и изменения',
        body: [
          'Сервис не предназначен для лиц младше 18 лет.',
          'Мы можем обновлять Политику. Новая версия публикуется в приложении с датой вступления в силу.',
        ],
      },
    ],
    footer: `Оператор: ${LEGAL_COMPANY}, Бишкек, Кыргызская Республика. Контакт: ${LEGAL_EMAIL}. Дата: ${LEGAL_UPDATED}.`,
  },
  terms: {
    title: 'Пользовательское соглашение',
    intro:
      'Используя Mashinam, вы соглашаетесь с этими условиями. Сервис соединяет покупателей и продавцов автомобилей; мы не участвуем в сделке и не принимаем платежи.',
    sections: [
      {
        title: '1. Сервис',
        body: [
          'Mashinam — информационная площадка. Объявления публикует администрация по заявке продавца.',
          'Сервис бесплатный: платных размещений и комиссий сейчас нет.',
        ],
      },
      {
        title: '2. Кто может пользоваться',
        body: [
          'Лица 18 лет и старше; достоверные данные; один аккаунт на человека; вы отвечаете за свой номер телефона.',
        ],
      },
      {
        title: '3. Объявления и контент',
        body: [
          'Продавец подтверждает, что фото и видео принадлежат ему, автомобиль не в залоге и не украден, а данные верны.',
          'Запрещено: мошенничество, введение в заблуждение, скрученный пробег, скрытые ДТП, незаконные автомобили, оскорбления и спам.',
          'Мы можем отклонить или снять объявление. Срок показа — 15 дней.',
        ],
      },
      {
        title: '4. Связь и безопасность',
        body: [
          'Телефон/WhatsApp продавца виден покупателям с согласия продавца.',
          'Мы не гарантируем сделку, состояние автомобиля и личность продавца. Проверяйте документы, VIN и СТС; не отправляйте предоплату.',
          `Жалобы: ${LEGAL_EMAIL}. Мы реагируем и можем заблокировать нарушителя.`,
        ],
      },
      {
        title: '5. Интеллектуальная собственность',
        body: [
          'Контент приложения принадлежит X и лицензиарам; фото продавца принадлежат продавцу. Размещая фото, вы даёте нам лицензию на их показ в сервисе.',
        ],
      },
      {
        title: '6. Ответственность',
        body: [
          'Сервис предоставляется «как есть». Мы не отвечаем за убытки от сделок, действия пользователей и перерывы в работе.',
          'Мы можем менять или приостанавливать работу сервиса.',
        ],
      },
      {
        title: '7. Изменения и применимое право',
        body: [
          'Условия могут меняться; новая версия публикуется в приложении.',
          'Применимое право — Кыргызская Республика. Споры рассматриваются судами Бишкека.',
        ],
      },
    ],
    footer: `Оператор: ${LEGAL_COMPANY}. Контакт: ${LEGAL_EMAIL}. Дата: ${LEGAL_UPDATED}.`,
  },
};

const KY: LegalSet = {
  privacy: {
    title: 'Купуялуулук политикасы',
    intro:
      'Бул документ Mashinam кандай маалыматтарды чогултарын, эмне үчүн жана сиз аны кантип башкара аларыңызды түшүндүрөт. Оператор — X (мындан ары «биз»), Бишкек, Кыргыз Республикасы. Байланыш: admin@mashinam.kg.',
    sections: [
      {
        title: '1. Кандай маалыматтарды иштетебиз',
        body: [
          'Аккаунт: атыңыз, телефон номериңиз жана милдеттүү эмес e-mail.',
          'Колдонмодогу аракеттер: тандалмалар, көрүлгөн жарыялар, тандалган тил, билдирме жөндөөлөрү.',
          'Жарыялар: марка, модель, жыл, баа, жүрүш, шаар, сүрөт жана видео, сатуучунун телефону/WhatsApp.',
          'Техникалык маалымат: түзмөк түрү, операциялык системанын версиясы, ката журналдары (аналитика кошулганда).',
          'Биз сиздин байланыштарыңызга, галереяңызга же геолокацияңызга өзүнчө уруксатсыз кирбейбиз.',
        ],
      },
      {
        title: '2. Эмне үчүн',
        body: [
          'Аккаунт түзүү жана тандалмаларды синхрондоо үчүн.',
          'Жарыяны көрсөтүү жана сатып алуучуларга сатуучу менен байланышууга мүмкүндүк берүү үчүн.',
          'Коопсуздук, спам жана алдамчылык менен күрөшүү, колдоо үчүн.',
          'Лентаны жакшыртуу жана билдирмелерди жөнөтүү үчүн — сиздин макулдугуңуз менен гана.',
        ],
      },
      {
        title: '3. Укуктук негиздер',
        body: [
          'Сиздин макулдугуңуз; келишимди аткаруу; мыйзамдуу кызыкчылыктар (коопсуздук жана сервисти жакшыртуу); мыйзам талаптары.',
          'Иштетүү Кыргыз Республикасынын «Жеке маалыматтар жөнүндө» мыйзамына (2008-жыл, № 58, 2022-жылдагы өзгөртүүлөр менен) ылайык жүргүзүлөт.',
        ],
      },
      {
        title: '4. Ачык телефон жана WhatsApp',
        body: [
          'Эгер жарыя жарыяласаңыз, телефонуңуз/WhatsApp жарыяда көрсөтүлөт жана бардык колдонуучуларга жеткиликтүү болот. Биз аны жарыяны жөнөтүүдөгү өзүнчө макулдугуңуз менен гана жарыялайбыз.',
          'Макулдугуңузду жарыяны же аккаунтту өчүрүүнү сурап кайтарып алсаңыз болот. Жарыя алынат, бирок WhatsApp сыяктуу үчүнчү тараптардагы көчүрмөлөрдү көзөмөлдөй албайбыз.',
        ],
      },
      {
        title: '5. Берилүү жана сактоо',
        body: [
          'Маалыматтар Кыргызстандан тышкары серверлерде иштетилиши мүмкүн (хостинг, CDN, маалымат базасы). Биз келишимдик жана техникалык коргоо чараларын көрөбүз.',
          'Аккаунт өчүрүлгөнгө чейин сакталат. Жарыя 15 күн көрсөтүлөт, анан алынат; маалымат мыйзам талап кылбаса, акылга сыярлык мөөнөттө өчүрүлөт же анонимдештирилет.',
          'Сырсөздөрдү сактабайбыз: кирүү бир жолу колдонулуучу код менен.',
        ],
      },
      {
        title: '6. Сиздин укуктарыңыз',
        body: [
          'Кирүү, оңдоо, өчүрүү, чектөө, макулдукту кайтарып алуу жана Кыргыз Республикасынын ыйгарым укуктуу органына кайрылуу.',
          `Сурамдар: ${LEGAL_EMAIL}. Мыйзамда белгиленген мөөнөттө жооп беребиз.`,
        ],
      },
      {
        title: '7. Балдар жана өзгөртүүлөр',
        body: [
          'Сервис 18 жашка чейинкилер үчүн эмес.',
          'Политиканы жаңырта алабыз. Жаңы версия колдонмодо күчүнө кирген датасы менен жарыяланат.',
        ],
      },
    ],
    footer: `Оператор: ${LEGAL_COMPANY}, Бишкек, Кыргыз Республикасы. Байланыш: ${LEGAL_EMAIL}. Дата: ${LEGAL_UPDATED}.`,
  },
  terms: {
    title: 'Колдонуучу келишими',
    intro:
      'Mashinamды колдонуу менен бул шарттарга макул болосуз. Сервис унаа сатып алуучулар менен сатуучуларды байланыштырат; биз бүтүмгө катышпайбыз жана төлөм кабыл албайбыз.',
    sections: [
      {
        title: '1. Сервис',
        body: [
          'Mashinam — маалыматтык аянтча. Жарыяларды администрация сатуучунун өтүнүчү боюнча жарыялайт.',
          'Сервис акысыз: азыркы учурда акы төлөнүүчү жайгаштыруу жана комиссия жок.',
        ],
      },
      {
        title: '2. Ким колдонсо болот',
        body: [
          '18 жаш жана андан улуулар; так маалымат; бир адамга бир аккаунт; телефон номериңиз үчүн сиз жооп бересиз.',
        ],
      },
      {
        title: '3. Жарыялар жана контент',
        body: [
          'Сатуучу сүрөт жана видео өзүнүкү экенин, унаа күрөөгө коюлбаганын жана уурдалбаганын, маалымат туура экенин тастыктайт.',
          'Тыюу салынат: алдамчылык, жаңылыштыруу, жүрүштү бурмалоо, жашыруун ЖКО, мыйзамсыз унаалар, балакат жана спам.',
          'Биз жарыяны четке кага алабыз же алып сала алабыз. Көрсөтүү мөөнөтү — 15 күн.',
        ],
      },
      {
        title: '4. Байланыш жана коопсуздук',
        body: [
          'Сатуучунун телефону/WhatsApp сатып алуучуларга сатуучунун макулдугу менен көрүнөт.',
          'Биз бүтүмгө, унаанын абалына жана сатуучунун инсандыгына кепилдик бербейбиз. Документтерди, VIN жана СТС текшериңиз; алдын ала төлөм жөнөтпөңүз.',
          `Даттануу: ${LEGAL_EMAIL}. Жооп беребиз жана бузуучуну блоктой алабыз.`,
        ],
      },
      {
        title: '5. Интеллектуалдык менчик',
        body: [
          'Колдонмонун контенти X жана лицензиарларга таандык; сатуучунун сүрөттөрү сатуучуга таандык. Сүрөттөрдү жарыялоо менен бизге аларды сервисте көрсөтүү лицензиясын бересиз.',
        ],
      },
      {
        title: '6. Жоопкерчилик',
        body: [
          'Сервис «бар боюнча» берилет. Бүтүмдөн, колдонуучулардын аракетинен жана иштин үзгүлтүгүнөн келген зыян үчүн жооп бербейбиз.',
          'Сервистин ишин өзгөртө же токтото алабыз.',
        ],
      },
      {
        title: '7. Өзгөртүүлөр жана колдонулуучу укук',
        body: [
          'Шарттар өзгөрүшү мүмкүн; жаңы версия колдонмодо жарыяланат.',
          'Колдонулуучу укук — Кыргыз Республикасы. Талаштар Бишкек сотторунда каралат.',
        ],
      },
    ],
    footer: `Оператор: ${LEGAL_COMPANY}. Байланыш: ${LEGAL_EMAIL}. Дата: ${LEGAL_UPDATED}.`,
  },
};

const TR: LegalSet = {
  privacy: {
    title: 'Gizlilik Politikası',
    intro:
      "Bu politika, Mashinam'ın hangi verileri topladığını, neden topladığını ve bunları nasıl yönetebileceğinizi açıklar. Hizmetin işletmecisi X'tir (bundan sonra “biz”), Bişkek, Kırgızistan. İletişim: admin@mashinam.kg.",
    sections: [
      {
        title: '1. İşlediğimiz veriler',
        body: [
          'Hesap: ad, telefon numarası ve isteğe bağlı e-posta.',
          'Uygulama içi etkileşim: favoriler, görüntülenen ilanlar, seçilen dil, bildirim tercihleri.',
          'İlanlar: marka, model, yıl, fiyat, kilometre, şehir, fotoğraf ve video, satıcının telefonu/WhatsApp’ı.',
          'Teknik veriler: cihaz türü, işletim sistemi sürümü, hata kayıtları (analitik eklendiğinde).',
          'Rehberinize, galerinize veya konumunuza ayrı izin olmadan erişmeyiz.',
        ],
      },
      {
        title: '2. Neden işliyoruz',
        body: [
          'Hesap oluşturmak ve favorileri senkronize etmek için.',
          'İlanı göstermek ve alıcıların satıcıyla iletişim kurmasını sağlamak için.',
          'Güvenlik, spam ve dolandırıcılıkla mücadele ve destek için.',
          'Akışı iyileştirmek ve bildirim göndermek için — yalnızca onayınızla.',
        ],
      },
      {
        title: '3. Hukuki dayanak',
        body: [
          'Açık rızanız; sözleşmenin ifası; meşru menfaatler (güvenlik ve hizmeti geliştirme); yasal yükümlülükler.',
          "İşleme, Kırgız Cumhuriyeti Kişisel Verilerin Korunması Kanunu'na (2008, No. 58; 2022 değişiklikleri) tabidir.",
        ],
      },
      {
        title: '4. Herkese açık telefon ve WhatsApp',
        body: [
          'İlan verirseniz telefon/WhatsApp numaranız ilanda gösterilir ve tüm kullanıcılar görebilir. Bunu yalnızca ilan gönderirken verdiğiniz ayrı rızayla yayınlarız.',
          'Rızanızı geri çekebilir, ilanın veya hesabın silinmesini isteyebilirsiniz. İlan kaldırılır; ancak WhatsApp gibi üçüncü taraflardaki kopyaları kontrol edemeyiz.',
        ],
      },
      {
        title: '5. Aktarım ve saklama',
        body: [
          'Veriler Kırgızistan dışındaki sunucularda işlenebilir (barındırma, CDN, veritabanı). Sözleşmesel ve teknik koruma önlemleri alırız.',
          'Hesap, silinene kadar saklanır. İlan 15 gün gösterilir, sonra kaldırılır; veriler yasal bir zorunluluk yoksa makul sürede silinir veya anonimleştirilir.',
          'Şifre saklamayız: giriş tek kullanımlık kod ile yapılır.',
        ],
      },
      {
        title: '6. Haklarınız',
        body: [
          'Erişim, düzeltme, silme, kısıtlama, rızayı geri çekme ve Kırgız Cumhuriyeti’nin yetkili kurumuna şikâyet.',
          `Talepler: ${LEGAL_EMAIL}. Yasada belirtilen sürede yanıtlarız.`,
        ],
      },
      {
        title: '7. Çocuklar ve değişiklikler',
        body: [
          'Hizmet 18 yaşından küçükler için değildir.',
          'Politikayı güncelleyebiliriz. Yeni sürüm, yürürlük tarihiyle uygulamada yayınlanır.',
        ],
      },
    ],
    footer: `İşletmeci: ${LEGAL_COMPANY}, Bişkek, Kırgızistan. İletişim: ${LEGAL_EMAIL}. Tarih: ${LEGAL_UPDATED}.`,
  },
  terms: {
    title: 'Kullanım Şartları',
    intro:
      "Mashinam'ı kullanarak bu şartları kabul etmiş olursunuz. Hizmet, araç alıcıları ile satıcıları buluşturur; biz satışa taraf değiliz ve ödeme almayız.",
    sections: [
      {
        title: '1. Hizmet',
        body: [
          'Mashinam bir bilgi platformudur. İlanları yönetim, satıcının talebi üzerine yayınlar.',
          'Hizmet ücretsizdir; şu an ücretli yayın veya komisyon yoktur.',
        ],
      },
      {
        title: '2. Kimler kullanabilir',
        body: [
          '18 yaş ve üzeri; doğru bilgi; kişi başına bir hesap; telefon numaranızdan siz sorumlusunuz.',
        ],
      },
      {
        title: '3. İlanlar ve içerik',
        body: [
          'Satıcı, fotoğraf ve videonun kendisine ait olduğunu, aracın rehinli veya çalıntı olmadığını, bilgilerin doğru olduğunu kabul eder.',
          'Yasak: dolandırıcılık, yanıltma, kilometre düşürme, gizlenmiş kaza, yasa dışı araç, hakaret ve spam.',
          'İlanı reddedebilir veya kaldırabiliriz. Gösterim süresi 15 gündür.',
        ],
      },
      {
        title: '4. İletişim ve güvenlik',
        body: [
          'Satıcının telefon/WhatsApp numarası, satıcının rızasıyla alıcılara görünür.',
          'Satışa, aracın durumuna veya satıcının kimliğine garanti vermeyiz. Belgeleri, VIN’i ve ruhsatı kontrol edin; ön ödeme göndermeyin.',
          `Şikâyet: ${LEGAL_EMAIL}. Yanıt verir ve ihlalde bulunan hesabı engelleyebiliriz.`,
        ],
      },
      {
        title: '5. Fikri mülkiyet',
        body: [
          "Uygulama içeriği X'e ve lisans verenlere aittir; satıcı fotoğrafları satıcıya aittir. Fotoğrafları yayınlayarak bize hizmette gösterme lisansı verirsiniz.",
        ],
      },
      {
        title: '6. Sorumluluk',
        body: [
          "Hizmet “olduğu gibi” sunulur. Satışlardan, kullanıcı davranışlarından ve kesintilerden doğan zararlardan sorumlu değiliz.",
          'Hizmeti değiştirebilir veya askıya alabiliriz.',
        ],
      },
      {
        title: '7. Değişiklikler ve uygulanacak hukuk',
        body: [
          'Şartlar değişebilir; yeni sürüm uygulamada yayınlanır.',
          'Uygulanacak hukuk Kırgız Cumhuriyeti’dir. Uyuşmazlıklarda Bişkek mahkemeleri yetkilidir.',
        ],
      },
    ],
    footer: `İşletmeci: ${LEGAL_COMPANY}. İletişim: ${LEGAL_EMAIL}. Tarih: ${LEGAL_UPDATED}.`,
  },
};

export const LEGAL: Record<Lang, LegalSet> = { ru: RU, ky: KY, tr: TR };
