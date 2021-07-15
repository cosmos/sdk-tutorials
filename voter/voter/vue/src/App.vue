<template>
	<div v-if="initialized">
		<SpWallet ref="wallet" v-on:dropdown-opened="$refs.menu.closeDropdown()" />
		<SpLayout>
			<template v-slot:sidebar>
				<Sidebar />
			</template>
			<template v-slot:content>
				<router-view />
			</template>
		</SpLayout>
	</div>
</template>

<style>
body {
	margin: 0;
}
</style>

<script>
import './scss/app.scss'
import '@starport/vue/lib/starport-vue.css'
import Sidebar from './components/Sidebar'

export default {
    components: {
        Sidebar
    },
    data() {
        return {
            initialized: false
        }
    },
    computed: {
        hasWallet() {
            return this.$store.hasModule([ 'common', 'wallet'])
        }
    },
    async created() {
        await this.$store.dispatch('common/env/init')
        this.initialized = true
        await this.$store.dispatch("cosmonaut.voter.voter/QueryPollAll",{options:{subscribe:true, all:true},params:{}})
        await this.$store.dispatch("cosmonaut.voter.voter/QueryVoteAll",{options:{subscribe:true, all:true},params:{}})
    },
    errorCaptured(err) {
        console.log(err)
        return false
    }
}
</script>
