<script setup>
/**
 * 共通2カラムレイアウト用：プロフィール
 */

defineProps({
  username: { type: String, required: true }
});
const emit = defineEmits(['click-post']);
</script>

<template>
  <aside>
    <v-card class="pa-4 rounded-xl mb-4" border flat>
      <v-list-item class="px-0">
        <template v-slot:prepend>
          <v-avatar color="primary" class="text-white">{{ username.charAt(0) }}</v-avatar>
        </template>
        <v-list-item-title class="font-weight-bold">こんにちは {{ username }} さん</v-list-item-title>
      </v-list-item>
      <v-btn
        block
        color="primary"
        class="mt-4 rounded-pill"
        size="large"
        @click="emit('click-post')"
      >
        今どうしてる？
      </v-btn>
    </v-card>
  </aside>
</template>
