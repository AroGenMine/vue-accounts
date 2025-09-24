export type AccountType = 'LDAP' | 'Локальная';

export type Account = {
  id: string;

  // Поле "Метка"
  labelText: string;  // то, что пользователь ввёл (строка, ≤50, через запятую)
  labels: string[];   // нормализованное хранение (массив строк) — ТЗ

  type: AccountType;  // LDAP | Локальная
  login: string;      // обяз. ≤100
  password: string | null; // обяз. для Локальная, скрыто и = null для LDAP

  // служебные
  valid: boolean;
  touched: boolean;
};
