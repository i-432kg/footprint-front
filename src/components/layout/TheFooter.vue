<script setup>
const currentYear = new Date().getFullYear();
</script>

<template>
  <v-footer border class="bg-grey-lighten-4 text-grey-darken-1 py-6">
    <v-container>
      <v-row align="center" no-gutters>
        <!-- コピーライト -->
        <v-col cols="12" md="auto" class="text-center text-md-left mb-4 mb-md-0">
          <span class="text-body-2">
            &copy; {{ currentYear }} Footprint. All rights reserved.
          </span>
        </v-col>

        <v-spacer class="hidden-sm-and-down"></v-spacer>

        <!-- ナビゲーションリンク -->
        <v-col cols="12" md="auto" class="text-center">
          <v-btn variant="text" size="small" href="/about" class="text-none">About</v-btn>
          <v-btn variant="text" size="small" href="/terms" class="text-none">Terms</v-btn>
          <v-btn variant="text" size="small" href="/privacy" class="text-none">Privacy</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>
