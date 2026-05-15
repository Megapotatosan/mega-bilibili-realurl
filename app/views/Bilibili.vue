<script lang="ts" setup>
import {
  useNotification,
  NInput,
  NInputGroup,
  NButton,
  NSelect,
  NCard,
  NSpin
} from 'naive-ui';
import { h, watch, ref } from 'vue';
import { useClipboard } from '@vueuse/core';
import ThemeSwitch from '../components/ThemeSwitch.vue';
import ExternalLink from '../components/ExternalLink';
import BiliPreview from '../components/BiliPreview';
import { trpc } from '../rpc';

const notification = useNotification();

const u = ref('');
const preview = ref('');
const page = ref(1);
const id = ref('');
const pages = ref<any[]>([]);
const loading = ref(false);
const { copy, copied } = useClipboard({ source: preview });
const videoInfo = ref<any | null>(null);

watch(page, p => set_preview(`/${id.value}.mp4` + (p > 0 ? `?p=${p}` : '')));

const preset: { name: string; url: string }[] = [
  { name: '範例影片', url: 'https://www.bilibili.com/video/BV1Mx4y137fa' },
  { name: '經典影片', url: 'https://www.bilibili.com/video/BV1ms411b7Ph' }
];

function parse() {
  preview.value = '';
  pages.value = [];
  videoInfo.value = null;

  const _u = new URL(u.value);
  if (_u.pathname.startsWith('/video')) return parse_video(_u);
  else if (_u.pathname.startsWith('/list')) return parse_video(_u);
  else
    return notification.error({
      title: '無法解析網址',
      content: '請貼上 Bilibili 影片或清單網址。',
      duration: 5000,
      meta: u.value
    });
}

function parse_video(u: URL) {
  let p = parseInt(u.searchParams.get('p') ?? '1');
  if (Number.isNaN(p)) p = 1;
  const _url = u.toString();
  id.value =
    u.searchParams.get('bvid') ??
    /av[0-9]+/gi.exec(u.pathname)?.[0] ??
    /bv\w+/gi.exec(u.pathname)?.[0] ??
    '';
  if (id.value === '') {
    return notification.error({
      title: '無法解析影片 ID',
      content: '請確認網址中包含有效的 BV 或 AV 編號。',
      duration: 5000,
      meta: _url
    });
  }
  loading.value = true;
  trpc.getVideoInfo
    .query({ id: id.value })
    .finally(() => (loading.value = false))
    .then(result => {
      if (result.code !== 0)
        return notification.error({
          title: '影片資訊讀取失敗',
          content: result.message,
          duration: 5000,
          meta: _url
        });

      pages.value = result.data.pages.map((item: any, index: number) => ({
        label: () =>
          h('span', {}, { default: () => `P${index + 1} ${item.part}` }),
        value: index + 1
      }));

      if (pages.value.length === 0)
        return notification.error({
          title: '影片資訊讀取失敗',
          content: '這個影片沒有可解析的分集資訊。',
          duration: 5000,
          meta: _url
        });

      const selectedPage = Math.min(Math.max(p, 1), pages.value.length);
      videoInfo.value = result.data;
      page.value = selectedPage;

      const query = new URLSearchParams();
      if (selectedPage > 1) query.set('p', selectedPage.toString());
      set_preview(`/${id.value}.mp4`, query);
    });
}

function set_preview(path: string, query?: URLSearchParams) {
  const u = new URL(path, location.origin);
  if (query) u.search = query.toString();
  preview.value = u.toString();
}

function URLcanParse(u: string) {
  return URL.canParse(u);
}
</script>

<template>
  <n-card :bordered="false" class="tool-card">
    <div class="tool-bar">
      <div class="preset-group" aria-label="範例網址">
        <n-button
          v-for="v in preset"
          :key="v.name"
          quaternary
          type="primary"
          @click="u = v.url"
        >
          {{ v.name }}
        </n-button>
      </div>
      <theme-switch />
    </div>

    <section class="input-panel" aria-labelledby="url-input-label">
      <div>
        <p id="url-input-label" class="section-label">網址來源</p>
        <p class="section-copy">
          支援 Bilibili 影片與分集清單網址。解析後會產生本站可轉發的 MP4 播放連結。
        </p>
      </div>

      <n-input-group class="url-input-group">
        <n-input
          placeholder="貼上 Bilibili 影片網址"
          v-model:value="u"
          clearable
          @keyup.enter="!loading && URLcanParse(u) && parse()"
        />
        <n-button
          type="primary"
          :loading="loading"
          :disabled="u === '' || !URLcanParse(u)"
          @click="parse"
        >
          解析網址
        </n-button>
      </n-input-group>
    </section>

    <n-spin :show="loading">
      <section class="result-panel" aria-live="polite">
        <div v-if="!preview && !videoInfo" class="empty-state">
          <div class="i-tabler-link-search empty-icon" aria-hidden="true"></div>
          <div>
            <p class="empty-title">等待解析網址</p>
            <p class="empty-copy">
              貼上網址後，這裡會顯示影片資訊、分集選擇與可複製的串流連結。
            </p>
          </div>
        </div>

        <template v-else>
          <div v-if="videoInfo?.title" class="media-summary">
            <p class="section-label">影片資訊</p>
            <h2>
              <span>{{ videoInfo?.title }}</span>
              <external-link
                :href="`https://www.bilibili.com/video/${id}?p=${page}`"
                title="開啟 Bilibili 原頁"
              />
            </h2>
            <p v-if="videoInfo?.owner.name" class="media-meta">
              UP 主：{{ videoInfo?.owner.name }}
              <external-link
                :href="`https://space.bilibili.com/${videoInfo?.owner.mid}`"
                title="開啟 UP 主空間"
              />
            </p>
          </div>

          <div v-if="pages.length > 1" class="field-block">
            <p class="section-label">分集</p>
            <n-select v-model:value="page" :options="pages" />
          </div>

          <div v-if="preview" class="field-block">
            <p class="section-label">串流網址</p>
            <n-input-group class="url-input-group">
              <n-input v-model:value="preview" readonly />
              <n-button
                type="primary"
                :disabled="u === '' || loading"
                @click="copy()"
              >
                <span v-if="!copied">複製串流網址</span>
                <span v-else>已複製</span>
              </n-button>
            </n-input-group>
          </div>

          <bili-preview
            v-if="preview"
            :preview="preview"
            :poster="videoInfo?.pic"
          />
        </template>
      </section>
    </n-spin>
  </n-card>
</template>
