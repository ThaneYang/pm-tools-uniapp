import { onMounted, onUnmounted, ref } from 'vue';

export function usePageLoadingState() {
	const loading = ref(true);

	let timer = null;

	onMounted(() => {
		timer = setTimeout(() => {
			loading.value = false;
		}, 200);
	});

	onUnmounted(() => {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
	});

	return {
		loading,
		setLoading: (value) => {
			loading.value = value;
		}
	};
}
