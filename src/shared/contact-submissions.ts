import { readJsonFile, writeJsonFile } from '../dashboard/cms.storage';

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export type ContactFormInput = {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
};

export type ContactFieldErrors = Partial<
  Record<'name' | 'email' | 'phone' | 'subject' | 'message', string>
>;

const CONTACTS_FILE = 'contacts.json';
const MAX_CONTACTS = 500;

function trim(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function getContactSubmissions(): ContactSubmission[] {
  const stored = readJsonFile<ContactSubmission[]>(CONTACTS_FILE, []);
  if (!Array.isArray(stored)) return [];
  return stored
    .filter((item) => item && typeof item.id === 'string')
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export function getUnreadContactCount(): number {
  return getContactSubmissions().filter((item) => !item.read).length;
}

export function validateContactForm(input: ContactFormInput): {
  ok: boolean;
  errors: ContactFieldErrors;
  data?: Omit<ContactSubmission, 'id' | 'createdAt' | 'read'>;
} {
  const name = trim(input.name);
  const email = trim(input.email);
  const phone = trim(input.phone);
  const subject = trim(input.subject);
  const message = trim(input.message);
  const errors: ContactFieldErrors = {};

  if (!name) errors.name = 'Vui lòng nhập họ và tên.';
  else if (name.length < 2) errors.name = 'Họ và tên quá ngắn.';

  if (!email) errors.email = 'Vui lòng nhập email.';
  else if (!isValidEmail(email)) errors.email = 'Email không hợp lệ.';

  if (!phone) errors.phone = 'Vui lòng nhập số điện thoại.';
  else if (phone.replace(/\D/g, '').length < 8) errors.phone = 'Số điện thoại không hợp lệ.';

  if (!subject) errors.subject = 'Vui lòng nhập chủ đề.';

  if (!message) errors.message = 'Vui lòng nhập nội dung.';
  else if (message.length < 10) errors.message = 'Nội dung cần ít nhất 10 ký tự.';

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    errors: {},
    data: {
      name: name.slice(0, 120),
      email: email.slice(0, 160),
      phone: phone.slice(0, 40),
      subject: subject.slice(0, 200),
      message: message.slice(0, 4000),
    },
  };
}

export function saveContactSubmission(input: ContactFormInput): {
  ok: boolean;
  errors: ContactFieldErrors;
  item?: ContactSubmission;
} {
  const validated = validateContactForm(input);
  if (!validated.ok || !validated.data) {
    return { ok: false, errors: validated.errors };
  }

  const item: ContactSubmission = {
    id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    ...validated.data,
    createdAt: new Date().toISOString(),
    read: false,
  };

  const list = getContactSubmissions();
  list.unshift(item);
  writeJsonFile(CONTACTS_FILE, list.slice(0, MAX_CONTACTS));
  return { ok: true, errors: {}, item };
}

export function markContactRead(id: string): boolean {
  const list = getContactSubmissions();
  const idx = list.findIndex((item) => item.id === id);
  if (idx < 0) return false;
  list[idx] = { ...list[idx], read: true };
  writeJsonFile(CONTACTS_FILE, list);
  return true;
}

export function deleteContactSubmission(id: string): boolean {
  const list = getContactSubmissions();
  const next = list.filter((item) => item.id !== id);
  if (next.length === list.length) return false;
  writeJsonFile(CONTACTS_FILE, next);
  return true;
}

export function clearContactSubmissions(): void {
  writeJsonFile(CONTACTS_FILE, []);
}
