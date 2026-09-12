import { DebtStatus, DebtHealth, ReminderTone, CurrencyCode } from './types';
import { daysOverdue, getRemainingAmount } from './utils';

export function computeStatus(dueDate?: string, dateAdded?: string): DebtStatus {
  const overdue = daysOverdue(dueDate, dateAdded);

  if (overdue === 0) return 'fresh';
  if (overdue <= 3) return 'remembering';
  if (overdue <= 7) return 'forgetting';
  if (overdue <= 14) return 'interesting';
  if (overdue <= 30) return 'disappeared';
  if (overdue <= 60) return 'charity';
  return 'written_off';
}

const STATUS_MESSAGES: Record<DebtStatus, string[]> = {
  fresh: [
    'They remember. For now.',
    'Fresh debt. The memory is still warm.',
    'They know what they did.',
    'Recently documented. Awaiting signs of remorse.',
  ],
  remembering: [
    "He remembers.",
    'She knows. We all know.',
    'The debt is young. So is their memory.',
    'Still fresh in everyone\'s mind.',
  ],
  forgetting: [
    "He's pretending he forgot.",
    'Suspicious memory loss detected.',
    'The selective amnesia has begun.',
    'Funny how memories fade around payment time.',
  ],
  interesting: [
    'Interesting... very interesting.',
    'The silence is loud.',
    'They have not mentioned it. Not once.',
    'We are observing a pattern.',
  ],
  disappeared: [
    'This person has disappeared.',
    'Last seen: avoiding your calls.',
    'Their phone has developed selective reception.',
    'Rumour says they moved to another country.',
  ],
  charity: [
    'Consider it charity.',
    'You have funded a lifestyle.',
    'At this point, it\'s a donation.',
    'They thank you for your generosity.',
  ],
  written_off: [
    'Write it off, soldier.',
    'This debt has ascended to the afterlife.',
    'Pour one out. It\'s gone.',
    'Some battles are not worth fighting.',
  ],
};

export function getStatusEmoji(status: DebtStatus): string {
  const map: Record<DebtStatus, string> = {
    fresh: '🟢',
    remembering: '🟢',
    forgetting: '🟡',
    interesting: '🟠',
    disappeared: '🔴',
    charity: '💀',
    written_off: '☠️',
  };
  return map[status];
}

export function getStatusColor(status: DebtStatus): string {
  const map: Record<DebtStatus, string> = {
    fresh: '#34D399',
    remembering: '#34D399',
    forgetting: '#FBBF24',
    interesting: '#F97316',
    disappeared: '#EF4444',
    charity: '#9CA3AF',
    written_off: '#6B7280',
  };
  return map[status];
}

export function getRandomStatusMessage(status: DebtStatus): string {
  const messages = STATUS_MESSAGES[status] ?? STATUS_MESSAGES.fresh;
  return messages[Math.floor(Math.random() * messages.length)];
}

export function getStatusMessage(status: DebtStatus, seed: number): string {
  const messages = STATUS_MESSAGES[status] ?? STATUS_MESSAGES.fresh;
  return messages[seed % messages.length];
}

// Debt Health system
export function computeHealth(status: DebtStatus): DebtHealth {
  if (status === 'fresh' || status === 'remembering') return 'healthy';
  if (status === 'forgetting') return 'suspicious';
  if (status === 'interesting') return 'concerning';
  if (status === 'disappeared') return 'critical';
  return 'terminal';
}

export const HEALTH_INFO: Record<DebtHealth, { label: string; message: string; color: string }> = {
  healthy: { label: 'Healthy', message: 'This relationship appears financially responsible.', color: '#34D399' },
  suspicious: { label: 'Suspicious', message: 'Something isn\'t adding up.', color: '#FBBF24' },
  concerning: { label: 'Concerning', message: 'You may want to ask questions.', color: '#F97316' },
  critical: { label: 'Critical', message: 'They have seen your message.', color: '#EF4444' },
  terminal: { label: 'Terminal', message: 'We recommend emotional acceptance.', color: '#6B7280' },
};

// Reminder message generation
export function generateReminder(
  tone: ReminderTone,
  personName: string,
  amount: number,
  currency: CurrencyCode,
  description: string,
  isMoney: boolean
): string {
  const subject = isMoney ? `${currency === 'MWK' ? 'K' : ''}${amount.toLocaleString()}` : description;

  switch (tone) {
    case 'friendly':
      return `Hey ${personName} 😂 just a reminder about the ${subject} you owe me. Don't worry, I've not forgotten.`;

    case 'funny':
      return `🚨 DEBT ALERT 🚨\n${personName}'s account is currently experiencing critical levels of dishonesty.\nAmount outstanding: ${subject}.\nPlease settle this matter before further action is taken. 😂`;

    case 'serious':
      return `Hi ${personName}, just a reminder that the ${subject} is still outstanding. Please let me know when you can settle it.`;

    case 'savage':
      return `${personName}, I don't want to pressure you, but your ${subject} has been living in your account for far too long. It misses me.`;

    case 'dramatic':
      return `🚨 FINAL NOTICE 🚨\nThe Republic of Mahala has officially declared your ${subject} overdue.\nYou have been given multiple opportunities to restore peace.\nPayment is strongly encouraged. 😂`;
  }
}

// Funny confirmation messages after adding a debt
export function getRandomConfirmation(personName: string): string {
  const messages = [
    `💰 Debt successfully recorded. Another financial victim has been documented.`,
    `Excellent. ${personName}'s debt has officially entered the database. 😂`,
    `${personName} has been added to the wall of shame. Well done.`,
    `Logged. ${personName} probably thinks you forgot. You didn't.`,
    `Another one bites the dust. ${personName} owes you now. Officially.`,
    `The books are updated. ${personName} is on the list. There is no escape.`,
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

// Payment celebration messages
export function getPaymentCelebration(personName: string, amount: number, days: number): string {
  const messages = [
    `🎉 After ${days} days of negotiations, ${personName} has finally paid up.`,
    `🎉 The money has landed! ${personName} came through. We did not see this coming.`,
    `🎉 Victory! ${personName} has broken the curse and returned what was theirs... I mean, yours.`,
    `🎉 A miracle has occurred. ${personName} actually paid. Witness them.`,
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

export function getPartialPaymentMessage(personName: string): string {
  const messages = [
    `Progress has been detected. We are cautiously optimistic.`,
    `${personName} made a partial payment. The ice is thawing.`,
    `A down payment on dignity. We'll take it.`,
    `Partial payment received. Hope is a dangerous thing. We have it now.`,
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

// Reputation system
export function getReputationScore(paidCount: number, totalCount: number): { stars: number; review: string } {
  if (totalCount === 0) return { stars: 0, review: 'No history yet. The jury is still out.' };
  const ratio = paidCount / totalCount;
  let stars: number;
  let review: string;

  if (ratio >= 0.95) {
    stars = 5;
    review = 'Financially responsible citizen.';
  } else if (ratio >= 0.75) {
    stars = 4;
    review = 'Usually reliable.';
  } else if (ratio >= 0.5) {
    stars = 3;
    review = 'Needs occasional reminders.';
  } else if (ratio >= 0.25) {
    stars = 2;
    review = 'You may need to call his mother.';
  } else {
    stars = 1;
    review = 'We have lost contact.';
  }

  return { stars, review };
}

// Greeting based on time of day
export function getGreeting(userName: string): string {
  const hour = new Date().getHours();
  let timeGreeting: string;
  if (hour < 12) timeGreeting = 'Good morning';
  else if (hour < 17) timeGreeting = 'Good afternoon';
  else timeGreeting = 'Good evening';
  return `${timeGreeting}, ${userName} 👋`;
}

export function getGreetingSubtitle(): string {
  const messages = [
    "Let's see who has decided not to pay you today.",
    'Time to check on your financial enemies.',
    'Your debtors await. Reluctantly, no doubt.',
    'Another day, another round of selective amnesia.',
    'The ledger is open. The shade is ready.',
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

// Statistics fun messages
export function getBiggestOffenderMessage(name: string): string {
  const messages = [
    `${name} is single-handedly funding this app.`,
    `${name} owes you so much they should be on the payroll.`,
    `At this point, ${name} is a subsidiary of you.`,
    `${name} is your biggest investor. Unwillingly.`,
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

export function getMostReliableMessage(name: string): string {
  const messages = [
    'Paid before being reminded. A rare species.',
    `${name} actually pays on time. We're suspicious.`,
    `A beacon of financial responsibility in a sea of chaos.`,
    `${name} restores our faith in humanity. Briefly.`,
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

// Empty states
export function getEmptyStateMessage(): { title: string; subtitle: string } {
  return {
    title: 'Nobody owes you anything.',
    subtitle: "Either you're financially responsible or your friends are suspiciously good at paying. 😂",
  };
}

export function getManyDebtsMessage(): string {
  return 'You have become the bank.';
}
