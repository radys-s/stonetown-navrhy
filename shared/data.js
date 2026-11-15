/* Demo data layer. In production this file is replaced by queries to the database
   (tables programs, terms, events — see docs/plan.md, section 4).
   Sources for every fact: docs/research.md. Terms are sample dates for the demo. */
window.ST = window.ST || {};

ST.programs = [
  {
    id: 'vyuka',
    audience: 'skola',
    audienceLabel: 'Školy a školky',
    title: 'Výuka o Divokém západě',
    summary: 'Prohlídka městečka s výkladem o osidlování Západu a o indiánech. Děti si pak všechno zkusí samy.',
    activities: ['Prohlídka s výkladem', 'Rýžování zlata', 'Střelba z luku', 'Házení lasem', 'Pracovní listy'],
    duration: 'asi 3 hodiny',
    priceFrom: 150,
    priceTo: 250,
    priceNote: 'za dítě podle velikosti skupiny, doprovod zdarma',
    min: 10,
    max: 60
  },
  {
    id: 'dobrodruzstvi',
    audience: 'skola',
    audienceLabel: 'Školy a školky',
    title: 'Dobrodružný den pro třídu',
    summary: 'Westernové disciplíny, týmové hry a soutěže. Na závěr tvořivá dílna podle věku dětí.',
    activities: ['Luk, nůž, tomahawk, podkova', 'Laso a bič', 'Týmové soutěže', 'Dílna: kůže, papír, provazy'],
    duration: 'asi 3 hodiny',
    priceFrom: 150,
    priceTo: 250,
    priceNote: 'za dítě podle velikosti skupiny, doprovod zdarma',
    min: 10,
    max: 60
  },
  {
    id: 'tabor',
    audience: 'tabor',
    audienceLabel: 'Tábory a oddíly',
    title: 'Tábor plný dobrodružství',
    summary: 'Pro oddíly a táborové skupiny, v létě i během roku. Spí se ve srubech, večer hoří táborák.',
    activities: ['Přespání ve srubech', 'Táborák', 'Celodenní program ve městečku'],
    duration: 'víkend až týden',
    priceFrom: null,
    priceTo: null,
    priceNote: 'cenu připravíme podle počtu nocí a lidí',
    min: 10,
    max: 70
  },
  {
    id: 'namiru',
    audience: 'skupina',
    audienceLabel: 'Firmy, oslavy, LARP, natáčení',
    title: 'Program podle vás',
    summary: 'Celé městečko pro vaši akci. Banka, úřad šerifa, kasino i kostel jsou funkční domy, ne kulisy.',
    activities: ['Pronájem městečka', 'Westernové disciplíny s instruktorem', 'Kavárna a General Store'],
    duration: 'podle domluvy',
    priceFrom: null,
    priceTo: null,
    priceNote: 'cenu připravíme podle rozsahu akce',
    min: 8,
    max: 150
  }
];

/* status: volno | posledni | obsazeno */
ST.terms = [
  { id: 't1', programs: ['vyuka', 'dobrodruzstvi'], date: '2027-05-18', status: 'volno' },
  { id: 't2', programs: ['vyuka', 'dobrodruzstvi'], date: '2027-05-20', status: 'posledni' },
  { id: 't3', programs: ['vyuka', 'dobrodruzstvi'], date: '2027-05-25', status: 'obsazeno' },
  { id: 't4', programs: ['vyuka', 'dobrodruzstvi'], date: '2027-05-27', status: 'volno' },
  { id: 't5', programs: ['vyuka', 'dobrodruzstvi'], date: '2027-06-01', status: 'obsazeno' },
  { id: 't6', programs: ['vyuka', 'dobrodruzstvi'], date: '2027-06-03', status: 'volno' },
  { id: 't7', programs: ['vyuka', 'dobrodruzstvi'], date: '2027-06-08', status: 'posledni' },
  { id: 't8', programs: ['vyuka', 'dobrodruzstvi'], date: '2027-06-10', status: 'volno' },
  { id: 't9', programs: ['vyuka', 'dobrodruzstvi'], date: '2027-06-15', status: 'volno' },
  { id: 't10', programs: ['vyuka', 'dobrodruzstvi'], date: '2027-06-17', status: 'obsazeno' }
];

/* The 2026 programme as published on stonetown.cz/program.html. */
ST.events = [
  {
    from: '2026-05-25', to: '2026-06-21', title: 'Školní výlety',
    text: 'Pro mateřské, základní i střední školy. Program si sestavíte podle sebe.', open: 'na objednání'
  },
  {
    from: '2026-06-06', to: null, title: 'Jarní cena W-clubu',
    text: 'Soutěž v ovládání biče a lasa, v hodu nožem a tomahawkem a ve střelbě z luku. Dobové oblečení je vítáno.', open: 'pro veřejnost'
  },
  {
    from: '2026-09-05', to: null, title: 'Zvířecí cena, podzimní část',
    text: 'Osmý ročník. Luk, nůž, tomahawk, křesadlo, rýžování, podkova, laso a bič. Večer zábava a předání poháru.', open: 'pro veřejnost'
  },
  {
    from: '2026-10-15', to: '2026-10-25', title: 'LARP Black Hill 2026',
    text: 'Městečko ožije westernovým příběhem. Vstup jen na zvláštní povolení.', open: 'zavřeno pro veřejnost'
  }
];

ST.contact = {
  name: 'Westernové městečko Stonetown, z.s.',
  street: 'Kamenice 103',
  city: '582 55 Herálec',
  email: 'info@stonetown.cz',
  emailCamp: 'tabor@stonetown.cz',
  phone: '+420 776 706 191',
  phoneHref: '+420776706191',
  map: 'https://www.google.com/maps/search/?api=1&query=49.52155%2C15.41825',
  instagram: 'https://www.instagram.com/stonetown_wm/',
  facebook: 'https://www.facebook.com/p/Westernov%C3%A9-m%C4%9Bste%C4%8Dko-Stonetown-100056993868302/'
};
