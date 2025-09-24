import { defineStore } from 'pinia';
import type { Account, AccountType } from '../types';

const STORAGE_KEY = 'accounts_state_v1';

const uid = () => Math.random().toString(36).slice(2, 10);

const normalizeLabels = (text: string): string[] =>
  text.split(',').map(s => s.trim()).filter(Boolean).slice(0, 50);

function validate(a: Account): boolean {
  const loginOk = a.login.trim().length > 0 && a.login.length <= 100;
  const labelOk = a.labelText.length <= 50; // ограничение поля ввода
  const passNeeded = a.type === 'Локальная';
  const passOk = passNeeded ? (!!a.password && a.password.length > 0 && a.password.length <= 100) : true;
  return loginOk && labelOk && passOk;
}

export const useAccounts = defineStore('accounts', {
  state: () => ({
    items: [] as Account[],
  }),
  actions: {
    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) this.items = JSON.parse(raw);
      } catch { /* ignore */ }
    },
    persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
    },
    addEmpty() {
      const acc: Account = {
        id: uid(),
        labelText: '',
        labels: [],
        type: 'Локальная',
        login: '',
        password: '',
        valid: false,
        touched: false,
      };
      this.items.push(acc);
      this.persist();
    },
    remove(id: string) {
      this.items = this.items.filter(a => a.id !== id);
      this.persist();
    },
    updateField(id: string, patch: Partial<Account>, validateNow = false) {
      const i = this.items.findIndex(a => a.id === id);
      if (i === -1) return;

      const prev = this.items[i];
      const next = { ...prev, ...patch } as Account;

      // спец-логика типа записи
      if (patch.type) {
        if (patch.type === 'LDAP') {
          next.password = null;
        } else if (next.password === null) {
          next.password = '';
        }
      }

      // нормализация меток при любом апдейте labelText
      if (patch.labelText !== undefined) {
        next.labels = normalizeLabels(next.labelText);
      }

      if (validateNow) {
        next.touched = true;
        next.valid = validate(next);
      }

      this.items[i] = next;
      this.persist();
    },
    validateAndSave(id: string) {
      this.updateField(id, {}, true);
    },
  },
});
