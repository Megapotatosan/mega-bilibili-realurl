<script lang="ts" setup>
import {
  useNotification,
  NInput,
  NInputGroup,
  NButton,
  NSelect,
  NCard,
  NAlert,
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
const liveRoomInfo = ref<any | null>(null);

watch(page, p => set_preview(`/${id.value}.mp4` + (p > 0 ? `?p=${p}` : '')));

const preset: { name: string; url: string }[] = [
  { name: '範例影片', url: 'https://www.bilibili.com/video/BV1Mx4y137fa' },
  { name: '經典影片', url: 'https://www.bilibili.com/video/BV1ms411b7Ph' },
  { name: '直播間', url: 'https://live.bilibili.com/10' }
];

function parse() {
  preview.value = '';
  pages.value = [];
  liveRoomInfo.value = null;
  videoInfo.value = null;

  const _u = new URL(u.value);
  if (_u.pathname.startsWith('/video')) return parse_video(_u);
  else if (_u.pathname.startsWith('/list')) return parse_video(_u);
  else if (_u.hostname.startsWith('live.')) return parse_live(u.value);
  else
    return notification.error({
      title: '無法解析網址',
      content: '請貼上 Bilibili 影片、清單或直播間網址。',
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

      videoInfo.value = result.data;
      page.value = p;

      pages.value = result.data.pages.map((item: any, index: number) => ({
        label: () =>
          h('span', {}, { default: () => `P${index + 1} ${item.part}` }),
        value: index + 1
      }));

      if (p > result.data.pages.length) return;
      if (p === page.value) {
        const query = new URLSearchParams();
        if (p > 1) query.set('p', p.toString());
        set_preview(`/${id.value}.mp4`, query);
      }
    });
}

function parse_live(_url: string) {
  id.value = /[0-9]+/g.exec(_url)?.[0] ?? '';
  if (!id.value || id.value === '') return;
  const room_id = parseInt(id.value);
  if (Number.isNaN(room_id)) return;

  loading.value = true;
  trpc.getRoomInfo
    .query(room_id)
    .finally(() => (loading.value = false))
    .then(result => {
      if (Array.isArray(result))
        return notification.error({
          title: '直播資訊讀取失敗',
          content: '找不到這個直播間，請確認網址是否正確。',
          duration: 5000,
          meta: _url
        });
      liveRoomInfo.value = result;
      if (result.live_status === 1) set_preview(`/${result.room_id}.m3u8`);
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
          支援 Bilibili 影片、分集清單與直播間網址。解析後會產生本站可轉發的播放連結。
        </p>
      </div>

      <n-input-group class="url-input-group">
        <n-input
          placeholder="貼上 Bilibili 影片或直播網址"
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
        <div v-if="!preview && !videoInfo && !liveRoomInfo" class="empty-state">
          <div class="i-tabler-link-search empty-icon" aria-hidden="true"></div>
          <div>
            <p class="empty-title">等待解析網址</p>
            <p class="empty-copy">
              貼上網址後，這裡會顯示影片資訊、直播狀態與可複製的串流連結。
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

          <div v-if="liveRoomInfo?.title" class="media-summary">
            <p class="section-label">直播資訊</p>
            <h2>
              <span>{{ liveRoomInfo?.title }}</span>
              <external-link
                :href="`https://live.bilibili.com/${id}`"
                title="開啟直播間"
              />
            </h2>
          </div>

          <n-alert
            v-if="liveRoomInfo && liveRoomInfo.live_status === 0"
            type="warning"
          >
            直播尚未開始，暫時沒有可用的 M3U8 串流網址。
          </n-alert>
          <n-alert
            v-else-if="liveRoomInfo && liveRoomInfo.live_status === 2"
            type="warning"
          >
            直播間目前為輪播狀態，Bilibili 可能不會提供可直接播放的即時串流。
          </n-alert>

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
            :poster="videoInfo?.pic ?? liveRoomInfo?.user_cover"
          />
        </template>
      </section>
    </n-spin>
  </n-card>
</template>
