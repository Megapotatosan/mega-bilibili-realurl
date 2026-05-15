import { defineComponent, computed } from 'vue';
import { usePreferredDark, useStorage } from '@vueuse/core';
import {
  darkTheme,
  lightTheme,
  NConfigProvider,
  NNotificationProvider,
  NMessageProvider,
  NLayout
} from 'naive-ui';
import GitHubCorners from './components/GitHubCorners';
import Bilibili from './views/Bilibili.vue';
import pkg from '../package.json';

export default defineComponent({
  setup() {
    const isDark = usePreferredDark();
    const isDarkMode = useStorage('app-darkmode', isDark.value);
    const theme = computed(() => (isDarkMode.value ? darkTheme : lightTheme));

    return () => (
      <NConfigProvider theme={theme.value} inlineThemeDisabled>
        <NMessageProvider placement="bottom-right">
          <NNotificationProvider placement="bottom-right">
            <GitHubCorners href={pkg.homepage} target="_blank" />
            <NLayout embedded class="app-shell">
              <main class="app-main">
                <header class="app-hero" aria-labelledby="app-title">
                  <div class="brand-mark" aria-hidden="true">
                    <img src="/favicon.png" alt="" />
                  </div>
                  <div class="hero-copy">
                    <p class="eyebrow">Bilibili real URL</p>
                    <h1 id="app-title">Bilibili 串流網址解析器</h1>
                    <p>
                      貼上影片或分集清單網址，快速產生可播放的 MP4
                      連結，方便在播放器或 VRChat 中使用。
                    </p>
                  </div>
                </header>

                <Bilibili />
              </main>
            </NLayout>
          </NNotificationProvider>
        </NMessageProvider>
      </NConfigProvider>
    );
  }
});
