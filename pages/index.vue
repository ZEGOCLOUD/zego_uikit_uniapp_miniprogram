<template>
	<view class="content">
		<view class="containerBase">
			<view class="title">示例 Demo</view>
			<button @tap="goto(0)" hover-class="none" class="btn">
				音视频通话
			</button>
			<button @tap="goto(1)" hover-class="none" class="btn">
				音视频通话（包含呼叫邀请）
			</button>
		</view>
	</view>
</template>

<script lang="ts" setup>
function goto(type: number) {
	let url;
	switch (type) {
		case 0:
			url = `/pages/example/call/index`;
			break;
		case 1:
			url = `/pages/example/call_invitation/index`;
			break;
	}
	// @ts-ignore
	uni.navigateTo({
		url,
		success: (res: any) => { },
		fail: () => {
			console.error(`navigateTo fail!`);
		},
		complete: () => { },
	});
}
</script>

<style scoped>
input,
textarea {
	padding: 8rpx;
	border: 1px solid #c8c7cc;
	border-radius: 4rpx;
	line-height: 48rpx;
	margin: 20rpx;
}

textarea {
	width: auto;
}

button {
	display: inline-block;
	font-size: 28rpx;
	margin: 10rpx;
	padding: 10rpx;
	color: #fff;
	border: none;
	background-color: rgba(13, 112, 255, 0.7);
}

.content {
	padding: 20px;
	max-width: 600px;
	margin: 0 auto;
}

.containerBase {
	display: flex;
	flex-direction: column;
	justify-content: center;
	background-color: #fff;
	border-radius: 10px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	padding: 20px 10px;
}
.title {
	margin-bottom: 5px;
	text-align: center;
}

.btn {
	padding: 10px 20px;
	font-size: 14px;
	color: #fff;
	background-color: #007bff;
	border: none;
	border-radius: 5px;
	cursor: pointer;
}
</style>
