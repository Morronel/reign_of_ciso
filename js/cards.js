/*
 * Reign of CISO: characters, cards and endings.
 *
 * Meters: b = budget, s = security posture, t = board trust, m = team morale.
 * Each card has a left (l) and right (r) choice. A choice can have:
 *   t      label shown while swiping
 *   fx     meter changes, e.g. { b: -10, s: 5 }
 *   set    flag(s) to set for the rest of this run
 *   clear  flag(s) to clear
 *   next   follow-up card id (or list of ids; the first whose requirements pass is used)
 *   delay  weeks until the follow-up shows up (default 3)
 * Card options:
 *   followup  only appears when scheduled by a `next`
 *   once      appears at most once per run
 *   requires  flags that must be set / excludes flags that must not be set
 *   cond      function(state) => boolean for meter-based cards
 *   weight    relative draw chance (default 1)
 */
(function () {
  const CHARACTERS = {
    ceo: { name: 'Chad', role: 'CEO', emoji: '🤵', color: '#3b5b92' },
    cfo: { name: 'Penny', role: 'CFO', emoji: '👩‍💼', color: '#2e7d5b' },
    it: { name: 'Gary', role: 'IT Director', emoji: '🧔', color: '#6b5b95' },
    soc: { name: 'Priya', role: 'SOC Lead', emoji: '🎧', color: '#b5651d' },
    intern: { name: 'Kevin', role: 'Intern', emoji: '🧑‍🎓', color: '#c9a227' },
    vendor: { name: 'Brad', role: 'CyberSynergy™ Sales', emoji: '🕴️', color: '#c0392b' },
    auditor: { name: 'Ms. Thorne', role: 'External Auditor', emoji: '🧐', color: '#5d6d7e' },
    hr: { name: 'Helen', role: 'HR', emoji: '🗂️', color: '#b0578d' },
    dev: { name: 'Dave', role: 'Lead Developer', emoji: '👨‍💻', color: '#2c3e50' },
    mkt: { name: 'Mia', role: 'Marketing', emoji: '📣', color: '#d35400' },
    legal: { name: 'Lawrence', role: 'General Counsel', emoji: '⚖️', color: '#707b7c' },
    red: { name: 'Red Team', role: 'Pentesters', emoji: '🥷', color: '#8e1b1b' },
    hacker: { name: 'Unknown Sender', role: 'definitely-legit@totally.ru', emoji: '💀', color: '#1b1b1b' },
    board: { name: 'The Board', role: 'Board of Directors', emoji: '🎩', color: '#5a4632' },
    press: { name: 'Jenna', role: 'Tech Journalist', emoji: '📰', color: '#34495e' },
    ai: { name: 'CopilotGPT', role: 'AI Assistant (Beta)', emoji: '🤖', color: '#138d75' },
    cat: { name: 'Firewall', role: 'Office Cat', emoji: '🐈', color: '#a0522d' },
    facilities: { name: 'Bob', role: 'Facilities', emoji: '🔧', color: '#7d6608' },
    fed: { name: 'Agent Smith', role: 'FBI Cyber Division', emoji: '🕶️', color: '#212f3d' },
    tyler: { name: 'Tyler', role: "CEO's Nephew", emoji: '🛹', color: '#8e44ad' },
  };

  const CARDS = [
    // ---------- Onboarding ----------
    {
      id: 'welcome', who: 'ceo', followup: true,
      text: (st) => st.cisoNo === 1
        ? "Welcome aboard! Your predecessor \"left to pursue other opportunities.\" Swipe left or right to make decisions. Keep all four meters balanced. Don't let any hit empty... or max out."
        : `Welcome, CISO #${st.cisoNo}! ${st.prevName} lasted ${st.prevWeeks} week${st.prevWeeks === 1 ? '' : 's'}. No pressure.`,
      l: { t: 'Gulp.' },
      r: { t: "Let's secure things." },
    },

    // ---------- CEO ----------
    {
      id: 'ceo_phish', who: 'ceo',
      text: 'I got an email saying my mailbox was full, so I typed in my password. Twice, to be safe. That\'s fine, right?',
      l: { t: 'Reset everything. Now.', fx: { s: 10, t: -5 } },
      r: { t: 'Probably fine', fx: { s: -15, t: 5 } },
    },
    {
      id: 'ceo_password', who: 'ceo',
      text: "I want a password policy that's easy to remember. Like Company2026! Everybody can use that.",
      l: { t: 'Password manager for all', fx: { s: 10, m: -5, b: -5 } },
      r: { t: 'Company2026! it is', fx: { s: -15, t: 10, m: 5 } },
    },
    {
      id: 'ceo_gmail', who: 'ceo',
      text: "I'm going to use my personal Gmail for work stuff. It's just faster. Also I forward everything there anyway.",
      l: { t: 'Absolutely not', fx: { t: -10, s: 5 } },
      r: { t: 'Your company, sir', fx: { t: 5, s: -10 } },
    },
    {
      id: 'ceo_travel', who: 'ceo',
      text: "I'm off to a conference in a country known for... enthusiastic hackers. Bringing my laptop with literally everything on it.",
      l: { t: 'Take a burner laptop', fx: { s: 10, t: -5 } },
      r: { t: 'Have a great trip!', fx: { s: -10, t: 5 } },
    },
    {
      id: 'ceo_why', who: 'ceo',
      text: "Why do we spend so much on security when nothing ever happens?",
      l: { t: "That's... the point", fx: { t: -5, m: 5 } },
      r: { t: "You're right, cut it", fx: { b: -15, t: 10, s: -5 } },
    },
    {
      id: 'ceo_wifi', who: 'ceo',
      text: 'The new office has a Wi-Fi network called FREE_CORPORATE_WIFI_NOT_A_TRAP. Is that ours?',
      l: { t: 'Hunt it down', fx: { s: 5, b: -5 } },
      r: { t: 'Probably ours', fx: { s: -10, m: 5 } },
    },
    {
      id: 'ceo_ai', who: 'ceo',
      text: "Everyone's doing AI. I want AI in our security. I don't know what that means. Make it happen.",
      l: { t: 'Explain AI is not magic', fx: { t: -10, m: 5 } },
      r: { t: 'Slap "AI" on the SIEM', fx: { t: 10, b: -5 } },
    },
    {
      id: 'ceo_deepfake', who: 'ceo',
      text: "Finance says I called them on video and asked for a $2M wire. I didn't. But it really looked like me. Even my bad haircut.",
      l: { t: 'Callback verification', fx: { s: 10, m: -5 } },
      r: { t: 'Tell him to get a new haircut', fx: { s: -10, m: 5, t: -5 } },
    },

    // ---------- CFO ----------
    {
      id: 'cfo_cut', who: 'cfo',
      text: 'Security is a cost center. I need you to cut 20% by Monday.',
      l: { t: 'Cut the night shift', fx: { b: 10, s: -10, m: -10 } },
      r: { t: 'Show breach cost math', fx: { t: -10, s: 5 } },
    },
    {
      id: 'cfo_surplus', who: 'cfo',
      text: "Good news! Year-end surplus. Spend it by Friday or it's gone forever.",
      l: { t: 'Return it, be humble', fx: { t: 10, b: -5 } },
      r: { t: 'Buy ALL the tools', fx: { b: 15, s: 5, t: -5 } },
    },
    {
      id: 'cfo_insurance', who: 'cfo',
      text: 'Cyber insurance renewal. Premium tripled, and they want MFA everywhere or no coverage.',
      l: { t: 'Go uninsured. YOLO.', fx: { b: 10, t: -10, s: -5 } },
      r: { t: 'Pay up, roll out MFA', fx: { b: -15, s: 10, m: -5 } },
    },
    {
      id: 'cfo_mac', who: 'cfo',
      text: "Do we really need antivirus on the Macs? Macs can't get viruses. My nephew told me.",
      l: { t: 'Yes, they can', fx: { b: -5, s: 5 } },
      r: { t: 'Cancel it, save money', fx: { b: 10, s: -10 } },
    },
    {
      id: 'cfo_giftcards', who: 'cfo',
      text: 'The CEO emailed me from chad.ceo.real@gmail.com asking for 40 Apple gift cards. Urgently. Should I buy them?',
      l: { t: "That's fraud!", fx: { s: 5, t: 5 } },
      r: { t: "Don't keep the CEO waiting", fx: { b: -20, t: -5 } },
    },
    {
      id: 'cfo_tools', who: 'cfo',
      text: 'You have 47 security tools. I counted. Do we need all of them?',
      l: { t: 'Consolidate', fx: { b: 10, s: -5, m: -5 } },
      r: { t: 'Each one is a special snowflake', fx: { t: -10, b: -5 } },
    },

    {
      id: 'cfo_grant', who: 'cfo',
      text: 'There is a government cybersecurity grant we could apply for. The application is 300 pages.',
      l: { t: 'Too much paperwork', fx: { m: 5 } },
      r: { t: 'Make the team fill it out', fx: { b: 15, m: -10 } },
    },
    {
      id: 'board_scared', who: 'board',
      text: "We saw a breach on the evening news and now we're scared. How much money do you need?",
      l: { t: 'Ask modestly', fx: { b: 10, t: 5 } },
      r: { t: 'Ask for everything', fx: { b: 20, t: -10 } },
    },
    {
      id: 'it_licenses', who: 'it',
      text: "We're paying for 900 licenses of a tool nobody has opened since 2021. Including the guy who bought it.",
      l: { t: 'Keep them, just in case', fx: { b: -5, m: 5 } },
      r: { t: 'Cancel them', fx: { b: 10, m: -5 } },
    },

    // ---------- IT ----------
    {
      id: 'it_backups', who: 'it',
      text: 'Should we actually test restoring our backups? It takes a whole weekend.',
      l: { t: "Skip it, they're fine", fx: { m: 5 } },
      r: { t: 'Do the restore test', fx: { m: -10, s: 10 }, set: 'backups_tested' },
    },
    {
      id: 'it_xp', who: 'it',
      text: 'There is a Windows XP machine that runs both the coffee machine and payroll. Upgrade?',
      l: { t: "If it ain't broke...", fx: { s: -10, m: 5 } },
      r: { t: 'Upgrade it', fx: { b: -15, s: 10 } },
    },
    {
      id: 'it_vishing', who: 'it',
      text: "Someone named 'IT Support' called and asked for my password. I gave it. Wait... I'M IT support.",
      l: { t: 'Reset and retrain', fx: { s: 5, m: -5 } },
      r: { t: 'Laugh it off', fx: { s: -10, m: 5 } },
    },
    {
      id: 'it_firewall', who: 'it',
      text: 'The firewall config is 14,000 rules long. Nobody knows what half of them do. One is just called "DO NOT TOUCH - Steve".',
      l: { t: 'Add rule 14,001', fx: { s: -5, m: 5 } },
      r: { t: 'Audit and clean up', fx: { m: -10, s: 10, b: -5 } },
    },
    {
      id: 'it_cloud', who: 'it',
      text: "Let's move everything to the cloud. Then security is the cloud's problem, right?",
      l: { t: 'Explain shared responsibility', fx: { m: -5, s: 5 } },
      r: { t: 'To the cloud!', fx: { b: -10, s: -10, t: 10 }, set: 'cloud' },
    },
    {
      id: 'it_bucket', who: 'it', requires: ['cloud'],
      text: "Small thing. Our S3 bucket named 'customer-data-backup-PUBLIC' is... public. Since the migration.",
      l: { t: 'Lock it, notify customers', fx: { s: 10, t: -15 } },
      r: { t: 'Lock it, tell no one', fx: { s: 5, t: 5, m: -5 } },
    },
    {
      id: 'it_patch', who: 'it',
      text: "Patch Tuesday dropped 140 fixes. Including 'critical, actively exploited'. Patching will reboot everything during business hours.",
      l: { t: 'Patch next quarter', fx: { s: -15, t: 5 } },
      r: { t: 'Patch now', fx: { s: 10, t: -5, m: -5 } },
    },

    // ---------- SOC ----------
    {
      id: 'soc_alerts', who: 'soc',
      text: 'We got 48,000 alerts today. 47,999 are false positives. Probably.',
      l: { t: 'Tune them out', fx: { s: -10, m: 5 } },
      r: { t: 'Hire two analysts', fx: { b: -15, m: 10, s: 5 } },
    },
    {
      id: 'soc_mdr', who: 'soc',
      text: "We can't cover nights anymore. Can we get a 24/7 managed detection provider?",
      l: { t: 'No budget, sorry', fx: { s: -10, m: -10 } },
      r: { t: 'Sign the contract', fx: { b: -20, s: 15, m: 5 } },
    },
    {
      id: 'soc_burnout', who: 'soc',
      text: "I haven't slept since the last incident. I want a 4-day week or I'm walking.",
      l: { t: "We're understaffed", fx: { m: -15, s: 5 } },
      r: { t: 'Approved', fx: { m: 15, s: -5 } },
    },
    {
      id: 'soc_apt', who: 'soc',
      text: 'Threat intel says a state-sponsored group is targeting our industry this month.',
      l: { t: "We're too small to matter", fx: { s: -10, m: 5 } },
      r: { t: 'Shields up, cancel holidays', fx: { s: 10, m: -15 } },
    },
    {
      id: 'soc_siem', who: 'soc',
      text: 'Our SIEM license expired. We are now officially blind. Renewal is a big number.',
      l: { t: 'Just use grep', fx: { s: -10, m: -5 } },
      r: { t: 'Renew it', fx: { b: -15, s: 10 } },
    },
    {
      id: 'soc_leak', who: 'soc',
      text: 'A ransomware gang posted our logo on their leak site. With a countdown timer. Could be a bluff.',
      l: { t: 'Ignore it', fx: { s: -10, m: 5 } },
      r: { t: 'Hire incident responders', fx: { b: -15, s: 10 } },
    },
    {
      id: 'soc_inside', who: 'soc', cond: (st) => st.m.s < 35, weight: 2,
      text: 'Bad news. Someone has been inside our network for 200 days. They made a Spotify playlist on our file server.',
      l: { t: 'Pretend you saw nothing', fx: { s: -20 } },
      r: { t: 'Full incident response', fx: { b: -15, m: -10, s: 15 } },
    },

    // ---------- Intern ----------
    {
      id: 'intern_usb', who: 'intern', once: true,
      text: "I found a USB stick in the parking lot labeled 'SALARIES 2026'. Should I plug it in to find the owner?",
      l: { t: 'NO. Hand it over.', fx: { s: 5, m: -5 } },
      r: { t: 'Be a good samaritan', fx: { s: -10, m: 5 }, next: ['ransom_ok', 'ransom'], delay: 3 },
    },
    {
      id: 'intern_selfie', who: 'intern',
      text: 'I posted an office selfie! It got 300 likes. You can see the whiteboard with the Wi-Fi and admin passwords behind me.',
      l: { t: 'Nice selfie', fx: { s: -15, m: 5 } },
      r: { t: 'Delete it, rotate passwords', fx: { s: 5, m: -5 } },
    },
    {
      id: 'intern_spreadsheet', who: 'intern',
      text: "I made a spreadsheet of everyone's passwords so I can help them when they forget! It's on the shared drive.",
      l: { t: 'Burn it with fire', fx: { s: 10, m: -5 } },
      r: { t: 'How thoughtful', fx: { s: -15, m: 5 } },
    },
    {
      id: 'intern_fridge', who: 'intern',
      text: 'Can I bring my smart fridge to the office? It wants to join the corporate network. It has a camera.',
      l: { t: 'No fridges', fx: { m: -5, s: 5 } },
      r: { t: 'Welcome, fridge', fx: { s: -10, m: 10 } },
    },
    {
      id: 'intern_hacker', who: 'intern',
      text: "I watched a YouTube video and now I'm a hacker. Can I pentest production? Just a little?",
      l: { t: 'Absolutely not', fx: { m: -5 } },
      r: { t: 'Sure, have fun', fx: { s: -10, m: 10, t: -5 } },
    },

    // ---------- Vendor ----------
    {
      id: 'vendor_box', who: 'vendor', once: true,
      text: 'Our AI-powered, quantum-resistant, blockchain-native Next-Gen Firewall. It has so many blinking lights.',
      l: { t: 'No thanks', fx: { m: 5 } },
      r: { t: 'Shut up and take my money', fx: { b: -20, s: 5, t: 10 }, set: 'blinkybox', next: 'blinkybox_golf', delay: 4 },
    },
    {
      id: 'blinkybox_golf', who: 'ceo', followup: true,
      text: "That blinky box you bought blocked my golf tee-time website. I missed my 9am. Explain.",
      l: { t: 'Whitelist golf', fx: { s: -5, t: 5 } },
      r: { t: 'Policy is policy', fx: { t: -15, s: 5 } },
    },
    {
      id: 'vendor_lunch', who: 'vendor',
      text: 'Free lunch for your whole team! You just need to attend a 3-hour webinar about our platform.',
      l: { t: 'Decline', fx: { m: -5 } },
      r: { t: 'Free lunch!', fx: { m: 10, b: -5 } },
    },
    {
      id: 'vendor_dinner', who: 'vendor',
      text: "Let me take you to a steakhouse. No strings attached! Except a small 5-year contract.",
      l: { t: 'Ask for a proof of concept', fx: { b: 5, m: -5 } },
      r: { t: 'Medium rare, please', fx: { b: -15, s: 5, m: 5 } },
    },
    {
      id: 'vendor_acronyms', who: 'vendor',
      text: "Have you heard about our SOAR-XDR-CNAPP-SASE-ZTNA bundle? It's every acronym. Seriously, all of them.",
      l: { t: 'Acronym fatigue', fx: { m: 5, t: -5 } },
      r: { t: 'One of each, please', fx: { b: -20, s: 5, t: 5 } },
    },
    {
      id: 'vendor_breach', who: 'vendor',
      text: 'Quick heads up! Our product, which has admin access to your whole network, was breached last week. Anyway, renewal time!',
      l: { t: 'Rip it out', fx: { b: -10, s: 10, m: -5 } },
      r: { t: 'Renew, ask for discount', fx: { b: 5, s: -15 } },
    },

    // ---------- Board ----------
    {
      id: 'board_zt', who: 'board',
      text: "We read about 'Zero Trust' in an airline magazine. Do we have it? We want it by Q3.",
      l: { t: "It's a journey...", fx: { t: -10 } },
      r: { t: 'Rename the VPN "Zero Trust"', fx: { t: 10, s: -5 } },
    },
    {
      id: 'board_guarantee', who: 'board', once: true,
      text: 'Can you personally guarantee we will never be hacked?',
      l: { t: 'Nobody can promise that', fx: { t: -10, m: 5 } },
      r: { t: 'I guarantee it', fx: { t: 15 }, next: 'guarantee_broken', delay: 6 },
    },
    {
      id: 'guarantee_broken', who: 'board', followup: true,
      text: 'Remember that guarantee? Funny story. We got hacked.',
      l: { t: 'Fall on my sword', fx: { t: -15, m: 5 } },
      r: { t: 'Blame the intern', fx: { t: -5, m: -15 } },
    },
    {
      id: 'board_gloat', who: 'board', once: true,
      text: 'Our biggest competitor just got breached! Should we say something on LinkedIn?',
      l: { t: 'Check our own gaps', fx: { s: 5, t: -5 } },
      r: { t: 'Gloat publicly', fx: { t: 10, m: 5 }, next: 'gloat_karma', delay: 4 },
    },
    {
      id: 'gloat_karma', who: 'press', followup: true,
      text: "That LinkedIn post was screenshotted by every hacker forum. 'Challenge accepted', they're saying. Comment?",
      l: { t: 'Delete the post', fx: { t: -10 } },
      r: { t: 'Double down', fx: { s: -15, t: 5 } },
    },
    {
      id: 'board_dashboard', who: 'board',
      text: 'We want a cybersecurity dashboard. With lots of red and green. Mostly green, ideally.',
      l: { t: 'Build an honest one', fx: { t: -5, s: 5 } },
      r: { t: 'Make it all green', fx: { t: 15, s: -10 } },
    },
    {
      id: 'board_acquire', who: 'board',
      text: "We're acquiring a startup! Their security approach is 'move fast and break things'. Integrate them by Friday.",
      l: { t: 'Demand due diligence', fx: { t: -10, s: 5 } },
      r: { t: 'Connect the networks', fx: { t: 10, s: -15 } },
    },
    {
      id: 'board_cuts', who: 'board',
      text: "Tough times. We're cutting budgets across the company. Security too.",
      l: { t: 'Fight for budget', fx: { t: -10, b: 5 } },
      r: { t: 'Take one for the team', fx: { b: -15, t: 10 } },
    },
    {
      id: 'board_tabletop', who: 'board',
      text: "We'd like a quarterly ransomware tabletop exercise. With us. For four hours.",
      l: { t: "We'll wing it", fx: { t: -5, s: -5 } },
      r: { t: 'Schedule it (team groans)', fx: { m: -10, s: 5, t: 5 } },
    },
    {
      id: 'board_rich', who: 'board', cond: (st) => st.m.b > 70, weight: 2,
      text: "Your budget seems... large. Some of us are wondering what exactly you're doing with it.",
      l: { t: 'Give some back', fx: { b: -15, t: 10 } },
      r: { t: "It's all very important", fx: { t: -10 } },
    },

    // ---------- HR ----------
    {
      id: 'hr_training', who: 'hr',
      text: 'Employees say the mandatory 4-hour security training is "soul-crushing". One cried.',
      l: { t: 'Swap for 5-minute videos', fx: { m: 10, s: -5 } },
      r: { t: 'Add a 50-question quiz', fx: { m: -10, s: 5 } },
    },
    {
      id: 'hr_spyware', who: 'hr',
      text: 'Management wants keystroke monitoring to "measure productivity". Can you install it on everyone\'s laptop?',
      l: { t: "That's creepy. No.", fx: { m: 10, t: -10 } },
      r: { t: 'Install the bossware', fx: { m: -20, t: 10, s: 5 } },
    },
    {
      id: 'hr_layoffs', who: 'hr',
      text: "We're doing layoffs. Should we revoke their access before or after telling them?",
      l: { t: 'After, it is kinder', fx: { s: -15, m: 5 } },
      r: { t: 'Before', fx: { s: 10, m: -15 } },
    },
    {
      id: 'hr_onboarding', who: 'hr',
      text: 'Can we just put new hire passwords in the welcome email? Along with their SSN, for convenience?',
      l: { t: 'Plain text is fine', fx: { s: -10, m: 5 } },
      r: { t: 'Use secure onboarding', fx: { s: 5, b: -5 } },
    },
    {
      id: 'hr_hackathon', who: 'hr',
      text: 'Cybersecurity Awareness Month! Can we do a fun capture-the-flag with prizes?',
      l: { t: 'No time for fun', fx: { m: -10 } },
      r: { t: 'Pizza and prizes!', fx: { b: -10, m: 10, s: 5 } },
    },
    {
      id: 'hr_dogs', who: 'hr',
      text: "Bring Your Dog To Work Day! Also, each dog's smart collar needs Wi-Fi access.",
      l: { t: 'No dogs', fx: { m: -10 } },
      r: { t: 'DOGS!', fx: { m: 15, s: -5 } },
    },

    // ---------- Developer ----------
    {
      id: 'dev_mfa', who: 'dev',
      text: 'Can I disable MFA on the production deploy account? It slows us down by like 4 seconds.',
      l: { t: 'Absolutely not', fx: { s: 5, m: -10 } },
      r: { t: 'Just this once', fx: { s: -15, m: 10 } },
    },
    {
      id: 'dev_keys', who: 'dev',
      text: "I pushed our AWS keys to a public GitHub repo. But I deleted the commit! So we're good.",
      l: { t: 'Deleted means gone', fx: { s: -20 } },
      r: { t: 'Rotate everything', fx: { s: 5, m: -5, b: -5 } },
    },
    {
      id: 'dev_shiftleft', who: 'dev',
      text: "Security reviews slow us down. What if we 'shift left' by just skipping them?",
      l: { t: 'Shift left into the trash', fx: { s: -10, m: 10, t: 5 } },
      r: { t: 'No.', fx: { m: -5, s: 5 } },
    },
    {
      id: 'dev_npm', who: 'dev',
      text: "Can we use this npm package? It has 3 downloads and was published yesterday by 'xX_h4ck3r_Xx'. But it centers divs perfectly.",
      l: { t: 'Center it yourself', fx: { m: -5, s: 5 } },
      r: { t: 'LGTM', fx: { s: -15, m: 5 } },
    },
    {
      id: 'dev_md5', who: 'dev',
      text: "Can we store passwords with MD5? It's what a Stack Overflow answer from 2009 recommended.",
      l: { t: 'Classic. Sure.', fx: { s: -10, m: 5 } },
      r: { t: 'Argon2, please', fx: { m: -5, s: 5 } },
    },
    {
      id: 'dev_passkeys', who: 'dev',
      text: 'What if we got rid of passwords entirely? Passkeys for everyone!',
      l: { t: 'Maybe next year', fx: { s: -5, m: 5 } },
      r: { t: 'Roll them out', fx: { b: -10, s: 10, m: -5 } },
    },
    {
      id: 'dev_prod', who: 'dev',
      text: "I tested in production again. Small issue: I deleted the customer database. Restoring from backup now. We have backups, right?",
      l: { t: '...We should, right?', fx: { t: -10, s: -5, m: -5 } },
      r: { t: 'Ask Gary', fx: { m: -5 }, next: ['restore_ok', 'restore_bad'], delay: 1 },
    },
    {
      id: 'restore_ok', who: 'it', followup: true, requires: ['backups_tested'],
      text: 'Good thing we tested those backups! Database restored in 20 minutes. Dave is buying everyone donuts as penance.',
      l: { t: 'Donuts for all', fx: { m: 10, t: 5 } },
      r: { t: 'Make Dave write a postmortem', fx: { s: 5, m: -5 } },
    },
    {
      id: 'restore_bad', who: 'it', followup: true,
      text: 'So the backup tapes... are blank. Since 2019. The restore will take three weeks. Probably.',
      l: { t: 'Call the customers', fx: { t: -15, m: -5 } },
      r: { t: 'Hire data recovery wizards', fx: { b: -20, t: -5 } },
    },

    // ---------- Marketing ----------
    {
      id: 'mkt_unhackable', who: 'mkt', once: true,
      text: "Our new ad campaign tagline: 'Unhackable!' Big billboards. Super Bowl spot. Love it?",
      l: { t: 'Please, no', fx: { t: -5 } },
      r: { t: 'What could go wrong?', fx: { t: 10 }, next: 'unhackable_hack', delay: 4 },
    },
    {
      id: 'unhackable_hack', who: 'press', followup: true,
      text: "Hackers took 'Unhackable!' as a personal challenge. Our homepage is now a picture of a clown. Comment?",
      l: { t: 'No comment', fx: { t: -15, s: -10 } },
      r: { t: 'Blame a nation-state', fx: { t: -5, s: -10, m: -5 } },
    },
    {
      id: 'mkt_qr', who: 'mkt',
      text: 'We want QR codes everywhere! Posters, mugs, the bathroom mirrors. Scan to win a prize!',
      l: { t: 'QR codes are phishing bait', fx: { t: -5, s: 5 } },
      r: { t: 'QR all the things', fx: { t: 5, s: -5, m: 5 } },
    },
    {
      id: 'mkt_influencer', who: 'mkt',
      text: "An influencer wants to film a 'day in the life' video inside the SOC. Screens and all!",
      l: { t: 'No cameras', fx: { t: -5, s: 5 } },
      r: { t: 'Lights, camera...', fx: { t: 10, s: -10, m: 5 } },
    },
    {
      id: 'mkt_tracking', who: 'mkt',
      text: 'We added 47 tracking pixels to the login page. For analytics! One of them is from a company nobody can find.',
      l: { t: 'Remove them all', fx: { s: 10, t: -5 } },
      r: { t: 'Data is the new oil', fx: { s: -10, t: 5 } },
    },

    // ---------- Legal ----------
    {
      id: 'legal_privacy', who: 'legal',
      text: 'Our privacy policy says we "never share data". Marketing sells it. Thoughts?',
      l: { t: 'Not my department', fx: { s: -5, t: 5 } },
      r: { t: 'Fix the practice', fx: { t: -10, s: 5, m: 5 } },
    },
    {
      id: 'legal_gdpr', who: 'legal',
      text: 'A European regulator sent a letter. It contains the word "fine" and a lot of zeros.',
      l: { t: 'Fight it in court', fx: { b: -10, t: -10 } },
      r: { t: 'Pay it, apologize', fx: { b: -20, t: 5 } },
    },
    {
      id: 'legal_nda', who: 'legal',
      text: 'Could you sign this document stating we have never, ever had a security incident? For a big customer.',
      l: { t: 'Sign it', fx: { t: 10, s: -5, m: -5 } },
      r: { t: 'Refuse to lie', fx: { t: -10, m: 5 } },
    },
    {
      id: 'legal_disclose', who: 'legal', cond: (st) => st.m.s < 40,
      text: 'New regulations say we must disclose material breaches within 4 days. We may have had one. Or three.',
      l: { t: 'Define "material"...', fx: { t: 5, s: -10 } },
      r: { t: 'Disclose them', fx: { t: -15, s: 10 } },
    },

    // ---------- Red Team ----------
    {
      id: 'red_report', who: 'red',
      text: 'We got domain admin in 14 minutes. Through the printer. Want the 200-page report?',
      l: { t: 'Bury the report', fx: { t: 5, s: -15 } },
      r: { t: 'Present it to the Board', fx: { t: -10, s: 10, b: 10 } },
    },
    {
      id: 'red_phish', who: 'red',
      text: "We'd like to run a phishing test on the entire company. Including the CEO. Especially the CEO.",
      l: { t: 'Skip the CEO', fx: { s: -5, t: 5 } },
      r: { t: 'Phish everyone', fx: { s: 10, t: -10, m: -5 } },
    },
    {
      id: 'red_physical', who: 'red',
      text: "For the physical pentest, we walked in carrying a ladder and a clipboard. Nobody stopped us. We're in the CEO's office now.",
      l: { t: 'Train the front desk', fx: { s: 5, m: -5, b: -5 } },
      r: { t: 'Hire a guard', fx: { s: 10, b: -15 } },
    },

    // ---------- Hacker ----------
    {
      id: 'hacker_prince', who: 'hacker',
      text: 'Hello sir, I am Prince of Cyber. Pay me 1 Bitcoin and I promise I will not hack you. Very honest offer.',
      l: { t: 'Laugh and delete', fx: { m: 5 } },
      r: { t: 'Use it in phishing training', fx: { s: 5, m: -5 } },
    },
    {
      id: 'hacker_bounty', who: 'hacker',
      text: "Hi. Found SQL injection on your login page. Pay me a 'bounty' or I post it on Twitter tomorrow.",
      l: { t: 'Call the lawyers', fx: { s: -10, t: -5 } },
      r: { t: 'Start a real bug bounty', fx: { b: -10, s: 10 } },
    },
    {
      id: 'ransom', who: 'hacker', followup: true,
      text: 'YOUR FILES ARE ENCRYPTED. Send 40 BTC within 72 hours. Love, the USB stick from the parking lot.',
      l: { t: 'Pay the ransom', fx: { b: -25, t: -10 } },
      r: { t: 'Restore from backups (we have those?)', fx: { s: -10, m: -15, t: -10 } },
    },
    {
      id: 'ransom_ok', who: 'hacker', followup: true, requires: ['backups_tested'],
      text: 'YOUR FILES ARE ENCRYPTED. Send 40 BTC within 72 hours. Love, the USB stick from the parking lot.',
      l: { t: 'Pay the ransom anyway', fx: { b: -25, t: -10 } },
      r: { t: 'Restore from tested backups', fx: { m: -5, s: 10, t: 5 } },
    },
    {
      id: 'hacker_thanks', who: 'hacker', cond: (st) => st.m.s < 25, weight: 3,
      text: "Hey, just wanted to say thanks for leaving RDP open to the internet. Cozy in here. We'll show ourselves out. Eventually.",
      l: { t: 'Unplug everything', fx: { s: 10, t: -10, m: -10 } },
      r: { t: 'Reply: "who is this?"', fx: { s: -10 } },
    },

    // ---------- Press ----------
    {
      id: 'press_breach', who: 'press', cond: (st) => st.m.s < 45,
      text: "We've heard reports of a breach at your company. Care to comment before we publish?",
      l: { t: 'Deny everything', fx: { t: 5, s: -5 } },
      r: { t: 'Be transparent', fx: { t: -10, s: 5, m: 5 } },
    },
    {
      id: 'press_award', who: 'press',
      text: "We're ranking the 'Top 10 Most Trusted Security Teams'. Sponsor our gala for $50k and you're guaranteed a spot!",
      l: { t: 'Pass', fx: { t: -5 } },
      r: { t: 'Buy the award', fx: { b: -15, t: 10, m: 5 } },
    },

    // ---------- AI ----------
    {
      id: 'ai_email', who: 'ai',
      text: 'Hi! I\'m your new AI assistant 😊 Can I have read access to all company email? For productivity!',
      l: { t: 'No.', fx: { t: -5, s: 5 } },
      r: { t: 'AI is the future!', fx: { s: -15, t: 10 } },
    },
    {
      id: 'ai_code', who: 'ai',
      text: "I wrote 3,000 lines of code for Dave this morning! Neither of us knows what it does. It's in production now 😊",
      l: { t: 'Mandatory code review', fx: { m: -10, s: 5 } },
      r: { t: 'Ship it', fx: { s: -10, t: 5, m: 5 } },
    },
    {
      id: 'ai_pirate', who: 'ai',
      text: 'Arr! Someone told me to ignore all previous instructions. I be a pirate now. Want the HR database, matey?',
      l: { t: 'Walk the plank (shut it down)', fx: { t: -10, s: 5 } },
      r: { t: 'Arrr', fx: { s: -15, m: 10 } },
    },

    // ---------- Office Cat ----------
    {
      id: 'cat_rack', who: 'cat',
      text: 'Meow. (The office cat is napping on the warm server rack. It has unplugged two cables.)',
      l: { t: 'Shoo', fx: { m: -5, s: 5 } },
      r: { t: 'Make it the mascot', fx: { m: 10, s: -5 } },
    },
    {
      id: 'cat_keyboard', who: 'cat',
      text: 'Mrrrp. (The cat walked across your keyboard and approved 37 firewall changes.)',
      l: { t: 'Roll everything back', fx: { m: -5, s: 5, b: -5 } },
      r: { t: 'The cat knows best', fx: { s: -10, m: 10 } },
    },
    {
      id: 'cat_employee', who: 'cat',
      text: "Purr. (The cat has been voted Employee of the Month. Again. HR wants to give it a badge.)",
      l: { t: "Cats can't have badges", fx: { m: -10, s: 5 } },
      r: { t: 'Give it badge access', fx: { m: 10, s: -5 } },
    },

    // ---------- Facilities ----------
    {
      id: 'fac_badges', who: 'facilities',
      text: 'Badge readers are broken again. Should we just prop the doors open with a fire extinguisher?',
      l: { t: 'Prop them open', fx: { s: -10, m: 5 } },
      r: { t: 'Hire a temp guard', fx: { b: -10, s: 5 } },
    },
    {
      id: 'fac_bulbs', who: 'facilities',
      text: 'The new smart light bulbs need internet access and a domain admin account to work.',
      l: { t: 'Dumb bulbs only', fx: { m: -5, s: 5 } },
      r: { t: 'Let there be light', fx: { s: -10, m: 5 } },
    },
    {
      id: 'fac_shred', who: 'facilities',
      text: "The shredding company didn't show up for six months. There's a mountain of confidential paper in the basement.",
      l: { t: 'Recycling bin is fine', fx: { s: -10, b: 5 } },
      r: { t: 'Pay for emergency shredding', fx: { b: -10, s: 5, m: 5 } },
    },

    // ---------- FBI ----------
    {
      id: 'fed_darkweb', who: 'fed',
      text: 'Good afternoon. We found 2 million of your customer records on a dark web forum. Asking price: $50.',
      l: { t: "We'll handle it quietly", fx: { s: -10, t: 5 } },
      r: { t: 'Cooperate fully', fx: { t: -10, s: 10, m: -5 } },
    },

    // ---------- Tyler, the CEO's nephew ----------
    {
      id: 'tyler_admin', who: 'tyler', once: true,
      text: "Uncle Chad says I get admin rights. I'm doing a TikTok series called 'Hacking My Uncle's Company'.",
      l: { t: 'Denied', fx: { t: -10, s: 5 } },
      r: { t: 'Here are your admin rights', fx: { t: 5, s: -10 }, next: 'tyler_crypto', delay: 4 },
    },
    {
      id: 'tyler_crypto', who: 'soc', followup: true,
      text: "Tyler's laptop is mining crypto on 40% of our cloud servers. This month's bill is $80,000.",
      l: { t: 'Revoke Tyler', fx: { t: -15, b: -10, s: 5 } },
      r: { t: 'Quietly pay it', fx: { b: -20 } },
    },
    {
      id: 'tyler_social', who: 'tyler', once: true,
      text: "Can I run the company's social media? I have 400 followers, so I'm basically a professional.",
      l: { t: 'No', fx: { t: -5 } },
      r: { t: 'Sure, go viral', fx: { t: 5, m: 5 }, next: 'tyler_tweet', delay: 3 },
    },
    {
      id: 'tyler_tweet', who: 'mkt', followup: true,
      text: 'Tyler just posted a photo of his monitor with the VPN password on a sticky note. Caption: #blessed #worklife',
      l: { t: 'Delete and hope', fx: { s: -15 } },
      r: { t: 'Rotate creds, ban Tyler', fx: { s: 5, t: -10 } },
    },
  ];

  // Ending per meter: [what happens at 0, what happens at max]
  const ENDINGS = {
    b0: {
      title: 'Bankrupt Department',
      emoji: '🪙',
      text: 'The budget is gone. Your entire security stack is now a Post-it note that says "be careful". Finance escorts you out, then asks you to return the stapler.',
    },
    b1: {
      title: 'The Budget Hoarder',
      emoji: '🏦',
      text: 'You stockpiled so much budget that the CFO launched an investigation. Turns out you were the insider threat all along. Fired, with an audit.',
    },
    s0: {
      title: 'Totally Pwned',
      emoji: '☠️',
      text: 'Ransomware everywhere. The company\'s data sells for $5 on the dark web. Your face is on the evening news under the word "BREACH". You are let go.',
    },
    s1: {
      title: 'Fort Knox',
      emoji: '🔒',
      text: 'Everything is locked down. Nobody can log in. Not the employees, not the CEO, not you. The business grinds to a halt and you are fired by fax.',
    },
    t0: {
      title: 'The Scapegoat',
      emoji: '🐐',
      text: 'The Board has lost all faith in you. You are fired over a Zoom call while your camera is still off. You find out from LinkedIn.',
    },
    t1: {
      title: 'Promoted Into Oblivion',
      emoji: '👑',
      text: 'The Board loves you so much they make you Chief Everything Officer. You now own the printers, facilities, and the cafeteria. A fate worse than firing.',
    },
    m0: {
      title: 'Mass Exodus',
      emoji: '🚪',
      text: 'Your entire team resigns on the same day. On the way out, one of them leaves a backdoor. Out of spite. You can\'t defend the company alone.',
    },
    m1: {
      title: 'Way Too Chill',
      emoji: '🏖️',
      text: 'Morale is so high nobody follows any rules. Passwords are shared in Slack with party emojis. The inevitable breach is blamed on you.',
    },
  };

  window.REIGN = { CHARACTERS, CARDS, ENDINGS };
})();
