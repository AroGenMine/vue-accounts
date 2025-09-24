<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useAccounts } from '../stores/accounts';
import type { Account, AccountType } from '../types';

const store = useAccounts();
onMounted(() => store.load());

const types: AccountType[] = ['Локальная', 'LDAP'];
const showPassIds = ref<Record<string, boolean>>({});

const hasItems = computed(() => store.items.length > 0);

function onBlur(acc: Account) {
  store.validateAndSave(acc.id);
}
function add() {
  store.addEmpty();
}
function removeRow(id: string) {
  store.remove(id);
}
function togglePass(id: string) {
  showPassIds.value[id] = !showPassIds.value[id];
}
</script>

<template>
  <section class="container">
    <header style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
      <h2 class="h2">Учётные записи</h2>
      <button class="btn" @click="add" title="Добавить">+</button>
    </header>

    <div class="hint">
      Для указания нескольких меток для одной пары логина/пароля используйте разделитель «,».
    </div>

    <div v-if="!hasItems" class="help">Нет записей — нажмите «+».</div>

    <ul class="list">
      <li
        v-for="acc in store.items"
        :key="acc.id"
        class="card"
        :class="{ 'card--invalid': acc.touched && !acc.valid }"
      >
        <div class="row">
          <label class="col">
            <span class="lbl">Метка</span>
            <input
              type="text"
              :value="acc.labelText"
              maxlength="50"
              placeholder="xxx, yyy, zzz"
              @input="store.updateField(acc.id, { labelText: ($event.target as HTMLInputElement).value })"
              @blur="onBlur(acc)"
            />
            <small class="help">Строка ≤50 символов, в состоянии хранится массив.</small>
          </label>

          <label class="col col--type">
            <span class="lbl">Тип записи</span>
            <select
              :value="acc.type"
              @change="store.updateField(acc.id, { type: ($event.target as HTMLSelectElement).value as AccountType }, true)"
            >
              <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
            </select>
          </label>
        </div>

        <div class="row">
          <label class="col">
            <span class="lbl">Логин<span class="req">*</span></span>
            <input
              type="text"
              :value="acc.login"
              maxlength="100"
              placeholder="Логин"
              @input="store.updateField(acc.id, { login: ($event.target as HTMLInputElement).value })"
              @blur="onBlur(acc)"
            />
          </label>

          <label class="col" v-if="acc.type === 'Локальная'">
            <span class="lbl">Пароль<span class="req">*</span></span>
            <div class="password-wrap">
              <input
                :type="showPassIds[acc.id] ? 'text' : 'password'"
                :value="acc.password ?? ''"
                maxlength="100"
                placeholder="Пароль"
                @input="store.updateField(acc.id, { password: ($event.target as HTMLInputElement).value })"
                @blur="onBlur(acc)"
              />
              <button class="toggle-eye" :title="showPassIds[acc.id] ? 'Скрыть' : 'Показать'" @click="togglePass(acc.id)">
                {{ showPassIds[acc.id] ? '🙈' : '👁️' }}
              </button>
            </div>
          </label>

          <div class="col" v-else>
            <span class="lbl">Пароль</span>
            <input type="text" value="(скрывается для LDAP)" disabled />
          </div>
        </div>

        <footer class="card__footer">
          <div class="chips" v-if="acc.labels.length">
            <span class="chip" v-for="l in acc.labels" :key="l">{{ l }}</span>
          </div>
          <button class="btn btn--danger" title="Удалить" @click="removeRow(acc.id)">🗑</button>
        </footer>
      </li>
    </ul>
  </section>
</template>
