<template>
	<view class="content">
		<!-- <SingleCall v-if="isUIKitShow" :config="config"></SingleCall> -->
		<view class="containerBase">
			<!-- 输入框 -->
			<view class='input-container'>
				<text class="prompt">Call ID</text>
				<input v-model="callID" placeholder="请输入Call ID" placeholder-style='color: #b3b3b3; font-size: 14px;'
					class="input" />
			</view>

			<!-- 用户选择列表 -->
			<view class='user-container'>
				<!-- <text class="prompt">选择用户</text>
				<radio-group @change="onUserSelected" style="margin-top: 10px;">
					<label v-for="item in userList" :key="item.userID" class="option-label">
						<radio :value="item.userID" class="option-radio" />
						<text class="option-text">{{ item.userID }}</text>
					</label>
				</radio-group> -->
				<text class="selection">当前账号：{{ userID }}</text>
			</view>

			<!-- 按钮 -->
			<view class="button-container">
				<button @tap="startCall" hover-class="none" class="startCall">
					拨打电话
				</button>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
// import { ZegoUIKitPrebuiltCall } from '@zegocloud/zego-uikit-prebuilt-uniapp-test';
// import { ZegoUIKitPrebuiltCall } from '@zegocloud/zego-uikit-prebuilt-call-mini-program';
import { ZegoUIKitPrebuiltCall, ZegoUIKitPrebuiltCallConfig, ZegoCallScenario, makePrebuiltListenerID } from '../../../zego_uikit_prebuilt_call/src';
import { generatePrebuiltTokenTest } from "../../../src/token"
import { randomID } from '../../../src/utils';
import SingleCall from '../../../zego_uikit_prebuilt_call/src/pages/call/SingleCall.vue';
import appConfig from '../../../src/keyCenter.ts';

const APPID = appConfig.APPID;
const SERVER = appConfig.SERVER;
const SERVER_SECRET = appConfig.SERVER_SECRET;

const callID = ref(randomID(5))
const isUIKitShow = ref<boolean>(false);
function getRandomIndex(): string {
	const randomNumber = Math.floor(Math.random() * 1000); // 生成0到999的随机整数
	return randomNumber.toString().padStart(3, '0'); // 将数字转换为字符串，并用'0'填充到长度为3
}

const userID = ref<string>('mini' + getRandomIndex());
let userName: string = '';
let token: string = '';
let config = {
	mode: ZegoCallScenario.SINGLE_CALL,
	globalPagePath: "/zego_uikit_prebuilt_call/src/pages/call/SingleCall",
	turnOnCameraWhenJoining: false,
    // turnOnMicrophoneWhenJoining: true,
};
const LISTENER_ID = makePrebuiltListenerID();
onMounted(() => {
	userName = 'user_' + userID.value;
	token = generatePrebuiltTokenTest(APPID, SERVER_SECRET, userID.value);
	ZegoUIKitPrebuiltCall.init(APPID, SERVER, userID.value, userName, token, config);
	ZegoUIKitPrebuiltCall.addPrebuiltListener(LISTENER_ID, {
        onInitialized: () => {
            console.log('[demo]onInitialized');
        },
        onLeaveRoom: () => {
            console.log('[demo]onLeaveRoom');
            // isUIKitShow.value = false;
        }
    })
})
onUnmounted(() => {
	ZegoUIKitPrebuiltCall.removePrebuiltListener(LISTENER_ID);
	ZegoUIKitPrebuiltCall.unInit();
})

function startCall() {
	if (userID.value) {
		ZegoUIKitPrebuiltCall.joinRoom(callID.value);
		// isUIKitShow.value = true;
		// // @ts-ignore
		// uni.navigateTo({
        //     url: `/pages/example/call/call`,
        //     success: (res: any) => { 
		// 		res.eventChannel.emit('acceptDataFromOpenerPage', { token, userID: userID.value, userName, roomID: callID.value })
		// 	},
        //     fail: () => {
        //         console.error(`navigateTo fail!`);
        //     },
        //     complete: () => { },
        // });
	}
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
	/* max-width: 600px; */
	/* margin: 0 auto; */
}

.containerBase {
	margin: 20px;
	background-color: #fff;
	border-radius: 10px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	padding: 20px 0 0;
}

.input-container {
	margin-bottom: 20px;
}

.input {
	padding: 10px;
	font-size: 16px;
	border: 1px solid #ddd;
	border-radius: 4px;
}

.user-container {
	padding: 20px;
}

.prompt {
	margin-bottom: 10px;
	font-size: 18px;
	color: #333;
}

.option-label {
	display: flex;
	align-items: center;
	margin-bottom: 10px;
}

.option-radio {
	margin-right: 8px;
	/* 增加单选按钮和文本之间的间距 */
}

.option-text {
	font-size: 16px;
	color: #666;
}

.selection {
	margin-top: 20px;
	font-size: 16px;
	color: #333;
}

.button-container {
	display: flex;
	justify-content: center;
	margin-top: 30px;
}

.startCall {
	padding: 10px 20px;
	font-size: 16px;
	color: #fff;
	background-color: #007bff;
	border: none;
	border-radius: 4px;
	cursor: pointer;
}

.startCall:hover {
	background-color: #0056b3;
}
</style>
