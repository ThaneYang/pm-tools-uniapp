<script>
	export default {
		globalData: {
			searchText: '',
			appVersion: {},
			config: {},
			$i18n: {},
			$t: {}
		},
		onLaunch() {
			console.log('App Launch')
			this.globalData.$i18n = this.$i18n
			this.globalData.$t = str => this.$t(str)
		},
		onShow() {
			console.log('App Show')
		},
		onHide() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
