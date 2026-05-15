import {
  defineComponent,
  computed,
  ref,
  onMounted,
  onUnmounted,
  type Ref
} from 'vue';

export default defineComponent<{
  preview?: string;
  poster?: string;
}>(
  props => {
    const showLivePreview = ref(false);
    const preview_url = computed(() =>
      props.preview ? new URL(props.preview) : null
    );
    const poster_url = computed(() => {
      if (!props.poster) return undefined;
      const u = new URL('https://api.codetabs.com/v1/proxy');
      u.searchParams.append('quest', props.poster);
      return u.toString();
    });
    const hlsplayer_url = computed(() => {
      if (!props.preview) return undefined;
      const u = new URL('https://www.hlsplayer.org/play');
      u.searchParams.append('url', props.preview);
      return u.toString();
    });

    onMounted(() => {
      if (!props.poster || props.poster === '') showLivePreview.value = true;
    });

    onUnmounted(() => (showLivePreview.value = false));

    return () => (
      <>
        {props.preview &&
          preview_url.value?.pathname.endsWith('.mp4') &&
          videoPreview(props.preview, poster_url.value)}

        {props.preview &&
          preview_url.value?.pathname.endsWith('.m3u8') &&
          hlsplayer_url.value &&
          livePreview(showLivePreview, hlsplayer_url.value, poster_url.value)}
      </>
    );
  },
  {
    props: ['preview', 'poster']
  }
);

function videoPreview(preview: string, poster_url?: string) {
  return (
    <video
      class="preview-media"
      controls
      loop
      crossorigin="anonymous"
      src={preview}
      poster={poster_url}
    />
  );
}

function livePreview(
  show: Ref<boolean>,
  hlsplayer_url: string,
  poster_url?: string
) {
  return !show.value ? (
    <button
      type="button"
      class="live-preview-poster"
      onClick={() => (show.value = true)}
    >
      <img src={poster_url} alt="直播封面" />
      <span class="preview-play-button" aria-hidden="true">
        <span class="i-tabler-circle-caret-right"></span>
      </span>
    </button>
  ) : (
    <iframe
      class="preview-frame"
      src={hlsplayer_url}
      allowfullscreen
      sandbox="allow-scripts allow-same-origin"
      referrerpolicy="no-referrer"
    />
  );
}
