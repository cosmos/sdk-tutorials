<template>
	<div>
		<div class="container">
      	<!-- this line is used by starport scaffolding # 4 -->
			<SpH3>
				Polls
			</SpH3>
			<poll-form />
			<poll-list />
		</div>
	</div>
</template>

<script>
import PollForm from "../components/PollForm";
import PollList from "../components/PollList";

export default {
	name: 'Types',
	components: { PollForm, PollList },
}
</script>

