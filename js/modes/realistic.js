/*
 * Realistic mode: Group CISO of a large, ECB-supervised European bank.
 * The bank and every character are fictional. Regulatory references (DORA, GDPR,
 * the Instant Payments Regulation, SWIFT CSP, TIBER-EU) are real and stated as
 * they apply from 2025 onwards.
 *
 * Design rule for this deck: the "obvious" answer is often wrong, and many wrong
 * calls look cheap now and schedule a painful follow-up later. Good calls usually
 * still cost something.
 *
 * Meters: b = budget, s = cyber resilience, t = supervisor standing,
 * m = business support (Board and business lines).
 * `best` marks the sound call on a card; it powers the end-of-run debrief.
 * Card format is documented in js/modes/README.md.
 */
(function () {
  const CHARACTERS = {
    ceo: { name: 'Dr. Katarina Voss', role: 'Group CEO', emoji: '👩‍💼', color: '#2f4a7a' },
    cfo: { name: 'Henrik Lund', role: 'Group CFO', emoji: '👨‍💼', color: '#2e6b4f' },
    cro: { name: 'Marie Dubois', role: 'Chief Risk Officer (your boss)', emoji: '🧑‍💼', color: '#7a3b2e' },
    cio: { name: 'Matteo Rossi', role: 'Group CIO', emoji: '👨‍💻', color: '#4b3f72' },
    jst: { name: 'JST Coordinator', role: 'ECB Joint Supervisory Team', emoji: '🏛️', color: '#1f3b57' },
    board: { name: 'Board Risk Committee', role: 'Supervisory Board', emoji: '🎩', color: '#4a3b2a' },
    audit: { name: 'Ingrid Novak', role: 'Head of Internal Audit', emoji: '🧐', color: '#5d6d7e' },
    dpo: { name: 'Lukas Brandt', role: 'Data Protection Officer', emoji: '🔏', color: '#5b4a6e' },
    soc: { name: 'Aoife Byrne', role: 'Head of Cyber Defence', emoji: '🎧', color: '#8a5a1f' },
    tprm: { name: 'Pieter de Vries', role: 'Head of Third-Party Risk', emoji: '📑', color: '#3d6b6b' },
    pay: { name: 'Elena García', role: 'Head of Payments', emoji: '💳', color: '#6b2f5a' },
    retail: { name: 'Jonas Weber', role: 'Head of Retail Banking', emoji: '🏪', color: '#7d5a1f' },
    markets: { name: 'Alessandro Conti', role: 'Head of Global Markets', emoji: '📈', color: '#1f5a3d' },
    arch: { name: 'Sofia Lindqvist', role: 'Chief Architect', emoji: '👷‍♀️', color: '#34495e' },
    mainframe: { name: 'Klaus Richter', role: 'Mainframe Lead', emoji: '👴', color: '#555b3a' },
    red: { name: 'Red Team Lead', role: 'External TLPT Provider', emoji: '🥷', color: '#7a1b1b' },
    intel: { name: 'Tomasz Kowalski', role: 'Threat Intelligence', emoji: '🔭', color: '#2c3e50' },
    council: { name: 'Works Council', role: 'Employee Representatives', emoji: '🤝', color: '#6e5a3d' },
    legal: { name: 'Charlotte Meyer', role: 'General Counsel', emoji: '⚖️', color: '#636e72' },
    csirt: { name: 'National CSIRT', role: 'Government Cyber Agency', emoji: '🛰️', color: '#24425e' },
    hr: { name: 'Nadia Haddad', role: 'HR Business Partner', emoji: '🗂️', color: '#8a4b6e' },
    cloud: { name: 'Account Executive', role: 'Hyperscaler Sales', emoji: '☁️', color: '#2471a3' },
    threat: { name: 'Unknown Actor', role: 'Encrypted message', emoji: '💀', color: '#151515' },
    press: { name: 'Julia Hartmann', role: 'Banking Correspondent', emoji: '📰', color: '#3b3b3b' },
  };

  const CARDS = [
    // ---------- Onboarding ----------
    {
      id: 'welcome', who: 'ceo', followup: true,
      text: (st) => st.cisoNo === 1
        ? 'Welcome to Aurelian Bank Group: €900bn balance sheet, 14 countries, supervised directly by the ECB, and DORA has applied since January 2025. Your predecessor left after an on-site inspection. Every call has a cost. Keep all four meters out of the extremes.'
        : `Welcome, Group CISO #${st.cisoNo}. ${st.prevName} lasted ${st.prevWeeks} week${st.prevWeeks === 1 ? '' : 's'}. The supervisor has already asked for your CV.`,
      l: { t: 'Read the risk register first' },
      r: { t: 'Meet the JST first' },
    },

    // ---------- DORA: incident reporting ----------
    {
      id: 'major_incident', best: 'r', who: 'soc',
      text: 'Card authorisations failed for 31% of clients for 2 hours. At 09:00 it was classified as a major ICT-related incident under DORA. Communications wants to wait for root cause before telling anyone outside the bank.',
      l: { t: 'Wait for root cause', fx: { t: -20, m: 5 } },
      r: { t: 'Initial notification within 4 hours', fx: { t: 10, m: -5 } },
    },
    {
      id: 'incident_class', best: 'l', who: 'cio',
      text: "A 40-minute online banking outage. Matteo says it's 'obviously not major' and doesn't want the paperwork. Nobody has run it against the DORA classification criteria yet.",
      l: { t: 'Classify it against the criteria', fx: { m: -5, t: 5 } },
      r: { t: 'Trust the CIO, log it internally', fx: { m: 5 }, next: 'incident_misclassified', delay: 5 },
    },
    {
      id: 'incident_misclassified', best: 'l', who: 'jst', followup: true,
      text: 'Our review of your incident log found an outage that met the major-incident thresholds on clients affected and reputational impact. It was never reported. Please explain.',
      l: { t: 'Own it, fix the classification process', fx: { t: -10, m: -5 } },
      r: { t: 'Argue the thresholds', fx: { t: -20 } },
    },
    {
      id: 'gdpr_breach', best: 'r', who: 'dpo',
      text: "A misconfigured API exposed 80,000 customers' IBANs and addresses for three days. We became aware this morning. It's Friday, 17:00. Legal wants to 'assess over the weekend'.",
      l: { t: 'Assess first, notify when certain', fx: { t: -15, m: 5 } },
      r: { t: 'Notify the DPA within 72h, keep assessing', fx: { t: 10, m: -5 } },
    },

    // ---------- DORA: TLPT ----------
    {
      id: 'tlpt_internal', best: 'r', who: 'cfo', once: true,
      text: 'The threat-led penetration test is due. Procurement says using our own internal red team instead of external testers would save €1.2M.',
      l: { t: 'Use the internal team', fx: { b: 10 }, next: 'tlpt_rejected', delay: 4 },
      r: { t: 'Contract external TIBER-EU testers', fx: { b: -10, s: 10, t: 5 } },
    },
    {
      id: 'tlpt_rejected', best: 'l', who: 'jst', followup: true,
      text: 'The TLPT authority cannot accept your test. Credit institutions classified as significant must use external testers only. The test must be repeated.',
      l: { t: 'Redo it with external testers', fx: { b: -15, t: -5 } },
      r: { t: 'Escalate a legal challenge', fx: { t: -15, b: -5 } },
    },
    {
      id: 'tlpt_scope', best: 'r', who: 'markets',
      text: 'The TLPT scope includes the trading platform. Alessandro wants it excluded: "a red team on live production during market hours is insane."',
      l: { t: 'Exclude it, it is too risky', fx: { m: 10, t: -10, s: -5 } },
      r: { t: 'Keep it in, with a control team and kill-switch', fx: { m: -5, s: 5, t: 5 } },
    },
    {
      id: 'tlpt_finding', best: 'r', who: 'red',
      text: "We phished the Head of Global Markets and reached the trading platform's admin plane in 9 days. He has asked for that path to be removed from the report.",
      l: { t: 'Remove it from the report', fx: { m: 10, t: -10, s: -5 } },
      r: { t: 'Keep it, brief him privately first', fx: { m: -10, t: 5, s: 5 } },
    },

    // ---------- DORA: third-party risk ----------
    {
      id: 'register_info', best: 'r', who: 'tprm',
      text: "The DORA Register of Information is due to the supervisor. 40% of entries lack LEIs, and nobody has mapped the subcontractor chains for critical functions.",
      l: { t: 'Submit what we have', fx: { m: 5, t: -10 } },
      r: { t: 'Six-week sprint with procurement', fx: { b: -5, m: -10, t: 10 } },
    },
    {
      id: 'cloud_contract', best: 'r', who: 'cloud', once: true,
      text: 'Ready to move your credit-risk analytics to us? Our standard terms are non-negotiable. Audit rights are covered by our SOC 2 report, and an exit plan "is never needed".',
      l: { t: 'Sign the standard terms', fx: { m: 10, b: 5 }, next: 'cloud_finding', delay: 5 },
      r: { t: 'Insist on DORA Art. 30 clauses and an exit plan', fx: { m: -10, t: 10, b: -5 } },
    },
    {
      id: 'cloud_finding', best: 'l', who: 'jst', followup: true,
      text: 'Your credit-risk analytics contract has no unrestricted audit and access rights, no termination rights and no exit strategy. We expect a remediation plan by month-end.',
      l: { t: 'Renegotiate at any cost', fx: { b: -10, t: 5, m: -5 } },
      r: { t: 'Accept the finding, plan to fix next year', fx: { t: -15 } },
    },
    {
      id: 'ctpp', best: 'r', who: 'cfo',
      text: 'Our main cloud provider was designated a critical ICT third-party provider, so the ESAs oversee them now. Can we cut our own vendor oversight team in half?',
      l: { t: 'Yes, the Lead Overseer has it covered', fx: { b: 10, t: -15 } },
      r: { t: 'No, our own obligations stay', fx: { b: -5, t: 5 } },
    },
    {
      id: 'concentration', best: 'l', who: 'arch', once: true,
      text: 'Mobile banking, fraud scoring and treasury now all run in a single region of one cloud provider. Cheapest setup we have ever had.',
      l: { t: 'Fund a multi-region design', fx: { b: -10, s: 10, t: 5 } },
      r: { t: 'Cloud is resilient by design', fx: { b: 5 }, next: 'region_outage', delay: 6 },
    },
    {
      id: 'region_outage', best: 'l', who: 'soc', followup: true,
      text: 'The cloud region is down. Mobile banking, fraud scoring and treasury are all offline. Our impact tolerance was 4 hours. We are at hour 9.',
      l: { t: 'Manual workarounds, branches open late', fx: { m: -15, b: -5 } },
      r: { t: 'Wait for the provider', fx: { t: -15, m: -10 } },
    },
    {
      id: 'fourth_party', best: 'r', who: 'tprm',
      text: 'Our core banking vendor quietly subcontracted 24/7 support to a company outside the EU with production access. We were never told.',
      l: { t: "Not our contract, not our problem", fx: { t: -10, s: -10 } },
      r: { t: 'Invoke subcontracting and audit rights', fx: { t: 5, s: 5, m: -5 } },
    },
    {
      id: 'saas_breach', best: 'r', who: 'tprm',
      text: "Our HR SaaS provider was breached. They're 'investigating' and won't share indicators of compromise until their PR team approves.",
      l: { t: 'Wait for their report', fx: { s: -10 } },
      r: { t: 'Invoke incident notification clauses, hunt now', fx: { s: 5, b: -5, m: -5 } },
    },
    {
      id: 'exit_test', best: 'r', who: 'cro',
      text: "We have an exit plan for our main cloud provider. It is 40 pages long and has never been tested.",
      l: { t: "It's documented, that's enough", fx: { t: -5, s: -5 } },
      r: { t: 'Run a partial exit test', fx: { b: -5, s: 5, t: 5 } },
    },

    // ---------- Governance ----------
    {
      id: 'board_training', best: 'r', who: 'board',
      text: "DORA makes the management body ultimately responsible for ICT risk, and says its members must keep their ICT risk knowledge current. The Board says they're 'too busy' for training.",
      l: { t: 'Send them a newsletter', fx: { m: 5, t: -10 } },
      r: { t: 'Mandatory session with a live tabletop', fx: { m: -5, t: 10 } },
    },
    {
      id: 'reporting_line', best: 'r', who: 'cio', once: true,
      text: 'Matteo wants the CISO function to report to him "to streamline delivery". You currently sit in the second line under the CRO.',
      l: { t: 'Report to the CIO', fx: { m: 10 }, next: 'independence_finding', delay: 5 },
      r: { t: 'Stay independent in the second line', fx: { m: -5, t: 5 } },
    },
    {
      id: 'independence_finding', best: 'l', who: 'audit', followup: true,
      text: 'Since the reorg, the ICT risk control function reports to the person who runs ICT operations. That is a segregation-of-duties finding, and the supervisor will see it.',
      l: { t: 'Reverse the reorg', fx: { m: -10, t: -5 } },
      r: { t: 'Defend it', fx: { t: -15 } },
    },
    {
      id: 'framework_review', best: 'r', who: 'cro',
      text: 'The ICT risk management framework must be reviewed at least once a year. Ours was last reviewed 19 months ago.',
      l: { t: 'Bundle it with next year\'s strategy', fx: { t: -10, m: 5 } },
      r: { t: 'Review now, management body sign-off', fx: { m: -5, t: 10 }, set: 'framework_ok' },
    },
    {
      id: 'onsite', who: 'jst', once: true,
      text: 'We are starting an on-site inspection on ICT and security risk next month. First request: your ICT risk management framework and evidence of its annual review.',
      l: { t: 'Send it as it is', fx: { t: -5 }, next: ['onsite_good', 'onsite_bad'], delay: 3 },
      r: { t: 'Spend €1M on consultants to polish it', fx: { b: -10, m: -5 }, next: ['onsite_good', 'onsite_bad'], delay: 3 },
    },
    {
      id: 'onsite_good', who: 'jst', followup: true, requires: ['framework_ok'],
      text: 'Inspection closed. Two medium findings, no high. Your framework review was recent and properly approved. The JST notes "improved management awareness".',
      l: { t: 'Remediate both quickly', fx: { t: 10, b: -5 } },
      r: { t: 'Celebrate quietly', fx: { m: 5, t: 5 } },
    },
    {
      id: 'onsite_bad', best: 'l', who: 'jst', followup: true,
      text: 'Inspection closed with a high-severity finding: the ICT risk framework was not reviewed within the required interval. Expect a follow-up letter.',
      l: { t: 'Accept it, credible remediation plan', fx: { t: -10, b: -5 } },
      r: { t: 'Contest it', fx: { t: -20 } },
    },
    {
      id: 'quantify', best: 'r', who: 'cro',
      text: 'Marie wants cyber risk properly reflected in operational risk capital planning. All you have is red-amber-green heat maps.',
      l: { t: 'Heat maps are industry standard', fx: { t: -5, m: -5 } },
      r: { t: 'Build a FAIR-style quantification', fx: { b: -5, t: 5, m: 5 } },
    },
    {
      id: 'ale', best: 'r', who: 'cfo',
      text: 'Business case: a €2M/year DLP suite. Your own analysis puts the risk at a single loss of €4M, about once every ten years.',
      l: { t: 'Approve it, security first', fx: { b: -15, m: -5, s: 5 } },
      r: { t: 'Reject: €400k ALE, find cheaper controls', fx: { b: 5, m: 5 } },
    },
    {
      id: 'risk_accept', best: 'r', who: 'retail',
      text: 'Jonas wants to launch a savings product despite a high-risk pentest finding in the onboarding flow. He offers to sign a risk acceptance.',
      l: { t: 'Block the launch', fx: { m: -15, s: 5 } },
      r: { t: 'Time-boxed acceptance with compensating controls', fx: { m: 10, s: -5 } },
    },
    {
      id: 'tabletop', best: 'r', who: 'board',
      text: 'The Board Risk Committee wants a ransomware tabletop. Should it include the "do we pay?" decision?',
      l: { t: 'Keep it technical', fx: { t: -5, m: 5 } },
      r: { t: 'Include payment, sanctions and disclosure', fx: { t: 10, m: -5 } },
    },
    {
      id: 'budget_cut', best: 'r', who: 'cfo',
      text: 'The cost-income ratio is 68%. The Group wants 15% cuts in every function, including yours.',
      l: { t: 'Cut 15% across the board', fx: { b: -15, s: -5, m: 5 } },
      r: { t: 'Risk-based case to the Risk Committee', fx: { b: -5, m: -5, t: 5 } },
    },
    {
      id: 'underspend', best: 'r', who: 'cfo',
      text: 'You are €8M under budget in Q4. Spend it or lose it.',
      l: { t: 'Hand it back', fx: { b: -10, m: 10 } },
      r: { t: 'Fund the top risks on the register', fx: { b: 5, s: 10, m: -5 } },
    },

    {
      id: 'tool_sprawl', best: 'r', who: 'cfo',
      text: 'Subsidiaries run three overlapping EDR platforms and two SIEMs. Each country team swears theirs is the best.',
      l: { t: 'Keep them, local teams know best', fx: { b: -5, m: 5 } },
      r: { t: 'Consolidate onto one stack', fx: { b: 15, m: -10 } },
    },
    {
      id: 'resilience_budget', best: 'l', who: 'board',
      text: "A peer bank's ransomware attack is all over the news. The Board offers you a multi-year resilience budget.",
      l: { t: 'Accept, tied to measurable risk KRIs', fx: { b: 20, m: -5 } },
      r: { t: 'Accept, but avoid hard targets', fx: { b: 10, t: -5 } },
    },
    {
      id: 'shared_soc', who: 'cfo',
      text: 'The insurance and asset-management subsidiaries want to use your SOC. Henrik asks whether they should pay for it.',
      l: { t: 'Free for the whole Group', fx: { b: -5, m: 10 } },
      r: { t: 'Charge them internally', fx: { b: 15, m: -5 } },
    },
    {
      id: 'licences', best: 'r', who: 'tprm',
      text: 'A software asset review found 30% of security licences unused, mostly from projects that ended years ago.',
      l: { t: 'Keep them for growth', fx: { b: -5, m: 5 } },
      r: { t: 'Cancel at renewal', fx: { b: 10, m: -5 } },
    },
    {
      id: 'cloud_credits', best: 'r', who: 'cloud',
      text: "€5M in free credits if you standardise your whole security stack on our platform for five years.",
      l: { t: 'Take the credits', fx: { b: 15, s: -5, t: -5 } },
      r: { t: 'Decline, keep exit options open', fx: { m: -5, t: 5 } },
    },

    // ---------- Resilience ----------
    {
      id: 'backups', best: 'r', who: 'cio', once: true,
      text: 'Backups sit in the same Active Directory domain as production, and domain admins can delete them. A fix means an isolated admin forest and immutable storage.',
      l: { t: 'Backups exist, that is enough', fx: { b: 5, m: 5 } },
      r: { t: 'Isolated, immutable backups', fx: { b: -10, s: 15 }, set: 'immutable' },
    },
    {
      id: 'dr_test', best: 'r', who: 'cio',
      text: 'Annual disaster recovery test for core banking: a real failover to the secondary data centre, or a tabletop walkthrough?',
      l: { t: 'Tabletop walkthrough', fx: { m: 5, s: -5, t: -5 } },
      r: { t: 'Real failover on a Sunday', fx: { m: -10, s: 10, t: 5 } },
    },
    {
      id: 'rto', best: 'r', who: 'pay',
      text: 'Elena wants to set the recovery time objective for instant payments at 24 hours to cut DR costs. SEPA Instant runs 24/7/365.',
      l: { t: 'Accept 24 hours', fx: { b: 10, s: -10, t: -5 } },
      r: { t: 'Impact analysis says 2h tolerance: fund it', fx: { b: -10, s: 10, m: -5 } },
    },
    {
      id: 'mainframe_eol', who: 'mainframe',
      text: 'The core banking mainframe OS leaves extended support in six months. Upgrading means a three-month change freeze.',
      l: { t: 'Pay for premium extended support', fx: { b: -15, m: 5 } },
      r: { t: 'Upgrade and freeze change', fx: { s: 10, m: -15 } },
    },
    {
      id: 'cobol', best: 'r', who: 'mainframe',
      text: 'The last two COBOL engineers retire next year. All the production break-glass passwords live in a binder in Klaus\'s desk.',
      l: { t: 'Offer them contracts to stay on', fx: { b: -10, m: 5 } },
      r: { t: 'Vault, rotate, knowledge transfer', fx: { b: -5, s: 10, m: -5 } },
    },
    {
      id: 'edr_outage', best: 'r', who: 'cio',
      text: 'A faulty security vendor update crashed 9,000 workstations, including branch tellers. The business wants that EDR ripped out.',
      l: { t: 'Remove the EDR', fx: { s: -15, m: 10 } },
      r: { t: 'Recover, then demand staged rollouts', fx: { m: -10, s: 5, t: 5 } },
    },
    {
      id: 'ddos', best: 'r', who: 'soc',
      text: 'Hacktivists are hitting online banking with a 900 Gbps DDoS on payday.',
      l: { t: 'Ride it out', fx: { m: -15, t: -5 } },
      r: { t: 'Activate scrubbing, temporary geo-filtering', fx: { b: -5, m: -5, s: 5 } },
    },
    {
      id: 'ransomware', best: 'r', who: 'threat', cond: (st) => st.m.s < 35, weight: 3, excludes: ['immutable'],
      text: 'We encrypted 2,300 servers and copied 4TB. €45M in Monero, 72 hours. Your backups? We deleted them with your domain admin. Thanks for that.',
      l: { t: 'Pay (sanctions screening is someone else\'s job)', fx: { b: -25, t: -20 } },
      r: { t: 'Refuse, rebuild from scratch', fx: { m: -20, s: -5, b: -5 } },
    },
    {
      id: 'ransomware_immutable', best: 'r', who: 'threat', cond: (st) => st.m.s < 35, weight: 3, requires: ['immutable'],
      text: 'We encrypted 2,300 servers and copied 4TB. €45M in Monero, 72 hours. Hm. Your backups seem to be... immutable?',
      l: { t: 'Pay anyway to stop the leak', fx: { b: -25, t: -15 } },
      r: { t: 'Refuse, restore, notify', fx: { s: 10, m: -10, t: 5 } },
    },

    // ---------- Identity & access ----------
    {
      id: 'mfa_fatigue', best: 'r', who: 'soc',
      text: 'A board member approved 14 MFA push prompts at 2am. The attacker is now reading their mailbox.',
      l: { t: 'Reset their password', fx: { s: -10, m: 5 } },
      r: { t: 'Contain, then phishing-resistant MFA for all', fx: { b: -5, s: 10, m: -5 } },
    },
    {
      id: 'ceo_fido', best: 'r', who: 'ceo',
      text: "I'm not carrying a little USB key around. Exempt me from this phishing-resistant MFA thing.",
      l: { t: 'Exempt the CEO', fx: { m: 5, s: -10 } },
      r: { t: 'Passkey on her phone instead', fx: { s: 5, m: -5 } },
    },
    {
      id: 'pam', best: 'r', who: 'audit',
      text: 'We found 140 standing domain admin accounts. 31 of them belong to people who have left the bank.',
      l: { t: 'Disable the leavers, keep the rest', fx: { s: -5, m: 5 } },
      r: { t: 'Just-in-time privileged access', fx: { b: -5, s: 10, m: -5 } },
    },
    {
      id: 'jml', best: 'r', who: 'soc',
      text: "A dismissed admin's VPN account logged in last night. HR closed the leaver ticket six weeks after their last day.",
      l: { t: 'Remind HR about the process', fx: { s: -10 } },
      r: { t: 'Automate leavers from the HR system', fx: { b: -5, s: 10, m: -5 } },
    },
    {
      id: 'recert', best: 'r', who: 'audit',
      text: 'Access recertification: managers approved 99.8% of entitlements, averaging 4 seconds each.',
      l: { t: "It's compliant, file it", fx: { t: -5, s: -5 } },
      r: { t: 'Focus recert on privileged and toxic combos', fx: { s: 5, m: 5, b: -5 } },
    },
    {
      id: 'shared_logins', best: 'r', who: 'retail',
      text: 'Branch tellers share one login per counter because "MFA takes too long when there is a queue".',
      l: { t: 'Allow shared logins', fx: { m: 10, s: -10, t: -5 } },
      r: { t: 'Badge-tap SSO with personal accounts', fx: { b: -5, s: 10 } },
    },
    {
      id: 'password_rotation', best: 'r', who: 'audit',
      text: 'Audit wants passwords rotated every 30 days. Your standard follows NIST SP 800-63B, which advises against forced periodic changes.',
      l: { t: 'Rotate every 30 days', fx: { m: -10, s: -5 } },
      r: { t: 'Length, breached-password checks, MFA', fx: { m: 5, s: 5, t: -5 } },
    },

    // ---------- Payments ----------
    {
      id: 'swift_attest', best: 'r', who: 'pay', once: true,
      text: 'SWIFT CSP attestation is due. Two mandatory controls in the payments secure zone are not met. Ops wants to attest "compliant" and fix it next quarter.',
      l: { t: 'Attest compliant', fx: { m: 5 }, next: 'swift_fraud', delay: 5 },
      r: { t: 'Attest honestly with a remediation plan', fx: { m: -5, s: 5, t: 5 } },
    },
    {
      id: 'swift_fraud', best: 'l', who: 'pay', followup: true,
      text: 'Over the weekend, fraudulent MT103s worth €81M left from the secure zone. The two controls we did not have would have caught it.',
      l: { t: 'Recall the payments, report it', fx: { b: -5, t: -10, s: 5 } },
      r: { t: 'Recall quietly, keep the attestation', fx: { t: -25 } },
    },
    {
      id: 'vop', best: 'r', who: 'retail',
      text: 'Under the Instant Payments Regulation, Verification of Payee is mandatory. Jonas wants to go live with instant payments first and add VoP "a bit later".',
      l: { t: 'Launch without VoP', fx: { m: 10, t: -15 } },
      r: { t: 'Launch with VoP, even if late', fx: { m: -10, t: 5, s: 5 } },
    },
    {
      id: 'deepfake', best: 'r', who: 'pay',
      text: 'Treasury got a video call from the "CFO" instructing an urgent €25M payment to a new counterparty. It looked and sounded exactly like Henrik.',
      l: { t: 'Process it, it was him', fx: { b: -25, t: -10 } },
      r: { t: 'Out-of-band callback and dual control', fx: { s: 10, m: -5 } },
    },
    {
      id: 'hsm', best: 'r', who: 'pay',
      text: 'HSM key ceremony: the vendor engineer offers to hold one of the three key components himself "to save time".',
      l: { t: 'Sure, saves a day', fx: { s: -15, m: 5 } },
      r: { t: 'Split knowledge: staff custodians only', fx: { s: 5, m: -5 } },
    },
    {
      id: 'pan_logs', best: 'r', who: 'pay',
      text: 'The PCI assessor found full card numbers in plaintext debug logs on 40 application servers.',
      l: { t: 'Restrict access to the logs', fx: { s: -5, m: 5, t: -5 } },
      r: { t: 'Purge, fix logging, find the root cause', fx: { b: -5, s: 10, m: -5 } },
    },

    // ---------- Security operations ----------
    {
      id: 'vpn_zero_day', best: 'r', who: 'intel',
      text: 'CVSS 10 pre-auth RCE in our internet-facing VPN appliance, exploited in the wild. Patching means two hours without remote access for 18,000 staff.',
      l: { t: 'Wait for the change window in 3 weeks', fx: { m: 5 }, next: 'vpn_breach', delay: 2 },
      r: { t: 'Emergency change tonight', fx: { s: 10, m: -5 } },
    },
    {
      id: 'vpn_breach', best: 'r', who: 'soc', followup: true,
      text: 'The VPN appliance just opened a reverse shell to a known command-and-control server. It has been there for 11 days.',
      l: { t: 'Patch it and move on', fx: { s: -15 } },
      r: { t: 'Isolate, call the IR retainer, assume breach', fx: { b: -10, m: -10, s: 5 } },
    },
    {
      id: 'log_retention', best: 'r', who: 'cfo',
      text: 'SIEM ingest costs €6M a year. Henrik wants retention cut from 18 months to 30 days.',
      l: { t: '30 days it is', fx: { b: 15, s: -15, t: -5 } },
      r: { t: 'Tiered storage: 90 days hot, rest in cold', fx: { b: 5, m: -5 } },
    },
    {
      id: 'vuln_backlog', best: 'r', who: 'audit',
      text: 'There are 4,000 critical vulnerabilities past SLA. Most are on servers with no known owner.',
      l: { t: 'Change the SLA from 30 to 180 days', fx: { m: 5, t: -10, s: -5 } },
      r: { t: 'Asset ownership drive and CMDB clean-up', fx: { m: -10, s: 10 } },
    },
    {
      id: 'flat_network', best: 'r', who: 'arch',
      text: 'The guest Wi-Fi VLAN can route to the management interface of the payments HSMs.',
      l: { t: 'Add it to the backlog', fx: { s: -10 } },
      r: { t: 'Emergency ACL, then segmentation programme', fx: { b: -5, s: 10, m: -5 } },
    },
    {
      id: 'sbom', best: 'r', who: 'intel',
      text: 'A Log4Shell-scale flaw just dropped in a common Java library. Which of our 3,000 applications use it? Nobody knows.',
      l: { t: 'One-off scan script', fx: { m: 5, s: -5 } },
      r: { t: 'Emergency scan now, SBOM pipeline after', fx: { b: -5, s: 10, m: -5 } },
    },
    {
      id: 'ai_soc', best: 'r', who: 'cloud',
      text: 'Our AI SOC replaces 60% of your analysts! No bank uses it yet, but you would be our design partner.',
      l: { t: 'Sign 3 years, cut analysts', fx: { b: 15, s: -15 } },
      r: { t: 'Paid pilot with measurable detection KPIs', fx: { b: -5, s: 5 } },
    },
    {
      id: 'info_sharing', best: 'r', who: 'csirt',
      text: 'We invite you to a financial-sector threat intelligence sharing group. DORA encourages these. Legal worries about sharing indicators with competitors.',
      l: { t: 'Decline', fx: { s: -5, m: 5 } },
      r: { t: 'Join under TLP and a sharing agreement', fx: { s: 10, t: 5, b: -5 } },
    },
    {
      id: 'talent', who: 'hr',
      text: 'Your best detection engineer has an offer from a hyperscaler at double her salary. Above the pay band, of course.',
      l: { t: 'Let her go', fx: { s: -10, b: 5 } },
      r: { t: 'Retention package above the band', fx: { b: -10, s: 5, m: -5 } },
    },

    // ---------- People & privacy ----------
    {
      id: 'ueba', best: 'r', who: 'council',
      text: 'You want behavioural analytics to catch insider threats. We remind you that technical monitoring of employees requires our co-determination.',
      l: { t: 'Deploy anyway, it is security', fx: { s: 5, m: -15, t: -5 } },
      r: { t: 'Negotiate a works agreement with pseudonymisation', fx: { m: 5, b: -5 } },
    },
    {
      id: 'insider', best: 'r', who: 'soc',
      text: 'A trader is forwarding client position files to his personal email the night before he resigns.',
      l: { t: 'Let HR deal with it after notice', fx: { s: -10, m: 5 } },
      r: { t: 'Preserve evidence, block, involve Compliance', fx: { s: 10, m: -5 } },
    },
    {
      id: 'phish_shame', best: 'r', who: 'hr',
      text: 'Phishing simulation: 12% clicked. HR proposes publishing the names of repeat clickers on the intranet.',
      l: { t: 'Name and shame', fx: { m: -10, s: -5 } },
      r: { t: 'Coach clickers, reward reporters', fx: { m: 5, s: 5, b: -5 } },
    },
    {
      id: 'genai', best: 'r', who: 'retail',
      text: 'Relationship managers are pasting customer data into a public GenAI chatbot to draft emails. Productivity is up 30%.',
      l: { t: 'Block it everywhere', fx: { m: -10, s: 5 } },
      r: { t: 'Enterprise tenant, DLP and a usage policy', fx: { b: -5, s: 5, m: 5 } },
    },
    {
      id: 'sdk', best: 'r', who: 'retail',
      text: 'Marketing wants a third-party analytics SDK in the banking app. It reads the clipboard and precise location.',
      l: { t: 'Ship it', fx: { m: 10, t: -10, s: -5 } },
      r: { t: 'DPIA and SDK review first', fx: { m: -5, t: 5 } },
    },

    // ---------- Change & delivery ----------
    {
      id: 'bola', best: 'r', who: 'retail', once: true,
      text: 'The new mobile app launches in a week. The pentest found broken object-level authorisation: change an account ID in the request and you see someone else\'s balance.',
      l: { t: 'Launch with a WAF rule', fx: { m: 10 }, next: 'bola_leak', delay: 3 },
      r: { t: 'Delay launch, fix authorisation', fx: { m: -15, s: 10 } },
    },
    {
      id: 'bola_leak', best: 'r', who: 'press', followup: true,
      text: 'A researcher scraped 200,000 account balances from your new app by changing IDs in API calls. They have contacted us before publishing.',
      l: { t: 'Threaten legal action', fx: { t: -15, m: -15 } },
      r: { t: 'Thank them, fix, notify regulators', fx: { t: -5, m: -10, s: 5 } },
    },
    {
      id: 'acquisition', best: 'r', who: 'ceo',
      text: 'We are acquiring a fintech with 2 million customers. I want them on our network in 90 days. Their security story is "we are on AWS".',
      l: { t: 'Connect the networks on day one', fx: { m: 10, s: -15 } },
      r: { t: 'Ring-fence, assess, then integrate', fx: { m: -10, s: 5, t: 5 } },
    },
    {
      id: 'shadow_it', best: 'r', who: 'retail',
      text: 'A business unit built a customer onboarding tool on a no-code platform, using production data. "IT was too slow."',
      l: { t: 'Shut it down today', fx: { m: -15, s: 5 } },
      r: { t: 'Bring it under governance in 90 days', fx: { m: 5, s: 5, b: -5 } },
    },
    {
      id: 'pqc', best: 'r', who: 'arch',
      text: 'Threat intel warns of "harvest now, decrypt later" against long-lived customer data. The Board asks about our quantum plan.',
      l: { t: 'Replace all RSA with ML-KEM now', fx: { b: -20, m: -10, s: 5 } },
      r: { t: 'Crypto inventory and agility first', fx: { b: -5, s: 5, t: 5 } },
    },
    {
      id: 'mobile_jailbreak', best: 'r', who: 'retail',
      text: 'Customers complain the app refuses to run on rooted phones. App store rating dropped to 2.1 stars.',
      l: { t: 'Remove the root check', fx: { m: 10, s: -10 } },
      r: { t: 'Risk-based: allow viewing, restrict payments', fx: { m: 5, b: -5 } },
    },

    // ---------- Meter-driven ----------
    {
      id: 'pillar2', best: 'l', who: 'jst', cond: (st) => st.m.t < 30, weight: 2,
      text: 'Given persistent ICT risk findings, we are considering a capital add-on and questioning management\'s ability to remediate.',
      l: { t: 'Commit to a funded remediation programme', fx: { b: -10, t: 10 } },
      r: { t: 'Ask the CEO to call the JST head', fx: { m: -10, t: -5 } },
    },
    {
      id: 'business_revolt', best: 'r', who: 'retail', cond: (st) => st.m.m < 30, weight: 2,
      text: 'The business heads have written to the CEO. They call your function "the department of no" and want a security exception fast-track.',
      l: { t: 'Hold the line', fx: { m: -10, s: 5 } },
      r: { t: 'Embed security partners in each business line', fx: { m: 10, b: -5 } },
    },
    {
      id: 'too_comfortable', best: 'l', who: 'audit', cond: (st) => st.m.m > 70, weight: 2,
      text: 'You signed 214 risk acceptances this year, 60 of them without expiry dates. The business loves you. Audit does not.',
      l: { t: 'Review and expire them all', fx: { m: -15, s: 10 } },
      r: { t: 'They were all business decisions', fx: { s: -10, t: -5 } },
    },
    {
      id: 'big_budget', best: 'l', who: 'cfo', cond: (st) => st.m.b > 70, weight: 2,
      text: 'Your budget has grown faster than any other function for three years. Investors are asking about the cost-income ratio.',
      l: { t: 'Show benefits in risk reduction', fx: { m: -5, b: -5, t: 5 } },
      r: { t: 'Give some back', fx: { b: -15, m: 10 } },
    },
    {
      id: 'press_leak', best: 'r', who: 'press', cond: (st) => st.m.s < 40,
      text: 'A sample of what looks like your customer data is for sale on a forum. We publish tomorrow. Comment?',
      l: { t: 'No comment', fx: { t: -10, m: -5 } },
      r: { t: 'Verify fast, prepare disclosures', fx: { b: -5, t: 5, m: -5 } },
    },
  ];

  const ENDINGS = {
    b0: {
      title: 'Unfunded Mandate',
      emoji: '🧑‍💼',
      text: 'The money is gone. Contracts lapse, the SOC goes dark at night, and the Board decides the problem is leadership. Your successor gets the budget you asked for.',
    },
    b1: {
      title: 'Cost Center of Attention',
      emoji: '💶',
      text: 'Your budget became the single biggest line in the cost-cutting plan. An activist investor named you in a letter. The Group "restructures" your role.',
    },
    s0: {
      title: 'Major ICT Incident',
      emoji: '🚨',
      text: 'Core banking is down for four days. The final incident report runs to 200 pages, and the supervisor sends a team of inspectors. The Board needs someone to own it. You.',
    },
    s1: {
      title: 'Resilient to Business',
      emoji: '🧱',
      text: 'Change freezes, approvals and controls everywhere. Instant payments miss their 10-second limit and a product launch dies in committee. Resilience includes staying in business. You are let go.',
    },
    t0: {
      title: 'Fit and Proper? No.',
      emoji: '🏛️',
      text: 'Binding remediation orders, a capital add-on and a letter questioning management. The Board offers the supervisor a resignation. Yours.',
    },
    t1: {
      title: 'Poached by the Regulator',
      emoji: '🇪🇺',
      text: 'The supervisor likes your work so much they offer you a job. You accept. Next quarter, you inspect your old bank and find 40 issues.',
    },
    m0: {
      title: 'Department of No',
      emoji: '⛔',
      text: 'The business lines route around you, shadow IT blooms, and the CEO decides security needs "a more commercial leader". Your desk moves, then disappears.',
    },
    m1: {
      title: 'Yes-Man',
      emoji: '✅',
      text: 'You said yes to everything. Internal Audit finds hundreds of risk acceptances with no expiry dates and no compensating controls. The third line escalates, and you are out.',
    },
  };

  window.REIGN_MODES = window.REIGN_MODES || {};
  window.REIGN_MODES.realistic = {
    id: 'realistic',
    label: 'Realistic',
    setting: 'Group CISO at a large European bank',
    blurb: 'ECB-supervised, DORA in force, 40,000 staff. Real frameworks, real tradeoffs, and the obvious answer is often wrong.',
    tagline: ['Stay resilient under DORA.', 'Keep the supervisor satisfied.', 'Keep the business on side. <em>For a while.</em>'],
    meters: {
      b: { name: 'Budget', icon: '💶' },
      s: { name: 'Resilience', icon: '🛡️' },
      t: { name: 'Supervisor', icon: '🏛️' },
      m: { name: 'Business', icon: '🏦' },
    },
    firstNames: ['Anna', 'Lars', 'Chiara', 'Mateusz', 'Sophie', 'Jan', 'Elif', 'Pierre', 'Katja', 'Diego', 'Inês', 'Niklas', 'Aino', 'Radu', 'Eva', 'Tomás', 'Hanna', 'Luca'],
    epithets: ['(CISSP)', '(CISSP, CISM)', '(ex-Big Four)', '(ex-regulator)', '(ex-military)', '(CRISC)', '(ex-SOC analyst)', '(PhD)', '(interim)', '(CISSP, CCSP)'],
    tenureHint: 'Bank CISOs answer to supervisors, auditors and attackers at once.<br>Sound calls keep you alive. So does balance.',
    characters: CHARACTERS,
    cards: CARDS,
    endings: ENDINGS,
  };
})();
