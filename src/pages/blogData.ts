export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  sport: string;
  sportIcon: string;
  readTime: number;
  date: string;
  keywords: string[];
  content: string;
  relatedSlugs: string[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "padel-journal-guide",
    title: "The Complete Padel Journal Guide: Log Matches Like a Pro",
    description: "Learn how to keep a padel journal that actually helps your game. This guide covers what to write after every match, which questions to ask yourself, and how to spot patterns in your padel performance.",
    sport: "Padel",
    sportIcon: "🎾",
    readTime: 7,
    date: "27 May 2026",
    keywords: ["padel journal", "padel match log", "padel performance", "how to journal padel", "padel tips"],
    content: `
<h2>Why Padel Players Need a Performance Journal</h2>
<p>Padel is one of the fastest-growing sports in the world, and for good reason — it is tremendously fun and highly tactical. But unlike tennis, where solo practice is well-established, padel is almost always played in pairs. This makes tracking your own performance uniquely challenging. You depend on a partner, you rely on chemistry, and your individual contributions are often hard to isolate.</p>
<p>A padel journal solves this problem. By consistently logging what happened after each session, you start building a record of your own decision-making, shot selection, and mental state — independent of your partner. This gives you concrete data to review rather than vague impressions.</p>

<h2>What to Log After Every Padel Match</h2>
<p>The key to a useful padel journal is consistency. You do not need to write an essay — aim for five to ten bullet points that capture the essential patterns. Here is the minimum worth recording:</p>
<ul>
<li><strong>Partner combination:</strong> Who you played with and their style. Did you complement each other well? Where were the mismatches?</li>
<li><strong>Opponent profile:</strong> Were they right-handed, left-handed, aggressive counter-punchers, or serve-and-volley types?</li>
<li><strong>Score:</strong> Record it fully (e.g., 6-3, 4-6, 7-5) so you can look back at close matches later.</li>
<li><strong>Key moments:</strong> Write down one or two decisive points. Could you have turned them?</li>
<li><strong>Vibora usage:</strong> How often did you step up to the net? Did your bandeja feel solid?</li>
<li><strong>Mental state:</strong> Were you calm under pressure or rushing shots?</li>
</ul>

<h2>Spotting Patterns in Your Padel Game</h2>
<p>After five or six sessions, patterns start emerging. You might notice that your win rate drops significantly when your partner is right-handed and the opponents are left-handed. Or that you consistently lose the first set and come back strong in the second — suggesting a slow start issue rather than a fitness problem.</p>
<p>These patterns are impossible to see from memory alone. Your journal is what surfaces them.</p>

<h3>The Glass Court Effect</h3>
<p>One of the most common issues padel players report is losing focus when playing on glass courts. The ball behaves differently off the back wall, and without practice on this surface, many players feel disoriented. If you play on glass regularly, note it in your journal — surface-specific patterns are some of the most useful data you can collect.</p>

<h2>Sample Padel Journal Entry</h2>
<p><em>Played with Carlos (great at the net, weak return). Opponents: left-handed pair, very strong at the glass. Lost 6-3, 4-6, 5-7. Key moment at 5-5 in the third — missed an easy bandeja putaway. bandeja felt off all session. Should focus on step-in timing for bandeja in training. Mental: calm in first two sets, frustrated in third after unforced errors.</em></p>
<p>This single entry gives you more to work with than a month of vague post-match chat.</p>

<h2>Building a Padel Journal Habit</h2>
<p>The best time to write your entry is within thirty minutes after your match, while details are still fresh. Keep your journal in your sports bag or as a note on your phone. The easier it is to access, the more consistent you will be. Set a reminder if needed — treat it like part of your cool-down routine.</p>
<p>Review your last five entries before your next session to see if anything stands out. Over time, you will build a genuine tactical awareness of your own game that makes you a genuinely better padel player.</p>
    `,
    relatedSlugs: ["padel-performance-tracking", "post-match-reflection-guide", "badminton-performance-log"]
  },
  {
    slug: "padel-performance-tracking",
    title: "Padel Performance Tracking: How to Measure What Matters",
    description: "Beyond wins and losses — how to track padel performance metrics that actually drive improvement in your game, from unforced error rates to net point conversion.",
    sport: "Padel",
    sportIcon: "🎾",
    readTime: 6,
    date: "27 May 2026",
    keywords: ["padel performance tracking", "padel stats", "padel metrics", "padel improvement", "track padel progress"],
    content: `
<h2>Why Traditional Padel Stats Fall Short</h2>
<p>Most padel players track only one thing: whether they won. This is the least informative metric possible. Winning in padel depends heavily on partner combination, opponent quality on any given day, and random variance in clutch moments. Winning does not tell you whether you played well. Losing does not tell you what went wrong.</p>
<p>Performance tracking in padel requires different metrics than solo sports. Because padel is a doubles game, some individual metrics are genuinely hard to isolate — but it is not impossible. The key is focusing on factors within your control.</p>

<h2>Core Metrics Every Padel Player Should Track</h2>
<h3>Unforced Error Rate</h3>
<p>Count your unforced errors per game or per set. A manageable target for intermediate players is under five unforced errors per set. When this number climbs above eight, it typically signals either fatigue, poor shot selection, or rushing under pressure.</p>
<h3>Net Point Conversion</h3>
<p>Padel is a net sport. Track how often you win points when you approach the net. If your net conversion rate is below sixty percent, you are likely making poor decisions about when to step in — or your volleys need work.</p>
<h3>Bandeja and Vibora Success</h3>
<p>The bandeja and vibora are the signature shots in padel. Note roughly how many bandeja attempts you made and how many resulted in winners or forced errors. A low success rate here suggests technique or timing issues worth drilling.</p>
<h3>Service Games Held</h3>
<p>In padel, holding your service game is critical because breaks are rare and enormously valuable. Track how often you hold serve across your last ten matches. This is one of the best individual performance indicators available.</p>

<h2>Using a Radar Padel Chart</h2>
<p>One effective way to visualize your performance is using a radar chart with five axes: serve hold rate, net conversion, unforced errors, bandeja success, and mental composure rating (self-assessed from 1-10 after each match). After five sessions, your radar chart starts showing your unique performance signature — a powerful tool for targeted training.</p>

<h2>Tracking Partner Chemistry</h2>
<p>Because padel is played in pairs, tracking chemistry with different partners gives you a competitive edge. Note combinations that work well for you — for example, some players perform best paired with aggressive net players who cover their weaker serve return. This data helps you communicate better with partners and select搭档 smarter in competitive contexts.</p>
    `,
    relatedSlugs: ["padel-journal-guide", "post-match-reflection-guide", "table-tennis-journal"],
  },
  {
    slug: "workout-reflection-prompts",
    title: "30 Workout Reflection Prompts for Strength Athletes",
    description: "Structured reflection questions to get more from every training session. These prompts help weightlifters and strength athletes identify what's working, what needs adjusting, and how to progress.",
    sport: "Weightlifting",
    sportIcon: "🏋️",
    readTime: 8,
    date: "27 May 2026",
    keywords: ["workout reflection prompts", "strength training journal", "weightlifting journal", "post workout reflection", "training log prompts"],
    content: `
<h2>Why Workout Reflection Matters More Than the Workout Itself</h2>
<p>Strength training generates physical adaptations, but only if you programme intelligently. The athletes who improve fastest are not necessarily the ones who train the hardest — they are the ones who learn the most from each session. Reflection converts effort into insight. Without it, you are guessing.</p>
<p>A structured set of reflection prompts makes this process fast and systematic. You do not need to write pages after every gym session — five focused minutes answering the right questions gives you far more than rambling journal entries ever could.</p>

<h2>Session Assessment Prompts</h2>
<p>Answer these immediately after your session, before you leave the gym:</p>
<ul>
<li>What was the primary stimulus of today's session? (Hypertrophy, strength, power, active recovery?)</li>
<li>What was your estimated RPE or rate of perceived exertion at the end of the session?</li>
<li>Which exercise felt strongest today, and which felt weakest?</li>
<li>Did you hit your target volume and intensity, or did you fall short? By how much?</li>
<li>Was your warm-up sufficient, or did you feel stiff/tight during working sets?</li>
<li>Did you try any new variations or techniques today? How did they feel?</li>
</ul>

<h2>Technique and Form Prompts</h2>
<ul>
<li>Were there any technical breakdown points during compounds? (Squat depth, hip hinge, shoulder position?)</li>
<li>Did you notice any compensation patterns — e.g., early hip rise on deadlift, or knee valgus on split squats?</li>
<li>Which cue or focus point helped your technique most today?</li>
<li>Was there a specific moment where the weight felt heavy for a reps-in-reserve that should have felt easier?</li>
</ul>

<h2>Recovery and Readiness Prompts</h2>
<ul>
<li>How many hours of sleep did you get last night?</li>
<li>How would you rate your recovery from yesterday's session?</li>
<li>Did you eat adequately before and after the session? (Protein, carbs, hydration)</li>
<li>What is your current soreness level, and is it interfering with today's technique?</li>
<li>Did you feel any joint pain, tweak, or unusual discomfort during this session?</li>
</ul>

<h2>Longitudinal Progress Prompts</h2>
<p>Review these weekly or bi-weekly by scanning your recent entries:</p>
<ul>
<li>Which rep range or loading scheme is giving you the most consistent gains right now?</li>
<li>Are there any persistent weak points showing up across multiple sessions? (e.g., always failing heavy triples, or hamstring fatigue post-leg day)</li>
<li>What has changed in your recovery quality over the past two weeks?</li>
<li>Is your weekly volume trending up appropriately, or are you accumulating too much fatigue?</li>
<li>What is one specific technical adjustment you want to focus on next week?</li>
</ul>

<h2>Making Reflection a Habit</h2>
<p>Keep a dedicated notes folder on your phone or a physical notebook in your gym bag. Use voice memos if typing feels slow — a thirty-second voice note after your session captured the essential data. The key is consistency: build it into your cool-down routine and it takes less than five minutes.</p>
    `,
    relatedSlugs: ["post-match-reflection-guide", "athletics-training-journal", "cycling-performance-journal"]
  },
  {
    slug: "table-tennis-journal",
    title: "How to Keep a Table Tennis Journal: Performance Logging Guide",
    description: "A practical guide to logging your table tennis matches and training sessions. Includes specific reflection questions for spin, service, and mental game.",
    sport: "Table Tennis",
    sportIcon: "🏓",
    readTime: 6,
    date: "27 May 2026",
    keywords: ["table tennis journal", "table tennis performance", "table tennis log", "table tennis reflection", "ping pong journal"],
    content: `
<h2>Table Tennis is a Game of Repetition and Adjustment</h2>
<p>Table tennis rewards athletes who can adapt quickly. In a sport where matches last twenty minutes and points last seconds, the difference between a good player and an elite player is not physical — it is informational. Great table tennis players read their opponent, adjust, and execute within the space of a single point.</p>
<p>This is exactly why a table tennis journal is so valuable. Your memory of which serves gave you trouble and which tactics worked against different rubber types degrades fast. A journal preserves this intelligence so you can reuse it.</p>

<h2>What to Specifically Log in Table Tennis</h2>
<h3>Service Patterns</h3>
<p>Note the serves that caused you problems — both your own serves that flopped and opponent serves you struggled to read. Many club players use the same three serves repeatedly. Your journal should track which serves you have in your arsenal, how often you deploy each, and in which situations they work best.</p>
<h3>Third Ball Attack Patterns</h3>
<p>After a serve, the third ball is a critical opportunity. Log whether you successfully executed your third ball attack and what you were trying to achieve. This is a pattern that improves dramatically with deliberate tracking.</p>
<h3>Rubber and Equipment Context</h3>
<p>Note the type of rubber your opponent used — inverted, short pips, long pips, anti-spin. This matters enormously in table tennis. If you play well against inverted rubber but struggle against short pips, your journal will show it clearly.</p>

<h2>Service Journal Sample</h2>
<p><em>Opponent: defensive left-handed player with heavy backspin serves. Used pendulum chop serve with limited success — opponent seemed comfortable returning with topspin. Switched to corkscrew serve in the third game — won several points directly and created easier third ball opportunities. Note: should develop corkscrew more, particularly effective against defensive choppers.</em></p>

<h2>Mental Game Tracking in Table Tennis</h2>
<p>Because points are so quick, mental state in table tennis shifts moment to moment. Note whether you were tilting after unforced errors, or if you stayed composed during long rallies. Many players lose matches not because they lack technique but because they let single points affect their next rally. Your journal helps you identify whether this is a pattern for you.</p>

<h2>Training Session Logging</h2>
<p>Beyond matches, track your training sessions with the same rigour. Note which footwork patterns you drilled, how your multiball fed rally looks, and your felt quality of stroke practice. Consistently reviewing training data helps you programme more intelligently and recognise when drilling is not translating to matches.</p>
    `,
    relatedSlugs: ["badminton-performance-log", "padel-journal-guide", "post-match-reflection-guide"]
  },
  {
    slug: "badminton-performance-log",
    title: "The Badminton Performance Log: Tracking Your Shuttlecock Game",
    description: "A structured approach to logging badminton matches and training. Includes rally analysis, shot selection tracking, and sport-specific recovery notes for court athletes.",
    sport: "Badminton",
    sportIcon: "🏸",
    readTime: 7,
    date: "27 May 2026",
    keywords: ["badminton performance log", "badminton journal", "badminton tracking", "shuttlecock game", "badminton improvement"],
    content: `
<h2>Why Badminton Performance is Harder to Track Than Other Racket Sports</h2>
<p>Badminton is one of the fastest reactions in sport. Points often last under ten seconds, rallies involve continuous footwork, and the shuttlecock's behaviour varies significantly with humidity, temperature, and shuttle brand. This makes performance logging both more important and more complex than in tennis or padel.</p>
<p>Players who track their badminton performance specifically note two things: the technical decisions they made under pressure, and the physical clues that preceded fatigue or injury.</p>

<h2>Core Badminton Metrics</h2>
<h3>Rally Win Rate by Shot Type</h3>
<p>Log your winning and losing rally outcomes by shot type: net shots, lifts, clears, drives, smashes, and drops. You may find your net shot win rate is sixty percent but your lift win rate under pressure drops to thirty percent. This tells you exactly where to drill.</p>
<h3>Service Game Performance</h3>
<p>In both singles and doubles, service routines are critical. Note whether you held serve comfortably, how often your opponent attacked your serve return, and whether your second serve (if applicable in your format) gave you enough quality to follow into the net.</p>
<h3>Movement Quality (Self-Rated)</h3>
<p>After each session, rate your footwork from one to ten. Did your split step feel responsive? Was your recovery to the T adequate after each shot? Did you notice any hesitancy at the net? Movement quality directly correlates with injury risk in badminton, so tracking it matters for longevity.</p>

<h2>Doubles-Specific Logging</h2>
<p>If you play doubles, partner combinations in badminton are as important as in padel. Note your positioning preferences — front-back versus side-by-side — and how your partner's coverage complements or overlaps yours. A well-documented partnership record allows you to choose your partner strategically for different tournament contexts.</p>

<h2>Shuttlecock and Environmental Notes</h2>
<p>Badminton is uniquely sensitive to equipment and environment. Always note the shuttlecock type (plastic versus feather), court surface (wood versus synthetic), and temperature-humidity conditions. Feather shuttles behave very differently in a cold gym versus a warm hall. Players who ignore this often misdiagnose their performance drops as technical issues when they are environmental.</p>

<h2>Recovery and Injury Tracking for Badminton Players</h2>
<p>Knee and ankle injuries are common in badminton. Log any unusual soreness in these areas post-session. Also note whether your shoulder felt strong on clears and smashes — rotator cuff fatigue in badminton accumulates over weeks and is easy to miss until it becomes a significant injury. The journal is your early warning system.</p>
    `,
    relatedSlugs: ["table-tennis-journal", "padel-journal-guide", "swimming-training-log"]
  },
  {
    slug: "post-match-reflection-guide",
    title: "The Post-Match Reflection Guide Every Athlete Needs",
    description: "The universal framework for reflecting on any competitive performance. Learn the right questions to ask after every match, regardless of sport, to drive continuous improvement.",
    sport: "General",
    sportIcon: "🏆",
    readTime: 9,
    date: "27 May 2026",
    keywords: ["post-match reflection guide", "post game reflection", "performance review", "athlete journal", "sports reflection questions"],
    content: `
<h2>Why Post-Match Reflection is the Fastest Path to Improvement</h2>
<p>Every elite athlete in every sport reflects on their performance. Not all of them write it down, but all of them think about it. The problem is that unstructured reflection tends to focus on outcomes — winning or losing — rather than process. You remember the last point, the bad call, the moment you felt the match slip away. But rarely do you remember the specific decision in the third point that set up that final moment.</p>
<p>Structured post-match reflection fixes this. By asking the same consistent questions after every match, you build a habit of process-focused evaluation rather than outcome emotional reaction.</p>

<h2>The Universal Reflection Framework (Works for Any Sport)</h2>
<h3>1. What was the score and context?</h3>
<p>Record the exact score, opponent level, and competitive context. Was this a casual hit, a league match, or a tournament final? Context determines what your reflection should focus on.</p>
<h3>2. What went well? (Be Specific)</h3>
<p>Generic answers like "I played well" are useless. You need specific instances. "My return of serve was neutralising their first serve, creating easier second-serve opportunities" is useful. "I hit good shots" is not.</p>
<h3>3. What did not go well? (Again, Be Specific)</h3>
<p>Same principle — you need specific moments. "In the sixth game of the second set, I missed three routine forehands in a row due to rushing" is actionable. "I was inconsistent" is not.</p>
<h3>4. What was one thing I learned?</h3>
<p>Limit this to one thing per match. If you list five, you will not focus on any of them. Pick the single most important insight and commit it to memory for your next session.</p>
<h3>5. What is one thing I will do differently next time?</h3>
<p>This should be concrete and behavioural, not mental. "Be more aggressive" is vague. "Step inside the baseline on second serves to attack the net" is concrete and trainable.</p>

<h2>How to Make Reflection a Habit</h2>
<p>Set a reminder in your phone immediately after every match. Give yourself a twenty-minute window post-session where you do nothing else except complete your reflection. If you do it later, details fade. The best athletes treat this as non-negotiable — as much part of the cool-down as stretching.</p>

<h2>Review Cycles: The Secret Weapon</h2>
<p>Individual reflections are useful, but reviewing your last five to ten entries as a batch reveals larger patterns that single sessions cannot show. Set a bi-weekly calendar reminder to scan your past entries. Look for:</p>
<ul>
<li>Whether your win rate is consistent, climbing, or declining</li>
<li>Whether specific technical issues keep reappearing despite your awareness</li>
<li>Whether your stated focus areas in training are actually translating to matches</li>
<li>Whether there are clear opponent archetypes or situations that cause you trouble</li>
</ul>

<h2>Using Reflection to Programme Your Training</h2>
<p>Reflection should feed forward into your training programme. If your last three entries note tactical issues rather than physical ones, your next training block should prioritise decision-making drills over fitness work. If you consistently struggle with late-stage fatigue in close matches, your periodisation needs more endurance work.</p>
<p>The journal is not just a record of the past — it is your most powerful training programming tool.</p>
    `,
    relatedSlugs: ["padel-journal-guide", "workout-reflection-prompts", "athletics-training-journal"]
  },
  {
    slug: "cycling-performance-journal",
    title: "The Cycling Performance Journal: Training, Racing, and Recovery",
    description: "How cyclists can use a performance journal to track training load, race performance, and recovery. Includes FTP tracking, TSS logging, and specific metrics for road and gravel cyclists.",
    sport: "Cycling",
    sportIcon: "🚴",
    readTime: 7,
    date: "27 May 2026",
    keywords: ["cycling performance journal", "cycling log", "cycle training journal", "FTP tracking", "TSS cycling", "cycling recovery log"],
    content: `
<h2>Why Cyclists Should Journal More Than Any Other Athletes</h2>
<p>Cycling is a data-rich sport. Most serious cyclists own a power meter, a heart rate monitor, and a GPS device that generates thousands of data points per ride. Yet the vast majority of riders never look back at their日志. They ride, they upload, they maybe glance at the Strava leaderboard, and they move on. This is a tremendous waste of data.</p>
<p>A cycling performance journal transforms raw data into actionable insight. It is the difference between riding blind and riding with intention.</p>

<h2>What to Track on Every Ride</h2>
<h3>Training Stress Score (TSS)</h3>
<p>TSS gives you a single number representing the physiological load of your ride. Tracking weekly TSS tells you whether you are accumulating training stress appropriately or overreaching. Most cyclists should periodise between 250-400 TSS per week for sustainable improvement.</p>
<h3>Normalized Power (NP) and Intensity Factor (IF)</h3>
<p>NP accounts for the variability in your power output during a ride — a ride with high variability has a higher NP than its average power alone suggests. IF is your NP divided by your threshold power. An IF above 1.0 means you are riding above threshold. Use this to calibrate the difficulty of key sessions.</p>
<h3>Perceived Exertion and Feel</h3>
<p>Not everything can be measured. Subjective feel — how your legs felt, your mental state, how recovered you felt at the start — matters. Rate each ride from one to ten for feel, and note any external factors (poor sleep, travel, stress) that might affect your numbers.</p>

<h2>Racing in a Cycling Journal</h2>
<p>Race days require their own dedicated section. Note the race type ( criterium, road race, time trial, gravel race ), weather conditions, your nutritional strategy, and sleep the night before. Most cyclists under-perform in races not because of fitness but because of preparation gaps that a journal could identify and fix over time.</p>

<h2>FTP Tracking Over Time</h2>
<p>Your Functional Threshold Power is one of the most important numbers in cycling. Track it formally (via 20-minute or 8-minute tests with appropriate corrections) every four to six weeks, and note the trend. If your FTP is plateauing despite high training load, your journal will show it — and prompt you to adjust periodisation, recovery, or targeted work.</p>

<h2>Recovery Metrics for Cyclists</h2>
<p>Sleep quality and duration are critical for cyclists. Log resting heart rate each morning — a sustained elevation of three or more beats per minute above your baseline is a reliable sign of accumulating fatigue or early infection. The journal is your earliest detection system for overreaching.</p>
    `,
    relatedSlugs: ["swimming-training-log", "workout-reflection-prompts", "athletics-training-journal"]
  },
  {
    slug: "swimming-training-log",
    title: "The Swimming Training Log: Yardage, Pace, and Race Performance",
    description: "A practical guide to logging swim training sessions and races. Includes stroke rate tracking, pacing analysis, and specific metrics for pool and open water swimmers.",
    sport: "Swimming",
    sportIcon: "🏊",
    readTime: 6,
    date: "27 May 2026",
    keywords: ["swimming training log", "swim journal", "swimming log", "lap swimming log", "open water swimming journal"],
    content: `
<h2>Why Swimmers Need Structured Logging More Than Most Athletes</h2>
<p>Swimming produces enormous amounts of repetitious data. A typical swim practice might involve three thousand metres of swimming with fifty repetitions of the same drill, broken up by rest intervals. Without a log, it is nearly impossible to assess whether that practice made you faster or just tired.</p>
<p>Swimmers who log consistently — not just uploading to Strava but genuinely reflecting on the quality of each session — improve dramatically faster than those who do not.</p>

<h2>Core Metrics to Log After Every Swim</h2>
<h3>Total Yardage and Session Type</h3>
<p>Always record total yardage and the primary focus of the session: technique, threshold, sprint, active recovery, or open water skills. This is the foundation of your training log and what allows you to periodise effectively over a season.</p>
<h3>Stroke Rate and Distance Per Stroke</h3>
<p>Stroke rate (strokes per minute) and distance per stroke are the two variables that most directly affect swimming speed. Track both in your log, along with the context — were you swimming alone or in a group? Was this a sprint set or an aerobic set?</p>
<h3>Feel and Effort Rating</h3>
<p>Rate the session's perceived effort on a scale of one to ten, and note whether your feel matched the prescribed interval times. If a 400 Freestyle was prescribed at pace and you were five seconds slow, note it — and note whether it was physiological (you were genuinely slow) or tactical (you held back for strategic reasons).</p>

<h2>Pacing Analysis</h2>
<p>For race swimmers, pacing analysis is essential. Log negative split performance — whether your first half was faster than your second, or vice versa. Many swimmers go out too hard and fade. Your log tracks this pattern across many races and points clearly to pacing issues that can be corrected with deliberate practice.</p>

<h2>Open Water Swimming Notes</h2>
<p>Open water swimming introduces variables that pool swimming does not have: currents, visibility, temperature, breathing orientation due to waves. Log these specifically when training or racing in open water. Note how conditions affected your sighting, navigation, and overall performance — and whether your wetsuit choice or nutrition strategy was appropriate.</p>

<h2>Injury and Shoulder Health in Swimming</h2>
<p>Shoulder injuries are endemic in swimming. Log any shoulder soreness or pain immediately. Swimmer's shoulder often starts subtly and builds over weeks before becoming debilitating. Your journal is your early detection system — catch it early and you recover quickly. Ignore it and it becomes a season-ending problem.</p>
    `,
    relatedSlugs: ["cycling-performance-journal", "athletics-training-journal", "workout-reflection-prompts"]
  },
  {
    slug: "athletics-training-journal",
    title: "The Athletics Training Journal: Track Your Track and Field Performance",
    description: "A practical framework for athletics athletes to log training sessions, race performances, and recovery. Includes specific prompts for sprinters, middle-distance, and endurance runners.",
    sport: "Athletics",
    sportIcon: "🪖",
    readTime: 8,
    date: "27 May 2026",
    keywords: ["athletics training journal", "track and field journal", "sprinting journal", "middle distance log", "athletics performance tracking"],
    content: `
<h2>Why Athletics Athletes Build Journals Based on Their Event Group</h2>
<p>Athletics spans an enormous range of events, each with fundamentally different training demands and performance metrics. A sprinter's log looks completely different from a marathon runner's log. A thrower's metrics bear no resemblance to a high jumper's. However, the principle of structured logging applies universally — and the specifics matter enormously for each event group.</p>
<p>This guide covers sprinters and field athletes, but the framework adapts to any event.</p>

<h2>Sprint Training Journal: What to Track</h2>
<h3>Block Start Times</h3>
<p>Record your 10m and 30m fly times from every session. These are the most reliable early-season indicators of sprint development. Over weeks and months, your block start trajectory tells you whether your power training is translating to the track.</p>
<h3>Max Velocity Sessions</h3>
<p>Note the quality of your max velocity work — what percentage of your best ever velocity did you hit? Did you feel smooth, or were you overstriding? Technique breaks at max velocity tell you a great deal about your current mechanical efficiency.</p>
<h3>Fatigue and Freshness Ratings</h3>
<p>Rate your central nervous system freshness each morning and post-session. Sprinting is extremely CNS-intensive. A journal tracking this data helps you programme your recovery days more intelligently — athletes who push hard days when CNS is depleted perform worse and get injured more.</p>

<h2>Middle and Long Distance Training Logs</h2>
<h3>Training Intensity Distribution</h3>
<p>Modern periodisation for distance athletes follows a polarised model — mostly easy, some hard, very little at moderate intensity. Log your sessions in one of three categories: easy aerobic, threshold/tempo, and high-intensity intervals. Over a mesocycle, you want roughly eighty percent easy, fifteen percent threshold, five percent high intensity. Your log is what tells you if you are getting this balance right.</p>
<h3>Race Pace Feel</h3>
<p>After key race-pace sessions, note your perceived effort and how it compared to actual race pace. If a session at race pace felt significantly harder than expected, it suggests you are not yet race-ready at that pace — your training load needs adjustment before your next race.</p>

<h2>Field Event Specific Metrics</h2>
<h3>Technique Session Logging</h3>
<p>For jumpers, throwers, and vaulters, technique sessions are the priority. Log drill-specific performance: approach jump height, throwing distance, pole vault bend percentage. Even if these are imperfect measures, tracking them over time shows whether your technique work is translating to improved performance.</p>

<h2>Recovery and menstrual cycle tracking for athletics</h2>
<p>For female athletes, noting menstrual cycle phase in your journal can help identify performance fluctuations. Many athletes notice mid-cycle performance dips. A journal that captures this data helps you and your coach interpret performance variation more accurately rather than attributing it to motivation or training issues.</p>
    `,
    relatedSlugs: ["workout-reflection-prompts", "swimming-training-log", "cycling-performance-journal"]
  }
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug);
}

export function getRelatedPosts(post: BlogPost, count: number = 3): BlogPost[] {
  return blogPosts
    .filter(p => p.slug !== post.slug && post.relatedSlugs.includes(p.slug))
    .slice(0, count);
}
