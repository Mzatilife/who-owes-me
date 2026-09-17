import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { AppSettings, Debt } from './types';

const CHANNEL_ID = 'due-date-reminders';
const REMINDER_SOURCE = 'who-owes-me-due-date';
const REMINDER_HOUR = 9;

type ReminderFrequency = AppSettings['reminderFrequency'];

function reminderOffsets(frequency: ReminderFrequency): number[] {
  switch (frequency) {
    case 'daily':
      return [3, 2, 1, 0];
    case 'weekly':
      return [7, 0];
    case 'monthly':
      return [30, 0];
    default:
      return [];
  }
}

function reminderDate(dueDate: string, daysBefore: number): Date | null {
  const date = new Date(dueDate);
  if (Number.isNaN(date.getTime())) return null;

  date.setHours(REMINDER_HOUR, 0, 0, 0);
  date.setDate(date.getDate() - daysBefore);
  return date;
}

async function ensurePermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function configureAndroidChannel() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Due date reminders',
    description: 'Alerts for debts with an approaching due date.',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
  });
}

/** Removes only due-date reminders created by this app, leaving unrelated notifications intact. */
export async function clearDueDateReminders() {
  if (Platform.OS === 'web') return;

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((notification) => notification.content.data?.source === REMINDER_SOURCE)
      .map((notification) => Notifications.cancelScheduledNotificationAsync(notification.identifier))
  );
}

/**
 * Schedules local device notifications for active debts. These work without a
 * server or push token, provided the app has been opened at least once.
 */
export async function syncDueDateReminders(debts: Debt[], settings: AppSettings) {
  if (Platform.OS === 'web') return;

  await clearDueDateReminders();
  if (settings.reminderFrequency === 'never') return;

  const eligibleDebts = debts.filter(
    (debt) => debt.dueDate && debt.status !== 'paid' && debt.status !== 'written_off'
  );
  if (eligibleDebts.length === 0) return;

  const permitted = await ensurePermissions();
  if (!permitted) return;

  await configureAndroidChannel();
  const now = new Date();
  const offsets = reminderOffsets(settings.reminderFrequency);

  await Promise.all(
    eligibleDebts.flatMap((debt) =>
      offsets.flatMap((offset) => {
        const trigger = reminderDate(debt.dueDate!, offset);
        if (!trigger || trigger <= now) return [];

        const timing = offset === 0 ? 'today' : offset === 1 ? 'tomorrow' : `in ${offset} days`;
        return Notifications.scheduleNotificationAsync({
          content: {
            title: offset === 0 ? 'Due today' : 'Due date approaching',
            body: `${debt.personName}'s ${debt.description || 'debt'} is due ${timing}.`,
            data: { source: REMINDER_SOURCE, debtId: debt.id },
            sound: 'default',
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: trigger,
            ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
          },
        });
      })
    )
  );
}
