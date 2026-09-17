export interface GenreFaq {
  q: string;
  a: string;
}

export interface GenreContent {
  intro: string[];
  faq: GenreFaq[];
}

export const GENRE_CONTENT: Record<string, GenreContent> = {
  action: {
    intro: [
      'Action anime centers on high-stakes combat, martial arts, and fights where the outcome of a battle can change the world. Expect choreographed clashes, superhuman abilities, and heroes who train, break limits, and protect what matters to them.',
      'The best action shows pair spectacle with stakes you actually care about. Whether it is a shonen tournament arc, a samurai duel, or a hero pushing past their own limits, MikuAnime keeps the complete catalog — with scores, rankings, and release info — so you can find the next fight worth watching.',
    ],
    faq: [
      { q: 'What are the best action anime to start with?', a: 'A classic entry point is Fullmetal Alchemist: Brotherhood, but the most-watched action series on MikuAnime are Attack on Titan, Demon Slayer, and Jujutsu Kaisen — all offer strong choreography and arc-based storytelling.' },
      { q: 'Is action anime only for teenagers?', a: 'No. While many action anime are shonen titles aimed at teens, plenty of seinen action series — like Vinland Saga or Hell\'s Paradise — target adult audiences with heavier themes and denser plots.' },
    ],
  },
  adventure: {
    intro: [
      'Adventure anime follows characters into unknown territory — new continents, mysterious dungeons, or fantasy worlds far from home. The genre thrives on exploration, discovery, and the journey itself rather than a single destination.',
      'From shonen quests across kingdoms to isekai odysseys, adventure anime rewards patience with world-building and character growth. MikuAnime groups them by season and popularity so you can chart your own route through the best expeditions.',
    ],
    faq: [
      { q: 'What makes a great adventure anime?', a: 'A memorable cast, an unfamiliar world, and a goal that keeps the story moving. Classics like One Piece and Made in Abyss are loved for exactly that — a journey as intriguing as its destination.' },
      { q: 'Are adventure and fantasy anime the same?', a: 'They overlap but are not identical. Adventure prioritizes travel and exploration, while fantasy centers on magic or supernatural settings. Many series — such as Frieren: Beyond Journey\'s End — belong to both.' },
    ],
  },
  comedy: {
    intro: [
      'Comedy anime exists to make you laugh — through absurd situations, witty banter, parody, running gags, and characters whose personalities collide in perfectly awkward ways.',
      'Comedy is one of the most reliable genres to binge: episodes are tight, jokes land fast, and the best series build humor on strong character chemistry instead of cheap repetition. Browse the comedy ranking on MikuAnime to find the current fan favorites.',
    ],
    faq: [
      { q: 'What is the funniest anime right now?', a: 'Fan favorites vary by season, but consistently top-rated comedy series include Kaguya-sama: Love Is War, Gintama, Spy x Family, and our top rated list updates with what the community scores highest.' },
      { q: 'Do I need to know Japanese anime tropes to enjoy comedy anime?', a: 'A little context helps, but the strongest comedy writing works on universal humor. Love-com trophy satire, workplace comedy, and parody shows land fine for new watchers.' },
    ],
  },
  drama: {
    intro: [
      'Drama anime puts emotion first — grief, ambition, love, betrayal — and lets characters change slowly through believable conflict. It is the genre for stories that stay with you after the credits roll.',
      'Some of anime\'s most acclaimed work lives here: character studies, slice-of-life crises, and romantic tragedies. If you want something substantive without fantasy trappings, the drama tag on MikuAnime is your starting point.',
    ],
    faq: [
      { q: 'What is a good drama anime for someone new to the genre?', a: 'Your Lie in April and A Silent Voice are frequent entry points — both center on heavy emotional themes with gorgeous production. Our drama ranking surfaces the community\'s highest-scored series.' },
      { q: 'Are drama anime sad?', a: 'Not always, but grief and loss are common engines for drama. Series like March Comes in Like a Lion balance melancholy with warmth, so drama anime can leave you hopeful rather than drained.' },
    ],
  },
  ecchi: {
    intro: [
      'Ecchi anime uses risqué humor, provocative visuals, and playful scenarios for comedy and romance rather than explicit content. It is firmly a comedy-romance-adjacent genre aimed at older teens and adults.',
      'Popular ecchi titles mix fanservice with genuine humor and romance, and many — like Dress-Up Darling — are acclaimed for the relationship and craft behind the comedy. MikuAnime categorizes ecchi separately so it stays easy to browse or skip.',
    ],
    faq: [
      { q: 'What are the most popular ecchi anime?', a: 'Dress-Up Darling, Food Wars! (as comedy), High School DxD, and Prison School are among the most-watched. Browsing the ecchi ranking on MikuAnime shows what fans rate highest this season.' },
      { q: 'Is ecchi the same as adult anime (hentai)?', a: 'No. Ecchi teases but stays non-explicit and typically comedy or romance, while hentai is explicit adult content — which is not part of the MikuAnime catalog.' },
    ],
  },
  fantasy: {
    intro: [
      'Fantasy anime builds worlds where magic works, mythical creatures roam, and ordinary rules bend. From high-fantasy kingdoms to isekai reincarnations, it is the genre of imagination with the widest variety of flavors.',
      'Isekai, dark fantasy, and adventure fantasy all fall under this umbrella. Whether you want epic world-saving arcs or cozy magical slice-of-life, the fantasy tag lets you filter the full catalog by score and season.',
    ],
    faq: [
      { q: 'What is the difference between fantasy and isekai anime?', a: 'Isekai is a subgenre of fantasy where a character travels to another world — often summoned or reincarnated. Not every fantasy anime is isekai, but almost every isekai is fantasy.' },
      { q: 'What fantasy anime should a new fan watch first?', a: 'Frieren: Beyond Journey\'s End and Fullmetal Alchemist: Brotherhood are the safest first steps — rich worlds with tight storytelling. The fantasy ranking on MikuAnime updates weekly with user scores.' },
    ],
  },
  horror: {
    intro: [
      'Horror anime specializes in dread — ghosts, curses, psychological torment, and the slow realization that something is deeply wrong. It relies heavily on atmosphere and pacing.',
      'The genre spans splatter series, supernatural thrillers, and unsettling mysteries. If you want to be genuinely unsettled rather than just scared, horror anime rewards patient viewers who let tension build.',
    ],
    faq: [
      { q: 'What is the scariest anime ever made?', a: 'Rankings vary, but the usual candidates are Another, Higurashi: When They Cry, and the psychological terror of Mononoke. Our horror ranking tags show what users rate as most disturbing this year.' },
      { q: 'Can horror anime work in short episodes?', a: 'Yes — the horror anthology Junji Ito Maniac and short OVAs are built around dread that hits fast. Horror can land in a single episode when the atmosphere earns it.' },
    ],
  },
  'mahou-shoujo': {
    intro: [
      'Mahou shoujo — magical girl — anime centers on girls who gain magical powers, transform, and fight darkness while balancing ordinary school life. It is one of anime\'s most iconic genres, and deeper than its sparkly surface suggests.',
      'The classic formula of transformation sequences and magical mascots coexists with modern deconstructions like Madoka Magica that subvert expectations. MikuAnime keeps the range — from lighthearted classics to dark twists — in one place.',
    ],
    faq: [
      { q: 'Is mahou shoujo a genre only for girls?', a: 'It originated as a shoujo genre, but modern magical-girl series have a wide audience. Deconstructions like Puella Magi Madoka Magica are praised well beyond the traditional demographic.' },
      { q: 'What is the best magical girl anime for adults?', a: 'Puella Magi Madoka Magica and Revolutionary Girl Utena tackle mature themes, while Kill La Kill brings over-the-top action energy. Browse the mahou shoujo tag to sort by rating.' },
    ],
  },
  mecha: {
    intro: [
      'Mecha anime revolves around piloted giant robots, blending military sci-fi, engineering, and human drama. The machines are characters in their own right, and the best series ask questions about war, identity, and technology.',
      'From classic super-robot shows to grounded military realism, mecha scales from space opera to intimate drama. Two of anime\'s most celebrated works — Neon Genesis Evangelion and Mobile Suit Gundam — live here.',
    ],
    faq: [
      { q: 'Do I need to watch Gundam in release order?', a: 'No. Gundam has multiple timelines; many fans start with standalone series like Mobile Suit Gundam: Iron-Blooded Orphans or Gundam SEED before exploring the Universal Century.' },
      { q: 'Is mecha anime only about giant robots?', a: 'Giant robots are the premise, but the genre is really about pilots and politics. Evangelion is famous for psychological drama far more than for robot combat.' },
    ],
  },
  music: {
    intro: [
      'Music anime builds stories around bands, idols, orchestras, and competitions — performance, practice, and that moment on stage when it all clicks.',
      'The genre is a perfect way to discover both animation and new music. Whether you want a competitive-school drama like Your Lie in April or pop-idol energy like Love Live!, the music tag on MikuAnime collects the standouts.',
    ],
    faq: [
      { q: 'What are the most acclaimed music anime?', a: 'Your Lie in April, Vivy: Fluorite Eye\'s Song, K-On!, and the Bocchi the Rock! crowd favorite all sit at the top of the music rankings.' },
      { q: 'Do I need to like music to enjoy music anime?', a: 'Not really. The best music anime use performance as a catalyst for character growth and emotion, so even casual listeners get invested in the stories.' },
    ],
  },
  mystery: {
    intro: [
      'Mystery anime invites you to solve something — a crime, a disappearance, a secret society, or a puzzle left by the past. Clues are planted, red herrings are laid, and the reveal only works if the setup was fair.',
      'Many mystery series cross into psychological and thriller territory, and the genre rewards attention to detail. If you like being one step ahead of the detectives, tracking cases on the MikuAnime mystery tag is a good first move.',
    ],
    faq: [
      { q: 'What is the best mystery anime made?', a: 'Death Note, Monster, and Erased are the usual top three — each approaches mystery differently, from serial-killer hunts to time-loop investigations. Check the mystery ranking for current favorites.' },
      { q: 'Are mystery anime hard to follow?', a: 'Some are dense — like Monster — but many are designed for casual viewing. Erased and Steins;Gate balance intrigue with emotional payoff that keeps newcomers engaged.' },
    ],
  },
  psychological: {
    intro: [
      'Psychological anime gets inside the head — paranoia, moral dilemmas, manipulation, and characters pushed to their breaking point. It trades explosions for uneasy atmosphere and makes you question who, if anyone, is in the right.',
      'This is where anime feels closest to high-stakes literary fiction. Mind games, unreliable narrators, and brutal fascinations make this tag a favorite for viewers who want to think while they watch.',
    ],
    faq: [
      { q: 'What is the most disturbing psychological anime?', a: 'Common answers include the end of Neon Genesis Evangelion, Monster, and the spiral into madness in Death Note. Read the tags and user ratings on each title before jumping in.' },
      { q: 'Is psychological anime suitable for everyone?', a: 'Many psychological titles explore trauma and extreme situations and carry higher age ratings. We recommend checking the rating badge on each series page on MikuAnime before watching.' },
    ],
  },
  romance: {
    intro: [
      'Romance anime is about the slow, awkward, wonderful process of two people closing the distance between them. Crushes, confessions, misunderstandings, and growth — often across an entire season or more.',
      'Subgenres include school romance, rom-coms, romances with fantasy or sci-fi frames, and slow-burn adult love stories. For scenes that make you grin on the couch, the romance tag is the place to browse.',
    ],
    faq: [
      { q: 'What is the best romance anime with a satisfying ending?', a: 'Horimiya, My Dress-Up Darling, and Kaguya-sama: Love Is War are praised for payoff and warmth. Fan favorites shift each season, so the romance ranking is a great compass.' },
      { q: 'Are there romance anime for adults rather than school settings?', a: 'Yes — Wotakoi, Tsuki ga Kirei, and insomniac-students stories aside, plenty of romance anime are set in workplaces and adult life. Filter the romance tag by status and year to narrow it down.' },
    ],
  },
  'sci-fi': {
    intro: [
      'Sci-fi anime engages with technology, space, and the future — but the best examples ask questions about humanity first. Artificial intelligence, time travel, cyberpunk cities, and interstellar politics are all home turf.',
      'Whether it is cerebral hard sci-fi or space opera, sci-fi anime tends to reward rewatching because the details matter. The sci-fi tag on MikuAnime sorts the sprawling catalogue from philosophy-heavy classics to neon action.',
    ],
    faq: [
      { q: 'What is the best sci-fi anime for newcomers?', a: 'Steins;Gate (time travel), Cowboy Bebop (space noir), and Violet Evergarden (humanity in an artificial soldier) are approachable, high-scoring entry points.' },
      { q: 'What is the difference between hard sci-fi and sci-fi anime generally?', a: 'Hard sci-fi tries to stay scientifically plausible, while most sci-fi anime — like most sci-fi film — use futuristic elements as a stage for story. Interstellar anime sits comfortably in the more flexible end.' },
    ],
  },
  'slice-of-life': {
    intro: [
      'Slice-of-life anime finds drama and warmth in ordinary days — school clubs, shared meals, seasonal changes, and quiet conversations. There is no world to save; the point is the texture of living.',
      'It is one of anime\'s most comforting genres, and its emotional range is wider than its quiet surface suggests. For low-stress watching, the slice-of-life tag on MikuAnime is a safe harbor.',
    ],
    faq: [
      { q: 'Is slice-of-life anime boring?', a: 'Not to its fans — the genre replaces loud conflict with the joy of specificity and character chemistry. Shows like March Comes in Like a Lion and Barakamon carry real emotional weight.' },
      { q: 'What is the best slice-of-life anime to relax to?', a: 'Laid-Back Camp, K-On!, and Nichijou are go-to comfort picks. The slice-of-life ranking is skimmed by viewers who just want something warm after a long day.' },
    ],
  },
  sports: {
    intro: [
      'Sports anime turns competition into character drama — training arcs, rivalries, teamwork, and the agony of loss. The sport itself is the stage, but the drive to improve is the real subject.',
      'From volleyball rotations to track intervals, sports anime makes you care about a game you may never have played. The sports tag on MikuAnime collects the classics alongside newer hits like Blue Lock.',
    ],
    faq: [
      { q: 'What is the best sports anime ever made?', a: 'Haikyuu!! is the most consistent answer, with Kuroko\'s Basketball, Slam Dunk, and Ping Pong the Animation close behind. Each captures a different spirit of competition.' },
      { q: 'Do I need to understand the sport to enjoy a sports anime?', a: 'No — good sports anime teach you the rules as the story unfolds. Haikyuu!! even wins over viewers who have never touched a volleyball.' },
    ],
  },
  supernatural: {
    intro: [
      'Supernatural anime deals with spirits, yokai, ghosts, exorcists, and the occult — forces just outside the reach of everyday explanation. It spans horror, mythology, action, and heartfelt spirit-of-the-week stories.',
      'From urban legends to exorcist battles, the genre layers Japanese folklore onto modern settings. If you like your anime atmospheric and a little spooky, the supernatural tag is a strong starting point.',
    ],
    faq: [
      { q: 'What supernatural anime should I start with?', a: 'Mob Psycho 100, Jujutsu Kaisen, and Natsume\'s Book of Friends show three very different sides of the genre — action, horror, and gentle folklore respectively.' },
      { q: 'Are supernatural anime scary?', a: 'Some are horror-leaning, but many — like Mob Psycho 100 or Sasaki to Miyano\'s spinoffs — are comedy and heart with supernatural window dressing. Check the rating badge before choosing.' },
    ],
  },
  thriller: {
    intro: [
      'Thriller anime runs on suspense — conspiracies, countdowns, chases, and villains one step ahead. It keeps the pressure constant and the answers just out of reach, pulling you through episode after episode.',
      'Many of the most-watched anime ever, including Death Note and Attack on Titan, are thrillers at heart. If you watch for the tension and the reveals, the thriller tag delivers both.',
    ],
    faq: [
      { q: 'What is the best thriller anime of all time?', a: 'Death Note is the genre\'s gateway classic, with Monster, Steins;Gate, and Psycho-Pass rounding out the most-cited list. Each builds suspense in a different way.' },
      { q: 'Is a thriller anime the same as a mystery anime?', a: 'Not quite — mystery is about solving something, while thriller is about surviving the pressure. The best shows, like Monster, combine both to keep you guessing.' },
    ],
  },
};

export function getGenreContent(slug: string): GenreContent {
  const fallback: GenreContent = {
    intro: `Browse the complete ${slug} anime collection on MikuAnime. Every title here includes scores, episode counts, airing status, and synopses so you can compare shows at a glance and pick the right one to stream.`,
    faq: [
      { q: `What ${slug} anime are most popular right now?`, a: `Open the ${slug} ranking on MikuAnime — it updates with user scores and trends, so the most-loved titles float to the top as the season changes.` },
      { q: `How do I choose a good ${slug} anime?`, a: `Compare the score, synopsis, and episode count on each card, and check the 'More Like This' section on any series page to branch out from titles you already enjoyed.` },
    ],
  };
  return GENRE_CONTENT[slug] ?? fallback;
}