import { defineComponent, computed } from 'vue';

export default defineComponent<{
  preview?: string;
  poster?: string;
}>(
  props => {
    const preview_url = computed(() =>
      props.preview ? new URL(props.preview) : null
    );
    const poster_url = computed(() => {
      if (!props.poster) return undefined;
      const u = new URL('https://api.codetabs.com/v1/proxy');
      u.searchParams.append('quest', props.poster);
      return u.toString();
    });

    return () => (
      <>
        {props.preview &&
          preview_url.value?.pathname.endsWith('.mp4') &&
          videoPreview(props.preview, poster_url.value)}
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
